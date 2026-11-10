import type { SettingsMessages } from '../settingsMessages';
/** British English differences only; all other messages inherit the US base. */
const overrides: Partial<SettingsMessages> = {
  "syncsTheMapCenterToTheCurrentImageLocation": "Syncs the map centre to the current image location",
  "recenterPosition": "Recentre Position:",
  "centerDefault": "Centre (Default)",
  "organizationId": "Organisation ID",
  "defaultMapillaryOrganizationId": "Default Mapillary organisation ID",
  "numericMapillaryOrganizationId": "Numeric Mapillary organisation ID",
  "enterAValidPositiveNumericMapillaryOrganizationId": "Enter a valid positive numeric Mapillary organisation ID.",
  "optionalLocksTheOrganizationFilterAtRuntimeAndCombines": "Optional. Locks the organisation filter at runtime and combines with Default Creator. Zoom closer for organisation coverage.",
  "defaultColorByCaptureYear": "Default Colour By Capture Year",
  "whenEnabledCoveragePointsAreColouredByTheirCapture": "When enabled, coverage points are coloured by their capture year on first load. The legend in the info box will reflect the year breakdown.",
  "hideCenterMapButton": "Hide Centre Map Button",
  "defaultCameraAngleNormalized01": "Default Camera Angle (Normalised 0-1)",
  "standardIs05ForBothRefersToCenter": "Standard is 0.5 for both(refers to centre).",
  "localNotesRemainAvailablePublishingIsExplicitUsersAuthenticate": "Local notes remain available. Publishing is explicit; users authenticate through the organisation’s ArcGIS Enterprise portal. Use the schema and access rules in the shared-note setup guide.",
  "organizationPortalRoute": "Organisation / Portal Route",
  "usesTheRouteServiceConfiguredByTheCurrentArcgis": "Uses the route service configured by the current ArcGIS Online or Enterprise portal. Compatibility depends on the organisation's network configuration.",
  "organizationRoute": "Organisation Route",
  "makeSureThisServiceSupportsTheRoutingBehaviorRequired": "Make sure this service supports the routing behaviour required by Capture Route before publishing.",
  "organizationRouting": "Organisation routing"
};
export default overrides;
