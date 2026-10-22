import { filterPointCloudCorridor, pointCloudCorridorBasis } from './pointCloudGeometry';
import type { PointCloudPoint, PointCloudResult } from '../../utils/pointCloudUtils';

/** Crop controls use symmetric half-length/half-width in meters. Nonpositive disables that axis. */
export interface PointCloudCropState {
  pointCloudLength: number;
  pointCloudWidth: number;
  pointCloudMaxLength: number;
  pointCloudActualLength: number;
  pointCloudVisible?: boolean;
}
export interface PointCloudCropDependencies {
  /** Borrow current state on each read; never retain it across a queued React callback. */
  readState(): PointCloudCropState;
  readResult(): PointCloudResult | null;
  /** Shifted map coordinates in WGS84 degrees, read at the existing filter boundary. */
  readCamera(): { lon: number; lat: number };
  readBearing(): number;
  readViewerRenderer(): { updatePoints(points: PointCloudPoint[]): void } | null;
  setState(patch: { pointCloudLength?: number; pointCloudWidth?: number }, callback: () => void): void;
  /** Store this same ordered array before upload; lasso/viewer indices address this subset. */
  setFilteredPoints(points: PointCloudPoint[]): void;
  renderMap(): void;
  drawRings(radius: number): void;
  resizeViewer(): void;
  widthMax: number;
}

/** Coordinate crop controls without owning React state, cloud acquisition, timers or SDK resources.
 * Geometry filtering stays in pointCloudGeometry; scene features/confirmed IDs stay with the map owner.
 * Each accepted state callback keeps the original order and live/captured inputs, even when batched.
 */
export class PointCloudCrop {
  constructor(private readonly dependencies: PointCloudCropDependencies) {}

  /** Clamp length using the current UI maximum, then capture bearing/width before setState.
   * Callback reads current result/camera. A nonpositive length uses actual extent for rings only.
   */
  changeLength(newLength: number): void {
    const d = this.dependencies;
    const clamped = newLength <= 0 ? 0 : Math.min(newLength, d.readState().pointCloudMaxLength);
    const basis = pointCloudCorridorBasis(d.readBearing());
    const halfWidth = d.readState().pointCloudWidth;
    d.setState({ pointCloudLength: clamped }, () => {
      if (!d.readState().pointCloudVisible || !d.readResult()) return;
      d.renderMap();
      d.drawRings(clamped <= 0 ? d.readState().pointCloudActualLength : clamped);
      if (d.readViewerRenderer()) {
        const allPoints = d.readResult()!.points;
        const camera = d.readCamera();
        const points = filterPointCloudCorridor(allPoints, camera.lon, camera.lat, basis, clamped, halfWidth);
        d.setFilteredPoints(points);
        d.readViewerRenderer()!.updatePoints(points);
        d.resizeViewer();
      }
    });
  }

  /** Clamp positive width to [5, configured maximum]; nonpositive disables cross-street cropping.
   * Unlike length input, read bearing/length inside the callback, after map/ring work and only
   * when a viewer renderer exists. Keep this asymmetry to preserve current interaction behavior.
   */
  changeWidth(newWidth: number): void {
    const d = this.dependencies;
    const clamped = newWidth <= 0 ? 0 : Math.max(5, Math.min(newWidth, d.widthMax));
    d.setState({ pointCloudWidth: clamped }, () => {
      if (!d.readState().pointCloudVisible || !d.readResult()) return;
      d.renderMap();
      d.drawRings(d.readState().pointCloudLength <= 0 ? d.readState().pointCloudActualLength : d.readState().pointCloudLength);
      if (d.readViewerRenderer()) {
        const allPoints = d.readResult()!.points;
        const basis = pointCloudCorridorBasis(d.readBearing());
        const currentLength = d.readState().pointCloudLength;
        const camera = d.readCamera();
        const points = filterPointCloudCorridor(allPoints, camera.lon, camera.lat, basis, currentLength, clamped);
        d.setFilteredPoints(points);
        d.readViewerRenderer()!.updatePoints(points);
        d.resizeViewer();
      }
    });
  }
}
