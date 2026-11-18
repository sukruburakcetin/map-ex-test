import type { RoutingCoordinate } from "../../utils/routingTypes";
import type { RouteSelectionResult } from "../../utils/routeOptimizer";
import type { evaluateRouteCoverage, evaluateIncrementalRouteCoverage } from "../../utils/geoUtils";
import type { activeCaptureCoverageTargets } from "./captureRouteScoring";

export interface CaptureRouteDataInput {
  finalDistanceMeters: number;
  finalMinutes: number;
  combinedCoordinates: RoutingCoordinate[];
  baselineMinutes: number;
  actualExtraMinutes: number;
  spareMinutes: number;
  activeRouteCoverageTargets: ReturnType<typeof activeCaptureCoverageTargets>;
  routeCoverage: ReturnType<typeof evaluateRouteCoverage>;
  incrementalCoverage: ReturnType<typeof evaluateIncrementalRouteCoverage>;
  finalSelectedNovelMeters: number;
  finalSelectedBaselineOverlapMeters: number;
  selectedOpportunityCount: number;
  finalSelectedAnchorCount: number;
  selectedCorridorWidth: number;
  selectionStopReason: RouteSelectionResult["stopReason"];
}

/** Assemble the published result without owning UI, geometry evaluation or run lifecycle. */
export function buildCaptureRouteData({
  finalDistanceMeters, finalMinutes, combinedCoordinates, baselineMinutes, actualExtraMinutes,
  spareMinutes, activeRouteCoverageTargets, routeCoverage, incrementalCoverage,
  finalSelectedNovelMeters, finalSelectedBaselineOverlapMeters, selectedOpportunityCount,
  finalSelectedAnchorCount, selectedCorridorWidth, selectionStopReason,
}: CaptureRouteDataInput) {
  return {
    distance: finalDistanceMeters,
    duration: finalMinutes * 60,
    geojson: {
      type: "LineString" as const,
      coordinates: combinedCoordinates,
    },
    baselineDurationMinutes: baselineMinutes,
    extraDurationMinutes: actualExtraMinutes,
    requestedExtraMinutes: spareMinutes,
    targetedLengthMeters: activeRouteCoverageTargets.reduce((sum, target) => sum + target.lengthMeters, 0),
    coveredTargetLengthMeters: routeCoverage.coveredTargetMeters,
    targetRealizationPercent: routeCoverage.coveragePercent,
    usefulCoverageMeters: incrementalCoverage.incrementalCoveredMeters,
    incrementalNoneMeters: incrementalCoverage.incrementalNoneMeters,
    incrementalStaleMeters: incrementalCoverage.incrementalStaleMeters,
    selectedNovelTargetMeters: finalSelectedNovelMeters,
    selectedBaselineOverlapMeters: finalSelectedBaselineOverlapMeters,
    selectedOpportunityCount,
    selectedAnchorCount: finalSelectedAnchorCount,
    selectedCorridorWidthMeters: selectedCorridorWidth,
    selectionStopReason,
    touchedSegmentCount: routeCoverage.touchedSegmentCount,
    fullyCoveredSegmentCount: routeCoverage.fullyCoveredSegmentCount,
    totalTargetSegmentCount: routeCoverage.segmentResults.length,
    // Legacy consumers retain the same aliases and independently reported total.
    targetCoveragePercent: routeCoverage.coveragePercent,
    capturedTargetLengthMeters: routeCoverage.coveredTargetMeters,
    totalTargetLengthMeters: routeCoverage.totalTargetMeters,
    remainingTargetLengthMeters: Math.max(0, activeRouteCoverageTargets.reduce((sum, target) => sum + target.lengthMeters, 0) - routeCoverage.coveredTargetMeters),
    capturedSegmentCount: routeCoverage.fullyCoveredSegmentCount,
    totalSegmentCount: routeCoverage.segmentResults.length,
  };
}
