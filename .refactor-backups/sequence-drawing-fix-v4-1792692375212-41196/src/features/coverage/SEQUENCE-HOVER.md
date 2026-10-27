# Sequence hover highlighting

Native Turbo coverage uses `NativeSequenceSelection.ts` for blue selection only. Complementary filters copy Mapillary's native line/circle styles, preserving other coverage paints, dimensions, opacity, stroke, zoom limits and user filters. MapView updates the style layers directly. SceneView receives one complete style through `loadStyle`; updating its layers individually can lose circle/line render buckets. SceneView updates are serialized and superseded or retired bindings cannot enqueue stale styles.

Hover remains a separate neon green (`#00ff88`) native tile sequence line, now 6 pixels wide instead of 5. It does not turn circles blue or replace the selected sequence. Moving between points in the same sequence reuses the existing hover style. The main Turbo map does not reconstruct sequence overview lines from image coordinates: cached/completed API route geometry is retained for the minimap. `tests/nativeSequenceSelection.test.cjs` covers these contracts, including asynchronous SceneView updates.

`SequenceHoverHighlight.ts` owns one reusable vector-tile layer and the last hovered sequence ID. `widget.tsx` forwards hover intent and supplies current host dependencies. The line-only style is colocated with its lifecycle owner; this layer does not draw image circles or change active-sequence point membership.

`update` ignores identical IDs, hides the layer on mouseout, and creates it lazily on the first nonempty hover. Later changes reuse the layer through `loadStyle`, retaining the style-property fallback for older SDKs. Detached layers are reattached at the existing coverage-relative index. The host supplies the current access token; no token is embedded in source files.

Two existing cleanup paths remain explicit: `detach` removes the layer without destroying it during widget cleanup, while `reset` uses best-effort removal/destruction and resets hover identity during view transfer. These differences are preserved deliberately in this structural extraction; changing disposal policy should be reviewed separately.

The owner adds no Graph calls, watchers, timers, playback callbacks or point graphics. Highlight tiles retain the existing source URL and zoom limits. `tests/sequenceHoverHighlight.test.cjs` covers reuse, style contents, hide/show, reattachment, the SDK fallback, cleanup and runtime forwarding. Experience Builder still needs visual checks for hover transitions and layer order in 2D and 3D.
