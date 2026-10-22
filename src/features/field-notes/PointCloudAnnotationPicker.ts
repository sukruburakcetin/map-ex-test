import { distanceMeters } from '../../utils/geoUtils';
import type { PointCloudPoint, PointCloudResult } from '../../utils/pointCloudUtils';

/** Existing toMap/coverage-fallback coordinates in WGS84 degrees; no projection is added here. */
export interface AnnotationMapPoint { longitude: number; latitude: number; }
interface CloudHit {
  layer?: { id?: string };
  graphic?: { layer?: { id?: string }; attributes?: {
    originalIndex?: number | null; originalindex?: number | null;
    ObjectID?: number | null; objectid?: number | null;
  } };
}
export interface PointCloudAnnotationDependencies {
  /** Borrow the current retained full cloud after hitTest settles; never a display subset snapshot. */
  readResult(): PointCloudResult | null;
  isCloudVisible(): boolean;
  annotate(longitude: number, latitude: number, altitude?: number): void;
  warn(error: unknown): void;
}

/** Estimate source altitude meters using the existing local low sample, without datum correction.
 * Keep strict 0.00005-degree bounding-box and 3 m distance tests, then floor(count * 0.1).
 * Only the temporary altitude list is sorted; source points/order remain borrowed and unchanged.
 */
export function estimateAnnotationCloudAltitude(points: readonly PointCloudPoint[], clickLon: number, clickLat: number): number | undefined {
  const localAltitudes: number[] = [];
  for (const p of points) {
    if (Math.abs(p.lat - clickLat) < 0.00005 && Math.abs(p.lon - clickLon) < 0.00005) {
      const dist = distanceMeters(clickLat, clickLon, p.lat, p.lon);
      if (dist < 3.0) localAltitudes.push(p.alt);
    }
  }
  if (localAltitudes.length > 0) {
    localAltitudes.sort((a, b) => a - b);
    return localAltitudes[Math.floor(localAltitudes.length * 0.1)];
  }
  return undefined;
}

/** Resolve annotation-mode clicks only; route picking and annotation interception remain runtime-owned.
 * No listener, SDK layer, cloud store, note persistence or new request guard is introduced.
 * This path intentionally keeps different index/visibility rules from normal cloud-hit dispatch.
 */
export class PointCloudAnnotationPicker {
  constructor(private readonly dependencies: PointCloudAnnotationDependencies) {}

  /** Run the caller's existing hitTest once, then resolve the live full-cloud point by original index.
   * Ignore viewer pointIndex; ObjectID arithmetic remains the annotation-specific fallback.
   * Exact hits use raw coordinates with the original truthy fallback, independent of visibility.
   * Preserve the original try/catch scope (including exact-hit annotation); fallback annotation
   * remains outside it. Local estimation requires cloud visibility and falls back to undefined.
   */
  async pick(hitTest: () => PromiseLike<{ results: readonly unknown[] }>, point: AnnotationMapPoint): Promise<void> {
    const d = this.dependencies;
    try {
      const response = await hitTest();
      const hit = response.results.find(result => {
        const r = result as CloudHit;
        const layer = r.layer || (r.graphic && r.graphic.layer);
        return layer && layer.id === 'point-cloud-layer';
      }) as CloudHit | undefined;
      if (hit && hit.graphic) {
        const attrs = hit.graphic.attributes || {};
        const rawOriginal = attrs.originalIndex ?? attrs.originalindex;
        const rawObjectId = attrs.ObjectID ?? attrs.objectid;
        const originalIdx = (rawOriginal !== undefined ? rawOriginal : (rawObjectId || 1) - 1) as number;
        const p = d.readResult()?.points[originalIdx];
        if (p) { d.annotate(p.rawLon || p.lon, p.rawLat || p.lat, p.alt); return; }
      }
    } catch (error) { d.warn(error); }
    let estimatedAlt: number | undefined = undefined;
    if (d.isCloudVisible() && d.readResult()) {
      const clickLat = point.latitude;
      const clickLon = point.longitude;
      estimatedAlt = estimateAnnotationCloudAltitude(d.readResult()!.points, clickLon, clickLat);
    }
    d.annotate(point.longitude, point.latitude, estimatedAlt);
  }
}
