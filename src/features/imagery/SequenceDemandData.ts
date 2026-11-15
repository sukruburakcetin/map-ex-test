import { GRAPH_API } from '../../utils/constants';
import { imageAltitudeFields } from '../../utils/imageAltitude';
import { SequenceMemoryCache, SEQUENCE_MEMORY_LIMITS, sequenceIndexWeight } from './sequenceMemoryBudget';
import type { SequenceMemoryLimits } from './sequenceMemoryBudget';
import type { SequenceCoordinate } from './sequenceCoordinates';

export const SEQUENCE_DEMAND_LIMITS = { radius: 64, step: 32, retained: 384 } as const;
type Index = { ids: string[]; positions: Map<string, number> };
const cancelled = () => new DOMException('Cancelled', 'AbortError');
const check = (signal: AbortSignal) => { if (signal.aborted) throw cancelled(); };
const valid = (p: SequenceCoordinate) => Number.isFinite(p.lon) && Number.isFinite(p.lat) && Math.abs(p.lon) <= 180 && Math.abs(p.lat) <= 90;

/** Ordered IDs are cheap navigation data. Coordinates are a separate, bounded cache.
 * All network operations belong to a selection/tool signal; failed/aborted work
 * never becomes a successful cache entry. Full routes live in the existing store.
 */
export class SequenceDemandData {
  private indices: SequenceMemoryCache<Index>;
  private points = new Map<string, Map<string, SequenceCoordinate>>();
  private pendingIds = new Map<string, { controller: AbortController; users: number; promise: Promise<Index> }>();
  constructor(private readonly fetchJson: (url: string, signal: AbortSignal) => Promise<any>,
    limits: SequenceMemoryLimits = SEQUENCE_MEMORY_LIMITS.indices) {
    this.indices = new SequenceMemoryCache(limits, index => sequenceIndexWeight(index.ids), key => this.points.delete(key));
  }
  /** Retained index estimates only; the current operation may use an uncached oversized index. */
  get memoryStats(): { entries: number; items: number; estimatedBytes: number } { return this.indices.stats; }
  private async index(sequenceId: string, signal: AbortSignal): Promise<Index> {
    check(signal);
    const cached = this.indices.get(sequenceId); if (cached) return cached;
    let entry = this.pendingIds.get(sequenceId);
    if (!entry || entry.controller.signal.aborted) {
      const controller = new AbortController(), requestSignal = controller.signal;
      const promise = (async () => {
        const ids = new Set<string>(), visited = new Set<string>();
        let next = `${GRAPH_API.BASE}/image_ids?sequence_id=${encodeURIComponent(sequenceId)}`;
        while (next) {
          check(requestSignal);
          if (visited.has(next)) throw new Error('Mapillary sequence pagination repeated');
          visited.add(next);
          const data = await this.fetchJson(next, requestSignal); check(requestSignal);
          if (!Array.isArray(data.data)) throw new Error('Mapillary returned invalid sequence data');
          for (const image of data.data) if (image.id != null) ids.add(String(image.id));
          next = data.paging?.next || '';
          if (next && new URL(next).origin !== new URL(GRAPH_API.BASE).origin) throw new Error('Unexpected sequence pagination host');
        }
        if (!ids.size) throw new Error('This sequence has no available images');
        const ordered = Array.from(ids), index = { ids: ordered, positions: new Map(ordered.map((id, i) => [id, i])) };
        check(requestSignal); this.indices.set(sequenceId, index);
        return index;
      })();
      entry = { controller, promise, users: 0 }; this.pendingIds.set(sequenceId, entry);
      const task = entry;
      const cleanup = () => { if (this.pendingIds.get(sequenceId) === task) this.pendingIds.delete(sequenceId); };
      promise.then(cleanup, cleanup);
    }
    const task = entry; ++task.users;
    return new Promise<Index>((resolve, reject) => {
      let settled = false;
      const release = () => { signal.removeEventListener('abort', abort); if (--task.users === 0) task.controller.abort(); };
      const abort = () => { if (settled) return; settled = true; release(); reject(cancelled()); };
      signal.addEventListener('abort', abort, { once: true });
      task.promise.then(index => { if (!settled) { settled = true; release(); resolve(index); } }, error => { if (!settled) { settled = true; release(); reject(error); } });
      if (signal.aborted) abort();
    });
  }

  async ids(sequenceId: string, signal: AbortSignal): Promise<readonly string[]> { return (await this.index(sequenceId, signal)).ids; }
  seed(sequenceId: string, values: readonly SequenceCoordinate[]): void {
    const cache = this.points.get(sequenceId) || new Map<string, SequenceCoordinate>(); this.points.set(sequenceId, cache);
    for (const point of values) if (point.id != null && valid(point)) { cache.delete(String(point.id)); cache.set(String(point.id), point); }
    while (cache.size > SEQUENCE_DEMAND_LIMITS.retained) cache.delete(cache.keys().next().value!);
    while (this.points.size > 6) this.points.delete(this.points.keys().next().value!);
  }
  find(sequenceId: string, id: string): SequenceCoordinate | undefined { return this.points.get(sequenceId)?.get(id); }
  private async range(sequenceId: string, index: Index, start: number, end: number, signal: AbortSignal): Promise<SequenceCoordinate[]> {
    check(signal);
    const cache = this.points.get(sequenceId), ids = index.ids.slice(start, end);
    const found = new Map<string, SequenceCoordinate>();
    for (const id of ids) { const p = cache?.get(id); if (p) found.set(id, p); }
    const missing = ids.filter(id => !found.has(id));
    // One worker, at most 50 images per request. Nearby metadata cannot saturate
    // the connection used by MapillaryJS imagery and interactive map tiles.
    for (let i = 0; i < missing.length; i += 50) {
      const batch = missing.slice(i, i + 50);
      const data = await this.fetchJson(`${GRAPH_API.BASE}/?ids=${batch.join(',')}&fields=id,geometry,captured_at,computed_altitude,altitude`, signal); check(signal);
      for (const id of batch) {
        const value = data[id], xy = value?.geometry?.coordinates;
        if (!xy) continue;
        const point = { id, lon: xy[0], lat: xy[1], ...imageAltitudeFields(value), captured_at: value.captured_at ? new Date(value.captured_at).getTime() : undefined };
        if (valid(point)) found.set(id, point);
      }
    }
    check(signal); const result = ids.flatMap(id => found.has(id) ? [found.get(id)!] : []); this.seed(sequenceId, result); return result;
  }
  windowKey(sequenceId: string, imageId: string): string {
    const at = this.indices.get(sequenceId)?.positions.get(imageId);
    return `${sequenceId}:${at === undefined ? imageId : Math.floor(at / SEQUENCE_DEMAND_LIMITS.step)}`;
  }
  async window(sequenceId: string, imageId: string, signal: AbortSignal): Promise<SequenceCoordinate[]> {
    const index = await this.index(sequenceId, signal); check(signal);
    const position = index.positions.get(imageId); if (position === undefined) return [];
    const center = Math.floor(position / SEQUENCE_DEMAND_LIMITS.step) * SEQUENCE_DEMAND_LIMITS.step;
    return this.range(sequenceId, index, Math.max(0, center - SEQUENCE_DEMAND_LIMITS.radius), Math.min(index.ids.length, center + SEQUENCE_DEMAND_LIMITS.radius + 1), signal);
  }
  /** Point-cloud discovery needs anchors up to 200 m in both directions, not
   * an arbitrary number of frames. Expand locally until that distance or an end.
   * Keep the tool's result separately so bounded browsing-cache eviction is safe.
   */
  async corridor(sequenceId: string, imageId: string, signal: AbortSignal, distance: (a: SequenceCoordinate, b: SequenceCoordinate) => number): Promise<SequenceCoordinate[]> {
    const index = await this.index(sequenceId, signal), at = index.positions.get(imageId);
    if (at === undefined) return [];
    const first = await this.range(sequenceId, index, at, at + 1, signal), current = first[0]; if (!current) return [];
    const result = new Map<string, SequenceCoordinate>([[imageId, current]]);
    for (const direction of [-1, 1]) {
      let cursor = at + direction, done = false;
      while (!done && cursor >= 0 && cursor < index.ids.length) {
        const start = direction < 0 ? Math.max(0, cursor - 63) : cursor;
        const end = direction < 0 ? cursor + 1 : Math.min(index.ids.length, cursor + 64);
        const batch = await this.range(sequenceId, index, start, end, signal);
        if (direction < 0) batch.reverse();
        for (const point of batch) { result.set(point.id, point); if (distance(current, point) > 200) { done = true; break; } }
        cursor = direction < 0 ? start - 1 : end;
      }
    }
    check(signal); return Array.from(result.values()).sort((a, b) => index.positions.get(a.id)! - index.positions.get(b.id)!);
  }
  clear(): void { this.pendingIds.forEach(task => task.controller.abort()); this.indices.clear(); this.points.clear(); this.pendingIds.clear(); }
}
