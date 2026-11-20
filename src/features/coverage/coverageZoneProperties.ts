/** Existing coverage-analysis extent geometry and its 2D/3D presentation. */
export function coverageZoneProperties(west: number, south: number, east: number, north: number, is3D: boolean) {
  return {
    geometry: {
      type: "polygon" as const,
      rings: [
        [
          [west, south],
          [east, south],
          [east, north],
          [west, north],
          [west, south],
        ],
      ],
      spatialReference: {
        wkid: 4326,
      },
    },

    symbol: {
      type: "simple-fill" as const,

      color: is3D ? [30, 144, 255, 0.04] : [30, 144, 255, 0.14],

      outline: {
        type: "simple-line" as const,
        color: [30, 144, 255, 1],
        width: is3D ? 4 : 3,
        style: "solid" as const,
      },
    },
  };
}
