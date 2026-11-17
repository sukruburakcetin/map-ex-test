# Mapillary Explorer — refactoring milestone

Updated: **18 November 2026 (Europe/Istanbul)**. Resume point: **stage 18 complete — best-solve bookkeeping consolidated and installed output verified**.

## Goal and current checkout

Extract bounded feature logic from `src/runtime/widget.tsx` while preserving exploration, request timing, cancellation, shared-map ownership and UI behavior. File organization does not establish a performance improvement; measure in the target host.

- Workspace: `/workspace/map-ex-test-latest`.
- Git baseline: **`b36168d8170ca819d2286908442ec4d3e3207866`**, `updating current acitivities v12`.
- Stages 1–6 are committed in that baseline. Stages 7–18 are accumulated **uncommitted** changes, including new modules, tests and guides. No commit, push or deployment was made during these stages.
- Earlier Image info/label edits were preserved in a Git stash before synchronization. Do not reapply them over their committed equivalents.
- The user's current client path is Experience Builder **1.21**. Installation of every delivered stage on that machine has **not** been confirmed. Compare actual files before continuing; do not infer installation from delivery.

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
| 15 | Final solved-route selection extraction | Best-solve recovery decision and paired opportunity snapshot moved into `finalCaptureSelection`; widget reduced by another 8 lines. | `apply-final-capture-selection-refactor.cjs` |
| 16 | Routing integration verification | Added final/preflight route-method regressions, a shared test fixture and an isolated runtime/settings bundle checker. No production runtime change. | `apply-routing-integration-checks.cjs` |
| 17 | Route geometry safety fix | Validate geometry before clearing/loading route graphics or publishing malformed final results. Intentional behavior fix; valid styling, coordinate references and cancellation are retained. | `apply-route-geometry-safety-v2.cjs` (recommended; v1 also exists) |
| 18 | Best-solve bookkeeping | Route/time/opportunity snapshots consolidated in a run-local `CaptureSolveHistory`; strict ties and copying semantics preserved. | `apply-capture-solve-history.cjs` |

## Installer order and compatibility

Stage 7–18 installers are in `/workspace/shared/downloads/`, outside the repository. Save those artifacts separately when changing environments. Stage 1–6 filenames above are historical references; their changes are already in the Git baseline. Do not reinstall stages already present in the user's source.

For a checkout based on stage 6, follow stages 7–18 in table order. Each installer is incremental; none is a complete release. Stage 16 adds checks/documentation only. Runtime changes require restarting the client and hard-refreshing; no dependency reinstall is needed for these source updates.

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
- [Final selection](src/features/routing/finalCaptureSelection.ts) pairs a selected solved route with its own opportunities. [CaptureSolveHistory](src/features/routing/CaptureSolveHistory.ts) holds route/time/shallow snapshot together **per run**; strictly lower extra time wins, ties retain the first winner and losing solves do not copy selections.

## Intentional fixes, separate from extraction

Stage 5 explicitly sets neutral `centerDistanceWeight = 0`, enforces the existing 12m useful-length/weighted-new-coverage floors and 40-candidate limit, and shares the complete stop-reason type including `anchor-cap`. Do not silently retune these values.

Stage 17 fixes a reproduced exception: drawing an empty array could clear the existing route and then throw. [Geometry validation](src/features/routing/captureRouteGeometry.ts) now rejects empty, short, sparse, mixed or nonfinite paths before SDK layer loading/clearing and before final-route coverage evaluation/publication. Valid coordinates, altitude ordinates, references and purple-line styling remain intact. This was a behavior fix, not merely file extraction.

## Last verified results

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

Use installed TypeScript, or set `MAPILLARY_TYPESCRIPT` to its location. The environment path `/workspace/experience-builder-1.20/client/node_modules/typescript` is not a portable dependency.

```sh
node --test tests/captureSolveHistory.test.cjs tests/captureRouteGeometry.test.cjs tests/captureRouteIntegration.test.cjs tests/finalCaptureSelection.test.cjs tests/adaptiveNetworkRemoval.test.cjs tests/budgetProbeComparison.test.cjs tests/captureNetworkPenalties.test.cjs tests/replacementPairRanking.test.cjs tests/trialPreflightQuality.test.cjs tests/preflightDiagnostics.test.cjs tests/preflightBatchPruning.test.cjs tests/finalSolveBatchPruning.test.cjs tests/adaptiveCaptureSelection.test.cjs tests/routingDefaults.test.cjs tests/captureRouteScoring.test.cjs tests/routeGeneration.test.cjs tests/routingCancellation.test.cjs tests/routePreviewSimulation.test.cjs tests/sequenceV6Runtime.test.cjs tests/detectionLayerController.test.cjs tests/ownedMapResources.test.cjs tests/startupDisposal.test.cjs tests/coverageClickDispatch.test.cjs tests/coverageStartup.test.cjs
npx --no-install tsc --strict --noEmit --target es2020 --lib es2020,dom src/features/routing/CaptureSolveHistory.ts src/features/routing/captureRouteGeometry.ts src/features/routing/finalCaptureSelection.ts src/features/routing/adaptiveNetworkRemoval.ts src/features/routing/budgetProbeComparison.ts src/features/routing/captureNetworkPenalties.ts src/features/routing/replacementPairRanking.ts src/features/routing/trialPreflightQuality.ts src/features/routing/preflightDiagnostics.ts src/features/routing/preflightBatchPruning.ts src/features/routing/finalSolveBatchPruning.ts
node tools/check-docs.cjs
node tools/check-repository.cjs
git diff --check
```

From the widget folder, with documented dependencies installed in the target client:

```sh
node tools/check-exb-build.cjs --client "C:\path\to\experience-builder\client"
```

See [routing validation](docs/development/routing-validation.md) for isolated dependency/output options and build limitations.

## Next session

1. Inspect actual Git state, installed modules and local edits. Preserve untracked modules and backups; do not reset or replay stashes blindly.
2. Confirm whether geometry v2 and solve history were applied on the user's machine. If preflight fails, inspect the specific unsupported code; never bypass protection with a forced overwrite.
3. Prioritize the target **1.21** normal build and browser checks: budget-fit/pruned/recovered routes, cancellation during requests/drawing, view/map changes, coverage/detection controls and ordinary imagery playback.
4. Review remaining orchestration before extracting more small helpers. Keep provider awaits, run checks, UI and graphics ownership with the current owner. Any next extraction needs prior-output characterization and one reviewable installer.
5. Treat adjacent behavior fixes separately: generic OSRM preflight still logs its summary twice; `maxFinalStops` documentation includes endpoints while some intermediate-anchor accounting uses the full limit. Neither was changed by the later extractions.

Suggested resume prompt:

> Read REFACTORING-MILESTONE.md and the routing-validation/solve-history guides. Inspect and preserve actual local changes. Resume after stage 18; verify the user's geometry-v2 and solve-history installation, prioritize Experience Builder 1.21 host checks, and review remaining orchestration before proposing another bounded extraction. Preserve behavior, cancellation and resource ownership; deliver a reversible installer for any code change.
