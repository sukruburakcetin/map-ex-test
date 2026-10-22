import { GRAPH_API } from '../../utils/constants';

/** Navigation image coordinates are WGS84 decimal degrees. */
export interface DirectionHoverImage { id: string; lon: number; lat: number; }
export interface DirectionHoverState {
  sequenceImages: readonly DirectionHoverImage[];
  availableSequences?: readonly { sequenceId: string; images: readonly DirectionHoverImage[] }[];
}
export interface DirectionHoverDiscoveryHost {
  getState(): DirectionHoverState;
  getToken(): string;
  hasMarker(): boolean;
  clearMarker(): void;
  drawMarker(image: DirectionHoverImage): void;
  log(...args: any[]): void;
  fetch: typeof fetch;
}

/** Owns navigation-target identity, lookup order and the instance coordinate cache.
 * Runtime keeps SDK readiness and event subscriptions; marker rendering has its own owner.
 * Existing request count/timing and stale-result rules are preserved: no new debounce,
 * aborts, retries or cache eviction are introduced by this structural extraction.
 */
export class DirectionHoverDiscovery {
  private hoveredId: string | null = null;
  private readonly coordinates: Record<string, { lon: number; lat: number }> = {};
  private readonly host: DirectionHoverDiscoveryHost;
  constructor(host: DirectionHoverDiscoveryHost) { this.host = host; }

  /** Resolve one hover using active sequence, other loaded sequences, cache, then API.
   * An unchanged ID with a visible marker does no work; mouseout clears the marker.
   */
  handle(hoveredId: string | null): void {
    // Prevent redundant animation restarts
    // If the ID hasn't changed and we are already showing a graphic, do nothing.
    if (this.hoveredId === hoveredId && this.host.hasMarker()) {
      return;
    }
    this.hoveredId = hoveredId;

    // Clear previous hover graphic
    this.host.clearMarker();

    if (!hoveredId) return;

    const state = this.host.getState();
    // Search strategy:
    let hoveredImg: { id: string; lon: number; lat: number } | undefined;

    // Strategy 1: Current active sequence
    hoveredImg = state.sequenceImages.find((img) => img.id === hoveredId);

    // Strategy 2: Search in all available sequences
    if (!hoveredImg && state.availableSequences && state.availableSequences.length > 0) {
      for (const seq of state.availableSequences) {
        hoveredImg = seq.images.find((img) => img.id === hoveredId);
        if (hoveredImg) {
          this.host.log(`Found hover target in sequence: ${seq.sequenceId}`);
          break;
        }
      }
    }

    if (!hoveredImg && this.coordinates[hoveredId]) {
      hoveredImg = {
        id: hoveredId,
        ...this.coordinates[hoveredId],
      };
    }

    // Strategy 3: Fetch from API if not found locally
    if (!hoveredImg) {
      this.host.log(`Image not in loaded sequences, fetching from API: ${hoveredId}`);
      this.fetchAndHighlightImage(hoveredId);
      return;
    }

    this.host.drawMarker(hoveredImg);
  }

  /** Fetch only id/geometry, cache successful coordinates, and draw only a still-hovered ID.
   * Responses for previous targets warm the existing cache but cannot draw a stale marker.
   * Failures retain the existing warning/error messages and do not retry automatically.
   */
  async fetchAndHighlightImage(imageId: string): Promise<void> {
    try {
      const response = await this.host.fetch(`${GRAPH_API.BASE}/${imageId}?fields=id,geometry`, { headers: { Authorization: `OAuth ${this.host.getToken()}` } });

      if (!response.ok) {
        console.warn(`Failed to fetch image ${imageId}`);
        return;
      }

      const data = await response.json();
      const coords = data.geometry?.coordinates;

      if (!coords) {
        console.warn(`No coordinates for image ${imageId}`);
        return;
      }

      const hoveredImg = {
        id: imageId,
        lon: coords[0],
        lat: coords[1],
      };
      // Cache image coordinates for future hover events
      this.coordinates[imageId] = { lon: hoveredImg.lon, lat: hoveredImg.lat };

      if (this.hoveredId === imageId) {
        this.host.drawMarker(hoveredImg);
      } else {
        this.host.log(`Hover changed during fetch, discarding: ${imageId}`);
      }
    } catch (error) {
      console.error(`Error fetching image ${imageId}:`, error);
    }
  }
}
