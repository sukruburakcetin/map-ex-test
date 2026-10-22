/** Organization IDs stay exact in the numeric MVT decoder.
 * Empty input removes the constraint; invalid input uses an impossible ID and
 * matches nothing instead of silently broadening the coverage filter.
 */
export function organizationFilterId(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string" && typeof value !== "number") return -1;
  const text = String(value).trim();
  if (!text) return undefined;
  if (!/^[0-9]+$/.test(text)) return -1;
  const id = Number(text);
  return Number.isSafeInteger(id) && id > 0 ? id : -1;
}

/** Equivalent classic style expression for numeric or string tile properties. */
export function organizationCondition(id: number): any[] {
  if (!Number.isSafeInteger(id) || id <= 0) return ['all', ['has', 'organization_id'], ['!has', 'organization_id']];
  return ['any', ['==', 'organization_id', id], ['==', 'organization_id', String(id)]];
}

export function organizationMatches(value: unknown, id: number | undefined): boolean {
  return id === undefined || (Number.isSafeInteger(id) && id > 0 && (value === id || value === String(id)));
}
