/** Distinguish old hover-card cache entries from completed bearing lookups. */
export function needsHoverBearingMetadata(data: any): boolean {
 if (!data) return true;
 if (data.__hoverBearingLoaded === true) return false;
 if (Number.isFinite(data.computed_compass_angle) || Number.isFinite(data.compass_angle)) return false;
 return !(Object.prototype.hasOwnProperty.call(data,'computed_compass_angle') &&
          Object.prototype.hasOwnProperty.call(data,'compass_angle'));
}
/** Keep the hover card intact when enrichment responses omit optional fields. */
export function mergeHoverBearingMetadata(cached: any, response: any, imageId: string): any {
 if (!response || response.error || String(response.id) !== imageId) throw new Error('Hover metadata image mismatch');
 return { ...cached, ...response, __hoverBearingLoaded: true };
}
/** A panorama's cone represents a preview direction, not its complete field of view. */
export function hoverPreviewBearing(data: any, viewerHeading: unknown): number | undefined {
 const bearing = Number.isFinite(data?.computed_compass_angle) ? data.computed_compass_angle
  : Number.isFinite(data?.compass_angle) ? data.compass_angle
  : data?.is_pano && typeof viewerHeading === 'number' && Number.isFinite(viewerHeading) ? viewerHeading : undefined;
 return bearing === undefined ? undefined : ((bearing % 360) + 360) % 360;
}
