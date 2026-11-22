/** Exact module slots published to the widget; SDK/service values remain supplied by the host loader. */
export interface ArcGISModuleSet {
  Graphic: unknown; Point: unknown; SimpleMarkerSymbol: unknown; VectorTileLayer: unknown;
  FeatureLayer: unknown; GraphicsLayer: unknown; route: unknown; networkService: unknown;
  RouteParameters: unknown; FeatureSet: unknown; Multipoint: unknown; PointSymbol3D: unknown; Mesh: unknown;
}

/** Lazy SDK loading and widget publication stay injectable without starting work in the constructor. */
export interface ArcGISModuleHost {
  ready(): boolean;
  load(ids: string[]): Promise<unknown[]>;
  publish(modules: ArcGISModuleSet): void;
  loaded(): void;
}

/** Share the existing initialization task and clear only the rejected current task for retry. */
export class ArcGISModuleInitialization {
  private task: Promise<void> | null = null;
  constructor(private readonly host: ArcGISModuleHost) {}

  /** Ensure modules are published; callers retain their own lifecycle checks after awaiting. */
  async ensure(): Promise<void> {
    if (this.host.ready()) return;
    if (!this.task) {
      this.task = (async () => {
        const [Graphic, Point, SimpleMarkerSymbol, VectorTileLayer, FeatureLayer, GraphicsLayer, route, networkService, RouteParameters, FeatureSet, Multipoint, PointSymbol3D, Mesh] = await this.host.load([
          "esri/Graphic",
          "esri/geometry/Point",
          "esri/symbols/SimpleMarkerSymbol",
          "esri/layers/VectorTileLayer",
          "esri/layers/FeatureLayer",
          "esri/layers/GraphicsLayer",
          "esri/rest/route",
          "esri/rest/networkService",
          "esri/rest/support/RouteParameters",
          "esri/rest/support/FeatureSet",
          "esri/geometry/Multipoint",
          "esri/symbols/PointSymbol3D",
          "esri/geometry/Mesh",
        ]);
        this.host.publish({
          Graphic,
          Point,
          SimpleMarkerSymbol,
          VectorTileLayer,
          FeatureLayer,
          GraphicsLayer,
          route,
          networkService,
          RouteParameters,
          FeatureSet,
          Multipoint,
          PointSymbol3D,
          Mesh,
        });
        this.host.loaded();
      })();
    }
    const task = this.task;
    try { await task; }
    catch (error) { if (this.task === task) this.task = null; throw error; }
  }

}
