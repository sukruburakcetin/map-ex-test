import { normalizeCaptureRoutePaths } from "./captureRouteGeometry";

interface RouteLayer<G> { removeAll(): unknown; add(graphic: G): unknown; }
interface RouteView<L> { map?: { add(layer: L): unknown } | null; destroyed?: boolean; }
interface GraphicProperties {
  geometry: { type: string; paths: number[][][]; spatialReference: { wkid: number } };
  symbol: object;
}
export interface CaptureRouteRendererHost<G, L extends RouteLayer<G>, V extends RouteView<L>> {
  view(): V | null | undefined;
  modules(): { Graphic: new (properties: GraphicProperties) => G } | null;
  layer(): L | null;
  setLayer(layer: L): void;
  loadLayerModules(): Promise<Array<new (properties: { id: string; title: string }) => L>>;
}

/** Drawing only. The widget retains layer ownership, clearing and teardown. */
export async function renderCaptureRouteGraphics<G, L extends RouteLayer<G>, V extends RouteView<L>>(
  pathsData: unknown, current: () => boolean, host: CaptureRouteRendererHost<G, L, V>,
): Promise<void> {
  if (!current()) return;
  const view = host.view();
  if (!view?.map || view.destroyed || !host.modules()) return;
  const routeMap = view.map;

  const polylinePaths = normalizeCaptureRoutePaths(pathsData);
  if (!polylinePaths) return;
  if (!host.layer()) {
    const [GraphicsLayer] = await host.loadLayerModules();
    if (!current() || host.view() !== view || view.map !== routeMap || view.destroyed) return;
    host.setLayer(new GraphicsLayer({
      id: "capture-route-layer",
      title: "Mapillary Capture Route",
    }));
    view.map.add(host.layer()!);
  }
  host.layer()!.removeAll();

  const { Graphic } = host.modules()!;

  // 1. Outer Glow Effect
  host.layer()!.add(
    new Graphic({
      geometry: { type: "polyline", paths: polylinePaths, spatialReference: { wkid: 4326 } },
      symbol: { type: "simple-line", color: [168, 85, 247, 0.35], width: 8 },
    }),
  );

  // 2. Main Purple Line (Centre Line)
  host.layer()!.add(
    new Graphic({
      geometry: { type: "polyline", paths: polylinePaths, spatialReference: { wkid: 4326 } },
      symbol: { type: "simple-line", color: [168, 85, 247, 1], width: 3.5, style: "solid" },
    }),
  );
}
