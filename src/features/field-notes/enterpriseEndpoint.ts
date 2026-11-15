/** Enterprise endpoint selection and SDK URL identity; no network, authentication or configuration mutation. */
export interface EnterpriseNotesEndpointConfig {
  sharedFieldNotesEnabled?: boolean;
  sharedFieldNotesUrl?: string;
  sharedFieldNotesReadUrl?: string;
}

/**
 * Select the read-only endpoint for reads, falling back to the editable endpoint.
 * Disabled/missing configuration returns an empty string. Invalid URLs throw before SDK access.
 * Accept only HTTPS FeatureServer layer endpoints without credentials, query strings or fragments;
 * authentication remains the ArcGIS SDK's responsibility. Preserve the existing URL normalization.
 */
export function resolveEnterpriseNotesEndpoint(config: EnterpriseNotesEndpointConfig, read = false): string {
    if (!config.sharedFieldNotesEnabled) return "";
    const value = String(read ? config.sharedFieldNotesReadUrl || config.sharedFieldNotesUrl || "" : config.sharedFieldNotesUrl || "").trim().replace(/\/$/, "");
    if (!value) return "";
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || !/\/FeatureServer\/\d+$/i.test(url.pathname)) throw new Error("Use an HTTPS point layer URL ending in /FeatureServer/0, without tokens or query parameters.");
    return url.href.replace(/\/$/, "");
}

/** Match a configured layer endpoint after ArcGIS splits its service URL and layer ID. */
export function matchesEnterpriseLayerUrl(layer: { url?: string | null; layerId?: number | null } | null | undefined, endpoint: string): boolean {
  if (!layer?.url || !endpoint) return false;
  const actual = layer.url.replace(/\/+$/, '');
  const expected = endpoint.replace(/\/+$/, '');
  if (actual === expected) return true;
  return /\/FeatureServer$/i.test(actual) && Number.isInteger(layer.layerId) && `${actual}/${layer.layerId}` === expected;
}

