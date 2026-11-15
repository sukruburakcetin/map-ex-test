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
  private communityCategories: readonly {name:string;color:string}[] = [];
  private workspaceName = '';
  private map: NonNullable<SymbolLegendView<L>["map"]> | null = null;
  private readonly createLayer: (properties: any) => L;
  constructor(createLayer: (properties: any) => L, private readonly l10n: Presentation = englishPresentation) { this.createLayer = createLayer; }

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
      id: `mapillary-symbol-legend-${widgetId || "explorer"}`, title: this.l10n.text("Mapillary Explorer Symbols"),
      source: [], fields: [{ name: "OBJECTID", type: "oid" }, { name: "symbol_role", type: "string" }],
      objectIdField: "OBJECTID", geometryType: "point", spatialReference: { wkid: 4326 },
      popupEnabled: false, legendEnabled: true,
      renderer: { type: "unique-value", field: "symbol_role", defaultSymbol: null,
        uniqueValueInfos: [
          { value: "active", label: this.l10n.text("Active Image"), symbol: { type: "simple-marker", color: "#00ff00", size: 9, outline: { color: "white", width: 1 } } },
          { value: "sequence", label: this.l10n.text("Nearby Frames"), symbol: { type: "simple-marker", color: "blue", size: 7, outline: { color: "yellow", width: 1 } } },
          { value: "hover", label: this.l10n.text("Hovered Image"), symbol: { type: "simple-marker", color: "brown", size: 7, outline: { color: "white", width: 1 } } },
          { value: "first", label: this.l10n.text("First Selected Image"), symbol: { type: "simple-marker", color: [0,0,0,0], size: 7, outline: { color: "cyan", width: 1.5 } } },
          { value: "next", label: this.l10n.text("Next Frame"), symbol: { type: "simple-marker", color: "yellow", size: 7, outline: { color: "orange", width: 1 } } },
          { value: "note", label: this.l10n.text("Field Note"), symbol: { type: "simple-marker", style: "diamond", color: "#f5a623", size: 7, outline: { color: "white", width: 1 } } },
        ] },
    });
    this.map = map;
    try { map.add(this.layer); }
    catch (error) {
      try { this.clear(); } catch (_) {}
      throw error;
    }
  }

  /** Add category-matched workspace keys without copying contribution geometry.
   * User category names remain literal; built-in role labels retain localization.
   */
  setCommunityCategories(categories: readonly {name:string;color:string}[], workspaceName: string): void {
    this.communityCategories=categories;this.workspaceName=workspaceName;
    const layer=this.layer as any;if(!layer)return;
    const renderer=layer.renderer?.clone?.()||layer.renderer;if(!renderer?.uniqueValueInfos)return;
    renderer.uniqueValueInfos=[...renderer.uniqueValueInfos.filter((entry:any)=>!String(entry.value).startsWith('community:')),
      ...categories.map(category=>({value:'community:'+category.name,label:`${this.l10n.text('Workspace contributions')} · ${workspaceName} · ${category.name}`,
        symbol:{type:'simple-marker',style:'diamond',color:category.color,size:9,outline:{color:'white',width:1.5}}}))];
    layer.renderer=renderer;
  }

  /** Remove the legend from the original owning view, then destroy its layer.
   * Callers keep the existing clear order on view changes, hideLegend and widget teardown.
   */
  refreshLocale(): void {
    const layer = this.layer as any;
    if (!layer) return;
    layer.title = this.l10n.text('Mapillary Explorer Symbols');
    const renderer = layer.renderer?.clone?.() || layer.renderer;
    if (!renderer?.uniqueValueInfos) return;
    const labels: Record<string,string> = {active:'Active Image',sequence:'Nearby Frames',hover:'Hovered Image',first:'First Selected Image',next:'Next Frame',note:'Field Note'};
    renderer.uniqueValueInfos = renderer.uniqueValueInfos.map((entry:any)=>({...entry,label:this.l10n.text(labels[entry.value] || entry.label)}));
    layer.renderer = renderer;
    this.setCommunityCategories(this.communityCategories,this.workspaceName);
  }
  clear(): void {
    const layer = this.layer, map = this.map;
    this.layer = null; this.map = null;
    if (layer) {
      try { map?.remove(layer); }
      finally { layer.destroy(); }
    }
  }
}import { Presentation, englishPresentation } from '../../i18n/PresentationText';

