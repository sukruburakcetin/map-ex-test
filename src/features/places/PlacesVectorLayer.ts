import { PortalPlacesSource, PortalPlaceFilters } from './PortalPlacesSource';
import { placesApiSibling, validatePlacesApiMetadata } from './placesApi';
import { isTileCategory } from './tileCategories';
import type { Place } from './placesModel';
import { BoundedPlaceHover } from './BoundedPlaceHover';
/** Native vector-tile adapter. Native tiles draw POIs; only a bounded click query reaches JS.
 * Picking is proximity-based, not proof that a collision-hidden tile symbol was rendered.
 */
export class PlaceTilesError extends Error { constructor(public code:'dense'|'pick'|'filter'|'source',message:string){super(message);this.name='PlaceTilesError';} }
export class PlacesVectorLayer {
  private replacing=false;
  get changing():boolean{return this.replacing;}
  private layer: any;
  private service: any;
  private movement: any;
  private abort: AbortController | null = null;
  private revision = 0;
  private source: { style: string; details: string } | null = null;
  private sourceAbort: AbortController | null = null;
  private hover = new BoundedPlaceHover<any>((screen, signal) => this.lookup(screen, signal, this.revision, false));
  constructor(private host: { portal?: PortalPlacesSource; id?:string;view: any; modules: any; sourceChanging?(preserveSelection?:boolean): void;loading?(active:boolean):void; sourceReady?(bbox: [number, number, number, number] | null): void; busy?(): boolean; selected(attributes: any, point: any): void; clearSelected?(): void; error(error: unknown): void }) {}

  get supportsFamilyFilter(): boolean { return this.source !== null; }
  get version(): number { return this.revision; }
  get visible(): boolean {
    return !!this.layer && this.layer.visible !== false && !this.host.view.destroyed &&
      !(Number.isFinite(this.host.view.zoom) && this.host.view.zoom < 12);
  }

  async start(styleUrl: string, detailsUrl: string, replace = false): Promise<void> {
    if (this.host.portal) { await this.startPortal(replace); return; }
    for (const value of [styleUrl, detailsUrl]) {
      const url = new URL(value);
      if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Use HTTPS endpoints without embedded credentials');
    }
    if ((new URL(styleUrl).origin!==new URL(detailsUrl).origin||!new URL(detailsUrl).pathname.endsWith('/query'))) throw new Error('Places tile and query endpoints must use the same origin and a query endpoint');
    if (!this.host.view?.ready || this.host.view.destroyed) throw new Error('Open a ready map first');
    if(!replace)this.stop();else{++this.revision;this.cancelPick();this.sourceAbort?.abort();}
    this.replacing=replace;this.host.loading?.(true);
    const source = { style: styleUrl, details: detailsUrl };
    const sourceAbort = this.sourceAbort = new AbortController();
    const { view, modules } = this.host, revision = this.revision;
    const baseId=this.host.id?'overture-places-'+encodeURIComponent(this.host.id):'overture-places';
    const layer = new modules.VectorTileLayer({ url: styleUrl, id: replace ? `${baseId}-${revision}` : baseId, title: 'Overture Places', listMode: 'hide' });
    const service = {
      queryFeatures: async (query: any, options: any) => {
        const firstLod=layer.tileInfo?.lods?.find((lod:any)=>lod.level===0);
        const sourceZoom=view.scale>0 && firstLod?.scale>0 ? Math.log2(firstLod.scale/view.scale) : view.zoom;
        const response = await fetch(detailsUrl, { method: 'POST', credentials:'omit', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ geometry: query.geometry,...(Number.isFinite(sourceZoom)?{zoom:Math.max(12,Math.min(22,Math.floor(sourceZoom+1e-8)))}:{}) }), signal: options.signal });
        if (!response.ok) throw new Error(`Places query failed (${response.status})`);
        const result = await response.json();
        if (!Array.isArray(result.features) || result.features.length > 32) throw new Error('Places query exceeded candidate limit');
        return { ...result, features: result.features.map((feature: any) => ({ ...feature, geometry: new modules.Point(feature.geometry) })) };
      },
    };
    try {
      let bounds: [number, number, number, number] | null = null;
      const metadata = this.host.sourceReady ? (async () => {
        const endpoint = new URL(placesApiSibling(detailsUrl,'status'));
        const response = await fetch(endpoint.toString(), { signal: sourceAbort.signal,credentials:'omit' });
        if (!response.ok) throw new Error('Places metadata could not load');
        bounds=validatePlacesApiMetadata(await response.json()).bbox;
      })() : Promise.resolve();
      await Promise.all([layer.load({signal:sourceAbort.signal}), metadata]);
      if (revision !== this.revision || view.destroyed || sourceAbort.signal.aborted) {layer.destroy();return;}
      layer.maxScale=0;
      const priorLayer=this.layer;
      view.map.add(layer);
      this.movement?.remove();this.movement=null;
      this.layer=layer;this.service=service;this.source=source;
      if(priorLayer){view.map.remove(priorLayer);priorLayer.destroy();}
      this.replacing=false;
      if(replace)this.host.sourceChanging?.(true);
      this.host.sourceReady?.(bounds);
      this.movement = view.watch('stationary', (stationary: boolean) => {
        if (!stationary) { this.abort?.abort(); this.hover.clear(); }
      });
    } catch (error) {
      if(this.layer!==layer){layer.destroy();}
      if(revision===this.revision){this.replacing=false;if(!replace)this.stop();this.host.error(new PlaceTilesError(replace?'filter':'source',String((error as Error)?.message||error)));}
      throw error;
    } finally {if(revision===this.revision){this.replacing=false;this.host.loading?.(false);}}
  }

  private async startPortal(replace: boolean, filters: PortalPlaceFilters = this.host.portal!.filters): Promise<void> {
    const portal = this.host.portal!, { view, modules } = this.host;
    if (!view?.ready || view.destroyed) throw Error('Open a ready map first');
    if (!replace) this.stop(); else { ++this.revision; this.cancelPick(); this.sourceAbort?.abort(); }
    this.replacing = replace; this.host.loading?.(true);
    const revision = this.revision, controller = this.sourceAbort = new AbortController();
    const base = this.host.id ? 'overture-places-' + encodeURIComponent(this.host.id) : 'overture-places';
    const layer = new modules.VectorTileLayer({ url:portal.tilesUrl, id:replace ? `${base}-${revision}` : base, title:'Overture Places', listMode:'hide' });
    try {
      await portal.configureLayer(layer, filters, controller.signal);
      if (revision !== this.revision || view.destroyed || controller.signal.aborted) { layer.destroy(); return; }
      const prior = this.layer;
      view.map.add(layer); this.layer = layer;
      this.service = { queryFeatures: async (query: any, options: any) => {
        const result = await portal.queryPick(query.geometry, options.signal, view);
        return { ...result, features:result.features.map((feature: any) => ({...feature,geometry:new modules.Point(feature.geometry)})) };
      } };
      this.source = { style:portal.tilesUrl, details:portal.queryUrl }; portal.filters = {...filters};
      this.movement?.remove();
      this.movement = view.watch('stationary',(stationary: boolean) => { if (!stationary) this.cancelPick(); });
      if (prior) { view.map.remove(prior); prior.destroy(); }
      this.replacing = false;
      if (replace) this.host.sourceChanging?.(true);
      this.host.sourceReady?.(portal.coverageExtent);
    } catch (error) {
      if (this.layer !== layer) layer.destroy();
      if (revision === this.revision) { this.replacing = false; if (!replace) this.stop(); this.host.error(new PlaceTilesError(replace ? 'filter' : 'source',String((error as Error)?.message || error))); }
      throw error;
    } finally { if (revision === this.revision) { this.replacing = false; this.host.loading?.(false); } }
  }

  setVisible(visible: boolean): void { if (this.layer) this.layer.visible = visible; }
  async setFamily(family: string): Promise<void> {
    if (!isTileCategory(family)) throw new Error('Invalid icon family');
    if (this.host.portal && this.source) return this.startPortal(true,{...this.host.portal.filters,family});
    const source = this.source;
    if (!source) return;
    const style = new URL(source.style), details = new URL(source.details);
    for (const url of [style, details]) { if (family === 'all') url.searchParams.delete('family'); else url.searchParams.set('family', family); }
    await this.start(style.toString(), details.toString(), true);
  }
  get quality(): { minimum: number | null; hideClosed: boolean } {
    if (this.host.portal) return { minimum:this.host.portal.filters.minimum,hideClosed:this.host.portal.filters.hideClosed };
    const params = this.source ? new URL(this.source.style).searchParams : new URLSearchParams();
    const value = params.get('min_confidence');
    return { minimum: value === null ? null : Number(value), hideClosed: params.get('hide_closed') === '1' };
  }
  async setQuality(minimum: number | null, hideClosed: boolean): Promise<void> {
    if (minimum !== null && (!Number.isFinite(minimum) || minimum < 0 || minimum > 1)) throw new Error('Invalid confidence threshold');
    if (this.host.portal && this.source) return this.startPortal(true,{...this.host.portal.filters,minimum,hideClosed});
    const source = this.source;
    if (!source) return;
    const style = new URL(source.style), details = new URL(source.details);
    for (const url of [style, details]) {
      if (minimum === null) url.searchParams.delete('min_confidence'); else url.searchParams.set('min_confidence', String(minimum));
      if (hideClosed) url.searchParams.set('hide_closed', '1'); else url.searchParams.delete('hide_closed');
    }
    await this.start(style.toString(), details.toString(), true);
  }
  async queryArea(bbox: readonly number[], signal: AbortSignal, origin?: { lon: number; lat: number } | null,offset=0,text=''): Promise<{ features: any[]; limited: boolean;offset:number }> {
    if(!Number.isSafeInteger(offset)||offset<0||offset>100000||offset%200)throw new Error('Invalid page offset');
    const source = this.source;
    if (!source) throw new Error('The Places area-query adapter is unavailable');
    if (this.host.portal) return this.host.portal.queryArea(bbox,signal,origin,offset,text);
    const endpoint = new URL(placesApiSibling(source.details,'search'));
    const response = await fetch(endpoint.toString(), { method: 'POST', credentials:'omit', headers: { 'Content-Type': 'application/json' }, signal,
      body: JSON.stringify({ offset, text, origin: origin || undefined, geometry: { xmin: bbox[0], ymin: bbox[1], xmax: bbox[2], ymax: bbox[3], spatialReference: { wkid: 4326 } } }) });
    if (!response.ok) throw new Error(`Places area query failed (${response.status})`);
    const result = await response.json();
    if (!Array.isArray(result.features) || result.features.length > 200) throw new Error('Places area query exceeded its limit');
    if(result.offset!==undefined&&result.offset!==offset)throw new Error('Places area query returned the wrong page');
    return { features: result.features, limited: !!result.exceededTransferLimit,offset };
  }

  matches(place:Place):boolean {
    if(!this.source)return true;
    const p=new URL(this.source.style).searchParams,family=this.host.portal?.filters.family || p.get('family')||'all',quality=this.quality;
    return (family==='all'||place.group===family)&&
      (quality.minimum===null||place.confidence!==null&&place.confidence>=quality.minimum)&&(!quality.hideClosed||place.operatingStatus!=='permanently_closed');
  }
  cancelHover(): void { this.hover.clear(); }
  resolveHover(screen: { x: number; y: number }, signal: AbortSignal): Promise<any | null> {
    if (!this.visible || this.host.busy?.()) return Promise.resolve(null);
    return this.hover.lookup(screen, signal);
  }
  cancelPick(): void { this.abort?.abort(); this.hover.clear(); }
  async pick(screen: { x: number; y: number }): Promise<void> {
    const hit = await this.resolve(screen);
    if (hit) this.host.selected(hit.attributes, hit.geometry);
  }
  async resolve(screen: { x: number; y: number }): Promise<any | null> {
    this.cancelPick();
    const controller = this.abort = new AbortController();
    try{return await this.lookup(screen, controller.signal, this.revision);}catch(error){if(!controller.signal.aborted)this.host.error(new PlaceTilesError('pick',String((error as Error)?.message||error)));throw error;}
  }
  private async lookup(screen: { x: number; y: number }, signal: AbortSignal, revision: number, reportDense = true): Promise<any | null> {
    const { view } = this.host;
    if (signal.aborted || revision !== this.revision || !this.visible || !this.service || view.destroyed || !view.stationary || this.host.busy?.()) return null;
    const point = view.toMap(screen);
    if (!point) return null;
    // Derive a map-space search envelope from screen pixels; works in MapView and SceneView.
    const radius=24;
    const corners = [[-radius,-radius],[radius,-radius],[radius,radius],[-radius,radius]].map(([x,y]) => view.toMap({ x: screen.x+x, y: screen.y+y }));
    if (corners.some(p => !p || !Number.isFinite(p.x) || !Number.isFinite(p.y))) return null;
    const geometry = { type: 'extent', xmin: Math.min(...corners.map(p=>p.x)), ymin: Math.min(...corners.map(p=>p.y)), xmax: Math.max(...corners.map(p=>p.x)), ymax: Math.max(...corners.map(p=>p.y)), spatialReference: point.spatialReference };
    const controller = new AbortController();
    const cancel = () => controller.abort(); signal.addEventListener('abort', cancel, { once: true });
    if (signal.aborted) controller.abort();
    const timeout = setTimeout(cancel, 1500);
    let page: any;
    try { page = await this.service.queryFeatures({ where: '1=1', geometry, spatialRelationship: 'intersects', outFields: ['*'], returnGeometry: true, num: 32 }, { signal: controller.signal }); }
    finally { clearTimeout(timeout); signal.removeEventListener('abort', cancel); }
    if (controller.signal.aborted || revision !== this.revision || view.destroyed || !view.stationary || this.host.busy?.()) return null;
    // Never claim a nearest result when the server truncated the candidates.
    if (page.exceededTransferLimit || page.features?.length > 32) { if (reportDense) this.host.error(new PlaceTilesError('dense','Too many nearby candidates; zoom in to select a place')); return null; }
    let nearest: any = null, distance = radius * radius;
    const nearby: any[] = [];
    for (const feature of page.features || []) {
      if (!feature.attributes?.gers_id || !feature.geometry) continue;
      const pixel = view.toScreen(feature.geometry);
      if (!pixel || !Number.isFinite(pixel.x) || !Number.isFinite(pixel.y)) continue;
      const squared = (pixel.x-screen.x)**2 + (pixel.y-screen.y)**2;
      if(squared>(feature.attributes.cluster_count>=1?24*24:12*12))continue;
      nearby.push(feature);
      if (squared < distance) { distance = squared; nearest = feature; }
    }
    return nearest ? { attributes: nearest.attributes, geometry: nearest.geometry, candidates: nearby } : null;
  }

  stop(): void {
    this.replacing=false;this.host.loading?.(false);
    ++this.revision;
    this.hover.clear();
    this.sourceAbort?.abort(); this.sourceAbort = null; this.source = null;
    this.host.sourceChanging?.();
    this.host.clearSelected?.();
    this.abort?.abort(); this.abort = null;
    this.movement?.remove(); this.movement = null;
    if (this.layer) { if (!this.host.view.destroyed) this.host.view.map?.remove(this.layer); this.layer.destroy(); this.layer = null; }
    this.service = null;
  }
}
