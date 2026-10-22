/** Pulsing navigation-target marker, matching minimap marker and interval lifetime. */
export interface DirectionMarkerGraphic { symbol: any; }
export interface DirectionMarkerView<G> {
  type: string;
  graphics: { add(graphic: G): unknown; remove(graphic: G): unknown };
}
export interface DirectionMarkerMinimap<G> {
  graphics: { forEach(callback: (graphic: G) => void): void };
  add(graphic: G): unknown;
  remove(graphic: G): unknown;
}
export interface DirectionMarkerHost<G> {
  getView(): DirectionMarkerView<G> | null | undefined;
  getMinimap(): DirectionMarkerMinimap<G> | null;
  createGraphic(properties: any): G;
  setInterval(callback: () => void, milliseconds: number): ReturnType<typeof setInterval>;
  clearInterval(handle: ReturnType<typeof setInterval>): void;
}

/** Owns the yellow direction-hover visuals; coordinate lookup and hover identity stay host-owned.
 * Preserves the 60 ms interval, 16–20 px pulse, 3D lift/callout and tagged minimap cleanup.
 * The host readers retain the existing cleanup policy of using the currently active view/layer.
 */
export class DirectionHoverMarker<G extends DirectionMarkerGraphic> {
  graphic: G | null = null;
  private readonly host: DirectionMarkerHost<G>;
  constructor(host: DirectionMarkerHost<G>) { this.host = host; }
  private get minimapGraphicsLayer(): DirectionMarkerMinimap<G> | null { return this.host.getMinimap(); }

  /** Draw a WGS84 navigation target after the host has resolved its coordinates.
   * Replaces the previous marker and timer; no image requests or subscriptions are created here.
   */
  draw(view: DirectionMarkerView<G>, hoveredImg: { id: string; lon: number; lat: number }): void {
    // Remove any existing highlight before drawing a new one
    this.clear();
    const is3D = view.type === "3d";

    const geometry = {
      type: "point",
      longitude: hoveredImg.lon,
      latitude: hoveredImg.lat,
      spatialReference: { wkid: 4326 },
    };

    // Helper function to create the correct symbol for 2D or 3D
    const getSymbol = (currentSize: number) => {
      if (is3D) {
        return {
          type: "point-3d",

          /*
           * Keep the hover marker visible while the
           * SceneView camera rotates / changes pitch.
           */
          disableDepthTestDistance: Number.POSITIVE_INFINITY,

          symbolLayers: [
            {
              type: "icon",

              /*
               * JSAPI native visibility behavior.
               * Same fix used by the green pulse.
               */
              occludedVisibility: {
                mode: "visible",
              },

              resource: {
                primitive: "circle",
              },

              material: {
                color: [255, 255, 0, 0.8],
              },

              outline: {
                color: [255, 165, 0, 1],
                size: 2,
              },

              size: currentSize,
            },
          ],

          /*
           * Keep your existing lifted hover design.
           * Unlike the green point, this is already
           * sufficiently undraped from the ground.
           */
          verticalOffset: {
            screenLength: 45,
            maxWorldLength: 100,
            minWorldLength: 5,
          },

          callout: {
            type: "line",
            size: 2,
            color: [255, 165, 0, 1],

            border: {
              color: [0, 0, 0, 0.3],
            },
          },
        };
      } else {
        // Standard 2D rendering
        return {
          type: "simple-marker",
          style: "circle",
          color: [255, 255, 0, 0.8],
          size: currentSize,
          outline: { color: [255, 165, 0, 1], width: 3 },
        };
      }
    };

    const graphic = this.host.createGraphic({
      geometry: geometry,
      symbol: getSymbol(16) as any,
    });

    view.graphics.add(graphic);
    this.graphic = graphic;

    // Also add a simple yellow marker to the minimap so the hover is visible there too
    if (this.minimapGraphicsLayer) {
      const minimapHoverGraphic = this.host.createGraphic({
        geometry: geometry,
        symbol: {
          type: "simple-marker",
          style: "circle",
          color: [255, 255, 0, 0.85],
          size: 12,
          outline: { color: [255, 165, 0, 1], width: 2 },
        } as any,
      });
      (minimapHoverGraphic as any).__isDirectionHover = true;
      this.minimapGraphicsLayer.add(minimapHoverGraphic);
    }

    // Pulse animation state
    let growing = true;
    let size = 16;

    // Creates a pulsing effect by oscillating marker size
    const pulseInterval = this.host.setInterval(() => {
      if (!this.graphic) {
        this.host.clearInterval(pulseInterval);
        return;
      }

      size += growing ? 0.5 : -0.5;
      if (size >= 20) growing = false;
      if (size <= 16) growing = true;

      this.graphic.symbol = getSymbol(size) as any;
    }, 60);

    // Store interval reference for cleanup
    (graphic as any)._pulseInterval = pulseInterval;
  }

  /** Stop the active pulse, remove the map graphic and remove tagged minimap markers only.
   * Repeated clears are harmless; unrelated minimap graphics remain untouched.
   */
  clear(): void {
    if (this.graphic) {
      // Stop pulse animation
      if ((this.graphic as any)._pulseInterval) {
        this.host.clearInterval((this.graphic as any)._pulseInterval);
      }
      // Remove graphic from the map view
      const view = this.host.getView();
      if (view) {
        view.graphics.remove(this.graphic);
      }
      // Remove from minimap too
      if (this.minimapGraphicsLayer) {
        const toRemove: G[] = [];
        this.minimapGraphicsLayer.graphics.forEach((g: G) => {
          if ((g as any).__isDirectionHover) toRemove.push(g);
        });
        toRemove.forEach((g) => this.minimapGraphicsLayer!.remove(g));
      }
      this.graphic = null;
    }
  }
}
