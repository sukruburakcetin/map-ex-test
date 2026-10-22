/** Retained point-cloud CSV encoding; UI feedback and downloads remain runtime-owned. */
import type { PointCloudPoint } from '../../utils/pointCloudUtils';

/**
 * Encode every retained point with existing geographic/nudge math and RGB handling.
 * Preserve column order, precision and default colors. Yield every 4096 points
 * so CSV preparation does not monopolize the browser's event loop.
 * @param points Retained cloud points; never the sampled display subset.
 * @param nudgeX East offset in metres.
 * @param nudgeY North offset in metres.
 * @param nudgeZ Elevation offset in metres; source vertical datum is unchanged.
 * @param cameraLat Camera latitude in degrees, used for longitude conversion.
 */
export async function buildPointCloudCsv(points: readonly PointCloudPoint[], nudgeX: number, nudgeY: number, nudgeZ: number, cameraLat: number): Promise<string> {
    // 1. Calculate the user's active Nudge calibration
    const nudgeLat = nudgeY / 111320;
    const nudgeLon = nudgeX / (111320 * Math.cos((cameraLat * Math.PI) / 180));

    // 2. Build the standard CSV Headers
    let csvContent = "Longitude,Latitude,Elevation,R,G,B\n";

    // 3. Loop through all points and format them
    let exportIndex = 0;
    for (const p of points) {
      if (++exportIndex % 4096 === 0) await new Promise(resolve => setTimeout(resolve, 0));
      // Apply calibration offsets
      const finalLon = (p.lon + nudgeLon).toFixed(7);
      const finalLat = (p.lat + nudgeLat).toFixed(7);
      const finalZ = (p.alt + nudgeZ).toFixed(3);

      // Format colors safely (Mapillary sometimes uses 0-1 floats or 0-255 ints)
      let pr = p.r ?? 160,
        pg = p.g ?? 160,
        pb = p.b ?? 160;
      if (pr <= 1 && pg <= 1 && pb <= 1 && (pr > 0 || pg > 0 || pb > 0)) {
        pr = Math.round(pr * 255);
        pg = Math.round(pg * 255);
        pb = Math.round(pb * 255);
      }

      csvContent += `${finalLon},${finalLat},${finalZ},${pr},${pg},${pb}\n`;
    }

    return csvContent;
}
