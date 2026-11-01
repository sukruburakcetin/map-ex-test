# v6.99: Refresh incomplete hover bearing metadata

Requires v6.98. Install with `node apply-hover-bearing-metadata-v6-99.cjs`, rebuild and reload.

Old hover-card cache entries without bearing fields receive one complete metadata refresh through the existing delayed, abortable request path. A successfully completed lookup is marked even when the service has no bearing, avoiding repeated requests. Optional refresh failure preserves the cached hover card. Enrichment must match the hovered image ID; existing cancellation guards prevent late decoration or cache updates.

The computed bearing is preferred, with a finite compass_angle fallback. Panorama cones are now allowed: use capture heading when available, otherwise the current viewer heading as a preview direction. This is not a panorama field-of-view footprint and does not imply the entire panorama faces one way. Non-panoramic captures without usable heading remain pulse-only. The fixed-size cone anchor, brown pulse, hover picking and sequence selection are unchanged.

SDK build and 13 focused tests pass, including real runtime-method tests for enrichment reuse and stale-response cancellation. A user's SceneView visual check remains needed.

Rollback: `node apply-hover-bearing-metadata-v6-99.cjs --uninstall`, rebuild and reload. Restores v6.98 source and removes the new helper/tests/document.
