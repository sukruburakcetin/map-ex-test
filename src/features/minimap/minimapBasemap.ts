interface MinimapBasemap<B> {
  id?: string;
  toJSON(): unknown;
  clone(): B;
}

/** Preserve standard-ID, JSON-copy and existing fallback behavior without owning a map/view. */
export function resolveMinimapBasemap<B extends MinimapBasemap<B>>(
  readMainBasemap: () => B | null | undefined,
  fromJSON: (json: unknown) => B,
  warn: (...args: unknown[]) => void,
): string | B {
  // 2. Advanced Basemap Duplication Strategy
  let basemapConfig: string | B = "topo-vector"; // Fallback

  try {
    const mainBasemap = readMainBasemap();
    if (mainBasemap) {
      const standardIds = [
        "satellite",
        "hybrid",
        "oceans",
        "osm",
        "terrain",
        "dark-gray",
        "dark-gray-vector",
        "gray",
        "gray-vector",
        "streets",
        "streets-vector",
        "streets-night-vector",
        "streets-relief-vector",
        "streets-navigation-vector",
        "topo",
        "topo-vector",
      ];

      if (mainBasemap.id && standardIds.includes(mainBasemap.id)) {
        // A. Simple String ID (Fastest)
        basemapConfig = mainBasemap.id;
      } else {
        // B. Custom Basemap: JSON Serialization (Safe Deep Copy)
        // Using .clone() shares resources and breaks the main map on destroy.
        // Using .toJSON() -> .fromJSON() forces a completely new, independent instance.
        try {
          const basemapJson = mainBasemap.toJSON();
          // Rehydrate a new Basemap instance from the JSON definition
          basemapConfig = fromJSON(basemapJson);
        } catch (jsonErr) {
          warn("Failed to serialize custom basemap via JSON, falling back to clone (risky) or default.", jsonErr);
          // Last resort fallback if JSON fails
          basemapConfig = mainBasemap.clone();
        }
      }
    }
  } catch (err) {
    warn("Could not determine basemap, using default");
  }
  return basemapConfig;
}
