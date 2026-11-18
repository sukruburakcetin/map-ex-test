import type { CaptureTravelMode } from "../../utils/routingTypes";

interface RuntimeRoutingState {
  isGeneratingRoute: boolean;
  routeTravelMode: CaptureTravelMode;
}

/** Only the generated route is invalidated; the widget owns clearing, publication and logs. */
export function planRuntimeRoutingEngineChange(engine: "world" | "osrm", state: RuntimeRoutingState) {
  const nextTravelMode: CaptureTravelMode = engine === "osrm" && state.routeTravelMode !== "drive" ? "drive" : state.routeTravelMode;
  if (state.isGeneratingRoute) return null;
  return {
    patch: { routingEngineOverride: engine, routeTravelMode: nextTravelMode, routeData: null, routeGenerationProgress: null },
    message: `[CaptureRoute] Runtime engine → ` + `${engine === "world" ? "Esri World Route" : "OSRM"}`,
  };
}

export function planRuntimeTravelModeChange(mode: CaptureTravelMode, state: RuntimeRoutingState) {
  if (state.isGeneratingRoute) return null;
  const label = mode === "drive" ? "Drive" : mode === "walk" ? "Walk" : "Bike";
  return {
    patch: { routeTravelMode: mode, routeData: null, routeGenerationProgress: null },
    message: `[CaptureRoute] Travel mode → ${label}`,
  };
}
