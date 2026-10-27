import type { PlaceBbox } from './placesModel';
/** Service fullExtent is a bounding envelope, not a polygon or a completeness guarantee. */
export function publishedPlacesExtent(extent: any, geographic: (extent: any) => any): PlaceBbox | null {
  try {
    if (!extent) return null;
    const sr = extent.spatialReference;
    if (sr?.isWebMercator || [3857, 102100, 102113].includes(sr?.wkid)) extent = geographic(extent);
    else if (!sr?.isGeographic && sr?.wkid !== 4326 && sr?.latestWkid !== 4326) return null;
    const bbox: PlaceBbox = [extent.xmin, extent.ymin, extent.xmax, extent.ymax];
    return bbox.every(Number.isFinite) && bbox[0] >= -180 && bbox[2] <= 180 && bbox[1] >= -90 && bbox[3] <= 90 && bbox[0] <= bbox[2] && bbox[1] <= bbox[3] ? bbox : null;
  } catch { return null; }
}
export function outsidePublishedExtent(view: PlaceBbox, published: PlaceBbox | null | undefined): boolean {
  return !!published && (view[2] < published[0] || view[0] > published[2] || view[3] < published[1] || view[1] > published[3]);
}
export function paddedPlacesExtent(bounds: PlaceBbox): PlaceBbox {
  const dx = Math.max(.001, (bounds[2] - bounds[0]) * .05), dy = Math.max(.001, (bounds[3] - bounds[1]) * .05);
  return [Math.max(-180, bounds[0] - dx), Math.max(-85, bounds[1] - dy), Math.min(180, bounds[2] + dx), Math.min(85, bounds[3] + dy)];
}
