import { PLACE_GROUPS, PlaceGroup, placesServiceUrl } from './placesModel';
type Store = Pick<Storage, 'getItem' | 'setItem'>;
const allowed = (value: unknown): value is PlaceGroup => typeof value === 'string' && PLACE_GROUPS.includes(value as PlaceGroup);
/** localStorage already scopes origin; isolate app path, widget and credential-free service. */
export function placePreferenceKey(widgetId: unknown, appPath: string, serviceUrl: string | undefined): string | null {
  const url = placesServiceUrl(serviceUrl);
  if (!url || widgetId == null || !appPath) return null;
  return 'mly:places:category:v1:' + JSON.stringify([appPath, String(widgetId), url]);
}
export function readPlaceCategory(storage: () => Store, key: string | null, fallback: PlaceGroup = 'all'): PlaceGroup {
  const safe = allowed(fallback) ? fallback : 'all';
  if (!key) return safe;
  try { const value = storage().getItem(key); return allowed(value) ? value : safe; } catch { return safe; }
}
export function savePlaceCategory(storage: () => Store, key: string | null, category: PlaceGroup): void {
  if (!key || !allowed(category)) return;
  try { storage().setItem(key, category); } catch { /* In-memory selection still works when browser storage is blocked. */ }
}
