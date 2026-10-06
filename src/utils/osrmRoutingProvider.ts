import type { RoutingProvider, RoutingResult, RoutingSolveOptions, RoutingCoordinate, RoutingPreflightResult } from "./routingTypes";
import { distanceMeters } from "./geoUtils";

export interface OSRMRoutingProviderConfig {
  /**
   * Base OSRM server URL.
   *
   * Examples:
   *
   * https://router.project-osrm.org
   *
   * or a self-hosted server:
   *
   * https://routing.example.org
   */
  baseUrl: string;

  /**
   * OSRM profile.
   *
   * Most public / standard OSRM servers expose:
   *
   * driving
   *
   * A self-hosted server may use other profiles.
   */
  profile?: string;

  label?: string;
}

interface OSRMLeg {
  distance: number;
  duration: number;
}

interface OSRMWaypoint {
  location: RoutingCoordinate;
  distance: number;
  name?: string;
}

interface OSRMRoute {
  distance: number;

  duration: number;

  legs?: OSRMLeg[];

  geometry: {
    type: "LineString";

    coordinates: RoutingCoordinate[];
  };
}

interface OSRMResponse {
  code: string;

  message?: string;

  routes?: OSRMRoute[];

  waypoints?: OSRMWaypoint[];
}

interface OSRMTableResponse {
  code: string;

  message?: string;

  durations?: Array<Array<number | null>>;

  sources?: OSRMWaypoint[];

  destinations?: OSRMWaypoint[];
}

/**
 * Creates an OSRM-backed routing provider.
 *
 * No ArcGIS modules, API key, or ArcGIS authentication
 * are required.
 */
export const createOSRMRoutingProvider = (config: OSRMRoutingProviderConfig): RoutingProvider => {
  const baseUrl = config.baseUrl.trim().replace(/\/+$/, "");

  const profile = config.profile?.trim() || "driving";

  const label = config.label || "OSRM";

  if (!baseUrl) {
    throw new Error("OSRM server URL is not configured.");
  }

  const preflightOrderedStops = async (stops: RoutingCoordinate[]): Promise<RoutingPreflightResult> => {
    if (stops.length < 2) {
      return {
        durationMinutes: 0,
        legDurationMinutes: [],
        waypointSnapDistancesMeters: [],
      };
    }

    /*
     * --------------------------------------------------------
     * BUILD TABLE REQUEST
     * --------------------------------------------------------
     *
     * We want only consecutive legs:
     *
     *   stop 0 -> stop 1
     *   stop 1 -> stop 2
     *   stop 2 -> stop 3
     *   ...
     *
     * OSRM Table returns a source × destination matrix.
     * The consecutive legs therefore sit on the diagonal.
     */

    const coordinatePath = stops.map(([lon, lat]) => `${lon},${lat}`).join(";");

    const sourceIndexes = stops
      .slice(0, -1)
      .map((_, index) => index)
      .join(";");

    const destinationIndexes = stops
      .slice(1)
      .map((_, index) => index + 1)
      .join(";");

    const url = `${baseUrl}` + `/table/v1/${profile}/` + `${coordinatePath}` + `?sources=${sourceIndexes}` + `&destinations=${destinationIndexes}` + `&annotations=duration`;

    /*
     * --------------------------------------------------------
     * REQUEST
     * --------------------------------------------------------
     */

    let response: Response;

    try {
      response = await fetch(url);
    } catch {
      throw new Error("Could not connect to the OSRM Table service.");
    }

    if (!response.ok) {
      throw new Error(`OSRM table request failed with HTTP ` + `${response.status}.`);
    }

    let data: OSRMTableResponse;

    try {
      data = await response.json();
    } catch {
      throw new Error("OSRM Table returned an invalid response.");
    }

    if (data.code !== "Ok" || !Array.isArray(data.durations)) {
      throw new Error(data.message ? `OSRM Table: ${data.message}` : "OSRM Table preflight failed.");
    }

    /*
     * --------------------------------------------------------
     * WAYPOINT SNAP DISTANCES
     * --------------------------------------------------------
     *
     * Table API does NOT return route.waypoints.
     *
     * It returns:
     *
     *   sources      -> stop 0 .. stop N-2
     *   destinations -> stop 1 .. stop N-1
     *
     * Reconstruct one snap distance for every supplied stop.
     */

    const waypointSnapDistancesMeters = new Array<number>(stops.length).fill(0);

    (data.sources ?? []).forEach((waypoint, sourceIndex) => {
      const distance = Number(waypoint?.distance ?? 0);

      if (Number.isFinite(distance) && sourceIndex < waypointSnapDistancesMeters.length) {
        waypointSnapDistancesMeters[sourceIndex] = distance;
      }
    });

    (data.destinations ?? []).forEach((waypoint, destinationIndex) => {
      /*
       * destination 0 corresponds
       * to original stop 1.
       */
      const stopIndex = destinationIndex + 1;

      const distance = Number(waypoint?.distance ?? 0);

      if (Number.isFinite(distance) && stopIndex < waypointSnapDistancesMeters.length) {
        /*
         * Intermediate stops appear both as
         * a source and destination.
         *
         * Keep the larger value so our diagnostic
         * remains conservative.
         */
        waypointSnapDistancesMeters[stopIndex] = Math.max(waypointSnapDistancesMeters[stopIndex], distance);
      }
    });

    /*
     * --------------------------------------------------------
     * CONSECUTIVE LEG DURATIONS
     * --------------------------------------------------------
     */

    const legDurationMinutes: number[] = [];

    for (let index = 0; index < stops.length - 1; index++) {
      const seconds = data.durations?.[index]?.[index];

      if (seconds === null || !Number.isFinite(Number(seconds))) {
        throw new Error(`OSRM Table found no route for ` + `stop ${index} → ${index + 1}.`);
      }

      legDurationMinutes.push(Number(seconds) / 60);
    }

    const durationMinutes = legDurationMinutes.reduce((sum, minutes) => sum + minutes, 0);

    return {
      durationMinutes,
      legDurationMinutes,
      waypointSnapDistancesMeters,
    };
  };

  return {
    kind: "osrm",

    label,

    preflightOrderedStops,

    async solve(options: RoutingSolveOptions): Promise<RoutingResult> {
      /*
       * --------------------------------------------------------
       * VALIDATE STOPS
       * --------------------------------------------------------
       */

      if (!options.stops || options.stops.length < 2) {
        throw new Error("OSRM routing requires at least two stops.");
      }

      /*
       * Capture Route requires the supplied
       * A → capture anchors → B order.
       *
       * OSRM Route service naturally routes coordinates
       * in the order supplied.
       */
      if (options.preserveStopOrder === false) {
        throw new Error("OSRM provider does not support " + "waypoint reordering in Capture Route mode.");
      }

      /*
       * --------------------------------------------------------
       * BUILD COORDINATE PATH
       * --------------------------------------------------------
       *
       * OSRM uses:
       *
       * lon,lat;lon,lat;lon,lat
       */

      const coordinatePath = options.stops.map(([lon, lat]) => `${lon},${lat}`).join(";");

      /*
       * Full geometry is important because our later
       * route-coverage calculation measures proximity
       * between the final route and target road segments.
       *
       * Do not use OSRM's default simplified overview.
       */
      const url =
        `${baseUrl}` +
        `/route/v1/${profile}/` +
        `${coordinatePath}` +
        `?alternatives=false` +
        `&steps=false` +
        `&geometries=geojson` +
        `&overview=full` +
        `&continue_straight=false`;

      /*
       * --------------------------------------------------------
       * REQUEST
       * --------------------------------------------------------
       */

      let response: Response;

      try {
        response = await fetch(url);
      } catch (error) {
        throw new Error("Could not connect to the OSRM routing server.");
      }

      /*
       * HTTP-level failure.
       */
      if (!response.ok) {
        throw new Error(`OSRM request failed with HTTP ` + `${response.status}.`);
      }

      let data: OSRMResponse;

      try {
        data = await response.json();
      } catch {
        throw new Error("OSRM returned an invalid response.");
      }

      /*
       * --------------------------------------------------------
       * OSRM-LEVEL FAILURE
       * --------------------------------------------------------
       */

      if (data.code !== "Ok") {
        throw new Error(data.message ? `OSRM: ${data.message}` : `OSRM routing failed: ${data.code}`);
      }

      const osrmRoute = data.routes?.[0];

      if (!osrmRoute) {
        throw new Error("OSRM returned no route.");
      }

      const routeResult = data.routes?.[0];

      const waypointDiagnostics = (data.waypoints ?? []).map((waypoint: any, index: number) => ({
        index,

        requested: options.stops[index],

        snapped: waypoint.location,

        snapDistanceMeters: Number(Number(waypoint.distance ?? 0).toFixed(1)),

        name: waypoint.name ?? "",
      }));

      console.log("[CaptureRoute][OSRM] Waypoints:", waypointDiagnostics);

      const worstWaypointSnaps = waypointDiagnostics
        .slice()
        .sort((a, b) => b.snapDistanceMeters - a.snapDistanceMeters)
        .slice(0, 15);

      console.log("[CaptureRoute][OSRM] Worst waypoint snaps:\n" + JSON.stringify(worstWaypointSnaps, null, 2));

      const legDiagnostics = (routeResult?.legs ?? []).map((leg: any, index: number) => {
        const from = options.stops[index];

        const to = options.stops[index + 1];

        const directMeters = from && to ? distanceMeters(from[1], from[0], to[1], to[0]) : 0;

        const routedMeters = Number(leg.distance ?? 0);

        return {
          fromStop: index,
          toStop: index + 1,

          directMeters: Math.round(directMeters),

          routedMeters: Math.round(routedMeters),

          stretchRatio: directMeters > 0 ? Number((routedMeters / directMeters).toFixed(1)) : null,

          durationMin: Number((Number(leg.duration ?? 0) / 60).toFixed(1)),

          fromSnapMeters: waypointDiagnostics[index]?.snapDistanceMeters ?? null,

          toSnapMeters: waypointDiagnostics[index + 1]?.snapDistanceMeters ?? null,
        };
      });

      const worstLegs = [...legDiagnostics].sort((a, b) => b.durationMin - a.durationMin).slice(0, 12);

      console.log("[CaptureRoute][OSRM] Worst legs:\n" + JSON.stringify(worstLegs, null, 2));

      const worstStretchLegs = [...legDiagnostics]
        .filter((leg) => leg.stretchRatio !== null)
        .sort((a, b) => (b.stretchRatio ?? 0) - (a.stretchRatio ?? 0))
        .slice(0, 12);

      console.log("[CaptureRoute][OSRM] Worst network stretch:\n" + JSON.stringify(worstStretchLegs, null, 2));

      /*
       * --------------------------------------------------------
       * NORMALIZE DURATION
       * --------------------------------------------------------
       *
       * OSRM:
       *   seconds
       *
       * Mapillary Explorer:
       *   minutes
       */

      const durationSeconds = Number(osrmRoute.duration);

      if (!Number.isFinite(durationSeconds)) {
        throw new Error("OSRM returned an invalid route duration.");
      }

      const durationMinutes = durationSeconds / 60;

      /*
       * --------------------------------------------------------
       * NORMALIZE DISTANCE
       * --------------------------------------------------------
       *
       * OSRM already returns meters.
       */

      const routeDistanceMeters = Number(osrmRoute.distance);

      if (!Number.isFinite(routeDistanceMeters)) {
        throw new Error("OSRM returned an invalid route distance.");
      }

      /*
       * --------------------------------------------------------
       * NORMALIZE GEOMETRY
       * --------------------------------------------------------
       */

      const coordinates = osrmRoute.geometry?.coordinates;

      if (!Array.isArray(coordinates) || coordinates.length < 2) {
        throw new Error("OSRM route geometry is empty.");
      }

      const path: RoutingCoordinate[] = coordinates
        .map((coordinate): RoutingCoordinate => [Number(coordinate[0]), Number(coordinate[1])])

        .filter((coordinate) => Number.isFinite(coordinate[0]) && Number.isFinite(coordinate[1]));

      if (path.length < 2) {
        throw new Error("OSRM route geometry contains " + "no valid coordinates.");
      }

      /*
       * --------------------------------------------------------
       * COMMON MAPILLARY EXPLORER RESULT
       * --------------------------------------------------------
       */

      return {
        durationMinutes,

        distanceMeters: routeDistanceMeters,

        paths: [path],

        raw: data,
      };
    },
  };
};
