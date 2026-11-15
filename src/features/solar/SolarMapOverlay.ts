/** Solar map-layer lifetime, update generation, beam/shadow geometry and symbols. */
export interface SolarMap<L> {
  layers: { includes(layer: L): boolean; length: number };
  add(layer: L): unknown;
  remove(layer: L): unknown;
  reorder(layer: L, index: number): unknown;
}
export interface SolarMapView<L> { map?: SolarMap<L> | null; }
export interface SolarLayer { add(graphic: any): unknown; removeAll(): void; destroy(): void; }

export class SolarMapOverlay<L extends SolarLayer, V extends SolarMapView<L>> {
  layer: L | null = null;
  view: V | null = null;
  revision = 0;

  /** Record the creating view before constructing the original ground-draped solar layer. */
  create(view: V, createLayer: (properties: any) => L): void {
    this.view = view;
    this.layer = createLayer({ id: 'solar-layer', title: 'Mapillary Solar and Shadow Modeling', elevationInfo: { mode: 'on-the-ground' } });
  }

  /** Prepare the existing layer using the map captured before SDK loading, preserving attachment order. */
  prepare(map: SolarMap<L> | null | undefined): void {
    const layer = this.layer!;
    if (!map!.layers.includes(layer)) map!.add(layer);
    map!.reorder(layer, map!.layers.length);
    layer.removeAll();
  }

  /** Render the existing five beam/shadow graphics into the prepared solar layer.
   * Image coordinates are WGS84 degrees; solar azimuth/altitude are degrees.
   * Retains the 6 m clearance, 14–32 m shadow clamp and 24 m sun-vector endpoint,
   * along with the original symbols, label order and per-update graphic creation.
   * Call prepare first; horizon/timestamp checks remain in runtime orchestration.
   */
  renderVectors(currentImg: { lon: number; lat: number }, sun: { azimuth: number; altitude: number },
    createGraphic: (properties: any) => any): void {
    const metersToDegreesLat = (m: number) => m / 111320;
    const metersToDegreesLon = (m: number, refLat: number) => m / (111320 * Math.cos((refLat * Math.PI) / 180));

    // CLEARANCE BUBBLE: Start vectors 6m away from car so the green pulsing point is 100% unobstructed
    const innerGap = 6;

    // COMPACT SHADOW MATH:
    // Modeled on vehicle height (2m) instead of a 5m pole, clamped between 14m and 32m
    const radAlt = sun.altitude * (Math.PI / 180);
    const realShadowLen = 2.0 / Math.tan(radAlt);
    const shadowDist = Math.min(Math.max(realShadowLen, 14), 32);
    const shadowAzimuth = (sun.azimuth + 180) % 360;
    const radShadowAz = shadowAzimuth * (Math.PI / 180);

    // Shadow points: starts 6m outside car, ends at (6 + shadowDist)m
    const shadowStartLon = currentImg.lon + metersToDegreesLon(innerGap * Math.sin(radShadowAz), currentImg.lat);
    const shadowStartLat = currentImg.lat + metersToDegreesLat(innerGap * Math.cos(radShadowAz));
    const shadowEndLon = currentImg.lon + metersToDegreesLon((innerGap + shadowDist) * Math.sin(radShadowAz), currentImg.lat);
    const shadowEndLat = currentImg.lat + metersToDegreesLat((innerGap + shadowDist) * Math.cos(radShadowAz));

    // COMPACT SUN BEAM:
    // Points toward sun, starts 6m outside car, ends at 24m
    const radSunAz = sun.azimuth * (Math.PI / 180);
    const sunStartLon = currentImg.lon + metersToDegreesLon(innerGap * Math.sin(radSunAz), currentImg.lat);
    const sunStartLat = currentImg.lat + metersToDegreesLat(innerGap * Math.cos(radSunAz));
    const sunEndLon = currentImg.lon + metersToDegreesLon((innerGap + 18) * Math.sin(radSunAz), currentImg.lat);
    const sunEndLat = currentImg.lat + metersToDegreesLat((innerGap + 18) * Math.cos(radSunAz));

    // A. SHADOW VECTOR: Subtle white halo + dark dashed core
    this.layer!.add(
      createGraphic({
        geometry: {
          type: "polyline",
          paths: [
            [
              [shadowStartLon, shadowStartLat],
              [shadowEndLon, shadowEndLat],
            ],
          ],
          spatialReference: { wkid: 4326 },
        },
        symbol: { type: "simple-line", color: [255, 255, 255, 0.85], width: 5 } as any,
      }),
    );
    this.layer!.add(
      createGraphic({
        geometry: {
          type: "polyline",
          paths: [
            [
              [shadowStartLon, shadowStartLat],
              [shadowEndLon, shadowEndLat],
            ],
          ],
          spatialReference: { wkid: 4326 },
        },
        symbol: { type: "simple-line", color: [30, 30, 30, 0.95], width: 2.5, style: "dash" } as any,
      }),
    );

    // B. SHADOW LABEL (Small, crisp, unobtrusive)
    this.layer!.add(
      createGraphic({
        geometry: { type: "point", longitude: shadowEndLon, latitude: shadowEndLat, spatialReference: { wkid: 4326 } },
        symbol: {
          type: "text",
          text: `🌑 ${Math.round(shadowAzimuth)}°`,
          color: [30, 30, 30, 1],
          haloColor: [255, 255, 255, 1],
          haloSize: 1.5,
          font: { size: 8, weight: "bold" },
        } as any,
      }),
    );

    // C. SUN BEAM (Clean golden line)
    this.layer!.add(
      createGraphic({
        geometry: {
          type: "polyline",
          paths: [
            [
              [sunStartLon, sunStartLat],
              [sunEndLon, sunEndLat],
            ],
          ],
          spatialReference: { wkid: 4326 },
        },
        symbol: { type: "simple-line", color: [255, 200, 0, 0.9], width: 2.5 } as any,
      }),
    );

    // D. SUN LABEL
    this.layer!.add(
      createGraphic({
        geometry: { type: "point", longitude: sunEndLon, latitude: sunEndLat, spatialReference: { wkid: 4326 } },
        symbol: {
          type: "text",
          text: `☀️ ${Math.round(sun.azimuth)}°`,
          color: [220, 140, 0, 1],
          haloColor: [255, 255, 255, 1],
          haloSize: 1.5,
          font: { size: 8, weight: "bold" },
        } as any,
      }),
    );

  }

  /** Invalidate pending updates, release the layer from its creating view and return the lighting owner.
   * The runtime uses the returned view to restore native lighting and remove its ShadowCast widget.
   */
  clear(fallbackView: V | undefined): V | undefined {
    ++this.revision;
    const ownerView = this.view || fallbackView;
    if (this.layer) {
      ownerView?.map?.remove(this.layer);
      this.layer.destroy(); this.layer = null;
    }
    this.view = null;
    return ownerView;
  }
}

