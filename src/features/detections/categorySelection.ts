/** null/undefined/legacy All = every category; [] = none. Arrays are immutable
 * selection snapshots, also used to retire stale map picking results. */
export type CategorySelection = readonly string[] | null;
export type MapCategoryFilter = CategorySelection | string | undefined;
export function selectedCategoryCodes(value: MapCategoryFilter, all: string): CategorySelection {
  if (typeof value === 'string') return !value || value === all ? null : [value];
  return value ?? null;
}
export function categoryMatcher(value: MapCategoryFilter, all: string): (code: unknown) => boolean {
  const codes = selectedCategoryCodes(value, all);
  if (codes === null) return () => true;
  const selected = new Set(codes);
  return code => typeof code === 'string' && selected.has(code);
}
export function categoryStyleFilter(value: MapCategoryFilter, all: string): unknown[] | undefined {
  const codes = selectedCategoryCodes(value, all);
  if (codes === null) return undefined;
  if (codes.length === 1) return ['==', ['get', 'value'], codes[0]];
  return ['in', ['get', 'value'], ['literal', [...codes]]];
}
export function sameCategorySelection(a: CategorySelection, b: CategorySelection): boolean {
  if (a === null || b === null) return a === b;
  const selected = new Set(a), other = new Set(b);
  return selected.size === other.size && [...other].every(code => selected.has(code));
}

export type CategoryDisplayMode = 'selected' | 'highlight';
/** Clear still means no icons. Context is shown only for a nonempty subset. */
export function categoryDisplayStyle(value: MapCategoryFilter, all: string, mode: CategoryDisplayMode) {
  const codes = selectedCategoryCodes(value, all), filter = categoryStyleFilter(value, all);
  if (mode === 'highlight' && codes && codes.length) return {
    filter: undefined,
    opacity: ['case', filter!, 1, .2] as unknown[] | number,
  };
  return {filter, opacity: 1 as unknown[] | number};
}
