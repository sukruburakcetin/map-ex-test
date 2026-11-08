import { significantPlaceMovement, PlaceSearchArea } from './placeSearchMovement';
import { outsidePublishedExtent } from './publishedPlacesExtent';
import { Place, PlaceBbox, PlaceGroup, PLACE_GROUPS, PLACES_LIMITS, normalizePlaces, placesBytes } from './placesModel';
export interface PlacesView { token: object; bbox: PlaceBbox | null; zoom: number; stationary: boolean; }
export interface PlacesState { kind: 'off' | 'paused' | 'zoom' | 'loading' | 'ready' | 'error' | 'outside' | 'search'; canSearch?:boolean; count: number; limited?: boolean; reason?: string; loadedCounts?: Partial<Record<PlaceGroup, number>>; }
export interface PlacesHost {
  manualSearch?:boolean;
  hybridSearch?:boolean;
  view(): PlacesView | null;
  busy(): boolean;
  pauseReason?(): string;
  extent?(): PlaceBbox | null;
  query(bbox: PlaceBbox, group: PlaceGroup, signal: AbortSignal): Promise<{ features: any[]; limited: boolean; outside?: boolean }>;
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
  private approved:{key:string;token:object;automatic?:boolean}|null=null;
  private loaded:{places:Place[];token:object;limited:boolean}|null=null;
  private lastReady:PlacesState|null=null;
  private filterDirty=false;
  private hybridArea:PlaceSearchArea|null=null;
  private autoUpdate:boolean;
  private displayedView: object | null = null;
  private requestedView: object | null = null;
  private pendingTimer: any = null;
  private pendingIdle: any = null;
  private physical: Promise<void> | null = null;
  private abort: AbortController | null = null;
  private cache = new Map<string, { places: Place[]; limited: boolean; bytes: number; at: number }>();
  private bytes = 0;
  private lastStatus = '';
  constructor(private host: PlacesHost) {this.autoUpdate=!!host.hybridSearch;}
  get stats() { return { cacheBytes: this.bytes, entries: this.cache.size, active: !!this.physical, enabled: this.enabled }; }
  setEnabled(enabled: boolean): void {
    if (this.disposed || this.enabled === enabled) return;
    this.enabled = enabled; this.invalidate(); this.desired = '';this.approved=null;
    if (!enabled) { this.hybridArea=null;this.loaded=null;this.lastReady=null;this.filterDirty=false;this.host.clear(); this.cache.clear(); this.bytes = 0; this.displayedView = null; this.requestedView = null; this.status({ kind: 'off', count: 0 }); }
    else this.sync();
  }
  setGroup(group: PlaceGroup): void {
    if (this.disposed || !PLACE_GROUPS.includes(group) || this.group === group) return;
    this.group = group;
    if(this.host.manualSearch){this.filterDirty=true;this.sync();return;}
    if (this.enabled) {
      const view = this.host.view(), cached = this.cache.get(this.desired);
      if (view?.bbox && view.zoom + .0001 >= PLACES_LIMITS.minZoom && this.desired === JSON.stringify(view.bbox.map(n => n.toFixed(6))) && view.token === this.displayedView && cached && view.stationary && !this.host.busy()) { this.show(cached.places, view.token, cached.limited); return; }
      this.sync();
    }
  }
  setAutoUpdate(value:boolean):void {
    if(this.disposed||this.autoUpdate===value)return;
    this.autoUpdate=value;
    // Retain a user-requested search; switching off only cancels automatic intent.
    if(this.approved?.automatic){this.invalidate();this.desired='';this.approved=null;}
    this.sync();
  }
  searchArea():void {
    if(this.disposed||!this.enabled)return;
    if(this.host.manualSearch)this.sync();
    const view=this.host.view();
    if(!view?.bbox||view.zoom+.0001<PLACES_LIMITS.minZoom||!view.stationary||this.host.busy()||outsidePublishedExtent(view.bbox,this.host.extent?.())){this.sync();return;}
    // One explicit intent for this map and extent; movement consumes it.
    if(this.approved&&this.desired&&this.physical&&this.abort&&!this.abort.signal.aborted)return;
    this.invalidate();this.desired='';this.approved={key:JSON.stringify(view.bbox.map(n=>n.toFixed(6))),token:view.token};this.sync();
  }
  retry(): void { if(this.host.manualSearch){this.searchArea();return;} if (this.disposed || !this.enabled) return; this.desired = ''; this.invalidate(); this.sync(); }
  sync(): void {
    if (this.disposed || !this.enabled) return;
    const view = this.host.view();
    if (view?.bbox && outsidePublishedExtent(view.bbox, this.host.extent?.())) {
      this.invalidate(); this.desired = '';this.approved=null; this.host.visible(false); this.status({ kind: 'outside', count: 0 }); return;
    }
    if (!view?.bbox || view.zoom + .0001 < PLACES_LIMITS.minZoom) {
      this.invalidate(); this.desired = '';this.approved=null; this.host.visible(false); this.status({ kind: 'zoom', count: 0 }); return;
    }
    if (this.displayedView && this.displayedView !== view.token) { this.invalidate(); this.desired = ''; this.host.clear(); this.displayedView = null;this.loaded=null;this.lastReady=null;this.approved=null; }
    this.host.visible(true);
    if(this.host.manualSearch){
      const key=JSON.stringify(view.bbox.map(n=>n.toFixed(6)));
      const available=view.stationary&&!this.host.busy();
      if(this.filterDirty&&available&&this.loaded?.token===view.token){
        this.filterDirty=false;this.show(this.loaded.places,view.token,this.loaded.limited);
        if(this.desired&&this.approved?.key===key&&this.approved.token===view.token){
          if(this.physical&&this.abort&&!this.abort.signal.aborted)this.status({kind:'loading',count:0});
          else if(this.pendingTimer!==null||this.pendingIdle!==null)this.status({kind:'paused',count:0,reason:'Preparing nearby places…'});
        }
      }
      if(this.autoUpdate&&available&&(!this.approved||this.approved.key!==key||this.approved.token!==view.token)&&
        significantPlaceMovement(this.hybridArea,{bbox:view.bbox,zoom:view.zoom,token:view.token})){
        this.approved={key,token:view.token,automatic:true};
      }
      if(!available||!this.approved||this.approved.key!==key||this.approved.token!==view.token){
        this.invalidate();this.desired='';this.approved=null;
        const reason=!view.stationary?(this.autoUpdate?'Places will update after the map settles.':'Stop moving the map, then search this area.'):this.host.busy()?(this.host.pauseReason?.()||'Finish the current activity before searching this area.'):this.loaded?.token===view.token?(this.autoUpdate?'Loaded results kept. Search this area to refresh.':'Loaded places are from the last search. Search this area to update them.'):(this.autoUpdate?'Search this area to try again.':'Move the map, then tap Search this area.');
        this.status({...this.lastReady,kind:'search',count:this.lastReady?.count||0,canSearch:available,reason});return;
      }
    }
    if (this.host.busy() || !view.stationary) { this.invalidate(); this.desired = ''; this.status({ kind: 'paused', count: 0, reason: this.host.busy() ? this.host.pauseReason?.() || 'Places will update when browsing pauses.' : 'Stop moving the map to load nearby places.' }); return; }
    const bbox = view.bbox;
    const key = JSON.stringify([...bbox.map(n => n.toFixed(6))]);
    if (this.desired === key && this.requestedView === view.token) return;
    this.invalidate(); this.desired = key; this.requestedView = view.token;
    const cached = this.cache.get(key);
    if (cached && this.host.now() - cached.at <= PLACES_LIMITS.cacheTtlMs) {
      this.cache.delete(key); this.cache.set(key, cached); this.displayedView = view.token;
      this.rememberArea(bbox,view.token);this.show(cached.places, view.token, cached.limited); return;
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
    const current=this.host.view();
    return !this.disposed && this.enabled && revision === this.revision && current?.token === view && !this.host.busy() && !!current?.stationary &&
      (!this.host.manualSearch||!!current.bbox&&this.approved?.token===view&&this.approved.key===JSON.stringify(current.bbox.map(n=>n.toFixed(6))));
  }
  private start(key: string, bbox: PlaceBbox, token: object, revision: number): void {
    const controller = new AbortController(); this.abort = controller;
    this.status({ kind: 'loading', count: 0 });
    const timeout = this.host.timer(() => { if (this.current(revision, token)) {this.rememberArea(bbox,token);this.status({ kind: 'error', count: 0 });} controller.abort(); }, PLACES_LIMITS.timeoutMs);
    const task = (async () => {
      try {
        const page = await this.host.query(bbox, 'all', controller.signal);
        if (controller.signal.aborted || !this.current(revision, token)) return;
        if (page.outside) { this.host.visible(false); this.status({ kind: 'outside', count: 0 }); return; }
        const places = normalizePlaces(page.features, bbox, 'all');
        const bytes = placesBytes(places);
        if (bytes <= PLACES_LIMITS.cacheBytes) {
          const prior = this.cache.get(key); if (prior) { this.bytes -= prior.bytes; this.cache.delete(key); }
          while (this.cache.size && (this.bytes + bytes > PLACES_LIMITS.cacheBytes || this.cache.size >= PLACES_LIMITS.cacheEntries)) {
            const first = this.cache.keys().next().value as string; this.bytes -= this.cache.get(first)!.bytes; this.cache.delete(first);
          }
          this.cache.set(key, { places, limited: page.limited, bytes, at: this.host.now() }); this.bytes += bytes;
        }
        this.rememberArea(bbox,token);this.displayedView = token; this.show(places, token, page.limited);
      } catch (error) {
        if (!controller.signal.aborted && this.current(revision, token)) {this.rememberArea(bbox,token);this.status({ kind: 'error', count: 0 });}
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
  private rememberArea(bbox:PlaceBbox,token:object):void {
    if(this.host.manualSearch||this.host.hybridSearch)this.hybridArea={bbox:[...bbox] as PlaceBbox,zoom:this.host.view()?.zoom??0,token};
  }
  private show(places: Place[], token: object, limited: boolean): void {
    this.loaded={places,token,limited};
    const loadedCounts: Partial<Record<PlaceGroup, number>> = { all: places.length };
    for (const group of PLACE_GROUPS) if (group !== 'all') loadedCounts[group] = 0;
    for (const place of places) loadedCounts[place.group as PlaceGroup] = (loadedCounts[place.group as PlaceGroup] || 0) + 1;
    const filtered = this.group === 'all' ? places : places.filter(place => place.group === this.group);
    this.host.display(filtered, token);
    this.lastReady={kind:'ready',count:filtered.length,limited,loadedCounts};this.status(this.lastReady);
  }
  private status(value: PlacesState): void { if(this.host.manualSearch&&this.lastReady&&['loading','paused','error'].includes(value.kind))value={...this.lastReady,...value};const key = JSON.stringify(value); if (key !== this.lastStatus) { this.lastStatus = key; this.host.status(value); } }
  private invalidate(): void {
    ++this.revision;
    if (this.pendingTimer !== null) this.host.cancelTimer(this.pendingTimer);
    if (this.pendingIdle !== null) this.host.cancelIdle(this.pendingIdle);
    this.pendingTimer = this.pendingIdle = null;
    this.abort?.abort(); this.abort = null;
  }
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;this.hybridArea=null;this.approved=null;this.loaded=null;this.lastReady=null; this.invalidate(); this.enabled = false; this.cache.clear(); this.bytes = 0; this.displayedView = null; this.requestedView = null; this.host.clear();
  }
}
