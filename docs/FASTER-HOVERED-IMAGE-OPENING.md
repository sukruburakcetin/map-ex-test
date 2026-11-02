# Faster hovered-image opening

A validated individual coverage hover captures the exact image identity before click processing. Previously that click still waited for an unrestricted ArcGIS hit test, and even inactive traffic-sign/object modes called the local detection picker.

`features/coverage/coverageClickDispatch.ts` now bypasses that SDK wait only for a validated individual hover with no shared-note layer, point-cloud layer, active Places mode or legacy detection FeatureLayer. All competing owners retain the original hit test and ordering. Route and annotation interception remains ahead of this decision. Native object/sign modes still execute their local picker when active. Unhovered clicks and regional line previews retain the original SDK path. The captured point's existing view/revision checks remain authoritative.

After the image opens, `prepareDemandSequence` starts its bounded cached-tile preview before awaiting persisted full-route storage. This reuses downloaded bytes; it does not fetch a sequence or start a second local-coordinate worker. Nearby discovery still waits for cache adoption, avoiding requests when a complete route is available. Existing preview guards prevent late provisional work from replacing a complete route or newer selection. Native blue selection remains independent of hover feedback.

Regional frame lookup already shares successful hover/click resolution through CoverageFrameLookup. No second frame-selection policy or speculative image download was added.

## Timing

Existing debug diagnostics at `window.__mapillarySequencePerformance[widgetId].snapshot()` now include:

- `click-dispatch`: click timestamp through viewer navigation dispatch, including priority checks and the state-commit wait. Recorded for explicit click timestamps.
- `viewer-open`: the Mapillary SDK getImage/moveTo promise duration for a current, successful selection. This includes SDK processing, transport, decoding and transitions as represented by that promise; it is not a network-only or GPU-paint measurement.
- `click-image`: existing click-through-browser-paint-gate timing, retained unchanged.

The diagnostics registry is available only with the widget's existing debug mode enabled. All timings use the existing bounded numeric collector; no image IDs, URLs, additional observers or network calls are introduced.

## Validation and limits

110 targeted checks pass: real click callback priority/dispatch tests, delayed-storage scheduling, image-first behavior, real-cache hover regressions, performance lifecycle and native selection/overview retention. Tests verify that an indefinitely pending SDK hit test is never invoked for an unopposed hovered point; notes/cloud/places can still consume a click; active detections precede image opening; obsolete selections cannot commit; pending storage does not delay provisional preview; and local discovery does not duplicate cached-route adoption. Fake-clock tests separate dispatch/SDK/total durations and exclude superseded SDK results.

These controlled tests establish removal of waits, not a measured millisecond improvement in a deployed Experience Builder scene. Actual image load time still depends on Mapillary/browser caching and connection conditions. No full host build or live-host benchmark was available here.

## Install and rollback

Apply after the hover cache contract fix, from the widget root outside `src`:

    node apply-faster-hovered-image-opening.cjs

Rebuild/reload Experience Builder. `--dry-run` checks compatibility without source writes. Tests and the host build do not run inside the installer. The standalone uninstaller restores the previous scheduling and tests while keeping the earlier hover cache crash fix. Edited installation blocks are refused instead of overwritten.
