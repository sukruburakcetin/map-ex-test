/** Click-ripple graphics and animation-frame owner; no image loading or playback scheduling. */
export interface RippleView<G> {
 type: string;
 destroyed?: boolean;
 graphics: { add(graphic: G): unknown; remove(graphic: G): unknown };
}
export interface RippleClock {
 request(callback: FrameRequestCallback): number;
 cancel(frame: number): void;
 now(): number;
}

export class ClickRippleAnimations<G extends { symbol: any }, V extends RippleView<G>> {
 private readonly animations = new Map<G, { view: V; frame: number }>();
 private readonly readView: () => V | undefined;
 private readonly createGraphic: (properties: any) => G;
 private readonly clock: RippleClock;

 constructor(readView: () => V | undefined, createGraphic: (properties: any) => G, clock: RippleClock) {
  this.readView = readView; this.createGraphic = createGraphic; this.clock = clock;
 }

 /** Number of retained ripple graphics; bounded at four during rapid input. */
 get size(): number { return this.animations.size; }

 /** Animate a WGS84 click marker with the existing 650 ms easing and in-place symbol updates.
  * Evict the oldest ripple at capacity; remove finished or obsolete-view graphics immediately.
  * RGB values, initial alpha and outline width are forwarded without normalization.
  */
 draw(lon: number, lat: number, rgb: [number, number, number] = [255, 0, 0], initialAlpha = 0.5, outlineWidth = 1) {
    const view = this.readView();
    if (!view || !Number.isFinite(lon) || !Number.isFinite(lat)) return;
    // Bound rapid clicks; all remaining frames are cancelled on view/widget cleanup.
    while (this.animations.size >= 4) {
      const oldest = this.animations.entries().next().value!;
      this.clock.cancel(oldest[1].frame); oldest[1].view.graphics.remove(oldest[0]); this.animations.delete(oldest[0]);
    }
    const graphic = this.createGraphic({
      geometry: { type: "point", longitude: lon, latitude: lat, spatialReference: { wkid: 4326 } },
      symbol: view.type === "3d" ? { type: "point-3d", disableDepthTestDistance: Number.POSITIVE_INFINITY,
        verticalOffset: { screenLength: 1, minWorldLength: 0.05, maxWorldLength: 0.05 },
        symbolLayers: [{ type: "icon", resource: { primitive: "circle" }, size: 4,
          material: { color: [...rgb, initialAlpha] }, outline: { color: [...rgb, initialAlpha], size: outlineWidth } }],
      } : { type: "simple-marker", style: "circle", size: 4, color: [...rgb, initialAlpha], outline: { color: [...rgb, initialAlpha], width: outlineWidth } },
    });
    (graphic as any).__isClickRipple = true;
    view.graphics.add(graphic);
    const animation = { view, frame: 0 }; this.animations.set(graphic, animation);
    const started = this.clock.now();
    const animate = (now: number) => {
      if (!this.animations.has(graphic)) return;
      const progress = Math.min(1, Math.max(0, (now - started) / 650));
      if (progress === 1 || view.destroyed || this.readView() !== view) {
        view.graphics.remove(graphic); this.animations.delete(graphic); return;
      }
      const eased = 1 - Math.pow(1 - progress, 3);
      const color = [...rgb, initialAlpha * Math.pow(1 - progress, 2)];
      const symbol = graphic.symbol as any;
      if (view.type === "3d") {
        const icon = symbol.symbolLayers.getItemAt?.(0) || symbol.symbolLayers[0];
        icon.size = 4 + 36 * eased; icon.material.color = color; icon.outline.color = color;
      } else { symbol.size = 4 + 36 * eased; symbol.color = color; symbol.outline.color = color; }
      animation.frame = this.clock.request(animate);
    };
    animation.frame = this.clock.request(animate);
  }

 /** Cancel all retained frames and remove each graphic from its original view. Repeat safe. */
 dispose() {
    this.animations.forEach((animation, graphic) => {
      this.clock.cancel(animation.frame); animation.view?.graphics?.remove(graphic);
    });
    this.animations.clear();
  }
}
