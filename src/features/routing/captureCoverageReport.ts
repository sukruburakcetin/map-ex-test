import type { CaptureOpportunity } from "../../utils/routeOptimizer";
import type { evaluateRouteCoverage, evaluateIncrementalRouteCoverage } from "../../utils/geoUtils";
import { summarizeCaptureOpportunities } from "./captureRouteScoring";

export interface CaptureCoverageReportInput {
  activeOpportunities: readonly CaptureOpportunity[];
  routeCoverage: ReturnType<typeof evaluateRouteCoverage>;
  incrementalCoverage: ReturnType<typeof evaluateIncrementalRouteCoverage>;
  log: (message: string) => void;
}

/** Synchronous diagnostics for the exact selection belonging to the displayed solve. */
export function reportCaptureRouteCoverage({
  activeOpportunities, routeCoverage, incrementalCoverage, log,
}: CaptureCoverageReportInput) {
  const summary = summarizeCaptureOpportunities(activeOpportunities);
  const { missingMeters, staleMeters, targetedCaptureMeters, finalSelectedNovelMeters,
    finalSelectedBaselineOverlapMeters, finalSelectedAnchorCount } = summary;
  log(`[CaptureRoute] Active opportunities: ` + `${activeOpportunities.length}`);
  log(`[CaptureRoute] Targeted NONE: ` + `${missingMeters.toFixed(0)} m`);
  log(`[CaptureRoute] Targeted STALE: ` + `${staleMeters.toFixed(0)} m`);
  log(`[CaptureRoute] Targeted capture: ` + `${targetedCaptureMeters.toFixed(0)} m`);
  log(`[CaptureRoute] Actual targeted route coverage: ` + `${routeCoverage.coveredTargetMeters.toFixed(0)} m`);
  log(`[CaptureRoute] Actual NONE coverage: ` + `${routeCoverage.noneCoveredMeters.toFixed(0)} m`);
  log(`[CaptureRoute] Actual STALE coverage: ` + `${routeCoverage.staleCoveredMeters.toFixed(0)} m`);
  log(`[CaptureRoute] Target realization: ` + `${routeCoverage.coveragePercent.toFixed(1)}%`);
  log(`[CaptureRoute] Target segments touched: ` + `${routeCoverage.touchedSegmentCount}/` + `${routeCoverage.segmentResults.length}`);
  log(`[CaptureRoute] Target segments fully covered: ` + `${routeCoverage.fullyCoveredSegmentCount}/` + `${routeCoverage.segmentResults.length}`);
  log(`[CaptureRoute] Baseline target overlap: ` + `${incrementalCoverage.baselineCoveredMeters.toFixed(0)} m`);
  log(`[CaptureRoute] Final target overlap: ` + `${incrementalCoverage.finalCoveredMeters.toFixed(0)} m`);
  log(`[CaptureRoute] Shared baseline/final overlap: ` + `${incrementalCoverage.sharedCoveredMeters.toFixed(0)} m`);
  log(`[CaptureRoute] Incremental useful coverage: ` + `${incrementalCoverage.incrementalCoveredMeters.toFixed(0)} m`);
  log(`[CaptureRoute] Incremental NONE: ` + `${incrementalCoverage.incrementalNoneMeters.toFixed(0)} m`);
  log(`[CaptureRoute] Incremental STALE: ` + `${incrementalCoverage.incrementalStaleMeters.toFixed(0)} m`);
  log(`[CaptureRoute] Incremental target gain: ` + `${incrementalCoverage.incrementalPercent.toFixed(1)}%`);
  log(`[CaptureRoute] Final selected baseline-new target: ` + `${finalSelectedNovelMeters.toFixed(0)} m`);
  log(`[CaptureRoute] Final selected baseline-overlap target: ` + `${finalSelectedBaselineOverlapMeters.toFixed(0)} m`);
  log(`[CaptureRoute] Final novelty-aware anchors: ` + `${finalSelectedAnchorCount}`);
  return summary;
}
