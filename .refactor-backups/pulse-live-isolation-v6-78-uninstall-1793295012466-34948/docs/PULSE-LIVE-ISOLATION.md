# v6.78 live visibility isolation diagnostic
Requires v6.77. Rebuild/restart and hard refresh. Mode 3d-live-isolation-v78.

Fixes snapshot-only isolation: existing top-level operational layers and view graphics are hidden; after-add captures new ones; public reactiveUtils.watch with sync:true re-hides visibility reactivation. Basemap and ground unchanged, groups hidden via parent. Original pulse and temporary comparison layer exempt. No RAF polling or selection/hover algorithm changes. Background requests, layer loading and layout still run; hidden resources remain loaded. This is visibility isolation, not removal/unloading or proof against every render interaction. Hidden parent cannot suppress a DOM overlay.

Install then select one image, playback stopped. Run isolate(), compare(), clear() in that order, with no pauseSceneWork calls. Allow coverage to finish, rotate camera and observe 30 seconds. Report observed smooth/flicker plus report(). Verify isolationStatus.active true and unexpectedVisible 0. lateEntries and suppressions show what was caught. Counts include initial hides; alone they do not prove a late reactivation. Original pulse current.layerVisible false is expected during comparison.

show(index) explicitly exempts one captured entry from the lock, restoring captured visibility. Fresh isolate() removes all exceptions. restore() removes locks before returning captured visibility; changing image/disposing owner also cleans up. New entries restore their visibility as captured on insertion; external visibility changes during test are overwritten by restore. Removed/destroyed objects do not get re-added, created or resurrected. No mutation unless isolate() explicitly enabled. Use only for a brief diagnostic with fixed image.

The settings export remains separate, normal reports contain no service URLs/coordinates. History remains bounded. This patch corrects diagnostic coverage; it is not a flicker fix.
