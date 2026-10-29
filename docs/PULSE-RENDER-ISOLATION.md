# v6.73 temporary rendering isolation
Requires v6.72. Pulse animation and selection/hover code unchanged.

Install, rebuild/restart, refresh. Confirm report mode 3d-render-isolation-v73.
Select one image, leave playback stopped, keep camera still, and run:

```js
console.table(window.__mapillaryPulseProbe.isolate())
```

This temporarily hides existing top-level operational layers and existing view.graphics, leaving the pulse, basemap and ground intact. It does not remove or destroy them. Group layers appear as a single entry. DOM overlays, basemap layers, and graphics created afterward are not isolated. Do not select other images or interact with hidden coverage during the test.

Observe for 20 seconds and report smooth/flickering. Export:

```js
window.__mapillaryPulseProbe.mark('isolated smooth') // or isolated blink
copy(JSON.stringify(window.__mapillaryPulseProbe.report(), null, 2))
```

Only if isolation is smooth, bring back one originally visible entry using show(index), for example show(0). Entries are additive; repeat isolate() to start each independent comparison. For nested groups this does not isolate their children separately.

```js
window.__mapillaryPulseProbe.show(0)
```

Restore original visibility when done:

```js
window.__mapillaryPulseProbe.restore()
```

Disposing/replacing the pulse also restores it automatically. Changes made by other code to these same visibility flags during isolation can be overwritten by restore; use only for this short stationary test. No identifiers, layer titles, coordinates or URLs are exported. Histories remain bounded; view.updating is now counted and recorded at most every 250ms. This test does not change rendering configuration, animation timing, selection or hover algorithms and is not a production flicker fix.
