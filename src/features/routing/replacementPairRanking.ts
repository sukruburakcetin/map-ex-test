import type { CaptureOpportunity } from '../../utils/routeOptimizer';

interface ReplacementPairRankingInput {
  activeOpportunities: readonly CaptureOpportunity[];
  replacementCandidatePool: readonly CaptureOpportunity[];
  permanentlyRejectedOpportunityIds: ReadonlySet<string>;
  maxFinalStops: number;
}

/** Local ranking only. Pass limits, provider probes and acceptance remain in the widget. */
export function rankCaptureReplacementPairs({
  activeOpportunities, replacementCandidatePool, permanentlyRejectedOpportunityIds, maxFinalStops,
}: ReplacementPairRankingInput) {
  const activeIds = new Set(activeOpportunities.map(opportunity => opportunity.id));
  const addCandidates = replacementCandidatePool
    .filter(opportunity => !activeIds.has(opportunity.id)
      && !permanentlyRejectedOpportunityIds.has(opportunity.id) && opportunity.valueMeters > 0)
    .sort((a, b) => b.valueMeters - a.valueMeters).slice(0, 5);
  const removeCandidates = [...activeOpportunities]
    .sort((a, b) => a.valueMeters - b.valueMeters).slice(0, 5);
  const activeAnchorCount = activeOpportunities.reduce((sum, opportunity) => sum + opportunity.routePoints.length, 0);
  const pairs: Array<{
    add: CaptureOpportunity; remove: CaptureOpportunity; valueGain: number; baselineGap: number;
  }> = [];
  // Preserve candidate caps before pairing and stable add-then-remove traversal for ties.
  for (const add of addCandidates) for (const remove of removeCandidates) {
    const valueGain = add.valueMeters - remove.valueMeters;
    if (valueGain <= 25) continue;
    const trialAnchorCount = activeAnchorCount - remove.routePoints.length + add.routePoints.length;
    if (trialAnchorCount > maxFinalStops) continue;
    pairs.push({ add, remove, valueGain, baselineGap: Math.abs(add.baselinePosition - remove.baselinePosition) });
  }
  pairs.sort((a, b) => b.valueGain - a.valueGain || a.baselineGap - b.baselineGap);
  return pairs.slice(0, 5);
}
