# Temporary frozen-marker diagnostic · v6.69

Apply after v6.68. This is a diagnostic comparison, not a permanent animation redesign or a flicker fix.

3D keeps the same green circle/white outline, ground placement, occludedVisibility setting and exact tile-anchor recovery, but freezes at the legacy midpoint size of 12pt. No pulse animation frame is scheduled in 3D. 2D animation, brown hover, direction/next-frame animation, cone cap and selection/hover algorithms are unchanged.

An event-driven probe watches the frozen Graphic's symbol/visibility/geometry, its icon size, layer visibility/opacity/destruction, Graphic and map-layer membership, and the SDK LayerView's visible/suspended state when available. One bounded 200-event history is exposed as `window.__mapillaryPulseProbe`; it targets the most recently attached 3D pulse if multiple widgets exist. It records no image IDs, coordinates, access tokens or request URLs. There is no polling, timer or extra animation loop. Watchers are removed when the owner changes or disposes, including late LayerView resolution guards. History remains available after disposal for export.

## Test

1. Install, refresh, and open the same image in 3D. The green circle should be steady. Widget debug mode is not required.
2. Repeat the gestures from the recording: stationary view, hover elsewhere, zoom/tilt, and next-frame interactions. Note whether the green core still disappears.
3. In DevTools Console, choose the app's frame. Filter by `Mapillary pulse probe` if desired (Info messages must be enabled). Confirm `attached-frozen` exists.
4. Optionally mark an observation:

   ```js
   window.__mapillaryPulseProbe.mark('blink observed')
   ```

5. Export the bounded history and send it with your observation/recording:

   ```js
   copy(JSON.stringify(window.__mapillaryPulseProbe.report(), null, 2))
   ```

If the global is undefined, confirm the app frame and that a current image was opened in 3D after the refresh. The probe only attaches to 3D green markers.

## Interpret

- A repeated disappearance of the frozen marker means size animation alone is not sufficient to explain the issue.
- A `symbol-change` or `icon-size-change` is unexpected while this frozen comparison is idle; it identifies external modification.
- `graphic-membership` or `layer-membership` becoming false identifies actual collection removal. `owner-dispose` records intentional pulse cleanup before its watchers are removed; a subsequent attach records recreation.
- Visibility/opacity/LayerView events can explain an application- or SDK-visible suspension. A quiet log while the marker disappears is consistent with an unobserved rendering/occlusion issue, but is not proof of a GPU cause.
- Absence of flicker on one run is not proof the animation caused it. Repeat warmed comparable runs with the legacy patch restored via uninstall.

This diagnostic can itself change timing slightly because it adds observers/logging. Remove it after the comparison:

```sh
node apply-pulse-flicker-probe-v6-69.cjs --uninstall
```

Refresh after installation and rollback. Rollback restores the exact v6.68 files.
