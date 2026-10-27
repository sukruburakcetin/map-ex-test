import { distanceMeters } from '../../utils/geoUtils';
/** Shortest-longitude midpoint, with approximate straight-line distance (not a route). */
export function cameraLinkDistance(camera: readonly number[], place: readonly number[]): { lon: number; lat: number; text: string } | null {
  if (camera.length < 2 || place.length < 2 || ![camera[0], camera[1], place[0], place[1]].every(Number.isFinite) || Math.abs(camera[0]) > 180 || Math.abs(place[0]) > 180 || Math.abs(camera[1]) > 90 || Math.abs(place[1]) > 90) return null;
  const distance = distanceMeters(camera[1], camera[0], place[1], place[0]);
  const dx = ((place[0] - camera[0] + 540) % 360) - 180;
  const lon = ((camera[0] + dx / 2 + 540) % 360) - 180;
  const text = distance < 1 ? '<1 m' : distance < 1000 ? `${Math.round(distance)} m` : `${(distance / 1000).toFixed(1)} km`;
  return { lon, lat: (camera[1] + place[1]) / 2, text };
}
