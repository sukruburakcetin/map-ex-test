# Runtime architecture

Mapillary Explorer runs inside ArcGIS Experience Builder. The host supplies the map view, React and the ArcGIS Maps SDK. The widget connects that view to MapillaryJS, translates map gestures into image selections and synchronizes imagery with the map.

| Area | Source ownership |
| --- | --- |
| Widget lifecycle | `src/runtime/widget.tsx` binds React state, active map views and feature controllers. |
| Map input | `mapClickDispatch.ts` and `mapHoverDispatch.ts` route input using the active view and selection context. |
| Imagery and camera | Image selection updates the viewer and active capture. `imageFollowPolicy.ts` and `sceneFollowCamera.ts` handle map follow behavior in 2D and 3D. |
| Coverage | `nativeCoverageStyle.ts` builds coverage styles, `nativeCoverageLayers.ts` owns layer replacement and ordering, and `CoverageAnalysisRun.ts` owns analysis cancellation and publication. |
| Notes | The widget coordinates panel state with local storage, configured ArcGIS layers, or a collaboration workspace. |
| Places | A configured source supplies tiles for display and a lookup service for listing and identifying features. See the [Places API contract](places-service-contract.md). |

Preserve the active view and image identity when applying asynchronous results. Keep note publication and attachment uploads tied to explicit user actions. Use the [host acceptance checklist](exb-1.21-validation.md) to verify behavior that depends on the live map and viewer.
