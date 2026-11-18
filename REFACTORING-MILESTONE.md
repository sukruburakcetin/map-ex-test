# Mapillary Explorer — refactoring milestone

Updated: **18 November 2026 (Asia/Riyadh)**. Resume point: **stage 46 — cumulative checkpoint v2 verified through stage 45**.

## Goal and current checkout

Extract bounded feature logic from `src/runtime/widget.tsx` while preserving exploration, request timing, cancellation, shared-map ownership and UI behavior. File organization does not establish a performance improvement; measure in the target host.

- Current working checkout: `/workspace/map-ex-current`, based on commit **`968375a5d0f09fd2a79d45dd7a70fcc41a579aeb`**, `updating current activities v12`. Stages 19–46 are accumulated **uncommitted** work, including new modules/tests. Preserve them; no commit, push or deployment was made.
- The earlier `/workspace/map-ex-synced` checkout retains accumulated local edits. Do not reset it or copy its older runtime over this checkout.
- Stages 1–14 and the geometry/solve-history runtime code are present in this commit. The previous handoff's stage 15 helper and stage 16 integration/build-check files were **absent from the baseline**. Stage 20 adds a newly implemented controlled integration suite; the build checker remains absent. Final-solve recovery was inline at that baseline; stage 22 now extracts it with fresh characterization and integration coverage.
- The user's client is Experience Builder **1.21**. Delivery of an installer does not confirm installation or browser validation. No commit, push or deployment was made during this continuation.

Read [architecture](docs/development/architecture.md), [routing validation](docs/development/routing-validation.md) and [solve history](docs/development/capture-solve-history.md). Preserve all local edits and untracked feature files.

## Completed stages

| Order | Stage | Main result | Installer |
| --- | --- | --- | --- |
| 1 | Widget lifecycle safety | Startup cancellation, deferred-work disposal, exact ownership of shared-map resources and stylesheet cleanup. | `apply-widget-lifecycle-safety.cjs` |
| 2 | Route generation safety | One active route run, stale-result guards and provider cancellation; older runs cannot overwrite newer UI state. | `apply-route-generation-safety.cjs` |
| 3 | Detection controller extraction | Traffic-sign/object layer creation, replacement, styling and disposal moved into `DetectionLayerController`. | `apply-detection-controller-refactor.cjs` |
| 4 | Pure route scoring extraction | Segment scoring, corridor decisions, stop ownership, diagnostics, target deduplication and summaries moved out of the widget. | `apply-route-scoring-refactor.cjs` |
| 5 | Routing defaults fix | Intentional behavior/configuration fixes: finite priorities, existing thresholds/caps enforced, complete stop-reason type. | `apply-routing-defaults-fix.cjs` |
| 6 | Adaptive corridor extraction | Synchronous corridor build/select loop moved into `adaptiveCaptureSelection`; widget reduced by 100 lines in this stage. | `apply-adaptive-corridor-refactor.cjs` |
| 7 | Final-solve batch-pruning extraction | Calibration, efficiency ranking and removal plan moved into `finalSolveBatchPruning`; widget reduced by 66 lines. | `apply-final-solve-pruning-refactor.cjs` |
| 8 | OSRM preflight batch-pruning extraction | Generic batch calibration and removal plan moved into `preflightBatchPruning`; widget reduced by another 51 lines. | `apply-preflight-pruning-refactor.cjs` |
| 9 | Preflight diagnostics extraction | Anchor ownership/snap ranking and leg construction/top-ten ranking moved into `preflightDiagnostics`; widget reduced by another 45 lines. | `apply-preflight-diagnostics-refactor.cjs` |
| 10 | Trial-preflight quality extraction | Three raw internal-traversal predicates consolidated into `trialPreflightQuality`; widget reduced by another 83 lines. | `apply-trial-preflight-quality-refactor.cjs` |
| 11 | Replacement-pair ranking extraction | Addition/removal candidate filtering, pairing and ranking moved into `replacementPairRanking`; widget reduced by another 68 lines. | `apply-replacement-pair-ranking-refactor.cjs` |
| 12 | Network-penalty scoring extraction | Leg-cost attribution, cleanup filtering and candidate ranking moved into `captureNetworkPenalties`; widget reduced by another 98 lines. | `apply-network-penalties-refactor.cjs` |
| 13 | Near-budget probe comparison extraction | Network/fitting/progress winner comparisons and result types moved into `budgetProbeComparison`; widget reduced by another 61 lines. | `apply-budget-probe-comparison-refactor.cjs` |
| 14 | Adaptive network-removal plan extraction | Overrun-based limits and ordered removal-ID planning moved into `adaptiveNetworkRemoval`; widget reduced by another 17 lines. | `apply-adaptive-network-removal-refactor.cjs` |
| 15 | Final solved-route selection extraction (historical report) | Not present in this commit; recovery remains inline in the widget. Do not assume this stage is installed. | `apply-final-capture-selection-refactor.cjs` |
| 16 | Routing integration verification (historical report) | Integration fixtures and bundle checker are absent from this commit; previous results cannot be reproduced here. | `apply-routing-integration-checks.cjs` |
| 17 | Route geometry safety fix | Validate geometry before clearing/loading route graphics or publishing malformed final results. Intentional behavior fix; valid styling, coordinate references and cancellation are retained. | `apply-route-geometry-safety-v2.cjs` (recommended; v1 also exists) |
| 18 | Best-solve bookkeeping | Route/time/opportunity snapshots consolidated in a run-local `CaptureSolveHistory`; strict ties and copying semantics preserved. | `apply-capture-solve-history.cjs` |
| 19 | Milestone reconciliation and geometry regressions | Correct checkout/status and validation instructions; add geometry/drawing checks. No production runtime changes. | `apply-milestone-reconciliation.cjs` |
| 20 | Controlled routing integration coverage | Actual widget methods with controlled provider promises; retry recovery, preflight pruning, cancellation and final summary ownership. No runtime changes. | `apply-route-integration-coverage.cjs` |
| 21 | Route-result assembly extraction | Pure typed result builder preserves legacy fields, numeric semantics and coordinate references; widget reduced by 85 lines. | `apply-route-data-refactor.cjs` |
| 22 | Final retry recovery extraction | Typed helper pairs the chosen solve and its opportunity snapshot; strict budget/improvement checks and warnings preserved. | `apply-final-selection-refactor.cjs` |
| 23 | Final coverage reporting extraction | Synchronous summary and 20 ordered diagnostics moved out of the widget; widget reduced by 54 lines. | `apply-coverage-report-refactor.cjs` |
| 24 | Main preflight quality extraction | Rounded-diagnostic classification, cleanup gating and owner set moved into a typed helper; raw trial checks remain separate. Widget reduced by 37 lines. | `apply-preflight-quality-refactor.cjs` |
| 25 | Replacement-probe winner extraction | Value-first/time tie-break and winner record moved into a typed helper; added complete replacement-path integration case. Widget reduced by 30 lines. | `apply-replacement-probe-refactor.cjs` |
| 26 | ArcGIS provider resolution extraction | World/auth, portal discovery branch and custom URL policy moved out of the widget; SDK/login ownership retained. Widget reduced by 122 lines. | `apply-provider-resolution-refactor.cjs` |
| 27 | Provider construction extraction | OSRM/ArcGIS factories, options and logs moved into a typed module; late SDK/mode reads preserved. Widget reduced by 77 lines. | `apply-provider-factory-refactor.cjs` |
| 28 | A/B marker construction extraction | Point geometry and 2D/3D symbol construction moved out; widget retains removal, ownership and stored references. Widget reduced by 27 lines. | `apply-route-marker-refactor.cjs` |
| 29 | Routing authentication helpers | Portal discovery and authentication-failure policy moved into a routing module; SDK/login/feedback ownership retained. Widget reduced by 29 lines. | `apply-routing-auth-refactor.cjs` |
| 30 | Runtime routing settings extraction | Pure engine/mode change plans preserve busy guards, OSRM drive coercion and generated-route invalidation. Widget reduced by 59 lines. | `apply-runtime-routing-refactor.cjs` |
| 31 | Legacy routing cleanup | Remove the unreferenced widget solve bridge and correct outdated provider/authentication comments. No new modules or behavior changes; widget reduced by 59 lines. | `apply-routing-legacy-cleanup.cjs` |
| 32 | Initial selection reporting extraction | Two reporting entry points preserve the empty-corridor/selection guards and diagnostics. Widget reduced by 22 lines; both early exits integration-tested. | `apply-selection-report-refactor.cjs` |
| 33 | Cumulative delivery checkpoint | Replay stages 19–32, test installed output and verify exact reverse rollback; supply a cumulative installer. No new runtime change. | `apply-refactoring-checkpoint.cjs` |
| 34 | Final route evaluation extraction | Synchronous geometry validation, target selection and both coverage evaluations moved together; widget reduced by 35 lines. | `apply-route-evaluation-refactor.cjs` |
| 35 | Main snap classification consolidation | Advisory/hard snap rules moved into the existing quality module; thresholds, owner exclusions and rejection flow preserved. | `apply-preflight-snaps-refactor.cjs` |
| 36 | Trial preparation consolidation | Three probe branches share pure ordered opportunity/stop/owner preparation; requests and run checks stay in the widget. Widget reduced by 15 lines. | `apply-trial-plan-refactor.cjs` |
| 37 | Guarded route renderer extraction | Drawing moves behind a typed live host; widget retains layer clearing/teardown. Existing async guards and partial-failure order preserved. Widget reduced by 29 lines. | `apply-route-renderer-refactor.cjs` |
| 38 | Unused Turbo renderer cleanup | Remove unreferenced widget renderer and unused import; native coverage styling unchanged. Widget reduced by 119 lines. | `apply-unused-turbo-renderer-cleanup.cjs` |
| 39 | Retired tile-cache cleanup | Remove unreferenced feature-layer pruning routine and seven bookkeeping maps; active native coverage unchanged. Widget reduced by 47 lines. | `apply-legacy-tile-cache-cleanup.cjs` |
| 40 | Minimap basemap-copy extraction | Standard-ID, JSON and existing fallback policy moved to a typed helper; map/view lifecycle retained. Widget reduced by 40 lines. | `apply-minimap-basemap-refactor.cjs` |
| 41 | Minimap layer construction extraction | Active style copies and native minimap coverage construction moved together; insertion/tracking order retained. Widget reduced by 68 lines. | `apply-minimap-layers-refactor.cjs` |
| 42 | Minimap click-selection extraction | Nearest-image math moved out; 5m/current-image guards and async handler retained. Added four actual click-handler cases. Widget reduced by 15 lines. | `apply-minimap-selection-refactor.cjs` |
| 43 | Minimap tracking regression checkpoint | Add 27 actual-method checks for graphic reuse, navigation deduplication, line replacement and teardown. Tests/documentation only. | `apply-minimap-tracking-tests.cjs` |
| 44 | Minimap click-handler extraction | Complete handler moved into existing selection module with live host adapters; requests, updates and error boundaries preserved. Widget reduced by 39 lines. | `apply-minimap-handler-refactor.cjs` |
| 45 | Minimap view-options extraction | Initial center/zoom and native options moved together; lookup/read order, constructor and lifecycle guards retained. Widget reduced by 12 lines. | `apply-minimap-options-refactor.cjs` |
| 46 | Cumulative checkpoint v2 | Replay stages 19–45, test installed output, audit relative imports and verify exact rollback; provide one cumulative installer. No new runtime changes. | `apply-refactoring-checkpoint-v2.cjs` |

## Installer order and compatibility

**Latest cumulative option:** `apply-refactoring-checkpoint-v2.cjs` consolidates stages 19–45 plus this delivery milestone. It supports the committed `968375a` baseline and recognized per-file revisions from those incremental installers, including checkpoint v1 and a fully updated stage-45 checkout. Use dry-run first. Unknown edits in affected files are refused; unrelated files are untouched. Matching files are skipped.

```sh
node apply-refactoring-checkpoint-v2.cjs --dry-run
node apply-refactoring-checkpoint-v2.cjs
```

Keep the checkpoint backup folder. `--uninstall` restores the exact state immediately before v2 application, which may be partially updated rather than the Git baseline. Uninstall v2 before rolling back earlier installers. If runtime files were updated, restart the client and hard-refresh. On a stage-45 checkout, v2 only updates the delivery documentation. No dependency reinstall is needed.

The older `apply-refactoring-checkpoint.cjs` (stage 33/v1) covers stages 19–32 only. Its validation is retained below as history. Neither checkpoint is a complete widget release or a replacement for changes committed before `968375a`.

The previous handoff located stage 7–18 installers in `/workspace/shared/downloads/`; that location is not available in this continuation. Historical installer names are references, not proof that artifacts or installations are present. Stage 19 is delivered under `/workspace/artifacts/`. Save artifacts separately when changing environments. Stage 1–6 filenames above are historical references; their changes are already in the Git baseline. Do not reinstall stages already present in the user's source.

For an older checkout, verify actual source and required runtime prerequisites before using historical incremental installers; the table alone is not an installation recipe. Each installer is incremental; none is a complete release. Stage 16 adds checks/documentation only. Runtime changes require restarting the client and hard-refreshing; no dependency reinstall is needed for these source updates.

**Geometry installer correction:** the user reported that v1 stopped with `Expected source block not found uniquely: src/runtime/widget.tsx`. That was a preflight failure: nothing changed. A reordered-import checkout reproduced this error. Prefer **`apply-route-geometry-safety-v2.cjs`**, which uses the installed client's TypeScript parser to recognize the affected methods, tolerates import order/formatting/BOM/CRLF and refuses unknown logic. It applies the runtime fix and updates recognized existing test fixtures; it does not reproduce v1's full documentation/test payload. If v1 already succeeded, the runtime fix does not need reinstalling.

Stage 18, **`apply-capture-solve-history.cjs`**, also uses method-based matching and supports v2 output. It preserves existing milestone text by appending a continuation note, rather than requiring an exact earlier documentation version. This consolidated milestone supersedes those appended handoff notes.

```sh
node apply-capture-solve-history.cjs --dry-run
node apply-capture-solve-history.cjs
```

The example assumes geometry safety and prior required runtime stages are present. Keep installer backups. Uninstall later changes first, using each installer's own `--uninstall`; rollback refuses subsequent local edits and corrupted backups. Do not force-patch unknown source.

## Boundaries to preserve

- [OwnedMapResources](src/features/map-graphics/OwnedMapResources.ts) tracks exact owned instances; unrelated, borrowed and same-ID resources must survive cleanup.
- [RouteGeneration](src/features/routing/RouteGeneration.ts) and [provider cancellation](src/utils/routingCancellation.ts) retain ownership checks after awaits. Old runs cannot publish, clear newer busy state, attach graphics or restore a stale camera.
- [DetectionLayerController](src/features/detections/DetectionLayerController.ts) owns detection layer lifecycle/appearance; widget state and cross-feature coordination remain in the widget.
- [Capture scoring](src/features/routing/captureRouteScoring.ts) and [adaptive selection](src/features/routing/adaptiveCaptureSelection.ts) remain synchronous local work. Provider calls, progress, toasts and cancellation remain with the widget.
- [Final-solve pruning](src/features/routing/finalSolveBatchPruning.ts) uses the existing **0.96** reserve; [preflight pruning](src/features/routing/preflightBatchPruning.ts) uses **0.85**. Preserve the 1–6 calibration clamp, 0.25-minute floors, stable ties, ID-based removals and A-to-B survivor ordering.
- [Preflight diagnostics](src/features/routing/preflightDiagnostics.ts) round values before main quality decisions. [Trial quality](src/features/routing/trialPreflightQuality.ts) uses **raw** values, inclusive 450m/4.5min thresholds and first-failure short-circuiting. Do not unify their precision rules.
- [Replacement ranking](src/features/routing/replacementPairRanking.ts) caps additions/removals at five **before** pairing, requires gain above 25, preserves current anchor accounting and returns at most five probe pairs.
- [Network penalties](src/features/routing/captureNetworkPenalties.ts) preserve full/split attribution, sentinel and cleanup exclusions, the 2–4 minute threshold, 100m denominator floor and stable ranking. [Removal planning](src/features/routing/adaptiveNetworkRemoval.ts) preserves 1/2/4/6 limits at overrun ratios 1.4/2/3 and ID-set count semantics.
- [Probe comparison](src/features/routing/budgetProbeComparison.ts) preserves the 0.25 relief floor, strict 0.5 cost advantage, inclusive 0.5 tie band, higher-extra-time tie preference and strict 0.1-minute progress threshold. Quality/fit gates and fitting-over-progress fallback remain in the widget.
- [Final recovery](src/features/routing/finalCaptureSelection.ts), newly extracted in stage 22, pairs a selected solved route with its own opportunities. [CaptureSolveHistory](src/features/routing/CaptureSolveHistory.ts) holds route/time/shallow snapshot together **per run**; strictly lower extra time wins, ties retain the first winner and losing solves do not copy selections.

## Intentional fixes, separate from extraction

Stage 5 explicitly sets neutral `centerDistanceWeight = 0`, enforces the existing 12m useful-length/weighted-new-coverage floors and 40-candidate limit, and shares the complete stop-reason type including `anchor-cap`. Do not silently retune these values.

Stage 17 fixes a reproduced exception: drawing an empty array could clear the existing route and then throw. [Geometry validation](src/features/routing/captureRouteGeometry.ts) now rejects empty, short, sparse, mixed or nonfinite paths before SDK layer loading/clearing and before final-route coverage evaluation/publication. Valid coordinates, altitude ordinates, references and purple-line styling remain intact. This was a behavior fix, not merely file extraction.

## Current verification (stage 46)

- All **47 available focused test files passed**, including 20 view-options comparisons, 17 full-handler comparisons, 27 tracking checks, 17 minimap-selection comparisons and four click-handler cases, 26 minimap-layer comparisons, 26 basemap comparisons, existing minimap lifecycle checks, 26 renderer comparisons, 14 trial-plan tests, 17 snap-classification tests, 17 final-evaluation tests, 13 selection-report tests, 21 runtime-settings tests, 30 authentication-helper tests, 18 marker tests, 18 provider factory tests, 23 provider-resolution tests, 17 replacement-comparison tests, 21 main-quality tests, 12 coverage-report tests, 14 final-selection tests, 14 result-assembly tests, 25 integration tests and the geometry regressions. The historical 24-file/405-test report below is not a current result.
- Strict TypeScript passed for minimap view options, minimap selection, minimap layers, minimap basemap policy, the renderer, trial preparation, main preflight quality/snap classification, final evaluation, selection reporting, runtime settings, routing authentication, the marker factory, provider construction, provider resolution, replacement-probe comparison, the main preflight classifier, coverage reporter, final-selection helper and result builder with their dependencies. Stages 19–20 did not change runtime files; stages 21–30 move result assembly, final selection, coverage reporting, main quality classification, replacement comparison, provider resolution/construction, markers, authentication helpers and runtime-settings policy.
- Documentation: 97 Markdown files, 343 local links, zero broken links. Repository layout: 805 source files, zero errors. `git diff --check` passed.
- The incremental installer passed eight checks across LF and BOM/CRLF inputs: dry-run, exact application, repeat/rollback and refusal to overwrite unknown edits.
- Full Experience Builder 1.21 build, browser routing integration and playback performance remain unverified.

## Cumulative delivery verification (stage 46)

All 27 installers from stages 19–45 passed dry-run, application and repeat application on an isolated copy of commit `968375a`. The resulting **70 affected files matched** the stage-45 workspace byte-for-byte. All **47 focused test files passed on that installed copy**. Reverse-order uninstall restored the entire committed baseline source tree exactly.

Checkpoint v2 passed **32 safety checks** across baseline, stage-20, stage-33 and stage-45 file states with both LF and BOM/CRLF inputs: read-only dry-run, supported application, repeat/exact rollback and unknown-edit refusal. A static audit of **894 relative imports across 360 source files** found no missing local targets. This checks target existence, not named exports, SDK compatibility or bundling.

Stage 46 changes delivery documentation only. Full Experience Builder 1.21 build/browser verification and live playback measurements remain pending.

## Historical cumulative delivery verification (stage 33)

On an isolated copy of commit `968375a`, all 14 installers from stages 19–32 passed dry-run, application and repeat application. The resulting 41 affected files matched the working source byte-for-byte. All 34 focused test files passed on that installed copy. Uninstalling those stages in reverse order restored the entire original source tree exactly.

The cumulative checkpoint additionally passed 24 checks across baseline, stage-20 and stage-32 file states with LF and BOM/CRLF inputs: read-only dry-run, supported application, repeat application/exact rollback and refusal to overwrite unknown edits. These are delivery checks, not live Experience Builder validation. No runtime code was added or changed in stage 33.

## Historical validation report (not reproduced from this commit)

The table below preserves the previous handoff report. Missing integration/build files prevent reproducing it in this checkout. Do not present its 405-test or isolated-build results as current verification. See the current checks in [routing validation](docs/development/routing-validation.md).

| Check | Result and scope |
| --- | --- |
| Focused regressions | **405 tests across 24 files passed**, including 13 solve-history tests. This is not a full repository test pass. |
| Characterization | Previous calculations are frozen under `tests/fixtures/`; tests compare outputs, diagnostic/distance-call order, boundaries, ties, nonfinite inputs, snapshot identity and deterministic varied cases. |
| Route integration | Actual widget method with controlled provider promises and mocked view/rendering/coverage inputs: final/preflight cancellation, overlapping runs, drawing cancellation, worse/better retries and correct final opportunity summaries. |
| TypeScript | Strict checks passed for the extracted routing modules and dependencies; changed TS/TSX syntax checks passed. |
| Isolated bundle | Runtime and settings built with **Experience Builder 1.20.0 rules**, **zero errors and warnings**, using Mapillary JS **4.1.2**, pbf **5.1.2**, vector-tile **3.0.0**. |
| Installed output | Geometry v2 followed by solve-history installation on reordered-import source passed the same **405-test suite** and isolated bundle check. Reverse-order rollback restored original source. |
| Installer safety | Dry-run, apply, repeat application, exact rollback, BOM/CRLF, import order, formatting/comments, unrelated-edit preservation, unknown-code refusal and backup integrity checked. Earlier original installer stages were also replayed in sequence with reverse rollback; this is not confirmation of the user's installation. |
| Documentation/layout | Local Markdown links, repository layout and `git diff --check` passed. |

The isolated build checker uses host loader/external rules, disables the loader worker pool and writes temporary SystemJS bundles. It omits full host packaging and uses the host's **transpile-only** loader. The existing host widget link and dependency folder were left unchanged; documented dependency versions were installed separately for the check.

**Still unverified:** full Experience Builder **1.21** build, live ArcGIS/Mapillary behavior, mobile/RTL presentation and playback performance. Previously observed `coverageAnalysisReliability.test.cjs` failures also occurred on the baseline; the focused routing suite does not establish a clean full repository run.

## Reproduce checks

Use installed TypeScript, or set `MAPILLARY_TYPESCRIPT` to its location. This continuation used `/tmp/map-ex-validation/node_modules/typescript/lib/typescript.js` with TypeScript 5.9.3; that temporary path is not a portable dependency.

```sh
node --test tests/minimapViewOptions.test.cjs tests/minimapClickHandler.test.cjs tests/minimapTracking.test.cjs tests/minimapSelection.test.cjs tests/minimapLayers.test.cjs tests/minimapBasemap.test.cjs tests/minimapLifecycle.test.cjs tests/nativeSequenceSelection.test.cjs tests/coverageHoverRuntime.test.cjs tests/captureRouteRenderer.test.cjs tests/captureTrialPlan.test.cjs tests/preflightSnaps.test.cjs tests/captureRouteEvaluation.test.cjs tests/captureSelectionReport.test.cjs tests/runtimeRoutingSettings.test.cjs tests/routingAuthentication.test.cjs tests/routePointGraphic.test.cjs tests/captureProviderFactory.test.cjs tests/routingProviderResolution.test.cjs tests/replacementProbeComparison.test.cjs tests/preflightQuality.test.cjs tests/captureCoverageReport.test.cjs tests/finalCaptureSelection.test.cjs tests/captureRouteData.test.cjs tests/captureRouteIntegration.test.cjs tests/captureSolveHistory.test.cjs tests/captureRouteGeometry.test.cjs tests/adaptiveNetworkRemoval.test.cjs tests/budgetProbeComparison.test.cjs tests/captureNetworkPenalties.test.cjs tests/replacementPairRanking.test.cjs tests/trialPreflightQuality.test.cjs tests/preflightDiagnostics.test.cjs tests/preflightBatchPruning.test.cjs tests/finalSolveBatchPruning.test.cjs tests/adaptiveCaptureSelection.test.cjs tests/routingDefaults.test.cjs tests/captureRouteScoring.test.cjs tests/routeGeneration.test.cjs tests/routingCancellation.test.cjs tests/routePreviewSimulation.test.cjs tests/sequenceV6Runtime.test.cjs tests/detectionLayerController.test.cjs tests/ownedMapResources.test.cjs tests/startupDisposal.test.cjs tests/coverageClickDispatch.test.cjs tests/coverageStartup.test.cjs
npx --no-install tsc --strict --noEmit --target es2020 --lib es2020,dom src/features/minimap/minimapViewOptions.ts src/features/minimap/minimapSelection.ts src/features/minimap/minimapLayers.ts src/features/minimap/minimapBasemap.ts src/features/routing/captureRouteRenderer.ts src/features/routing/captureTrialPlan.ts src/features/routing/captureRouteEvaluation.ts src/features/routing/captureSelectionReport.ts src/features/routing/runtimeRoutingSettings.ts src/features/routing/routingAuthentication.ts src/features/routing/routePointGraphic.ts src/features/routing/captureProviderFactory.ts src/features/routing/routingProviderResolution.ts src/features/routing/replacementProbeComparison.ts src/features/routing/preflightQuality.ts src/features/routing/captureCoverageReport.ts src/features/routing/finalCaptureSelection.ts src/features/routing/captureRouteData.ts src/features/routing/CaptureSolveHistory.ts src/features/routing/captureRouteGeometry.ts src/features/routing/adaptiveNetworkRemoval.ts src/features/routing/budgetProbeComparison.ts src/features/routing/captureNetworkPenalties.ts src/features/routing/replacementPairRanking.ts src/features/routing/trialPreflightQuality.ts src/features/routing/preflightDiagnostics.ts src/features/routing/preflightBatchPruning.ts src/features/routing/finalSolveBatchPruning.ts
node tools/check-docs.cjs
node tools/check-repository.cjs
git diff --check
```

The previously documented `tools/check-exb-build.cjs` is absent. Use the target client's normal build/start workflow; see [routing validation](docs/development/routing-validation.md) for the current scope and host checks.

## Next session

1. Inspect actual Git state, installed modules and local edits. Preserve untracked modules and backups; do not reset or replay stashes blindly.
2. Confirm the actual local source and whether cumulative or incremental installers were used. The checkpoint supports recognized stage 19–32 revisions; never force an unsupported preflight. Confirm whether geometry v2 and solve history were applied on the user's machine. If preflight fails, inspect the specific unsupported code; never bypass protection with a forced overwrite.
3. Prioritize the target **1.21** normal build and browser checks: budget-fit/pruned/recovered routes, cancellation during requests/drawing, view/map changes, coverage/detection controls and ordinary imagery playback.
4. Review remaining orchestration for one cohesive extraction using the restored integration suite and focused characterization. See the routing-validation guide for coverage limits. Keep provider awaits, run checks, UI and graphics ownership with the current owner. Any next extraction needs prior-output characterization and one reviewable installer.
5. Treat adjacent behavior fixes separately: generic OSRM preflight still logs its summary twice; `maxFinalStops` documentation includes endpoints while some intermediate-anchor accounting uses the full limit. Neither was changed by the later extractions.

Suggested resume prompt:

> Read REFACTORING-MILESTONE.md and the routing-validation/solve-history guides. Inspect and preserve actual local changes. Resume after stage 46; use the newly extracted final-selection helper; the historically reported build checker is still absent. Use the restored stage 20 controlled integration suite. Verify the user's geometry-v2 and solve-history installation, prioritize Experience Builder 1.21 host checks, and review remaining orchestration before proposing another bounded extraction. Preserve behavior, cancellation and resource ownership; deliver a reversible installer for any code change.
