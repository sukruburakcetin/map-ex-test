/**
 * Instance-owned in-flight sequence downloads and independent subscriptions.
 * No viewer or React dependency; the runtime supplies downloading and disposal.
 */
import type { SequenceCoordinate, SequenceProgress } from './sequenceCoordinates';

type SequenceDownload = (sequenceId: string, accessToken: string, signal?: AbortSignal, onProgress?: SequenceProgress) => Promise<SequenceCoordinate[]>;
type SequenceTask = { controller: AbortController; promise: Promise<SequenceCoordinate[]>; users: number; listeners: Set<SequenceProgress> };

export class SharedSequenceRequests {
  private tasks = new Map<string, SequenceTask>();

  constructor(private readonly fetchCoordinates: SequenceDownload) {}

  /**
   * Share a download by sequence ID. Each caller releases its own subscription;
   * only the final departing subscriber aborts the underlying request. Progress
   * callback failures do not discard downloaded data. Download failures propagate.
   */
  async get(sequenceId: string, accessToken: string, signal?: AbortSignal, onProgress?: SequenceProgress): Promise<SequenceCoordinate[]> {
    if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
    this.tasks ??= new Map();
    let task = this.tasks.get(sequenceId);
    if (!task || task.controller.signal.aborted) {
      task = { controller: new AbortController(), promise: Promise.resolve([]), users: 0, listeners: new Set() };
      const entry = task;
      this.tasks.set(sequenceId, entry);
      entry.promise = this.fetchCoordinates(sequenceId, accessToken, entry.controller.signal, (points, batch, loaded, total) => {
        entry.listeners.forEach((listener: SequenceProgress) => { try { listener(points, batch, loaded, total); } catch (_) { /* Preview failure must not lose sequence data. */ } });
      });
      const cleanup = () => { if (this.tasks.get(sequenceId) === entry) this.tasks.delete(sequenceId); };
      entry.promise.then(cleanup, cleanup);
    }
    const entry = task; entry.users++;
    if (onProgress) entry.listeners.add(onProgress);
    return new Promise((resolve, reject) => {
      let settled = false;
      const release = () => { signal?.removeEventListener("abort", abort); if (onProgress) entry.listeners.delete(onProgress); if (--entry.users === 0) entry.controller.abort(); };
      const abort = () => { if (settled) return; settled = true; release(); reject(new DOMException("Cancelled", "AbortError")); };
      signal?.addEventListener("abort", abort, { once: true });
      entry.promise.then((value: SequenceCoordinate[]) => { if (!settled) { settled = true; release(); resolve(value); } }, (error: unknown) => { if (!settled) { settled = true; release(); reject(error); } });
      if (signal?.aborted) abort();
    });
  }

  /** Abort owned downloads and clear in-flight entries on widget teardown. */
  dispose(): void {
    this.tasks.forEach(task => task.controller.abort());
    this.tasks.clear();
  }
}
