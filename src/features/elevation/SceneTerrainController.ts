/** Adds optional scene terrain without replacing the host map's Ground. */
export interface SceneTerrainLayer {
  load(): Promise<unknown>;
  destroy(): void;
}
export interface SceneTerrainGround {
  layers: {
    readonly length: number;
    add(layer: SceneTerrainLayer): unknown;
    remove(layer: SceneTerrainLayer): unknown;
    includes(layer: SceneTerrainLayer): boolean;
  };
}
export interface SceneTerrainMap { ground: SceneTerrainGround; }
export interface SceneTerrainView {
  type: string;
  destroyed?: boolean;
  map: SceneTerrainMap | null;
  when(): Promise<unknown>;
}
export type SceneTerrainConstructor = new (properties: { url: string; title: string }) => SceneTerrainLayer;

/** Own only the layer created here. A shared 2D/3D map retains that layer during view
 * switches; 2D never starts terrain loading. External terrain is always reused.
 * Revision and Ground identity checks reject stale module/layer completions.
 */
export class SceneTerrainController {
  private revision = 0;
  private disposed = false;
  private owned: { map: SceneTerrainMap; ground: SceneTerrainGround; layer: SceneTerrainLayer } | null = null;
  private pending: SceneTerrainLayer | null = null;
  constructor(private readonly loadConstructor: () => Promise<SceneTerrainConstructor>) {}

  async sync(view: SceneTerrainView | null | undefined, enabled: boolean): Promise<void> {
    const request = ++this.revision;
    this.cancelPending();
    const map = view?.map;
    if (this.owned && (!enabled || this.owned.map !== map || this.owned.ground !== map?.ground || !this.owned.ground.layers.includes(this.owned.layer))) this.releaseOwned();
    if (this.disposed || !enabled || !view || view.destroyed || !map || view.type !== '3d') return;
    const ground = map.ground;
    if (!ground?.layers || ground.layers.length) return;
    const current = () => !this.disposed && request === this.revision && !view.destroyed && view.map === map && map.ground === ground;
    let layer: SceneTerrainLayer | null = null;
    try {
      await view.when();
      if (!current() || ground.layers.length) return;
      const ElevationLayer = await this.loadConstructor();
      if (!current() || ground.layers.length) return;
      layer = new ElevationLayer({
        url: 'https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer',
        title: 'Mapillary Explorer Terrain',
      });
      this.pending = layer;
      await layer.load();
      if (!current() || ground.layers.length) return;
      ground.layers.add(layer);
      this.owned = { map, ground, layer };
    } catch (error) {
      // A superseded/destroyed view or cancelled layer is an expected lifecycle exit.
      if (current() && (error as { name?: string })?.name !== 'AbortError') throw error;
    } finally {
      if (layer && this.pending === layer) {
        this.pending = null;
        if (this.owned?.layer !== layer) layer.destroy();
      }
    }
  }

  private cancelPending(): void {
    const layer = this.pending; this.pending = null;
    layer?.destroy();
  }
  private releaseOwned(): void {
    const owned = this.owned; this.owned = null;
    if (!owned) return;
    if (owned.ground.layers.includes(owned.layer)) owned.ground.layers.remove(owned.layer);
    owned.layer.destroy();
  }
  dispose(): void {
    this.disposed = true; ++this.revision;
    this.cancelPending(); this.releaseOwned();
  }
}
