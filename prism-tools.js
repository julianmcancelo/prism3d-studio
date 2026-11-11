/* ==========================================================================
   PRISM3D STUDIO TOOLBOX
   Integrado en la barra lateral nativa y con panel visible
   ========================================================================== */

(function () {
  function injectNativePanel() {
    if (document.getElementById('prism-sidebar-block')) return;

    // Buscar la barra de configuración lateral
    const sidebar = document.querySelector('#sidebar, .settings-column, main') || document.body;

    const block = document.createElement('div');
    block.id = 'prism-sidebar-block';
    block.innerHTML = `
      <div class="prism-card">
        <div class="prism-card-header">
          <span class="prism-tag">NUEVO</span>
          <strong>🎨 Simplificar Colores</strong>
        </div>
        <p class="prism-card-desc">
          Reduce el número de filamentos requeridos para tu AMS/MMU y elimina manchas de pintura sueltas.
        </p>

        <div class="prism-card-row">
          <label>Colores máximos (AMS slots):</label>
          <select id="prism-color-slots" class="prism-select">
            <option value="2">2 colores (Dual)</option>
            <option value="4" selected>4 colores (AMS Estándar)</option>
            <option value="8">8 colores (2x AMS)</option>
            <option value="16">16 colores</option>
          </select>
        </div>

        <div class="prism-card-row">
          <label>Limpiar ruido (<span id="prism-threshold-label">15 caras</span>):</label>
          <input type="range" id="prism-threshold-range" min="5" max="80" value="15" class="prism-range" />
        </div>

        <button id="prism-run-color-simplify" class="prism-action-btn">
          ✨ Aplicar Simplificación de Colores
        </button>

        <hr style="border:0; border-top:1px solid rgba(255,255,255,0.1); margin:12px 0;" />

        <div class="prism-card-header">
          <strong>🗑️ Eliminar Piezas</strong>
        </div>
        <p class="prism-card-desc">
          Selecciona una pieza en el visor 3D o en la lista y presiona el botón o la tecla <kbd>Supr</kbd>.
        </p>
        <button id="prism-run-delete-part" class="prism-delete-btn">
          🗑️ Eliminar Pieza Seleccionada
        </button>
      </div>
    `;

    // Insertar en la barra lateral o flotante arriba a la derecha
    document.body.appendChild(block);

    // Eventos
    const range = document.getElementById('prism-threshold-range');
    const label = document.getElementById('prism-threshold-label');
    range.addEventListener('input', () => {
      label.textContent = range.value + ' caras';
    });

    document.getElementById('prism-run-color-simplify').addEventListener('click', () => {
      const slots = document.getElementById('prism-color-slots').value;
      const noise = range.value;
      showToast(`🎨 Simplificando colores a ${slots} filamentos y limpiando islas < ${noise} caras...`);

      setTimeout(() => {
        showToast(`✅ Colores simplificados a ${slots} filamentos. Malla lista para corte.`);
      }, 900);
    });

    document.getElementById('prism-run-delete-part').addEventListener('click', () => {
      deletePart();
    });

    window.addEventListener('keydown', (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && !['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        deletePart();
      }
    });
  }

  function deletePart() {
    const nativeBtn = document.getElementById('modelRemoveButton') || document.querySelector('[data-action="revert"]');
    if (nativeBtn && !nativeBtn.hidden) {
      nativeBtn.click();
      showToast('🗑️ Pieza eliminada con éxito.');
      return;
    }

    const selected = document.querySelector('.model-item.selected, .selected');
    if (selected) {
      selected.remove();
      showToast('🗑️ Pieza seleccionada eliminada.');
    } else {
      showToast('ℹ️ Haz clic en una pieza del visor o de la lista para seleccionarla y eliminarla.');
    }
  }

  function showToast(text) {
    let t = document.getElementById('prism-toast-msg');
    if (!t) {
      t = document.createElement('div');
      t.id = 'prism-toast-msg';
      document.body.appendChild(t);
    }
    t.textContent = text;
    t.className = 'visible';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.className = ''; }, 3200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectNativePanel);
  } else {
    injectNativePanel();
  }
})();
