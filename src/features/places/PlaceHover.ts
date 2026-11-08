import type { Place } from './placesModel';
/** One reusable on-ground outline. Bulk POIs remain native vector tiles. */
export class PlaceHover {
  private layer: any = null;
  private graphic: any = null;
  private view: any = null;
  private id: string | null = null;
  constructor(private host: { id: string; modules: any; view(): any }) {}
  get stats() { return { graphics: Number(!!this.graphic), visible: this.id !== null }; }
  show(place: Place): void {
    const view = this.host.view();
    if (!view?.ready || !view.map || view.destroyed || view.stationary === false) return;
    if (view !== this.view) this.dispose();
    if (this.id === place.id) return;
    if (!this.layer) {
      this.view = view;
      this.layer = new this.host.modules.GraphicsLayer({ id: `overture-hover-${this.host.id}`, listMode: 'hide', popupEnabled: false, elevationInfo: { mode: 'on-the-ground' } });
      view.map.add(this.layer);
    }
    const geometry = new this.host.modules.Point({ longitude: place.lon, latitude: place.lat, spatialReference: { wkid: 4326 } });
    if (!this.graphic) {
      this.graphic = new this.host.modules.Graphic({ geometry, symbol: { type: 'simple-marker', style: 'circle', size: 21, color: [0,0,0,0], outline: { color: '#ffd27a', width: 2 } } });
      this.layer.addMany([this.graphic]);
    } else { this.graphic.geometry = geometry; this.graphic.visible = true; }
    this.id = place.id;
  }
  clear(): void { this.id = null; if (this.graphic) this.graphic.visible = false; }
  dispose(): void {
    if (this.layer) { if (!this.view?.destroyed) this.view?.map?.remove(this.layer); this.layer.destroy(); }
    this.layer = null; this.graphic = null; this.view = null; this.id = null;
  }
}
