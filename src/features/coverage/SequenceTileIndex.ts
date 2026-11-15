export type SequenceIndexSource = 'sequence' | 'image';
interface IndexLayer { length: number; feature(index: number): { properties: Record<string, unknown> } }
export type SequenceTileDecode = (buffer: ArrayBuffer) => { layers: Partial<Record<SequenceIndexSource, IndexLayer>> };
export interface SequenceFeatureIndex {
  /** Approximation includes retained source bytes, typed indices, strings and map bookkeeping. */
  readonly estimatedBytes: number;
  indices(source: SequenceIndexSource, sequenceId: string): Uint32Array;
  imageIndex(imageId: string): number | undefined;
}
interface IndexTask { controller: AbortController; users: number; promise: Promise<SequenceFeatureIndex> }
const empty = new Uint32Array(0);
const cancelled = () => new DOMException('Cancelled', 'AbortError');
const check = (signal: AbortSignal) => { if (signal.aborted) throw cancelled(); };

/** Compact membership only: never retains decoded features, geometry, or metadata.
 * ArrayBuffer identity keeps indices tied to immutable tile bytes. The LRU budget
 * counts those retained bytes too; oversized results remain usable without caching.
 */
export class SequenceTileIndex {
  private entries = new Map<ArrayBuffer, SequenceFeatureIndex>();
  private pending = new Map<ArrayBuffer, IndexTask>();
  private bytes = 0;
  private generation = 0;
  private hits = 0;
  private builds = 0;
  constructor(private readonly limit = 8 * 1024 * 1024, private readonly maxEntries = 16) {}

  get stats(): { hits: number; builds: number; bytes: number; entries: number; active: number } {
    return { hits: this.hits, builds: this.builds, bytes: this.bytes, entries: this.entries.size, active: this.pending.size };
  }

  has(buffer: ArrayBuffer): boolean { return this.entries.has(buffer); }

  get(buffer: ArrayBuffer, decode: SequenceTileDecode, signal: AbortSignal): Promise<SequenceFeatureIndex> {
    if (signal.aborted) return Promise.reject(cancelled());
    const cached = this.entries.get(buffer);
    if (cached) {
      ++this.hits; this.entries.delete(buffer); this.entries.set(buffer, cached);
      return Promise.resolve(cached);
    }
    let task = this.pending.get(buffer);
    if (!task || task.controller.signal.aborted) {
      const controller = new AbortController(), generation = this.generation;
      ++this.builds;
      const promise = this.build(buffer, decode, controller.signal).then(index => {
        if (controller.signal.aborted || generation !== this.generation) throw cancelled();
        this.store(buffer, index); return index;
      });
      task = { controller, users: 0, promise }; this.pending.set(buffer, task);
      const entry = task;
      const cleanup = () => { if (this.pending.get(buffer) === entry) this.pending.delete(buffer); };
      promise.then(cleanup, cleanup);
    }
    const entry = task; ++entry.users;
    return new Promise((resolve, reject) => {
      let settled = false;
      const release = () => {
        signal.removeEventListener('abort', abort);
        entry.controller.signal.removeEventListener('abort', abort);
        if (--entry.users === 0) entry.controller.abort();
      };
      const abort = () => {
        if (settled) return; settled = true; release(); reject(cancelled());
      };
      signal.addEventListener('abort', abort, { once: true });
      entry.controller.signal.addEventListener('abort', abort, { once: true });
      entry.promise.then(index => { if (!settled) { settled = true; release(); resolve(index); } },
        error => { if (!settled) { settled = true; release(); reject(error); } });
      if (signal.aborted || entry.controller.signal.aborted) abort();
    });
  }

  clear(): void {
    ++this.generation;
    this.pending.forEach(task => task.controller.abort()); this.pending.clear();
    this.entries.clear(); this.bytes = 0;
  }

  private store(buffer: ArrayBuffer, index: SequenceFeatureIndex): void {
    if (index.estimatedBytes > this.limit || this.maxEntries < 1) return;
    while (this.entries.size && (this.bytes + index.estimatedBytes > this.limit || this.entries.size >= this.maxEntries)) {
      const oldest = this.entries.keys().next().value!;
      this.bytes -= this.entries.get(oldest)!.estimatedBytes; this.entries.delete(oldest);
    }
    this.entries.set(buffer, index); this.bytes += index.estimatedBytes;
  }

  private async build(buffer: ArrayBuffer, decode: SequenceTileDecode, signal: AbortSignal): Promise<SequenceFeatureIndex> {
    check(signal);
    const lookups: Record<SequenceIndexSource, Map<string, Uint32Array>> = { sequence: new Map(), image: new Map() };
    const images = new Map<string, number>();
    let estimatedBytes = buffer.byteLength + 256, deadline = performance.now() + 4;
    if (buffer.byteLength) {
      const layers = decode(buffer).layers;
      for (const source of ['sequence', 'image'] as const) {
        const layer = layers[source]; if (!layer) continue;
        const groups = new Map<string, number[]>();
        for (let i = 0; i < layer.length; i++) {
          if ((i & 127) === 0) {
            check(signal);
            if (performance.now() >= deadline) { await new Promise(resolve => setTimeout(resolve, 0)); check(signal); deadline = performance.now() + 4; }
          }
          const properties = layer.feature(i).properties;
          if (source === 'image' && (typeof properties.id === 'string' || typeof properties.id === 'number')) {
            const imageId = String(properties.id);
            if (imageId && !images.has(imageId)) { images.set(imageId, i); estimatedBytes += imageId.length * 2 + 112; }
          }
          const value = properties[source === 'sequence' ? 'id' : 'sequence_id'];
          const id = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
          if (!id) continue;
          const indices = groups.get(id);
          if (indices) indices.push(i); else groups.set(id, [i]);
        }
        let groupsVisited = 0;
        for (const [id, positions] of groups) {
          if ((groupsVisited++ & 127) === 0) {
            check(signal);
            if (performance.now() >= deadline) { await new Promise(resolve => setTimeout(resolve, 0)); check(signal); deadline = performance.now() + 4; }
          }
          const indices = Uint32Array.from(positions);
          estimatedBytes += indices.byteLength + id.length * 2 + 128;
          lookups[source].set(id, indices); groups.delete(id);
        }
      }
    }
    check(signal);
    return { estimatedBytes, indices: (source, id) => lookups[source].get(id) || empty, imageIndex: id => images.get(id) };
  }
}
