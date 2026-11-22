# Widget teardown — stage 102 / P05 completion

`src/features/lifecycle/widgetTeardown.ts` defines common cleanup and final-unmount sequencing. The widget retains short `cleanupWidgetEnvironment`/`componentWillUnmount` entries and live typed bindings to existing resources. Concrete slot reset operations remain at the SDK/React boundary; the feature owns their ordering, partial/full-removal rules, viewer-removal catch, DOM release and selection-reset values. No resource registry, replacement owner or parallel lifetime counter was added.

Common cleanup retains early route/sprite/preview cancellation, startup-sharing reset, selected feature/Places/presentation release, hover/bearing/readiness cancellation, address/frame/cache/priority cleanup, optional full-view invalidation, local tool disposal, selection invalidation, popup/detection cancellation, marker/cone cleanup, playback/native selection/zoom/direction release, owned map removal, viewer removal and optional UI reset. Partial/full conditions and each existing cancellation/disposal order remain unchanged. Reset arrays are created for each call rather than sharing a constant object.

Final unmount still invalidates startup first. The feature then retires Places/notes/crops/hover state, removes visibility demand, disposes diagnostics/terrain/organization/alignment, marks shared notes disposed, runs full common cleanup, releases observer/tooltip/fullscreen/window/keyboard listeners and cancels the warning timer last. Crop removal remains fire-and-forget with its existing rejection handling. Viewer-removal failures retain the original narrow catch; other owner errors still propagate. Cleanup removes owned graphics/layers and leaves foreign map content intact.

Shared-link readiness sequencing reuses `activeViewStartup.ts`: view readiness, current/restored check, SDK modules, another check and existing URL/image/camera dispatch. Current/AbortError warning policy is unchanged. URL decoding, SDK image/camera operations and cross-feature bindings continue using existing navigation helpers. This change does not add a stronger async reopen/liveness policy.

Twenty-nine comparisons run the frozen stage-101 cleanup/unmount methods and current production entries/adapter/coordinators, comparing full traces, slots, state and real `OwnedMapResources` results. Coverage includes all reset/full combinations, borrowed content, counter-before-abort, viewer/other-owner errors, missing resources, zero/null handles, repeated cleanup/unmount, fresh arrays, rebuilt viewers, live view changes, crops, final DOM/listener order, cancelled late consumers and actual startup disposal. Nine additional readiness comparisons and existing shared-link camera/image assertions remain active. The 109 retained ownership/route/marker/startup/warning/cancellation checks execute the moved boundaries without dropping assertions.

Validation: 3,360 passing tests / 229 files in workspace and installer-produced copy, zero failures/skips. Strict feature/readiness modules and actual Mapillary Viewer boundary pass; targeted adapter/readiness diagnostics pass under installed ExB 1.20 conventions. This is not a whole-project strict check. Isolated ExB 1.20 module-graph build reports zero errors/warnings. Mutation, BOM/CRLF and reversible installer checks pass. ExB 1.21/full-browser acceptance remains pending under P12.

P05 implementation is complete across stages 100–102 within its three-change allowance. P06 fullscreen/resize transition policy and P10 residual cross-feature behavior remain separate. Widget: 9,854 lines, 79 fewer than stage 101 and 301 fewer across P05. P06–P12 remain seven packages, provisionally 10–17 further changes.

Install after stage 101 from the widget root:

```sh
node apply-widget-teardown-refactor.cjs --dry-run
node apply-widget-teardown-refactor.cjs
node tools/check-exb-build.cjs --client ../../..
```

Keep `.refactor-backups/widget-teardown-stage102`; uninstall later stages before `node apply-widget-teardown-refactor.cjs --uninstall`. Unknown source/prerequisite edits stop before writes; local documentation history/additions are preserved. Packages, manifests, lockfiles and Git history are untouched.

Real-host checks: repeated minimize/close/reopen, dispose while SDK/image/shared-link work is pending, two widgets sharing a map, normal/failed viewer removal, note crop cleanup, fullscreen/resize, keyboard/listener isolation and late callbacks. Portable checks do not establish full browser/service behavior or performance measurements.
