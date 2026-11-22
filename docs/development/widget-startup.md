# Widget startup — stage 100 / P05 part 1

`src/features/lifecycle/widgetStartup.ts` contains mount-time coordination and startup invalidation. `componentDidMount` and `disposeStartupResources` delegate through one typed host binding. Existing widget revision, disposed flag, abort controller, timer and stylesheet slots remain live; sprite loaders, shared notes and the rest of unmount keep reading the same slots. No parallel startup owner or counter was introduced.

Mount order is unchanged: increment revision/reset a disposed startup, diagnostics and visibility listener, organization/alignment/Places startup, await SDK modules, resolve optional creator, create layers with initial presets, apply preset state, restore cache/notes, observe resize, register fullscreen/window/keyboard listeners, attach tooltip, defer sprite catalogs by 500ms, inject stylesheet, apply creator/native mode and attach coverage/legend. Module or creator-setup failures keep the previous report-and-continue policy. Post-await and deferred-callback revision guards retain their positions. Repeated mounts retain the existing behavior; this relocation adds no deduplication policy.

Invalidation marks startup disposed and increments its revision before aborting work, clears both existing deferred timers and removes only the stored instance stylesheet. It deliberately leaves tooltip, listeners and observer cleanup to existing final unmount. `componentWillUnmount` still calls startup invalidation first. Close/minimize cleanup and full disposal remain later P05 work; fullscreen/resize policy belongs to P06.

The original tooltip shell values moved to `imageryTooltipStyle` in the existing `src/styles/imageryHoverCard.ts`; rich hover-card styling and DOM replacement remain unchanged. Named preset/creator/native-mode state bindings keep React writes at the widget boundary without a broad state facade or type assertion. Concrete SDK, ExB and layer types remain outside the coordinator.

Twenty-two comparisons execute the frozen stage-99 mount/disposal methods and current production entry/host/module with controlled browser clocks. They compare event/state/resource traces for presets, missing/zero creator IDs, error continuation, pending module/creator disposal, overlapping/repeated mounts, remount abort renewal, deferred/retired callbacks, live viewer/container behavior and disposal ownership. Fourteen existing tests retain actual sprite and startup-disposal checks. Mutations exercise lost await guards, omitted abort, late preload work and changed tooltip values.

Validation: 3,274 passing tests / 226 files, zero failures/skips in workspace and installer-produced copy. Strict feature module and actual Mapillary Viewer resize-contract checks pass; targeted adapter diagnostics pass under installed ExB 1.20 conventions. This is not a full host/whole-project strict check. Isolated ExB 1.20 module-graph build reports zero errors/warnings. BOM/CRLF and guarded installer tests pass. ExB 1.21/full-browser acceptance remains pending under P12.

P05 remains in progress after one of its 2–3 changes. Widget: 10,088 lines, 67 fewer than stage 99. Next: update/reopen feature effects, then full cleanup/unmount coordination. P05–P12 remain eight packages, provisionally 11–19 further changes.

Install after stage 99 from the widget root:

```sh
node apply-widget-startup-refactor.cjs --dry-run
node apply-widget-startup-refactor.cjs
node tools/check-exb-build.cjs --client ../../..
```

Keep `.refactor-backups/widget-startup-stage100`. Uninstall later stages first, then run `node apply-widget-startup-refactor.cjs --uninstall` for guarded exact rollback. Source/prerequisite edits are refused before writes; local documentation history and additions are preserved. No package, manifest, lockfile or Git operation is performed.

Real-host checks: initial creator/date/panorama settings, failed or delayed module/user resolution, immediate unmount/reopen, deferred sign/object catalog readiness, tooltip/fullscreen/keyboard/resize behavior and isolation between widget instances. Portable checks do not establish browser service behavior or performance measurements.
