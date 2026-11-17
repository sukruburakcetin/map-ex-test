import { distanceMeters } from '../../utils/geoUtils';
import type { RoutingCoordinate } from '../../utils/routingTypes';

/** Endpoints are indexed by anchor ownership, as in the original preflight loop. */
function ownerForStop(stopIndex: number, owners: readonly string[]): string {
  if (stopIndex === 0) return 'START';
  if (stopIndex === owners.length + 1) return 'END';
  return owners[stopIndex - 1] ?? 'UNKNOWN';
}

/** Preserve rounding before filtering/ranking; callers own rejection thresholds and logs. */
export function buildPreflightSnapDiagnostics(
  distances: readonly number[] | null | undefined, stopCount: number, owners: readonly string[],
) {
  return (distances ?? []).map((snapDistanceMeters, index) => ({
    stopIndex: index,
    owner: ownerForStop(index, owners),
    snapDistanceMeters: Number(snapDistanceMeters.toFixed(1)),
  })).filter(item => item.stopIndex > 0 && item.stopIndex < stopCount - 1)
    .sort((a, b) => b.snapDistanceMeters - a.snapDistanceMeters);
}

/** Display values also feed existing quality decisions; do not change their precision. */
export function buildPreflightLegDiagnostics(
  durations: readonly number[], stops: readonly RoutingCoordinate[], owners: readonly string[],
) {
  const preflightLegs = durations.map((durationMinutes, index) => {
    const fromPoint = stops[index], toPoint = stops[index + 1];
    const directMeters = fromPoint && toPoint
      ? distanceMeters(fromPoint[1], fromPoint[0], toPoint[1], toPoint[0]) : 0;
    return {
      fromStop: index, fromOwner: ownerForStop(index, owners),
      toStop: index + 1, toOwner: ownerForStop(index + 1, owners),
      directMeters: Math.round(directMeters),
      durationMinutes: Number(durationMinutes.toFixed(2)),
    };
  });
  const worstPreflightLegs = [...preflightLegs]
    .sort((a, b) => b.durationMinutes - a.durationMinutes).slice(0, 10);
  return { preflightLegs, worstPreflightLegs };
}
