# Brief outline-only 3D halo · v6.67

Apply after v6.66. Retains v6.66's stable green centre, independent halo layer, zero vertical lift and fly-in anchor recovery.

The 3D halo now has a transparent fill and green outline only. It pulses for two existing 1200ms cycles (2.4 seconds total), then its Graphic/layer are removed and no further animation frame is scheduled. The opaque green/white centre remains unchanged and visible. A same-image anchor correction preserves the settled state; displaying a different image starts a new brief halo. During continuous playback, each newly displayed image uses this same rule; this release does not introduce a playback-specific animation mode.

The existing 2D DOM pulse is unchanged. No picking, hover, blue selection, bearing, cone or anchor-recovery code changes. This patch adds no timers, requests or extra animation loops.

## Verify

- Select an image in 3D: see two outline pulses, then only the steady centre.
- Wait or correct the same image's tile anchor: the halo should not restart.
- Select another image: the brief halo should play again.
- Zoom/tilt after settling: the centre stays ground-aligned; no removed halo should return.
- Toggle fullscreen or switch map modes and check cleanup.

The HTML/GIF preview illustrates the appearance, not actual SceneView rendering. The GIF loops for demonstration; the widget stops after the two cycles for each new image. Check live flickering on the target browser/device.
