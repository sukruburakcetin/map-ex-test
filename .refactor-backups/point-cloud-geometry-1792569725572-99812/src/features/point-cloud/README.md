# Point-cloud contributor entry points

| Concern | Entry point |
| --- | --- |
| Viewer shaders, GL callbacks, point/color uploads, highlight and lasso flags | `PointCloudViewerRenderer.ts` |
| Scene-layer creation/reuse, serialized edits and confirmed ObjectID/index maps | `PointCloudMapLayer.ts` |
| Map movement watcher and settle timer | `PointCloudAdaptiveDisplay.ts` |
| Acquisition, auto-follow, crop/renderer preparation, calibration intent and geometry tools | Point-cloud region in `../../runtime/widget.tsx` (remaining extractions) |
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

Registration now remembers the creating viewer so cleanup can still target it after the runtime viewer reference is replaced or cleared. The scene-layer owner retains confirmed features and ObjectID maps. Runtime retains lasso hit testing, calibration/crop intent and geometry preparation; `PointCloudAcquisition` owns acquisition and follow scheduling. A broader cloud controller is still pending; do not move the whole widget into this renderer owner.

## Verification

From the widget root, using Node 18+ and the TypeScript installation supplied by the existing development/Experience Builder environment:

```sh
node tests/pointCloudViewerRenderer.test.cjs
```

For a compiler installed elsewhere, set `MAPILLARY_TYPESCRIPT` to its `typescript.js` path. No standalone package manifest or dependency install is introduced by this extraction.

The test fixture contains only the uploaded pre-extraction renderer/lasso methods. It is never imported by `src`. Recording GL tests compare the old and new operation streams; update this fixture only as part of an intentional, reviewed behavior change. They cannot establish actual GPU appearance or frame rate.

In Experience Builder check RGB/elevation colors, ground mode, calibration, corridor cropping, lasso selection and map-hover highlights. Then repeat cloud load/clear, replace selected imagery, toggle fullscreen, switch 2D/3D, close/reopen the widget and navigate/play the long sequence. Confirm marker/cone tracking and demand-driven requests remain unchanged. The next bounded extraction is acquisition/follow orchestration.

## Scene-layer owner

`PointCloudMapLayer` owns one layer/result/view identity and its SDK edit queue. Bind the SDK factory, `applyEdits`, live view reader, existing diff policy, yield function and UI notifications once. Runtime prepares geometry and renderer policy before forwarding an update; the owner does not read React state or modify crop policy.

- `beginUpdate()` sets busy state before synchronous feature preparation and returns a generation token.
- `update()` creates/reuses the layer and queues the prepared features for delete/update/add reconciliation. Chunk size remains 5,000; the injected yield preserves the original zero-delay scheduler.
- `layer` and `view` are borrowed for SDK hit testing, adaptive display and original-view cleanup. Do not destroy or replace them outside this owner.
- `objectIds(indices)` resolves filtered viewer indices to confirmed ArcGIS ObjectIDs. `originalIndex + 1` is a logical ID, not an assumed SDK ObjectID.
- `updating` gates map picking while the latest update prepares/edits geometry.
- `pending` is the queue barrier used by acquisition. `clear()` deliberately retains this promise until in-flight SDK work settles.
- `invalidate()` rejects queued generations without replacing layer identity. `clear()` invalidates, removes/destroys the creating view's layer and clears index authority. Adaptive/ring/viewer resources retain separate cleanup.

An SDK edit already in flight cannot be aborted. Same-layer confirmations must still update confirmed state after supersession so the next diff remains correct. A replaced layer/view must reject those confirmations. Latest-generation checks control lasso refresh, busy state, toast and error notifications; keep these two guard roles distinct.

Run the map-owner regression suite from the widget root:

```sh
node tests/pointCloudMapLayer.test.cjs
```

The compiler resolution and Node requirements are the same as for the viewer suite. The fixture is test-only. Tests compare the old runtime renderer with the new adapter/owner, including 12,001 features, partial ObjectID confirmations, failed edits/retry, crop/color changes, clear and 2D/3D view transfer. Real scene rendering, permissions and frame rate still require the Experience Builder checks above.

## Acquisition owner

Start with `PointCloudAcquisition.ts` for load serialization, cancellation/deadlines, delayed follow, activation/failure intent and retained full-result identity. Start with the runtime `acceptPointCloudResult` adapter for calibration, floor/crop preparation and presentation. Cluster discovery, cache, download and decoding remain in their existing utilities/workers. Keep these boundaries separate when contributing.

- `load(automatic, forceDiscovery)` waits for previous acquisition and scene edits; only the latest still-current queued start proceeds.
- `onImage(id)` applies existing browsing/fullscreen/pause rules and the 250 ms follow delay. The timer rechecks live state.
- `cancel(reason)` preserves the distinct clear, cleanup, fullscreen and view-transfer scopes. `cancelFollow()` only removes a scheduled follow.
- `result` borrows the full unfiltered object. `retain()` runs during synchronous validated commit; `releaseResult()` runs at the established teardown point. Do not mutate or mirror this authority in runtime fields.
- `active` is mode intent; `following` indicates a scheduled follow. React retains visibility/loading/paused presentation. `recordIssue()` counts qualifying automatic failures; `resetFailures()` and `stopMode()` keep retry/clear semantics explicit.

Adapters read live state lazily, return transport promises directly and commit synchronously. Adding an extra await around commit can reorder late progress and success notifications. The current 90-second deadline covers acquisition and synchronous commit; it does not cancel non-abortable map edits. See `docs/POINT-CLOUD-OWNERSHIP.md` for guard and teardown details.

```sh
node tests/pointCloudAcquisition.test.cjs
node tests/pointCloudMapLayer.test.cjs
node tests/pointCloudViewerRenderer.test.cjs
```

Use the existing TypeScript installation (or `MAPILLARY_TYPESCRIPT`) as above. Acquisition tests compile the real adapters and compare them with the supplied test-only fixture, using deterministic time and controlled promises. The map test harness now supplies the retained-result accessor through a test adapter; its original baseline and assertions are unchanged. In the host, check manual load/retry, auto-follow across images, pause/resume, browsing without follow, fullscreen, view switch, clear during loading and export/calibration after crop changes.
