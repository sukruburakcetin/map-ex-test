/** Structural map identity and camera snapshot; the SDK remains owned by the caller. */
export interface TransferView {
  map?: unknown;
  destroyed?: boolean;
  type?: string;
  scale?: number;
  center?: { clone(): unknown } | null;
}

/** Bind existing resource owners at their transfer boundaries, without exposing widget state. */
export interface ActiveViewTransferHost<View extends TransferView> {
  beforeTransfer(view: View | undefined): void;
  terrain(view: View): void;
  resetStartup(): void;
  tools(view: View): void;
  detachInteractions(): void;
  currentView(): View | null | undefined;
  turboActive(): boolean;
  disableCoverage(): void;
  log(message: string): void;
  clearAnalysis(): void;
  presentation(view: View, previousView: View | null | undefined): void;
  requests(): void;
  claim(view: View): void;
}

export interface ActiveViewTransferContext<View extends TransferView> {
  view: View;
  current(): boolean;
  dimensionChanged: boolean;
  previousScale: number | undefined;
  previousCenter: unknown;
}

/** Existing attachments and committed-view restoration; binding supplies no new request owner. */
export interface ActiveViewAttachmentHost<View extends TransferView> {
  commit(ready: () => void): void;
  whenReady(ready: () => unknown): Promise<unknown>;
  restore(context: ActiveViewTransferContext<View>): Promise<void>;
  shared(current: () => boolean): unknown;
  zoom(): void;
  turbo(): void;
  layerOrder(): void;
  warn(message: string, error: unknown): void;
}

/** Coordinate active-map transfer, committed startup and attachments; invalidate delayed work on cleanup. */
export class ActiveViewTransfer<View extends TransferView> {
  private revision = 0;

  constructor(private readonly host: ActiveViewTransferHost<View>) {}

  /** Retire startup/shared-link tokens; existing synchronous teardown stays with its callers. */
  invalidate(): void {
    ++this.revision;
  }

  /** Register startup after React commitment, while shared-link restoration runs independently.
   * Zoom/Turbo bindings follow the commit request immediately, matching the caller's original timing.
   * Keep layer ordering's existing identity/liveness guard separate from the stricter startup token.
   */
  attach(context: ActiveViewTransferContext<View>, host: ActiveViewAttachmentHost<View>): void {
    const { view, current } = context;
    host.commit(() => {
      host.whenReady(() => host.restore(context)).catch(error => {
        if (current() && (error as { name?: string } | null)?.name !== 'AbortError') {
          host.warn('[MapView] Resource restoration failed:', error);
        }
      });
      void host.shared(current);
    });
    host.zoom();
    host.turbo();
    host.whenReady(() => {
      if (this.host.currentView() === view && view.map && !view.destroyed) host.layerOrder();
    }).catch(() => {});
  }

  /** Detach old resources in order, claim presentation and return the new guarded startup context.
   * Invalid input still runs the existing route/hover prelude, but does not invalidate a valid view.
   * The caller commits React state before starting asynchronous restoration or binding interactions.
   */
  begin(view: View | undefined): ActiveViewTransferContext<View> | null {
    this.host.beforeTransfer(view);
    if (!view?.map || view.destroyed) return null;
    this.host.terrain(view);
    const revision = ++this.revision;
    this.host.resetStartup();
    const map = view.map;
    const current = () => revision === this.revision &&
      this.host.currentView() === view && view.map === map && !view.destroyed;

    this.host.tools(view);
    this.host.detachInteractions();
    this.host.log('Active MapView set - Attaching Handlers');
    const previousView = this.host.currentView();
    if (previousView && previousView !== view && this.host.turboActive()) this.host.disableCoverage();
    const previousType = previousView?.type;
    const previousScale = previousView?.scale;
    const previousCenter = previousView?.center?.clone();
    const nextType = view.type;
    const dimensionChanged = previousType != null && previousType !== nextType;
    if (dimensionChanged) {
      this.host.log(`[MapView] ${previousType} → ${nextType}: clearing view-dependent analysis.`);
      this.host.clearAnalysis();
    }
    this.host.log('Active MapView set - Attaching Handlers');
    this.host.presentation(view, previousView);
    this.host.requests();
    this.host.claim(view);
    return { view, current, dimensionChanged, previousScale, previousCenter };
  }
}
