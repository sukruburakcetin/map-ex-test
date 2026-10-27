/** Minimal SDK boundary for checking the rendered viewport rather than its rotated extent. */
export interface ImageFollowView {
 type: string; width: number; height: number; stationary?: boolean;
 toScreen(point: any): { x: number; y: number } | null | undefined;
 groundView?: { elevationSampler?: { queryElevation(point: any): any; noDataValue?: number | null } | null } | null;
}

/** Default follow moves only after the image leaves the viewport; lock preserves continuous follow.
 * Scene projection needs ground height because toScreen does not apply graphic-layer draping.
 * Use only the synchronous rendered-terrain sampler, never a service request. While terrain or
 * viewport dimensions are unavailable, defer movement instead of jumping on a false projection.
 */
export function shouldRecenterImage(view: ImageFollowView, point: any, locked: boolean): boolean {
 if (locked) return true;
 if (view.stationary === false || view.width <= 0 || view.height <= 0) return false;
 let projection = point;
 if (view.type === '3d') {
  try {
   const sampler = view.groundView?.elevationSampler;
   const ground = sampler?.queryElevation(point);
   if (!ground || !Number.isFinite(ground.z) || ground.z === sampler?.noDataValue) return false;
   projection = ground;
  } catch { return false; }
 }
 try {
  const pixel = view.toScreen(projection);
  return !pixel || !Number.isFinite(pixel.x) || !Number.isFinite(pixel.y) ||
   pixel.x < 0 || pixel.y < 0 || pixel.x > view.width || pixel.y > view.height;
 } catch { return false; }
}
