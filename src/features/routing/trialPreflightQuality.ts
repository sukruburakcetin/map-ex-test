import { distanceMeters } from '../../utils/geoUtils';
import type { RoutingCoordinate } from '../../utils/routingTypes';

/** Trial probes use raw values, unlike the rounded main-preflight diagnostics. */
export function hasBrokenTrialOpportunity(
  durations: readonly number[], stops: readonly RoutingCoordinate[], owners: readonly string[],
): boolean {
  const ownerForStop = (index: number): string => {
    if (index === 0) return 'START';
    if (index === owners.length + 1) return 'END';
    return owners[index - 1] ?? 'UNKNOWN';
  };
  return durations.some((durationMinutes, index) => {
    const fromOwner = ownerForStop(index), toOwner = ownerForStop(index + 1);
    if (fromOwner === 'START' || fromOwner === 'END' || fromOwner === 'UNKNOWN' || fromOwner !== toOwner) {
      return false;
    }
    const fromPoint = stops[index], toPoint = stops[index + 1];
    if (!fromPoint || !toPoint) return false;
    const directMeters = distanceMeters(fromPoint[1], fromPoint[0], toPoint[1], toPoint[0]);
    return directMeters <= 450 && durationMinutes >= 4.5;
  });
}
