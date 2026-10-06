import { distanceMeters, calculateBearing, projectPointToPolyline, pointToPolylineDistanceMeters, polylineLengthMeters, segmentToSegmentDistanceMeters } from "./geoUtils";

import { CAPTURE_ROUTE_CONFIG } from "./constants";

export type RouteCoordinate = [number, number];

export interface RouteTargetSegment {
  seg: {
    start: RouteCoordinate;
    end: RouteCoordinate;
    lengthMeters: number;
    highwayType: string;
    isOneway: boolean;
  };
  index: number;
  tier: "none" | "stale";
  midpoint: RouteCoordinate;
  lengthMeters: number;
  distanceFromCenterMeters: number;
  priority: number;
  clusterId: number;
}

export interface CaptureOpportunity {
  id: string;

  tier: "none" | "stale" | "mixed";

  segments: RouteTargetSegment[];

  lengthMeters: number;

  valueMeters: number;

  priority: number;

  entryPoint: RouteCoordinate;

  exitPoint: RouteCoordinate;

  midpoint: RouteCoordinate;

  baselinePosition: number;

  baselineDistanceMeters: number;

  estimatedDetourMeters: number;

  estimatedDetourMinutes: number;

  /**
   * Points that will eventually become ArcGIS route stops.
   */
  routePoints: RouteCoordinate[];

  novelMeters: number;

  novelMissingMeters: number;

  novelStaleMeters: number;

  baselineOverlapMeters: number;
}

export interface RouteSelectionResult {
  opportunities: CaptureOpportunity[];

  estimatedExtraMinutes: number;

  estimatedCaptureMeters: number;

  estimatedMissingMeters: number;

  estimatedStaleMeters: number;
  usedAnchorSlots: number;

  rejectedForBudgetCount: number;
  rejectedForAnchorCount: number;
  stopReason: "budget" | "anchor-cap" | "opportunity-cap" | "exhausted";
}

function midpoint(a: RouteCoordinate, b: RouteCoordinate): RouteCoordinate {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

function averagePoint(points: RouteCoordinate[]): RouteCoordinate {
  if (!points.length) return [0, 0];

  let lon = 0;
  let lat = 0;

  for (const p of points) {
    lon += p[0];
    lat += p[1];
  }

  return [lon / points.length, lat / points.length];
}

function segmentMidpoint(target: RouteTargetSegment): RouteCoordinate {
  return target.midpoint;
}

function opportunityTier(segments: RouteTargetSegment[]): "none" | "stale" | "mixed" {
  const hasNone = segments.some((s) => s.tier === "none");
  const hasStale = segments.some((s) => s.tier === "stale");

  if (hasNone && hasStale) return "mixed";
  if (hasNone) return "none";
  return "stale";
}

interface TargetNovelty {
  rawMeters: number;
  novelMeters: number;
  baselineOverlapMeters: number;
  novelFraction: number;
}

/**
 * Estimates how much of one target segment is NOT already covered by
 * the normal A → B baseline route.
 *
 * This uses the same sampling model as final route coverage evaluation:
 * - sample approximately every coverageSampleSpacingMeters
 * - test against routeCoverageToleranceMeters
 *
 * A sample outside the baseline tolerance is potentially useful new
 * coverage for the detour.
 */
function estimateTargetNovelty(target: RouteTargetSegment, baseline: RouteCoordinate[]): TargetNovelty {
  const rawMeters = target.lengthMeters > 0 ? target.lengthMeters : distanceMeters(target.seg.start[1], target.seg.start[0], target.seg.end[1], target.seg.end[0]);

  if (rawMeters <= 0 || baseline.length < 2) {
    return {
      rawMeters,
      novelMeters: rawMeters,
      baselineOverlapMeters: 0,
      novelFraction: 1,
    };
  }

  const spacing = Math.max(1, CAPTURE_ROUTE_CONFIG.coverageSampleSpacingMeters);

  const tolerance = Math.max(0, CAPTURE_ROUTE_CONFIG.routeCoverageToleranceMeters);

  const sampleCount = Math.max(1, Math.ceil(rawMeters / spacing));

  let novelSamples = 0;

  for (let i = 0; i < sampleCount; i++) {
    /*
     * Midpoint sampling prevents intersections/endpoints from
     * receiving excessive influence.
     */
    const t = (i + 0.5) / sampleCount;

    const point: RouteCoordinate = [target.seg.start[0] + (target.seg.end[0] - target.seg.start[0]) * t, target.seg.start[1] + (target.seg.end[1] - target.seg.start[1]) * t];

    const baselineDistance = pointToPolylineDistanceMeters(point, baseline);

    if (baselineDistance > tolerance) {
      novelSamples++;
    }
  }

  const novelFraction = novelSamples / sampleCount;

  const novelMeters = rawMeters * novelFraction;

  return {
    rawMeters,

    novelMeters,

    baselineOverlapMeters: Math.max(0, rawMeters - novelMeters),

    novelFraction,
  };
}

function opportunityValue(
  segments: RouteTargetSegment[],
  baseline: RouteCoordinate[],
): {
  valueMeters: number;

  missingMeters: number;
  staleMeters: number;

  novelMeters: number;
  novelMissingMeters: number;
  novelStaleMeters: number;

  baselineOverlapMeters: number;
} {
  let missingMeters = 0;
  let staleMeters = 0;

  let novelMissingMeters = 0;
  let novelStaleMeters = 0;

  let baselineOverlapMeters = 0;

  for (const target of segments) {
    const novelty = estimateTargetNovelty(target, baseline);

    baselineOverlapMeters += novelty.baselineOverlapMeters;

    if (target.tier === "none") {
      missingMeters += target.lengthMeters;

      novelMissingMeters += novelty.novelMeters;
    } else {
      staleMeters += target.lengthMeters;

      novelStaleMeters += novelty.novelMeters;
    }
  }

  const novelMeters = novelMissingMeters + novelStaleMeters;

  /*
   * KEY CHANGE:
   *
   * Only baseline-NEW road receives optimizer value.
   *
   * A road already covered by the normal A → B journey should
   * not persuade the optimizer to spend detour time on it.
   */
  const valueMeters = novelMissingMeters * CAPTURE_ROUTE_CONFIG.nonePriority + novelStaleMeters * CAPTURE_ROUTE_CONFIG.stalePriority;

  return {
    valueMeters,

    missingMeters,
    staleMeters,

    novelMeters,
    novelMissingMeters,
    novelStaleMeters,

    baselineOverlapMeters,
  };
}

/**
 * Find the two farthest endpoints of an opportunity.
 *
 * This works well for the street-run model because a capture
 * opportunity should represent a continuous piece of road,
 * not an arbitrary point cluster.
 */
function farthestEndpoints(segments: RouteTargetSegment[]): [RouteCoordinate, RouteCoordinate] {
  const points: RouteCoordinate[] = [];

  for (const target of segments) {
    if (target?.seg?.start) {
      points.push(target.seg.start);
    }

    if (target?.seg?.end) {
      points.push(target.seg.end);
    }
  }

  if (points.length === 0) {
    return [
      [0, 0],
      [0, 0],
    ];
  }

  if (points.length === 1) {
    return [points[0], points[0]];
  }

  let bestA = points[0];
  let bestB = points[1];
  let bestDistance = -1;

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const d = distanceMeters(points[i][1], points[i][0], points[j][1], points[j][0]);

      if (d > bestDistance) {
        bestDistance = d;
        bestA = points[i];
        bestB = points[j];
      }
    }
  }

  return [bestA, bestB];
}

/**
 * Picks an actual target-segment midpoint near the middle of the
 * opportunity's A → B travel position.
 *
 * Unlike midpoint(entryPoint, exitPoint), the returned coordinate
 * is guaranteed to lie on one of the target road segments.
 */
function pickMiddleRoadAnchor(segments: RouteTargetSegment[], baseline: RouteCoordinate[], desiredAlongMeters: number): RouteCoordinate {
  if (!segments.length) {
    return [0, 0];
  }

  let bestPoint = segments[0].midpoint;

  let bestDifference = Infinity;

  for (const segment of segments) {
    const projection = projectPointToPolyline(segment.midpoint, baseline);

    if (!projection) {
      continue;
    }

    const difference = Math.abs(projection.alongMeters - desiredAlongMeters);

    if (difference < bestDifference) {
      bestDifference = difference;

      bestPoint = segment.midpoint;
    }
  }

  return bestPoint;
}

function segmentBearing(target: RouteTargetSegment): number {
  return calculateBearing(target.seg.start[1], target.seg.start[0], target.seg.end[1], target.seg.end[0]);
}

/**
 * Returns the angle between two road AXES, ignoring direction.
 *
 * Examples:
 *
 *   10° vs 190° → 0°
 *   0°  vs 90°  → 90°
 *   350° vs 10° → 20°
 */
function undirectedBearingDifference(bearingA: number, bearingB: number): number {
  let difference = Math.abs(bearingA - bearingB) % 180;

  if (difference > 90) {
    difference = 180 - difference;
  }

  return difference;
}

function segmentsCanMerge(a: RouteTargetSegment, b: RouteTargetSegment, baseline: RouteCoordinate[]): boolean {
  /*
   * A true road continuation should have endpoints reasonably
   * close to one another.
   *
   * Use the dedicated endpoint tolerance rather than the broader
   * opportunity merge radius.
   */
  const endpointThreshold = CAPTURE_ROUTE_CONFIG.opportunityEndpointToleranceMeters;

  const bodyThreshold = CAPTURE_ROUTE_CONFIG.opportunityMergeDistanceMeters;

  const alongThreshold = CAPTURE_ROUTE_CONFIG.opportunityMergeAlongRouteMeters;

  /*
   * ------------------------------------------------------------
   * 1. ENDPOINT CONNECTIVITY
   * ------------------------------------------------------------
   */

  const endpointDistance = Math.min(
    distanceMeters(a.seg.start[1], a.seg.start[0], b.seg.start[1], b.seg.start[0]),

    distanceMeters(a.seg.start[1], a.seg.start[0], b.seg.end[1], b.seg.end[0]),

    distanceMeters(a.seg.end[1], a.seg.end[0], b.seg.start[1], b.seg.start[0]),

    distanceMeters(a.seg.end[1], a.seg.end[0], b.seg.end[1], b.seg.end[0]),
  );

  if (endpointDistance > endpointThreshold) {
    return false;
  }

  /*
   * ------------------------------------------------------------
   * 2. ROAD-DIRECTION CONTINUITY
   * ------------------------------------------------------------
   *
   * This is the important new guard.
   *
   * Two roads meeting at the same intersection have endpoint
   * distance ~= 0, so distance alone cannot distinguish:
   *
   *     ───────────
   *
   * from:
   *
   *         │
   *     ────┼────
   *         │
   */

  const angleDifference = undirectedBearingDifference(segmentBearing(a), segmentBearing(b));

  if (angleDifference > CAPTURE_ROUTE_CONFIG.opportunityMergeMaxAngleDegrees) {
    return false;
  }

  /*
   * ------------------------------------------------------------
   * 3. BODY PROXIMITY
   * ------------------------------------------------------------
   */

  const bodyDistance = segmentToSegmentDistanceMeters(a.seg.start, a.seg.end, b.seg.start, b.seg.end);

  if (bodyDistance > bodyThreshold) {
    return false;
  }

  /*
   * ------------------------------------------------------------
   * 4. POSITION ALONG A → B BASELINE
   * ------------------------------------------------------------
   */

  const aProjection = projectPointToPolyline(a.midpoint, baseline);

  const bProjection = projectPointToPolyline(b.midpoint, baseline);

  if (!aProjection || !bProjection) {
    return false;
  }

  const alongDifference = Math.abs(aProjection.alongMeters - bProjection.alongMeters);

  if (alongDifference > alongThreshold) {
    return false;
  }

  return true;
}

/**
 * Build connected capture opportunities from stale/none target segments.
 */
export function buildCaptureOpportunities(
  targets: RouteTargetSegment[],
  baseline: RouteCoordinate[],
  baselineSpeedMetersPerMinute: number,
  corridorWidthMeters: number = CAPTURE_ROUTE_CONFIG.corridorWidthMeters,
): CaptureOpportunity[] {
  if (!targets.length || baseline.length < 2) {
    return [];
  }

  /**
   * First remove targets that are clearly outside the baseline corridor.
   */
  const projectedTargets = targets
    .map((target) => {
      const projection = projectPointToPolyline(target.midpoint, baseline);

      return {
        target,
        projection,
      };
    })
    .filter((item) => !!item.projection);

  const corridorTargets = projectedTargets
    .filter((item) => item.projection && item.projection.distanceMeters <= corridorWidthMeters)
    .sort((a, b) => a.projection!.alongMeters - b.projection!.alongMeters);

  console.log(`[CaptureRoute] Targets with baseline projection: ` + `${projectedTargets.length}`);

  console.log(`[CaptureRoute] Targets inside corridor: ` + `${corridorTargets.length}/${targets.length}`);

  console.log(`[CaptureRoute] Targets outside corridor: ` + `${projectedTargets.length - corridorTargets.length}`);

  const corridorBands = [180, 250, 350, 500, 750];

  console.log(
    `[CaptureRoute] Target corridor bands: ` +
      corridorBands
        .map((width) => {
          const count = projectedTargets.filter((item) => item.projection!.distanceMeters <= width).length;

          return `${width}m=${count}`;
        })
        .join(", "),
  );

  /**
   * Connected-component style grouping.
   */
  const groups: RouteTargetSegment[][] = [];

  for (const item of corridorTargets) {
    const target = item.target;

    let merged = false;

    for (const group of groups) {
      if (group.some((existing) => segmentsCanMerge(existing, target, baseline))) {
        group.push(target);
        merged = true;
        break;
      }
    }

    if (!merged) {
      groups.push([target]);
    }
  }

  const opportunities: CaptureOpportunity[] = [];

  let rejectedGroupCountByLength = 0;
  let rejectedSegmentCountByLength = 0;

  let rejectedGroupCountByValue = 0;
  let rejectedSegmentCountByValue = 0;

  let acceptedOpportunitySegmentCount = 0;

  groups.forEach((segments, index) => {
    const totalLength = segments.reduce((sum, s) => sum + s.lengthMeters, 0);

    if (totalLength < CAPTURE_ROUTE_CONFIG.minimumCaptureValueMeters) {
      rejectedGroupCountByLength++;

      rejectedSegmentCountByLength += segments.length;

      return;
    }

    const { valueMeters, missingMeters, staleMeters, novelMeters, novelMissingMeters, novelStaleMeters, baselineOverlapMeters } = opportunityValue(segments, baseline);

    if (valueMeters < CAPTURE_ROUTE_CONFIG.minimumCaptureValueMeters) {
      rejectedGroupCountByValue++;

      rejectedSegmentCountByValue += segments.length;

      return;
    }

    const [rawEntry, rawExit] = farthestEndpoints(segments);

    const entryProjection = projectPointToPolyline(rawEntry, baseline);

    const exitProjection = projectPointToPolyline(rawExit, baseline);

    const mid = averagePoint(segments.map(segmentMidpoint));

    const midProjection = projectPointToPolyline(mid, baseline);

    if (!entryProjection || !exitProjection || !midProjection) {
      return;
    }

    let entryPoint = rawEntry;
    let exitPoint = rawExit;

    /**
     * Follow the natural A → B direction.
     */
    if (entryProjection.alongMeters > exitProjection.alongMeters) {
      entryPoint = rawExit;
      exitPoint = rawEntry;
    }

    const baselineDistance = midProjection.distanceMeters;

    /**
     * Estimate the detour using:
     *
     * connector out
     * + capture road
     * + connector back
     *
     * The factor is deliberately conservative.
     */
    const connectorMeters = entryProjection.distanceMeters + exitProjection.distanceMeters;

    /*
     * The capture road itself is not always entirely additional
     * distance. If an opportunity is close to the baseline, part of
     * its length may effectively overlap the normal A → B movement.
     *
     * Use only a fraction of the capture length as additional distance,
     * while keeping the connector cost fully represented.
     */
    const baselineOverlapFactor = Math.min(0.75, Math.max(0, 1 - baselineDistance / Math.max(1, corridorWidthMeters)));

    const incrementalCaptureMeters = totalLength * (1 - baselineOverlapFactor);

    const estimatedDetourMeters = connectorMeters * CAPTURE_ROUTE_CONFIG.detourDistanceFactor + incrementalCaptureMeters;

    /*
     * The baseline route may use faster arterial roads.
     *
     * Capture detours usually contain:
     * - residential/local streets
     * - more intersections
     * - more turns
     * - lower practical speed
     *
     * Never assume the detour is faster than either:
     *   1. the observed baseline speed, or
     *   2. our conservative capture-road speed.
     */
    const effectiveDetourSpeedMetersPerMinute = Math.max(
      1,
      Math.min(
        baselineSpeedMetersPerMinute > 0 ? baselineSpeedMetersPerMinute : CAPTURE_ROUTE_CONFIG.captureDetourSpeedMetersPerMinute,

        CAPTURE_ROUTE_CONFIG.captureDetourSpeedMetersPerMinute,
      ),
    );

    const estimatedDetourMinutes = estimatedDetourMeters / effectiveDetourSpeedMetersPerMinute;

    const baselinePosition = midProjection.alongMeters / Math.max(1, polylineLengthMeters(baseline));

    /**
     * Prioritize:
     * - missing coverage
     * - longer capture runs
     * - closer-to-baseline opportunities
     */
    const distancePenalty = 1 + (baselineDistance / 100) * CAPTURE_ROUTE_CONFIG.distancePenaltyWeight;

    const priority = valueMeters / distancePenalty;
    /*
     * Use an ACTUAL target-road point for the middle anchor.
     *
     * The old geometric midpoint between entry and exit could fall
     * completely away from the target road.
     */
    const desiredMiddleAlongMeters = (entryProjection.alongMeters + exitProjection.alongMeters) / 2;

    const middleRoadAnchor = pickMiddleRoadAnchor(segments, baseline, desiredMiddleAlongMeters);

    const routePoints = buildNoveltyAwareRoutePoints(segments, baseline, entryPoint, exitPoint);

    if (!routePoints.length) {
      return;
    }

    /*
     * We reached this point, so this group WILL become
     * an accepted opportunity.
     */
    acceptedOpportunitySegmentCount += segments.length;

    opportunities.push({
      id: `capture-opportunity-${index}`,

      tier: opportunityTier(segments),

      segments,

      lengthMeters: totalLength,

      valueMeters,

      novelMeters,
      novelMissingMeters,
      novelStaleMeters,
      baselineOverlapMeters,

      priority,

      entryPoint,
      exitPoint,
      midpoint: mid,

      baselinePosition,

      baselineDistanceMeters: baselineDistance,

      estimatedDetourMeters,
      estimatedDetourMinutes,

      routePoints,
    });

    void missingMeters;
    void staleMeters;
  });
  console.log(`[CaptureRoute] Opportunity groups before filtering: ` + `${groups.length}`);

  console.log(`[CaptureRoute] Groups rejected by length: ` + `${rejectedGroupCountByLength} groups / ` + `${rejectedSegmentCountByLength} segments`);

  console.log(`[CaptureRoute] Groups rejected by value: ` + `${rejectedGroupCountByValue} groups / ` + `${rejectedSegmentCountByValue} segments`);

  console.log(`[CaptureRoute] Segments in accepted opportunities: ` + `${acceptedOpportunitySegmentCount}`);
  return opportunities.sort((a, b) => b.priority - a.priority).slice(0, CAPTURE_ROUTE_CONFIG.maxOpportunities);
}

/**
 * Select the most valuable opportunities that fit within the user's
 * spare-time budget.
 *
 * This is a local greedy knapsack-style heuristic.
 *
 * Importantly, it never calls ArcGIS.
 */
export function selectCaptureOpportunities(opportunities: CaptureOpportunity[], spareMinutes: number): RouteSelectionResult {
  const sorted = [...opportunities].sort((a, b) => {
    const aEfficiency = a.valueMeters / Math.max(0.25, a.estimatedDetourMinutes);

    const bEfficiency = b.valueMeters / Math.max(0.25, b.estimatedDetourMinutes);

    return bEfficiency - aEfficiency;
  });

  const selected: CaptureOpportunity[] = [];
  let usedAnchorSlots = 0;

  let rejectedForBudget = false;
  let rejectedForAnchorCap = false;
  let rejectedForBudgetCount = 0;
  let rejectedForAnchorCount = 0;
  let usedMinutes = 0;
  let captureMeters = 0;
  let missingMeters = 0;
  let staleMeters = 0;

  let stopReason: "budget" | "opportunity-cap" | "exhausted" = "exhausted";

  for (const opportunity of sorted) {
    /*
     * Absolute safety ceiling.
     *
     * This should no longer be the normal reason selection stops.
     */
    if (selected.length >= CAPTURE_ROUTE_CONFIG.maxSelectedOpportunities) {
      stopReason = "opportunity-cap";

      break;
    }

    /*
     * ------------------------------------------------------------
     * TIME BUDGET
     * ------------------------------------------------------------
     */

    if (usedMinutes + opportunity.estimatedDetourMinutes > spareMinutes) {
      rejectedForBudget = true;
      rejectedForBudgetCount++;

      /*
       * A later opportunity may be cheaper,
       * so do NOT break here.
       */
      continue;
    }

    /*
     * ------------------------------------------------------------
     * INTERMEDIATE STOP BUDGET
     * ------------------------------------------------------------
     */

    const opportunityAnchorCount = opportunity.routePoints.length;

    if (usedAnchorSlots + opportunityAnchorCount > CAPTURE_ROUTE_CONFIG.maxFinalStops) {
      rejectedForAnchorCap = true;
      rejectedForAnchorCount++;

      /*
       * A later opportunity may require fewer anchors.
       */
      continue;
    }

    /*
     * Candidate accepted.
     */
    selected.push(opportunity);

    usedMinutes += opportunity.estimatedDetourMinutes;

    usedAnchorSlots += opportunityAnchorCount;

    captureMeters += opportunity.lengthMeters;

    for (const segment of opportunity.segments) {
      if (segment.tier === "none") {
        missingMeters += segment.lengthMeters;
      } else {
        staleMeters += segment.lengthMeters;
      }
    }
  }

  if (stopReason !== "opportunity-cap") {
    if (rejectedForAnchorCap) {
      stopReason = "anchor-cap";
    } else if (rejectedForBudget) {
      stopReason = "budget";
    } else {
      stopReason = "exhausted";
    }
  }

  /**
   * ArcGIS must receive opportunities in travel order.
   */
  selected.sort((a, b) => a.baselinePosition - b.baselinePosition);

  return {
    opportunities: selected,

    estimatedExtraMinutes: usedMinutes,

    estimatedCaptureMeters: captureMeters,

    estimatedMissingMeters: missingMeters,

    estimatedStaleMeters: staleMeters,

    usedAnchorSlots,

    stopReason,
    rejectedForBudgetCount,
    rejectedForAnchorCount,
  };
}

/**
 * Flatten selected opportunities into final route stop coordinates.
 *
 * A and B are deliberately NOT included here.
 */
export function buildFinalRouteStops(opportunities: CaptureOpportunity[]): RouteCoordinate[] {
  const result: RouteCoordinate[] = [];

  for (const opportunity of opportunities) {
    for (const point of opportunity.routePoints) {
      if (!result.length) {
        result.push(point);
        continue;
      }

      const previous = result[result.length - 1];

      const d = distanceMeters(previous[1], previous[0], point[1], point[0]);

      if (d >= 8) {
        result.push(point);
      }
    }
  }

  return result.slice(0, CAPTURE_ROUTE_CONFIG.maxFinalStops);
}

interface OpportunityAnchorCandidate {
  point: RouteCoordinate;
  alongMeters: number;

  novelMeters: number;
  weightedValue: number;

  tier: "none" | "stale";
}

/**
 * Creates ArcGIS route anchors from actual baseline-NEW
 * target road segments.
 *
 * Important:
 * - anchors are actual target-segment midpoints
 * - intersection endpoints are avoided
 * - baseline-overlap-only segments are avoided when possible
 * - NONE receives its configured priority
 * - anchors are returned in A → B order
 */
function buildNoveltyAwareRoutePoints(segments: RouteTargetSegment[], baseline: RouteCoordinate[], entryPoint: RouteCoordinate, exitPoint: RouteCoordinate): RouteCoordinate[] {
  const candidates: OpportunityAnchorCandidate[] = [];

  /*
   * ------------------------------------------------------------
   * 1. BUILD NOVEL MIDDLE-ANCHOR CANDIDATES
   * ------------------------------------------------------------
   *
   * These are still useful for keeping a long opportunity
   * pinned to the desired target road.
   *
   * But they are NO LONGER used as the beginning/end of the
   * opportunity.
   */
  for (const segment of segments) {
    const novelty = estimateTargetNovelty(segment, baseline);

    if (novelty.novelMeters <= 0) {
      continue;
    }

    const projection = projectPointToPolyline(segment.midpoint, baseline);

    if (!projection) {
      continue;
    }

    const tierWeight = segment.tier === "none" ? CAPTURE_ROUTE_CONFIG.nonePriority : CAPTURE_ROUTE_CONFIG.stalePriority;

    candidates.push({
      point: segment.midpoint,

      alongMeters: projection.alongMeters,

      novelMeters: novelty.novelMeters,

      weightedValue: novelty.novelMeters * tierWeight,

      tier: segment.tier,
    });
  }

  candidates.sort((a, b) => a.alongMeters - b.alongMeters);

  /*
   * ------------------------------------------------------------
   * 2. ATOMIC OPPORTUNITY BOUNDARIES
   * ------------------------------------------------------------
   *
   * This is the key change.
   *
   * A selected opportunity now means:
   *
   *     near beginning of useful road run
   *              ↓
   *        [ useful road ]
   *              ↓
   *     near end of useful road run
   *
   * We inset the points slightly so the router is not given
   * an ambiguous stop directly on an intersection.
   */
  const entryAnchor = insetOpportunityBoundaryAnchor(entryPoint, segments);

  const exitAnchor = insetOpportunityBoundaryAnchor(exitPoint, segments);

  /*
   * Small/simple opportunities generally need only their
   * two boundary anchors.
   *
   * Long/complex opportunities may receive one middle
   * novelty anchor as additional protection against the
   * router finding a shortcut away from the target road.
   */
  const totalNovelMeters = candidates.reduce((sum, candidate) => sum + candidate.novelMeters, 0);

  const totalLengthMeters = segments.reduce((sum, segment) => sum + segment.lengthMeters, 0);

  const canCompressMiddleAnchor = segments.length <= 4 && totalNovelMeters <= 100 && totalLengthMeters <= 150;

  let bestMiddle: OpportunityAnchorCandidate | null = null;

  /*
   * ------------------------------------------------------------
   * 3. OPTIONAL MIDDLE ANCHOR
   * ------------------------------------------------------------
   */
  if (!canCompressMiddleAnchor && candidates.length >= 3 && CAPTURE_ROUTE_CONFIG.maxAnchorsPerOpportunity >= 3) {
    const first = candidates[0];

    const last = candidates[candidates.length - 1];

    const opportunitySpan = Math.max(1, last.alongMeters - first.alongMeters);

    let bestMiddleScore = -Infinity;

    for (let i = 1; i < candidates.length - 1; i++) {
      const candidate = candidates[i];

      const distanceFromFirst = candidate.alongMeters - first.alongMeters;

      const distanceFromLast = last.alongMeters - candidate.alongMeters;

      const spreadFactor = Math.min(distanceFromFirst, distanceFromLast) / opportunitySpan;

      const spreadBonus = 0.35 + spreadFactor;

      const score = candidate.weightedValue * spreadBonus;

      if (score > bestMiddleScore) {
        bestMiddleScore = score;

        bestMiddle = candidate;
      }
    }
  }

  /*
   * ------------------------------------------------------------
   * 4. BUILD FINAL OPPORTUNITY ANCHORS
   * ------------------------------------------------------------
   *
   * Always prefer:
   *
   *   ENTRY → optional MIDDLE → EXIT
   *
   * rather than:
   *
   *   arbitrary target midpoints
   */
  const desiredPoints: RouteCoordinate[] = [entryAnchor];

  if (bestMiddle) {
    desiredPoints.push(bestMiddle.point);
  }

  desiredPoints.push(exitAnchor);

  /*
   * Remove nearly duplicate anchors.
   */
  const result: RouteCoordinate[] = [];

  for (const point of desiredPoints) {
    if (!result.length) {
      result.push(point);
      continue;
    }

    const previous = result[result.length - 1];

    const d = distanceMeters(previous[1], previous[0], point[1], point[0]);

    if (d >= 8) {
      result.push(point);
    }
  }

  /*
   * Very tiny opportunities may collapse to one point after
   * de-duplication. That is fine; normal opportunities should
   * now have two or three anchors.
   */
  return result.slice(0, CAPTURE_ROUTE_CONFIG.maxAnchorsPerOpportunity);
}

function insetOpportunityBoundaryAnchor(boundaryPoint: RouteCoordinate, segments: RouteTargetSegment[]): RouteCoordinate {
  if (!segments.length) {
    return boundaryPoint;
  }

  /*
   * Find which segment endpoint produced / is closest to
   * this opportunity boundary.
   *
   * We do NOT use the exact endpoint as a route stop because
   * endpoints frequently lie directly on intersections.
   *
   * Instead, move a few metres INTO the target road.
   */
  let nearestSegment = segments[0];

  let fromPoint: RouteCoordinate = nearestSegment.seg.start;

  let towardPoint: RouteCoordinate = nearestSegment.seg.end;

  let nearestDistance = Infinity;

  for (const segment of segments) {
    const startDistance = distanceMeters(boundaryPoint[1], boundaryPoint[0], segment.seg.start[1], segment.seg.start[0]);

    if (startDistance < nearestDistance) {
      nearestDistance = startDistance;
      nearestSegment = segment;

      fromPoint = segment.seg.start;
      towardPoint = segment.seg.end;
    }

    const endDistance = distanceMeters(boundaryPoint[1], boundaryPoint[0], segment.seg.end[1], segment.seg.end[0]);

    if (endDistance < nearestDistance) {
      nearestDistance = endDistance;
      nearestSegment = segment;

      fromPoint = segment.seg.end;
      towardPoint = segment.seg.start;
    }
  }

  const segmentLength =
    nearestSegment.lengthMeters > 0
      ? nearestSegment.lengthMeters
      : distanceMeters(nearestSegment.seg.start[1], nearestSegment.seg.start[0], nearestSegment.seg.end[1], nearestSegment.seg.end[0]);

  if (!Number.isFinite(segmentLength) || segmentLength <= 0) {
    return boundaryPoint;
  }

  /*
   * Stay away from the exact intersection while remaining
   * close to the outer boundary of the useful road run.
   *
   * Long segment:
   *     max ~8 m inset
   *
   * Short segment:
   *     ~15% inward
   */
  const insetMeters = Math.min(8, segmentLength * 0.15);

  const fraction = Math.min(0.35, Math.max(0, insetMeters / segmentLength));

  return [fromPoint[0] + (towardPoint[0] - fromPoint[0]) * fraction, fromPoint[1] + (towardPoint[1] - fromPoint[1]) * fraction];
}
