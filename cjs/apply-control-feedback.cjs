#!/usr/bin/env node
'use strict';
/**
 * Control feedback confirmation. Compatible current v6 sources.
 * --dry-run checks all targets; --uninstall restores exact previous bytes.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const uninstall = args.includes('--uninstall');
const payload = {
  "entries": [
    {
      "file": "src/components/ControlBar.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Control feedback 1",
              "before": "/** @jsx jsx */\nimport { useWidgetLocale } from '../i18n/WidgetLocale';\nimport { React, jsx } from \"jimu-core\";\nimport { controlBarInteractionCss, controlBarCompactCss } from \"../styles/controlPanels\";\nimport * as Icons from \"./Icons\";\nimport { ControlBarProps } from \"./types\";\n\n/** Presentational rail: layer toggles and their filters keep independent actions. */\nexport const ControlBar: React.FC<ControlBarProps> = (props) => {\n const { t, locale } = useWidgetLocale();\n\n    const layer = (kind: \"signs\" | \"objects\", active: boolean, expanded: boolean,\n        toggle: () => void, filter: () => void) => {\n        const label = kind === \"signs\" ? t('uiTrafficSigns') : t('uiObjects');\n        return <div className=\"mly-rail-group\" role=\"group\" aria-label={label} key={kind}>\n            <button type=\"button\" className=\"mly-rail-button\" title={label}\n                aria-label={label} aria-pressed={active} onClick={toggle}>\n                {kind === \"signs\" ? <Icons.AllMapillaryTrafficSigns size={18}/> : <Icons.AllMapillaryObjects size={18}/>}\n                {active && <span className=\"mly-rail-check\" aria-hidden=\"true\">\u2713</span>}\n            </button>\n            {active && <button type=\"button\" className=\"mly-rail-button mly-rail-filter\"\n                title={t('uiFilterLayer',{label})} aria-label={t('uiFilterLayer',{label})}\n                aria-expanded={expanded} onClick={filter}><Icons.Filter size={18}/></button>}\n        </div>;\n    };\n    return <div className=\"glass-control-panel mly-control-rail\" role=\"group\" aria-label={t('uiMapControls')}>\n        <style>{controlBarInteractionCss}{controlBarCompactCss}</style>\n        <button type=\"button\" className=\"mly-rail-button\" title={props.isFullscreen ? t('uiExitFullscreen') : t('uiFullscreen')}\n            aria-label={props.isFullscreen ? t('uiExitFullscreen') : t('uiFullscreen')}\n            aria-pressed={props.isFullscreen} onClick={props.onToggleFullscreen}><Icons.Maximize size={20}/></button>\n        {(!props.hideTurboFilter || props.enableTrafficSigns !== false || props.enableMapillaryObjects !== false) && <span className=\"mly-rail-divider\" aria-hidden=\"true\"/>}\n        {!props.hideTurboFilter && <button type=\"button\" className=\"mly-rail-button mly-rail-filter\"\n            title={props.turboModeActive ? t('uiCoverageFilters') : t('uiCoverageFiltersUnavailable')}\n            aria-label={t('uiCoverageFilters')} aria-expanded={props.showTurboFilterBox}\n            disabled={!props.turboModeActive} onClick={props.onToggleTurboFilter}><Icons.Filter size={20}/></button>}\n        {props.enableTrafficSigns !== false && layer(\"signs\", !!props.trafficSignsActive, props.showTrafficSignsFilterBox, props.onToggleTrafficSigns, props.onToggleTrafficSignsFilter)}\n        {props.enableMapillaryObjects !== false && layer(\"objects\", !!props.objectsActive, props.showObjectsFilterBox, props.onToggleObjects, props.onToggleObjectsFilter)}\n        {props.enablePlaces && <div className=\"mly-rail-group\" role=\"group\" aria-label={t('uiNearbyPlaces')}>\n            <button type=\"button\" className=\"mly-rail-button\" title={props.placesAvailable ? t('uiNearbyPlaces') : t('uiNearbyPlacesUnavailable')}\n                aria-label={t('uiNearbyPlaces')} aria-pressed={!!props.placesActive} disabled={!props.placesAvailable} onClick={props.onTogglePlaces}>\n                <svg aria-hidden=\"true\" width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"1.7\"><path d=\"M12 22s8-8 8-13a8 8 0 0 0-16 0c0 5 8 13 8 13Z\"/><circle cx=\"12\" cy=\"9\" r=\"2.5\"/></svg>\n                {props.placesActive && <span className=\"mly-rail-check\" aria-hidden=\"true\">\u2713</span>}\n            </button>\n            {props.placesActive && <button type=\"button\" className=\"mly-rail-button mly-rail-filter\" aria-label={t('uiFilterNearbyPlaces')} title={t('uiFilterNearbyPlaces')} aria-expanded={!!props.placesPanelOpen} onClick={props.onTogglePlacesPanel}><Icons.Filter size={18}/></button>}\n        </div>}\n    </div>;\n};\n",
              "after": "/** @jsx jsx */\nimport { useWidgetLocale } from '../i18n/WidgetLocale';\nimport { React, jsx } from \"jimu-core\";\nimport { controlBarInteractionCss, controlBarCompactCss, mapSpriteLoadingCss } from \"../styles/controlPanels\";\nimport * as Icons from \"./Icons\";\nimport { ControlBarProps } from \"./types\";\n\n/** Presentational rail: layer toggles and their filters keep independent actions. */\nexport const ControlBar: React.FC<ControlBarProps> = (props) => {\n const { t, locale, owned } = useWidgetLocale();\n\n    const [placesIconFailed,setPlacesIconFailed]=React.useState(false);\n    const layer = (kind: \"signs\" | \"objects\", active: boolean, expanded: boolean,\n        toggle: () => void, filter: () => void) => {\n        const label = kind === \"signs\" ? t('uiTrafficSigns') : t('uiObjects');\n        const status=active?(kind==='signs'?props.signSpritesStatus:props.objectSpritesStatus):'idle';\n        const loading=status==='loading';\n        const hint=loading?owned(kind==='signs'?'Loading traffic sign icons\u2026':'Loading object icons\u2026'):status==='error'?owned('Icons could not load. Toggle off and on to retry.'):label;\n        return <div className=\"mly-rail-group\" role=\"group\" aria-label={label} key={kind}>\n            <button type=\"button\" className=\"mly-rail-button\" title={hint}\n                aria-label={label} aria-busy={loading} aria-pressed={active} onClick={toggle}>\n                {kind === \"signs\" ? <Icons.AllMapillaryTrafficSigns size={18}/> : <Icons.AllMapillaryObjects size={18}/>}\n                {loading?<span className=\"mly-rail-loading\" aria-hidden=\"true\"/>:status==='error'?<span className=\"mly-rail-check\" aria-hidden=\"true\">!</span>:active&&<span className=\"mly-rail-check\" aria-hidden=\"true\">\u2713</span>}\n            </button>\n            {active && <button type=\"button\" className=\"mly-rail-button mly-rail-filter\"\n                title={t('uiFilterLayer',{label})} aria-label={t('uiFilterLayer',{label})}\n                aria-expanded={expanded} onClick={filter}><Icons.Filter size={18}/></button>}\n        </div>;\n    };\n    return <div className=\"glass-control-panel mly-control-rail\" role=\"group\" aria-label={t('uiMapControls')}>\n        <style>{controlBarInteractionCss}{controlBarCompactCss}{mapSpriteLoadingCss}</style>\n        <button type=\"button\" className=\"mly-rail-button\" title={props.isFullscreen ? t('uiExitFullscreen') : t('uiFullscreen')}\n            aria-label={props.isFullscreen ? t('uiExitFullscreen') : t('uiFullscreen')}\n            aria-pressed={props.isFullscreen} onClick={props.onToggleFullscreen}><Icons.Maximize size={20}/></button>\n        {(!props.hideTurboFilter || props.enableTrafficSigns !== false || props.enableMapillaryObjects !== false) && <span className=\"mly-rail-divider\" aria-hidden=\"true\"/>}\n        {!props.hideTurboFilter && <button type=\"button\" className=\"mly-rail-button mly-rail-filter\"\n            title={props.turboModeActive ? t('uiCoverageFilters') : t('uiCoverageFiltersUnavailable')}\n            aria-label={t('uiCoverageFilters')} aria-expanded={props.showTurboFilterBox}\n            disabled={!props.turboModeActive} onClick={props.onToggleTurboFilter}><Icons.Filter size={20}/></button>}\n        {props.enableTrafficSigns !== false && layer(\"signs\", !!props.trafficSignsActive, props.showTrafficSignsFilterBox, props.onToggleTrafficSigns, props.onToggleTrafficSignsFilter)}\n        {props.enableMapillaryObjects !== false && layer(\"objects\", !!props.objectsActive, props.showObjectsFilterBox, props.onToggleObjects, props.onToggleObjectsFilter)}\n        {props.enablePlaces && <div className=\"mly-rail-group\" role=\"group\" aria-label={t('uiNearbyPlaces')}>\n            <button type=\"button\" className=\"mly-rail-button\" title={props.placesAvailable ? t('uiNearbyPlaces') : t('uiNearbyPlacesUnavailable')}\n                aria-label={t('uiNearbyPlaces')} aria-pressed={!!props.placesActive} disabled={!props.placesAvailable} onClick={props.onTogglePlaces}>\n                {!placesIconFailed?<img src=\"https://avatars.githubusercontent.com/u/120673461?s=280&v=4\" alt=\"\" aria-hidden=\"true\" width=\"22\" height=\"22\" referrerPolicy=\"no-referrer\" onError={()=>setPlacesIconFailed(true)} style={{display:'block',objectFit:'contain',borderRadius:3}}/>:<svg aria-hidden=\"true\" width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"1.7\"><path d=\"M12 22s8-8 8-13a8 8 0 0 0-16 0c0 5 8 13 8 13Z\"/><circle cx=\"12\" cy=\"9\" r=\"2.5\"/></svg>}\n                {props.placesActive && <span className=\"mly-rail-check\" aria-hidden=\"true\">\u2713</span>}\n            </button>\n            {props.placesActive && <button type=\"button\" className=\"mly-rail-button mly-rail-filter\" aria-label={t('uiFilterNearbyPlaces')} title={t('uiFilterNearbyPlaces')} aria-expanded={!!props.placesPanelOpen} onClick={props.onTogglePlacesPanel}><Icons.Filter size={18}/></button>}\n        </div>}\n    </div>;\n};\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/components/types.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Control feedback 1",
              "before": "    freshCount: number;  freshKm: number;\n    agingCount: number;  agingKm: number;\n    staleCount: number;  staleKm: number;\n    noneCount:  number;  noneKm:  number;\n}\n\n// ControlBar props\nexport interface ControlBarProps {\n    enablePlaces?: boolean;\n    placesAvailable?: boolean;\n    placesActive?: boolean;\n    placesPanelOpen?: boolean;\n    onTogglePlaces?: () => void;\n    onTogglePlacesPanel?: () => void;\n    // config flags\n    hideTurboFilter?: boolean;\n",
              "after": "    freshCount: number;  freshKm: number;\n    agingCount: number;  agingKm: number;\n    staleCount: number;  staleKm: number;\n    noneCount:  number;  noneKm:  number;\n}\n\n// ControlBar props\nexport interface ControlBarProps {\n    signSpritesStatus?:'idle'|'loading'|'error';\n    objectSpritesStatus?:'idle'|'loading'|'error';\n    enablePlaces?: boolean;\n    placesAvailable?: boolean;\n    placesActive?: boolean;\n    placesPanelOpen?: boolean;\n    onTogglePlaces?: () => void;\n    onTogglePlacesPanel?: () => void;\n    // config flags\n    hideTurboFilter?: boolean;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/styles/infoBox.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Control feedback 1",
              "before": "            .mly-info-footer button { min-height: 20px !important; padding: 1px 2px !important; font-size: 7.5px !important; }\n            .mly-info-more-hint { animation: none !important; }\n          }\n        `;\n\n/** Compact location-first card aligned with the existing 96px tool sections. */\nexport const infoDetailsCss = `\n.mly-info-panel { container: mly-info / inline-size; min-width: 0; box-sizing: border-box; font-family: \"Segoe UI\", sans-serif; width: 96px; max-width: calc(100% - 44px); gap: 0; border-radius: 8px; overflow: hidden; box-shadow: 0 3px 10px #0003; }\n.mly-info-toggle { pointer-events: auto; width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 4px; padding: 4px 5px; min-height: 24px; border: 0; border-radius: 0; background: rgba(18,31,27,.7); backdrop-filter: blur(8px); color: #d6f1df; font: inherit; font-size: 10px; cursor: pointer; }\n.mly-info-location { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.mly-info-body { min-height: 0; display: flex; flex-direction: column; pointer-events: auto; border-radius: 0; background: rgba(18,31,27,.62); backdrop-filter: blur(8px); padding: 0; }\n.mly-info-body[hidden] { display: none; }\n.mly-info-panel .mly-info-scroll { align-items: stretch !important; padding-right: 0 !important; scrollbar-width: none; }\n.mly-info-panel .mly-info-scroll::-webkit-scrollbar { display: none; }\n.mly-info-panel .info-box { width: 100% !important; max-width: none !important; padding: 4px !important; background: transparent !important; box-shadow: none !important; border: 0 !important; font-size: 9px !important; }\n.mly-info-panel .info-box button { font-size: 9px !important; min-height: 26px; line-height: 1.3; }\n.mly-info-panel .info-box button > span { font-size: inherit !important; }\n",
              "after": "            .mly-info-footer button { min-height: 20px !important; padding: 1px 2px !important; font-size: 7.5px !important; }\n            .mly-info-more-hint { animation: none !important; }\n          }\n        `;\n\n/** Compact location-first card aligned with the existing 96px tool sections. */\nexport const infoDetailsCss = `\n.mly-info-panel { container: mly-info / inline-size; min-width: 0; box-sizing: border-box; font-family: \"Segoe UI\", sans-serif; width: 96px; max-width: calc(100% - 44px); gap: 0; border-radius: 8px; overflow: hidden; box-shadow: 0 3px 10px #0003; }\n.mly-info-toggle { pointer-events: auto; width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 4px; padding: 4px 5px; min-height: 24px; border: 0; border-radius: 5px; background: rgba(18,31,27,.7); backdrop-filter: blur(8px); color: #d6f1df; font: inherit; font-size: 10px; cursor: pointer; }\n.mly-info-location { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.mly-info-body { min-height: 0; display: flex; flex-direction: column; pointer-events: auto; border-radius: 0; background: rgba(18,31,27,.62); backdrop-filter: blur(8px); padding: 0; }\n.mly-info-body[hidden] { display: none; }\n.mly-info-panel .mly-info-scroll { align-items: stretch !important; padding-right: 0 !important; scrollbar-width: none; }\n.mly-info-panel .mly-info-scroll::-webkit-scrollbar { display: none; }\n.mly-info-panel .info-box { width: 100% !important; max-width: none !important; padding: 4px !important; background: transparent !important; box-shadow: none !important; border: 0 !important; font-size: 9px !important; }\n.mly-info-panel .info-box button { font-size: 9px !important; min-height: 26px; line-height: 1.3; }\n.mly-info-panel .info-box button > span { font-size: inherit !important; }\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/styles/controlPanels.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Control feedback 1",
              "before": ".glass-image-utility-panel.mly-utility-dock.is-collapsed > .mly-dock-cloud-group:has(> .is-loading) { display: flex !important; }\n.glass-image-utility-panel.mly-utility-dock.is-collapsed .mly-dock-mode-trigger { display: none !important; }\n.glass-image-utility-panel.mly-utility-dock[data-mobile=\"true\"].is-collapsed .mly-dock-collapse { position: relative; top: auto; left: auto; width: 26px !important; height: 26px !important; border-color: transparent; background: transparent; }\n.glass-image-utility-panel.mly-utility-dock.is-collapsed .utility-button::after, .glass-image-utility-panel.mly-utility-dock.is-collapsed .mly-dock-cloud-group::after { display: none; }\n.mly-dock-collapsed-active { position: absolute; right: 1px; bottom: 1px; width: 4px; height: 4px; border-radius: 50%; background: #8ae7ab; }\n.mly-fullscreen-viewer.mly-minimap-expanded .glass-image-utility-panel.mly-utility-dock { display: none !important; }\n@media (prefers-reduced-motion: reduce) { .mly-dock-spinner { animation: none; } .glass-image-utility-panel.mly-utility-dock .utility-button { transition: none !important; } }\n`;\n",
              "after": ".glass-image-utility-panel.mly-utility-dock.is-collapsed > .mly-dock-cloud-group:has(> .is-loading) { display: flex !important; }\n.glass-image-utility-panel.mly-utility-dock.is-collapsed .mly-dock-mode-trigger { display: none !important; }\n.glass-image-utility-panel.mly-utility-dock[data-mobile=\"true\"].is-collapsed .mly-dock-collapse { position: relative; top: auto; left: auto; width: 26px !important; height: 26px !important; border-color: transparent; background: transparent; }\n.glass-image-utility-panel.mly-utility-dock.is-collapsed .utility-button::after, .glass-image-utility-panel.mly-utility-dock.is-collapsed .mly-dock-cloud-group::after { display: none; }\n.mly-dock-collapsed-active { position: absolute; right: 1px; bottom: 1px; width: 4px; height: 4px; border-radius: 50%; background: #8ae7ab; }\n.mly-fullscreen-viewer.mly-minimap-expanded .glass-image-utility-panel.mly-utility-dock { display: none !important; }\n@media (prefers-reduced-motion: reduce) { .mly-dock-spinner { animation: none; } .glass-image-utility-panel.mly-utility-dock .utility-button { transition: none !important; } }\n`;\n\nexport const mapSpriteLoadingCss=`\n.mly-rail-loading {position:absolute;right:2px;top:2px;width:9px;height:9px;box-sizing:border-box;border:2px solid #93b4a388;border-top-color:#e1fff0;border-radius:50%;animation:mlySpriteSpin .8s linear infinite;}\n@keyframes mlySpriteSpin {to {transform:rotate(360deg);}}\n@media(prefers-reduced-motion:reduce){.mly-rail-loading{animation:none;border-top-color:#a9edc4;}}\n`;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/runtime/widget.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Control feedback 1",
              "before": "import { PointCloudViewerRenderer } from '../features/point-cloud/PointCloudViewerRenderer';\nimport type { PointCloudResult, PointCloudPoint } from \"../utils/pointCloudUtils\";\nimport { decodeAndNormalizeGeometry, getDetectionColor } from \"../utils/mapillaryDetections\";\nimport { createYearBasedRenderer, YEAR_COLOR_PALETTE } from \"../utils/mapillaryRenderers\";\nimport { loadImage, cropSpriteImage, processInChunks } from \"../utils/spriteUtils\";\nimport { Viewer, OutlineTag, PolygonGeometry, geodeticToEnu, RenderPass } from \"mapillary-js\";\nimport { PanoramaDetectionLabels } from '../features/detections/PanoramaDetectionLabels';\nimport { DetectionNoteAction } from '../features/detections/DetectionNoteAction';\nimport { createNoteObjectChoice, deferNoteObjectPopup } from '../features/detections/NoteObjectChoice';\nimport { attachmentMetadata, captureDetectionCrop, storeDetectionCrop, readDetectionCrop, deleteDetectionCrop } from '../features/detections/detectionImageAttachment';\nimport { validDetectionNoteLocation, mappedDetectionLocation } from '../features/detections/detectionNote';\nimport type { DetectionNoteSelection, DetectionNoteDestination, DetectionContributionSeed } from '../features/detections/detectionNote';\nimport type { DetectionPreviewLoader } from '../features/detections/detectionPreview';\nimport { defaultDetectionExplorer, detectionGroup, showDetection } from '../features/detections/detectionExploration';\nimport type { DetectionExplorerOptions, DetectionSummary } from '../features/detections/detectionExploration';\nimport \"mapillary-js/dist/mapillary.css\";\n",
              "after": "import { PointCloudViewerRenderer } from '../features/point-cloud/PointCloudViewerRenderer';\nimport type { PointCloudResult, PointCloudPoint } from \"../utils/pointCloudUtils\";\nimport { decodeAndNormalizeGeometry, getDetectionColor } from \"../utils/mapillaryDetections\";\nimport { createYearBasedRenderer, YEAR_COLOR_PALETTE } from \"../utils/mapillaryRenderers\";\nimport { loadImage, cropSpriteImage, processInChunks } from \"../utils/spriteUtils\";\nimport { Viewer, OutlineTag, PolygonGeometry, geodeticToEnu, RenderPass } from \"mapillary-js\";\nimport { PanoramaDetectionLabels } from '../features/detections/PanoramaDetectionLabels';\nimport { DetectionNoteAction } from '../features/detections/DetectionNoteAction';\nimport { MapSpriteLoading } from '../features/detections/MapSpriteLoading';\nimport type { MapSpriteStatus } from '../features/detections/MapSpriteLoading';\nimport { createNoteObjectChoice, deferNoteObjectPopup } from '../features/detections/NoteObjectChoice';\nimport { attachmentMetadata, captureDetectionCrop, storeDetectionCrop, readDetectionCrop, deleteDetectionCrop } from '../features/detections/detectionImageAttachment';\nimport { validDetectionNoteLocation, mappedDetectionLocation } from '../features/detections/detectionNote';\nimport type { DetectionNoteSelection, DetectionNoteDestination, DetectionContributionSeed } from '../features/detections/detectionNote';\nimport type { DetectionPreviewLoader } from '../features/detections/detectionPreview';\nimport { defaultDetectionExplorer, detectionGroup, showDetection } from '../features/detections/detectionExploration';\nimport type { DetectionExplorerOptions, DetectionSummary } from '../features/detections/detectionExploration';\nimport \"mapillary-js/dist/mapillary.css\";\n"
            },
            {
              "label": "Control feedback 2",
              "before": "  signSpriteScale?: number;\n  objectSpriteScale?: number;\n  minimapView?: __esri.MapView;\n  noImageMessageVisible: boolean;\n  turboFilterUsername: string;\n  turboFilterOrganization: string;\n  organizationName: { id: string; name: string } | null;\n  showTurboFilterBox: boolean;\n  trafficSignsOptions: Array<{ value: string; label: string; iconUrl: string | null }>;\n  showTrafficSignsFilterBox: boolean;\n  objectsOptions: Array<{ value: string; label: string; iconUrl: string | null }>;\n  showObjectsFilterBox: boolean;\n  currentZoom?: number;\n  hasTimeTravel: boolean;\n  isDownloading?: boolean;\n  mapFeatureExportLoading?: boolean;\n",
              "after": "  signSpriteScale?: number;\n  objectSpriteScale?: number;\n  minimapView?: __esri.MapView;\n  noImageMessageVisible: boolean;\n  turboFilterUsername: string;\n  turboFilterOrganization: string;\n  organizationName: { id: string; name: string } | null;\n  showTurboFilterBox: boolean;\n  signSpritesStatus:MapSpriteStatus;\n  objectSpritesStatus:MapSpriteStatus;\n  trafficSignsOptions: Array<{ value: string; label: string; iconUrl: string | null }>;\n  showTrafficSignsFilterBox: boolean;\n  objectsOptions: Array<{ value: string; label: string; iconUrl: string | null }>;\n  showObjectsFilterBox: boolean;\n  currentZoom?: number;\n  hasTimeTravel: boolean;\n  isDownloading?: boolean;\n  mapFeatureExportLoading?: boolean;\n"
            },
            {
              "label": "Control feedback 3",
              "before": "    turboFilterIsPano: undefined,\n        turboFilterOnFoot: undefined,\n    showTurboFilterBox: false,\n    turboYearLegend: [],\n    qualityViewActive: false,\n    selectedQualityBand: null,\n    showTrafficSignsFilterBox: false,\n    trafficSignsFilterValue: { value: DEFAULT_FILTER_LABELS.TRAFFIC_SIGNS, label: DEFAULT_FILTER_LABELS.TRAFFIC_SIGNS, iconUrl: null },\n    trafficSignsOptions: [{ value: DEFAULT_FILTER_LABELS.TRAFFIC_SIGNS, label: DEFAULT_FILTER_LABELS.TRAFFIC_SIGNS, iconUrl: null }],\n    showObjectsFilterBox: false,\n    objectsFilterValue: { value: DEFAULT_FILTER_LABELS.OBJECTS, label: DEFAULT_FILTER_LABELS.OBJECTS, iconUrl: null },\n    objectsOptions: [{ value: DEFAULT_FILTER_LABELS.OBJECTS, label: DEFAULT_FILTER_LABELS.OBJECTS, iconUrl: null }],\n    filtersLoaded: false,\n    showIntro: true,\n    placesActive: false, placesPanelOpen: false, placesGroup: 'all', placesStatus: { kind: 'off', count: 0 }, selectedPlace: null, placesShowLink: false, placesList: [], placesCameraDistance: null,\n    hasTimeTravel: false,\n",
              "after": "    turboFilterIsPano: undefined,\n        turboFilterOnFoot: undefined,\n    showTurboFilterBox: false,\n    turboYearLegend: [],\n    qualityViewActive: false,\n    selectedQualityBand: null,\n    showTrafficSignsFilterBox: false,\n    trafficSignsFilterValue: { value: DEFAULT_FILTER_LABELS.TRAFFIC_SIGNS, label: DEFAULT_FILTER_LABELS.TRAFFIC_SIGNS, iconUrl: null },\n    signSpritesStatus:'idle',objectSpritesStatus:'idle',\n    trafficSignsOptions: [{ value: DEFAULT_FILTER_LABELS.TRAFFIC_SIGNS, label: DEFAULT_FILTER_LABELS.TRAFFIC_SIGNS, iconUrl: null }],\n    showObjectsFilterBox: false,\n    objectsFilterValue: { value: DEFAULT_FILTER_LABELS.OBJECTS, label: DEFAULT_FILTER_LABELS.OBJECTS, iconUrl: null },\n    objectsOptions: [{ value: DEFAULT_FILTER_LABELS.OBJECTS, label: DEFAULT_FILTER_LABELS.OBJECTS, iconUrl: null }],\n    filtersLoaded: false,\n    showIntro: true,\n    placesActive: false, placesPanelOpen: false, placesGroup: 'all', placesStatus: { kind: 'off', count: 0 }, selectedPlace: null, placesShowLink: false, placesList: [], placesCameraDistance: null,\n    hasTimeTravel: false,\n"
            },
            {
              "label": "Control feedback 4",
              "before": "  }\n  // #endregion SEQUENCE MANAGEMENT\n\n  // Clean up everything when widget closes or reloads\n  // Stops animation intervals, removes all map graphics,\n  // destroys Mapillary viewer instance, clears DOM container,\n  // and resets internal state if requested.\n  private cleanupWidgetEnvironment(resetState: boolean = false, fullRemove: boolean = true) {\n    this._stopRoutePreview?.();\n    this._sharedStartupImageId=null;this._sharedStartupBearing=null;this._isFlyInActive=false;\n    if(resetState||fullRemove)this.clearSelectedMapFeature?.();\n    this._currentImagePresentation?.release();\n    if (resetState || fullRemove) { this._placesExploreAbort?.abort(); this._places?.dispose(); this._places = null; this._placesView = null; }\n    this.highlightNearbyPin(null);\n    this.clearSequenceDiagnostics();\n    this._hoverTimingAbort?.abort(); this._hoverSequenceTiming?.cancel();\n",
              "after": "  }\n  // #endregion SEQUENCE MANAGEMENT\n\n  // Clean up everything when widget closes or reloads\n  // Stops animation intervals, removes all map graphics,\n  // destroys Mapillary viewer instance, clears DOM container,\n  // and resets internal state if requested.\n  private cleanupWidgetEnvironment(resetState: boolean = false, fullRemove: boolean = true) {\n    this._mapSpriteLoading.clearAll();\n    this._stopRoutePreview?.();\n    this._sharedStartupImageId=null;this._sharedStartupBearing=null;this._isFlyInActive=false;\n    if(resetState||fullRemove)this.clearSelectedMapFeature?.();\n    this._currentImagePresentation?.release();\n    if (resetState || fullRemove) { this._placesExploreAbort?.abort(); this._places?.dispose(); this._places = null; this._placesView = null; }\n    this.highlightNearbyPin(null);\n    this.clearSequenceDiagnostics();\n    this._hoverTimingAbort?.abort(); this._hoverSequenceTiming?.cancel();\n"
            },
            {
              "label": "Control feedback 5",
              "before": "      } else {\n        // Ensure proper filter format\n        targetLayer.filter = [\"==\", [\"get\", \"value\"], selectedValue];\n      }\n    }\n\n    try {\n      const { VectorTileLayer } = this.ArcGISModules;\n      const filteredLayer = new VectorTileLayer({ style: newStyle });\n\n      const { view } = this.state.jimuMapView;\n      if (this.mapillaryTrafficSignsLayer && view.map.layers.includes(this.mapillaryTrafficSignsLayer)) {\n        view.map.remove(this.mapillaryTrafficSignsLayer);\n      }\n      this.mapillaryTrafficSignsLayer = filteredLayer;\n      view.map.add(this.mapillaryTrafficSignsLayer);\n      void this.applyMapFeatureSpriteScale(\"signs\");\n    } catch (err) {\n      console.error(\"Error applying traffic signs filter:\", err);\n    }\n  }\n\n  /**\n   * Filters the objects/points VectorTileLayer so only icons matching `selectedValue` show.\n",
              "after": "      } else {\n        // Ensure proper filter format\n        targetLayer.filter = [\"==\", [\"get\", \"value\"], selectedValue];\n      }\n    }\n\n    try {\n      const { VectorTileLayer } = this.ArcGISModules;\n      const filteredLayer = new VectorTileLayer({ id:LAYER_IDS.TRAFFIC_SIGNS_VT, title:\"Mapillary Traffic Signs Coverage\", style: newStyle });\n\n      const { view } = this.state.jimuMapView;\n      if (this.mapillaryTrafficSignsLayer && view.map.layers.includes(this.mapillaryTrafficSignsLayer)) {\n        view.map.remove(this.mapillaryTrafficSignsLayer);\n      }\n      this.mapillaryTrafficSignsLayer = filteredLayer;\n      view.map.add(this.mapillaryTrafficSignsLayer);\n      this._mapSpriteLoading.start(\"signs\",view as any,filteredLayer);\n      void this.applyMapFeatureSpriteScale(\"signs\");\n    } catch (err) {\n      console.error(\"Error applying traffic signs filter:\", err);\n    }\n  }\n\n  /**\n   * Filters the objects/points VectorTileLayer so only icons matching `selectedValue` show.\n"
            },
            {
              "label": "Control feedback 6",
              "before": "        delete targetLayer.filter;\n      } else {\n        targetLayer.filter = [\"==\", [\"get\", \"value\"], selectedValue];\n      }\n    }\n\n    try {\n      const { VectorTileLayer } = this.ArcGISModules;\n      const filteredLayer = new VectorTileLayer({ style: newStyle });\n\n      const { view } = this.state.jimuMapView;\n      if (this.mapillaryObjectsLayer && view.map.layers.includes(this.mapillaryObjectsLayer)) {\n        view.map.remove(this.mapillaryObjectsLayer);\n      }\n      this.mapillaryObjectsLayer = filteredLayer;\n      view.map.add(this.mapillaryObjectsLayer);\n      void this.applyMapFeatureSpriteScale(\"objects\");\n    } catch (err) {\n      console.error(\"Error applying objects filter:\", err);\n    }\n  }\n  // #endregion FILTER LOADING\n\n  // #region COVERAGE LAYERS\n",
              "after": "        delete targetLayer.filter;\n      } else {\n        targetLayer.filter = [\"==\", [\"get\", \"value\"], selectedValue];\n      }\n    }\n\n    try {\n      const { VectorTileLayer } = this.ArcGISModules;\n      const filteredLayer = new VectorTileLayer({ id:LAYER_IDS.OBJECTS_VT, title:\"Mapillary Objects Coverage\", style: newStyle });\n\n      const { view } = this.state.jimuMapView;\n      if (this.mapillaryObjectsLayer && view.map.layers.includes(this.mapillaryObjectsLayer)) {\n        view.map.remove(this.mapillaryObjectsLayer);\n      }\n      this.mapillaryObjectsLayer = filteredLayer;\n      view.map.add(this.mapillaryObjectsLayer);\n      this._mapSpriteLoading.start(\"objects\",view as any,filteredLayer);\n      void this.applyMapFeatureSpriteScale(\"objects\");\n    } catch (err) {\n      console.error(\"Error applying objects filter:\", err);\n    }\n  }\n  // #endregion FILTER LOADING\n\n  // #region COVERAGE LAYERS\n"
            },
            {
              "label": "Control feedback 7",
              "before": "  }\n\n  /*\n        Initializes the Mapillary Traffic Signs Layer\n        * Creates a Traffic Signs Layer from the Mapillary tiles API\n        * Stores the layer in `this.mapillaryTrafficSignsLayer` for later toggling\n    */\n  /** Native tiles own all sprites; no per-viewport FeatureLayer is constructed. */\n  private async syncMapFeatureCoverage(kind: \"signs\" | \"objects\") {\n    const view = this.state.jimuMapView?.view;\n    if (!view) return;\n    const signs = kind === \"signs\", active = signs ? this.state.trafficSignsActive : this.state.objectsActive;\n    const id = signs ? LAYER_IDS.TRAFFIC_SIGNS_VT : LAYER_IDS.OBJECTS_VT;\n    const oldFeature = view.map.findLayerById(signs ? LAYER_IDS.TRAFFIC_SIGNS_FL : LAYER_IDS.OBJECTS_FL);\n    if (oldFeature) { view.map.remove(oldFeature); oldFeature.destroy(); }\n    if (signs) { this.mapillaryTrafficSignsFeatureLayer = null; this.trafficSignsZoomHandle?.remove(); this.trafficSignsStationaryHandle?.remove(); }\n    else { this.mapillaryObjectsFeatureLayer = null; this.objectsZoomHandle?.remove(); this.objectsStationaryHandle?.remove(); }\n    let layer = view.map.findLayerById(id) as __esri.VectorTileLayer;\n    if (!active) { this.setState(signs ? { showTrafficSignsFilterBox: false } : { showObjectsFilterBox: false }); if (layer) view.map.remove(layer); this._mapFeatureClickAbort?.abort(); this._turboHoverPickAbort?.abort(); this.clearTurboHoverDetails(); return; }\n    if (!layer) {\n      if (signs) this.initMapillaryTrafficSignsLayer(); else this.initMapillaryObjectsLayer();\n      layer = (signs ? this.mapillaryTrafficSignsLayer : this.mapillaryObjectsLayer)!;\n      view.map.add(layer);\n    }\n    if (signs) this.mapillaryTrafficSignsLayer = layer; else this.mapillaryObjectsLayer = layer;\n    layer.visible = true;\n    const code = this._mapFeatureFilterCodes.get(kind);\n    if (code) { if (signs) this.filterTrafficSignsVTLayer(code); else this.filterObjectsVTLayer(code); }\n    void this.applyMapFeatureSpriteScale(kind);\n    this.enforceMapillaryLayerOrder(view);\n  }\n\n  /** Inspect only pointer-local source tiles; keep bytes, not decoded feature collections. */\n  private openPickedMapDetection(feature:any) {\n    this._selectedMapFeature=feature;\n    const attrs=feature.graphic.attributes,featureId=attrs.id||attrs.value;\n    const geoPt=webMercatorUtils.webMercatorToGeographic(feature.graphic.geometry) as __esri.Point;\n",
              "after": "  }\n\n  /*\n        Initializes the Mapillary Traffic Signs Layer\n        * Creates a Traffic Signs Layer from the Mapillary tiles API\n        * Stores the layer in `this.mapillaryTrafficSignsLayer` for later toggling\n    */\n  /** Native tiles own all sprites; no per-viewport FeatureLayer is constructed. */\n  private _mapSpriteLoading=new MapSpriteLoading((kind,status)=>{if(!this._sharedNotesDisposed)this.setState(kind==='signs'?{signSpritesStatus:status}:{objectSpritesStatus:status});});\n  private async syncMapFeatureCoverage(kind: \"signs\" | \"objects\") {\n    const view = this.state.jimuMapView?.view;\n    if (!view) {this._mapSpriteLoading.clear(kind);return;}\n    const signs = kind === \"signs\", active = signs ? this.state.trafficSignsActive : this.state.objectsActive;\n    const id = signs ? LAYER_IDS.TRAFFIC_SIGNS_VT : LAYER_IDS.OBJECTS_VT;\n    const oldFeature = view.map.findLayerById(signs ? LAYER_IDS.TRAFFIC_SIGNS_FL : LAYER_IDS.OBJECTS_FL);\n    if (oldFeature) { view.map.remove(oldFeature); oldFeature.destroy(); }\n    if (signs) { this.mapillaryTrafficSignsFeatureLayer = null; this.trafficSignsZoomHandle?.remove(); this.trafficSignsStationaryHandle?.remove(); }\n    else { this.mapillaryObjectsFeatureLayer = null; this.objectsZoomHandle?.remove(); this.objectsStationaryHandle?.remove(); }\n    let layer = view.map.findLayerById(id) as __esri.VectorTileLayer;\n    if (!active) { this._mapSpriteLoading.clear(kind);this.setState(signs ? { showTrafficSignsFilterBox: false } : { showObjectsFilterBox: false }); if (layer) view.map.remove(layer); this._mapFeatureClickAbort?.abort(); this._turboHoverPickAbort?.abort(); this.clearTurboHoverDetails(); return; }\n    if (!layer) {\n      if (signs) this.initMapillaryTrafficSignsLayer(); else this.initMapillaryObjectsLayer();\n      layer = (signs ? this.mapillaryTrafficSignsLayer : this.mapillaryObjectsLayer)!;\n      view.map.add(layer);\n    }\n    if (signs) this.mapillaryTrafficSignsLayer = layer; else this.mapillaryObjectsLayer = layer;\n    layer.visible = true;\n    const code = this._mapFeatureFilterCodes.get(kind);\n    if (code) { if (signs) this.filterTrafficSignsVTLayer(code); else this.filterObjectsVTLayer(code); }\n    void this.applyMapFeatureSpriteScale(kind);\n    const displayedLayer=signs?this.mapillaryTrafficSignsLayer:this.mapillaryObjectsLayer;\n    if(displayedLayer)this._mapSpriteLoading.start(kind,view as any,displayedLayer);\n    this.enforceMapillaryLayerOrder(view);\n  }\n\n  /** Inspect only pointer-local source tiles; keep bytes, not decoded feature collections. */\n  private openPickedMapDetection(feature:any) {\n    this._selectedMapFeature=feature;\n    const attrs=feature.graphic.attributes,featureId=attrs.id||attrs.value;\n    const geoPt=webMercatorUtils.webMercatorToGeographic(feature.graphic.geometry) as __esri.Point;\n"
            },
            {
              "label": "Control feedback 8",
              "before": "    this.mapillaryTrafficSignsLayer = new VectorTileLayer({\n      id: LAYER_IDS.TRAFFIC_SIGNS_VT,\n      title: \"Mapillary Traffic Signs Coverage\",\n      style: minimalStyle,\n    });\n  }\n  private toggleMapillaryTrafficSigns = async () => {\n    const next = !this.state.trafficSignsActive;\n    this.setState({ trafficSignsActive: next }, () => { if(!next)this.clearSelectedMapFeature(\"signs\");void this.syncMapFeatureCoverage(\"signs\"); this.syncDetectionLayerAvailability(); });\n  };\n\n\n  /*\n        Initializes the Mapillary Objects Layer Layer\n        * Creates a Object Layer from the Mapillary tiles API\n        * Stores the layer in `this.mapillaryObjectsLayer` for later toggling\n    */\n",
              "after": "    this.mapillaryTrafficSignsLayer = new VectorTileLayer({\n      id: LAYER_IDS.TRAFFIC_SIGNS_VT,\n      title: \"Mapillary Traffic Signs Coverage\",\n      style: minimalStyle,\n    });\n  }\n  private toggleMapillaryTrafficSigns = async () => {\n    const next = !this.state.trafficSignsActive;\n    this.setState({ trafficSignsActive: next,signSpritesStatus:next?'loading':'idle' }, () => { if(!next)this.clearSelectedMapFeature(\"signs\");void this.syncMapFeatureCoverage(\"signs\"); this.syncDetectionLayerAvailability(); });\n  };\n\n\n  /*\n        Initializes the Mapillary Objects Layer Layer\n        * Creates a Object Layer from the Mapillary tiles API\n        * Stores the layer in `this.mapillaryObjectsLayer` for later toggling\n    */\n"
            },
            {
              "label": "Control feedback 9",
              "before": "    this.mapillaryObjectsLayer = new VectorTileLayer({\n      id: LAYER_IDS.OBJECTS_VT,\n      title: \"Mapillary Objects Coverage\",\n      style: minimalStyle,\n    });\n  }\n  private toggleMapillaryObjects = async () => {\n    const next = !this.state.objectsActive;\n    this.setState({ objectsActive: next }, () => { if(!next)this.clearSelectedMapFeature(\"objects\");void this.syncMapFeatureCoverage(\"objects\"); this.syncDetectionLayerAvailability(); });\n  };\n\n\n  private toggleQualityView = async () => {\n    const newActive = !this.state.qualityViewActive;\n    this.setState({ qualityViewActive: newActive, selectedQualityBand: newActive ? this.state.selectedQualityBand : null }, async () => {\n      // Sequence-level quality_score exists from zoom 6, but the image\n      // layer (and therefore per-image band precision) only renders at\n",
              "after": "    this.mapillaryObjectsLayer = new VectorTileLayer({\n      id: LAYER_IDS.OBJECTS_VT,\n      title: \"Mapillary Objects Coverage\",\n      style: minimalStyle,\n    });\n  }\n  private toggleMapillaryObjects = async () => {\n    const next = !this.state.objectsActive;\n    this.setState({ objectsActive: next,objectSpritesStatus:next?'loading':'idle' }, () => { if(!next)this.clearSelectedMapFeature(\"objects\");void this.syncMapFeatureCoverage(\"objects\"); this.syncDetectionLayerAvailability(); });\n  };\n\n\n  private toggleQualityView = async () => {\n    const newActive = !this.state.qualityViewActive;\n    this.setState({ qualityViewActive: newActive, selectedQualityBand: newActive ? this.state.selectedQualityBand : null }, async () => {\n      // Sequence-level quality_score exists from zoom 6, but the image\n      // layer (and therefore per-image band precision) only renders at\n"
            },
            {
              "label": "Control feedback 10",
              "before": "    }\n  }\n\n  private getCoverageBarPresentation(): { text: string; action?: \"show\" | \"data\" | \"tilt\" | \"zoom\" | \"retry\"; label?: string; busy?: boolean } {\n    const view = this.state.jimuMapView?.view;\n    const zoom = view?.zoom ?? 0;\n    if (this.state.coverageFrameResolving) return { text: this._t('appFindingNearbyImage'), busy: true };\n    if (this.state.isLoading) return { text: this._t('appOpeningImage'), busy: true };\n    if (this.state.imageId && this.state.sequenceRouteLoading) return { text: this.state.sequenceRouteProgress ? this._t('uiProfileRoute',{progress:this.state.sequenceRouteProgress}) : this._t('uiLoadingProfileRoute'), busy: true };\n    if (this.state.turboLoading || this.state.turboUpdatingVisible) return { text: this._t('appLoadingCoverage'), busy: !!this.state.turboUpdatingVisible };\n    if (this.state.turboModeActive && this.getTurboOrganizationId() === -1) return { text: this._t('appEnterAValidOrganizationId') };\n    if (this.state.turboModeActive && this.getTurboOrganizationId() !== undefined && zoom < 6) return { text: this._t('appZoomCloserForOrganizationCoverage'), action: \"show\", label: this._t('appZoomToCoverage') };\n    if (this.state.imageId && this.state.selectionError) return { text: this.state.selectionError.startsWith(\"Image is open\") ? this._t('uiImageReadyNoSequence') : this._t('uiImageCouldNotLoad') };\n    if (this.state.turboModeActive && this.state.turboFilterOnFoot !== undefined && zoom < 6) return { text: this._t('appZoomCloserForTravelMethodCoverage'), action: \"show\", label: this._t('appZoomToImages') };\n    if ((this.state.trafficSignsActive || this.state.objectsActive) && zoom + 1e-4 < ZOOM.FEATURES_INTERACTIVE) {\n      return { text: this._t(this.state.trafficSignsActive && this.state.objectsActive ? 'uiExploreSignsObjects' : this.state.trafficSignsActive ? 'uiExploreSigns' : 'uiExploreObjects'), action: \"data\", label: this._t('appZoomCloser') };\n",
              "after": "    }\n  }\n\n  private getCoverageBarPresentation(): { text: string; action?: \"show\" | \"data\" | \"tilt\" | \"zoom\" | \"retry\"; label?: string; busy?: boolean } {\n    const view = this.state.jimuMapView?.view;\n    const zoom = view?.zoom ?? 0;\n    if (this.state.coverageFrameResolving) return { text: this._t('appFindingNearbyImage'), busy: true };\n    if (this.state.isLoading) return { text: this._t('appOpeningImage'), busy: true };\n    const signsLoading=this.state.trafficSignsActive&&this.state.signSpritesStatus==='loading',objectsLoading=this.state.objectsActive&&this.state.objectSpritesStatus==='loading';\n    if(signsLoading||objectsLoading)return{text:this._owned(signsLoading&&objectsLoading?'Loading traffic sign and object icons\u2026':signsLoading?'Loading traffic sign icons\u2026':'Loading object icons\u2026'),busy:true};\n    if((this.state.trafficSignsActive&&this.state.signSpritesStatus==='error')||(this.state.objectsActive&&this.state.objectSpritesStatus==='error'))return{text:this._owned('Map icons could not load. Toggle the affected layer off and on to retry.')};\n    if (this.state.imageId && this.state.sequenceRouteLoading) return { text: this.state.sequenceRouteProgress ? this._t('uiProfileRoute',{progress:this.state.sequenceRouteProgress}) : this._t('uiLoadingProfileRoute'), busy: true };\n    if (this.state.turboLoading || this.state.turboUpdatingVisible) return { text: this._t('appLoadingCoverage'), busy: !!this.state.turboUpdatingVisible };\n    if (this.state.turboModeActive && this.getTurboOrganizationId() === -1) return { text: this._t('appEnterAValidOrganizationId') };\n    if (this.state.turboModeActive && this.getTurboOrganizationId() !== undefined && zoom < 6) return { text: this._t('appZoomCloserForOrganizationCoverage'), action: \"show\", label: this._t('appZoomToCoverage') };\n    if (this.state.imageId && this.state.selectionError) return { text: this.state.selectionError.startsWith(\"Image is open\") ? this._t('uiImageReadyNoSequence') : this._t('uiImageCouldNotLoad') };\n    if (this.state.turboModeActive && this.state.turboFilterOnFoot !== undefined && zoom < 6) return { text: this._t('appZoomCloserForTravelMethodCoverage'), action: \"show\", label: this._t('appZoomToImages') };\n    if ((this.state.trafficSignsActive || this.state.objectsActive) && zoom + 1e-4 < ZOOM.FEATURES_INTERACTIVE) {\n      return { text: this._t(this.state.trafficSignsActive && this.state.objectsActive ? 'uiExploreSignsObjects' : this.state.trafficSignsActive ? 'uiExploreSigns' : 'uiExploreObjects'), action: \"data\", label: this._t('appZoomCloser') };\n"
            },
            {
              "label": "Control feedback 11",
              "before": "          onLink={value => { this.setState({ placesShowLink: value }); this._places?.selection.setLink(value); }}\n          onBack={this.goToSelectedPlace} onDetails={() => this._places?.open([], this.state.selectedPlace?.id)} onClear={() => this._places?.clearSelection()}/>}\n\n        {/* Splash Screen */}\n        <SplashScreen showIntro={this.state.showIntro} filtersLoaded={this.state.filtersLoaded} onDismiss={this.dismissIntro} />\n\n        {/* Control Bar */}\n        <ControlBar\n          hideTurboFilter={this.props.config.hideTurboFilter}\n          enablePlaces={this.props.config.enablePlaces === true}\n          placesAvailable={!!placesServiceUrl(this.props.config.placesServiceUrl)}\n          placesActive={this.state.placesActive} placesPanelOpen={this.state.placesPanelOpen}\n          onTogglePlaces={this.togglePlaces} onTogglePlacesPanel={() => this.setState(previous => ({ placesPanelOpen: !previous.placesPanelOpen }))}\n          enableTrafficSigns={this.props.config.enableTrafficSigns}\n          enableMapillaryObjects={this.props.config.enableMapillaryObjects}\n          isFullscreen={this.state.isFullscreen}\n",
              "after": "          onLink={value => { this.setState({ placesShowLink: value }); this._places?.selection.setLink(value); }}\n          onBack={this.goToSelectedPlace} onDetails={() => this._places?.open([], this.state.selectedPlace?.id)} onClear={() => this._places?.clearSelection()}/>}\n\n        {/* Splash Screen */}\n        <SplashScreen showIntro={this.state.showIntro} filtersLoaded={this.state.filtersLoaded} onDismiss={this.dismissIntro} />\n\n        {/* Control Bar */}\n        <ControlBar\n          signSpritesStatus={this.state.signSpritesStatus} objectSpritesStatus={this.state.objectSpritesStatus}\n          hideTurboFilter={this.props.config.hideTurboFilter}\n          enablePlaces={this.props.config.enablePlaces === true}\n          placesAvailable={!!placesServiceUrl(this.props.config.placesServiceUrl)}\n          placesActive={this.state.placesActive} placesPanelOpen={this.state.placesPanelOpen}\n          onTogglePlaces={this.togglePlaces} onTogglePlacesPanel={() => this.setState(previous => ({ placesPanelOpen: !previous.placesPanelOpen }))}\n          enableTrafficSigns={this.props.config.enableTrafficSigns}\n          enableMapillaryObjects={this.props.config.enableMapillaryObjects}\n          isFullscreen={this.state.isFullscreen}\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/panelControls.browser.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "Control feedback 1",
              "before": "/** Mount actual React controls in Chromium: compact width toggles, tool spacing and scrollbar interaction.\n * Set MAPILLARY_TYPESCRIPT, REACT_UMD_PATH and REACT_DOM_UMD_PATH to local test dependencies.\n */\nconst fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),{chromium}=require(process.env.MAPILLARY_PLAYWRIGHT||'playwright');\nconst root=process.env.PANEL_CONTROLS_SOURCE_ROOT||path.resolve(__dirname,'../src');const modules={};\nfunction bundle(rel){if(modules[rel])return;const code=ts.transpileModule(fs.readFileSync(path.join(root,rel),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,jsxFactory:'jsx',jsxFragmentFactory:'React.Fragment'}}).outputText;modules[rel]={code,deps:{}};for(const match of code.matchAll(/require\\([\"']([^\"']+)[\"']\\)/g)){const id=match[1];if(!id.startsWith('.'))continue;const base=path.posix.normalize(path.posix.join(path.posix.dirname(rel),id));const target=['.ts','.tsx',''].map(ext=>base+ext).find(f=>fs.existsSync(path.join(root,f)));if(!target)throw Error(id);modules[rel].deps[id]=target;bundle(target)}}\nbundle('components/InfoBox.tsx');bundle('components/FilterScrollRegion.tsx');\n(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,ignoreDefaultArgs:['--hide-scrollbars'],args:['--no-sandbox']});let checks=0;const trace=message=>{if(process.env.PANEL_TEST_DEBUG)console.log(message)};try{for(const mobile of [false,true]){const context=await browser.newContext({viewport:mobile?{width:375,height:667}:{width:1280,height:900},isMobile:mobile,hasTouch:mobile});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setContent('<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><style>body{margin:0;background:#506257;color:white}.host{position:relative;container-type:inline-size;width:300px;height:400px}#filters{width:300px;margin-top:8px} .mly-info-panel .mly-info-scroll{scrollbar-width:auto!important;scrollbar-gutter:stable}.mly-info-panel .mly-info-scroll::-webkit-scrollbar{display:block!important;width:12px}</style><div class=\"host\" id=\"info\"></div><div id=\"filters\"></div>');await page.addScriptTag({path:process.env.REACT_UMD_PATH||'/tmp/panel-react/package/umd/react.development.js'});await page.addScriptTag({path:process.env.REACT_DOM_UMD_PATH||'/tmp/panel-react-dom/package/umd/react-dom.development.js'});await page.evaluate(({modules})=>{const cache={};function load(name){if(cache[name])return cache[name].exports;const m={exports:{}};cache[name]=m;const def=modules[name];new Function('require','module','exports',def.code)(id=>id==='jimu-core'?{React,jsx:React.createElement}:id==='react'?{...React,default:React}:id==='react-dom'?{...ReactDOM,default:ReactDOM}:load(def.deps[id]),m,m.exports);return m.exports}const {InfoBox}=load('components/InfoBox.tsx'),{FilterScrollRegion}=load('components/FilterScrollRegion.tsx');window.infoRoot=ReactDOM.createRoot(document.getElementById('info'));window.infoProps={sequenceImages:[],imageId:'A',currentZoom:17,pointCloudVisible:true,measurePoints:[],sightTargets:[],pointCloudLength:0,pointCloudMaxLength:100,pointCloudWidth:0,pointCloudMaxWidth:80,address:'Nashville'};window.renderInfo=patch=>{Object.assign(window.infoProps,patch);window.infoRoot.render(React.createElement(InfoBox,window.infoProps));};window.renderInfo({});window.filterRoot=ReactDOM.createRoot(document.getElementById('filters'));window.renderFilters=width=>window.filterRoot.render(React.createElement(FilterScrollRegion,null,React.createElement('div',{style:{width,flex:'0 0 auto',display:'flex',gap:8}},width>100?React.createElement('input',{'aria-label':'Username',style:{width:130,height:24}}):'Small',width>100?React.createElement('span',null,'Filter content'):null)));window.renderFilters(1400);},{modules});\n await page.getByRole('button',{name:'Open image details and tools'}).click();const toggle=page.getByRole('button',{name:'Widen details panel'});assert(await toggle.isVisible(),`Width toggle must be visible on ${mobile?'mobile':'desktop controller'}`);const panel=page.locator('.mly-info-panel');assert.equal((await panel.boundingBox()).width,96);await toggle.click();await page.waitForFunction(()=>document.querySelector('.mly-info-panel').classList.contains('is-wide'));assert.equal((await panel.boundingBox()).width,144);await page.getByRole('button',{name:'Use compact panel width'}).click();await page.locator('.mly-info-more > summary').click();const spacing=await page.locator('.mly-tool-heading').evaluateAll(nodes=>nodes.map(e=>{const svg=e.querySelector('svg').getBoundingClientRect(),text=e.querySelector('.mly-tool-text').getBoundingClientRect();return{text:e.textContent.trim(),gap:text.left-svg.right}}));assert.equal(spacing.length,5);for(const s of spacing)assert(s.gap>=4,JSON.stringify(s));checks+=3;\n await page.getByRole('button',{name:'Close image details and tools'}).click();await page.locator('.mly-info-more').evaluate(node=>node.open=false);\n await page.evaluate(()=>window.renderInfo({trafficSignsActive:true,detectionsActive:true,showAiTags:true,detectionToolsRequest:1}));\n await page.getByRole('button',{name:'Detection outlines',exact:true}).waitFor({state:'visible'});\n assert.equal(await page.locator('.mly-info-more').evaluate(node=>node.open),true);checks++;\n const exportButton=page.locator('.mly-detection-export'),overlayButton=page.getByRole('button',{name:'Detection outlines',exact:true}),labelsButton=page.getByRole('button',{name:'Detection labels',exact:true});\n assert.equal(await overlayButton.getAttribute('aria-pressed'),'true');\n const sizes=await page.locator('.mly-detection-button').evaluateAll(nodes=>nodes.map(node=>({height:node.getBoundingClientRect().height,font:getComputedStyle(node).fontSize})));\n assert.equal(sizes.length,3);assert(sizes.every(size=>size.font==='9px'));assert(sizes.every(size=>size.height>=24));assert(sizes[2].height<=sizes[1].height+1);checks++;\n",
              "after": "/** Mount actual React controls in Chromium: compact width toggles, tool spacing and scrollbar interaction.\n * Set MAPILLARY_TYPESCRIPT, REACT_UMD_PATH and REACT_DOM_UMD_PATH to local test dependencies.\n */\nconst fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),{chromium}=require(process.env.MAPILLARY_PLAYWRIGHT||'playwright');\nconst root=process.env.PANEL_CONTROLS_SOURCE_ROOT||path.resolve(__dirname,'../src');const modules={};\nfunction bundle(rel){if(modules[rel])return;const code=ts.transpileModule(fs.readFileSync(path.join(root,rel),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,jsxFactory:'jsx',jsxFragmentFactory:'React.Fragment'}}).outputText;modules[rel]={code,deps:{}};for(const match of code.matchAll(/require\\([\"']([^\"']+)[\"']\\)/g)){const id=match[1];if(!id.startsWith('.'))continue;const base=path.posix.normalize(path.posix.join(path.posix.dirname(rel),id));const target=['.ts','.tsx',''].map(ext=>base+ext).find(f=>fs.existsSync(path.join(root,f)));if(!target)throw Error(id);modules[rel].deps[id]=target;bundle(target)}}\nbundle('components/InfoBox.tsx');bundle('components/FilterScrollRegion.tsx');\n(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,ignoreDefaultArgs:['--hide-scrollbars'],args:['--no-sandbox']});let checks=0;const trace=message=>{if(process.env.PANEL_TEST_DEBUG)console.log(message)};try{for(const mobile of [false,true]){const context=await browser.newContext({viewport:mobile?{width:375,height:667}:{width:1280,height:900},isMobile:mobile,hasTouch:mobile});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setContent('<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><style>body{margin:0;background:#506257;color:white}.host{position:relative;container-type:inline-size;width:300px;height:400px}#filters{width:300px;margin-top:8px} .mly-info-panel .mly-info-scroll{scrollbar-width:auto!important;scrollbar-gutter:stable}.mly-info-panel .mly-info-scroll::-webkit-scrollbar{display:block!important;width:12px}</style><div class=\"host\" id=\"info\"></div><div id=\"filters\"></div>');await page.addScriptTag({path:process.env.REACT_UMD_PATH||'/tmp/panel-react/package/umd/react.development.js'});await page.addScriptTag({path:process.env.REACT_DOM_UMD_PATH||'/tmp/panel-react-dom/package/umd/react-dom.development.js'});await page.evaluate(({modules})=>{const cache={};function load(name){if(cache[name])return cache[name].exports;const m={exports:{}};cache[name]=m;const def=modules[name];new Function('require','module','exports',def.code)(id=>id==='jimu-core'?{React,jsx:React.createElement}:id==='react'?{...React,default:React}:id==='react-dom'?{...ReactDOM,default:ReactDOM}:load(def.deps[id]),m,m.exports);return m.exports}const {InfoBox}=load('components/InfoBox.tsx'),{FilterScrollRegion}=load('components/FilterScrollRegion.tsx');window.infoRoot=ReactDOM.createRoot(document.getElementById('info'));window.infoProps={sequenceImages:[],imageId:'A',currentZoom:17,pointCloudVisible:true,measurePoints:[],sightTargets:[],pointCloudLength:0,pointCloudMaxLength:100,pointCloudWidth:0,pointCloudMaxWidth:80,address:'Nashville'};window.renderInfo=patch=>{Object.assign(window.infoProps,patch);window.infoRoot.render(React.createElement(InfoBox,window.infoProps));};window.renderInfo({});window.filterRoot=ReactDOM.createRoot(document.getElementById('filters'));window.renderFilters=width=>window.filterRoot.render(React.createElement(FilterScrollRegion,null,React.createElement('div',{style:{width,flex:'0 0 auto',display:'flex',gap:8}},width>100?React.createElement('input',{'aria-label':'Username',style:{width:130,height:24}}):'Small',width>100?React.createElement('span',null,'Filter content'):null)));window.renderFilters(1400);},{modules});\n await page.getByRole('button',{name:'Open image details and tools'}).click();const toggle=page.getByRole('button',{name:'Widen details panel'});assert(await toggle.isVisible(),`Width toggle must be visible on ${mobile?'mobile':'desktop controller'}`);assert.equal(await page.locator('.mly-info-toggle').evaluate(node=>getComputedStyle(node).borderRadius),'5px');checks++;const panel=page.locator('.mly-info-panel');assert.equal((await panel.boundingBox()).width,96);await toggle.click();await page.waitForFunction(()=>document.querySelector('.mly-info-panel').classList.contains('is-wide'));assert.equal((await panel.boundingBox()).width,144);await page.getByRole('button',{name:'Use compact panel width'}).click();await page.locator('.mly-info-more > summary').click();const spacing=await page.locator('.mly-tool-heading').evaluateAll(nodes=>nodes.map(e=>{const svg=e.querySelector('svg').getBoundingClientRect(),text=e.querySelector('.mly-tool-text').getBoundingClientRect();return{text:e.textContent.trim(),gap:text.left-svg.right}}));assert.equal(spacing.length,5);for(const s of spacing)assert(s.gap>=4,JSON.stringify(s));checks+=3;\n await page.getByRole('button',{name:'Close image details and tools'}).click();await page.locator('.mly-info-more').evaluate(node=>node.open=false);\n await page.evaluate(()=>window.renderInfo({trafficSignsActive:true,detectionsActive:true,showAiTags:true,detectionToolsRequest:1}));\n await page.getByRole('button',{name:'Detection outlines',exact:true}).waitFor({state:'visible'});\n assert.equal(await page.locator('.mly-info-more').evaluate(node=>node.open),true);checks++;\n const exportButton=page.locator('.mly-detection-export'),overlayButton=page.getByRole('button',{name:'Detection outlines',exact:true}),labelsButton=page.getByRole('button',{name:'Detection labels',exact:true});\n assert.equal(await overlayButton.getAttribute('aria-pressed'),'true');\n const sizes=await page.locator('.mly-detection-button').evaluateAll(nodes=>nodes.map(node=>({height:node.getBoundingClientRect().height,font:getComputedStyle(node).fontSize})));\n assert.equal(sizes.length,3);assert(sizes.every(size=>size.font==='9px'));assert(sizes.every(size=>size.height>=24));assert(sizes[2].height<=sizes[1].height+1);checks++;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/detections/MapSpriteLoading.ts",
      "content": "export type MapSpriteKind='signs'|'objects';\nexport type MapSpriteStatus='idle'|'loading'|'error';\ninterface Layer {destroyed?:boolean;load():Promise<unknown>}\ninterface LayerView {updating:boolean;watch(name:string,callback:(value:boolean)=>void):{remove():void}}\ninterface View {destroyed?:boolean;whenLayerView(layer:any):Promise<LayerView>}\n/** One cancellable readiness observer per source. Reuses SDK loading; never fetches tiles itself. */\nexport class MapSpriteLoading {\n private entries=new Map<MapSpriteKind,{view:View;layer:Layer;frame:number;handle?:{remove():void}}>();\n private statuses=new Map<MapSpriteKind,MapSpriteStatus>();\n constructor(private report:(kind:MapSpriteKind,status:MapSpriteStatus)=>void,private frame:(callback:()=>void)=>number=callback=>requestAnimationFrame(callback),private cancelFrame:(id:number)=>void=id=>cancelAnimationFrame(id)){}\n private status(kind:MapSpriteKind,value:MapSpriteStatus){if(this.statuses.get(kind)!==value){this.statuses.set(kind,value);this.report(kind,value);}}\n clear(kind:MapSpriteKind,report=true){const entry=this.entries.get(kind);this.entries.delete(kind);entry?.handle?.remove();if(entry?.frame)this.cancelFrame(entry.frame);if(report)this.status(kind,'idle');}\n clearAll(){this.clear('signs');this.clear('objects');}\n start(kind:MapSpriteKind,view:View,layer:Layer){\n  const previous=this.entries.get(kind);if(previous?.view===view&&previous.layer===layer)return;\n  this.clear(kind,false);const entry={view,layer,frame:0,handle:undefined as {remove():void}|undefined};this.entries.set(kind,entry);this.status(kind,'loading');\n  const current=()=>this.entries.get(kind)===entry&&!view.destroyed&&!layer.destroyed;\n  const finish=(status:MapSpriteStatus)=>{if(!current())return;this.clear(kind,false);this.status(kind,status);};\n  void (async()=>{try{await layer.load();if(!current())return;const layerView=await view.whenLayerView(layer);if(!current())return;\n   const update=(updating:boolean)=>{if(!current())return;if(entry.frame)this.cancelFrame(entry.frame);entry.frame=0;if(updating)return;\n    entry.frame=this.frame(()=>{entry.frame=0;if(!current()||layerView.updating)return;entry.frame=this.frame(()=>{entry.frame=0;if(current()&&!layerView.updating)finish('idle');});});};\n   entry.handle=layerView.watch('updating',update);update(layerView.updating);\n  }catch{finish('error');}})();\n }\n}\n"
    },
    {
      "file": "tests/mapSpriteLoading.test.cjs",
      "content": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');const m={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/detections/MapSpriteLoading.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m,m.exports);const {MapSpriteLoading}=m.exports,flush=()=>new Promise(resolve=>setImmediate(resolve));\nfunction fixture(){const events=[],frames=new Map();let next=0;const owner=new MapSpriteLoading((...event)=>events.push(event),callback=>{frames.set(++next,callback);return next},id=>frames.delete(id));let update;const layerView={updating:true,removed:0,watch(name,callback){update=callback;return{remove:()=>layerView.removed++}}},view={whenLayerView:async()=>layerView},layer={loads:0,async load(){this.loads++}};return{owner,events,frames,layerView,view,layer,update:value=>{layerView.updating=value;update(value)},tick(){const work=[...frames.values()];frames.clear();for(const callback of work)callback()}}}\ntest('loading stays active through SDK updates and two settled render frames',async()=>{const f=fixture();f.owner.start('signs',f.view,f.layer);assert.deepEqual(f.events,[['signs','loading']]);await flush();assert.equal(f.frames.size,0);f.update(false);f.tick();assert.equal(f.events.length,1);f.update(true);f.tick();assert.equal(f.events.length,1);f.update(false);f.tick();f.tick();assert.deepEqual(f.events,[['signs','loading'],['signs','idle']]);assert.equal(f.layerView.removed,1)});\ntest('toggle-off cancels observers and pending render work',async()=>{const f=fixture();f.owner.start('objects',f.view,f.layer);await flush();f.update(false);f.owner.clear('objects');assert.equal(f.frames.size,0);assert.equal(f.layerView.removed,1);f.tick();assert.deepEqual(f.events,[['objects','loading'],['objects','idle']])});\ntest('same layer coalesces, replacement retires stale readiness',async()=>{const f=fixture();let resolve;const old={load:()=>new Promise(done=>resolve=done)};f.owner.start('signs',f.view,old);f.owner.start('signs',f.view,f.layer);f.owner.start('signs',f.view,f.layer);await flush();assert.equal(f.layer.loads,1);resolve();await flush();assert.deepEqual(f.events,[['signs','loading']]);f.update(false);f.tick();f.tick();assert.equal(f.events.at(-1)[1],'idle')});\ntest('load errors and independent sources produce accurate status and clean shutdown',async()=>{const f=fixture();f.owner.start('signs',f.view,{load:async()=>{throw Error('Offline')}});f.owner.start('objects',f.view,f.layer);await flush();assert(f.events.some(e=>e[0]==='signs'&&e[1]==='error'));assert(!f.events.some(e=>e[0]==='objects'&&e[1]==='idle'));f.owner.clearAll();assert.equal(f.layerView.removed,1);assert.equal(f.events.at(-1)[1],'idle')});\ntest('coverage status reports icon loading promptly without masking image opening',()=>{const src=fs.readFileSync(path.join(__dirname,'../src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget'),method=widget.members.find(n=>n.name?.getText(sf)==='getCoverageBarPresentation').getText(sf),Runtime=new Function('ZOOM',ts.transpileModule('class Runtime{'+method+'};return Runtime;',{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText)({FEATURES_INTERACTIVE:14}),w=new Runtime();w._owned=text=>text;w._t=text=>text;w.state={trafficSignsActive:true,objectsActive:true,signSpritesStatus:'loading',objectSpritesStatus:'loading'};assert(w.getCoverageBarPresentation().text.includes('traffic sign and object'));assert.equal(w.getCoverageBarPresentation().busy,true);w.state.isLoading=true;assert.equal(w.getCoverageBarPresentation().text,'appOpeningImage');w.state.isLoading=false;w.state.signSpritesStatus='error';w.state.objectSpritesStatus='idle';assert(w.getCoverageBarPresentation().text.includes('could not load'))});\n"
    },
    {
      "file": "tests/controlFeedback.browser.cjs",
      "content": "const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),{chromium}=require('playwright');const compile=file=>ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React,jsxFactory:'jsx'}}).outputText;\n(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});let checks=0;try{for(const width of [375,1280]){const page=await browser.newPage({viewport:{width,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://avatars.githubusercontent.com/**',route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"22\" height=\"22\"><circle cx=\"11\" cy=\"11\" r=\"10\" fill=\"green\"/></svg>'}));await page.setContent('<div id=\"root\" style=\"position:relative;height:600px;width:100%;background:#14251d\"></div>');await page.addScriptTag({path:'/tmp/workspace-alias-deps/react/package/umd/react.development.js'});await page.addScriptTag({path:'/tmp/workspace-alias-deps/react-dom/package/umd/react-dom.development.js'});await page.evaluate(({control,styles})=>{const a={exports:{}};new Function('module','exports',styles)(a,a.exports);const b={exports:{}};new Function('require','module','exports',control)(id=>id==='jimu-core'?{React,jsx:React.createElement}:id.includes('WidgetLocale')?{useWidgetLocale:()=>({t:key=>({uiTrafficSigns:'Traffic signs',uiObjects:'Objects',uiNearbyPlaces:'Nearby places'}[key]||key),owned:text=>text})}:id.includes('controlPanels')?a.exports:new Proxy({},{get:()=>props=>React.createElement('svg',{'aria-hidden':true,width:props.size,height:props.size})}),b,b.exports);window.calls=[];window.props={isFullscreen:false,turboModeActive:true,hideTurboFilter:true,enablePlaces:true,placesAvailable:true,trafficSignsActive:true,objectsActive:true,signSpritesStatus:'loading',objectSpritesStatus:'idle',onToggleTrafficSigns:()=>calls.push('signs'),onToggleObjects:()=>calls.push('objects'),onTogglePlaces:()=>calls.push('places')};window.root=ReactDOM.createRoot(document.getElementById('root'));window.render=patch=>{Object.assign(props,patch);root.render(React.createElement(b.exports.ControlBar,props))};render({});},{control:compile('components/ControlBar.tsx'),styles:compile('styles/controlPanels.ts')});const sign=page.getByRole('button',{name:'Traffic signs',exact:true}),object=page.getByRole('button',{name:'Objects',exact:true});await sign.waitFor();assert.equal(await sign.getAttribute('aria-busy'),'true');assert.equal(await object.getAttribute('aria-busy'),'false');assert.equal(await sign.isEnabled(),true);assert.equal(await sign.locator('.mly-rail-loading').count(),1);assert((await sign.getAttribute('title')).includes('Loading'));await sign.click();assert.deepEqual(await page.evaluate(()=>calls),['signs']);checks++;\nconst image=page.getByRole('button',{name:'Nearby places',exact:true}).locator('img');await image.waitFor();assert.equal(await image.getAttribute('src'),'https://avatars.githubusercontent.com/u/120673461?s=280&v=4');assert.equal((await image.boundingBox()).width,22);checks++;\nawait page.evaluate(()=>render({signSpritesStatus:'idle',objectSpritesStatus:'loading'}));await page.waitForFunction(()=>document.querySelector('button[aria-label=\"Objects\"]').getAttribute('aria-busy')==='true');assert.equal(await sign.locator('.mly-rail-loading').count(),0);assert.equal(await object.locator('.mly-rail-loading').count(),1);checks++;\nawait page.evaluate(()=>render({objectsActive:false,objectSpritesStatus:'loading'}));await page.waitForFunction(()=>document.querySelector('button[aria-label=\"Objects\"]').getAttribute('aria-busy')==='false');assert.equal(await object.locator('.mly-rail-loading').count(),0);await page.evaluate(()=>render({trafficSignsActive:true,signSpritesStatus:'error'}));await page.waitForFunction(()=>document.querySelector('button[aria-label=\"Traffic signs\"]').title.includes('could not'));assert.equal(await sign.locator('.mly-rail-check').textContent(),'!');checks++;\nawait image.dispatchEvent('error');await page.waitForFunction(()=>!document.querySelector('button[aria-label=\"Nearby places\"] img'));assert.equal(await page.getByRole('button',{name:'Nearby places',exact:true}).locator('svg').count(),1);assert.deepEqual(errors,[]);await page.evaluate(()=>root.unmount());checks++;await page.close()}console.log(checks+' control feedback Chromium checks passed at375/1280px: Overture icon/fallback, busy/error states, independent layers and cancellable toggles.');}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'control-feedback-';

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
      if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (partially edited patch)');
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


function transformEntry(text, entry) {
  const results = new Set();
  for (const variant of entry.variants) {
    try {
      let next = text;
      for (const block of variant.blocks) next = transformBlock(next, block, false);
      if (entry.content !== undefined && next !== normalize(entry.content)) continue;
      if (entry.required && !entry.required.every(fragment => next.includes(fragment))) continue;
      results.add(next);
    } catch (error) {
      if (!error.message.startsWith('Conflict in ')) throw error;
    }
  }
  if (results.size !== 1) conflict(entry.file + (results.size ? ' (ambiguous baseline)' : ' (unsupported or edited source)'));
  return [...results][0];
}

function uninstallWrites() {
  const backupRoot = targetFor('.refactor-backups');
  if (!fs.existsSync(backupRoot)) throw new Error('No completed collaboration workspaces upgrade installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'control-feedback' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null && change.resultSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after collaboration workspaces upgrade installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      if (change.resultSha256 === null) {
        if (current.bytes === null) writes.push({ ...current, relative: change.file, original: null, content: original });
        else if (digest(current.bytes) !== change.originalSha256) conflict(change.file + ' (replacement at removed component path)');
        continue;
      }
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after collaboration workspaces upgrade installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed collaboration workspaces upgrade installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-control-feedback.cjs [--dry-run] [--uninstall]');
  readTarget('src/runtime/widget.tsx', true);
  let writes;
  if (uninstall) writes = uninstallWrites();
  else {
    const seen = new Set(); writes = [];
    for (const entry of payload.entries) {
      if (seen.has(entry.file)) throw new Error('Duplicate patch path: ' + entry.file);
      seen.add(entry.file);
      if (entry.removeIfContent !== undefined) {
        const current = readTarget(entry.file);
        if (current.bytes === null) continue;
        if (normalize(current.bytes.toString('utf8')) !== normalize(entry.removeIfContent)) conflict(entry.file + ' (edited retired component)');
        writes.push({ ...current, relative: entry.file, original: current.bytes, content: null });
        continue;
      }
      const current = readTarget(entry.file, entry.content === undefined);
      if (entry.content !== undefined) {
        if (current.bytes === null) {
          writes.push({ ...current, relative: entry.file, original: null, content: Buffer.from(entry.content) });
        } else {
          const text = normalize(current.bytes.toString('utf8'));
          if (text !== normalize(entry.content)) {
            if (!entry.variants) conflict(entry.file + ' (existing helper/test differs)');
            const next = transformEntry(text, entry);
            if (next !== normalize(entry.content)) conflict(entry.file + ' (unexpected helper result)');
            writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(next, current.bytes) });
          }
        }
        continue;
      }
      const text = normalize(current.bytes.toString('utf8')), next = transformEntry(text, entry);
      if (next !== text) writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(next, current.bytes) });
    }
  }
  if (!writes.length) {
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Control feedback confirmation is already installed. No files changed.');
    process.exit(0);
  }
  for (const item of writes) assertUnchanged(item);
  if (dry) {
    console.log('Dry run passed. Would ' + (uninstall ? 'restore' : 'update') + ':\n' + writes.map(item => '  ' + item.relative).join('\n'));
    process.exit(0);
  }
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
  const manifest = { installer: 'control-feedback', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
  const manifestPath = targetFor(backupRelative + '/changes.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
  for (const item of writes) assertUnchanged(item);
  try {
    for (const item of writes) {
      assertUnchanged(item);
      if (item.content === null) {
        targetFor(item.relative); fs.unlinkSync(item.file); item.started = true;
      } else if (item.original === null) {
        ensureParents(item.relative);
        const descriptor = fs.openSync(targetFor(item.relative), 'wx');
        const stat = fs.fstatSync(descriptor);
        item.createdDev = stat.dev; item.createdIno = stat.ino; item.started = true;
        try { fs.writeFileSync(descriptor, item.content); } finally { fs.closeSync(descriptor); }
      } else overwriteOriginal(item, item.content);
    }
    manifest.completed = true;
    // Write completion through the existing guarded regular file, not a followed link.
    const metadata = readTarget(backupRelative + '/changes.json', true);
    overwriteOriginal({ ...metadata, relative: backupRelative + '/changes.json', original: metadata.bytes }, Buffer.from(JSON.stringify(manifest, null, 2) + '\n'));
  } catch (error) {
    const errors = rollback(writes);
    if (errors.length) throw new Error(error.message + '\nRollback needs attention. Backup: ' + backupRelative + '\n' + errors.join('\n'));
    throw new Error(error.message + '\nInstaller writes rolled back. Original files restored. Backup: ' + backupRelative);
  }
  console.log('Control feedback confirmation ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
