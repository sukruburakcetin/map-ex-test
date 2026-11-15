/** Full-fidelity tile rendering and bounded on-demand decoding. */
import { organizationCondition, organizationMatches } from './organizationFilter';
export const TURBO_LIMITS = { tileCacheBytes: 8 * 1024 * 1024, decodeYield: 500, pickRadiusPx: 8, hoverRadiusPx: 8, closeZoom: 24, closeBufferPx: 32, closeMaxGraphics: 40000, closeLayerId: "mapillary-turbo-close", hoverDetailsDelayMs: 150, coverageColor: [53, 175, 109, 0.9] } as const;
export type TurboBbox = [number, number, number, number];
export interface TurboFilters {
  onFoot?: boolean;
  creatorId?: number;
  organizationId?: number;
  startTime?: number;
  endTime?: number;
  isPano?: boolean;
  selectedYear?: string | null;
  qualityActive?: boolean;
  qualityBand?: "good" | "fair" | "poor" | "unscored" | null;
}
export interface TurboPoint {
  lon: number; lat: number; imageId: string; sequenceId?: string; capturedAt: number | null; year: string | null; qualityScore?: number | null; onFoot?: boolean;
}

/** Cache raw bytes, never decoded features, geometries, or thumbnail metadata. */
export class TurboTileCache {
  private entries = new Map<string, ArrayBuffer>();
  private bytes = 0;
  private limit: number;
  constructor(limit: number = TURBO_LIMITS.tileCacheBytes) { this.limit = limit; }
  get byteLength(): number { return this.bytes; }
  get size(): number { return this.entries.size; }
  snapshot(): [string, ArrayBuffer][] { return Array.from(this.entries); }
  get(key: string): ArrayBuffer | undefined {
    const value = this.entries.get(key);
    if (value) { this.entries.delete(key); this.entries.set(key, value); }
    return value;
  }
  set(key: string, value: ArrayBuffer): void {
    const previous = this.entries.get(key);
    if (previous) { this.bytes -= previous.byteLength; this.entries.delete(key); }
    if (value.byteLength > this.limit) return;
    // Empty responses cost no bytes but still need a bounded entry count.
    while (this.entries.size && (this.bytes + value.byteLength > this.limit || this.entries.size >= 64)) {
      const oldest = this.entries.keys().next().value as string;
      this.bytes -= this.entries.get(oldest)!.byteLength;
      this.entries.delete(oldest);
    }
    this.entries.set(key, value); this.bytes += value.byteLength;
  }
  clear(): void { this.entries.clear(); this.bytes = 0; }
}

/** Lazy enumeration has no tile-count cutoff and does not allocate a world-size array. */
export function* turboTiles(bbox: TurboBbox, zoom: number): Generator<[number, number, number]> {
  if (!bbox.every(Number.isFinite) || bbox[0] > bbox[2] || bbox[1] > bbox[3]) return;
  const n = 2 ** zoom;
  const x = (lon: number) => Math.max(0, Math.min(n - 1, Math.floor((lon + 180) / 360 * n)));
  const y = (lat: number) => {
    const rad = Math.max(-85.05112878, Math.min(85.05112878, lat)) * Math.PI / 180;
    return Math.max(0, Math.min(n - 1, Math.floor((1 - Math.asinh(Math.tan(rad)) / Math.PI) / 2 * n)));
  };
  const left = x(bbox[0]), right = x(bbox[2]), top = y(bbox[3]), bottom = y(bbox[1]);
  for (let tx = left; tx <= right; tx++) for (let ty = top; ty <= bottom; ty++) yield [tx, ty, zoom];
}

export function coverageQualityBand(score: unknown): "good" | "fair" | "poor" | "unscored" {
  if (score === null || score === undefined || score === "" || !Number.isFinite(Number(score)) || Number(score) < 0.1) return "unscored";
  return Number(score) >= 0.7 ? "good" : Number(score) >= 0.45 ? "fair" : "poor";
}
export function coverageQualityColor(score: unknown): number[] {
  return { good: [53,175,109,0.9], fair: [245,166,35,0.9], poor: [208,2,27,0.9], unscored: [168,85,247,0.9] }[coverageQualityBand(score)];
}
export function turboPointMatches(props: Record<string, any>, filters: TurboFilters): boolean {
  if (filters.onFoot !== undefined && props.foot !== filters.onFoot) return false;
  if (filters.qualityActive && filters.qualityBand && coverageQualityBand(props.quality_score) !== filters.qualityBand) return false;
  if (filters.creatorId !== undefined && Number(props.creator_id) !== filters.creatorId) return false;
  if (!organizationMatches(props.organization_id, filters.organizationId)) return false;
  const pano = props.is_pano === true || props.is_pano === 1 || props.is_pano === 'true';
  if (filters.isPano !== undefined && pano !== filters.isPano) return false;
  const time = Number(props.captured_at);
  if (filters.startTime !== undefined && (!Number.isFinite(time) || time < filters.startTime)) return false;
  if (filters.endTime !== undefined && (!Number.isFinite(time) || time > filters.endTime)) return false;
  if (filters.selectedYear && (!time || String(new Date(time).getFullYear()) !== filters.selectedYear)) return false;
  return true;
}

/** Keep native sequence identity available to picking without a metadata request. */
function nativeSequenceId(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const id = value.trim();
    return id && id !== 'undefined' && id !== 'null' ? id : undefined;
  }
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? String(value) : undefined;
}

/** Visit every matching point. Only one decoded feature is live per iteration. */
export async function visitTurboImageLayer(
  layer: { length: number; feature(index: number): any }, tile: [number, number, number],
  bbox: TurboBbox, filters: TurboFilters, signal: AbortSignal, visit: (point: TurboPoint) => void,
): Promise<void> {
  const [x, y, z] = tile, n = 2 ** z;
  for (let i = 0; i < layer.length; i++) {
    if (i % TURBO_LIMITS.decodeYield === 0) await new Promise(resolve => setTimeout(resolve, 0));
    if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
    const feature = layer.feature(i), props = feature.properties;
    if (!turboPointMatches(props, filters) || props.id === undefined || props.id === null) continue;
    const point = feature.loadGeometry()?.[0]?.[0];
    if (!point) continue;
    const extent = Number(feature.extent) || 4096;
    // Buffered MVT points belong to their canonical tile, not both neighbors.
    if (point.x < 0 || point.y < 0 || point.x >= extent || point.y >= extent) continue;
    const lon = (x + point.x / extent) / n * 360 - 180;
    const lat = Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + point.y / extent) / n))) * 180 / Math.PI;
    if (!Number.isFinite(lon) || !Number.isFinite(lat) || lon < bbox[0] || lon > bbox[2] || lat < bbox[1] || lat > bbox[3]) continue;
    const time = Number(props.captured_at);
    const capturedAt = Number.isFinite(time) && time > 0 ? time : null;
    visit({ lon, lat, imageId: String(props.id), sequenceId: nativeSequenceId(props.sequence_id), capturedAt, qualityScore: props.quality_score ?? null, onFoot: typeof props.foot === "boolean" ? props.foot : undefined, year: capturedAt ? String(new Date(capturedAt).getFullYear()) : null });
  }
}

/** Render native image circles at every zoom. The retired hide-images argument is ignored for caller compatibility. */
export function turboTileStyle(url: string, filters: TurboFilters, colorByDate: boolean, years: string[], palette: readonly (readonly number[])[], _legacyHideImages = false) {
  const conditions: any[] = [];
  const travelRestricted = filters.onFoot !== undefined;
  // Overview tiles do not carry organization ownership.
  const overviewRestricted = travelRestricted || filters.organizationId !== undefined;
  if (travelRestricted) conditions.push(['==', 'foot', filters.onFoot]);
  if (filters.creatorId !== undefined) conditions.push(['==', 'creator_id', filters.creatorId]);
  if (filters.organizationId !== undefined) conditions.push(organizationCondition(filters.organizationId));
  if (filters.startTime !== undefined) conditions.push(['>=', 'captured_at', filters.startTime]);
  if (filters.endTime !== undefined) conditions.push(['<=', 'captured_at', filters.endTime]);
  const pano = ['any', ['==', 'is_pano', true], ['==', 'is_pano', 1], ['==', 'is_pano', 'true']];
  if (filters.isPano === true) conditions.push(pano);
  if (filters.isPano === false) conditions.push(['all', ['!=', 'is_pano', true], ['!=', 'is_pano', 1], ['!=', 'is_pano', 'true']]);
  if (filters.selectedYear) {
    const year = Number(filters.selectedYear);
    conditions.push(['>=', 'captured_at', new Date(year, 0, 1).getTime()], ['<', 'captured_at', new Date(year + 1, 0, 1).getTime()]);
  }
  // Classic filters and constant paints match the legacy ArcGIS quality renderer.
  // Do not depend on data-driven paint expressions for quality colors.
  const bands = [
    { name: 'good', color: '#35AF6D', filter: ['>=', 'quality_score', 0.7] },
    { name: 'fair', color: '#F5A623', filter: ['all', ['>=', 'quality_score', 0.45], ['<', 'quality_score', 0.7]] },
    { name: 'poor', color: '#D0021B', filter: ['all', ['>=', 'quality_score', 0.1], ['<', 'quality_score', 0.45]] },
    { name: 'unscored', color: '#A855F7', filter: ['any', ['!has', 'quality_score'], ['==', 'quality_score', null], ['<', 'quality_score', 0.1]] },
  ];
  if (filters.qualityActive) {
    const selected = bands.filter(band => !filters.qualityBand || band.name === filters.qualityBand);
    const layers: any[] = [];
    for (const band of selected) {
      const filter = ['all', ...conditions, band.filter];
      if (!overviewRestricted) layers.push({ id: `turbo-overview-${band.name}`, source: 'turbo', 'source-layer': 'overview', type: 'circle', maxzoom: 6, filter,
        paint: { 'circle-radius': 3, 'circle-color': band.color, 'circle-opacity': 0.85 } });
      layers.push({ id: `turbo-sequences-${band.name}`, source: 'turbo', 'source-layer': 'sequence', type: 'line', minzoom: 6, filter,
        paint: { 'line-color': band.color, 'line-opacity': 0.85, 'line-width': 2.5 } });
      layers.push({ id: `turbo-images-${band.name}`, source: 'turbo', 'source-layer': 'image', type: 'circle', minzoom: 14, filter,
        paint: { 'circle-radius': 2.5, 'circle-color': band.color, 'circle-opacity': 0.9, 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1 } });
    }
    return { version: 8, sources: { turbo: { type: 'vector', tiles: [url], minzoom: 0, maxzoom: 14 } }, layers };
  }
  const colors: any[] = ['step', ['coalesce', ['get', 'captured_at'], 0], '#35AF6D'];
  years.forEach((year, i) => {
    const color = palette[i % palette.length];
    colors.push(new Date(Number(year), 0, 1).getTime(), `rgb(${color.slice(0, 3).join(',')})`);
  });
  return {
    version: 8,
    sources: { turbo: { type: 'vector', tiles: [url], minzoom: 0, maxzoom: 14 } },
    layers: [...(!overviewRestricted ? [{ id: 'turbo-overview', source: 'turbo', 'source-layer': 'overview', type: 'circle', maxzoom: 6,
      ...(conditions.length ? { filter: ['all', ...conditions] } : {}),
      paint: { 'circle-radius': 3, 'circle-color': '#35AF6D', 'circle-opacity': 0.8 } }] : []),
      { id: 'turbo-sequences', source: 'turbo', 'source-layer': 'sequence', type: 'line', minzoom: 6,
      ...(conditions.length ? { filter: ['all', ...conditions] } : {}),
      paint: { 'line-color': '#35AF6D', 'line-opacity': 0.8, 'line-width': 2 } },
      ...([{ id: 'turbo-images', source: 'turbo', 'source-layer': 'image', type: 'circle', minzoom: 14,
      ...(conditions.length ? { filter: ['all', ...conditions] } : {}),
      paint: { 'circle-radius': 2.5, 'circle-color': colorByDate && years.length ? colors : '#35AF6D',
        'circle-opacity': 0.9, 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1 },
    }]),
    ],
  };
}

/** Compact tile-coordinate grid. No retained Graphics, features, or metadata. */
export class TurboSpatialIndex {
  static readonly cells = 64;
  readonly xs: Float64Array;
  readonly ys: Float64Array;
  readonly next: Int32Array;
  readonly heads = new Int32Array(TurboSpatialIndex.cells ** 2).fill(-1);
  readonly byteLength: number;
  readonly buffer: ArrayBuffer;
  readonly tile: [number, number, number];
  constructor(buffer: ArrayBuffer, tile: [number, number, number], count: number) {
    this.buffer = buffer; this.tile = tile;
    this.xs = new Float64Array(count); this.ys = new Float64Array(count);
    this.next = new Int32Array(count).fill(-1);
    this.byteLength = buffer.byteLength + count * 20 + this.heads.byteLength;
  }
  static bytes(buffer: ArrayBuffer, count: number): number { return buffer.byteLength + count * 20 + 64 * 64 * 4; }
  async build(layer: { length: number; feature(i: number): any }, signal: AbortSignal): Promise<void> {
    let deadline = performance.now() + 8;
    for (let i = 0; i < layer.length; i++) {
      if ((i & 255) === 0) {
        if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
        if (performance.now() >= deadline) { await new Promise(resolve => setTimeout(resolve, 0)); deadline = performance.now() + 8; }
      }
      const feature = layer.feature(i), point = feature.loadGeometry()?.[0]?.[0];
      const extent = Number(feature.extent) || 4096;
      if (!point || point.x < 0 || point.y < 0 || point.x >= extent || point.y >= extent) continue;
      const x = point.x / extent, y = point.y / extent;
      const cell = Math.min(63, Math.floor(y * 64)) * 64 + Math.min(63, Math.floor(x * 64));
      this.xs[i] = x; this.ys[i] = y; this.next[i] = this.heads[cell]; this.heads[cell] = i;
    }
    if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
  }
  async visit(layer: { feature(i: number): any }, bbox: TurboBbox, filters: TurboFilters, signal: AbortSignal, visit: (point: TurboPoint) => void): Promise<void> {
    let checks = 0, deadline = performance.now() + 8;
    const [tx, ty, z] = this.tile, n = 2 ** z;
    const x = (lon: number) => (lon + 180) / 360 * n - tx;
    const y = (lat: number) => (1 - Math.asinh(Math.tan(Math.max(-85.05112878, Math.min(85.05112878, lat)) * Math.PI / 180)) / Math.PI) / 2 * n - ty;
    const left = x(bbox[0]), right = x(bbox[2]), top = y(bbox[3]), bottom = y(bbox[1]);
    if (right < 0 || left >= 1 || bottom < 0 || top >= 1) return;
    const clamp = (v: number) => Math.max(0, Math.min(63, Math.floor(v * 64)));
    for (let cy = clamp(top); cy <= clamp(bottom); cy++) for (let cx = clamp(left); cx <= clamp(right); cx++) {
      for (let i = this.heads[cy * 64 + cx]; i !== -1; i = this.next[i]) {
        if ((checks++ & 255) === 0 && performance.now() >= deadline) { await new Promise(resolve => setTimeout(resolve, 0)); deadline = performance.now() + 8; }
        if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
        const px = this.xs[i], py = this.ys[i];
        if (px < left || px > right || py < top || py > bottom) continue;
        const props = layer.feature(i).properties;
        if (props.id == null || !turboPointMatches(props, filters)) continue;
        const time = Number(props.captured_at), capturedAt = Number.isFinite(time) && time > 0 ? time : null;
        visit({lon:(tx + px) / n * 360 - 180, lat:Math.atan(Math.sinh(Math.PI * (1 - 2 * (ty + py) / n))) * 180 / Math.PI,
          imageId:String(props.id), sequenceId: nativeSequenceId(props.sequence_id), capturedAt, qualityScore:props.quality_score ?? null, onFoot:typeof props.foot === "boolean" ? props.foot : undefined, year:capturedAt ? String(new Date(capturedAt).getFullYear()) : null});
      }
    }
  }
  async visitIndices(bbox: TurboBbox, signal: AbortSignal, visit: (index: number) => void): Promise<void> {
    let checks = 0, deadline = performance.now() + 8;
    const [tx, ty, z] = this.tile, n = 2 ** z;
    const x = (lon: number) => (lon + 180) / 360 * n - tx;
    const y = (lat: number) => (1 - Math.asinh(Math.tan(Math.max(-85.05112878, Math.min(85.05112878, lat)) * Math.PI / 180)) / Math.PI) / 2 * n - ty;
    const left = x(bbox[0]), right = x(bbox[2]), top = y(bbox[3]), bottom = y(bbox[1]);
    if (right < 0 || left >= 1 || bottom < 0 || top >= 1) return;
    const clamp = (v: number) => Math.max(0, Math.min(63, Math.floor(v * 64)));
    for (let cy = clamp(top); cy <= clamp(bottom); cy++) for (let cx = clamp(left); cx <= clamp(right); cx++) {
      for (let i = this.heads[cy * 64 + cx]; i !== -1; i = this.next[i]) {
        if ((checks++ & 255) === 0 && performance.now() >= deadline) { await new Promise(resolve => setTimeout(resolve, 0)); deadline = performance.now() + 8; }
        if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
        const px = this.xs[i], py = this.ys[i];
        if (px < left || px > right || py < top || py > bottom) continue;
        visit(i);
      }
    }
  }
}

export class TurboIndexCache {
  private entries = new Map<string, TurboSpatialIndex>();
  private bytes = 0;
  readonly limit: number;
  constructor(limit = 24 * 1024 * 1024) { this.limit = limit; }
  get byteLength(): number { return this.bytes; }
  get(key: string): TurboSpatialIndex | undefined {
    const value = this.entries.get(key);
    if (value) { this.entries.delete(key); this.entries.set(key, value); }
    return value;
  }
  reserve(bytes: number): boolean {
    if (bytes > this.limit) return false;
    while (this.entries.size && (this.bytes + bytes > this.limit || this.entries.size >= 8)) {
      const key = this.entries.keys().next().value!;
      this.bytes -= this.entries.get(key)!.byteLength; this.entries.delete(key);
    }
    return true;
  }
  set(key: string, value: TurboSpatialIndex): void {
    const old = this.entries.get(key);
    if (old) { this.bytes -= old.byteLength; this.entries.delete(key); }
    if (this.reserve(value.byteLength)) { this.entries.set(key, value); this.bytes += value.byteLength; }
  }
  clear(): void { this.entries.clear(); this.bytes = 0; }
}


/** Minimal longitude arc: don't request a world of tiles at the dateline. */
export function turboFootprintBboxes(points: readonly { lon: number; lat: number }[]): TurboBbox[] {
  const valid = points.filter(p => Number.isFinite(p.lon) && Number.isFinite(p.lat) && Math.abs(p.lat) <= 85.05112878);
  if (!valid.length) return [];
  const lons = valid.map(p => ((p.lon + 180) % 360 + 360) % 360 - 180).sort((a,b) => a-b);
  let gap = -1, index = 0;
  for (let i=0; i<lons.length; i++) {
    const distance = (i+1<lons.length ? lons[i+1] : lons[0]+360)-lons[i];
    if (distance>gap) { gap=distance; index=i; }
  }
  const west=lons[(index+1)%lons.length], east=lons[index];
  const south=Math.min(...valid.map(p=>p.lat)), north=Math.max(...valid.map(p=>p.lat));
  return west<=east ? [[west,south,east,north]] : [[west,south,180,north],[-180,south,east,north]];
}

/** Stores small JSON metadata only, never thumbnails/Graphics/DOM nodes. */
export class TurboMetadataCache<T> {
  private entries = new Map<string,{value:T;expires:number}>();
  private limit: number; private ttl: number; private now: () => number;
  constructor(limit=32, ttl=5*60*1000, now=Date.now) {this.limit=limit;this.ttl=ttl;this.now=now;}
  get size(): number {return this.entries.size;}
  get(key:string): T | undefined {
    const entry=this.entries.get(key);
    if(!entry)return;
    this.entries.delete(key);
    if(entry.expires<=this.now())return;
    this.entries.set(key,entry);return entry.value;
  }
  set(key:string,value:T):void {
    this.entries.delete(key);
    while(this.entries.size>=this.limit && this.entries.size)this.entries.delete(this.entries.keys().next().value!);
    if(this.limit>0)this.entries.set(key,{value,expires:this.now()+this.ttl});
  }
  clear():void {this.entries.clear();}
}

/** Thumbnail-space bounds. Invalid geometry must never produce a misplaced outline. */
export function detectionThumbnailBounds(points: number[][]): { x: number; y: number; width: number; height: number } | undefined {
  if (points.length < 3 || points.some(p => p.length < 2 || !Number.isFinite(p[0]) || !Number.isFinite(p[1]) || p[0] < 0 || p[0] > 1 || p[1] < 0 || p[1] > 1)) return undefined;
  const xs = points.map(p => p[0]), ys = points.map(p => p[1]);
  const x = Math.min(...xs), y = Math.min(...ys), width = Math.max(...xs) - x, height = Math.max(...ys) - y;
  return width > 0 && height > 0 ? { x, y, width, height } : undefined;
}
