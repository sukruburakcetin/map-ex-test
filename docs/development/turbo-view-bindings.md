# Turbo view bindings — stage 67

`TurboViewBindings` owns the stationary and zoom/rotation watcher handles formerly in `onActiveViewChange`. `widget.tsx` retains Turbo activation, style-key invalidation, feature operations and preview selection. The module uses a narrow host contract and the existing debounce implementation and timing constant, with no React, ArcGIS or service dependency.

## Behavior contract

On bind, remove the old stationary handle, create the existing 300 ms debounced callback and watch stationary. Then remove the old zoom handle and register zoom/rotation for 2D or zoom for 3D. This registration/removal order is preserved, rather than clearing both handles before installing either replacement. Full-removal cleanup removes and nulls stationary then zoom, at the original widget lifecycle position.

Stationary execution checks current view, map and destroyed state before checking stationary/Turbo active. It trims the current username, falls back to the configured creator unchanged, and awaits coverage refresh. Pulse refresh then runs, followed by the existing widget preview adapter, which reads the latest sequence/request/signal and completeness. Zoom/rotation execution retains its stale-view guard, refreshes native sequence symbols even with Turbo inactive, and displays help only when active.

The original stationary debounce is not explicitly cancelled on watcher removal. The callback retains its existing guard, and already-started coverage completion retains its original post-await effects. This refactor intentionally changes neither policy. A future lifecycle change would require separate justification and tests.

## Validation and limits

Twenty-six trace comparisons run the actual widget adapter against frozen stage-66 blocks. They cover registration/removal order, 2D/3D properties, filter precedence, delayed state reads, stale views, disabled/moving views, preview eligibility/identity, rejected coverage, queued callbacks and in-flight replacement. Four deliberately broken variants (guard, filter precedence, timing, removal) are detected. Existing fixtures are not altered.

Full portable run: 2,318 passing tests across all 188 files, no failures or skips, using isolated per-file TAP processes at concurrency two and the documented portable dependency overrides. Strict TypeScript checks the extracted module. Whole-project semantic types remain unverified. There are no added timers, subscriptions, network calls or UI changes; this is not a measured performance improvement.

The isolated ExB 1.21.0 stage-65 baseline build was user-verified with zero errors/warnings. Stages 66–67 still require a fresh host build and browser smoke checks; no ExB client is available here. Windows checkpoint-v3 and stage-66 application status remain unconfirmed.

## Reversible installation

Apply the stage-66 installer first. From the widget root:

```sh
node apply-turbo-view-bindings-refactor.cjs --dry-run
node apply-turbo-view-bindings-refactor.cjs
# Reverse only stage 67:
node apply-turbo-view-bindings-refactor.cjs --uninstall
```

The standalone installer checks actual stage-66 runtime source, refuses unexpected edits, accepts LF and BOM/CRLF text, preserves local documentation history, and saves exact original bytes outside the widget. Dry-run makes no changes. Rollback verifies installed files and backup hashes and refuses to overwrite later edits. Reverse stages in order: 67 before 66. Restart the client and hard-refresh; verify stationary coverage, username/config fallback, 2D rotation/3D zoom, preview resumption and view replacement/teardown.
