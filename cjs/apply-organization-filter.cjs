#!/usr/bin/env node
'use strict';
/** Organization coverage filtering installer. Plain source payload.
 * Validates all targets before writes. Preserves existing source bytes in local
 * backups, rejects links/conflicts, and rolls back its writes on failure.
 * --skip-tests skips test file writes/removals; it does not run tests.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const skipTests = args.includes('--skip-tests') || args.includes('--skip-test');
const uninstall = args.includes('--uninstall');
const payload = { entries: [
  { file: "src/config.ts", blocks: [
    { label: "src/config.ts organization block 1", before: `   */
  turboCreator?: string;

  // Turbo Coverage Presets
`,
      after: `   */
  turboCreator?: string;

  /** Optional numeric Mapillary organization ID; locks the runtime organization field. */
  turboOrganization?: string;

  // Turbo Coverage Presets
` },
  ], absentAfterUninstall: ["turboOrganization"], requiredOccurrences: [{"text": "turboOrganization", "count": 1}] },
  { file: "src/components/types.ts", blocks: [
    { label: "src/components/types.ts organization block 1", before: `  hideInfoBox?: boolean;
  turboCreator?: string;
  // state
  imageId: string | null;
`,
      after: `  hideInfoBox?: boolean;
  turboCreator?: string;
  turboOrganization?: string;
  // state
  imageId: string | null;
` },
    { label: "src/components/types.ts organization block 2", before: `    // turbo filter state
    turboFilterUsername: string;
    turboFilterStartDate?: string;
    turboFilterEndDate?: string;
`,
      after: `    // turbo filter state
    turboFilterUsername: string;
    turboFilterOrganization: string;
    turboFilterStartDate?: string;
    turboFilterEndDate?: string;
` },
    { label: "src/components/types.ts organization block 3", before: `    // locked creator (from settings)
    turboCreator?: string;
    // options
    trafficSignsFilterValue: FilterOption;
`,
      after: `    // locked creator (from settings)
    turboCreator?: string;
    turboOrganization?: string;
    // options
    trafficSignsFilterValue: FilterOption;
` },
    { label: "src/components/types.ts organization block 4", before: `    onTurboUsernameEnter: () => void;
    onTurboUsernameClear: () => void;
    onTurboStartDateChange: (dateString: string) => void;
    onTurboEndDateChange: (dateString: string) => void;
`,
      after: `    onTurboUsernameEnter: () => void;
    onTurboUsernameClear: () => void;
    onTurboOrganizationChange: (value: string) => void;
    onTurboOrganizationEnter: () => void;
    onTurboOrganizationClear: () => void;
    onTurboStartDateChange: (dateString: string) => void;
    onTurboEndDateChange: (dateString: string) => void;
` },
  ], absentAfterUninstall: ["turboOrganization", "turboFilterOrganization"], requiredOccurrences: [{"text": "turboOrganization", "count": 2}, {"text": "turboFilterOrganization", "count": 1}] },
  { file: "src/utils/turboCoverageUtils.ts", blocks: [
    { label: "src/utils/turboCoverageUtils.ts organization block 1", before: `/** Full-fidelity tile rendering and bounded on-demand decoding. */
export const TURBO_LIMITS = { tileCacheBytes: 8 * 1024 * 1024, decodeYield: 500, pickRadiusPx: 8, hoverRadiusPx: 8, closeZoom: 24, closeBufferPx: 32, closeMaxGraphics: 40000, closeLayerId: "mapillary-turbo-close", hoverDetailsDelayMs: 150, coverageColor: [53, 175, 109, 0.9] } as const;
export type TurboBbox = [number, number, number, number];
`,
      after: `/** Full-fidelity tile rendering and bounded on-demand decoding. */
import { organizationCondition, organizationMatches } from './organizationFilter';
export const TURBO_LIMITS = { tileCacheBytes: 8 * 1024 * 1024, decodeYield: 500, pickRadiusPx: 8, hoverRadiusPx: 8, closeZoom: 24, closeBufferPx: 32, closeMaxGraphics: 40000, closeLayerId: "mapillary-turbo-close", hoverDetailsDelayMs: 150, coverageColor: [53, 175, 109, 0.9] } as const;
export type TurboBbox = [number, number, number, number];
`, declarations: ["import { organizationCondition, organizationMatches } from './organizationFilter';"] },
    { label: "src/utils/turboCoverageUtils.ts organization block 2", before: `  onFoot?: boolean;
  creatorId?: number;
  startTime?: number;
  endTime?: number;
`,
      after: `  onFoot?: boolean;
  creatorId?: number;
  organizationId?: number;
  startTime?: number;
  endTime?: number;
` },
    { label: "src/utils/turboCoverageUtils.ts organization block 3", before: `  if (filters.qualityActive && filters.qualityBand && coverageQualityBand(props.quality_score) !== filters.qualityBand) return false;
  if (filters.creatorId !== undefined && Number(props.creator_id) !== filters.creatorId) return false;
  const pano = props.is_pano === true || props.is_pano === 1 || props.is_pano === 'true';
  if (filters.isPano !== undefined && pano !== filters.isPano) return false;
`,
      after: `  if (filters.qualityActive && filters.qualityBand && coverageQualityBand(props.quality_score) !== filters.qualityBand) return false;
  if (filters.creatorId !== undefined && Number(props.creator_id) !== filters.creatorId) return false;
  if (!organizationMatches(props.organization_id, filters.organizationId)) return false;
  const pano = props.is_pano === true || props.is_pano === 1 || props.is_pano === 'true';
  if (filters.isPano !== undefined && pano !== filters.isPano) return false;
` },
    { label: "src/utils/turboCoverageUtils.ts organization block 4", before: `  const conditions: any[] = [];
  const travelRestricted = filters.onFoot !== undefined;
  if (travelRestricted) conditions.push(['==', 'foot', filters.onFoot]);
  if (filters.creatorId !== undefined) conditions.push(['==', 'creator_id', filters.creatorId]);
  if (filters.startTime !== undefined) conditions.push(['>=', 'captured_at', filters.startTime]);
  if (filters.endTime !== undefined) conditions.push(['<=', 'captured_at', filters.endTime]);
`,
      after: `  const conditions: any[] = [];
  const travelRestricted = filters.onFoot !== undefined;
  // Overview tiles do not carry organization ownership.
  const overviewRestricted = travelRestricted || filters.organizationId !== undefined;
  if (travelRestricted) conditions.push(['==', 'foot', filters.onFoot]);
  if (filters.creatorId !== undefined) conditions.push(['==', 'creator_id', filters.creatorId]);
  if (filters.organizationId !== undefined) conditions.push(organizationCondition(filters.organizationId));
  if (filters.startTime !== undefined) conditions.push(['>=', 'captured_at', filters.startTime]);
  if (filters.endTime !== undefined) conditions.push(['<=', 'captured_at', filters.endTime]);
` },
    { label: "src/utils/turboCoverageUtils.ts organization block 5", before: `    for (const band of selected) {
      const filter = ['all', ...conditions, band.filter];
      if (!travelRestricted) layers.push({ id: \`turbo-overview-\${band.name}\`, source: 'turbo', 'source-layer': 'overview', type: 'circle', maxzoom: 6, filter,
        paint: { 'circle-radius': 3, 'circle-color': band.color, 'circle-opacity': 0.85 } });
      layers.push({ id: \`turbo-sequences-\${band.name}\`, source: 'turbo', 'source-layer': 'sequence', type: 'line', minzoom: 6, filter,
`,
      after: `    for (const band of selected) {
      const filter = ['all', ...conditions, band.filter];
      if (!overviewRestricted) layers.push({ id: \`turbo-overview-\${band.name}\`, source: 'turbo', 'source-layer': 'overview', type: 'circle', maxzoom: 6, filter,
        paint: { 'circle-radius': 3, 'circle-color': band.color, 'circle-opacity': 0.85 } });
      layers.push({ id: \`turbo-sequences-\${band.name}\`, source: 'turbo', 'source-layer': 'sequence', type: 'line', minzoom: 6, filter,
` },
    { label: "src/utils/turboCoverageUtils.ts organization block 6", before: `    version: 8,
    sources: { turbo: { type: 'vector', tiles: [url], minzoom: 0, maxzoom: 14 } },
    layers: [...(!travelRestricted ? [{ id: 'turbo-overview', source: 'turbo', 'source-layer': 'overview', type: 'circle', maxzoom: 6,
      ...(conditions.length ? { filter: ['all', ...conditions] } : {}),
      paint: { 'circle-radius': 3, 'circle-color': '#35AF6D', 'circle-opacity': 0.8 } }] : []),
`,
      after: `    version: 8,
    sources: { turbo: { type: 'vector', tiles: [url], minzoom: 0, maxzoom: 14 } },
    layers: [...(!overviewRestricted ? [{ id: 'turbo-overview', source: 'turbo', 'source-layer': 'overview', type: 'circle', maxzoom: 6,
      ...(conditions.length ? { filter: ['all', ...conditions] } : {}),
      paint: { 'circle-radius': 3, 'circle-color': '#35AF6D', 'circle-opacity': 0.8 } }] : []),
` },
  ], absentAfterUninstall: ["organizationMatches", "organizationCondition", "organizationId"], requiredOccurrences: [{"text": "organizationMatches", "count": 2}, {"text": "organizationCondition", "count": 2}, {"text": "organizationId", "count": 5}] },
  { file: "src/utils/filterBuilder.ts", blocks: [
    { label: "src/utils/filterBuilder.ts organization block 1", before: `*/

// Types

`,
      after: `*/

import { organizationCondition } from './organizationFilter';

// Types

`, declarations: ["import { organizationCondition } from './organizationFilter';"] },
    { label: "src/utils/filterBuilder.ts organization block 2", before: `  /** Numeric Mapillary creator ID (not the username string) */
  creatorId?:  number;
  /** ISO date string "yyyy-mm-dd" - inclusive start */
  startDate?:  string;
`,
      after: `  /** Numeric Mapillary creator ID (not the username string) */
  creatorId?:  number;
  /** Positive numeric Mapillary organization ID. */
  organizationId?: number;
  /** ISO date string "yyyy-mm-dd" - inclusive start */
  startDate?:  string;
` },
    { label: "src/utils/filterBuilder.ts organization block 3", before: `  if (params.creatorId) {
    conditions.push(['==', 'creator_id', params.creatorId]);
  }

`,
      after: `  if (params.creatorId) {
    conditions.push(['==', 'creator_id', params.creatorId]);
  }

  if (params.organizationId !== undefined) {
    conditions.push(organizationCondition(params.organizationId));
  }

` },
    { label: "src/utils/filterBuilder.ts organization block 4", before: `  const hasPanoFilter = params.isPano !== undefined && params.isPano !== null;

  // overview has no is_pano - hide it when a pano filter is active so the
  // user only sees correctly-filtered image-layer dots.
`,
      after: `  const hasPanoFilter = params.isPano !== undefined && params.isPano !== null;

  // Overview tiles have no organization ownership; do not show unfiltered data.
  if (params.organizationId !== undefined) return 'hide';

  // overview has no is_pano - hide it when a pano filter is active so the
  // user only sees correctly-filtered image-layer dots.
` },
    { label: "src/utils/filterBuilder.ts organization block 5", before: `  if (hasPanoFilter) return 'hide';

  const conditions = buildBaseConditions({ creatorId: params.creatorId });
  return collapseConditions(conditions);
}
`,
      after: `  if (hasPanoFilter) return 'hide';

  const conditions = buildBaseConditions({ creatorId: params.creatorId, organizationId: params.organizationId });
  return collapseConditions(conditions);
}
` },
  ], absentAfterUninstall: ["organizationCondition", "organizationId"], requiredOccurrences: [{"text": "organizationCondition", "count": 2}, {"text": "organizationId", "count": 6}] },
  { file: "src/features/coverage/nearbySequenceFrame.ts", blocks: [
    { label: "src/features/coverage/nearbySequenceFrame.ts organization block 1", before: `}
export interface NearbyFrameDependencies {
  // Reuse host geometry helpers; installations may keep coverage utilities in one file.
  boxes: (points: readonly { lon: number; lat: number }[]) => TurboBbox[];
`,
      after: `}
export interface NearbyFrameDependencies {
  /** Apply the same active coverage constraints before accepting a nearby frame. */
  matches?: (properties: Record<string, any>) => boolean;
  // Reuse host geometry helpers; installations may keep coverage utilities in one file.
  boxes: (points: readonly { lon: number; lat: number }[]) => TurboBbox[];
`, declarations: ["  matches?: (properties: Record<string, any>) => boolean;"] },
    { label: "src/features/coverage/nearbySequenceFrame.ts organization block 2", before: `        const feature = source.layer.feature(i), props = feature.properties;
        if (props.id == null || props.sequence_id == null || String(props.sequence_id) !== sequenceId) return;
        const point = feature.loadGeometry()?.[0]?.[0], extent = Number(feature.extent) || 4096;
        if (!point || point.x < 0 || point.y < 0 || point.x >= extent || point.y >= extent) return;
`,
      after: `        const feature = source.layer.feature(i), props = feature.properties;
        if (props.id == null || props.sequence_id == null || String(props.sequence_id) !== sequenceId) return;
        if (dependencies.matches && !dependencies.matches(props)) return;
        const point = feature.loadGeometry()?.[0]?.[0], extent = Number(feature.extent) || 4096;
        if (!point || point.x < 0 || point.y < 0 || point.x >= extent || point.y >= extent) return;
` },
  ], absentAfterUninstall: ["dependencies.matches"], requiredOccurrences: [{"text": "dependencies.matches", "count": 2}] },
  { file: "src/components/FilterBar.tsx", blocks: [
    { label: "src/components/FilterBar.tsx organization block 1", before: `import { glassStyles } from "../utils/styles";
import { FilterBarProps } from "./types";

/**
`,
      after: `import { glassStyles } from "../utils/styles";
import { FilterBarProps } from "./types";
import { organizationFilterId } from "../utils/organizationFilter";

/**
`, declarations: ["import { organizationFilterId } from \"../utils/organizationFilter\";"] },
    { label: "src/components/FilterBar.tsx organization block 2", before: `    showObjectsFilterBox,
    turboFilterUsername,
    turboFilterStartDate,
    turboFilterEndDate,
`,
      after: `    showObjectsFilterBox,
    turboFilterUsername,
    turboFilterOrganization,
    turboFilterStartDate,
    turboFilterEndDate,
` },
    { label: "src/components/FilterBar.tsx organization block 3", before: `    turboColorByDate,
    turboCreator,
    trafficSignsFilterValue,
    trafficSignsOptions,
`,
      after: `    turboColorByDate,
    turboCreator,
    turboOrganization,
    trafficSignsFilterValue,
    trafficSignsOptions,
` },
    { label: "src/components/FilterBar.tsx organization block 4", before: `    onTurboUsernameEnter,
    onTurboUsernameClear,
    onTurboStartDateChange,
    onTurboEndDateChange,
`,
      after: `    onTurboUsernameEnter,
    onTurboUsernameClear,
    onTurboOrganizationChange,
    onTurboOrganizationEnter,
    onTurboOrganizationClear,
    onTurboStartDateChange,
    onTurboEndDateChange,
` },
    { label: "src/components/FilterBar.tsx organization block 5", before: `                            </button>
                        )}
                    </div>

`,
      after: `                            </button>
                        )}
                    </div>

                    {/* Organization input */}
                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <input type="text" inputMode="numeric" aria-label="Mapillary organization ID"
                            placeholder="Organization ID" value={turboFilterOrganization} disabled={!!turboOrganization}
                            aria-invalid={organizationFilterId(turboFilterOrganization) === -1}
                            title={turboOrganization ? "Organization is set in widget settings" : "Filter by numeric Mapillary organization ID. Combined with Username when both are set."}
                            className="glass-input-placeholder"
                            onChange={event => onTurboOrganizationChange(event.target.value)}
                            onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); onTurboOrganizationEnter(); } }}
                            style={{ ...glassStyles.glassInput, width: 112, minWidth: 90, height: 18, paddingRight: 18,
                                opacity: turboOrganization ? 0.6 : 1, cursor: turboOrganization ? "not-allowed" : "text",
                                ...(organizationFilterId(turboFilterOrganization) === -1 ? { outline: "1px solid #ff8c8c" } : {}) }} />
                        {!turboOrganization && turboFilterOrganization && <button type="button" aria-label="Clear organization filter"
                            title="Clear organization filter" onClick={onTurboOrganizationClear}
                            style={{ position: "absolute", right: 6, background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 10, cursor: "pointer", padding: 0 }}>✕</button>}
                    </div>

`, declarations: ["aria-label=\"Mapillary organization ID\""] },
  ], absentAfterUninstall: ["organizationFilterId", "turboOrganization", "turboFilterOrganization"], requiredOccurrences: [{"text": "organizationFilterId", "count": 3}, {"text": "turboOrganization", "count": 6}, {"text": "turboFilterOrganization", "count": 5}] },
  { file: "src/setting/setting.tsx", blocks: [
    { label: "src/setting/setting.tsx organization block 1", before: `import { Switch, TextInput, NumericInput, Select, Option } from "jimu-ui";
import { IMConfig } from "../config";
import { FIELD_NOTE_CATEGORIES } from "../components/types";

`,
      after: `import { Switch, TextInput, NumericInput, Select, Option } from "jimu-ui";
import { IMConfig } from "../config";
import { organizationFilterId } from "../utils/organizationFilter";
import { FIELD_NOTE_CATEGORIES } from "../components/types";

`, declarations: ["import { organizationFilterId } from \"../utils/organizationFilter\";"] },
    { label: "src/setting/setting.tsx organization block 2", before: `    let config = this.props.config.set("turboCreator", value);
    this.props.onSettingChange({ id: this.props.id, config });
  };

`,
      after: `    let config = this.props.config.set("turboCreator", value);
    this.props.onSettingChange({ id: this.props.id, config });
  };

  onOrganizationChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const value = evt.target.value.trim();
    this.props.onSettingChange({ id: this.props.id, config: this.props.config.set("turboOrganization", value) });
  };

`, declarations: ["  onOrganizationChange = "] },
    { label: "src/setting/setting.tsx organization block 3", before: `              <div style={{ marginBottom: "5px", fontWeight: 500 }}>Default Creator</div>
              <TextInput className="w-100" placeholder="e.g. mapillary_user" value={config.turboCreator || ""} onChange={this.onCreatorChange} />
            </div>
          </SettingRow>
`,
      after: `              <div style={{ marginBottom: "5px", fontWeight: 500 }}>Default Creator</div>
              <TextInput className="w-100" placeholder="e.g. mapillary_user" value={config.turboCreator || ""} onChange={this.onCreatorChange} />
            </div>
          </SettingRow>
          <SettingRow flow="wrap">
            <div style={{ width: "100%" }}>
              <div style={{ marginBottom: "5px", fontWeight: 500 }}>Organization ID</div>
              <TextInput className="w-100" aria-label="Default Mapillary organization ID" placeholder="Numeric Mapillary organization ID"
                value={config.turboOrganization || ""} onChange={this.onOrganizationChange}
                aria-invalid={organizationFilterId(config.turboOrganization) === -1} />
              <div style={{ marginTop: 4, fontSize: 11 }}>
                {organizationFilterId(config.turboOrganization) === -1
                  ? "Enter a valid positive numeric Mapillary organization ID."
                  : "Optional. Locks the organization filter at runtime and combines with Default Creator. Zoom closer for organization coverage."}
              </div>
            </div>
          </SettingRow>
`, declarations: ["aria-label=\"Default Mapillary organization ID\""] },
  ], absentAfterUninstall: ["organizationFilterId", "turboOrganization"], requiredOccurrences: [{"text": "organizationFilterId", "count": 3}, {"text": "turboOrganization", "count": 4}] },
  { file: "src/components/InfoBox.tsx", blocks: [
    { label: "src/components/InfoBox.tsx organization block 1", before: `      hideInfoBox,
      turboCreator,
      imageId,
      address,
`,
      after: `      hideInfoBox,
      turboCreator,
      turboOrganization,
      imageId,
      address,
` },
    { label: "src/components/InfoBox.tsx organization block 2", before: `              style={infoStatusCardStyle}
            >
              <StatusSummary currentImg={currentImg} currentZoom={currentZoom} jimuMapViewZoom={jimuMapViewZoom} address={address} turboCreator={turboCreator} onCopyCoordinates={this.props.onCopyCoordinates} />

              {turboModeActive && !hideCoverageAnalysis && <CoverageAnalysisTrigger currentZoom={currentZoom} jimuMapViewZoom={jimuMapViewZoom} turboPointsAvailable={turboPointsAvailable} coverageAnalysisLoading={coverageAnalysisLoading} coverageResult={coverageResult} onRunCoverageAnalysis={onRunCoverageAnalysis} turboMinZoom={turboMinZoom} />}
`,
      after: `              style={infoStatusCardStyle}
            >
              <StatusSummary currentImg={currentImg} currentZoom={currentZoom} jimuMapViewZoom={jimuMapViewZoom} address={address} turboCreator={turboCreator} turboOrganization={turboOrganization} onCopyCoordinates={this.props.onCopyCoordinates} />

              {turboModeActive && !hideCoverageAnalysis && <CoverageAnalysisTrigger currentZoom={currentZoom} jimuMapViewZoom={jimuMapViewZoom} turboPointsAvailable={turboPointsAvailable} coverageAnalysisLoading={coverageAnalysisLoading} coverageResult={coverageResult} onRunCoverageAnalysis={onRunCoverageAnalysis} turboMinZoom={turboMinZoom} />}
` },
  ], absentAfterUninstall: ["turboOrganization"], requiredOccurrences: [{"text": "turboOrganization", "count": 3}] },
  { file: "src/components/info-box/StatusSummary.tsx", blocks: [
    { label: "src/components/info-box/StatusSummary.tsx organization block 1", before: `import { infoStatusHeaderStyle, infoStatusTitleStyle, infoStatusSearchStyle, infoStatusZoomStyle, infoStatusAddressStyle, infoStatusGlobeStyle, infoStatusCoordinatesStyle, infoStatusCoordinateRowStyle, infoStatusCoordinateLabelStyle, infoStatusCreatorStyle } from '../../styles/infoBox';

export type StatusSummaryProps = Pick<InfoBoxProps, 'currentZoom' | 'jimuMapViewZoom' | 'address' | 'turboCreator' | 'onCopyCoordinates'> & {
 currentImg: InfoBoxProps['sequenceImages'][number] | null | undefined;
};
`,
      after: `import { infoStatusHeaderStyle, infoStatusTitleStyle, infoStatusSearchStyle, infoStatusZoomStyle, infoStatusAddressStyle, infoStatusGlobeStyle, infoStatusCoordinatesStyle, infoStatusCoordinateRowStyle, infoStatusCoordinateLabelStyle, infoStatusCreatorStyle } from '../../styles/infoBox';

export type StatusSummaryProps = Pick<InfoBoxProps, 'currentZoom' | 'jimuMapViewZoom' | 'address' | 'turboCreator' | 'turboOrganization' | 'onCopyCoordinates'> & {
 currentImg: InfoBoxProps['sequenceImages'][number] | null | undefined;
};
` },
    { label: "src/components/info-box/StatusSummary.tsx organization block 2", before: ` * the runtime clipboard callback. This component performs no lookup, geocoding or clipboard access.
 */
export const StatusSummary: React.FC<StatusSummaryProps> = ({ currentZoom, jimuMapViewZoom, address, turboCreator, onCopyCoordinates, currentImg }) => (
<React.Fragment>
              {/* Header / zoom */}
`,
      after: ` * the runtime clipboard callback. This component performs no lookup, geocoding or clipboard access.
 */
export const StatusSummary: React.FC<StatusSummaryProps> = ({ currentZoom, jimuMapViewZoom, address, turboCreator, turboOrganization, onCopyCoordinates, currentImg }) => (
<React.Fragment>
              {/* Header / zoom */}
` },
    { label: "src/components/info-box/StatusSummary.tsx organization block 3", before: `                </div>
              )}
</React.Fragment>
);
`,
      after: `                </div>
              )}
              {turboOrganization && <div style={infoStatusCreatorStyle} title="Organization filter set in widget settings">Org: {turboOrganization}</div>}
</React.Fragment>
);
` },
  ], absentAfterUninstall: ["turboOrganization"], requiredOccurrences: [{"text": "turboOrganization", "count": 4}] },
  { file: "src/runtime/widget.tsx", blocks: [
    { label: "src/runtime/widget.tsx organization block 1", before: `} from "../utils/geoUtils";
import { buildAllFilters } from "../utils/filterBuilder";
import { loadPointCloud, PointCloudClusterCache, diffPointCloudFeatures, summarizePointCloud, pointCloudCandidates, pointCloudDisplayExpression, pointCloudCorridorCount, buildPointCloudPly, buildPointCloudLas } from "../utils/pointCloudUtils";
import { PointCloudAdaptiveDisplay } from '../features/point-cloud/PointCloudAdaptiveDisplay';
`,
      after: `} from "../utils/geoUtils";
import { buildAllFilters } from "../utils/filterBuilder";
import { organizationFilterId } from "../utils/organizationFilter";
import { loadPointCloud, PointCloudClusterCache, diffPointCloudFeatures, summarizePointCloud, pointCloudCandidates, pointCloudDisplayExpression, pointCloudCorridorCount, buildPointCloudPly, buildPointCloudLas } from "../utils/pointCloudUtils";
import { PointCloudAdaptiveDisplay } from '../features/point-cloud/PointCloudAdaptiveDisplay';
`, declarations: ["import { organizationFilterId } from \"../utils/organizationFilter\";"] },
    { label: "src/runtime/widget.tsx organization block 2", before: `  noImageMessageVisible: boolean;
  turboFilterUsername: string;
  showTurboFilterBox: boolean;
  trafficSignsOptions: Array<{ value: string; label: string; iconUrl: string | null }>;
`,
      after: `  noImageMessageVisible: boolean;
  turboFilterUsername: string;
  turboFilterOrganization: string;
  showTurboFilterBox: boolean;
  trafficSignsOptions: Array<{ value: string; label: string; iconUrl: string | null }>;
` },
    { label: "src/runtime/widget.tsx organization block 3", before: `    coverageSegmentsVisible: false,
    turboFilterUsername: "",
    turboFilterStartDate: "",
    turboFilterEndDate: "",
`,
      after: `    coverageSegmentsVisible: false,
    turboFilterUsername: "",
    turboFilterOrganization: this.props.config.turboOrganization || "",
    turboFilterStartDate: "",
    turboFilterEndDate: "",
` },
    { label: "src/runtime/widget.tsx organization block 4", before: `    // Wrap the layer reload logic in debounce (300ms delay after typing stops)
    this.debouncedTurboFilter = debounceUtil(async () => {
      // Read state lazily inside the fired timeout, not captured at schedule time
      const turboFilterUsername = this.state.turboFilterUsername;
`,
      after: `    // Wrap the layer reload logic in debounce (300ms delay after typing stops)
    this.debouncedTurboFilter = debounceUtil(async () => {
      if (this.state.turboModeActive) { await this.enableTurboCoverageLayer(); return; }
      // Read state lazily inside the fired timeout, not captured at schedule time
      const turboFilterUsername = this.state.turboFilterUsername;
` },
    { label: "src/runtime/widget.tsx organization block 5", before: `    };
    const cached = this.sequenceCoordsCache[sequenceId];
    if (cached?.length) {
      for (let i = 0; i < cached.length; i++) {
        if (i > 0 && i % 4096 === 0) await new Promise(resolve => setTimeout(resolve, 0));
`,
      after: `    };
    const cached = this.sequenceCoordsCache[sequenceId];
    const filters = this.getTurboFilters();
    // Route caches omit ownership metadata, so filtered selection uses local image tiles.
    if (cached?.length && filters.organizationId === undefined) {
      for (let i = 0; i < cached.length; i++) {
        if (i > 0 && i % 4096 === 0) await new Promise(resolve => setTimeout(resolve, 0));
` },
    { label: "src/runtime/widget.tsx organization block 6", before: `      tiles: turboTiles,
      distance: distanceMeters,
      load: async (tile, requestSignal) => {
        const index = this._turboIndexCache.get(tile.join("/"));
`,
      after: `      tiles: turboTiles,
      distance: distanceMeters,
      matches: properties => turboPointMatches(properties, filters),
      load: async (tile, requestSignal) => {
        const index = this._turboIndexCache.get(tile.join("/"));
` },
    { label: "src/runtime/widget.tsx organization block 7", before: `        turboModeActive: false,
        turboFilterUsername: "",
        turboFilterStartDate: "",
        turboFilterEndDate: "",
`,
      after: `        turboModeActive: false,
        turboFilterUsername: "",
        turboFilterOrganization: "",
        turboFilterStartDate: "",
        turboFilterEndDate: "",
` },
    { label: "src/runtime/widget.tsx organization block 8", before: `    const { overviewFilter, sequenceFilter, imageFilter, hasPanoFilter } = buildAllFilters({
      creatorId: filterCreatorId,
      startDate: filterStartDate,
      endDate: filterEndDate,
`,
      after: `    const { overviewFilter, sequenceFilter, imageFilter, hasPanoFilter } = buildAllFilters({
      creatorId: filterCreatorId,
      organizationId: this.getTurboOrganizationId(),
      startDate: filterStartDate,
      endDate: filterEndDate,
` },
    { label: "src/runtime/widget.tsx organization block 9", before: `
    const applyPano = (baseFilter: any) => {
      if (!panoCondition) return baseFilter;
      if (!baseFilter) return panoCondition;
`,
      after: `
    const applyPano = (baseFilter: any) => {
      if (baseFilter === "hide") return ["all", ["has", "id"], ["!has", "id"]];
      if (!panoCondition) return baseFilter;
      if (!baseFilter) return panoCondition;
` },
    { label: "src/runtime/widget.tsx organization block 10", before: `
    // OVERVIEW LAYER
    if (!hasPanoFilter) {
      layers.push({
        id: STYLE_LAYER_IDS.OVERVIEW,
`,
      after: `
    // OVERVIEW LAYER
    if (!hasPanoFilter && overviewFilter !== "hide") {
      layers.push({
        id: STYLE_LAYER_IDS.OVERVIEW,
` },
    { label: "src/runtime/widget.tsx organization block 11", before: `  };

  private getTurboFilters(): TurboFilters {
    return {
`,
      after: `  };

  private getTurboOrganizationId(): number | undefined {
    return organizationFilterId(this.props.config.turboOrganization || this.state.turboFilterOrganization);
  }

  /** Invalidate consumers immediately; raw tile and spatial-index caches remain reusable. */
  private resetOrganizationSelection() {
    this._turboAbortController?.abort();
    ++this._turboRequestCount;
    this._turboHoverPickAbort?.abort();
    this._turboClickPickAbort?.abort();
    this._coverageFrameLookup?.clear();
    this.clearTurboHover();
    this.clearTurboHoverDetails();
    this._turboCloseReady = false;
    if (this._turboCloseLayer) this._turboCloseLayer.visible = false;
    this.finishTurboLoading();
    this.setState({ coverageFrameResolving: false });
  }

  private changeCoverageOrganization = (value: string, immediate = false) => {
    if (this.props.config.turboOrganization) return;
    this.resetOrganizationSelection();
    this.setState({ turboFilterOrganization: value }, () => {
      this.debouncedTurboFilter.cancel?.();
      if (immediate) void this.enableTurboCoverageLayer();
      else this.debouncedTurboFilter();
    });
  };

  private getTurboFilters(): TurboFilters {
    return {
`, declarations: ["  private getTurboOrganizationId()", "  private resetOrganizationSelection()", "  private changeCoverageOrganization = "] },
    { label: "src/runtime/widget.tsx organization block 12", before: `      qualityBand: this.state.qualityViewActive ? this.state.selectedQualityBand : null,
      creatorId: this._turboCreatorId,
      startTime: this.state.turboFilterStartDate ? new Date(this.state.turboFilterStartDate).getTime() : undefined,
      endTime: this.state.turboFilterEndDate ? new Date(this.state.turboFilterEndDate).getTime() : undefined,
`,
      after: `      qualityBand: this.state.qualityViewActive ? this.state.selectedQualityBand : null,
      creatorId: this._turboCreatorId,
      organizationId: this.getTurboOrganizationId(),
      startTime: this.state.turboFilterStartDate ? new Date(this.state.turboFilterStartDate).getTime() : undefined,
      endTime: this.state.turboFilterEndDate ? new Date(this.state.turboFilterEndDate).getTime() : undefined,
` },
    { label: "src/runtime/widget.tsx organization block 13", before: `    const creatorId = username ? await this.getUserIdFromUsername(username) : undefined;
    if (!current()) return;
    if (username && !creatorId) {
      this.disableTurboCoverageLayer();
      this.showZoomWarning(\`User '\${username}' not found.\`, 3000);
      return;
    }
    this._turboCreatorId = creatorId ?? undefined;
    const filters = this.getTurboFilters();
    const colorByDate = !!this.state.turboColorByDate;
`,
      after: `    const creatorId = username ? await this.getUserIdFromUsername(username) : undefined;
    if (!current()) return;
    if (username && !creatorId) this.showZoomWarning(\`User '\${username}' not found.\`, 3000);
    // Invalid identities match no features; never restore unfiltered coverage.
    this._turboCreatorId = username && !creatorId ? -1 : creatorId ?? undefined;
    if (this.getTurboOrganizationId() === -1) this.showZoomWarning("Enter a valid numeric organization ID.", 3000);
    const filters = this.getTurboFilters();
    const colorByDate = !!this.state.turboColorByDate;
` },
    { label: "src/runtime/widget.tsx organization block 14", before: `    const view = this.state.jimuMapView?.view;
    const zoom = view?.zoom ?? 0;
    if (this.state.coverageFrameResolving) return { text: "Finding nearby image…" };
    if (this.state.isLoading) return { text: "Opening image…" };
`,
      after: `    const view = this.state.jimuMapView?.view;
    const zoom = view?.zoom ?? 0;
    if (this.state.turboModeActive && this.getTurboOrganizationId() === -1) return { text: "Enter a valid organization ID" };
    if (this.state.turboModeActive && this.getTurboOrganizationId() !== undefined && zoom < 6) return { text: "Zoom closer for organization coverage", action: "show", label: "Zoom to coverage" };
    if (this.state.coverageFrameResolving) return { text: "Finding nearby image…" };
    if (this.state.isLoading) return { text: "Opening image…" };
` },
    { label: "src/runtime/widget.tsx organization block 15", before: `    const creator = this.state.turboFilterUsername || this.props.config.turboCreator;
    if (creator) context.push(\`Creator: \${creator}\`);
    const start = this.state.turboFilterStartDate, end = this.state.turboFilterEndDate;
    if (start || end) context.push(\`Dates: \${start || "any"} → \${end || "latest"}\`);
`,
      after: `    const creator = this.state.turboFilterUsername || this.props.config.turboCreator;
    if (creator) context.push(\`Creator: \${creator}\`);
    const organization = this.getTurboOrganizationId();
    if (organization !== undefined) context.push(organization > 0 ? \`Organization: \${organization}\` : "Organization: invalid ID");
    const start = this.state.turboFilterStartDate, end = this.state.turboFilterEndDate;
    if (start || end) context.push(\`Dates: \${start || "any"} → \${end || "latest"}\`);
` },
    { label: "src/runtime/widget.tsx organization block 16", before: `
  private getCoverageBarHint(): string {
    if (this.state.turboFilterOnFoot !== undefined && (this.state.jimuMapView?.view?.zoom ?? 0) < 6) return "Zoom closer for travel-method coverage";
    if (this.state.turboLoading) return "You can keep exploring while coverage loads";
`,
      after: `
  private getCoverageBarHint(): string {
    if (this.getTurboOrganizationId() === -1) return "Use the numeric ID from your Mapillary organization";
    if (this.getTurboOrganizationId() !== undefined && (this.state.jimuMapView?.view?.zoom ?? 0) < 6) return "Zoom closer to view this organization's coverage";
    if (this.state.turboFilterOnFoot !== undefined && (this.state.jimuMapView?.view?.zoom ?? 0) < 6) return "Zoom closer for travel-method coverage";
    if (this.state.turboLoading) return "You can keep exploring while coverage loads";
` },
    { label: "src/runtime/widget.tsx organization block 17", before: `  private showTurboInteractionHelp() {
    if (!this.state.turboModeActive || !this.turboCoverageLayer) return;
    if (this._turboCloseFallback) { this.updateTurboPickWarning(this._turboCloseFallback, this._turboCloseFallbackAction); return; }
    if (this._turboCloseLayer) { this.updateTurboPickWarning("Hover to preview; tap or click to open imagery.", "zoom", true); return; }
`,
      after: `  private showTurboInteractionHelp() {
    if (!this.state.turboModeActive || !this.turboCoverageLayer) return;
    if (this.getTurboOrganizationId() === -1) { this.updateTurboPickWarning("Enter a valid numeric organization ID."); return; }
    if (this.getTurboOrganizationId() !== undefined && (this.state.jimuMapView?.view?.zoom ?? 0) < 6) { this.updateTurboPickWarning("Zoom closer to view this organization's coverage.", "show", true); return; }
    if (this._turboCloseFallback) { this.updateTurboPickWarning(this._turboCloseFallback, this._turboCloseFallbackAction); return; }
    if (this._turboCloseLayer) { this.updateTurboPickWarning("Hover to preview; tap or click to open imagery.", "zoom", true); return; }
` },
    { label: "src/runtime/widget.tsx organization block 18", before: `  private async pickTurboRepresentative(screen: {x:number;y:number}, view: __esri.MapView | __esri.SceneView, signal: AbortSignal, preview = false, searchRadius?: number): Promise<__esri.Graphic | null> {
    if (!this.turboCoverageLayer || view.zoom >= 14 || view.stationary === false || signal.aborted) return null;
    if (view.zoom < 6 && this.state.turboFilterOnFoot !== undefined) return null;
    const revision = this._turboRequestCount;
    const radius = searchRadius ?? TURBO_LIMITS.pickRadiusPx;
`,
      after: `  private async pickTurboRepresentative(screen: {x:number;y:number}, view: __esri.MapView | __esri.SceneView, signal: AbortSignal, preview = false, searchRadius?: number): Promise<__esri.Graphic | null> {
    if (!this.turboCoverageLayer || view.zoom >= 14 || view.stationary === false || signal.aborted) return null;
    if (view.zoom < 6 && (this.state.turboFilterOnFoot !== undefined || this.getTurboOrganizationId() !== undefined)) return null;
    const revision = this._turboRequestCount;
    const radius = searchRadius ?? TURBO_LIMITS.pickRadiusPx;
` },
    { label: "src/runtime/widget.tsx organization block 19", before: `            turboModeActive: true,
            turboFilterUsername: this.props.config.turboCreator || "",
            turboFilterStartDate: this.props.config.turboDefaultStartDate || "",
            turboFilterEndDate: this.props.config.turboDefaultEndDate || "",
`,
      after: `            turboModeActive: true,
            turboFilterUsername: this.props.config.turboCreator || "",
            turboFilterOrganization: this.props.config.turboOrganization || "",
            turboFilterStartDate: this.props.config.turboDefaultStartDate || "",
            turboFilterEndDate: this.props.config.turboDefaultEndDate || "",
` },
    { label: "src/runtime/widget.tsx organization block 20", before: `        this.initMapillaryObjectsLayer();
      }
    }

`,
      after: `        this.initMapillaryObjectsLayer();
      }
    }

    if (prevProps.config.turboOrganization !== this.props.config.turboOrganization) {
      this.resetOrganizationSelection();
      this.setState({ turboFilterOrganization: this.props.config.turboOrganization || "" }, () => {
        this.debouncedTurboFilter.cancel?.();
        if (this.state.turboModeActive) void this.enableTurboCoverageLayer();
      });
    }

` },
    { label: "src/runtime/widget.tsx organization block 21", before: `                  // Coverage hit tests can miss the thin active route at regional zooms.
                  // For that same loaded sequence, resolve the click entirely in memory.
                  if (attrs.turbo_representative && this.state.sequenceId === seqId && !this.state.sequenceRouteLoading) {
                    let closest = Infinity;
                    for (const image of this.state.sequenceImages) {
`,
      after: `                  // Coverage hit tests can miss the thin active route at regional zooms.
                  // For that same loaded sequence, resolve the click entirely in memory.
                  if (attrs.turbo_representative && this.getTurboOrganizationId() === undefined && this.state.sequenceId === seqId && !this.state.sequenceRouteLoading) {
                    let closest = Infinity;
                    for (const image of this.state.sequenceImages) {
` },
    { label: "src/runtime/widget.tsx organization block 22", before: `                  // A sequence tile's image_id represents the whole line, not its clicked location.
                  // Resolve only nearby image tiles; never enumerate the full sequence to open it.
                  if (regionalLine && !(this.state.sequenceId === seqId && !this.state.sequenceRouteLoading && this.state.sequenceImages.length)) {
                    const geometry = safeGraphic.geometry as __esri.Point;
                    const geographic = geometry?.spatialReference?.isWGS84 || geometry?.spatialReference?.wkid === 4326
`,
      after: `                  // A sequence tile's image_id represents the whole line, not its clicked location.
                  // Resolve only nearby image tiles; never enumerate the full sequence to open it.
                  if (regionalLine && !(this.getTurboOrganizationId() === undefined && this.state.sequenceId === seqId && !this.state.sequenceRouteLoading && this.state.sequenceImages.length)) {
                    const geometry = safeGraphic.geometry as __esri.Point;
                    const geographic = geometry?.spatialReference?.isWGS84 || geometry?.spatialReference?.wkid === 4326
` },
    { label: "src/runtime/widget.tsx organization block 23", before: `          hideInfoBox={this.props.config.hideInfoBox}
          turboCreator={this.props.config.turboCreator}
          imageId={this.state.imageId}
          address={this.state.address}
`,
      after: `          hideInfoBox={this.props.config.hideInfoBox}
          turboCreator={this.props.config.turboCreator}
          turboOrganization={this.props.config.turboOrganization}
          imageId={this.state.imageId}
          address={this.state.address}
` },
    { label: "src/runtime/widget.tsx organization block 24", before: `          showObjectsFilterBox={this.state.showObjectsFilterBox}
          turboFilterUsername={this.state.turboFilterUsername}
          turboFilterStartDate={this.state.turboFilterStartDate}
          turboFilterEndDate={this.state.turboFilterEndDate}
`,
      after: `          showObjectsFilterBox={this.state.showObjectsFilterBox}
          turboFilterUsername={this.state.turboFilterUsername}
          turboFilterOrganization={this.state.turboFilterOrganization}
          onTurboOrganizationChange={value => this.changeCoverageOrganization(value)}
          onTurboOrganizationEnter={() => this.changeCoverageOrganization(this.state.turboFilterOrganization, true)}
          onTurboOrganizationClear={() => this.changeCoverageOrganization("", true)}
          turboFilterStartDate={this.state.turboFilterStartDate}
          turboFilterEndDate={this.state.turboFilterEndDate}
` },
    { label: "src/runtime/widget.tsx organization block 25", before: `          turboModeActive={this.state.turboModeActive}
          turboCreator={this.props.config.turboCreator}
          trafficSignsFilterValue={this.state.trafficSignsFilterValue}
          trafficSignsOptions={this.state.trafficSignsOptions}
`,
      after: `          turboModeActive={this.state.turboModeActive}
          turboCreator={this.props.config.turboCreator}
          turboOrganization={this.props.config.turboOrganization}
          trafficSignsFilterValue={this.state.trafficSignsFilterValue}
          trafficSignsOptions={this.state.trafficSignsOptions}
` },
    { label: "src/runtime/widget.tsx organization block 26", before: `          onTurboIsPanoChange={(newVal) => {
            this.setState({ turboFilterIsPano: newVal }, () => {
              const rebuild = async () => {
                let creatorId: number | undefined = undefined;
`,
      after: `          onTurboIsPanoChange={(newVal) => {
            this.setState({ turboFilterIsPano: newVal }, () => {
              if (this.state.turboModeActive) { void this.enableTurboCoverageLayer(); return; }
              const rebuild = async () => {
                let creatorId: number | undefined = undefined;
` },
  ], absentAfterUninstall: ["organizationFilterId", "turboOrganization", "turboFilterOrganization", "getTurboOrganizationId", "changeCoverageOrganization", "resetOrganizationSelection", "organizationId"], requiredOccurrences: [{"text": "organizationFilterId", "count": 2}, {"text": "turboOrganization", "count": 11}, {"text": "turboFilterOrganization", "count": 10}, {"text": "getTurboOrganizationId", "count": 14}, {"text": "changeCoverageOrganization", "count": 4}, {"text": "resetOrganizationSelection", "count": 3}, {"text": "organizationId", "count": 3}] },
], modules: [
  { file: "src/utils/organizationFilter.ts", content: `/** Organization IDs stay exact in the numeric MVT decoder.
 * Empty input removes the constraint; invalid input uses an impossible ID and
 * matches nothing instead of silently broadening the coverage filter.
 */
export function organizationFilterId(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string" && typeof value !== "number") return -1;
  const text = String(value).trim();
  if (!text) return undefined;
  if (!/^[0-9]+$/.test(text)) return -1;
  const id = Number(text);
  return Number.isSafeInteger(id) && id > 0 ? id : -1;
}

/** Equivalent classic style expression for numeric or string tile properties. */
export function organizationCondition(id: number): any[] {
  if (!Number.isSafeInteger(id) || id <= 0) return ['all', ['has', 'organization_id'], ['!has', 'organization_id']];
  return ['any', ['==', 'organization_id', id], ['==', 'organization_id', String(id)]];
}

export function organizationMatches(value: unknown, id: number | undefined): boolean {
  return id === undefined || (Number.isSafeInteger(id) && id > 0 && (value === id || value === String(id)));
}
` },
] };

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'organization-filter-';

function conflict(label) {
  throw new Error('Conflict in ' + label + '. No source files changed. Preserve local edits.');
}

/** Resolve a payload path and reject symbolic links, including parent folders. */
function targetFor(relative) {
  if (typeof relative !== 'string' || !relative || relative.includes('\\') || relative.includes(':') || relative.includes('\0')) throw new Error('Invalid patch path.');
  const parts = relative.split('/');
  if (parts.some(part => !part || part === '.' || part === '..')) throw new Error('Invalid patch path.');
  const target = path.resolve(root, ...parts);
  const relation = path.relative(root, target);
  if (!relation || relation.startsWith('..' + path.sep) || path.isAbsolute(relation)) throw new Error('Patch path escapes the widget folder.');
  let parent = root;
  for (let index = 0; index < parts.length; index++) {
    parent = path.join(parent, parts[index]);
    let stat;
    try { stat = fs.lstatSync(parent); } catch (error) { if (error.code === 'ENOENT') break; throw error; }
    if (stat.isSymbolicLink()) throw new Error('Symbolic links are not supported: ' + relative + '. No source files changed.');
    if (index < parts.length - 1 && !stat.isDirectory()) throw new Error('Parent path is not a folder: ' + relative);
    if (index === parts.length - 1 && !stat.isFile() && !stat.isDirectory()) throw new Error('Unsupported target type: ' + relative);
  }
  return target;
}

function readTarget(relative, required = false) {
  const file = targetFor(relative);
  let descriptor;
  try {
    descriptor = fs.openSync(file, fs.constants.O_RDONLY | noFollow);
    const stat = fs.fstatSync(descriptor);
    if (!stat.isFile()) throw new Error('Target is not a regular file: ' + relative);
    const bytes = fs.readFileSync(descriptor);
    return { file, bytes, mode: stat.mode, dev: stat.dev, ino: stat.ino };
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    if (required) throw new Error('Required file missing: ' + relative + '. No source files changed.');
    return { file, bytes: null };
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
}

function formatLike(text, original) {
  const raw = original.toString('utf8');
  const bom = raw.startsWith('\uFEFF') ? '\uFEFF' : '';
  return Buffer.from(bom + (raw.includes('\r\n') ? text.replace(/\n/g, '\r\n') : text));
}

/** Apply or reverse one exact insertion, preserving all text outside its anchors. */
function transformBlock(text, block, reverse) {
  const before = normalize(block.before), after = normalize(block.after);
  if (!before || !after || before === after) throw new Error('Invalid block: ' + block.label);
  const expected = reverse ? after : before;
  const replacement = reverse ? before : after;
  if (block.wholeFile) {
    if (text === replacement) return text;
    if (text !== expected) conflict(block.label);
    return replacement;
  }
  // Prefer the longest state when an insertion contains its original anchor.
  if (reverse) {
    const installedCount = count(text, after);
    if (installedCount === 1) return text.replace(after, () => before);
    if (installedCount > 1) conflict(block.label);
    if (count(text, before) === 1) {
      if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (partially edited organization filter)');
      return text;
    }
    conflict(block.label);
  }
  const installedCount = count(text, after);
  if (installedCount === 1) return text;
  if (installedCount > 1) conflict(block.label);
  if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (existing declaration)');
  if (count(text, before) !== 1) conflict(block.label);
  return text.replace(before, () => after);
}

function ensureParents(relative) {
  const segments = relative.split('/');
  segments.pop();
  let current = '';
  for (const segment of segments) {
    current = current ? current + '/' + segment : segment;
    const directory = targetFor(current);
    try { fs.mkdirSync(directory); } catch (error) { if (error.code !== 'EEXIST') throw error; }
    const stat = fs.lstatSync(directory);
    if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Unsafe parent directory: ' + current);
  }
}

function assertUnchanged(item) {
  const latest = readTarget(item.relative);
  if (item.original === null ? latest.bytes !== null : latest.bytes === null || !latest.bytes.equals(item.original)) {
    throw new Error('File changed during validation: ' + item.relative + '. No source files changed.');
  }
}

function writeExact(descriptor, bytes) {
  let offset = 0;
  while (offset < bytes.length) {
    const written = fs.writeSync(descriptor, bytes, offset, bytes.length - offset, offset);
    if (!written) throw new Error('File write made no progress.');
    offset += written;
  }
}

/** Existing files are opened without truncation, then checked through that handle. */
function overwriteOriginal(item, bytes) {
  targetFor(item.relative);
  const descriptor = fs.openSync(item.file, fs.constants.O_RDWR | noFollow);
  try {
    const stat = fs.fstatSync(descriptor);
    const linked = fs.lstatSync(item.file);
    if (!stat.isFile() || linked.isSymbolicLink() || stat.dev !== linked.dev || stat.ino !== linked.ino || !fs.readFileSync(descriptor).equals(item.original)) throw new Error('File changed before write: ' + item.relative);
    item.started = true;
    fs.ftruncateSync(descriptor, 0);
    writeExact(descriptor, bytes);
    fs.fsyncSync(descriptor);
  } finally { fs.closeSync(descriptor); }
}

function rollback(items) {
  const errors = [];
  for (const item of [...items].reverse()) {
    if (!item.started) continue;
    try {
      targetFor(item.relative);
      if (item.original === null) {
        // Remove only the exclusively-created file owned by this installer.
        const stat = fs.lstatSync(item.file);
        if (stat.dev !== item.createdDev || stat.ino !== item.createdIno) throw new Error('Created file replaced by another process.');
        fs.unlinkSync(item.file);
      } else if (item.content === null) {
        const descriptor = fs.openSync(item.file, 'wx', item.mode & 0o777);
        try { fs.writeFileSync(descriptor, item.original); } finally { fs.closeSync(descriptor); }
      } else {
        const descriptor = fs.openSync(item.file, fs.constants.O_WRONLY | noFollow);
        try { fs.ftruncateSync(descriptor, 0); writeExact(descriptor, item.original); } finally { fs.closeSync(descriptor); }
      }
    } catch (error) { errors.push(item.relative + ': ' + error.message); }
  }
  return errors;
}

try {
  const allowed = ['--dry-run', '--skip-tests', '--skip-test', '--uninstall'];
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-organization-filter.cjs [--dry-run] [--skip-tests] [--uninstall]');
  readTarget('src/runtime/widget.tsx', true);
  const writes = [], seen = new Set();
  for (const entry of payload.entries) {
    if (seen.has(entry.file)) throw new Error('Duplicate patch path: ' + entry.file);
    seen.add(entry.file);
    if (skipTests && entry.test) continue;
    const current = readTarget(entry.file, true);
    let text = normalize(current.bytes.toString('utf8'));
    const blocks = uninstall ? [...entry.blocks].reverse() : entry.blocks;
    for (const block of blocks) text = transformBlock(text, block, uninstall);
    if (uninstall && entry.absentAfterUninstall && entry.absentAfterUninstall.some(marker => text.includes(marker))) {
      conflict(entry.file + ' (edited organization filter references remain)');
    }
    if (!uninstall && entry.requiredOccurrences && entry.requiredOccurrences.some(rule => count(text, rule.text) !== rule.count)) {
      conflict(entry.file + ' (organization filter references differ)');
    }
    if (text !== normalize(current.bytes.toString('utf8'))) writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(text, current.bytes) });
  }
  for (const module of payload.modules) {
    if (seen.has(module.file)) throw new Error('Duplicate patch path: ' + module.file);
    seen.add(module.file);
    if (skipTests && module.test) continue;
    const current = readTarget(module.file);
    if (current.bytes !== null) {
      if (normalize(current.bytes.toString('utf8')) !== normalize(module.content)) conflict(module.file + ' (existing module)');
      if (uninstall) writes.push({ ...current, relative: module.file, original: current.bytes, content: null });
    } else if (!uninstall) {
      writes.push({ ...current, relative: module.file, original: null, content: Buffer.from(module.content) });
    }
  }
  console.log('Existing tests are preserved. This installer does not run tests.');
  if (!writes.length) {
    console.log(uninstall ? 'Organization filter is already uninstalled. No files changed.' : 'Organization filter is already installed. No files changed.');
    process.exit(0);
  }
  if (dry) {
    console.log('Dry run passed. Would ' + (uninstall ? 'uninstall' : 'install') + ':\n' + writes.map(item => '  ' + (item.content === null ? 'remove ' : item.original === null ? 'create ' : 'update ') + item.relative).join('\n'));
    process.exit(0);
  }
  // Complete every source guard before creating a backup or changing source files.
  for (const item of writes) assertUnchanged(item);
  const backupRelative = '.refactor-backups/' + prefix + (uninstall ? 'uninstall-' : '') + Date.now() + '-' + process.pid;
  ensureParents(backupRelative + '/changes.json');
  const backup = targetFor(backupRelative);
  for (const item of writes) {
    if (item.original === null) continue;
    const relative = backupRelative + '/' + item.relative;
    ensureParents(relative);
    const descriptor = fs.openSync(targetFor(relative), 'wx');
    try { fs.writeFileSync(descriptor, item.original); } finally { fs.closeSync(descriptor); }
  }
  const manifest = writes.map(item => ({ file: item.relative, operation: item.content === null ? 'remove' : item.original === null ? 'create' : 'update', originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) }));
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'organization-filter', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
  for (const item of writes) assertUnchanged(item);
  try {
    for (const item of writes) {
      assertUnchanged(item);
      if (item.content === null) {
        targetFor(item.relative);
        fs.unlinkSync(item.file);
        item.started = true;
      } else if (item.original === null) {
        ensureParents(item.relative);
        const descriptor = fs.openSync(targetFor(item.relative), 'wx');
        const stat = fs.fstatSync(descriptor);
        item.createdDev = stat.dev; item.createdIno = stat.ino; item.started = true;
        try { fs.writeFileSync(descriptor, item.content); } finally { fs.closeSync(descriptor); }
      } else overwriteOriginal(item, item.content);
    }
  } catch (error) {
    const errors = rollback(writes);
    if (errors.length) throw new Error(error.message + '\nRollback needs attention; original bytes are in ' + backupRelative + ':\n' + errors.join('\n'));
    throw new Error(error.message + '\nInstaller writes rolled back. Original source files restored. Backup: ' + backupRelative);
  }
  console.log('Organization filter ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. Test Organization ID alone and with Username; configured organization locks runtime editing. Below zoom 6, zoom closer for organization coverage.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
