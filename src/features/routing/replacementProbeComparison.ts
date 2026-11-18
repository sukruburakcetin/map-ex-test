import type { CaptureOpportunity } from "../../utils/routeOptimizer";
import type { rankCaptureReplacementPairs } from "./replacementPairRanking";

export interface CaptureReplacementProbe {
  opportunities: CaptureOpportunity[];
  addId: string;
  removeId: string;
  extraMinutes: number;
  valueGain: number;
}

/** Called only after snap/quality/budget gates. Prefer value gain, then more budget use. */
export function chooseCaptureReplacementProbe(
  current: CaptureReplacementProbe | null,
  pair: ReturnType<typeof rankCaptureReplacementPairs>[number],
  trialOpportunities: CaptureOpportunity[],
  trialExtraMinutes: number,
): CaptureReplacementProbe | null {
  if (!current || pair.valueGain > current.valueGain ||
    (pair.valueGain === current.valueGain && trialExtraMinutes > current.extraMinutes)) {
    return {
      opportunities: trialOpportunities,
      addId: pair.add.id,
      removeId: pair.remove.id,
      extraMinutes: trialExtraMinutes,
      valueGain: pair.valueGain,
    };
  }
  return current;
}
