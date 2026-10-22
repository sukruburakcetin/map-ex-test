/** Local note graphic descriptors only; SDK allocation and layer ownership remain runtime responsibilities. */
import type { FieldNote } from '../../components/types';

/**
 * Build the existing source-colored diamond, WGS84 point and note popup.
 * Preserve altitude on the descriptor; hasZ is enabled only for 3D views with altitude.
 * This helper does not allocate SDK objects, access layers or decide whether a shared copy is visible.
 */
export function buildLocalNoteGraphic(note: FieldNote, is3D: boolean): __esri.GraphicProperties {
  const color = note.source === "manual" ? [245, 166, 35, 1] : [53, 175, 109, 1];

  const symbol = {
    type: "simple-marker",
    style: "diamond",
    color,
    size: 13,
    outline: { color: "white", width: 1.5 },
  };

  return {
    geometry: {
      type: "point",
      longitude: note.lon,
      latitude: note.lat,
      z: note.alt,
      hasZ: is3D && note.alt !== undefined,
      spatialReference: { wkid: 4326 },
    },
    symbol: symbol as any,
    attributes: { id: note.id, category: note.category, note: note.note },
    popupTemplate: {
      title: "{category}",
      content: note.note ? note.note : "(No description)",
    },
  };
}
