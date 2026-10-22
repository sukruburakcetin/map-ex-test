/** Detection lookup and source-date provenance helpers; viewer state remains runtime-owned. */
import { GRAPH_API } from '../../utils/constants';

export interface DetectionLookupDependencies {
  fetchJson: (url: string, accessToken: string, signal?: AbortSignal) => Promise<any>;
  getToken: () => string;
}

/** Explain conflicting source dates without converting last-seen dates into capture dates. */
export function objectDateNotice(lastSeenValue: string | number | undefined, alternateImages: { capturedAt: number }[]): string | null {
    const value = lastSeenValue;
    if (value == null) return null;
    const lastSeen = new Date(typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value).getTime();
    const latestCapture = Math.max(...(alternateImages || []).map((img: { capturedAt: number }) => img.capturedAt).filter(Number.isFinite));
    return Number.isFinite(lastSeen) && latestCapture > lastSeen + 24 * 60 * 60 * 1000
      ? "Mapillary reports an object last-seen date earlier than an associated image's capture date. These source dates disagree."
      : null;
  }

/**
 * Find an image detection in up to five pages; abort/repeated/invalid pages return null.
 * Only HTTPS graph.mapillary.com pagination is followed. Request failures propagate.
 */
export async function lookupImageDetection(dependencies: DetectionLookupDependencies, imageId: string, detectionId: string, signal: AbortSignal): Promise<any | null> {
    let next = `${GRAPH_API.BASE}/${imageId}/detections?fields=id,value,geometry&limit=100`;
    const visited = new Set<string>();
    for (let page = 0; next && page < 5; page++) {
      if (signal.aborted || visited.has(next)) return null;
      visited.add(next);
      const data = await dependencies.fetchJson(next, dependencies.getToken(), signal);
      if (signal.aborted || !Array.isArray(data.data)) return null;
      const detection = data.data.find((item: any) => String(item.id) === String(detectionId));
      if (detection) return detection;
      next = data.paging?.next || "";
      // Forward credentials only to Mapillary's HTTPS Graph endpoint.
      if (next) { const url = new URL(next); if (url.protocol !== "https:" || url.hostname !== "graph.mapillary.com") return null; }
    }
    return null;
  }
