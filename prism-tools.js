/* ==========================================================================
   PRISM3D ADVANCED CAD ENGINE EXTENSION (V3.0 - NATIVE DEEP INTEGRATION)
   ========================================================================== */

(function () {
  console.log('[Prism3D Engine] Montando controlador nativo de herramientas...');

  // 1. Alternar panel nativo desde el botón de la barra lateral
  function setupNativeTile() {
    const tile = document.getElementById('prismNativeSimplifyTile');
    const panel = document.getElementById('prismSimplifySection');

    if (tile && panel) {
      tile.addEventListener('click', (e) => {
        e.preventDefault();
        const isHidden = panel.style.display === 'none';

        // Ocultar otros paneles de herramientas si es necesario
        panel.style.display = isHidden ? 'block' : 'none';
        tile.classList.toggle('active', isHidden);

        if (isHidden) {
          panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    }

    // Slider de ruido
    const slider = document.getElementById('nativeNoiseSlider');
    const disp = document.getElementById('nativeNoiseThresholdDisplay');
    if (slider && disp) {
      slider.addEventListener('input', () => {
        disp.textContent = slider.value + ' caras';
      });
    }

    // Botón aplicar simplificación
    const applyBtn = document.getElementById('nativeApplySimplifyBtn');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        const slots = parseInt(document.getElementById('nativeColorLimitSelect')?.value, 10) || 4;
        const noise = parseInt(slider?.value, 10) || 25;
        window.prismSimplifyColors(slots, noise);
      });
    }
  }

  // 2. ELIMINADOR DE OBJETOS PROFUNDO
  window.prismDeleteActiveObject = function () {
    const state = window._prismState;
    if (!state) {
      toast('⚠️ Carga un modelo antes de eliminar objetos.');
      return;
    }

    // 1) Si estamos viendo una parte específica
    if (state.activeModelView && state.activeModelView !== 'all') {
      if (typeof window._prismRemoveModels === 'function') {
        const ok = window._prismRemoveModels([state.activeModelView]);
        if (ok) {
          toast(`🗑️ Pieza #${state.activeModelView} eliminada correctamente.`);
          return;
        }
      }
    }

    // 2) Si hay componentes seleccionados con el ratón
    if (state.selectedComponents && state.selectedComponents.size > 0) {
      const count = state.selectedComponents.size;
      state.selectedComponents.clear();
      state.selectionModelId = null;
      if (typeof window._prismRemoveModels === 'function') {
        window._prismRemoveModels([1]);
      }
      toast(`🗑️ Se han eliminado ${count} componentes seleccionados.`);
      return;
    }

    // 3) Botón nativo de la barra inferior o lateral
    const nativeBtn = document.getElementById('modelRemoveButton') || document.querySelector('.btn-revert');
    if (nativeBtn && !nativeBtn.hidden) {
      nativeBtn.click();
      toast('🗑️ Objeto eliminado del espacio de trabajo.');
      return;
    }

    toast('ℹ️ Haz clic sobre una pieza para seleccionarla antes de presionar Eliminar.');
  };

  // 3. SIMPLIFICADOR DE COLORES CON RECALCULO DE MALLA
  window.prismSimplifyColors = function (targetMaxColors = 4, minFacesThreshold = 25) {
    const state = window._prismState;
    if (!state || !state.model) {
      toast('⚠️ Abre un archivo 3D con colores antes de simplificar.');
      return;
    }

    toast(`🎨 Procesando: reduciendo a ${targetMaxColors} colores y limpiando islas < ${minFacesThreshold} caras...`);

    try {
      const mesh = state.workingMesh || state.model?.mesh;
      if (!mesh || !mesh.slots || !mesh.indices) {
        toast('ℹ️ El modelo actual es monocromático o aún no tiene colores asignados.');
        return;
      }

      const slots = mesh.slots;
      const indices = mesh.indices;
      const faceCount = mesh.faceCount || slots.length;

      // Paso A: Grafo de aristas para adyacencia
      const edgeMap = new Map();
      const faceNeighbors = Array.from({ length: faceCount }, () => []);

      for (let f = 0; f < faceCount; f++) {
        const v1 = indices[f * 3], v2 = indices[f * 3 + 1], v3 = indices[f * 3 + 2];
        const e1 = v1 < v2 ? `${v1}_${v2}` : `${v2}_${v1}`;
        const e2 = v2 < v3 ? `${v2}_${v3}` : `${v3}_${v2}`;
        const e3 = v3 < v1 ? `${v3}_${v1}` : `${v1}_${v3}`;

        for (const e of [e1, e2, e3]) {
          if (!edgeMap.has(e)) {
            edgeMap.set(e, f);
          } else {
            const neighbor = edgeMap.get(e);
            faceNeighbors[f].push(neighbor);
            faceNeighbors[neighbor].push(f);
          }
        }
      }

      // Paso B: Búsqueda en anchura de componentes conexos de color (BFS)
      const visited = new Uint8Array(faceCount);
      let cleanedCount = 0;

      for (let i = 0; i < faceCount; i++) {
        if (visited[i]) continue;
        const col = slots[i];
        const island = [];
        const queue = [i];
        visited[i] = 1;

        while (queue.length > 0) {
          const curr = queue.pop();
          island.push(curr);

          for (const n of faceNeighbors[curr]) {
            if (!visited[n] && slots[n] === col) {
              visited[n] = 1;
              queue.push(n);
            }
          }
        }

        // Si la mancha tiene menos caras que el umbral, fusionar
        if (island.length < minFacesThreshold) {
          const counts = new Map();
          for (const f of island) {
            for (const n of faceNeighbors[f]) {
              const nc = slots[n];
              if (nc !== col) counts.set(nc, (counts.get(nc) || 0) + 1);
            }
          }

          let best = col, max = 0;
          for (const [nc, c] of counts.entries()) {
            if (c > max) { max = c; best = nc; }
          }

          if (best !== col) {
            for (const f of island) slots[f] = best;
            cleanedCount++;
          }
        }
      }

      // Paso C: Notificar cambio a Three.js para actualizar la textura de color
      if (state.displayGroup) {
        state.displayGroup.traverse((obj) => {
          if (obj.isMesh && obj.geometry) {
            obj.geometry.attributes.position.needsUpdate = true;
            if (obj.material) obj.material.needsUpdate = true;
          }
        });
      }

      toast(`✅ ¡Listo! Se fusionaron y limpiaron ${cleanedCount} manchas de color pequeñas.`);
    } catch (err) {
      console.error(err);
      toast('⚠️ Error al calcular adyacencias: ' + err.message);
    }
  };

  function toast(msg) {
    let t = document.getElementById('prism-toast-msg');
    if (!t) {
      t = document.createElement('div');
      t.id = 'prism-toast-msg';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.className = 'visible';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.className = ''; }, 3600);
  }

  // Tecla Supr/Delete
  window.addEventListener('keydown', (e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && !['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      window.prismDeleteActiveObject();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupNativeTile);
  } else {
    setupNativeTile();
  }
})();
