import { distanceMeters } from '../../utils/geoUtils';
import { MeasurementViewerRenderer } from './MeasurementViewerRenderer';
import type { MeasurementPoint, MeasurementViewer, MeasurementViewerDependencies } from './MeasurementViewerRenderer';

export interface MeasurementLayer<G> { destroyed?: boolean; add(graphic: G): unknown; removeAll(): void; destroy(): void; }
export interface MeasurementMap<L> { add(layer: L): unknown; remove(layer: L): unknown; }
export interface MeasurementView<L> { destroyed?: boolean; map?: MeasurementMap<L> | null; }
export interface PointCloudMeasurementDependencies<L, G, V> extends MeasurementViewerDependencies {
  readView(): V | null | undefined;
  readViewer(): MeasurementViewer | null;
  createLayer(properties: Record<string, unknown>): Promise<L>;
  createGraphic(properties: Record<string, unknown>): G;
}

/** Owns measurement scene/viewer resources, not tool intent or picked samples.
 * Runtime retains React state, picking and tool exclusion. Map loading has one
 * shared pending task, with generation/view/map guards before attachment or drawing.
 */
export class PointCloudMeasurement<G, L extends MeasurementLayer<G>, V extends MeasurementView<L>> {
  private layer: L | null = null;
  private view: V | null = null;
  private map: MeasurementMap<L> | null = null;
  private generation = 0;
  private request = 0;
  private pending: { view: V; map: MeasurementMap<L>; promise: Promise<L | null> } | null = null;
  private readonly viewer: MeasurementViewerRenderer;
  /** Bind adapters without starting SDK loads, timers or rendering. */
  constructor(private readonly dependencies: PointCloudMeasurementDependencies<L, G, V>) {
    this.viewer = new MeasurementViewerRenderer(dependencies);
  }

  /** Rebind/release only the viewer registration; fullscreen retains the scene overlay. */
  syncViewer(): void { this.viewer.sync(this.dependencies.readViewer()); }
  /** Release before host viewer removal; no resize during destruction. */
  detachViewer(): void { this.viewer.detach(false); }

  /** Release a previous view's scene resource before the host commits the next view. */
  onViewChange(view: V): void {
    if ((this.view && (this.view !== view || this.map !== view.map)) || (this.pending && (this.pending.view !== view || this.pending.map !== view.map))) this.clearMap();
  }

  /** Remove/destroy from the creating map and invalidate late module-load completions.
   * This is reusable: the next real pick may acquire resources again. Empty callbacks
   * after clear do not recreate an invisible layer during widget/view teardown.
   */
  dispose(): void { this.clearMap(); this.detachViewer(); }
  /** Invalidate pending/drawing generations before releasing the original map resource. */
  private clearMap(): void {
    ++this.generation; ++this.request; this.pending = null;
    const layer = this.layer, map = this.map;
    this.layer = null; this.map = null; this.view = null;
    if (layer) {
      try { map?.remove(layer); } catch (error) { this.dependencies.warn('Could not remove measurement layer:', error); }
      try { layer.destroy(); } catch (error) { this.dependencies.warn('Could not destroy measurement layer:', error); }
    }
  }

  /** Share layer loading; stale detached layers are destroyed instead of attached to a new map. */
  private ensureLayer(view: V, map: MeasurementMap<L>): Promise<L | null> {
    if (this.pending?.view === view && this.pending.map === map) return this.pending.promise;
    const generation = this.generation;
    const promise = this.dependencies.createLayer({ id: 'pc-measure-layer', title: 'Point Cloud Measurements', elevationInfo: { mode: 'relative-to-ground', offset: 0.5 } }).then(layer => {
      if (generation !== this.generation || this.dependencies.readView() !== view || view.destroyed || view.map !== map) { layer.destroy(); return null; }
      this.layer = layer; this.view = view; this.map = map;
      try { map.add(layer); } catch (error) { this.layer = null; this.view = null; this.map = null; layer.destroy(); throw error; }
      return layer;
    });
    const pending = { view, map, promise }; this.pending = pending;
    void promise.finally(() => { if (this.pending === pending) this.pending = null; }).catch(() => {});
    return promise;
  }

  /** Preserve synchronous redraw once a layer exists, and the original viewer/label order.
   * Read picked samples after module loading. Only the newest waiting update may draw.
   * Expected teardown races are ignored; current SDK failures are reported locally.
   */
  async updateMap(): Promise<void> {
    const view = this.dependencies.readView();
    if (!view?.map || view.destroyed) return;
    this.onViewChange(view);
    if (this.layer?.destroyed) this.clearMap();
    const request = ++this.request, generation = this.generation, map = view.map;
    try {
      if (!this.layer && !this.dependencies.readPoints().length) { this.syncViewer(); const label = this.dependencies.readLabel(); if (label) label.style.display = 'none'; return; }
      const layer = this.layer || await this.ensureLayer(view, map);
      if (!layer || request !== this.request || generation !== this.generation || this.dependencies.readView() !== view || view.destroyed || view.map !== map) return;
      layer.removeAll();
      const pts = this.dependencies.readPoints();
      this.syncViewer();
      if (!pts.length) { const label = this.dependencies.readLabel(); if (label) label.style.display = 'none'; return; }
      this.draw(layer, pts);
    } catch (error) {
      if (request === this.request && this.dependencies.readView() === view && !view.destroyed && view.map === map) this.dependencies.warn('Could not update measurement graphics:', error);
    }
  }

  /** Draw shifted map anchors/line/text; distance/slope use raw degrees and source altitude.
   * Point order, colors, text rounding and map-relative height policy are unchanged.
   */
  private draw(layer: L, pts: readonly MeasurementPoint[]): void {
    const label = this.dependencies.readLabel();
    // 2. Draw the clicked anchor points (Cyan for start, Magenta for end)
    pts.forEach((pt, i) => {
      const g = this.dependencies.createGraphic({
        geometry: { type: "point", longitude: pt.mapLon, latitude: pt.mapLat, z: pt.mapZ, hasZ: true, spatialReference: { wkid: 4326 } },
        symbol: {
          type: "point-3d",
          symbolLayers: [
            {
              type: "icon",
              resource: { primitive: "circle" },
              material: { color: i === 0 ? [0, 255, 255, 1] : [255, 0, 255, 1] },
              size: 6,
              outline: { color: [255, 255, 255, 1], size: 1.5 },
            },
          ],
        },
      });
      layer.add(g);
    });

    // 3. Draw the Line & Calculate Distance if we have 2 points
    if (pts.length === 2) {
      const p1 = pts[0];
      const p2 = pts[1];

      // Draw a bright yellow line connecting them
      const line = this.dependencies.createGraphic({
        geometry: {
          type: "polyline",
          paths: [
            [
              [p1.mapLon, p1.mapLat, p1.mapZ],
              [p2.mapLon, p2.mapLat, p2.mapZ],
            ],
          ],
          hasZ: true,
          spatialReference: { wkid: 4326 },
        },
        symbol: {
          type: "line-3d",
          symbolLayers: [
            {
              type: "line",
              material: { color: [255, 255, 0, 1] },
              size: 4,
            },
          ],
        },
      });
      layer.add(line);

      // THE MATH: Calculate True 3D Distance using raw, unshifted coordinates
      const hDist = distanceMeters(p1.rawLat, p1.rawLon, p2.rawLat, p2.rawLon);
      const vDist = Math.abs(p2.alt - p1.alt);
      const tDist = Math.sqrt(hDist * hDist + vDist * vDist); // Pythagorean theorem
      const slopePct = hDist > 0 ? (vDist / hDist) * 100 : 0; // Slope Percentage!

      const labelText = `${tDist.toFixed(2)}m\nSlope: ${slopePct.toFixed(1)}%`;

      // Update our floating HTML label text
      if (label) {
        label.innerText = labelText;
      }

      // Find the midpoint to place the label on the ArcGIS 3D Map
      const midLon = (p1.mapLon + p2.mapLon) / 2;
      const midLat = (p1.mapLat + p2.mapLat) / 2;
      const midZ = (p1.mapZ + p2.mapZ) / 2;

      // Add floating 3D Text to ArcGIS
      const text = this.dependencies.createGraphic({
        geometry: { type: "point", longitude: midLon, latitude: midLat, z: midZ + 0.5, hasZ: true, spatialReference: { wkid: 4326 } },
        symbol: {
          type: "text",
          text: labelText,
          color: [255, 255, 255, 1],
          haloColor: [0, 0, 0, 0.8],
          haloSize: 1.5,
          font: { size: 12, weight: "bold" },
        },
      });
      layer.add(text);
    } else {
      // Hide the HTML label if they clear the measurement
      if (label) {
        label.style.display = "none";
      }
    }

    // Sync the 3D measurement to the Mapillary Panoramic Viewer!
    this.syncViewer();
  }
}
