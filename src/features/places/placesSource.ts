import { placesApiUrl } from './placesApi';
export type PlacesSourceKind = 'portal' | 'external';
export interface PlacesSourceConfig { placesSource?: PlacesSourceKind; placesApiUrl?: string; placesPortalTilesUrl?: string; placesPortalQueryUrl?: string }
/** Infer existing external-service apps without changing their saved configuration. */
export function placesSourceKind(config: PlacesSourceConfig): PlacesSourceKind {
  return config.placesSource === 'portal' || config.placesSource === 'external' ? config.placesSource : placesApiUrl(config.placesApiUrl) ? 'external' : 'portal';
}
export function portalPlacesUrl(value: unknown, kind: 'tiles' | 'query'): string | null {
  if (typeof value !== 'string') return null;
  try {
    const u = new URL(value.trim());
    if (u.protocol !== 'https:' || u.username || u.password || u.search || u.hash) return null;
    const path = u.pathname.replace(/\/+$/, '');
    if (!(kind === 'tiles' ? /\/VectorTileServer$/i : /\/FeatureServer\/\d+$/i).test(path)) return null;
    return u.origin + path;
  } catch { return null; }
}
export function placesSourceKey(config: PlacesSourceConfig): string | null {
  if (placesSourceKind(config) === 'external') return placesApiUrl(config.placesApiUrl);
  const tiles = portalPlacesUrl(config.placesPortalTilesUrl, 'tiles'), query = portalPlacesUrl(config.placesPortalQueryUrl, 'query');
  return tiles && query ? JSON.stringify(['portal', tiles, query]) : null;
}
