import type { CaptureOpportunity, RouteSelectionResult } from "../../utils/routeOptimizer";
import { captureAnchorDistribution, captureThreeAnchorDiagnostics } from "./captureRouteScoring";

type Log = (message: string) => void;

/** Keep corridor reporting separate: the widget may stop before reporting a selection. */
export function reportCaptureCorridor(opportunities: readonly CaptureOpportunity[], selectedCorridorWidth: number, log: Log): void {
  log(`[CaptureRoute] Selected corridor: ` + `${selectedCorridorWidth} m`);

  log(`[CaptureRoute] Opportunities: ` + `${opportunities.length}`);

  log(`[CaptureRoute] Opportunity segment counts: ` + opportunities.map((opportunity) => opportunity.segments.length).join(", "));
}

export function reportCaptureSelection(selection: RouteSelectionResult, maxFinalStops: number, log: Log): void {
  log(`[CaptureRoute] Selected opportunities: ` + `${selection.opportunities.length}`);

  log(`[CaptureRoute] Estimated extra time: ` + `${selection.estimatedExtraMinutes.toFixed(1)} min`);

  log(`[CaptureRoute] Estimated capture: ` + `${selection.estimatedCaptureMeters.toFixed(0)} m`);

  log(`[CaptureRoute] Selection stop reason: ` + `${selection.stopReason}`);

  log(`[CaptureRoute] Selected anchor slots: ` + `${selection.usedAnchorSlots}/` + `${maxFinalStops}`);
  const anchorDistribution = captureAnchorDistribution(selection.opportunities);

  log(`[CaptureRoute] Anchor distribution: ` + `1=${anchorDistribution.one}, ` + `2=${anchorDistribution.two}, ` + `3=${anchorDistribution.three}`);

  const threeAnchorDiagnostics = captureThreeAnchorDiagnostics(selection.opportunities);

  log("[CaptureRoute] 3-anchor detail:\n" + JSON.stringify(threeAnchorDiagnostics, null, 2));

  log(`[CaptureRoute] Rejected by budget: ` + `${selection.rejectedForBudgetCount}`);

  log(`[CaptureRoute] Rejected by anchor cap: ` + `${selection.rejectedForAnchorCount}`);
}
