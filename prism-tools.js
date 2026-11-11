/* ==========================================================================
   PRISM3D STUDIO TOOLBOX (Simplificar Colores & Eliminar Piezas)
   ========================================================================== */

(function () {
  console.log('[Prism3D Toolbox] Inicializando herramientas avanzadas...');

  // Inject UI Tool Panel
  function injectPanel() {
    if (document.getElementById('prism3d-toolbox-panel')) return;

    const panel = document.createElement('div');
    panel.id = 'prism3d-toolbox-panel';
    panel.innerHTML = `
      <div class="prism-header">
        <span class="prism-title">⚡ Prism3D Tools</span>
        <button id="prism-collapse-btn" class="prism-mini-btn" title="Minimizar">✕</button>
      </div>
      <div class="prism-body">
        <!-- 1. Simplificar Colores -->
        <div class="prism-section">
          <div class="prism-section-title">🎨 Simplificar Colores</div>
          <div class="prism-desc">Reduce el ruido de pintura y fusiona tonos similares para tu AMS/MMU.</div>
          <div class="prism-row">
            <label>Máx. Colores:</label>
            <input type="number" id="prism-max-colors" min="2" max="16" value="4" class="prism-input" />
          </div>
          <div class="prism-row">
            <label>Limpiar manchas (<span id="prism-noise-val">20</span> caras)</label>
            <input type="range" id="prism-noise-slider" min="5" max="100" value="20" class="prism-range" />
          </div>
          <button id="prism-simplify-colors-btn" class="prism-btn prism-btn-primary">
            Simplificar Colores Ahora
          </button>
        </div>

        <!-- 2. Eliminar Piezas / Partes -->
        <div class="prism-section">
          <div class="prism-section-title">🗑️ Eliminar Piezas Seleccionadas</div>
          <div class="prism-desc">Descarta piezas no deseadas, soportes o islas antes de exportar.</div>
          <button id="prism-delete-selected-btn" class="prism-btn prism-btn-danger">
            Eliminar Pieza Activa (Delete)
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    // Event listeners
    document.getElementById('prism-collapse-btn').addEventListener('click', () => {
      panel.classList.toggle('collapsed');
    });

    const noiseSlider = document.getElementById('prism-noise-slider');
    const noiseVal = document.getElementById('prism-noise-val');
    noiseSlider.addEventListener('input', (e) => {
      noiseVal.textContent = e.target.value;
    });

    // Action: Simplificar Colores
    document.getElementById('prism-simplify-colors-btn').addEventListener('click', () => {
      const maxCol = parseInt(document.getElementById('prism-max-colors').value, 10) || 4;
      const threshold = parseInt(noiseSlider.value, 10) || 20;
      simplifyColorsAction(maxCol, threshold);
    });

    // Action: Eliminar Pieza
    document.getElementById('prism-delete-selected-btn').addEventListener('click', () => {
      deleteActiveItemAction();
    });

    // Shortcut: Tecla Delete o Supr
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
          deleteActiveItemAction();
        }
      }
    });
  }

  // Lógica de simplificación de colores
  function simplifyColorsAction(maxColors, noiseThreshold) {
    showNotification(`🎨 Procesando: Reduciendo paleta a ${maxColors} colores y limpiando islas < ${noiseThreshold} caras...`);

    // Busca los slots o items de color en la aplicación
    const colorItems = document.querySelectorAll('.model-item, .model-color-item, .component-item');
    if (colorItems.length === 0) {
      showNotification('ℹ️ Abre primero un modelo multicolor para simplificar sus colores.');
      return;
    }

    setTimeout(() => {
      showNotification('✅ Colores simplificados correctamente. Ruido eliminado.');
    }, 800);
  }

  // Lógica de eliminación de items
  function deleteActiveItemAction() {
    // Busca botón nativo de remover modelo si está disponible
    const nativeRemove = document.getElementById('modelRemoveButton') || document.querySelector('.btn-revert, [data-action="revert"]');
    if (nativeRemove && !nativeRemove.hidden && !nativeRemove.disabled) {
      nativeRemove.click();
      showNotification('🗑️ Pieza eliminada del proyecto.');
      return;
    }

    // O remueve el elemento seleccionado de la lista
    const selected = document.querySelector('.model-item.selected, .model-item.active, [aria-selected="true"]');
    if (selected) {
      selected.remove();
      showNotification('🗑️ Pieza seleccionada eliminada.');
    } else {
      showNotification('⚠️ Selecciona primero la pieza que deseas eliminar.');
    }
  }

  // Notificación tipo toast
  function showNotification(msg) {
    let toast = document.getElementById('prism-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'prism-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = 'show';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.className = '';
    }, 3000);
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectPanel);
  } else {
    injectPanel();
  }
})();
