export interface ZoomTargetPoint { longitude: number; latitude: number; }
export interface ZoomTargetView<Point> {
  width: number; height: number; zoom: number; center: Point | null;
  toMap(pixel: { x: number; y: number }): Point | null;
  toScreen(point: Point): { x: number; y: number } | null;
}
interface TargetGeometry<Point> { geometry?: Point | { type: string }; }
export interface ZoomToImagesHost<Point, View> {
  imageId(): unknown;
  images(): readonly { id: unknown; lon: number; lat: number }[] | undefined;
  fallbackImages(): readonly { id: unknown; lon: number; lat: number }[] | undefined;
  graphic(): (TargetGeometry<Point> & { attributes?: { image_id?: unknown } }) | null | undefined;
  hasCoverage(): boolean;
  pick(pixel: { x: number; y: number }, view: View, signal: AbortSignal, radius: number): Promise<TargetGeometry<Point> | null>;
}

/** Existing selected-image, looked-at ground and low-zoom coverage target precedence. */
export async function zoomToImagesTarget<Point extends ZoomTargetPoint & { type: string }, View extends ZoomTargetView<Point>>(view: View, signal: AbortSignal, host: ZoomToImagesHost<Point, View>): Promise<number[] | Point | null> {
  const id = host.imageId();
  if (id) {
    const selected = host.images()?.find(image => String(image.id) === String(id)) || host.fallbackImages()?.find(image => String(image.id) === String(id));
    if (selected && Number.isFinite(selected.lon) && Number.isFinite(selected.lat) && Math.abs(selected.lon) <= 180 && Math.abs(selected.lat) <= 90) return [selected.lon, selected.lat];
    const graphic = host.graphic();
    if (String(graphic?.attributes?.image_id) === String(id) && graphic?.geometry?.type === "point") return graphic.geometry as Point;
  }
  // In a tilted globe view the screen center can be sky; sample lower ground before falling back to view.center.
  let ground: Point | null = null;
  for (const fraction of [0.5, 0.65, 0.8]) {
    try { ground = view.toMap({ x: view.width / 2, y: view.height * fraction }) as Point; } catch (_) { ground = null; }
    if (ground && Number.isFinite(ground.longitude) && Number.isFinite(ground.latitude)) break;
    ground = null;
  }
  ground = ground || view.center;
  if (!ground) return null;
  if (view.zoom < 14 && host.hasCoverage() && !signal.aborted) {
    try {
      const pixel = view.toScreen(ground);
      if (pixel) {
        const nearby = await host.pick(pixel, view, signal, Math.min(160, Math.max(32, Math.min(view.width, view.height) * 0.15)));
        if (nearby?.geometry?.type === "point") return nearby.geometry as Point;
      }
    } catch (_) { /* Missing/filtered coverage must not prevent navigation to the looked-at ground. */ }
  }
  return ground;
}
