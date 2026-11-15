/** SDK line-of-sight belongs to a live SceneView/map, independently of React tool state. */
export interface SightView { type?: string; destroyed?: boolean; map?: unknown; }
export interface SightModel { clear(): void; destroy(): void; }
export interface SightState<V, P> {
  view: V | null | undefined;
  enabled: boolean;
  observer: P | null;
  targets: readonly P[];
}
export interface PointCloudSightDependencies<M, V, P> {
  read(): SightState<V, P>;
  /** Load constructors only; stale module completion must not construct against an old view. */
  loadFactory(): Promise<(view: V) => M>;
  setObserver(model: M, point: P): void;
  addTarget(model: M, point: P): void;
  onObserver(point: P): void;
  onTarget(point: P): void;
  warn(...args: unknown[]): void;
}

/** Owns one SDK view model, its creating view/map and a guarded module-load task.
 * Runtime owns tool intent, picked point geometry and React state. The SDK continues
 * to perform the visibility analysis; this owner adds no timers or analysis math.
 */
export class PointCloudSight<M extends SightModel, V extends SightView, P> {
  private model: M | null = null;
  private view: V | null = null;
  private map: unknown = null;
  private revision = 0;
  private pending: { view: V; map: unknown; promise: Promise<void> } | null = null;
  /** Bind lazy SDK/state adapters; construction loads no modules and creates no analysis. */
  constructor(private readonly dependencies: PointCloudSightDependencies<M, V, P>) {}

  /** Picking may mutate only a model belonging to the live enabled 3D view and map. */
  get ready(): boolean {
    const state = this.dependencies.read();
    return !!this.model && this.view === state.view && this.valid(state) && this.map === state.view?.map;
  }

  /** Gate SceneView-only SDK construction without changing the host's tool UI state. */
  private valid(state: SightState<V, P>): boolean {
    return !!(state.enabled && state.view?.map && !state.view.destroyed && state.view.type === '3d');
  }

  /** Share pending activation; validate before constructor execution and after creation.
   * Current SDK failures warn locally and remain retryable. Superseded/cleared loads
   * cannot create or restore analysis. Existing picked points restore on a new view
   * through SDK adapters only, without replaying React observer/target callbacks.
   */
  async activate(): Promise<void> {
    const state = this.dependencies.read();
    if (!state.view) return;
    this.onViewChange(state.view);
    if (!this.valid(state) || this.ready) return;
    const view = state.view, map = view.map;
    if (this.pending?.view === view && this.pending.map === map) { await this.pending.promise; return; }
    const revision = ++this.revision;
    const current = () => {
      const live = this.dependencies.read();
      return revision === this.revision && this.valid(live) && live.view === view && view.map === map;
    };
    const promise = (async () => {
      try {
        const factory = await this.dependencies.loadFactory();
        if (!current()) return;
        const model = factory(view);
        if (!current()) { this.release(model); return; }
        this.model = model; this.view = view; this.map = map;
        const live = this.dependencies.read();
        try {
          if (live.observer) this.dependencies.setObserver(model, live.observer);
          for (const point of live.targets) this.dependencies.addTarget(model, point);
        } catch (error) { this.dispose(); this.dependencies.warn('Could not restore line of sight:', error); }
      } catch (error) {
        if (current()) this.dependencies.warn('Could not load LineOfSightViewModel', error);
      }
    })();
    const pending = { view, map, promise }; this.pending = pending;
    try { await promise; } finally { if (this.pending === pending) this.pending = null; }
  }

  /** Preserve pick order: update React observer/target state before SDK mutation.
   * Borrow the same shifted ArcGIS point (including z/spatial reference); no raw SfM
   * conversion, height adjustment or point copy is introduced here.
   */
  place(point: P): void {
    if (!this.ready || !this.model) return;
    const model = this.model, state = this.dependencies.read();
    try {
      if (!state.observer) { this.dependencies.onObserver(point); this.dependencies.setObserver(model, point); }
      else { this.dependencies.onTarget(point); this.dependencies.addTarget(model, point); }
    } catch (error) { this.dependencies.warn('Could not update line of sight:', error); }
  }

  /** Invalidate pending construction and clear results while retaining a reusable current model. */
  clear(): void {
    ++this.revision; this.pending = null;
    if (this.model) {
      try { this.model.clear(); } catch (error) { this.dependencies.warn('Could not clear line of sight:', error); }
    }
  }

  /** Release analysis bound to a replaced view/map before the host commits that view. */
  onViewChange(view: V): void {
    if ((this.view && (this.view !== view || this.map !== view.map)) || (this.pending && (this.pending.view !== view || this.pending.map !== view.map))) this.dispose();
  }

  /** Always attempt both SDK clear and destroy; one failure must not skip the other. */
  private release(model: M): void {
    try { model.clear(); } catch (error) { this.dependencies.warn('Could not clear line of sight:', error); }
    try { model.destroy(); } catch (error) { this.dependencies.warn('Could not destroy line of sight:', error); }
  }

  /** Reusable teardown invalidates loading first and drops authority before SDK destruction. */
  dispose(): void {
    ++this.revision; this.pending = null;
    const model = this.model; this.model = null; this.view = null; this.map = null;
    if (model) this.release(model);
  }
}
