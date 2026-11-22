# Capture-route execution — P01 part 2 / stage 89

`src/features/routing/executeCaptureRoute.ts` owns ordered routing execution: provider/baseline loading, preflight, snap/quality rejection, network/generic pruning, replacement probes, final solving/selection and result/publication sequencing. It reuses the existing preparation and policy helpers. A per-run input contains only endpoints, budget and the existing RouteRun. Its typed host exposes routing-only operations; it does not expose widget state, props, DOM or SDK objects.

Widget retains entry guards, context snapshots, generation ownership, camera refs/timers and localized presentation. Healthy entries return the execution promise directly. Explicit rejected promises preserve the previous async entry's pre-run failure contract; there is no extra outer async wrapper. The execution's operational awaits and run checks keep their order. Provider work stays in one ordered flow rather than adding an await for each extracted probe.

Publication, feedback, error classification, login-restoration timer and finish callbacks retain the existing order. A final camera failure still runs finish before rejecting. Old runs cannot release a newer run's busy state. No new provider, request, cache, timer, guard policy or dependency is introduced. No speed improvement is claimed.

Widget size drops from 11,928 to 11,007 lines (921 fewer). This is not a claim that P01 or the minimal-entry-point goal is finished: the routing-specific coordinator still needs a feature-level readability/probe-decision review and host acceptance. The finite plan records that next work.

## Verification

Existing full-run frozen/current traces remain active, covering direct and OSRM-shaped preflight flows, retries, pruning/replacement, failures, cancellation, signals, geometry and result publication. New tests cover public promise/entry guards, pre-run rejection, camera waits/failures, error-feedback failure, login-timer identity, old/new run ownership, operational await expressions and direct promise forwarding.

Policy tests now read the current feature execution via a shared test-only adapter. It maps narrow host config/log/draw/publication syntax to their existing fixture boundary; it does not substitute algorithms, guards or frozen implementation text. Their assertions remain. Full-run comparisons independently verify the real widget/feature callbacks, avoiding reliance on the adapter alone. Existing calculation/report/cancellation cases are retained.

Validation: 2,987 passing portable tests / 215 files in both workspace and clean installer-produced copy, zero failures or skips. Seventeen new execution cases augment the retained 38 preparation/full-run comparisons and existing policy/integration suites. Strict feature-module TypeScript and the isolated ExB 1.20 module-graph build pass with zero errors/warnings. Ordered-stop/post-draw/finalization mutation checks, 55-case BOM/CRLF comparison and reversible installer checks pass; local plan edits and missing-plan creation are covered. No live provider/browser acceptance is inferred.

Strict feature-module TypeScript and the isolated ExB 1.20 module-graph build pass with zero errors/warnings. These are controlled-provider checks, not live service/browser acceptance. Latest user-supplied ExB 1.21 acceptance still covers stage 86; stages 87–89 acceptance has not been supplied. The existing warning-hook behavior is retained rather than changed during extraction. The single-opportunity over-budget branch calls a Widget `warn` hook that is not explicitly declared in this source; controlled fixtures supply it. Confirm its real-host availability in the remaining P01 review, or address it as a separate deliberate behavior fix rather than silently changing this move.

## Installation and rollback

From the reviewed stage-88 widget root:

```sh
node apply-capture-route-execution-refactor.cjs --dry-run
node apply-capture-route-execution-refactor.cjs
node tools/check-exb-build.cjs --client ../../..
```

Unknown source edits are refused before writing; BOM/CRLF variations are accepted. Local documentation history and unrelated plan text are preserved. A missing plan is populated with the reviewed current content. Keep `.refactor-backups/capture-route-execution-stage89` for exact guarded `--uninstall`; uninstall later stages first. No dependency installation, commit, push or external provider call occurs in the installer/tests.

## Host smoke and next work

With each configured supported provider, check a fitting route, pruning/replacement, no useful targets, error/cancel and changed map/endpoints/config during a solve. Check login camera restoration, progress, geometry, summary and busy-state release. Continue the final P01 feature-level decomposition/review and validation recorded in the plan before P02.
