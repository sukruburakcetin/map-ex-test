/** Picked shifted ArcGIS coordinates; z is retained in the point-cloud map height frame. */
export interface ViewshedPick { longitude: number; latitude: number; z: number; }
export interface ViewshedSpecification {
  observer: { longitude: number; latitude: number; z: number; spatialReference: { wkid: 4326 } };
  farDistance: number; horizontalFieldOfView: number; verticalFieldOfView: number;
  heading: number; tilt: number;
}
/** Preserve existing analysis policy: +1.5 m observer offset, 150 m range and degree angles.
 * This is the existing shifted map z plus offset, not an absolute/source-altitude conversion.
 */
export function pointCloudViewshedSpecification(point: ViewshedPick): ViewshedSpecification {
  return {
    observer: { longitude: point.longitude, latitude: point.latitude, z: point.z + 1.5, spatialReference: { wkid: 4326 } },
    farDistance: 150, horizontalFieldOfView: 360, verticalFieldOfView: 90, heading: 0, tilt: 0,
  };
}
export interface ViewshedResource { destroy(): void; }
export interface ViewshedCollection<A> { add(analysis: A): unknown; remove(analysis: A): unknown; }
export interface ViewshedView<A> { type?: string; destroyed?: boolean; map?: unknown; analyses?: ViewshedCollection<A>; }
export interface PointCloudViewshedDependencies<A, V> {
  read(): { enabled: boolean; view: V | null | undefined };
  /** Load SDK constructors only; stale clicks must not construct detached analysis objects. */
  loadFactory(): Promise<(specification: ViewshedSpecification) => A>;
  warn(...args: unknown[]): void;
}

/** Owns pending click revision, analysis and its original view/map/collection.
 * Runtime owns mode, tool exclusion and picking. The SDK owns visibility calculation;
 * this feature adds no timers, point-cloud requests or alternative height policy.
 */
export class PointCloudViewshed<A extends ViewshedResource, V extends ViewshedView<A>> {
  private analysis: A | null = null;
  private context: { view: V; map: unknown; collection: ViewshedCollection<A> } | null = null;
  private revision = 0;
  /** Bind lazy state/SDK adapters without loading modules or starting analysis. */
  constructor(private readonly dependencies: PointCloudViewshedDependencies<A, V>) {}

  /** Newest observer click replaces prior results immediately, then loads constructors.
   * Check enabled SceneView/map/collection/revision before and after SDK construction.
   * Failed current requests are contained/retryable; stale requests remain silent.
   */
  async place(point: ViewshedPick): Promise<void> {
    this.clear();
    const { enabled, view } = this.dependencies.read();
    if (!enabled || !view?.map || view.destroyed || view.type !== '3d' || !view.analyses) return;
    const context = { view, map: view.map, collection: view.analyses };
    this.context = context;
    const revision = this.revision;
    const current = () => {
      const live = this.dependencies.read();
      return revision === this.revision && live.enabled && live.view === view && !view.destroyed && view.type === '3d' && view.map === context.map && view.analyses === context.collection;
    };
    let created: A | null = null;
    try {
      const factory = await this.dependencies.loadFactory();
      if (!current()) return;
      created = factory(pointCloudViewshedSpecification(point));
      if (!current()) { this.destroy(created); return; }
      this.analysis = created;
      context.collection.add(created);
    } catch (error) {
      const report = current();
      if (created && this.analysis === created) this.clear();
      else if (created) this.destroy(created);
      if (report) this.dependencies.warn('Could not create viewshed analysis:', error);
    }
  }

  /** Attempt SDK destruction independently of collection removal. */
  private destroy(analysis: A): void {
    try { analysis.destroy(); } catch (error) { this.dependencies.warn('Could not destroy viewshed analysis:', error); }
  }

  /** Invalidate pending construction first, then remove from the original collection and destroy.
   * Clear is reusable/idempotent even after host view replacement or SDK cleanup errors.
   */
  clear(): void {
    ++this.revision;
    const analysis = this.analysis, context = this.context;
    this.analysis = null; this.context = null;
    if (!analysis) return;
    try { context?.collection.remove(analysis); } catch (error) { this.dependencies.warn('Could not remove viewshed analysis:', error); }
    this.destroy(analysis);
  }

  /** Release both pending and attached analysis before the host commits a different context. */
  onViewChange(view: V): void {
    const context = this.context;
    if (context && (context.view !== view || context.map !== view.map || context.collection !== view.analyses)) this.clear();
  }
}
