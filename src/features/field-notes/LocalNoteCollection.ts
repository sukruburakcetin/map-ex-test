import type { FieldNote } from '../../components/types';

export interface LocalNoteCollectionDependencies {
  /** Borrow the current local array; no second collection is retained by this coordinator. */
  readNotes(): FieldNote[];
  isSaving(id: string): boolean;
  anySaving(): boolean;
  isEditing(): boolean;
  /** Existing helper owns parsing/interrupted-save normalization and its catch scope. */
  restore(applyNotes: (notes: FieldNote[]) => void): void;
  persist(notes: FieldNote[]): void;
  setNotes(notes: FieldNote[], callback: () => void): void;
  drawMapNotes(): void;
  updateViewerNotes(): void;
  notifyCleared(): void;
}

/** Coordinate local restore/delete/clear through existing persistence and rendering callbacks.
 * No browser storage, array mirror, SDK layer, Enterprise deletion, confirmation UI or request is owned.
 * Keep state-callback boundaries and existing guard/return/error behavior unchanged.
 */
export class LocalNoteCollection {
  constructor(private readonly dependencies: LocalNoteCollectionDependencies) {}

  /** Apply exactly the restored array, then redraw map and viewer after the state commit.
   * Do not persist it again or add guards; restore's existing helper retains its failure policy.
   */
  load(): void {
    const d = this.dependencies;
    d.restore(notes => d.setNotes(notes, () => {
      d.drawMapNotes(); d.updateViewerNotes();
    }));
  }

  /** Block deletion only for this note's shared save or an active editor save.
   * Filter the current local array, preserving source object identity/order, then persist that
   * captured array before map/viewer refresh. Unknown IDs retain the existing refresh behavior.
   */
  remove(id: string): void {
    const d = this.dependencies;
    if (d.isSaving(id) || d.isEditing()) return;
    const updated = d.readNotes().filter(note => note.id !== id);
    d.setNotes(updated, () => {
      d.persist(updated); d.drawMapNotes(); d.updateViewerNotes();
    });
  }

  /** Clear local notes only when nonempty and no shared/editor save is active.
   * Confirmation stays with the existing button. Keep separate empty arrays for state/storage,
   * then map/viewer refresh and callback-time feedback; Enterprise notes are never deleted here.
   */
  clear(): void {
    const d = this.dependencies;
    if (!d.readNotes().length || d.anySaving() || d.isEditing()) return;
    d.setNotes([], () => {
      d.persist([]); d.drawMapNotes(); d.updateViewerNotes(); d.notifyCleared();
    });
  }
}
