import type { RoutingCoordinate } from '../../utils/routingTypes';

/** Validate all paths before changing SDK resources; retain references for valid input. */
export function normalizeCaptureRoutePaths(input: unknown): RoutingCoordinate[][] | null {
  const coordinates = Array.isArray(input) ? input : (input as { coordinates?: unknown } | null)?.coordinates;
  if (!Array.isArray(coordinates) || !coordinates.length || !Array.isArray(coordinates[0])) return null;
  const paths: unknown[] = Array.isArray(coordinates[0][0]) ? coordinates : [coordinates];
  for (const path of paths) {
    if (!Array.isArray(path) || path.length < 2) return null;
    for (const point of path) {
      if (!Array.isArray(point) || point.length < 2) return null;
      for (const ordinate of point) if (typeof ordinate !== 'number' || !Number.isFinite(ordinate)) return null;
    }
  }
  return paths as RoutingCoordinate[][];
}
