/**
 * geoUtils.ts
 * Pure geographic / math helpers with no React or ArcGIS dependency.
 * Every function here is a plain input → output transformation.
 */

// Haversine distance

/**
 * Returns the great-circle distance in metres between two WGS-84 coordinates.
 * Used to find the nearest sequence image to a map click.
 */
export function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6_371_000; // Earth radius in metres
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Bearing

/**
 * Returns the initial compass bearing (0–360°) from point 1 to point 2.
 * Used when auto-rotating the ArcGIS camera toward a detected object.
 */
export function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);

  const brng = toDeg(Math.atan2(y, x));
  return (brng + 360) % 360;
}

// Tile math

/**
 * Converts a WGS-84 longitude/latitude pair to XYZ map tile indices
 * for the given zoom level (Web Mercator / TMS scheme).
 */
export function lngLatToTile(lon: number, lat: number, zoom: number): { x: number; y: number } {
  const xTile = Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
  const yTile = Math.floor(((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * Math.pow(2, zoom));
  return { x: xTile, y: yTile };
}

/**
 * Returns every XYZ tile that intersects the given bounding box
 * at the requested zoom level.
 * @param bbox  [minLon, minLat, maxLon, maxLat] in WGS-84 (number[] or 4-tuple)
 * @param zoom  Tile zoom level (Mapillary typically uses 14)
 * @returns     Array of [x, y, zoom] tuples
 */
export function bboxToTileRange(bbox: number[], zoom: number): Array<[number, number, number]> {
  const minTile = lngLatToTile(bbox[0], bbox[3], zoom); // top-left
  const maxTile = lngLatToTile(bbox[2], bbox[1], zoom); // bottom-right

  const tiles: Array<[number, number, number]> = [];
  for (let x = minTile.x; x <= maxTile.x; x++) {
    for (let y = minTile.y; y <= maxTile.y; y++) {
      tiles.push([x, y, zoom]);
    }
  }
  return tiles;
}

// Cone geometry (for minimap - no ArcGIS import needed, returns plain object)

/**
 * Builds a plain-object polygon geometry (ArcGIS-compatible shape literal)
 * representing a camera view cone centred at (lon, lat) pointing at `heading`.
 * Used by updateMinimapTracking() to draw the orange cone on the minimap.
 * Returns a plain object, the caller is responsible for wrapping it in a
 * `new Graphic({ geometry: ... })` call with the ArcGIS SDK.
 */
export function createConeGeometry(
  lon: number,
  lat: number,
  heading: number,
  radiusMeters: number,
  spreadDeg: number,
): { type: string; rings: [number, number][][]; spatialReference: { wkid: number } } {
  const metersToDegreesLat = (m: number) => m / 111_320;
  const metersToDegreesLon = (m: number, refLat: number) => m / (111_320 * Math.cos((refLat * Math.PI) / 180));

  const rLat = metersToDegreesLat(radiusMeters);
  const rLon = metersToDegreesLon(radiusMeters, lat);

  const startAngle = heading - spreadDeg / 2;
  const endAngle = heading + spreadDeg / 2;

  const coords: [number, number][] = [[lon, lat]];

  for (let angle = startAngle; angle <= endAngle; angle += 5) {
    const rad = (angle * Math.PI) / 180;
    coords.push([lon + rLon * Math.sin(rad), lat + rLat * Math.cos(rad)]);
  }
  coords.push([lon, lat]);

  return {
    type: "polygon",
    rings: [coords],
    spatialReference: { wkid: 4326 },
  };
}

// Misc

/**
 * Generic debounce. Returns a debounced version of `func` that fires only
 * after `wait` ms of silence.
 * Optionally exposes a `cancel()` method on the returned function.
 */
export function debounce<T extends (...args: any[]) => void>(func: T, wait: number): T & { cancel: () => void } {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timeout !== null) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };

  debounced.cancel = () => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced as T & { cancel: () => void };
}

/**
 * Formats a Mapillary traffic sign code (e.g. "warning--yield-ahead--g3")
 * into a human-readable label ("Warning Yield Ahead G3").
 */
export function formatTrafficSignName(code: string): string {
  if (!code) return "Unknown";
  return code
    .split("--")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/**
 * Default color palette for sequence overlays.
 * Each item is [R, G, B, A] with RGB 0–255 and Alpha 0–1.
 * Intentionally avoids pure blue so blue sequence markers remain visually
 * distinct from sequence polylines. Order maximises contrast between
 * neighbouring sequences and follows common cartographic practices.
 */
export const SEQUENCE_COLORS: ReadonlyArray<[number, number, number, number]> = [
  [255, 0, 0, 1], // red
  [0, 200, 0, 1], // green
  [255, 165, 0, 1], // orange
  [160, 32, 240, 1], // purple
  [255, 192, 203, 1], // pink
  [128, 0, 128, 1], // dark purple
  [255, 255, 0, 1], // yellow
  [128, 128, 128, 1], // grey
  [0, 255, 255, 1], // cyan
];

/**
 * Returns a visually distinct [R, G, B, A] color for a given sequence index.
 * Cycles through SEQUENCE_COLORS, darkening by 10 % on each full cycle so
 * later sequences remain distinguishable without repeating exactly.
 * @param index; Zero-based sequence index from availableSequences.
 * @returns [R, G, B, A] array suitable for ArcGIS symbol color.
 */
export function pickSequenceColor(index: number): number[] {
  const color = [...SEQUENCE_COLORS[index % SEQUENCE_COLORS.length]];
  const cycle = Math.floor(index / SEQUENCE_COLORS.length);
  if (cycle > 0) {
    const factor = 1 - cycle * 0.1;
    color[0] = Math.max(0, color[0] * factor);
    color[1] = Math.max(0, color[1] * factor);
    color[2] = Math.max(0, color[2] * factor);
    // alpha unchanged
  }
  return color;
}

// Street Coverage Analysis

/**
 * Represents a single OSM road segment as a pair of [lon, lat] endpoints.
 */
export interface RoadSegment {
  start: [number, number];
  end: [number, number];
  lengthMeters: number;
  /** OSM highway tag value e.g. 'residential', 'primary'. Used for per-type threshold. */
  highwayType: string;
  /**
   * True when the OSM way has oneway=yes/-1/true.
   * Oneway ways are always ONE half of a dual-carriageway pair ; the OSM
   * centreline is offset from the physical road centre by the lane/median
   * width. A boosted threshold is applied so coverage points driving in
   * either lane still match the opposing-direction way.
   */
  isOneway: boolean;
}

/**
 * Parses raw Overpass API response into a flat array of RoadSegments.
 * Each OSM way is split into consecutive node pairs.
 */
export function parseOverpassRoads(overpassJson: any): RoadSegment[] {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;

  const haversine = (a: [number, number], b: [number, number]) => {
    const dLat = toRad(b[1] - a[1]);
    const dLon = toRad(b[0] - a[0]);
    const sin2 = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(sin2), Math.sqrt(1 - sin2));
  };

  const segments: RoadSegment[] = [];
  for (const element of overpassJson?.elements ?? []) {
    if (element.type !== "way" || !element.geometry) continue;
    const highwayType: string = element.tags?.highway ?? "residential";
    const onewayTag = element.tags?.oneway;
    const isOneway = onewayTag === "yes" || onewayTag === "-1" || onewayTag === "true" || onewayTag === "1";
    const nodes: [number, number][] = element.geometry.map((n: any) => [n.lon, n.lat]);
    for (let i = 0; i < nodes.length - 1; i++) {
      segments.push({
        start: nodes[i],
        end: nodes[i + 1],
        lengthMeters: haversine(nodes[i], nodes[i + 1]),
        highwayType,
        isOneway,
      });
    }
  }
  return segments;
}

/**
 * Returns the distance in metres between two [lon, lat] points.
 * Uses planar approximation ; accurate enough at street scale.
 */
function pointDistanceMeters(p: [number, number], q: [number, number]): number {
  const R = 6_371_000;
  const mPerDegLat = (Math.PI / 180) * R;
  const mPerDegLon = mPerDegLat * Math.cos((((p[1] + q[1]) / 2) * Math.PI) / 180);
  const dx = (p[0] - q[0]) * mPerDegLon;
  const dy = (p[1] - q[1]) * mPerDegLat;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Returns an interpolated point along segment AB at fraction t (0=A, 1=B).
 */
function interpolate(a: [number, number], b: [number, number], t: number): [number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/**
  * Computes an inset bounding box in WGS84 degrees by shrinking each edge
  * inward by `insetMeters`. Used to exclude segments near the bbox edge whose
  * coverage point neighbourhood may be incomplete due to tile truncation.

  * @param bbox        [west, south, east, north] in WGS84 degrees
  * @param insetMeters Margin to strip from each edge
  * @returns           [west, south, east, north] of the inner bbox
*/
export function insetBbox(bbox: [number, number, number, number], insetMeters: number): [number, number, number, number] {
  const [west, south, east, north] = bbox;
  const R = 6_371_000;
  const midLat = (south + north) / 2;
  const degPerMLat = 180 / (Math.PI * R);
  const degPerMLon = degPerMLat / Math.cos((midLat * Math.PI) / 180);

  const dLat = insetMeters * degPerMLat;
  const dLon = insetMeters * degPerMLon;

  return [west + dLon, south + dLat, east - dLon, north - dLat];
}

/**
 * Returns true if the midpoint of segment [start, end] falls inside bbox.
 * Used to exclude edge segments from analysis.
 */
export function segmentMidpointInBbox(seg: { start: [number, number]; end: [number, number] }, bbox: [number, number, number, number]): boolean {
  const midLon = (seg.start[0] + seg.end[0]) / 2;
  const midLat = (seg.start[1] + seg.end[1]) / 2;
  const [west, south, east, north] = bbox;
  return midLon >= west && midLon <= east && midLat >= south && midLat <= north;
}

/**
 * Determines which road segments are covered by Mapillary coverage points
 * using a robust multi-node sampling strategy.
 *
 * THE PROBLEM WITH PURE MIDPOINT MATCHING:
 *  If a road is highly curved or long, and points only exist at the 30% and 70%
 *  marks, the strict mathematical midpoint (50%) is too far away. The road is
 *  falsely marked as RED (uncovered).
 *
 * THE MULTI-NODE SAMPLING SOLUTION:
 *  We dynamically divide the road geometry into ~15-meter chunks and generate
 *  a virtual sample probe in each chunk.
 *  - A 10m segment gets 1 probe.
 *  - A 45m segment gets 3 probes.
 *  - A 150m segment gets 10 probes.
 *
 *  We evaluate how many of these 15m probes have a Mapillary point nearby.
 *  If at least `minPoints` probes find a match (or 1 probe for tiny segments),
 *  the entire road segment is successfully marked as Covered!
 *  This perfectly hugs curves and naturally ignores intersection corners
 *  since probes are distributed proportionally inside the road boundaries.
 *
 * @param points          Array of [lon, lat] Mapillary coverage points
 * @param segments        Road segments from parseOverpassRoads()
 * @param thresholdMeters Max distance from probe point (use COVERAGE_SNAP_THRESHOLD_METERS)
 * @param minPoints       Min covered samples required to pass the segment
 * @returns               Covered and total segment counts and lengths in km
 */
export function snapPointsToSegments(
  points: [number, number][],
  segments: RoadSegment[],
  thresholdMeters: number,
  minPoints: number = 2,
  highwayThresholds: Record<string, number> = {},
  pointTimestamps: (number | null)[] = [],
): {
  coveredCount: number;
  totalCount: number;
  coveredKm: number;
  remainingKm: number;
  percentCovered: number;
  segmentDates: (number | null)[];
  segmentTiers: Array<"fresh" | "aging" | "stale" | "none">;
  freshCount: number;
  freshKm: number;
  agingCount: number;
  agingKm: number;
  staleCount: number;
  staleKm: number;
  noneCount: number;
  noneKm: number;
} {
  // Freshness thresholds in ms (2yr and 4yr)
  const FRESH_MS = 2 * 365.25 * 24 * 60 * 60 * 1000;
  const AGING_MS = 4 * 365.25 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  if (!segments.length) {
    return {
      coveredCount: 0,
      totalCount: 0,
      coveredKm: 0,
      remainingKm: 0,
      percentCovered: 0,
      segmentDates: [],
      segmentTiers: [],
      freshCount: 0,
      freshKm: 0,
      agingCount: 0,
      agingKm: 0,
      staleCount: 0,
      staleKm: 0,
      noneCount: 0,
      noneKm: 0,
    };
  }

  // We place a sample probe along the road every 15 meters
  const SAMPLE_INTERVAL_M = 15;

  let coveredCount = 0;
  let coveredKm = 0;
  let remainingKm = 0;
  let freshCount = 0,
    freshKm = 0;
  let agingCount = 0,
    agingKm = 0;
  let staleCount = 0,
    staleKm = 0;
  let noneCount = 0,
    noneKm = 0;

  const segmentDates: (number | null)[] = [];
  const segmentTiers: Array<"fresh" | "aging" | "stale" | "none"> = [];

  for (const seg of segments) {
    const baseT = highwayThresholds[seg.highwayType] ?? thresholdMeters;
    const T = seg.isOneway ? Math.round(baseT * 1.25) : baseT;
    let covered = false;
    let mostRecentDate: number | null = null;

    // We use a Set to collect unique indices of points that hit any probe
    // so we can calculate the majority-vote freshness tier at the end.
    const matchedIndices = new Set<number>();

    // Calculate how many sample points to generate based on segment length
    const numSamples = Math.max(1, Math.ceil(seg.lengthMeters / SAMPLE_INTERVAL_M));

    const probes: [number, number][] = [];
    for (let p = 1; p <= numSamples; p++) {
      // Space out the probes evenly, purposefully avoiding t=0 and t=1
      // to prevent intersection bleeding between crossing roads.
      const t = p / (numSamples + 1);
      probes.push(interpolate(seg.start, seg.end, t));
    }

    let coveredSamplesCount = 0;

    // Test each virtual probe point against the Mapillary dots
    for (const probe of probes) {
      let probeHasCoverage = false;

      for (let i = 0; i < points.length; i++) {
        if (pointDistanceMeters(points[i], probe) <= T) {
          probeHasCoverage = true;
          matchedIndices.add(i);

          const ts = pointTimestamps[i] ?? null;
          if (ts !== null && (mostRecentDate === null || ts > mostRecentDate)) {
            mostRecentDate = ts;
          }
        }
      }

      if (probeHasCoverage) {
        coveredSamplesCount++;
      }
    }

    // To mark the entire road as green/covered, we require enough probes to be hit.
    // If the segment is extremely short (1 probe), it only needs 1 hit.
    // For anything longer, it needs `minPoints` covered samples (Defaults to 2).
    const requiredSamples = numSamples === 1 ? 1 : Math.min(minPoints, numSamples);

    if (coveredSamplesCount >= requiredSamples) {
      covered = true;
    }

    // Build flat timestamp array from deduplicated matched indices for tier voting
    const tierMatchTimestamps = Array.from(matchedIndices).map((i) => pointTimestamps[i] ?? null);

    segmentDates.push(covered ? mostRecentDate : null);

    const km = seg.lengthMeters / 1000;
    if (!covered) {
      noneCount++;
      noneKm += km;
      remainingKm += km;
      segmentTiers.push("none");
    } else {
      coveredCount++;
      coveredKm += km;

      // TIER CLASSIFICATION ; majority vote among all matching points.
      // "Most recent wins" causes a single stray fresh point to override hundreds
      // of stale points, making a poorly-documented street look falsely green.
      const tierVotes = { fresh: 0, aging: 0, stale: 0 };
      for (let i = 0; i < tierMatchTimestamps.length; i++) {
        const ts = tierMatchTimestamps[i];
        const age = ts !== null ? now - ts : Infinity;
        if (age <= FRESH_MS) tierVotes.fresh++;
        else if (age <= AGING_MS) tierVotes.aging++;
        else tierVotes.stale++;
      }

      // Pick tier with the most votes; ties broken in favour of worse tier
      // (stale > aging > fresh) so we don't over-report coverage quality.
      let dominantTier: "fresh" | "aging" | "stale";
      if (tierVotes.stale >= tierVotes.aging && tierVotes.stale >= tierVotes.fresh) {
        dominantTier = "stale";
      } else if (tierVotes.aging >= tierVotes.fresh) {
        dominantTier = "aging";
      } else {
        dominantTier = "fresh";
      }

      if (dominantTier === "fresh") {
        freshCount++;
        freshKm += km;
        segmentTiers.push("fresh");
      } else if (dominantTier === "aging") {
        agingCount++;
        agingKm += km;
        segmentTiers.push("aging");
      } else {
        staleCount++;
        staleKm += km;
        segmentTiers.push("stale");
      }
    }
  }

  const totalCount = segments.length;
  const percentCovered = totalCount > 0 ? Math.round((coveredCount / totalCount) * 100) : 0;

  return {
    coveredCount,
    totalCount,
    coveredKm: Math.round(coveredKm * 100) / 100,
    remainingKm: Math.round(remainingKm * 100) / 100,
    percentCovered,
    segmentDates,
    segmentTiers,
    freshCount,
    freshKm: Math.round(freshKm * 100) / 100,
    agingCount,
    agingKm: Math.round(agingKm * 100) / 100,
    staleCount,
    staleKm: Math.round(staleKm * 100) / 100,
    noneCount,
    noneKm: Math.round(noneKm * 100) / 100,
  };
}

/**
 * Fast pure-math lon/lat → Web Mercator (EPSG:3857) conversion.
 * Returns an ArcGIS-compatible plain point object, or null if the
 * coordinates are invalid (lat ±90 causes tan → ±Infinity).
 * Use instead of webMercatorUtils.geographicToWebMercator() when
 * converting large batches of points (e.g. tile feature loops).
 */
export function lonLatToWebMercator(lon: number, lat: number): { x: number; y: number; type: "point"; spatialReference: { wkid: 3857 } } | null {
  if (lat >= 90 || lat <= -90) return null;
  const x = lon * 111319.49079327358;
  let y = Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180);
  y = y * 111319.49079327358;
  return { x, y, type: "point", spatialReference: { wkid: 3857 } };
}

// Solar Position Algorithm (Lightweight Astronomical Math)
// Calculates the Sun's Azimuth and Altitude based on Date and WGS84 Coordinates

const dayMs = 1000 * 60 * 60 * 24;
const J1970 = 2440588;
const J2000 = 2451545;

function toJulian(date: number) {
  return date / dayMs - 0.5 + J1970;
}
function toDays(date: number) {
  return toJulian(date) - J2000;
}

function rightAscension(l: number, b: number, e: number) {
  return Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l));
}
function declination(l: number, b: number, e: number) {
  return Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l));
}
function azimuthFunc(H: number, phi: number, dec: number) {
  return Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi));
}
function altitudeFunc(H: number, phi: number, dec: number) {
  return Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
}
function siderealTime(d: number, lw: number) {
  return (Math.PI / 180) * (280.16 + 360.9856235 * d) - lw;
}
function solarMeanAnomaly(d: number) {
  return (Math.PI / 180) * (357.5291 + 0.98560028 * d);
}
function eclipticLongitude(M: number) {
  const C = (Math.PI / 180) * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
  const P = (Math.PI / 180) * 102.9372; // perihelion of the Earth
  return M + C + P + Math.PI;
}

/**
 * Calculates the Sun's position for a given date and coordinate.
 * @param dateMs - Unix timestamp in milliseconds
 * @param lat - Latitude in degrees
 * @param lon - Longitude in degrees
 * @returns Object containing azimuth and altitude in degrees
 */
export function getSunPosition(dateMs: number, lat: number, lon: number): { azimuth: number; altitude: number } {
  const lw = (Math.PI / 180) * -lon;
  const phi = (Math.PI / 180) * lat;
  const d = toDays(dateMs);
  const e = (Math.PI / 180) * 23.4397; // obliquity of the Earth

  const M = solarMeanAnomaly(d);
  const L = eclipticLongitude(M);
  const dec = declination(L, 0, e);
  const ra = rightAscension(L, 0, e);
  const H = siderealTime(d, lw) - ra;

  let az = azimuthFunc(H, phi, dec);
  let alt = altitudeFunc(H, phi, dec);

  // Convert azimuth to degrees, with North = 0, East = 90
  az = az * (180 / Math.PI);
  az = (az + 180 + 360) % 360;

  return {
    azimuth: az,
    altitude: alt * (180 / Math.PI),
  };
}

// -----------------------------------------------------------------------------
// Route planning geometry helpers
// -----------------------------------------------------------------------------

export type LonLat = [number, number];

export interface PolylineProjection {
  point: LonLat;
  distanceMeters: number;
  alongMeters: number;
  segmentIndex: number;
}

/**
 * Approximate distance from a point to a line segment.
 * Uses the same local planar approximation already used elsewhere in this file.
 */
export function pointToSegmentDistanceMeters(point: LonLat, a: LonLat, b: LonLat): number {
  const R = 6_371_000;

  const latRef = (((point[1] + a[1] + b[1]) / 3) * Math.PI) / 180;
  const mPerDegLat = (Math.PI / 180) * R;
  const mPerDegLon = mPerDegLat * Math.cos(latRef);

  const px = point[0] * mPerDegLon;
  const py = point[1] * mPerDegLat;

  const ax = a[0] * mPerDegLon;
  const ay = a[1] * mPerDegLat;

  const bx = b[0] * mPerDegLon;
  const by = b[1] * mPerDegLat;

  const abx = bx - ax;
  const aby = by - ay;

  const ab2 = abx * abx + aby * aby;

  if (ab2 === 0) {
    return Math.sqrt((px - ax) ** 2 + (py - ay) ** 2);
  }

  const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / ab2));

  const cx = ax + t * abx;
  const cy = ay + t * aby;

  return Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
}

/**
 * Projects a geographic point onto a polyline.
 *
 * `alongMeters` is the distance from the beginning of the polyline
 * to the nearest point.
 */
export function projectPointToPolyline(point: LonLat, polyline: LonLat[]): PolylineProjection | null {
  if (!point || polyline.length < 2) return null;

  let bestDistance = Infinity;
  let bestAlong = 0;
  let bestPoint: LonLat = polyline[0];
  let bestSegmentIndex = 0;

  let accumulated = 0;

  for (let i = 0; i < polyline.length - 1; i++) {
    const a = polyline[i];
    const b = polyline[i + 1];

    const segmentLength = distanceMeters(a[1], a[0], b[1], b[0]);

    if (segmentLength === 0) continue;

    const latRef = (((point[1] + a[1] + b[1]) / 3) * Math.PI) / 180;
    const R = 6_371_000;

    const mPerDegLat = (Math.PI / 180) * R;
    const mPerDegLon = mPerDegLat * Math.cos(latRef);

    const px = point[0] * mPerDegLon;
    const py = point[1] * mPerDegLat;

    const ax = a[0] * mPerDegLon;
    const ay = a[1] * mPerDegLat;

    const bx = b[0] * mPerDegLon;
    const by = b[1] * mPerDegLat;

    const abx = bx - ax;
    const aby = by - ay;
    const ab2 = abx * abx + aby * aby;

    let t = 0;

    if (ab2 > 0) {
      t = ((px - ax) * abx + (py - ay) * aby) / ab2;

      t = Math.max(0, Math.min(1, t));
    }

    const cx = ax + t * abx;
    const cy = ay + t * aby;

    const dx = px - cx;
    const dy = py - cy;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < bestDistance) {
      bestDistance = distance;

      bestPoint = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

      bestAlong = accumulated + segmentLength * t;
      bestSegmentIndex = i;
    }

    accumulated += segmentLength;
  }

  if (!Number.isFinite(bestDistance)) return null;

  return {
    point: bestPoint,
    distanceMeters: bestDistance,
    alongMeters: bestAlong,
    segmentIndex: bestSegmentIndex,
  };
}

/**
 * Returns the total length of a polyline in metres.
 */
export function polylineLengthMeters(polyline: LonLat[]): number {
  if (polyline.length < 2) return 0;

  let total = 0;

  for (let i = 0; i < polyline.length - 1; i++) {
    total += distanceMeters(polyline[i][1], polyline[i][0], polyline[i + 1][1], polyline[i + 1][0]);
  }

  return total;
}

/**
 * Returns the minimum distance from a point to a polyline.
 */
export function pointToPolylineDistanceMeters(point: LonLat, polyline: LonLat[]): number {
  const projection = projectPointToPolyline(point, polyline);
  return projection?.distanceMeters ?? Infinity;
}

/**
 * Returns the approximate position of a point along a baseline polyline.
 * 0 = beginning, 1 = end.
 */
export function normalizedPolylinePosition(point: LonLat, polyline: LonLat[]): number {
  const projection = projectPointToPolyline(point, polyline);

  if (!projection) return 0;

  const total = polylineLengthMeters(polyline);

  if (total <= 0) return 0;

  return projection.alongMeters / total;
}

/**
 * Returns the closest distance between two geographic line segments.
 *
 * This is intentionally conservative and uses endpoint-to-segment
 * distances. It is intended for street-scale route opportunity detection,
 * not cadastral precision.
 */
export function segmentToSegmentDistanceMeters(a1: LonLat, a2: LonLat, b1: LonLat, b2: LonLat): number {
  return Math.min(
    pointToSegmentDistanceMeters(a1, b1, b2),
    pointToSegmentDistanceMeters(a2, b1, b2),
    pointToSegmentDistanceMeters(b1, a1, a2),
    pointToSegmentDistanceMeters(b2, a1, a2),
  );
}

// -----------------------------------------------------------------------------
// Final route coverage evaluation
// -----------------------------------------------------------------------------

export type RouteCoverageTier = "none" | "stale";

export interface RouteCoverageTarget {
  index: number;
  tier: RouteCoverageTier;

  start: LonLat;
  end: LonLat;

  lengthMeters: number;
}

export interface RouteCoverageSegmentResult {
  index: number;
  tier: RouteCoverageTier;

  lengthMeters: number;

  sampleCount: number;
  coveredSampleCount: number;

  coveredFraction: number;
  coveredMeters: number;
  remainingMeters: number;
}

export interface RouteCoverageEvaluation {
  totalTargetMeters: number;

  coveredTargetMeters: number;
  remainingTargetMeters: number;

  coveragePercent: number;

  noneTotalMeters: number;
  noneCoveredMeters: number;

  staleTotalMeters: number;
  staleCoveredMeters: number;

  touchedSegmentCount: number;
  fullyCoveredSegmentCount: number;

  segmentResults: RouteCoverageSegmentResult[];
}

/**
 * Measures how much of a set of target road segments lies within
 * `toleranceMeters` of the FINAL routed geometry.
 *
 * Important:
 *
 * This measures geometric route overlap / expected capture coverage.
 * It does NOT claim that Mapillary imagery has already been captured.
 *
 * Each target road segment is divided into approximately equal chunks.
 * The midpoint of each chunk is tested against the final route.
 *
 * Midpoint sampling deliberately avoids segment endpoints, which reduces
 * false coverage around road intersections.
 */
export function evaluateRouteCoverage(
  routePaths: LonLat[][],
  targets: RouteCoverageTarget[],
  toleranceMeters: number = 25,
  sampleSpacingMeters: number = 5,
): RouteCoverageEvaluation {
  const validPaths = routePaths.filter((path) => Array.isArray(path) && path.length >= 2);

  const tolerance = Math.max(0, toleranceMeters);
  const spacing = Math.max(1, sampleSpacingMeters);

  let totalTargetMeters = 0;
  let coveredTargetMeters = 0;

  let noneTotalMeters = 0;
  let noneCoveredMeters = 0;

  let staleTotalMeters = 0;
  let staleCoveredMeters = 0;

  let touchedSegmentCount = 0;
  let fullyCoveredSegmentCount = 0;

  const segmentResults: RouteCoverageSegmentResult[] = [];

  if (!validPaths.length || !targets.length) {
    return {
      totalTargetMeters: 0,
      coveredTargetMeters: 0,
      remainingTargetMeters: 0,
      coveragePercent: 0,

      noneTotalMeters: 0,
      noneCoveredMeters: 0,

      staleTotalMeters: 0,
      staleCoveredMeters: 0,

      touchedSegmentCount: 0,
      fullyCoveredSegmentCount: 0,

      segmentResults: [],
    };
  }

  for (const target of targets) {
    if (!target?.start || !target?.end) {
      continue;
    }

    const geometricLength = distanceMeters(target.start[1], target.start[0], target.end[1], target.end[0]);

    const lengthMeters = Number.isFinite(target.lengthMeters) && target.lengthMeters > 0 ? target.lengthMeters : geometricLength;

    if (!Number.isFinite(lengthMeters) || lengthMeters <= 0) {
      continue;
    }

    /*
     * Divide the road into equal sub-segments.
     *
     * Example:
     * 23 m road with 5 m spacing
     * → ceil(23 / 5) = 5 samples
     *
     * We sample the MIDPOINT of each sub-segment:
     *
     * |---x---|---x---|---x---|---x---|---x---|
     *
     * rather than the endpoints. This helps prevent a route passing
     * through an intersection from falsely counting a perpendicular
     * road as fully covered.
     */
    const sampleCount = Math.max(1, Math.ceil(lengthMeters / spacing));

    let coveredSampleCount = 0;

    for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex++) {
      const t = (sampleIndex + 0.5) / sampleCount;

      const samplePoint: LonLat = [target.start[0] + (target.end[0] - target.start[0]) * t, target.start[1] + (target.end[1] - target.start[1]) * t];

      let minimumRouteDistance = Infinity;

      /*
       * ArcGIS geometry may technically contain multiple paths.
       *
       * Test each one independently instead of flattening them and
       * accidentally creating a fake connecting segment.
       */
      for (const routePath of validPaths) {
        const d = pointToPolylineDistanceMeters(samplePoint, routePath);

        if (d < minimumRouteDistance) {
          minimumRouteDistance = d;
        }

        if (minimumRouteDistance <= tolerance) {
          break;
        }
      }

      if (minimumRouteDistance <= tolerance) {
        coveredSampleCount++;
      }
    }

    const coveredFraction = coveredSampleCount / sampleCount;

    const coveredMeters = lengthMeters * coveredFraction;

    const remainingMeters = Math.max(0, lengthMeters - coveredMeters);

    totalTargetMeters += lengthMeters;

    coveredTargetMeters += coveredMeters;

    if (target.tier === "none") {
      noneTotalMeters += lengthMeters;

      noneCoveredMeters += coveredMeters;
    } else {
      staleTotalMeters += lengthMeters;

      staleCoveredMeters += coveredMeters;
    }

    if (coveredSampleCount > 0) {
      touchedSegmentCount++;
    }

    if (coveredSampleCount === sampleCount) {
      fullyCoveredSegmentCount++;
    }

    segmentResults.push({
      index: target.index,

      tier: target.tier,

      lengthMeters,

      sampleCount,
      coveredSampleCount,

      coveredFraction,

      coveredMeters,
      remainingMeters,
    });
  }

  const remainingTargetMeters = Math.max(0, totalTargetMeters - coveredTargetMeters);

  const coveragePercent = totalTargetMeters > 0 ? (coveredTargetMeters / totalTargetMeters) * 100 : 0;

  return {
    totalTargetMeters,

    coveredTargetMeters,
    remainingTargetMeters,

    coveragePercent,

    noneTotalMeters,
    noneCoveredMeters,

    staleTotalMeters,
    staleCoveredMeters,

    touchedSegmentCount,
    fullyCoveredSegmentCount,

    segmentResults,
  };
}

export interface IncrementalRouteCoverageEvaluation {
  totalTargetMeters: number;

  baselineCoveredMeters: number;
  finalCoveredMeters: number;

  /**
   * Target road covered by the FINAL route
   * but NOT by the baseline A → B route.
   */
  incrementalCoveredMeters: number;

  /**
   * Target road covered by both routes.
   */
  sharedCoveredMeters: number;

  /**
   * Target road covered by baseline but not final.
   * Useful diagnostically when the detour leaves the original corridor.
   */
  baselineOnlyMeters: number;

  incrementalNoneMeters: number;
  incrementalStaleMeters: number;

  incrementalPercent: number;
}

function minimumDistanceToRoutePaths(point: LonLat, paths: LonLat[][]): number {
  let best = Infinity;

  for (const path of paths) {
    if (!path || path.length < 2) continue;

    const d = pointToPolylineDistanceMeters(point, path);

    if (d < best) {
      best = d;
    }

    if (best === 0) {
      break;
    }
  }

  return best;
}

/**
 * Measures the useful coverage added by a final detour route
 * compared with the normal baseline A → B route.
 *
 * The same sample points are tested against BOTH routes.
 *
 * A sample contributes to incremental coverage only when:
 *
 *   finalCovered === true
 *   baselineCovered === false
 *
 * Therefore already-covered baseline road is not credited as
 * detour-added capture value.
 */
export function evaluateIncrementalRouteCoverage(
  finalPaths: LonLat[][],
  baselinePaths: LonLat[][],
  targets: RouteCoverageTarget[],
  toleranceMeters: number = 25,
  sampleSpacingMeters: number = 5,
): IncrementalRouteCoverageEvaluation {
  const validFinalPaths = finalPaths.filter((path) => Array.isArray(path) && path.length >= 2);

  const validBaselinePaths = baselinePaths.filter((path) => Array.isArray(path) && path.length >= 2);

  const tolerance = Math.max(0, toleranceMeters);

  const spacing = Math.max(1, sampleSpacingMeters);

  let totalTargetMeters = 0;

  let baselineCoveredMeters = 0;
  let finalCoveredMeters = 0;

  let incrementalCoveredMeters = 0;
  let sharedCoveredMeters = 0;
  let baselineOnlyMeters = 0;

  let incrementalNoneMeters = 0;
  let incrementalStaleMeters = 0;

  for (const target of targets) {
    if (!target?.start || !target?.end) {
      continue;
    }

    const geometricLength = distanceMeters(target.start[1], target.start[0], target.end[1], target.end[0]);

    const lengthMeters = Number.isFinite(target.lengthMeters) && target.lengthMeters > 0 ? target.lengthMeters : geometricLength;

    if (!Number.isFinite(lengthMeters) || lengthMeters <= 0) {
      continue;
    }

    const sampleCount = Math.max(1, Math.ceil(lengthMeters / spacing));

    /*
     * Each sample represents an equal fraction
     * of this road segment.
     */
    const sampleMeters = lengthMeters / sampleCount;

    totalTargetMeters += lengthMeters;

    for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex++) {
      /*
       * Midpoint sampling avoids placing probes directly
       * on intersections/endpoints.
       */
      const t = (sampleIndex + 0.5) / sampleCount;

      const samplePoint: LonLat = [target.start[0] + (target.end[0] - target.start[0]) * t, target.start[1] + (target.end[1] - target.start[1]) * t];

      const baselineDistance = minimumDistanceToRoutePaths(samplePoint, validBaselinePaths);

      const finalDistance = minimumDistanceToRoutePaths(samplePoint, validFinalPaths);

      const baselineCovered = baselineDistance <= tolerance;

      const finalCovered = finalDistance <= tolerance;

      if (baselineCovered) {
        baselineCoveredMeters += sampleMeters;
      }

      if (finalCovered) {
        finalCoveredMeters += sampleMeters;
      }

      /*
       * This is the most important category:
       *
       * final route reaches it,
       * normal A → B route would not.
       */
      if (finalCovered && !baselineCovered) {
        incrementalCoveredMeters += sampleMeters;

        if (target.tier === "none") {
          incrementalNoneMeters += sampleMeters;
        } else {
          incrementalStaleMeters += sampleMeters;
        }
      }

      if (finalCovered && baselineCovered) {
        sharedCoveredMeters += sampleMeters;
      }

      if (baselineCovered && !finalCovered) {
        baselineOnlyMeters += sampleMeters;
      }
    }
  }

  const incrementalPercent = totalTargetMeters > 0 ? (incrementalCoveredMeters / totalTargetMeters) * 100 : 0;

  return {
    totalTargetMeters,

    baselineCoveredMeters,
    finalCoveredMeters,

    incrementalCoveredMeters,
    sharedCoveredMeters,
    baselineOnlyMeters,

    incrementalNoneMeters,
    incrementalStaleMeters,

    incrementalPercent,
  };
}
