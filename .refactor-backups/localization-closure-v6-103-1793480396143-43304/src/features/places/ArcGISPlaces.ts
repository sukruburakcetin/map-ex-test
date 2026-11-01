import { PlacePopupFocus } from './PlacePopupFocus';
import { groupOverlappingPlaces, placeCountSymbol, PlaceGroupMarker } from './overlappingPlaces';
import { publishedPlacesExtent, outsidePublishedExtent } from './publishedPlacesExtent';
import { PLACE_POPUP_CSS } from './placePopupStyles';
import { placeCategoryIcon, placeCategorySymbol, PLACE_ICON_RADIUS } from './placeIcons';
import { SelectedPlace } from './SelectedPlace';
import { PlaceImagery, placeImageryDirectionLabel, placeImageryChoiceMeta } from './nearbyPlaceImagery';
import { Place, PlaceGroup, PlaceBbox, placesServiceUrl, PLACES_LIMITS } from './placesModel';
import { PlacesController, PlacesState, PlacesView } from './PlacesController';
const FIELDS = ['gers_id', 'place_name', 'category', 'place_group', 'confidence', 'address', 'website', 'data_release'];
/** The service FeatureLayer is query-only; only bounded local Graphics reach the map. */
export class ArcGISPlaces {
  private service: any = null;
  private published: PlaceBbox | null = null;
  get stats() { return { ...this.controller.stats, loaded: this.records.size, rendered: this.graphics?.graphics?.length ?? 0, overlapGroups: this.groups.size, cachedSymbols: this.iconSymbols.size + this.countSymbols.size, selection: this.selection.stats }; }
  get coverageExtent(): PlaceBbox | null { return this.published; }
  private graphics: any = null;
  private ownerView: any = null;
  private records = new Map<string, Place>();
  private listedPlaces: readonly Place[] = [];
  private listVisible = true;
  private hovered: { id: string; graphic: any; symbol: any } | null = null;
  private groupingKey = '';
  private groups = new Map<string, PlaceGroupMarker>();
  private memberGroups = new Map<string, string>();
  private countSymbols = new Map<number, any>();
  private iconSymbols = new Map<string, any>();
  private handles: { remove(): void }[] = [];
  private attribution: HTMLDivElement | null = null;
  private disposed = false;
  private searchAbort: AbortController | null = null;
  private popupFocus = new PlacePopupFocus();
  private popupView: any = null;
  private popupContent: HTMLDivElement | null = null;
  readonly selection: SelectedPlace;
  readonly controller: PlacesController;
  constructor(private host: {
    id: string; url: string; modules: any; view(): any; geographic(extent: any): any;
    list?(places: readonly Place[]): void; selected?(place: Place | null): void; busy(): boolean; pauseReason?(): string; status(state: PlacesState): void; explore(place: Place, radius: number, signal: AbortSignal): Promise<PlaceImagery[]>; openImagery(image: PlaceImagery): void;
  }) {
    const url = placesServiceUrl(host.url);
    if (!url) throw new Error('Invalid Places service URL');
    this.selection = new SelectedPlace({ id: host.id, modules: host.modules, view: host.view, changed: host.selected });
    this.controller = new PlacesController({
      view: () => this.snapshot(), extent: () => this.published, busy: host.busy, pauseReason: host.pauseReason,
      query: async (bbox, group, signal) => {
        this.regroup();
        if (!this.service) this.service = new host.modules.FeatureLayer({ url, outFields: FIELDS, popupEnabled: false });
        const service = this.service;
        try {
          await service.load({ signal });
          if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
          if (!FIELDS.every(name => service.fields.some((field: any) => field.name === name))) throw new Error('Places service schema mismatch');
          this.published = publishedPlacesExtent(service.fullExtent, host.geographic);
          if (outsidePublishedExtent(bbox, this.published)) return { features: [], limited: false, outside: true };
          const where = `confidence >= 0.95${group === 'all' ? '' : ` AND place_group = '${group}'`}`;
          const page = await service.queryFeatures({ where, geometry: { type: 'extent', xmin: bbox[0], ymin: bbox[1], xmax: bbox[2], ymax: bbox[3], spatialReference: { wkid: 4326 } },
            spatialRelationship: 'intersects', outFields: FIELDS, returnGeometry: true, outSpatialReference: { wkid: 4326 }, num: PLACES_LIMITS.maxFeatures,
            ...(service.capabilities?.query?.supportsOrderBy === false ? {} : { orderByFields: ['confidence DESC', 'gers_id ASC'] }) }, { signal });
          return { features: (page.features || []).slice(0, PLACES_LIMITS.maxFeatures), limited: !!page.exceededTransferLimit || page.features?.length >= PLACES_LIMITS.maxFeatures };
        } catch (error) {
          if (service.loadStatus === 'failed' && this.service === service) { this.service = null; this.published = null; service.destroy(); }
          throw error;
        }
      },
      display: (places, view) => this.display(places, view),
      visible: visible => {
        if (!visible) this.setHover(null);
        if (this.graphics) this.graphics.visible = visible; if (this.attribution) this.attribution.hidden = !visible;
        if (this.listVisible !== visible) { this.listVisible = visible; this.host.list?.(visible ? this.listedPlaces : []); }
      },
      clear: () => this.clear(), status: state => { if (state.kind !== 'ready') this.setHover(null); host.status(state); },
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
  rebindView(): void { this.clear(); this.selection.rebind(); this.watchView(); this.controller.sync(); }
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
      this.attribution.className = 'esri-widget'; this.attribution.style.cssText = 'box-sizing:border-box;margin-right:clamp(34px,3vw,42px);max-width:min(180px,40vw);padding:3px 6px;font-size:10px;line-height:1.3;white-space:normal;overflow-wrap:break-word;text-align:right;border-radius:3px;background:#182b23dd;color:#e4e9de';
      const link = document.createElement('a'); link.textContent = 'Places · Overture Maps'; link.href = 'https://docs.overturemaps.org/attribution/'; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.style.color = 'inherit';
      this.attribution.appendChild(link); view.ui.add(this.attribution, 'bottom-right');
    }
    this.setHover(null);
    this.records = new Map(places.map(p => [p.id, p]));
    this.listedPlaces = places;
    this.regroup();
    if (this.listVisible) this.host.list?.(places);
  }
  /** Runs only on the controller's idle query/display path, never pointer/animation events. */
  private regroup(): void {
    const view = this.host.view();
    if (this.disposed || !this.graphics || this.ownerView !== view || view?.destroyed || this.host.busy() || view.stationary === false) return;
    const groups = groupOverlappingPlaces(this.listedPlaces, p => view.toScreen(new this.host.modules.Point({ longitude: p.lon, latitude: p.lat, spatialReference: { wkid: 4326 } })));
    this.groups.clear(); this.memberGroups.clear();
    for (const group of groups) if (group.members.length > 1) { this.groups.set(group.id, group); for (const member of group.members) this.memberGroups.set(member.id, group.id); }
    const key = JSON.stringify(groups.map(group => group.members.map(p => [p.id, p.lon, p.lat, p.group])));
    if (key === this.groupingKey) return;
    this.groupingKey = key;
    const graphics = groups.map(group => {
      const p = group.anchor, count = group.members.length;
      const cached = count > 1 ? this.countSymbols.get(count) : this.iconSymbols.get(p.group);
      const graphic = new this.host.modules.Graphic({ geometry: new this.host.modules.Point({ longitude: p.lon, latitude: p.lat, spatialReference: { wkid: 4326 } }), symbol: cached || (count > 1 ? placeCountSymbol(count) : placeCategorySymbol(p.group)), attributes: { place_id: count > 1 ? group.id : p.id } });
      if (!cached) { if (count > 1) { if (this.countSymbols.size >= 32) this.countSymbols.delete(this.countSymbols.keys().next().value!); this.countSymbols.set(count, graphic.symbol); } else this.iconSymbols.set(p.group, graphic.symbol); }
      return graphic;
    });
    this.setHover(null);
    this.graphics.removeAll(); this.graphics.addMany(graphics);
  }
  private groupPlace(group: PlaceGroupMarker): Place { return { ...group.anchor, id: group.id, name: `${group.members.length} places here` }; }

  /** Reuse the existing marker; never mutate shared/cached symbols or selection. */
  setHover(id: string | null): void {
    if (this.hovered?.id === id) return;
    if (this.hovered) { this.hovered.graphic.symbol = this.hovered.symbol; this.hovered = null; }
    if (!id || this.disposed || this.host.busy() || !this.graphics?.visible || this.ownerView !== this.host.view() || this.ownerView?.destroyed || id === this.selection.place?.id) return;
    const graphic = this.graphics.graphics?.toArray?.().find((g: any) => g.attributes?.place_id === id);
    if (!graphic?.symbol || !Number.isFinite(graphic.symbol.width) || !Number.isFinite(graphic.symbol.height)) return;
    const original = graphic.symbol, symbol = original.clone ? original.clone() : { ...original };
    symbol.width += 3; symbol.height += 3;
    this.hovered = { id, graphic, symbol: original }; graphic.symbol = symbol;
  }
  hoverLabel(place: Place): string {
    const group = this.groups.get(place.id);
    return group ? `${group.members.length} places here · Click to choose` : `${place.name} · ${place.category.replace(/_/g, ' ')}`;
  }
  get hoverLayer(): any { return !this.host.busy() && this.graphics?.visible && this.records.size ? this.graphics : null; }
  hit(results: any[]): Place | null {
    const selected = this.selection.hit(results); if (selected) { const group = this.groups.get(this.memberGroups.get(selected.id) || ''); return group ? this.groupPlace(group) : selected; }
    // Opening already-loaded details is local work and remains available while imagery loads.
    if (this.disposed || !this.graphics?.visible || !this.records.size || this.ownerView !== this.host.view() || this.ownerView?.destroyed) return null;
    for (const hit of results) if ((hit.layer || hit.graphic?.layer) === this.graphics) {
      const id = hit.graphic?.attributes?.place_id, group = this.groups.get(id);
      if (group) return this.groupPlace(group);
      const place = this.records.get(id); if (place) return place;
    }
    return null;
  }
  /** Capture only the visible marker footprint, without another SDK hit test or request. */
  screenTarget(screen: { x: number; y: number }): string | null {
    const selected = this.selection.screenTarget(screen); if (selected) return this.memberGroups.get(selected) || selected;
    const view = this.host.view();
    if (this.disposed || !this.graphics?.visible || this.ownerView !== view || view?.destroyed || !Number.isFinite(screen.x) || !Number.isFinite(screen.y)) return null;
    let nearest: string | null = null, distance = PLACE_ICON_RADIUS * PLACE_ICON_RADIUS;
    for (const graphic of this.graphics.graphics?.toArray?.() || []) {
      const id = graphic.attributes?.place_id;
      if (!this.records.has(id) && !this.groups.has(id)) continue;
      const point = view.toScreen(graphic.geometry);
      if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) continue;
      const squared = (point.x - screen.x) ** 2 + (point.y - screen.y) ** 2;
      const radius = this.groups.has(id) ? 12 : PLACE_ICON_RADIUS;
      if (squared <= radius * radius && (nearest == null || squared <= distance)) { nearest = id; distance = squared; }
    }
    return nearest;
  }
  open(results: any[], targetId?: string | null): boolean {
    const view = this.host.view();
    const valid = !this.disposed && this.graphics?.visible && this.ownerView === view && !view?.destroyed;
    const group = valid ? this.groups.get(targetId || this.hit(results)?.id || '') : null;
    if (group) return this.openGroup(group, this.popupFocus.capture(view));
    const place = (valid && targetId ? this.records.get(targetId) : null) || (this.selection.place?.id === targetId ? this.selection.place : null) || this.hit(results);
    if (this.disposed || !place || !view || view.destroyed) return false;
    const origin = this.popupFocus.capture(view);
    this.setHover(null);
    this.selection.select(place);
    const content = document.createElement('div'); content.className = 'mly-place-popup';
    const name = document.createElement('strong'); name.className = 'mly-place-name'; name.textContent = place.name; content.appendChild(name);
    for (const [index, text] of [place.category.replace(/_/g, ' '), place.address].entries()) if (text) { const line = document.createElement('p'); line.className = index === 0 ? 'mly-place-category' : 'mly-place-address'; line.textContent = text; content.appendChild(line); }
    if (place.website) { const link = document.createElement('a'); link.className = 'mly-place-website'; link.textContent = 'Website'; link.href = place.website; link.target = '_blank'; link.rel = 'noopener noreferrer'; content.appendChild(link); }
    this.searchAbort?.abort(); this.searchAbort = null;
    const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Find imagery within 75 m'; button.className = 'mly-place-open mly-place-open-primary'; content.appendChild(button);
    const status = document.createElement('p'); status.setAttribute('role', 'status'); status.className = 'mly-place-meta'; content.appendChild(status);
    const alternatives = document.createElement('div'); content.appendChild(alternatives);
    const visibility = document.createElement('p'); visibility.className = 'mly-place-choice-note'; visibility.textContent = 'Direction is estimated. Visibility isn’t confirmed.'; visibility.hidden = true; content.appendChild(visibility);
    let radius = 75, candidate: PlaceImagery | null = null;
    const active = () => this.popupContent === content && this.popupView === view && !view.destroyed && view.popup?.content === content;
    button.onclick = async () => {
      if (!active() || button.disabled) return;
      if (candidate) { this.host.openImagery(candidate); return; }
      const controller = new AbortController(); this.searchAbort?.abort(); this.searchAbort = controller;
      button.disabled = true; status.textContent = `Looking within ${radius} m…`;
      try {
        const found = await this.host.explore(place, radius, controller.signal);
        if (controller.signal.aborted || !active()) return;
        if (found.length) {
          candidate = found[0]; button.textContent = `Suggested view · ${placeImageryDirectionLabel(candidate)}`;
          button.setAttribute('aria-label', `Open suggested view: ${placeImageryDirectionLabel(candidate)}. ${placeImageryChoiceMeta(candidate)}`);
          status.textContent = placeImageryChoiceMeta(candidate); status.className = 'mly-place-meta mly-place-choice-meta'; visibility.hidden = false;
          for (const image of found.slice(1, 3)) {
            const option = document.createElement('button'); option.type = 'button'; option.textContent = `Open view · ${placeImageryDirectionLabel(image)}`;
            option.setAttribute('aria-label', `Open view: ${placeImageryDirectionLabel(image)}. ${placeImageryChoiceMeta(image)}`);
            option.className = 'mly-place-open';
            option.onclick = () => { if (active()) this.host.openImagery(image); };
            const detail = document.createElement('p'); detail.textContent = placeImageryChoiceMeta(image); detail.className = 'mly-place-meta mly-place-choice-meta';
            alternatives.appendChild(option); alternatives.appendChild(detail);
          }
        } else if (radius === 75) {
          radius = 250; button.textContent = 'Search within 250 m';
          status.textContent = 'No nearby imagery found within 75 m. Search a wider area if you’d like.';
        } else {
          button.textContent = 'Search again · within 250 m'; status.textContent = 'No suitable imagery found within 250 m. Try another place or search again later.';
        }
      } catch (error) {
        if (!controller.signal.aborted && active()) { button.textContent = `Retry search · within ${radius} m`; status.textContent = 'Imagery search could not finish. Please try again.'; }
      } finally {
        button.disabled = false;
        if (this.searchAbort === controller) this.searchAbort = null;
      }
    };
    const source = document.createElement('p'); source.textContent = `Overture Maps${place.release ? ' · ' + place.release : ''}. Imagery may be near this place rather than at its entrance.`; source.className = 'mly-place-source'; content.appendChild(source);
    const style = document.createElement('style'); style.textContent = PLACE_POPUP_CSS; content.appendChild(style);
    this.popupContent = content; this.popupView = view;
    this.popupFocus.open(view, { title: 'Nearby place', content, location: new this.host.modules.Point({ longitude: place.lon, latitude: place.lat, spatialReference: { wkid: 4326 } }) }, origin);
    return true;
  }
  private openGroup(group: PlaceGroupMarker, origin: HTMLElement | null): boolean {
    const view = this.host.view(); if (!view || view.destroyed || this.disposed) return false;
    this.closeDetails();
    const content = document.createElement('div'); content.className = 'mly-place-popup';
    const heading = document.createElement('strong'); heading.textContent = `${group.members.length} places here`; content.appendChild(heading);
    const hint = document.createElement('p'); hint.textContent = 'Choose a place to see details.'; content.appendChild(hint);
    const list = document.createElement('div'); content.appendChild(list);
    const controls = document.createElement('div'); controls.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-top:7px'; content.appendChild(controls);
    const previous = document.createElement('button'), next = document.createElement('button'), label = document.createElement('span');
    previous.type = next.type = 'button'; previous.textContent = 'Previous'; next.textContent = 'Next'; controls.appendChild(previous); controls.appendChild(label); controls.appendChild(next);
    const members = [...group.members].sort((a, b) => a.name.localeCompare(b.name));
    const selectedIndex = members.findIndex(place => place.id === this.selection.place?.id);
    let page = selectedIndex < 0 ? 0 : Math.floor(selectedIndex / 4);
    const active = () => !this.disposed && this.host.view() === view && this.popupContent === content && view.popup?.content === content;
    const render = (moveFocus = false) => {
      list.replaceChildren();
      for (const place of members.slice(page * 4, page * 4 + 4)) {
        const selected = place.id === this.selection.place?.id, category = place.category.replace(/_/g, ' ');
        const button = document.createElement('button'); button.type = 'button'; button.className = 'mly-place-open mly-place-group-row'; button.title = place.name;
        button.setAttribute('aria-label', `${place.name}, ${category}${selected ? ', selected' : ''}. Open place details`);
        if (selected) button.setAttribute('aria-current', 'true');
        const icon = document.createElement('img'); icon.src = placeCategoryIcon(place.group, selected); icon.alt = ''; icon.width = icon.height = 20; icon.setAttribute('aria-hidden', 'true'); button.appendChild(icon);
        const text = document.createElement('span'); text.className = 'mly-place-group-text';
        const name = document.createElement('span'); name.className = 'mly-place-group-name'; name.textContent = place.name; text.appendChild(name);
        const detail = document.createElement('span'); detail.className = 'mly-place-group-category'; detail.textContent = category; text.appendChild(detail);
        if (selected) { const badge = document.createElement('span'); badge.className = 'mly-place-group-selected'; badge.textContent = 'Selected'; text.appendChild(badge); }
        button.appendChild(text);
        button.onclick = () => { if (active() && this.records.has(place.id)) this.open([], place.id); }; list.appendChild(button);
      }
      previous.disabled = page === 0; next.disabled = (page + 1) * 4 >= members.length; label.textContent = `${page + 1} / ${Math.ceil(members.length / 4)}`; controls.hidden = members.length <= 4;
      if (moveFocus) list.querySelector?.('button')?.focus({ preventScroll: true });
    };
    previous.onclick = () => { if (active() && page > 0) { page--; render(true); } }; next.onclick = () => { if (active() && (page + 1) * 4 < members.length) { page++; render(true); } };
    const source = document.createElement('p'); source.textContent = 'Loaded places · Overture Maps'; content.appendChild(source);
    const style = document.createElement('style'); style.textContent = PLACE_POPUP_CSS; content.appendChild(style);
    this.popupContent = content; this.popupView = view; render();
    this.popupFocus.open(view, { title: 'Nearby places', content, location: new this.host.modules.Point({ longitude: group.anchor.lon, latitude: group.anchor.lat, spatialReference: { wkid: 4326 } }) }, origin);
    return true;
  }
  clearSelection(): void { this.selection.clear(); this.closeDetails(); }
  private closeDetails(): void {
    this.popupFocus.cancel();
    this.searchAbort?.abort(); this.searchAbort = null;
    if (!this.popupView?.destroyed && this.popupContent && this.popupView?.popup?.content === this.popupContent) this.popupView.closePopup();
    this.popupContent = null; this.popupView = null;
  }
  private clear(): void {
    this.setHover(null);
    this.closeDetails();
    if (!this.controller?.stats.enabled) this.selection.clear(!this.disposed);
    if (this.attribution) { if (!this.ownerView?.destroyed) this.ownerView?.ui?.remove(this.attribution); this.attribution.remove(); this.attribution = null; }
    if (this.graphics) { if (!this.ownerView?.destroyed) this.ownerView?.map?.remove(this.graphics); if (!this.graphics.destroyed) this.graphics.destroy(); this.graphics = null; }
    this.records.clear(); this.groupingKey = ''; this.groups.clear(); this.memberGroups.clear(); this.ownerView = null;
    if (this.listedPlaces.length) { this.listedPlaces = []; if (!this.disposed) this.host.list?.([]); }
  }
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true; this.controller.dispose(); this.selection.dispose(); this.handles.forEach(h => h.remove()); this.handles = [];
    document.removeEventListener('visibilitychange', this.visibility);
    this.service?.destroy(); this.service = null; this.published = null; this.iconSymbols.clear(); this.countSymbols.clear();
  }
}
