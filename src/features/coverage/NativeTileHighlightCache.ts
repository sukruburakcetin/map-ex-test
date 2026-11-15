export interface NativeHighlightLayer { visible: boolean; destroy(): void }
export interface NativeHighlightHost<L> {
  create(style: any, id: string): L;
  attach(layer: L): void;
  remove(layer: L): void;
}

/** SceneView rasterizes tile symbols onto terrain, including their scale and softness.
 * Keep that renderer for highlight fidelity, but never restyle it or the base coverage.
 * Two fixed-style layers per role bound GPU resources and make recent targets reusable.
 */
export class NativeTileHighlightCache<L extends NativeHighlightLayer> {
  private entries = new Map<string, { layer: L; role: 'selected' | 'hover' }>();
  constructor(private host: NativeHighlightHost<L>, private style: any) {}
  show(role: 'selected' | 'hover', sequenceId: string | null): void {
    const key = sequenceId ? `${role}:${sequenceId}` : null;
    for (const [entryKey, entry] of this.entries) if (entry.role === role) entry.layer.visible = entryKey === key;
    if (!key || !sequenceId) return;
    let entry = this.entries.get(key);
    if (entry) this.entries.delete(key);
    else {
      const layers = this.style.layers.filter((layer: any) => layer['source-layer'] === 'sequence'
        || (role === 'selected' && layer['source-layer'] === 'image')).map((layer: any) => ({
          ...layer,
          id: `${layer.id}-${role}`,
          filter: ['all', ...(layer.filter ? [layer.filter] : []),
            ['==', layer['source-layer'] === 'image' ? 'sequence_id' : 'id', sequenceId]],
          paint: { ...layer.paint, ...(role === 'hover' ? { 'line-color': '#00ff88', 'line-width': 6, 'line-opacity': 1 }
            : { [layer.type === 'line' ? 'line-color' : 'circle-color']: '#0000ff' }) },
        }));
      const layer = this.host.create({ ...this.style, layers }, `mapillary-cached-${role}-${sequenceId}`);
      try { this.host.attach(layer); } catch (error) { layer.destroy(); throw error; }
      entry = { layer, role };
    }
    this.entries.set(key, entry); entry.layer.visible = true;
    const roleKeys = [...this.entries].filter(([, entry]) => entry.role === role).map(([key]) => key);
    while (roleKeys.length > 2) {
      const oldest = roleKeys.shift()!, retired = this.entries.get(oldest)!;
      this.entries.delete(oldest); this.host.remove(retired.layer); retired.layer.destroy();
    }
  }
  dispose(): void {
    for (const { layer } of this.entries.values()) { this.host.remove(layer); layer.destroy(); }
    this.entries.clear();
  }
}
