/** Public SDK boundary for updating the paint of existing native tile styles. */
export interface NativeSelectionLayer {
  setPaintProperties(id: string, paint: any): void;
}

/**
 * Recolor existing circles without adding style layers, filters or point Graphics.
 * Membership is evaluated per feature: images use sequence_id, lines use id.
 * A missing or different ID keeps the original color, including date expressions
 * and quality-band paints. Geometry, circle radius, stroke and opacity stay intact.
 */
export class NativeSequenceSelection<L extends NativeSelectionLayer> {
  private layer: L | null = null;
  private templates: any[] = [];
  private sequenceId: string | null | undefined;

  /** Capture unselected paints after each committed loadStyle; the host owns the layer. */
  bind(layer: L, styles: readonly any[]): void {
    this.detach();
    this.layer = layer;
    this.templates = styles.filter(style => style.source === 'turbo' &&
      (style['source-layer'] === 'image' || style['source-layer'] === 'sequence'))
      .map(style => ({ ...style, paint: { ...style.paint } }));
  }

  /** Change only paint, once per sequence; same-sequence playback does no SDK work. */
  select(sequenceId: string | null): void {
    if (!this.layer || this.sequenceId === sequenceId) return;
    for (const original of this.templates) {
      const image = original['source-layer'] === 'image';
      const color = image ? 'circle-color' : 'line-color';
      const property = image ? 'sequence_id' : 'id';
      const paint = { ...original.paint };
      if (sequenceId) paint[color] = ['case', ['==', ['get', property], sequenceId], '#0000ff', original.paint[color]];
      this.layer.setPaintProperties(original.id, paint);
    }
    this.sequenceId = sequenceId;
  }

  /** Release references when replacing styles or views; no mutations to a retiring renderer. */
  detach(): void { this.layer = null; this.templates = []; this.sequenceId = undefined; }
}
