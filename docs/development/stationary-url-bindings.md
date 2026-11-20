# Stationary URL bindings — stage 68

`StationaryUrlBindings` owns only the persistent map stationary watcher formerly attached inside `onActiveViewChange`. It receives live host readers and actions, with no React, ArcGIS or browser dependency. The widget still owns URL serialization, pulse refresh and shared-link restoration.

## Preserved contract

The previous watcher is detached at the same early view-transfer point. The replacement is installed at the same late point after startup restoration and coverage readiness, and removes any previous handle before watching stationary. No eager registration or additional teardown path is introduced.

The callback returns for moving or obsolete/destroyed/mapless views. It refreshes the current-image pulse before checking fly-in. Fly-in suppresses URL writing, not pulse refresh. The latest image ID is read only when writing, with null/undefined converted to undefined and an empty string preserved. The existing widget URL adapter continues to suppress writes until shared-state restoration finishes. Cleanup and rebinding retain their original handle and late-callback semantics.

No added subscriptions, timers or data requests. This is a behavior-preserving extraction, not a measured speed improvement.

## Validation and acceptance

Nineteen tests execute the actual widget owner adapter and compare traces with frozen stage-67 watcher blocks. They cover stationary/moving state, stale/current views, fly-in, live image-ID reads, pulse ordering, watcher replacement, cleanup and late delivery. Broken guard, stationary gate, fly-in check and handle-removal variants each fail. Existing tests/fixtures are preserved.

Full portable run: **2,337 passing tests in 189 files**, zero skipped, using isolated per-file TAP processes at concurrency two with the documented dependency overrides. The extracted module passes strict TypeScript; widget/module syntax/transpilation and source hygiene pass. Whole-project semantic typing and production packaging remain separate.

The user reported “all good, I've tested” after stages 66–67. This confirms their general host smoke acceptance; no new detailed compiler/device evidence was supplied. The successful isolated ExB 1.21.0 stage-65 build remains baseline evidence. Stage 68 has not yet been host-built or browser-tested here; no ExB client is installed in this workspace.

## Installation

After stage 67, run from the widget root:

```sh
node apply-stationary-url-bindings-refactor.cjs --dry-run
node apply-stationary-url-bindings-refactor.cjs
# Reverse only stage 68:
node apply-stationary-url-bindings-refactor.cjs --uninstall
```

Source and required owner modules are checked before any mutation. Unexpected edits are refused, documentation history is preserved, and exact-byte backups live outside the widget. LF/BOM/CRLF files are supported. Rollback checks installed and backup hashes and refuses later edits. Reverse stages 68, 67, 66 in that order if needed. Restart the client and hard-refresh. Smoke-check stationary URL writes with/without an image, moving and fly-in suppression and 2D/3D view switching.
