export interface HoverProjectionPoint { x?: number; y?: number; z?: number; spatialReference?: unknown; }
export interface HoverProjectionView<G> {
  stationary?: boolean; updating?: boolean; interacting?: boolean;
  camera?: unknown; extent?: unknown; zoom?: number; rotation?: number; width: number; height: number;
  toScreen(geometry: G): { x: number; y: number } | null | undefined;
}
/** One settled projection per hover target. Moving/updating/unknown views always project live. */
export class HoverAnchorProjection<G extends HoverProjectionPoint, V extends HoverProjectionView<G>> {
  private cached: { view: V; geometry: G; camera: unknown; extent: unknown; zoom: number | undefined;
    rotation: number | undefined; width: number; height: number; x: number | undefined; y: number | undefined; z: number | undefined; spatialReference: unknown; point: { x: number; y: number } } | null = null;

  project(view: V, geometry: G): { x: number; y: number } | null | undefined {
    const settled = view.stationary === true && view.updating === false && !view.interacting && Number.isFinite(geometry.x) && Number.isFinite(geometry.y);
    const camera = view.camera, extent = view.extent, cached = this.cached;
    if (settled && cached && cached.view === view && cached.geometry === geometry && cached.camera === camera && cached.extent === extent &&
      cached.x === geometry.x && cached.y === geometry.y && cached.z === geometry.z && cached.spatialReference === geometry.spatialReference &&
      cached.zoom === view.zoom && cached.rotation === view.rotation && cached.width === view.width && cached.height === view.height) return cached.point;
    this.cached = null;
    const point = view.toScreen(geometry);
    if (settled && point && Number.isFinite(point.x) && Number.isFinite(point.y)) {
      this.cached = { view, geometry, camera, extent, zoom: view.zoom, rotation: view.rotation, width: view.width, height: view.height,
        x: geometry.x, y: geometry.y, z: geometry.z, spatialReference: geometry.spatialReference, point: { x: point.x, y: point.y } };
      return this.cached.point;
    }
    return point;
  }
}
