/** Camera-cone layer, terrain-relative geometry, symbols and reusable graphic membership. */
export interface ConeGraphic { geometry: any; }
export interface ConeLayer<G> {
  graphics: { includes(graphic: G): boolean };
  add(graphic: G): unknown;
  removeAll(): void;
  destroy(): void;
}
export interface ConeView<G, L> {
  map?: {
    findLayerById(id: string): unknown;
    layers: { includes(layer: L): boolean };
    add(layer: L): unknown;
    remove(layer: L): unknown;
  } | null;
  graphics: { forEach(callback: (graphic: G) => void): void; remove(graphic: G): unknown };
}

export class CameraConeGraphics<G extends ConeGraphic, L extends ConeLayer<G>, V extends ConeView<G, L>> {
  layer: L | null = null;
  graphic: G | null = null;
  parts: G[] = [];
  private readonly createLayer: (properties: any) => L;

  constructor(createLayer: (properties: any) => L) { this.createLayer = createLayer; }

  /** Reuse the existing camera-cone layer or create it with the original terrain-relative settings. */
  ensure(view: V): L {
    const map = view.map!;
    if (!this.layer) {
      const existing = map.findLayerById('camera-cone-layer') as L;
      if (existing) this.layer = existing;
      else {
        this.layer = this.createLayer({ id: 'camera-cone-layer', title: 'Mapillary Camera Cone', elevationInfo: { mode: 'relative-to-ground' } });
        map.add(this.layer);
      }
    }
    if (!map.layers.includes(this.layer)) map.add(this.layer);
    return this.layer;
  }

  /** Build or update a 2D sector / shallow solid wedge, reusing top and side graphics.
   * Center is Web Mercator; latitude is degrees; heading/spread are degrees clockwise
   * from north; radius is ground metres. Geometry stays relative to the layer terrain.
   * The runtime resolves coverage anchoring and selection-layer ordering before/after this call.
   */
  render(view: V, layer: L, center: { x: number; y: number }, latitude: number,
    heading: number, radiusMeters: number, spreadDeg: number, scene: boolean,
    createGraphic: (properties: any) => G): G {
    // One clockwise sector in projected coordinates avoids overlapping ground/top surfaces.
    const radius = radiusMeters / Math.max(0.01, Math.cos(latitude * Math.PI / 180));
    const z = scene ? 0.08 : 0;
    // The apex belongs to the native ground image center; lift only the wedge's
    // other surfaces. A fixed 8 cm apex lift becomes several pixels at close zoom.
    const ring: number[][] = [[center.x, center.y, 0]];
    const segments = Math.max(8, Math.ceil(spreadDeg / 2));
    const rise = Math.min(radiusMeters * 0.15, 1.5);
    for (let i = 0; i <= segments; i++) {
      const degrees = heading - spreadDeg / 2 + spreadDeg * i / segments;
      const angle = degrees * Math.PI / 180;
      // Every top vertex lies on the same sloping plane, avoiding twisted polygon triangulation.
      const height = scene ? rise * Math.cos((degrees - heading) * Math.PI / 180) : 0;
      ring.push([center.x + radius * Math.sin(angle), center.y + radius * Math.cos(angle), z + height]);
    }
    ring.push([...ring[0]]);
    const geometry = { type: "polygon", rings: [ring], hasZ: true, spatialReference: { wkid: 3857 } } as any;
    let graphic = this.graphic;
    if (graphic && layer.graphics.includes(graphic)) graphic.geometry = geometry;
    else {
      this.clear(view);
      graphic = createGraphic({ geometry, symbol: scene ? {
        type: "polygon-3d", symbolLayers: [{ type: "fill", castShadows: false, material: { color: [255, 165, 0, 0.25] }, outline: { color: [255, 140, 0, 0.95], size: 1.5 } }],
      } : { type: "simple-fill", color: [255, 165, 0, 0.28], outline: { color: [255, 140, 0, 0.95], width: 1.5 } } });
      (graphic as any).__isCone = true; layer.add(graphic!); this.graphic = graphic;
    }
    if (scene) {
      const tip = ring[0], left = ring[1], right = ring[ring.length - 2];
      const leftGround = [left[0], left[1], z], rightGround = [right[0], right[1], z];
      const sides = [[tip, leftGround, left, tip], [tip, right, rightGround, tip]];
      // Close the curved end with a translucent skirt. Only the top face has
      // an outline: side joins and the lower perimeter have no edge strokes.
      const arc = ring.slice(1, -1);
      const skirt = [...arc, ...arc.slice().reverse().map(p => [p[0], p[1], z]), [...arc[0]]];
      const geometries = [...sides, skirt].map(side => ({ type: "polygon", rings: [side], hasZ: true, spatialReference: { wkid: 3857 } }));
      for (let i = 0; i < geometries.length; i++) {
        if (this.parts[i]) this.parts[i].geometry = geometries[i] as any;
        else {
          const part = createGraphic({ geometry: geometries[i], symbol: {
            type: "polygon-3d", symbolLayers: [{ type: "fill", castShadows: false,
              material: { color: [220, 120, 0, 0.2] } }],
          } });
          (part as any).__isCone = true; layer.add(part); this.parts.push(part);
        }
      }
    }
    return graphic!;
  }

  /** Clear cone membership and tagged legacy view graphics without destroying the reusable layer. */
  clear(view: V | undefined): void {
    this.graphic = null; this.parts = [];
    if (this.layer) this.layer.removeAll();
    if (view) {
      const toRemove: G[] = [];
      view.graphics.forEach(graphic => { if ((graphic as any).__isCone) toRemove.push(graphic); });
      toRemove.forEach(graphic => view.graphics.remove(graphic));
    }
  }

  /** Match the view-transfer layer teardown using the caller-supplied map and existing error containment.
   * Layer disposal and membership clearing remain separate operations, as in the original runtime.
   */
  dispose(view: V): void {
    if (this.layer) {
      try {
        const map = view.map;
        if (map && map.layers.includes(this.layer)) map.remove(this.layer);
        this.layer.destroy();
      } catch { /* Preserve best-effort SDK teardown. */ }
      this.layer = null;
    }
  }
}

