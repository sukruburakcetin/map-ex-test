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

<!-- isolated-build-check-stage47 -->
## Stage 47 — isolated build verification

The source checkpoint is `609b81c` (v13). The isolated runtime/settings checker is restored at `tools/check-exb-build.cjs`; no runtime source changes are introduced. Current-source verification passed 855 tests across 47 focused files, strict extracted-module TypeScript, and an isolated Experience Builder 1.20.0 build with zero errors/warnings using Mapillary JS 4.1.2, pbf 5.1.2 and vector-tile 3.0.0.

This does not establish full target 1.21 packaging/browser compatibility or performance. Run the target client's normal build and the remaining live scenarios. See [checker usage and limits](docs/development/isolated-build-check.md). The tooling installer is additive, preserves existing notes and does not require a runtime restart.

<!-- viewer-presentation-stage48 -->
## Stage 48 — viewer presentation boundary

Extracted viewer surface, nearby/associated image tray, fullscreen/minimap chrome, styles and the runtime state contract. Requests, portals, SDK DOM ownership and selection timing stay with the runtime. The widget is reduced from 12,915 to 12,371 lines and still requires further controller extraction before it becomes a minimal entry. No runtime dependencies were added.

885 focused tests passed across 48 files, including 30 before/after presentation checks. Chromium passed 14 controlled layout/identity checks (desktop/mobile, LTR/RTL, tray scroll and SDK child retention) with SDK/control stubs. New presentation/style/state modules have no strict diagnostics; existing dependency/repository diagnostics prevent claiming a clean full typecheck. No additional widget diagnostics were introduced relative to the baseline. Isolated ExB 1.20 runtime/settings bundles passed with zero errors/warnings; target 1.21 normal build/live behavior/performance remain unverified.

See [presentation architecture and validation](docs/development/viewer-presentation.md). Installer: `apply-viewer-presentation-refactor.cjs`. It preflights known v13 runtime/types sources, refuses unknown edits and supports exact rollback. Restart the client and hard-refresh after application; no dependency reinstall. Continue with coherent controller boundaries rather than moving the remaining monolith wholesale.

<!-- widget-documentation-stage49 -->
## Stage 49 — runtime contributor documentation

Documentation-only audit after stage 48: reviewed 82 member descriptions and eight startup/request ownership counters. Corrected obsolete CDN startup, fullscreen, export, associated-image and sprite-preload descriptions; removed duplicate legacy preambles. See [runtime reading guide](docs/development/runtime-reading-guide.md) for entry points, ownership rules and comment conventions.

The full runtime syntax tree is unchanged, and emitted JavaScript with comments removed is byte-identical to the stage-48 input. All 885 focused regressions pass; all 47 JSDoc parameter names match signatures. Documentation links and repository layout checks pass. No runtime behavior, dependencies or fullscreen fixes are introduced. Existing full-repository type diagnostics and target 1.21/live-SDK validation remain separate.

Installer: `apply-widget-documentation.cjs` (known stage-48 runtime; BOM/CRLF supported). Preflight refuses unknown edits; backups support exact rollback. Uninstall stage 49 before rolling back stage 48. Continue refactoring from the presentation boundary with these lifecycle/request contracts.

<!-- v5-phase1-foundation-stage50 -->
## Stage 50 — Version 5.0 phase-1 foundation

Added a complete portable runner/preflight/report and test-environment guide. Six new runner/real-codec checks pass. With complete test dependencies, 185 Node files report **2,175 tests: 2,034 pass, 141 fail**; the pre-cleanup stage-49 application source under the same environment reproduces identical totals and failing names. No failures are suppressed or automatically accepted. See [baseline and failure inventory](docs/development/test-baseline.md) and [reproduction guide](docs/development/portable-tests.md).

Removed five unused imports, the token-value debug log and the empty root `.gitkeep`. Emitted runtime code changes only by removal of that debug log. Token-source behavior and saved config fields are preserved. Docs now match manifest ExB 1.21 and document directly imported pako 2.2.0. The isolated ExB 1.20 runtime/settings build passes with zero errors/warnings; target 1.21 production/live SDK acceptance remains outstanding. No host packages, credentials or license choices were changed.

Installer: `apply-v5-phase1-foundation.cjs`, targeting the known stage-49 source. Keep backups for exact rollback; uninstall stage 50 before older stages. From the target client, install the documented direct pako dependency if needed, then restart. Legacy files, migrations and assets remain. Next work: individually diagnose the 141 remaining loader/assertion failures without weakening requirements or blanket rebaselining.

<!-- point-cloud-fixture-repair-stage51 -->
## Stage 51 — point-cloud fixture repair

All 257 point-cloud tests across 17 suites plus four English fixture checks pass (261 focused). Full suite: **2,194 tests, 2,135 pass, 59 fail**, all 186 files included. The former 82 point-cloud failure reports are resolved; the other failing names are unchanged. This corrects the earlier conversational count of 92. Fourteen extra map-layer cases now execute instead of one module-load failure; five new fixture/format checks also execute.

Shared bindings use actual English catalogs, formatters and shipped text-only wrappers. SDK/clocks/writers and side-effect assertions remain suite-owned. Only rendered-toast text grouping/ordinary whitespace is canonicalized; props/styles, wording, counts, duration, state/order and non-toast identity stay checked. Calibration explicitly adapts historical compact-unit/XYZ spacing and separately asserts exact current feedback. No frozen fixtures or existing assertions were removed.

A real feedback typo was fixed: one JSX space separated `cluster` from `s`. No other production source changed. Restoring that old space in a temporary control makes 13 result tests fail. The isolated ExB 1.20 bundle passes with zero errors/warnings; target 1.21/live SDK acceptance remains separate. A guide's reference to absent worker-thread tests is corrected, not treated as evidence.

See [full baseline](docs/development/test-baseline.md) and [point-cloud notes](docs/development/point-cloud.md). Installer: `apply-point-cloud-fixture-repair.cjs` after stage 50; preserve backups for exact rollback and uninstall newer stages first. No package reinstall. Next: individually diagnose the other 59 failures, starting with field-note locale bindings, without weakening assertions.

<!-- field-note-fixture-repair-stage52 -->
## Stage 52 — field-note fixture repair

All 46 draft/file/collection tests plus four shared English fixture checks pass (50 focused). Full portable run: **2,195 tests, 2,163 pass, 32 fail**, all 186 files included. The former 27 target failure reports are resolved; remaining failing names are unchanged. One new exact count-feedback case executes.

The three suites reuse actual English bindings. Only four historical Turkish alerts and counted import wording are adapted on the frozen comparison side; note data, error objects, clocks, identities, storage/FileReader/publication operations and save/editor guards remain exact. Zero/singular/plural import and duplicate counts have explicit assertions. A temporary wrong duplicate-count control fails three file tests. No frozen JSON or original assertion calls were removed.

All production source files and dependencies are unchanged relative to stage 51. This is test/documentation work; it does not establish live SDK, multilingual or authenticated Enterprise permission acceptance. See [current baseline](docs/development/test-baseline.md) and [fixture conventions](docs/development/portable-tests.md).

Installer: `apply-field-note-fixture-repair.cjs`, after stage 51. Keep backups and uninstall newer stages first. No restart or dependency reinstall. Next: diagnose the remaining 32 failures individually, starting with coverage-analysis bindings; do not force a green run by discarding tests or blanket-updating snapshots.

<!-- coverage-analysis-fixture-repair-stage53 -->
## Stage 53 — coverage-analysis fixture repair

The reliability suite now compiles runtime snippets as TSX and uses the existing actual English bindings. Its lifecycle guard is identified by analysis-input ownership instead of statement position. All 17 existing cases and assertions remain, with four new cases covering pending-classifier cancellation, late progress/results, newer-run ownership, replaced views and rate-limit cooldown feedback.

Focused result: **25 passed** (21 reliability tests plus four shared-fixture checks). Complete portable run: **2,199 tests, 2,173 pass, 26 fail**, across all 186 files. The six previous coverage-analysis failures are resolved, with no newly failing names. Removing only the post-classification stale-result guard in a temporary copy makes three new late-result tests fail.

All 449 production-source/frozen-fixture files remain unchanged from stage 52; no dependencies changed. The classifier is stubbed: this validates orchestration, not classification accuracy or real server/GPU behavior. No new bundle or live ExB 1.21 acceptance is claimed. See [current baseline](docs/development/test-baseline.md) and [fixture conventions](docs/development/portable-tests.md).

Installer: `apply-coverage-analysis-fixture-repair.cjs`, after stage 52. Keep backups and uninstall newer stages first. No restart or dependency reinstall. Next: diagnose the remaining 26 failures individually, starting with detection-label fixture bindings; retain every suite and behavior assertion.

<!-- detection-label-fixture-repair-stage54 -->
## Stage 54 — detection-label fixture repair

The AI viewer label fixture now explicitly supplies its missing bounds adapter, matching the existing detection-exploration fixture. Bounds are inert in this label-only harness. Controlled timers, pointer hits and viewer events retain all three original cases/15 assertions and add four regressions/22 assertions for panorama visibility, focus/all mode, viewer-removal cleanup and out-of-order hover hits.

Focused result: **20 passed** across AI-label toggle, exploration, map-label and display suites (seven AI-label cases). Full portable run: **2,203 tests, 2,180 pass, 23 fail**, across all 186 files. The three previous AI-label failure reports are resolved, with no newly failing names. Removing visibility forwarding in a temporary copy fails two cases; removing hover ownership checks fails the newer-pointer case.

All 449 production-source/frozen-fixture files remain unchanged from stage 53. No dependencies or production behavior changed. These tests use controlled SDK substitutes and do not establish live pointer/WebGL or ExB 1.21 acceptance. Optional Mapbox style-spec checks were not configured. See [current baseline](docs/development/test-baseline.md) and [fixture conventions](docs/development/portable-tests.md).

Installer: `apply-detection-label-fixture-repair.cjs`, after stage 53. Keep backups and uninstall newer stages first. No restart or dependency reinstall. Next: diagnose the remaining 23 failures individually, starting with the info-panel footer fixture bindings; keep every suite and behavior assertion.

<!-- info-footer-fixture-repair-stage55 -->
## Stage 55 — info-panel footer fixture repair

The footer fixture now explicitly binds `useWidgetLocale` to the shared actual English catalog instead of returning styles for every unknown import. Unknown imports fail clearly and each case restores the original global `window` descriptor. All four original cases/eight assertions remain; two regressions/four assertions check replacement viewport/current height, live reduced-motion preferences and absent matchMedia.

Focused result: **10 passed** (six footer cases plus four English fixture checks). Complete portable run: **2,205 tests, 2,186 pass, 19 fail**, across all 186 files. Four previous footer failure reports resolved, with no newly failing names. Temporary relative-distance and forced-smooth-motion controls fail three and two cases respectively.

All 449 production-source/frozen-fixture files remain unchanged from stage 54. No dependencies or production behavior changed. Controlled component checks do not establish React-provider lifecycle, keyboard/focus, browser layout, screen-reader or live ExB 1.21 acceptance. See [current baseline](docs/development/test-baseline.md) and [fixture conventions](docs/development/portable-tests.md).

Installer: `apply-info-footer-fixture-repair.cjs`, after stage 54. Keep backups and uninstall newer stages first. No restart or dependency reinstall. Next: individually diagnose the remaining 19 failures, starting with native coverage alignment/terrain ownership; distinguish harness failures from production behavior defects and preserve all assertions.

<!-- native-alignment-fixture-repair-stage56 -->
## Stage 56 — native alignment / current terrain contracts

Two warm-playback fixture failures lacked the screen-direction owner now used by `drawCone`; that branch is explicitly recorded. Three legacy cases are migrated: retired DOM-pulse terrain projection/retry assumptions now exercise current `renderedGroundPoint` height/readiness safety, and old polygon-face apex assertions use mesh local vertices/origin and the current perimeter. The bounded DOM retry expectation is retired with its implementation; existing pulse tests independently require SDK draping and zero 3D frames. Mesh topology/reuse stays covered by the existing closed-mesh suite.

Focused result: **39 passed** (24 native-alignment, six pulse, nine mesh cases). Full portable run: **2,207 tests, 2,193 pass, 14 fail**, across all 186 files. Five previous alignment failure reports resolved; no newly failing names. All 43 assertion calls outside the three migrated cases remain exact. Two new cases check flat-ground/reference and invalid/throwing terrain samples. Factory calls are asserted outside contained callbacks. Temporary speculative-flat, lifted-apex and ignored-anchor mutations fail three, one and two cases respectively.

All 449 production-source/frozen-fixture files remain unchanged from stage 55; no dependency or production behavior changes. No new bundle or live SDK terrain/projection, browser/GPU or ExB 1.21 acceptance claimed. See [current baseline](docs/development/test-baseline.md) for the explicit old-to-current assertion mapping and [fixture conventions](docs/development/portable-tests.md).

Installer: `apply-native-alignment-fixture-repair.cjs`, after stage 55. Keep backups and uninstall newer stages first. No restart or dependency reinstall. Next: individually diagnose the remaining 14 failures, starting with Nearby foreground/runtime bindings; preserve request ownership, opt-in behavior and all active-path assertions.

<!-- nearby-foreground-fixture-repair-stage57 -->
## Stage 57 — Nearby foreground fixture repair

The foreground harness now selects only Nearby's four lifecycle statements (visibility declarations, demand assignment and visibility branch) instead of a prefix ending at another feature's guard. The old prefix had begun executing unbound route-generation reconciliation. A count assertion protects the boundary; original statement order remains.

Focused result: **30 passed** across foreground runtime, actual discovery-owner and coverage-anchor suites. All five original runtime cases/15 assertions remain; two regressions and the binding-count check add 17 assertions. New cases cover tab/hidden-widget demand, pointer reset, priority and paused/playback image transitions. Existing real-owner tests retain cancellation, stale-publication and background-slot checks. Temporary eligibility-removal and forced-immediate controls fail three cases each.

Full portable run: **2,209 tests, 2,197 pass, 12 fail**, across all 186 files. Both previous Nearby runtime failure reports resolved; no newly failing names. All 449 production-source/frozen-fixture files remain unchanged from stage 56, with no dependency changes. No new bundle or live SDK/browser/network timing/ExB 1.21 acceptance claimed. See [current baseline](docs/development/test-baseline.md) and [fixture conventions](docs/development/portable-tests.md).

Installer: `apply-nearby-foreground-fixture-repair.cjs`, after stage 56. Keep backups and uninstall newer stages first. No restart or dependency reinstall. Next: diagnose the remaining 12 failures individually, starting with Overture Places/runtime bindings; preserve category, confidence, caching, request ownership and opt-in behavior.

<!-- overture-places-fixture-repair-stage58 -->
## Stage 58 — Overture Places source-identity fixture repair

Five runtime fixtures now bind actual `placesSourceKey` instead of only the former external API URL helper. Both imagery fixtures supply runtime configuration and share one local extracted-method constructor. All 62 existing Overture cases/387 assertions remain exact; two new source-scope/overlapping-search regressions add 17 assertions.

Focused result: **85 passed** across Overture Places, configured runtime and Portal-source suites. New cases verify external/Portal/query-endpoint cache isolation and prevent an old completion from caching, clearing a newer controller or resynchronizing its owner. Temporary fixed-source and cache-write-removal controls fail the relevant assertions; the source-audit test also detects these deliberate edits.

Full portable run: **2,211 tests, 2,204 pass, 7 fail**, across all 186 files. Five previous Overture failures resolved; other failing names unchanged. All 449 production-source/frozen-fixture files remain unchanged from stage 57; no dependencies changed. No new bundle or live SDK/Portal permissions/service-scale/ExB 1.21 acceptance claimed. See [current baseline](docs/development/test-baseline.md) and [fixture conventions](docs/development/portable-tests.md).

Installer: `apply-overture-places-fixture-repair.cjs`, after stage 57. Keep backups and uninstall newer stages first. No restart or dependency reinstall. Next: diagnose the seven remaining failures individually, starting with the Places API fixture; preserve source validation, category/confidence contracts and active behavior assertions.

<!-- places-api-fixture-repair-stage59 -->
## Stage 59 — Places API builder teardown fixture repair

The builder fixture now extracts actual `clearPlacesArea` and its preview/view/revision fields, required by current unmount. All three original API cases/19 assertions remain. A held abort-ignoring response regression adds ten assertions for controller detachment-before-abort, one preview destruction, cleared ownership, repeated unmount and no post-unmount state write. Temporary removal of cancellation or preview cleanup fails this case.

Focused result: **13 passed** across API and area-profile suites (four API and nine area cases). Complete portable run: **2,212 tests, 2,206 pass, 6 fail**, across all 186 files. Previous API builder failure resolved; no newly failing names. All 449 production-source/frozen-fixture files unchanged from stage 58; no dependencies changed. No new bundle, real HTTP/CORS, SDK builder rendering or ExB 1.21 acceptance claimed. See [current baseline](docs/development/test-baseline.md) and [fixture conventions](docs/development/portable-tests.md).

Installer: `apply-places-api-fixture-repair.cjs`, after stage 58. Keep backups and uninstall newer stages first. No restart or dependency reinstall. Next: diagnose the remaining six failures individually, starting with the time-travel suite loading failure; preserve cancellation, stale-result guards and all active-path assertions.

<!-- time-travel-fixture-repair-stage60 -->
## Stage 60 — time-travel dependency fixture repair

The availability loader now follows actual pure-module relative dependencies with cached module records; the background queue shares that loader. Previously `geoUtils` was evaluated without `require`, so its current detection-label/presentation imports prevented all availability cases from registering. No helper is replaced with an empty mock.

All 24 original availability cases/61 assertion calls remain, with one import-boundary assertion added and no new cases. Focused result: **45 passed** (24 availability, five preview, 16 background queue). Temporary stale-apply-guard removal fails nine cases; removing cached-result assignment fails one. Cancellation, retry/coalescing and physical slot retention through JSON settlement remain checked.

Full portable run: **2,235 tests, 2,230 pass, 5 fail**, across all 186 files. The suite-load failure is replaced by 24 passing tests, raising the total by 23. Other five failing names unchanged. All 449 production-source/frozen-fixture files unchanged from stage 59; no dependencies changed. No new bundle or live Mapillary/SDK/browser/network-timing/ExB 1.21 acceptance claimed. See [current baseline](docs/development/test-baseline.md) and [fixture conventions](docs/development/portable-tests.md).

Installer: `apply-time-travel-fixture-repair.cjs`, after stage 59. Keep backups and uninstall newer stages first. No restart or dependency reinstall. Next: diagnose the five remaining failures individually, starting with community-workspace client loading; preserve credential boundaries, cancellation and active-path assertions.

<!-- community-client-fixture-repair-stage61 -->
## Stage 61 — community-workspace client dependency fixture repair

The client fixture now follows its actual pure relative dependency graph, including attachment helpers, with cached module records and a non-relative import rejection. Previously the evaluator omitted `require`, so attachment support prevented all client cases from registering. Transport and clocks remain explicitly injected; no service connection is made.

All 30 existing cases/96 assertions remain unchanged; one import-boundary assertion added, no new cases. Focused result: **30 passed**. Temporary cookie-forwarding and exact-revision-truncation controls each fail an original case. Credential/key/endpoint boundaries, session expiry/disposal, invitations, whitelists and duplicate/revision checks remain active.

Full portable run: **2,264 tests, 2,260 pass, 4 fail**, across all 186 files. The suite-load failure becomes 30 passing existing cases, raising the total by 29. Other four failing names unchanged. All 449 production-source/frozen-fixture files unchanged from stage 60; no dependencies changed. No new bundle, deployed operator permissions, browser attachment persistence or live ExB 1.21 acceptance claimed. Full-run PostgreSQL/RLS suites remain included. See [current baseline](docs/development/test-baseline.md) and [fixture conventions](docs/development/portable-tests.md).

Installer: `apply-community-client-fixture-repair.cjs`, after stage 60. Keep backups and uninstall newer stages first. No restart or dependency reinstall. Next: diagnose the remaining four failures individually, starting with detection-linked preview; preserve opt-in behavior, provenance and credential boundaries.
