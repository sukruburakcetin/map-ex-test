import { evaluateRouteCoverage, evaluateIncrementalRouteCoverage } from "../../utils/geoUtils";
import type { RoutingCoordinate } from "../../utils/routingTypes";
import type { CaptureOpportunity } from "../../utils/routeOptimizer";
import { normalizeCaptureRoutePaths } from "./captureRouteGeometry";
import { activeCaptureCoverageTargets } from "./captureRouteScoring";

export interface CaptureRouteEvaluationInput {
  paths: unknown;
  baselinePaths: RoutingCoordinate[][];
  activeOpportunities: readonly CaptureOpportunity[];
  routeCoverageToleranceMeters: number;
  coverageSampleSpacingMeters: number;
}

/** Synchronous evaluation only; validation precedes both coverage calculations. */
export function evaluateFinalCaptureRoute({
  paths, baselinePaths, activeOpportunities, routeCoverageToleranceMeters, coverageSampleSpacingMeters,
}: CaptureRouteEvaluationInput) {
  const finalPaths = normalizeCaptureRoutePaths(paths);
  if (!finalPaths) throw new Error("Final route geometry is empty.");
  const activeRouteCoverageTargets = activeCaptureCoverageTargets(activeOpportunities);
  const routeCoverage = evaluateRouteCoverage(
    finalPaths, activeRouteCoverageTargets, routeCoverageToleranceMeters, coverageSampleSpacingMeters,
  );
  const incrementalCoverage = evaluateIncrementalRouteCoverage(
    finalPaths, baselinePaths, activeRouteCoverageTargets, routeCoverageToleranceMeters, coverageSampleSpacingMeters,
  );
  const combinedCoordinates: RoutingCoordinate[] = finalPaths.flatMap(path => path);
  return { finalPaths, activeRouteCoverageTargets, routeCoverage, incrementalCoverage, combinedCoordinates };
}
