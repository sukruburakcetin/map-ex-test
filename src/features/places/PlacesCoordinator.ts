import type { PlaceListOrigin } from './placeListUtils';
import { PlaceHover } from './PlaceHover';
import { Presentation, englishPresentation } from '../../i18n/PresentationText';
import { PlacePopupFocus } from './PlacePopupFocus';
import { PLACE_POPUP_CSS } from './placePopupStyles';
import { placeCategoryIcon } from './placeIcons';
import { SelectedPlace } from './SelectedPlace';
import { PlaceImagery, placeImageryDirectionLabel, placeImageryChoiceMeta } from './nearbyPlaceImagery';
import { Place, PlaceBbox } from './placesModel';
import { PlacesController, PlacesState, PlacesView } from './PlacesController';
interface PlaceGroupMarker { id: string; anchor: Place; members: readonly Place[]; }

/** Coordinates native place results, selection, popups and imagery without bulk POI graphics. */
export class PlacesCoordinator {
  private get l10n(): Presentation { return this.host.presentation || englishPresentation; }
  private published: PlaceBbox | null = null;
  get stats() { return { ...this.controller.stats, loaded: this.records.size, rendered: 0, overlapGroups: this.groups.size, selection: this.selection.stats, hoverGraphics: this.nativeHover?.stats.graphics ?? 0, choices: this.choices.size }; }
  get coverageExtent(): PlaceBbox | null { return this.published; }
  private ownerView: any = null;
  private records = new Map<string, Place>();
  private listedPlaces: readonly Place[] = [];
  private listVisible = true;
  private groups = new Map<string, PlaceGroupMarker>();
  private memberGroups = new Map<string, string>();
  private handles: { remove(): void }[] = [];
  private disposed = false;
  private searchAbort: AbortController | null = null;
  private popupFocus = new PlacePopupFocus();
  private popupView: any = null;
  private popupContent: HTMLDivElement | null = null;
  private selectionOrigin:'map'|'list'|'card'='map';
  private notifiedHover:string|null=null;
  private nativeHover: PlaceHover | null = null;
  private nativeHoverPlace: Place | null = null;
  private choices = new Map<string, Place>();
  readonly selection: SelectedPlace;
  readonly controller: PlacesController;
  constructor(private host: {
    searchOrigin?():PlaceListOrigin|null;
    queryArea?(bbox: PlaceBbox, signal: AbortSignal,origin?:PlaceListOrigin|null,offset?:number,text?:string): Promise<{ features: any[]; limited: boolean; outside?: boolean }>;
    normalize?(features: any[], bbox: PlaceBbox): Place[];
    mapVisibleChanged?(visible: boolean): void;
    mapVisible?(): boolean;
    listActive?(): boolean;
    manualSearch?:boolean;hybridSearch?:boolean;presentation?: Presentation;
    id: string; modules: any; view(): any; geographic(extent: any): any;
    list?(places: readonly Place[]): void; selected?(place: Place | null,origin?:'map'|'list'|'card'): void;hovered?(id:string|null):void; busy(): boolean; pauseReason?(): string; status(state: PlacesState): void; explore(place: Place, radius: number, signal: AbortSignal): Promise<PlaceImagery[]>; openImagery(image: PlaceImagery): void;
  }) {
    this.nativeHover = new PlaceHover({ id: host.id, modules: host.modules, view: host.view });
    this.selection = new SelectedPlace({ id: host.id, modules: host.modules, view: host.view, changed: place=>host.selected?.(place,this.selectionOrigin) });
    this.controller = new PlacesController({
      paged:!!host.queryArea,manualSearch:host.manualSearch,hybridSearch:host.hybridSearch,consumerActive:host.listActive,searchOrigin:host.searchOrigin,
      view: () => this.snapshot(), extent: () => this.published, busy: host.busy, pauseReason: host.pauseReason,
      normalize: host.normalize,
      query: async (bbox, signal,origin,offset,text) => {
        if (!host.queryArea) throw new Error('Places query adapter is unavailable');
        return host.queryArea(bbox, signal,origin,offset,text);
      },
      display: (places, view) => this.display(places, view),
      visible: visible => {
        host.mapVisibleChanged?.(visible);
        if (!visible) this.setHover(null);
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
    if (view) this.handles.push(view.watch(['stationary', 'zoom', 'extent'], () => { if (!view.stationary) this.setHover(null); this.controller.sync(); }));
  }
  resetResults():void {if(this.popupContent?.querySelector?.('.mly-place-group-row'))this.closeDetails();this.setHover(null);this.records.clear();this.listedPlaces=[];this.choices.clear();this.groups.clear();this.memberGroups.clear();this.host.list?.([]);this.controller.resetResults();}
  setCoverageExtent(bbox: PlaceBbox | null): void { this.published = bbox; }
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
    this.setHover(null);
    this.ownerView = view;
    this.records = new Map(places.map(place => [place.id, place]));
    this.listedPlaces = places;
    if (this.listVisible) this.host.list?.(places);
  }
  private groupPlace(group: PlaceGroupMarker): Place { return { ...group.anchor, id: group.id, name: `${group.members.length} places here` }; }

  setMapHover(place: Place | null): void { this.nativeHoverPlace = place; this.setHover(place?.id || null); }
  /** One reusable hover outline; bulk places remain native vector tiles. */
  setHover(id: string | null): void {
    const notify=(value:string|null)=>{if(this.notifiedHover!==value){this.notifiedHover=value;this.host.hovered?.(value);}};
    const place = id ? this.records.get(id) || (this.nativeHoverPlace?.id === id ? this.nativeHoverPlace : null) || this.choices.get(id) || (this.selection.place?.id === id ? this.selection.place : null) : null;
    if (!place || this.disposed || this.host.busy() || !(this.host.mapVisible?.() ?? this.listVisible) || this.host.view()?.stationary === false) {
      this.nativeHover?.clear(); this.nativeHoverPlace = null; notify(null); return;
    }
    if (place.id === this.selection.place?.id) this.nativeHover?.clear(); else this.nativeHover?.show(place);
    notify(place.id);
  }
  hoverLabel(place: Place, nearbyCount = 0): string {
    if (nearbyCount > 1) return this.l10n.text("{value0} places here · Click to choose", { value0: String(nearbyCount) });
    const group = this.groups.get(place.id);
    return group ? this.l10n.text("{value0} places here · Click to choose",{value0:String(group.members.length)}) : `${place.name} · ${place.category.replace(/_/g, ' ')}`;
  }
  get hoverLayers(): any[] { return this.host.busy() ? [] : [this.selection.layerForHit].filter(Boolean); }
  hit(results: any[]): Place | null {
    const selected = this.selection.hit(results);
    if (!selected) return null;
    const group = this.groups.get(this.memberGroups.get(selected.id) || '');
    return group ? this.groupPlace(group) : selected;
  }
  /** Selected overlay only; native POIs use bounded proximity picking. */
  screenTarget(screen: { x: number; y: number }): string | null {
    const selected = this.selection.screenTarget(screen);
    return selected ? this.memberGroups.get(selected) || selected : null;
  }
  openChoices(places: readonly Place[]): boolean {
    if (this.disposed || !places.length || places.length > 32) return false;
    if (places.length === 1) return this.openPlace(places[0]);
    const view = this.host.view();
    if (!view?.ready || view.destroyed) return false;
    this.setHover(null); this.choices = new Map(places.map(place => [place.id, place]));
    if (this.choices.size < 2) return this.openPlace(places[0]);
    this.groups.clear(); this.memberGroups.clear(); this.ownerView = view;
    const members = [...this.choices.values()];
    const group: PlaceGroupMarker = { id: `@places-group:tile:${members[0].id}`, anchor: members[0], members };
    this.groups.set(group.id, group); for (const member of members) this.memberGroups.set(member.id, group.id);
    return this.openGroup(group, this.popupFocus.capture(view));
  }
  openPlace(place: Place): boolean { return this.open([], place.id, false, 'map', place); }
  open(results: any[], targetId?: string | null,startImagery=false,originKind:'map'|'list'|'card'='map',externalPlace?: Place): boolean {
    const view = this.host.view();
    const valid = !this.disposed && (this.host.mapVisible?.() ?? this.listVisible) && this.ownerView === view && !view?.destroyed;
    const selectedGroup = this.selection.place ? this.memberGroups.get(this.selection.place.id) : null;
    const group = valid || selectedGroup && selectedGroup === targetId ? this.groups.get(targetId || this.hit(results)?.id || '') : null;
    if (group) return this.openGroup(group, this.popupFocus.capture(view));
    const place = externalPlace || (valid && targetId ? this.records.get(targetId) || this.choices.get(targetId) : null) || (this.selection.place?.id === targetId ? this.selection.place : null) || this.hit(results);
    if (this.disposed || !place || !view || view.destroyed) return false;
    const origin = this.popupFocus.capture(view);
    this.setHover(null);
    this.selectionOrigin=originKind;this.selection.select(place);
    const content = document.createElement('div'); content.className = 'mly-place-popup'; this.l10n.bind(content,'dir',()=>this.l10n.locale==='ar'?'rtl':'ltr');
    const name = document.createElement('strong'); name.className = 'mly-place-name'; name.textContent = place.name; content.appendChild(name);
    for (const [index, text] of [place.category.replace(/_/g, ' '), place.address].entries()) if (text) { const line = document.createElement('p'); line.className = index === 0 ? 'mly-place-category' : 'mly-place-address'; line.textContent = text; content.appendChild(line); }
    const confidence=document.createElement('p');this.l10n.bind(confidence,'textContent',()=>this.l10n.text('Confidence')+': '+(typeof place.confidence==='number'?String(place.confidence):this.l10n.text('Not provided')));content.appendChild(confidence);
    const operating=document.createElement('p');this.l10n.bind(operating,'textContent',()=>this.l10n.text('Operating status')+': '+this.l10n.text(place.operatingStatus==='open'?'Open':place.operatingStatus==='temporarily_closed'?'Temporarily closed':place.operatingStatus==='permanently_closed'?'Permanently closed':place.operatingStatus||'Not provided'));content.appendChild(operating);
    if (place.website) { const link = document.createElement('a'); link.className = 'mly-place-website'; this.l10n.bind(link,"textContent",()=>this.l10n.text("Website")); link.href = place.website; link.target = '_blank'; link.rel = 'noopener noreferrer'; content.appendChild(link); }
    this.searchAbort?.abort(); this.searchAbort = null;
    const button = document.createElement('button'); button.type = 'button'; this.l10n.bind(button,"textContent",()=>this.l10n.text("Find imagery within 75 m")); button.className = 'mly-place-open mly-place-open-primary mly-text-action'; content.appendChild(button);
    const status = document.createElement('p'); status.setAttribute('role', 'status'); status.className = 'mly-place-meta'; content.appendChild(status);
    const alternatives = document.createElement('div'); content.appendChild(alternatives);
    const visibility = document.createElement('p'); visibility.className = 'mly-place-choice-note'; this.l10n.bind(visibility,"textContent",()=>this.l10n.text("Direction is estimated. Visibility isn’t confirmed.")); visibility.hidden = true; content.appendChild(visibility);
    let radius = 75, candidate: PlaceImagery | null = null;
    const active = () => this.popupContent === content && this.popupView === view && !view.destroyed && view.popup?.content === content;
    button.onclick = async () => {
      if (!active() || button.disabled) return;
      if (candidate) { this.host.openImagery(candidate); return; }
      const controller = new AbortController(); this.searchAbort?.abort(); this.searchAbort = controller;
      button.disabled = true; this.l10n.bind(status,"textContent",()=>this.l10n.text("Looking within {value0} m…",{value0:String(radius)}));
      try {
        const found = await this.host.explore(place, radius, controller.signal);
        if (controller.signal.aborted || !active()) return;
        if (found.length) {
          const suggested=found[0];candidate = suggested; this.l10n.bind(button,"textContent",()=>this.l10n.text("Suggested view · {value0}",{value0:String(placeImageryDirectionLabel(suggested, this.l10n))}).replace(" · ","\n"));
          this.l10n.bindAttribute(button,'aria-label',()=>this.l10n.text("Open suggested view: {value0}. {value1}",{value0:String(placeImageryDirectionLabel(suggested, this.l10n)),value1:String(placeImageryChoiceMeta(suggested, this.l10n))}));
          this.l10n.bind(status,"textContent",()=>placeImageryChoiceMeta(suggested, this.l10n)); status.className = 'mly-place-meta mly-place-choice-meta'; this.l10n.bind(status,'title',()=>this.l10n.text('Approximate straight-line distance, not walking distance or visibility')); visibility.hidden = false;
          for (const image of found.slice(1, 3)) {
            const option = document.createElement('button'); option.type = 'button'; this.l10n.bind(option,"textContent",()=>this.l10n.text("Open view · {value0}",{value0:String(placeImageryDirectionLabel(image, this.l10n))}).replace(" · ","\n"));
            this.l10n.bindAttribute(option,'aria-label',()=>this.l10n.text("Open view: {value0}. {value1}",{value0:String(placeImageryDirectionLabel(image, this.l10n)),value1:String(placeImageryChoiceMeta(image, this.l10n))}));
            option.className = 'mly-place-open mly-text-action';
            option.onclick = () => { if (active()) this.host.openImagery(image); };
            const detail = document.createElement('p'); this.l10n.bind(detail,"textContent",()=>placeImageryChoiceMeta(image, this.l10n)); detail.className = 'mly-place-meta mly-place-choice-meta'; this.l10n.bind(detail,'title',()=>this.l10n.text('Approximate straight-line distance, not walking distance or visibility'));
            alternatives.appendChild(option); alternatives.appendChild(detail);
          }
        } else if (radius === 75) {
          radius = 250; this.l10n.bind(button,"textContent",()=>this.l10n.text("Search within 250 m"));
          this.l10n.bind(status,"textContent",()=>this.l10n.text("No nearby imagery found within 75 m. Search a wider area if you’d like."));
        } else {
          this.l10n.bind(button,"textContent",()=>this.l10n.text("Search again · within 250 m")); this.l10n.bind(status,"textContent",()=>this.l10n.text("No suitable imagery found within 250 m. Try another place or search again later."));
        }
      } catch (error) {
        if (!controller.signal.aborted && active()) { this.l10n.bind(button,"textContent",()=>this.l10n.text("Retry search · within {value0} m",{value0:String(radius)})); this.l10n.bind(status,"textContent",()=>this.l10n.text("Imagery search could not finish. Please try again.")); }
      } finally {
        button.disabled = false;
        if (this.searchAbort === controller) this.searchAbort = null;
      }
    };
    const source = document.createElement('p'); this.l10n.bind(source,"textContent",()=>this.l10n.text("Overture Maps{value0}. Imagery may be near this place rather than at its entrance.",{value0:String(place.release ? ' · ' + place.release : '')})); source.className = 'mly-place-source'; content.appendChild(source);
    const style = document.createElement('style'); style.textContent = PLACE_POPUP_CSS; content.appendChild(style);
    this.popupContent = content; this.popupView = view;
    this.popupFocus.open(view, { title: this.l10n.text("Nearby place"), content, location: new this.host.modules.Point({ longitude: place.lon, latitude: place.lat, spatialReference: { wkid: 4326 } }) }, origin,()=>{if(startImagery&&active())button.click();});
    return true;
  }
  private openGroup(group: PlaceGroupMarker, origin: HTMLElement | null): boolean {
    const view = this.host.view(); if (!view || view.destroyed || this.disposed) return false;
    this.closeDetails();
    const content = document.createElement('div'); content.className = 'mly-place-popup'; this.l10n.bind(content,'dir',()=>this.l10n.locale==='ar'?'rtl':'ltr');
    const heading = document.createElement('strong'); this.l10n.bind(heading,"textContent",()=>this.l10n.text("{value0} places here",{value0:String(group.members.length)})); content.appendChild(heading);
    const hint = document.createElement('p'); this.l10n.bind(hint,"textContent",()=>this.l10n.text("Choose a place to see details.")); content.appendChild(hint);
    const list = document.createElement('div'); content.appendChild(list);
    const controls = document.createElement('div'); controls.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-top:7px'; content.appendChild(controls);
    const previous = document.createElement('button'), next = document.createElement('button'), label = document.createElement('span');
    previous.type = next.type = 'button'; this.l10n.bind(previous,"textContent",()=>this.l10n.text("Previous")); this.l10n.bind(next,"textContent",()=>this.l10n.text("Next")); controls.appendChild(previous); controls.appendChild(label); controls.appendChild(next);
    const members = [...group.members].sort((a, b) => a.name.localeCompare(b.name));
    const selectedIndex = members.findIndex(place => place.id === this.selection.place?.id);
    let page = selectedIndex < 0 ? 0 : Math.floor(selectedIndex / 4);
    const active = () => !this.disposed && this.host.view() === view && this.popupContent === content && view.popup?.content === content;
    const render = (moveFocus = false) => {
      list.replaceChildren();
      for (const place of members.slice(page * 4, page * 4 + 4)) {
        const selected = place.id === this.selection.place?.id, category = place.category.replace(/_/g, ' ');
        const button = document.createElement('button'); button.type = 'button'; button.className = 'mly-place-open mly-place-group-row mly-text-action'; button.title = place.name;
        this.l10n.bindAttribute(button,'aria-label',()=>this.l10n.text("{value0}, {value1}{value2}. Open place details",{value0:String(place.name),value1:String(category),value2:String(selected ? ', selected' : '')}));
        if (selected) button.setAttribute('aria-current', 'true');
        const icon = document.createElement('img'); icon.src = placeCategoryIcon(place.group, selected); icon.alt = ''; icon.width = icon.height = 20; icon.setAttribute('aria-hidden', 'true'); button.appendChild(icon);
        const text = document.createElement('span'); text.className = 'mly-place-group-text';
        const name = document.createElement('span'); name.className = 'mly-place-group-name'; name.textContent = place.name; text.appendChild(name);
        const detail = document.createElement('span'); detail.className = 'mly-place-group-category'; detail.textContent = category; text.appendChild(detail);
        if (selected) { const badge = document.createElement('span'); badge.className = 'mly-place-group-selected'; this.l10n.bind(badge,"textContent",()=>this.l10n.text("Selected")); text.appendChild(badge); }
        button.appendChild(text);
        button.onclick = () => { if (active() && (this.records.has(place.id) || this.choices.has(place.id))) { this.openPlace(place); } }; list.appendChild(button);
      }
      previous.disabled = page === 0; next.disabled = (page + 1) * 4 >= members.length; label.textContent = `${page + 1} / ${Math.ceil(members.length / 4)}`; controls.hidden = members.length <= 4;
      if (moveFocus) list.querySelector?.('button')?.focus({ preventScroll: true });
    };
    previous.onclick = () => { if (active() && page > 0) { page--; render(true); } }; next.onclick = () => { if (active() && (page + 1) * 4 < members.length) { page++; render(true); } };
    const source = document.createElement('p'); this.l10n.bind(source,"textContent",()=>this.l10n.text("Loaded places · Overture Maps")); content.appendChild(source);
    const style = document.createElement('style'); style.textContent = PLACE_POPUP_CSS; content.appendChild(style);
    this.popupContent = content; this.popupView = view; render();
    this.popupFocus.open(view, { title: this.l10n.text("Nearby places"), content, location: new this.host.modules.Point({ longitude: group.anchor.lon, latitude: group.anchor.lat, spatialReference: { wkid: 4326 } }) }, origin);
    return true;
  }
  refreshLocale(): void {
    if(this.popupView?.popup?.content===this.popupContent && this.popupContent && !this.popupView.destroyed)
      this.popupView.popup.title=this.l10n.text(this.popupView.popup.title || 'Nearby place');
  }
  clearSelection(): void { this.selection.clear(); this.closeDetails(); }
  private closeDetails(): void {
    this.l10n.release(this.popupContent);
    this.popupFocus.cancel();
    this.searchAbort?.abort(); this.searchAbort = null;
    if (!this.popupView?.destroyed && this.popupContent && this.popupView?.popup?.content === this.popupContent) this.popupView.closePopup();
    this.popupContent = null; this.popupView = null;
  }
  private clear(): void {
    this.setHover(null);
    this.closeDetails();
    if (!this.controller?.stats.enabled) this.selection.clear(!this.disposed);
    this.choices.clear(); this.nativeHoverPlace = null; this.nativeHover?.clear();
    this.records.clear(); this.groups.clear(); this.memberGroups.clear(); this.ownerView = null;
    if (this.listedPlaces.length) { this.listedPlaces = []; if (!this.disposed) this.host.list?.([]); }
  }
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true; this.controller.dispose(); this.selection.dispose(); this.nativeHover?.dispose(); this.handles.forEach(h => h.remove()); this.handles = [];
    document.removeEventListener('visibilitychange', this.visibility);
    this.published = null;
  }
}
