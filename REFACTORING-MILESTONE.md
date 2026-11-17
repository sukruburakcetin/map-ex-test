# Mapillary Explorer — refactoring milestone

Saved: 17 November 2026. Resume point: **adaptive corridor selection extracted**.

## Goal and working state

Keep `src/runtime/widget.tsx` healthy by extracting bounded feature logic one step at a time. Preserve the current exploration experience, playback speed, request timing, UI behavior, shared-map resources and cancellation ownership. Refactoring alone does not establish a performance improvement; measure in the Experience Builder host.

This workspace is `/workspace/map-ex-synced`, based on commit `64c71ec`. The stages below are accumulated **uncommitted changes**, including new untracked modules and tests. Preserve them; do not reset to HEAD or assume they are already in the remote repository. The user's local installation status has not been confirmed for every installer. Compare the actual checkout before continuing.

See [architecture](docs/development/architecture.md) for module boundaries.

## Completed stages

| Order | Stage | Main result | Installer |
| --- | --- | --- | --- |
| 1 | Widget lifecycle safety | Startup cancellation, deferred-work disposal, exact ownership of shared-map resources and stylesheet cleanup. | `apply-widget-lifecycle-safety.cjs` |
| 2 | Route generation safety | One active route run, stale-result guards and provider cancellation; older runs cannot overwrite newer UI state. | `apply-route-generation-safety.cjs` |
| 3 | Detection controller extraction | Traffic-sign/object layer creation, replacement, styling and disposal moved into `DetectionLayerController`. | `apply-detection-controller-refactor.cjs` |
| 4 | Pure route scoring extraction | Segment scoring, corridor decisions, stop ownership, diagnostics, target deduplication and summaries moved out of the widget. | `apply-route-scoring-refactor.cjs` |
| 5 | Routing defaults fix | Intentional behavior/configuration fixes: finite priorities, existing thresholds/caps enforced, complete stop-reason type. | `apply-routing-defaults-fix.cjs` |
| 6 | Adaptive corridor extraction | Synchronous corridor build/select loop moved into `adaptiveCaptureSelection`; widget reduced by 100 lines in this stage. | `apply-adaptive-corridor-refactor.cjs` |

Installers are in `/workspace/artifacts` in this environment. Save them separately when leaving this environment. Apply in the order above from the widget root, beside `src`, if those stages are not already installed. They are incremental, not independent full releases.

```bash
node apply-adaptive-corridor-refactor.cjs --dry-run
node apply-adaptive-corridor-refactor.cjs
```

The example assumes all earlier stages are applied. Installers preflight expected file contents, refuse unknown edits, back up changed files outside the widget, support repeated application, and provide `--uninstall` for their own installation. Roll back in reverse order. Restart the Experience Builder client and hard-refresh after applying code changes. No commit or deployment was made in this session.

## Important boundaries

- [OwnedMapResources](src/features/map-graphics/OwnedMapResources.ts) tracks exact owned instances with weak sets; cleanup preserves unrelated, same-ID and borrowed resources.
- [RouteGeneration](src/features/routing/RouteGeneration.ts) and [routing cancellation](src/utils/routingCancellation.ts) guard asynchronous routing work. Preserve checks after awaits and ownership of busy state, graphics and camera restoration.
- [DetectionLayerController](src/features/detections/DetectionLayerController.ts) owns bounded detection-layer records. Widget state, interactions and cross-feature coordination stay in the widget.
- [captureRouteScoring](src/features/routing/captureRouteScoring.ts) contains pure calculations and no React/map/network work.
- [adaptiveCaptureSelection](src/features/routing/adaptiveCaptureSelection.ts) synchronously tries configured corridor widths and returns the final pass. It retains prior calls, diagnostics, expansion boundaries and empty-width failure. Provider calls, toasts, progress and cancellation remain in the widget.

The routing-defaults stage deliberately changed behavior separately from extraction:

- `centerDistanceWeight = 0`: finite scores with no added center-distance preference.
- Existing `minimumUsefulSegmentLengthMeters = 12` also supplies opportunity length and weighted-new-coverage floors.
- Existing `maxOpportunityCandidates = 40` now caps the candidate pool.
- Local selection stop reason uses the shared result type, including `anchor-cap`.

Do not silently retune these values during a subsequent extraction.

## Validation at this milestone

Latest checks passed: 13 adaptive-selection tests; all 12 focused regression test files; strict TypeScript for the extracted routing module and its dependencies; changed TS/TSX syntax checks; documentation links (94 Markdown files, 222 local links, zero broken); `git diff --check`; and eight installer safety checks covering ordinary and BOM/CRLF files, dry-run, apply, idempotence, rollback and unknown-edit preservation.

Adaptive-selection tests compare results, calls, diagnostics and errors against an independent snapshot of the previous widget loop, including a real-optimizer case. See [tests](tests/adaptiveCaptureSelection.test.cjs) and [snapshot](tests/fixtures/adaptiveCaptureSelection.baseline.json).

Full Experience Builder 1.21 build, live ArcGIS/Mapillary behavior, mobile/RTL layout and playback performance were **not validated in this environment**. Previously observed failures in `coverageAnalysisReliability.test.cjs` were also present on the baseline; this focused suite does not establish a clean full repository test run.

With TypeScript installed, rerun:

```bash
node --test tests/adaptiveCaptureSelection.test.cjs tests/routingDefaults.test.cjs tests/captureRouteScoring.test.cjs tests/routeGeneration.test.cjs tests/routingCancellation.test.cjs tests/routePreviewSimulation.test.cjs tests/sequenceV6Runtime.test.cjs tests/detectionLayerController.test.cjs tests/ownedMapResources.test.cjs tests/startupDisposal.test.cjs tests/coverageClickDispatch.test.cjs tests/coverageStartup.test.cjs
npx --no-install tsc --strict --noEmit --target es2020 --lib es2020,dom src/features/routing/adaptiveCaptureSelection.ts
node tools/check-docs.cjs
git diff --check
```

Tests resolve `typescript` locally or through `MAPILLARY_TYPESCRIPT`. In this session it was available at `/tmp/detection-refactor-checks/node_modules/typescript/lib/typescript.js`; that temporary path is not a portable dependency.

## Next session

1. Confirm the actual checkout, installed stages and local edits. Read this file and the architecture document before changing code.
2. Validate the latest installer in Experience Builder: generate routes, exercise corridor expansion and budget/cap stops, cancel/change views during routing, and check ordinary imagery playback and detection controls.
3. Examine the remaining `generateCaptureRoute` logic in `widget.tsx`. A proposed next bounded extraction is the **final-solve batch-pruning calculation**: calibration, least-efficient candidate ranking and removal plan. This is a recommendation, not completed work or a fixed design.
4. Capture previous outputs and edge cases before extraction. Preserve constants, tie ordering, at-least-one-opportunity behavior, A-to-B ordering and diagnostic order. Keep provider solves, run checks and UI writes with the current owner.
5. Deliver one reviewable change with focused tests and a separate incremental installer. Avoid a wholesale route-orchestrator rewrite.

A known adjacent issue remains out of scope: `maxFinalStops` documentation includes endpoints, while some intermediate-anchor accounting uses the full limit. Investigate separately rather than changing it during a behavior-preserving extraction.

Suggested resume prompt:

> Read REFACTORING-MILESTONE.md, inspect the current checkout and preserve all accumulated changes. Continue the widget.tsx refactoring one bounded step at a time. Examine final-solve batch pruning as the next candidate, preserve behavior and cancellation checks, test against the previous implementation, and provide an incremental CJS installer.
