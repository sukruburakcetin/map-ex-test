interface ImageLocation {
  lon: number;
  lat: number;
}

interface TransitionViewer {
  getBearing(): Promise<number>;
  getCenter(): Promise<number[]>;
  getImage(): Promise<{ id: string }>;
  remove(): void;
}

interface FullscreenTransitionHost<View> {
  readonly fullscreen: boolean;
  readonly imageId: string | null;
  imageLocation(imageId: string): ImageLocation | undefined;
  readonly container: HTMLElement | null;
  readonly minimapOpen: boolean;
  readonly mapView: View | undefined;
  bearing: number;
  viewer: TransitionViewer | null;
  prepareEntry(): void;
  clearMapFeedback(): void;
  destroyMinimap(): void;
  detachViewerTools(): void;
  commitLayout(fullscreen: boolean, restore: () => Promise<void>): void;
  createViewer(container: HTMLElement, imageId: string): void;
  bindViewer(): void;
  restoreMapFeedback(location: ImageLocation, bearing: number): void;
  restoreViewerTools(imageId: string, center?: [number, number]): void;
  createMinimap(): void;
  centerMap(view: View, location: ImageLocation): PromiseLike<unknown>;
  reportMapCentered(location: ImageLocation): void;
  finishExit(): void;
}

const wait = (milliseconds: number) => new Promise<void>(resolve => setTimeout(resolve, milliseconds));

async function readCenter(viewer: TransitionViewer, imageId: string): Promise<[number, number] | undefined> {
  try {
    const [image, [x, y]] = await Promise.all([viewer.getImage(), viewer.getCenter()]);
    if (String(image.id) === imageId && Number.isFinite(x) && Number.isFinite(y)) return [x, y];
  } catch {
    // The viewer may not have a confirmed image yet.
  }
}

/** Move between the embedded and portal mounts using the existing viewer recreation path. */
export async function transitionFullscreen<View>(host: FullscreenTransitionHost<View>): Promise<void> {
  const entering = !host.fullscreen;
  if (entering) host.prepareEntry();

  let bearing = host.bearing || 0;
  const imageId = host.imageId;
  let center: [number, number] | undefined;
  const location = imageId ? host.imageLocation(imageId) : undefined;
  host.clearMapFeedback();

  if (!entering && host.minimapOpen) {
    host.destroyMinimap();
    await wait(200);
  }

  if (host.viewer) {
    try {
      const outgoing = host.viewer;
      const [value, pose] = await Promise.all([
        outgoing.getBearing().catch(() => undefined),
        imageId ? readCenter(outgoing, imageId) : undefined,
      ]);
      if (host.viewer !== outgoing || host.imageId !== imageId) return;
      if (typeof value === 'number' && Number.isFinite(value)) {
        bearing = value;
        host.bearing = value;
      }
      center = pose;

      host.detachViewerTools();
      outgoing.remove();
      await wait(100);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if ((error as { name?: string }).name !== 'CancelMapillaryError' && !message.includes('aborted')) {
        console.warn('Error removing viewer:', error);
      }
    }
    host.viewer = null;
  }

  // React owns this callback. The toggle promise completes after scheduling it.
  host.commitLayout(entering, async () => {
    await wait(50);
    const container = host.container;
    if (container && imageId) {
      host.createViewer(container, imageId);
      host.bearing = bearing;
      host.bindViewer();
      if (location) host.restoreMapFeedback(location, bearing);
      host.restoreViewerTools(imageId, center);

      if (host.fullscreen) {
        setTimeout(() => {
          if (host.fullscreen) host.createMinimap();
        }, 300);
      }

      const view = host.fullscreen ? undefined : host.mapView;
      if (view && location) {
        await wait(200);
        await host.centerMap(view, location);
        host.reportMapCentered(location);
      }
    }
    if (!host.fullscreen) host.finishExit();
  });
}
