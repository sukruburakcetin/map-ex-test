import type { FieldNote } from '../../components/types';

/** Normalize user text for literal, accent-insensitive matching in the active locale. */
export function normalizeNoteSearch(value: string, locale: string): string {
  return value.normalize('NFKC').toLocaleLowerCase(locale).normalize('NFD').replace(/\p{M}/gu, '');
}

/** Filter the supplied records only, preserving their identity/order and all source actions.
 * Every whitespace-separated term must occur in note text, category, resolution,
 * or raw/localized status. No regular expressions are built from user input.
 */
export function filterNotes(notes: readonly FieldNote[], query: string, locale: string,
  statusLabels: Readonly<Record<string, string>>): readonly FieldNote[] {
  const terms = normalizeNoteSearch(query, locale).trim().split(/\s+/u).filter(Boolean);
  if (!terms.length) return notes;
  return notes.filter(note => {
    const status = note.status || 'open';
    const text = normalizeNoteSearch([note.note, note.category, note.resolutionNote,
      status.replace(/_/g, ' '), statusLabels[status]].filter(Boolean).join(' '), locale);
    return terms.every(term => text.includes(term));
  });
}
