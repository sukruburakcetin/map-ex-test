/** Existing time-travel availability discovery; viewer navigation stays runtime-owned. */
import { GRAPH_API, BBOX, LIMITS, TIME_TRAVEL as TIME_TRAVEL_THRESHOLDS } from '../../utils/constants';
import { distanceMeters } from '../../utils/geoUtils';

/**
 * Check reconstructed nearby frames using the current sequence/date/distance/angle rules.
 * Read the live token for each request and report availability through the UI callback.
 * Preserve the existing non-OK current-image response (no update), missing-data/error
 * fallbacks, panorama angle exception and request policy; no cancellation added.
 */
export async function checkTimeTravelAvailability(currentImageId: string, getToken: () => string, applyAvailable: (available: boolean) => void): Promise<void> {
    if (!currentImageId) {
      applyAvailable(false);
      return;
    }

    try {
      // 1. Fetch current image including COMPUTED fields and SEQUENCE
      const currentResp = await fetch(
        `${GRAPH_API.BASE}/${currentImageId}?fields=geometry,computed_geometry,captured_at,
                computed_compass_angle,compass_angle,is_pano,sequence&access_token=${getToken()}`,
      );
      if (!currentResp.ok) return;
      const cData = await currentResp.json();

      // Mapillary only allows Time Travel for images successfully reconstructed (Computed)
      // If computed_geometry is missing, the official web app usually hides Time Travel.
      if (!cData.computed_geometry) {
        applyAvailable(false);
        return;
      }

      const cCoords = cData.computed_geometry.coordinates;
      const cAngle = cData.computed_compass_angle ?? cData.compass_angle;
      const cSeq = cData.sequence;
      const cTime = new Date(cData.captured_at).getTime();

      // 2. Search candidates (requesting computed fields and sequence)
      const offset = BBOX.TIME_TRAVEL;
      const bbox = `${cCoords[0] - offset},${cCoords[1] - offset},${cCoords[0] + offset},${cCoords[1] + offset}`;
      const candidatesUrl = `${GRAPH_API.BASE}/images?bbox=${bbox}&fields=id,captured_at,compass_angle,computed_compass_angle,
            is_pano,geometry,computed_geometry,sequence&limit=${LIMITS.TIME_TRAVEL_CANDIDATES}&access_token=${getToken()}`;

      const candidatesResp = await fetch(candidatesUrl);
      const candidatesData = await candidatesResp.json();

      if (candidatesData.data && candidatesData.data.length > 0) {
        const hasValidMatch = candidatesData.data.some((img: any) => {
          if (img.id === currentImageId) return false;

          // RULE 1: Ignore images from the same drive
          if (img.sequence === cSeq) return false;

          // RULE 2: Must be a different day
          const imgTime = new Date(img.captured_at).getTime();
          if (Math.abs(imgTime - cTime) < TIME_TRAVEL_THRESHOLDS.MIN_GAP_MS) return false;

          // RULE 3: Reconstruction Check
          // If candidate wasn't reconstructed, Mapillary website won't show it.
          if (!img.computed_geometry) return false;

          // RULE 4: Strict distance check using Computed Geometry
          const iCoords = img.computed_geometry.coordinates;
          const dist = distanceMeters(cCoords[1], cCoords[0], iCoords[1], iCoords[0]);
          if (dist > TIME_TRAVEL_THRESHOLDS.MAX_DISTANCE_M) return false;

          // RULE 5: Strict angle check using Computed Angle
          if (cData.is_pano || img.is_pano) return true;

          const iAngle = img.computed_compass_angle ?? img.compass_angle;
          if (cAngle !== null && iAngle !== null) {
            const diff = Math.abs(cAngle - iAngle) % 360;
            const shortestDiff = diff > 180 ? 360 - diff : diff;
            return shortestDiff <= TIME_TRAVEL_THRESHOLDS.MAX_ANGLE_DEG;
          }

          return false;
        });

        applyAvailable(hasValidMatch);
      } else {
        applyAvailable(false);
      }
    } catch (err) {
      applyAvailable(false);
    }
  }
