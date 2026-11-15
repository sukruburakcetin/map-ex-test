/** Enterprise edit conflict and schema validation; queries, permissions and updates remain runtime-owned. */
export interface EnterpriseNoteEditValues {
  category: string;
  note: string;
  status: string;
  resolutionNote: string;
}

/**
 * Reject stale edits by comparing workflow fields and the service edit timestamp with the editor baseline.
 * Preserve null/missing-value equivalence and the existing JSON comparison; never merge concurrent edits.
 */
export function assertEnterpriseNoteUnchanged(latest: Record<string, any>, baseline: Record<string, any> | undefined, editDateField?: string | null): void {
  const compare = ["category", "note_text", "status", "resolution_note", editDateField].filter(Boolean) as string[];
  if (compare.some(name => JSON.stringify(latest[name] ?? null) !== JSON.stringify(baseline?.[name] ?? null))) throw new Error("Another user changed this note. Cancel and reopen it to load the latest version before updating.");
}

/**
 * Build an attribute-only update after checking editable fields, lengths and coded-value domains.
 * Geometry, author and creation time are excluded. The caller validates identity and status before this step.
 * Preserve the existing first-error order; no SDK objects or network operations are created here.
 */
export function buildEnterpriseNoteEditAttributes(values: EnterpriseNoteEditValues, fields: readonly __esri.Field[], globalIdField: string, globalId: string): Record<string, any> {
  const attributes: Record<string, any> = { [globalIdField]: globalId, category: values.category, note_text: values.note, status: values.status, resolution_note: values.resolutionNote };
  for (const name of ["category", "note_text", "status", "resolution_note"]) {
    const definition = fields.find(item => item.name === name);
    if (!definition || definition.editable === false) throw new Error(`${name} is missing or cannot be edited.`);
    if (definition.length && attributes[name].length > definition.length) throw new Error(`${name} exceeds the ${definition.length}-character limit.`);
    const domain = definition.domain as __esri.CodedValueDomain | null;
    if (domain?.type === "coded-value" && !domain.codedValues.some(item => item.code === attributes[name])) throw new Error(`${name} is not accepted by the layer's coded-value domain.`);
  }
  return attributes;
}
