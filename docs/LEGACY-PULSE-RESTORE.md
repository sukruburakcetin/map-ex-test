# Legacy whole-circle pulse · v6.68

Restores the original continuously breathing green circle with white outline. In 3D the whole symbol changes between size 10 and 14 points on the original 1200ms cycle, with updates bounded to approximately 30Hz. No separate halo, no two-cycle stop and no opacity fading. The 2D path remains the existing DOM pulse.

This is a visual comparison patch, not a claim that the intermittent flicker is fixed. It deliberately restores the legacy animation mechanism so the user can reproduce/compare it. Retains the zero vertical lift and v6.66 current-image anchor recovery; it does not undo v6.65 cone sizing. Brown hover, next-frame animation, selection, blue highlighting and playback are unchanged. No v6.64 scheduling is included.

Supports the exact v6.66 or v6.67 pulse/test sources. The guarded installer records the actual before bytes; uninstall returns to whichever of those versions was present.

After applying and refreshing, compare the same scene with a warm map/imagery cache: stationary, zooming/tilting, and playback. If flicker recurs, distinguish the whole green marker disappearing from normal size change, and note whether the brown/next-frame marker disappears at the same time. A short recording is useful. No diagnostic listeners or logging are introduced by this patch.
