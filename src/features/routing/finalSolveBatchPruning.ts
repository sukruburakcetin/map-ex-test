import type { CaptureOpportunity } from '../../utils/routeOptimizer';

interface FinalSolveBatchPruningInput {
  opportunities: readonly CaptureOpportunity[];
  actualExtraMinutes: number;
  spareMinutes: number;
  budgetTolerance: number;
}

/** Local removal plan only. The widget owns solve/retry guards, logs and run state. */
export function planFinalSolveBatchPruning({
  opportunities, actualExtraMinutes, spareMinutes, budgetTolerance,
}: FinalSolveBatchPruningInput) {
  const activeEstimatedMinutes = opportunities.reduce(
    (sum, opportunity) => sum + Math.max(0, opportunity.estimatedDetourMinutes), 0,
  );
  const actualToEstimatedRatio = actualExtraMinutes / Math.max(0.25, activeEstimatedMinutes);
  // Retain the authoritative solve's calibration, capped at the existing 6x limit.
  const correctionFactor = Math.min(6.0, Math.max(1.0, actualToEstimatedRatio));
  const allowedActualExtraMinutes = spareMinutes + budgetTolerance;
  const calibrationSafetyFactor = 0.96;
  const targetEstimatedMinutes = Math.max(0, (allowedActualExtraMinutes / correctionFactor) * calibrationSafetyFactor);
  const estimatedMinutesToRemove = Math.max(0.25, activeEstimatedMinutes - targetEstimatedMinutes);

  // Stable efficiency ties follow input order. Never reorder the caller's array.
  const candidates = opportunities.map(opportunity => ({
    opportunity,
    efficiency: opportunity.valueMeters / Math.max(0.25, opportunity.estimatedDetourMinutes),
  })).sort((a, b) => a.efficiency - b.efficiency);
  const removeIds = new Set<string>();
  const removals: CaptureOpportunity[] = [];
  let removedEstimatedMinutes = 0;
  for (const { opportunity } of candidates) {
    if (opportunities.length - removeIds.size <= 1) break;
    removeIds.add(opportunity.id);
    removals.push(opportunity);
    removedEstimatedMinutes += Math.max(0, opportunity.estimatedDetourMinutes);
    if (removedEstimatedMinutes >= estimatedMinutesToRemove) break;
  }

  return {
    activeEstimatedMinutes, correctionFactor, targetEstimatedMinutes, estimatedMinutesToRemove,
    removeIds, removals, removedEstimatedMinutes,
    opportunities: opportunities.filter(opportunity => !removeIds.has(opportunity.id))
      .sort((a, b) => a.baselinePosition - b.baselinePosition),
  };
}
