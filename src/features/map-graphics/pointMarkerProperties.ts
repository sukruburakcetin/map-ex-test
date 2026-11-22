/** Pure property construction; ArcGIS allocation and resource ownership stay with the caller. */
export function legacySequencePointProperties(lon: number, lat: number, color: unknown, is3D: boolean, sequenceId?: string, imageId?: string) {
  return {
    geometry: {
      type: "point",
      longitude: lon,
      latitude: lat,
      spatialReference: { wkid: 4326 },
    },
    symbol: is3D ? {
      type: "point-3d", disableDepthTestDistance: Number.POSITIVE_INFINITY,
      verticalOffset: { screenLength: 1, minWorldLength: 0.05, maxWorldLength: 0.05 },
      symbolLayers: [{ type: "icon", resource: { primitive: "circle" }, material: { color }, size: 7, outline: { color: "#e3da30", size: 1 } }],
    } : {
      type: "simple-marker",
      style: "circle",
      color: color,
      size: 7,
      outline: { color: "#e3da30", width: 1 },
    },
    attributes: sequenceId ? { sequenceId: sequenceId, image_id: imageId } : undefined,
  };
}

/** Build the existing black clicked-location marker with fresh nested properties. */
export function clickedLocationPointProperties(lon: number, lat: number) {
  return {
    geometry: {
      type: "point",
      longitude: lon,
      latitude: lat,
      spatialReference: { wkid: 4326 },
    },
    symbol: {
      type: "simple-marker",
      style: "circle",
      color: "black",
      size: 5,
      outline: { color: "white", width: 2 },
    },
    attributes: { isClickedLocation: true },
  };
}
