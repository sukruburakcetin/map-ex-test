export interface SharedTileRequestStats {
  started: number;
  shared: number;
  aborted: number;
  active: number;
}
type TileOutcome = { ok: true; value: ArrayBuffer } | { ok: false; error: unknown };
interface TileSubscriber {
  finish(outcome: TileOutcome): void;
}
interface TileRequest {
  key: string;
  controller: AbortController;
  subscribers: Set<TileSubscriber>;
  settled: boolean;
}
const cancelled = () => new DOMException('Cancelled', 'AbortError');

/** Share only in-flight work. The host owns cache, transport, retries and key scope.
 * Every caller owns its subscription; only its last departure aborts the producer.
 * Counters contain no tile keys, URLs or credentials and survive clear().
 */
export class SharedTileRequests {
  private tasks = new Map<string, TileRequest>();
  private started = 0;
  private shared = 0;
  private aborted = 0;

  get stats(): SharedTileRequestStats {
    return { started: this.started, shared: this.shared, aborted: this.aborted, active: this.tasks.size };
  }

  get(key: string, signal: AbortSignal, load: (signal: AbortSignal) => Promise<ArrayBuffer>): Promise<ArrayBuffer> {
    if (signal.aborted) return Promise.reject(cancelled());
    let entry = this.tasks.get(key);
    if (!entry || entry.settled || entry.controller.signal.aborted) {
      entry = { key, controller: new AbortController(), subscribers: new Set(), settled: false };
      this.tasks.set(key, entry); ++this.started;
      const task = entry;
      // Install the entry and subscribers before invoking host code, including
      // synchronous throws, reentrant clear(), and immediately fulfilled loads.
      Promise.resolve().then(() => {
        if (task.settled || task.controller.signal.aborted) throw cancelled();
        return load(task.controller.signal);
      }).then(value => this.finish(task, { ok: true, value }), error => this.finish(task, { ok: false, error }));
    } else ++this.shared;
    const task = entry;
    return new Promise<ArrayBuffer>((resolve, reject) => {
      let settled = false;
      const subscriber: TileSubscriber = {
        finish: outcome => {
          if (settled) return;
          settled = true; signal.removeEventListener('abort', abort); task.subscribers.delete(subscriber);
          if (outcome.ok) resolve(outcome.value); else reject(outcome.error);
        },
      };
      const abort = () => {
        subscriber.finish({ ok: false, error: cancelled() });
        if (!task.settled && task.subscribers.size === 0) this.cancel(task);
      };
      task.subscribers.add(subscriber);
      signal.addEventListener('abort', abort, { once: true });
      if (signal.aborted) abort();
    });
  }

  private finish(task: TileRequest, outcome: TileOutcome): void {
    if (task.settled) return;
    if (task.controller.signal.aborted) { this.cancel(task); return; }
    task.settled = true;
    if (this.tasks.get(task.key) === task) this.tasks.delete(task.key);
    for (const subscriber of [...task.subscribers]) subscriber.finish(outcome);
  }

  private cancel(task: TileRequest): void {
    if (task.settled) return;
    task.settled = true;
    if (this.tasks.get(task.key) === task) this.tasks.delete(task.key);
    ++this.aborted;
    task.controller.abort();
    for (const subscriber of [...task.subscribers]) subscriber.finish({ ok: false, error: cancelled() });
  }

  /** Reject subscribers promptly even when an obsolete transport ignores abort. */
  clear(): void {
    for (const task of [...this.tasks.values()]) this.cancel(task);
  }
}
