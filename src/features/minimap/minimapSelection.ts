import { distanceMeters } from "../../utils/geoUtils";

interface MinimapImage { id: string; lat: number; lon: number; }
interface DiscoveryChoice { seqId: string; imgId: string; dist: number; }

/** Current-sequence search retains the original image reference and strict first-on-tie rule. */
export function nearestMinimapSequenceImage<I extends MinimapImage>(
  images: readonly I[], clickLon: number, clickLat: number,
): { closestImg: I | null; minDist: number } {
  let closestImg: I | null = null;
  let minDist = Infinity;
  images.forEach(img => {
    const dist = distanceMeters(img.lat, img.lon, clickLat, clickLon);
    if (dist < minDist) { minDist = dist; closestImg = img; }
  });
  return { closestImg, minDist };
}

/** Discovery keeps its distinct first-candidate behavior, including nonfinite distances. */
export function nearestMinimapDiscoveryImage(
  sequences: readonly { sequenceId: string; images: readonly MinimapImage[] }[],
  clickLon: number, clickLat: number,
): DiscoveryChoice | null {
  let globalClosest: DiscoveryChoice | null = null;
  sequences.forEach(seq => {
    seq.images.forEach(img => {
      const dist = distanceMeters(img.lat, img.lon, clickLat, clickLon);
      if (!globalClosest || dist < globalClosest.dist) globalClosest = { seqId: seq.sequenceId, imgId: img.id, dist };
    });
  });
  return globalClosest;
}

export interface MinimapClickHost {
  state(): { sequenceImages: readonly MinimapImage[]; sequenceId: string | null; imageId: string | null };
  accessToken(): string;
  discover(lon: number, lat: number, token: string): Promise<readonly { sequenceId: string; images: readonly MinimapImage[] }[]>;
  loadSequence(sequenceId: string, imageId: string, point?: { lon: number; lat: number }): Promise<unknown>;
  showNoImage(): void;
  update(patch: { isLoading: boolean } | { isLoading: false; availableSequences: []; clickLon: number; clickLat: number }): void;
  error(...args: unknown[]): void;
}

/** One handler per minimap; preserve existing jump/discovery error boundaries and update order. */
export function createMinimapClickHandler(host: MinimapClickHost) {
  return async (evt: { mapPoint: { longitude: number; latitude: number } }) => {
    const clickPoint = evt.mapPoint;
    const clickLon = clickPoint.longitude;
    const clickLat = clickPoint.latitude;

    // 1. Check if the click is near a point in the CURRENT sequence (proximity jump)
    if (host.state().sequenceImages?.length > 0 && host.state().sequenceId) {
      const { closestImg, minDist } = nearestMinimapSequenceImage(host.state().sequenceImages, clickLon, clickLat);
      // If within 5m of a sequence point, jump within the current sequence
      if (closestImg && minDist < 5 && closestImg.id !== host.state().imageId) {
        await host.loadSequence(host.state().sequenceId!, closestImg.id);
        return;
      }
    }

    // 2. Click is elsewhere, search for nearby sequences at that location.
    //    We intentionally do NOT set availableSequences or call drawSequencesOverlay
    //    so the main map is not polluted with colored multi-sequence overlays.
    //    We just find the closest image and load it directly.
    host.update({ isLoading: true });
    try {
      const nearbySeqs = await host.discover(clickLon, clickLat, host.accessToken());
      if (!nearbySeqs.length) {
        host.showNoImage();
        host.update({ isLoading: false });
        return;
      }

      const fullSeqs = nearbySeqs; // Discovery already includes the local image coordinates.
      // Find the image closest to the click across all returned sequences
      const globalClosest = nearestMinimapDiscoveryImage(fullSeqs, clickLon, clickLat);

      if (!globalClosest) {
        host.showNoImage();
        host.update({ isLoading: false });
        return;
      }

      // Load the sequence, this updates sequenceImages/imageId/selectedSequenceId
      // but leaves availableSequences untouched so no colored overlay appears.
      // When the user exits fullscreen they'll see just the single blue sequence line.
      await host.loadSequence(globalClosest.seqId, globalClosest.imgId, { lon: clickLon, lat: clickLat });
      host.update({ isLoading: false, availableSequences: [], clickLon, clickLat });
    } catch (err) {
      host.error("Minimap click error:", err);
      host.update({ isLoading: false });
    }
  };
}
