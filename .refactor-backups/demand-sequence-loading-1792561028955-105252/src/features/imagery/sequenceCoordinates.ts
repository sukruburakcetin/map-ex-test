/**
 * Sequence coordinate enumeration and bounded metadata download.
 * The runtime owns cache lifetime, shared subscribers and storage failure state.
 */
import { CACHE_KEYS, GRAPH_API } from '../../utils/constants';
import { sequenceCacheStore } from './sequenceCacheStore';
import { imageAltitudeFields } from '../../utils/imageAltitude';
import type { ImageAltitude } from '../../utils/imageAltitude';

export type SequenceCoordinate = ImageAltitude & { id: string; lat: number; lon: number; captured_at?: number };
export type SequenceProgress = (points: SequenceCoordinate[], batch: number, loaded: number, total: number) => void;

export interface SequenceCoordinateDependencies {
  cache: Record<string, SequenceCoordinate[]>;
  fetchJson: (url: string, accessToken: string, signal?: AbortSignal) => Promise<any>;
  getSelectedImageId: () => string | null;
  isStorageDisabled: () => boolean;
  disableStorage: () => void;
}

/**
 * Enumerate sequence IDs and resolve WGS84 coordinates with two 50-image workers.
 * Prioritize the selected-image batch while returning source order. RAM/storage
 * caches hold validated results; caller cancellation aborts metadata workers.
 * Pagination, network and unavailable-coordinate failures propagate to the caller.
 */
export async function fetchSequenceCoordinates(dependencies: SequenceCoordinateDependencies, sequenceId: string, accessToken: string, signal?: AbortSignal, onProgress?: SequenceProgress): Promise<SequenceCoordinate[]> {
    const valid = (value: any) => Array.isArray(value) && value.length > 0 && value.every(p => p && p.id != null && p.heightDataVersion === 2 && Number.isFinite(p.lon) && Number.isFinite(p.lat) && Math.abs(p.lon) <= 180 && Math.abs(p.lat) <= 90);
    const ram = dependencies.cache[sequenceId];
    if (valid(ram)) return ram;
    const cacheKey = `${CACHE_KEYS.GEO_PREFIX}height-v2:${sequenceId}`;
    const persisted = await sequenceCacheStore.read(cacheKey);
    if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
    if (valid(persisted)) {
      dependencies.cache[sequenceId] = persisted as SequenceCoordinate[];
      while (Object.keys(dependencies.cache).length > 6) delete dependencies.cache[Object.keys(dependencies.cache)[0]];
      return persisted as SequenceCoordinate[];
    }
    try {
      const stored = localStorage.getItem(cacheKey);
      if (stored) { const parsed = JSON.parse(stored); if (valid(parsed)) { dependencies.cache[sequenceId] = parsed; while (Object.keys(dependencies.cache).length > 6) delete dependencies.cache[Object.keys(dependencies.cache)[0]]; sequenceCacheStore.queue(cacheKey, parsed); return parsed; } localStorage.removeItem(cacheKey); }
    } catch { /* Storage is optional; continue using the network/RAM. */ }
    const ids: string[] = [];
    const visited = new Set<string>();
    let next = `${GRAPH_API.BASE}/image_ids?sequence_id=${encodeURIComponent(sequenceId)}`;
    while (next) {
      if (visited.has(next)) throw new Error("Mapillary sequence pagination repeated");
      visited.add(next);
      const data = await dependencies.fetchJson(next, accessToken, signal);
      if (!Array.isArray(data.data)) throw new Error("Mapillary returned invalid sequence data");
      data.data.forEach((image: any) => { if (image.id != null) ids.push(String(image.id)); });
      next = data.paging?.next || "";
      if (next && new URL(next).origin !== new URL(GRAPH_API.BASE).origin) throw new Error("Unexpected sequence pagination host");
    }
    const unique = Array.from(new Set(ids));
    if (!unique.length) throw Object.assign(new Error("This sequence has no available images"), { status: 404 });
    const results: any[][] = new Array(Math.ceil(unique.length / 50));
    const focus = Math.floor(Math.max(0, unique.indexOf(String(dependencies.getSelectedImageId()))) / 50);
    const batches = Array.from({ length: results.length }, (_, i) => i).sort((a, b) => Math.abs(a - focus) - Math.abs(b - focus));
    let nextBatch = 0, loadedCount = 0;
    const workers = new AbortController();
    const abort = () => workers.abort();
    if (signal?.aborted) abort(); else signal?.addEventListener("abort", abort, { once: true });
    const worker = async () => {
      while (nextBatch < results.length && !workers.signal.aborted) {
        const index = batches[nextBatch++], batch = unique.slice(index * 50, index * 50 + 50);
        const data = await dependencies.fetchJson(`${GRAPH_API.BASE}/?ids=${batch.join(",")}&fields=id,geometry,captured_at,computed_altitude,altitude`, accessToken, workers.signal);
        results[index] = [];
        for (const id of batch) {
          const value = data[id], xy = value?.geometry?.coordinates;
          if (!xy || !Number.isFinite(xy[0]) || !Number.isFinite(xy[1]) || Math.abs(xy[0]) > 180 || Math.abs(xy[1]) > 90) continue;
          results[index].push({ id, lon: xy[0], lat: xy[1], ...imageAltitudeFields(value), captured_at: value.captured_at ? new Date(value.captured_at).getTime() : undefined });
        }
        loadedCount += results[index].length;
        onProgress?.(results[index], index, loadedCount, unique.length);
      }
    };
    try {
      await Promise.all([worker(), worker()]);
      if (workers.signal.aborted) throw new DOMException("Cancelled", "AbortError");
    } catch (error) { workers.abort(); throw error; }
    finally { signal?.removeEventListener("abort", abort); }
    const coords = results.flat(); // Preserve API image order even when responses finish out of order.
    if (!coords.length) throw new Error("Image coordinates are unavailable");
    dependencies.cache[sequenceId] = coords;
    while (Object.keys(dependencies.cache).length > 6) delete dependencies.cache[Object.keys(dependencies.cache)[0]];
    // Persistence is idle-scheduled and asynchronous; full coordinates stay immediately available in RAM.
    sequenceCacheStore.queue(cacheKey, coords);
    return coords;
  }
