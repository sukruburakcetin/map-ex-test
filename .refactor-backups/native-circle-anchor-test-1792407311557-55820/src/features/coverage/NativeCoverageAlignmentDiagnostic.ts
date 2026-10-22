/** Temporary, opt-in coverage alignment inspection. It never fetches tile or image data.
 * Enable with window.__mlyCoverageAlignment.enable(), hover a close-up image dot,
 * then inspect window.__mlyCoverageAlignment.report(). Disable after collecting evidence.
 */
type Pixel = { x: number; y: number };
type Tile = [number, number, number];
type Json = Record<string, any>;
export interface AlignmentTile {
  layer: { length: number; feature(index: number): any };
  indexed?: (index: number) => { x: number; y: number } | null;
}
export interface AlignmentContext {
  view: any;
  layer: any;
  revision: number;
  geometry: any;
  overlay: HTMLElement | null;
  sourceZoom: number;
  closeZoom: number;
  hybridReady: boolean;
  hybridVisible: boolean;
  hybridFallback: boolean;
}
export interface AlignmentHost {
  id: string;
  read(): AlignmentContext | null;
  cached(tile: Tile): AlignmentTile | null;
  project(context: AlignmentContext, lon: number, lat: number): Pixel | null;
}
const baseImageStyles = ['turbo-images', 'turbo-images-good', 'turbo-images-fair', 'turbo-images-poor', 'turbo-images-unscored'];
const controls = new Map<string, NativeCoverageAlignmentDiagnostic>();
let serial = 0;
let registryRoot: any;
let api: any;
const copy = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const pixel = (value: any): Pixel | null => value && Number.isFinite(value.x) && Number.isFinite(value.y) ? { x: value.x, y: value.y } : null;
const finite = (value: any): number | null => typeof value === 'number' && Number.isFinite(value) ? value : null;
const delta = (a: Pixel | null, b: Pixel | null) => a && b ? { x: a.x - b.x, y: a.y - b.y } : null;
const cancelled = (signal: AbortSignal) => { if (signal.aborted) throw new DOMException('Cancelled', 'AbortError'); };

/** Match only exact IDs. Large numeric IDs are never rounded into a different image. */
export function alignmentIdFilter(id: string): any[] {
  const exactString = ['==', 'id', id];
  const number = Number(id);
  return /^\d+$/.test(id) && Number.isSafeInteger(number) && String(number) === id
    ? ['any', exactString, ['==', 'id', number]] : exactString;
}

/** Preserve native placement, size, zoom range and all active filters; change only fill color. */
export function alignmentStyle(base: Json, id: string, styleId: string): Json {
  const style = copy(base);
  style.id = styleId;
  const identity = alignmentIdFilter(id);
  style.filter = base.filter ? ['all', copy(base.filter), identity] : identity;
  style.paint = { ...style.paint, 'circle-color': '#00e5ff' };
  return style;
}

/** Inspect only already cached bytes. Yield during scans and report partial scans explicitly.
 * Native buffered copies are included: they can reveal a tile-boundary disagreement.
 */
export async function inspectCachedAlignment(host: AlignmentHost, context: AlignmentContext, id: string, signal: AbortSignal): Promise<Json> {
  const lon = Number(context.geometry?.longitude), lat = Number(context.geometry?.latitude);
  if (!Number.isFinite(lon) || !Number.isFinite(lat) || Math.abs(lat) > 85.05112878) return { status: 'unavailable', reason: 'Hover geometry has no usable longitude/latitude.' };
  const z = context.sourceZoom, n = 2 ** z;
  const tx = Math.floor((lon + 180) / 360 * n);
  const ty = Math.floor((1 - Math.asinh(Math.tan(lat * Math.PI / 180)) / Math.PI) / 2 * n);
  const matches: Json[] = [];
  let cachedTiles = 0, features = 0, complete = true;
  const started = performance.now();
  let deadline = started + 8;
  outer: for (const [dx, dy] of [[0,0],[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]) {
    cancelled(signal);
    const x = (tx + dx + n) % n, y = ty + dy;
    if (y < 0 || y >= n) continue;
    const tile: Tile = [x, y, z];
    const cached = host.cached(tile);
    if (!cached) continue;
    cachedTiles++;
    for (let i = 0; i < cached.layer.length; i++) {
      if ((features++ & 127) === 0) {
        cancelled(signal);
        if (performance.now() - started > 500 || features > 100000) { complete = false; break outer; }
        if (performance.now() >= deadline) { await new Promise(resolve => setTimeout(resolve, 0)); cancelled(signal); deadline = performance.now() + 8; }
      }
      const feature = cached.layer.feature(i);
      if (String(feature.properties?.id) !== id) continue;
      const point = feature.loadGeometry()?.[0]?.[0];
      if (!point) continue;
      const extent = Number(feature.extent) || 4096;
      const px = point.x / extent, py = point.y / extent;
      const canonical = px >= 0 && px < 1 && py >= 0 && py < 1;
      const direct = { lon: (x + px) / n * 360 - 180, lat: Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + py) / n))) * 180 / Math.PI };
      // The production index intentionally omits buffered copies; their zeroed slots
      // are not stored coordinates and must never be presented as an index error.
      const stored = canonical ? cached.indexed?.(i) : null;
      const indexed = stored && Number.isFinite(stored.x) && Number.isFinite(stored.y) ? stored : null;
      const fromIndex = indexed ? { lon: (x + indexed.x) / n * 360 - 180, lat: Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + indexed.y) / n))) * 180 / Math.PI } : null;
      const directScreen = pixel(host.project(context, direct.lon, direct.lat));
      const indexedScreen = fromIndex ? pixel(host.project(context, fromIndex.lon, fromIndex.lat)) : null;
      matches.push({ tile, featureIndex: i, extent, raw: { x: point.x, y: point.y }, canonical,
        indexStatus: !canonical ? 'excluded-buffered-copy' : !cached.indexed ? 'no-cached-index' : indexed ? 'compared' : 'unavailable',
        direct, indexed: fromIndex, coordinateDelta: fromIndex ? { lon: fromIndex.lon - direct.lon, lat: fromIndex.lat - direct.lat } : null,
        directScreen, indexedScreen, indexMinusDirectPixels: delta(indexedScreen, directScreen) });
      if (matches.length >= 8) { complete = false; break outer; }
    }
  }
  cancelled(signal);
  return { status: matches.length ? 'matched' : cachedTiles ? 'not-found-in-cached-tiles' : 'no-cached-tiles', complete, cachedTiles, scannedFeatures: features, matches,
    projectionHeight: context.view.type === '3d' ? 'Existing hover height reused; no terrain query.' : '2D' };
}

/** Expose a small shared console API without overwriting another application's property. */
function register(owner: NativeCoverageAlignmentDiagnostic, root: any): () => void {
  if (!root) return () => {};
  if (!api) {
    api = {
      enable: () => { controls.forEach(value => value.enable()); return 'Enabled. Move off the dot, then hover it. Cyan = native placement; brown = existing hover. No change to picking.'; },
      disable: async () => {
        await Promise.all(Array.from(controls.values(), value => value.disable()));
        const pending = Array.from(controls.values()).reduce((sum, value) => sum + value.report().cleanupPending, 0);
        return pending ? 'Disabled, but native style cleanup is pending. Retry disable() or reload the experience.' : 'Disabled; diagnostic styles removed.';
      },
      report: () => Array.from(controls, ([widget, value]) => ({ widget, ...value.report() })),
    };
  }
  if (root.__mlyCoverageAlignment !== undefined && root.__mlyCoverageAlignment !== api) return () => {};
  registryRoot = root;
  root.__mlyCoverageAlignment = api;
  const key = `${owner.host.id}#${owner.instance}`;
  controls.set(key, owner);
  return () => {
    controls.delete(key);
    if (!controls.size && registryRoot?.__mlyCoverageAlignment === api) { delete registryRoot.__mlyCoverageAlignment; registryRoot = undefined; }
  };
}

/** Own bounded diagnostics and temporary native styles. The default-off path performs
 * no tile scans, DOM measurement, native hit tests, timers, style reads or style edits.
 * Mutations are serialized so late SDK calls cannot resurrect a cleared highlight.
 */
export class NativeCoverageAlignmentDiagnostic {
  readonly instance = ++serial;
  private enabled = false;
  private disposed = false;
  private revision = 0;
  private target: { context: AlignmentContext; id: string } | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private pointerTimer: ReturnType<typeof setTimeout> | null = null;
  private pointerRevision = 0;
  private nativeFlight: Promise<any> | null = null;
  private scan: AbortController | null = null;
  private chain: Promise<void> = Promise.resolve();
  private owned: { layer: any; id: string }[] = [];
  private lastHover: Json | null = null;
  private lastNativeHit: Json | null = null;
  private unregister: () => void;
  constructor(readonly host: AlignmentHost, root: any = typeof window === 'undefined' ? undefined : window) { this.unregister = register(this, root); }

  /** Enable only on explicit console intent; the next hover supplies a fresh target. */
  enable(): void { if (!this.disposed) this.enabled = true; }

  /** Stop pending work and remove only this probe's style layers. Keep the last report. */
  async disable(): Promise<void> {
    this.enabled = false;
    ++this.pointerRevision;
    if (this.pointerTimer) clearTimeout(this.pointerTimer);
    this.pointerTimer = null;
    this.clearHover();
    await this.chain;
  }

  /** Return allowlisted diagnostics; no token, service URL, style source or image metadata. */
  report(): Json { return copy({ enabled: this.enabled, cleanupPending: this.enabled ? 0 : this.owned.length, hover: this.lastHover, nativeHit: this.lastNativeHit }); }

  /** Inspect native hit testing even where the manual picker finds no dot. */
  pointer(view: any, point: Pixel): void {
    if (!this.enabled || this.disposed) return;
    const revision = ++this.pointerRevision;
    if (this.pointerTimer) clearTimeout(this.pointerTimer);
    this.pointerTimer = setTimeout(() => {
      this.pointerTimer = null;
      const context = this.host.read();
      if (!context || context.view !== view || view.stationary === false || view.destroyed || !context.layer || revision !== this.pointerRevision) return;
      void this.inspectNativeHit(context, point, revision);
    }, 450);
  }

  /** Schedule one comparison per image/context; ordinary pointer movement does not rescan. */
  capture(graphic: any, clientX: number, clientY: number): void {
    if (!this.enabled || this.disposed) return;
    const context = this.host.read();
    const id = String(graphic.attributes?.image_id || '');
    if (!context?.view || !context.layer || !id || context.view.zoom < 19) return;
    if (this.target?.id === id && this.target.context.view === context.view && this.target.context.layer === context.layer && this.target.context.revision === context.revision) return;
    this.clearHover();
    context.geometry = graphic.geometry;
    const target = this.target = { context, id };
    const revision = this.revision;
    this.timer = setTimeout(() => {
      this.timer = null;
      if (!this.current(target, revision)) return;
      const controller = this.scan = new AbortController();
      void this.compare(target, revision, controller.signal, graphic.attributes, { x: clientX, y: clientY });
    }, 240);
  }

  /** Invalidate hover work before queuing cleanup behind any already-started SDK edit. */
  clearHover(): void {
    ++this.revision;
    this.target = null;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.scan?.abort(); this.scan = null;
    if (this.owned.length) this.chain = this.chain.then(() => this.removeOwned());
  }

  /** Unregister console controls and finish cleanup after pending native edits settle. */
  dispose(): void { this.disposed = true; this.unregister(); void this.disable(); }

  private current(target: { context: AlignmentContext; id: string }, revision: number): boolean {
    if (!this.enabled || this.disposed || this.target !== target || revision !== this.revision) return false;
    const active = this.host.read();
    return !!active && active.view === target.context.view && active.layer === target.context.layer && active.revision === target.context.revision && !active.view.destroyed;
  }

  /** Keep style edits out of the hover hot path and never reload the coverage style. */
  private addNative(target: { context: AlignmentContext; id: string }, revision: number): Promise<Json> {
    let result: Json = { status: 'unavailable', reason: 'Native style editing is not exposed by this SDK/layer.' };
    const work = this.chain.then(async () => {
      await this.removeOwned();
      if (!this.current(target, revision)) return;
      const layer = target.context.layer;
      if (typeof layer.getStyleLayer !== 'function' || typeof layer.setStyleLayer !== 'function' || typeof layer.deleteStyleLayer !== 'function') return;
      const bases: Json[] = [];
      for (const id of baseImageStyles) { try { const base = layer.getStyleLayer(id); if (base?.type === 'circle' && base['source-layer'] === 'image') bases.push(base); } catch (_) { /* Missing quality-band style is normal. */ } }
      if (!bases.length) { result = { status: 'unavailable', reason: 'No active Turbo image-circle style; replacement graphics or a style refresh may be active.' }; return; }
      result = { status: 'added', color: '#00e5ff', sameRadiusAndStroke: true, baseStyleIds: bases.map(base => base.id), styleIds: [], filterId: target.id };
      for (let index = 0; index < bases.length; index++) {
        if (!this.current(target, revision)) break;
        const id = `mly-alignment-${this.instance}-${index}`;
        let existing: any;
        try { existing = layer.getStyleLayer(id); } catch (_) {}
        if (existing) { result.status = 'collision'; result.reason = 'Existing diagnostic-style ID preserved.'; break; }
        this.owned.push({ layer, id });
        await layer.setStyleLayer(alignmentStyle(bases[index], target.id, id));
        result.styleIds.push(id);
      }
      if (!this.current(target, revision)) { await this.removeOwned(); result = { status: 'cancelled' }; }
    });
    this.chain = work.catch(async error => { result = { status: 'failed', reason: 'Native style update failed.', errorName: String(error?.name || 'Error') }; await this.removeOwned(); });
    return this.chain.then(() => result);
  }

  private async removeOwned(): Promise<void> {
    const owned = this.owned.splice(0);
    for (const item of owned) {
      try { if (!item.layer.destroyed) await item.layer.deleteStyleLayer(item.id); }
      catch (_) {
        // A style reload may already have removed it. Otherwise retain ownership for retry.
        let stillPresent = !item.layer.destroyed;
        try { if (typeof item.layer.getStyleLayer === 'function') stillPresent = !!item.layer.getStyleLayer(item.id); } catch (_) {}
        if (stillPresent) this.owned.push(item);
      }
    }
  }

  /** Pair one image identity across native style, raw/indexed data, projection and DOM. */
  private async compare(target: { context: AlignmentContext; id: string }, revision: number, signal: AbortSignal, attributes: Json, pointerClient: Pixel): Promise<void> {
    const { context, id } = target;
    try {
      const nativeStyle = await this.addNative(target, revision);
      if (!this.current(target, revision)) return;
      const cached = await inspectCachedAlignment(this.host, context, id, signal);
      if (!this.current(target, revision)) return;
      const fresh = this.host.read()!;
      const view = context.view, host = view.container as HTMLElement;
      const bounds = host?.getBoundingClientRect?.();
      const overlayBounds = fresh.overlay?.getBoundingClientRect?.();
      const projected = pixel(view.toScreen(context.geometry));
      const expectedClient = bounds && projected && view.width && view.height ? { x: bounds.left + projected.x * bounds.width / view.width, y: bounds.top + projected.y * bounds.height / view.height } : null;
      const overlayClient = overlayBounds ? { x: overlayBounds.left + overlayBounds.width / 2, y: overlayBounds.top + overlayBounds.height / 2 } : null;
      const css = host && typeof getComputedStyle === 'function' ? getComputedStyle(host) : null;
      this.lastHover = { timestamp: new Date().toISOString(), imageId: id, viewType: view.type, zoom: finite(view.zoom), rotation: finite(view.rotation), heading: finite(view.camera?.heading), tilt: finite(view.camera?.tilt),
        sourceZoom: context.sourceZoom, closeZoom: context.closeZoom, hybrid: { ready: context.hybridReady, visible: context.hybridVisible, fallback: context.hybridFallback }, nativeStyle, cached,
        pointerClient, pickerPixel: pixel({ x: attributes.turbo_screen_x, y: attributes.turbo_screen_y }), projectedPixel: projected,
        container: bounds ? { left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height, clientWidth: host.clientWidth, clientHeight: host.clientHeight, viewWidth: view.width, viewHeight: view.height, position: css?.position, transform: css?.transform } : null,
        overlayClientCenter: overlayClient, projectedClientEstimate: expectedClient, overlayMinusProjectedClientEstimate: delta(overlayClient, expectedClient),
        interpretation: 'Cyan is a native style for this exact ID. Its rendered center is a visual observation, not measured by this report. Missing cyan does not prove an offset. Client estimate may include container borders/padding.' };
      console.info('[Mapillary alignment] Comparison ready. Cyan = native image; brown = existing hover. Use window.__mlyCoverageAlignment.report().');
    } catch (error) {
      if (this.current(target, revision) && !signal.aborted) this.lastHover = { imageId: id, status: 'unavailable', errorName: String((error as any)?.name || 'Error'), reason: 'Cached comparison could not complete; normal picking is unchanged.' };
    } finally {
      if (this.target === target && !this.current(target, revision)) this.clearHover();
    }
  }

  /** Query only the coverage layer and retain only safe ID/style/geometry fields. */
  private async inspectNativeHit(context: AlignmentContext, point: Pixel, revision: number): Promise<void> {
    if (this.nativeFlight) {
      this.lastNativeHit = { timestamp: new Date().toISOString(), viewType: context.view.type, zoom: finite(context.view.zoom),
        status: 'busy', pointerPixel: point, reason: 'A previous native SDK hit test is still pending; no additional query was started.' };
      return;
    }
    let timer: ReturnType<typeof setTimeout> | null = null;
    let result: Json;
    try {
      const request = Promise.resolve(context.view.hitTest(point, { include: [context.layer] }));
      this.nativeFlight = request;
      // A timeout cannot cancel SDK work. Keep its slot occupied until it actually
      // settles, so repeated pointer dwells never accumulate native hit tests.
      const release = () => { if (this.nativeFlight === request) this.nativeFlight = null; };
      void request.then(release, release);
      const response: any = await Promise.race([
        request,
        new Promise((_, reject) => { timer = setTimeout(() => { const error = new Error(); error.name = 'DiagnosticTimeout'; reject(error); }, 1500); }),
      ]);
      const hits = (response?.results || []).filter((hit: any) => hit.type !== 'ground' &&
        (hit.layer === context.layer || hit.graphic?.layer === context.layer || (!hit.layer && !hit.graphic?.layer)));
      result = { status: 'completed', pointerPixel: point, results: hits.slice(0, 12).map((hit: any) => {
        const graphic = hit.graphic, attributes = graphic?.attributes || {};
        const ids: Json = {};
        for (const key of ['id', 'image_id', 'sequence_id']) if (typeof attributes[key] === 'string' || typeof attributes[key] === 'number') ids[key] = attributes[key];
        return { type: hit.type, layerAssociation: hit.layer === context.layer || graphic?.layer === context.layer ? 'coverage' : 'not-exposed',
          origin: graphic?.origin ? { layerId: graphic.origin.layerId, layerIndex: graphic.origin.layerIndex } : null, ids,
          geometryType: graphic?.geometry?.type || null, pointPixel: graphic?.geometry?.type === 'point' ? pixel(context.view.toScreen(graphic.geometry)) : null };
      }), truncated: hits.length > 12, note: 'No hit or a style-only hit does not establish missing coverage. SDK support differs by view and style type.' };
    } catch (error) { const name = String((error as any)?.name || 'Error'); result = { status: name === 'DiagnosticTimeout' ? 'timed-out' : 'unavailable', pointerPixel: point, errorName: name }; }
    finally { if (timer) clearTimeout(timer); }
    const active = this.host.read();
    if (this.enabled && !this.disposed && revision === this.pointerRevision && active?.view === context.view && active?.layer === context.layer && active?.revision === context.revision) this.lastNativeHit = { timestamp: new Date().toISOString(), viewType: context.view.type, zoom: finite(context.view.zoom), ...result };
  }
}
