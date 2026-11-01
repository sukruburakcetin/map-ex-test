# Responsive accurate hover previews v6.120

Requires v6.119. Correct regional previews now bypass the artificial dwell when both the frame mapping and its metadata are cached. This keeps the resolved-frame bearing policy while restoring immediate presentation for warm targets.

## Behavior

The brown pulse and picking still run before metadata work. A completed nearby-frame hint is read through CoverageFrameLookup.peek, which does not start a producer, acquire a consumer, extend expiry or change the accepted click's resolver. If its image metadata is ready, the card and cone are presented in the same hover handler without a timer or repeated tile/Graph request.

A partial cached card can display immediately while its missing bearing metadata waits for the remaining hover pause. A cold target retains one pause before resolving; resolution time counts toward that pause, so it does not add another full delay before requesting metadata. The regional minimum remains 150 ms for cold work (or the configured details dwell if longer). Leaving or changing target cancels pending enrichment through the existing owner and signal guards. An incorrect representative cone is not displayed while the correct frame is unknown.

The active loaded sequence has a different click policy from the tile hint path. Its completed local scan results use a separate bounded hint cache tied to the view, exact location/sequence key and immutable route-array reference. Entries expire after 30 seconds, at most 16 are retained, and a view or route change invalidates reuse. Cold long-route scans still wait for dwell and yield cooperatively; a cache read does not scan the route. Tile hints never override active-route selection policy.

Cached identity is checked against the metadata entry before rendering. Resolved images do not borrow a different representative's capture date. Missing/expired hints and failed lookups cannot produce an immediate bearing. Existing panorama direction handling, click selection, coordinate anchors, brown-pulse animation and cone projection remain unchanged.

## Validation

90 targeted regression checks passed. Fake-clock fixtures using the real extracted runtime method verify synchronous warm card/cone presentation with no metadata timer, lookup or Graph request; immediate partial cards followed by delayed enrichment; one cold dwell; leave cancellation; and loaded-route cache isolation. Cache tests cover pending versus settled hints, TTL expiry without refresh/refetch, view ownership, misses/errors, reuse by clicks, route-reference invalidation and bounded local retention. Existing nearby-frame correctness, stale-response, native selection, identity, direction-anchor/pulse and image-first checks also pass. Runtime source comparison confirms selection, nearest-frame and pulse methods are unchanged. Experience Builder development build passed using local SDK 5.0.4.

These checks establish scheduling and cache behavior, not a deployed-app latency or FPS benchmark. Cold tile/metadata downloads, first thumbnail loads, browser decoding and the existing cone animation frame cadence can still affect perceived response. A different uncached position is a cold target even if another nearby position has been previewed. The user's localhost pages were not opened from this environment; verify the same zoom-7/zoom-8 cases in the previewer after installation.

Install from the widget root: node apply-responsive-hover-previews-v6-120.cjs. Undo: node apply-responsive-hover-previews-v6-120.cjs --uninstall. Guarded dry-run, install, repeat install, byte-exact rollback and edited-target refusal are checked. Preserve later source edits before rollback.
