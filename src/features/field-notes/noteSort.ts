export type NoteSort = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'status-asc' | 'status-desc';
export const NOTE_SORT_OPTIONS: readonly NoteSort[] = ['date-desc', 'date-asc', 'name-asc', 'name-desc', 'status-asc', 'status-desc'];
export interface NoteSortValues { name: string; date: number | string | null | undefined; status?: string | null; }
const statuses: Readonly<Record<string, number>> = { open: 0, in_progress: 1, completed: 2, dismissed: 3 };
function status(value: string | null | undefined): number | null {
  const key = value || 'open';
  return Object.prototype.hasOwnProperty.call(statuses, key) ? statuses[key] : null;
}
function date(value: NoteSortValues['date']): number | null {
  const result = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Date.parse(value) : NaN;
  return Number.isFinite(result) ? result : null;
}
/** Sort a copy, preserving original record identities and stable input order for ties.
 * Missing/invalid dates and unrecognized statuses stay last in either direction.
 * Only the caller's supplied records are considered; no network or persistence.
 */
export function sortNotes<T>(notes: readonly T[], sort: NoteSort, locale: string, values: (note: T) => NoteSortValues): T[] {
  const collator = new Intl.Collator(locale, { sensitivity: 'base', numeric: true });
  const direction = sort.endsWith('-desc') ? -1 : 1;
  return notes.map((note, index) => ({ note, index, values: values(note) })).sort((a, b) => {
    let compared = 0;
    if (sort.startsWith('name-')) compared = collator.compare(a.values.name.trim(), b.values.name.trim()) * direction;
    else {
      const av = sort.startsWith('date-') ? date(a.values.date) : status(a.values.status);
      const bv = sort.startsWith('date-') ? date(b.values.date) : status(b.values.status);
      compared = av === null ? bv === null ? 0 : 1 : bv === null ? -1 : (av - bv) * direction;
    }
    return compared || a.index - b.index;
  }).map(entry => entry.note);
}
