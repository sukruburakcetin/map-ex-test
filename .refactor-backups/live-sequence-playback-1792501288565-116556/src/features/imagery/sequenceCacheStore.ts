/** Optional persistent sequence coordinates. No tokens, imagery pixels or field notes enter this database. */
export class SequenceCacheStore {
  private opening: Promise<IDBDatabase | undefined> | undefined;
  private pending = new Map<string, unknown>();
  private scheduled = false;
  private writing = false;
  private generation = 0;
  private factory: () => IDBFactory | undefined;
  private schedule: (work: () => void) => unknown;
  constructor(factory: () => IDBFactory | undefined = () => typeof indexedDB === 'undefined' ? undefined : indexedDB,
    schedule: (work: () => void) => unknown = work => typeof requestIdleCallback === 'function' ? requestIdleCallback(work, { timeout: 2000 }) : setTimeout(work, 32)) {
    this.factory = factory; this.schedule = schedule;
  }
  /** Bound database opening so blocked/denied browser storage cannot stall navigation. */
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
        const request = factory.open('mly_sequence_coordinates_v1', 1);
        request.onupgradeneeded = () => { const store = request.result.createObjectStore('sequences', { keyPath: 'key' }); store.createIndex('updated', 'updated'); };
        request.onerror = request.onblocked = () => finish();
        request.onsuccess = () => { const db = request.result; db.onversionchange = () => { db.close(); this.opening = undefined; }; finish(db); };
      } catch { finish(); }
    });
    return this.opening;
  }
  /** Read asynchronously; incomplete/invalid records are validated by the sequence downloader. */
  async read(key: string): Promise<unknown> {
    if (this.pending.has(key)) return this.pending.get(key);
    const generation = this.generation, db = await this.open();
    if (!db || generation !== this.generation) return undefined;
    return new Promise(resolve => {
      let settled = false;
      const finish = (value?: unknown) => { if (settled) return; settled = true; clearTimeout(timer); resolve(generation === this.generation ? value : undefined); };
      const timer = setTimeout(() => finish(), 150);
      try { const request = db.transaction('sequences', 'readonly').objectStore('sequences').get(key); request.onsuccess = () => finish(request.result?.data); request.onerror = () => finish(); }
      catch { finish(); }
    });
  }
  /** Coalesce writes and yield until idle. IndexedDB stores structured data without JSON.stringify/setItem. */
  queue(key: string, data: unknown): void {
    try { if (!this.factory()) return; } catch { return; }
    this.pending.delete(key); this.pending.set(key, data);
    while (this.pending.size > 6) this.pending.delete(this.pending.keys().next().value!);
    this.kick();
  }
  private kick(): void {
    if (this.scheduled || this.writing || !this.pending.size) return;
    this.scheduled = true;
    this.schedule(() => { this.scheduled = false; void this.flush(); });
  }
  private async flush(): Promise<void> {
    if (this.writing || !this.pending.size) return;
    this.writing = true;
    const generation = this.generation, [key, data] = this.pending.entries().next().value!;
    this.pending.delete(key);
    try {
      const db = await this.open(); if (!db || generation !== this.generation) return;
      await new Promise<void>(resolve => {
        try {
          const transaction = db.transaction('sequences', 'readwrite'), store = transaction.objectStore('sequences');
          transaction.oncomplete = transaction.onerror = transaction.onabort = () => resolve();
          store.put({ key, data, updated: Date.now() });
          const count = store.count();
          count.onsuccess = () => {
            let extra = count.result - 6; if (extra <= 0) return;
            const cursor = store.index('updated').openKeyCursor();
            cursor.onsuccess = () => { const item = cursor.result; if (!item || extra-- <= 0) return; store.delete(item.primaryKey); item.continue(); };
          };
        } catch { resolve(); }
      });
    } finally { this.writing = false; this.kick(); }
  }
  /** Clear owned persistent coordinates and invalidate queued writes; unrelated widget data is untouched. */
  async clear(): Promise<void> {
    ++this.generation; this.pending.clear();
    const db = await this.open(); if (!db) return;
    try { db.transaction('sequences', 'readwrite').objectStore('sequences').clear(); } catch { /* Storage is optional. */ }
  }
}
export const sequenceCacheStore = new SequenceCacheStore();
