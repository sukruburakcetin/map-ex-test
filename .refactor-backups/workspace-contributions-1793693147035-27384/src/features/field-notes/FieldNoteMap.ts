import type { FieldNote } from '../../components/types';
export interface NoteMapResource { destroyed?: boolean; destroy(): void; }
export interface NoteGraphicsLayer<A> extends NoteMapResource { removeAll(): void; add(graphic: A): unknown; }
export interface NoteGroup<L> extends NoteMapResource {
  visible: boolean;
  layers: { includes(layer: L): boolean; add(layer: L): unknown };
}
export interface NoteMapView<G> { type: string; destroyed?: boolean; map?: { add(group: G): unknown; remove(group: G): unknown } | null; }
export interface FieldNoteMapDependencies<G, L, A, V> {
  readContext(): { view: V | null | undefined; ready: boolean; disposed: boolean };
  readNotes(): FieldNote[];
  readShared(): { url?: string; loaded: boolean; view: V | null };
  clearPending(): void;
  loadGroupFactory(): Promise<(properties: { id: string; title: string; visible: boolean; visibilityMode: 'independent' }) => G>;
  loadLayerFactory(): Promise<(properties: { id: string; title: string; elevationInfo?: { mode: 'on-the-ground' } }) => L>;
  /** Capture the live Graphic constructor once after removeAll, before iterating notes. */
  readGraphicFactory(): (note: FieldNote, is3D: boolean) => A;
  highlightNote?(view: V, layer: L, graphic: A, current: () => boolean): Promise<{ remove(): void }>;
}

/** Own the existing note group/local graphics state; Enterprise layers remain runtime-owned children.
 * Preserve original readiness, asynchronous sharing, view/revision guards and error propagation.
 * Workspace navigation additionally owns one transient selection layer; it never saves notes.
 * No service requests, timers, viewer updates or local draw supersession policy are introduced.
 */
export class FieldNoteMap<G extends NoteGroup<L>, L extends NoteGraphicsLayer<A>, A, V extends NoteMapView<G>> {
  private currentGroup: G | null = null;
  private currentLayer: L | null = null;
  private focusedLayer: L | null = null;
  private focusRevision = 0;
  private highlightHandle: { remove(): void } | null = null;
  private focusedNote: FieldNote | null = null;
  private groupView: V | null = null;
  private groupVisible = true;
  private revision = 0;
  private groupLoad: Promise<G | null> | null = null;
  constructor(private readonly dependencies: FieldNoteMapDependencies<G, L, A, V>) {}
  /** Borrow SDK resources for existing Enterprise grouping and pending-marker visibility only. */
  get group(): G | null { return this.currentGroup; }
  get layer(): L | null { return this.currentLayer; }
  /** Last saved visibility, used when no current group exists. */
  get visible(): boolean { return this.groupVisible; }

  /** Reuse the same-view group or await the existing group load before starting another.
   * After module loading, retain revision/live-view/disposal checks before construction/attachment.
   * Replacement saves visibility and removes/destroys the old group on its creating view.
   */
  async ensureGroup(view: V): Promise<G | null> {
    const d = this.dependencies;
    if (this.groupView === view && this.currentGroup && !this.currentGroup.destroyed) return this.currentGroup;
    if (this.groupLoad) { await this.groupLoad; if (this.groupView === view) return this.currentGroup; }
    const revision = this.revision;
    const task = (async () => {
      const create = await d.loadGroupFactory();
      if (revision !== this.revision || view.destroyed || !view.map || d.readContext().view !== view || d.readContext().disposed) return null;
      if (this.currentGroup) {
        this.highlightHandle?.remove();
        this.highlightHandle = null;
        this.focusedLayer = null;
        this.groupVisible = this.currentGroup.visible;
        this.groupView?.map?.remove(this.currentGroup); this.currentGroup.destroy();
      }
      const group = create({ id: 'mapillary-field-notes', title: 'Field Notes', visible: this.groupVisible, visibilityMode: 'independent' });
      this.currentGroup = group; this.groupView = view; view.map.add(group); return group;
    })();
    this.groupLoad = task;
    try { return await task; } finally { if (this.groupLoad === task) this.groupLoad = null; }
  }

  /** Invalidate pending group attachment, stop the pending marker, then remove/destroy the group.
   * Keep original visibility carryover, null/reset order and synchronous failure boundaries.
   */
  clear(): void {
    ++this.revision;
    this.clearHighlight();
    this.focusedLayer = null;
    this.focusedNote = null;
    this.dependencies.clearPending();
    if (this.currentGroup) {
      this.groupVisible = this.currentGroup.visible;
      this.groupView?.map?.remove(this.currentGroup); this.currentGroup.destroy();
    }
    this.currentGroup = null; this.groupView = null; this.currentLayer = null;
  }

  /** Release native selection and retire any pending highlight/popup work.
   * Keep the normal workspace marker available for later clicks.
   */
  clearHighlight(): void {
    ++this.focusRevision;
    this.highlightHandle?.remove();
    this.highlightHandle = null;
  }

  /** Include note layers in SDK picking only while they contain selectable notes. */
  get hasPickTargets(): boolean { return !!this.focusedNote || this.dependencies.readNotes().length > 0; }

  /** Resolve only our own note graphics, preserving external feature-pick priority. */
  noteForGraphic(graphic: { layer?: L; attributes?: { id?: string } }): FieldNote | null {
    const id = graphic.attributes?.id;
    if (graphic.layer === this.focusedLayer && id === this.focusedNote?.id) return this.focusedNote;
    return graphic.layer === this.currentLayer ? this.dependencies.readNotes().find(note => note.id === id) || null : null;
  }

  /** Show one navigation-only selected note without adding it to local storage.
   * A dedicated ground layer survives local redraws. New selections, cleanup and
   * view changes invalidate pending SDK loads so an older marker cannot reappear.
   * Passing null explicitly clears selection; Local/Enterprise targets are never saved.
   */
  async focusNote(note: FieldNote | null): Promise<void> {
    this.clearHighlight();
    const selection = this.focusRevision;
    this.focusedNote = note;
    this.focusedLayer?.removeAll();
    if (!note || !Number.isFinite(note.lon) || !Number.isFinite(note.lat)) return;
    const d = this.dependencies, context = d.readContext(), view = context.view;
    if (!view?.map || view.destroyed || !context.ready || context.disposed) return;
    const revision = this.revision;
    const current = () => selection === this.focusRevision && revision === this.revision
      && d.readContext().view === view && !d.readContext().disposed && !view.destroyed;
    const group = await this.ensureGroup(view);
    if (!group || !current()) return;
    if (!this.focusedLayer || this.focusedLayer.destroyed) {
      const create = await d.loadLayerFactory();
      if (!current()) return;
      this.focusedLayer = create({ id: 'workspace-note-selection', title: 'Selected note', elevationInfo: { mode: 'on-the-ground' } });
    }
    const layer = this.focusedLayer;
    if (!group.layers.includes(layer)) group.layers.add(layer);
    layer.removeAll();
    const graphic = d.readGraphicFactory()(note, view.type === '3d');
    layer.add(graphic);
    if (d.highlightNote) {
      const handle = await d.highlightNote(view, layer, graphic, current);
      if (current()) this.highlightHandle = handle; else handle.remove();
    }
  }

  /** Rebuild local graphics using the existing layer/group readiness and live-view checks.
   * Capture 2D/3D before SDK readiness; read current notes/shared-layer state when drawing.
   * Suppress a local shared copy only for the same normalized URL, loaded Enterprise layer and view.
   * Geometry/symbol/popup descriptors remain in mapGraphic.ts; point/note objects are not copied here.
   */
  async draw(): Promise<void> {
    const d = this.dependencies;
    const view = d.readContext().view;
    if (!view?.map || view.destroyed || !d.readContext().ready) return;
    const is3D = view.type === '3d';
    if (!this.currentLayer) {
      const create = await d.loadLayerFactory();
      if (d.readContext().view !== view || !view.map || view.destroyed) return;
      if (!this.currentLayer) this.currentLayer = create({ id: 'field-notes-layer', title: 'Local Notes' });
    }
    const group = await this.ensureGroup(view);
    if (!group || d.readContext().view !== view || !this.currentLayer || this.currentLayer.destroyed) return;
    if (!group.layers.includes(this.currentLayer)) group.layers.add(this.currentLayer);
    this.currentLayer.removeAll();
    const createGraphic = d.readGraphicFactory();
    d.readNotes().forEach(note => {
      if (note.sharedStatus === 'shared') {
        const shared = d.readShared();
        if (note.sharedLayerUrl === shared.url?.trim().replace(/\/$/, '') && shared.loaded && shared.view === view) return;
      }
      const graphic = createGraphic(note, is3D);
      this.currentLayer!.add(graphic);
    });
  }
}
