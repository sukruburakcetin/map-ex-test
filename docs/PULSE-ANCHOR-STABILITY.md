# Current-image anchor recovery and 3D pulse stability · v6.66

Apply after v6.65, with v6.64 uninstalled. This update contains no playback scheduling or hover/selection algorithm changes.

Refresh/shared-link fly-in can start below zoom 14, where native individual-image anchor resolution intentionally does no work. Previously, the eventual zoom/stationary callbacks did not retry that resolution, leaving the pulse at provisional image/API coordinates until a later image event or exact marker click. The existing resolver now gets a current-image-only retry when the view settles, when zoom callbacks occur in an already stationary eligible view, and after stationary coverage style work finishes. Its existing cache, one-image tile lookup, in-flight deduplication and stale view/image/revision checks remain unchanged. Warm tile bytes are reused; the existing optional missing-tile download may be needed. No sequence enumeration or different-image selection is introduced.

The green 3D centre is now an immutable opaque icon on its own ground-draped layer. A separate, independently owned ground-draped layer carries the animated halo, keeping its symbol replacement away from the centre's render resources. The former small vertical offset is removed, so the centre uses the same ground position as the cone/accepted image anchor. The halo retains the existing 1200ms rhythm and one bounded animation callback; there is no second animation loop. Same-image anchor correction updates both geometries without replacing the core, recreating layers or resetting the pulse phase. View/image changes and disposal release both layers.

2D keeps its existing DOM pulse. Picking, accepted hover/click positions, blue styling and native alignment formulas are unchanged. The core can initially use provisional API coordinates while the current image's tile anchor is being resolved; after successful resolution it moves to the exact tile presentation point without requiring a hover/click.

## Local verification

1. Refresh a shared image link that begins zoomed out, let fly-in finish, then zoom closely in 3D. After the tile anchor resolves, the cone apex, green centre and selected tile point should coincide without hovering first.
2. Hover/click the same image afterward: it should not produce another apparent centre correction. Selecting a different image should still work exactly as before.
3. Observe the green core through several pulse cycles, terrain loading, rotation/tilt and playback. The centre should stay solid while its halo pulses. Check 2D as well.
4. Toggle fullscreen and 2D/3D, then close/reopen the widget. No old pulse/halo layers should remain.

Actual ArcGIS objects were exercised in a Node check across 1000 animation ticks, confirming a stable core symbol, shared corrected geometry and cleanup. This verifies SDK object semantics, not live GPU rendering or a complete deployed fly-in. Verify the reported flicker/alignment behavior in your running app.
