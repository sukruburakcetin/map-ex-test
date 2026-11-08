import { isTileCategory, TILE_CATEGORIES } from './tileCategories';
import { BoundedPlaceHover } from './BoundedPlaceHover';
/** Opt-in feasibility harness. Native tiles draw POIs; only a bounded click query reaches JS.
 * Picking is proximity-based, not proof that a collision-hidden tile symbol was rendered.
 */
export class PlacesTilesPrototype {
  private layer: any;
  private service: any;
  private click: any;
  private movement: any;
  private controls: HTMLDivElement | null = null;
  private abort: AbortController | null = null;
  private revision = 0;
  private source: { style: string; details: string; local: boolean } | null = null;
  private sourceAbort: AbortController | null = null;
  private hover = new BoundedPlaceHover<any>((screen, signal) => this.lookup(screen, signal, this.revision, false));
  constructor(private host: { view: any; modules: any; sourceChanging?(): void; sourceReady?(bbox: [number, number, number, number] | null): void; sharedClicks?: boolean; busy?(): boolean; selected(attributes: any, point: any): void; clearSelected?(): void; error(error: unknown): void }) {}

  get supportsFamilyFilter(): boolean { return this.source?.local === true; }
  get version(): number { return this.revision; }
  get visible(): boolean {
    return !!this.layer && this.layer.visible !== false && !this.host.view.destroyed &&
      !(this.source?.local && Number.isFinite(this.host.view.zoom) && this.host.view.zoom < 12);
  }

  async start(styleUrl: string, detailsUrl: string, local = false): Promise<void> {
    this.stop();
    for (const value of [styleUrl, detailsUrl]) {
      const url = new URL(value);
      if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Use HTTPS endpoints without embedded credentials');
    }
    if (local && (!['localhost', '127.0.0.1'].includes(new URL(detailsUrl).hostname) || new URL(styleUrl).origin !== new URL(detailsUrl).origin)) throw new Error('Local test endpoints must use the same loopback origin');
    if (!local && !/\/FeatureServer\/\d+\/?$/.test(new URL(detailsUrl).pathname)) throw new Error('Expected a FeatureServer layer URL');
    this.source = { style: styleUrl, details: detailsUrl, local };
    const sourceAbort = this.sourceAbort = new AbortController();
    const { view, modules } = this.host, revision = this.revision;
    if (!view?.ready || view.destroyed) throw new Error('Open a ready map first');
    const layer = this.layer = new modules.VectorTileLayer({ url: styleUrl, id: 'overture-tiles-prototype', title: 'Overture POIs · prototype', listMode: 'hide' });
    const service = this.service = local ? {
      fields: [{ name: 'gers_id' }], load: async () => {}, destroy: () => {},
      queryFeatures: async (query: any, options: any) => {
        const response = await fetch(detailsUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ geometry: query.geometry }), signal: options.signal });
        if (!response.ok) throw new Error(`Local POI query failed (${response.status})`);
        const result = await response.json();
        if (!Array.isArray(result.features) || result.features.length > 32) throw new Error('Local POI query exceeded candidate limit');
        return { ...result, features: result.features.map((feature: any) => ({ ...feature, geometry: new modules.Point(feature.geometry) })) };
      },
    } : new modules.FeatureLayer({ url: detailsUrl, popupEnabled: false });
    try {
      let bounds: [number, number, number, number] | null = null;
      const metadata = local && this.host.sourceReady ? (async () => {
        const endpoint = new URL(detailsUrl); endpoint.pathname = '/status';
        const response = await fetch(endpoint.toString(), { signal: sourceAbort.signal });
        if (!response.ok) throw new Error('Local POI metadata could not load');
        const result = await response.json(), bbox = result.bbox;
        if (result.category_filter_version !== 1 || !Array.isArray(result.supported_icon_families) || TILE_CATEGORIES.some(([id]) => !result.supported_icon_families.includes(id))) throw new Error('Restart the updated local POI server to enable all category filters');
        if (!Array.isArray(bbox) || bbox.length !== 4 || !bbox.every(Number.isFinite) || bbox[0] >= bbox[2] || bbox[1] >= bbox[3] || bbox[0] < -180 || bbox[2] > 180 || bbox[1] < -85.051129 || bbox[3] > 85.051129) throw new Error('Local POI extent is invalid');
        bounds = bbox as [number, number, number, number];
      })() : Promise.resolve();
      await Promise.all([layer.load(), service.load(), metadata]);
      if (revision !== this.revision || view.destroyed) return;
      if (!service.fields?.some((field: any) => field.name === 'gers_id')) throw new Error('Details service must expose gers_id');
      view.map.add(layer);
      if (local) this.host.sourceReady?.(bounds);
      if (local && !this.host.sharedClicks) this.addQualityControls(styleUrl, detailsUrl);
      this.movement = view.watch('stationary', (stationary: boolean) => {
        if (!stationary) { this.abort?.abort(); this.hover.clear(); }
      });
      if (!this.host.sharedClicks) this.click = view.on('click', (event: any) => {
        // This explicit test mode owns clicks. Stop it to restore normal navigation.
        event.stopPropagation();
        void this.pick(event).catch(error => { if (error?.name !== 'AbortError') this.host.error(error); });
      });
    } catch (error) { if (revision === this.revision) this.stop(); throw error; }
  }

  setVisible(visible: boolean): void { if (this.layer) this.layer.visible = visible; }
  async setGroup(group: string): Promise<void> {
    if (!['all', 'health', 'education', 'parks', 'landmarks', 'services'].includes(group)) throw new Error('Invalid place group');
    const source = this.source;
    if (!source?.local) return;
    const style = new URL(source.style), details = new URL(source.details);
    for (const url of [style, details]) { url.searchParams.delete('family'); if (group === 'all') url.searchParams.delete('group'); else url.searchParams.set('group', group); }
    await this.start(style.toString(), details.toString(), true);
  }
  async setFamily(family: string): Promise<void> {
    if (!isTileCategory(family)) throw new Error('Invalid icon family');
    const source = this.source;
    if (!source?.local) return;
    const style = new URL(source.style), details = new URL(source.details);
    for (const url of [style, details]) { url.searchParams.delete('group'); if (family === 'all') url.searchParams.delete('family'); else url.searchParams.set('family', family); }
    await this.start(style.toString(), details.toString(), true);
  }
  get quality(): { minimum: number | null; hideClosed: boolean } {
    const params = this.source ? new URL(this.source.style).searchParams : new URLSearchParams();
    const value = params.get('min_confidence');
    return { minimum: value === null ? null : Number(value), hideClosed: params.get('hide_closed') === '1' };
  }
  async setQuality(minimum: number | null, hideClosed: boolean): Promise<void> {
    if (minimum !== null && (!Number.isFinite(minimum) || minimum < 0 || minimum > 1)) throw new Error('Invalid confidence threshold');
    const source = this.source;
    if (!source?.local) return;
    const style = new URL(source.style), details = new URL(source.details);
    for (const url of [style, details]) {
      if (minimum === null) url.searchParams.delete('min_confidence'); else url.searchParams.set('min_confidence', String(minimum));
      if (hideClosed) url.searchParams.set('hide_closed', '1'); else url.searchParams.delete('hide_closed');
    }
    await this.start(style.toString(), details.toString(), true);
  }
  async queryArea(bbox: readonly number[], signal: AbortSignal, origin?: { lon: number; lat: number } | null): Promise<{ features: any[]; limited: boolean }> {
    const source = this.source;
    if (!source?.local) throw new Error('The local area-query adapter is unavailable');
    const endpoint = new URL(source.details); endpoint.pathname = '/search';
    const response = await fetch(endpoint.toString(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal,
      body: JSON.stringify({ origin: origin || undefined, geometry: { xmin: bbox[0], ymin: bbox[1], xmax: bbox[2], ymax: bbox[3], spatialReference: { wkid: 4326 } } }) });
    if (!response.ok) throw new Error(`Local area query failed (${response.status})`);
    const result = await response.json();
    if (!Array.isArray(result.features) || result.features.length > 200) throw new Error('Local area query exceeded its limit');
    return { features: result.features, limited: !!result.exceededTransferLimit || result.features.length >= 200 };
  }

  private addQualityControls(styleUrl: string, detailsUrl: string): void {
    const view = this.host.view;
    if (!view.ui || typeof document === 'undefined') return;
    const controls = this.controls = document.createElement('div');
    controls.className = 'esri-widget';
    controls.style.cssText = 'padding:8px;display:flex;gap:6px;align-items:center;flex-wrap:wrap;max-width:310px';
    const label = document.createElement('label'); label.textContent = 'POI confidence ';
    const select = document.createElement('select'); select.setAttribute('aria-label', 'POI confidence filter');
    const current = new URL(styleUrl).searchParams.get('min_confidence');
    const choices = [['', 'All records'], ['0.5', 'At least 0.5'], ['0.75', 'At least 0.75'], ['0.9', 'At least 0.9'], ['0.95', 'At least 0.95']];
    if (current !== null && !choices.some(([value]) => value === current)) choices.push([current, `At least ${current}`]);
    for (const [value, text] of choices) { const option = document.createElement('option'); option.value = value; option.textContent = text; select.appendChild(option); }
    select.value = current ?? ''; label.appendChild(select); controls.appendChild(label);
    const custom = document.createElement('input'); custom.type = 'number'; custom.min = '0'; custom.max = '1'; custom.step = 'any';
    custom.value = current ?? ''; custom.placeholder = '0–1'; custom.style.width = '65px'; custom.setAttribute('aria-label', 'Custom minimum confidence'); controls.appendChild(custom);
    const apply = document.createElement('button'); apply.type = 'button'; apply.textContent = 'Apply'; controls.appendChild(apply);
    const closedLabel = document.createElement('label');
    const closed = document.createElement('input'); closed.type = 'checkbox'; closed.checked = new URL(styleUrl).searchParams.get('hide_closed') === '1';
    closed.setAttribute('aria-label', 'Hide permanently closed places'); closedLabel.appendChild(closed);
    const closedText = document.createElement('span'); closedText.textContent = ' Hide permanently closed'; closedLabel.appendChild(closedText); controls.appendChild(closedLabel);
    const note = document.createElement('small'); note.textContent = current === null ? 'All scores, including missing values.' : 'Missing confidence is excluded. A score is not a probability.'; controls.appendChild(note);
    const update = (value: string) => {
      const threshold = value === '' ? null : Number(value);
      if (threshold !== null && (!Number.isFinite(threshold) || threshold < 0 || threshold > 1)) { custom.setCustomValidity('Enter a number from 0 to 1'); custom.reportValidity(); return; }
      const style = new URL(styleUrl), details = new URL(detailsUrl);
      for (const url of [style, details]) { if (threshold === null) url.searchParams.delete('min_confidence'); else url.searchParams.set('min_confidence', String(threshold));
        if (closed.checked) url.searchParams.set('hide_closed', '1'); else url.searchParams.delete('hide_closed'); }
      void this.start(style.toString(), details.toString(), true).catch(error => this.host.error(error));
    };
    closed.onchange = () => update(select.value);
    select.onchange = () => update(select.value);
    custom.oninput = () => custom.setCustomValidity('');
    apply.onclick = () => { if (custom.validity.badInput) { custom.reportValidity(); return; } update(custom.value); };
    view.ui?.add(controls, 'top-right');
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
    return this.lookup(screen, controller.signal, this.revision);
  }
  private async lookup(screen: { x: number; y: number }, signal: AbortSignal, revision: number, reportDense = true): Promise<any | null> {
    const { view } = this.host;
    if (signal.aborted || revision !== this.revision || !this.visible || !this.service || view.destroyed || !view.stationary || this.host.busy?.()) return null;
    const point = view.toMap(screen);
    if (!point) return null;
    // Derive a map-space search envelope from screen pixels; works in MapView and SceneView.
    const corners = [[-12,-12],[12,-12],[12,12],[-12,12]].map(([x,y]) => view.toMap({ x: screen.x+x, y: screen.y+y }));
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
    if (page.exceededTransferLimit || page.features?.length >= 32) { if (reportDense) this.host.error(new Error('Too many nearby candidates; zoom in to select a place')); return null; }
    let nearest: any = null, distance = 12 * 12;
    const nearby: any[] = [];
    for (const feature of page.features || []) {
      if (!feature.attributes?.gers_id || !feature.geometry) continue;
      const pixel = view.toScreen(feature.geometry);
      if (!pixel || !Number.isFinite(pixel.x) || !Number.isFinite(pixel.y)) continue;
      const squared = (pixel.x-screen.x)**2 + (pixel.y-screen.y)**2;
      if (squared <= 12 * 12) nearby.push(feature);
      if (squared < distance) { distance = squared; nearest = feature; }
    }
    return nearest ? { attributes: nearest.attributes, geometry: nearest.geometry, candidates: nearby } : null;
  }

  stop(): void {
    ++this.revision;
    this.hover.clear();
    this.sourceAbort?.abort(); this.sourceAbort = null; this.source = null;
    this.host.sourceChanging?.();
    this.host.clearSelected?.();
    if (this.controls) { if (!this.host.view.destroyed) this.host.view.ui?.remove(this.controls); this.controls.remove(); this.controls = null; }
    this.abort?.abort(); this.abort = null;
    this.click?.remove(); this.click = null;
    this.movement?.remove(); this.movement = null;
    if (this.layer) { if (!this.host.view.destroyed) this.host.view.map?.remove(this.layer); this.layer.destroy(); this.layer = null; }
    this.service?.destroy(); this.service = null;
  }
}
