#!/usr/bin/env node
'use strict';
/**
 * Location-first infobox v6.12. Compatible current v6 sources.
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
      "file": "src/components/InfoBox.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/components/InfoBox.tsx block 1",
              "before": "import { PointCloudMeasureTools, PointCloudLassoTools, PointCloudSightTools, PointCloudViewshedTools } from '../features/point-cloud/PointCloudToolSections';\nimport { RouteControls, RoutePointControls } from '../features/routing/RouteControls';\nimport { SolarToolsSection } from '../features/solar/SolarToolsSection';\n\nimport { infoPanelShellStyle, infoControlsViewportStyle, infoStatusCardStyle, infoPanelResponsiveCss } from '../styles/infoBox';\n\nimport { miniJoyStyle } from '../utils/styles';\n\n/** Extra-time presets are owned by features/routing/RouteControls.tsx. */\n\ninterface InfoBoxState {\n  isOverflowing: boolean;\n  canScrollDown: boolean;\n  canScrollUp: boolean;\n  sliderDragValue: number | null;\n",
              "after": "import { PointCloudMeasureTools, PointCloudLassoTools, PointCloudSightTools, PointCloudViewshedTools } from '../features/point-cloud/PointCloudToolSections';\nimport { RouteControls, RoutePointControls } from '../features/routing/RouteControls';\nimport { SolarToolsSection } from '../features/solar/SolarToolsSection';\n\nimport { infoPanelShellStyle, infoControlsViewportStyle, infoStatusCardStyle, infoPanelResponsiveCss, infoDetailsCss } from '../styles/infoBox';\n\nimport { miniJoyStyle } from '../utils/styles';\n\n/** Extra-time presets are owned by features/routing/RouteControls.tsx. */\n\ninterface InfoBoxState {\n  detailsOpen: boolean;\n  isOverflowing: boolean;\n  canScrollDown: boolean;\n  canScrollUp: boolean;\n  sliderDragValue: number | null;\n"
            },
            {
              "label": "src/components/InfoBox.tsx block 2",
              "before": " * Overflow observation, slider drafts and export-format selection stay here;\n * child sections display supplied state and runtime callbacks own SDK operations.\n */\nexport class InfoBox extends React.PureComponent<InfoBoxProps, InfoBoxState> {\n  private scrollResizeObserver: ResizeObserver | null = null;\n  private scrollContainerRef = React.createRef<HTMLDivElement>();\n\n  constructor(props: InfoBoxProps) {\n    super(props);\n    this.state = {\n      isOverflowing: false,\n      canScrollDown: false,\n      canScrollUp: false,\n      sliderDragValue: null,\n",
              "after": " * Overflow observation, slider drafts and export-format selection stay here;\n * child sections display supplied state and runtime callbacks own SDK operations.\n */\nexport class InfoBox extends React.PureComponent<InfoBoxProps, InfoBoxState> {\n  private panelToggleRef = React.createRef<HTMLButtonElement>();\n  private scrollResizeObserver: ResizeObserver | null = null;\n  private scrollContainerRef = React.createRef<HTMLDivElement>();\n\n  constructor(props: InfoBoxProps) {\n    super(props);\n    this.state = {\n      detailsOpen: false,\n      isOverflowing: false,\n      canScrollDown: false,\n      canScrollUp: false,\n      sliderDragValue: null,\n"
            },
            {
              "label": "src/components/InfoBox.tsx block 3",
              "before": "    const currentImg = imageId && sequenceImages.length > 0 ? sequenceImages.find((img) => img.id === imageId) : null;\n\n    return (\n      <div\n        className=\"mly-info-panel\"\n        style={infoPanelShellStyle(isOverflowing)}\n      >\n        <style>{infoPanelResponsiveCss}</style>\n        <div\n          ref={this.scrollContainerRef}\n          onScroll={this.checkOverflow}\n          style={infoControlsViewportStyle(isOverflowing)}\n        >\n          {/* STATUS CARD */}\n",
              "after": "    const currentImg = imageId && sequenceImages.length > 0 ? sequenceImages.find((img) => img.id === imageId) : null;\n\n    return (\n      <div\n        className={`mly-info-panel${this.state.detailsOpen ? \" is-open\" : \"\"}`}\n        onKeyDown={event => { if (event.key === \"Escape\" && this.state.detailsOpen) { event.stopPropagation(); this.setState({ detailsOpen: false }, () => this.panelToggleRef.current?.focus()); } }}\n        style={infoPanelShellStyle(isOverflowing)}\n      >\n        <style>{infoPanelResponsiveCss}{infoDetailsCss}</style>\n        <button ref={this.panelToggleRef} type=\"button\" className=\"mly-info-toggle\"\n          aria-expanded={this.state.detailsOpen} aria-label={this.state.detailsOpen ? \"Close image details and tools\" : \"Open image details and tools\"}\n          onClick={() => this.setState(previous => ({ detailsOpen: !previous.detailsOpen }))}>\n          <span className=\"mly-info-location\">{!hideInfoBox && address ? address : \"Image tools\"}</span>\n          <span aria-hidden=\"true\">{this.state.detailsOpen ? \"\u00d7\" : \"\u2303\"}</span>\n        </button>\n        <div className=\"mly-info-body\" hidden={!this.state.detailsOpen}>\n        <div\n          ref={this.scrollContainerRef}\n          className=\"mly-info-scroll\"\n          onScroll={this.checkOverflow}\n          style={infoControlsViewportStyle(isOverflowing)}\n        >\n          {/* STATUS CARD */}\n"
            },
            {
              "label": "src/components/InfoBox.tsx block 4",
              "before": "            <div\n              className=\"info-box\"\n              style={infoStatusCardStyle}\n            >\n              <StatusSummary currentImg={currentImg} currentZoom={currentZoom} jimuMapViewZoom={jimuMapViewZoom} address={address} turboCreator={turboCreator} turboOrganization={turboOrganization} turboOrganizationName={turboOrganizationName} onCopyCoordinates={this.props.onCopyCoordinates} />\n\n              {turboModeActive && !hideCoverageAnalysis && <CoverageAnalysisTrigger currentZoom={currentZoom} jimuMapViewZoom={jimuMapViewZoom} turboPointsAvailable={turboPointsAvailable} coverageAnalysisLoading={coverageAnalysisLoading} coverageResult={coverageResult} onRunCoverageAnalysis={onRunCoverageAnalysis} turboMinZoom={turboMinZoom} />}\n\n              {!hideCoverageAnalysis && <QualityToolsSection qualityViewType={this.props.qualityViewType} currentZoom={currentZoom} jimuMapViewZoom={jimuMapViewZoom} qualityViewActive={qualityViewActive} onToggleQualityView={onToggleQualityView} selectedQualityBand={selectedQualityBand} onQualityLegendClick={onQualityLegendClick} />}\n\n              {imageId && <NearbyToolsSection nearbyCount={nearbyCount} nearbyLoading={nearbyLoading} nearbyStripOpen={nearbyStripOpen} onToggleNearbyStrip={onToggleNearbyStrip} />}\n",
              "after": "            <div\n              className=\"info-box\"\n              style={infoStatusCardStyle}\n            >\n              <StatusSummary currentImg={currentImg} currentZoom={currentZoom} jimuMapViewZoom={jimuMapViewZoom} address={null} turboCreator={turboCreator} turboOrganization={turboOrganization} turboOrganizationName={turboOrganizationName} onCopyCoordinates={this.props.onCopyCoordinates} />\n\n\n\n              {!hideCoverageAnalysis && <QualityToolsSection qualityViewType={this.props.qualityViewType} currentZoom={currentZoom} jimuMapViewZoom={jimuMapViewZoom} qualityViewActive={qualityViewActive} onToggleQualityView={onToggleQualityView} selectedQualityBand={selectedQualityBand} onQualityLegendClick={onQualityLegendClick} />}\n\n              {imageId && <NearbyToolsSection nearbyCount={nearbyCount} nearbyLoading={nearbyLoading} nearbyStripOpen={nearbyStripOpen} onToggleNearbyStrip={onToggleNearbyStrip} />}\n"
            },
            {
              "label": "src/components/InfoBox.tsx block 5",
              "before": "                <CoverageYearLegend turboYearLegend={turboYearLegend} selectedTurboYear={selectedTurboYear} onYearLegendClick={onYearLegendClick} />\n              )}\n            </div>\n          )}\n\n          {/* 3D TAPE MEASURE */}\n          {pointCloudVisible && (\n            <PointCloudMeasureTools isMeasureMode={isMeasureMode} measurePoints={measurePoints} onToggleMeasureMode={onToggleMeasureMode} onClearMeasurement={onClearMeasurement} />\n",
              "after": "                <CoverageYearLegend turboYearLegend={turboYearLegend} selectedTurboYear={selectedTurboYear} onYearLegendClick={onYearLegendClick} />\n              )}\n            </div>\n          )}\n\n          <details className=\"mly-info-more\"><summary>More controls</summary>\n              {!hideInfoBox && turboModeActive && !hideCoverageAnalysis && <CoverageAnalysisTrigger currentZoom={currentZoom} jimuMapViewZoom={jimuMapViewZoom} turboPointsAvailable={turboPointsAvailable} coverageAnalysisLoading={coverageAnalysisLoading} coverageResult={coverageResult} onRunCoverageAnalysis={onRunCoverageAnalysis} turboMinZoom={turboMinZoom} />}\n\n          {/* 3D TAPE MEASURE */}\n          {pointCloudVisible && (\n            <PointCloudMeasureTools isMeasureMode={isMeasureMode} measurePoints={measurePoints} onToggleMeasureMode={onToggleMeasureMode} onClearMeasurement={onClearMeasurement} />\n"
            },
            {
              "label": "src/components/InfoBox.tsx block 6",
              "before": "            onToggleDetections={onToggleDetections}\n            onToggleAiTags={onToggleAiTags}\n          />\n\n          {(coverageAnalysisLoading || coverageResult) && (\n            <CoverageAnalysisResults coverageAnalysisLoading={coverageAnalysisLoading} coverageAnalysisProgress={coverageAnalysisProgress} onCancelCoverageAnalysis={onCancelCoverageAnalysis} coverageResult={coverageResult} coverageSegmentsVisible={coverageSegmentsVisible} onToggleCoverageSegments={onToggleCoverageSegments} onDismissCoverageResult={onDismissCoverageResult}\n              renderRoutingControls={() => (coverageSegmentsVisible && (\n                        <RouteControls runtimeRoutingEngine={runtimeRoutingEngine} isGeneratingRoute={isGeneratingRoute} onChangeRuntimeRoutingEngine={onChangeRuntimeRoutingEngine} runtimeTravelMode={runtimeTravelMode} onChangeRuntimeTravelMode={onChangeRuntimeTravelMode} travelModeAvailability={travelModeAvailability} routeData={routeData} routePickMode={routePickMode} onSetRoutePickMode={onSetRoutePickMode} routeStartPoint={routeStartPoint} routeEndPoint={routeEndPoint} onResetRoutePoints={onResetRoutePoints} routeSpareMinutes={routeSpareMinutes} onChangeSpareMinutes={onChangeSpareMinutes} onGenerateRoute={onGenerateRoute} routeGenerationProgress={routeGenerationProgress} onDownloadRouteGPX={onDownloadRouteGPX} />\n",
              "after": "            onToggleDetections={onToggleDetections}\n            onToggleAiTags={onToggleAiTags}\n          />\n\n          </details>\n\n          {(coverageAnalysisLoading || coverageResult) && (\n            <CoverageAnalysisResults coverageAnalysisLoading={coverageAnalysisLoading} coverageAnalysisProgress={coverageAnalysisProgress} onCancelCoverageAnalysis={onCancelCoverageAnalysis} coverageResult={coverageResult} coverageSegmentsVisible={coverageSegmentsVisible} onToggleCoverageSegments={onToggleCoverageSegments} onDismissCoverageResult={onDismissCoverageResult}\n              renderRoutingControls={() => (coverageSegmentsVisible && (\n                        <RouteControls runtimeRoutingEngine={runtimeRoutingEngine} isGeneratingRoute={isGeneratingRoute} onChangeRuntimeRoutingEngine={onChangeRuntimeRoutingEngine} runtimeTravelMode={runtimeTravelMode} onChangeRuntimeTravelMode={onChangeRuntimeTravelMode} travelModeAvailability={travelModeAvailability} routeData={routeData} routePickMode={routePickMode} onSetRoutePickMode={onSetRoutePickMode} routeStartPoint={routeStartPoint} routeEndPoint={routeEndPoint} onResetRoutePoints={onResetRoutePoints} routeSpareMinutes={routeSpareMinutes} onChangeSpareMinutes={onChangeSpareMinutes} onGenerateRoute={onGenerateRoute} routeGenerationProgress={routeGenerationProgress} onDownloadRouteGPX={onDownloadRouteGPX} />\n"
            },
            {
              "label": "src/components/InfoBox.tsx block 7",
              "before": "          )}\n        </div>\n\n        {(this.state.canScrollDown || this.state.canScrollUp) && <ScrollDiscoveryFooter canScrollDown={this.state.canScrollDown} canScrollUp={this.state.canScrollUp} isOverflowing={isOverflowing} scrollContainerRef={this.scrollContainerRef} />}\n\n      </div>\n    );\n  }\n",
              "after": "          )}\n        </div>\n\n        {(this.state.canScrollDown || this.state.canScrollUp) && <ScrollDiscoveryFooter canScrollDown={this.state.canScrollDown} canScrollUp={this.state.canScrollUp} isOverflowing={isOverflowing} scrollContainerRef={this.scrollContainerRef} />}\n        </div>\n\n      </div>\n    );\n  }\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/components/info-box/StatusSummary.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/components/info-box/StatusSummary.tsx block 1",
              "before": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\nimport * as Icons from '../Icons';\nimport type { InfoBoxProps } from '../types';\nimport { infoStatusHeaderStyle, infoStatusTitleStyle, infoStatusSearchStyle, infoStatusZoomStyle, infoStatusAddressStyle, infoStatusGlobeStyle, infoStatusCoordinatesStyle, infoStatusCoordinateRowStyle, infoStatusCoordinateLabelStyle, infoStatusCreatorStyle } from '../../styles/infoBox';\n\nexport type StatusSummaryProps = Pick<InfoBoxProps, 'currentZoom' | 'jimuMapViewZoom' | 'address' | 'turboCreator' | 'turboOrganization' | 'turboOrganizationName' | 'onCopyCoordinates'> & {\n currentImg: InfoBoxProps['sequenceImages'][number] | null | undefined;\n};\n\n/** Show status values with the existing zoom fallback and six-decimal coordinate display.\n * InfoBox selects the current image; coordinate clicks forward original numeric values to\n * the runtime clipboard callback. This component performs no lookup, geocoding or clipboard access.\n */\nexport const StatusSummary: React.FC<StatusSummaryProps> = ({ currentZoom, jimuMapViewZoom, address, turboCreator, turboOrganization, turboOrganizationName, onCopyCoordinates, currentImg }) => (\n<React.Fragment>\n              {/* Header / zoom */}\n              <div\n                style={infoStatusHeaderStyle}\n              >\n                <span style={infoStatusTitleStyle}>STATUS</span>\n                <span>\n                  <Icons.Search size={9} style={infoStatusSearchStyle} />\n                  <span style={infoStatusZoomStyle}>Z: {currentZoom !== undefined ? currentZoom.toFixed(1) : jimuMapViewZoom?.toFixed(1)}</span>\n                </span>\n              </div>\n\n              {/* Address */}\n              {address && (\n                <div style={infoStatusAddressStyle}>\n                  <Icons.Globe size={12} style={infoStatusGlobeStyle} />\n",
              "after": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\nimport * as Icons from '../Icons';\nimport type { InfoBoxProps } from '../types';\nimport { infoStatusAddressStyle, infoStatusGlobeStyle, infoStatusCoordinatesStyle, infoStatusCoordinateRowStyle, infoStatusCoordinateLabelStyle, infoStatusCreatorStyle } from '../../styles/infoBox';\n\nexport type StatusSummaryProps = Pick<InfoBoxProps, 'currentZoom' | 'jimuMapViewZoom' | 'address' | 'turboCreator' | 'turboOrganization' | 'turboOrganizationName' | 'onCopyCoordinates'> & {\n currentImg: InfoBoxProps['sequenceImages'][number] | null | undefined;\n};\n\n/** Location and expandable six-decimal coordinates.\n * InfoBox selects the current image; coordinate clicks forward original numeric values to\n * the runtime clipboard callback. This component performs no lookup, geocoding or clipboard access.\n */\nexport const StatusSummary: React.FC<StatusSummaryProps> = ({ address, turboCreator, turboOrganization, turboOrganizationName, onCopyCoordinates, currentImg }) => (\n<React.Fragment>\n              {/* Address */}\n              {address && (\n                <div style={infoStatusAddressStyle}>\n                  <Icons.Globe size={12} style={infoStatusGlobeStyle} />\n"
            },
            {
              "label": "src/components/info-box/StatusSummary.tsx block 2",
              "before": "              )}\n\n              {/* Coordinates */}\n              {currentImg && (\n                <button type=\"button\" title=\"Copy Latitude, Longitude\" aria-label={`Copy coordinates ${currentImg.lat.toFixed(6)}, ${currentImg.lon.toFixed(6)}`} onClick={() => onCopyCoordinates?.(currentImg.lat, currentImg.lon)} style={infoStatusCoordinatesStyle}>\n                  <span style={infoStatusCoordinateRowStyle}>\n                    <span style={infoStatusCoordinateLabelStyle}>LAT</span>\n                    <span>{currentImg.lat.toFixed(6)}</span>\n",
              "after": "              )}\n\n              {/* Coordinates */}\n              {currentImg && (\n                <details className=\"mly-image-coordinates\"><summary>Coordinates</summary>\n                <button type=\"button\" title=\"Copy Latitude, Longitude\" aria-label={`Copy coordinates ${currentImg.lat.toFixed(6)}, ${currentImg.lon.toFixed(6)}`} onClick={() => onCopyCoordinates?.(currentImg.lat, currentImg.lon)} style={infoStatusCoordinatesStyle}>\n                  <span style={infoStatusCoordinateRowStyle}>\n                    <span style={infoStatusCoordinateLabelStyle}>LAT</span>\n                    <span>{currentImg.lat.toFixed(6)}</span>\n"
            },
            {
              "label": "src/components/info-box/StatusSummary.tsx block 3",
              "before": "                    <span style={infoStatusCoordinateLabelStyle}>LON</span>\n                    <span>{currentImg.lon.toFixed(6)}</span>\n                  </span>\n                </button>\n              )}\n\n              {/* Locked creator tag */}\n              {turboCreator && (\n",
              "after": "                    <span style={infoStatusCoordinateLabelStyle}>LON</span>\n                    <span>{currentImg.lon.toFixed(6)}</span>\n                  </span>\n                </button>\n                </details>\n              )}\n\n              {/* Locked creator tag */}\n              {turboCreator && (\n"
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
              "label": "src/styles/infoBox.ts block 1",
              "before": "            .mly-info-footer button { min-height: 20px !important; padding: 1px 2px !important; font-size: 7.5px !important; }\n            .mly-info-more-hint { animation: none !important; }\n          }\n        `;\n",
              "after": "            .mly-info-footer button { min-height: 20px !important; padding: 1px 2px !important; font-size: 7.5px !important; }\n            .mly-info-more-hint { animation: none !important; }\n          }\n        `;\n\n/** Location-first card, with a non-modal bottom sheet in narrow viewers. */\nexport const infoDetailsCss = `\n.mly-info-panel { font-family: \"Segoe UI\", sans-serif; width: 208px; max-width: calc(100% - 52px); gap: 4px; }\n.mly-info-toggle { pointer-events: auto; width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 10px; min-height: 34px; border: 1px solid #8ab89b55; border-radius: 9px; background: rgba(18,31,27,.8); backdrop-filter: blur(8px); color: #d6f1df; font: inherit; font-size: 12px; cursor: pointer; }\n.mly-info-location { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.mly-info-body { min-height: 0; display: flex; flex-direction: column; pointer-events: auto; border: 1px solid #8ab89b44; border-radius: 9px; background: rgba(18,31,27,.94); padding: 8px; }\n.mly-info-body[hidden] { display: none; }\n.mly-info-panel .mly-info-scroll { align-items: stretch !important; }\n.mly-info-panel .info-box { width: 100% !important; max-width: none !important; padding: 0 !important; background: transparent !important; box-shadow: none !important; border: 0 !important; font-size: 12px !important; }\n.mly-info-panel .info-box button { font-size: 11px !important; min-height: 32px; line-height: 1.35; }\n.mly-info-panel .info-box button > span { font-size: inherit !important; }\n.mly-info-panel .mly-image-coordinates summary, .mly-info-panel .mly-info-more summary { cursor: pointer; padding: 7px 0; font-size: 12px; color: #c7dfd0; }\n.mly-info-panel .mly-info-more button { min-height: 32px; font-size: 11px !important; }\n.mly-info-panel .mly-info-footer { width: 100% !important; }\n.mly-info-panel .mly-info-footer button { min-height: 28px !important; font-size: 10px !important; }\n.mly-info-panel .mly-info-more { border-top: 1px solid #ffffff20; margin-top: 6px; }\n.mly-info-panel button:focus-visible, .mly-info-panel summary:focus-visible { outline: 2px solid #b4f3ca; outline-offset: -2px; }\n@media (max-width: 480px) {\n  .mly-info-panel { width: 180px; }\n  .mly-info-panel.is-open { top: auto !important; bottom: calc(6px + env(safe-area-inset-bottom,0px)); left: 6px; right: 6px !important; width: auto; max-width: none; max-height: min(72%, calc(100% - 12px)) !important; }\n  .mly-info-panel.is-open .mly-info-body { min-height: 0; overflow: hidden; }\n  .mly-info-panel .info-box button { min-height: 40px; font-size: 13px !important; }\n}\n@container (max-width: 480px) {\n  .mly-info-panel { width: 180px; }\n  .mly-info-panel.is-open { top: auto !important; bottom: 6px; left: 6px; right: 6px !important; width: auto; max-width: none; max-height: min(72%, calc(100% - 12px)) !important; }\n  .mly-info-panel.is-open .mly-info-body { min-height: 0; overflow: hidden; }\n  .mly-info-panel .info-box button { min-height: 40px; font-size: 13px !important; }\n}\n`;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/coverage/QualityToolsSection.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/features/coverage/QualityToolsSection.tsx block 1",
              "before": "    <div\n      style={qualityToolsSectionStyle}\n    >\n      <button\n        onClick={onToggleQualityView}\n        title={qualityViewActive ? \"Quality View ON: lines coloured by image quality score\" : \"Quality View OFF: click to colour coverage lines by quality score\"}\n        style={qualityToolsButtonStyle}\n      >\n        <span\n          style={getQualityToolsLabelStyle(qualityViewActive)}\n        >\n          <Icons.Star size={10} color={qualityViewActive ? \"#F5A623\" : \"rgba(255,255,255,0.7)\"} filled={qualityViewActive} />\n          QUALITY\n        </span>\n        <div\n          style={getQualityToolsTrackStyle(qualityViewActive)}\n        >\n",
              "after": "    <div\n      style={qualityToolsSectionStyle}\n    >\n      <button\n        type=\"button\" aria-pressed={!!qualityViewActive}\n        onClick={onToggleQualityView}\n        title={qualityViewActive ? \"Quality View ON: lines coloured by image quality score\" : \"Quality View OFF: click to colour coverage lines by quality score\"}\n        style={qualityToolsButtonStyle}\n      >\n        <span\n          style={getQualityToolsLabelStyle(qualityViewActive)}\n        >\n          <Icons.Star size={10} color={qualityViewActive ? \"#F5A623\" : \"rgba(255,255,255,0.7)\"} filled={qualityViewActive} />\n          Color coverage by quality\n        </span>\n        <div\n          style={getQualityToolsTrackStyle(qualityViewActive)}\n        >\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/imagery/NearbyToolsSection.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/features/imagery/NearbyToolsSection.tsx block 1",
              "before": "    <div\n      style={nearbyToolsSectionStyle}\n    >\n      <button\n        onClick={onToggleNearbyStrip}\n        title=\"Show captures nearby\"\n        style={nearbyToolsButtonStyle}\n      >\n        <span\n          style={getNearbyToolsLabelStyle(nearbyStripOpen)}\n        >\n          <Icons.Camera size={9} />\n          NEARBY\n          {nearbyLoading ? (\n            <span style={nearbyToolsLoadingStyle}>\u2026</span>\n          ) : nearbyCount != null && nearbyCount > 0 ? (\n            <span\n",
              "after": "    <div\n      style={nearbyToolsSectionStyle}\n    >\n      <button\n        type=\"button\" aria-expanded={!!nearbyStripOpen}\n        onClick={onToggleNearbyStrip}\n        title=\"Show captures nearby\"\n        style={nearbyToolsButtonStyle}\n      >\n        <span\n          style={getNearbyToolsLabelStyle(nearbyStripOpen)}\n        >\n          <Icons.Camera size={9} />\n          Nearby images\n          {nearbyLoading ? (\n            <span style={nearbyToolsLoadingStyle}>\u2026</span>\n          ) : nearbyCount != null && nearbyCount > 0 ? (\n            <span\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/field-notes/NoteToolsSection.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/features/field-notes/NoteToolsSection.tsx block 1",
              "before": "                  <span\n                    style={getNoteToolsLabelStyle(isAnnotationMode)}\n                  >\n                    <Icons.Notes size={10} />\n                    ADD NOTE\n                  </span>\n                  <span aria-hidden=\"true\" style={{\n                    fontSize: \"7px\", lineHeight: 1, fontWeight: 700, flexShrink: 0,\n                    padding: \"2px 4px\", borderRadius: \"3px\",\n                    background: isAnnotationMode ? \"#f5a623\" : \"rgba(255,255,255,0.08)\",\n                    color: isAnnotationMode ? \"#142126\" : \"rgba(255,255,255,0.7)\",\n                  }}>{isAnnotationMode ? \"ON\" : \"OFF\"}</span>\n                </button>\n\n                {\n                  <button\n",
              "after": "                  <span\n                    style={getNoteToolsLabelStyle(isAnnotationMode)}\n                  >\n                    <Icons.Notes size={10} />\n                    {isAnnotationMode ? \"Stop adding notes\" : \"Add note\"}\n                  </span>\n\n                </button>\n\n                {\n                  <button\n"
            },
            {
              "label": "src/features/field-notes/NoteToolsSection.tsx block 2",
              "before": "                  >\n                    <span\n                      style={getNoteToolsLabelStyle(fieldNotesListOpen)}\n                    >\n                      NOTES\n                      {(fieldNotesCount ?? 0) > 0 && (\n                        <span style={noteToolsCountStyle}>\n                          {fieldNotesCount}\n                        </span>\n",
              "after": "                  >\n                    <span\n                      style={getNoteToolsLabelStyle(fieldNotesListOpen)}\n                    >\n                      View notes\n                      {(fieldNotesCount ?? 0) > 0 && (\n                        <span style={noteToolsCountStyle}>\n                          {fieldNotesCount}\n                        </span>\n"
            }
          ]
        }
      ]
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'infobox-ux-v6-12-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.12 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'infobox-ux-v6-12' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.12 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.12 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.12 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-infobox-ux-v6-12.cjs [--dry-run] [--uninstall]');
  readTarget('src/runtime/widget.tsx', true);
  let writes;
  if (uninstall) writes = uninstallWrites();
  else {
    const seen = new Set(); writes = [];
    for (const entry of payload.entries) {
      if (seen.has(entry.file)) throw new Error('Duplicate patch path: ' + entry.file);
      seen.add(entry.file);
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Infobox UX v6.12 is already installed. No files changed.');
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
  const manifest = { installer: 'infobox-ux-v6-12', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Infobox UX v6.12 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
