/** Authorized Enterprise list paging; never merge server records into browser-local notes. */
import type { FieldNote } from '../../components/types';

export interface EnterpriseNotesPage {
  notes: FieldNote[];
  nextOffset: number;
  hasMore: boolean;
}
export type EnterpriseNotesLoader = (offset: number, signal: AbortSignal) => Promise<EnterpriseNotesPage>;

/** Compatibility export for existing list consumers; endpoint helpers are feature-owned. */
export { matchesEnterpriseLayerUrl } from './enterpriseEndpoint';

interface ReadLayer {
  url?: string | null;
  destroyed?: boolean;
  objectIdField: string | null | undefined;
  fields: { name: string; type: string | null | undefined }[];
  load: () => Promise<unknown>;
  queryFeatures: (query: any, options?: { signal: AbortSignal }) => Promise<{ features: any[]; exceededTransferLimit?: boolean }>;
}

/**
 * Query one ordered, 50-record page through the existing authenticated SDK layer.
 * Guard layer/view ownership after awaits and pass cancellation to the query.
 * Preserve records without geometry as read-only map targets; missing GlobalIDs
 * disable edit/attachment actions. No edits, storage writes or count query occur.
 */
export async function queryEnterpriseNotesPage(layer: ReadLayer, writeUrl: string, offset: number, signal: AbortSignal, isCurrent: () => boolean): Promise<EnterpriseNotesPage> {
  if (!Number.isInteger(offset) || offset < 0) throw new RangeError('Invalid Enterprise note page');
  const current = () => {
    if (signal.aborted || layer.destroyed || !isCurrent()) throw new DOMException('Enterprise note request cancelled', 'AbortError');
  };
  current();
  await layer.load();
  current();
  const objectIdField = layer.objectIdField;
  if (!objectIdField) throw new Error('Enterprise layer has no ObjectID field');
  const result = await layer.queryFeatures({ where: '1=1', outFields: ['*'], returnGeometry: true,
    outSpatialReference: { wkid: 4326 }, orderByFields: [`${objectIdField} ASC`], start: offset, num: 50 }, { signal });
  current();
  const globalIdField = layer.fields.find(field => field.type === 'global-id')?.name;
  const notes: FieldNote[] = result.features.map((feature, index) => {
    const attributes = feature.attributes || {}, point = feature.geometry;
    const globalId = globalIdField ? String(attributes[globalIdField] || '') : '';
    const timestamp = attributes.created_at;
    const createdAt = timestamp == null ? NaN : typeof timestamp === 'number' ? timestamp : typeof timestamp === 'string' && /^\d+$/.test(timestamp) ? Number(timestamp) : new Date(timestamp).getTime();
    return {
      id: `enterprise:${layer.url || ''}:${attributes[objectIdField] ?? offset + index}`,
      source: attributes.source === 'mapillary-detection' ? 'mapillary-detection' : 'manual',
      category: String(attributes.category || 'Other'), note: String(attributes.note_text || ''),
      lon: point?.longitude ?? point?.x ?? NaN, lat: point?.latitude ?? point?.y ?? NaN,
      imageId: attributes.image_id == null ? null : String(attributes.image_id),
      createdAt,
      status: ['open', 'in_progress', 'completed', 'dismissed'].includes(attributes.status) ? attributes.status : 'open',
      resolutionNote: String(attributes.resolution_note || ''), sharedStatus: 'shared',
      sharedGlobalId: /^\{[0-9a-f-]{36}\}$/i.test(globalId) ? globalId : undefined,
      sharedLayerUrl: writeUrl || undefined,
    };
  });
  return { notes, nextOffset: offset + result.features.length,
    hasMore: result.features.length > 0 && (result.features.length === 50 || !!result.exceededTransferLimit) };
}
