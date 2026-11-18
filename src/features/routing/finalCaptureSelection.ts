export interface FinalCaptureSelectionInput<Route extends { durationMinutes: number }, Opportunity> {
  finalRoute: Route;
  finalRouteOpportunities: Opportunity[];
  bestRoute: Route | null;
  bestRouteOpportunities: readonly Opportunity[];
  bestActualExtraMinutes: number;
  baselineMinutes: number;
  spareMinutes: number;
  finalBudgetTolerance: number;
}

/** Recover only a strictly better solve when the last solve exceeds the tolerated budget. */
export function selectFinalCaptureRoute<Route extends { durationMinutes: number }, Opportunity>({
  finalRoute, finalRouteOpportunities, bestRoute, bestRouteOpportunities,
  bestActualExtraMinutes, baselineMinutes, spareMinutes, finalBudgetTolerance,
}: FinalCaptureSelectionInput<Route, Opportunity>) {
  const lastRouteExtraMinutes = finalRoute.durationMinutes - baselineMinutes;
  if (lastRouteExtraMinutes > spareMinutes + finalBudgetTolerance && bestRoute && bestActualExtraMinutes < lastRouteExtraMinutes) {
    return { route: bestRoute, opportunities: [...bestRouteOpportunities], recovered: true, lastRouteExtraMinutes };
  }
  return { route: finalRoute, opportunities: finalRouteOpportunities, recovered: false, lastRouteExtraMinutes };
}
