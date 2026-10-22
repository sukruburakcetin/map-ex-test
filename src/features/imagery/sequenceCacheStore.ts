/** Optional sequence metadata persistence. Chunked cloning never owns playback state. */
export class SequenceCacheStore {
  private opening: Promise<IDBDatabase | undefined> | undefined;
  private pending = new Map<string, unknown>();
  private scheduled = false;
  private writing = false;
  private writingEntry: { key: string; data: unknown; generation: number } | null = null;
  private generation = 0;
  private serial = 0;
  private readonly chunkSize = 256;
  constructor(private readonly factory: () => IDBFactory | undefined = () => typeof indexedDB === 'undefined' ? undefined : indexedDB,
    private readonly schedule: (work: () => void) => unknown = work => typeof requestIdleCallback === 'function' ? requestIdleCallback(work, { timeout: 2000 }) : setTimeout(work, 32)) {}
  private open(): Promise<IDBDatabase | undefined> {
    if (this.opening) return this.opening;
    let factory: IDBFactory | undefined;
    try { factory = this.factory(); } catch { return Promise.resolve(undefined); }
    if (!factory) return Promise.resolve(undefined);
    this.opening = new Promise(resolve => {
      let settled = false;
      const finish = (db?: IDBDatabase) => { if (settled) { db?.close(); return; } settled = true; clearTimeout(timer); resolve(db); };
      const timer = setTimeout(() => finish(), 150);
      try {
        const request = factory.open('mly_sequence_coordinates_v1', 2);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('sequences')) { const store = db.createObjectStore('sequences', { keyPath: 'key' }); store.createIndex('updated', 'updated'); }
          if (!db.objectStoreNames.contains('parts')) db.createObjectStore('parts', { keyPath: 'key' });
        };
        request.onerror = request.onblocked = () => finish();
        request.onsuccess = () => { const db = request.result; db.onversionchange = () => { db.close(); this.opening = undefined; }; finish(db); };
      } catch { finish(); }
    });
    return this.opening;
  }
  /** Legacy v1 records remain readable. New records are committed manifests plus small parts. */
  async read(key: string): Promise<unknown> {
    if (this.pending.has(key)) return this.pending.get(key);
    if (this.writingEntry?.key === key && this.writingEntry.generation === this.generation) return this.writingEntry.data;
    const generation = this.generation, db = await this.open();
    if (!db || generation !== this.generation) return undefined;
    const record = await new Promise<any>(resolve => {
      let settled = false;
      const finish = (value?: unknown) => { if (settled) return; settled = true; clearTimeout(timer); resolve(value); };
      const timer = setTimeout(() => finish(), 150);
      try { const request = db.transaction('sequences', 'readonly').objectStore('sequences').get(key); request.onsuccess = () => finish(request.result); request.onerror = () => finish(); }
      catch { finish(); }
    });
    if (!record || generation !== this.generation) return undefined;
    if (!Array.isArray(record.parts)) return record.data;
    return new Promise(resolve => {
      let settled = false;
      const finish = (value?: unknown) => { if (settled) return; settled = true; clearTimeout(timer); resolve(generation === this.generation ? value : undefined); };
      const timer = setTimeout(() => finish(), 500);
      try {
        const transaction = db.transaction('parts', 'readonly'), store = transaction.objectStore('parts');
        const chunks: unknown[][] = new Array(record.parts.length);
        record.parts.forEach((part: string, i: number) => { const request = store.get(part); request.onsuccess = () => { chunks[i] = request.result?.data; }; request.onerror = () => finish(); });
        transaction.onerror = transaction.onabort = () => finish();
        transaction.oncomplete = () => {
          if (chunks.length !== record.parts.length || chunks.some(chunk => !Array.isArray(chunk))) { finish(); return; }
          const points: unknown[] = []; for (const chunk of chunks) { if (!chunk) { finish(); return; } points.push(...chunk); }
          finish(points.length === record.length ? points : undefined);
        };
      } catch { finish(); }
    });
  }
  queue(key: string, data: unknown): void {
    try { if (!this.factory()) return; } catch { return; }
    this.pending.delete(key); this.pending.set(key, data);
    while (this.pending.size > 6) this.pending.delete(this.pending.keys().next().value!);
    this.kick();
  }
  private kick(): void {
    if (this.scheduled || this.writing || !this.pending.size) return;
    this.scheduled = true; this.schedule(() => { this.scheduled = false; void this.flush(); });
  }
  private idle(): Promise<void> { return new Promise(resolve => { this.schedule(resolve); }); }
  private transaction(db: IDBDatabase, stores: string[], work: (transaction: IDBTransaction) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(stores, 'readwrite');
        transaction.oncomplete = () => resolve(); transaction.onerror = transaction.onabort = () => reject(transaction.error || new Error('Sequence cache transaction aborted'));
        work(transaction);
      } catch (error) { reject(error); }
    });
  }
  private async flush(): Promise<void> {
    if (this.writing || !this.pending.size) return;
    this.writing = true;
    const generation = this.generation, [key, data] = this.pending.entries().next().value!;
    this.pending.delete(key); this.writingEntry = { key, data, generation };
    const parts: string[] = [];
    let db: IDBDatabase | undefined, committed = false;
    const current = () => generation === this.generation && !this.pending.has(key);
    try {
      db = await this.open(); if (!db || !current()) return;
      const run = `${Date.now()}-${++this.serial}-${Math.random().toString(36).slice(2)}`;
      if (Array.isArray(data) && data.length > this.chunkSize) {
        for (let offset = 0; offset < data.length; offset += this.chunkSize) {
          // Each structured clone contains at most 256 coordinates and runs in a separate idle slice.
          await this.idle(); if (!current()) return;
          const part = `${key}:${run}:${offset}`; parts.push(part);
          await this.transaction(db, ['parts'], transaction => { transaction.objectStore('parts').put({ key: part, data: data.slice(offset, offset + this.chunkSize) }); });
        }
      }
      await this.idle(); if (!current()) return;
      await this.transaction(db, ['sequences', 'parts'], transaction => {
        const store = transaction.objectStore('sequences'), chunks = transaction.objectStore('parts');
        // Manifest replacement and old-part removal are atomic; partial writes never become readable.
        const old = store.get(key); old.onsuccess = () => { for (const part of old.result?.parts || []) chunks.delete(part); };
        store.put(parts.length ? { key, parts, length: (data as unknown[]).length, updated: Date.now() } : { key, data, updated: Date.now() });
        const count = store.count(); count.onsuccess = () => {
          let extra = count.result - 6; if (extra <= 0) return;
          const cursor = store.index('updated').openCursor(); cursor.onsuccess = () => {
            const item = cursor.result; if (!item || extra-- <= 0) return;
            // Do not evict the record currently being committed if timestamps tie.
            if (item.primaryKey === key) { ++extra; item.continue(); return; }
            for (const part of item.value.parts || []) chunks.delete(part);
            item.delete(); item.continue();
          };
        };
      });
      committed = true;
    } catch { /* Persistence is optional. RAM and live image tracking remain available. */ }
    finally {
      if (db && !committed && parts.length) {
        try { await this.transaction(db, ['parts'], transaction => { const store = transaction.objectStore('parts'); parts.forEach(part => store.delete(part)); }); } catch { /* Storage may have closed. */ }
      }
      this.writingEntry = null; this.writing = false; this.kick();
    }
  }
  async clear(): Promise<void> {
    ++this.generation; this.pending.clear(); this.writingEntry = null;
    const db = await this.open(); if (!db) return;
    try { await this.transaction(db, ['sequences', 'parts'], transaction => { transaction.objectStore('sequences').clear(); transaction.objectStore('parts').clear(); }); } catch { /* Storage is optional. */ }
  }
}
export const sequenceCacheStore = new SequenceCacheStore();
