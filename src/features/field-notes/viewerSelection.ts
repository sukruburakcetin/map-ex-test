/** Field-note selection for imagery; no viewer mutation, caches, filtering UI or network work. */
export interface ViewerNoteCoordinates { lat: number; lon: number; }
export interface ViewerImageCoordinates extends ViewerNoteCoordinates { id: string; }
export type ViewerNoteDistance = (latitude: number, longitude: number, imageLatitude: number, imageLongitude: number) => number;

/**
 * Select notes within the caller's inclusive distance threshold in metres, preserving source order and identity.
 * Match the first image with the exact ID. No active image returns undefined, distinguishing it from
 * an active image with no nearby notes. The caller decides whether to retain or clear existing markers.
 * Use the supplied distance function unchanged; do not cache, sort, deduplicate or mutate the input arrays.
 */
export function selectViewerFieldNotes<T extends ViewerNoteCoordinates>(notes: readonly T[], images: readonly ViewerImageCoordinates[],
  imageId: string | null | undefined, maxDistanceMetres: number, distance: ViewerNoteDistance): T[] | undefined {
  const activeImg = images.find(image => image.id === imageId);
  return activeImg ? notes.filter(note => distance(note.lat, note.lon, activeImg.lat, activeImg.lon) <= maxDistanceMetres) : undefined;
}
