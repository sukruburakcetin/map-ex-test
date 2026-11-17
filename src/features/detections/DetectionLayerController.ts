import { DEFAULT_FILTER_LABELS, LAYER_IDS, STYLE_LAYER_IDS, STYLE_SOURCE_IDS } from '../../utils/constants';
import { categoryDisplayStyle, type CategoryDisplayMode, type MapCategoryFilter } from './categorySelection';
import { detectionLabelStyle } from './detectionLabels';

export type DetectionKind = 'signs' | 'objects';
export interface DetectionAppearance {
  scale: number;
  opacity: number;
  reduceOverlap: boolean;
  labels: boolean;
  mode: CategoryDisplayMode;
}
export interface DetectionTileLayer {
  style: any;
  destroyed?: boolean;
  visible: boolean;
  opacity: number;
  load(): Promise<unknown>;
  getLayoutProperties(id: string): any;
  setLayoutProperties(id: string, properties: any): void;
  destroy(): void;
}
export interface DetectionLayerView<L> {
  destroyed?: boolean;
  map: {
    layers: { includes(layer: L): boolean };
    findLayerById(id: string): unknown;
    add(layer: L): unknown;
    remove(layer: L): unknown;
  };
}
export interface DetectionLayerHost<L extends DetectionTileLayer, V extends DetectionLayerView<L>> {
  view(): V | null;
  disposed(): boolean;
  appearance(kind: DetectionKind): DetectionAppearance;
  selection(kind: DetectionKind): MapCategoryFilter;
  codes(kind: DetectionKind): Iterable<string>;
  source(kind: DetectionKind): { tiles: string; sprite: string };
  create(properties: { id: string; title: string; style: any }): L;
  own(layer: L): void;
  loading(kind: DetectionKind, view: V, layer: L): void;
  clearLoading(kind: DetectionKind): void;
  error(kind: DetectionKind, phase: 'filter' | 'appearance', error: unknown): void;
}

const definitions = {
  signs: { id: LAYER_IDS.TRAFFIC_SIGNS_VT, style: STYLE_LAYER_IDS.TRAFFIC_SIGNS_ICONS,
    source: STYLE_SOURCE_IDS.TRAFFIC_SIGNS, sourceLayer: 'traffic_sign',
    title: 'Mapillary Traffic Signs Coverage', all: DEFAULT_FILTER_LABELS.TRAFFIC_SIGNS },
  objects: { id: LAYER_IDS.OBJECTS_VT, style: STYLE_LAYER_IDS.OBJECTS_ICONS,
    source: STYLE_SOURCE_IDS.OBJECTS, sourceLayer: 'point',
    title: 'Mapillary Objects Coverage', all: DEFAULT_FILTER_LABELS.OBJECTS },
} as const;

/** Owns only detection tiles. UI state, picking and exports remain host-owned. */
export class DetectionLayerController<L extends DetectionTileLayer, V extends DetectionLayerView<L>> {
  private records = new Map<DetectionKind, { layer: L; view: V | null; map: V['map'] | null }>();
  private owned = new WeakSet<L>();
  constructor(private readonly host: DetectionLayerHost<L, V>) {}

  layer(kind: DetectionKind): L | null { return this.records.get(kind)?.layer ?? null; }

  private configuredStyle(kind: DetectionKind, style: any): any {
    const definition = definitions[kind], appearance = this.host.appearance(kind);
    const next = JSON.parse(JSON.stringify(style));
    const icons = next.layers.find((layer: any) => layer.id === definition.style);
    if (icons) {
      const display = categoryDisplayStyle(this.host.selection(kind), definition.all, appearance.mode);
      if (display.filter) icons.filter = display.filter;
      else delete icons.filter;
      icons.paint = { ...icons.paint, 'icon-opacity': display.opacity };
      icons.layout = { ...icons.layout, 'icon-size': .5 * appearance.scale,
        'icon-allow-overlap': !appearance.reduceOverlap, 'icon-ignore-placement': !appearance.reduceOverlap };
    }
    return detectionLabelStyle(next, definition.style, kind, this.host.codes(kind),
      this.host.selection(kind), definition.all, appearance.labels);
  }

  private create(kind: DetectionKind, style: any): L {
    const definition = definitions[kind];
    const layer = this.host.create({ id: definition.id, title: definition.title, style });
    this.owned.add(layer);
    this.host.own(layer);
    layer.opacity = this.host.appearance(kind).opacity;
    return layer;
  }

  initialize(kind: DetectionKind): L | null {
    if (this.host.disposed()) return null;
    const definition = definitions[kind], source = this.host.source(kind);
    const style = this.configuredStyle(kind, { version: 8, sprite: source.sprite,
      sources: { [definition.source]: { type: 'vector', tiles: [source.tiles], minzoom: 14, maxzoom: 14 } },
      layers: [{ id: definition.style, source: definition.source, 'source-layer': definition.sourceLayer,
        type: 'symbol', layout: { 'icon-image': ['get', 'value'] } }] });
    const layer = this.create(kind, style);
    this.reset(kind);
    this.records.set(kind, { layer, view: null, map: null });
    return layer;
  }

  filter(kind: DetectionKind): L | null {
    const record = this.records.get(kind), view = this.host.view();
    if (!record || !view || view.destroyed || this.host.disposed()) return null;
    let replacement: L | null = null;
    try {
      replacement = this.create(kind, this.configuredStyle(kind, record.layer.style));
      // Keep native layer replacement order; retire the old renderer only after add succeeds.
      if (record.map?.layers.includes(record.layer)) record.map.remove(record.layer);
      view.map.add(replacement);
      this.records.set(kind, { layer: replacement, view, map: view.map });
      this.release(record);
      this.host.loading(kind, view, replacement);
      void this.applyAppearance(kind);
      return replacement;
    } catch (error) {
      if (replacement && this.records.get(kind)?.layer !== replacement) {
        if (view.map.layers.includes(replacement)) view.map.remove(replacement);
        replacement.destroy();
      }
      if (this.records.get(kind) === record && record.map && !record.layer.destroyed && !record.map.layers.includes(record.layer)) record.map.add(record.layer);
      this.host.error(kind, 'filter', error);
      return null;
    }
  }

  sync(kind: DetectionKind, active: boolean): void {
    const view = this.host.view();
    if (!view || view.destroyed || this.host.disposed()) { this.host.clearLoading(kind); return; }
    const record = this.records.get(kind);
    if (!active) {
      this.host.clearLoading(kind);
      if (record && this.owned.has(record.layer)) {
        if (record.map?.layers.includes(record.layer)) record.map.remove(record.layer);
        this.records.set(kind, {layer:record.layer,view:null,map:null});
      } else this.records.delete(kind);
      return;
    }
    const existing = view.map.findLayerById(definitions[kind].id) as L | undefined;
    let layer = existing && !existing.destroyed ? existing : null;
    if (layer && record?.layer !== layer) {
      if (record) this.release(record);
      this.records.set(kind, { layer, view, map: view.map });
    } else if (!layer) {
      layer = record && !record.layer.destroyed && (!record.map || record.map === view.map)
        ? record.layer : this.initialize(kind);
      if (!layer) return;
      view.map.add(layer);
      this.records.set(kind, { layer, view, map: view.map });
    } else this.records.set(kind, { layer, view, map: view.map });
    layer.visible = true;
    const appearance = this.host.appearance(kind);
    if (this.host.selection(kind) || appearance.labels) this.filter(kind);
    else {
      void this.applyAppearance(kind);
      this.host.loading(kind, view, layer);
    }
  }

  setOpacity(kind: DetectionKind, opacity: number): void {
    const layer = this.layer(kind);
    if (layer && !layer.destroyed) layer.opacity = opacity;
  }

  async applyAppearance(kind: DetectionKind): Promise<void> {
    const record = this.records.get(kind), layer = record?.layer, view = this.host.view(), map = view?.map;
    if (!layer || layer.destroyed || this.host.disposed()) return;
    layer.opacity = this.host.appearance(kind).opacity;
    const current = () => !this.host.disposed() && !layer.destroyed && this.records.get(kind) === record &&
      this.host.view() === view && view?.map === map && !view?.destroyed;
    try {
      await layer.load();
      if (!current()) return;
      const appearance = this.host.appearance(kind), id = definitions[kind].style;
      layer.setLayoutProperties(id, { ...layer.getLayoutProperties(id), 'icon-size': .5 * appearance.scale,
        'icon-allow-overlap': !appearance.reduceOverlap, 'icon-ignore-placement': !appearance.reduceOverlap });
    } catch (error) { if (current()) this.host.error(kind, 'appearance', error); }
  }

  private release(record: { layer: L; map: V['map'] | null }): void {
    if (this.owned.has(record.layer) && record.map?.layers.includes(record.layer)) record.map.remove(record.layer);
    if (this.owned.has(record.layer) && !record.layer.destroyed) record.layer.destroy();
  }

  reset(kind: DetectionKind): void {
    const record = this.records.get(kind);
    this.records.delete(kind);
    this.host.clearLoading(kind);
    if (record) this.release(record);
  }

  clear(): void { this.reset('signs'); this.reset('objects'); }
}
