/** Viewer note buffer calculation only; Mapillary/WebGL lifecycle and shader behavior remain runtime-owned. */
export interface ViewerNotePosition {
  lon: number;
  lat: number;
  alt?: number | null;
  source: string;
}
export interface ViewerNoteReference {
  lng: number;
  lat: number;
  alt?: number;
}
export type NoteEnuProjector = (longitude: number, latitude: number, altitude: number,
  referenceLongitude: number, referenceLatitude: number, referenceAltitude: number) => readonly number[];

/**
 * Build ENU XYZ positions and normalized RGB colors in source order, with one projection per note.
 * Explicit altitude (including zero) wins; otherwise use the active nonzero cloud base altitude,
 * falling back to one metre below the camera reference. A missing reference altitude behaves as zero.
 * Preserve Float32 rounding and the existing source colors. No filtering, GPU uploads or SDK allocation occurs.
 */
export function buildViewerNoteBuffers(notes: readonly ViewerNotePosition[], reference: ViewerNoteReference,
  pointCloudVisible: boolean, baseAltitude: number, project: NoteEnuProjector): { positions: Float32Array; colors: Float32Array } {
  const positions = new Float32Array(notes.length * 3);
  const colors = new Float32Array(notes.length * 3);

  notes.forEach((n, i) => {
    const refAlt = reference.alt || 0;

    let fallbackAlt = refAlt - 1.0;

    if (pointCloudVisible && baseAltitude !== 0) {
      fallbackAlt = baseAltitude;
    }

    const finalAlt = n.alt !== undefined && n.alt !== null ? n.alt : fallbackAlt;

    const enu = project(n.lon, n.lat, finalAlt, reference.lng, reference.lat, refAlt);

    positions[i * 3] = enu[0];
    positions[i * 3 + 1] = enu[1];
    positions[i * 3 + 2] = enu[2];

    if (n.source === "manual") {
      colors[i * 3] = 245 / 255;
      colors[i * 3 + 1] = 166 / 255;
      colors[i * 3 + 2] = 35 / 255;
    } else {
      colors[i * 3] = 53 / 255;
      colors[i * 3 + 1] = 175 / 255;
      colors[i * 3 + 2] = 109 / 255;
    }
  });
  return { positions, colors };
}
