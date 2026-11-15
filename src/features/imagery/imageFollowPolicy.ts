/** Minimal SDK boundary for checking the rendered viewport rather than its rotated extent. */
export interface ImageFollowView {
 type: string; width: number; height: number; stationary?: boolean;
 toMap?(pixel: { x: number; y: number }): any;
 toScreen(point: any): { x: number; y: number } | null | undefined;
 groundView?: { elevationSampler?: { queryElevation(point: any): any; noDataValue?: number | null } | null } | null;
}

/** Default follow moves as the image enters an inset edge band; lock preserves continuous follow.
 * Scene projection needs ground height because toScreen does not apply graphic-layer draping.
 * Use only the synchronous rendered-terrain sampler, never a service request. While terrain or
 * viewport dimensions are unavailable, defer movement instead of jumping on a false projection.
 * Missing sampler data falls back to the public toMap ground footprint.
 */
export function shouldRecenterImage(view: ImageFollowView, point: any, locked: boolean): boolean {
 if (locked) return true;
 if (view.stationary === false || view.width <= 0 || view.height <= 0) return false;
 let projection = point;
 if (view.type === '3d') {
  try {
   const sampler = view.groundView?.elevationSampler;
   const ground = sampler?.queryElevation(point);
   if (!ground || !Number.isFinite(ground.z) || ground.z === sampler?.noDataValue)
    return outsideGroundFootprint(view, point) ?? false;
   projection = ground;
  } catch { return outsideGroundFootprint(view, point) ?? false; }
 }
 try {
  // CSS-pixel inset: 24% of each dimension, capped at 128 px. Small/mobile
  // viewports retain most of their usable area; no fixed ground-distance buffer.
  const insetX = Math.min(128, view.width * 0.24);
  const insetY = Math.min(128, view.height * 0.24);
  const pixel = view.toScreen(projection);
  return !pixel || !Number.isFinite(pixel.x) || !Number.isFinite(pixel.y) ||
   pixel.x < insetX || pixel.y < insetY || pixel.x > view.width - insetX || pixel.y > view.height - insetY;
 } catch { return false; }
}

/** Public SceneView ground-ray fallback when its rendered elevation sampler is unavailable.
 * Intersect eight inset perimeter rays with terrain and test horizontal image membership.
 * This uses the rotated/tilted ground footprint, not the axis-aligned map extent or a
 * sea-level projection. Skip sky rays; fewer than three usable ground hits defer follow.
 * No elevation requests, timers or retained geometries are introduced.
 */
function outsideGroundFootprint(view: ImageFollowView, point: any): boolean | null {
 if (!view.toMap) return null;
 const geographic = (p: any): { lon: number; lat: number } | null => {
  if (Number.isFinite(p?.longitude) && Number.isFinite(p?.latitude)) return { lon: p.longitude, lat: p.latitude };
  const wkid = p?.spatialReference?.wkid;
  if (!Number.isFinite(p?.x) || !Number.isFinite(p?.y)) return null;
  if (wkid === 4326) return { lon: p.x, lat: p.y };
  if ([3857, 102100, 102113].includes(wkid)) return { lon: p.x / 6378137 * 180 / Math.PI,
   lat: Math.atan(Math.sinh(p.y / 6378137)) * 180 / Math.PI };
  return null;
 };
 const image = geographic(point);
 if (!image) return null;
 const x = Math.min(128, view.width * 0.24), y = Math.min(128, view.height * 0.24);
 const left = x, right = view.width - x, top = y, bottom = view.height - y;
 const pixels = [[left, top], [view.width / 2, top], [right, top], [right, view.height / 2],
  [right, bottom], [view.width / 2, bottom], [left, bottom], [left, view.height / 2]];
 const polygon: { x: number; y: number }[] = [];
 for (const [x, y] of pixels) {
  try {
   const hit = geographic(view.toMap({ x, y }));
   if (hit) polygon.push({ x: ((hit.lon - image.lon + 540) % 360) - 180, y: hit.lat - image.lat });
  } catch { /* A sky/missing terrain ray must not invalidate other ground hits. */ }
 }
 if (polygon.length < 3) return null;
 let inside = false;
 for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
  const a = polygon[j], b = polygon[i];
  const cross = a.x * b.y - b.x * a.y;
  if (Math.abs(cross) < 1e-10 && a.x * b.x + a.y * b.y <= 0) return false;
  if ((a.y > 0) !== (b.y > 0) && 0 < a.x + (b.x - a.x) * -a.y / (b.y - a.y)) inside = !inside;
 }
 return !inside;
}
