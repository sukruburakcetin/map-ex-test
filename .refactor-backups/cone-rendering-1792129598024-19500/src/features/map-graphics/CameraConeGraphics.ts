/** Camera-cone layer and graphic membership; heading/terrain geometry stays runtime-owned. */
export interface ConeLayer {
  removeAll(): void;
  destroy(): void;
}
export interface ConeView<G, L> {
  map?: {
    findLayerById(id: string): unknown;
    layers: { includes(layer: L): boolean };
    add(layer: L): unknown;
    remove(layer: L): unknown;
  } | null;
  graphics: { forEach(callback: (graphic: G) => void): void; remove(graphic: G): unknown };
}

export class CameraConeGraphics<G, L extends ConeLayer, V extends ConeView<G, L>> {
  layer: L | null = null;
  graphic: G | null = null;
  parts: G[] = [];
  private readonly createLayer: (properties: any) => L;

  constructor(createLayer: (properties: any) => L) { this.createLayer = createLayer; }

  /** Reuse the existing camera-cone layer or create it with the original terrain-relative settings. */
  ensure(view: V): L {
    const map = view.map!;
    if (!this.layer) {
      const existing = map.findLayerById('camera-cone-layer') as L;
      if (existing) this.layer = existing;
      else {
        this.layer = this.createLayer({ id: 'camera-cone-layer', title: 'Mapillary Camera Cone', elevationInfo: { mode: 'relative-to-ground' } });
        map.add(this.layer);
      }
    }
    if (!map.layers.includes(this.layer)) map.add(this.layer);
    return this.layer;
  }

  /** Clear cone membership and tagged legacy view graphics without destroying the reusable layer. */
  clear(view: V | undefined): void {
    this.graphic = null; this.parts = [];
    if (this.layer) this.layer.removeAll();
    if (view) {
      const toRemove: G[] = [];
      view.graphics.forEach(graphic => { if ((graphic as any).__isCone) toRemove.push(graphic); });
      toRemove.forEach(graphic => view.graphics.remove(graphic));
    }
  }

  /** Match the view-transfer layer teardown using the caller-supplied map and existing error containment.
   * Layer disposal and membership clearing remain separate operations, as in the original runtime.
   */
  dispose(view: V): void {
    if (this.layer) {
      try {
        const map = view.map;
        if (map && map.layers.includes(this.layer)) map.remove(this.layer);
        this.layer.destroy();
      } catch { /* Preserve best-effort SDK teardown. */ }
      this.layer = null;
    }
  }
}
