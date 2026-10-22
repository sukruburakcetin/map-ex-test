import type { SequenceCoordinate } from './sequenceCoordinates';

export type LiveSequenceFrame = SequenceCoordinate & { sequenceId: string };
export interface ViewerFrameImage {
  id?: string | number;
  sequenceId?: string | null;
  originalLngLat?: { lng: number; lat: number } | null;
  lngLat?: { lng: number; lat: number } | null;
}
export const LIVE_SEQUENCE_LIMITS = { markerCount: 128, markerStep: 32, markerZoom: 16, detailDelay: 300, progressInterval: 200, previewSegments: 32 } as const;
const valid = (lon: unknown, lat: unknown): boolean => typeof lon === 'number' && typeof lat === 'number' && Number.isFinite(lon) && Number.isFinite(lat) && Math.abs(lon) <= 180 && Math.abs(lat) <= 90;

/** Viewer identity, partial coordinates and completed route are independent lifetimes.
 * The Mapillary v4 image event exposes originalLngLat and sequenceId. Original
 * coordinates match Graph geometry; computed lngLat is a last-resort fallback.
 */
export class LiveSequenceFrames {
  sequenceId: string | null = null;
  current: LiveSequenceFrame | null = null;
  complete: SequenceCoordinate[] | null = null;
  private known = new Map<string, SequenceCoordinate>();
  private ordinals = new Map<string, number>();
  private revision = 0;
  private pending: AbortController | null = null;
  constructor(private readonly fetchImage: (id: string, signal: AbortSignal) => Promise<any>) {}
  begin(sequenceId: string, points: readonly SequenceCoordinate[]): void {
    this.cancelPending();
    if (this.sequenceId !== sequenceId) { this.known.clear(); this.ordinals.clear(); this.complete = null; }
    this.sequenceId = sequenceId; this.current = null; this.remember(sequenceId, points);
  }
  remember(sequenceId: string, points: readonly SequenceCoordinate[]): void {
    if (sequenceId !== this.sequenceId) return;
    for (const point of points) if (point.id != null && valid(point.lon, point.lat)) this.known.set(String(point.id), point);
  }
  finish(sequenceId: string, points: SequenceCoordinate[]): boolean {
    if (sequenceId !== this.sequenceId) return false;
    this.remember(sequenceId, points); this.complete = points; this.ordinals.clear();
    points.forEach((point, i) => this.ordinals.set(String(point.id), i));
    return true;
  }
  find(id: string | null | undefined): SequenceCoordinate | undefined { return id == null ? undefined : this.known.get(String(id)); }
  points(): SequenceCoordinate[] { return Array.from(this.known.values()); }
  isCurrent(frame: LiveSequenceFrame): boolean { return this.current === frame; }
  markerWindow(id: string): { key: number; points: readonly SequenceCoordinate[] } | null {
    if (!this.complete) return null;
    const ordinal = this.ordinals.get(id); if (ordinal === undefined) return null;
    const count = LIVE_SEQUENCE_LIMITS.markerCount, step = LIVE_SEQUENCE_LIMITS.markerStep;
    const start = Math.max(0, Math.min(this.complete.length - count, Math.floor(ordinal / step) * step - count / 2));
    return { key: start, points: this.complete.slice(start, start + count) };
  }
  async resolve(image: ViewerFrameImage): Promise<LiveSequenceFrame | null> {
    this.cancelPending(); const revision = this.revision;
    const id = image?.id == null ? '' : String(image.id); if (!id) return null;
    let sequenceId = image.sequenceId ? String(image.sequenceId) : null;
    let point = !sequenceId || sequenceId === this.sequenceId ? this.find(id) : undefined;
    if (point && !sequenceId) sequenceId = this.sequenceId;
    // Prefer originalLngLat (Graph geometry), preserving coverage alignment.
    const location = image.originalLngLat ?? image.lngLat;
    if (!point && location && valid(location.lng, location.lat)) point = { id, lon: location.lng, lat: location.lat };
    if (!point || !sequenceId) {
      const controller = new AbortController(); this.pending = controller;
      try {
        const data = await this.fetchImage(id, controller.signal);
        if (revision !== this.revision || controller.signal.aborted) return null;
        const xy = data.geometry?.coordinates;
        if (xy && valid(xy[0], xy[1])) point = { ...(point || {}), id, lon: xy[0], lat: xy[1] };
        sequenceId = typeof data.sequence === 'string' ? data.sequence : data.sequence?.id || sequenceId;
      } catch (error) {
        if (revision !== this.revision || controller.signal.aborted) return null;
        throw error;
      } finally { if (this.pending === controller) this.pending = null; }
    }
    if (revision !== this.revision || !point || !sequenceId) return null;
    if (sequenceId !== this.sequenceId) { this.known.clear(); this.ordinals.clear(); this.complete = null; this.sequenceId = sequenceId; }
    const frame = { ...point, id, sequenceId };
    this.known.set(id, frame); this.current = frame; return frame;
  }
  cancelPending(): void { ++this.revision; this.pending?.abort(); this.pending = null; this.current = null; }
  clear(): void { this.cancelPending(); this.sequenceId = null; this.current = null; this.complete = null; this.known.clear(); this.ordinals.clear(); }
}

/** Coalesce secondary UI/network work; map tracking never waits for this queue. */
export class LatestFrameDetails {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private latest: (() => void) | null = null;
  queue(work: () => void): void {
    this.latest = work;
    if (this.timer !== null) return;
    this.timer = setTimeout(() => { this.timer = null; const run = this.latest; this.latest = null; run?.(); }, LIVE_SEQUENCE_LIMITS.detailDelay);
  }
  clear(): void { if (this.timer !== null) clearTimeout(this.timer); this.timer = null; this.latest = null; }
}

/** Small route preparation slices, with prompt cancellation between slices. */
export function yieldSequenceWork(signal: AbortSignal): Promise<void> {
  if (signal.aborted) return Promise.reject(new DOMException('Cancelled', 'AbortError'));
  return new Promise((resolve, reject) => {
    const abort = () => { clearTimeout(timer); signal.removeEventListener('abort', abort); reject(new DOMException('Cancelled', 'AbortError')); };
    const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve(); }, 8);
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) abort();
  });
}
