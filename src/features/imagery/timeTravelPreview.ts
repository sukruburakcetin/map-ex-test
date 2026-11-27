/** On-demand thumbnail comparison; independent of viewer navigation and coverage. */
import { GRAPH_API, BBOX, LIMITS, TIME_TRAVEL, SHARE_PARAMS } from '../../utils/constants';
import { distanceMeters } from '../../utils/geoUtils';
export interface TravelCapture { id: string; url: string; capturedAt: number; distance: number; pano: boolean; }
export interface TravelPreview { current: TravelCapture; alternatives: TravelCapture[]; }
const fields = 'id,captured_at,computed_geometry,geometry,computed_compass_angle,compass_angle,is_pano,sequence,thumb_1024_url';
const time = (value: any): number => new Date(value).getTime();
const coordinates = (image: any): number[] | undefined => image.computed_geometry?.coordinates;
const capture = (image: any, distance = 0): TravelCapture => ({ id: String(image.id), url: image.thumb_1024_url,
 capturedAt: time(image.captured_at), distance, pano: !!image.is_pano });
export function relatedCaptures(current: any, images: any[]): TravelCapture[] {
 const origin = coordinates(current), seen = new Set<string>();
 if (!origin?.every(Number.isFinite)) return [];
 return images.flatMap(image => {
  const point = coordinates(image), id = String(image.id), date = time(image.captured_at);
  if (!image.id || seen.has(id) || id === String(current.id) || image.sequence === current.sequence || !image.thumb_1024_url ||
      !point?.every(Number.isFinite) || !Number.isFinite(date) || !Number.isFinite(time(current.captured_at)) ||
      Math.abs(date - time(current.captured_at)) < TIME_TRAVEL.MIN_GAP_MS) return [];
  const distance = distanceMeters(origin[1], origin[0], point[1], point[0]);
  if (distance > TIME_TRAVEL.MAX_DISTANCE_M) return [];
  if (!current.is_pano && !image.is_pano) {
   const a = current.computed_compass_angle ?? current.compass_angle, b = image.computed_compass_angle ?? image.compass_angle;
   if (!Number.isFinite(a) || !Number.isFinite(b)) return [];
   const difference = Math.abs(a-b)%360;
   if (Math.min(difference,360-difference) > TIME_TRAVEL.MAX_ANGLE_DEG) return [];
  }
  seen.add(id);return [capture(image,distance)];
 }).sort((a,b)=>b.capturedAt-a.capturedAt || a.distance-b.distance || a.id.localeCompare(b.id)).slice(0,12);
}
export interface SharedComparison {
 imageId: string; startId: string; compareId: string; split: number;
}
const comparisonParam = 'mlyCompare';
const imageKey = /^\d{1,30}$/;
export function readSharedComparison(params: URLSearchParams): SharedComparison | undefined {
 const imageId = params.get(SHARE_PARAMS.IMAGE_ID) || '';
 const match = /^(\d{1,30})\.(\d{1,30})\.(\d{1,30})\.(\d{1,3})$/.exec(params.get(comparisonParam) || '');
 if (!match || match[1] !== imageId || match[2] === match[3] || Number(match[4]) > 100) return;
 return { imageId, startId: match[2], compareId: match[3], split: Number(match[4]) };
}
export function applySharedComparison(url: URL, comparison?: SharedComparison): void {
 url.searchParams.delete(comparisonParam);
 if (!comparison) return;
 const {imageId,startId,compareId,split} = comparison;
 if (![imageId,startId,compareId].every(id=>imageKey.test(id)) || startId===compareId ||
     !Number.isInteger(split) || split<0 || split>100) throw new Error('Invalid comparison.');
 url.searchParams.set(SHARE_PARAMS.IMAGE_ID,imageId);
 url.searchParams.set(comparisonParam,`${imageId}.${startId}.${compareId}.${split}`);
}

const noteComparisonPrefix = 'Mapillary comparison: ';
export function comparisonNoteAttachment(value: string): {text: string; comparison?: SharedComparison} {
 const lines=value.split('\n');
 const last=lines[lines.length-1];
 if (!last?.startsWith(noteComparisonPrefix)) return {text:value};
 const comparison=readSharedComparison(new URLSearchParams(last.slice(noteComparisonPrefix.length)));
 return comparison?{text:lines.slice(0,-1).join('\n').trimEnd(),comparison}:{text:value};
}
export function withComparisonNoteAttachment(text: string, comparison?: SharedComparison): string {
 if(!comparison)return text;
 const url=new URL('https://example.invalid');
 applySharedComparison(url,comparison);
 return `${text.trimEnd()}\n${noteComparisonPrefix}${url.search.slice(1)}`;
}
export function comparisonNoteHref(comparison: SharedComparison, point: {lon:number;lat:number}): string | undefined {
 try {
  let href=window.location.href;
  try {href=window.parent.location.href;} catch { /* A cross-origin shell cannot supply its URL. */ }
  const url=new URL(href);
  if(!['http:','https:'].includes(url.protocol))return;
  applySharedComparison(url,comparison);
  if(Number.isFinite(point.lat)&&Number.isFinite(point.lon)){
   url.searchParams.set(SHARE_PARAMS.LAT,point.lat.toFixed(6));
   url.searchParams.set(SHARE_PARAMS.LON,point.lon.toFixed(6));
  }
  url.hash='';
  return url.href;
 }catch{return undefined;}
}

export async function loadTimeTravelPreview(imageId: string, token: string, signal: AbortSignal, comparison?: SharedComparison): Promise<TravelPreview> {
 const read = async (url: string) => {
  if(signal.aborted) throw new DOMException('Cancelled','AbortError');
  const response = await fetch(url,{signal});
  if (!response.ok) throw new Error('Time travel could not load. Please try again.');
  const result = await response.json();
  if(signal.aborted) throw new DOMException('Cancelled','AbortError');
  if(result.error) throw new Error('Time travel could not load. Please try again.');
  return result;
 };
 const auth = encodeURIComponent(token);
 const byId = (id: string) => read(`${GRAPH_API.BASE}/${encodeURIComponent(id)}?fields=${fields}&access_token=${auth}`);
 if (comparison?.imageId === imageId) {
  const ids = [...new Set([imageId,comparison.startId,comparison.compareId])];
  const captures = await Promise.all(ids.map(byId));
  if (captures.some((item,index)=>String(item.id)!==ids[index] || !item.thumb_1024_url))
   throw new Error('Shared comparison unavailable.');
  const origin = coordinates(captures[0]);
  return {current:capture(captures[0]),alternatives:captures.slice(1).map(item=>{
   const point = coordinates(item);
   const distance = origin?.slice(0,2).length===2&&point?.slice(0,2).length===2&&
    origin.slice(0,2).every(Number.isFinite)&&point.slice(0,2).every(Number.isFinite)
    ? distanceMeters(origin[1],origin[0],point[1],point[0]):NaN;
   return capture(item,distance);
  })};
 }
 const current = await byId(imageId);
 const origin = coordinates(current);
 if (!origin?.every(Number.isFinite) || !current.thumb_1024_url) throw new Error('A preview is not available for this image.');
 const offset=BBOX.TIME_TRAVEL, bbox=[origin[0]-offset,origin[1]-offset,origin[0]+offset,origin[1]+offset].join(',');
 const url = `${GRAPH_API.BASE}/images?bbox=${bbox}&fields=${fields}&limit=${LIMITS.TIME_TRAVEL_CANDIDATES}&access_token=${auth}`;
 const images: any[] = [];
 const visited = new Set<string>();
 let pageUrl = url;
 for (let page = 0; page < 3; page++) {
  const result = await read(pageUrl);
  if (!Array.isArray(result.data)) throw new Error('Time travel returned an invalid candidate list.');
  images.push(...result.data);
  const next = result.paging?.next;
  if (typeof next !== 'string' || !next) break;
  let cursor = result.paging?.cursors?.after;
  if (typeof cursor !== 'string' || !cursor) {
   try { cursor = new URL(next, url).searchParams.get('after'); }
   catch { break; }
  }
  if (typeof cursor !== 'string' || !cursor || visited.has(cursor)) break;
  visited.add(cursor);
  pageUrl = `${url}&after=${encodeURIComponent(cursor)}`;
 }
 return {current:capture(current),alternatives:relatedCaptures(current,images)};
}

/** Preserve a successful nearby search across brief dialog closes. Shared links resolve their exact IDs. */
export function createTimeTravelPreviewLoader(load = loadTimeTravelPreview) {
 const cache = new Map<string, {preview: TravelPreview; expires: number}>();
 let scope: string | undefined;
 return async (imageId: string, token: string, signal: AbortSignal, comparison?: SharedComparison): Promise<TravelPreview> => {
  if (signal.aborted) throw new DOMException('Cancelled','AbortError');
  if (comparison) return load(imageId, token, signal, comparison);
  if (scope !== token) {
   scope = token;
   cache.clear();
  }
  const cached = cache.get(imageId);
  cache.delete(imageId);
  if (cached && cached.expires > Date.now()) {
   cache.set(imageId, cached);
   return cached.preview;
  }
  const preview = await load(imageId, token, signal);
  if (!signal.aborted && scope === token) {
   cache.set(imageId, { preview, expires: Date.now() + (preview.alternatives.length ? 120_000 : 10_000) });
   while (cache.size > 16) cache.delete(cache.keys().next().value!);
  }
  return preview;
 };
}
