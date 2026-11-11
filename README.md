# Prism3D Studio

Prism3D Studio is a client-side 3D model preparation, segmentation, and cutting suite engineered specifically for multi-color 3D printing workflows (Bambu Studio, OrcaSlicer, PrusaSlicer). 

It operates entirely within the user's browser via WebAssembly (WASM) and multi-threaded Web Workers, guaranteeing complete data privacy with zero cloud file uploads.

---

## Technical Architecture

Prism3D Studio bridges modern web technologies with robust computational geometry engines:

- **3D Viewport & Rendering Pipeline:** Three.js with hardware-accelerated WebGL, custom shader passes for face selection, and orthographic/perspective camera tracking.
- **Geometric Kernel:** Manifold 3D CAD library compiled to WebAssembly (`manifold.wasm`), ensuring guaranteed watertight (2-manifold) boolean operations, mesh splits, and hole capping.
- **Worker Concurrency:** Heavy geometric computations (triangle subdivision, boundary smoothing, seam generation, and CSG evaluations) execute inside dedicated Web Workers (`engine-worker.js`), preventing main-thread UI stalls.
- **3MF Parser & Serializer:** Low-level ZIP unpacker and streaming XML parser supporting standard 3MF specifications as well as proprietary vendor attributes (`paint_color`, `colorgroup`, and `basematerials` metadata from Bambu Studio and OrcaSlicer).

---

## Core Capabilities

### 1. Segmentation by Color (Split by Color)
- Extracts painted and multi-material surface regions into separate closed solid bodies.
- Preserves relative spatial coordinates across all parts for seamless multi-plate placement in slicers.
- Features configurable capping algorithms:
  - Centroid fan triangulation.
  - Constrained Delaunay Triangulation (CDT).
  - Soap-film minimal-surface relaxation.
  - Inward-projected planar capping.

### 2. Planar and Freehand Cutting (Plane & Sketch Cut)
- Bisects meshes along arbitrary geometric planes (X, Y, Z, or free-angle vectors).
- Supports 2D sketch-based arbitrary cut trajectories projected across model surfaces.

### 3. Automated Seam Connectors
- Parametric generation of male alignment pins (cylindrical, triangular, or rectangular) and matching female sockets.
- Configurable mechanical clearances and tolerances (standard 0.20 mm offset) to accommodate FDM thermal shrinkage and nozzle expansion.

### 4. Color Simplification and Despeckle Engine
- **Graph Adjacency Analysis:** Analyzes mesh topology to identify disconnected triangular islands sharing color slots.
- **Noise Reduction:** Automatically detects isolated color patches below a user-defined face threshold and merges them into the dominant neighboring color, eliminating redundant filament purge cycles.
- **Palette Quantization:** Consolidates color definitions to match target multi-material hardware constraints (e.g., 4-slot Bambu Lab AMS or Prusa MMU units).

### 5. Mesh Inspection & Repair
- Identifies and resolves non-manifold edges, flipped surface normals, zero-area degenerate triangles, and boundary holes prior to slicing.

---

## Project Structure

```
prism3d-studio/
├── assets/
│   ├── app-d69cbaf864.js           # Core application runtime and UI bindings
│   ├── engine-worker-44aa037620.js # Web Worker for CAD and geometric processing
│   ├── engine-fallback-66557509a7.js # Synchronous execution fallback engine
│   ├── manifold-73e3b419ad.wasm    # Manifold C++ CAD engine compiled to WASM
│   ├── lang-*.js                   # Multilingual localization bundles
│   └── connectors/                 # SVG geometry definitions for alignment pins
├── custom-theme.css                # Dark Obsidian interface styling
├── prism-tools.js                  # Color simplification and object removal extensions
├── server.js                       # Local HTTP static server with COOP/COEP headers
├── index.html                      # Single-page application entrypoint
└── README.md                       # Documentation
```

---

## Getting Started

### Prerequisites

- Node.js (version 18.0.0 or higher recommended).
- A modern browser with WebAssembly and WebGL2 support (Chrome, Edge, Firefox, Brave, Safari).

### Installation and Execution

1. Clone the repository:
   ```bash
   git clone https://github.com/julianmcancelo/prism3d-studio.git
   cd prism3d-studio
   ```

2. Start the local server:
   ```bash
   node server.js
   ```

3. Open your browser and navigate to:
   ```
   http://127.0.0.1:8080/
   ```

> **Security Note:** `server.js` serves the application with `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` headers, which are required by modern browsers to enable high-performance memory buffers and multithreading in WebAssembly.

---

## Multi-Material Slicer Compatibility

Exported `.3mf` files have been validated for native import on:
- Bambu Studio (v1.8 and later)
- OrcaSlicer (v1.9 and later)
- PrusaSlicer (v2.7 and later)
- Creality Print / Anycubic Slicer

---

## License

This project is licensed under the MIT License. Underlying open-source components and libraries retain their respective licenses.
