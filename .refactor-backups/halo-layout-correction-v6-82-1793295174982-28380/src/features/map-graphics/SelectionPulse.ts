/** Active-image pulse layer, screen overlay and animation owner; selection identity remains runtime-owned. */
import type { RippleClock } from './ClickRippleAnimations';
import { selectionPulseOverlayStyle } from '../../styles/mapGraphics';

export interface PulseGraphic { geometry: any; symbol: any; attributes: any; }
export interface PulseLayer<G> { elevationInfo: any; visible: boolean; add(graphic: G): unknown; remove(graphic: G): unknown; destroy(): void; }
export interface PulseView<G, L> {
 type: string; destroyed?: boolean; width: number; height: number; container?: HTMLElement | string | null;
 map?: { add(layer: L): unknown; remove(layer: L): unknown } | null;
 graphics: { remove(graphic: G): unknown };
 toScreen(geometry: any): { x: number; y: number } | null | undefined;
 updating?: boolean;
 stationary?: boolean;
 groundView?: { elevationSampler?: { queryElevation(geometry: any): any; noDataValue?: number | null;
   on?(type: 'changed', callback: () => void): { remove(): void } } | null } | null;
}
export interface PulseFactories<G, L> {
 point(properties: any): any;
 layer(properties: any): L;
 graphic(properties: any): G;
 overlay(): HTMLDivElement | null;
}

/** One static image avoids stacking independently rendered 3D icon layers. */
export function currentImageTargetResource(baseColor: any): string {
 const rgba = Array.isArray(baseColor) ? baseColor : baseColor?.toRgba?.();
 const channel = (value: any, fallback: number) => Number.isFinite(value) ? Math.max(0, Math.min(255, value)) : fallback;
 const color = rgba ? `rgb(${channel(rgba[0], 0)},${channel(rgba[1], 255)},${channel(rgba[2], 0)})` : '#00ff00';
 const alpha = rgba && Number.isFinite(rgba[3]) ? Math.max(0, Math.min(1, rgba[3])) : 1;
 const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#142c24"/><circle cx="12" cy="12" r="9.5" fill="#ffffff"/><circle cx="12" cy="12" r="6.5" fill="${color}" fill-opacity="${alpha}"/></svg>`;
 return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

export class SelectionPulse<G extends PulseGraphic, L extends PulseLayer<G>, V extends PulseView<G, L>> {
 layer: L | null = null;
 view: V | null = null;
 overlay: HTMLDivElement | null = null;
 private readonly bindings: { graphic: G | null };
 private readonly factories: PulseFactories<G, L>;
 private readonly clock: RippleClock & { clearInterval(handle: any): void };

 constructor(bindings: { graphic: G | null }, factories: PulseFactories<G, L>, clock: RippleClock & { clearInterval(handle: any): void }) {
  this.bindings = bindings; this.factories = factories; this.clock = clock;
 }

 /** Reuse the same image/view pulse without restarting its phase; otherwise replace all owned resources.
  * The caller supplies the WGS84 position and independent coverage anchor. Preserve the original
  * 1200 ms 2D pulse, screen projection and symbol fallback; 3D uses a static 14 pt camera target.
  */
 show(view: V, anchor: { geometry?: any }, lon: number, lat: number, baseColor: any, imageId: string | null): G {
    // Viewer events and route hydration may redraw the same image. Preserve its pulse phase.
    if (this.view === view && this.bindings.graphic &&
        this.bindings.graphic.attributes?.image_id === String(imageId) && this.layer) {
      this.bindings.graphic.geometry = anchor.geometry || this.factories.point({ longitude: lon, latitude: lat, spatialReference: { wkid: 4326 } });
      this.layer.elevationInfo = { mode: view.type === '3d' ? 'on-the-ground' : anchor.geometry ? "absolute-height" : "on-the-ground" };
      return this.bindings.graphic;
    }
    this.dispose();
    // Keep the geometry anchor independent from coverage rendering.
    const layer = this.factories.layer({
      id: "mapillary-active-selection", title: "Mapillary Active Image", listMode: "hide",
      elevationInfo: { mode: view.type === '3d' ? 'on-the-ground' : anchor.geometry ? "absolute-height" : "on-the-ground" },
    });
    this.layer = layer; this.view = view;
    view.map!.add(layer);
    const graphic = this.factories.graphic({
      geometry: anchor.geometry || { type: "point", longitude: lon, latitude: lat, spatialReference: { wkid: 4326 } },
      attributes: { image_id: String(imageId) },
      symbol: view.type === "3d" ? {
        type: "point-3d", disableDepthTestDistance: Number.POSITIVE_INFINITY,
        symbolLayers: [{ type: "icon", resource: { href: currentImageTargetResource(baseColor) }, size: 14,
          occludedVisibility: { mode: "visible" } }],
      } : { type: "simple-marker", style: "circle", color: baseColor, size: 10, outline: { color: "white", width: 2 } },
    });
    layer.add(graphic);
    this.bindings.graphic = graphic;
    // Stable 3D baseline validated during diagnostics: no animation or symbol swaps.
    if (view.type === '3d') return graphic;
    // SceneView must render the on-the-ground Graphic itself. toScreen projects
    // geometry Z directly and does not apply layer draping, so a DOM pulse can float
    // above terrain. The native icon keeps the pulse aligned while terrain loads.
    // In 2D, retain the overlay above view.graphics.
    const host = view.container as HTMLElement;
    if (view.type !== "3d" && host && typeof host.appendChild === "function") {
      const overlay = this.factories.overlay();
      if (overlay) {
      overlay.setAttribute("aria-hidden", "true");
      Object.assign(overlay.style, selectionPulseOverlayStyle(baseColor));
      host.appendChild(overlay); this.overlay = overlay;
      layer.visible = false;
      }
    }
    const started = this.clock.now();
    const animate = (now: number) => {
      if (this.bindings.graphic !== graphic || this.view !== view || view.destroyed) return;
      const size = 12 - 2 * Math.cos((now - started) * Math.PI * 2 / 1200);
      const overlay = this.overlay;
      if (overlay) {
        const pixel = view.toScreen(graphic.geometry);
        const visible = pixel && Number.isFinite(pixel.x) && Number.isFinite(pixel.y) && pixel.x >= 0 && pixel.y >= 0 && pixel.x <= view.width && pixel.y <= view.height;
        overlay.style.display = visible ? "block" : "none";
        if (visible) { overlay.style.left = `${pixel.x}px`; overlay.style.top = `${pixel.y}px`; overlay.style.width = `${size}px`; overlay.style.height = `${size}px`; }
      } else {
        const symbol = graphic.symbol as any;
        symbol.size = size;
      }
      (graphic as any)._pulseFrame = this.clock.request(animate);
    };
    (graphic as any)._pulseFrame = this.clock.request(animate);
    return graphic;
 }

 /** Remove the overlay, cancel animation/legacy interval and destroy the layer in its original view. */
 dispose(): void {
    this.overlay?.remove(); this.overlay = null;
    if (this.bindings.graphic) {
      const frame = (this.bindings.graphic as any)._pulseFrame;
      if (frame != null) this.clock.cancel(frame);
      const interval = (this.bindings.graphic as any)._pulseInterval;
      if (interval != null) this.clock.clearInterval(interval); // Compatibility with pre-update graphics.
      if (this.layer) this.layer.remove(this.bindings.graphic);
      else this.view?.graphics?.remove(this.bindings.graphic);
      this.bindings.graphic = null;
    }
    if (this.layer) {
      this.view?.map?.remove(this.layer);
      this.layer.destroy();
    }
    this.layer = null; this.view = null;
  }
}

