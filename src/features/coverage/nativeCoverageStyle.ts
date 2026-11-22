import { TILE_URLS, QUALITY_SCORE, STYLE_LAYER_IDS, STYLE_SOURCE_IDS } from "../../utils/constants";
import { buildAllFilters } from "../../utils/filterBuilder";

export type CoverageQualityBand = "good" | "fair" | "poor" | "unscored";

/** Build the native vector-tile style before creating or attaching an ArcGIS layer. */
export function nativeCoverageStyle(
  accessToken: string,
  organizationId: number | undefined,
  filterCreatorId?: number,
  filterStartDate?: string,
  filterEndDate?: string,
  filterIsPano?: boolean | null,
  qualityViewActive?: boolean,
  qualityBandFilter?: CoverageQualityBand | null,
) {
  const vectorTileSourceUrl = `${TILE_URLS.COVERAGE}?access_token=${accessToken}`;
  const { overviewFilter, sequenceFilter, imageFilter, hasPanoFilter } = buildAllFilters({
    creatorId: filterCreatorId,
    organizationId,
    startDate: filterStartDate,
    endDate: filterEndDate,
    isPano: filterIsPano,
  });

  const layers: any[] = [];

  // Pano condition (classic filter syntax for ArcGIS VTL compatibility)
  let panoCondition: any = null;
  if (filterIsPano === true) {
    panoCondition = ["any", ["==", "is_pano", true], ["==", "is_pano", 1], ["==", "is_pano", "true"]];
  } else if (filterIsPano === false) {
    panoCondition = ["all", ["!=", "is_pano", true], ["!=", "is_pano", 1], ["!=", "is_pano", "true"]];
  }

  const applyPano = (baseFilter: any) => {
    if (baseFilter === "hide") return ["all", ["has", "id"], ["!has", "id"]];
    if (!panoCondition) return baseFilter;
    if (!baseFilter) return panoCondition;
    return ["all", baseFilter, panoCondition];
  };

  const finalOverviewFilter = applyPano(overviewFilter);
  const finalSequenceFilter = applyPano(sequenceFilter);
  const finalImageFilter = applyPano(imageFilter);

  // OVERVIEW LAYER
  if (!hasPanoFilter && overviewFilter !== "hide") {
    layers.push({
      id: STYLE_LAYER_IDS.OVERVIEW,
      source: STYLE_SOURCE_IDS.MAPILLARY,
      "source-layer": "overview",
      type: "circle",
      ...(finalOverviewFilter ? { filter: finalOverviewFilter } : {}),
      paint: {
        "circle-radius": 1,
        "circle-color": "#35AF6D",
        "circle-stroke-color": "#35AF6D",
        "circle-stroke-width": 1,
      },
    });
  }

  // SEQUENCE + IMAGE LAYERS
  if (qualityViewActive) {
    // QUALITY VIEW: 4 colour-banded sequence layers
    // Uses pure CLASSIC syntax to prevent crashes when combined with is_pano
    const seqBand = (id: string, qualityConditions: any[], color: string, opacity = 0.85) => {
      const filter = finalSequenceFilter ? ["all", finalSequenceFilter, ...qualityConditions] : ["all", ...qualityConditions];

      return {
        id: id,
        source: STYLE_SOURCE_IDS.MAPILLARY,
        "source-layer": "sequence",
        type: "line",
        filter: filter,
        paint: {
          "line-opacity": opacity,
          "line-color": color,
          "line-width": 2.5,
        },
      };
    };

    const showBand = (band: "good" | "fair" | "poor" | "unscored") => !qualityBandFilter || qualityBandFilter === band;

    if (showBand("good")) {
      layers.push(seqBand(STYLE_LAYER_IDS.SEQUENCE_GOOD, [[">=", "quality_score", QUALITY_SCORE.GOOD]], "#35AF6D"));
    }
    if (showBand("fair")) {
      layers.push(
        seqBand(
          STYLE_LAYER_IDS.SEQUENCE_FAIR,
          [
            [">=", "quality_score", QUALITY_SCORE.FAIR],
            ["<", "quality_score", QUALITY_SCORE.GOOD],
          ],
          "#F5A623",
        ),
      );
    }
    if (showBand("poor")) {
      layers.push(
        seqBand(
          STYLE_LAYER_IDS.SEQUENCE_POOR,
          [
            [">", "quality_score", QUALITY_SCORE.FLOOR],
            ["<", "quality_score", QUALITY_SCORE.FAIR],
          ],
          "#D0021B",
        ),
      );
    }
    if (showBand("unscored")) {
      layers.push(seqBand(STYLE_LAYER_IDS.SEQUENCE_UNSCORED, [["any", ["!has", "quality_score"], ["==", "quality_score", 0]]], "#A855F7", 0.85));
    }

    {
      const imgBand = (id: string, qualityConditions: any[], color: string, opacity = 0.85) => {
        const filter = finalImageFilter ? ["all", finalImageFilter, ...qualityConditions] : ["all", ...qualityConditions];

        return {
          id: id,
          source: STYLE_SOURCE_IDS.MAPILLARY,
          "source-layer": "image",
          type: "circle",
          filter: filter,
          paint: {
            "circle-radius": 2,
            "circle-color": color,
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 1,
            "circle-opacity": opacity,
            "circle-stroke-opacity": opacity,
          },
        };
      };

      if (showBand("good")) {
        layers.push(imgBand(STYLE_LAYER_IDS.IMAGE_GOOD, [[">=", "quality_score", QUALITY_SCORE.GOOD]], "#35AF6D"));
      }
      if (showBand("fair")) {
        layers.push(
          imgBand(
            STYLE_LAYER_IDS.IMAGE_FAIR,
            [
              [">=", "quality_score", QUALITY_SCORE.FAIR],
              ["<", "quality_score", QUALITY_SCORE.GOOD],
            ],
            "#F5A623",
          ),
        );
      }
      if (showBand("poor")) {
        layers.push(
          imgBand(
            STYLE_LAYER_IDS.IMAGE_POOR,
            [
              [">", "quality_score", QUALITY_SCORE.FLOOR],
              ["<", "quality_score", QUALITY_SCORE.FAIR],
            ],
            "#D0021B",
          ),
        );
      }
      if (showBand("unscored")) {
        layers.push(imgBand(STYLE_LAYER_IDS.IMAGE_UNSCORED, [["any", ["!has", "quality_score"], ["==", "quality_score", 0]]], "#A855F7", 0.85));
      }
    }
  } else {
    // NORMAL VIEW: single green sequence + image layer
    layers.push({
      id: STYLE_LAYER_IDS.SEQUENCE,
      source: STYLE_SOURCE_IDS.MAPILLARY,
      "source-layer": "sequence",
      type: "line",
      ...(finalSequenceFilter ? { filter: finalSequenceFilter } : {}),
      paint: {
        "line-opacity": 0.8,
        "line-color": "#35AF6D",
        "line-width": 2,
      },
    });

    {
      layers.push({
        id: STYLE_LAYER_IDS.IMAGE,
        source: STYLE_SOURCE_IDS.MAPILLARY,
        "source-layer": "image",
        type: "circle",
        ...(finalImageFilter ? { filter: finalImageFilter } : {}),
        paint: {
          "circle-radius": 2,
          "circle-color": "#35AF6D",
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 1,
          "circle-opacity": 1,
          "circle-stroke-opacity": 1,
        },
      });
    }
  }

  return {
    version: 8,
    sources: {
      [STYLE_SOURCE_IDS.MAPILLARY]: {
        type: "vector",
        tiles: [vectorTileSourceUrl],
        minzoom: 0,
        maxzoom: 14,
      },
    },
    layers: layers,
  };
}
