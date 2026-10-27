# Sequence highlights

The Turbo base coverage layer stays unchanged when selection or hover changes. Highlighting never calls its `loadStyle`, edits its style layers, replaces its reference or removes it from the map. Coverage filter changes and view initialization still legitimately load a base style.

`TileSequenceHighlights.ts` owns selected and hovered identities. Blue selection and neon green hover remain independent. Hover is a line only (`#00ff88`, width 6); selected lines and circles use blue with their original dimensions, opacity and white circle outline. Neither path connects API image coordinates to invent a main-map route.

In MapView, selected/hovered geometry is decoded from the original Mapillary sequence/image tile features. The existing raw-tile cache is reused. Decoding yields to the event loop, respects cancellation, and retains at most 64 sequence/tile entries and 100,000 vertices. Buffered line geometry is clipped at tile boundaries; buffered points use their canonical tile only. The measured native coordinate adjustment is applied to presentation geometry. Dimensions convert CSS pixels to ArcGIS symbol points. Capture date, quality, ownership, pano, travel and zoom filters follow the original native styles. Two persistent GraphicsLayers reuse Graphic instances; viewport refreshes update only changed members. A different target or mouseout clears the affected role immediately. Late work cannot commit over a newer target or view.

SceneView rasterizes native tile styles onto terrain; ordinary screen-sized graphics did not match the native symbols' scale and softness in controlled rendering. `NativeTileHighlightCache.ts` therefore creates fixed native styles filtered to one sequence and one role. These layers are never restyled after creation. The two most recent selections and two most recent hover targets are retained and shown/hidden for reuse; older layers are removed and destroyed. At most four highlight renderers remain attached, with at most two visible. Native paints, layout, zoom limits and filters are copied, with only blue selection color or the intentional green hover width/color changed. A first visit to an uncached sequence can still take time to render its highlight, while the base coverage stays visible. Recent targets reuse their renderer.

All overlays sit above base coverage and below interactive sign/object layers. View transfer, filter rebinding and widget cleanup cancel work, destroy highlights and release geometry caches. Base coverage keeps its logical selection-anchor identity.

Overlaying translucent blue on the unchanged green base slightly changes the final blended opacity. Native dimensions and configured alpha are retained; this is the tradeoff for leaving the base renderer untouched. MapView uses crisp graphics; SceneView retains the SDK's native terrain rasterization.

The older `NativeSequenceSelection`, `SequenceHoverHighlight` and `PreparedVectorTileLayer` modules remain for compatibility/regression coverage of earlier installers; the widget no longer uses their style-renewal path.

## Image-first clicks

An exact hovered image starts `moveTo` before a separate coordinate query or route preparation. Tracking is seeded with the requested identity first, and coordinates come from the viewer image when available. Blue selection work is deferred while the image opens. Once opened, image-loading state clears independently of optional map/route metadata. Stale viewer events cannot cancel a newer click. Regional line clicks still resolve the nearest image ID first. Image download/decode latency remains dependent on Mapillary.

Tests cover geometry, filters, cancellation, cache reuse and eviction, native style fidelity, cleanup, image/metadata ordering and stale-click guards. Controlled Chromium checks use real ArcGIS MapView/SceneView with synthetic tiles, including repeated targets and stable base-layer identity. Live portal terrain/data require validation in the authenticated application.
