/** Direction indicator display radius in ground metres, not a camera footprint.
 * Preserve the requested close-view radius from zoom 17 onward. Below that,
 * double per zoom level, capped at eight times the request and 120 metres.
 * Below zoom 12 show only the current-image pulse to avoid overview clutter.
 */
export function coneDisplayRadius(radiusMeters: number, zoom: number): number {
  if (!Number.isFinite(zoom)) return radiusMeters;
  if (zoom < 12) return 0;
  if (zoom >= 17) return radiusMeters;
  return Math.max(radiusMeters, Math.min(radiusMeters * 2 ** (17 - zoom), radiusMeters * 8, 120));
}
