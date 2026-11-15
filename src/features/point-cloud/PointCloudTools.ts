export type PointCloudTool = 'sight' | 'viewshed' | 'measure' | 'lasso';
export interface PointCloudToolsState {
  isSightMode: boolean; isViewshedMode: boolean; isMeasureMode: boolean; isLassoMode: boolean;
}
export interface PointCloudToolsPatch {
  isSightMode?: boolean; sightObserver?: null; sightTargets?: never[];
  isViewshedMode?: boolean; isMeasureMode?: boolean; measurePoints?: never[];
  isLassoMode?: boolean; lassoPolygon?: never[]; lassoSelectedObjectIds?: never[];
}
export interface PointCloudToolsDependencies {
  readState(): PointCloudToolsState;
  setState(updater: (previous: PointCloudToolsState) => PointCloudToolsPatch, callback: () => void | Promise<void>): void;
  updateMeasurement(): void;
  clearSightResource(): void;
  activateSight(): Promise<void>;
  clearSight(): void;
  clearViewshed(): void;
  clearLasso(): void;
  notify(tool: PointCloudTool): void;
}

/** Coordinate existing activation rules without owning tool resources, hits or state mirrors.
 * Preserve updater-side effects and callback timing, including the asymmetric exclusion rules.
 * Each updater uses React's previous state; each callback deliberately re-reads current state.
 */
export class PointCloudTools {
  constructor(private readonly dependencies: PointCloudToolsDependencies) {}

  /** Sight toggles reset observer/targets; enabling disables measurement, leaving other flags alone.
   * Refresh measurement in the callback when disabled, then notify/await sight activation or clear.
   */
  toggleSight(): void {
    const d = this.dependencies;
    d.setState(previous => {
      const nextSight = !previous.isSightMode;
      const updates: PointCloudToolsPatch = { isSightMode: nextSight, sightObserver: null, sightTargets: [] };
      if (nextSight && previous.isMeasureMode) { updates.isMeasureMode = false; updates.measurePoints = []; }
      return updates;
    }, async () => {
      if (!d.readState().isMeasureMode) d.updateMeasurement();
      if (d.readState().isSightMode) { d.notify('sight'); await d.activateSight(); }
      else d.clearSight();
    });
  }

  /** Enabling viewshed clears active measurement/sight inside the updater, as before.
   * This method does not await the React callback; runtime retains its original async public wrapper.
   */
  toggleViewshed(): void {
    const d = this.dependencies;
    d.setState(previous => {
      const nextMode = !previous.isViewshedMode;
      const updates: PointCloudToolsPatch = { isViewshedMode: nextMode };
      if (nextMode) {
        if (previous.isMeasureMode) { updates.isMeasureMode = false; updates.measurePoints = []; d.updateMeasurement(); }
        if (previous.isSightMode) { updates.isSightMode = false; updates.sightObserver = null; updates.sightTargets = []; d.clearSightResource(); }
      }
      return updates;
    }, () => {
      if (d.readState().isViewshedMode) d.notify('viewshed'); else d.clearViewshed();
    });
  }

  /** Reset measurement points on either toggle, then refresh graphics in the callback.
   * Existing policy clears viewshed only in the branch that also disables active sight; do not
   * silently broaden this condition to a symmetric all-tools exclusion rule during refactoring.
   */
  toggleMeasure(): void {
    const d = this.dependencies;
    d.setState(previous => {
      const nextMeasure = !previous.isMeasureMode;
      const updates: PointCloudToolsPatch = { isMeasureMode: nextMeasure, measurePoints: [] };
      if (nextMeasure && previous.isSightMode) {
        updates.isSightMode = false; updates.sightObserver = null; updates.sightTargets = [];
        d.clearSightResource(); updates.isViewshedMode = false; d.clearViewshed();
      }
      return updates;
    }, () => {
      d.updateMeasurement();
      if (d.readState().isMeasureMode) d.notify('measure');
    });
  }

  /** Reset selection arrays on either toggle; enabling excludes active measurement/sight/viewshed.
   * Updater-side cleanup precedes the state patch; callback feedback/full-lasso clear stays afterward.
   */
  toggleLasso(): void {
    const d = this.dependencies;
    d.setState(previous => {
      const nextMode = !previous.isLassoMode;
      const updates: PointCloudToolsPatch = { isLassoMode: nextMode, lassoPolygon: [], lassoSelectedObjectIds: [] };
      if (nextMode) {
        if (previous.isMeasureMode) { updates.isMeasureMode = false; updates.measurePoints = []; d.updateMeasurement(); }
        if (previous.isSightMode) { updates.isSightMode = false; updates.sightObserver = null; updates.sightTargets = []; d.clearSightResource(); }
        if (previous.isViewshedMode) { updates.isViewshedMode = false; d.clearViewshed(); }
      }
      return updates;
    }, () => {
      if (d.readState().isLassoMode) d.notify('lasso'); else d.clearLasso();
    });
  }
}
