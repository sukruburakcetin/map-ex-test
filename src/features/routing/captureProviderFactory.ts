import { createOSRMRoutingProvider } from "../../utils/osrmRoutingProvider";
import { createArcGISRoutingProvider } from "../../utils/arcgisRoutingProvider";
import type { ArcGISRoutingProviderConfig } from "../../utils/arcgisRoutingProvider";
import type { RoutingProvider, CaptureTravelMode } from "../../utils/routingTypes";
import type { ResolvedRoutingProvider } from "./routingProviderResolution";

type ArcGISModules = Pick<ArcGISRoutingProviderConfig,
  "route" | "networkService" | "RouteParameters" | "FeatureSet" | "Graphic" | "Point">;

export interface CaptureProviderFactoryInput {
  routingEngine: string;
  config: { readonly osrmServerMode?: string; readonly osrmServerUrl?: string };
  resolveArcGIS: () => Promise<ResolvedRoutingProvider>;
  modules: () => ArcGISModules;
  travelMode: () => CaptureTravelMode;
  log: (message: string) => void;
}

/** Construct providers without solving; SDK/mode access stays after asynchronous resolution. */
export async function createCaptureProvider({
  routingEngine, config, resolveArcGIS, modules, travelMode, log,
}: CaptureProviderFactoryInput): Promise<RoutingProvider> {
  if (routingEngine === "osrm") {
    const serverMode = config.osrmServerMode ?? "public";
    let baseUrl: string;
    if (serverMode === "custom") {
      baseUrl = String(config.osrmServerUrl ?? "").trim();
      if (!baseUrl) throw new Error("Custom OSRM server URL is not configured.");
    } else {
      baseUrl = "https://router.project-osrm.org";
    }
    const provider = createOSRMRoutingProvider({
      baseUrl, profile: "driving",
      label: serverMode === "custom" ? "OSRM · Custom Server" : "OSRM · Public Demo",
    });
    log(`[CaptureRoute] Routing provider: ` + `${provider.label}`);
    log(`[CaptureRoute] OSRM server: ` + `${baseUrl}`);
    return provider;
  }
  const resolved = await resolveArcGIS();
  const providerKind = resolved.kind === "portal" ? "arcgis-portal" : resolved.kind === "custom" ? "arcgis-custom" : "arcgis-world";
  const sdk = modules();
  const provider = createArcGISRoutingProvider({
    route: sdk.route, networkService: sdk.networkService, RouteParameters: sdk.RouteParameters,
    FeatureSet: sdk.FeatureSet, Graphic: sdk.Graphic, Point: sdk.Point,
    routeUrl: resolved.routeUrl, apiKey: resolved.kind === "api-key" ? resolved.apiKey : undefined,
    kind: providerKind, label: resolved.label, travelMode: travelMode(),
  });
  log(`[CaptureRoute] Routing provider: ` + `${provider.label}`);
  log(`[CaptureRoute] ArcGIS route service: ` + `${resolved.routeUrl}`);
  return provider;
}
