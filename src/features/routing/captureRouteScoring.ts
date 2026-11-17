import { CAPTURE_ROUTE_CONFIG } from '../../utils/constants';
import { distanceMeters, type RoadSegment, type RouteCoverageTarget } from '../../utils/geoUtils';
import type { CaptureOpportunity, RouteCoordinate, RouteSelectionResult, RouteTargetSegment } from '../../utils/routeOptimizer';

export interface CaptureScoringConfig {
  readonly minimumUsefulSegmentLengthMeters: number;
  readonly nonePriority: number;
  readonly stalePriority: number;
  readonly lengthWeight: number;
  readonly centerDistanceWeight: number;
}
const drivableTypes = new Set(['motorway','motorway_link','trunk','trunk_link','primary','primary_link',
  'secondary','secondary_link','tertiary','tertiary_link','unclassified','residential','living_street','service']);

/** Local scoring only; retain original segment identities and analysis indices. */
export function scoreCaptureTargets(
  segments: readonly RoadSegment[], tiers: readonly unknown[],
  center: { longitude?: number; latitude?: number } | null | undefined,
  bbox: readonly [number,number,number,number] | null | undefined,
  config: CaptureScoringConfig = CAPTURE_ROUTE_CONFIG,
): RouteTargetSegment[] {
  const centerLon = center?.longitude ?? (bbox ? (bbox[0]+bbox[2])/2 : NaN);
  const centerLat = center?.latitude ?? (bbox ? (bbox[1]+bbox[3])/2 : NaN);
  if (!Number.isFinite(centerLon) || !Number.isFinite(centerLat)) return [];
  const targets: RouteTargetSegment[] = [];
  segments.forEach((seg,index)=>{
    const tier = tiers[index];
    if (tier !== 'none' && tier !== 'stale') return;
    if (!drivableTypes.has(seg.highwayType)) return;
    const midpoint: RouteCoordinate = [(seg.start[0]+seg.end[0])/2,(seg.start[1]+seg.end[1])/2];
    const lengthMeters = distanceMeters(seg.start[1],seg.start[0],seg.end[1],seg.end[0]);
    if (lengthMeters < config.minimumUsefulSegmentLengthMeters) return;
    const distanceFromCenterMeters = distanceMeters(midpoint[1],midpoint[0],centerLat,centerLon);
    const lengthScore = Math.log10(Math.max(10,lengthMeters));
    const freshnessScore = tier === 'none' ? config.nonePriority : config.stalePriority;
    const centerScore = 1/(1+distanceFromCenterMeters/5000);
    const priority = lengthScore*config.lengthWeight*freshnessScore*(1+config.centerDistanceWeight*centerScore);
    targets.push({seg,index,tier,midpoint,lengthMeters,distanceFromCenterMeters,priority,clusterId:-1});
  });
  return targets;
}

export function shouldExpandCaptureCorridor(
  last: boolean, stopReason: RouteSelectionResult['stopReason'], estimatedMinutes: number,
  spareMinutes: number, budgetUseRatio: number,
): boolean {
  const estimatedBudgetUseRatio = spareMinutes > 0 ? estimatedMinutes/spareMinutes : 1;
  return !last && stopReason === 'exhausted' && estimatedBudgetUseRatio < budgetUseRatio;
}

/** Mirrors the existing final-stop ordering, 8m separation and cap. */
export function captureStopOwners(opportunities: readonly CaptureOpportunity[], maxFinalStops: number): string[] {
  const acceptedStops: RouteCoordinate[] = [], owners: string[] = [];
  for (const opportunity of opportunities) for (const point of opportunity.routePoints) {
    if (!acceptedStops.length) { acceptedStops.push(point); owners.push(opportunity.id); continue; }
    const previous = acceptedStops[acceptedStops.length-1];
    if (distanceMeters(previous[1],previous[0],point[1],point[0]) >= 8) {
      acceptedStops.push(point); owners.push(opportunity.id);
    }
  }
  return owners.slice(0,maxFinalStops);
}

export function captureAnchorDistribution(opportunities: readonly CaptureOpportunity[]) {
  return opportunities.reduce((acc,opportunity)=>{
    const count=opportunity.routePoints.length;
    if(count===1)acc.one++;else if(count===2)acc.two++;else acc.three++;
    return acc;
  },{one:0,two:0,three:0});
}

export function captureThreeAnchorDiagnostics(opportunities: readonly CaptureOpportunity[]) {
  return opportunities.filter(opportunity=>opportunity.routePoints.length===3).map(opportunity=>({
    id:opportunity.id,segments:opportunity.segments.length,novelMeters:Math.round(opportunity.novelMeters),
    totalLengthMeters:Math.round(opportunity.lengthMeters),estimatedMinutes:Number(opportunity.estimatedDetourMinutes.toFixed(2)),tier:opportunity.tier,
  })).sort((a,b)=>a.novelMeters-b.novelMeters);
}

export function activeCaptureCoverageTargets(opportunities: readonly CaptureOpportunity[]): RouteCoverageTarget[] {
  const targets = new Map<number,RouteTargetSegment>();
  for (const opportunity of opportunities) for (const segment of opportunity.segments) targets.set(segment.index,segment);
  return Array.from(targets.values()).map(segment=>({index:segment.index,tier:segment.tier,
    start:segment.seg.start,end:segment.seg.end,lengthMeters:segment.lengthMeters}));
}

export function summarizeCaptureOpportunities(opportunities: readonly CaptureOpportunity[]) {
  const missingMeters=opportunities.reduce((sum,opportunity)=>sum+opportunity.segments.filter(segment=>segment.tier==='none').reduce((segmentSum,segment)=>segmentSum+segment.lengthMeters,0),0);
  const staleMeters=opportunities.reduce((sum,opportunity)=>sum+opportunity.segments.filter(segment=>segment.tier==='stale').reduce((segmentSum,segment)=>segmentSum+segment.lengthMeters,0),0);
  return {missingMeters,staleMeters,targetedCaptureMeters:missingMeters+staleMeters,
    finalSelectedNovelMeters:opportunities.reduce((sum,opportunity)=>sum+opportunity.novelMeters,0),
    finalSelectedBaselineOverlapMeters:opportunities.reduce((sum,opportunity)=>sum+opportunity.baselineOverlapMeters,0),
    finalSelectedAnchorCount:opportunities.reduce((sum,opportunity)=>sum+opportunity.routePoints.length,0)};
}
