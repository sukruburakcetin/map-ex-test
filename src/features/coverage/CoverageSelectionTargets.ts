/** Identity and display positions for individual coverage-image interactions.
 * Display positions come from the picked tile point; geographic API data stays intact.
 * This owner performs no requests, map navigation, rendering or native hit testing.
 */
export interface CoverageSelectionContext {
  view: object;
  layer: object | null;
  revision: number;
  enabled: boolean;
  individual: boolean;
  stationary: boolean;
}
export interface CoverageSelectionPoint {
  longitude: number;
  latitude: number;
  clone?(): CoverageSelectionPoint;
}
export interface CoverageSelectionTarget<G> {
  imageId: string;
  sequenceId?: string;
  geometry: G;
  lon: number;
  lat: number;
}
type Pixel = { x: number; y: number };

/** Keep the accepted hover identity through asynchronous click handling and retain
 * a bounded set of display anchors through metadata/sequence redraws. A changed
 * view, layer or coverage revision invalidates both targets and anchors.
 */
export class CoverageSelectionTargets<G extends CoverageSelectionPoint> {
  private context: CoverageSelectionContext | null = null;
  private hovered: CoverageSelectionTarget<G> | null = null;
  private anchors = new Map<string, CoverageSelectionTarget<G>>();

  /** Record only a real individual image point, never a line's representative ID. */
  hover(context: CoverageSelectionContext, imageId: string, geometry: G, sequenceId?: string): void {
    if (!this.sync(context) || !context.individual || !context.stationary) { this.hovered = null; return; }
    this.hovered = this.target(imageId, geometry, sequenceId);
  }

  /** Snapshot before awaits. Reproject the point in the current view and accept it
   * only within the existing click radius; stale or distant previews never win.
   */
  snapshot(context: CoverageSelectionContext, pointer: Pixel, radius: number,
    project: (geometry: G) => Pixel | null | undefined): CoverageSelectionTarget<G> | null {
    if (!this.sync(context) || !context.individual || !context.stationary || !this.hovered ||
      !Number.isFinite(pointer.x) || !Number.isFinite(pointer.y) || !Number.isFinite(radius) || radius < 0) return null;
    let pixel: Pixel | null | undefined;
    try { pixel = project(this.hovered.geometry); } catch (_) { return null; }
    if (!pixel || !Number.isFinite(pixel.x) || !Number.isFinite(pixel.y) ||
      (pixel.x - pointer.x) ** 2 + (pixel.y - pointer.y) ** 2 > radius ** 2) return null;
    return this.target(this.hovered.imageId, this.hovered.geometry, this.hovered.sequenceId);
  }

  /** Remember a selected point independently of the hover card's lifetime. */
  retain(context: CoverageSelectionContext, imageId: string, geometry: G, sequenceId?: string): void {
    if (!this.sync(context) || !context.individual) return;
    const target = this.target(imageId, geometry, sequenceId);
    if (!target) return;
    this.anchors.delete(target.imageId);
    this.anchors.set(target.imageId, target);
    if (this.anchors.size > 64) this.anchors.delete(this.anchors.keys().next().value!);
  }

  /** Return presentation coordinates only; callers keep original API coordinates. */
  anchor(context: CoverageSelectionContext, imageId: string): CoverageSelectionTarget<G> | null {
    return this.sync(context) ? this.anchors.get(String(imageId)) || null : null;
  }

  /** Pointer leave dismisses the preview without moving an accepted selection. */
  clearHover(): void { this.hovered = null; }

  /** Release all view-owned references on teardown or a new coverage context. */
  clear(): void { this.context = null; this.hovered = null; this.anchors.clear(); }

  private sync(context: CoverageSelectionContext): boolean {
    if (!context.enabled || !context.layer) { this.clear(); return false; }
    if (this.context && (this.context.view !== context.view || this.context.layer !== context.layer ||
      this.context.revision !== context.revision)) this.clear();
    this.context = context;
    return true;
  }

  private target(imageId: string, geometry: G, sequenceId?: string): CoverageSelectionTarget<G> | null {
    if (!imageId || !geometry || !Number.isFinite(geometry.longitude) || !Number.isFinite(geometry.latitude)) return null;
    let copy: G;
    try { copy = geometry.clone ? geometry.clone() as G : { ...geometry }; } catch (_) { return null; }
    return { imageId: String(imageId), sequenceId, geometry: copy, lon: geometry.longitude, lat: geometry.latitude };
  }
}
