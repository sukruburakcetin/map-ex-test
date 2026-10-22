export interface PointCloudLifecycleState {
  pointCloudVisible?: boolean; pointCloudLoading?: boolean;
  isMeasureMode: boolean; isSightMode: boolean; isViewshedMode: boolean; isLassoMode: boolean;
  showCalibrationPanel: boolean;
}
export interface PointCloudLifecyclePatch {
  isMeasureMode?: boolean; measurePoints?: never[];
  isSightMode?: boolean; sightObserver?: null; sightTargets?: never[];
  isViewshedMode?: boolean; showCalibrationPanel?: boolean; isLassoMode?: boolean;
  pointCloudPrevious?: boolean; pointCloudAutoPaused?: boolean; pointCloudVisible?: boolean;
  pointCloudLoading?: boolean; pointCloudSummary?: undefined; pointCloudIncomplete?: boolean;
  pointCloudAvailable?: undefined;
}
export interface PointCloudLifecycleDependencies {
  readState(): PointCloudLifecycleState;
  acquisition(): { readonly active: boolean; readonly following: boolean; stopMode(): void; cancel(reason: 'clear'): void; releaseResult(): void };
  adaptive(): { dispose(): void } | null;
  map(): { invalidate(): void; clear(): void } | null;
  lasso(): { clear(): void } | null;
  measurement(): { dispose(): void } | null;
  sight(): { clear(): void } | null;
  rings(): { clear(): void } | null;
  /** Dismiss only the point-cloud-owned progress toast; unrelated notifications remain visible. */
  dismissProgress(): void;
  cancelNudge(): void;
  /** Clear sequence context, detach original viewer owner, then empty the filtered subset. */
  clearViewerData(): void;
  setState(patch: PointCloudLifecyclePatch, callback?: () => void): void;
  /** Re-read the live map/destroyed gate inside the measurement state callback. */
  canUpdateMeasurement(): boolean;
  updateMeasurement(): void;
  clearViewshed(): void;
  clearLasso(): void;
  clear(reset: boolean): void;
  load(): void;
}

/** Coordinate existing owners without acquiring a layer, timer, listener or cloud reference.
 * Resource getters and state reads remain live across React callbacks. Owners retain their own
 * original-view cleanup, cancellation and idempotence contracts; this class adds no exception policy.
 */
export class PointCloudLifecycle {
  constructor(private readonly dependencies: PointCloudLifecycleDependencies) {}

  /** Stop cloud intent, cancel pending work, clear scene/viewer resources, then deactivate tools.
   * resetState=false preserves loading/progress/availability during reload; tools still deactivate.
   * Measurement/lasso resources are released before asynchronous state-reset callbacks. Keep the
   * final full-lasso clear even after its early resource clear: each has an existing distinct role.
   */
  clear(resetState = true): void {
    const d = this.dependencies;
    d.acquisition().stopMode();
    if (resetState) d.dismissProgress();
    d.adaptive()?.dispose();
    d.cancelNudge();
    d.acquisition().cancel('clear'); d.map()?.invalidate();
    d.map()?.clear();
    d.acquisition().releaseResult(); d.clearViewerData();
    d.lasso()?.clear();
    d.measurement()?.dispose();
    if (d.readState().isMeasureMode) {
      d.setState({ isMeasureMode: false, measurePoints: [] }, () => {
        if (d.canUpdateMeasurement()) d.updateMeasurement();
      });
    }
    if (d.readState().isSightMode) {
      d.sight()?.clear();
      d.setState({ isSightMode: false, sightObserver: null, sightTargets: [] });
    }
    if (d.readState().isViewshedMode) {
      d.clearViewshed(); d.setState({ isViewshedMode: false });
    }
    d.rings()?.clear();
    if (d.readState().showCalibrationPanel) d.setState({ showCalibrationPanel: false });
    if (resetState) d.setState({ pointCloudPrevious: false, pointCloudAutoPaused: false,
      pointCloudVisible: false, pointCloudLoading: false, pointCloudSummary: undefined,
      pointCloudIncomplete: false, pointCloudAvailable: undefined });
    if (d.readState().isLassoMode) { d.clearLasso(); d.setState({ isLassoMode: false }); }
  }

  /** Any active/visible/loading/following intent closes the cloud; otherwise begin the original load.
   * Delegate through runtime clear/load adapters so existing call-site behavior stays observable.
   */
  toggle(): void {
    const d = this.dependencies;
    if (d.acquisition().active || d.readState().pointCloudVisible || d.readState().pointCloudLoading || d.acquisition().following) d.clear(true);
    else d.load();
  }
}
