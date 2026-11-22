import { getSunPosition } from '../../utils/geoUtils';
import type { SolarLayer, SolarMapOverlay, SolarMapView } from './SolarMapOverlay';

interface SolarImage { id: string; lon: number; lat: number; captured_at?: number; }
type SolarPosition = ReturnType<typeof getSunPosition>;
type Constructor<T> = new (properties: any) => T;

/** Bind live context and the existing resource owners; construction starts no SDK work. */
export interface SolarModelHost<Layer extends SolarLayer, View extends SolarMapView<Layer> & { type: string }> {
  enabled(): boolean;
  state(): { isSolarMode: boolean; imageId: string | null; jimuMapView?: { view: View } | null; sequenceImages: readonly SolarImage[] };
  overlay(): SolarMapOverlay<Layer, View>;
  notify(reason: 'missing-timestamp' | 'below-horizon'): void;
  clear(): void;
  loadModules(ids: string[]): Promise<Constructor<Layer>[]>;
  graphic(): Constructor<unknown>;
  viewerSun(sun: SolarPosition): void;
  sceneLighting(view: View, date: Date, current: () => boolean): void;
}

/** Compute the photo's solar model and delegate rendering with the original lazy-load guards.
 * Existing owners retain geometry, viewer resources and delayed lighting cancellation.
 */
export async function updateSolarModel<Layer extends SolarLayer, View extends SolarMapView<Layer> & { type: string }>(host: SolarModelHost<Layer, View>): Promise<void> {
  if (!host.enabled() || !host.state().isSolarMode || !host.state().imageId || !host.state().jimuMapView) return;
  const overlay = host.overlay();
  const request = ++overlay.revision;
  const solarView = host.state().jimuMapView!.view;
  const currentImg = host.state().sequenceImages.find(img => img.id === host.state().imageId);
  if (!currentImg || !currentImg.captured_at) {
    host.notify('missing-timestamp'); host.clear(); return;
  }
  const sun = getSunPosition(currentImg.captured_at, currentImg.lat, currentImg.lon);
  if (sun.altitude <= 0) {
    host.notify('below-horizon'); host.clear(); return;
  }
  const map = solarView.map;
  if (!overlay.layer) {
    const [GraphicsLayer] = await host.loadModules(['esri/layers/GraphicsLayer']);
    if (request !== overlay.revision || !host.state().isSolarMode || !host.enabled() || host.state().jimuMapView?.view !== solarView) return;
    overlay.create(solarView, properties => new GraphicsLayer(properties));
  }
  overlay.prepare(map);
  const Graphic = host.graphic();
  overlay.renderVectors(currentImg, sun, properties => new Graphic(properties));
  host.viewerSun(sun);
  if (host.state().jimuMapView && host.state().jimuMapView!.view.type === '3d') {
    const view = host.state().jimuMapView!.view;
    const photoDate = new Date(currentImg.captured_at);
    host.sceneLighting(view, photoDate, () =>
      request === overlay.revision && !!host.state().isSolarMode && host.enabled() && host.state().jimuMapView?.view === solarView);
  }
}
