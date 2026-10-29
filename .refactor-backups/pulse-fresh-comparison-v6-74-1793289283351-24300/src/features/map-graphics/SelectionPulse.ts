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

export class SelectionPulse<G extends PulseGraphic, L extends PulseLayer<G>, V extends PulseView<G, L>> {
 layer: L | null = null;
 view: V | null = null;
 overlay: HTMLDivElement | null = null;
 private probe: PulseVisibilityProbe | null = null;
 private readonly bindings: { graphic: G | null };
 private readonly factories: PulseFactories<G, L>;
 private readonly clock: RippleClock & { clearInterval(handle: any): void };

 constructor(bindings: { graphic: G | null }, factories: PulseFactories<G, L>, clock: RippleClock & { clearInterval(handle: any): void }) {
  this.bindings = bindings; this.factories = factories; this.clock = clock;
 }

 /** Reuse the same image/view pulse without restarting its phase; otherwise replace all owned resources.
  * The caller supplies the WGS84 position and independent coverage anchor. Preserve the original
  * 1200 ms pulse, screen projection and symbol fallback when a DOM overlay is unavailable.
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
        symbolLayers: [{ type: "icon", resource: { primitive: "circle" }, material: { color: baseColor }, size: 10,
          outline: { color: "white", size: 2 }, occludedVisibility: { mode: "visible" } }],
      } : { type: "simple-marker", style: "circle", color: baseColor, size: 10, outline: { color: "white", width: 2 } },
    });
    layer.add(graphic);
    this.bindings.graphic = graphic;
    // Prebuild a bounded set once per displayed image; never clone during animation.
    const symbolFrames = view.type === '3d' ? Array.from({ length: 17 }, (_, index) => {
      if (index === 0) return graphic.symbol;
      const initial = graphic.symbol as any;
      const frame = typeof initial.clone === 'function' ? initial.clone()
        : { ...initial, symbolLayers: initial.symbolLayers.map((icon: any) => ({ ...icon })) };
      (frame.symbolLayers.getItemAt?.(0) || frame.symbolLayers[0]).size = 10 + index / 4;
      return frame;
    }) : null;
    if (view.type === '3d') {
      this.probe ??= new PulseVisibilityProbe();
      this.probe.attach(view, layer, graphic, symbolFrames || undefined);
    }
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
    let lastSymbolUpdate = -Infinity;
    let lastSymbolSize = NaN;
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
        if (view.type === "3d") {
          // Public symbol assignment notifies SceneView; reuse the prebuilt finite set.
          const frameIndex = Math.max(0, Math.min(16, Math.round((size - 10) * 4)));
          const nextSize = 10 + frameIndex / 4;
          if (now - lastSymbolUpdate >= 32 && nextSize !== lastSymbolSize) {
            const next = symbolFrames![frameIndex];
            if (graphic.symbol !== next) graphic.symbol = next;
            lastSymbolUpdate = now; lastSymbolSize = nextSize;
          }
        } else symbol.size = size;
      }
      (graphic as any)._pulseFrame = this.clock.request(animate);
    };
    (graphic as any)._pulseFrame = this.clock.request(animate);
    return graphic;
 }

 /** Remove the overlay, cancel animation/legacy interval and destroy the layer in its original view. */
 dispose(): void {
    this.probe?.stop('owner-dispose');
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

/** Temporary, event-driven diagnostic. Records no coordinates, image IDs or request URLs. */
export class PulseVisibilityProbe {
 private handles: { remove(): void }[] = [];
 private events: any[] = [];
 private sizeUpdates = 0;
 private minSize = Infinity;
 private maxSize = -Infinity;
 private symbolReplacements = 0;
 private pooledAssignments = 0;
 private unexpectedAssignments = 0;
 private pool: Set<any> | null = null;
 private owner: { view: any; layer: any; graphic: any } | null = null;
 private isolation: { target: any; visible: boolean; scope: string; type: string }[] = [];
 isolate = () => {
  this.restore();
  const owner = this.owner;
  if (!owner) return [];
  // Only top-level operational layers: keep basemap and elevation unchanged.
  owner.view.map?.layers?.forEach?.((target: any) => {
   if (target !== owner.layer) this.isolation.push({ target, visible: target.visible, scope: 'layer', type: target.type || 'unknown' });
  });
  owner.view.graphics?.forEach?.((target: any) => {
   this.isolation.push({ target, visible: target.visible, scope: 'view-graphic', type: target.geometry?.type || 'unknown' });
  });
  for (const item of this.isolation) item.target.visible = false;
  this.record('isolation-start'); return this.isolationReport();
 };
 show = (index: number) => {
  const item = this.isolation[index];
  if (!Number.isInteger(index) || !item) throw new Error('Choose an index returned by isolate()');
  item.target.visible = item.visible;
  this.record('isolation-show', String(index)); return this.isolationReport();
 };
 restore = () => {
  const hadIsolation = this.isolation.length > 0;
  for (const item of this.isolation) if (!item.target.destroyed) item.target.visible = item.visible;
  this.isolation = [];
  if (hadIsolation) this.record('isolation-restored');
 };
 private isolationReport(): any[] {
  return this.isolation.map((item, index) => ({ index, scope: item.scope, type: item.type, originallyVisible: item.visible, visible: item.target.visible }));
 }
 private contextCounts: Record<string, number> = {};
 private contextLast: Record<string, number> = {};
 private attachments = 0;
 private geometryPrevious: any = null;
 private context(event: string): void {
  this.contextCounts[event] = (this.contextCounts[event] || 0) + 1;
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  // Preserve bounded history without logging every graphics update during playback.
  if (now - (this.contextLast[event] ?? -Infinity) >= 250) {
   this.contextLast[event] = now; this.record(event);
  }
 }
 private revision = 0;
 private layerView: any = null;
 private inMap: boolean | undefined;
 private inLayer: boolean | undefined;
 private snapshot(): any {
  const o = this.owner;
  if (!o) return { active: false };
  const symbol = o.graphic.symbol, icon = symbol?.symbolLayers?.getItemAt?.(0) || symbol?.symbolLayers?.[0];
  return { active: true, viewType: o.view.type, viewDestroyed: !!o.view.destroyed,
   graphicPresent: o.layer.graphics?.includes?.(o.graphic) ?? null,
   layerPresent: o.view.map?.layers?.includes?.(o.layer) ?? null,
   graphicVisible: o.graphic.visible ?? true, layerVisible: o.layer.visible ?? true,
   layerOpacity: o.layer.opacity ?? 1, size: icon?.size ?? null,
   stationary: o.view.stationary ?? null, viewUpdating: o.view.updating ?? null,
   layerViewVisible: this.layerView?.visible ?? null, layerViewSuspended: this.layerView?.suspended ?? null };
 }
 private record(event: string, label?: string): void {
  if (event === 'symbol-change') {
   ++this.symbolReplacements;
   const size = this.snapshot().size;
   ++this.sizeUpdates; if (Number.isFinite(size)) { this.minSize = Math.min(this.minSize, size); this.maxSize = Math.max(this.maxSize, size); }
   if (this.pool?.has(this.owner?.graphic.symbol)) { ++this.pooledAssignments; return; }
   ++this.unexpectedAssignments;
  }
  const entry = { timeMs: Math.round(typeof performance !== 'undefined' ? performance.now() : Date.now()), event, ...(label ? { label: label.slice(0, 80) } : {}), ...this.snapshot() };
  this.events.push(entry); if (this.events.length > 200) this.events.shift();
  // Export history on demand; console logging can itself disturb animation timing.
 }
 report = () => ({ mode: '3d-render-isolation-v73', isolation: this.isolationReport(), context: { attachments: this.attachments, counts: { ...this.contextCounts } }, animation: { sizeUpdates: this.sizeUpdates, minSize: Number.isFinite(this.minSize) ? this.minSize : null, maxSize: Number.isFinite(this.maxSize) ? this.maxSize : null, symbolReplacements: this.symbolReplacements, pooledSymbolAssignments: this.pooledAssignments, unexpectedSymbolAssignments: this.unexpectedAssignments, poolSize: this.pool?.size ?? 0 }, current: this.snapshot(), events: this.events.map(event => ({ ...event })) });
 mark = (label = 'blink observed') => { this.record('manual-mark', String(label)); };
 clear = () => { this.events = []; this.contextCounts = {}; this.contextLast = {}; this.attachments = this.owner ? 1 : 0; this.sizeUpdates = 0; this.minSize = Infinity; this.maxSize = -Infinity; this.symbolReplacements = 0; this.pooledAssignments = 0; this.unexpectedAssignments = 0; this.record('cleared'); };
 private watch(target: any, property: string, event: string): void {
  const handle = target?.watch?.(property, () => event === 'view:updating' ? this.context(event) : this.record(event));
  if (handle?.remove) this.handles.push(handle);
 }
 attach(view: any, layer: any, graphic: any, pool?: readonly any[]): void {
  this.stop('replaced'); this.owner = { view, layer, graphic }; ++this.attachments; this.geometryPrevious = graphic.geometry?.clone?.() ?? graphic.geometry; this.pool = pool ? new Set(pool) : null; const revision = ++this.revision;
  if (typeof window !== 'undefined') (window as any).__mapillaryPulseProbe = { report: this.report, mark: this.mark, clear: this.clear, isolate: this.isolate, show: this.show, restore: this.restore };
  this.watch(graphic, 'symbol', 'symbol-change'); this.watch(graphic, 'visible', 'graphic-visibility'); const geometryHandle = graphic.watch?.('geometry', () => {
   const previous = this.geometryPrevious, current = graphic.geometry;
   const equal = previous === current || (typeof previous?.equals === 'function' && previous.equals(current));
   this.geometryPrevious = current?.clone?.() ?? current;
   this.context(equal ? 'geometry-reassigned-equal' : 'geometry-position-change');
  });
  if (geometryHandle?.remove) this.handles.push(geometryHandle);
  this.watch(layer, 'elevationInfo', 'elevation-info-change');
  for (const property of ['stationary', 'updating', 'interacting', 'animation']) this.watch(view, property, 'view:' + property);
  // Watch collection churn only, never inspect or modify selection/hover contents.
  const watched = new Set<any>();
  const observeCollection = (collection: any, event: string) => {
   if (!collection?.on || watched.has(collection)) return;
   watched.add(collection);
   const handle = collection.on('change', () => this.context(event));
   if (handle?.remove) this.handles.push(handle);
  };
  observeCollection(view.graphics, 'view-graphics-change');
  const observeLayers = () => {
   const layers = view.map?.allLayers || view.map?.layers;
   layers?.forEach?.((other: any) => {
    if (other !== layer) observeCollection(other.graphics, 'other-graphics-change');
   });
  };
  observeLayers();
  const layerHandle = (view.map?.allLayers || view.map?.layers)?.on?.('change', () => {
   this.context('map-layers-change'); observeLayers();
  });
  if (layerHandle?.remove) this.handles.push(layerHandle);
  this.watch(layer, 'visible', 'layer-visibility'); this.watch(layer, 'opacity', 'layer-opacity'); this.watch(layer, 'destroyed', 'layer-destroyed');
  const icon = graphic.symbol?.symbolLayers?.getItemAt?.(0) || graphic.symbol?.symbolLayers?.[0];
  const sizeHandle = icon?.watch?.('size', () => {
   ++this.sizeUpdates; if (Number.isFinite(icon.size)) { this.minSize = Math.min(this.minSize, icon.size); this.maxSize = Math.max(this.maxSize, icon.size); }
  });
  if (sizeHandle?.remove) this.handles.push(sizeHandle);
  this.inMap = view.map?.layers?.includes?.(layer); this.inLayer = layer.graphics?.includes?.(graphic);
  for (const [collection, kind] of [[view.map?.layers, 'map'], [layer.graphics, 'graphics']] as const) {
   const handle = collection?.on?.('change', () => {
    const present = kind === 'map' ? view.map?.layers?.includes?.(layer) : layer.graphics?.includes?.(graphic);
    const previous = kind === 'map' ? this.inMap : this.inLayer;
    if (present !== previous) { if (kind === 'map') this.inMap = present; else this.inLayer = present; this.record(kind === 'map' ? 'layer-membership' : 'graphic-membership'); }
   });
   if (handle?.remove) this.handles.push(handle);
  }
  this.record('attached-cached-animation');
  try { if (view.whenLayerView) void Promise.resolve(view.whenLayerView(layer)).then(lv => {
   if (revision !== this.revision || !this.owner) return;
   this.layerView = lv; this.watch(lv, 'visible', 'layer-view:visible'); this.watch(lv, 'suspended', 'layer-view:suspended'); this.record('layer-view:attached');
  }).catch(() => { if (revision === this.revision && this.owner) this.record('layer-view:unavailable'); });
  } catch { if (revision === this.revision && this.owner) this.record('layer-view:unavailable'); }
 }
 stop(reason = 'stopped'): void {
  this.restore();
  if (this.owner) this.record(reason);
  ++this.revision; this.handles.forEach(handle => handle.remove()); this.handles = []; this.owner = null; this.layerView = null; this.pool = null; this.geometryPrevious = null;
 }
}
