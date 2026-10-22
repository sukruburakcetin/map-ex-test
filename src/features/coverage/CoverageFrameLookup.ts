export interface FrameLookupLocation { lon: number; lat: number }
type Loader = (sequence: string, location: FrameLookupLocation, signal: AbortSignal) => Promise<string | undefined>;
interface Entry { controller: AbortController; promise: Promise<string | undefined>; users: number; settled: boolean; expires: number; release?: ReturnType<typeof setTimeout> }

/** Metre-scale identity shared by a stable hover and the click that follows it. */
export function coverageFrameKey(sequence: string, location: FrameLookupLocation): string {
  return `${sequence}:${Math.round(location.lon * 1e5)}:${Math.round(location.lat * 1e5)}`;
}

/** Independent cancellation for each consumer, including uncooperative producers. */
function abortable<T>(work: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const abort = () => { signal.removeEventListener('abort', abort); reject(new DOMException('Cancelled', 'AbortError')); };
    if (signal.aborted) { work.catch(() => {}); abort(); return; }
    signal.addEventListener('abort', abort, { once: true });
    work.then(value => { signal.removeEventListener('abort', abort); resolve(value); }, error => { signal.removeEventListener('abort', abort); reject(error); });
  });
}

/** Shares bounded local tile work between hover and click; never enumerates routes.
 * Retains at most 16 successful ID hints for 30 seconds. Misses/errors are retryable.
 * The last departing consumer cancels work on the next task, permitting click handoff.
 */
export class CoverageFrameLookup {
  private readonly load: Loader;
  private readonly entries = new Map<string, Entry>();
  private view: unknown;
  private hover: AbortController | null = null;
  constructor(load: Loader) { this.load = load; }

  /** Acquire the new hover before releasing the old one, preserving shared producers. */
  warm(view: unknown, sequence: string, location: FrameLookupLocation): Promise<string | undefined> {
    const previous = this.hover, controller = new AbortController();
    const promise = this.resolve(view, sequence, location, controller.signal);
    this.hover = controller; previous?.abort(); return promise;
  }

  /** Join a producer or cached success with independent cancellation. */
  resolve(view: unknown, sequence: string, location: FrameLookupLocation, signal: AbortSignal): Promise<string | undefined> {
    if (signal.aborted) return Promise.reject(new DOMException('Cancelled', 'AbortError'));
    if (this.view !== view) { this.clear(); this.view = view; }
    const key = coverageFrameKey(sequence, location);
    let entry = this.entries.get(key);
    if (entry && (entry.controller.signal.aborted || (entry.settled && entry.expires < Date.now()))) {
      if (entry.release) clearTimeout(entry.release);
      this.entries.delete(key); entry = undefined;
    }
    if (!entry) {
      const controller = new AbortController();
      entry = { controller, promise: null!, users: 0, settled: false, expires: Infinity };
      const owned = entry;
      entry.promise = abortable(Promise.resolve().then(() => this.load(sequence, location, controller.signal)), controller.signal).then(value => {
        owned.settled = true; owned.expires = Date.now() + 30000;
        if (!value && this.entries.get(key) === owned) this.entries.delete(key);
        this.trim(); return value;
      }, error => { owned.settled = true; if (this.entries.get(key) === owned) this.entries.delete(key); throw error; });
      this.entries.set(key, entry);
    }
    if (entry.release) { clearTimeout(entry.release); entry.release = undefined; }
    ++entry.users;
    const owned = entry;
    return abortable(entry.promise, signal).finally(() => {
      --owned.users;
      this.trim();
      if (!owned.users && !owned.settled) owned.release = setTimeout(() => {
        if (!owned.users && !owned.settled) {
          owned.controller.abort();
          if (this.entries.get(key) === owned) this.entries.delete(key);
        }
      }, 0);
    });
  }

  /** Release speculative ownership without stopping an accepted click. */
  clearHover(): void { this.hover?.abort(); this.hover = null; }

  /** Abort view-owned producers and release timers and ID hints on teardown. */
  clear(): void {
    this.clearHover();
    for (const entry of this.entries.values()) { if (entry.release) clearTimeout(entry.release); entry.controller.abort(); }
    this.entries.clear(); this.view = undefined;
  }

  private trim(): void {
    for (const [key, entry] of this.entries) {
      if (this.entries.size <= 16) break;
      if (entry.settled && !entry.users) this.entries.delete(key);
    }
  }
}
