import type { RoutingProvider, RoutingProviderKind, RoutingResult, RoutingSolveOptions, RoutingCoordinate, CaptureTravelMode } from "./routingTypes";

type ArcGISRoutingProviderKind = Extract<RoutingProviderKind, "arcgis-world" | "arcgis-portal" | "arcgis-custom">;

export interface ArcGISRoutingProviderConfig {
  /**
   * ArcGIS JS API route REST module.
   */
  route: any;

  /**
   * ArcGIS network service helper.
   *
   * Used to discover supported travel modes.
   */
  networkService: any;

  RouteParameters: any;

  FeatureSet: any;

  Graphic: any;

  Point: any;

  /**
   * Full NAServer Route endpoint.
   */
  routeUrl: string;

  /**
   * Optional ArcGIS Location Services API key.
   *
   * Used mainly by arcgis-world.
   */
  apiKey?: string;

  kind: ArcGISRoutingProviderKind;

  label: string;
  /**
   * Capture Route transport mode.
   */
  travelMode?: CaptureTravelMode;
}

/**
 * Creates a Mapillary Explorer routing provider backed
 * by ArcGIS Network Analyst / World Route.
 *
 * ArcGIS-specific request and response structures stay
 * inside this adapter so the Capture Route optimizer only
 * works with normalized RoutingResult objects.
 */
export const createArcGISRoutingProvider = (config: ArcGISRoutingProviderConfig): RoutingProvider => {
  const { route, networkService, RouteParameters, FeatureSet, Graphic, Point, routeUrl, apiKey, kind, label, travelMode = "drive" } = config;

  /*
   * --------------------------------------------------------
   * ARCGIS TRAVEL MODE DISCOVERY
   * --------------------------------------------------------
   *
   * Drive intentionally preserves the existing behavior:
   * we do NOT explicitly assign a travelMode object.
   *
   * Walk / Bike use a service-defined travel mode.
   */

  let serviceDescriptionPromise: Promise<any> | null = null;

  const getServiceDescription = async (): Promise<any> => {
    if (!networkService?.fetchServiceDescription) {
      throw new Error("ArcGIS networkService module is unavailable.");
    }

    if (!serviceDescriptionPromise) {
      serviceDescriptionPromise = networkService.fetchServiceDescription(routeUrl, apiKey).catch((error: any) => {
        /*
         * Allow a future retry if discovery fails.
         */
        serviceDescriptionPromise = null;

        throw error;
      });
    }

    return serviceDescriptionPromise;
  };

  const isTimeBasedMode = (mode: any): boolean => {
    const impedance = String(mode?.impedanceAttributeName ?? "").toLowerCase();

    return impedance.includes("time") || impedance.includes("minute");
  };

  const resolveArcGISTravelMode = async (): Promise<any | null> => {
    /*
     * IMPORTANT:
     *
     * Preserve current driving behavior exactly.
     *
     * Setting an explicit travelMode would cause
     * ArcGIS to override parameters such as the
     * existing U-turn setting.
     */
    if (travelMode === "drive") {
      return null;
    }

    const serviceDescription = await getServiceDescription();

    const supportedTravelModes: any[] = serviceDescription?.supportedTravelModes ?? [];

    if (!supportedTravelModes.length) {
      throw new Error("ArcGIS route service exposes no travel modes.");
    }

    if (travelMode === "walk") {
      /*
       * Prefer the standard ArcGIS mode first.
       */
      const exactWalkingTime = supportedTravelModes.find((mode: any) => String(mode?.name ?? "").toLowerCase() === "walking time");

      if (exactWalkingTime) {
        return exactWalkingTime;
      }

      /*
       * More robust fallback for localized/custom
       * organization travel modes.
       */
      const walkingTime = supportedTravelModes.find((mode: any) => String(mode?.type ?? "").toLowerCase() === "walk" && isTimeBasedMode(mode));

      if (walkingTime) {
        return walkingTime;
      }

      throw new Error("This ArcGIS route service does not provide a time-based walking travel mode.");
    }

    /*
     * Cycling is normally an organization/custom
     * travel mode rather than a guaranteed default
     * ArcGIS World Route mode.
     *
     * Type is commonly 'other', so detect it using
     * its configured name/description.
     */
    const bicycleKeywords = ["bike", "biking", "bicycle", "cycling", "cycle"];

    const cyclingTime = supportedTravelModes.find((mode: any) => {
      if (!isTimeBasedMode(mode)) {
        return false;
      }

      const searchableText = (String(mode?.name ?? "") + " " + String(mode?.description ?? "")).toLowerCase();

      return bicycleKeywords.some((keyword) => searchableText.includes(keyword));
    });

    if (cyclingTime) {
      return cyclingTime;
    }

    const availableNames = supportedTravelModes
      .map((mode: any) => mode?.name)
      .filter(Boolean)
      .join(", ");

    throw new Error("This ArcGIS route service does not provide a time-based cycling travel mode." + (availableNames ? ` Available modes: ${availableNames}` : ""));
  };

  /**
   * Convert one [lon, lat] pair into an ArcGIS stop.
   */
  const createStop = (coordinate: RoutingCoordinate, index: number, totalStops: number) => {
    const [lon, lat] = coordinate;

    /*
     * Match the existing Capture Route behavior:
     *
     * A / B:
     *   CurbApproach = 0
     *
     * Intermediate capture anchors:
     *   CurbApproach = 3
     */
    const isEndpoint = index === 0 || index === totalStops - 1;

    return new Graphic({
      geometry: new Point({
        x: lon,
        y: lat,

        spatialReference: {
          wkid: 4326,
        },
      }),

      attributes: {
        Name: isEndpoint ? (index === 0 ? "A_Start" : "B_End") : `Capture_${index}`,

        /*
         * CurbApproach is meaningful for the
         * vehicle-oriented Capture Route behavior.
         *
         * Walking / cycling should be allowed to
         * approach anchors from either side.
         */
        CurbApproach: travelMode === "drive" ? (isEndpoint ? 0 : 3) : 0,
      },
    });
  };

  /**
   * Convert ArcGIS route response into the common
   * Mapillary Explorer RoutingResult format.
   */
  const normalizeResult = (arcgisResult: any, activeTravelMode?: any): RoutingResult => {
    const routeResult = arcgisResult?.routeResults?.[0];

    if (!routeResult?.route) {
      throw new Error("ArcGIS routing returned no route.");
    }

    const arcgisRoute = routeResult.route;

    const attributes = arcgisRoute.attributes ?? {};

    /*
     * ArcGIS World Route normally provides:
     *
     * Total_TravelTime → minutes
     */
    /*
     * --------------------------------------------------------
     * NORMALIZE TIME COST
     * --------------------------------------------------------
     *
     * Driving:
     *   Total_TravelTime
     *
     * Walking:
     *   Total_WalkTime
     *
     * Custom travel modes may use another time attribute.
     */

    const timeAttributeName = String(activeTravelMode?.timeAttributeName ?? activeTravelMode?.impedanceAttributeName ?? "").trim();

    const preferredTimeField = timeAttributeName ? `Total_${timeAttributeName}` : null;

    const timeFieldCandidates = [preferredTimeField, "Total_TravelTime", "Total_WalkTime", "Total_Minutes", "Total_TruckTravelTime", "Total_TruckMinutes"].filter(
      (field): field is string => Boolean(field),
    );

    /*
     * Match case-insensitively as well because
     * Enterprise/custom services can differ in
     * output-field casing.
     */
    const attributeKeyByLowerCase = new Map<string, string>();

    Object.keys(attributes).forEach((key) => {
      attributeKeyByLowerCase.set(key.toLowerCase(), key);
    });

    let durationMinutes = NaN;

    let durationFieldUsed: string | null = null;

    for (const candidate of timeFieldCandidates) {
      const actualKey = attributeKeyByLowerCase.get(candidate.toLowerCase());

      if (!actualKey) {
        continue;
      }

      const value = Number(attributes[actualKey]);

      if (Number.isFinite(value)) {
        durationMinutes = value;

        durationFieldUsed = actualKey;

        break;
      }
    }

    if (!Number.isFinite(durationMinutes)) {
      console.warn("[CaptureRoute][ArcGIS] Route attributes:", attributes);

      console.warn("[CaptureRoute][ArcGIS] Active travel mode:", activeTravelMode);

      throw new Error("ArcGIS route did not return a valid travel time. " + `Expected one of: ${timeFieldCandidates.join(", ")}`);
    }

    console.debug(`[CaptureRoute][ArcGIS] Duration field: ` + `${durationFieldUsed} = ` + `${durationMinutes.toFixed(2)} min`);

    /*
     * Primary distance field used by the current
     * Capture Route implementation.
     */
    const kilometers = Number(attributes.Total_Kilometers);

    let distanceMeters = Number.isFinite(kilometers) ? kilometers * 1000 : NaN;

    /*
     * Some custom / Enterprise services may expose
     * miles instead of kilometres.
     */
    if (!Number.isFinite(distanceMeters)) {
      const miles = Number(attributes.Total_Miles);

      if (Number.isFinite(miles)) {
        distanceMeters = miles * 1609.344;
      }
    }

    if (!Number.isFinite(distanceMeters)) {
      const meters = Number(attributes.Total_Meters);

      if (Number.isFinite(meters)) {
        distanceMeters = meters;
      }
    }

    if (!Number.isFinite(distanceMeters)) {
      throw new Error("ArcGIS route did not return " + "a valid route distance.");
    }

    /*
     * ArcGIS polyline paths:
     *
     * [
     *   [
     *     [lon, lat],
     *     [lon, lat],
     *     ...
     *   ]
     * ]
     */
    const rawPaths = arcgisRoute?.geometry?.paths ?? [];

    const paths: RoutingCoordinate[][] = rawPaths
      .map((path: any[]) =>
        path
          .map((coordinate: any): RoutingCoordinate => [Number(coordinate[0]), Number(coordinate[1])])

          .filter((coordinate: RoutingCoordinate) => Number.isFinite(coordinate[0]) && Number.isFinite(coordinate[1])),
      )

      .filter((path: RoutingCoordinate[]) => path.length >= 2);

    if (!paths.length) {
      throw new Error("ArcGIS route geometry is empty.");
    }

    return {
      durationMinutes,

      distanceMeters,

      paths,

      /*
       * Keep the original result available only
       * for diagnostics/provider-specific debugging.
       *
       * Optimizer code should not depend on this.
       */
      raw: arcgisResult,
    };
  };

  /**
   * Provider implementation.
   */
  return {
    kind,

    label,

    async solve(options: RoutingSolveOptions): Promise<RoutingResult> {
      if (!options.stops || options.stops.length < 2) {
        throw new Error("Routing requires at least " + "two stops.");
      }

      const arcgisTravelMode = await resolveArcGISTravelMode();

      const features = options.stops.map((coordinate, index) => createStop(coordinate, index, options.stops.length));

      const routeParameterProperties: any = {
        stops: new FeatureSet({
          features,
        }),

        returnDirections: false,

        returnRoutes: true,

        findBestSequence: options.preserveStopOrder === false,

        preserveFirstStop: options.preserveEndpoints !== false,

        preserveLastStop: options.preserveEndpoints !== false,

        /*
         * Keep existing driving behavior.
         *
         * When travelMode is present ArcGIS uses the
         * mode's own U-turn/network restrictions.
         */
        restrictUTurns: "at-dead-ends-and-intersections",

        outSpatialReference: {
          wkid: 4326,
        },
      };

      if (arcgisTravelMode) {
        routeParameterProperties.travelMode = arcgisTravelMode;
      }

      const routeParameters = new RouteParameters(routeParameterProperties);

      /*
       * ArcGIS Location Services authentication.
       *
       * Never append this to routeUrl.
       */
      if (apiKey) {
        routeParameters.apiKey = apiKey;
      }

      const result = await route.solve(routeUrl, routeParameters);

      return normalizeResult(result, arcgisTravelMode);
    },
  };
};
