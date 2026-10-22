import { pointCloudCorridorBasis, pointCloudLengthExtent, pointCloudWidthExtent, estimatePointCloudFloor, filterPointCloudCorridor } from './pointCloudGeometry';
import { pointCloudCorridorCount, summarizePointCloud } from '../../utils/pointCloudUtils';
import type { PointCloudPoint, PointCloudResult } from '../../utils/pointCloudUtils';
import type { PointCloudLoadSession } from './PointCloudAcquisition';

export interface PointCloudResultState {
  pointCloudFollowImages?: boolean;
  pointCloudLength: number;
  pointCloudWidth: number;
  pointCloudActualLength: number;
  isLassoMode: boolean;
}
export interface PointCloudResultPatch {
  pointCloudActualLength?: number; pointCloudActualWidth?: number; pointCloudMaxLength?: number;
  pointCloudLoading?: boolean; pointCloudVisible?: boolean; pointCloudAvailable?: boolean;
  pointCloudPrevious?: boolean; pointCloudAutoPaused?: boolean; pointCloudIncomplete?: boolean; pointCloudSummary?: string;
}
export interface PointCloudResultDependencies {
  readState(): PointCloudResultState;
  /** Full retained result stays acquisition-owned; no second full-cloud store is created. */
  readAcquisition(): { result: PointCloudResult | null; retain(result: PointCloudResult): void; resetFailures(): void };
  /** Shifted map camera position in WGS84 degrees. */
  readCamera(): { lon: number; lat: number };
  setCamera(lon: number, lat: number): void;
  readBearing(): number;
  clearLasso(): void;
  resetOffsets(): void;
  /** Source altitude meters; the original floor estimator supplies no datum conversion. */
  setBaseAltitude(altitude: number): void;
  setState(patch: PointCloudResultPatch): void;
  renderMap(silent: boolean): void;
  drawRings(radius: number): void;
  setFilteredPoints(points: PointCloudPoint[]): void;
  readViewerRenderer(): { readonly ready: boolean; setHighlight(index: number): void; updatePoints(points: PointCloudPoint[]): void } | null;
  resizeViewer(): void;
  attachViewer(result: PointCloudResult, imageId: string): void;
  recordIssue(message: string, automatic: boolean, toast?: string): void;
  notifyLoaded(result: PointCloudResult, points: PointCloudPoint[]): void;
  config: { FETCH_LENGTH: number; FETCH_WIDTH: number; LENGTH_MAX: number };
}

/** Synchronously apply a result already validated by acquisition's current-request guard.
 * This feature owns no request, timer, cloud cache, SDK edit queue or GL renderer.
 * Preserve state/read order: extents, retention/calibration, floor, map/rings, viewer, status/feedback.
 */
export class PointCloudResultApplication {
  constructor(private readonly dependencies: PointCloudResultDependencies) {}

  /** Apply borrowed full-cloud points; initial viewer subset keeps their original order/identity.
   * Automatic same-cluster loads preserve meter offsets, comparing URLs without query strings.
   * The preflight uses string-normalized IDs while camera selection retains strict ID equality.
   */
  apply<V>(result: PointCloudResult | null, session: PointCloudLoadSession<V>): void {
    const d = this.dependencies;
    const { imageId, sequenceImages, automatic: isAutoLoading } = session;
    if (!result) { d.recordIssue('Cloud unavailable for this image. Try the next image or retry.', isAutoLoading); return; }
    const targetImage = sequenceImages.find(img => String(img.id) === String(imageId));
    const targetLocation = targetImage || result.mapImageLocation || result.computedImageLocation;
    if (isAutoLoading && d.readState().pointCloudFollowImages && pointCloudCorridorCount(result, targetLocation.lon, targetLocation.lat, d.readBearing(), d.readState().pointCloudLength, d.readState().pointCloudWidth, 100000) > 100000) {
      d.recordIssue('This scene corridor exceeds 100,000 points. Reduce length/width or load manually. The next image can still be followed.', true);
      return;
    }
    const activeImage = sequenceImages.find(img => img.id === imageId);
    d.setCamera(activeImage ? activeImage.lon : (result.mapImageLocation || result.computedImageLocation).lon,
      activeImage ? activeImage.lat : (result.mapImageLocation || result.computedImageLocation).lat);
    let camera = d.readCamera();
    const actualLength = pointCloudLengthExtent(result.points, camera.lon, camera.lat, d.config.FETCH_LENGTH);
    const basis = pointCloudCorridorBasis(d.readBearing());
    camera = d.readCamera();
    const actualWidth = pointCloudWidthExtent(result.points, camera.lon, camera.lat, basis, d.config.FETCH_WIDTH);
    d.setState({ pointCloudActualLength: actualLength, pointCloudActualWidth: actualWidth });
    const preserveCalibration = isAutoLoading && d.readAcquisition().result?.sfmClusterUrl.split('?')[0] === result.sfmClusterUrl.split('?')[0];
    if (d.readAcquisition().result && d.readState().isLassoMode) d.clearLasso();
    d.readAcquisition().retain(result);
    if (!preserveCalibration) d.resetOffsets();
    d.setState({ pointCloudMaxLength: d.config.LENGTH_MAX });
    camera = d.readCamera();
    d.setBaseAltitude(estimatePointCloudFloor(result.points, camera.lon, camera.lat));
    d.renderMap(true);
    d.drawRings(d.readState().pointCloudLength <= 0 ? d.readState().pointCloudActualLength : d.readState().pointCloudLength);
    const currentLength = d.readState().pointCloudLength;
    const halfWidth = d.readState().pointCloudWidth;
    camera = d.readCamera();
    const initialPoints = filterPointCloudCorridor(result.points, camera.lon, camera.lat, basis, currentLength, halfWidth);
    d.setFilteredPoints(initialPoints);
    if (d.readViewerRenderer()?.ready) {
      d.readViewerRenderer()!.setHighlight(-1);
      d.readViewerRenderer()!.updatePoints(initialPoints);
      d.resizeViewer();
    } else d.attachViewer({ ...result, points: initialPoints }, imageId);
    d.setState({ pointCloudLoading: false, pointCloudVisible: true, pointCloudAvailable: true,
      pointCloudPrevious: false, pointCloudAutoPaused: false, pointCloudIncomplete: !!result.diagnostics?.partial,
      pointCloudSummary: summarizePointCloud(result, initialPoints.length) });
    session.finishProgress();
    d.notifyLoaded(result, initialPoints);
    if (result.diagnostics?.partial) d.recordIssue('Some cloud data could not be loaded for this image. ' + summarizePointCloud(result, initialPoints.length), isAutoLoading, 'Cloud partly loaded. Check the cloud status card for details and recovery.');
    else { d.readAcquisition().resetFailures(); d.setState({ pointCloudAutoPaused: false }); }
  }
}
