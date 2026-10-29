# v6.75 scene callback diagnostic
Requires v6.74; rebuild/restart and refresh. No callbacks suppressed by default.

Camera changes still call drawCone and can reorder the hidden original pulse above a temporary marker. The stationary Turbo callback still enables coverage, resolves the pulse anchor and may request sequence preview. Visibility isolation alone does not stop those paths. This establishes candidate activity, not a cause of flickering.

Select one image, stop playback. Run in order:

```js
window.__mapillaryPulseProbe.isolate()
window.__mapillaryPulseProbe.compare()
window.__mapillaryPulseProbe.pauseSceneWork('both')
window.__mapillaryPulseProbe.clear()
```

Wait briefly, rotate to the angle that triggered flicker, stop moving and observe for 30 seconds. Export report. The pause skips future cone rendering and the stationary Turbo callback, not in-flight tasks, unrelated handlers or all layer reordering. Comparison keeps animating normally. No selection, hit testing or hover decisions changed. Do not use playback/change images during this test; coverage refresh and cone display are intentionally paused. Pause is opt-in and tied to current pulse owner; restore or changing images resets it.

`pauseSceneWork('cone')` or `pauseSceneWork('settled')` can isolate each path later. Skipped counts confirm whether the guards ran. Use `window.__mapillaryPulseProbe.restore()` afterward to remove test marker, restore visibility, resume original animation and re-enable callbacks. No forced coverage/cone refresh runs on restore; next normal camera change triggers it.

This patch is diagnostic, not a fix. Installer --uninstall restores v6.74 exactly. Public SceneView rendering/environment settings belong to the host Experience Builder map; this widget does not create that SceneView. Standalone uses a different basemap/ground setup, which remains another hypothesis.
