import { Place, PlaceBbox, PlaceGroup, PLACE_GROUPS, PLACES_LIMITS, normalizePlaces, placesBytes } from './placesModel';
export interface PlacesView { token: object; bbox: PlaceBbox | null; zoom: number; stationary: boolean; }
export interface PlacesState { kind: 'off' | 'paused' | 'zoom' | 'loading' | 'ready' | 'error'; count: number; limited?: boolean; reason?: string; }
export interface PlacesHost {
  view(): PlacesView | null;
  busy(): boolean;
  pauseReason?(): string;
  query(bbox: PlaceBbox, group: PlaceGroup, signal: AbortSignal): Promise<{ features: any[]; limited: boolean }>;
  display(places: Place[], view: object): void;
  visible(value: boolean): void;
  clear(): void;
  status(value: PlacesState): void;
  timer(work: () => void, ms: number): any;
  cancelTimer(handle: any): void;
  idle(work: () => void): any;
  cancelIdle(handle: any): void;
  now(): number;
}
/** Default-off, one physical request, bounded cache and no polling or animation loop. */
export class PlacesController {
  private enabled = false;
  private disposed = false;
  private group: PlaceGroup = 'all';
  private revision = 0;
  private desired = '';
  private displayedView: object | null = null;
  private pendingTimer: any = null;
  private pendingIdle: any = null;
  private physical: Promise<void> | null = null;
  private abort: AbortController | null = null;
  private cache = new Map<string, { places: Place[]; limited: boolean; bytes: number; at: number }>();
  private bytes = 0;
  private lastStatus = '';
  constructor(private host: PlacesHost) {}
  get stats() { return { cacheBytes: this.bytes, entries: this.cache.size, active: !!this.physical, enabled: this.enabled }; }
  setEnabled(enabled: boolean): void {
    if (this.disposed || this.enabled === enabled) return;
    this.enabled = enabled; this.invalidate(); this.desired = '';
    if (!enabled) { this.host.clear(); this.cache.clear(); this.bytes = 0; this.displayedView = null; this.status({ kind: 'off', count: 0 }); }
    else this.sync();
  }
  setGroup(group: PlaceGroup): void {
    if (this.disposed || !PLACE_GROUPS.includes(group) || this.group === group) return;
    this.group = group; this.desired = ''; this.invalidate(); this.host.clear(); this.sync();
  }
  retry(): void { if (this.disposed || !this.enabled) return; this.desired = ''; this.invalidate(); this.sync(); }
  sync(): void {
    if (this.disposed || !this.enabled) return;
    const view = this.host.view();
    if (!view?.bbox || view.zoom + .0001 < PLACES_LIMITS.minZoom) {
      this.invalidate(); this.desired = ''; this.host.visible(false); this.status({ kind: 'zoom', count: 0 }); return;
    }
    if (this.displayedView && this.displayedView !== view.token) { this.invalidate(); this.desired = ''; this.host.clear(); this.displayedView = null; }
    this.host.visible(true);
    if (this.host.busy() || !view.stationary) { this.invalidate(); this.desired = ''; this.status({ kind: 'paused', count: 0, reason: this.host.busy() ? this.host.pauseReason?.() || 'Places will update when browsing pauses.' : 'Stop moving the map to load nearby places.' }); return; }
    const bbox = view.bbox;
    const key = JSON.stringify([this.group, ...bbox.map(n => n.toFixed(6))]);
    if (this.desired === key) return;
    this.invalidate(); this.desired = key;
    const cached = this.cache.get(key);
    if (cached && this.host.now() - cached.at <= PLACES_LIMITS.cacheTtlMs) {
      this.cache.delete(key); this.cache.set(key, cached); this.displayedView = view.token;
      this.host.display(cached.places, view.token); this.status({ kind: 'ready', count: cached.places.length, limited: cached.limited }); return;
    }
    const revision = this.revision, token = view.token;
    this.status({ kind: 'paused', count: 0, reason: 'Preparing nearby places…' });
    this.pendingTimer = this.host.timer(() => {
      this.pendingTimer = null;
      this.pendingIdle = this.host.idle(() => {
        this.pendingIdle = null;
        if (!this.current(revision, token)) return;
        if (this.physical) { this.desired = ''; return; }
        this.start(key, bbox, token, revision);
      });
    }, PLACES_LIMITS.debounceMs);
  }
  private current(revision: number, view: object): boolean {
    return !this.disposed && this.enabled && revision === this.revision && this.host.view()?.token === view && !this.host.busy() && !!this.host.view()?.stationary;
  }
  private start(key: string, bbox: PlaceBbox, token: object, revision: number): void {
    const controller = new AbortController(); this.abort = controller;
    this.status({ kind: 'loading', count: 0 });
    const timeout = this.host.timer(() => { if (this.current(revision, token)) this.status({ kind: 'error', count: 0 }); controller.abort(); }, PLACES_LIMITS.timeoutMs);
    const task = (async () => {
      try {
        const page = await this.host.query(bbox, this.group, controller.signal);
        if (controller.signal.aborted || !this.current(revision, token)) return;
        const places = normalizePlaces(page.features, bbox, this.group);
        const bytes = placesBytes(places);
        if (bytes <= PLACES_LIMITS.cacheBytes) {
          const prior = this.cache.get(key); if (prior) { this.bytes -= prior.bytes; this.cache.delete(key); }
          while (this.cache.size && (this.bytes + bytes > PLACES_LIMITS.cacheBytes || this.cache.size >= PLACES_LIMITS.cacheEntries)) {
            const first = this.cache.keys().next().value as string; this.bytes -= this.cache.get(first)!.bytes; this.cache.delete(first);
          }
          this.cache.set(key, { places, limited: page.limited, bytes, at: this.host.now() }); this.bytes += bytes;
        }
        this.displayedView = token; this.host.display(places, token);
        this.status({ kind: 'ready', count: places.length, limited: page.limited });
      } catch (error) {
        if (!controller.signal.aborted && this.current(revision, token)) this.status({ kind: 'error', count: 0 });
      } finally { this.host.cancelTimer(timeout); }
    })();
    this.physical = task;
    void task.finally(() => {
      if (this.physical === task) this.physical = null;
      if (this.abort === controller) this.abort = null;
      // A superseding view/filter may have waited for an abort-ignoring transport.
      if (!this.disposed && this.enabled && revision !== this.revision) { this.desired = ''; this.sync(); }
    });
  }
  private status(value: PlacesState): void { const key = JSON.stringify(value); if (key !== this.lastStatus) { this.lastStatus = key; this.host.status(value); } }
  private invalidate(): void {
    ++this.revision;
    if (this.pendingTimer !== null) this.host.cancelTimer(this.pendingTimer);
    if (this.pendingIdle !== null) this.host.cancelIdle(this.pendingIdle);
    this.pendingTimer = this.pendingIdle = null;
    this.abort?.abort(); this.abort = null;
  }
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true; this.invalidate(); this.enabled = false; this.cache.clear(); this.bytes = 0; this.displayedView = null; this.host.clear();
  }
}
