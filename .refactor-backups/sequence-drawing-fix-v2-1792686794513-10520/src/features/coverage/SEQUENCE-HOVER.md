# Sequence hover highlighting

Native Turbo coverage uses `NativeSequenceSelection.ts` for both hover and the selected image's sequence. Blue styles copy the native line/circle styles and use complementary membership filters, so each feature is drawn once with its existing size, opacity, stroke, zoom limits and user filters. Nonselected paints remain unchanged. Style-layer updates rebuild SceneView's rendering resources rather than changing constant paints to data-driven paints through `setPaintProperties`.

Mouseout removes only the hover membership; the selected sequence stays blue. Moving between images in the same sequence does not rebuild styles. Cached and completed route geometry remains available to the minimap, but Turbo does not add route-preview or completed-route graphics to the main map. `tests/nativeSequenceSelection.test.cjs` covers these paths, filter preservation and delayed route completion.

The separate layer described below is retained for legacy coverage only.

`SequenceHoverHighlight.ts` owns one reusable vector-tile layer and the last hovered sequence ID. `widget.tsx` forwards hover intent and supplies current host dependencies. The line-only style is colocated with its lifecycle owner; this layer does not draw image circles or change active-sequence point membership.

`update` ignores identical IDs, hides the layer on mouseout, and creates it lazily on the first nonempty hover. Later changes reuse the layer through `loadStyle`, retaining the style-property fallback for older SDKs. Detached layers are reattached at the existing coverage-relative index. The host supplies the current access token; no token is embedded in source files.

Two existing cleanup paths remain explicit: `detach` removes the layer without destroying it during widget cleanup, while `reset` uses best-effort removal/destruction and resets hover identity during view transfer. These differences are preserved deliberately in this structural extraction; changing disposal policy should be reviewed separately.

The owner adds no Graph calls, watchers, timers, playback callbacks or point graphics. Highlight tiles retain the existing source URL and zoom limits. `tests/sequenceHoverHighlight.test.cjs` covers reuse, style contents, hide/show, reattachment, the SDK fallback, cleanup and runtime forwarding. Experience Builder still needs visual checks for hover transitions and layer order in 2D and 3D.
