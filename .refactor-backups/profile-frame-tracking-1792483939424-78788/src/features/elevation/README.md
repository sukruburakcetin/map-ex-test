# Elevation profile

`profileIndicator.ts` synchronizes the existing ArcGIS elevation chart with the active image. It computes cumulative sequence distance in metres, sets the SDK hover position, and updates the needle and distance/altitude badge. Static overlay styles live in `src/styles/elevationIndicator.ts`; pixel positions depend on the live chart bounds.

`ElevationProfileController.ts` owns chart creation, independent terrain sources, update revisions and teardown. The runtime binds SDK factories once, supplies the sequence snapshot and a live view/configuration/mode predicate, and calls the indicator from the existing playback/state lifecycle. The indicator adds no listeners, animation frames, timers, caches, network requests, or camera changes. Nodes are reused and are removed by the existing profile teardown.

When changing the renderer, preserve SVG-bounds positioning, the margin fallback before the SVG is ready, and tolerance of SDK hover setters that reject writes. `tests/elevationIndicator.test.cjs` covers those contracts. Validate the chart in both 2D and 3D in Experience Builder after visual changes.

The controller loads the same SDK modules in the same order and reuses the chart and terrain source across updates. A flat map uses a query profile without replacing visible map ground. Existing terrain uses a ground profile. Clearing invalidates late module completions and releases annotations, widget, then source. View-transfer cleanup retains the host’s existing best-effort widget teardown. The host still chooses the UI view used for removal; this extraction does not change view-transfer policy.
