interface PointProperties { x: number; y: number; spatialReference: { wkid: number }; }
interface GraphicProperties<P> { geometry: P; symbol: object; }

export interface RoutePointGraphicInput<G, P> {
  isStart: boolean;
  is3D: boolean;
  lon: number;
  lat: number;
  Graphic: new (properties: GraphicProperties<P>) => G;
  Point: new (properties: PointProperties) => P;
}

/** Construct only; shared-view removal, registration and stored references belong to the widget. */
export function createRoutePointGraphic<G, P>({
  isStart, is3D, lon, lat, Graphic, Point,
}: RoutePointGraphicInput<G, P>): G {
  const pointColor = isStart ? [46, 204, 113, 1] : [231, 76, 60, 1]; // Green (A) / Red (B)

  const symbol = is3D
    ? {
      type: "point-3d",
      symbolLayers: [
        {
          type: "icon",
          resource: { primitive: "circle" },
          material: { color: pointColor },
          size: 16,
          outline: { color: [255, 255, 255, 1], size: 2 },
        },
      ],
      verticalOffset: { screenLength: 40, maxWorldLength: 150, minWorldLength: 10 },
      callout: { type: "line", size: 2, color: pointColor, border: { color: [0, 0, 0, 0.4] } },
    }
    : {
      type: "simple-marker",
      style: "circle",
      color: pointColor,
      size: 12,
      outline: { color: [255, 255, 255, 1], width: 2 },
    };

  return new Graphic({
    geometry: new Point({ x: lon, y: lat, spatialReference: { wkid: 4326 } }),
    symbol,
  });
}
