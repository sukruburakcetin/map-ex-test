/** Align picking with ArcGIS's native Mapillary image-circle presentation.
 * Three 2D measurements, including a rotated view, place the native center at
 * raw MVT coordinates + (0.25, 0.25). This compatibility adjustment assumes the
 * verified Mapillary image-layer extent of 4096. Recheck it if the source or SDK
 * renderer changes. Raw tile, index, API and hybrid-graphics data stay untouched.
 */
const EARTH_RADIUS = 6378137;
const MAX_LATITUDE = 85.05112878;
const MVT_EXTENT = 4096;
const OFFSET_TILE_UNITS = 0.25;

/** Return the east/south offset in Web Mercator metres, using source tile zoom.
 * Apply +offset to map X and -offset to map Y before projecting a native point.
 * A world-coordinate shift follows view rotation, resolution and perspective.
 */
export function nativeCoverageOffsetMeters(sourceZoom: number): number {
  if (!Number.isInteger(sourceZoom) || sourceZoom < 0 || sourceZoom > 24) {
    throw new RangeError('Native coverage source zoom must be an integer from 0 to 24.');
  }
  return 2 * Math.PI * EARTH_RADIUS / (2 ** sourceZoom * MVT_EXTENT) * OFFSET_TILE_UNITS;
}

/** Invert native presentation for the raw index search; otherwise a tight hover
 * window can exclude the source point beneath the visible circle at high zoom.
 * Keep input geometry and terrain Z intact. The caller splits wrapped longitude
 * with turboFootprintBboxes before enumerating the pointer-local source tiles.
 */
export function nativeCoverageSourceFootprint(
  points: readonly { longitude: number; latitude: number }[], sourceZoom: number,
): { lon: number; lat: number }[] {
  const shift = nativeCoverageOffsetMeters(sourceZoom) / EARTH_RADIUS;
  const result: { lon: number; lat: number }[] = [];
  for (const point of points) {
    if (!Number.isFinite(point.longitude) || !Number.isFinite(point.latitude) || Math.abs(point.latitude) > MAX_LATITUDE) continue;
    const latitude = Math.atan(Math.sinh(Math.asinh(Math.tan(point.latitude * Math.PI / 180)) + shift)) * 180 / Math.PI;
    result.push({ lon: point.longitude - shift * 180 / Math.PI,
      lat: Math.max(-MAX_LATITUDE, Math.min(MAX_LATITUDE, latitude)) });
  }
  return result;
}
