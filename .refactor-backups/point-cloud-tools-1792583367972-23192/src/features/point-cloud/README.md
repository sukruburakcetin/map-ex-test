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
| Distance-ring layer/readiness, ellipse geometry and labels | `PointCloudRings.ts` |
| Map RGB/elevation renderer, layer schema and popup policy | `pointCloudMapPolicy.ts` |
| Map movement watcher and settle timer | `PointCloudAdaptiveDisplay.ts` |
| Acquisition queue, cancellation, auto-follow and retained result | `PointCloudAcquisition.ts` |
| Crop, extent/floor and calibrated plain-feature calculations | `pointCloudGeometry.ts` |
| Activation intent, clear ordering and tool deactivation | `PointCloudLifecycle.ts` |
| Accepted result application, calibration retention and initial subset/update order | `PointCloudResultApplication.ts` |
| Loaded/progress toast wording, JSX, duration and ownership | `PointCloudResultFeedback.tsx` |
| Crop length/width clamping and map/ring/viewer subset coordination | `PointCloudCrop.ts` |
| Export single-flight flow, captured/live inputs and browser downloads | `PointCloudExport.ts` |
| Export toast wording, visual feedback and durations | `PointCloudExportFeedback.tsx` |
| Calibration keyboard/joystick math and ordered commit callbacks | `PointCloudCalibration.ts` |
| Picking, UI coordination and remaining feature adapters | Point-cloud region in `../../runtime/widget.tsx` (remaining extractions) |
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

Registration now remembers the creating viewer so cleanup can still target it after the runtime viewer reference is replaced or cleared. The scene-layer owner retains confirmed features and ObjectID maps. `lassoProjection.ts` owns numerical lasso hit testing; `PointCloudCalibration.ts`/`PointCloudCrop.ts` coordinate calibration/crop intent; `pointCloudGeometry.ts` prepares geometry; `PointCloudAcquisition` owns acquisition and follow scheduling. Keep accepted-result application, activation/clear coordination and independent resource owners separate; do not move the whole widget into this renderer owner.

## Verification

From the widget root, using Node 18+ and the TypeScript installation supplied by the existing development/Experience Builder environment:

```sh
node tests/pointCloudViewerRenderer.test.cjs
```

For a compiler installed elsewhere, set `MAPILLARY_TYPESCRIPT` to its `typescript.js` path. No standalone package manifest or dependency install is introduced by this extraction.

The test fixture contains only the uploaded pre-extraction renderer/lasso methods. It is never imported by `src`. Recording GL tests compare the old and new operation streams; update this fixture only as part of an intentional, reviewed behavior change. They cannot establish actual GPU appearance or frame rate.

In Experience Builder check RGB/elevation colors, ground mode, calibration, corridor cropping, lasso selection and map-hover highlights. Then repeat cloud load/clear, replace selected imagery, toggle fullscreen, switch 2D/3D, close/reopen the widget and navigate/play the long sequence. Confirm marker/cone tracking and demand-driven requests remain unchanged. The next bounded extraction is acquisition/follow orchestration.

## Scene-layer owner

`PointCloudMapLayer` owns one layer/result/view identity and its SDK edit queue. Bind the SDK factory, `applyEdits`, live view reader, existing diff policy, yield function and UI notifications once. Runtime calls `pointCloudGeometry.ts` and `pointCloudMapPolicy.ts` before forwarding an update; the owner does not read React state or modify crop policy.

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

Start with `PointCloudAcquisition.ts` for load serialization, cancellation/deadlines, delayed follow, activation/failure intent and retained full-result identity. Start with `pointCloudGeometry.ts` for floor/crop/feature calculations and `PointCloudResultApplication.ts`/`PointCloudResultFeedback.tsx` for accepted-result orchestration and presentation. Cluster discovery, cache, download and decoding remain in their existing utilities/workers. Keep these boundaries separate when contributing.

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

Use `pointCloudGeometry.ts` for pure numerical preparation shared by initial load, map rendering and crop controls. Keep UI state, SDK constructors/edits and viewer refreshes in their adapters; map display metadata belongs to `pointCloudMapPolicy.ts`.

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

## Distance rings / grid

`PointCloudRings.ts` owns the GraphicsLayer, creating view/map, shared SDK readiness task, load revision and latest-draw revision. It also contains the existing ellipse/label drawing policy so contributors can find the whole distance-ring behavior in one feature. Runtime retains radius/dimension/calibration intent and forwards the existing draw calls.

- `draw(radiusMeters)` keeps the caller's captured half-length and reads live geometry after asynchronous readiness. Same-context first draws share loading; only the newest draw commits. Existing-layer redraw remains asynchronous so duplicate caller draws coalesce.
- `onViewChange(nextView)` invalidates/releases attached or pending resources belonging to another view/map. The normal map/cloud restoration paths retain their existing drawing calls.
- `clear()` invalidates pending work before removing from the original map and destroying the layer. Repeated clear is safe. Widget teardown clears even pending creation; ring cleanup no longer guesses its map from the point-cloud feature layer.

`RingGeometryInput` documents shifted WGS84 degrees, east/north meter nudges, meter half-width and actual-extent fallbacks. The original 111320 meters/degree and latitude-cosine conversions remain unchanged. Rings stay at z=0 on the relative-to-ground layer with 0.5 m offset. Bearing is read at the same point once per radius. Nice steps, 3-degree sampling, ellipse caps, boundary color priority, closure, label extrema/thresholds and emitted graphic order are unchanged.

Intentional lifetime corrections are captured-map cleanup, view/map/result/SDK guards around loading, newest-request rejection, pending-task identity checks, destruction after partial attachment and contained retryable SDK/draw failures. No point-cloud traversal/copy, timer, watcher or new animation loop is added. The existing clear order in the runtime is preserved.

```sh
node tests/pointCloudRings.test.cjs
```

Use the existing Node/TypeScript setup. Tests compare exact old/new layer properties, graphic/vertex/label values, bearing reads, readiness/coalescing and live-state read timing. Held module loads cover clear, context replacement, failures/retry and cleanup. The map test uses a test-only bridge for its original ring fixture; its original teardown assertions remain intact, while the ring suite exercises the real owner. In Experience Builder check initial cloud load, crop controls, calibration, long/narrow/full dimensions, repeated clear/load, map switches and widget close/reopen. Recordings cannot establish actual terrain placement or browser frame rate.

## Map display policy

`pointCloudMapPolicy.ts` is the contributor entry point for the point-cloud map renderer, empty-source layer schema and popup content. It produces plain typed properties without creating SDK resources, reading React state, loading modules or editing geometry. `PointCloudMapLayer` retains resource identity, visibility carryover, ID authority and its edit queue; runtime retains the existing preparation/callback order.

- `pointCloudMapRenderer(colorMode, colors)` returns fresh RGB unique-value or elevation color-variable properties. Only `elevation` selects the existing relative-height stops; all other values retain the RGB fallback. Colors retain supplied order. Point symbols, sizes, outlines and thresholds are unchanged.
- `pointCloudMapLayerProperties(renderer, definitionExpression, previousVisible)` returns fresh schema/popup/source metadata only when the owner needs a new layer. False visibility is preserved; nullish visibility defaults to true. Renderer identity is borrowed, not cloned.

Fresh mutable nested objects preserve SDK autocasting without sharing metadata between layers. Field names/types/aliases, ObjectID casing, popup whitespace/text/placeholders, legend policy, WGS84 and relative-ground height settings remain exact. Existing altitude labels are retained; this structural extraction does not change source datums or convert heights. Geometry quantization, adaptive sampling/ground expressions and SDK edits remain separate responsibilities.

```sh
node tests/pointCloudMapPolicy.test.cjs
node tests/pointCloudMapLayer.test.cjs
node tests/pointCloudGeometry.test.cjs
```

Use the same Node/TypeScript setup. The new immutable fixture contains the original renderer block and layer-property expression. Tests compare exact properties and popup bytes, visibility/mode fallback and fresh-object isolation. Existing map/geometry tests now bind the real policy module; their original fixtures and assertions remain intact. Strict SDK checks assign outputs to the actual simple/unique-value renderer and FeatureLayer property types. In Experience Builder check RGB/elevation, ground filtering, popup fields, hidden-layer reuse/replacement, crop/calibration and clear/load/view switching. No live GPU or performance claim follows from property recordings.

## Calibration coordination

`PointCloudCalibration.ts` handles accepted movement input and the commit sequence. The runtime guards cloud visibility/result readiness and input/textarea targets, displays existing toasts, and keeps the color/ground shortcuts and panel state. Callback comments document meter units, camera-relative directions and feedback timing.

- `keyDown` updates live east/north/up offsets; T/G, F/H and R/V retain their 0.2 m or Shift 1 m steps. Key repeat does not redraw the map.
- `keyUp` schedules the widget-owned trailing 150 ms debounce for movement keys only.
- `joystick` uses the current UI step and viewer bearing; feedback runs synchronously before scheduling.
- `reset` clears all three offsets, shows feedback and immediately rebuilds the map. It retains the existing pending-debounce behavior.
- `commit` rebuilds the map, explicitly refreshes rings, then updates viewer colors and resizes when available. The map rebuild's own ring request remains intentional.

Offsets remain widget-authoritative because geometry, exports, rings and viewer appearance read them live. The coordinator owns no state snapshots, event listeners, network work, SDK resources or timers. Keep the existing `clearPointCloud` debounce cancellation and keyboard listener removal in runtime teardown. Acquisition still resets offsets only when the existing same-cluster preservation rule requires it.

`tests/pointCloudCalibration.test.cjs` compares actual runtime adapters with the immutable pre-extraction handlers, including exact offsets, toast elements, event prevention, 150 ms scheduling, release coalescing, reset and callback order. Run with `MAPILLARY_TYPESCRIPT` pointing to the host TypeScript module if it is not on the module path. Host checks: keyboard/Shift/typing, joystick steps, reset, RGB/elevation and ground shortcuts, and clear during a pending nudge.

## Export orchestration

`PointCloudExport.ts` owns the per-widget busy flag and CSV/PLY/LAS flow. `PointCloudExportFeedback.tsx` keeps the exact preparation/success/failure feedback together. Runtime supplies current-cloud/calibration readers, real writers, loading state and feedback adapters.

- `download` checks availability before the busy guard. It exports every point in the retained result, independently of crop, display subsets, lasso and ground filtering. Point arrays are borrowed, never cloned.
- The accepted result and vertical offset are captured after enabling loading state. Horizontal offsets and camera latitude are read after preparation feedback, before invoking a writer. Offsets are meters and latitude is degrees; the writer owns coordinate encoding and height policy.
- The source image ID remains authoritative for filenames. A missing source ID falls back to the then-current UI image ID at the original post-write anchor boundary.
- CSV constructs its existing MIME Blob, uses anchor attributes/body removal, and revokes the URL immediately. PLY/LAS use their writer-produced Blob, anchor properties/removal, and the original 1000 ms URL grace period.
- Accepted work completes even after cloud replacement or closure. Disposal suppresses the final loading-state update only. No new cancellation, background worker, retained point copy or download policy is introduced.
- Binary errors keep their format-specific toast. CSV browser-download errors are logged/toasted; CSV writer errors propagate through the original `finally`. The busy flag is released in the same scope.

Format math, output precision, RGB handling and yielding remain in `csvExport.ts` and `../../utils/pointCloudUtils.ts`. Existing writer tokens are unchanged. To modify feedback, start with the feedback file; to modify LAS/PLY coordinates, start with their writers rather than this coordinator.

`tests/pointCloudExport.test.cjs` compares actual runtime adapters against the frozen original handler with recording browser APIs and held writers. It covers default/all formats, point identity, guard/busy order, capture timing, live filename fallback, replacement/closure/disposal, retries, writer/browser failures and exact feedback/download/URL timing. Host smoke checks: download and open CSV/PLY/LAS, verify calibrated coordinates/filenames, repeated export clicks, and closing the cloud during preparation.

## Crop controls and viewer subsets

`PointCloudCrop.ts` coordinates length/width controls. Geometry stays in `pointCloudGeometry.ts`, resource/confirmed-ID ownership stays in `PointCloudMapLayer.ts`, and adaptive display remains in `PointCloudAdaptiveDisplay.ts`. Runtime binds live state/result/camera/viewer readers and React state callbacks.

- Length is a symmetric half-length in meters. Nonpositive values select unlimited length; positive values clamp to the current UI maximum. Bearing and width are captured before the state callback, while result and camera remain live.
- Width is a symmetric half-width in meters. Nonpositive disables that axis; positive values clamp between 5 and the existing configured maximum. Width callbacks read bearing/length after map and rings work, and only if a viewer renderer exists.
- Each state callback retains map rebuild → explicit rings → filter current retained points → store subset → viewer upload → optional resize order. A nonpositive ring length uses the current actual extent; no full-cloud/export input is changed.
- Filtered arrays contain the original points in source order. The runtime subset field is assigned before upload so lasso/viewer index spaces remain consistent. No new point copies, cache, timer, listener or SDK layer is owned here.
- Cloud visibility/result guards remain inside the React callback. Queued control changes retain their original independent captured inputs; this extraction adds no debouncing, coalescing or cancellation policy.

Function comments spell out the deliberate length/width timing difference. `tests/pointCloudCrop.test.cjs` compares actual adapters with frozen original controls under immediate/batched state scheduling. Existing geometry tests bind the real crop module while retaining their baseline fixtures and assertions. Host smoke checks: rapid length/width changes, unlimited dimensions, cloud closure, viewer recreation, and lasso alignment after crop changes.

## Initial result application and feedback

`PointCloudResultApplication.ts` applies results synchronously after acquisition validates the current request. `PointCloudResultFeedback.tsx` presents loaded/progress feedback. Acquisition retains the full result and owns requests, deadlines and late-progress guards; the application feature owns no second cache, promise, timer, layer or renderer.

- Automatic follow retains the original greater-than-100,000 corridor limit before state/retention changes. Preflight lookup normalizes IDs to strings; camera selection deliberately retains strict ID equality and map/computed-location fallbacks.
- Extents use shifted WGS84 camera coordinates and meter limits. The basis is captured before width estimation and reused for initial viewer filtering. Floor estimation remains in the geometry helper with source altitude units/datum unchanged.
- Compare cluster URLs without query strings for automatic calibration retention. Clear prior lasso selection before retaining the new full result. Other accepted loads reset all three meter offsets.
- Preserve extents → retention/calibration → maximum length/floor → silent map rebuild → explicit rings → store viewer subset → update or attach renderer → status → finish progress → success toast → partial issue/failure reset order.
- A ready viewer clears highlight before updating the same subset array, then resizes. An unready/absent renderer receives the existing shallow result wrapper with filtered points; acquisition still holds the full result.
- Loaded feedback retains counts, duplicate text, dimensions and 6000 ms duration. Progress retains manual/automatic wording, 15000 ms duration and the `point-cloud-progress` toast owner. Partial results keep their recovery message and failure history.

The coordinator intentionally adds no asynchronous state callback or extra stale-result policy. Call it only through acquisition's guarded result callback. `tests/pointCloudResult.test.cjs` compares actual adapters/feedback with immutable original handlers and real geometry/count/summary helpers, including immediate/batched React state behavior, reuse/attachment, partial/null/empty results and auto-follow limits. The existing geometry and acquisition suites keep their original fixtures/assertions and now bind these modules. Host checks: initial/automatic loads, same-cluster calibration, lasso replacement, partial recovery, viewer recreation and progress completion.

## Activation and clear coordination

`PointCloudLifecycle.ts` coordinates the existing owners through lazy runtime adapters. It owns no layer, timer, request, listener, retained point data or independent mode flags. Acquisition, scene, viewer, tools and ring owners keep their existing cancellation, original-view cleanup and idempotence contracts.

- `toggle` closes whenever acquisition is active/following or the cloud is visible/loading. Otherwise it starts the existing load path. It delegates through the runtime clear/load adapters.
- `clear(true)` stops mode intent, dismisses only cloud-owned progress, disposes adaptive display, cancels pending calibration debounce, cancels acquisition and invalidates/clears map edits, releases the full result/context, detaches the viewer and empties the display subset.
- Lasso/measurement resources release before queued state callbacks. Active measurement resets state and checks the live map/destroyed gate inside its callback before refreshing graphics. Sight/viewshed, rings and calibration panel keep their original order.
- Full reset clears visibility/loading/availability/status flags. `clear(false)` preserves those flags and the active progress toast for reload while still releasing resources and deactivating tools.
- Keep both early lasso resource clearing and the final full lasso clear/state update: they have distinct existing responsibilities. Do not merge or reorder state patches during this extraction.

Function comments document live getters, ownership, callback timing and the reset/reload distinction. No new exception swallowing, callback cancellation or coalescing policy is added. `tests/pointCloudLifecycle.test.cjs` compares actual runtime adapters against frozen original methods with recording owners and immediate/batched state callbacks. The existing map suite binds this feature and retains all original test bodies and its original-map cleanup assertions. Host checks: toggle while loading/following, rapid off/on, clear with each tool active, reload, unrelated toast preservation and clear during a pending calibration nudge.
