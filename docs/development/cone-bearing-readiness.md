# Current-image cone readiness and panoramic hover indicator

This fix addresses the reported provisional yellow cone and ambiguous cyan panorama wedge. The preceding preview-bearing metadata fix remains intact for perspective previews but its panorama wedge presentation is superseded by a full-circle indicator.

## SDK evidence and implementation

Inspected installed Mapillary JS 4.1.2 source: `viewer/Observer.ts` emits `image` from the state service's current-image frame stream, separately audits bearing events with `auditTime(100)` and suppresses changes smaller than one degree. `render/RenderService.ts` replays the latest rendered-camera bearing, and public `Viewer.getBearing()` reads the first value from that local stream. An event payload alone therefore cannot establish the current image's bearing, and a same-angle image may have no new bearing event. A moveTo promise alone also does not establish which camera frame has rendered.

`CurrentImageBearing` tracks viewer, image ID and a revision. The existing accepted image handler identifies the rendered image; a microtask lets synchronous SDK frame subscribers finish before reading public cached getBearing. Existing bearing notifications resample the current cache instead of trusting their audited payload. Reads are coalesced with at most one pending read and one follow-up per image scope. Duplicate image notifications do not reset readiness or reread. Rejected/non-finite results remain unconfirmed, with later existing events able to retry. Invalidations and viewer/image/revision guards reject stale results.

Selecting a different image immediately invalidates readiness; same-image reselection retains confirmed/pending state, except unresolved regional nearest picks which must not borrow the representative heading. A fallback after the existing image-presentation wait may reuse only the SDK image event's confirmed viewer/image identity and a matching opened-image ID. It introduces no new presentation wait. The old unscoped load-time getBearing query is removed. Delayed audited payloads cannot overwrite the confirmed shared bearing. The central drawCone gate clears the yellow cone while the current viewer/image is unconfirmed, then uses its confirmed value. Shared-link heading, including zero, remains an explicit override only after image confirmation. Actual smooth camera movement may still rotate the cone; it should follow the rendered view, not an invented default.

`HoverBearingSector` shows an orientation-independent cyan SVG circle for panoramas, even with missing compass metadata. It preserves the pulse centre opening, reuses the existing hover anchor/update mechanism, adds no animation/clock and skips orientation/ground projections entirely. Perspective images retain their existing projected wedge and missing-bearing clear behavior. Switching type replaces only the decoration.

## Performance boundaries

No additional network requests, transport fields, timers, event listeners, image-opening awaits or RAF loops. Added CPU work is the small image-scoped state check and bounded one-shot local SDK bearing reads on changed images/existing bearing events. These are not network calls; stale scopes are ignored. The existing cone redraw scheduler coalesces updates; unchanged snapshots do not schedule more redraws. Panorama rings avoid orientation projections. This design keeps imagery opening independent; an absolute zero-cost guarantee or frame-rate claim would require target-host measurement.

## Validation

Thirty-one new owner/runtime cases cover after-frame sampling, finite zero, missing/invalid/rejected values, stale image/viewer work, cancellation, same-angle images without bearing events, coalescing, duplicates, same-image reselection, unresolved regional nearest picks, actual accepted/stale image callbacks, audited stale payloads, the central draw gate and explicit shared heading. Three additional sector cases cover heading-free 2D/3D rings, zero projections, hidden anchors and mode switching; the previous panorama test now checks the corrected ring requirement. Four deliberate owner/gate mutations fail. All **2,416 portable tests in 192 files pass**, zero skipped. The new owner passes strict TypeScript; widget/module syntax and repository hygiene checks pass. No tests/fixtures are excluded or wholesale rewritten.

The SDK event ordering mechanism is supported by source inspection and controlled tests, not a recorded reproduction of the user's browser. This fix still needs an ExB 1.21 build/browser check. Earlier stage-65 isolated build and stages 66–67 user smoke acceptance remain separate. Whole-project types, production packaging and measured device performance remain unverified.

## Reversible installation

Requires stage 70 and the preceding preview-bearing fix. From widget root:

```sh
node apply-cone-readiness-and-panorama-fix.cjs --dry-run
node apply-cone-readiness-and-panorama-fix.cjs
# Reverse only this fix:
node apply-cone-readiness-and-panorama-fix.cjs --uninstall
```

Checks actual source/tests and prerequisite modules before writes, accepts LF/BOM/CRLF, preserves documentation history and exact-byte backups outside the widget, and refuses later edits or corrupted backups during rollback. Reverse newest update first. Restart and hard-refresh. Check fresh low zoom, quick A/B changes, same-image clicks, viewer rotation, missing-metadata panoramas, perspective hovers, 2D/3D, fullscreen, minimize/reopen and shared links. Compare image-open/network behavior in the target host.
