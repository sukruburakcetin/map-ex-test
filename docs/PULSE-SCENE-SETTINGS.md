# v6.77 read-only SceneView settings export
Requires v6.76. Rebuild/restart, hard-refresh. Mode: 3d-scene-settings-v77. Adds sceneSettings() to existing probe, no automatic serialization or map mutation. No animation/selection/hover/render configuration changes.

Restore diagnostic modes first, select one image, rotate to a problematic camera angle, release camera. Run:

```js
window.__mapillaryPulseProbe.restore()
copy(JSON.stringify(window.__mapillaryPulseProbe.sceneSettings(), null, 2))
```

This separate export includes camera and marker coordinates, basemap/ground definitions and service addresses to construct a matched standalone test. URL query strings/fragments/userinfo and credential-like keys are removed. Other JSON metadata including portal item IDs/service hostnames remain; review before sharing. Normal report() remains free of coordinates/URLs. Missing settings are null rather than inferred. Private service URLs/portal IDs do not guarantee anonymous access in the standalone app; no credentials or authentication flows are copied. Operational layers are summarized without service URLs, labels, geometry or attributes.

Known standalone baseline: SDK 5.0.10 selected, public SceneView, qualityProfile high, no basemap, explicit beige ground, optional WorldElevation3D, atmosphere/stars off, green point in WGS84 XY draped on-ground. Host SceneView settings must be observed rather than assumed. Widget solar tool can change scene lighting while active; snapshot captures current environment only. A snapshot does not expose private render state or establish the flicker cause. Next step is building a matched standalone test from the exported settings, not permanently changing production settings.
