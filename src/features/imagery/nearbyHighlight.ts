/** Nearby thumbnail pin and direction-cone presentation; no requests or playback state. */
import { calculateBearing, createConeGeometry } from '../../utils/geoUtils';
import type { NearbyImage } from '../../components/types';

type HighlightView<G> = { graphics: { add(graphic: G): unknown; remove(graphic: G): unknown } };
type HighlightState = { imageId: string | null; sequenceImages: { id: string; lat: number; lon: number }[] };
type HighlightModules<G> = { Graphic: new (properties: any) => G };

export class NearbyImageHighlight<G> {
  private pin: G | null = null;
  private direction: G | null = null;

  /** Replace the hover pin/cone using WGS84 positions; null clears both graphics. */
  update(view: HighlightView<G> | undefined, modules: HighlightModules<G> | null, state: HighlightState, img: NearbyImage | null): void {
    if (!view || !modules) return;

    // Remove previous pin and direction cone
    if (this.pin) {
      view.graphics.remove(this.pin);
      this.pin = null;
    }
    if (this.direction) {
      view.graphics.remove(this.direction);
      this.direction = null;
    }

    if (!img) return;

    const [lon, lat] = img.geometry.coordinates;
    const { Graphic } = modules;

    // 1. Yellow dot at hovered image position
    this.pin = new Graphic({
      geometry: {
        type: "point",
        longitude: lon,
        latitude: lat,
        spatialReference: { wkid: 4326 },
      },
      symbol: {
        type: "simple-marker",
        style: "circle",
        color: [255, 200, 0, 0.95],
        size: 12,
        outline: { color: [255, 255, 255, 1], width: 2 },
      },
    });
    view.graphics.add(this.pin);

    // 2. Direction cone, get current camera position from sequenceImages
    // (_cameraLat/_cameraLon are only populated during point cloud sessions)
    const { imageId, sequenceImages } = state;
    const activeImg = imageId ? sequenceImages.find((s) => s.id === imageId) : null;

    const fromLat = activeImg?.lat ?? 0;
    const fromLon = activeImg?.lon ?? 0;

    if (!fromLat || !fromLon) return;

    // Calculate bearing FROM hovered image TOWARD current camera position.
    // This shows which direction the hovered image points back at you,
    // giving a sense of what you would see if you jumped to it.
    const bearing = calculateBearing(lat, lon, fromLat, fromLon);

    const coneGeom = createConeGeometry(lon, lat, bearing, 10, 60);

    this.direction = new Graphic({
      geometry: coneGeom,
      symbol: {
        type: "simple-fill",
        color: [50, 205, 50, 0.9],
        outline: {
          color: [255, 200, 0, 0.9],
          width: 3,
        },
      } as any,
    });
    view.graphics.add(this.direction);
  }
}
