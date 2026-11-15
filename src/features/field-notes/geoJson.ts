/** Field-note GeoJSON conversion only. File I/O and update coordination belong to FieldNoteFiles; persistence/renderers keep their owners. */
import type { FieldNote } from '../../components/types';

/** Preserve all exported note metadata and optional altitude; dates use ISO timestamps. */
export function fieldNotesToGeoJson(notes: FieldNote[]) {
  return {
    type: "FeatureCollection",
    features: notes.map((n) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: n.alt !== undefined ? [n.lon, n.lat, n.alt] : [n.lon, n.lat],
      },
      properties: {
        id: n.id,
        source: n.source,
        category: n.category,
        note: n.note,
        imageId: n.imageId,
        detectionId: n.detectionId ?? null,
        alt: n.alt,
        createdAt: new Date(n.createdAt).toISOString(),
        status: n.status || "open", resolutionNote: n.resolutionNote || "",
        sharedGlobalId: n.sharedGlobalId, sharedLayerUrl: n.sharedLayerUrl, sharedStatus: n.sharedStatus,
      },
    })),
  };
}

/** Decode the existing import format and defaults. Coordinate altitude takes precedence over properties.alt. Missing feature arrays throw; duplicates are handled by the caller. */
export function fieldNotesFromGeoJson(geojson: any): FieldNote[] {
  if (!geojson.features || !Array.isArray(geojson.features)) {
    throw new Error("Geçersiz format: 'features' dizisi bulunamadı");
  }

  return geojson.features
    .filter((f: any) => f?.geometry?.coordinates && f?.properties)
    .map((f: any) => ({
      id: f.properties.id ?? `note_${Date.now()}_${Math.round(Math.random() * 100000)}`,
      source: f.properties.source === "mapillary-detection" ? "mapillary-detection" : "manual",
      status: ["open", "in_progress", "completed", "dismissed"].includes(f.properties.status) ? f.properties.status : "open",
      resolutionNote: f.properties.resolutionNote || "",
      category: f.properties.category ?? "Diğer",
      note: f.properties.note ?? "",
      lon: f.geometry.coordinates[0],
      lat: f.geometry.coordinates[1],
      alt: f.geometry.coordinates[2] !== undefined ? f.geometry.coordinates[2] : f.properties.alt,
      imageId: f.properties.imageId ?? null,
      detectionId: f.properties.detectionId ?? undefined,
      sharedGlobalId: f.properties.sharedGlobalId, sharedLayerUrl: f.properties.sharedLayerUrl,
      sharedStatus: f.properties.sharedStatus === "shared" ? "shared" : f.properties.sharedGlobalId ? "failed" : undefined,
      createdAt: f.properties.createdAt ? new Date(f.properties.createdAt).getTime() : Date.now(),
    }));
}
