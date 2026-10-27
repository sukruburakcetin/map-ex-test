/** Application-owned SVGs: no external assets, fonts, scripts or category-supplied markup. */
const glyphs: Record<string, string> = {
  health: '<path d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6z"/>',
  education: '<path d="M6 9c4-1 7 0 10 2 3-2 6-3 10-2v15c-4-1-7 0-10 2-3-2-6-3-10-2z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 11v15" fill="none" stroke="currentColor" stroke-width="2"/>',
  parks: '<path d="M16 5 8 16h4l-5 7h7v5h4v-5h7l-5-7h4z"/>',
  landmarks: '<path d="m16 6 11 6H5zM6 25h20v3H6zM8 14h3v9H8zm7 0h3v9h-3zm7 0h3v9h-3z"/>',
  services: '<path d="M7 7h18l3 8H4zm0 10h3v9H7zm15 0h3v9h-3zM7 24h18v3H7zM13 18h6v6h-6z"/>',
  other: '<path d="M16 5a8 8 0 0 0-8 8c0 6 8 14 8 14s8-8 8-14a8 8 0 0 0-8-8zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" fill-rule="evenodd"/>',
};
const colors: Record<string, string> = { health: '#884b50', education: '#385d70', parks: '#3e6b45', landmarks: '#756042', services: '#5b5a76', other: '#38594d' };
const cache = new Map<string, string>();
export const PLACE_ICON_RADIUS = 9;
export const SELECTED_PLACE_ICON_RADIUS = 14;
export function placeCategoryIcon(group: string | undefined, selected = false): string {
  const category = group && Object.prototype.hasOwnProperty.call(glyphs, group) ? group : 'other';
  const key = `${category}:${selected}`;
  let url = cache.get(key);
  if (!url) {
    const backdrop = selected ? '<circle cx="16" cy="16" r="15" fill="#142b22" stroke="#fff4cb" stroke-width="2"/><circle cx="16" cy="16" r="11.5" fill="#ffda74"/>' : `<circle cx="16" cy="16" r="14" fill="${colors[category]}" stroke="#fff3d1" stroke-width="1.8"/>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${backdrop}<g fill="${selected ? '#142b22' : '#fff4dc'}" color="${selected ? '#142b22' : '#fff4dc'}" transform="translate(4 4) scale(.75)">${glyphs[category]}</g></svg>`;
    url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); cache.set(key, url);
  }
  return url;
}
/** ArcGIS numeric dimensions are points: 12pt = 16 CSS px, 21pt = 28 CSS px. */
export function placeCategorySymbol(group: string | undefined, selected = false): any {
  return { type: 'picture-marker', url: placeCategoryIcon(group, selected), width: selected ? 21 : 12, height: selected ? 21 : 12 };
}
