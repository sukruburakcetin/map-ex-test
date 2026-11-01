import type { Place } from './placesModel';
export const PLACE_LIST_PAGE_SIZE = 4;
/** The adapter already caps records at 200; never search outside those loaded records. */
export function filterLoadedPlaces(places: readonly Place[], query: string): Place[] {
  const term = query.trim().toLocaleLowerCase();
  return places.slice(0, 200).filter(place => !term || `${place.name} ${place.category.replace(/_/g, ' ')}`.toLocaleLowerCase().includes(term))
    .sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
}
export function placeCameraDistanceLabel(metres: number): string | null {
  if (!Number.isFinite(metres) || metres < 0) return null;
  if (metres < 1) return 'Under 1 m from camera';
  return metres < 1000 ? `${Math.round(metres)} m from camera` : `${(metres / 1000).toFixed(1)} km from camera`;
}
