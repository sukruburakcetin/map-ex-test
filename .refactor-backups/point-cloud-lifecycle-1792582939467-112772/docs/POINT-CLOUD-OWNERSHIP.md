# Point-cloud ownership

The runtime coordinates current image/view state, presentation and geometry updates through typed feature adapters. Acquisition, retained points, viewer rendering, scene-layer edits and adaptive map display have explicit resource owners. Move remaining resource lifetimes together when extracting additional controllers.

| Responsibility | Current owner |
| --- | --- |
| Adaptive stationary watcher, movement state and 400 ms settle timer | `src/features/point-cloud/PointCloudAdaptiveDisplay.ts` |
| Sampling/ground expression policy | `pointCloudDisplayExpression` in `src/utils/pointCloudUtils.ts` |
| Live layer/view/tool inputs | `updatePointCloudDisplay` adapter in `src/runtime/widget.tsx` |
| Acquisition queue, abort/deadline, follow intent and retained result identity | `src/features/point-cloud/PointCloudAcquisition.ts` |
| Cluster discovery, download, worker decoding and cluster cache | Existing `src/utils/pointCloudUtils.ts` and worker/services |
| Crop, extents/floor and calibrated plain-feature preparation | `src/features/point-cloud/pointCloudGeometry.ts` |
| Scene layer creation/reuse, serialized edits, confirmed ObjectIDs and destruction | `src/features/point-cloud/PointCloudMapLayer.ts` |
| Viewer custom renderer registration, GL callbacks, uploads and highlight state | `src/features/point-cloud/PointCloudViewerRenderer.ts` |
| Measurement scene/view lifetime, pending creation and cleanup | `src/features/point-cloud/PointCloudMeasurement.ts` |
| Measurement viewer registration, GL state and label projection | `src/features/point-cloud/MeasurementViewerRenderer.ts` |
| Lasso pointer/capture and current/pending map highlight | `src/features/point-cloud/PointCloudLasso.ts` |
| Lasso numerical projection and filtered-viewer index selection | `src/features/point-cloud/lassoProjection.ts` |
| Line-of-sight model, pending activation and creating-view/map lifetime | `src/features/point-cloud/PointCloudSight.ts` |
| Viewshed pending observer creation, fixed policy and original collection cleanup | `src/features/point-cloud/PointCloudViewshed.ts` |
| Ring/grid layer, shared readiness, ellipse/label geometry and creating-map cleanup | `src/features/point-cloud/PointCloudRings.ts` |
| Map renderer, layer/schema/popup properties | `src/features/point-cloud/pointCloudMapPolicy.ts` |
| Status, corridor, tools, calibration, export and elevation-key presentation | Controlled components under `src/features/point-cloud/` |

## Adaptive display contract

`update()` reads live state. It ignores missing/destroyed layers and views, and layers belonging to another view. It applies the supplied policy without editing point geometry or retained data. One watcher tracks movement; a stationary event waits 400 ms before restoring settled detail. Active tools and ground-mode filtering remain inputs to the existing policy.

The runtime calls `dispose()` when clearing the cloud and transferring views. Disabling adaptive mode also disposes the watcher/timer after applying the nonadaptive expression. Repeated disposal is safe. The same owner can be reused for a later valid view.

Callbacks read current state and reject events from a replaced view. Preserve the original ordering when changing this owner: expression application precedes watcher rebinding, followed by an update using the new view's stationary state.

## Verification

`tests/pointCloudAdaptiveDisplay.test.cjs` checks timer, cancellation, stale-view and policy-input contracts with a deterministic clock. The adaptive cases in `tests/turboLifecycle.test.cjs` exercise the runtime adapter with the existing cloud expression policy, tool IDs and geometry-edit invariants.

Live Experience Builder validation must still cover adaptive on/off, map movement, tool activation, cloud clear and 2D/3D switching. Mocked tests do not establish browser frame rate or memory behavior.

## Viewer renderer contract

The runtime adapter constructs a typed owner once and supplies live appearance/calibration readers, the existing geodetic-to-ENU function, render pass and pixel ratio. `attach()` replaces registration; `detach()` removes it from the creating viewer. Mapillary invokes the GL cleanup callback. Both ordinary cloud clear and viewer/widget teardown keep using the existing runtime removal adapter.

`ready` retains the old registration/context/reference gate. `getProjection()` borrows the existing cached matrices/reference for lasso hit testing; it does not copy the matrices or expose the raw callback object. `selectedIndex` is a filtered viewer-array index. Stable ArcGIS ObjectID mapping belongs to `PointCloudMapLayer`; the runtime forwards viewer indices through its adapter. Color changes, crop updates, ground filtering and map-hover highlighting call the typed API while retaining their existing resize/order policies.

`tests/pointCloudViewerRenderer.test.cjs` compares shader strings, ENU arguments, all recorded GL operations, RGBA bands, lasso/crop buffer updates, matrix copies, same-view replacement and removal errors against the supplied baseline. It additionally verifies removal from the creating viewer after host reference replacement/loss. See `src/features/point-cloud/README.md` for commands and host smoke checks.

The legacy GL deletion list and lasso shader lookup behavior are unchanged. Review any additional resource-release or shader-policy changes in a separate behavior change with its own validation.

## Scene-layer edit owner

`PointCloudMapLayer.ts` owns layer/result/view identity, the edit promise chain, confirmed features, original-point-to-viewer indices and viewer-to-ObjectID lookup. The runtime now uses `pointCloudGeometry.ts` for crop geometry, calibrated heights and popup attribute values; RGB/elevation renderer and schema/popup policy now live in `pointCloudMapPolicy.ts`. No point acquisition, worker, viewer rendering, adaptive watcher or ring layer moves into this owner.

`beginUpdate()` marks map picking busy before feature preparation. `update()` reuses only a live layer for the identical result object and creating view. A replacement retains visibility and removes/destroys the original layer before attaching the new one. The source stays initially empty. Summary notification and adaptive-display application retain their previous ordering.

Edits remain serialized as deletes, updates, then adds, with at most 5,000 features per SDK call and one zero-delay yield after a successful chunk. The queue survives clear/view transfer: an in-flight SDK edit is not abortable. If a newer update supersedes it on the same layer/view, successful confirmations are still reconciled before the latest diff runs. Stale-layer/view confirmations cannot change current ID maps. Only the latest job may clear busy state, restore lasso feedback, toast, or publish an error.

Logical IDs are `originalIndex + 1`; confirmed SDK ObjectIDs can differ. `objectIds()` returns finite confirmed IDs for supplied filtered viewer indices and omits unconfirmed entries. Preserve this distinction when modifying lasso, crop or hover behavior.

`invalidate()` cancels future queued work during view transfer. `clear()` invalidates again safely, removes the layer from its original view, destroys it and clears indexes while retaining the pending queue barrier. Runtime continues to dispose adaptive watchers, cancel acquisition and detach the viewer in the existing order. Rings now own their creating-map identity and independent cleanup through `PointCloudRings`.

`tests/pointCloudMapLayer.test.cjs` includes an immutable pre-extraction fixture. It compares geometry, schema, popup/renderer properties, SDK edit calls, assigned IDs, partial confirmations, errors and UI callback order, including 12,001-point chunking and supersession between chunks. The SDK adapter is also checked against ArcGIS 4.33.12 declarations during development. These tests use a recording SDK, not the live scene renderer.

## Acquisition and follow owner

`PointCloudAcquisition.ts` owns request/queue revisions, AbortController, the 90-second deadline, serialized acquisition task, 250 ms follow timer, activation intent, automatic-failure count and full retained result reference. Runtime supplies lazy state/transport adapters; construction starts no work. Request options, cluster cache, nearby-sequence policy and decoding remain unchanged. The runtime commits calibration, geometry-helper outputs, renderer updates and notifications synchronously through `acceptPointCloudResult`.

`load()` aborts the current transport, waits for its task and pending scene edits, and starts only the newest queued request for the same image/view. Success/progress require a live matching request, image, view, map and non-aborted signal. Error reporting deliberately omits the abort check so a current timeout can report recovery. Success disables progress at the established commit point. No extra asynchronous commit wrapper is introduced.

Cancellation scopes preserve existing transitions: clear/fullscreen also invalidate queued starts; view transfer/clear release the controller reference. Cleanup cancels current work and delayed follow. Cancellation does not release retained points. `clearPointCloud` stops mode intent first and releases the result after scene teardown, before viewer teardown. Map-edit settlement remains independent of request abort.

`result` is the original full object; export, calibration and tools borrow it. Viewer crop arrays remain separate. `retain()` is called only at the previous validated commit location. `recordIssue()` counts automatic failures with follow enabled; React still owns the paused/status presentation. Resume/manual retry and complete success reset the count. Fullscreen only updates the previous-image flag on frame changes; paused follow preserves its existing behavior.

`tests/pointCloudAcquisition.test.cjs` compares actual runtime adapters and the owner with immutable pre-extraction methods using a controlled transport/clock. It covers progress/commit ordering, calibration, context fallback, stale completion, timeout, retries/partial data, three-failure pause, follow debounce, queued supersession, cancellation scope and the map-edit barrier. Existing map/viewer suites remain applicable. Browser playback, fullscreen and 2D/3D transitions still require host smoke checks; these recordings do not measure FPS.

## Geometry preparation

`pointCloudGeometry.ts` owns side-effect-free calculations for radial/cross-street extents, floor sampling, viewer crop membership and calibrated map feature properties. It borrows full points without mutating them. The existing candidate-envelope helper retains its WeakMap index; geometry does not add a cache, SDK resource, request, timer or watcher. Runtime keeps state/lifecycle decisions, bearing capture, rendering policy and callback order.

Inputs use shifted WGS84 longitude/latitude for crop and placement, raw SfM longitude/latitude for camera distance, and meters for lengths, half-widths, floor/altitudes and east/north/up nudges. Source altitude datum remains unverified. Exact crop uses the existing local 111320 meters/degree formula, with bearing clockwise from north; calibration is applied after membership testing. Positive limits include both boundaries, and nonpositive limits disable that axis. Full length still respects width.

The full retained array and its point objects stay unchanged. Viewer filters return a new array of the same objects in source order. Map preparation keeps ascending candidate/source order, dense filtered `pointIndex` and logical `ObjectID = originalIndex + 1`. Confirmed SDK ObjectIDs still belong to the map owner. RGB normalization, 16-step quantization, color insertion order and height/distance rounding are unchanged.

Floor sampling retains the strict under-5-meter neighborhood, more-than-50-point threshold and fifth percentile of sorted temporary altitudes; empty input preserves its previous undefined result. This is a structural move, not a new ground-height or datum correction. `pointCloudLengthExtent` reports radial extent, while `pointCloudWidthExtent` reports maximum cross-street offset; both preserve 10-meter rounding and existing caps.

Length controls capture bearing/width before their state callback; width controls read bearing inside their callback after map/ring refresh. Initial load reuses its previously captured basis for viewer cropping. Keep these capture points if changing React state batching. Geometry helpers never schedule or commit UI work.

`tests/pointCloudGeometry.test.cjs` compares four real runtime adapters with immutable pre-extraction methods, using real geographic math/candidate enumeration. Cases include batched callbacks, rotations/origins, boundaries, sentinel axes, calibration/raw distance, color modes, index gaps, floor sample thresholds and empty clouds. Existing acquisition/map/viewer comparisons remain in place with test-only geometry dependency bindings. Host smoke checks still cover crop sliders, calibration, lasso/picking, RGB/elevation, ground mode, clear/load and sequence playback.

## Measurement lifetime

`PointCloudMeasurement.ts` owns measurement resources independently of the retained cloud: creating map/view identity, layer, pending module load, redraw generation and nested `MeasurementViewerRenderer`. Runtime owns `measurePoints`, picking, measure-mode state, mutual exclusion with tools and the HTML label element. Adapters borrow state and DOM references; no owner retains Widget/React instances or copies cloud points.

The scene owner removes/destroys its layer on the creating map. It shares concurrent module loads, reads the newest samples after loading, and attaches/draws only for the current view/map/generation. A stale newly constructed layer is destroyed without attachment. SDK loading/attachment failures are locally reported and retryable. An existing layer redraw stays synchronous; clear still synchronizes the viewer before the empty-point return.

The viewer owner remembers the creating viewer, so fullscreen/replacement/reference loss can remove the correct registration. SDK `onRemove` deletes the existing program/two buffers. Transparent pass, shaders, ENU arguments, uniforms, draw/state order and label projection remain unchanged. The label reads the current picked samples and canvas CSS dimensions during rendering. Geometry/text use the same map versus raw measurement coordinates and rounding documented in `MeasurementPoint`.

Runtime forwards disposal before cloud/widget teardown and viewer detachment before all three viewer-removal sites. View changes release the old map resource; active measurements restore after host readiness. Disposal invalidates pending loads first, then removes/destroys the layer, detaches without teardown resize and hides the label. A subsequent real pick can reuse the owner. Empty post-clear callbacks no longer allocate an invisible layer.

The intentional improvements address lifecycle gaps in the pre-extraction implementation: stale layer attachment after awaits, duplicate initial layers, old-map overlays, renderer active state across viewer replacement and unhandled current SDK loading failures. Normal graphics, metric math, picking and tool UX remain unchanged. `tests/pointCloudMeasurement.test.cjs` distinguishes baseline rendering comparisons from these lifecycle tests. Strict development checks use actual ArcGIS 4.33.12 and Mapillary 4.1.2 boundaries; host smoke checks remain required.

## Lasso selection and feedback

`PointCloudLasso.ts` owns active pointer ID/target, capture release, highlight request revision and current map highlight handle. Runtime retains polygon/selected-ID React state, tool intent/exclusion, canvas/projection readers, viewer flag uploads and redraw calls. Its typed target adapter requires the current map-layer owner's view to match the live view; the owner also checks layer/view/map identity and destroyed state after layer-view readiness.

`lassoProjection.ts` borrows raw WGS84 coordinates/source altitude, the last viewer matrices/reference and canvas CSS dimensions. It does not allocate point-cloud copies, mutate matrices or change the existing ENU/matrix/ray-casting algorithm. Its output addresses the filtered viewer array. Runtime still translates those indices through the map owner's confirmed ObjectIDs, omitting unconfirmed entries, and preserves the state/viewer/map feedback order. Logical originalIndex + 1 IDs remain separate from assigned SDK IDs.

A new highlight request supersedes pending callbacks without immediately removing current feedback; only the latest valid callback can replace its handle. Clear invalidates pending work before removing the handle, so late layer-view results cannot resurrect map feedback or remove a newer highlight. Host teardown/rejected readiness is contained locally. Clear, cloud/widget teardown and view replacement release the original handle; viewer removal cancels unfinished gestures without completing them.

Normal single-pointer mouse/touch behavior, coordinate units, CSS projection, padding, polygon tests and index mappings are preserved. Lifecycle corrections add pointer cancellation/capture cleanup, active-pointer isolation, pending-request guards and safe repeated cleanup. No shader-policy, tool-toggle, selection-math or UI-layout change is included. Existing renderer tests retain their immutable baseline and compare the moved math and unchanged commit; `tests/pointCloudLasso.test.cjs` separately compares normal behavior and exercises cancellation/stale callbacks. Physical-device touch and actual SDK rendering still need host smoke checks.

## Line-of-sight lifetime

`PointCloudSight.ts` owns the SDK view model, creating view/map and pending activation revision. Runtime owns enabled intent, observer/target React state, point-cloud hit geometry and UI/tool exclusion. The raw `any` view-model field is removed, and observer/target state is typed as ArcGIS points. SDK load, observer assignment and target-properties autocast are explicit typed runtime adapters.

Activation loads a factory, then checks current enabled SceneView/map/revision before construction. Multiple current-view activations share loading. A post-constructor guard releases a model if synchronous host activity replaced its context. Current module/constructor failures are reported locally; stale failures remain silent and retry is allowed. Clear invalidates pending activation even when no model exists.

Existing observer/target updates retain the same state-before-SDK ordering and original picked geometry identity, including relative z and spatial reference. The SDK remains responsible for visibility analysis. No source-altitude conversion, ground-height correction, point-array copy, timer, animation loop or point-cloud acquisition is added.

Clear retains a reusable current model; widget cleanup clears/destroys it and drops ownership first. View/map replacement disposes the old model before host state transfer. After a new 3D view becomes ready, active intent may restore existing observer/targets to a new model without replaying React target callbacks. Picking is gated by current model/view/map readiness, so old models cannot accept points after replacement or disabling.

Intentional corrections are constructor-load cancellation guards, shared activation, SceneView-only construction, original-model destruction, current-view pick validation, restoration and contained failures. Normal tool state/toasts, clear/reuse and mutual-exclusion behavior are preserved in baseline comparisons. `tests/pointCloudSight.test.cjs` executes real toggle/clear/SDK adapters and the actual hit branch; host validation must still verify real SDK occlusion and terrain/scene behavior.

## Viewshed lifetime

`PointCloudViewshed.ts` owns request revision, SDK analysis and its original view/map/analysis collection. Runtime owns `isViewshedMode`, point-cloud hit geometry, tool exclusion and UI. Its lazy factory loads the same ViewshedAnalysis/Viewshed/Point modules and constructs the same SDK property graph. The raw `any` analysis field and MapView `.analyses` cast are removed.

Each observer click clears prior results before module loading, then validates the newest request, enabled 3D view, map and analysis-collection identity before construction and attachment. A constructor-triggered context change destroys the unattached analysis. Clear or view replacement invalidates pending work; a stale completion cannot attach to a new view. Current module/constructor/attachment failures are locally reported and retryable; stale failures remain silent.

Cleanup drops authority first, removes from the creating collection even after host state/view replacement and attempts SDK destroy independently. Partial attachment failures also remove/destroy the analysis. Widget cleanup now always clears the owner, including requests that have not produced an analysis yet. View changes release the old context; no observer state is invented or restored into the new map.

Observer policy is unchanged: picked shifted longitude/latitude, picked map z plus 1.5 meters, WGS84 4326, 150 meters, horizontal/vertical fields 360/90 degrees and heading/tilt 0/0. No altitude-datum correction, new visibility formula, point traversal, timer or point-cloud request is introduced. Existing tool-exclusion conditions remain intact.

`tests/pointCloudViewshed.test.cjs` distinguishes normal policy/toggle comparisons from intentional destruction/race/error improvements. It executes the actual hit branch and SDK adapter with recording constructors/collections. Strict checks use ArcGIS 4.33.12; live host checks must still verify real SDK visibility and scene/terrain behavior.

## Ring / grid lifetime and drawing

`PointCloudRings.ts` owns the layer, creating view/map, shared readiness promise, load revision and draw revision. Its runtime factory binds GraphicsLayer/Graphic constructors and live geometry/bearing readers. No raw ring-layer, ready-promise or generation mirrors remain in runtime. Ring geometry stays in this cohesive feature; point-cloud acquisition, feature edits and renderer policy remain separate.

Readiness captures view, map and retained-result identity. Same-context requests share loading, while result/view/map replacement or clear rejects stale construction. Identity-aware promise cleanup cannot erase a newer task. Existing-layer readiness remains asynchronous; duplicate callers coalesce under the latest draw revision. Geometry is read after readiness, while the radius argument stays captured at the original caller. The bearing reader retains its per-radius placement in emission order.

The original layer properties, meter-to-degree/nudge conversion, interval selection, ellipse caps, sampling, closure, boundary/color priority and label policies are unchanged. Inputs are shifted WGS84 degrees plus east/north meter offsets; lengths/half-widths are meters. Ring z remains zero on a relative-to-ground layer at 0.5 m offset. There is no floor/source-altitude conversion or point-cloud copy.

Clear invalidates pending work before removing from the original map and attempting destruction independently. Cloud clear keeps its existing place in teardown; widget cleanup also clears pending/current rings. View changes release old resources directly, independently of the point-cloud feature-layer view. Current SDK/graphic failures are contained and retryable; stale load failures remain silent. These lifetime corrections are distinct from preserved numerical drawing policy.

`tests/pointCloudRings.test.cjs` records exact old/new SDK properties, geometry, labels and operation order, including readiness/coalescing and post-load state reads. Separate cases cover stale work, context replacement, partial attachment, constructor changes and cleanup failures. The immutable map regression fixture retains its clear/order assertions through a test-only owner bridge. Strict checks use the actual ArcGIS 4.33.12 factory boundary; live terrain/scene rendering remains a host check.

## Map display policy

`pointCloudMapPolicy.ts` owns plain RGB/elevation renderer properties and layer schema/popup construction. Its typed functions introduce no SDK instances, scheduling, requests or state ownership. Runtime prepares geometry, requests the renderer and forwards the existing update. `PointCloudMapLayer` calls the schema builder only in the new-layer branch; reuse, original-view teardown, confirmed ID maps and serialized edit behavior are unchanged.

Renderer colors retain input order, including the existing fallback for every mode except `elevation`. Point size/outline/material, relativeHeight color stops, legend settings and schema/popup values are preserved. Metadata arrays/objects are fresh per call for SDK autocasting; the renderer is passed by reference, as before. Existing field aliases and popup wording/whitespace remain exact; they do not introduce altitude-datum guarantees.

The schema still creates an empty source, WGS84 point geometry with z, relative-to-ground offset 0.5, the same field/ID casing, outFields and popup template. Visibility carries false across layer replacement and defaults nullish values to true. Geometry preparation, adaptive/ground expressions and edit reconciliation stay with their existing helpers/owners.

`tests/pointCloudMapPolicy.test.cjs` compares the original renderer/schema expressions with the new functions and verifies SDK mutation cannot contaminate subsequent metadata. Existing map/geometry comparisons execute the actual policy module with unchanged fixtures/assertions. Development checks assign results to the actual ArcGIS 4.33.12 renderer-property union and FeatureLayerProperties; map-owner algorithm tokens remain unchanged after normalizing the extracted schema call. Host validation still needs real map rendering/popups and layer reuse/replacement.

## Calibration coordination

`src/features/point-cloud/PointCloudCalibration.ts` contains keyboard/joystick movement math and commit ordering. The widget remains the authority for meter offsets, eligibility, feedback and its existing 150 ms trailing debounce. This separation adds no listeners, timers, cloud copies or SDK ownership.

Accepted keyboard input accumulates without rendering until key release. Joystick input applies the UI step, emits feedback, then schedules. Reset emits feedback and rebuilds the map immediately without cancelling the previous pending debounce. A normal commit keeps map rebuild → explicit rings → viewer colors/resize order. Ground/color shortcuts and acquisition's same-cluster calibration preservation stay unchanged.

Contributors changing these callbacks must keep unit and ordering comments current and run `tests/pointCloudCalibration.test.cjs`. Its frozen baseline compares actual runtime handlers rather than a second implementation of the new coordinator. Clear/teardown continues cancelling the widget debounce; the coordinator has no disposal work.

## Export orchestration

`PointCloudExport.ts` owns the single-flight busy flag and accepted export flow; `PointCloudExportFeedback.tsx` owns existing toast text, JSX and duration. Runtime binds live source/calibration readers, state and actual format writers. CSV/PLY/LAS writer algorithms remain unchanged.

Export borrows the complete retained result rather than display/crop/ground/lasso subsets. The result and vertical offset are captured at acceptance, while horizontal offsets/latitude are read after preparation feedback. Source ID/fallback resolution and the format-specific browser operations retain their original order. Accepted work is not cancelled by cloud closure or replacement; widget disposal suppresses only final loading-state mutation. No point copy, new request, worker or cancellation resource is added.

The coordinator preserves the existing exception scopes: binary failures notify; CSV download failures log/notify; CSV writer failures propagate while `finally` releases busy/loading. CSV URL revocation is immediate; binary revocation keeps its 1000 ms grace period. Function comments document those deliberate boundaries. The baseline-backed export suite records feedback, writer inputs, browser operations, errors and held-writer races. Real downloads/file import remain host smoke checks.

## Crop/display coordination

`PointCloudCrop.ts` owns length/width input orchestration. It borrows current state/result/camera/viewer readers and calls runtime state/map/ring/subset/upload adapters. Numerical filtering remains in `pointCloudGeometry.ts`; adaptive display and scene edit/confirmed-ID owners are unchanged.

Length captures basis/width before setState; width reads basis/length after map/ring updates inside the callback. Both retain callback-time visibility/result guards and current camera/result reads. Store the ordered filtered array before viewer upload, then resize if available. The complete retained cloud remains authoritative for acquisition and export. Nonpositive dimensions disable the corresponding crop axis; rings retain actual-length fallback.

The coordinator owns no timer, listener, layer, retained cloud or duplicate subset state. Queued callbacks preserve the current scheduling policy. Function comments and the baseline-backed crop suite document clamping, capture timing, point identity, replacement/closure and callback ordering. The existing geometry suite still checks actual feature/confirmed-index order through the real runtime adapters.

## Initial result application and presentation

`PointCloudResultApplication.ts` synchronously applies an already-current acquisition result. Runtime supplies typed live state/acquisition/camera/viewer adapters; `PointCloudResultFeedback.tsx` owns existing success/progress JSX and toast timing. No request, timer, duplicate cloud store, SDK layer or GL renderer is transferred into this feature.

The full result remains acquisition-owned. Automatic preflight threshold, camera selection/fallbacks, extents/basis/floor calculations, same-cluster calibration retention, prior-lasso cleanup and initial subset order are retained. Map/rings precede renderer reuse/attachment; subset authority is assigned before upload. Status/finish-progress/success/partial issue ordering remains synchronous, including existing batched-state reads. The feature does not add current-request checks; acquisition supplies them before invoking it.

Function comments document degrees/meters, source altitude policy, strict versus string-normalized ID matching and authority/order boundaries. Baseline-backed tests verify real geometry/summary/count helpers plus feedback properties, ready/unready viewer behavior, null/empty/partial results and the automatic follow limit. Host validation still needs real initial/follow loads, calibration/lasso carryover, viewer recreation and progress cleanup.
