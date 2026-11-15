export interface CachedSequencePreviewKey {
  sequenceId: string;
  requestId: number;
  view: object;
  tiles: readonly (readonly [string, ArrayBuffer])[];
}
interface PreviewJob extends CachedSequencePreviewKey {
  signal: AbortSignal;
  controller: AbortController;
  promise: Promise<void>;
}
const cancelled = () => new DOMException('Cancelled', 'AbortError');

/** One optional preview job. Tile bytes stay immutable; identity uses their buffer references.
 * Identical snapshots share pending work and successful results. A changed selection,
 * view or snapshot cancels the predecessor rather than keeping a growing preview cache.
 */
export class CachedSequencePreview {
  private job: PreviewJob | null = null;

  run(key: CachedSequencePreviewKey, signal: AbortSignal, work: (signal: AbortSignal) => Promise<void>): Promise<void> {
    if (signal.aborted) return Promise.reject(cancelled());
    const tiles = key.tiles.map(([name, buffer]) => [name, buffer] as const)
      .sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
    const previous = this.job;
    if (previous && previous.signal === signal && previous.sequenceId === key.sequenceId &&
      previous.requestId === key.requestId && previous.view === key.view &&
      previous.tiles.length === tiles.length && previous.tiles.every(([name, buffer], i) => name === tiles[i][0] && buffer === tiles[i][1])) {
      return previous.promise;
    }
    this.clear();
    const controller = new AbortController();
    const job: PreviewJob = { sequenceId: key.sequenceId, requestId: key.requestId, view: key.view,
      tiles, signal, controller, promise: Promise.resolve() };
    this.job = job;
    const abort = () => controller.abort();
    let rejectCancellation: () => void = () => {};
    const cancellation = new Promise<void>((_, reject) => { rejectCancellation = () => reject(cancelled()); });
    controller.signal.addEventListener('abort', rejectCancellation, { once: true });
    signal.addEventListener('abort', abort, { once: true });
    job.promise = Promise.race([
      Promise.resolve().then(async () => {
        if (controller.signal.aborted) throw cancelled();
        await work(controller.signal);
        if (controller.signal.aborted) throw cancelled();
      }),
      cancellation,
    ]).catch(error => {
      if (this.job === job) this.job = null;
      throw error;
    }).finally(() => {
      signal.removeEventListener('abort', abort);
      controller.signal.removeEventListener('abort', rejectCancellation);
    });
    // The signal can have changed while installing listeners in a host wrapper.
    if (signal.aborted) abort();
    return job.promise;
  }

  clear(): void {
    const job = this.job;
    this.job = null;
    job?.controller.abort();
  }
}
