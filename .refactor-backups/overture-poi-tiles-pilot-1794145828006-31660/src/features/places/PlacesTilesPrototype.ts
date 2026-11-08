/** Opt-in feasibility harness. Native tiles draw POIs; only a bounded click query reaches JS.
 * Picking is proximity-based, not proof that a collision-hidden tile symbol was rendered.
 */
export class PlacesTilesPrototype {
  private layer: any;
  private service: any;
  private click: any;
  private movement: any;
  private abort: AbortController | null = null;
  private revision = 0;
  constructor(private host: { view: any; modules: any; selected(attributes: any, point: any): void; error(error: unknown): void }) {}

  async start(styleUrl: string, detailsUrl: string, local = false): Promise<void> {
    this.stop();
    for (const value of [styleUrl, detailsUrl]) {
      const url = new URL(value);
      if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Use HTTPS endpoints without embedded credentials');
    }
    if (local && (!['localhost', '127.0.0.1'].includes(new URL(detailsUrl).hostname) || new URL(styleUrl).origin !== new URL(detailsUrl).origin)) throw new Error('Local test endpoints must use the same loopback origin');
    if (!local && !/\/FeatureServer\/\d+\/?$/.test(new URL(detailsUrl).pathname)) throw new Error('Expected a FeatureServer layer URL');
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
      await Promise.all([layer.load(), service.load()]);
      if (revision !== this.revision || view.destroyed) return;
      if (!service.fields?.some((field: any) => field.name === 'gers_id')) throw new Error('Details service must expose gers_id');
      view.map.add(layer);
      this.movement = view.watch('stationary', (stationary: boolean) => {
        if (!stationary) this.abort?.abort();
      });
      this.click = view.on('click', (event: any) => {
        // This explicit test mode owns clicks. Stop it to restore normal navigation.
        event.stopPropagation();
        void this.pick(event).catch(error => { if (error?.name !== 'AbortError') this.host.error(error); });
      });
    } catch (error) { if (revision === this.revision) this.stop(); throw error; }
  }

  async pick(screen: { x: number; y: number }): Promise<void> {
    this.abort?.abort();
    const controller = this.abort = new AbortController(), { view } = this.host;
    const revision = this.revision;
    if (!this.layer || !this.service || view.destroyed || !view.stationary) return;
    const point = view.toMap(screen);
    if (!point) return;
    // Derive a map-space search envelope from screen pixels; works in MapView and SceneView.
    const corners = [[-12,-12],[12,-12],[12,12],[-12,12]].map(([x,y]) => view.toMap({ x: screen.x+x, y: screen.y+y }));
    if (corners.some(p => !p || !Number.isFinite(p.x) || !Number.isFinite(p.y))) return;
    const geometry = { type: 'extent', xmin: Math.min(...corners.map(p=>p.x)), ymin: Math.min(...corners.map(p=>p.y)), xmax: Math.max(...corners.map(p=>p.x)), ymax: Math.max(...corners.map(p=>p.y)), spatialReference: point.spatialReference };
    const page = await this.service.queryFeatures({ where: '1=1', geometry, spatialRelationship: 'intersects', outFields: ['*'], returnGeometry: true, num: 32 }, { signal: controller.signal });
    if (controller.signal.aborted || revision !== this.revision || view.destroyed || !view.stationary) return;
    // Never claim a nearest result when the server truncated the candidates.
    if (page.exceededTransferLimit || page.features?.length >= 32) { this.host.error(new Error('Too many nearby candidates; zoom in to select a place')); return; }
    let nearest: any = null, distance = 12 * 12;
    for (const feature of page.features || []) {
      if (!feature.attributes?.gers_id || !feature.geometry) continue;
      const pixel = view.toScreen(feature.geometry);
      if (!pixel || !Number.isFinite(pixel.x) || !Number.isFinite(pixel.y)) continue;
      const squared = (pixel.x-screen.x)**2 + (pixel.y-screen.y)**2;
      if (squared < distance) { distance = squared; nearest = feature; }
    }
    if (nearest) this.host.selected(nearest.attributes, nearest.geometry);
  }

  stop(): void {
    ++this.revision;
    this.abort?.abort(); this.abort = null;
    this.click?.remove(); this.click = null;
    this.movement?.remove(); this.movement = null;
    if (this.layer) { if (!this.host.view.destroyed) this.host.view.map?.remove(this.layer); this.layer.destroy(); this.layer = null; }
    this.service?.destroy(); this.service = null;
  }
}
