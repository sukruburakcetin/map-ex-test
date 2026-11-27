import { distanceMeters, type RoadSegment } from '../../utils/geoUtils';
import type { TurboBbox } from '../../utils/turboCoverageUtils';

export function isRoadFeatureLayer(endpoint: string | undefined): boolean {
  return !!endpoint && /\/FeatureServer\/\d+\/?(?:[?#].*)?$/i.test(endpoint);
}

/** Query complete WGS84 road features from an anonymously readable ArcGIS layer. */
export async function fetchFeatureLayerRoads(
  endpoint: string, bbox: TurboBbox, signal: AbortSignal, request: typeof fetch = fetch,
): Promise<RoadSegment[]> {
  const url = new URL(endpoint);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || !isRoadFeatureLayer(endpoint)) {
    throw new Error('Use an HTTPS ArcGIS FeatureServer layer URL ending in a layer number.');
  }
  url.pathname = url.pathname.replace(/\/$/, '');
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
  signal.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(abort, 35_000);
  const read = async (query: URLSearchParams, layerQuery: boolean) => {
    const target = new URL(url);
    if (layerQuery) target.pathname += '/query';
    target.search = query.toString();
    const response = await request(target.toString(), { signal: controller.signal, credentials: 'omit' });
    if (!response.ok) throw new Error(`Road feature layer returned HTTP ${response.status}.`);
    const result = await response.json();
    if (controller.signal.aborted) throw new DOMException('Cancelled', 'AbortError');
    if (!result || result.error) throw new Error('The road feature layer could not be queried. Check its sharing and query settings.');
    return result;
  };

  try {
    const metadata = await read(new URLSearchParams({ f: 'json' }), false);
    if (metadata.geometryType !== 'esriGeometryPolyline') throw new Error('The configured road layer must contain polylines.');
    const [xmin, ymin, xmax, ymax] = bbox;
    const selection = await read(new URLSearchParams({
      f: 'json', where: '1=1', geometryType: 'esriGeometryEnvelope', inSR: '4326',
      geometry: [xmin, ymin, xmax, ymax].join(','), spatialRel: 'esriSpatialRelIntersects', returnIdsOnly: 'true',
    }), true);
    if (!Array.isArray(selection.objectIds) && selection.objectIds !== null) throw new Error('The road layer did not return its feature IDs.');
    const ids = [...new Set<number>(selection.objectIds ?? [])];
    if (selection.exceededTransferLimit || ids.length > 10_000 || ids.some(id => !Number.isSafeInteger(id))) {
      throw new Error('The road layer returned too many features. Zoom in and try again.');
    }
    if (!ids.length) return [];
    const idField = selection.objectIdFieldName || metadata.objectIdField;
    if (!idField) throw new Error('The road layer did not return its object ID field.');
    const fields: string[] = (metadata.fields ?? []).map((field: { name: string }) => field.name);
    const highway = fields.find(name => name.toLowerCase() === 'highway');
    const oneway = fields.find(name => name.toLowerCase() === 'oneway');
    const limit = Math.max(1, Math.min(200, Math.floor(Number(metadata.maxRecordCount)) || 200));
    const segments: RoadSegment[] = [];
    for (let offset = 0; offset < ids.length; offset += limit) {
      const batch = ids.slice(offset, offset + limit);
      const result = await read(new URLSearchParams({
        f: 'json', objectIds: batch.join(','), outSR: '4326', returnGeometry: 'true',
        outFields: [idField, highway, oneway].filter(Boolean).join(','),
      }), true);
      const remaining = new Set(batch);
      if (result.exceededTransferLimit || !Array.isArray(result.features)) throw new Error('The road layer returned incomplete geometry.');
      for (const feature of result.features) {
        const paths = feature.geometry?.paths;
        if (!remaining.delete(feature.attributes?.[idField]) || !Array.isArray(paths) || !paths.length) {
          throw new Error('The road layer returned incomplete geometry.');
        }
        const highwayType = (highway && feature.attributes[highway]) || 'residential';
        const direction = oneway && String(feature.attributes[oneway]).toLowerCase();
        const isOneway = !!direction && ['yes', '-1', 'true', '1'].includes(direction);
        if (paths.some(path => !Array.isArray(path) || path.length < 2 || path.some(point =>
          !Array.isArray(point) || !Number.isFinite(point[0]) || !Number.isFinite(point[1]) || Math.abs(point[0]) > 180 || Math.abs(point[1]) > 90))) {
          throw new Error('The road layer returned invalid coordinates.');
        }
        for (const path of paths) {
          for (let index = 1; index < path.length; index++) {
            const start: [number, number] = [path[index - 1][0], path[index - 1][1]];
            const end: [number, number] = [path[index][0], path[index][1]];
            segments.push({ start, end, lengthMeters: distanceMeters(start[1], start[0], end[1], end[0]), highwayType, isOneway });
          }
        }
      }
      if (remaining.size) throw new Error('The road layer returned incomplete geometry.');
    }
    return segments;
  } catch (error) {
    if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
    if (controller.signal.aborted) throw new Error('Road feature layer request timed out. Please try again.');
    throw error;
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', abort);
  }
}
