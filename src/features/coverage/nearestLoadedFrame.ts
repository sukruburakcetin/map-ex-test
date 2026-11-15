export interface LoadedFramePoint { id: string; lon: number; lat: number }

/** Match the existing nearest-frame policy without monopolizing a long browser task.
 * Small routes scan without timers. Large scans yield after 4,096 frames or an
 * eight-millisecond slice, retaining source order and first-match tie behavior.
 * The caller owns selection/view/route identity; obsolete scans return no result.
 * This helper performs no requests, sampling, indexing or persistent caching.
 */
export async function nearestLoadedFrame(frames: readonly LoadedFramePoint[],
  location: { lon: number; lat: number },
  distance: (lat1: number, lon1: number, lat2: number, lon2: number) => number,
  current: () => boolean): Promise<string | undefined> {
  if (!current()) return undefined;
  let nearest: string | undefined, best = Infinity;
  let deadline = performance.now() + 8;
  for (let index = 0; index < frames.length; index++) {
    if (index && (index % 4096 === 0 || (index % 256 === 0 && performance.now() >= deadline))) {
      await new Promise<void>(resolve => setTimeout(resolve, 0));
      if (!current()) return undefined;
      deadline = performance.now() + 8;
    }
    const frame = frames[index];
    const value = distance(frame.lat, frame.lon, location.lat, location.lon);
    if (value < best) { best = value; nearest = String(frame.id); }
  }
  return current() ? nearest : undefined;
}
