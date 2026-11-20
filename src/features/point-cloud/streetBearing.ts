import { calculateBearing, distanceMeters } from "../../utils/geoUtils";

export interface StreetBearingPoint { id: string | number; lat: number; lon: number; }

/** Preserve the sequence corridor direction, looking past GPS jitter before using neighbours. */
export function streetBearing(
  sequenceImages: readonly StreetBearingPoint[] | null | undefined,
  imageId: string | number | null | undefined,
  fallback: number,
): number {
  if (!sequenceImages || !imageId) return fallback;

  const currentIdx = sequenceImages.findIndex((img) => String(img.id) === String(imageId));
  if (currentIdx === -1) return fallback;

  const currentImg = sequenceImages[currentIdx];

  // 1. Look ahead at least 15 meters to bypass GPS jitter
  for (let i = currentIdx + 1; i < sequenceImages.length; i++) {
    const img = sequenceImages[i];
    if (distanceMeters(currentImg.lat, currentImg.lon, img.lat, img.lon) >= 15) {
      return calculateBearing(currentImg.lat, currentImg.lon, img.lat, img.lon);
    }
  }

  // 2. If at the end, look behind at least 15 meters
  for (let i = currentIdx - 1; i >= 0; i--) {
    const img = sequenceImages[i];
    if (distanceMeters(img.lat, img.lon, currentImg.lat, currentImg.lon) >= 15) {
      return calculateBearing(img.lat, img.lon, currentImg.lat, currentImg.lon);
    }
  }

  // 3. Fallback to immediate neighbors
  if (currentIdx < sequenceImages.length - 1) {
    return calculateBearing(currentImg.lat, currentImg.lon, sequenceImages[currentIdx + 1].lat, sequenceImages[currentIdx + 1].lon);
  } else if (currentIdx > 0) {
    return calculateBearing(sequenceImages[currentIdx - 1].lat, sequenceImages[currentIdx - 1].lon, currentImg.lat, currentImg.lon);
  }

  return fallback;
}
