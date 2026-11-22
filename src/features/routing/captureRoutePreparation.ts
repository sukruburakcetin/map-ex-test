import type { CAPTURE_ROUTE_CONFIG } from '../../utils/constants';
import type { RoutingResult } from '../../utils/routingTypes';
import type { RouteCoordinate, RouteTargetSegment } from '../../utils/routeOptimizer';
import { selectAdaptiveCaptureOpportunities } from './adaptiveCaptureSelection';
import { reportCaptureCorridor, reportCaptureSelection } from './captureSelectionReport';

export type CapturePreparationStop = 'targets' | 'corridor' | 'budget';

/** UI publication stays host-bound; provider awaits and run ownership remain with the caller. */
export interface CaptureRoutePreparationHost {
  targets(): RouteTargetSegment[];
  config(): typeof CAPTURE_ROUTE_CONFIG;
  log(...args: unknown[]): void;
  notify(reason: CapturePreparationStop, spareMinutes: number): void;
  progress(usedMinutes: number, budgetMinutes: number): void;
}

export interface PreparedCaptureRoute extends ReturnType<typeof selectAdaptiveCaptureOpportunities> {
  baselineMinutes: number;
  baselinePaths: RoutingResult['paths'];
}

/** Prepare local opportunities synchronously after the caller's baseline/camera awaits and run check.
 * Return null at the original feedback exits; preserve report/progress order and borrowed route/selection identity.
 */
export function prepareCaptureRoute(baselineRoute: RoutingResult, spareMinutes: number, host: CaptureRoutePreparationHost): PreparedCaptureRoute | null {
  const baselineMinutes = baselineRoute.durationMinutes;
  const baselineDistanceMeters = baselineRoute.distanceMeters;
  const baselineKilometers = baselineDistanceMeters / 1000;
  const baselinePaths = baselineRoute.paths;
  const baselineCoordinates: RouteCoordinate[] = baselinePaths.flatMap(path => path);
  if (baselineCoordinates.length < 2) throw new Error('Baseline route geometry is empty.');
  const baselineSpeedMetersPerMinute = baselineMinutes > 0 ? baselineDistanceMeters / baselineMinutes : 400;
  host.log(`[CaptureRoute] Baseline: ` + `${baselineKilometers.toFixed(2)} km / ` + `${baselineMinutes.toFixed(1)} min`);
  host.log(`[CaptureRoute] Extra budget: ` + `${spareMinutes.toFixed(1)} min`);

  const allTargets = host.targets();
  if (!allTargets.length) { host.notify('targets', spareMinutes); return null; }
  const optimizerTargets = allTargets;
  if (!optimizerTargets.length) { host.notify('targets', spareMinutes); return null; }
  host.log(`[CaptureRoute] Target segments: ` + `${optimizerTargets.length}`);
  const { opportunities, selection, selectedCorridorWidth } = selectAdaptiveCaptureOpportunities({
    targets: optimizerTargets, baselineCoordinates, baselineSpeedMetersPerMinute, spareMinutes,
    config: host.config(), log: (...args) => host.log(...args),
  });
  reportCaptureCorridor(opportunities, selectedCorridorWidth, message => host.log(message));
  if (!opportunities.length) { host.notify('corridor', spareMinutes); return null; }
  reportCaptureSelection(selection, host.config().maxFinalStops, message => host.log(message));
  if (!selection.opportunities.length) { host.notify('budget', spareMinutes); return null; }
  host.progress(selection.estimatedExtraMinutes, spareMinutes);
  return { baselineMinutes, baselinePaths, opportunities, selection, selectedCorridorWidth };
}
