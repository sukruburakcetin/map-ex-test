<!-- isolated-build-check-stage47 -->
> Stage 47 update: `tools/check-exb-build.cjs` is now restored. Statements below describing its absence concern the earlier baseline. See [current usage, results and limitations](isolated-build-check.md). The available 1.20 result is not target 1.21 browser validation.

# Routing validation after milestone reconciliation

Baseline: `968375a` (18 November 2026). This guide describes files available in the current checkout, not the full test/build setup reported by the previous milestone.

## Reproducible local checks

Install TypeScript in your development environment, or point `MAPILLARY_TYPESCRIPT` at an existing installation. The test scripts transpile local modules and use controlled SDK/provider substitutes; they do not contact Mapillary or ArcGIS.

Run the focused file list in [the milestone](../../REFACTORING-MILESTONE.md), followed by its strict TypeScript, documentation and repository checks. [Geometry regressions](../../tests/captureRouteGeometry.test.cjs) cover malformed/empty/sparse/nonfinite paths, 2D/3D/multipart coordinate identity, existing graphics preservation, valid purple styling, stale layer loading and final geometry rejection before coverage evaluation. [Solve-history tests](../../tests/captureSolveHistory.test.cjs) characterize winning-solve snapshots. [Generation tests](../../tests/routeGeneration.test.cjs) cover cancellation and stale async work.

These checks do not prove host compatibility or playback performance. The previously reported `finalCaptureSelection.ts`, corresponding test and `tools/check-exb-build.cjs` are absent from the baseline. The baseline also omitted `captureRouteIntegration.test.cjs`; stage 20 now supplies a newly implemented controlled integration suite. Final recovery was inline at that baseline; stage 22 now supplies `finalCaptureSelection.ts` with characterization against that inline block. Do not assume the absent historical build checker exists.

## Target Experience Builder 1.21 checks

Use the actual client's normal build/start workflow and inspect its compiler output. A 1.21 SDK/client is not available in this continuation, so no host build or browser result is claimed.

In the running experience, verify:

1. A route that fits the spare-time budget, a route requiring pruning/retry, and a worse retry that recovers the earlier best solve. The selected opportunities and reported coverage must belong to the displayed route.
2. Cancellation during provider resolution, baseline/final/preflight requests and graphics loading. Starting a newer run, clearing the route, switching views/maps and closing the widget must not allow stale results or camera restoration.
3. Invalid final geometry produces existing failure feedback without publishing malformed coverage or clearing valid route graphics. Valid 2D/3D routes retain styling.
4. Ordinary image opening/playback, detection filtering and appearance, shared-map graphics, mobile layout and RTL presentation. Measure responsiveness in the host; source extraction alone is not evidence of unchanged performance.

Record the client version, provider, scenario and observed result. Confirm local installer state from source/preflight, rather than treating artifact delivery as installation confirmation.

## Controlled integration coverage (stage 20)

[Integration tests](../../tests/captureRouteIntegration.test.cjs) execute the actual widget generation/cancellation methods through a [controlled fixture](../../tests/helpers/captureRouteFixture.cjs). Provider promises, initial adaptive selection, coverage evaluators, rendering and presentation are substituted. Pruning, stop construction/ownership, preflight diagnostics/quality, best-solve history and final summaries use the real modules. No production code changes are needed for this harness.

The suite covers fitting solves, improved/worse/equal retries and matching route/selection/coverage publication; preflight fit, hard-snap rejection and over-budget stop rebuilding; final/preflight provider failures; run invalidation by clear, view/map/config/visibility changes; a late old final response during a newer run; cancellation during drawing; and malformed final geometry. Assertions verify busy-state release, shared run signals, no stale publication and summaries belonging to the winning solve.

Scope remains bounded: SDK rendering and coverage geometry accuracy are not tested here. Real OSRM/ArcGIS requests, login restoration, every replacement/near-budget branch and the complete host lifecycle still require host verification or further focused cases. Existing generation and geometry suites supply complementary startup, drawing-resource and cancellation checks.

Next, review the remaining widget orchestration for one cohesive extraction. Keep provider awaits, ownership checks and UI/graphics writes with the current owner. Use this suite and new prior-output characterization for any moved behavior.
