import { Presentation, englishPresentation } from '../../i18n/PresentationText';
import type { Place } from './placesModel';
export const PLACE_LIST_PAGE_SIZE = 4;
/** The adapter already caps records at 200; never search outside those loaded records. */
export function filterLoadedPlaces(places: readonly Place[], query: string): Place[] {
  const term = query.trim().toLocaleLowerCase();
  return places.slice(0, 200).filter(place => !term || `${place.name} ${place.category.replace(/_/g, ' ')}`.toLocaleLowerCase().includes(term))
    .sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
}
export function placeCameraDistanceLabel(metres: number, l10n: Presentation = englishPresentation): string | null {
  if (!Number.isFinite(metres) || metres < 0) return null;
  if (metres < 1) return l10n.text("Under 1 m from camera");
  return metres < 1000 ? l10n.text("{value0} m from camera",{value0:String(Math.round(metres))}) : l10n.text("{value0} km from camera",{value0:String((metres / 1000).toFixed(1))});
}
