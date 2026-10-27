import type { Place } from './placesModel';
export const PLACE_OVERLAP_DISTANCE = 24;
export interface PlaceGroupMarker { id: string; anchor: Place; members: readonly Place[]; }
/** Fixed-anchor screen buckets avoid long transitive chains. At most 200 loaded records. */
export function groupOverlappingPlaces(places: readonly Place[], screen: (place: Place) => { x: number; y: number } | null): PlaceGroupMarker[] {
  const groups: { id: string; anchor: Place; members: Place[]; x: number; y: number }[] = [];
  const cells = new Map<string, number[]>(), radius = PLACE_OVERLAP_DISTANCE;
  for (const place of places.slice(0, 200).sort((a, b) => a.id.localeCompare(b.id))) {
    const p = screen(place); if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) continue;
    const x = Math.floor(p.x / radius), y = Math.floor(p.y / radius);
    let nearest = -1, best = radius * radius;
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (const index of cells.get(`${x + dx}:${y + dy}`) || []) {
      const group = groups[index], distance = (group.x - p.x) ** 2 + (group.y - p.y) ** 2;
      if (distance < best || (distance === best && (nearest < 0 || index < nearest))) { nearest = index; best = distance; }
    }
    if (nearest >= 0) groups[nearest].members.push(place);
    else { const key = `${x}:${y}`, indices = cells.get(key) || []; indices.push(groups.length); cells.set(key, indices); groups.push({ id: `@places-group:${place.id}`, anchor: place, members: [place], x: p.x, y: p.y }); }
  }
  return groups.map(({ id, anchor, members }) => ({ id, anchor, members }));
}
export function placeCountSymbol(count: number): any {
  if (!Number.isInteger(count) || count < 2 || count > 200) throw new Error('Invalid Places count');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#315b68" stroke="#fff4dc" stroke-width="2"/><text x="16" y="16" dy=".35em" text-anchor="middle" font-family="Arial,sans-serif" font-size="${count >= 100 ? 11 : 14}" font-weight="bold" fill="#fff">${count}</text></svg>`;
  return { type: 'picture-marker', url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg), width: 18, height: 18 };
}
