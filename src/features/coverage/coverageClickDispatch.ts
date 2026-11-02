/** Competing click owners must keep their existing SDK hit-test priority. */
export interface CoverageClickPriority {
  sharedNotes: boolean;
  pointCloud: boolean;
  places: boolean;
  detectionFeatures: boolean;
}

/** A validated individual hover already identifies the image under the pointer.
 * Skip the broad SDK hit test only when no higher-priority owner needs its results.
 * Unhovered points, regional lines and competing tools retain the original path.
 */
export function coverageClickHitTest<R extends { results: unknown[] }>(hasHoveredPoint: boolean, priority: CoverageClickPriority,
  hitTest: () => Promise<R>): Promise<R | { results: [] }> {
  if (hasHoveredPoint && !Object.values(priority).some(Boolean)) return Promise.resolve({ results: [] });
  return hitTest();
}
