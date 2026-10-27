/** Instance-owned idle nearby enrichment; playback and UI remain runtime-owned. */
import { GRAPH_API, TIMING } from '../../utils/constants';
import type { NearbyImage } from '../../components/types';

export interface NearbyDiscoveryDependencies {
  getState: () => { imageId: string | null; nearbyLoading?: boolean };
  update: (patch: { nearbyLoading?: boolean; nearbyImages?: NearbyImage[] }) => void;
  isPaused: () => boolean;
  getToken: () => string;
  isInitialLoad: () => boolean;
  markInitialLoadComplete: () => void;
  runBackground?: <T>(work: (signal: AbortSignal) => Promise<T>, signal?: AbortSignal) => Promise<T>;
}

export class NearbyImageDiscovery {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private controller: AbortController | null = null;
  constructor(private readonly dependencies: NearbyDiscoveryDependencies) {}

  /**
   * Schedule idle enrichment, keeping previous thumbnails and rejecting stale image results.
   * @param lat Anchor latitude in WGS84 decimal degrees.
   * @param lon Anchor longitude in WGS84 decimal degrees.
   * @param imageId Active image ID, excluded from nearby suggestions.
   */
  schedule(lat: number, lon: number, imageId: string): void {
    this.controller?.abort(); this.controller = null;
    if (this.dependencies.getState().nearbyLoading) this.dependencies.update({ nearbyLoading: false });
    // Cancel previous pending timer, user is still navigating
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const doFetch = () => {
      this.timer = null;
      if (this.dependencies.isPaused() === false || this.dependencies.getState().imageId !== imageId) return;
      // Cancel any in-flight request from a previous stop
      this.controller?.abort();
      const ctrl = new AbortController();
      this.controller = ctrl;

      // Never clear existing images, keep stale thumbnails visible during fetch
      this.dependencies.update({ nearbyLoading: true });

      const url = GRAPH_API.nearbyImages(lat, lon, 50, 21) + `&access_token=${this.dependencies.getToken()}`;

      const request = async (signal: AbortSignal) => {
        if (signal.aborted || ctrl.signal.aborted || this.controller !== ctrl ||
          this.dependencies.isPaused() === false || this.dependencies.getState().imageId !== imageId)
          throw new DOMException('Cancelled', 'AbortError');
        const response = await fetch(url, { signal });
        if (signal.aborted || ctrl.signal.aborted) throw new DOMException('Cancelled', 'AbortError');
        if (!response.ok) throw new Error("Nearby images unavailable");
        const data = await response.json();
        if (signal.aborted || ctrl.signal.aborted) throw new DOMException('Cancelled', 'AbortError');
        return data;
      };
      const run = this.dependencies.runBackground || ((work: (signal: AbortSignal) => Promise<any>) => work(ctrl.signal));
      run(request, ctrl.signal)
        .then((data) => {
          if (ctrl.signal.aborted || this.dependencies.isPaused() === false || this.dependencies.getState().imageId !== imageId || this.controller !== ctrl) return;
          const images = (Array.isArray(data.data) ? data.data as NearbyImage[] : []).filter((img) => img.id !== imageId).slice(0, 20);
          this.dependencies.update({ nearbyImages: images });
        })
        .catch(() => {
          // Aborted or network error, keep previous images
        })
        .finally(() => {
          if (this.controller !== ctrl) return;
          this.controller = null;
          if (!ctrl.signal.aborted) this.dependencies.update({ nearbyLoading: false });
        });
    };

    if (this.dependencies.isInitialLoad()) {
      // First image ever, wait for splash to finish then fetch immediately
      this.dependencies.markInitialLoadComplete();
      this.timer = setTimeout(doFetch, TIMING.SPLASH_FADE_MS + 300);
    } else {
      // Wait 1500ms after the user stops navigating before fetching
      this.timer = setTimeout(doFetch, 1500);
    }
  }

  /** Cancel owned work on navigation, playback or teardown; leave presentation state to the caller. */
  cancel(): void {
    this.cancelRequest();
    this.cancelTimer();
  }
  /** Clear pending idle work while preserving teardown ordering. */
  cancelTimer(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  /** Abort the current network request without acquiring new resources. */
  cancelRequest(): void {
    this.controller?.abort(); this.controller = null;
  }

}
