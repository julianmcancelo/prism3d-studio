# Prism3D Studio 🎨📐

**Prism3D Studio** es una suite de preparación, corte y división de modelos 3D multicolor para impresión 3D (Bambu Studio, OrcaSlicer, PrusaSlicer). Funciona 100% en el navegador del cliente utilizando WebAssembly y Web Workers.

## 🚀 Características

- **División por Color (Split by Color):** Separa mallas multicolores o pintadas en piezas individuales sin perder información de capas de filamento.
- **Corte Plano y con Boceto (Plane & Sketch Cut):** Corta piezas con planos o trazos libres para ajustar modelos al volumen de impresión de tu máquina.
- **Conectores y Pines Automáticos:** Genera uniones mecánicas (clavijas macho y ranuras hembra) con tolerancia y holgura configurable (clearance de 0.2 mm).
- **Suavizado de Bordes (Boundary Smooth):** Elimina el ruido en los límites de color.
- **100% Local y Privado:** Todo el procesamiento geométrico ocurre en tu máquina con WebAssembly (Manifold CAD Library).

## 🛠️ Tecnologías

- **Motor 3D:** Three.js
- **Motor CAD Booleano:** Manifold 3D (WASM)
- **Web Workers:** Cómputo geométrico asíncrono
- **Server:** Node.js HTTP server con headers COOP/COEP

## 💻 Ejecución Local

1. Clona el repositorio:
   ```bash
   git clone https://github.com/julianmcancelo/prism3d-studio.git
   cd prism3d-studio
   ```

2. Inicia el servidor:
   ```bash
   node server.js
   ```

3. Abre en tu navegador:
   [http://127.0.0.1:8080/](http://127.0.0.1:8080/)
