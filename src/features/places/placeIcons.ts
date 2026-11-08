/** Application-owned SVGs: no external assets, fonts, scripts or category-supplied markup. */
const glyphs: Record<string, string> = {
  health: '<path d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6z"/>',
  education: '<path d="M6 9c4-1 7 0 10 2 3-2 6-3 10-2v15c-4-1-7 0-10 2-3-2-6-3-10-2z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 11v15" fill="none" stroke="currentColor" stroke-width="2"/>',
  parks: '<path d="M16 5 8 16h4l-5 7h7v5h4v-5h7l-5-7h4z"/>',
  landmarks: '<path d="m16 6 11 6H5zM6 25h20v3H6zM8 14h3v9H8zm7 0h3v9h-3zm7 0h3v9h-3z"/>',
  services: '<path d="M7 7h18l3 8H4zm0 10h3v9H7zm15 0h3v9h-3zM7 24h18v3H7zM13 18h6v6h-6z"/>',
  other: '<path d="M16 5a8 8 0 0 0-8 8c0 6 8 14 8 14s8-8 8-14a8 8 0 0 0-8-8zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" fill-rule="evenodd"/>',
};
// Shared, bounded SVG cache for list rows, chooser rows and the selected badge.
// These are UI icons; native map points still use the tile sprite atlas.
Object.assign(glyphs, {
 airport:'<path d="M14 4h4v10l10 6v3l-10-3v6l4 2v2l-6-2-6 2v-2l4-2v-6L4 23v-3l10-6z"/>',
 bar:'<path d="M5 5h22L18 16v10h6v3H8v-3h6V16zm5 3 6 7 6-7z" fill-rule="evenodd"/>',
 convenience:'<path d="M5 5h22l3 8H2zm0 11h22v13H5zm4 3v7h5v-7z" fill-rule="evenodd"/>',
 fuel:'<path d="M6 5h14v24H4v-3h2zm3 3v8h8V8zM21 8l6 5v11h-3V14l-3-3z" fill-rule="evenodd"/>',
 golf:'<path d="M10 4h3v23h-3zm4 0 13 6-13 6zM5 27h18v3H5z"/>',
 grocery:'<path d="M3 5h5l3 17h16v3H8L5 8H3zm7 4h19l-3 11H12zM10 27h4v4h-4zm12 0h4v4h-4z"/>',
 lodging:'<path d="M3 8h3v13h22v8h-3v-5H6v5H3zm5 2h7v7H8zm9 2h11v8H8v-2h9z"/>',
 parking:'<path d="M9 4h11a8 8 0 0 1 0 16h-7v10H9zm4 4v8h7a4 4 0 0 0 0-8z" fill-rule="evenodd"/>',
 rail:'<path d="M7 4h18v21H7zm3 3v8h12V7zm0 12v3h3v-3zm9 0v3h3v-3zM6 27h5v3H6zm15 0h5v3h-5z" fill-rule="evenodd"/>',
 restaurant:'<path d="M5 4h2v8h2V4h2v8h2V4h2v12h-4v14H8V16H5zm17 0h4v26h-4V18h-4V9z"/>',
 shop:'<path d="M6 11h20l2 19H4zm5-2a5 5 0 0 1 10 0v2h-3V9a2 2 0 0 0-4 0v2h-3z"/>',
 stadium:'<ellipse cx="16" cy="17" rx="12" ry="9" fill="none" stroke="currentColor" stroke-width="3"/><path d="M14 9h3v17h-3zM5 15h22v3H5z"/>',
 cafe:'<path d="M5 9h17v16H5zm18 2h6v11h-6v-3h3v-5h-3zM4 27h21v3H4zM9 3h3v4H9zm7 0h3v4h-3z"/>',
 bakery:'<path d="M8 7a6 6 0 0 1 8-2 6 6 0 0 1 8 2 5 5 0 0 1 3 9v13H5V16a5 5 0 0 1 3-9z"/>',
 bank:'<path d="m16 4 14 8H2zM5 14h4v11H5zm9 0h4v11h-4zm9 0h4v11h-4zM3 27h26v3H3z"/>',
 government:'<path d="M15 3h3v12h-3zm4 0h9v6h-9zM5 15h22v15H5zm4 4v4h3v-4zm6 0v4h3v-4zm6 0v4h3v-4z" fill-rule="evenodd"/>',
 worship:'<path d="M7 14a9 9 0 0 1 18 0zm-2 2h24v14H5zm9 5v9h4v-9z" fill-rule="evenodd"/>',
 entertainment:'<path d="M4 10h24v20H4zM4 4h5v4H4zm7 0h5v4h-5zm7 0h5v4h-5zm7 0h3v4h-3z"/>',
 beauty:'<path d="m7 4 17 22M25 4 8 26" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="8" cy="25" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="24" cy="25" r="4" fill="none" stroke="currentColor" stroke-width="2"/>',
 fitness:'<path d="M3 9h5v15H3zm6 3h4v9H9zm5 3h4v3h-4zm5-3h4v9h-4zm5-3h5v15h-5z"/>',
 automotive:'<path d="m8 6 16 0 5 12v10h-4v-4H7v4H3V18zm2 3-3 8h18l-3-8zM7 19v3h4v-3zm14 0v3h4v-3z" fill-rule="evenodd"/>',
 office:'<path d="M4 11h24v19H4zm7-7h10v5h-3V7h-4v2h-3zm3 12v7h4v-7z" fill-rule="evenodd"/>',
});
const colors: Record<string, string> = { health: '#884b50', education: '#385d70', parks: '#3e6b45', landmarks: '#756042', services: '#5b5a76', other: '#38594d' };
for (const group of Object.keys(glyphs)) if (!colors[group]) colors[group] = ['airport','parking','rail','bank','government'].includes(group) ? '#436aac' : ['golf','grocery'].includes(group) ? '#387d4d' : ['stadium','worship','entertainment','beauty'].includes(group) ? '#87579b' : ['bar','convenience','fuel','lodging','restaurant','shop','cafe','bakery'].includes(group) ? '#a46d2e' : '#5d6f73';
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
