import type { MessageKey } from '../../i18n/messages';
/** Stable filter IDs match the server sprite families; labels are lazy-loaded catalogs. */
export const TILE_CATEGORIES = [
  ['airport','uiPoiAirport'],['bar','uiPoiBar'],['education','uiPoiEducation'],['convenience','uiPoiConvenience'],
  ['fuel','uiPoiFuel'],['golf','uiPoiGolf'],['grocery','uiPoiGrocery'],['health','uiPoiHealth'],
  ['lodging','uiPoiLodging'],['parks','uiPoiParks'],['parking','uiPoiParking'],['rail','uiPoiRail'],
  ['restaurant','uiPoiRestaurant'],['shop','uiPoiShop'],['stadium','uiPoiStadium'],['cafe','uiPoiCafe'],
  ['bakery','uiPoiBakery'],['bank','uiPoiBank'],['government','uiPoiGovernment'],['worship','uiPoiWorship'],
  ['entertainment','uiPoiEntertainment'],['beauty','uiPoiBeauty'],['fitness','uiPoiFitness'],['automotive','uiPoiAutomotive'],
  ['office','uiPoiOffice'],['landmarks','uiPoiLandmarks'],['services','uiPoiServices'],['other','uiPoiOther'],
] as const satisfies readonly (readonly [string, MessageKey])[];
export type TileCategoryId = 'all' | typeof TILE_CATEGORIES[number][0];
export function isTileCategory(value: string): value is TileCategoryId { return value === 'all' || TILE_CATEGORIES.some(([id]) => id === value); }
