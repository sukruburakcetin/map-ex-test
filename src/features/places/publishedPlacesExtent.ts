import type { PlaceBbox } from './placesModel';
export function outsidePublishedExtent(view: PlaceBbox, published: PlaceBbox | null | undefined): boolean {
  return !!published && (view[2] < published[0] || view[0] > published[2] || view[3] < published[1] || view[1] > published[3]);
}
export function paddedPlacesExtent(bounds: PlaceBbox): PlaceBbox {
  const dx = Math.max(.001, (bounds[2] - bounds[0]) * .05), dy = Math.max(.001, (bounds[3] - bounds[1]) * .05);
  return [Math.max(-180, bounds[0] - dx), Math.max(-85, bounds[1] - dy), Math.min(180, bounds[2] + dx), Math.min(85, bounds[3] + dy)];
}
