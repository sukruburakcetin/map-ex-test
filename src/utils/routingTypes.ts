/**
 * Common routing types used by every routing engine.
 *
 * ArcGIS, Valhalla and OSRM all return different response
 * structures. Mapillary Explorer normalizes them into this
 * format before the Capture Route optimizer uses them.
 */

/**
 * Longitude / latitude coordinate.
 */
export type RoutingCoordinate = [number, number];

export type CaptureTravelMode =
  | "drive"
  | "walk"
  | "bike";

/**
 * A normalized route returned by any routing engine.
 */
export interface RoutingResult {
  /**
   * Total route duration in minutes.
   */
  durationMinutes: number;

  /**
   * Total route distance in meters.
   */
  distanceMeters: number;

  /**
   * Route geometry.
   *
   * Kept as an array of paths because ArcGIS may return
   * multipart polylines.
   *
   * OSRM and Valhalla normally return one path and will
   * therefore simply use:
   *
   * [
   *   [
   *     [lon, lat],
   *     [lon, lat],
   *     ...
   *   ]
   * ]
   */
  paths: RoutingCoordinate[][];

  /**
   * Optional original provider response.
   *
   * Useful for diagnostics during development without
   * making the optimizer depend on provider-specific data.
   */
  raw?: any;
}

/**
 * Generic options understood by Mapillary Explorer's
 * routing layer.
 *
 * Individual providers may translate these options into
 * their own API-specific parameters.
 */
export interface RoutingSolveOptions {
  /**
   * Ordered route stops:
   *
   * A → Capture 1 → Capture 2 → ... → B
   */
  stops: RoutingCoordinate[];

  /**
   * Keep the supplied stop order.
   *
   * Capture Route normally requires this to remain true.
   */
  preserveStopOrder?: boolean;

  /**
   * Indicates that A and B are fixed endpoints.
   */
  preserveEndpoints?: boolean;
}

/**
 * Routing engines supported by Mapillary Explorer.
 */
export type RoutingProviderKind = "arcgis-world" | "arcgis-portal" | "arcgis-custom" | "valhalla" | "osrm";

/**
 * Common routing provider interface.
 *
 * Every routing implementation must accept Mapillary
 * Explorer route options and return the same normalized
 * RoutingResult.
 */
export interface RoutingPreflightResult {
  durationMinutes: number;
  legDurationMinutes: number[];
  waypointSnapDistancesMeters: number[];
}

export interface RoutingProvider {
  kind: RoutingProviderKind;
  label: string;

  solve(options: RoutingSolveOptions): Promise<RoutingResult>;

  preflightOrderedStops?(stops: RoutingCoordinate[]): Promise<RoutingPreflightResult>;
}
