import { buildFinalRouteStops } from "../../utils/routeOptimizer";
import type { CaptureOpportunity, RouteCoordinate } from "../../utils/routeOptimizer";
import { captureStopOwners } from "./captureRouteScoring";

export interface CaptureTrialPlanInput {
  activeOpportunities: readonly CaptureOpportunity[];
  removeId: string;
  add?: CaptureOpportunity;
  startPt: RouteCoordinate;
  endPt: RouteCoordinate;
  maxFinalStops: number;
}

/** Prepare local probe inputs only; requests, ownership checks and acceptance stay with the caller. */
export function prepareCaptureTrial({
  activeOpportunities, removeId, add, startPt, endPt, maxFinalStops,
}: CaptureTrialPlanInput) {
  const remaining = activeOpportunities.filter(opportunity => opportunity.id !== removeId);
  const trialOpportunities = (add ? remaining.concat(add) : remaining)
    .sort((a, b) => a.baselinePosition - b.baselinePosition);
  const trialCaptureStops = buildFinalRouteStops(trialOpportunities);
  const trialCaptureOwners = captureStopOwners(trialOpportunities, maxFinalStops);
  const trialStops: RouteCoordinate[] = [startPt, ...trialCaptureStops, endPt];
  return { trialOpportunities, trialCaptureStops, trialCaptureOwners, trialStops };
}
