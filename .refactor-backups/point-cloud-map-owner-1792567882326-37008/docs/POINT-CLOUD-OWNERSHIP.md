# Point-cloud ownership

The runtime coordinates current image/view state, acquisition, retained points and geometry updates. Viewer rendering and adaptive map display have explicit resource owners. Move remaining resource lifetimes together when extracting additional controllers.

| Responsibility | Current owner |
| --- | --- |
| Adaptive stationary watcher, movement state and 400 ms settle timer | `src/features/point-cloud/PointCloudAdaptiveDisplay.ts` |
| Sampling/ground expression policy | `pointCloudDisplayExpression` in `src/utils/pointCloudUtils.ts` |
| Live layer/view/tool inputs | `updatePointCloudDisplay` adapter in `src/runtime/widget.tsx` |
| Acquisition, cancellation, follow intent and retained points | Runtime and existing cloud utilities; pending broader controller extraction |
| Scene layer creation, edits and destruction | Runtime; pending layer-owner extraction |
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

`ready` retains the old registration/context/reference gate. `getProjection()` borrows the existing cached matrices/reference for lasso hit testing; it does not copy the matrices or expose the raw callback object. `selectedIndex` is a filtered viewer-array index. Stable ArcGIS ObjectID mapping remains runtime-owned. Color changes, crop updates, ground filtering and map-hover highlighting call the typed API while retaining their existing resize/order policies.

`tests/pointCloudViewerRenderer.test.cjs` compares shader strings, ENU arguments, all recorded GL operations, RGBA bands, lasso/crop buffer updates, matrix copies, same-view replacement and removal errors against the supplied baseline. It additionally verifies removal from the creating viewer after host reference replacement/loss. See `src/features/point-cloud/README.md` for commands and host smoke checks.

The legacy GL deletion list and lasso shader lookup behavior are unchanged. Review any additional resource-release or shader-policy changes in a separate behavior change with its own validation.
