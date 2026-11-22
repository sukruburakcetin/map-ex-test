import { trackViewerImage, type ViewerImageTrackingHost } from './viewerImageTracking';
import type { LiveSequenceFrames } from './LiveSequenceFrames';
import type { SequenceCoordinate } from './sequenceCoordinates';

/** SDK components expose legacy zoom/keyboard capabilities dynamically; only these events are registered here. */
export interface EventViewer {
  on(type: 'load' | 'bearing' | 'image', callback: (event: any) => void): unknown;
  getComponent(name: string): any;
}
export interface EventView { type: string; stationary?: boolean; }
type BearingUrlUpdate = (() => void) & { cancel?: () => void };

/** Live event policy capabilities. Existing widget/feature owners keep cancellation slots and cleanup. */
export interface ViewerEventsHost<Viewer extends EventViewer, View extends EventView> {
  readonly viewer: Viewer | null;
  readonly view: View | undefined;
  readonly syncMap: boolean | undefined;
  readonly sequenceImages: SequenceCoordinate[];
  readonly imageId: string | null;
  readonly turbo: boolean;
  readonly selectedSequence: string | null;
  readonly syncHeading: boolean;
  readonly locked: boolean;
  readonly bearing: { invalidate(): void; read(viewer: Viewer | null, image: string | null): number | undefined; refresh(viewer: Viewer | null): unknown } | null;
  readonly flying: boolean;
  readonly frames: Pick<LiveSequenceFrames, 'find' | 'current'>;
  lastBearing: number;
  readonly coneLengths: readonly number[];
  readonly coneSpreads: readonly number[];
  zoomStep: number;
  readonly sharedBearing: number | null;
  coneRaf: number | null;
  bearingUrl: BearingUrlUpdate;
  container(): HTMLElement | null;
  debounce(work: () => void, milliseconds: number): BearingUrlUpdate;
  bindPlayback(): void;
  clearGreenPulse(): void;
  clearConeGraphics(): void;
  updateUrlWithCurrentImage(id: string, lat: number, lon: number): void;
  drawCone(lon: number, lat: number, bearing: number, length: number, spread: number): void;
  setupDirectionHover(): void;
  updateMinimapTracking(): void;
  navigateMapView(view: View, target: { heading: number; center?: number[] }, options: { animate: false }): unknown;
  imageTrackingHost(): ViewerImageTrackingHost<Viewer, View>;
}

/** Register viewer load/bearing/image policy without changing callback order, guards or scheduler timing.
 * Existing playback, bearing, frame and widget cleanup owners retain resource lifetime.
 */
export function bindViewerEvents<Viewer extends EventViewer, View extends EventView>(host: ViewerEventsHost<Viewer, View>): void {

  const profileEventViewer = host.viewer;
  if (!host.viewer) return;
  host.bearing?.invalidate();

  // Clear any existing green pulse before binding new events
  host.clearGreenPulse();

  // Also clear any existing cone graphics
  host.clearConeGraphics();

  // Debounced URL bearing update, rebuilds on every bindMapillaryEvents call
  // so it always closes over the latest imageId/lat/lon from state
  host.bearingUrl = host.debounce(() => {
    // Skip while fly-in is active, Mapillary keeps firing bearing events
    // as it transitions to the image's natural compass angle, which would
    // overwrite the shared bearing in the URL before the user even sees it.
    if (host.flying) return;
    const imageId = host.imageId;
    const sequenceImages = host.sequenceImages;
    if (!imageId) return;
    const img = host.frames.find(imageId) || sequenceImages.find((s) => s.id === imageId);
    if (img) host.updateUrlWithCurrentImage(imageId, img.lat, img.lon);
  }, 600);

  // Define local redraw helper, pass specific coordinates
  const redrawCone = (lon?: number, lat?: number) => {
    const view = host.view;
    if (!view) return;

    // If Turbo Mode is active and no specific sequence is selected,
    // we should not draw the camera cone.
    if (host.turbo && !host.selectedSequence) {
      host.clearConeGraphics();
      return;
    }

    // If no coordinates provided, get from current image
    if (lon === undefined || lat === undefined) {
      const currentId = host.imageId;
      if (!currentId) return;
      const img = host.frames.current || host.frames.find(currentId);
      if (!img) return;
      lon = img.lon;
      lat = img.lat;
    }

    // Bearing events already supply the latest bearing. Never await per redraw.
    const bearing = host.lastBearing || 0;

    const length = host.coneLengths[host.zoomStep];
    const spread = host.coneSpreads[host.zoomStep];

    // drawCone() already clears the previous cone internally
    host.drawCone(lon, lat, bearing, length, spread);
  };

  // 1. Viewer Load Event
  host.viewer!.on("load", () => {
    // Zoom component logic
    const zoomComponent: any = host.viewer!.getComponent("zoom");
    if (zoomComponent && zoomComponent._zoomDelta$) {
      zoomComponent._zoomDelta$.subscribe((delta: number) => {
        if (delta > 0 && host.zoomStep < host.coneSpreads.length - 1) {
          host.zoomStep++;
        } else if (delta < 0 && host.zoomStep > 0) {
          host.zoomStep--;
        }
        redrawCone();
      });
    }

    // Disable Keyboard Zoom
    const keyboardComponent: any = host.viewer!.getComponent("keyboard");
    if (keyboardComponent?.keyZoom) {
      keyboardComponent.keyZoom.disable();
    }

    // Custom Wheel Logic
    if (host.container()) {
      host.container()!.onwheel = (evt: WheelEvent) => {
        evt.preventDefault();
        if (evt.deltaY < 0) {
          host.zoomStep = Math.min(host.zoomStep + 1, host.coneSpreads.length - 1);
        } else {
          host.zoomStep = Math.max(host.zoomStep - 1, 0);
        }
        redrawCone();
      };
    }

    // Bearing readiness is image-scoped; a load-time snapshot can belong to an older camera.
    redrawCone();

    // Bind native playing events and pause-intent listeners through one lifecycle owner.
    host.bindPlayback();
  });

  // Setup Direction Component Hover with delay
  setTimeout(() => {
    host.setupDirectionHover();
  }, 500); // 500ms delay to ensure component is loaded

  // 2. Bearing Change Event
  host.viewer!.on("bearing", (event: any) => {
    if (host.viewer !== profileEventViewer) return;
    // The SDK audits this event; its payload can precede the current image's camera.
    host.lastBearing = host.sharedBearing ?? host.bearing?.read(profileEventViewer, host.imageId) ?? host.lastBearing;
    host.bearing?.refresh(profileEventViewer);

    /**
     * Cone drawing in SceneView is relatively expensive.
     *
     * Mapillary can emit several bearing events before the browser
     * has rendered the next frame. Instead of rebuilding the cone
     * for every single event, collapse them into one redraw per frame.
     *
     * The most recent bearing is always kept in host.lastBearing.
     */
    if (host.coneRaf == null) {
      host.coneRaf = requestAnimationFrame(() => {
        host.coneRaf = null;

        redrawCone();
        host.updateMinimapTracking();
      });
    }

    // Debounced URL update
    host.bearingUrl();

    const view = host.view;

    if (view && view.type === "3d" && host.syncMap === true && !host.flying && host.syncHeading && (host.locked || view.stationary !== false)) {
      const activeImg = host.frames.current || host.frames.find(host.imageId);

      if (activeImg && host.locked) {
        host.navigateMapView(view,
          {
            center: [activeImg.lon, activeImg.lat],
            heading: event.bearing,
          },
          {
            animate: false,
          },
        );
      } else {
        host.navigateMapView(view,
          {
            heading: event.bearing,
          },
          {
            animate: false,
          },
        );
      }
    }
  });

  // 3. Image Change Event
  const imageTrackingHost = host.imageTrackingHost();
  host.viewer!.on("image", event => trackViewerImage(event, profileEventViewer, redrawCone, imageTrackingHost));

}
