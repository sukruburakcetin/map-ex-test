import { fieldNotesFromGeoJson, fieldNotesToGeoJson } from './geoJson';
import type { FieldNote } from '../../components/types';

export type FieldNoteFileNotice = { kind: 'empty-export' | 'empty-import' | 'invalid-import' | 'read-error' } |
  { kind: 'imported'; added: number; skipped: number };
export interface FieldNoteFilesDependencies {
  /** Borrow current local records; imports read them after FileReader completes. */
  readNotes(): FieldNote[];
  setNotes(notes: FieldNote[], callback: () => void): void;
  persist(notes: FieldNote[]): void;
  drawMapNotes(): void;
  updateViewerNotes(): void;
  notify(notice: FieldNoteFileNotice): void;
  logExportError(error: unknown): void;
  logImportError(error: unknown): void;
}

/** Coordinate existing GeoJSON file intent without owning notes, storage, renderers or shared edits.
 * Browser objects are created only when invoked. No new reader cancellation, import validation,
 * request/version guard or download policy is introduced; conversion remains in geoJson.ts.
 */
export class FieldNoteFiles {
  constructor(private readonly dependencies: FieldNoteFilesDependencies) {}

  /** Convert current local notes before the original browser-download try/catch.
   * Keep pretty JSON, encoded data URI, timestamp filename and append/click/remove sequence.
   * Conversion errors still propagate; browser/serialization errors keep the export log only.
   */
  export(): void {
    const d = this.dependencies;
    const fieldNotes = d.readNotes();
    if (!fieldNotes.length) { d.notify({ kind: 'empty-export' }); return; }
    const featureCollection = fieldNotesToGeoJson(fieldNotes);
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(featureCollection, null, 2));
      const a = document.createElement('a');
      a.setAttribute('href', dataStr);
      a.setAttribute('download', `field_notes_${Date.now()}.json`);
      document.body.appendChild(a); a.click(); a.remove();
    } catch (error) { d.logExportError(error); }
  }

  /** Keep the reader's existing load/error handlers and synchronous setup/read error boundaries.
   * Deduplicate against IDs in live state when loading finishes, not against other rows in this file.
   * Persist the captured merged array after state commits, then refresh map/viewer and notify.
   * Existing read/parse/conversion/callback catch scopes and unawaited rendering remain unchanged.
   */
  import(file: File): void {
    const d = this.dependencies;
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const raw = event.target?.result as string;
        const imported = fieldNotesFromGeoJson(JSON.parse(raw));
        if (!imported.length) { d.notify({ kind: 'empty-import' }); return; }
        const existingIds = new Set(d.readNotes().map(note => note.id));
        const newOnes = imported.filter(note => !existingIds.has(note.id));
        const skipped = imported.length - newOnes.length;
        const merged = [...d.readNotes(), ...newOnes];
        d.setNotes(merged, () => {
          d.persist(merged); d.drawMapNotes(); d.updateViewerNotes();
          d.notify({ kind: 'imported', added: newOnes.length, skipped });
        });
      } catch (error) { d.logImportError(error); d.notify({ kind: 'invalid-import' }); }
    };
    reader.onerror = () => d.notify({ kind: 'read-error' });
    reader.readAsText(file);
  }
}
