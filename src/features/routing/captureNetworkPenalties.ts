import type { CaptureOpportunity } from '../../utils/routeOptimizer';

interface NetworkLeg {
  fromOwner: string;
  toOwner: string;
  durationMinutes: number;
}
interface CaptureNetworkPenaltyInput {
  preflightLegs: readonly NetworkLeg[];
  activeOpportunities: readonly CaptureOpportunity[];
  spareMinutes: number;
  qualityCleanupMode: boolean;
  pathologicalOwnerIds: ReadonlySet<string>;
}

/** Rank local network costs only; provider probes and removal decisions stay in the widget. */
export function scoreCaptureNetworkPenalties({
  preflightLegs, activeOpportunities, spareMinutes, qualityCleanupMode, pathologicalOwnerIds,
}: CaptureNetworkPenaltyInput) {
  const badLegThresholdMinutes = Math.max(2.0, Math.min(4.0, spareMinutes * 0.08));
  const networkPenaltyByOpportunity = new Map<string, number>();
  const addNetworkPenalty = (owner: string, minutes: number) => {
    if (!owner || owner === 'START' || owner === 'END' || owner === 'UNKNOWN') return;
    networkPenaltyByOpportunity.set(owner, (networkPenaltyByOpportunity.get(owner) ?? 0) + minutes);
  };
  // Inputs are the existing rounded preflight legs. Do not re-round or normalize them.
  for (const leg of preflightLegs) {
    if (qualityCleanupMode && (leg.fromOwner === 'START' || leg.fromOwner === 'END'
      || leg.toOwner === 'START' || leg.toOwner === 'END')) continue;
    const excessMinutes = leg.durationMinutes - badLegThresholdMinutes;
    if (excessMinutes <= 0) continue;
    if (leg.fromOwner === leg.toOwner) {
      addNetworkPenalty(leg.fromOwner, excessMinutes);
      continue;
    }
    if (leg.fromOwner === 'START' || leg.fromOwner === 'END' || leg.fromOwner === 'UNKNOWN') {
      addNetworkPenalty(leg.toOwner, excessMinutes);
      continue;
    }
    if (leg.toOwner === 'START' || leg.toOwner === 'END' || leg.toOwner === 'UNKNOWN') {
      addNetworkPenalty(leg.fromOwner, excessMinutes);
      continue;
    }
    addNetworkPenalty(leg.fromOwner, excessMinutes * 0.5);
    addNetworkPenalty(leg.toOwner, excessMinutes * 0.5);
  }

  const networkPruneCandidates = activeOpportunities.map(opportunity => {
    const networkPenaltyMinutes = networkPenaltyByOpportunity.get(opportunity.id) ?? 0;
    const penaltyPer100Meters = (networkPenaltyMinutes / Math.max(100, opportunity.valueMeters)) * 100;
    return { opportunity, networkPenaltyMinutes, penaltyPer100Meters };
  }).filter(candidate => {
    if (candidate.networkPenaltyMinutes <= 0) return false;
    if (qualityCleanupMode && !pathologicalOwnerIds.has(candidate.opportunity.id)) return false;
    return true;
  }).sort((a, b) => b.penaltyPer100Meters - a.penaltyPer100Meters
    || b.networkPenaltyMinutes - a.networkPenaltyMinutes);

  return { badLegThresholdMinutes, networkPenaltyByOpportunity, networkPruneCandidates };
}
