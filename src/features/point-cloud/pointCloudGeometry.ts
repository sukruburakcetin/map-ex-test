import { distanceMeters } from '../../utils/geoUtils';
import { pointCloudCandidates } from '../../utils/pointCloudUtils';
import type { PointCloudPoint, PointCloudResult } from '../../utils/pointCloudUtils';

/** Bearing is clockwise from north; positions are shifted WGS84 degrees.
 * Capture this basis at the caller's existing point in the state-update lifecycle.
 */
export interface PointCloudCorridorBasis { sinB: number; cosB: number; }
/** Precompute street axes once per operation; no per-point basis objects are created. */
export function pointCloudCorridorBasis(bearingDegrees: number): PointCloudCorridorBasis {
  const rad = (bearingDegrees * Math.PI) / 180;
  return { sinB: Math.sin(rad), cosB: Math.cos(rad) };
}

/** Maximum geographic radius in meters, rounded up to 10 m and capped for the UI.
 * This is radial extent, not the along-street crop length. Empty input retains zero.
 */
export function pointCloudLengthExtent(points: readonly PointCloudPoint[], cameraLon: number, cameraLat: number, limitMeters: number): number {
  const extent = points.reduce((max, pt) => {
    const d = distanceMeters(pt.lat, pt.lon, cameraLat, cameraLon);
    return d > max ? d : max;
  }, 0);
  return Math.min(Math.ceil(extent / 10) * 10, limitMeters);
}

/** Maximum absolute cross-street offset in meters, rounded/capped like the existing UI.
 * Uses the existing local 111320 m/degree approximation, without applying calibration.
 */
export function pointCloudWidthExtent(points: readonly PointCloudPoint[], cameraLon: number, cameraLat: number, basis: PointCloudCorridorBasis, limitMeters: number): number {
  const { sinB, cosB } = basis;
  const extent = points.reduce((max, pt) => {
    const dy = (pt.lat - cameraLat) * 111320;
    const dx = (pt.lon - cameraLon) * 111320 * Math.cos((cameraLat * Math.PI) / 180);
    const right = Math.abs(dx * cosB - dy * sinB);
    return right > max ? right : max;
  }, 0);
  return Math.min(Math.ceil(extent / 10) * 10, limitMeters);
}

/** Existing fifth-percentile floor in source altitude units (meters, datum unverified).
 * Use points strictly within 5 m only when there are more than 50; otherwise use all.
 * Only the temporary altitude array is sorted. Empty input retains the legacy undefined
 * array-index result; this extraction does not invent a new floor fallback.
 */
export function estimatePointCloudFloor(points: readonly PointCloudPoint[], cameraLon: number, cameraLat: number): number {
  const nearbyPoints = points.filter(p => distanceMeters(cameraLat, cameraLon, p.lat, p.lon) < 5.0);
  const floorSamplePoints = nearbyPoints.length > 50 ? nearbyPoints : points;
  const sampledAlts = floorSamplePoints.map(p => p.alt).sort((a, b) => a - b);
  return sampledAlts[Math.floor(sampledAlts.length * 0.05)];
}

/** Borrow points into a new viewer array without changing their objects or source order.
 * Length and half-width are meters on each side of the camera; nonpositive values
 * disable that axis. Boundaries are inclusive. Calibration is applied after cropping
 * by each renderer, so nudging cannot move points across this crop.
 */
export function filterPointCloudCorridor<P extends { lon: number; lat: number }>(points: readonly P[], cameraLon: number, cameraLat: number, basis: PointCloudCorridorBasis, length: number, halfWidth: number): P[] {
  const { sinB, cosB } = basis;
  return points.filter(p => {
    const dy = (p.lat - cameraLat) * 111320;
    const dx = (p.lon - cameraLon) * 111320 * Math.cos((cameraLat * Math.PI) / 180);
    const forward = dx * sinB + dy * cosB;
    const right = dx * cosB - dy * sinB;
    if (halfWidth > 0 && Math.abs(right) > halfWidth) return false;
    if (length > 0) {
      if (forward < -length || forward > length) return false;
    }
    return true;
  });
}

export interface PointCloudMapGeometryInput {
  cameraLon: number;
  cameraLat: number;
  basis: PointCloudCorridorBasis;
  /** Meter limits on either side; zero disables the corresponding axis. */
  length: number;
  halfWidth: number;
  /** Source-altitude floor in meters; map z is relative to this value. */
  baseAltitude: number;
  /** East/north/up calibration in meters; crop membership uses pre-nudge positions. */
  nudgeX: number;
  nudgeY: number;
  nudgeZ: number;
}
export interface PreparedPointCloudFeature {
  geometry: { type: 'point'; longitude: number; latitude: number; z: number; spatialReference: { wkid: 4326 } };
  attributes: {
    ObjectID: number; pointIndex: number; originalIndex: number; colorCode: string;
    relativeHeight: number; absoluteAltitude: number; distanceFromCamera: number;
  };
}

/** Prepare plain feature properties, without constructing or editing SDK resources.
 * Candidate enumeration keeps its existing cached envelope and ascending source order;
 * the exact oriented crop follows it. Logical ObjectIDs are originalIndex + 1, while
 * pointIndex is the filtered viewer index. The map owner resolves actual SDK ObjectIDs.
 * Raw SfM degrees determine camera distance; shifted degrees determine map placement.
 * Height rounding, RGB normalization/quantization and color insertion order are retained.
 */
export function preparePointCloudMapGeometry(result: PointCloudResult, input: PointCloudMapGeometryInput): { features: PreparedPointCloudFeature[]; colors: string[] } {
  const { cameraLon, cameraLat, basis: { sinB, cosB }, length: cropLength, halfWidth, baseAltitude, nudgeX, nudgeY, nudgeZ } = input;
  const nudgeLat = nudgeY / 111320;
  const nudgeLon = nudgeX / (111320 * Math.cos((cameraLat * Math.PI) / 180));
  const uniqueColors = new Set<string>();
  const quantize = (val: number) => {
    const q = Math.round(val / 16) * 16;
    return q > 255 ? 255 : q;
  };
  const toHex = (c: number) => c.toString(16).padStart(2, '0');
  const features: PreparedPointCloudFeature[] = [];
  let filteredIndex = 0;
  pointCloudCandidates(result, cameraLon, cameraLat, cropLength, halfWidth).forEach(origIndex => {
    const p = result.points[origIndex];
    const distFromCamera = distanceMeters(result.computedImageLocation.lat, result.computedImageLocation.lon, p.rawLat, p.rawLon);
    const dy = (p.lat - cameraLat) * 111320;
    const dx = (p.lon - cameraLon) * 111320 * Math.cos((cameraLat * Math.PI) / 180);
    const forward = dx * sinB + dy * cosB;
    const right = dx * cosB - dy * sinB;
    if (halfWidth > 0 && Math.abs(right) > halfWidth) return;
    if (cropLength > 0) {
      if (forward < -cropLength || forward > cropLength) return;
    }
    const relativeZ = p.alt - baseAltitude;
    const finalZ = relativeZ + nudgeZ;
    let pr = p.r ?? 160, pg = p.g ?? 160, pb = p.b ?? 160;
    if (pr <= 1 && pg <= 1 && pb <= 1 && (pr > 0 || pg > 0 || pb > 0)) {
      pr = Math.round(pr * 255);
      pg = Math.round(pg * 255);
      pb = Math.round(pb * 255);
    }
    const hexColor = `#${toHex(quantize(pr))}${toHex(quantize(pg))}${toHex(quantize(pb))}`;
    uniqueColors.add(hexColor);
    features.push({
      geometry: { type: 'point', longitude: p.lon + nudgeLon, latitude: p.lat + nudgeLat, z: finalZ, spatialReference: { wkid: 4326 } },
      attributes: {
        ObjectID: origIndex + 1, pointIndex: filteredIndex, originalIndex: origIndex, colorCode: hexColor,
        relativeHeight: parseFloat(finalZ.toFixed(2)), absoluteAltitude: parseFloat(p.alt.toFixed(2)), distanceFromCamera: parseFloat(distFromCamera.toFixed(2)),
      },
    });
    filteredIndex++;
  });
  return { features, colors: Array.from(uniqueColors) };
}
