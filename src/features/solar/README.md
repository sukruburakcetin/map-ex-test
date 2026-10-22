# Solar modeling

The runtime coordinates mode changes and computes sun position from image time/location. This folder groups its controlled UI and resource owners.

| Module | Owns |
| --- | --- |
| `SolarToolsSection.tsx` | Switch and active-mode help; no modeling work |
| `SolarMapOverlay.ts` | Map layer, creating view, update revision, beam/shadow geometry and symbols |
| `SolarViewerRenderer.ts` | Viewer renderer registration and existing WebGL callbacks |
| `SolarSceneLighting.ts` | Native lighting snapshot and ShadowCast widget |

UI styles live in `src/styles/solarControls.ts`. Runtime entry points are `toggleSolarMode`, `updateSolarGraphics` and `clearSolarGraphics` in `src/runtime/widget.tsx`.

## Update and cleanup contracts

An update increments the map owner's revision. SDK layer loading retains the original await order. Results must match that revision, enabled/mode state and active view before attachment. Scene lighting applies synchronously; ShadowCast loading remains nonblocking and uses the same live predicate. Its additional widget guard prevents duplicate attachment.

Clearing first invalidates the map revision and releases the layer from its creating view. It then detaches the viewer renderer and restores native lighting/removes ShadowCast on the returned original scene. Preserve this ordering when changing ownership. Viewer replacement resets registration without changing the existing shader or image metadata.

Sun-position calculations, mode conflicts and host-state coordination remain in the runtime. `SolarMapOverlay.renderVectors` groups the five map graphics and their symbols with their layer owner. It retains WGS84 coordinates, a 6 m clearance around the image, a 14–32 m shadow-length clamp and a sun-vector endpoint 24 m from the image. Call `prepare` first, then render after the existing timestamp/horizon and stale-update checks. These owners introduce no additional SDK requests or timers.

## Validation

Focused tests cover each owner's resource contracts. `tests/turboLifecycle.test.cjs` checks runtime integration, including solar off during module loading and cleanup after a view switch. Live Experience Builder checks must cover solar on/off, daylight/night imagery, photo-date changes, 2D/3D switching and lighting restoration. Mocked GL tests do not prove GPU appearance or frame rate.
