# v6.74 fresh marker comparison
Requires v6.73. Rebuild/restart and refresh; report mode must be 3d-fresh-comparison-v74.

Select a single image, stop playback, hold camera still. Run `window.__mapillaryPulseProbe.compare()` in Chrome Console. This hides the original pulse and pauses its symbol assignments. A fresh Graphic/GraphicsLayer uses standalone-equivalent public settings: WGS84 XY without source Z, ground draping, green circle/white outline, visible occlusion, cloned symbols at 10–14pt over 1200ms, 32ms update limit. Uses existing SDK factories/autocasting, not a second SDK. No unsupported depth-test property, image attributes or coverage anchor. Terrain/basemap/camera unchanged. May appear at a different position if coverage anchoring had shifted the original. Comparison uses the existing animation scheduler and SceneView, so these are not isolated. It compares a bundle of configuration differences, not one causal variable.

Observe 20 seconds and report smooth/flicker; run `copy(JSON.stringify(window.__mapillaryPulseProbe.report(), null, 2))`. Main current/animation fields describe original hidden pulse; comparison field describes temporary marker and assignments.

Run `window.__mapillaryPulseProbe.restore()` to remove comparison and resume original. Changing images or disposing the pulse cleans it up automatically. You can first isolate other layers, then compare; restore returns all original visibility. Do not isolate after compare (isolate resets comparison). No selection or hover algorithms modified. Diagnostic only, not a production fix.
