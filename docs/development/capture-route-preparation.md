# Capture-route preparation — P01 part 1 / stage 88

`src/features/routing/captureRoutePreparation.ts` owns synchronous baseline geometry/scoring preparation, target/selection checks, reporting and estimated-progress publication. It reuses `selectAdaptiveCaptureOpportunities`, `reportCaptureCorridor` and `reportCaptureSelection`. Widget retains run ownership, authentication/provider creation, baseline solve, camera restoration and all existing await/check locations.

The helper validates/flat-maps baseline geometry, preserves the zero/nonpositive-duration 400 m/min scoring fallback, and passes current targets/config to the existing adaptive selector. It preserves target/corridor/selection early feedback exits, logging order and estimated progress. Returned baseline paths, opportunities and selection remain borrowed; it adds no clone, normalization, provider request or await. UI text/durations remain bound in the widget.

An async extraction would add a completion boundary before later provider work. This synchronous boundary deliberately preserves the existing scheduling. The remaining preflight/pruning/replacement/final-solve loop is still in `generateEsriDetourRoute`; P01 is in progress, not complete. Widget line count drops by 109 (12,037 to 11,928); the route-generation member drops by 121 (1,137 to 1,016). No speed improvement is claimed.

## Verification

The new suite uses a frozen complete stage-87 generation method and the actual refactored method with controlled normalized providers. Twenty-two full-run comparisons record provider call order/count/options/signal reuse, camera restoration, logs, progress, feedback, geometry, coverage and result publication across direct and OSRM-shaped preflight paths. Cases include fitting routes, better/worse retries, hard snaps, over-budget pruning, replacement verification, empty target/selection paths, failures, cancellation during baseline/final/preflight/drawing and superseded runs.

Sixteen local comparisons cover baseline duration/speed, multipart/empty geometry, borrowed identity, feedback exits and report/publication failures. Existing routing integration/cancellation assertions are retained. Method-only harnesses bind the preparation host; the adaptive-selection wiring assertions now inspect the preparation boundary and retain the no-duplicated-optimizer/UI-validation checks.

Validation: 2,970 passing portable tests / 214 files in both the workspace and clean installer-produced copy, zero failures or skips. Thirty-eight new comparisons comprise 22 frozen/current full-run traces and 16 local preparation cases. Existing routing integration/cancellation assertions remain; method-only harnesses and two location-sensitive wiring assertions follow the new boundary. Strict module TypeScript, isolated ExB 1.20 module-graph build (zero errors/warnings), speed/progress/borrowed-identity mutation checks, BOM/CRLF comparison and reversible installer checks pass. Installer checks cover dry-run, repeat, exact rollback, unknown/missing/edited source, local history, targeted plan updates, missing-plan creation, later edits, corrupt backups and symlink refusal.

Strict module TypeScript and the isolated ExB 1.20 module-graph build pass with zero errors/warnings. Controlled providers and trace comparisons are not live service or browser acceptance. The latest user-supplied isolated ExB 1.21 build covers stage 86; stages 87/88 ExB 1.21 build/browser acceptance has not been supplied.

## Installation and rollback

From the widget root:

```sh
node apply-capture-route-preparation-refactor.cjs --dry-run
node apply-capture-route-preparation-refactor.cjs
node tools/check-exb-build.cjs --client ../../..
```

Reviewed stage-87 widget source is required. BOM/CRLF variations are accepted; unknown source edits are refused before writing. Local documentation histories and unrelated plan edits are preserved. If the audit plan is missing, the installer creates its updated reviewed content. Keep `.refactor-backups/capture-route-preparation-stage88` for exact guarded rollback; `--uninstall` protects later edits/corrupt backups and should follow uninstalling newer stages. No package install, commit, push or external service request occurs.

## Host smoke and next work

Run capture routing with each configured supported provider, including routes with no useful targets and routes requiring budget pruning. Cancel/change the map, endpoints or config during solving. Check progress, restored camera, geometry and final summary against the prior behavior. Continue P01 at ordered preflight/pruning/replacement, as recorded in the finite plan; do not start an unrelated tiny helper stage.
