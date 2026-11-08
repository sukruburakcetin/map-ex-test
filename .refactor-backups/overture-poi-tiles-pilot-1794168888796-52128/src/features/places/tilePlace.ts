import { Place, PlaceBbox, PLACES_LIMITS, placesWebsite } from './placesModel';
/** Normalize one externally selected place, never a bulk graphics collection. */
export function tilePlace(attributes: any, point: any): Place | null {
  if (!attributes || !point) return null;
  const lon = Number(point.longitude ?? point.x), lat = Number(point.latitude ?? point.y);
  const id = typeof attributes.gers_id === 'string' ? attributes.gers_id.trim() : '';
  if (!id || !Number.isFinite(lon) || !Number.isFinite(lat) || Math.abs(lon) > 180 || Math.abs(lat) > 85.051129) return null;
  const text = (value: unknown, length: number) => typeof value === 'string' ? value.trim().slice(0, length) : '';
  const groups = ['health', 'education', 'parks', 'landmarks', 'services'];
  return { id: id.slice(0, 160), name: text(attributes.place_name, 120) || id,
    category: text(attributes.category, 80), group: groups.includes(attributes.place_group) ? attributes.place_group : 'other',
    confidence: typeof attributes.confidence === 'number' && Number.isFinite(attributes.confidence) ? attributes.confidence : null,
    operatingStatus: typeof attributes.operating_status === 'string' ? attributes.operating_status : null,
    address: text(attributes.address, 180), website: placesWebsite(attributes.website), release: text(attributes.data_release, 40), lon, lat };
}

/** Bounded list normalization retains colocated IDs and unknown/low confidence. */
export function normalizeTilePlaces(rows: any[], bbox: PlaceBbox): Place[] {
  const places: Place[] = [], seen = new Set<string>();
  for (const row of rows.slice(0, PLACES_LIMITS.maxFeatures)) {
    const place = tilePlace(row.attributes, row.geometry);
    if (!place || seen.has(place.id) || place.lon < bbox[0] || place.lon > bbox[2] || place.lat < bbox[1] || place.lat > bbox[3]) continue;
    seen.add(place.id); places.push(place);
  }
  return places;
}
