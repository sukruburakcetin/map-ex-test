import type { PointCloudFeature } from '../../utils/pointCloudUtils';

/** Minimal scene-layer surface. The runtime binds the actual ArcGIS SDK factory. */
export interface PointCloudMapResource {
  destroyed?: boolean;
  visible?: boolean;
  legendEnabled?: boolean;
  renderer: unknown;
  destroy(): void;
}
export interface PointCloudMapView<L> {
  destroyed?: boolean;
  map?: { add(layer: L): unknown; remove(layer: L): unknown } | null;
}
export interface PointCloudEditConfirmation { objectId?: number | null; error?: unknown; }
export interface PointCloudEditResults {
  deleteFeatureResults?: PointCloudEditConfirmation[];
  updateFeatureResults?: PointCloudEditConfirmation[];
  addFeatureResults?: PointCloudEditConfirmation[];
}
export interface PointCloudMapEdits {
  deleteFeatures?: PointCloudFeature[];
  updateFeatures?: PointCloudFeature[];
  addFeatures?: PointCloudFeature[];
}
export interface PointCloudMapUpdate<V, R> {
  request: number;
  view: V;
  result: R;
  features: PointCloudFeature[];
  renderer: unknown;
  definitionExpression: string;
  silent: boolean;
}
export interface PointCloudMapDependencies<L, V, R> {
  createLayer(properties: Record<string, unknown>): L;
  applyEdits(layer: L, edits: PointCloudMapEdits): PromiseLike<PointCloudEditResults>;
  readView(): V | null | undefined;
  diff(previous: Map<number, PointCloudFeature>, next: PointCloudFeature[]): Required<PointCloudMapEdits>;
  onSummary(result: R, count: number): void;
  onLayerReady(): void;
  onSettled(): void;
  onToast(count: number): void;
  onError(error: unknown): void;
  yieldEdits(): Promise<void>;
}

/** Owns scene-layer identity, serialized SDK edits and confirmed point-ID maps.
 * Runtime prepares the same crop/renderer policy and owns adaptive watchers, rings,
 * lasso intent, acquisition and viewer rendering. This owner adds no requests or
 * independent scheduling: the existing zero-delay yield remains one per edit chunk.
 */
export class PointCloudMapLayer<L extends PointCloudMapResource, V extends PointCloudMapView<L>, R> {
  private currentLayer: L | null = null;
  private currentView: V | null = null;
  private currentResult: R | null = null;
  private request = 0;
  private editing = false;
  private task: Promise<void> = Promise.resolve();
  private features = new Map<number, PointCloudFeature>();
  private indexByOriginal = new Map<number, number>();
  private viewerObjectIds: number[] = [];

  /** Bind live host readers and SDK operations once; do not pass the Widget itself. */
  constructor(private readonly dependencies: PointCloudMapDependencies<L, V, R>) {}

  /** Current SDK layer and its creating view are borrowed for hit tests/adaptive display. */
  get layer(): L | null { return this.currentLayer; }
  /** Creating view for original-map cleanup and adaptive-display ownership checks. */
  get view(): V | null { return this.currentView; }

  /** True while the newest requested map update is pending or preparing geometry. */
  get updating(): boolean { return this.editing; }

  /** Queue barrier used by acquisition to wait for outstanding SDK edits, including after clear. */
  get pending(): Promise<void> { return this.task; }

  /** Mark the scene busy before synchronous feature preparation, preserving hover gating. */
  beginUpdate(): number { this.editing = true; return ++this.request; }

  /** Reject queued work on view transfer without changing layer/index identity yet.
   * In-flight applyEdits cannot be aborted; confirmation reconciliation still uses
   * the live layer/result/view predicate, exactly as before this extraction.
   */
  invalidate(): void { ++this.request; }

  /** Resolve filtered viewer indices to confirmed SDK ObjectIDs; omit unconfirmed points.
   * originalIndex + 1 is a logical ID, while an assigned ObjectID may differ.
   */
  objectIds(indices: readonly number[]): number[] {
    return indices.map(index => this.viewerObjectIds[index]).filter(Number.isFinite);
  }

  /** Replace/reuse a layer, then serialize delete/update/add edits in 5,000-point chunks.
   * Confirmation records from a superseded update still reconcile into the same
   * live layer before the newest queued diff runs. Only the newest request may
   * clear busy state, restore lasso feedback, notify errors or show a toast.
   */
  update(input: PointCloudMapUpdate<V, R>): void {
    const { view, result, features, renderer: activeRenderer, request: renderRequest, silent } = input;
    // 1. Initialize layer completely EMPTY to prevent UI lockup
    const reuse = this.currentLayer && !this.currentLayer.destroyed && this.currentResult === result && this.currentView === view;
    const layer: L = reuse ? this.currentLayer as L : this.dependencies.createLayer({
      id: "point-cloud-layer", legendEnabled: false, title: "Mapillary Point Cloud", visible: this.currentLayer?.visible ?? true,
      source: [],
      objectIdField: "ObjectID",
      geometryType: "point",
      hasZ: true,
      spatialReference: { wkid: 4326 },
      elevationInfo: { mode: "relative-to-ground", offset: 0.5 },
      fields: [
        { name: "ObjectID", type: "oid" },
        { name: "pointIndex", type: "integer" },
        { name: "originalIndex", type: "integer" },
        { name: "colorCode", type: "string", alias: "Hex Color" },
        { name: "relativeHeight", type: "double", alias: "Height Above Road (m)" },
        { name: "absoluteAltitude", type: "double", alias: "Sea-level Altitude (m)" },
        { name: "distanceFromCamera", type: "double", alias: "Distance from Car (m)" },
      ],
      outFields: ["*"],
      popupEnabled: true,
      popupTemplate: {
        title: "Point Cloud Node",
        content: `
                    <div style="font-size: 13px; line-height: 1.5;">
                        <b>Horizontal Distance:</b> {distanceFromCamera} m<br/>
                        <span style="font-size: 10px; color: #888; display: block; margin-top: -4px; margin-bottom: 4px;">
                            (From camera GPS origin)
                        </span>
                        <b>Height Above Road:</b> {relativeHeight} m<br/>
                        <b>Absolute Altitude:</b> {absoluteAltitude} m<br/>
                        <span style="display:none;">{originalIndex}</span>
                    </div>
                `,
      },
      renderer: activeRenderer,
      definitionExpression: input.definitionExpression,
    });

    layer.legendEnabled = false;
    this.dependencies.onSummary(result, features.length);
    if (!reuse) {
      if (this.currentLayer) { this.currentView?.map?.remove(this.currentLayer); this.currentLayer.destroy(); }
      view.map!.add(layer); this.currentLayer = layer; this.currentView = view; this.currentResult = result;
      this.features = new Map();
    }
    this.dependencies.onLayerReady();
    this.indexByOriginal = new Map(features.map(feature => [feature.attributes.originalIndex + 1, feature.attributes.pointIndex]));
    this.viewerObjectIds = features.map(feature => this.features.get(feature.attributes.originalIndex + 1)?.attributes.ObjectID ?? NaN);
    const current = () => this.currentLayer === layer && this.currentResult === result && this.dependencies.readView() === view && !view.destroyed && !layer.destroyed;
    this.task = this.task.catch(() => {}).then(async () => {
      if (!current() || renderRequest !== this.request) return;
      layer.renderer = activeRenderer;
      const changes = this.dependencies.diff(this.features, features);
      for (const [kind, edits] of [["deleteFeatures", changes.deleteFeatures], ["updateFeatures", changes.updateFeatures], ["addFeatures", changes.addFeatures]] as const) {
        for (let offset = 0; offset < edits.length; offset += 5000) {
          if (!current() || renderRequest !== this.request) return;
          const chunk = edits.slice(offset, offset + 5000);
          const edited = await this.dependencies.applyEdits(layer, { [kind]: chunk });
          const confirmations = kind === "deleteFeatures" ? edited.deleteFeatureResults : kind === "updateFeatures" ? edited.updateFeatureResults : edited.addFeatureResults;
          let failed = false;
          chunk.forEach((feature, index) => {
            if (!confirmations?.[index] || confirmations[index].error) { failed = true; return; }
            if (!current()) return;
            const id = feature.attributes.originalIndex + 1;
            if (kind === "deleteFeatures") this.features.delete(id);
            else {
              const assignedId = confirmations[index].objectId;
              if (!Number.isFinite(assignedId)) { failed = true; return; }
              this.features.set(id, { ...feature, attributes: { ...feature.attributes, ObjectID: assignedId } });
            }
            const viewerIndex = this.indexByOriginal.get(id);
            if (viewerIndex !== undefined) this.viewerObjectIds[viewerIndex] = this.features.get(id)?.attributes.ObjectID ?? NaN;
          });
          if (failed) throw new Error("Some point features could not be updated. Retry the cloud display.");
          await this.dependencies.yieldEdits();
        }
      }
      if (current() && renderRequest === this.request) {
        this.editing = false;
        this.dependencies.onSettled();
      }
      if (current() && renderRequest === this.request && !silent) this.dependencies.onToast(features.length);
    }).catch((error: unknown) => {
      if (current() && renderRequest === this.request) { this.editing = false; this.dependencies.onError(error); }
    });
  }

  /** Invalidate edits, remove/destroy the creating view's layer and clear ID maps.
   * Keep the pending promise as a queue barrier: SDK edits already in flight must
   * settle before later layer jobs, even when their stale confirmations are ignored.
   * Adaptive watchers, ring layers and viewer rendering have separate owners.
   */
  clear(): void {
    this.invalidate();
    if (this.currentLayer) {
      this.currentView?.map?.remove(this.currentLayer);
      this.currentLayer.destroy(); this.currentLayer = null;
    }
    this.features.clear(); this.indexByOriginal.clear(); this.viewerObjectIds = [];
    this.editing = false; this.currentResult = null; this.currentView = null;
  }
}
