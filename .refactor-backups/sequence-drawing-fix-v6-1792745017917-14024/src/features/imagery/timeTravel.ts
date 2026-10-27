/** Time-travel availability enrichment; viewer navigation stays runtime-owned. */
import { GRAPH_API, BBOX, LIMITS, TIME_TRAVEL as TIME_TRAVEL_THRESHOLDS } from '../../utils/constants';
import { distanceMeters } from '../../utils/geoUtils';

const check = (signal?: AbortSignal): void => {
  if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
};

/** Undefined retains the existing non-OK current-image policy: no UI update. */
async function queryTimeTravelAvailability(currentImageId: string, getToken: () => string, signal?: AbortSignal): Promise<boolean | undefined> {
  check(signal);
  if (!currentImageId) return false;
  const currentResp = await fetch(
    `${GRAPH_API.BASE}/${currentImageId}?fields=geometry,computed_geometry,captured_at,
                computed_compass_angle,compass_angle,is_pano,sequence&access_token=${getToken()}`,
    { signal },
  );
  check(signal);
  if (!currentResp.ok) return undefined;
  const current = await currentResp.json();
  check(signal);
  if (!current.computed_geometry) return false;

  const coordinates = current.computed_geometry.coordinates;
  const angle = current.computed_compass_angle ?? current.compass_angle;
  const time = new Date(current.captured_at).getTime();
  const offset = BBOX.TIME_TRAVEL;
  const bbox = `${coordinates[0] - offset},${coordinates[1] - offset},${coordinates[0] + offset},${coordinates[1] + offset}`;
  const candidatesUrl = `${GRAPH_API.BASE}/images?bbox=${bbox}&fields=id,captured_at,compass_angle,computed_compass_angle,
            is_pano,geometry,computed_geometry,sequence&limit=${LIMITS.TIME_TRAVEL_CANDIDATES}&access_token=${getToken()}`;
  check(signal);
  const candidatesResp = await fetch(candidatesUrl, { signal });
  check(signal);
  const candidates = await candidatesResp.json();
  check(signal);
  return !!candidates.data?.some((image: any) => {
    if (image.id === currentImageId || image.sequence === current.sequence) return false;
    if (Math.abs(new Date(image.captured_at).getTime() - time) < TIME_TRAVEL_THRESHOLDS.MIN_GAP_MS) return false;
    if (!image.computed_geometry) return false;
    const point = image.computed_geometry.coordinates;
    if (distanceMeters(coordinates[1], coordinates[0], point[1], point[0]) > TIME_TRAVEL_THRESHOLDS.MAX_DISTANCE_M) return false;
    if (current.is_pano || image.is_pano) return true;
    const imageAngle = image.computed_compass_angle ?? image.compass_angle;
    if (angle !== null && imageAngle !== null) {
      const difference = Math.abs(angle - imageAngle) % 360;
      return Math.min(difference, 360 - difference) <= TIME_TRAVEL_THRESHOLDS.MAX_ANGLE_DEG;
    }
    return false;
  });
}

/** Existing rules and error fallbacks, with optional cancellation for both requests.
 * Aborted work never applies a value, including the normal error fallback.
 */
export async function checkTimeTravelAvailability(currentImageId: string, getToken: () => string,
  applyAvailable: (available: boolean) => void, signal?: AbortSignal): Promise<void> {
  try {
    const available = await queryTimeTravelAvailability(currentImageId, getToken, signal);
    if (!signal?.aborted && available !== undefined) applyAvailable(available);
  } catch {
    if (!signal?.aborted) applyAvailable(false);
  }
}

type AvailabilityEntry = {
  imageId: string;
  token: string;
  controller: AbortController;
  promise: Promise<void>;
  value?: boolean;
};

/** One latest-image task. Duplicate click/viewer callers share work and successful
 * results; a different image or token cancels the previous request chain. Failed
 * requests are not cached. clear() invalidates callbacks on view/widget teardown.
 */
export class TimeTravelAvailability {
  private entry: AvailabilityEntry | null = null;
  constructor(private readonly getToken: () => string,
    private readonly applyAvailable: (imageId: string, available: boolean) => void) {}

  update(imageId: string): Promise<void> {
    const token = this.getToken(), previous = this.entry;
    if (previous && previous.imageId === imageId && previous.token === token && !previous.controller.signal.aborted) {
      if (previous.value !== undefined) this.applyAvailable(imageId, previous.value);
      return previous.promise;
    }
    this.clear();
    const entry: AvailabilityEntry = { imageId, token, controller: new AbortController(), promise: Promise.resolve() };
    this.entry = entry;
    const current = () => this.entry === entry && !entry.controller.signal.aborted && this.getToken() === token;
    entry.promise = queryTimeTravelAvailability(imageId, () => token, entry.controller.signal).then(available => {
      if (!current()) return;
      if (available === undefined) { this.entry = null; return; }
      entry.value = available;
      this.applyAvailable(imageId, available);
    }).catch(() => {
      if (!current()) return;
      this.entry = null;
      this.applyAvailable(imageId, false);
    });
    return entry.promise;
  }

  /** Cancel obsolete enrichment as soon as playback confirms another image,
   * without starting the replacement request before its scheduled detail work.
   */
  cancelUnless(imageId: string): void {
    const entry = this.entry;
    if (entry && (entry.imageId !== imageId || entry.token !== this.getToken())) this.clear();
  }

  clear(): void { this.entry?.controller.abort(); this.entry = null; }
}
