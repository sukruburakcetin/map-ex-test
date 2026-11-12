/** Shared Places API model; release-specific flattening belongs to the exporter. */
export type PlaceBbox = [number, number, number, number];
export interface Place { id: string; name: string; category: string; group: string; confidence: number | null; operatingStatus?: string | null; lon: number; lat: number; address: string; website: string; release: string; }
export const PLACES_LIMITS = { minZoom: 15, maxFeatures: 200, debounceMs: 650, timeoutMs: 12000, cacheBytes: 512 * 1024, cacheEntries: 6, cacheTtlMs: 120000 } as const;
export function placesWebsite(value: unknown): string {
  if (typeof value !== 'string' || value.length > 500) return '';
  try { const url = new URL(String(value || '')); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : ''; } catch { return ''; }
}
export function placesBytes(places: readonly Place[]): number {
  return places.reduce((bytes, p) => bytes + 192 + 2 * (p.id.length + p.name.length + p.category.length + p.group.length + p.address.length + p.website.length + p.release.length), 0);
}
