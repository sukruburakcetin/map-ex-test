import { cameraLinkDistance } from './cameraLinkDistance';
import { placeCategorySymbol, SELECTED_PLACE_ICON_RADIUS } from './placeIcons';
import type { Place } from './placesModel';
/** One selection ring and an optional camera link; no queries, watches or animation. */
export class SelectedPlace {
  place: Place | null = null;
  private layer: any = null;
  private view: any = null;
  private ring: any = null;
  private line: any = null;
  private lineUnderlay: any = null;
  private distanceLabel: any = null;
  get stats() { return { selected: !!this.place, linkEnabled: this.link, graphics: Number(!!this.ring) + Number(!!this.line) + Number(!!this.lineUnderlay) + Number(!!this.distanceLabel) }; }
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
    if (!this.link || !this.camera) { if (this.line) this.line.visible = false; if (this.lineUnderlay) this.lineUnderlay.visible = false; if (this.distanceLabel) this.distanceLabel.visible = false; return; }
    const geometry = { type: 'polyline', paths: [[this.camera, [this.place.lon, this.place.lat]]], spatialReference: { wkid: 4326 } };
    if (this.line) {
      this.line.geometry = geometry; this.line.visible = true;
      this.lineUnderlay.geometry = geometry; this.lineUnderlay.visible = true;
    } else {
      this.lineUnderlay = new this.host.modules.Graphic({ geometry, symbol: { type: 'simple-line', color: [13, 38, 43, .75], width: 2.5, style: 'solid' } });
      this.line = new this.host.modules.Graphic({ geometry, symbol: { type: 'simple-line', color: [64, 224, 240, 1], width: 1.25, style: 'dash' } });
      this.layer.addMany([this.lineUnderlay, this.line]);
      // Keep the selected badge above both strokes where they meet the place.
      this.layer.graphics?.reorder?.(this.ring, this.layer.graphics.length - 1);
    }
    const label = cameraLinkDistance(this.camera, [this.place.lon, this.place.lat]);
    if (!label) { if (this.distanceLabel) this.distanceLabel.visible = false; return; }
    const point = new this.host.modules.Point({ longitude: label.lon, latitude: label.lat, spatialReference: { wkid: 4326 } });
    if (this.distanceLabel) {
      this.distanceLabel.geometry = point; this.distanceLabel.visible = true;
      if (this.distanceLabel.symbol.text !== label.text) this.distanceLabel.symbol = this.labelSymbol(label.text);
    } else {
      this.distanceLabel = new this.host.modules.Graphic({ geometry: point, symbol: this.labelSymbol(label.text) }); this.layer.addMany([this.distanceLabel]);
    }
    this.layer.graphics?.reorder?.(this.ring, this.layer.graphics.length - 1);
  }
  private labelSymbol(text: string): any {
    return { type: 'text', text, color: '#16343b', haloColor: '#f3ffff', haloSize: 1.5, yoffset: 8, font: { size: 10, weight: 'bold' } };
  }
  private removeLayer(): void {
    if (this.layer) { if (!this.view?.destroyed) this.view?.map?.remove(this.layer); if (!this.layer.destroyed) this.layer.destroy(); }
    this.layer = null; this.view = null; this.ring = null; this.line = null; this.lineUnderlay = null; this.distanceLabel = null;
  }
}
