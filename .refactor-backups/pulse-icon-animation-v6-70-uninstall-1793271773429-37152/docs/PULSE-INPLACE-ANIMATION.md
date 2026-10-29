# Legacy pulse with in-place icon sizing · v6.70

Apply after the v6.69 frozen-marker diagnostic. Restores the original continuously breathing green circle/white outline: 10–14pt over 1200ms, with 3D updates bounded to about 30Hz. The existing IconSymbol3DLayer Accessor's `size` changes directly. The Graphic, symbol and icon objects are retained; the animation performs no symbol cloning or reassignment.

No halo, opacity fading or vertical lift. Current-image anchor recovery and cone sizing remain. Same-image corrections move geometry without restarting phase. Existing 2D pulse, brown hover, next-frame animation, picking/selection and blue highlights are unchanged.

The probe remains available as `window.__mapillaryPulseProbe`. Its report mode is now `3d-inplace-icon-size`. Frequent size notifications are aggregated instead of logged individually:

```js
copy(JSON.stringify(window.__mapillaryPulseProbe.report(), null, 2))
```

`animation.sizeUpdates` counts observed SDK property notifications. `minSize`/`maxSize` describe observed values, normally reaching 10 and 14 after a full cycle. `symbolReplacements` should remain zero during normal same-image animation. These counters are not visual frame measurements and do not prove that SceneView visibly animates. Rare symbol, visibility/removal and LayerView events remain in the bounded history; no per-frame Console logging is added. `clear()` resets both history and animation counters.

## Check both behavior and stability

1. Refresh after installation and open the same image in 3D.
2. Confirm the circle actually breathes. If it stays frozen despite increasing size counters, report that explicitly: the SDK object updates would be reaching the Accessor but not appearing in the renderer.
3. Repeat the recorded stationary/hover/zoom/tilt interactions. Does the green marker still disappear?
4. Export the report above. Zero symbol replacements plus visible breathing without flicker is the desired result; it is not assumed from the object-level tests.

Rollback to the frozen v6.69 diagnostic:

```sh
node apply-pulse-icon-animation-v6-70.cjs --uninstall
```

This remains a browser-verification candidate, not a proven universal flicker fix. Actual ArcGIS object checks verify in-place Accessor updates, identity, notifications and cleanup; target GPU rendering must be observed in the running app.
