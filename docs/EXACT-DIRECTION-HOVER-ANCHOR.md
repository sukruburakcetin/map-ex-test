# v6.94: Exact coverage position for 3D arrow hover

Requires v6.93. Install with `node apply-exact-direction-anchor-v6-94.cjs`, rebuild and reload.

3D arrow hover resolves the target image's exact ID in coverage tile data before displaying its marker. Existing retained display anchors, cached bytes, shared tile transport and shared indexes are reused. A cache miss can request one tile through the existing background queue; neighbouring tiles are searched only when already cached. No nearest-point snapping or alternate-image selection occurs.

Leaving hover, changing target/view/token or changing coverage revision prevents late results from drawing. Resolved positions are retained in the existing bounded display-anchor cache. A missing exact match or lookup failure retains the original source position. 2D arrow rendering, discovery priority, sequence selection, picking and coverage loading are unchanged. Existing v6.93 steady 3D marker styling remains.

Five runtime-method tests cover exact IDs, cache reuse, cold requests, unmatched targets and stale/cancelled work. SDK build passes. A visual check is still needed in the user's 3D scene; this addresses coordinate mismatch, not every possible native-renderer projection offset.

Rollback: `node apply-exact-direction-anchor-v6-94.cjs --uninstall`, rebuild and reload.
