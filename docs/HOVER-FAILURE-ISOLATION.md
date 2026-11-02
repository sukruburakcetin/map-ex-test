# Isolate optional detection-hover failures

Imagery coverage picking and object/sign picking run independently inside the shared pointer callback. Previously a rejected native detection lookup reached the outer catch, which cleared the imagery pulse/card/highlight and could display an imagery lookup warning even after coverage picking succeeded.

The detection lookup now handles its own rejected promise, returning no feature. The existing imagery result and Places branch can proceed. A successful SDK or native detection hit retains its original priority and clears/replaces the transient imagery tooltip as before. Current-view/current-pointer guards remain in place. An optional failure is logged only through the existing debug logger, with no error object, credentials or source URL included. Coverage misses remain misses; no placeholder image identity is invented.

The change adds no downloads, retries, timers, polling, or renderer work. It does not change click handling, hover bearing selection, thumbnail retention, selected sequence overview or native circle geometry.

## Validation

Eight real pointer-callback tests cover successful coverage before and after an optional failure, both 2D and 3D, native/SDK detection priority, coverage misses, cancellation and view replacement. Five of those tests fail on the previous implementation; all eight pass with isolation. Together with existing click, preview, bearing, cache and selected-sequence checks, 133 targeted tests pass. These are controlled asynchronous fixtures; a full Experience Builder build/live-host visual check was not available in this workspace.

## Install

From the widget root outside `src`:

    node apply-hover-failure-isolation.cjs

Rebuild and reload Experience Builder. `--dry-run` checks targets without writing source. A standalone uninstaller reverts only this change and its added test/documentation. Earlier hover/click improvements remain. Edited source blocks are refused. Tests and builds are not run inside the installer.
