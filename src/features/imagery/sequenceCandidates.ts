/** Nearby sequence candidate discovery for representative-image navigation. */
import { BBOX, GRAPH_API, LIMITS } from '../../utils/constants';
import { distanceMeters } from '../../utils/geoUtils';

/**
 * Query a small WGS84 bounding box, group images by sequence and return at most
 * ten closest groups within 15 metres. Preserve each group's earliest capture.
 * This retains the existing single-fetch policy; it does not use Graph retries.
 * @param lon Anchor longitude in decimal degrees.
 * @param lat Anchor latitude in decimal degrees.
 * @param accessToken Application token used in the OAuth request header.
 */
export async function findSequenceCandidates(lon: number, lat: number, accessToken: string) {
    // Slightly increased bbox (approx 10m) to ensure hits, but we strictly limit the results below
    const bboxSize = BBOX.SEQUENCE_SEARCH;

    // Reduced API limit from 500 to 200 to save bandwidth/parsing time
    const url = `${GRAPH_API.BASE}/images?fields=id,geometry,sequence,captured_at&bbox=${
      lon - bboxSize
    },${lat - bboxSize},${lon + bboxSize},${lat + bboxSize}&limit=${LIMITS.SEQUENCE_SEARCH_IMAGES}`;

    const response = await fetch(url, {
      headers: { Authorization: `OAuth ${accessToken}` },
    });
    const data = await response.json();
    if (!data.data?.length) return [];

    const grouped: Record<
      string,
      {
        sequenceId: string;
        images: { id: string; lon: number; lat: number; capturedAt?: string; dist: number }[];
        capturedAt?: string;
        minDistance: number;
      }
    > = {};

    for (const img of data.data) {
      const seqId = img.sequence;
      const coords = img.geometry?.coordinates;
      const capturedAt = img.captured_at;

      if (!seqId || !coords) continue;

      const distance = distanceMeters(lat, lon, coords[1], coords[0]);

      // Filter out noise > 15 meters away
      if (distance > 15) continue;

      if (!grouped[seqId]) {
        grouped[seqId] = {
          sequenceId: seqId,
          images: [],
          capturedAt,
          minDistance: distance,
        };
      }

      grouped[seqId].images.push({
        id: img.id,
        lon: coords[0],
        lat: coords[1],
        capturedAt,
        dist: distance,
      });

      if (distance < grouped[seqId].minDistance) {
        grouped[seqId].minDistance = distance;
      }

      if (!grouped[seqId].capturedAt || (capturedAt && capturedAt < grouped[seqId].capturedAt)) {
        grouped[seqId].capturedAt = capturedAt;
      }
    }

    // Sort by distance AND slice to return only the top 10 closest sequences.
    return Object.values(grouped)
      .sort((a, b) => a.minDistance - b.minDistance)
      .slice(0, 10);
  }
