# Direction-arrow hover marker

`DirectionHoverMarker.ts` owns the yellow target marker, its matching minimap marker, the pulse interval and cleanup. `features/imagery/DirectionHoverDiscovery.ts` owns hover identity, sequence/cache lookup and coordinate fetching. `features/imagery/DirectionHoverBindings.ts` owns the Mapillary subscription and passive touch listeners. Runtime supplies callbacks and keeps SDK readiness checks; its callbacks connect events, discovery and marker rendering.

`draw` receives a WGS84 target after runtime validates the view and SDK. It clears the previous visuals, creates the same 2D/3D symbol and tagged minimap marker, and starts the existing 60 ms interval. Size steps remain 0.5 px and oscillate between 16 and 20 px. Scene visibility, lift and callout settings remain unchanged.

`clear` stops the graphic's interval and removes only direction-hover graphics. Host readers resolve the currently active map view and minimap layer, preserving the original cleanup policy; this module does not change ownership across view replacement. The owner adds no coordinate fetches, subscriptions or playback work.

`tests/directionHoverMarker.test.cjs` covers symbols, pulse bounds, graphic identity, replacement, cleanup and runtime forwarding. Check arrow hover/touch targets on the map and minimap in Experience Builder after visual changes. `tests/directionHoverBindings.test.cjs` covers subscription/touch delivery, rebinding, original-container cleanup, mousemove payloads and runtime forwarding.

The discovery owner searches active sequence, other loaded sequences, then its instance coordinate cache before requesting `id,geometry`. Late results update the cache but draw only when their ID still matches the hovered target. Identical IDs with a marker return immediately; repeated IDs while a request is pending retain their existing request behavior. This extraction adds no debounce, cancellation, retry, cache eviction or playback work. `tests/directionHoverDiscovery.test.cjs` covers lookup priority, live token use, cache reuse, late responses and runtime forwarding.

The bindings owner replaces the previous subscription/listeners only after finding a usable direction observable. Rebinding keeps one active set, and teardown removes listeners from their original container even if SDK unsubscription throws. This closes the former touch-listener cleanup gap without changing normal hover events, pulse timing or lookup behavior. It continues to depend on Mapillary’s private `_hoveredId$` observable, so SDK upgrades must verify that interface.
