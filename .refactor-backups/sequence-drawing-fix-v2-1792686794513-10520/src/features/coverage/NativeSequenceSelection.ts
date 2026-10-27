/** Public SDK boundary shared by MapView and SceneView vector-tile renderers. */
export interface NativeSelectionLayer {
  getStyleLayerId(index: number): string | null;
  getStyleLayerIndex(id: string): number;
  setStyleLayer(style: any, index?: number): void;
  deleteStyleLayer(id: string): void;
}

/**
 * Partition native tile features into their original style and a blue style.
 * Membership is evaluated per feature: images use sequence_id, lines use id.
 * Keep base paints unchanged: changing constant colors to data-driven paints at
 * selection time can invalidate SceneView's coverage materials. Disjoint classic
 * filters avoid that transition and avoid drawing selected features twice.
 * Copies retain geometry, zoom limits, filters, radius, width, stroke and opacity.
 */
export class NativeSequenceSelection<L extends NativeSelectionLayer> {
  private layer: L | null = null;
  private templates: any[] = [];
  private selectionKey: string | undefined;

  /** Capture unselected paints after each committed loadStyle; the host owns the layer. */
  bind(layer: L, styles: readonly any[]): void {
    this.detach();
    this.layer = layer;
    this.templates = styles.filter(style => style.source === 'turbo' &&
      (style['source-layer'] === 'image' || style['source-layer'] === 'sequence'))
      .map(style => ({ ...style, paint: { ...style.paint } }));
  }

  /** Hover and current selection can coexist; mouseout retains the selected sequence. */
  select(sequenceId: string | null, hoveredSequenceId: string | null = null): void {
    const ids = Array.from(new Set([sequenceId, hoveredSequenceId].filter((id): id is string => !!id))).sort();
    const key = JSON.stringify(ids);
    if (!this.layer || this.selectionKey === key) return;
    if (!ids.length && this.selectionKey === undefined) { this.selectionKey = key; return; }
    for (const original of this.templates) {
      const image = original['source-layer'] === 'image';
      const color = image ? 'circle-color' : 'line-color';
      const property = image ? 'sequence_id' : 'id';
      const highlightId = `${original.id}-sequence-blue`;
      if (!ids.length) {
        if (this.layer.getStyleLayerIndex(highlightId) >= 0) this.layer.deleteStyleLayer(highlightId);
        this.layer.setStyleLayer(original);
        continue;
      }
      const filter = (membership: any[]) => original.filter ? ['all', original.filter, membership] : membership;
      this.layer.setStyleLayer({ ...original, filter: filter(['!in', property, ...ids]) });
      const nextIndex = this.layer.getStyleLayerIndex(original.id) + 1;
      // ArcGIS clamps an out-of-range insertion index to the last existing layer.
      // Omit the index to append after the final original instead of before it.
      const index = this.layer.getStyleLayerId(nextIndex) == null ? undefined : nextIndex;
      this.layer.setStyleLayer({ ...original, id: highlightId, filter: filter(['in', property, ...ids]),
        paint: { ...original.paint, [color]: '#0000ff' } }, index);
    }
    this.selectionKey = key;
  }

  /** Release references when replacing styles or views; no mutations to a retiring renderer. */
  detach(): void { this.layer = null; this.templates = []; this.selectionKey = undefined; }
}
