import { ProfileFrameChart } from './profileIndicator';
import type { ElevationIndicatorWidget } from './profileIndicator';
import { frameDistanceIndex, sameProfileInput } from './profileTracking';
import type { ElevationIndicatorImage } from './profileTracking';

/** Minimal host boundary; constructors are supplied by the Experience Builder SDK loader. */
export interface ElevationProfileView {
  type: string;
  destroyed?: boolean;
  map?: { ground?: { layers?: { length: number } } } | null;
  ui: { add(widget: any, position: string): unknown; remove(widget: any): unknown };
}
interface ProfileWidget extends ElevationIndicatorWidget {
  profiles: any;
  input: any;
  destroy(): void;
}
type SDKConstructor = new (properties: any) => any;

/** Generate profiles and the frame index from one immutable route snapshot.
 * Confirmed frame changes only update the chart needle; queries are route-owned.
 * SDK sample inspection cannot replace or move the active-image map marker.
 */
export class ElevationProfileController {
  widget: ProfileWidget | null = null;
  private terrainSource: { destroy(): void } | null = null;
  private revision = 0;
  private view: ElevationProfileView | null = null;
  private images: readonly ElevationIndicatorImage[] | null = null;
  private pendingImages: readonly ElevationIndicatorImage[] | null = null;
  private chart: ProfileFrameChart | null = null;
  private chartWatch: { remove(): void } | null = null;
  private confirmedImageId: string | null = null;
  constructor(private readonly loadModules: (ids: string[]) => Promise<any[]>, private readonly getGraphic: () => SDKConstructor) {}

  track(imageId: string | null): void {
    this.confirmedImageId = imageId;
    this.chart?.setFrame(imageId);
  }

  async update(view: ElevationProfileView, sequenceImages: readonly ElevationIndicatorImage[], isCurrent: () => boolean): Promise<void> {
    if (!view.map || view.destroyed) { this.clear(); return; }
    const map = view.map;
    if (this.view === view && this.images && sameProfileInput(this.images, sequenceImages)) { this.track(this.confirmedImageId); return; }
    if (this.view === view && this.pendingImages && sameProfileInput(this.pendingImages, sequenceImages)) return;
    const confirmed = this.confirmedImageId;
    this.clear(); this.confirmedImageId = confirmed;
    this.view = view;
    if (sequenceImages.length < 2) return;
    const snapshot = sequenceImages.map(image => ({ id: String(image.id), lon: image.lon, lat: image.lat, alt: image.alt }));
    this.pendingImages = snapshot;
    const request = ++this.revision;
    const current = () => request === this.revision && this.view === view && view.map === map && !view.destroyed && isCurrent();
    const needsTerrainSource = !map.ground?.layers?.length;
    try {
      const [ElevationProfile, Polyline, geodesicUtils, reactiveUtils, ElevationLayer] = await this.loadModules([
        'esri/widgets/ElevationProfile', 'esri/geometry/Polyline', 'esri/geometry/support/geodesicUtils', 'esri/core/reactiveUtils',
        ...(needsTerrainSource ? ['esri/layers/ElevationLayer'] : []),
      ]);
      if (!current()) return;
      const lengths: number[] = [];
      // The SDK uses ellipsoidal geodesic distances for geographic profile input.
      // Build once, in bounded batches; never scan the route during frame playback.
      for (let start = 1; start < snapshot.length; start += 256) {
        if (!current()) return;
        const segments = snapshot.slice(start, start + 256).map((image, offset) => {
          const previous = snapshot[start + offset - 1];
          return new Polyline({ paths: [[[previous.lon, previous.lat], [image.lon, image.lat]]], spatialReference: { wkid: 4326 } });
        });
        lengths.push(...geodesicUtils.geodesicLengths(segments, 'meters'));
        if (start + 256 < snapshot.length) await new Promise(resolve => setTimeout(resolve, 0));
      }
      if (!current()) return;
      const index = frameDistanceIndex(snapshot, lengths);
      if (!(index.total > 0)) { this.pendingImages = null; return; }
      const Graphic = this.getGraphic();
      const hasAltitude = snapshot.some(image => typeof image.alt === 'number' && Number.isFinite(image.alt));
      const polyline = new Polyline({ paths: [snapshot.map(image => [image.lon, image.lat, image.alt || 0])], hasZ: hasAltitude, spatialReference: { wkid: 4326 } });
      const inputGraphic = new Graphic({ geometry: polyline, elevationInfo: { mode: 'absolute-height' } });
      if (needsTerrainSource) this.terrainSource = new ElevationLayer({ url: 'https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer' });
      const profiles: any[] = [needsTerrainSource
        ? { type: 'query', source: this.terrainSource, title: 'Terrain Surface', color: '#2ecc71', viewVisualizationEnabled: false }
        : { type: 'ground', title: 'Terrain Surface', color: '#2ecc71', viewVisualizationEnabled: false }];
      if (hasAltitude) profiles.push({ type: 'input', title: 'Vehicle Altitude', color: '#f39c12', viewVisualizationEnabled: false });
      if (view.type === '3d') profiles.push({ type: 'view', title: '3D Infrastructure', color: '#3498db', viewVisualizationEnabled: false });
      this.widget = new ElevationProfile({ view, profiles, input: inputGraphic, unit: 'meters', unitOptions: ['meters'],
        visibleElements: { selectButton: false, sketchButton: false, settingsButton: false, clearButton: false, uniformChartScalingToggle: false } });
      this.widget!.viewModel.hoveredChartPosition = null;
      this.images = snapshot; this.pendingImages = null;
      view.ui.add(this.widget, 'bottom-leading');
      this.chart = new ProfileFrameChart(this.widget!, index);
      this.chart.setFrame(this.confirmedImageId);
      this.chartWatch = reactiveUtils.watch(() => [this.widget?.viewModel.progress,
        ...this.widget?.profiles.toArray().flatMap((line: any) => [line.visible, line.samples]) || []], () => this.chart?.refresh());
    } catch (error) {
      if (current()) { this.clear(); throw error; }
    } finally {
      if (request === this.revision) this.pendingImages = null;
    }
  }

  /** Always remove from the creating view, including a 2D/3D transfer. */
  clear(_view?: ElevationProfileView, transferring = false): void {
    ++this.revision;
    this.chartWatch?.remove(); this.chartWatch = null;
    this.chart?.dispose(); this.chart = null;
    const widget = this.widget, view = this.view;
    this.widget = null; this.view = null; this.images = null; this.pendingImages = null; this.confirmedImageId = null;
    try {
      if (widget) {
        try { view?.ui.remove(widget); } finally { widget.destroy(); }
      }
    } catch (error) { if (!transferring) throw error; }
    finally { this.terrainSource?.destroy(); this.terrainSource = null; }
  }
}
