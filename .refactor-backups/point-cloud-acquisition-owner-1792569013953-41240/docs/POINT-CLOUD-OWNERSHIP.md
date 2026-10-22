# Point-cloud ownership

The runtime coordinates current image/view state, acquisition, retained points and geometry updates. Viewer rendering, scene-layer edits and adaptive map display have explicit resource owners. Move remaining resource lifetimes together when extracting additional controllers.

| Responsibility | Current owner |
| --- | --- |
| Adaptive stationary watcher, movement state and 400 ms settle timer | `src/features/point-cloud/PointCloudAdaptiveDisplay.ts` |
| Sampling/ground expression policy | `pointCloudDisplayExpression` in `src/utils/pointCloudUtils.ts` |
| Live layer/view/tool inputs | `updatePointCloudDisplay` adapter in `src/runtime/widget.tsx` |
| Acquisition, cancellation, follow intent and retained points | Runtime and existing cloud utilities; pending broader controller extraction |
| Scene layer creation/reuse, serialized edits, confirmed ObjectIDs and destruction | `src/features/point-cloud/PointCloudMapLayer.ts` |
| Viewer custom renderer registration, GL callbacks, uploads and highlight state | `src/features/point-cloud/PointCloudViewerRenderer.ts` |
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

`PointCloudMapLayer.ts` owns layer/result/view identity, the edit promise chain, confirmed features, original-point-to-viewer indices and viewer-to-ObjectID lookup. Runtime still prepares crop geometry, calibrated heights, RGB/elevation renderer policy and popup values. No point acquisition, worker, viewer rendering, adaptive watcher or ring layer moves into this owner.

`beginUpdate()` marks map picking busy before feature preparation. `update()` reuses only a live layer for the identical result object and creating view. A replacement retains visibility and removes/destroys the original layer before attaching the new one. The source stays initially empty. Summary notification and adaptive-display application retain their previous ordering.

Edits remain serialized as deletes, updates, then adds, with at most 5,000 features per SDK call and one zero-delay yield after a successful chunk. The queue survives clear/view transfer: an in-flight SDK edit is not abortable. If a newer update supersedes it on the same layer/view, successful confirmations are still reconciled before the latest diff runs. Stale-layer/view confirmations cannot change current ID maps. Only the latest job may clear busy state, restore lasso feedback, toast, or publish an error.

Logical IDs are `originalIndex + 1`; confirmed SDK ObjectIDs can differ. `objectIds()` returns finite confirmed IDs for supplied filtered viewer indices and omits unconfirmed entries. Preserve this distinction when modifying lasso, crop or hover behavior.

`invalidate()` cancels future queued work during view transfer. `clear()` invalidates again safely, removes the layer from its original view, destroys it and clears indexes while retaining the pending queue barrier. Runtime continues to dispose adaptive watchers, preserve the original view for ring cleanup, cancel acquisition and detach the viewer in the existing order.

`tests/pointCloudMapLayer.test.cjs` includes an immutable pre-extraction fixture. It compares geometry, schema, popup/renderer properties, SDK edit calls, assigned IDs, partial confirmations, errors and UI callback order, including 12,001-point chunking and supersession between chunks. The SDK adapter is also checked against ArcGIS 4.33.12 declarations during development. These tests use a recording SDK, not the live scene renderer.
