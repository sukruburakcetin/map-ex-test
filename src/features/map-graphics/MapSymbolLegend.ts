/** Empty renderer-only layer used by the host legend; no coverage/cloud feature copies. */
export interface SymbolLegendLayer { destroy(): void; }
export interface SymbolLegendView<L> {
  map?: { add(layer: L): unknown; remove(layer: L): unknown } | null;
}

/** Owns the six map-symbol legend entries and removes the layer from its creating view.
 * Titles, labels and symbol properties stay together here. Host layers/renderers are never rewritten.
 * Point-cloud entries are deliberately absent; this owner adds no requests, watchers or timers.
 */
export class MapSymbolLegend<L extends SymbolLegendLayer, V extends SymbolLegendView<L>> {
  layer: L | null = null;
  private map: NonNullable<SymbolLegendView<L>["map"]> | null = null;
  private readonly createLayer: (properties: any) => L;
  constructor(createLayer: (properties: any) => L) { this.createLayer = createLayer; }

  /** Reuse the current view's legend or create its empty client-side FeatureLayer.
   * Widget ID scopes the layer identity; missing IDs retain the existing explorer fallback.
   * Runtime handles SDK readiness and the hideLegend configuration before calling this method.
   */
  sync(view: V, widgetId: string | null | undefined): void {
    const map = view?.map;
    if (!map) { this.clear(); return; }
    if (this.map !== map) this.clear();
    if (this.layer) return;
    // Empty client-side layer: legend renderer only, no coverage feature copies.
    this.layer = this.createLayer({
      id: `mapillary-symbol-legend-${widgetId || "explorer"}`, title: "Mapillary Explorer Symbols",
      source: [], fields: [{ name: "OBJECTID", type: "oid" }, { name: "symbol_role", type: "string" }],
      objectIdField: "OBJECTID", geometryType: "point", spatialReference: { wkid: 4326 },
      popupEnabled: false, legendEnabled: true,
      renderer: { type: "unique-value", field: "symbol_role", defaultSymbol: null,
        uniqueValueInfos: [
          { value: "active", label: "Active Image", symbol: { type: "simple-marker", color: "#00ff00", size: 9, outline: { color: "white", width: 1 } } },
          { value: "sequence", label: "Nearby Frames", symbol: { type: "simple-marker", color: "blue", size: 7, outline: { color: "yellow", width: 1 } } },
          { value: "hover", label: "Hovered Image", symbol: { type: "simple-marker", color: "brown", size: 7, outline: { color: "white", width: 1 } } },
          { value: "first", label: "First Selected Image", symbol: { type: "simple-marker", color: [0,0,0,0], size: 7, outline: { color: "cyan", width: 1.5 } } },
          { value: "next", label: "Next Frame", symbol: { type: "simple-marker", color: "yellow", size: 7, outline: { color: "orange", width: 1 } } },
          { value: "note", label: "Field Note", symbol: { type: "simple-marker", style: "diamond", color: "#f5a623", size: 7, outline: { color: "white", width: 1 } } },
        ] },
    });
    this.map = map;
    try { map.add(this.layer); }
    catch (error) {
      try { this.clear(); } catch (_) {}
      throw error;
    }
  }

  /** Remove the legend from the original owning view, then destroy its layer.
   * Callers keep the existing clear order on view changes, hideLegend and widget teardown.
   */
  clear(): void {
    const layer = this.layer, map = this.map;
    this.layer = null; this.map = null;
    if (layer) {
      try { map?.remove(layer); }
      finally { layer.destroy(); }
    }
  }
}
