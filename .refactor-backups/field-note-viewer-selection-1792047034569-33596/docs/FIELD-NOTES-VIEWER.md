# Field-note viewer rendering

`src/features/field-notes/viewerRenderer.ts` owns the Mapillary custom renderer's shader setup, GPU buffer uploads, drawing and program/buffer cleanup. `viewerBuffers.ts` builds ENU positions and source colors.

The runtime registers and removes the renderer, tracks activation, and resizes the viewer. The factory receives explicit callbacks for current-image note selection, cloud visibility/base altitude and pixel ratio, plus the existing geodetic-to-ENU projector. It does not receive the widget instance or own authentication, storage, Enterprise layers or map visibility.

## Lifecycle and preserved behavior

- The factory allocates no GPU resources. Mapillary calls `onAdd` with the GL context and geographic reference; initial notes are uploaded then.
- `onReference` reads the latest note selection through its callback. The runtime preserves the existing 60-metre filter. An undefined selection retains the current buffers when no image is selected; an empty selection clears the vertex count.
- `updatePositions` uploads XYZ and RGB buffers in the existing order. Explicit altitude wins; otherwise the existing cloud/camera fallback applies.
- `render` keeps the transparent pass, shader strings, point sizing, blending/depth operations and pixel-ratio behavior.
- `onRemove` releases the program and both buffers through the supplied GL context. Registration/removal timing remains Mapillary-owned.

## Contributing and checks

Change calculations in `viewerBuffers.ts`, renderer operations in `viewerRenderer.ts`, and registration/live-state selection in `widget.tsx`. Keep acquisition and cleanup together. Do not add network requests or local-storage access to render callbacks.

Focused tests are `tests/fieldNoteViewerBuffers.test.cjs` and `tests/fieldNoteViewerRenderer.test.cjs`. Renderer tests use a recording GL context to check lifecycle operations; they do not replace a live browser/GPU check. After renderer changes, verify alignment, marker size, source colors, image navigation and repeated activation/removal in Experience Builder.
