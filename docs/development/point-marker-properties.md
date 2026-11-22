# Point marker properties (stage 81)

`src/features/map-graphics/pointMarkerProperties.ts` contains pure property factories for the existing clicked-location marker and legacy sequence point. `widget.tsx` retains ArcGIS Graphic construction, view/module/Turbo guards, marker tags, deduplication, deferred batching, map ownership and stored references.

`legacySequencePointProperties` preserves WGS84 geometry, the 7 px marker, yellow outline, 3D icon/depth/offset settings and optional sequence/image attributes. `clickedLocationPointProperties` preserves the black 5 px marker, white outline and clicked-location attribute. They intentionally retain the supplied color object and allocate fresh geometry, symbols, offsets, symbol layers and attributes on every call. Bounds validation or color normalization is not added.

Route-point graphics remain separate: their size, callout and placement rules differ. Native Turbo coverage still returns before legacy Graphic construction. There is no new request, layer, timer, cache, dependency or render loop. Function-call overhead is unmeasured; no performance improvement is claimed.

## Verification

The comparison suite executes frozen stage-80 marker methods and actual widget methods using recording Graphic/map factories. It compares complete property graphs and allocation/attachment traces across 2D/3D styles, unusual coordinates, empty IDs, repeated IDs, deferred batching, missing context, Turbo suppression and failures. Separate checks cover borrowed color identity and fresh nested objects. Existing native-sequence tests remain unchanged.

Validation: 2,743 passing portable tests / 207 files in both the workspace and clean installer-produced copy, zero failures or skips. Thirty-two new cases compare frozen marker methods against actual runtime/property construction, including ownership traces and color/fresh-object identity. Existing native-sequence assertions remain unchanged. Strict module TypeScript, isolated ExB 1.20 module-graph build (zero errors/warnings), mutation checks for 3D offset/attributes/marker size, BOM/CRLF comparison and reversible installer checks pass. Installer checks cover dry-run, repeat, exact rollback, documentation preservation, unknown/missing source, later edits, symlinks and corrupt backups.

Strict extracted-module TypeScript and the isolated ExB 1.20 module-graph build pass with zero build errors/warnings. The user supplied a successful stage-80 isolated ExB 1.21 build on 21 November 2026 (8,067 ms, zero errors/warnings). Browser acceptance and stage-81 ExB 1.21 validation are not inferred from that result.

## Installation

Run from the widget root:

```sh
node apply-point-marker-properties-refactor.cjs --dry-run
node apply-point-marker-properties-refactor.cjs
node tools/check-exb-build.cjs --client ../../..
```

Reviewed stage-80 source is required; BOM/CRLF variations are accepted. Unknown source edits are refused before writing, and local documentation history is retained. Keep `.refactor-backups/point-marker-stage81` for rollback. Repeat installation verifies the installed files. `--uninstall` restores exact original bytes and protects later edits or corrupt backups; uninstall newer stages first. No package installation or Git operation occurs.

## Host smoke and next work

Check clicked-location markers and replacement. Where legacy coverage is enabled, inspect sequence points and repeated selection in 2D/3D. Confirm Turbo still uses native coverage without duplicate sequence graphics. Then continue with another bounded widget responsibility.
