/** Visibility settings only. Never change service URLs, language policy or feature behavior. */
export const APPEARANCE_GROUPS = [
  { title: 'appearanceImageDetails', options: [
    { key: 'hideInfoBox', label: 'hideInfoBox' },
  ] },
  { title: 'appearanceNavigation', options: [
    { key: 'hideLegend', label: 'hideMapillaryMapLegend' },
    { key: 'hideTurboFilter', label: 'hideCoverageFilterButton' },
    { key: 'hideCenterMapButton', label: 'hideCenterMapButton' },
    { key: 'hideMapFollowButton', label: 'hideMapFollowButton' },
    { key: 'hideSyncHeadingButton', label: 'hideLockMapRotationButton3d' },
  ] },
  { title: 'appearanceExploration', options: [
    { key: 'hideCoverageAnalysis', label: 'hideAnalysisStreetgapQualityView' },
    { key: 'hidePointCloud', label: 'hidePointCloud3dOnly' },
    { key: 'hideTimeTravel', label: 'hideTimeTravel' },
    { key: 'hideImageDownload', label: 'hideImageDownload' },
    { key: 'hideShareButton', label: 'hideShareButton' },
  ] },
] as const;
export const APPEARANCE_KEYS = APPEARANCE_GROUPS.flatMap(group => group.options.map(option => option.key));
export function appearanceVisibilityPatch(hidden: boolean): Record<typeof APPEARANCE_KEYS[number], boolean> {
  return Object.fromEntries(APPEARANCE_KEYS.map(key => [key, hidden])) as Record<typeof APPEARANCE_KEYS[number], boolean>;
}
