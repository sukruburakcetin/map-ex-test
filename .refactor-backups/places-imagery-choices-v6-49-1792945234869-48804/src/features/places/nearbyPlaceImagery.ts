import { calculateBearing } from '../../utils/geoUtils';
import { Place } from './placesModel';
export const PLACE_IMAGERY_RADII = [75, 250] as const;
export interface PlaceImagery { id: string; sequence: string; lon: number; lat: number; distance: number; radius: number; direction?: 'facing' | 'panorama' | 'unknown' | 'sideways' | 'away'; angle?: number; placeLon?: number; placeLat?: number; }
const coordinates = (geometry: any): [number, number] | null => {
  const p = geometry?.coordinates;
  return Array.isArray(p) && p.length >= 2 && typeof p[0] === 'number' && typeof p[1] === 'number' && Number.isFinite(p[0]) && Number.isFinite(p[1]) && Math.abs(p[0]) <= 180 && Math.abs(p[1]) <= 90 ? [p[0], p[1]] : null;
};
export function placeImageryBbox(place: Pick<Place, 'lon' | 'lat'>, radius: number): number[] {
  if (!PLACE_IMAGERY_RADII.includes(radius as 75 | 250) || !Number.isFinite(place.lon) || !Number.isFinite(place.lat) || Math.abs(place.lon) > 180 || Math.abs(place.lat) > 85) throw new Error('Invalid nearby imagery search');
  const dy = radius / 111320, dx = dy / Math.max(.08, Math.cos(place.lat * Math.PI / 180));
  return [Math.max(-180, place.lon - dx), Math.max(-90, place.lat - dy), Math.min(180, place.lon + dx), Math.min(90, place.lat + dy)];
}
/** Rank only this bounded page, not all Mapillary imagery. Reject either reported position outside the radius. */
export function choosePlaceImagery(place: Pick<Place, 'lon' | 'lat'>, rows: any[], radius: number, distance: (a: number, b: number, c: number, d: number) => number): PlaceImagery | null {
  placeImageryBbox(place, radius);
  let best: PlaceImagery | null = null;
  let bestRank = Infinity;
  for (const row of rows.slice(0, 40)) {
    const p = coordinates(row.geometry);
    if (!p || !row.id || !row.sequence) continue;
    const originalDistance = distance(place.lat, place.lon, p[1], p[0]);
    const computed = row.computed_geometry == null ? p : coordinates(row.computed_geometry);
    if (!computed) continue;
    const computedDistance = distance(place.lat, place.lon, computed[1], computed[0]);
    const conservativeDistance = Math.max(originalDistance, computedDistance);
    if (!Number.isFinite(conservativeDistance) || conservativeDistance > radius) continue;
    // Use a heading with its matching coordinate source; zero degrees is valid.
    const number = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 360;
    const computedHeading = row.computed_geometry != null && number(row.computed_compass_angle);
    const heading = computedHeading ? row.computed_compass_angle : number(row.compass_angle) ? row.compass_angle : null;
    const origin = computedHeading ? computed : p;
    const originDistance = distance(place.lat, place.lon, origin[1], origin[0]);
    const bearing = calculateBearing(origin[1], origin[0], place.lat, place.lon);
    const angle = heading != null && originDistance >= 3 ? Math.abs(((bearing - heading + 540) % 360) - 180) : undefined;
    const direction: NonNullable<PlaceImagery['direction']> = row.is_pano === true ? 'panorama' : angle == null ? 'unknown' : angle <= 35 ? 'facing' : angle <= 90 ? 'sideways' : 'away';
    // Comparable facing angles share a 15-degree band, then nearer imagery wins.
    const rank = direction === 'facing' ? Math.floor(angle! / 15) : direction === 'panorama' ? 3 : direction === 'unknown' ? 4 : direction === 'sideways' ? 5 : 6;
    const candidate: PlaceImagery = { id: String(row.id), sequence: String(row.sequence), lon: p[0], lat: p[1], distance: conservativeDistance, radius, direction, angle, placeLon: place.lon, placeLat: place.lat };
    if (!best || rank < bestRank || (rank === bestRank && candidate.distance < best.distance)) { best = candidate; bestRank = rank; }
  }
  return best;
}

export function placeImageryDirectionLabel(image: PlaceImagery): string {
  return image.direction === 'facing' ? 'Facing toward this place' : image.direction === 'panorama' ? '360° panorama · can look toward this place' : image.direction === 'sideways' ? 'Camera points to the side of this place' : image.direction === 'away' ? 'Camera faces away from this place' : 'Direction unknown';
}
/** One local viewer read; never rotate a flat image or a newer user selection. */
export async function facePlaceInPanorama(viewer: any, image: PlaceImagery, current: () => boolean): Promise<number | null> {
  if (image.direction !== 'panorama' || !Number.isFinite(image.placeLon) || !Number.isFinite(image.placeLat) || !current()) return null;
  const opened = await viewer.getImage();
  if (!current() || String(opened?.id) !== image.id || opened?.isPano !== true || typeof opened.compassAngle !== 'number' || !Number.isFinite(opened.compassAngle)) return null;
  const origin = opened.originalLngLat ?? opened.lngLat;
  if (!origin || !Number.isFinite(origin.lng) || !Number.isFinite(origin.lat)) return null;
  const bearing = calculateBearing(origin.lat, origin.lng, image.placeLat!, image.placeLon!);
  const x = ((.5 + (bearing - opened.compassAngle) / 360) % 1 + 1) % 1;
  if (!current()) return null;
  await viewer.setCenter([x, .5]);
  return current() ? bearing : null;
}
