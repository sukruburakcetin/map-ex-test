/** Enterprise note publish attributes and schema checks; no SDK allocation, edits or local-storage writes. */
import type { FieldNote } from '../../components/types';

export interface EnterpriseNoteField {
  name: string;
  type: string | null | undefined;
  length?: number | null;
}

/**
 * Map a local note to the loaded writer's schema and supplied GlobalID field.
 * Reject missing required fields and oversized base string attributes before submission.
 * Preserve existing defaults and ordering: optional workflow fields are appended after base validation.
 * The caller owns GlobalID validation, permissions, durable persistence and server edits.
 */
export function buildEnterpriseNoteAttributes(note: FieldNote, layerFields: readonly EnterpriseNoteField[], globalIdField: string, globalId: string): Record<string, any> {
  const fields = ["category", "note_text", "source", "image_id", "detection_id", "created_at"];
  if (!fields.every(name => layerFields.some(field => field.name === name))) throw new Error("The editable layer is missing required note fields. See the setup guide.");
  const attributes: Record<string, any> = { [globalIdField]: globalId, category: note.category, note_text: note.note, source: note.source, image_id: note.imageId || null, detection_id: note.detectionId || null, created_at: note.createdAt };
  for (const field of layerFields) if (field.type === "string" && typeof attributes[field.name] === "string" && field.length && attributes[field.name].length > field.length) throw new Error(`${field.name} exceeds the layer's ${field.length}-character limit. The local note is preserved.`);
  if (layerFields.some(field => field.name === "status")) attributes.status = note.status || "open";
  if (layerFields.some(field => field.name === "resolution_note")) attributes.resolution_note = note.resolutionNote || "";
  return attributes;
}
