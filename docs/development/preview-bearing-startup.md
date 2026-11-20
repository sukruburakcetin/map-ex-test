# Panorama preview bearing startup fix

The hover metadata helper previously preferred the shared live viewer heading for all panoramas. On fresh load that value starts at zero; later viewer events change it. A hovered panorama could therefore point north initially or follow an unrelated opened image. This source-level mechanism was reproduced in controlled runtime tests; the reported browser session was not directly inspected.

The map hover cone now represents the preview capture's computed compass angle, then original compass angle, normalized to 0–360 degrees. Zero remains valid. Without finite metadata, no direction is invented; the existing sector clear behavior removes the decoration. The live viewer cone remains governed by viewer heading. A full panoramic thumbnail has no single field of view, so the hover direction is capture orientation, not a claimed heading-cropped thumbnail.

## Performance and regression evidence

Only bearing selection and its call site changed in production. No network fields, fetches, metadata readiness checks, dwell times, timers, subscriptions, animation loops or viewer initialization changed. Warm cached presentation remains synchronous; cold presentation retains the existing pulse, dwell and one enrichment request. No measured frame-rate improvement is claimed.

Five runtime regression cases failed against stage 69 and pass with the fix. They exercise 2D/3D zooms 3/8, fresh versus changed viewer heading, cold panorama metadata and warm reuse. Five helper cases cover finite zero, computed/original precedence, normalization and missing angles across varied viewer headings. The former tests expecting panorama/viewer coupling were changed specifically to the corrected requirement; unrelated assertions remain. All **2,359 tests across 190 files pass**, none skipped. Strict helper TypeScript, widget/helper syntax and repository hygiene checks pass. No fresh target-host build/browser evidence for this fix; existing ExB 1.21 baseline and stages 66–67 user acceptance remain separate.

## Reversible delivery

Requires stage 69. From widget root:

```sh
node apply-preview-bearing-startup-fix.cjs --dry-run
node apply-preview-bearing-startup-fix.cjs
# Reverse only this fix:
node apply-preview-bearing-startup-fix.cjs --uninstall
```

Preflight rejects unsupported source/tests or missing prerequisite modules before writes. LF/BOM/CRLF are supported; local documentation history is retained. Exact-byte backups are outside the widget. Rollback checks installed and backup hashes and refuses later edits. Reverse this fix before earlier refactor stages. Restart/hard-refresh, hover a panorama at low zoom before opening imagery, revisit after viewer rotation, and compare the stable capture heading. Check the live viewer cone still rotates and missing-bearing previews have no directional cone.
