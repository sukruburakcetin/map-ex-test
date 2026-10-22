# Point-cloud contributor entry points

| Concern | Entry point |
| --- | --- |
| Viewer shaders, GL callbacks, point/color uploads, highlight and lasso flags | `PointCloudViewerRenderer.ts` |
| Map movement watcher and settle timer | `PointCloudAdaptiveDisplay.ts` |
| Acquisition, auto-follow, cropping/calibration intent, map-layer edits and geometry tools | Point-cloud region in `../../runtime/widget.tsx` (remaining extractions) |
| Discovery, cluster cache, decoding, worker and format utilities | `../../utils/pointCloudUtils.ts` |
| Status, corridor, tools, calibration and export controls | Controlled components in this directory |
| Ownership roadmap | [Point-cloud ownership](../../../docs/POINT-CLOUD-OWNERSHIP.md) |

## Viewer renderer

Create one owner per widget. The runtime supplies live appearance readers and the same Mapillary SDK conversion, opaque render pass and pixel ratio used before extraction. The owner has no React dependency, network access, animation loop, resize scheduling or independent cloud cache.

- `attach(viewer, points)` replaces the current registration, retains point order and reports whether registration succeeded.
- `detach()` unregisters from the creating viewer. Mapillary invokes `onRemove`; repeated detach is inert. Cached callback state remains readable until replacement, matching the original runtime lifetime.
- `ready` reports registered/context/reference readiness for the existing subset-update gate.
- `updatePoints`, `updateColors`, `updateLasso` and `setHighlight` preserve their existing buffer operations. Resize intent stays with the caller.
- `getProjection()` borrows the last camera matrices/reference for synchronous lasso projection. Do not mutate these values. SDK render callbacks still make the original two matrix snapshots.
- `selectedIndex` and lasso indices address the filtered viewer array. They are not stable ObjectIDs.

The viewer uses **raw**, unshifted longitude/latitude in degrees and altitude/reference height in metres. Map-only coordinate shifts must not be substituted for these coordinates. Color appearance reads current base altitude, vertical calibration and ground mode at upload time.

Function comments explain ownership, units, index spaces and callback order. Keep those contracts current when modifying the implementation.

## Scope of this extraction

Shader source, coordinate conversion, point order/identity, color thresholds, alpha policy, attribute/depth ordering, GL deletion list and lasso attribute lookup/upload behavior are preserved. Changes to those policies belong in a separate behavior change. In particular, do not infer new lasso shader behavior or expanded buffer deletion from this structural extraction.

Registration now remembers the creating viewer so cleanup can still target it after the runtime viewer reference is replaced or cleared. Runtime retains scene layers, filtered point identity, lasso hit testing, calibration/crop intent, acquisition and follow scheduling. A broader cloud controller is still pending; do not move the whole widget into this renderer owner.

## Verification

From the widget root, using Node 18+ and the TypeScript installation supplied by the existing development/Experience Builder environment:

```sh
node tests/pointCloudViewerRenderer.test.cjs
```

For a compiler installed elsewhere, set `MAPILLARY_TYPESCRIPT` to its `typescript.js` path. No standalone package manifest or dependency install is introduced by this extraction.

The test fixture contains only the uploaded pre-extraction renderer/lasso methods. It is never imported by `src`. Recording GL tests compare the old and new operation streams; update this fixture only as part of an intentional, reviewed behavior change. They cannot establish actual GPU appearance or frame rate.

In Experience Builder check RGB/elevation colors, ground mode, calibration, corridor cropping, lasso selection and map-hover highlights. Then repeat cloud load/clear, replace selected imagery, toggle fullscreen, switch 2D/3D, close/reopen the widget and navigate/play the long sequence. Confirm marker/cone tracking and demand-driven requests remain unchanged. The next bounded extraction is the point-cloud map-layer owner.
