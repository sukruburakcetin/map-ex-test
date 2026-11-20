# View zoom bindings — stage 66

`ViewZoomBindings` owns only the zoom and 3D camera watch handles and their debounced URL writer. It receives a narrow host contract; it does not import the widget, React, ArcGIS or a service. `widget.tsx` remains responsible for view selection, state, pulse/marker/cone work, warnings and URL serialization.

Binding clears the previous camera watcher, zoom watcher and pending URL write, creates the existing 600 ms debounce, publishes initial zoom, registers zoom and finally registers camera for 3D. Cleanup stays at the original point in widget teardown. Zoom events keep the original order: current-view/map/destroyed guard, pulse, displayed zoom, URL scheduling, marker refresh, cone redraw and quality warning. URL execution checks the current view and fly-in state and reads the latest image ID. The camera callback intentionally keeps its original redraw semantics; this extraction does not add a stale-camera policy.

There are no added subscriptions, network requests or timers. This is a behavior-preserving extraction, not a measured speed improvement. Shared map ownership and existing debounce implementation stay in the widget.

## Evidence

The new test suite extracts the actual widget owner initializer and compares its observable traces against frozen blocks from commit `0264ff5`. Twenty-seven cases cover 2D/3D registration/replacement, stale zoom/URL delivery, cancellation, quality thresholds/live toggles, latest IDs, fly-in, optional cancellation, repeated cleanup and old camera delivery. Mutations to URL guarding, cancellation and debounce timing each cause failure. Existing fixtures remain unchanged.

Clean stage 65: 2,265 passing tests across 186 files. Stage 66: 2,292 passing tests across 187 files, zero skipped. All test files run individually in isolated Node TAP processes, concurrency two, using the dependency overrides documented in portable-tests.md. Strict TypeScript passes for the extracted module. The user supplied successful isolated ExB 1.21.0 baseline build/browser evidence; this stage has not yet been built or browser-tested in that host. Whole-project typing, production packaging and granular device acceptance remain separate.

## Installation and checkpoint status

Checkpoint v3 is not present in the available Git/workspace artifacts and no Windows application output was supplied. Do not infer successful v3 installation from Markdown or this stage's tests. The incremental CJS installer preflights the stage-65 widget fingerprint, accepts LF or BOM/CRLF equivalents, preserves unexpected edits, and backs up exact bytes outside the widget. New files must be absent or already match. Documentation updates preserve existing text. Dry-run does not write. Rollback checks installed and backup hashes before restoring exact original bytes, and refuses later edits.

From the widget root:

```sh
node apply-view-zoom-bindings-refactor.cjs --dry-run
node apply-view-zoom-bindings-refactor.cjs
# To reverse only this installation:
node apply-view-zoom-bindings-refactor.cjs --uninstall
```

Restart the client and hard-refresh. Check 2D/3D zoom, quality warning boundaries, URL changes after the existing debounce, and view replacement/unmount. Preserve backup directories. No dependency reinstall is required.
