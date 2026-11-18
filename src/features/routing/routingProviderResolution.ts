export interface ResolvedRoutingProvider {
  kind: "api-key" | "user" | "portal" | "custom";
  routeUrl: string;
  apiKey?: string;
  label: string;
}

const ARCGIS_LOCATION_ROUTE_URL = "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World";
/** Narrow config boundary; the widget retains its immutable builder config. */
export interface RoutingProviderResolutionInput {
  routingEngine: string;
  config: {
    readonly routingAuthMode?: string;
    readonly routingApiKey?: string;
    readonly routingServiceUrl?: string;
  };
  discoverPortalRouteService: () => Promise<string | null>;
}

/** Resolve policy only; SDK construction, login and cancellation remain with the caller. */
export async function resolveCaptureRoutingProvider({
  routingEngine, config, discoverPortalRouteService,
}: RoutingProviderResolutionInput): Promise<ResolvedRoutingProvider> {
  const authMode = config.routingAuthMode ?? "auto";

  const apiKey = String(config.routingApiKey ?? "").trim();

  /*
   * --------------------------------------------------------
   * 1. ESRI WORLD ROUTE
   * --------------------------------------------------------
   *
   * This is our recommended/default capture-route engine.
   */
  if (routingEngine === "world") {
    /*
     * Explicit API-key mode.
     */
    if (authMode === "api-key") {
      if (!apiKey) {
        throw new Error("Routing API key is not configured.");
      }

      return {
        kind: "api-key",

        routeUrl: ARCGIS_LOCATION_ROUTE_URL,

        apiKey,

        label: "Esri World Route · API Key",
      };
    }

    /*
     * Automatic mode:
     *
     * If the Experience author supplied an API key,
     * use it so anonymous users do not need to sign in.
     */
    if (authMode === "auto" && apiKey) {
      return {
        kind: "api-key",

        routeUrl: ARCGIS_LOCATION_ROUTE_URL,

        apiKey,

        label: "Esri World Route · API Key",
      };
    }

    /*
     * USER mode, or AUTO without an API key.
     *
     * No API key is attached.
     *
     * In Step 4 we will explicitly establish/sign in
     * an ArcGIS user session before the solve.
     */
    return {
      kind: "user",

      routeUrl: ARCGIS_LOCATION_ROUTE_URL,

      label: "Esri World Route · ArcGIS User",
    };
  }

  /*
   * --------------------------------------------------------
   * 2. ORGANIZATION / PORTAL ROUTE
   * --------------------------------------------------------
   *
   * Never selected automatically anymore.
   *
   * The Experience author must explicitly choose it.
   */
  if (routingEngine === "portal") {
    const portalRouteUrl = await discoverPortalRouteService();

    if (!portalRouteUrl) {
      throw new Error("No routing service is configured " + "for this ArcGIS portal.");
    }

    return {
      kind: "portal",

      routeUrl: portalRouteUrl,

      label: "Organization Route",
    };
  }

  /*
   * --------------------------------------------------------
   * 3. CUSTOM ROUTE SERVICE
   * --------------------------------------------------------
   */
  if (routingEngine === "custom") {
    const customRouteUrl = String(config.routingServiceUrl ?? "").trim();

    if (!customRouteUrl) {
      throw new Error("Custom routing service URL " + "is not configured.");
    }

    return {
      kind: "custom",

      routeUrl: customRouteUrl,

      label: "Custom Route Service",
    };
  }

  /*
   * Defensive fallback.
   */
  throw new Error("Unsupported routing configuration.");
}
