import { coneMeshGeometry } from "./coneMeshGeometry";

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
    createGraphic: (properties: any) => G, createMesh: (properties: any) => any = properties => properties): G {
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
    if (scene) return this.renderMesh(view, layer, center, heading, radiusMeters, spreadDeg, ring, createGraphic, createMesh);
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
    return graphic!;
  }

  /** One closed mesh owns all shared vertices; a separate line draws only the top perimeter.
   * SDK Mesh construction is injected by the runtime. Reassign geometry on retained
   * graphics so rendering observes heading/radius updates without allocating layers.
   */
  private renderMesh(view: V, layer: L, center: { x: number; y: number }, heading: number,
    radius: number, spread: number, ring: number[][], createGraphic: (properties: any) => G,
    createMesh: (properties: any) => any): G {
    const geometry = createMesh(coneMeshGeometry(center, heading, radius, spread));
    let graphic = this.graphic;
    if (graphic && layer.graphics.includes(graphic) && graphic.geometry?.type === "mesh") graphic.geometry = geometry;
    else {
      this.clear(view);
      graphic = createGraphic({ geometry, symbol: { type: "mesh-3d",
        symbolLayers: [{ type: "fill", castShadows: false }] } });
      (graphic as any).__isCone = true; layer.add(graphic); this.graphic = graphic;
    }
    const outline = { type: "polyline", paths: [ring], hasZ: true, spatialReference: { wkid: 3857 } };
    if (this.parts[0]) this.parts[0].geometry = outline;
    else {
      const part = createGraphic({ geometry: outline, symbol: { type: "line-3d",
        symbolLayers: [{ type: "line", size: 1.5, material: { color: [255, 140, 0, 0.95] } }] } });
      (part as any).__isCone = true; layer.add(part); this.parts.push(part);
    }
    return graphic;
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

