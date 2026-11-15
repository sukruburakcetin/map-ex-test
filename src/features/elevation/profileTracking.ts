import { finiteAltitude } from '../../utils/imageAltitude';
import type { ImageAltitude } from '../../utils/imageAltitude';

/** Metres throughout. Frame identity/order come from the exact profile input snapshot. */
export interface ElevationIndicatorImage extends ImageAltitude { id: string; lat: number; lon: number; }
export interface ProfileSample { distance: number; elevation?: number | null; }
export interface FramePosition { id: string; ordinal: number; distance: number; computedAltitude?: number; reportedAltitude?: number; }
export interface FrameDistanceIndex {
  images: readonly ElevationIndicatorImage[];
  frames: ReadonlyMap<string, FramePosition>;
  total: number;
}
export function frameDistanceIndex(images: readonly ElevationIndicatorImage[], segmentMeters: readonly number[]): FrameDistanceIndex {
  if (segmentMeters.length !== images.length - 1) throw new Error('Profile segment count does not match its input.');
  const frames = new Map<string, FramePosition>(); let distance = 0;
  images.forEach((image, i) => {
    if (!image.id || frames.has(String(image.id)) || !Number.isFinite(image.lat) || !Number.isFinite(image.lon)) throw new Error('Invalid or duplicate profile frame.');
    if (i) {
      const length = segmentMeters[i - 1];
      if (!Number.isFinite(length) || length < 0) throw new Error('Invalid profile segment distance.');
      distance += length;
    }
    frames.set(String(image.id), { id: String(image.id), ordinal: i + 1, distance,
      computedAltitude: finiteAltitude(image.computedAltitude), reportedAltitude: finiteAltitude(image.reportedAltitude) });
  });
  return { images, frames, total: distance };
}
export function sameProfileInput(a: readonly ElevationIndicatorImage[], b: readonly ElevationIndicatorImage[]): boolean {
  return a === b || a.length === b.length && a.every((p, i) => {
    const q = b[i]; return String(p.id) === String(q.id) && p.lon === q.lon && p.lat === q.lat && Object.is(p.computedAltitude, q.computedAltitude) && Object.is(p.reportedAltitude, q.reportedAltitude);
  });
}
export function axisPixel(distance: number, start: number, end: number, left: number, width: number): number | null {
  if (![distance, start, end, left, width].every(Number.isFinite) || end <= start || width <= 0 || distance < start || distance > end) return null;
  return left + (distance - start) / (end - start) * width;
}
/** Interpolate chart values only. Never interpret a sampled point as an image frame. */
export function sampledElevation(samples: readonly ProfileSample[], distance: number): number | null {
  let lo = 0, hi = samples.length - 1;
  if (!Number.isFinite(distance) || hi < 0 || distance < samples[0].distance || distance > samples[hi].distance) return null;
  while (lo < hi) { const mid = (lo + hi) >>> 1; if (samples[mid].distance < distance) lo = mid + 1; else hi = mid; }
  const b = samples[lo], a = samples[Math.max(0, lo - 1)];
  if (typeof b.elevation !== 'number' || !Number.isFinite(b.elevation)) return null;
  if (b.distance === distance) return b.elevation;
  if (typeof a.elevation !== 'number' || !Number.isFinite(a.elevation) || b.distance <= a.distance) return null;
  return a.elevation + (distance - a.distance) / (b.distance - a.distance) * (b.elevation - a.elevation);
}
/** Bound SVG size by chart width. Preserve extrema and missing-data breaks. */
export function sampledPath(samples: readonly ProfileSample[], start: number, end: number, left: number, width: number, top: number, height: number, min: number, max: number): string {
  const commands: string[] = []; let open = false;
  let bucket = -1, points: { i: number; x: number; y: number }[] = [];
  const flush = () => {
    if (!points.length) return;
    const first = points[0], last = points[points.length - 1];
    const low = points.reduce((a, b) => a.y < b.y ? a : b), high = points.reduce((a, b) => a.y > b.y ? a : b);
    for (const p of [...new Map([first, low, high, last].map(p => [p.i, p])).values()].sort((a, b) => a.i - b.i)) {
      commands.push(`${open ? 'L' : 'M'}${p.x.toFixed(2)},${p.y.toFixed(2)}`); open = true;
    }
    points = [];
  };
  const visit = (sample: ProfileSample, i: number) => {
    if (typeof sample.elevation !== 'number' || !Number.isFinite(sample.elevation)) { flush(); open = false; bucket = -1; return; }
    const x = axisPixel(sample.distance, start, end, left, width);
    if (x === null) { flush(); return; }
    const next = Math.floor(x);
    if (next !== bucket) { flush(); bucket = next; }
    points.push({ i, x, y: top + height - (sample.elevation - min) / Math.max(1e-9, max - min) * height });
  };
  visit({ distance: start, elevation: sampledElevation(samples, start) }, -1);
  samples.forEach((sample, i) => { if (sample.distance > start && sample.distance < end) visit(sample, i); });
  visit({ distance: end, elevation: sampledElevation(samples, end) }, samples.length);
  flush(); return commands.join(' ');
}
