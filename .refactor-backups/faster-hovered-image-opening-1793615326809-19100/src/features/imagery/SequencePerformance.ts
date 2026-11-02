export const SEQUENCE_PERFORMANCE_KINDS = [
  'click-image', 'hover-highlight', 'context-ready', 'tile-load', 'sequence-index',
] as const;
export type SequencePerformanceKind = typeof SEQUENCE_PERFORMANCE_KINDS[number];
export const SEQUENCE_PERFORMANCE_COUNTERS = [
  'clicks', 'hoverRequests', 'tileRequests', 'sharedTileRequests', 'tileCacheHits',
  'indexBuilds', 'indexHits', 'backgroundRequests', 'cancelledWork',
] as const;
export type SequencePerformanceCounter = typeof SEQUENCE_PERFORMANCE_COUNTERS[number];
export interface SequenceMeasurement { finish(): void; cancel(): void }
export interface SequenceTimingSummary {
  /** Completed samples since reset. Summaries describe only the retained window. */
  count: number;
  retained: number;
  p50Ms: number | null;
  p95Ms: number | null;
  maxMs: number | null;
  lastMs: number | null;
}
export interface SequencePerformanceSnapshot {
  timings: Record<SequencePerformanceKind, SequenceTimingSummary>;
  counters: Record<SequencePerformanceCounter, number>;
  /** Gaps between confirmed viewer images, not GPU frame times or stall counts. */
  playbackFrameGaps: SequenceTimingSummary;
  /** Durations supplied by an optional host-owned PerformanceObserver. */
  longTasks: SequenceTimingSummary;
}

const RETAINED_SAMPLES = 128;
const clock = (): number => typeof performance !== 'undefined' && typeof performance.now === 'function'
  ? performance.now() : Date.now();
const validDuration = (value: number): boolean => Number.isFinite(value) && value >= 0;
const increment = (value: number, delta = 1): number => Math.min(Number.MAX_SAFE_INTEGER, value + delta);

/** Fixed-size ring: no samples, task handles, image identities or URLs escape into history. */
class TimingWindow {
  private samples: number[] = [];
  private next = 0;
  private count = 0;
  private last: number | null = null;
  record(duration: number): void {
    if (!validDuration(duration)) return;
    this.samples[this.next] = duration;
    this.next = (this.next + 1) % RETAINED_SAMPLES;
    this.count = increment(this.count);
    this.last = duration;
  }
  snapshot(): SequenceTimingSummary {
    const ordered = this.samples.slice().sort((a, b) => a - b);
    const quantile = (fraction: number): number | null => ordered.length
      ? ordered[Math.max(0, Math.ceil(ordered.length * fraction) - 1)] : null;
    return { count: this.count, retained: ordered.length, p50Ms: quantile(0.5), p95Ms: quantile(0.95),
      maxMs: ordered.length ? ordered[ordered.length - 1] : null, lastMs: this.last };
  }
}
const timingWindows = (): Record<SequencePerformanceKind, TimingWindow> => Object.fromEntries(
  SEQUENCE_PERFORMANCE_KINDS.map(kind => [kind, new TimingWindow()]),
) as Record<SequencePerformanceKind, TimingWindow>;
const counters = (): Record<SequencePerformanceCounter, number> => Object.fromEntries(
  SEQUENCE_PERFORMANCE_COUNTERS.map(name => [name, 0]),
) as Record<SequencePerformanceCounter, number>;
const counterNames = new Set<string>(SEQUENCE_PERFORMANCE_COUNTERS);
const kindNames = new Set<string>(SEQUENCE_PERFORMANCE_KINDS);

/** Local bounded diagnostics. Reading a snapshot is opt-in; collection sends nothing,
 * installs no observers/timers and stores no image IDs, request URLs or credentials.
 * Percentiles use nearest rank over the latest 128 completed samples of each kind.
 */
export class SequencePerformance {
  private generation = 0;
  private disposed = false;
  private timings = timingWindows();
  private counts = counters();
  private playback = new TimingWindow();
  private tasks = new TimingWindow();
  private previousPlaybackFrame: number | null = null;

  constructor(private readonly now: () => number = clock) {}

  /** Accept an earlier event timestamp from this owner's clock domain, so click
   * timing includes hit testing before navigation starts. Invalid/future values
   * fall back to the call time; an invalid owner clock cannot create a sample.
   */
  begin(kind: SequencePerformanceKind, startedAt?: number): SequenceMeasurement {
    const time = this.now(), generation = this.generation;
    const started = typeof startedAt === 'number' && Number.isFinite(startedAt) && startedAt >= 0 && startedAt <= time
      ? startedAt : time;
    let settled = this.disposed || !kindNames.has(kind) || !Number.isFinite(time);
    return {
      finish: () => {
        if (settled) return;
        settled = true;
        if (!this.disposed && generation === this.generation) this.timings[kind].record(this.now() - started);
      },
      cancel: () => { settled = true; },
    };
  }

  count(name: string, delta = 1): void {
    if (this.disposed || !counterNames.has(name) || !Number.isFinite(delta) || delta <= 0) return;
    const key = name as SequencePerformanceCounter;
    this.counts[key] = increment(this.counts[key], Math.floor(delta));
  }

  playbackFrame(playing: boolean, visible = true): void {
    if (this.disposed || !playing || !visible) { this.previousPlaybackFrame = null; return; }
    const time = this.now(), previous = this.previousPlaybackFrame;
    if (!Number.isFinite(time)) { this.previousPlaybackFrame = null; return; }
    this.previousPlaybackFrame = time;
    if (previous !== null) this.playback.record(time - previous);
  }

  recordLongTask(duration: number): void { if (!this.disposed) this.tasks.record(duration); }

  snapshot(): SequencePerformanceSnapshot {
    const timings = Object.fromEntries(SEQUENCE_PERFORMANCE_KINDS.map(kind => [kind, this.timings[kind].snapshot()])) as Record<SequencePerformanceKind, SequenceTimingSummary>;
    return { timings, counters: { ...this.counts },
      playbackFrameGaps: this.playback.snapshot(), longTasks: this.tasks.snapshot() };
  }

  /** Reset also re-enables a disposed owner when the widget is reopened. */
  reset(): void {
    ++this.generation; this.disposed = false;
    this.timings = timingWindows(); this.counts = counters();
    this.playback = new TimingWindow(); this.tasks = new TimingWindow(); this.previousPlaybackFrame = null;
  }
  dispose(): void { this.reset(); this.disposed = true; }
}
