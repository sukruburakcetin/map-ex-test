# Widget update reconciliation — stage 101 / P05 part 2

`src/features/lifecycle/widgetUpdate.ts` coordinates update effects through `reconcileFeatureDemand`, `reconcileWidgetVisibility` and `reconcileConfiguration`, called sequentially by `reconcileWidgetUpdate`. `componentDidUpdate` supplies previous props/state and a fresh typed live adapter. Configuration, state, viewer and owner getters remain live; previous inputs are used for comparisons only.

Demand processing preserves Nearby cancellation/priority, invalid route and coverage-analysis cancellation, Places source/view/UI synchronization, loading pause policy, diagnostics/native sequence selection, progress announcements, elevation/profile, terrain, organization, point-tool and shared-note effects. Optional tool disable/legend effects precede observer and visibility work.

Visibility processing retains observer replacement, partial cleanup on minimize, presentation reclamation, full cleanup on close and coverage-ready reopening. Existing coverage reopens synchronously; missing coverage retains its fire-and-forget creator lookup, fallback and live post-await map/filter reads. Configuration processing retains sign/object reset/init policy, organization/creator callbacks, date/panorama/color filter callbacks and live bearing/zoom control toggles. Explicit UI setters bind concrete React state writes without casts, additional commits or queues.

Callback timing, failure behavior and async reopen liveness policy are preserved. This refactor adds no guard, request owner, cache, subscription, timer, dependency or behavior fix. Existing startup and teardown owners retain their roles. Fullscreen observer reattachment moved as part of update ordering; the full transition implementation remains P06.

Forty-eight comparisons execute the frozen stage-100 lifecycle and current production entry/host/phases. They compare traces/final state for individual demand triggers, combined changes, pause policy, observer/viewer changes, partial/full cleanup order, reopen with cached/missing layers, creator success/zero/failure, missing map, live post-await values, deferred state callbacks, filters and viewer controls. Existing Nearby, coverage-analysis, route, native selection and shared cleanup checks retain their assertions through the moved source/adapter. Mutations exercise phase ordering, minimize cleanup mode, deferred creator reads, pause policy and sign/object reset identity.

Validation: 3,322 passing portable tests / 227 files in workspace and installer-produced copy, zero failures/skips. Strict module and actual Mapillary Viewer control-contract checks pass. Targeted adapter diagnostics pass under installed ExB 1.20 conventions; this is not a whole-project strict check. Isolated ExB 1.20 module-graph build reports zero errors/warnings. BOM/CRLF and reversible installer checks pass. ExB 1.21/full-browser acceptance remains under P12.

P05 has used two of its 2–3 changes. Full cleanup/unmount coordination remains its final planned change. Widget: 9,933 lines, 155 fewer than stage 100 and 222 fewer across P05 so far. P05–P12 remain eight packages, provisionally 11–18 further changes: one P05 plus the original 10–17 for P06–P12.

Install after stage 100 from the widget root:

```sh
node apply-widget-update-refactor.cjs --dry-run
node apply-widget-update-refactor.cjs
node tools/check-exb-build.cjs --client ../../..
```

Keep `.refactor-backups/widget-update-stage101`; uninstall later stages before `node apply-widget-update-refactor.cjs --uninstall`. Unknown source/prerequisite edits stop before writes; local documentation additions/history are preserved. Packages, manifests, lockfiles and Git history are untouched.

Real-host checks: Nearby strip/object-tab demand, Places filters/panel, creator/organization/date/panorama settings, detection toggles, background priority, profile/terrain, minimize/full close/reopen, fullscreen resize, map replacement and bearing/zoom controls. Portable checks do not establish full browser/service behavior or performance measurements.
