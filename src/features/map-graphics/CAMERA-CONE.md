# Camera cone

`CameraConeGraphics.ts` groups the camera-cone layer, terrain-relative render geometry, symbol definitions and retained graphics. The runtime validates user state and resolves the exact coverage anchor, projects it to Web Mercator, ensures the layer, then calls `render`. Selection-layer ordering remains in the runtime because it coordinates two independent owners.

`render` receives a projected centre, WGS84 latitude, heading and spread in degrees, and radius in ground metres. It retains the existing latitude correction, flat 2D sector and low 3D wedge with two sides and ground outline. Geometry updates preserve the main and side graphics rather than allocating replacements on every bearing change. The layer's `relative-to-ground` mode remains unchanged.

`ensure`, `clear` and `dispose` retain their existing responsibilities. Clear removes tagged legacy cone graphics and resets membership while retaining the layer. Disposal retains the host's view-transfer policy. The owner creates no requests, timers or playback callbacks.

Use `tests/cameraConeGraphics.test.cjs` for layer lifetime, geometry, symbols and identity reuse. The lifecycle suite checks the actual runtime adapter, coverage anchors and selection behavior. Validate terrain appearance and selection ordering in both 2D and 3D in Experience Builder after visual changes.
