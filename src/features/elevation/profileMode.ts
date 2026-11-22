interface ProfileModeImage { id: string; lon: number; lat: number; }

/** React scheduling, route/profile ownership, feedback and map drawing stay host-bound. */
export interface ProfileModeHost {
  enabled(): boolean;
  active(): boolean;
  setActive(active: boolean, callback: () => void): void;
  resetRouteFailure(): void;
  update(): void;
  complete(): boolean;
  notify(complete: boolean): void;
  clear(): void;
  state(): { imageId: string | null; sequenceImages: readonly ProfileModeImage[] };
  coneLength(): number;
  coneSpread(): number;
  bearing(): number;
  clearCone(): void;
  drawCone(lon: number, lat: number, bearing: number, length: number, spread: number): void;
}

/** Toggle the profile using the captured click-time target, then redraw its current cone.
 * Start route/profile work without awaiting it; feedback reads route readiness afterward.
 */
export async function toggleProfileMode(host: ProfileModeHost): Promise<void> {
  if (!host.enabled()) return;
  const next = !host.active();
  host.setActive(next, () => {
    if (next) {
      host.resetRouteFailure();
      host.update();
      host.notify(host.complete());
    } else {
      host.clear();
    }
    const { imageId, sequenceImages } = host.state();
    if (imageId && sequenceImages.length > 0) {
      const activeImg = sequenceImages.find(image => image.id === imageId);
      if (activeImg) {
        const length = host.coneLength();
        const spread = host.coneSpread();
        host.clearCone();
        host.drawCone(activeImg.lon, activeImg.lat, host.bearing() || 0, length, spread);
      }
    }
  });
}
