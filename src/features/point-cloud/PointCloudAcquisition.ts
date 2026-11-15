/** Live host surface; sequence positions are borrowed from the captured frame state. */
export interface PointCloudAcquisitionView { type?: string; destroyed?: boolean; map?: unknown; }
export interface PointCloudSequencePosition { id: string; lon: number; lat: number; }
export interface PointCloudAcquisitionState<V> {
  view: V | null | undefined;
  imageId: string | null;
  sequenceImages: PointCloudSequencePosition[];
  fullscreen: boolean;
  visible: boolean;
  loading: boolean;
  follow: boolean;
  paused: boolean;
}
export interface PointCloudLoadSession<V> {
  imageId: string;
  view: V;
  sequenceImages: PointCloudSequencePosition[];
  automatic: boolean;
  forceDiscovery: boolean;
  signal: AbortSignal;
  /** Commit/progress guard: includes abort, host map existence and live image/view identity. */
  current(): boolean;
  /** Stop successful late progress at the same point as the previous commit path. */
  finishProgress(): void;
}
export interface PointCloudAcquisitionDependencies<V, R> {
  read(): PointCloudAcquisitionState<V>;
  readSequence(): { complete: PointCloudSequencePosition[] | null; sequenceId: string | null };
  nearby(sequenceId: string, imageId: string, signal: AbortSignal): Promise<PointCloudSequencePosition[]>;
  loadTransport(session: PointCloudLoadSession<V>, corridor: PointCloudSequencePosition[], progress: (status: string) => void): Promise<R | null>;
  onContext(imageId: string, corridor: PointCloudSequencePosition[]): void;
  onContextError(error: unknown): void;
  onStart(): void;
  /** Synchronous commit: do not defer result retention/UI work into another promise. */
  onResult(result: R | null, session: PointCloudLoadSession<V>): void;
  onProgress(status: string, session: PointCloudLoadSession<V>): void;
  onError(error: unknown, session: PointCloudLoadSession<V>): void;
  onFinish(): void;
  onWrongView(): void;
  onPrevious(previous: boolean): void;
  onCloseForBrowsing(): void;
  /** Borrow the current scene-edit barrier; SDK edits cannot be cancelled by transport abort. */
  waitForMapEdits(): Promise<void>;
  schedule(callback: () => void, delay: number): ReturnType<typeof setTimeout>;
  cancelTimer(handle: ReturnType<typeof setTimeout>): void;
}
export type PointCloudCancellation = 'clear' | 'cleanup' | 'fullscreen' | 'view-transfer';

/** Owns load serialization, abort/deadline state, follow scheduling and retained result identity.
 * UI/geometry commits remain synchronous host callbacks. Layer edits, GL rendering,
 * cluster caching and geometry policy keep their existing independent owners.
 */
export class PointCloudAcquisition<V extends PointCloudAcquisitionView, R extends { imageId: string }> {
  private controller: AbortController | null = null;
  private request = 0;
  private queueVersion = 0;
  private task: Promise<void> | null = null;
  private followTimer: ReturnType<typeof setTimeout> | null = null;
  private modeActive = false;
  private failures = 0;
  private retained: R | null = null;

  /** Bind live state/SDK adapters once per widget; no work starts during construction. */
  constructor(private readonly dependencies: PointCloudAcquisitionDependencies<V, R>) {}

  /** Full, unfiltered result; exports/calibration borrow this same reference. */
  get result(): R | null { return this.retained; }

  /** Mode intent can remain active while a previous cloud is still displayed. */
  get active(): boolean { return this.modeActive; }

  /** Preserve the existing toggle policy when a delayed automatic load is pending. */
  get following(): boolean { return !!this.followTimer; }

  /** Accept only where the host previously assigned its validated result, without copying points. */
  retain(result: R): void { this.retained = result; }

  /** Drop retained data after map teardown; callers keep the established clear ordering. */
  releaseResult(): void { this.retained = null; }

  /** Reset activation/failure intent at the beginning of cloud clear, before SDK teardown. */
  stopMode(): void { this.modeActive = false; this.failures = 0; }

  /** Manual retry or a successful complete load starts a fresh automatic-failure count. */
  resetFailures(): void { this.failures = 0; }

  /** Count only automatic failures with follow enabled; the UI owns paused presentation state. */
  recordIssue(automatic: boolean): boolean {
    const follow = this.dependencies.read().follow;
    if (automatic && follow) this.failures = (this.failures || 0) + 1;
    return automatic && follow && this.failures >= 3;
  }

  /** Cancel just the delayed follow callback; disabling follow does not abort a current load. */
  cancelFollow(): void {
    if (this.followTimer) this.dependencies.cancelTimer(this.followTimer);
    this.followTimer = null;
  }

  /** Preserve each host transition's cancellation scope rather than treating them as interchangeable.
   * Fullscreen/clear also invalidate queued starts. View transfer/clear release the
   * controller reference. Outstanding SDK work remains in the serialized task until
   * it settles; the request revision rejects stale progress, errors and commits.
   */
  cancel(reason: PointCloudCancellation): void {
    if (reason === 'clear') this.queueVersion = (this.queueVersion || 0) + 1;
    this.controller?.abort();
    if (reason === 'clear' || reason === 'view-transfer') this.controller = null;
    ++this.request;
    if (reason === 'fullscreen') this.queueVersion = (this.queueVersion || 0) + 1;
    this.cancelFollow();
  }

  /** Coalesce confirmed frame changes using the existing 250 ms follow delay.
   * Fullscreen updates the previous-image flag only. Browsing without follow closes
   * the cloud; an automatic pause leaves the current cloud and scheduling untouched.
   */
  onImage(imageId: string): void {
    const state = this.dependencies.read();
    const previous = !!this.retained && this.retained.imageId !== imageId;
    if (state.fullscreen) { this.dependencies.onPrevious(previous); return; }
    if (!this.modeActive && !state.visible && !state.loading) return;
    if (!state.follow) { this.dependencies.onCloseForBrowsing(); return; }
    this.dependencies.onPrevious(previous);
    if (state.paused) return;
    this.controller?.abort(); ++this.request;
    if (this.followTimer) this.dependencies.cancelTimer(this.followTimer);
    this.followTimer = this.dependencies.schedule(() => {
      this.followTimer = null;
      const live = this.dependencies.read();
      if (!live.fullscreen && !live.paused && live.follow && live.imageId === imageId && (this.modeActive || live.visible || live.loading)) void this.load(true);
    }, 250);
  }

  /** Serialize acquisitions, dropping obsolete queued starts and waiting for map edit settlement.
   * Abort the current transport before waiting. Native/worker work must settle;
   * a replacement is never allowed to overlap the previous map-edit barrier.
   */
  async load(automatic = false, forceDiscovery = false): Promise<void> {
    const { imageId, view } = this.dependencies.read();
    const version = this.queueVersion = (this.queueVersion || 0) + 1;
    const previous = this.task;
    this.controller?.abort();
    if (previous) await previous.catch(() => {});
    const live = this.dependencies.read();
    if (version !== this.queueVersion || imageId !== live.imageId || view !== live.view) return;
    const task = (async () => { await this.perform(automatic, forceDiscovery); await this.dependencies.waitForMapEdits(); })();
    this.task = task;
    try { await task; } finally { if (this.task === task) this.task = null; }
  }

  /** Own one 90-second request deadline through acquisition and the synchronous host commit.
   * Abort suppresses success/progress. Error reporting intentionally uses the old
   * revision/image/view guard without the abort test, so current timeouts are shown.
   */
  private async perform(automatic: boolean, forceDiscovery: boolean): Promise<void> {
    const { view, imageId, sequenceImages } = this.dependencies.read();
    if (!view?.map || view.destroyed || !imageId) return;
    if (view.type !== '3d') { this.dependencies.onWrongView(); return; }
    this.controller?.abort();
    const controller = new AbortController(); this.controller = controller;
    const request = ++this.request;
    const relevant = () => {
      const live = this.dependencies.read();
      return request === this.request && live.imageId === imageId && live.view === view && !view.destroyed;
    };
    let progressEnabled = true;
    const session: PointCloudLoadSession<V> = {
      imageId, view, sequenceImages, automatic, forceDiscovery, signal: controller.signal,
      current: () => relevant() && !controller.signal.aborted && !!view.map,
      finishProgress: () => { progressEnabled = false; },
    };
    const deadline = this.dependencies.schedule(() => controller.abort(), 90000);
    this.modeActive = true;
    this.dependencies.onStart();
    try {
      const sequence = this.dependencies.readSequence();
      let corridor = sequence.complete || sequenceImages;
      if (!sequence.complete && sequence.sequenceId) {
        try {
          const nearby = await this.dependencies.nearby(sequence.sequenceId, imageId, controller.signal);
          if (nearby.length) corridor = nearby;
        } catch (error) {
          if (!session.current()) return;
          this.dependencies.onContextError(error);
        }
      }
      if (!session.current()) return;
      this.dependencies.onContext(imageId, corridor);
      const result = await this.dependencies.loadTransport(session, corridor, status => {
        if (!progressEnabled || !session.current()) return;
        this.dependencies.onProgress(status, session);
      });
      if (!session.current()) return;
      this.dependencies.onResult(result, session);
    } catch (error) {
      if (relevant()) this.dependencies.onError(error, session);
    } finally {
      this.dependencies.cancelTimer(deadline);
      if (request === this.request) {
        this.controller = null;
        if (!view.destroyed && this.dependencies.read().view === view) this.dependencies.onFinish();
      }
    }
  }
}
