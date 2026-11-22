import type { ElevationIndicatorImage } from './profileTracking';

/** Live widget context; route acquisition and profile resources retain their existing owners. */
export interface SequenceProfileHost<View> {
  state(): { jimuMapView?: { view: View } | null; sequenceId: string | null; isElevationProfileActive: boolean };
  enabled(): boolean;
  complete(): readonly ElevationIndicatorImage[] | null;
  ensureRoute(): Promise<unknown>;
  clear(): void;
  disable(): void;
  notifyInsufficientRoute(): void;
  update(view: View, images: readonly ElevationIndicatorImage[], current: () => boolean): Promise<void>;
  indicator(): void;
  warn(error: unknown): void;
}

/** Prepare the selected route and update its profile with the original await/guard order.
 * The controller owns resource cancellation; no request revision or new post-update guard is added.
 */
export async function updateSequenceProfile<View>(host: SequenceProfileHost<View>): Promise<void> {
  const { jimuMapView, sequenceId, isElevationProfileActive } = host.state();
  if (!host.enabled() || !isElevationProfileActive || !jimuMapView || !sequenceId) return;
  const view = jimuMapView.view;
  try {
    if (!host.complete()) await host.ensureRoute();
    if (host.state().sequenceId !== sequenceId || host.state().jimuMapView?.view !== view || !host.state().isElevationProfileActive) return;
    const sequenceImages = host.complete();
    if (!sequenceImages) return;
    if (sequenceImages.length < 2) {
      host.clear(); host.disable();
      host.notifyInsufficientRoute(); return;
    }
    await host.update(view, sequenceImages, () =>
      host.enabled() && host.state().isElevationProfileActive && host.state().jimuMapView?.view === view);
    host.indicator();
  } catch (error) {
    host.warn(error);
  }
}
