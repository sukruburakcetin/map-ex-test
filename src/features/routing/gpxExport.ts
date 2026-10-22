/** Capture-route GPX serialization and browser download; no route recalculation. */
import type { RouteData } from '../../components/types';

/**
 * Export retained route coordinates in source order using existing GPX 1.1 XML.
 * No route is a no-op. Creates/clicks/removes a temporary download link and
 * revokes its object URL immediately, preserving the existing browser behavior.
 */
export function downloadCaptureRouteGPX(routeData: RouteData | null | undefined): void {
    if (!routeData) return;

    const coords = routeData.geojson.coordinates;

    // GPX DOCUMENT
    let gpx = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    gpx += `<gpx version="1.1" creator="MapillaryExplorer" xmlns="http://www.topografix.com/GPX/1/1"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">\n`;
    gpx += `  <trk>\n    <name>Mapillary Capture Route</name>\n    <trkseg>\n`;

    coords.forEach((coord: [number, number]) => {
      gpx += `      <trkpt lat="${coord[1]}" lon="${coord[0]}"></trkpt>\n`;
    });

    gpx += `    </trkseg>\n  </trk>\n</gpx>`;

    // DOWNLOAD
    const blob = new Blob([gpx], { type: "application/gpx+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Mapillary_Route_${Date.now()}.gpx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
