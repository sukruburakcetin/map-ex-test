/** Public ArcGIS vector-style boundary; no tile requests or Graphic allocation. */
export interface NativeSelectionLayer {
  getStyleLayerIndex(id: string): number;
  setStyleLayer(style: any, index?: number): void;
  deleteStyleLayer(id: string): void;
}

/**
 * Recolor the selected sequence using mutually exclusive native style filters.
 * Image tiles identify membership with sequence_id; sequence lines use id.
 * Selected and unselected partitions share the source geometry, zoom limits,
 * radius, stroke and opacity. Only their fill/line color differs. Existing
 * quality/date/ownership filters remain authoritative, including missing scores.
 */
export class NativeSequenceSelection<L extends NativeSelectionLayer> {
  private layer: L | null = null;
  private templates: any[] = [];
  private sequenceId: string | null | undefined;

  /** Bind only after loadStyle resolves. Discard the retiring layer without restyling it. */
  bind(layer: L, styles: readonly any[]): void {
    this.detach();
    this.layer = layer;
    this.templates = styles.filter(style => style.source === 'turbo' &&
      (style['source-layer'] === 'image' || style['source-layer'] === 'sequence'));
  }

  /** Update once per sequence change, never once per image/frame or pointer move. */
  select(sequenceId: string | null): void {
    if (!this.layer || this.sequenceId === sequenceId) return;
    const layer = this.layer;
    for (const original of this.templates) {
      const selectedId = `${original.id}-selected`;
      if (!sequenceId) {
        layer.setStyleLayer(original);
        if (layer.getStyleLayerIndex(selectedId) >= 0) layer.deleteStyleLayer(selectedId);
        continue;
      }
      const property = original['source-layer'] === 'image' ? 'sequence_id' : 'id';
      const constrain = (condition: any[]) => original.filter ? ['all', original.filter, condition] : condition;
      layer.setStyleLayer({ ...original, filter: constrain(['!=', property, sequenceId]) });
      const color = original.type === 'circle' ? 'circle-color' : 'line-color';
      layer.setStyleLayer({ ...original, id: selectedId, filter: constrain(['==', property, sequenceId]),
        paint: { ...original.paint, [color]: '#0000ff' } }, layer.getStyleLayerIndex(original.id) + 1);
    }
    this.sequenceId = sequenceId;
  }

  /** Release references on style reload, view transfer or teardown; host owns layer disposal. */
  detach(): void { this.layer = null; this.templates = []; this.sequenceId = undefined; }
}
