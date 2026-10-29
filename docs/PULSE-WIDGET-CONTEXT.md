# Widget pulse context diagnostic (v6.72)

Requires v6.71 installed. No animation, selection, hover, or routing changes.
Records marker geometry reassignment versus position changes (SDK geometry.equals), elevation settings, view transitions, map layer collection changes and graphics collection churn. Other-graphics events aggregate across layers; they do not identify an individual layer or prove causation. Property mutations inside other graphics are not monitored. Counts include every collection event; history for each context event is limited to one per 250 ms and 200 entries overall. No per-frame console logging. Geometry snapshots remain private and are never exported. No coordinates, image identifiers or service URLs are included.

After applying and rebuilding, reproduce with one selected image first. In Chrome Console run:

```js
window.__mapillaryPulseProbe.clear()
```

When a blink occurs, run promptly:

```js
window.__mapillaryPulseProbe.mark('blink')
copy(JSON.stringify(window.__mapillaryPulseProbe.report(), null, 2))
```

Paste the report. Repeat with smooth pulsing for comparison. Image selection legitimately creates new owners; first keep the selected image fixed. The report cannot detect disappearing pixels by itself. This is temporary instrumentation, not a flicker fix. Uninstall with the same installer and --uninstall, then rebuild.
