/** Stable pilot service contract, independent of Overture release-specific nested fields. */
export const PLACE_GROUPS = ['all', 'health', 'education', 'parks', 'landmarks', 'services'] as const;
export type PlaceGroup = typeof PLACE_GROUPS[number];
export type PlaceBbox = [number, number, number, number];
export interface Place { id: string; name: string; category: string; group: string; confidence: number; lon: number; lat: number; address: string; website: string; release: string; }
export const PLACES_LIMITS = { minZoom: 15, maxFeatures: 200, debounceMs: 650, timeoutMs: 12000, cacheBytes: 512 * 1024, cacheEntries: 6, cacheTtlMs: 120000 } as const;
export function placesServiceUrl(value: string | undefined): string | null {
  try {
    const url = new URL((value || '').trim());
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || !/\/FeatureServer\/\d+\/?$/i.test(url.pathname)) return null;
    return url.href.replace(/\/$/, '');
  } catch { return null; }
}
export function placesWebsite(value: unknown): string {
  if (typeof value !== 'string' || value.length > 500) return '';
  try { const url = new URL(String(value || '')); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : ''; } catch { return ''; }
}
export function normalizePlaces(rows: any[], bbox: PlaceBbox, group: PlaceGroup, minConfidence = .95, limit = PLACES_LIMITS.maxFeatures): Place[] {
  const seen = new Set<string>(), locations = new Set<string>(), result: Place[] = [];
  const text = (value: unknown, max: number) => typeof value === 'string' ? value.slice(0, max).trim() : '';
  for (const row of rows) {
    if (result.length >= limit) break;
    const a = row.attributes || row, g = row.geometry;
    const lon = Number(g?.longitude ?? g?.x ?? a.longitude), lat = Number(g?.latitude ?? g?.y ?? a.latitude);
    const id = text(a.gers_id, 160), name = text(a.place_name, 120), confidence = Number(a.confidence), category = text(a.category, 80), placeGroup = text(a.place_group, 30);
    if (!id || !name || !Number.isFinite(lon) || !Number.isFinite(lat) || lon < bbox[0] || lon > bbox[2] || lat < bbox[1] || lat > bbox[3] || Math.abs(lon) > 180 || Math.abs(lat) > 85.051129 || !Number.isFinite(confidence) || confidence < minConfidence || confidence > 1 || !PLACE_GROUPS.includes(placeGroup as PlaceGroup) || placeGroup === 'all' || (group !== 'all' && placeGroup !== group)) continue;
    const location = `${name.toLocaleLowerCase()}|${category}|${lon.toFixed(6)}|${lat.toFixed(6)}`;
    if (seen.has(id) || locations.has(location)) continue;
    seen.add(id); locations.add(location);
    result.push({ id, name, category, group: placeGroup, confidence, lon, lat, address: text(a.address, 180), website: placesWebsite(a.website), release: text(a.data_release, 40) });
  }
  return result;
}
export function placesBytes(places: readonly Place[]): number {
  return places.reduce((bytes, p) => bytes + 192 + 2 * (p.id.length + p.name.length + p.category.length + p.group.length + p.address.length + p.website.length + p.release.length), 0);
}
