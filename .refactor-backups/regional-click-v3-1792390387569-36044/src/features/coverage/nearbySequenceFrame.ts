/** Resolve one coverage click from local image tiles; never enumerate a sequence or call image search. */
type TurboBbox = [number, number, number, number];

type Tile = [number, number, number];
interface ImageLayer { length: number; feature(index: number): { properties: Record<string, any>; extent?: number; loadGeometry(): { x: number; y: number }[][] } }
interface TileSource {
  layer: ImageLayer;
  index?: { visitIndices(bbox: TurboBbox, signal: AbortSignal, visit: (index: number) => void): Promise<void> };
}
export interface NearbyFrameDependencies {
  // Reuse host geometry helpers; installations may keep coverage utilities in one file.
  boxes: (points: readonly { lon: number; lat: number }[]) => TurboBbox[];
  tiles: (bbox: TurboBbox, zoom: number) => Iterable<Tile>;
  load: (tile: Tile, signal: AbortSignal) => Promise<TileSource | null>;
  distance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
}

/** Await abort even when an SDK/network adapter fails to settle after cancellation. */
function cancellable<T>(work: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const abort = () => { signal.removeEventListener('abort', abort); reject(new DOMException('Cancelled', 'AbortError')); };
    if (signal.aborted) { work.catch(() => undefined); abort(); return; }
    signal.addEventListener('abort', abort, { once: true });
    work.then(value => { signal.removeEventListener('abort', abort); resolve(value); }, error => { signal.removeEventListener('abort', abort); reject(error); });
  });
}

/**
 * Inspect at most four z14 tiles within 500 m, shrinking the envelope near poles.
 * Warm spatial indexes skip unrelated cells; cold scans reject other sequences
 * before decoding geometry and yield every 8 ms. An 800 ms budget aborts pending
 * tile work and returns the best completed candidate (or undefined for the line
 * representative). Caller cancellation always propagates. No partial route is cached.
 */
export async function findNearbySequenceFrame(sequenceId: string, location: { lon: number; lat: number }, signal: AbortSignal,
  dependencies: NearbyFrameDependencies, budgetMs = 800): Promise<string | undefined> {
  if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
  if (!Number.isFinite(location.lon) || !Number.isFinite(location.lat) || Math.abs(location.lat) > 85.04) return undefined;
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(abort, budgetMs);
  let nearest: string | undefined, best = Infinity;
  const check = () => { if (controller.signal.aborted) throw new DOMException('Cancelled', 'AbortError'); };
  try {
    const cosine = Math.cos(location.lat * Math.PI / 180);
    const radius = Math.min(500, 40075016.686 * cosine / 16384 * 0.24);
    const dy = radius / 111320, dx = dy / cosine;
    const boxes = dependencies.boxes([{ lon: location.lon - dx, lat: location.lat - dy }, { lon: location.lon + dx, lat: location.lat + dy }]);
    const tiles = new Map<string, Tile>();
    for (const box of boxes) for (const tile of dependencies.tiles(box, 14)) tiles.set(tile.join('/'), tile);
    if (tiles.size > 4) return undefined;
    // Try the tile containing the click first; cold neighboring tiles must not
    // consume the lookup budget before the most useful tile is considered.
    const n = 2 ** 14;
    const cx = Math.max(0, Math.min(n - 1, Math.floor((location.lon + 180) / 360 * n)));
    const cy = Math.max(0, Math.min(n - 1, Math.floor((1 - Math.asinh(Math.tan(location.lat * Math.PI / 180)) / Math.PI) / 2 * n)));
    const ordered = [...tiles.values()].sort((a, b) => Number(b[0] === cx && b[1] === cy) - Number(a[0] === cx && a[1] === cy));
    for (const tile of ordered) {
      check();
      const source = await cancellable(dependencies.load(tile, controller.signal), controller.signal);
      check();
      if (!source) continue;
      const [tx, ty, z] = tile, n = 2 ** z;
      const consider = (i: number) => {
        check();
        const feature = source.layer.feature(i), props = feature.properties;
        if (props.id == null || props.sequence_id == null || String(props.sequence_id) !== sequenceId) return;
        const point = feature.loadGeometry()?.[0]?.[0], extent = Number(feature.extent) || 4096;
        if (!point || point.x < 0 || point.y < 0 || point.x >= extent || point.y >= extent) return;
        const lon = (tx + point.x / extent) / n * 360 - 180;
        const lat = Math.atan(Math.sinh(Math.PI * (1 - 2 * (ty + point.y / extent) / n))) * 180 / Math.PI;
        if (!boxes.some(box => lon >= box[0] && lon <= box[2] && lat >= box[1] && lat <= box[3])) return;
        const distance = dependencies.distance(location.lat, location.lon, lat, lon);
        if (distance <= radius && distance < best) { best = distance; nearest = String(props.id); }
      };
      if (source.index) {
        for (const box of boxes) await cancellable(source.index.visitIndices(box, controller.signal, consider), controller.signal);
      } else {
        let deadline = performance.now() + 8;
        for (let i = 0; i < source.layer.length; i++) {
          if ((i & 255) === 0 && performance.now() >= deadline) {
            await new Promise(resolve => setTimeout(resolve, 0)); deadline = performance.now() + 8;
          }
          consider(i);
        }
      }
    }
  } catch (error) {
    if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
    // Failed/slow tile resolution must not block opening the available representative.
  } finally {
    clearTimeout(timer); signal.removeEventListener('abort', abort); controller.abort();
  }
  return nearest;
}
