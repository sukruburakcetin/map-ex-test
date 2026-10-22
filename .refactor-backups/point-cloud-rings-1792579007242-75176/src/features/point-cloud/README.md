# Point-cloud contributor entry points

| Concern | Entry point |
| --- | --- |
| Viewer shaders, GL callbacks, point/color uploads, highlight and lasso flags | `PointCloudViewerRenderer.ts` |
| Scene-layer creation/reuse, serialized edits and confirmed ObjectID/index maps | `PointCloudMapLayer.ts` |
| Measurement scene/viewer lifetime and asynchronous layer acquisition | `PointCloudMeasurement.ts` |
| Measurement shaders, ENU uploads and floating-label projection | `MeasurementViewerRenderer.ts` |
| Lasso pointer capture and asynchronous map highlight lifetime | `PointCloudLasso.ts` |
| Lasso raw-point projection, ray casting and viewer-index selection | `lassoProjection.ts` |
| Line-of-sight SDK model, activation, observer/target mutation and teardown | `PointCloudSight.ts` |
| Viewshed observer policy, pending click and original-analysis collection lifetime | `PointCloudViewshed.ts` |
| Map movement watcher and settle timer | `PointCloudAdaptiveDisplay.ts` |
| Acquisition queue, cancellation, auto-follow and retained result | `PointCloudAcquisition.ts` |
| Crop, extent/floor and calibrated plain-feature calculations | `pointCloudGeometry.ts` |
| Renderer policy, calibration intent, picking, UI coordination and remaining geometry tools | Point-cloud region in `../../runtime/widget.tsx` (remaining extractions) |
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

Registration now remembers the creating viewer so cleanup can still target it after the runtime viewer reference is replaced or cleared. The scene-layer owner retains confirmed features and ObjectID maps. `lassoProjection.ts` owns numerical lasso hit testing; runtime retains calibration/crop intent; `pointCloudGeometry.ts` prepares geometry; `PointCloudAcquisition` owns acquisition and follow scheduling. A broader cloud controller is still pending; do not move the whole widget into this renderer owner.

## Verification

From the widget root, using Node 18+ and the TypeScript installation supplied by the existing development/Experience Builder environment:

```sh
node tests/pointCloudViewerRenderer.test.cjs
```

For a compiler installed elsewhere, set `MAPILLARY_TYPESCRIPT` to its `typescript.js` path. No standalone package manifest or dependency install is introduced by this extraction.

The test fixture contains only the uploaded pre-extraction renderer/lasso methods. It is never imported by `src`. Recording GL tests compare the old and new operation streams; update this fixture only as part of an intentional, reviewed behavior change. They cannot establish actual GPU appearance or frame rate.

In Experience Builder check RGB/elevation colors, ground mode, calibration, corridor cropping, lasso selection and map-hover highlights. Then repeat cloud load/clear, replace selected imagery, toggle fullscreen, switch 2D/3D, close/reopen the widget and navigate/play the long sequence. Confirm marker/cone tracking and demand-driven requests remain unchanged. The next bounded extraction is acquisition/follow orchestration.

## Scene-layer owner

`PointCloudMapLayer` owns one layer/result/view identity and its SDK edit queue. Bind the SDK factory, `applyEdits`, live view reader, existing diff policy, yield function and UI notifications once. Runtime calls `pointCloudGeometry.ts` and prepares renderer policy before forwarding an update; the owner does not read React state or modify crop policy.

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

Start with `PointCloudAcquisition.ts` for load serialization, cancellation/deadlines, delayed follow, activation/failure intent and retained full-result identity. Start with `pointCloudGeometry.ts` for floor/crop/feature calculations and the runtime `acceptPointCloudResult` adapter for calibration intent and presentation. Cluster discovery, cache, download and decoding remain in their existing utilities/workers. Keep these boundaries separate when contributing.

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

## Geometry calculations

Use `pointCloudGeometry.ts` for pure numerical preparation shared by initial load, map rendering and crop controls. Keep UI state, SDK constructors/edits and viewer refreshes in their adapters.

- `pointCloudCorridorBasis(bearingDegrees)` captures clockwise-from-north street axes once, at the caller's existing state/callback timing.
- `pointCloudLengthExtent` and `pointCloudWidthExtent` return the established capped, 10-meter-rounded UI extents. Length extent is radial; crop length is a symmetric along-street limit.
- `estimatePointCloudFloor` preserves the existing local sample/fifth-percentile policy without sorting retained points. Empty input retains the previous undefined floor; this module does not correct altitude datums.
- `filterPointCloudCorridor` returns a new array of borrowed point objects in original order. Crop membership uses shifted degrees before calibration, inclusive boundaries and nonpositive unlimited-axis sentinels.
- `preparePointCloudMapGeometry` produces plain typed feature properties and colors in insertion order. It preserves logical versus filtered indices, raw SfM camera distance, calibration units, rounding and RGB behavior. It uses the existing candidate index, without introducing a new cache.

Nudges and dimensions are meters; longitude/latitude are WGS84 degrees. Map z is source altitude minus the estimated floor plus vertical nudge. This is separate from the raw altitude attribute and viewer ENU conversion. Read function comments and `docs/POINT-CLOUD-OWNERSHIP.md` before changing these contracts.

```sh
node tests/pointCloudGeometry.test.cjs
```

Use the same Node/TypeScript setup as the other suites. The fixture contains pre-extraction initial commit, map preparation and size-control methods and is never imported by runtime. Baseline tests compare exact properties and callback ordering, including React-style batched state updates. Existing acquisition and map harnesses now bind the real geometry module; their original fixtures/assertions remain unchanged.

## Measurement tool

Start with `PointCloudMeasurement.ts` for the measurement layer, owning map/view, pending SDK module task, redraw generations and disposal. `MeasurementViewerRenderer.ts` owns the transparent viewer renderer, original viewer, GL callbacks and label projection. The runtime factory binds typed ArcGIS/Mapillary/DOM adapters; runtime state retains picked points, toggle/clear intent, point-cloud picking and exclusion with other tools.

`MeasurementPoint` documents two coordinate spaces: map longitude/latitude in shifted WGS84 degrees and relative map z in meters, versus raw SfM longitude/latitude and source altitude in meters (datum unverified). Scene anchors/line/text use map coordinates; distance and slope use raw coordinates/altitude, as before. Neither owner changes calibration or copies the point cloud.

- `updateMap()` redraws synchronously once a live layer exists. Initial SDK loading is shared and only the newest waiting redraw commits. Captured view/map/generation checks reject stale work. Current load/attachment failures warn locally and allow retry.
- `syncViewer()` keeps existing add/update/remove and redraw behavior. Viewer replacement removes the old registration before adding the new one.
- `onViewChange(nextView)` releases the original map's layer and invalidates pending creation. Runtime restores active measurement after the new view is ready.
- `detachViewer()` releases registration before viewer destruction without resizing a dying viewer. Fullscreen keeps the scene overlay.
- `dispose()` invalidates pending work, removes/destroys the original scene layer, detaches the original viewer and hides the label. It is reusable/idempotent. Empty clear callbacks do not create a new invisible layer during teardown.

Shader bytes, pass 3, point colors/sizes, dynamic-buffer uploads, line/point ordering, GL state restoration/deletion, metric text rounding and CSS label projection are preserved in baseline comparisons. Intentional lifecycle corrections are limited to resource ownership: original-viewer/map cleanup, stale-load rejection, shared layer loading, restoration after replacement, contained SDK failures and avoiding empty-layer recreation after disposal. Picking, tool toggles and UI layouts are unchanged.

```sh
node tests/pointCloudMeasurement.test.cjs
```

Use the same Node/TypeScript setup as the other suites. The immutable test-only fixture contains the original scene/viewer methods. Tests compare exact graphics, metric labels, shaders, ENU arguments and GL operations, plus replacement/disposal races. In Experience Builder check first/second/third picks, clear/retry, vertical measurements, label visibility while panning the panorama, fullscreen, 2D/3D switching, cloud clear and widget close/reopen. Recording tests do not establish actual GPU appearance or frame rate.

## Lasso feature

`PointCloudLasso.ts` owns the active SVG pointer/capture and one asynchronous ArcGIS highlight handle. It owns no polygon, selection, point buffer or React state. Runtime adapters keep polygon/selected-ID state, viewer feedback, confirmed-ID resolution, tool toggles and tool exclusion. `lassoProjection.ts` is the pure numerical entry point.

- `start`, `move`, `end` use SVG-local CSS pixels. Pointer capture is released before completion. The active pointer ID/target prevents unrelated pointers and duplicate ends from appending/completing a gesture. Touch does not depend on the browser's `buttons` value.
- `cancelGesture()` releases capture without completing selection. Runtime forwards SVG pointer cancellation and cancels before viewer removal.
- `highlight()` waits for a layer view while preserving current feedback, then applies current confirmed SDK ObjectIDs. Request revision, view/layer/map identity and destroyed checks reject stale callbacks. The runtime target adapter requires the layer's owning view to match the live view.
- `clear()` invalidates pending highlights, cancels capture and removes the current handle. Cloud/widget teardown and view changes call it; repeated clear is safe. Normal clear still resets React state and viewer flags through the existing runtime adapter.

`selectLassoIndices` borrows raw WGS84 degrees/source altitude, last-rendered matrices/reference, polygon and canvas CSS dimensions. It preserves ENU conversion, matrix multiplication, perspective divide, behind-camera rejection, 1.2 NDC padding and ray casting. It returns indices in the filtered viewer buffer, in source order. These are not logical IDs or SDK ObjectIDs: `pointCloudObjectIds` continues to resolve confirmed IDs through `PointCloudMapLayer`.

The renderer test now verifies the moved mathematical core token-for-token against its original fixture and still checks the unchanged selection commit. No GL lasso shader/buffer behavior changes in this extraction. Intentional corrections are limited to capture cleanup/cancellation, unrelated-pointer isolation, stale async highlight rejection and cleanup from the original handle.

```sh
node tests/pointCloudLasso.test.cjs
```

Use the existing Node/TypeScript setup. Tests compare real old/new runtime adapters for projection, polygon input, sparse IDs, feedback order and batched updates; held layer-view promises cover stale results and cleanup. In Experience Builder test mouse/touch drawing, clear during drawing, cancel gestures, repeated selection, crop/calibration, view switches, fullscreen, cloud clear and widget close/reopen. Recording tests do not establish browser/GPU performance or touch behavior on physical devices.

## Line-of-sight tool

`PointCloudSight.ts` owns the SDK `LineOfSightViewModel`, its creating view/map and pending constructor-module task. Runtime retains `isSightMode`, typed ArcGIS observer/target points, point-cloud picking, tool exclusion, toasts and state callbacks. The SDK continues to calculate visibility; this feature introduces no visibility formula, coordinate conversion or height adjustment.

- `activate()` loads constructors lazily, shares current-view activation and checks enabled 3D view/map/revision before invoking the factory. Clear, disable, disposal and replacement prevent late construction. Current module/constructor errors warn locally and allow retry.
- `ready` gates picking on a model belonging to the current enabled SceneView and map. `place(point)` preserves state-before-SDK observer/target order and borrows the exact picked ArcGIS point, including z/spatial reference.
- `clear()` cancels pending construction and clears analysis results while retaining a reusable current model. React observer/target reset remains in the runtime adapter.
- `onViewChange(nextView)` disposes a model or pending activation belonging to another view/map. After host readiness, active 3D intent may activate a new model and restore existing samples through SDK setters only; this does not append duplicate React targets.
- `dispose()` drops authority and invalidates pending work before attempting both SDK clear and destroy. It is reusable/idempotent and keeps one failing cleanup operation from skipping the other.

The SDK factory validates SceneView usage at the owner boundary. Its target adapter preserves the existing collection autocast from `LineOfSightTargetProperties`; it does not replace the collection or introduce a separate target constructor/module request. Points remain shifted map geometry in the same spatial reference/height policy as the picked point cloud; raw SfM measurement/lasso calculations are unrelated.

Intentional lifecycle corrections are stale-load rejection, shared activation, 3D-only creation, original-model destruction, current-view pick validation, replacement restoration and contained current SDK errors. Normal toasts, observer/target state order, clear/reuse and tool-exclusion behavior are compared against the pre-extraction code. No tool layout or viewshed analysis policy changes are included.

```sh
node tests/pointCloudSight.test.cjs
```

Use the existing Node/TypeScript setup. Tests execute actual runtime toggles, the actual sight-hit branch and the typed factory with recording SDK models. The immutable fixture is test-only. In Experience Builder check observer placement, multiple targets, clear, toggle off/on, switching other cloud tools, 2D/3D and repeated widget close/reopen. Also clear/disable during loading and verify actual SDK visibility results; recordings cannot establish terrain/scene rendering or browser performance.

## Viewshed tool

`PointCloudViewshed.ts` owns pending observer-click revision, SDK analysis and its creating view/map/analysis collection. Runtime retains mode, point-cloud picking, tool exclusion and toasts, and binds the existing SDK constructor modules through a lazy typed factory. The SDK still calculates visibility.

`pointCloudViewshedSpecification(point)` documents the unchanged policy: shifted longitude/latitude, picked map z plus 1.5 meters, WGS84 4326, 150-meter far distance, 360-degree horizontal field, 90-degree vertical field, heading 0 and tilt 0. This preserves the existing map height frame; it is not a new absolute/source-altitude conversion.

- `place(point)` clears prior results immediately, then loads constructors. Only the newest enabled 3D view/map/analysis-collection context may construct and attach. Replaced or cleared requests cannot construct stale analyses; SDK constructor-side context changes are checked again before attachment.
- `clear()` invalidates pending creation first, removes the current analysis from its original collection and destroys it. Repeated clear is safe without a current host view. Failed removal does not skip destruction.
- `onViewChange(nextView)` clears attached or pending analysis before a different view/map/collection becomes current. Tool mode remains a runtime concern; selecting an observer on the new view starts a new analysis.

Normal module paths, constructor properties, observer geometry read timing, replacement-before-load and tool state/toasts are preserved in baseline comparisons. Intentional lifetime corrections are newest-click guards, original-collection cleanup, SDK destruction, SceneView-only construction and contained current errors with silent stale failures. Existing conditional tool-exclusion rules are unchanged, including the measurement toggle's current sight-mode condition; this extraction does not redesign those rules.

```sh
node tests/pointCloudViewshed.test.cjs
```

Use the existing Node/TypeScript setup. Tests execute the actual observer-hit branch and typed SDK factory, compare construction policy with the immutable baseline, and assert destruction separately as an intentional correction. Held module loads test newest-click behavior, clear/off/replacement, failures and retry. In Experience Builder check observer placement, repeated clicks, clear/toggle, other tools, 2D/3D and widget close/reopen with actual visibility results. Recorded SDK calls do not establish real scene/terrain occlusion or browser performance.
