import { SPRITE_ASSET_PATHS } from './constants';
/** Follow Experience Builder's use-assets convention. The widget may live on a
 * different origin or under a nested path; never derive this from the page root,
 * widget ID, source-code path, a branch URL, or the Mapillary access token.
 * Importing this module does not request or decode any assets.
 */
export function widgetSpriteUrls(folderUrl: string | null | undefined, pageUrl?: string): { TRAFFIC_SIGNS: string; OBJECTS: string } {
  if (!folderUrl?.trim()) throw new Error('Widget folder URL is unavailable for bundled sprites.');
  const folder = folderUrl.trim();
  const base = new URL(folder.endsWith('/') ? folder : folder + '/', pageUrl ?? (typeof document !== 'undefined' ? document.baseURI : undefined));
  if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password || base.search || base.hash) throw new Error('Unsupported widget asset folder URL.');
  return {
    TRAFFIC_SIGNS: new URL(SPRITE_ASSET_PATHS.TRAFFIC_SIGNS, base).href,
    OBJECTS: new URL(SPRITE_ASSET_PATHS.OBJECTS, base).href,
  };
}
