import { placeCategorySymbol, SELECTED_PLACE_ICON_RADIUS } from './placeIcons';
import type { Place } from './placesModel';
/** One selection ring and an optional camera link; no queries, watches or animation. */
export class SelectedPlace {
  place: Place | null = null;
  private layer: any = null;
  private view: any = null;
  private ring: any = null;
  private line: any = null;
  private camera: [number, number] | null = null;
  private link = false;
  constructor(private host: { id: string; modules: any; view(): any; changed?(place: Place | null): void }) {}
  select(place: Place): void {
    this.place = place; this.render(); this.host.changed?.(place);
  }
  setLink(visible: boolean): void { if (this.link === visible) return; this.link = visible; this.renderLink(); }
  updateCamera(lon: number, lat: number): void {
    if (!Number.isFinite(lon) || !Number.isFinite(lat) || Math.abs(lon) > 180 || Math.abs(lat) > 90) return;
    if (this.camera?.[0] === lon && this.camera?.[1] === lat) return;
    this.camera = [lon, lat]; if (this.link && this.place) this.renderLink();
  }
  hit(results: any[]): Place | null {
    if (!this.place || !this.layer || this.view !== this.host.view() || this.view?.destroyed) return null;
    return results.some(hit => (hit.layer || hit.graphic?.layer) === this.layer && hit.graphic === this.ring) ? this.place : null;
  }
  screenTarget(screen: { x: number; y: number }): string | null {
    if (!this.place || !this.ring || this.view !== this.host.view() || this.view?.destroyed || !Number.isFinite(screen.x) || !Number.isFinite(screen.y)) return null;
    const point = this.view.toScreen(this.ring.geometry);
    return point && Number.isFinite(point.x) && Number.isFinite(point.y) && (point.x - screen.x) ** 2 + (point.y - screen.y) ** 2 <= SELECTED_PLACE_ICON_RADIUS ** 2 ? this.place.id : null;
  }
  rebind(): void { this.removeLayer(); this.render(); }
  clear(notify = true): void { this.place = null; this.link = false; this.removeLayer(); if (notify) this.host.changed?.(null); }
  dispose(): void { this.clear(false); this.camera = null; }
  private render(): void {
    const view = this.host.view(), place = this.place;
    if (!place || !view?.map || view.destroyed || !view.ready) return;
    if (this.view !== view || !this.layer) {
      this.removeLayer(); this.view = view;
      this.layer = new this.host.modules.GraphicsLayer({ id: `overture-selection-${this.host.id}`, title: 'Selected place', listMode: 'hide', elevationInfo: { mode: 'on-the-ground' } });
      this.view.map.add(this.layer);
    }
    const geometry = new this.host.modules.Point({ longitude: place.lon, latitude: place.lat, spatialReference: { wkid: 4326 } });
    if (this.ring) { this.ring.geometry = geometry; this.ring.symbol = placeCategorySymbol(place.group, true); }
    else {
      this.ring = new this.host.modules.Graphic({ geometry, symbol: placeCategorySymbol(place.group, true), attributes: { place_id: place.id } });
      this.layer.addMany([this.ring]);
    }
    this.ring.attributes = { place_id: place.id };
    this.renderLink();
  }
  private renderLink(): void {
    if (!this.layer || !this.place) return;
    if (!this.link || !this.camera) { if (this.line) this.line.visible = false; return; }
    const geometry = { type: 'polyline', paths: [[this.camera, [this.place.lon, this.place.lat]]], spatialReference: { wkid: 4326 } };
    if (this.line) { this.line.geometry = geometry; this.line.visible = true; }
    else { this.line = new this.host.modules.Graphic({ geometry, symbol: { type: 'simple-line', color: [255, 228, 163, .8], width: 1.25, style: 'dash' } }); this.layer.addMany([this.line]); }
  }
  private removeLayer(): void {
    if (this.layer) { if (!this.view?.destroyed) this.view?.map?.remove(this.layer); if (!this.layer.destroyed) this.layer.destroy(); }
    this.layer = null; this.view = null; this.ring = null; this.line = null;
  }
}
