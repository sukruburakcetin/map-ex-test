# Solar model workflow (stage 84)

`src/features/solar/updateSolarModel.ts` orchestrates the existing solar update. Widget binds live eligibility/context, localized messages, SDK loading and existing resource owners. `SolarMapOverlay` retains layer/revision/vector ownership; `SolarViewerRenderer` retains viewer rendering; `SolarSceneLighting` retains native lighting and delayed ShadowCast ownership. Astronomy still uses the existing `getSunPosition` helper.

Eligibility, timestamp and horizon checks retain their original order and message durations. The map is captured before lazy layer loading. Cold-layer completion checks the same revision, mode, config and view before creating resources. Warm overlays gain no new guard. Vector rendering precedes viewer rendering; 3D lighting uses the existing live view and revision predicate. Initial guard, SDK, construction and render failures continue to propagate without a new catch.

No day/night filter is introduced. There is no new request, cache, timer, revision policy, resource owner, dependency or awaited step. The host is bound once; no speed improvement is claimed.

## Verification

The comparison suite executes frozen stage-83 widget logic and actual workflow/widget host against controlled SDK loading and recording resource owners. It compares context reads, revision changes, translations, durations, captured-map use, creation/render order, lighting predicates and failure boundaries. Existing astronomy, map/vector, viewer and scene-lighting suites are unchanged.

Validation: 2,840 passing portable tests / 210 files in both the workspace and clean installer-produced copy, zero failures or skips. Forty new comparisons cover eligibility, timestamp/horizon feedback, cold/warm layer paths, captured-map and live-view behavior, lighting predicates, ordering and failure propagation; existing solar suites remain unchanged. Strict module TypeScript, isolated ExB 1.20 module-graph build (zero errors/warnings), revision/horizon/lighting mutation checks, BOM/CRLF comparison and reversible installer checks pass. Installer checks cover dry-run, repeat, exact rollback, local documentation preservation, unknown/missing source, later edits, symlinks and corrupt backups.

Strict module TypeScript and the isolated ExB 1.20 module-graph build pass with zero build errors/warnings. The user supplied a successful stage-83 isolated ExB 1.21 build on 21 November 2026 (7,662 ms, zero errors/warnings). Browser acceptance and stage-84 ExB 1.21 validation remain unconfirmed.

## Installation

Run from the widget root:

```sh
node apply-solar-model-workflow-refactor.cjs --dry-run
node apply-solar-model-workflow-refactor.cjs
node tools/check-exb-build.cjs --client ../../..
```

Reviewed stage-83 source is required; BOM/CRLF variations are accepted. Unknown source edits are refused before writing and local documentation histories are retained. Keep `.refactor-backups/solar-model-stage84` for rollback. Repeat installation verifies installed files; `--uninstall` restores exact original bytes and protects later edits or corrupt backups. Uninstall newer stages first. No dependency installation or Git operation occurs.

## Host smoke and next work

Where solar modeling is enabled, test a daytime capture in 2D/3D, switch images/views or disable solar during cold loading, and check below-horizon/missing-timestamp feedback. Confirm viewer sun, map vectors and restored 3D lighting behave as before. Continue with another bounded widget responsibility.
