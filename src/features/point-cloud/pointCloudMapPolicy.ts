/** Plain ArcGIS-compatible display properties; no SDK constructors or live resources. */
export interface PointCloudMapSymbol {
  type: 'point-3d';
  symbolLayers: { type: 'icon'; resource: { primitive: 'circle' }; material: { color: string }; size: number; outline: { size: number } }[];
}
export interface PointCloudUniqueValue { value: string; symbol: PointCloudMapSymbol; }
export type PointCloudMapRenderer =
  | { type: 'unique-value'; field: string; uniqueValueInfos: PointCloudUniqueValue[] }
  | { type: 'simple'; symbol: PointCloudMapSymbol; visualVariables: { type: 'color'; field: string; stops: { value: number; color: string }[] }[] };
export type PointCloudLayerProperties<R> = {
  id: string; legendEnabled: boolean; title: string; visible: boolean; source: [];
  objectIdField: string; geometryType: 'point'; hasZ: boolean;
  spatialReference: { wkid: number }; elevationInfo: { mode: 'relative-to-ground'; offset: number };
  fields: { name: string; type: 'oid' | 'integer' | 'string' | 'double'; alias?: string }[];
  outFields: string[]; popupEnabled: boolean; popupTemplate: { title: string; content: string };
  renderer: R; definitionExpression: string;
};

/** Build fresh mutable renderer properties for SDK autocasting; colors retain supplied order.
 * Only 'elevation' chooses the existing relativeHeight color-variable stops. All other
 * modes retain the RGB unique-value fallback. Point size, outline and thresholds stay
 * unchanged. Geometry quantization and adaptive/ground expressions are separate policy.
 */
export function pointCloudMapRenderer(colorMode: string, colors: readonly string[]): PointCloudMapRenderer {
  const uniqueValueInfos: PointCloudUniqueValue[] = colors.map((hex) => ({
    value: hex,
    symbol: {
      type: "point-3d",
      symbolLayers: [
        {
          type: "icon",
          resource: { primitive: "circle" },
          material: { color: hex },
          size: 2.0,
          outline: { size: 0 },
        },
      ],
    },
  }));

  // Construct renderer based on selected color mode
  let activeRenderer: PointCloudMapRenderer;

  if (colorMode === "elevation") {
    activeRenderer = {
      type: "simple",
      symbol: {
        type: "point-3d",
        symbolLayers: [
          {
            type: "icon",
            resource: { primitive: "circle" },
            material: { color: "white" },
            size: 2.0,
            outline: { size: 0 },
          },
        ],
      },
      visualVariables: [
        {
          type: "color",
          field: "relativeHeight",
          stops: [
            { value: -0.5, color: "#0000FF" },
            { value: 0.0, color: "#00FFFF" },
            { value: 2.5, color: "#00FF00" },
            { value: 7.0, color: "#FFFF00" },
            { value: 15.0, color: "#FF0000" },
          ],
        },
      ],
    };
  } else {
    activeRenderer = {
      type: "unique-value",
      field: "colorCode",
      uniqueValueInfos: uniqueValueInfos,
    };
  }

  return activeRenderer;
}

/** Build the existing empty-source layer schema/popup only when a new SDK layer is needed.
 * Each call owns fresh metadata arrays/objects; the renderer itself is borrowed by identity.
 * Visibility retains the previous layer's false value and defaults nullish values to true.
 * Existing field names, aliases, popup text/whitespace and height policy are preserved;
 * the absolute-altitude alias does not establish a source datum or perform conversion.
 */
export function pointCloudMapLayerProperties<R>(activeRenderer: R, definitionExpression: string, previousVisible?: boolean): PointCloudLayerProperties<R> {
  return {
    id: "point-cloud-layer", legendEnabled: false, title: "Mapillary Point Cloud", visible: previousVisible ?? true,
    source: [],
    objectIdField: "ObjectID",
    geometryType: "point",
    hasZ: true,
    spatialReference: { wkid: 4326 },
    elevationInfo: { mode: "relative-to-ground", offset: 0.5 },
    fields: [
      { name: "ObjectID", type: "oid" },
      { name: "pointIndex", type: "integer" },
      { name: "originalIndex", type: "integer" },
      { name: "colorCode", type: "string", alias: "Hex Color" },
      { name: "relativeHeight", type: "double", alias: "Height Above Road (m)" },
      { name: "absoluteAltitude", type: "double", alias: "Sea-level Altitude (m)" },
      { name: "distanceFromCamera", type: "double", alias: "Distance from Car (m)" },
    ],
    outFields: ["*"],
    popupEnabled: true,
    popupTemplate: {
      title: "Point Cloud Node",
      content: `
                    <div style="font-size: 13px; line-height: 1.5;">
                        <b>Horizontal Distance:</b> {distanceFromCamera} m<br/>
                        <span style="font-size: 10px; color: #888; display: block; margin-top: -4px; margin-bottom: 4px;">
                            (From camera GPS origin)
                        </span>
                        <b>Height Above Road:</b> {relativeHeight} m<br/>
                        <b>Absolute Altitude:</b> {absoluteAltitude} m<br/>
                        <span style="display:none;">{originalIndex}</span>
                    </div>
                `,
    },
    renderer: activeRenderer,
    definitionExpression: definitionExpression,
  };
}
