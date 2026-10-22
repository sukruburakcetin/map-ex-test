/** Bounded decoded geometry for overview/sequence picking; no SDK objects or image metadata. */
type Box = readonly [number, number, number, number];
type Vertex = { x: number; y: number };
interface Feature { properties: Record<string, any>; extent?: number; loadGeometry(): Vertex[][] }
interface Layer { length: number; feature(index: number): Feature }
interface RecordEntry { feature: Feature; bounds: Box }
export interface PickSource { query(boxes: readonly Box[], tile: readonly [number, number, number]): Layer }

/**
 * Reuse compact line geometry across pointer events. Construction follows the
 * coverage lifecycle, so moving the pointer does not restart an in-flight build.
 * Filters/projection are applied by the caller on every query. Oversized layers
 * use the original complete scan; source coverage is never truncated.
 */
export class RepresentativePickCache {
  private entries = new Map<string, { value: PickSource; bytes: number }>();
  private pending = new Map<string, Promise<PickSource | null>>();
  private bytes = 0;
  private generation = 0;
  private limit: number;
  constructor(limit = 2 * 1024 * 1024) { this.limit = limit; }
  async get(key: string, load: () => Promise<Layer | null>, signal: AbortSignal): Promise<PickSource | null> {
    const cached = this.entries.get(key);
    if (cached) { this.entries.delete(key); this.entries.set(key, cached); return cached.value; }
    const pending = this.pending.get(key); if (pending) return pending;
    const generation = this.generation;
    const check = () => { if (signal.aborted || generation !== this.generation) throw new DOMException('Cancelled', 'AbortError'); };
    const task = (async () => {
      check(); const layer = await load(); check(); if (!layer) return null;
      const rows: RecordEntry[] = [], grid = Array.from({ length: 256 }, () => new Set<number>());
      let bytes = 16384, deadline = performance.now() + 8;
      for (let i = 0; i < layer.length; i++) {
        if ((i & 127) === 0 && performance.now() >= deadline) { await new Promise(resolve => setTimeout(resolve, 0)); deadline = performance.now() + 8; }
        check(); const item = layer.feature(i), paths = item.loadGeometry(), extent = Number(item.extent) || 4096;
        let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
        bytes += 512;
        for (const path of paths) for (const p of path) { left = Math.min(left, p.x / extent); right = Math.max(right, p.x / extent); top = Math.min(top, p.y / extent); bottom = Math.max(bottom, p.y / extent); bytes += 32; }
        const clamp = (v: number) => Math.max(0, Math.min(15, Math.floor(v * 16)));
        if (Number.isFinite(left)) for (let y = clamp(top); y <= clamp(bottom); y++) for (let x = clamp(left); x <= clamp(right); x++) { grid[y * 16 + x].add(i); bytes += 16; }
        if (bytes > this.limit) return { query: () => layer };
        rows.push({ feature: { properties: item.properties, extent, loadGeometry: () => paths }, bounds: [left, top, right, bottom] });
      }
      check();
      const value: PickSource = { query(boxes, tile) {
        const [tx, ty, z] = tile, n = 2 ** z, hits = new Set<number>();
        const latitudeY = (lat: number) => (1 - Math.asinh(Math.tan(Math.max(-85.05112878, Math.min(85.05112878, lat)) * Math.PI / 180)) / Math.PI) / 2 * n - ty;
        for (const box of boxes) {
          const l = (box[0] + 180) / 360 * n - tx, r = (box[2] + 180) / 360 * n - tx, t = latitudeY(box[3]), b = latitudeY(box[1]);
          const clamp = (v: number) => Math.max(0, Math.min(15, Math.floor(v * 16)));
          for (let y = clamp(t); y <= clamp(b); y++) for (let x = clamp(l); x <= clamp(r); x++) for (const i of grid[y * 16 + x]) {
            const bounds = rows[i].bounds;
            if (bounds[0] <= r && bounds[2] >= l && bounds[1] <= b && bounds[3] >= t) hits.add(i);
          }
        }
        // Source order preserves deterministic ties across cold/warm picks.
        const indexes = [...hits].sort((a, b) => a - b);
        return { length: indexes.length, feature: i => rows[indexes[i]].feature };
      } };
      while (this.entries.size && (this.bytes + bytes > this.limit || this.entries.size >= 8)) { const oldest = this.entries.keys().next().value!; this.bytes -= this.entries.get(oldest)!.bytes; this.entries.delete(oldest); }
      this.entries.set(key, { value, bytes }); this.bytes += bytes; return value;
    })();
    this.pending.set(key, task);
    try { return await task; } finally { if (this.pending.get(key) === task) this.pending.delete(key); }
  }
  /** Invalidate pending construction and release every decoded geometry on coverage teardown. */
  clear(): void { this.generation++; this.entries.clear(); this.pending.clear(); this.bytes = 0; }
}
