interface GraphicsView<G> { graphics: { add(graphic: G): unknown; remove(graphic: G): unknown; forEach(callback: (graphic: G) => void): void }; }
interface LayerMap<L> { layers: { forEach(callback: (layer: L) => void): void }; remove(layer: L): unknown; }

/** Ownership is per widget instance. Weak sets do not retain retired SDK resources. */
export class OwnedMapResources<G extends object, L extends object> {
  private readonly graphics = new WeakSet<G>();
  private readonly layers = new WeakSet<L>();

  addGraphic(view: GraphicsView<G>, graphic: G): void {
    this.graphics.add(graphic);
    view.graphics.add(graphic);
  }

  ownLayer<T extends L>(layer: T): T {
    this.layers.add(layer);
    return layer;
  }

  clearGraphics(view?: GraphicsView<G> | null): void {
    if (!view) return;
    const owned: G[] = [];
    view.graphics.forEach(graphic => { if (this.graphics.has(graphic)) owned.push(graphic); });
    owned.forEach(graphic => view.graphics.remove(graphic));
  }

  removeLayers(map?: LayerMap<L> | null): void {
    if (!map) return;
    const owned: L[] = [];
    map.layers.forEach(layer => { if (this.layers.has(layer)) owned.push(layer); });
    owned.forEach(layer => map.remove(layer));
  }
}
