import type { PointCloudResult } from '../../utils/pointCloudUtils';
import type { MeasurementPoint } from './MeasurementViewerRenderer';

/** Geometry borrowed from the existing point-cloud graphic; coordinates are not reprojected here. */
export interface PointCloudHitGeometry { longitude: number; latitude: number; z: number; }
interface Hit<G> {
  layer?: { id?: string };
  graphic?: { layer?: { id?: string }; geometry: G; attributes?: {
    originalIndex?: number | null; originalindex?: number | null;
    pointIndex?: number | null; pointindex?: number | null;
    ObjectID?: number | null; objectid?: number | null;
  } };
}
export interface PointCloudHitRoutingDependencies<G extends PointCloudHitGeometry> {
  readState(): { isMeasureMode: boolean; isSightMode: boolean; isViewshedMode: boolean;
    jimuMapView?: unknown; measurePoints: MeasurementPoint[] };
  readResult(): PointCloudResult | null;
  mapUpdating(): boolean;
  setMeasurement(points: MeasurementPoint[], callback: () => void): void;
  updateMeasurement(): void;
  readSight(): { readonly ready: boolean; place(geometry: G): void } | null;
  placeViewshed(geometry: G): Promise<unknown>;
  readRenderer(): { setHighlight(index: number): void } | null;
  readViewer(): { resize(): void; getCenter(): Promise<number[]>; setCenter(center: number[]): void } | null;
  notifyUpdating(): void;
}

/** Dispatch already-tested SDK hits; no hitTest, event listener, navigation or resource ownership.
 * The caller keeps enterprise-note precedence and later image selection. A consumed cloud hit
 * returns true; a miss clears viewer highlight then returns false so normal navigation continues.
 */
export class PointCloudHitRouting<G extends PointCloudHitGeometry> {
  constructor(private readonly dependencies: PointCloudHitRoutingDependencies<G>) {}

  /** Preserve first matching layer, mixed-case attributes and existing fallback index rules.
   * originalIndex addresses retained full-cloud points; pointIndex addresses the filtered viewer.
   * Tool precedence remains measurement → ready sight → viewshed with map view → highlight.
   * Hit result shape is asserted only at this SDK boundary, matching the existing layer-ID branch.
   */
  route(results: readonly unknown[]): boolean {
    const d = this.dependencies;
    const hit = results.find(result => {
      const r = result as Hit<G>;
      const layer = r.layer || (r.graphic && r.graphic.layer);
      return layer && layer.id === 'point-cloud-layer';
    }) as Hit<G> | undefined;
    if (hit && hit.graphic) {
      if (d.mapUpdating()) { d.notifyUpdating(); return true; }
      const attrs = hit.graphic.attributes || {};
      const geom = hit.graphic.geometry;
      const rawOriginal = attrs.originalIndex ?? attrs.originalindex;
      const rawPointIdx = attrs.pointIndex ?? attrs.pointindex;
      const rawObjectId = attrs.ObjectID ?? attrs.objectid;
      const idx = (rawPointIdx !== undefined ? rawPointIdx : (rawObjectId || 1) - 1) as number;
      const originalIdx = (rawOriginal !== undefined ? rawOriginal : idx) as number;
      if (d.readState().isMeasureMode) {
        const p = d.readResult()?.points[originalIdx];
        if (p) {
          const newPt: MeasurementPoint = {
            mapLon: geom.longitude, mapLat: geom.latitude, mapZ: geom.z,
            rawLon: p.rawLon || p.lon, rawLat: p.rawLat || p.lat, alt: p.alt,
          };
          let newPoints = [...d.readState().measurePoints, newPt];
          if (newPoints.length > 2) newPoints = [newPt];
          d.setMeasurement(newPoints, () => d.updateMeasurement());
        }
        return true;
      }
      if (d.readState().isSightMode && d.readSight()?.ready) {
        d.readSight()!.place(geom); return true;
      }
      if (d.readState().isViewshedMode && d.readState().jimuMapView) {
        void d.placeViewshed(geom); return true;
      }
      if (d.readRenderer()) {
        d.readRenderer()!.setHighlight(idx);
        if (d.readViewer()) {
          d.readViewer()!.resize();
          d.readViewer()!.getCenter().then(c => {
            // Keep the original live-viewer read and swallowed refresh failure after getCenter.
            d.readViewer()!.setCenter([c[0], c[1]]);
          }).catch(() => {});
        }
      }
      return true;
    }
    if (d.readRenderer()) {
      d.readRenderer()!.setHighlight(-1);
      if (d.readViewer()) d.readViewer()!.resize();
    }
    return false;
  }
}
