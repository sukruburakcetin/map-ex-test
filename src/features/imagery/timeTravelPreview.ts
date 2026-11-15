/** On-demand thumbnail comparison; independent of viewer navigation and coverage. */
import { GRAPH_API, BBOX, LIMITS, TIME_TRAVEL } from '../../utils/constants';
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
 }).sort((a,b)=>b.capturedAt-a.capturedAt || a.distance-b.distance).slice(0,12);
}
export async function loadTimeTravelPreview(imageId: string, token: string, signal: AbortSignal): Promise<TravelPreview> {
 const read = async (url: string) => {
  if(signal.aborted) throw new DOMException('Cancelled','AbortError');
  const response = await fetch(url,{signal});
  if (!response.ok) throw new Error('Time travel could not load. Please try again.');
  const result = await response.json();
  if(signal.aborted) throw new DOMException('Cancelled','AbortError');
  if(result.error) throw new Error('Time travel could not load. Please try again.');
  return result;
 };
 const auth = encodeURIComponent(token), current = await read(`${GRAPH_API.BASE}/${encodeURIComponent(imageId)}?fields=${fields}&access_token=${auth}`);
 const origin = coordinates(current);
 if (!origin?.every(Number.isFinite) || !current.thumb_1024_url) throw new Error('A preview is not available for this image.');
 const offset=BBOX.TIME_TRAVEL, bbox=[origin[0]-offset,origin[1]-offset,origin[0]+offset,origin[1]+offset].join(',');
 const result=await read(`${GRAPH_API.BASE}/images?bbox=${bbox}&fields=${fields}&limit=${LIMITS.TIME_TRAVEL_CANDIDATES}&access_token=${auth}`);
 return {current:capture(current),alternatives:relatedCaptures(current,Array.isArray(result.data)?result.data:[])};
}
