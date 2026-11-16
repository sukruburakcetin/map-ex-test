/** Mirror actual InfoBox child availability; a disclosure heading is not content.
 * Preserve active results and cleanup controls even when the status card is hidden.
 */
export interface ImageToolsAvailability {
  hideInfoBox?: boolean; imageId?: string | null; pointCloudVisible?: boolean;
  pointCloudSummary?: unknown; enableSolar?: boolean; enableElevationProfile?: boolean;
  trafficSignsActive?: boolean; objectsActive?: boolean; coverageAnalysisLoading?: boolean;
  coverageResult?: unknown; routeData?: unknown; routeStartPoint?: unknown; routeEndPoint?: unknown;
}
export function hasImageToolsContent(props: ImageToolsAvailability): boolean {
  return props.hideInfoBox !== true || !!(props.pointCloudVisible || props.pointCloudSummary
    || props.enableSolar === true || props.enableElevationProfile === true && props.imageId
    || props.trafficSignsActive || props.objectsActive || props.coverageAnalysisLoading || props.coverageResult
    || !props.routeData && (props.routeStartPoint || props.routeEndPoint));
}
