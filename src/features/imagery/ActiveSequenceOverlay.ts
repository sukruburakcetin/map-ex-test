/** Active-sequence layer lifetime and marker index; no requests or playback scheduling. */
export interface SequenceOverlayLayer {
  removeAll(): void;
  destroy(): void;
}
export interface SequenceOverlayView<L> {
  map?: {
    layers: { includes(layer: L): boolean; length: number; getItemAt?(index: number): unknown; toArray(): unknown[] };
    add(layer: L): unknown;
    remove(layer: L): unknown;
    reorder(layer: L, index: number): unknown;
  } | null;
}

export class ActiveSequenceOverlay<L extends SequenceOverlayLayer, G, V extends SequenceOverlayView<L>> {
  layer: L | null = null;
  view: V | null = null;
  readonly points = new Map<string, G>();
  private readonly createLayer: (properties: Record<string, unknown>) => L;

  constructor(createLayer: (properties: Record<string, unknown>) => L) { this.createLayer = createLayer; }

  /** Attach one hidden-list layer to the supplied live view and keep it above other layers.
   * Changing views disposes the old layer and marker index before creating the replacement.
   * The caller supplies a view with a map, matching the runtime's existing precondition.
   */
  ensure(view: V): L {
    if (this.view !== view) this.dispose();
    if (!this.layer) {
      this.view = view;
      this.layer = this.createLayer({ id: 'mapillary-active-sequence', title: 'Active Sequence Images', listMode: 'hide', elevationInfo: { mode: 'on-the-ground' } });
    }
    const map = view.map!;
    if (!map.layers.includes(this.layer)) map.add(this.layer);
    const last = map.layers.getItemAt?.(map.layers.length - 1) ?? map.layers.toArray()[map.layers.length - 1];
    if (last !== this.layer) map.reorder(this.layer, map.layers.length - 1);
    return this.layer;
  }

  /** Remove from the original owner map, release graphics and destroy the layer even if that map detached. */
  dispose(): void {
    if (this.layer) { this.view?.map?.remove(this.layer); this.layer.removeAll(); this.layer.destroy(); }
    this.layer = null; this.view = null; this.points.clear();
  }
}
