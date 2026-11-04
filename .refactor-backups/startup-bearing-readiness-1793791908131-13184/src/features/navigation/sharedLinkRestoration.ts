/** Browser query access required by the shared-link reader, without a full Window dependency. */
export interface SharedLinkWindow {
  self: unknown;
  top: unknown;
  parent?: { location: { search: string } } | null;
  location: { search: string };
}
export interface SharedLinkMapView {
  type: string;
  when(): PromiseLike<unknown>;
  goTo(target: any, options: any): PromiseLike<unknown>;
}
export interface SharedLinkViewer {
  getImage(): PromiseLike<{ compassAngle?: number | null }>;
  setCenter(center: [number, number]): unknown;
}
export interface SharedViewerBearingHost {
  getViewer(): SharedLinkViewer | null | undefined;
  onBearing(bearing: number): void;
  updateUrl(imageId: string, latitude: number, longitude: number): void;
  warn(error: unknown): void;
}

/** Read the parent's query when framed, retaining child-query fallback on access failure.
 * Returns raw parameters; defaults, one-time map switching and Graph loading stay runtime-owned.
 */
export function readSharedLinkParameters(getWindow: () => SharedLinkWindow = () => window): URLSearchParams {
  const browser = getWindow();
  let search = browser.location.search;
  try {
    if (browser.self !== browser.top && browser.parent) search = browser.parent.location.search;
  } catch (error) { console.warn('Cannot access parent window params, using widget params'); }
  return new URLSearchParams(search);
}

/** Restore the initial map flight after sequence loading; coordinates are [longitude, latitude].
 * Zoom is an ArcGIS map level, never Mapillary viewer zoom. The existing 3D heading/60° tilt
 * and 2500 ms flight, or 2D 2000 ms flight, are awaited before the runtime updates its URL.
 */
export async function restoreSharedMapCamera(view: SharedLinkMapView, coordinates: readonly number[],
  bearing: number, mapZoom: number, createPoint: (properties: any) => any): Promise<void> {
  const targetPoint = createPoint({ longitude: coordinates[0], latitude: coordinates[1], spatialReference: { wkid: 4326 } });
  await view.when();
  if (view.type === '3d') {
    await view.goTo({ target: targetPoint, heading: bearing, tilt: 60, zoom: mapZoom }, { animate: true, duration: 2500 });
  } else {
    await view.goTo({ target: targetPoint, zoom: mapZoom }, { animate: true, duration: 2000 });
  }
}

/** Restore viewer bearing through normalized centre coordinates, without calling setZoom.
 * Reads the live viewer again after getImage resolves, preserving existing replacement behavior.
 * Viewer errors retain warning feedback; bearing and URL still update afterward, as before.
 * The runtime retains the 1000 ms invocation delay and its separate 1500 ms fly-in release.
 */
export async function restoreSharedViewerBearing(imageId: string, coordinates: readonly number[],
  bearing: number, host: SharedViewerBearingHost): Promise<void> {
  if (host.getViewer()) {
    try {
      const currentImage = await host.getViewer()!.getImage();
      const imageBearing = currentImage.compassAngle ?? 0;
      const diff = bearing - imageBearing;
      const x = (((0.5 + diff / 360) % 1) + 1) % 1;
      host.getViewer()!.setCenter([x, 0.5]);
    } catch (error) { host.warn(error); }
    host.onBearing(bearing);
    host.updateUrl(imageId, coordinates[1], coordinates[0]);
  }
}
