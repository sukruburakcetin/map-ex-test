/** Public SDK boundary shared by MapView and SceneView vector-tile renderers. */
export interface NativeSelectionLayer {
  getStyleLayerId(index: number): string | null;
  getStyleLayerIndex(id: string): number;
  setStyleLayer(style: any, index?: number): void;
  deleteStyleLayer(id: string): void;
  loadStyle(style: any): Promise<unknown>;
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
  private sceneStyle: any = null;
  private generation = 0;
  private styleTask: Promise<void> = Promise.resolve();

  /** Capture unselected paints after each committed loadStyle; the host owns the layer. */
  bind(layer: L, styles: readonly any[], sceneStyle?: any): void {
    this.detach();
    this.layer = layer;
    this.sceneStyle = sceneStyle ? structuredClone(sceneStyle) : null;
    this.templates = styles.filter(style => style.source === 'turbo' &&
      (style['source-layer'] === 'image' || style['source-layer'] === 'sequence'))
      .map(style => ({ ...style, paint: { ...style.paint } }));
  }

  /** Change native colors only for the selected sequence; hover has its own green tile line. */
  select(sequenceId: string | null): void | Promise<void> {
    const ids = sequenceId ? [sequenceId] : [];
    const key = JSON.stringify(ids);
    if (!this.layer || this.selectionKey === key) return this.sceneStyle ? this.styleTask : undefined;
    if (!ids.length && this.selectionKey === undefined) { this.selectionKey = key; return; }
    if (this.sceneStyle) {
      // SceneView rebuilds its renderer on every individual style-layer event.
      // Partial updates can lose buckets/materials even though the final JSON is
      // correct. Commit one complete style and serialize selection changes.
      const layer = this.layer, generation = this.generation;
      const style = structuredClone(this.sceneStyle);
      style.layers = style.layers.flatMap((original: any) => {
        if (!ids.length || !this.templates.some(template => template.id === original.id)) return [original];
        const property = original['source-layer'] === 'image' ? 'sequence_id' : 'id';
        const color = original.type === 'circle' ? 'circle-color' : 'line-color';
        const filter = (membership: any[]) => original.filter ? ['all', original.filter, membership] : membership;
        return [{ ...original, filter: filter(['!in', property, ...ids]) },
          { ...original, id: `${original.id}-sequence-blue`, filter: filter(['in', property, ...ids]),
            paint: { ...original.paint, [color]: '#0000ff' } }];
      });
      this.selectionKey = key;
      this.styleTask = this.styleTask.then(async () => {
        if (this.generation !== generation || this.selectionKey !== key) return;
        await layer.loadStyle(style);
      }).catch(error => {
        if (this.generation !== generation || this.selectionKey !== key) return;
        this.selectionKey = undefined;
        if (error?.name !== 'AbortError') console.warn('[Mapillary selection] Coverage style update failed:', error);
      });
      return this.styleTask;
    }
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
  detach(): void { this.generation++; this.layer = null; this.templates = []; this.selectionKey = undefined; this.sceneStyle = null; }
}
