/** Solar map-layer ownership and update generation. SDK loading and solar geometry remain runtime-coordinated. */
export interface SolarMap<L> {
  layers: { includes(layer: L): boolean; length: number };
  add(layer: L): unknown;
  remove(layer: L): unknown;
  reorder(layer: L, index: number): unknown;
}
export interface SolarMapView<L> { map?: SolarMap<L> | null; }
export interface SolarLayer { removeAll(): void; destroy(): void; }

export class SolarMapOverlay<L extends SolarLayer, V extends SolarMapView<L>> {
  layer: L | null = null;
  view: V | null = null;
  revision = 0;

  /** Record the creating view before constructing the original ground-draped solar layer. */
  create(view: V, createLayer: (properties: any) => L): void {
    this.view = view;
    this.layer = createLayer({ id: 'solar-layer', title: 'Mapillary Solar and Shadow Modeling', elevationInfo: { mode: 'on-the-ground' } });
  }

  /** Prepare the existing layer using the map captured before SDK loading, preserving attachment order. */
  prepare(map: SolarMap<L> | null | undefined): void {
    const layer = this.layer!;
    if (!map!.layers.includes(layer)) map!.add(layer);
    map!.reorder(layer, map!.layers.length);
    layer.removeAll();
  }

  /** Invalidate pending updates, release the layer from its creating view and return the lighting owner.
   * The runtime uses the returned view to restore native lighting and remove its ShadowCast widget.
   */
  clear(fallbackView: V | undefined): V | undefined {
    ++this.revision;
    const ownerView = this.view || fallbackView;
    if (this.layer) {
      ownerView?.map?.remove(this.layer);
      this.layer.destroy(); this.layer = null;
    }
    this.view = null;
    return ownerView;
  }
}
