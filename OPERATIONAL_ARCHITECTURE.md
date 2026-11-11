# Map of Operational Logic and Architecture

This guide details where the core geometric algorithms, file parsing routines, and UI dispatchers are located within the repository.

---

## 1. Geometric Engine & CAD Algorithms (`assets/engine-worker-44aa037620.js`)

This file is the Web Worker responsible for heavy geometry processing without blocking the browser UI. A human-readable formatted version is available in `src-readable/engine-worker.raw.js`.

### Core Functions & Methods

| Engine Method | Implementation | Purpose |
| :--- | :--- | :--- |
| `parse3mfFile` | `vi(e, t)` / `Hx(a)` | Unzips the 3MF container, parses `3D/3dmodel.model` and reads Bambu/Orca color attributes (`paint_color`, `colorgroup`). |
| `makePlaneCutResult` | `S1(e, t, o)` | Bisects the mesh across an arbitrary geometric plane vector using Manifold WASM. |
| `makeSketchCutResult` | `E1(e, t, o)` | Projects 2D sketch trajectories through the mesh volume to perform freehand cuts. |
| `makeComponentSplitResult` | `k1(e, t, o)` | Groups connected faces sharing the same color into watertight sub-meshes. |
| `addSeamConnector` | `Ul(e, t, o, n)` | Generates male pins and subtracts matching female sockets with tolerance. |
| `applyBoundarySmooth` | `Cl` / `bl` | Smooths jagged boundary transitions between different color regions. |
| `diagnoseMesh` | `eu(mesh)` | Detects non-manifold edges, flipped normals, degenerate faces, and holes. |
| `repairMesh` | `nu(mesh)` | Repairs geometry using manifold boolean union and edge stiching. |
| `simplifyMesh` | `su(mesh)` | Decimates face count using edge collapse while preserving color borders. |
| `makeDownloadBlob` | `R2(e, t, o)` | Serializes output geometries back into standard compliant 3MF ZIP archives. |

---

## 2. Low-Level WASM Kernel (`assets/manifold-73e3b419ad.wasm`)

Compiled C++ binary from the **Manifold CAD library**. It provides:
- Guaranteed 2-manifold (watertight) boolean operations (Union, Difference, Intersection).
- Fast plane cutting (`splitByPlane`).
- Polygon triangulation and mesh validation.

---

## 3. Viewport & User Interface (`assets/app-d69cbaf864.js`)

Formatted version: `src-readable/app-viewer.raw.js`.

- **Three.js Pipeline:** Initializes the scene, orthographic/perspective camera, orbit controls, ground grid, and lighting.
- **Raycasting & Selection:** Detects mouse clicks on model faces and highlights color components.
- **Model Lifecycle:** Controls loading, plate arrangement, multi-part visibility toggles, and undo/redo stacks.

---

## 4. Custom Extension Engine (`prism-tools.js`)

Adds non-destructive extensions directly connected to the runtime:
- `window.prismSimplifyColors`: Builds face adjacency graphs, runs BFS connected-component analysis, and removes paint speckles smaller than the specified face threshold.
- `window.prismDeleteActiveObject`: Hooks into `window._prismRemoveModels` to delete selected bodies and update the scene hierarchy.
