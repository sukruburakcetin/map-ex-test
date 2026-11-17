export interface ProgressBudgetProbe {
  opportunityId: string;
  extraMinutes: number;
  valueLost: number;
}
export interface FittingBudgetProbe extends ProgressBudgetProbe {
  reliefMinutes: number;
  costPerReliefMinute: number;
}
export interface NetworkBudgetProbe {
  opportunityId: string;
  extraMinutes: number;
  valueLostMeters: number;
  reliefMinutes: number;
  valueLossPerReliefMinute: number;
}

function preferFit(cost: number, extra: number, currentCost: number, currentExtra: number): boolean {
  return cost < currentCost - 0.5 || (Math.abs(cost - currentCost) <= 0.5 && extra > currentExtra);
}

/** Caller retains quality/fit gates and provider ownership; preserve winner object shapes. */
export function chooseNetworkBudgetProbe(
  current: NetworkBudgetProbe | null, opportunityId: string, extraMinutes: number,
  valueLostMeters: number, projectedExtraMinutes: number,
): NetworkBudgetProbe | null {
  const reliefMinutes = projectedExtraMinutes - extraMinutes;
  const valueLossPerReliefMinute = valueLostMeters / Math.max(0.25, reliefMinutes);
  if (!current || preferFit(valueLossPerReliefMinute, extraMinutes, current.valueLossPerReliefMinute, current.extraMinutes)) {
    return { opportunityId, extraMinutes, valueLostMeters, reliefMinutes, valueLossPerReliefMinute };
  }
  return current;
}

export function chooseProgressBudgetProbe(
  current: ProgressBudgetProbe | null, opportunityId: string, extraMinutes: number,
  valueLost: number, projectedExtraMinutes: number,
): ProgressBudgetProbe | null {
  if (extraMinutes < projectedExtraMinutes - 0.1 && (!current || extraMinutes < current.extraMinutes)) {
    return { opportunityId, extraMinutes, valueLost };
  }
  return current;
}

export function chooseFittingBudgetProbe(
  current: FittingBudgetProbe | null, opportunityId: string, extraMinutes: number,
  valueLost: number, projectedExtraMinutes: number,
): FittingBudgetProbe | null {
  const reliefMinutes = projectedExtraMinutes - extraMinutes;
  const costPerReliefMinute = valueLost / Math.max(0.25, reliefMinutes);
  if (!current || preferFit(costPerReliefMinute, extraMinutes, current.costPerReliefMinute, current.extraMinutes)) {
    return { opportunityId, extraMinutes, valueLost, reliefMinutes, costPerReliefMinute };
  }
  return current;
}
