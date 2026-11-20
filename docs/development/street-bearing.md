# Street bearing — stage 70

`streetBearing` owns the route geometry algorithm previously embedded in the widget's `getStreetBearing`. The widget retains its method/callers and chooses the matching point-cloud sequence context, otherwise the live route. The extracted helper receives the existing route by reference, image ID and original live-bearing fallback. Its structural point interface accepts both route sources without copying them.

The algorithm retains its original semantics: match IDs by string, search forward for the first point at least 15 metres away, otherwise search backward and calculate its forward direction into the current point. If no sufficiently distant sample exists, use the immediate next neighbour or previous neighbour. Missing/unknown/single-frame routes retain the original live-bearing fallback. No sorting, sampling, caching or GPS policy change is included.

## Evidence and performance

Twenty-three comparisons execute the actual widget forwarding method versus frozen post-preview-fix source. Cases cover jitter, forward/backward preference, short/coincident routes, numeric IDs, fallback values and matching/mismatched/empty point-cloud contexts. A deterministic set of 250 generated routes broadens the comparison. Geometry call traces and input immutability are checked alongside results, ensuring no extra distance/bearing calculations or route mutation. Broken threshold, backward orientation and immediate-neighbour variants each fail.

All **2,382 portable tests across 191 files pass**, zero skipped, in isolated per-file TAP processes at concurrency two with the documented dependency overrides. Strict TypeScript checks the module and its imported dependency graph. Widget/module syntax/transpilation and repository hygiene pass. Existing fixtures/tests are unchanged. No added data requests, timers, subscriptions or route copies; no measured frame-rate improvement is claimed. The panorama preview-bearing startup fix is unchanged.

Stages 66–67 have general user acceptance. Stages 68–69, the preview-bearing fix and stage 70 lack confirmed installation/fresh host acceptance here. The isolated ExB 1.21.0 stage-65 build remains baseline evidence. No host client is installed in this workspace. Whole-project semantic typing and production packaging remain separate.

## Reversible installation

Requires stage 69 and `apply-preview-bearing-startup-fix.cjs`. From widget root:

```sh
node apply-street-bearing-refactor.cjs --dry-run
node apply-street-bearing-refactor.cjs
# Reverse stage 70 only:
node apply-street-bearing-refactor.cjs --uninstall
```

Actual source/prerequisite modules are checked before writes; unexpected edits are preserved. Documentation notes retain local history. LF/BOM/CRLF are supported, and exact original bytes are backed up outside the widget. Rollback verifies installed/backup hashes and refuses later edits; reverse stage 70 before the preview fix and earlier stages. Restart client and hard-refresh. Smoke-check point-cloud corridor/ring direction in route middle/end and during image switching; confirm the panorama preview fix remains stable on fresh load.
