# Cached legacy pulse experiment · v6.71

Apply after v6.70. Uses the public Graphic.symbol setter to notify SceneView, but reuses a finite set of 17 symbols rather than constructing/cloning one on every animation update. The first symbol is the initial marker; 16 additional symbols are built once per newly displayed image at quarter-point sizes from 10 to 14. The original 1200ms breathing cycle remains, with assignments bounded to roughly 30Hz and skipped when the quantized size is unchanged.

No per-animation symbol cloning. The same Graphic, geometry anchor and layer remain through a cycle; same-image corrections preserve phase and pool. Different images create their own bounded pool. Cleanup cancels the animation and releases its owned graphics/layer as before. No halo, opacity fading or vertical lift is introduced. 2D, anchor recovery, cone sizing, brown/next-frame hover, selection and blue highlights stay unchanged.

This tests whether repeated construction contributes to the interruptions. It still assigns different symbol references to request the supported redraw; that assignment itself could still trigger flicker. Actual animation and stable visibility must be checked in the app.

## Verify

1. Refresh after installation and open the same image in 3D.
2. Confirm the green circle visibly breathes. Repeat the stationary, hover and camera gestures from the recording.
3. Export:

   ```js
   copy(JSON.stringify(window.__mapillaryPulseProbe.report(), null, 2))
   ```

The mode is `3d-cached-symbols`. While active, `animation.poolSize` should be 17 and `unexpectedSymbolAssignments` normally zero. `pooledSymbolAssignments` and `symbolReplacements` increasing is expected here: the change is reuse, not elimination of assignments. Size updates include observed assignment values; they do not measure rendered FPS. Expected cached assignments are aggregated, avoiding per-frame Console messages/history entries. Visibility/removal and unknown-symbol events remain explicit.

Report both visual breathing and whether disappearance persists. A correct report alone does not prove the GPU rendered the animation smoothly.

## Roll back

```sh
node apply-cached-pulse-symbols-v6-71.cjs --uninstall
```

This restores v6.70. To return all the way to the deliberately frozen v6.69 comparison, also uninstall v6.70 afterward:

```sh
node apply-pulse-icon-animation-v6-70.cjs --uninstall
```

Refresh after each installed-state change. Both rollbacks preserve the alignment/cone fixes. No changes to hover algorithms are needed for this experiment.
