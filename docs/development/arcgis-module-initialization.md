# ArcGIS module initialization (stage 87)

`src/services/arcgis/ArcGISModuleInitialization.ts` owns the widget's lazy initialization promise. Widget supplies a live VectorTileLayer readiness check, the existing Experience Builder loader, module publication and existing debug logging. Construction performs no SDK work.

`ensure()` retains the exact 13 module IDs and publication slots/order. Concurrent callers share one pending loader. Publication precedes logging. A rejected current initialization is cleared so a later call can retry; synchronous loader, publication and logging failures retain their original propagation. Ready modules short-circuit further work.

Successful tasks remain retained. Clearing the module field or returning an incomplete SDK result does not silently add a reset/reload policy. Startup and active-view callers retain their existing post-await lifecycle guards; initialization itself gains no disposal or abort behavior. No global cache, new request, module, dependency or awaited step is introduced. No performance improvement is claimed.

## Verification

The comparison suite runs frozen stage-86 runtime initialization and the actual extracted owner/widget adapter. Controlled loader results cover construction, readiness, ordered IDs/slots, object identity, concurrent calls, rejection/retry, failure boundaries, successful task retention and exact owner-promise forwarding. Existing startup/disposal and coverage-first startup suites remain unchanged.

Validation: 2,932 passing portable tests / 213 files in both the workspace and clean installer-produced copy, zero failures or skips. Sixteen new comparisons cover readiness, module IDs/slots/identity, concurrent initialization, retry/failure boundaries, retained successful tasks and stable owner forwarding; existing startup/lifecycle suites are unchanged. Strict module TypeScript, isolated ExB 1.20 module-graph build (zero errors/warnings), ID/slot/retry mutation checks, BOM/CRLF comparison and reversible installer checks pass. Installer checks cover dry-run, repeat, exact rollback, local documentation preservation, unknown/missing source, later edits, symlinks and corrupt backups.

Strict module TypeScript and the isolated ExB 1.20 module-graph build pass with zero build errors/warnings. The user supplied a successful stage-86 isolated ExB 1.21 build on 21 November 2026 (7,800 ms, zero errors/warnings). Browser acceptance and stage-87 ExB 1.21 validation remain unconfirmed.

## Installation

From the widget root:

```sh
node apply-arcgis-module-initialization-refactor.cjs --dry-run
node apply-arcgis-module-initialization-refactor.cjs
node tools/check-exb-build.cjs --client ../../..
```

Reviewed stage-86 source is required; BOM/CRLF variations are accepted. Unknown source edits are refused before writing and local documentation histories are retained. Keep `.refactor-backups/arcgis-modules-stage87` for rollback. Repeat installation verifies installed files; `--uninstall` restores exact original bytes and protects later edits or corrupted backups. Uninstall newer stages first. No package installation or Git operation occurs.

## Host smoke and next work

Reload the application, open/close the widget during startup and switch active maps while initialization is pending. Check coverage and SDK-dependent tools after loading. Existing caller lifecycle guards should prevent retired views from gaining late layers/listeners. Continue with another bounded widget responsibility.
