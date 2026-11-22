# Active-view transfer — stage 92 / P02 part 2

`src/features/navigation/ActiveViewTransfer.ts` owns the transfer revision and synchronous transfer policy. `begin` returns the new view, a current-token predicate, the dimension-change flag and the previous camera snapshot. Full widget cleanup calls the same owner's `invalidate`; there is no parallel widget startup revision.

The coordinator runs the existing route/hover prelude even for invalid input. Valid views receive terrain setup, startup reset, tool transfer and interaction/watcher detachment before the previous camera is captured. It then handles changed-dimension analysis, clears presentation and pending work, and claims current-image presentation before the caller commits React state. Tokens become current only after that commit, and fail on later transfers, full cleanup, map replacement or destruction. Invalid input retains the previous revision, as before.

`Widget.activeViewTransferHost` binds existing resource owners in named phases. It retains concrete SDK/feature calls and mutable handle slots; the coordinator receives no widget, React props/state, DOM, service or SDK module. The bindings perform no work when constructed. Existing tool, presentation, request and URL owners remain responsible for their resources; this change does not introduce another rendering or request owner.

The state commit, independent shared-link restoration, stage-91 startup workflow, zoom/Turbo/layer-order attachment and nested click/hover wiring keep their positions after transfer. No async hop, request, timer or dependency is added. Individual click/pointer handle-removal failures are still swallowed; other transfer failures still propagate and stop subsequent phases. The two existing diagnostic log calls are retained.

Twenty-nine new cases compare actual production host/entry behavior with the frozen stage-91 transfer prefix, or check token invalidation and cleanup integration. Existing route-cancellation and lifecycle-wide source assertions now follow the delegation while retaining their original checks. Startup and coverage-first tests remain unchanged. The widget is 10,926 lines, 21 fewer; its entry has less policy, but the widget remains substantial and P02 is not complete.

Validation: 3,046 passing portable tests / 218 files in both workspace and clean installer-produced copy, with zero failures or skips. Strict transfer-module TypeScript and the isolated ExB 1.20 module-graph build pass; the build has zero errors/warnings. Reversible installer and BOM/CRLF checks pass. Live ExB 1.21/browser acceptance remains pending.

Install after stage 91 from the widget root:

```sh
node apply-active-view-transfer-refactor.cjs --dry-run
node apply-active-view-transfer-refactor.cjs
node tools/check-exb-build.cjs --client ../../..
```

Keep `.refactor-backups/active-view-transfer-stage92` for `node apply-active-view-transfer-refactor.cjs --uninstall`. Unknown source edits stop the installer before writes; documentation history outside targeted blocks is retained. Uninstall later stages first, and preserve the backup for exact guarded rollback.

Next: complete P02 by coordinating committed-view startup registration and owned non-interaction attachments, reusing the stage-91 workflow and existing zoom/Turbo bindings. P03 owns click/pointer dispatch. P02 has used two of its planned 2–3 changes; one final P02 change remains planned.

Real-host checks remain necessary: cold/warm startup, close/reopen, rapid map replacement while loading, 2D/3D switching and shared links. Check that retired views receive no late restoration or watchers. The isolated module-graph build and portable tests do not constitute browser acceptance.
