/** Minimal identity/liveness boundary; SDK calls and resources remain supplied by the widget. */
export interface StartupView { map?: unknown; destroyed?: boolean; }
export interface ActiveViewStartupInput<View extends StartupView> {
  view: View;
  current(): boolean;
  dimensionChanged: boolean;
  previousScale: number | undefined;
  previousCenter: unknown;
}

/** Per-view startup operations; no widget state, props or DOM are exposed. */
export interface ActiveViewStartupHost<View extends StartupView> {
  restored(): boolean;
  flying(): boolean;
  currentView(): View | null | undefined;
  goTo(target: { scale: number; target?: unknown }, options: { animate: false }): Promise<unknown>;
  modules(): Promise<void>;
  camera(): Promise<unknown>;
  attachCoverage(): void;
  coverage(): Promise<unknown>;
  graphics(): void;
  places(): void;
  optionalTools(): void;
  featureLayers(): void;
  finishPresentation(): void;
  stationary(): void;
  warn(message: string, error: unknown): void;
}

/** Restore a committed view in the existing order; optional tools run while coverage is pending.
 * Caller retains view.when registration, its rejection handler and independent shared-link restoration.
 */
export async function restoreActiveView<View extends StartupView>({view, current, dimensionChanged, previousScale, previousCenter}: ActiveViewStartupInput<View>, host: ActiveViewStartupHost<View>): Promise<void> {
  if (!current()) return;
  if (dimensionChanged && host.restored() && !host.flying() && Number.isFinite(previousScale) && previousScale! > 0) {
    try {
      const target: { scale: number; target?: unknown } = { scale: previousScale! };
      if (previousCenter) target.target = previousCenter;
      await host.goTo(target, { animate: false });
    } catch (error) {
      host.warn('[MapView] Could not preserve scale during 2D/3D switch:', error);
    }
    // Preserve the original narrower post-goTo check; revision/map checks follow module loading.
    if (host.currentView() !== view || !view.map || view.destroyed) return;
  }
  await host.modules();
  if (!current()) return;
  await host.camera();
  if (!current()) return;
  host.attachCoverage();
  const coverageReady = host.coverage().catch(error => {
    if (current() && (error as any)?.name !== 'AbortError') host.warn('[MapView] Coverage initialization failed:', error);
  });
  host.graphics();
  host.places();
  host.optionalTools();
  host.featureLayers();
  await coverageReady;
  if (!current()) return;
  if (host.restored() && !host.flying()) host.finishPresentation();
  host.stationary();
}

/** Readiness operations for shared-link restoration; URL/image/camera policy remains in its existing owners. */
export interface SharedStateStartupHost {
  restored(): boolean;
  modules(): Promise<unknown>;
  restore(): Promise<unknown>;
  warn(error: unknown): void;
}

/** Wait for the originating view and SDK modules before restoring a shared link, retaining each liveness gate. */
export async function restoreSharedStateWhenReady(view: { when(): Promise<unknown> }, current: () => boolean,
  host: SharedStateStartupHost): Promise<void> {
  if (host.restored()) return;
  try {
    await view.when();
    if (!current() || host.restored()) return;
    await host.modules();
    if (!current() || host.restored()) return;
    await host.restore();
  } catch (error) {
    if (current() && (error as { name?: string } | null)?.name !== 'AbortError') host.warn(error);
  }
}
