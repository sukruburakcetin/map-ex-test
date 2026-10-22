# Direction-arrow hover marker

`DirectionHoverMarker.ts` owns the yellow target marker, its matching minimap marker, the pulse interval and cleanup. Runtime still handles Mapillary direction subscriptions/touch events, hover identity, sequence/cache lookup and coordinate fetching. This extraction moves marker rendering and timer lifetime together without changing hover discovery.

`draw` receives a WGS84 target after runtime validates the view and SDK. It clears the previous visuals, creates the same 2D/3D symbol and tagged minimap marker, and starts the existing 60 ms interval. Size steps remain 0.5 px and oscillate between 16 and 20 px. Scene visibility, lift and callout settings remain unchanged.

`clear` stops the graphic's interval and removes only direction-hover graphics. Host readers resolve the currently active map view and minimap layer, preserving the original cleanup policy; this module does not change ownership across view replacement. The owner adds no coordinate fetches, subscriptions or playback work.

`tests/directionHoverMarker.test.cjs` covers symbols, pulse bounds, graphic identity, replacement, cleanup and runtime forwarding. Check arrow hover/touch targets on the map and minimap in Experience Builder after visual changes. Subscription/touch-listener ownership remains a separate future extraction.
