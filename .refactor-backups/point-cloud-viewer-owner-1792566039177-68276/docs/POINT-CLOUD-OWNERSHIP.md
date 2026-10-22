# Point-cloud ownership

The runtime coordinates current image/view state, acquisition, retained points and geometry updates. Move resource lifetimes together when extracting additional controllers.

| Responsibility | Current owner |
| --- | --- |
| Adaptive stationary watcher, movement state and 400 ms settle timer | `src/features/point-cloud/PointCloudAdaptiveDisplay.ts` |
| Sampling/ground expression policy | `pointCloudDisplayExpression` in `src/utils/pointCloudUtils.ts` |
| Live layer/view/tool inputs | `updatePointCloudDisplay` adapter in `src/runtime/widget.tsx` |
| Acquisition, cancellation, follow intent and retained points | Runtime and existing cloud utilities; pending broader controller extraction |
| Scene layer creation, edits and destruction | Runtime; pending layer-owner extraction |
| Viewer custom renderer | Runtime; pending renderer-owner extraction |
| Status, corridor, tools, calibration, export and elevation-key presentation | Controlled components under `src/features/point-cloud/` |

## Adaptive display contract

`update()` reads live state. It ignores missing/destroyed layers and views, and layers belonging to another view. It applies the supplied policy without editing point geometry or retained data. One watcher tracks movement; a stationary event waits 400 ms before restoring settled detail. Active tools and ground-mode filtering remain inputs to the existing policy.

The runtime calls `dispose()` when clearing the cloud and transferring views. Disabling adaptive mode also disposes the watcher/timer after applying the nonadaptive expression. Repeated disposal is safe. The same owner can be reused for a later valid view.

Callbacks read current state and reject events from a replaced view. Preserve the original ordering when changing this owner: expression application precedes watcher rebinding, followed by an update using the new view's stationary state.

## Verification

`tests/pointCloudAdaptiveDisplay.test.cjs` checks timer, cancellation, stale-view and policy-input contracts with a deterministic clock. The adaptive cases in `tests/turboLifecycle.test.cjs` exercise the runtime adapter with the existing cloud expression policy, tool IDs and geometry-edit invariants.

Live Experience Builder validation must still cover adaptive on/off, map movement, tool activation, cloud clear and 2D/3D switching. Mocked tests do not establish browser frame rate or memory behavior.
