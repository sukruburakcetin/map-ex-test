import type { FieldNote } from '../../components/types';

/** Pending map coordinates in WGS84 degrees, optional source altitude in meters and clicked image ID. */
export interface PendingFieldNote { lon: number; lat: number; alt?: number; imageId: string | null; }
export type FieldNoteDraftNotice = 'mode' | 'saved';
export interface FieldNoteDraftState {
  isAnnotationMode: boolean;
  imageId: string | null;
  pendingFieldNote: PendingFieldNote | null;
  fieldNotes: FieldNote[];
}
export interface FieldNoteDraftPatch {
  isAnnotationMode?: boolean; pendingFieldNote?: PendingFieldNote | null;
  fieldNotesListOpen?: boolean; nearbyStripOpen?: boolean; fieldNotes?: FieldNote[];
}
export interface FieldNoteDraftDependencies {
  readState(): FieldNoteDraftState;
  setState(update: FieldNoteDraftPatch | ((previous: FieldNoteDraftState) => FieldNoteDraftPatch), callback?: () => void): void;
  drawRipple(lon: number, lat: number, color: [number, number, number], opacity: number, outlineWidth: number): void;
  drawPending(lon: number, lat: number, alt?: number): void;
  clearPending(): void;
  persist(notes: FieldNote[]): void;
  drawMapNotes(): void;
  updateViewerNotes(): void;
  /** Start the existing shared-note publication without awaiting/retrying it here. */
  publish(id: string): void;
  notify(kind: FieldNoteDraftNotice, enabled?: boolean): void;
  now(): number;
  random(): number;
}

/** Coordinate annotation/draft intent while React state, marker resources and persistence stay owned.
 * No local draft mirror, storage, layer, timer, request or publication policy is introduced.
 */
export class FieldNoteDraft {
  constructor(private readonly dependencies: FieldNoteDraftDependencies) {}

  /** Toggle from React previous state, reset draft/list/nearby flags, then report live mode state.
   * Preserve the original behavior: toggling does not add an explicit pending-marker cleanup call.
   */
  toggle(): void {
    const d = this.dependencies;
    d.setState(previous => ({ isAnnotationMode: !previous.isAnnotationMode,
      pendingFieldNote: null, fieldNotesListOpen: false, nearbyStripOpen: false }),
      () => d.notify('mode', d.readState().isAnnotationMode));
  }

  /** Draw ripple, draw the pending marker, then capture the current image ID into the draft.
   * Preserve optional altitude and coordinate values; projection/marker lifecycle stay outside.
   */
  open(lon: number, lat: number, alt?: number): void {
    const d = this.dependencies;
    d.drawRipple(lon, lat, [245, 166, 35], 0.7, 2);
    d.drawPending(lon, lat, alt);
    d.setState({ pendingFieldNote: { lon, lat, alt, imageId: d.readState().imageId } });
  }

  /** Capture the pending draft, clear its marker, and create the same manual-note shape and ID.
   * Keep two clock reads (ID and createdAt), the rounded random suffix and existing array append.
   * The state callback persists the captured array, refreshes map/viewer, optionally publishes,
   * then emits saved feedback. Persistence return values and publication promises remain unawaited.
   */
  submit(category: string, note: string, share = false): void {
    const d = this.dependencies;
    const { pendingFieldNote } = d.readState();
    if (!pendingFieldNote) return;
    d.clearPending();
    const newNote: FieldNote = {
      id: `note_${d.now()}_${Math.round(d.random() * 1000)}`,
      source: 'manual', category, note,
      lon: pendingFieldNote.lon, lat: pendingFieldNote.lat, alt: pendingFieldNote.alt,
      imageId: pendingFieldNote.imageId, createdAt: d.now(),
    };
    const updated = [...d.readState().fieldNotes, newNote];
    d.setState({ fieldNotes: updated, pendingFieldNote: null }, () => {
      d.persist(updated); d.drawMapNotes(); d.updateViewerNotes();
      if (share) void d.publish(newNote.id);
      d.notify('saved');
    });
  }

  /** Release the pending marker before clearing draft state; preserve mode/list flags. */
  cancel(): void {
    const d = this.dependencies;
    d.clearPending(); d.setState({ pendingFieldNote: null });
  }
}
