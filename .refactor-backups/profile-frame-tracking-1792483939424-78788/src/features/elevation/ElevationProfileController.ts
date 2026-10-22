import type { ElevationIndicatorImage, ElevationIndicatorWidget } from './profileIndicator';

/** Minimal host boundary; constructors are supplied by the Experience Builder SDK loader. */
export interface ElevationProfileView {
  type: string;
  map: { ground?: { layers?: { length: number } } };
  ui: { add(widget: any, position: string): unknown; remove(widget: any): unknown };
}
interface ProfileWidget extends ElevationIndicatorWidget {
  profiles: any;
  input: any;
  destroy(): void;
}
type SDKConstructor = new (properties: any) => any;

/** Owns the optional chart widget, independent terrain source and asynchronous update revision.
 * Runtime supplies active-view/mode validity; this owner never changes map ground or camera.
 * Module requests cannot be aborted, so disposal and newer updates invalidate late completions.
 */
export class ElevationProfileController {
  widget: ProfileWidget | null = null;
  private terrainSource: { destroy(): void } | null = null;
  private revision = 0;
  private readonly loadModules: (ids: string[]) => Promise<SDKConstructor[]>;
  private readonly getGraphic: () => SDKConstructor;

  constructor(loadModules: (ids: string[]) => Promise<SDKConstructor[]>, getGraphic: () => SDKConstructor) {
    this.loadModules = loadModules; this.getGraphic = getGraphic;
  }

  /** Build or update the existing sequence profile. Coordinates are degrees; altitude is metres.
   * The original terrain/input/infrastructure profiles and bottom-leading placement are preserved.
   */
  async update(view: ElevationProfileView, sequenceImages: readonly ElevationIndicatorImage[], isCurrent: () => boolean): Promise<void> {
    const request = ++this.revision;
    // Sample fallback terrain for the chart without changing the visible map's ground.
    const needsTerrainSource = !view.map.ground?.layers?.length;
    const [ElevationProfile, Polyline, ElevationLayer] = await this.loadModules([
      "esri/widgets/ElevationProfile", "esri/geometry/Polyline",
      ...(needsTerrainSource ? ["esri/layers/ElevationLayer"] : []),
    ]);
    if (request !== this.revision || !isCurrent()) return;
    const Graphic = this.getGraphic();

    // 2. Build 3D polyline with altitude (if available from Mapillary)
    const hasAltitude = sequenceImages.some((img) => (img as any).alt && (img as any).alt !== 0);
    const paths = sequenceImages.map((img) => [img.lon, img.lat, (img as any).alt || 0]);

    const polyline = new Polyline({
      paths: [paths],
      hasZ: hasAltitude,
      spatialReference: { wkid: 4326 },
    });

    const inputGraphic = new Graphic({
      geometry: polyline,
    });

    // 3. Configure profiles: Terrain + Vehicle Trajectory + 3D Buildings
    if (needsTerrainSource && !this.terrainSource) {
      this.terrainSource = new ElevationLayer({ url: "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer" });
    }
    const profiles: any[] = [needsTerrainSource
      ? { type: "query", source: this.terrainSource, title: "Terrain Surface", color: "#2ecc71" }
      : { type: "ground", title: "Terrain Surface", color: "#2ecc71" }];

    // If Mapillary has GPS/SfM altitude, plot the vehicle's path!
    if (hasAltitude) {
      profiles.push({ type: "input", title: "Vehicle Altitude", color: "#f39c12" });
    }

    if (view.type === "3d") {
      profiles.push({ type: "view", title: "3D Infrastructure", color: "#3498db" });
    }

    if (!this.widget) {
      this.widget = new ElevationProfile({
        view: view,
        profiles: profiles,
        visibleElements: {
          selectButton: false, // Hide manual select button
          sketchButton: false, // Hide sketch button
          settingsButton: false, // Hide bulky gear icon
          clearButton: false, // Hide trash can button
          uniformChartScalingToggle: false, // Hide scaling toggle
        },
        input: inputGraphic,
      });

      view.ui.add(this.widget, "bottom-leading");
    } else {
      this.widget.profiles = profiles;
      this.widget.input = inputGraphic;
    }
  }

  /** Invalidate pending updates, remove chart annotations, then destroy chart and query source.
   * View transfer retains its existing best-effort widget teardown; ordinary clear propagates SDK errors.
   * The host passes the same UI view as before extraction to preserve teardown ordering.
   */
  clear(view?: ElevationProfileView, transferring = false): void {
    ++this.revision;
    if (view && this.widget) {
      if (transferring) {
        try { view.ui.remove(this.widget); this.widget.destroy(); } catch (error) {}
      } else {
        const container = this.widget.container as HTMLElement;
        container?.querySelector('#mly-elevation-needle')?.remove();
        container?.querySelector('#mly-elevation-badge')?.remove();
        view.ui.remove(this.widget);
        this.widget.destroy();
      }
      this.widget = null;
    }
    this.terrainSource?.destroy(); this.terrainSource = null;
  }
}
