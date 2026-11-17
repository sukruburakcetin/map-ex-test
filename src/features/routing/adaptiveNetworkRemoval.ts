/** Plan only: preserve candidate order and ID-set limits; the widget applies/retries. */
export function planAdaptiveNetworkRemoval<T extends { opportunity: { id: string } }>(
  candidates: readonly T[], activeOpportunityCount: number, overrunRatio: number,
) {
  let targetedRemovalLimit = 1;
  if (overrunRatio >= 3.0) targetedRemovalLimit = 6;
  else if (overrunRatio >= 2.0) targetedRemovalLimit = 4;
  else if (overrunRatio >= 1.4) targetedRemovalLimit = 2;

  const networkRemoveIds = new Set<string>();
  const removals: T[] = [];
  for (const candidate of candidates) {
    if (networkRemoveIds.size >= targetedRemovalLimit) break;
    if (activeOpportunityCount - networkRemoveIds.size <= 1) break;
    networkRemoveIds.add(candidate.opportunity.id);
    removals.push(candidate);
  }
  return { targetedRemovalLimit, networkRemoveIds, removals };
}
