import { Place, PlaceGroup, placesServiceUrl, PLACES_LIMITS } from './placesModel';
import { PlacesController, PlacesState, PlacesView } from './PlacesController';
const FIELDS = ['gers_id', 'place_name', 'category', 'place_group', 'confidence', 'address', 'website', 'data_release'];
/** The service FeatureLayer is query-only; only bounded local Graphics reach the map. */
export class ArcGISPlaces {
  private service: any = null;
  private graphics: any = null;
  private ownerView: any = null;
  private records = new Map<string, Place>();
  private handles: { remove(): void }[] = [];
  private attribution: HTMLDivElement | null = null;
  private disposed = false;
  private popupContent: HTMLDivElement | null = null;
  readonly controller: PlacesController;
  constructor(private host: {
    id: string; url: string; modules: any; view(): any; geographic(extent: any): any;
    busy(): boolean; pauseReason?(): string; status(state: PlacesState): void; explore(place: Place): void;
  }) {
    const url = placesServiceUrl(host.url);
    if (!url) throw new Error('Invalid Places service URL');
    this.controller = new PlacesController({
      view: () => this.snapshot(), busy: host.busy, pauseReason: host.pauseReason,
      query: async (bbox, group, signal) => {
        if (!this.service) this.service = new host.modules.FeatureLayer({ url, outFields: FIELDS, popupEnabled: false });
        const service = this.service;
        try {
          await service.load({ signal });
          if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
          if (!FIELDS.every(name => service.fields.some((field: any) => field.name === name))) throw new Error('Places service schema mismatch');
          const where = `confidence >= 0.95${group === 'all' ? '' : ` AND place_group = '${group}'`}`;
          const page = await service.queryFeatures({ where, geometry: { type: 'extent', xmin: bbox[0], ymin: bbox[1], xmax: bbox[2], ymax: bbox[3], spatialReference: { wkid: 4326 } },
            spatialRelationship: 'intersects', outFields: FIELDS, returnGeometry: true, outSpatialReference: { wkid: 4326 }, num: PLACES_LIMITS.maxFeatures,
            ...(service.capabilities?.query?.supportsOrderBy === false ? {} : { orderByFields: ['confidence DESC', 'gers_id ASC'] }) }, { signal });
          return { features: (page.features || []).slice(0, PLACES_LIMITS.maxFeatures), limited: !!page.exceededTransferLimit || page.features?.length >= PLACES_LIMITS.maxFeatures };
        } catch (error) {
          if (service.loadStatus === 'failed' && this.service === service) { this.service = null; service.destroy(); }
          throw error;
        }
      },
      display: (places, view) => this.display(places, view),
      visible: visible => { if (this.graphics) this.graphics.visible = visible; if (this.attribution) this.attribution.hidden = !visible; },
      clear: () => this.clear(), status: host.status,
      timer: (work, ms) => setTimeout(work, ms), cancelTimer: handle => clearTimeout(handle),
      idle: work => typeof window.requestIdleCallback === 'function' ? { idle: true, id: window.requestIdleCallback(work, { timeout: 1500 }) } : { idle: false, id: setTimeout(work, 0) },
      cancelIdle: handle => { if (handle.idle) window.cancelIdleCallback(handle.id); else clearTimeout(handle.id); }, now: () => Date.now(),
    });
    this.watchView();
    document.addEventListener('visibilitychange', this.visibility);
  }
  private watchView(): void {
    this.handles.forEach(handle => handle.remove()); this.handles = [];
    const view = this.host.view();
    if (view) this.handles.push(view.watch(['stationary', 'zoom', 'extent'], () => this.controller.sync()));
  }
  rebindView(): void { this.clear(); this.watchView(); this.controller.sync(); }
  private visibility = () => this.controller.sync();
  private snapshot(): PlacesView | null {
    const view = this.host.view();
    if (!view?.map || view.destroyed || !view.ready) return null;
    let extent = view.extent;
    if (extent && !extent.spatialReference?.isGeographic) extent = extent.spatialReference?.isWebMercator ? this.host.geographic(extent) : null;
    const valid = extent && [extent.xmin, extent.ymin, extent.xmax, extent.ymax].every(Number.isFinite) && extent.xmin >= -180 && extent.xmax <= 180 && extent.xmin < extent.xmax && extent.ymin < extent.ymax && extent.ymin >= -85.051129 && extent.ymax <= 85.051129;
    return { token: view, bbox: valid ? [extent.xmin, extent.ymin, extent.xmax, extent.ymax] : null, zoom: view.zoom, stationary: view.stationary !== false };
  }
  private display(places: Place[], view: any): void {
    if (this.disposed || this.host.view() !== view || this.host.busy() || view.destroyed) return;
    if (this.ownerView !== view || !this.graphics) {
      this.clear(); this.ownerView = view;
      this.graphics = new this.host.modules.GraphicsLayer({ id: `overture-places-${this.host.id}`, title: 'Nearby places · Overture', listMode: 'hide', elevationInfo: { mode: 'on-the-ground' } });
      view.map.add(this.graphics, 0);
      this.attribution = document.createElement('div');
      this.attribution.className = 'esri-widget'; this.attribution.style.cssText = 'padding:2px 5px;font-size:10px;background:#182b23dd;color:#e4e9de';
      const link = document.createElement('a'); link.textContent = 'Places · Overture Maps'; link.href = 'https://docs.overturemaps.org/attribution/'; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.style.color = 'inherit';
      this.attribution.appendChild(link); view.ui.add(this.attribution, 'bottom-left');
    }
    const symbol = new this.host.modules.SimpleMarkerSymbol({ style: 'circle', size: 6, color: [232, 218, 176, .95], outline: { color: [45, 66, 51], width: 1 } });
    const graphics = places.map(p => new this.host.modules.Graphic({ geometry: new this.host.modules.Point({ longitude: p.lon, latitude: p.lat, spatialReference: { wkid: 4326 } }), symbol, attributes: { place_id: p.id } }));
    this.records = new Map(places.map(p => [p.id, p]));
    this.graphics.removeAll(); this.graphics.addMany(graphics);
  }
  get hoverLayer(): any { return !this.host.busy() && this.graphics?.visible && this.records.size ? this.graphics : null; }
  hit(results: any[]): Place | null {
    if (!this.hoverLayer) return null;
    for (const hit of results) if ((hit.layer || hit.graphic?.layer) === this.graphics) {
      const place = this.records.get(hit.graphic?.attributes?.place_id); if (place) return place;
    }
    return null;
  }
  open(results: any[]): boolean {
    const place = this.hit(results), view = this.host.view();
    if (!place || !view) return false;
    const content = document.createElement('div');
    const name = document.createElement('strong'); name.textContent = place.name; content.appendChild(name);
    for (const text of [place.category.replace(/_/g, ' '), place.address]) if (text) { const line = document.createElement('p'); line.textContent = text; content.appendChild(line); }
    if (place.website) { const link = document.createElement('a'); link.textContent = 'Website'; link.href = place.website; link.target = '_blank'; link.rel = 'noopener noreferrer'; content.appendChild(link); }
    const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Explore nearby imagery'; button.style.cssText = 'display:block;margin-top:10px;padding:7px 9px;cursor:pointer'; button.onclick = () => this.host.explore(place); content.appendChild(button);
    const source = document.createElement('p'); source.textContent = `Overture Maps${place.release ? ' · ' + place.release : ''}. Imagery may be near this place rather than at its entrance.`; source.style.fontSize = '11px'; content.appendChild(source);
    this.popupContent = content;
    view.openPopup({ title: 'Nearby place', content, location: new this.host.modules.Point({ longitude: place.lon, latitude: place.lat, spatialReference: { wkid: 4326 } }) });
    return true;
  }
  private clear(): void {
    if (!this.ownerView?.destroyed && this.popupContent && this.ownerView?.popup?.content === this.popupContent) this.ownerView.closePopup();
    this.popupContent = null;
    if (this.attribution) { if (!this.ownerView?.destroyed) this.ownerView?.ui?.remove(this.attribution); this.attribution.remove(); this.attribution = null; }
    if (this.graphics) { if (!this.ownerView?.destroyed) this.ownerView?.map?.remove(this.graphics); if (!this.graphics.destroyed) this.graphics.destroy(); this.graphics = null; }
    this.records.clear(); this.ownerView = null;
  }
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true; this.controller.dispose(); this.handles.forEach(h => h.remove()); this.handles = [];
    document.removeEventListener('visibilitychange', this.visibility);
    this.service?.destroy(); this.service = null;
  }
}
