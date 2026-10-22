# Elevation profile

`profileIndicator.ts` synchronizes the existing ArcGIS elevation chart with the active image. It computes cumulative sequence distance in metres, sets the SDK hover position, and updates the needle and distance/altitude badge. Static overlay styles live in `src/styles/elevationIndicator.ts`; pixel positions depend on the live chart bounds.

The runtime still owns profile creation, module loading, request revisions, terrain sources, and teardown. It calls the indicator from the existing playback/state lifecycle. The indicator adds no listeners, animation frames, timers, caches, network requests, or camera changes. Nodes are reused and are removed by the existing profile teardown.

When changing the renderer, preserve SVG-bounds positioning, the margin fallback before the SVG is ready, and tolerance of SDK hover setters that reject writes. `tests/elevationIndicator.test.cjs` covers those contracts. Validate the chart in both 2D and 3D in Experience Builder after visual changes.
