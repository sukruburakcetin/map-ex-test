export interface RingGeometryInput {
  /** Shifted WGS84 degrees, before east/north calibration. */
  cameraLon: number; cameraLat: number;
  /** Calibration offsets in meters; ring z remains zero on its relative-to-ground layer. */
  nudgeX: number; nudgeY: number;
  /** Meter half-width; nonpositive selects the actual-width fallback. */
  halfWidth: number;
  actualLength: number | null | undefined;
  actualWidth: number | null | undefined;
}
export interface RingLayer<G> { destroyed?: boolean; add(graphic: G): unknown; removeAll(): void; destroy(): void; }
export interface RingMap<L> { layers: { includes(layer: L): boolean }; add(layer: L): unknown; remove(layer: L): unknown; }
export interface RingView<L> { destroyed?: boolean; map?: RingMap<L> | null; }
export interface PointCloudRingsDependencies<G, L, V, R> {
  readContext(): { view: V | null | undefined; result: R | null; graphicsReady: boolean };
  readGeometry(): RingGeometryInput;
  /** Read once per radius, at the same point in graphic emission as the original draw. */
  readBearing(): number;
  loadFactory(): Promise<(properties: Record<string, unknown>) => L>;
  createGraphic(properties: Record<string, unknown>): G;
  warn(...args: unknown[]): void;
}

/** Owns distance-ring layer/view/map, shared loading and newest-draw generations.
 * Geometry stays with this feature; the runtime supplies live dimensions/calibration.
 * No point-cloud copy, independent timer, watcher or animation loop is introduced.
 */
export class PointCloudRings<G, L extends RingLayer<G>, V extends RingView<L>, R> {
  private layer: L | null = null;
  private view: V | null = null;
  private map: RingMap<L> | null = null;
  private revision = 0;
  private drawRevision = 0;
  private pending: { view: V; map: RingMap<L>; result: R; promise: Promise<L | null> } | null = null;
  /** Bind live state/SDK readers lazily, without loading modules or drawing. */
  constructor(private readonly dependencies: PointCloudRingsDependencies<G, L, V, R>) {}

  /** Invalidate old work before removing from the original map and destroying the layer. */
  clear(): void {
    ++this.revision; ++this.drawRevision; this.pending = null;
    const layer = this.layer, map = this.map;
    this.layer = null; this.view = null; this.map = null;
    if (!layer) return;
    try { map?.remove(layer); } catch (error) { this.dependencies.warn('Could not remove point-cloud rings:', error); }
    try { layer.destroy(); } catch (error) { this.dependencies.warn('Could not destroy point-cloud rings:', error); }
  }

  /** Release an attached/pending layer when its creating view or map is replaced. */
  onViewChange(view: V): void {
    if ((this.view && (this.view !== view || this.map !== view.map)) || (this.pending && (this.pending.view !== view || this.pending.map !== view.map))) this.clear();
  }

  /** Share same-context readiness; stale constructor loads never attach to another map.
   * Keep readiness asynchronous for existing layers too, so repeated caller redraws coalesce.
   */
  private async ensureLayer(view: V, map: RingMap<L>, result: R): Promise<L | null> {
    if (this.pending?.view === view && this.pending.map === map && this.pending.result === result) return await this.pending.promise;
    const revision = this.revision;
    const current = () => {
      const live = this.dependencies.readContext();
      return revision === this.revision && live.graphicsReady && live.view === view && live.result === result && !view.destroyed && view.map === map;
    };
    const promise = (async () => {
      let created: L | null = null;
      try {
        if (!this.layer) {
          const factory = await this.dependencies.loadFactory();
          if (!current()) return null;
          created = factory({ id: 'pc-grid-layer', title: 'Point Cloud Distance Rings', elevationInfo: { mode: 'relative-to-ground', offset: 0.5 } });
          if (!current()) { created.destroy(); return null; }
          this.layer = created; this.view = view; this.map = map;
        }
        if (!current()) return null;
        const layer = this.layer;
        if (layer && !map.layers.includes(layer)) map.add(layer);
        return layer;
      } catch (error) {
        const report = current();
        if (created && this.layer === created) this.clear();
        if (report) this.dependencies.warn('Could not prepare point-cloud rings:', error);
        return null;
      }
    })();
    const pending = { view, map, result, promise }; this.pending = pending;
    try { return await promise; } finally { if (this.pending === pending) this.pending = null; }
  }

  /** Draw only the newest request using live geometry after layer readiness.
   * Radius is the caller's captured meter half-length; nonpositive uses actual length.
   * The original interval, ellipse, nudge, boundary-color and label policies are retained.
   */
  async draw(currentRadius: number): Promise<void> {
    const { view, result, graphicsReady } = this.dependencies.readContext();
    if (!view || !graphicsReady) return;
    this.onViewChange(view);
    if (this.layer?.destroyed || (this.pending && this.pending.result !== result)) this.clear();
    const drawRevision = ++this.drawRevision;
    if (!view.map || view.destroyed || !result) return;
    const map = view.map;
    const layer = await this.ensureLayer(view, map, result);
    const live = this.dependencies.readContext();
    if (!layer || !live.graphicsReady || drawRevision !== this.drawRevision || live.view !== view || live.result !== result || view.destroyed || view.map !== map) return;
    try { layer.removeAll(); this.drawGeometry(layer, currentRadius); }
    catch (error) { this.dependencies.warn('Could not draw point-cloud rings:', error); }
  }

  /** Emit the existing ring and label graphics in order, using WGS84 degree positions.
   * Meter-to-degree conversion remains 111320 with latitude cosine. Bearing is clockwise
   * from north; z=0 and layer offset 0.5 m retain the existing map-relative height policy.
   */
  private drawGeometry(layer: L, currentRadius: number): void {
    const geometry = this.dependencies.readGeometry();

    const nudgeLat = geometry.nudgeY / 111320;
    const nudgeLon = geometry.nudgeX / (111320 * Math.cos((geometry.cameraLat * Math.PI) / 180));
    const centerLon = geometry.cameraLon + nudgeLon;
    const centerLat = geometry.cameraLat + nudgeLat;
    const mPerDegLat = 111320;
    const mPerDegLon = 111320 * Math.cos((centerLat * Math.PI) / 180);

    const halfWidth = geometry.halfWidth;

    const effectiveLength = currentRadius > 0 ? currentRadius : (geometry.actualLength ?? 100);
    const effectiveWidth = halfWidth > 0 ? halfWidth : (geometry.actualWidth ?? 100);
    const effectiveMax = Math.max(effectiveLength, effectiveWidth);

    // Base step on the LARGER dimension so long corridors don't get flooded with rings.
    // Then clamp to a minimum of 10m so we never draw rings every 5m.
    const rawStep = effectiveMax / 6;
    const niceSteps = [10, 25, 50, 100, 200, 500];
    const step = Math.max(niceSteps.find((s) => s >= rawStep) ?? niceSteps[niceSteps.length - 1], 10);

    const allIntervals = new Set<number>();
    for (let r = step; r < effectiveMax; r += step) allIntervals.add(Math.round(r));
    allIntervals.add(effectiveLength);
    allIntervals.add(effectiveWidth);

    const sortedIntervals = Array.from(allIntervals).sort((a, b) => a - b);

    sortedIntervals.forEach((radius) => {
      const isLengthBoundary = radius === effectiveLength;
      const isWidthBoundary = radius === effectiveWidth;

      const isBoundary = isLengthBoundary || isWidthBoundary;
      const bearing = this.dependencies.readBearing();
      const radB = (bearing * Math.PI) / 180;
      const sinB = Math.sin(radB);
      const cosB = Math.cos(radB);

      const ringCoords: number[][] = [];

      // Draw as a true ellipse scaled to the corridor proportions.
      // Each ring's semi-axis = radius scaled by how far the corridor
      // extends in that direction, capped at the corridor boundary.
      const semiForward = Math.min(radius, effectiveLength);
      const semiRight = Math.min(radius, effectiveWidth);

      for (let i = 0; i <= 360; i += 3) {
        const rad = (i * Math.PI) / 180;
        const forward = semiForward * Math.cos(rad);
        const right = semiRight * Math.sin(rad);

        // Project back to lat/lon
        const finalDx = right * cosB + forward * sinB;
        const finalDy = -right * sinB + forward * cosB;

        ringCoords.push([centerLon + finalDx / mPerDegLon, centerLat + finalDy / mPerDegLat, 0]);
      }

      // Draw as a closed loop (connecting end back to start)
      const ringGraphic = this.dependencies.createGraphic({
        geometry: {
          type: "polyline",
          paths: [[...ringCoords, ringCoords[0]]],
          hasZ: true,
          spatialReference: { wkid: 4326 },
        },
        symbol: {
          type: "simple-line",
          color: isLengthBoundary
            ? [255, 165, 0, 0.9] // orange for length
            : isWidthBoundary
              ? [255, 215, 0, 0.9] // gold for width
              : [0, 255, 255, 0.4], // cyan for intermediate
          width: isLengthBoundary || isWidthBoundary ? 3 : 1.5,
          style: "solid",
        },
      });
      layer.add(ringGraphic);

      // Place labels at the most Forward, Backward, Left and Right points
      let bestFrontPt: number[] = ringCoords[0];
      let bestBackPt: number[] = ringCoords[0];
      let bestRightPt: number[] = ringCoords[0];
      let bestLeftPt: number[] = ringCoords[0];
      let maxFwd = -Infinity,
        minFwd = Infinity;
      let maxRgt = -Infinity,
        minRgt = Infinity;

      ringCoords.forEach((c: number[]) => {
        const dy = (c[1] - centerLat) * 111320;
        const dx = (c[0] - centerLon) * 111320 * Math.cos((centerLat * Math.PI) / 180);
        const fwd = dx * sinB + dy * cosB;
        const rgt = dx * cosB - dy * sinB;

        if (fwd > maxFwd) {
          maxFwd = fwd;
          bestFrontPt = c;
        }
        if (fwd < minFwd) {
          minFwd = fwd;
          bestBackPt = c;
        }
        if (rgt > maxRgt) {
          maxRgt = rgt;
          bestRightPt = c;
        }
        if (rgt < minRgt) {
          minRgt = rgt;
          bestLeftPt = c;
        }
      });

      // Draw labels: length axis shows "Xm", width axis shows "Xm" in a different color
      const drawLabel = (pt: number[], text: string, isWidth: boolean) => {
        const label = this.dependencies.createGraphic({
          geometry: { type: "point", longitude: pt[0], latitude: pt[1], z: 0, hasZ: true, spatialReference: { wkid: 4326 } },
          symbol: {
            type: "text",
            text,
            color: isBoundary ? (isWidth ? [255, 200, 0, 1] : [255, 255, 255, 1]) : isWidth ? [255, 200, 0, 0.85] : [0, 255, 255, 0.9],
            haloColor: [0, 0, 0, 0.8],
            haloSize: 1.5,
            font: { size: 10, weight: "bold" },
          },
        });
        layer.add(label);
      };

      const lengthLabel = `${Math.round(semiForward)}m`;
      const widthLabel = `${Math.round(semiRight)}m`;

      // Length axis labels (front + back): cyan / white
      if (maxFwd - minFwd > 10) {
        drawLabel(bestFrontPt, lengthLabel, false);
        drawLabel(bestBackPt, lengthLabel, false);
      } else {
        drawLabel(bestFrontPt, lengthLabel, false);
      }

      // Width axis labels (left + right), yellow/amber
      // Only show if the ellipse is meaningfully wider than it is tall
      if (maxRgt - minRgt > 10 && Math.abs(semiRight - semiForward) > 5) {
        drawLabel(bestRightPt, widthLabel, true);
        drawLabel(bestLeftPt, widthLabel, true);
      }
    });
  }
}
