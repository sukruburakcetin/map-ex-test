import { Place } from './placesModel';
export const PLACE_IMAGERY_RADII = [75, 250] as const;
export interface PlaceImagery { id: string; sequence: string; lon: number; lat: number; distance: number; radius: number; }
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
  for (const row of rows.slice(0, 40)) {
    const p = coordinates(row.geometry);
    if (!p || !row.id || !row.sequence) continue;
    const originalDistance = distance(place.lat, place.lon, p[1], p[0]);
    const computed = row.computed_geometry == null ? p : coordinates(row.computed_geometry);
    if (!computed) continue;
    const computedDistance = distance(place.lat, place.lon, computed[1], computed[0]);
    const conservativeDistance = Math.max(originalDistance, computedDistance);
    if (!Number.isFinite(conservativeDistance) || conservativeDistance > radius) continue;
    const candidate = { id: String(row.id), sequence: String(row.sequence), lon: p[0], lat: p[1], distance: conservativeDistance, radius };
    if (!best || candidate.distance < best.distance) best = candidate;
  }
  return best;
}
