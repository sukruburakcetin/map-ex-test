import { TILE_URLS, STYLE_SOURCE_IDS, STYLE_LAYER_IDS } from "../../utils/constants";

interface SourceLayer { style: unknown; }
export interface MinimapLayerInput<L> {
  mainLayers: { includes(layer: object): boolean };
  coverage(): SourceLayer | null | undefined;
  trafficSigns(): SourceLayer | null | undefined;
  objects(): SourceLayer | null | undefined;
  accessToken(): string;
  VectorTileLayer: new (properties: { style: unknown; opacity: number }) => L;
  warn: (...args: unknown[]) => void;
}

/** Copy layer styles only; map insertion and tracking-layer order belong to the caller. */
export function buildMinimapLayers<L>({
  mainLayers, coverage, trafficSigns, objects, accessToken, VectorTileLayer, warn,
}: MinimapLayerInput<L>): L[] {
  const layersToAdd: L[] = [];
  const isLayerActive = (layer: SourceLayer | null | undefined) => layer && mainLayers.includes(layer);
  for (const read of [coverage, trafficSigns, objects]) {
    if (isLayerActive(read())) {
      try {
        const styleCopy = JSON.parse(JSON.stringify(read()!.style));
        layersToAdd.push(new VectorTileLayer({ style: styleCopy, opacity: 0.6 }));
      } catch (e) { }
    }
  }
  // Minimap circles retain full point context independently of main-map visibility settings.
  try {
    const vectorTileSourceUrl = `${TILE_URLS.COVERAGE}?access_token=${accessToken()}`;
    const style = {
      version: 8,
      sources: {
        [STYLE_SOURCE_IDS.MAPILLARY]: { type: "vector", tiles: [vectorTileSourceUrl], minzoom: 0, maxzoom: 14 },
      },
      layers: [
        {
          id: STYLE_LAYER_IDS.SEQUENCE, source: STYLE_SOURCE_IDS.MAPILLARY,
          "source-layer": STYLE_LAYER_IDS.SEQUENCE, type: "line",
          paint: { "line-opacity": 0.6, "line-color": "#35AF6D", "line-width": 1.5 },
        },
        {
          id: STYLE_LAYER_IDS.IMAGE, source: STYLE_SOURCE_IDS.MAPILLARY,
          "source-layer": STYLE_LAYER_IDS.IMAGE, type: "circle",
          paint: { "circle-radius": 2, "circle-color": "#35AF6D", "circle-stroke-color": "#ffffff", "circle-stroke-width": 1, "circle-opacity": 1, "circle-stroke-opacity": 1 },
        },
      ],
    };
    layersToAdd.push(new VectorTileLayer({ style, opacity: 0.8 }));
  } catch (error) {
    warn("Could not add coverage layer to minimap:", error);
  }
  return layersToAdd;
}
