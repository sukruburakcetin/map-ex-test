import type { FieldNote } from '../../components/types';
import { normalizeNoteSearch } from '../field-notes/noteSearch';

export interface LocalNoteChoice { note: FieldNote; searchText: string }
/** Normalize once when the local collection/locale changes, not once per keystroke.
 * The picker renders a bounded batch; this index still searches every local note.
 */
export function indexLocalNotes(notes: readonly FieldNote[], locale: string): LocalNoteChoice[] {
  return notes.map(note=>({note,searchText:normalizeNoteSearch([note.category,note.note,note.resolutionNote,note.status?.replace(/_/g,' '),note.id,note.imageId].filter(Boolean).join(' '),locale)}));
}
/** Literal AND matching keeps note identity/order and never creates a user regex. */
export function findLocalNotes(index: readonly LocalNoteChoice[], query: string, locale: string): readonly LocalNoteChoice[] {
  const terms=normalizeNoteSearch(query,locale).trim().split(/\s+/u).filter(Boolean);
  return terms.length?index.filter(choice=>terms.every(term=>choice.searchText.includes(term))):index;
}
