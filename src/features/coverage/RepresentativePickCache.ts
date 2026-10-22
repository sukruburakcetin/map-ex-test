/** Numeric bounds and a small candidate memo for overview/sequence picking; no SDK graphics. */
type Box = readonly [number, number, number, number];
type Vertex = { x: number; y: number };
interface Feature { properties: Record<string, any>; extent?: number; loadGeometry(): Vertex[][] }
interface Layer { length: number; byteLength?: number; feature(index: number): Feature }
export interface PickSource { query(boxes: readonly Box[], tile: readonly [number, number, number]): Layer }

/**
 * Index every feature once into Float64 bounds and compact numeric grid buckets.
 * Queries decode/project only intersecting candidates. Pointer cancellation does
 * not restart construction; coverage teardown invalidates pending work. The LRU
 * accounts for source bytes, index arrays and a small feature memo. If a tile is
 * too large to retain, its query still uses numeric bounds, never a full source
 * geometry/projection scan. Filters remain caller-owned and run on every pick.
 */
export class RepresentativePickCache {
  private entries = new Map<string, { value: PickSource; bytes: number }>();
  private pending = new Map<string, Promise<PickSource | null>>();
  private bytes = 0;
  private generation = 0;
  private limit: number;
  constructor(limit = 16 * 1024 * 1024) { this.limit = limit; }
  get byteLength(): number { return this.bytes; }
  get size(): number { return this.entries.size; }
  async get(key: string, load: () => Promise<Layer | null>, signal: AbortSignal): Promise<PickSource | null> {
    if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
    const cached = this.entries.get(key);
    if (cached) { this.entries.delete(key); this.entries.set(key, cached); return cached.value; }
    const pending = this.pending.get(key); if (pending) return pending;
    const generation = this.generation;
    const check = () => { if (signal.aborted || generation !== this.generation) throw new DOMException('Cancelled', 'AbortError'); };
    const task = (async () => {
      check(); const layer = await load(); check(); if (!layer) return null;
      const cells = 32, count = layer.length;
      const bounds = new Float64Array(count * 4);
      const counts = new Uint32Array(cells * cells);
      const wide: number[] = [];
      const clamp = (v: number) => Math.max(0, Math.min(cells - 1, Math.floor(v * cells)));
      let deadline = performance.now() + 8;
      for (let i = 0; i < count; i++) {
        if ((i & 127) === 0 && performance.now() >= deadline) { await new Promise(resolve => setTimeout(resolve, 0)); deadline = performance.now() + 8; }
        check(); const feature = layer.feature(i), extent = Number(feature.extent) || 4096;
        let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
        for (const path of feature.loadGeometry()) for (const p of path) { left = Math.min(left, p.x / extent); right = Math.max(right, p.x / extent); top = Math.min(top, p.y / extent); bottom = Math.max(bottom, p.y / extent); }
        const offset = i * 4; bounds[offset] = left; bounds[offset + 1] = top; bounds[offset + 2] = right; bounds[offset + 3] = bottom;
        if (!Number.isFinite(left)) continue;
        const x0 = clamp(left), x1 = clamp(right), y0 = clamp(top), y1 = clamp(bottom);
        if ((x1 - x0 + 1) * (y1 - y0 + 1) > 16) { wide.push(i); continue; }
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) counts[y * cells + x]++;
      }
      const offsets = new Uint32Array(cells * cells + 1);
      for (let i = 0; i < counts.length; i++) offsets[i + 1] = offsets[i] + counts[i];
      const ids = new Uint32Array(offsets[offsets.length - 1]), positions = offsets.slice(0, -1);
      const wideIds = Uint32Array.from(wide); const wideSet = new Set(wide);
      for (let i = 0; i < count; i++) {
        if ((i & 511) === 0 && performance.now() >= deadline) { await new Promise(resolve => setTimeout(resolve, 0)); deadline = performance.now() + 8; }
        check(); const b = i * 4;
        if (!Number.isFinite(bounds[b]) || wideSet.has(i)) continue;
        for (let y = clamp(bounds[b + 1]); y <= clamp(bounds[b + 3]); y++) for (let x = clamp(bounds[b]); x <= clamp(bounds[b + 2]); x++) ids[positions[y * cells + x]++] = i;
      }
      check();
      const memo = new Map<number, Feature>();
      const value: PickSource = { query(boxes, tile) {
        const [tx, ty, z] = tile, n = 2 ** z, hits = new Set<number>();
        const latitudeY = (lat: number) => (1 - Math.asinh(Math.tan(Math.max(-85.05112878, Math.min(85.05112878, lat)) * Math.PI / 180)) / Math.PI) / 2 * n - ty;
        for (const box of boxes) {
          const l = (box[0] + 180) / 360 * n - tx, r = (box[2] + 180) / 360 * n - tx, t = latitudeY(box[3]), b = latitudeY(box[1]);
          const consider = (i: number) => { const k = i * 4; if (bounds[k] <= r && bounds[k + 2] >= l && bounds[k + 1] <= b && bounds[k + 3] >= t) hits.add(i); };
          for (let y = clamp(t); y <= clamp(b); y++) for (let x = clamp(l); x <= clamp(r); x++) {
            const cell = y * cells + x;
            for (let p = offsets[cell]; p < offsets[cell + 1]; p++) consider(ids[p]);
          }
          for (const i of wideIds) consider(i);
        }
        const indexes = [...hits].sort((a, b) => a - b);
        return { length: indexes.length, feature(index) {
          const id = indexes[index]; let feature = memo.get(id);
          if (!feature) {
            const raw = layer.feature(id); let geometry: Vertex[][] | undefined;
            feature = { properties: raw.properties, extent: raw.extent, loadGeometry: () => geometry ??= raw.loadGeometry() };
            if (memo.size >= 64) memo.delete(memo.keys().next().value!);
            memo.set(id, feature);
          }
          return feature;
        } };
      } };
      const bytes = bounds.byteLength + offsets.byteLength + ids.byteLength + wideIds.byteLength + (layer.byteLength || 0) + 65536;
      if (bytes <= this.limit) {
        while (this.entries.size && (this.bytes + bytes > this.limit || this.entries.size >= 8)) { const oldest = this.entries.keys().next().value!; this.bytes -= this.entries.get(oldest)!.bytes; this.entries.delete(oldest); }
        this.entries.set(key, { value, bytes }); this.bytes += bytes;
      }
      return value;
    })();
    this.pending.set(key, task);
    try { return await task; } finally { if (this.pending.get(key) === task) this.pending.delete(key); }
  }
  /** Release every retained source/index and invalidate work tied to the previous coverage lifecycle. */
  clear(): void { this.generation++; this.entries.clear(); this.pending.clear(); this.bytes = 0; }
}
