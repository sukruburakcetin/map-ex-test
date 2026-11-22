import { LAYER_IDS } from "../../utils/constants";
import { TURBO_LIMITS } from "../../utils/turboCoverageUtils";

interface ReplacementHost {
  createReplacement(): __esri.VectorTileLayer | null;
  tilesActive(): boolean | undefined;
  restoreOrder(): void;
  refreshTurbo(): void;
  log(...args: unknown[]): void;
}

/** Attach the replacement before retiring the old layer to avoid a coverage gap. */
export function replaceNativeCoverage(
  view: __esri.MapView | __esri.SceneView,
  isPano: boolean | null | undefined,
  host: ReplacementHost,
): void {
  const oldLayer = view.map.findLayerById(LAYER_IDS.COVERAGE_VT);
  host.log("[rebuildCoverageLayer] called with isPano:", isPano);
  const newLayer = host.createReplacement();
  host.log("[rebuildCoverageLayer] tilesActive:", host.tilesActive());
  host.log("[rebuildCoverageLayer] image layer filter:", JSON.stringify(newLayer?.style?.layers?.find((layer: { id: string; filter?: unknown }) => layer.id === "image")?.filter));
  if (!host.tilesActive() && !oldLayer) return;

  if (newLayer && !view.map.layers.includes(newLayer)) view.map.add(newLayer);
  if (oldLayer && oldLayer !== newLayer) {
    try {
      view.map.remove(oldLayer);
    } catch (error) {
      console.warn("[Coverage] Could not remove old VTL", error);
    }
    try {
      oldLayer.destroy();
    } catch (error) {
      console.warn("[Coverage] Could not destroy old VTL", error);
    }
  }
  host.restoreOrder();
  host.refreshTurbo();
}

/** Keep the Mapillary stack near its existing map position and active sequence markers above it. */
export function orderCoverageLayers(map: __esri.Map, activeSequenceLayer: () => __esri.Layer | undefined): void {
  const raiseSequence = () => {
    const layer = activeSequenceLayer();
    if (layer && map.layers.includes(layer)) map.reorder(layer, map.layers.length - 1);
  };
  raiseSequence();

  const desiredIds = [
    LAYER_IDS.COVERAGE_VT,
    ...map.layers.toArray().filter(layer => layer.id.startsWith("mapillary-cached-hover-")).map(layer => layer.id),
    ...map.layers.toArray().filter(layer => layer.id.startsWith("mapillary-cached-selected-")).map(layer => layer.id),
    "mapillary-tile-hover",
    "mapillary-tile-selected",
    LAYER_IDS.TRAFFIC_SIGNS_VT,
    LAYER_IDS.OBJECTS_VT,
    LAYER_IDS.TURBO_COVERAGE,
    TURBO_LIMITS.closeLayerId,
    LAYER_IDS.OBJECTS_FL,
    LAYER_IDS.TRAFFIC_SIGNS_FL,
  ];
  const desiredLayers = desiredIds.map(id => map.findLayerById(id))
    .filter((layer): layer is __esri.Layer => !!layer && map.layers.includes(layer));
  if (desiredLayers.length < 2) return;

  const currentLayers = map.layers.toArray();
  const currentIndices = desiredLayers.map(layer => currentLayers.indexOf(layer)).filter(index => index >= 0);
  if (currentIndices.length === 0) return;

  const baseIndex = Math.min(...currentIndices);
  desiredLayers.forEach((layer, offset) => map.reorder(layer, baseIndex + offset));
  raiseSequence();
}
