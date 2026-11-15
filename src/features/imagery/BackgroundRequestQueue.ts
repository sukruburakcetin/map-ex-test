type Work = (signal: AbortSignal) => unknown | Promise<unknown>;
type Job = {
  work: Work;
  controller: AbortController;
  signal?: AbortSignal;
  abort?: () => void;
  resolve(value: unknown): void;
  reject(reason: unknown): void;
  state: 'queued' | 'running' | 'finished';
  settled: boolean;
};
const cancelled = () => new DOMException('Cancelled', 'AbortError');

/** FIFO scheduler for optional metadata; foreground imagery stays outside this queue.
 * Pausing defers new jobs without interrupting existing requests. Caller cancellation
 * rejects promptly, but physical work retains its slot until it settles, including
 * work that ignores abort. clear() cancels current jobs and permits later reuse.
 */
export class BackgroundRequestQueue {
  private queue: Job[] = [];
  private running = new Set<Job>();
  private paused = false;
  private clearing = false;
  private completed = 0;
  private aborted = 0;

  constructor(private limit = 2) {
    if (!Number.isSafeInteger(limit) || limit < 1) throw new RangeError('Background request limit must be a positive integer.');
  }

  /** Active counts unsettled physical jobs. Completed includes success/failure;
   * aborted counts accepted jobs cancelled by their caller or clear(), once each.
   * No request identities, URLs or credentials are retained in these counters.
   */
  get stats(): { active: number; queued: number; completed: number; aborted: number } {
    return { active: this.running.size, queued: this.queue.length, completed: this.completed, aborted: this.aborted };
  }

  run<T>(work: (signal: AbortSignal) => Promise<T>, signal?: AbortSignal): Promise<T> {
    if (signal?.aborted) return Promise.reject(cancelled());
    return new Promise<T>((resolve, reject) => {
      const job: Job = { work, controller: new AbortController(), signal,
        resolve: value => resolve(value as T), reject, state: 'queued', settled: false };
      job.abort = () => this.cancel(job);
      this.queue.push(job);
      signal?.addEventListener('abort', job.abort, { once: true });
      // A host signal wrapper can abort while installing its listener.
      if (signal?.aborted) this.cancel(job);
      this.drain();
    });
  }

  /** Playback may lower optional concurrency without cancelling running work.
   * Capacity increases take effect immediately unless the queue is paused.
   */
  setLimit(limit: number): void {
    if (!Number.isSafeInteger(limit) || limit < 1) throw new RangeError('Background request limit must be a positive integer.');
    this.limit = limit;
    this.drain();
  }

  get concurrency(): number { return this.limit; }

  setPaused(paused: boolean): void {
    this.paused = paused;
    if (!paused) this.drain();
  }

  /** Preserve pause intent. Running cancelled work continues to occupy its physical
   * slot until its underlying operation settles, so reuse cannot oversubscribe it.
   */
  clear(): void {
    this.clearing = true;
    const queued = this.queue.splice(0);
    for (const job of [...queued, ...this.running]) this.cancel(job);
    this.clearing = false;
    this.drain();
  }

  private cleanup(job: Job): void {
    if (job.abort) job.signal?.removeEventListener('abort', job.abort);
    job.signal = undefined; job.abort = undefined;
  }

  private cancel(job: Job): void {
    if (job.settled) return;
    job.settled = true; ++this.aborted;
    this.cleanup(job);
    if (job.state === 'queued') {
      const index = this.queue.indexOf(job);
      if (index >= 0) this.queue.splice(index, 1);
      job.state = 'finished';
    }
    job.controller.abort();
    job.reject(cancelled());
    this.drain();
  }

  private drain(): void {
    if (this.paused || this.clearing) return;
    while (this.running.size < this.limit && this.queue.length) {
      const job = this.queue.shift()!;
      if (job.settled) continue;
      job.state = 'running'; this.running.add(job);
      // Reserve the slot before entering user work; throws are handled like any
      // rejected request, and cancellation before this microtask starts no work.
      Promise.resolve().then(() => {
        if (job.controller.signal.aborted) throw cancelled();
        return job.work(job.controller.signal);
      }).then(value => this.finish(job, true, value), error => this.finish(job, false, error));
    }
  }

  private finish(job: Job, success: boolean, value: unknown): void {
    this.running.delete(job); job.state = 'finished';
    this.cleanup(job);
    if (!job.settled) {
      job.settled = true; ++this.completed;
      if (success) job.resolve(value); else job.reject(value);
    }
    this.drain();
  }
}
