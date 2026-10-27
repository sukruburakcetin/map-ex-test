/** Conservative retained-data estimates, not measurements of JavaScript/GPU heap.
 * Active tool/viewer results and persistence queues have separate lifetimes.
 */
export interface SequenceMemoryLimits { maxEntries: number; maxItems: number; maxEstimatedBytes: number }
export interface SequenceMemoryWeight { items: number; estimatedBytes: number }
export const SEQUENCE_MEMORY_LIMITS = {
  routes: { maxEntries: 6, maxItems: 100000, maxEstimatedBytes: 16 * 1024 * 1024 },
  indices: { maxEntries: 6, maxItems: 100000, maxEstimatedBytes: 16 * 1024 * 1024 },
} as const;

/** True LRU constrained by retained item counts and estimated bytes together.
 * An oversized value is returned by its producer but is never admitted here.
 */
export class SequenceMemoryCache<T> {
  private entries = new Map<string, { value: T; weight: SequenceMemoryWeight }>();
  private items = 0;
  private bytes = 0;
  constructor(private readonly limits: SequenceMemoryLimits,
    private readonly weigh: (value: T) => SequenceMemoryWeight,
    private readonly evicted?: (key: string, value: T) => void) {
    if (!Number.isSafeInteger(limits.maxEntries) || limits.maxEntries < 0 ||
      !Number.isSafeInteger(limits.maxItems) || limits.maxItems < 0 ||
      !Number.isFinite(limits.maxEstimatedBytes) || limits.maxEstimatedBytes < 0) {
      throw new RangeError('Sequence memory limits must be finite nonnegative budgets.');
    }
  }
  get(key: string): T | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    this.entries.delete(key); this.entries.set(key, entry);
    return entry.value;
  }
  set(key: string, value: T): boolean {
    const measured = this.weigh(value), weight = { items: measured.items, estimatedBytes: measured.estimatedBytes + 64 + key.length * 2 };
    if (!Number.isSafeInteger(weight.items) || weight.items < 0 || !Number.isFinite(weight.estimatedBytes) || weight.estimatedBytes < 0) {
      throw new RangeError('Sequence memory weights must be finite nonnegative values.');
    }
    this.delete(key);
    if (weight.items > this.limits.maxItems || weight.estimatedBytes > this.limits.maxEstimatedBytes || this.limits.maxEntries <= 0) return false;
    while (this.entries.size && (this.entries.size >= this.limits.maxEntries || this.items + weight.items > this.limits.maxItems || this.bytes + weight.estimatedBytes > this.limits.maxEstimatedBytes)) {
      this.delete(this.entries.keys().next().value!);
    }
    this.entries.set(key, { value, weight }); this.items += weight.items; this.bytes += weight.estimatedBytes;
    return true;
  }
  delete(key: string): boolean {
    const entry = this.entries.get(key); if (!entry) return false;
    this.entries.delete(key); this.items -= entry.weight.items; this.bytes -= entry.weight.estimatedBytes;
    this.evicted?.(key, entry.value); return true;
  }
  clear(): void { for (const key of this.entries.keys()) this.delete(key); }
  get stats(): { entries: number; items: number; estimatedBytes: number } {
    return { entries: this.entries.size, items: this.items, estimatedBytes: this.bytes };
  }
}

/** Array refs, ID strings, position Map entries/numbers, and object bookkeeping.
 * Strings are charged by UTF-16 length even if an engine happens to share them.
 */
export function sequenceIndexWeight(ids: readonly string[]): SequenceMemoryWeight {
  let bytes = 256 + ids.length * 80;
  for (const id of ids) bytes += id.length * 2;
  return { items: ids.length, estimatedBytes: bytes };
}

interface RoutePoint { id: unknown; lon: number; lat: number; heightDataVersion?: number }
type Route = RoutePoint[];
const snapshots = new WeakMap<object, SequenceMemoryWeight>();
const budgets = new WeakMap<object, SequenceMemoryCache<Route>>();

/** A validated route is an immutable snapshot, matching LiveSequenceFrames reuse.
 * Untrusted arrays are validated once; invalid arrays are never memoized.
 */
function routeWeight(value: unknown): SequenceMemoryWeight | undefined {
  if (!Array.isArray(value)) return undefined;
  const cached = snapshots.get(value); if (cached) return cached;
  if (!value.length) return undefined;
  let bytes = 64 + value.length * 160;
  for (const point of value) {
    if (!point || point.id == null || point.heightDataVersion !== 2 || !Number.isFinite(point.lon) || !Number.isFinite(point.lat) || Math.abs(point.lon) > 180 || Math.abs(point.lat) > 90) return undefined;
    bytes += String(point.id).length * 2;
  }
  const weight = { items: value.length, estimatedBytes: bytes };
  snapshots.set(value, weight); return weight;
}
function budget(cache: Record<string, Route>): SequenceMemoryCache<Route> {
  let state = budgets.get(cache);
  if (!state) {
    state = new SequenceMemoryCache<Route>(SEQUENCE_MEMORY_LIMITS.routes, value => routeWeight(value)!, (key, value) => {
      if (cache[key] === value) delete cache[key];
    });
    budgets.set(cache, state);
    // Bootstrap externally populated/legacy RAM records once. Future admissions
    // and hits use memoized immutable snapshot weights rather than full scans.
    for (const [key, value] of Object.entries(cache)) {
      if (!routeWeight(value) || !state.set(key, value)) { if (cache[key] === value) delete cache[key]; }
    }
  }
  return state;
}

export function retainSequenceRoute<T extends RoutePoint>(cache: Record<string, T[]>, key: string, value: T[]): boolean {
  const weight = routeWeight(value);
  if (!weight) return false;
  const state = budget(cache);
  cache[key] = value;
  const retained = state.set(key, value);
  // Replacing a retained value calls its eviction callback. Restore the newly
  // admitted snapshot after that callback, without ever retaining an oversize one.
  if (retained) cache[key] = value;
  else if (cache[key] === value) delete cache[key];
  return retained;
}

/** Validate a persisted or external snapshot without allocating a temporary cache.
 * Oversize valid routes remain usable by their caller even when admission fails.
 */
export function validatedSequenceRoute<T extends RoutePoint>(value: unknown): T[] | null {
  return routeWeight(value) ? value as T[] : null;
}

export function readMemorySequenceRoute<T extends RoutePoint>(cache: Record<string, T[]>, key: string): T[] | null {
  const value = cache[key];
  if (!routeWeight(value)) {
    // An external assignment can replace a retained snapshot with invalid data.
    // Release the old reference/accounting as well as the unusable record.
    budgets.get(cache)?.delete(key);
    if (cache[key] === value) delete cache[key];
    return null;
  }
  const state = budget(cache), cached = state.get(key);
  if (cached === value) return value;
  // An external assignment may have replaced a known key since the previous read.
  retainSequenceRoute(cache, key, value);
  return value;
}

export function sequenceRouteMemoryStats(cache: Record<string, RoutePoint[]>): { entries: number; items: number; estimatedBytes: number } {
  // Diagnostics must not validate, retain, evict or scan legacy/external records.
  return budgets.get(cache)?.stats || { entries: 0, items: 0, estimatedBytes: 0 };
}
