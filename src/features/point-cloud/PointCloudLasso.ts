import type { LassoVertex } from './lassoProjection';

export interface LassoPointerTarget {
  getBoundingClientRect(): { left: number; top: number };
  setPointerCapture?(pointerId: number): void;
  hasPointerCapture?(pointerId: number): boolean;
  releasePointerCapture?(pointerId: number): void;
}
export interface LassoPointerEvent {
  currentTarget: LassoPointerTarget;
  pointerId: number;
  clientX: number;
  clientY: number;
  preventDefault(): void;
}
export interface LassoHighlightHandle { remove(): void; }
export interface LassoView { destroyed?: boolean; map?: unknown; }
export interface LassoLayer { destroyed?: boolean; }
export interface PointCloudLassoDependencies<L, V> {
  startPolygon(point: LassoVertex): void;
  appendPoint(point: LassoVertex): void;
  complete(): void;
  readTarget(): { layer: L; view: V } | null;
  readObjectIds(): number[];
  whenLayerView(view: V, layer: L): PromiseLike<{ highlight(ids: number[]): LassoHighlightHandle }>;
}

/** Owns an SVG pointer gesture and one asynchronous map highlight, without React state,
 * GL state or point-array copies. Polygon/selection state and viewer feedback stay in
 * the runtime adapters; numerical projection has its own pure feature entry point.
 */
export class PointCloudLasso<L extends LassoLayer, V extends LassoView> {
  private gesture: { target: LassoPointerTarget; pointerId: number } | null = null;
  private handle: LassoHighlightHandle | null = null;
  private revision = 0;
  /** Bind live readers/SDK operations once; construction performs no work. */
  constructor(private readonly dependencies: PointCloudLassoDependencies<L, V>) {}

  /** Begin a pointer gesture in SVG CSS pixels; touch does not depend on e.buttons. */
  start(event: LassoPointerEvent): void {
    event.preventDefault();
    this.cancelGesture();
    this.gesture = { target: event.currentTarget, pointerId: event.pointerId };
    const rect = event.currentTarget.getBoundingClientRect();
    this.dependencies.startPolygon([event.clientX - rect.left, event.clientY - rect.top]);
    try { event.currentTarget.setPointerCapture?.(event.pointerId); } catch (_) {}
  }

  /** Append only events belonging to the active pointer; React performs the functional append. */
  move(event: LassoPointerEvent): void {
    if (!this.gesture || this.gesture.pointerId !== event.pointerId || this.gesture.target !== event.currentTarget) return;
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    this.dependencies.appendPoint([event.clientX - rect.left, event.clientY - rect.top]);
  }

  /** Release capture before computing selection. Duplicate/up-leave events cannot complete twice. */
  end(event: LassoPointerEvent): void {
    if (!this.gesture || this.gesture.pointerId !== event.pointerId || this.gesture.target !== event.currentTarget) return;
    this.cancelGesture(); this.dependencies.complete();
  }

  /** Cancel on clear/viewer replacement/teardown without committing an unfinished polygon. */
  cancelGesture(): void {
    const gesture = this.gesture; this.gesture = null;
    if (!gesture) return;
    try {
      if (gesture.target.hasPointerCapture?.(gesture.pointerId)) gesture.target.releasePointerCapture?.(gesture.pointerId);
    } catch (_) {}
  }

  /** Release the previous handle once; view destruction may already have removed it. */
  private releaseHighlight(): void {
    const handle = this.handle; this.handle = null;
    try { handle?.remove(); } catch (_) {}
  }

  /** Apply current confirmed SDK ObjectIDs after layer-view readiness.
   * New requests/clear/dispose invalidate pending callbacks. View, map and layer identity
   * checks reject replacements; a stale promise cannot remove newer feedback.
   */
  highlight(): void {
    const revision = ++this.revision;
    const target = this.dependencies.readTarget();
    if (!target || target.view.destroyed || target.layer.destroyed || !target.view.map) { this.releaseHighlight(); return; }
    const { view, layer } = target, map = view.map;
    try {
      void Promise.resolve(this.dependencies.whenLayerView(view, layer)).then(layerView => {
        const live = this.dependencies.readTarget();
        if (revision !== this.revision || !live || live.view !== view || live.layer !== layer || view.destroyed || layer.destroyed || view.map !== map) return;
        this.releaseHighlight();
        const ids = this.dependencies.readObjectIds();
        if (ids.length) this.handle = layerView.highlight(ids);
      }).catch(() => {});
    } catch (_) { /* Host view/layer may be destroyed before whenLayerView starts. */ }
  }

  /** Reusable clear invalidates pending highlight before removing its current handle. */
  clear(): void { ++this.revision; this.cancelGesture(); this.releaseHighlight(); }
}
