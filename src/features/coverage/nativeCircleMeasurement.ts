/** Temporary numeric-only measurement of an exact-ID native circle. No tiles are fetched. */
type Json = Record<string, any>;
type Pixel = { x: number; y: number };
export interface NativeCircleMeasurementHost {
  read(): { view: any; layer: any; revision: number; [key: string]: any } | null;
  project(context: any, lon: number, lat: number): Pixel | null;
}
const bases = ['turbo-images', 'turbo-images-good', 'turbo-images-fair', 'turbo-images-poor', 'turbo-images-unscored'];
type OwnedStyle = { layer: any; id: string };
type Slot = { owned: OwnedStyle[]; running: boolean; waiting: boolean };
const busy = new WeakMap<NativeCircleMeasurementHost, Slot>();
let serial = 0;
const copy = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const finite = (value: any): value is number => typeof value === 'number' && Number.isFinite(value);
const point = (value: any): value is Pixel => value && finite(value.x) && finite(value.y);
const minus = (a: Pixel, b: Pixel): Pixel => ({ x: a.x - b.x, y: a.y - b.y });
class MeasurementFailure extends Error { constructor(readonly code: string) { super(code); } }
const fail = (code: string): never => { throw new MeasurementFailure(code); };

/** Pixel coordinates are screenshot sample centers, transformed by the SDK's actual output size. */
function locate(data: any, area: Json): Json {
  const width = data?.width, height = data?.height, rgba = data?.data;
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 ||
      width * height > 1048576 || !rgba || rgba.length !== width * height * 4) fail('invalid-screenshot');
  const sx = width / area.width, sy = height / area.height;
  const mask = new Uint8Array(width * height), queue = new Uint32Array(width * height);
  let total = 0;
  for (let i = 0; i < mask.length; i++) {
    const k = i * 4;
    if (rgba[k] <= 32 && Math.abs(rgba[k + 1] - 229) <= 26 && rgba[k + 2] >= 229 && rgba[k + 3] >= 200) {
      mask[i] = 1; total++;
    }
  }
  if (!total) fail('native-circle-not-found');
  if (total > Math.ceil(256 * sx * sy)) fail('excess-cyan');
  const components: Json[] = [];
  for (let seed = 0; seed < mask.length; seed++) {
    if (!mask[seed]) continue;
    let head = 0, tail = 1, sumX = 0, sumY = 0, minX = width, minY = height, maxX = 0, maxY = 0;
    queue[0] = seed; mask[seed] = 0;
    while (head < tail) {
      const index = queue[head++], x = index % width, y = Math.floor(index / width);
      sumX += x + 0.5; sumY += y + 0.5;
      minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy, next = ny * width + nx;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height && mask[next]) { mask[next] = 0; queue[tail++] = next; }
      }
    }
    if (minX === 0 || minY === 0 || maxX === width - 1 || maxY === height - 1) fail('clipped-cyan');
    components.push({ count: tail, sumX, sumY, minX, minY, maxX, maxY });
  }
  if (components.length !== 1) fail(components.length ? 'ambiguous-cyan' : 'native-circle-not-found');
  const c = components[0];
  const centroid = { x: area.x + c.sumX / c.count / sx, y: area.y + c.sumY / c.count / sy };
  const bounds = { x: area.x + c.minX / sx, y: area.y + c.minY / sy,
    width: (c.maxX - c.minX + 1) / sx, height: (c.maxY - c.minY + 1) / sy };
  const centerDelta = { x: bounds.x + bounds.width / 2 - centroid.x, y: bounds.y + bounds.height / 2 - centroid.y };
  const fillFraction = c.count / ((c.maxX - c.minX + 1) * (c.maxY - c.minY + 1));
  const aspectRatio = bounds.width / bounds.height;
  const failedChecks: string[] = [];
  if (bounds.width < 3 || bounds.width > 12) failedChecks.push('width-outside-3-12-css-pixels');
  if (bounds.height < 3 || bounds.height > 12) failedChecks.push('height-outside-3-12-css-pixels');
  if (aspectRatio < 0.5 || aspectRatio > 2) failedChecks.push('aspect-ratio-outside-0.5-2');
  if (fillFraction < 0.4) failedChecks.push('fill-fraction-below-0.4');
  if (Math.abs(centerDelta.x) > 1 || Math.abs(centerDelta.y) > 1) failedChecks.push('centroid-asymmetry-over-1-css-pixel');
  return { pixelCount: c.count, centroid, bounds,
    quality: { components: 1, areaCssPixels: c.count / sx / sy, fillFraction, aspectRatio,
      boundsCenterMinusCentroid: centerDelta, failedChecks },
    readback: { width, height, scaleX: sx, scaleY: sy, area } };
}

/** The caller suspends its ordinary cyan diagnostic first. Only this helper's clones are edited.
 * A timed-out SDK screenshot is not cancellable: retain the host slot until it actually settles.
 */
export async function measureNativeCircle(host: NativeCircleMeasurementHost, hover: Json,
  makeStyle: (base: Json, imageId: string, uniqueStyleId: string) => Json): Promise<Json> {
  const previous = busy.get(host);
  if (previous && (previous.running || previous.waiting)) return { status: 'busy' };
  const owned = previous?.owned || [], slot: Slot = { owned, running: true, waiting: false };
  busy.set(host, slot);
  const pending: Promise<void>[] = [];
  let result: Json = { status: 'unavailable' }, context: ReturnType<NativeCircleMeasurementHost['read']>;
  let movementWatch: { remove(): void } | undefined, moved = false;
  let verify = () => {};
  const cleanup = async () => {
    for (const item of owned.slice().reverse()) {
      let deleted = !!item.layer.destroyed;
      try { if (!deleted) await item.layer.deleteStyleLayer(item.id); deleted = true; } catch (_) {}
      let present = !item.layer.destroyed;
      try { present = present && !!item.layer.getStyleLayer(item.id); } catch (_) { present = !deleted; }
      if (!present) owned.splice(owned.indexOf(item), 1);
      try { host.read(); verify(); } catch (error) {
        if (result.status === 'measured' || result.status === 'invalid-circle-shape') result = { status: error instanceof MeasurementFailure ? error.code : 'sdk-failed' };
      }
    }
  };
  try {
    if (owned.length) { await cleanup(); if (owned.length) fail('cleanup-failed'); }
    context = host.read();
    if (!context?.view || !context.layer) fail('no-context');
    const { view, layer, revision } = context;
    if (view.type !== '2d') fail('unsupported-view');
    if (context.hybridVisible || context.hybridFallback) fail('hybrid-active');
    if (view.stationary !== true || view.destroyed || layer.destroyed || layer.visible === false) fail('view-not-ready');
    if (typeof view.takeScreenshot !== 'function' || typeof layer.getStyleLayer !== 'function' ||
        typeof layer.setStyleLayer !== 'function' || typeof layer.deleteStyleLayer !== 'function') fail('unsupported-sdk');
    if (typeof hover?.imageId !== 'string' || !hover.imageId) fail('missing-image-id');
    const matches: Json[] = Array.isArray(hover.cached?.matches) ? hover.cached.matches : [];
    const canonical = matches.filter(match => match.canonical === true);
    const candidates = canonical.length ? canonical : matches;
    if (candidates.length !== 1) fail('ambiguous-cached-match');
    const match = candidates[0], tile = match.tile, raw = match.raw, extent = match.extent;
    if (!Array.isArray(tile) || tile.length !== 3 || !tile.every(Number.isInteger) || tile[2] < 0 || tile[2] > 24 ||
        !finite(extent) || extent <= 0 || !point(raw)) fail('invalid-cached-match');
    const toLonLat = (x: number, y: number): [number, number] => {
      const n = 2 ** tile[2];
      return [(tile[0] + x / extent) / n * 360 - 180,
        Math.atan(Math.sinh(Math.PI * (1 - 2 * (tile[1] + y / extent) / n))) * 180 / Math.PI];
    };
    const project = (x: number, y: number): Pixel => {
      const [lon, lat] = toLonLat(x, y), projected = host.project(context!, lon, lat);
      if (!point(projected)) fail('projection-unavailable');
      return { x: projected.x, y: projected.y };
    };
    const origin = project(raw.x, raw.y), px = project(raw.x + 1, raw.y), py = project(raw.x, raw.y + 1);
    const xBasis = minus(px, origin), yBasis = minus(py, origin);
    const determinant = xBasis.x * yBasis.y - yBasis.x * xBasis.y;
    if (!finite(determinant) || Math.abs(determinant) < 1e-8 * Math.max(1, Math.hypot(xBasis.x, xBasis.y) * Math.hypot(yBasis.x, yBasis.y))) fail('singular-basis');
    const pose = { zoom: view.zoom, rotation: view.rotation, resolution: view.resolution, width: view.width, height: view.height, revision };
    if (![pose.width, pose.height].every(value => finite(value) && value > 0)) fail('invalid-view-size');
    verify = () => {
      const fresh = host.read();
      if (!fresh || fresh.view !== view || fresh.layer !== layer || fresh.revision !== revision || view.destroyed || layer.destroyed) fail('stale-context');
      if (fresh.hybridVisible || fresh.hybridFallback) fail('hybrid-active');
      if (moved || view.stationary !== true) fail('view-moved');
      for (const key of ['zoom', 'rotation', 'resolution', 'width', 'height'] as const) if (view[key] !== pose[key]) fail('view-moved');
      const now = [project(raw.x, raw.y), project(raw.x + 1, raw.y), project(raw.x, raw.y + 1)];
      if (now.some((p, i) => Math.hypot(p.x - [origin, px, py][i].x, p.y - [origin, px, py][i].y) > 0.05)) fail('view-moved');
    };
    verify();
    if (typeof view.watch === 'function') movementWatch = view.watch('stationary', (still: boolean) => { if (!still) moved = true; });
    const active: Json[] = [];
    for (const id of bases) {
      let base: Json | undefined;
      try { base = layer.getStyleLayer(id); } catch (_) { /* Absent quality-band styles are normal. */ }
      if (base?.type === 'circle' && base['source-layer'] === 'image' && base.layout?.visibility !== 'none' &&
          !(finite(base.minzoom) && view.zoom < base.minzoom) && !(finite(base.maxzoom) && view.zoom >= base.maxzoom)) active.push(copy(base));
    }
    if (!active.length) fail('no-active-native-circle');
    const instance = ++serial;
    for (let index = 0; index < active.length; index++) {
      verify();
      const id = `mly-center-${instance}-${index}`;
      let existing: any;
      try { existing = layer.getStyleLayer(id); } catch (_) {}
      if (existing) fail('style-id-collision');
      const style = copy(makeStyle(active[index], hover.imageId, id));
      style.id = id;
      style.paint = { ...style.paint, 'circle-radius': 4, 'circle-opacity': 1, 'circle-stroke-width': 0 };
      owned.push({ layer, id }); // The SDK may apply a style before rejecting its promise.
      await layer.setStyleLayer(style);
      verify();
    }
    await new Promise(resolve => setTimeout(resolve, 180));
    verify();
    const left = Math.max(0, Math.floor(origin.x - 64)), top = Math.max(0, Math.floor(origin.y - 64));
    const area = { x: left, y: top, width: Math.min(view.width, Math.ceil(origin.x + 64)) - left,
      height: Math.min(view.height, Math.ceil(origin.y + 64)) - top };
    if (area.width < 1 || area.height < 1) fail('projection-outside-view');
    let timer: ReturnType<typeof setTimeout> | undefined;
    const request = Promise.resolve().then(() => view.takeScreenshot({ format: 'png', area }));
    pending.push(request.then(() => {}, () => {}));
    let screenshot: any;
    try {
      screenshot = await Promise.race([request, new Promise((_, reject) => {
        timer = setTimeout(() => reject(new MeasurementFailure('screenshot-timeout')), 2500);
      })]);
      verify();
    } finally { if (timer !== undefined) clearTimeout(timer); }
    const measured = locate(screenshot?.data, area);
    verify();
    const deltaPixels = minus(measured.centroid, origin);
    const deltaTileUnits = { x: (deltaPixels.x * yBasis.y - yBasis.x * deltaPixels.y) / determinant,
      y: (xBasis.x * deltaPixels.y - deltaPixels.x * xBasis.y) / determinant };
    const details = { ...measured, projected: origin, basis: { x: xBasis, y: yBasis, determinant },
      deltaPixels, deltaTileUnits, pose: Object.fromEntries(Object.entries(pose).filter(([, value]) => finite(value))),
      tile: tile.slice(), raw: { x: raw.x, y: raw.y }, extent, stylesAdded: owned.length };
    // Preserve rejected candidates for investigation without reporting a trusted measurement.
    result = measured.quality.failedChecks.length
      ? { status: 'invalid-circle-shape', candidate: details }
      : { status: 'measured', ...details };
  } catch (error) {
    result = { status: error instanceof MeasurementFailure ? error.code : 'sdk-failed' };
  } finally {
    await cleanup();
    try { movementWatch?.remove(); } catch (_) {}
    if (owned.length) result = { status: 'cleanup-failed', cleanupPending: owned.length };
    slot.running = false;
    // Do not retain ImageData in the slot; the settled promises carry no payload.
    if (pending.length) {
      slot.waiting = true;
      void Promise.all(pending).then(() => { slot.waiting = false; if (!owned.length && busy.get(host) === slot) busy.delete(host); });
    } else if (!owned.length && busy.get(host) === slot) busy.delete(host);
  }
  return result;
}
