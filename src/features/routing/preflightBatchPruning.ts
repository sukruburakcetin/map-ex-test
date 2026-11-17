import type { CaptureOpportunity } from '../../utils/routeOptimizer';

interface PreflightBatchPruningInput {
  opportunities: readonly CaptureOpportunity[];
  projectedExtraMinutes: number;
  spareMinutes: number;
  preflightTolerance: number;
}

/** Local removal plan only. The widget owns preflight probes, branch guards, logs and anchor rebuilds. */
export function planPreflightBatchPruning({
  opportunities, projectedExtraMinutes, spareMinutes, preflightTolerance,
}: PreflightBatchPruningInput) {
  const activeEstimatedMinutes = opportunities.reduce(
    (sum, opportunity) => sum + Math.max(0, opportunity.estimatedDetourMinutes), 0,
  );
  const preflightRatio = projectedExtraMinutes / Math.max(0.25, activeEstimatedMinutes);
  // Retain OSRM's existing calibration and reserve; final solves use a different reserve.
  const correctionFactor = Math.min(6.0, Math.max(1.0, preflightRatio));
  const allowedExtraMinutes = spareMinutes + preflightTolerance;
  const preflightSafetyFactor = 0.85;
  const targetEstimatedMinutes = Math.max(0, (allowedExtraMinutes / correctionFactor) * preflightSafetyFactor);
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
