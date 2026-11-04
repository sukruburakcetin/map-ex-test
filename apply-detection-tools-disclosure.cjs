#!/usr/bin/env node
'use strict';
/**
 * Detection tools disclosure confirmation. Compatible current v6 sources.
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
      "file": "src/runtime/widget.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Detection tools disclosure 1",
              "before": "  private _objectDetailsRequest = 0;\n  private _objectDetailsCache = new TurboMetadataCache<any>(16);\n  private _alternateNavigationRequest = 0;\n  private _alternateNavigationAbort: AbortController | null = null;\n\n  private _mapFeatureTiles = new TurboTileCache(4 * 1024 * 1024);\n  private _mapFeatureIndexes = new TurboIndexCache(8 * 1024 * 1024);\n  private _selectedMapFeature: any = null;\n  private _selectedMapFeatureKind: \"signs\" | \"objects\" | null = null;\n  private selectedMapFeatureEnabled(): boolean {\n    return this._selectedMapFeatureKind==='signs'?!!this.state.trafficSignsActive:this._selectedMapFeatureKind==='objects'?!!this.state.objectsActive:false;\n  }\n  private clearSelectedMapFeature(kind?:\"signs\"|\"objects\"):void {\n    if(kind&&this._selectedMapFeatureKind!==kind)return;\n    this._objectDetailsAbort?.abort();++this._objectDetailsRequest;\n    this._alternateNavigationAbort?.abort();++this._alternateNavigationRequest;\n",
              "after": "  private _objectDetailsRequest = 0;\n  private _objectDetailsCache = new TurboMetadataCache<any>(16);\n  private _alternateNavigationRequest = 0;\n  private _alternateNavigationAbort: AbortController | null = null;\n\n  private _mapFeatureTiles = new TurboTileCache(4 * 1024 * 1024);\n  private _mapFeatureIndexes = new TurboIndexCache(8 * 1024 * 1024);\n  private _selectedMapFeature: any = null;\n  private _detectionToolsRequest=0;\n  private revealDetectionTools=()=>{++this._detectionToolsRequest;this.forceUpdate();};\n  private _selectedMapFeatureKind: \"signs\" | \"objects\" | null = null;\n  private selectedMapFeatureEnabled(): boolean {\n    return this._selectedMapFeatureKind==='signs'?!!this.state.trafficSignsActive:this._selectedMapFeatureKind==='objects'?!!this.state.objectsActive:false;\n  }\n  private clearSelectedMapFeature(kind?:\"signs\"|\"objects\"):void {\n    if(kind&&this._selectedMapFeatureKind!==kind)return;\n    this._objectDetailsAbort?.abort();++this._objectDetailsRequest;\n    this._alternateNavigationAbort?.abort();++this._alternateNavigationRequest;\n"
            },
            {
              "label": "Detection tools disclosure 2",
              "before": "    const request = ++this._objectDetailsRequest;\n    ++this._alternateNavigationRequest;\n    this._pendingDetectionFocus = null;\n    this._alternateNavigationAbort?.abort();\n    const layerId=this._selectedMapFeature?.layer?.id||this._selectedMapFeature?.graphic?.layer?.id;\n    this._selectedMapFeatureKind=[LAYER_IDS.TRAFFIC_SIGNS_VT,LAYER_IDS.TRAFFIC_SIGNS_FL].includes(layerId)?'signs':\n      [LAYER_IDS.OBJECTS_VT,LAYER_IDS.OBJECTS_FL].includes(layerId)?'objects':null;\n    if(!this.selectedMapFeatureEnabled())return;\n    const attrs = this._selectedMapFeature?.graphic?.attributes || {};\n    const metadata = { id: String(featureId), name: attrs.name || attrs.value || \"Selected object\", firstSeen: attrs.first_seen_at, lastSeen: attrs.last_seen_at };\n    const current = () => !controller.signal.aborted && request === this._objectDetailsRequest&&this.selectedMapFeatureEnabled();\n    const cached = this._objectDetailsCache.get(String(featureId));\n    this.setState({ selectedFeatureMetadata: cached?.metadata || metadata, featureMetadataLoading: !cached,\n      featureMetadataError: \"\", alternateImagesError: \"\", isFetchingAlternates: !cached,\n      selectedFeatureLocation: { lat: featureLat, lon: featureLon }, alternateImages: cached?.images || [],\n      nearbyStripOpen: true, imageTrayTab: \"object\", fieldNotesListOpen: false }, () => this.showSelectedObjectPopup());\n",
              "after": "    const request = ++this._objectDetailsRequest;\n    ++this._alternateNavigationRequest;\n    this._pendingDetectionFocus = null;\n    this._alternateNavigationAbort?.abort();\n    const layerId=this._selectedMapFeature?.layer?.id||this._selectedMapFeature?.graphic?.layer?.id;\n    this._selectedMapFeatureKind=[LAYER_IDS.TRAFFIC_SIGNS_VT,LAYER_IDS.TRAFFIC_SIGNS_FL].includes(layerId)?'signs':\n      [LAYER_IDS.OBJECTS_VT,LAYER_IDS.OBJECTS_FL].includes(layerId)?'objects':null;\n    if(!this.selectedMapFeatureEnabled())return;\n    this.revealDetectionTools();\n    const attrs = this._selectedMapFeature?.graphic?.attributes || {};\n    const metadata = { id: String(featureId), name: attrs.name || attrs.value || \"Selected object\", firstSeen: attrs.first_seen_at, lastSeen: attrs.last_seen_at };\n    const current = () => !controller.signal.aborted && request === this._objectDetailsRequest&&this.selectedMapFeatureEnabled();\n    const cached = this._objectDetailsCache.get(String(featureId));\n    this.setState({ selectedFeatureMetadata: cached?.metadata || metadata, featureMetadataLoading: !cached,\n      featureMetadataError: \"\", alternateImagesError: \"\", isFetchingAlternates: !cached,\n      selectedFeatureLocation: { lat: featureLat, lon: featureLon }, alternateImages: cached?.images || [],\n      nearbyStripOpen: true, imageTrayTab: \"object\", fieldNotesListOpen: false }, () => this.showSelectedObjectPopup());\n"
            },
            {
              "label": "Detection tools disclosure 3",
              "before": "    id: string;\n    detectionId: string;\n    detectionBounds?: { x: number; y: number; width: number; height: number };\n    thumbUrl: string;\n    capturedAt: number;\n    geometry: { type: \"Point\"; coordinates: [number, number] };\n  }) => {\n    if(!this.selectedMapFeatureEnabled())return;\n    this._alternateNavigationAbort?.abort();\n    const navigation = new AbortController();\n    this._alternateNavigationAbort = navigation;\n    const request = ++this._alternateNavigationRequest;\n    this._pendingDetectionFocus = { imageId: String(img.id), detectionId: String(img.detectionId), request };\n    const featureLocation = this.state.selectedFeatureLocation;\n    const current = () => !navigation.signal.aborted && request === this._alternateNavigationRequest&&this.selectedMapFeatureEnabled();\n    try {\n",
              "after": "    id: string;\n    detectionId: string;\n    detectionBounds?: { x: number; y: number; width: number; height: number };\n    thumbUrl: string;\n    capturedAt: number;\n    geometry: { type: \"Point\"; coordinates: [number, number] };\n  }) => {\n    if(!this.selectedMapFeatureEnabled())return;\n    this.revealDetectionTools();\n    this._alternateNavigationAbort?.abort();\n    const navigation = new AbortController();\n    this._alternateNavigationAbort = navigation;\n    const request = ++this._alternateNavigationRequest;\n    this._pendingDetectionFocus = { imageId: String(img.id), detectionId: String(img.detectionId), request };\n    const featureLocation = this.state.selectedFeatureLocation;\n    const current = () => !navigation.signal.aborted && request === this._alternateNavigationRequest&&this.selectedMapFeatureEnabled();\n    try {\n"
            },
            {
              "label": "Detection tools disclosure 4",
              "before": "                alignItems: \"center\",\n                height: \"24px\",\n                flexShrink: 0,\n                fontSize: \"9px\",\n                color: \"rgba(255,255,255,0.45)\",\n              }}\n            >\n              <div role=\"tablist\" aria-label={this._t('appImageSources')} style={{ display: \"flex\", gap: 8 }}>\n                {([\"nearby\", \"object\"] as const).filter(tab=>tab==='nearby'||!!this.state.selectedFeatureMetadata).map(tab => <button key={tab} role=\"tab\" aria-selected={(this.state.imageTrayTab || \"nearby\") === tab} onClick={() => {this.highlightNearbyPin(null);this.setState({ imageTrayTab: tab });}} style={{ background: \"none\", border: 0, color: (this.state.imageTrayTab || \"nearby\") === tab ? \"#8bdbb7\" : \"#bbb\", padding: \"6px\", cursor: \"pointer\" }}>{tab === \"nearby\" ? <OwnedMessage source={\"Nearby ({value0})\"} values={{value0:String((this.state.nearbyImages || []).length)}}/> : <OwnedMessage source={\"Selected object ({value0})\"} values={{value0:String(this.state.alternateImages.length)}}/>}</button>)}\n              </div>\n              <button\n                onClick={() => {this.highlightNearbyPin(null);this.setState({ nearbyStripOpen: false });}}\n                style={{\n                  background: \"none\",\n                  border: \"none\",\n                  color: \"rgba(255,255,255,0.4)\",\n                  cursor: \"pointer\",\n",
              "after": "                alignItems: \"center\",\n                height: \"24px\",\n                flexShrink: 0,\n                fontSize: \"9px\",\n                color: \"rgba(255,255,255,0.45)\",\n              }}\n            >\n              <div role=\"tablist\" aria-label={this._t('appImageSources')} style={{ display: \"flex\", gap: 8 }}>\n                {([\"nearby\", \"object\"] as const).filter(tab=>tab==='nearby'||!!this.state.selectedFeatureMetadata).map(tab => <button key={tab} role=\"tab\" aria-selected={(this.state.imageTrayTab || \"nearby\") === tab} onClick={() => {this.highlightNearbyPin(null);if(tab==='object')this.revealDetectionTools();this.setState({ imageTrayTab: tab });}} style={{ background: \"none\", border: 0, color: (this.state.imageTrayTab || \"nearby\") === tab ? \"#8bdbb7\" : \"#bbb\", padding: \"6px\", cursor: \"pointer\" }}>{tab === \"nearby\" ? <OwnedMessage source={\"Nearby ({value0})\"} values={{value0:String((this.state.nearbyImages || []).length)}}/> : <OwnedMessage source={\"Selected object ({value0})\"} values={{value0:String(this.state.alternateImages.length)}}/>}</button>)}\n              </div>\n              <button\n                onClick={() => {this.highlightNearbyPin(null);this.setState({ nearbyStripOpen: false });}}\n                style={{\n                  background: \"none\",\n                  border: \"none\",\n                  color: \"rgba(255,255,255,0.4)\",\n                  cursor: \"pointer\",\n"
            },
            {
              "label": "Detection tools disclosure 5",
              "before": "          onWorkspaceMapChange={this.updateWorkspaceMapNotes}\n          onWorkspacePickLocation={this.requestWorkspaceNoteLocation}\n          currentImageId={this.state.imageId}\n          onCloseList={() => this.setState({ fieldNotesListOpen: false })}\n        />\n\n        {/* INFO BOX */}\n        {!this.state.isFullscreen && <InfoBox\n          hideInfoBox={this.props.config.hideInfoBox}\n          turboCreator={this.props.config.turboCreator}\n          turboOrganization={this.props.config.turboOrganization || this.state.turboFilterOrganization}\n          turboOrganizationName={this.getOrganizationDisplayName()}\n          imageId={this.state.imageId}\n          address={this.state.address}\n          currentZoom={this.state.currentZoom}\n          jimuMapViewZoom={this.state.jimuMapView?.view?.zoom}\n",
              "after": "          onWorkspaceMapChange={this.updateWorkspaceMapNotes}\n          onWorkspacePickLocation={this.requestWorkspaceNoteLocation}\n          currentImageId={this.state.imageId}\n          onCloseList={() => this.setState({ fieldNotesListOpen: false })}\n        />\n\n        {/* INFO BOX */}\n        {!this.state.isFullscreen && <InfoBox\n          detectionToolsRequest={this._detectionToolsRequest}\n          hideInfoBox={this.props.config.hideInfoBox}\n          turboCreator={this.props.config.turboCreator}\n          turboOrganization={this.props.config.turboOrganization || this.state.turboFilterOrganization}\n          turboOrganizationName={this.getOrganizationDisplayName()}\n          imageId={this.state.imageId}\n          address={this.state.address}\n          currentZoom={this.state.currentZoom}\n          jimuMapViewZoom={this.state.jimuMapView?.view?.zoom}\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/components/InfoBox.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Detection tools disclosure 1",
              "before": " * Compose status and feature controls while owning their scroll viewport.\n * Overflow observation, slider drafts and export-format selection stay here;\n * child sections display supplied state and runtime callbacks own SDK operations.\n */\nexport class InfoBox extends React.PureComponent<InfoBoxProps, InfoBoxState> {\n static contextType = WidgetLocaleContext;\n declare context: React.ContextType<typeof WidgetLocaleContext>;\n\n  private panelToggleRef = React.createRef<HTMLButtonElement>();\n  private scrollResizeObserver: ResizeObserver | null = null;\n  private scrollContainerRef = React.createRef<HTMLDivElement>();\n\n  constructor(props: InfoBoxProps) {\n    super(props);\n    this.state = {\n      detailsOpen: false,\n",
              "after": " * Compose status and feature controls while owning their scroll viewport.\n * Overflow observation, slider drafts and export-format selection stay here;\n * child sections display supplied state and runtime callbacks own SDK operations.\n */\nexport class InfoBox extends React.PureComponent<InfoBoxProps, InfoBoxState> {\n static contextType = WidgetLocaleContext;\n declare context: React.ContextType<typeof WidgetLocaleContext>;\n\n  private toolsDetailsRef=React.createRef<HTMLDetailsElement>();\n  private detectionControlsRef=React.createRef<HTMLDivElement>();\n  private revealDetectionTools=()=>{\n    this.setState({detailsOpen:true},()=>{\n      if(this.toolsDetailsRef.current)this.toolsDetailsRef.current.open=true;\n      this.detectionControlsRef.current?.scrollIntoView({block:'nearest',inline:'nearest'});\n      this.checkOverflow();\n    });\n  };\n  private panelToggleRef = React.createRef<HTMLButtonElement>();\n  private scrollResizeObserver: ResizeObserver | null = null;\n  private scrollContainerRef = React.createRef<HTMLDivElement>();\n\n  constructor(props: InfoBoxProps) {\n    super(props);\n    this.state = {\n      detailsOpen: false,\n"
            },
            {
              "label": "Detection tools disclosure 2",
              "before": "      sliderDragValue: null,\n      sliderDragWidthValue: null,\n    };\n  }\n\n  /** Observe viewport resizing after its ref is available; use the same callback for scroll and resize. */\n  componentDidMount() {\n    this.checkOverflow();\n    window.addEventListener(\"resize\", this.checkOverflow);\n    if (typeof ResizeObserver !== \"undefined\" && this.scrollContainerRef.current) { this.scrollResizeObserver = new ResizeObserver(this.checkOverflow); this.scrollResizeObserver.observe(this.scrollContainerRef.current); }\n  }\n\n  componentDidUpdate() {\n    this.checkOverflow();\n  }\n\n  /** Release every resize subscription owned by this panel before its viewport is discarded. */\n  componentWillUnmount() {\n    window.removeEventListener(\"resize\", this.checkOverflow); this.scrollResizeObserver?.disconnect(); this.scrollResizeObserver = null;\n  }\n\n  checkOverflow = () => {\n",
              "after": "      sliderDragValue: null,\n      sliderDragWidthValue: null,\n    };\n  }\n\n  /** Observe viewport resizing after its ref is available; use the same callback for scroll and resize. */\n  componentDidMount() {\n    this.checkOverflow();\n    if(this.props.detectionToolsRequest)this.revealDetectionTools();\n    window.addEventListener(\"resize\", this.checkOverflow);\n    if (typeof ResizeObserver !== \"undefined\" && this.scrollContainerRef.current) { this.scrollResizeObserver = new ResizeObserver(this.checkOverflow); this.scrollResizeObserver.observe(this.scrollContainerRef.current); }\n  }\n\n  componentDidUpdate(previous:InfoBoxProps) {\n    this.checkOverflow();\n    if(this.props.detectionToolsRequest&&previous.detectionToolsRequest!==this.props.detectionToolsRequest)this.revealDetectionTools();\n  }\n\n  /** Release every resize subscription owned by this panel before its viewport is discarded. */\n  componentWillUnmount() {\n    window.removeEventListener(\"resize\", this.checkOverflow); this.scrollResizeObserver?.disconnect(); this.scrollResizeObserver = null;\n  }\n\n  checkOverflow = () => {\n"
            },
            {
              "label": "Detection tools disclosure 3",
              "before": "\n              {/* Turbo year legend */}\n              {turboModeActive && turboColorByDate && turboYearLegend && turboYearLegend.length > 0 && (\n                <CoverageYearLegend turboYearLegend={turboYearLegend} selectedTurboYear={selectedTurboYear} onYearLegendClick={onYearLegendClick} />\n              )}\n            </div>\n          )}\n\n          <details className=\"mly-info-more\"><summary> {this.context.t('uiToolsDetails')} </summary>\n              {!hideInfoBox && <div className=\"info-box\"><StatusSummary currentImg={currentImg} currentZoom={currentZoom} jimuMapViewZoom={jimuMapViewZoom} address={null} turboCreator={turboCreator} turboOrganization={turboOrganization} turboOrganizationName={turboOrganizationName} onCopyCoordinates={this.props.onCopyCoordinates} />{!hideCoverageAnalysis && <QualityToolsSection hideToggle qualityViewType={this.props.qualityViewType} currentZoom={currentZoom} jimuMapViewZoom={jimuMapViewZoom} qualityViewActive={qualityViewActive} onToggleQualityView={onToggleQualityView} selectedQualityBand={selectedQualityBand} onQualityLegendClick={onQualityLegendClick} />}</div>}\n              {!hideInfoBox && turboModeActive && !hideCoverageAnalysis && <CoverageAnalysisTrigger currentZoom={currentZoom} jimuMapViewZoom={jimuMapViewZoom} turboPointsAvailable={turboPointsAvailable} coverageAnalysisLoading={coverageAnalysisLoading} coverageResult={coverageResult} onRunCoverageAnalysis={onRunCoverageAnalysis} turboMinZoom={turboMinZoom} />}\n\n          {/* 3D TAPE MEASURE */}\n          {pointCloudVisible && (\n            <PointCloudMeasureTools isMeasureMode={isMeasureMode} measurePoints={measurePoints} onToggleMeasureMode={onToggleMeasureMode} onClearMeasurement={onClearMeasurement} />\n          )}\n\n",
              "after": "\n              {/* Turbo year legend */}\n              {turboModeActive && turboColorByDate && turboYearLegend && turboYearLegend.length > 0 && (\n                <CoverageYearLegend turboYearLegend={turboYearLegend} selectedTurboYear={selectedTurboYear} onYearLegendClick={onYearLegendClick} />\n              )}\n            </div>\n          )}\n\n          <details ref={this.toolsDetailsRef} className=\"mly-info-more\"><summary> {this.context.t('uiToolsDetails')} </summary>\n              {!hideInfoBox && <div className=\"info-box\"><StatusSummary currentImg={currentImg} currentZoom={currentZoom} jimuMapViewZoom={jimuMapViewZoom} address={null} turboCreator={turboCreator} turboOrganization={turboOrganization} turboOrganizationName={turboOrganizationName} onCopyCoordinates={this.props.onCopyCoordinates} />{!hideCoverageAnalysis && <QualityToolsSection hideToggle qualityViewType={this.props.qualityViewType} currentZoom={currentZoom} jimuMapViewZoom={jimuMapViewZoom} qualityViewActive={qualityViewActive} onToggleQualityView={onToggleQualityView} selectedQualityBand={selectedQualityBand} onQualityLegendClick={onQualityLegendClick} />}</div>}\n              {!hideInfoBox && turboModeActive && !hideCoverageAnalysis && <CoverageAnalysisTrigger currentZoom={currentZoom} jimuMapViewZoom={jimuMapViewZoom} turboPointsAvailable={turboPointsAvailable} coverageAnalysisLoading={coverageAnalysisLoading} coverageResult={coverageResult} onRunCoverageAnalysis={onRunCoverageAnalysis} turboMinZoom={turboMinZoom} />}\n\n          {/* 3D TAPE MEASURE */}\n          {pointCloudVisible && (\n            <PointCloudMeasureTools isMeasureMode={isMeasureMode} measurePoints={measurePoints} onToggleMeasureMode={onToggleMeasureMode} onClearMeasurement={onClearMeasurement} />\n          )}\n\n"
            },
            {
              "label": "Detection tools disclosure 4",
              "before": "          {/* SOLAR GLARE & SHADOW MODELING */}\n          {this.props.enableSolar === true && <SolarToolsSection isSolarMode={isSolarMode} onToggleSolarMode={onToggleSolarMode} />}\n\n          {/* ELEVATION PROFILE WIDGET TOGGLE */}\n          {this.props.enableElevationProfile === true && !!imageId && (\n            <ElevationToolsSection isElevationProfileActive={this.props.isElevationProfileActive} onToggleElevationProfile={this.props.onToggleElevationProfile} />\n          )}\n\n          <DetectionToolsSection\n            trafficSignsActive={trafficSignsActive}\n            objectsActive={objectsActive}\n            imageId={imageId}\n            detectionsActive={detectionsActive}\n            showAiTags={showAiTags}\n            mapFeatureExportLoading={this.props.mapFeatureExportLoading}\n            onDownloadFeatures={onDownloadFeatures}\n            onToggleDetections={onToggleDetections}\n            onToggleAiTags={onToggleAiTags}\n          />\n\n          </details>\n\n          {(coverageAnalysisLoading || coverageResult) && (\n            <CoverageAnalysisResults coverageAnalysisLoading={coverageAnalysisLoading} coverageAnalysisProgress={coverageAnalysisProgress} onCancelCoverageAnalysis={onCancelCoverageAnalysis} coverageResult={coverageResult} coverageSegmentsVisible={coverageSegmentsVisible} onToggleCoverageSegments={onToggleCoverageSegments} onDismissCoverageResult={onDismissCoverageResult}\n              renderRoutingControls={() => (coverageSegmentsVisible && (\n                        <RouteControls runtimeRoutingEngine={runtimeRoutingEngine} isGeneratingRoute={isGeneratingRoute} onChangeRuntimeRoutingEngine={onChangeRuntimeRoutingEngine} runtimeTravelMode={runtimeTravelMode} onChangeRuntimeTravelMode={onChangeRuntimeTravelMode} travelModeAvailability={travelModeAvailability} routeData={routeData} routePickMode={routePickMode} onSetRoutePickMode={onSetRoutePickMode} routeStartPoint={routeStartPoint} routeEndPoint={routeEndPoint} onResetRoutePoints={onResetRoutePoints} routeSpareMinutes={routeSpareMinutes} onChangeSpareMinutes={onChangeSpareMinutes} onGenerateRoute={onGenerateRoute} routeGenerationProgress={routeGenerationProgress} onDownloadRouteGPX={onDownloadRouteGPX} />\n                      ))} />\n",
              "after": "          {/* SOLAR GLARE & SHADOW MODELING */}\n          {this.props.enableSolar === true && <SolarToolsSection isSolarMode={isSolarMode} onToggleSolarMode={onToggleSolarMode} />}\n\n          {/* ELEVATION PROFILE WIDGET TOGGLE */}\n          {this.props.enableElevationProfile === true && !!imageId && (\n            <ElevationToolsSection isElevationProfileActive={this.props.isElevationProfileActive} onToggleElevationProfile={this.props.onToggleElevationProfile} />\n          )}\n\n          <div ref={this.detectionControlsRef} style={{display:\"grid\",gap:4,minWidth:0}}>\n          <DetectionToolsSection\n            trafficSignsActive={trafficSignsActive}\n            objectsActive={objectsActive}\n            imageId={imageId}\n            detectionsActive={detectionsActive}\n            showAiTags={showAiTags}\n            mapFeatureExportLoading={this.props.mapFeatureExportLoading}\n            onDownloadFeatures={onDownloadFeatures}\n            onToggleDetections={onToggleDetections}\n            onToggleAiTags={onToggleAiTags}\n          />\n          </div>\n\n          </details>\n\n          {(coverageAnalysisLoading || coverageResult) && (\n            <CoverageAnalysisResults coverageAnalysisLoading={coverageAnalysisLoading} coverageAnalysisProgress={coverageAnalysisProgress} onCancelCoverageAnalysis={onCancelCoverageAnalysis} coverageResult={coverageResult} coverageSegmentsVisible={coverageSegmentsVisible} onToggleCoverageSegments={onToggleCoverageSegments} onDismissCoverageResult={onDismissCoverageResult}\n              renderRoutingControls={() => (coverageSegmentsVisible && (\n                        <RouteControls runtimeRoutingEngine={runtimeRoutingEngine} isGeneratingRoute={isGeneratingRoute} onChangeRuntimeRoutingEngine={onChangeRuntimeRoutingEngine} runtimeTravelMode={runtimeTravelMode} onChangeRuntimeTravelMode={onChangeRuntimeTravelMode} travelModeAvailability={travelModeAvailability} routeData={routeData} routePickMode={routePickMode} onSetRoutePickMode={onSetRoutePickMode} routeStartPoint={routeStartPoint} routeEndPoint={routeEndPoint} onResetRoutePoints={onResetRoutePoints} routeSpareMinutes={routeSpareMinutes} onChangeSpareMinutes={onChangeSpareMinutes} onGenerateRoute={onGenerateRoute} routeGenerationProgress={routeGenerationProgress} onDownloadRouteGPX={onDownloadRouteGPX} />\n                      ))} />\n"
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
              "label": "Detection tools disclosure 1",
              "before": "    \"Illegal Encroachment\",\n    \"Other\"\n] as const;\n\nexport const FIELD_NOTE_CATEGORIES = DEFAULT_FIELD_NOTE_CATEGORIES;\n\n// InfoBox props\nexport interface InfoBoxProps {\n  // visibility / config\n  hideInfoBox?: boolean;\n  turboCreator?: string;\n  turboOrganization?: string;\n  turboOrganizationName?: string;\n  // state\n  imageId: string | null;\n  address: string | null;\n",
              "after": "    \"Illegal Encroachment\",\n    \"Other\"\n] as const;\n\nexport const FIELD_NOTE_CATEGORIES = DEFAULT_FIELD_NOTE_CATEGORIES;\n\n// InfoBox props\nexport interface InfoBoxProps {\n  detectionToolsRequest?: number;\n  // visibility / config\n  hideInfoBox?: boolean;\n  turboCreator?: string;\n  turboOrganization?: string;\n  turboOrganizationName?: string;\n  // state\n  imageId: string | null;\n  address: string | null;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/detections/DetectionToolsSection.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Detection tools disclosure 1",
              "before": "/** @jsx jsx */\nimport { useWidgetLocale } from '../../i18n/WidgetLocale';\nimport { React, jsx } from 'jimu-core';\nimport * as Icons from '../../components/Icons';\nimport type { InfoBoxProps } from '../../components/types';\nimport { detectionExportButtonStyle, detectionExportLabelStyle, detectionOverlayButtonStyle, detectionOverlayLabelStyle, detectionLabelsButtonStyle } from '../../styles/detectionControls';\n\nexport type DetectionToolsSectionProps = Pick<InfoBoxProps, 'trafficSignsActive' | 'objectsActive' | 'imageId' | 'detectionsActive' | 'showAiTags' | 'mapFeatureExportLoading' | 'onDownloadFeatures' | 'onToggleDetections' | 'onToggleAiTags'>;\n\n/** Present area export, image outlines and label actions with their existing availability rules.\n * Active signs or objects enable export; image actions also require an image, and labels require outlines.\n * Runtime callbacks own fetching, file generation and viewer updates. This component adds no effects.\n */\nexport const DetectionToolsSection: React.FC<DetectionToolsSectionProps> = ({ trafficSignsActive, objectsActive, imageId, detectionsActive, showAiTags, mapFeatureExportLoading, onDownloadFeatures, onToggleDetections, onToggleAiTags }) => { const { t, locale } = useWidgetLocale(); return (\n<React.Fragment>\n          {/* EXPORT BUTTON */}\n          {(trafficSignsActive || objectsActive) && (\n            <button\n              onClick={onDownloadFeatures}\n              title={t('uiExportActiveSignsAndObjectsWithinTheMap')}\n              disabled={mapFeatureExportLoading}\n              aria-busy={mapFeatureExportLoading}\n              style={detectionExportButtonStyle}\n              onMouseEnter={(e) => (e.currentTarget.style.background = \"rgba(55, 213, 130, 0.95)\")}\n              onMouseLeave={(e) => (e.currentTarget.style.background = detectionsActive ? \"rgba(55, 213, 130, 0.8)\" : \"rgba(55, 213, 130, 0.3)\")}\n            >\n              <Icons.Download size={12} color=\"#ffffff\" />\n              <span style={detectionExportLabelStyle}>{mapFeatureExportLoading ? t('uiExporting') : t('uiExportArea')}</span>\n            </button>\n          )}\n\n          {/* AI OVERLAY BUTTON */}\n          {(trafficSignsActive || objectsActive) && imageId && (\n            <button\n              onClick={onToggleDetections}\n              title={t('uiShowOrHideDetectionOutlines')}\n              aria-label={t('uiDetectionOutlines')}\n              aria-pressed={detectionsActive}\n              style={detectionOverlayButtonStyle(detectionsActive)}\n              onMouseEnter={(e) => (e.currentTarget.style.background = \"rgba(55, 213, 130, 0.95)\")}\n              onMouseLeave={(e) => (e.currentTarget.style.background = detectionsActive ? \"rgba(55, 213, 130, 0.8)\" : \"rgba(55, 213, 130, 0.3)\")}\n            >\n              <Icons.Detection size={11} />\n              <span style={detectionOverlayLabelStyle}> {t('uiAiOverlay')} </span>\n            </button>\n          )}\n\n          {/* AI TAG VISIBILITY TOGGLE */}\n          {detectionsActive && imageId && (trafficSignsActive || objectsActive) && (\n            <button\n              onClick={onToggleAiTags}\n              title={showAiTags ? t('uiHideDetectionLabelsKeepOutlinesVisible') : t('uiShowLabelsForHoveredOrSelectedDetections')}\n              aria-label={t('uiDetectionLabels')}\n              aria-pressed={showAiTags}\n              style={detectionLabelsButtonStyle(showAiTags)}\n            >\n              {showAiTags ? <Icons.LabelsOn size={14} /> : <Icons.LabelsOff size={14} />}\n              <span> {t('uiLabels')} </span>\n            </button>\n          )}\n</React.Fragment>\n); };\n",
              "after": "/** @jsx jsx */\nimport { useWidgetLocale } from '../../i18n/WidgetLocale';\nimport { React, jsx } from 'jimu-core';\nimport * as Icons from '../../components/Icons';\nimport type { InfoBoxProps } from '../../components/types';\nimport { detectionControlsCss, detectionExportButtonStyle, detectionExportLabelStyle, detectionOverlayButtonStyle, detectionOverlayLabelStyle, detectionLabelsButtonStyle } from '../../styles/detectionControls';\n\nexport type DetectionToolsSectionProps = Pick<InfoBoxProps, 'trafficSignsActive' | 'objectsActive' | 'imageId' | 'detectionsActive' | 'showAiTags' | 'mapFeatureExportLoading' | 'onDownloadFeatures' | 'onToggleDetections' | 'onToggleAiTags'>;\n\n/** Present area export, image outlines and label actions with their existing availability rules.\n * Active signs or objects enable export; image actions also require an image, and labels require outlines.\n * Runtime callbacks own fetching, file generation and viewer updates. This component adds no effects.\n */\nexport const DetectionToolsSection: React.FC<DetectionToolsSectionProps> = ({ trafficSignsActive, objectsActive, imageId, detectionsActive, showAiTags, mapFeatureExportLoading, onDownloadFeatures, onToggleDetections, onToggleAiTags }) => { const { t, locale } = useWidgetLocale(); return (\n<React.Fragment>\n          <style>{detectionControlsCss}</style>\n          {/* EXPORT BUTTON */}\n          {(trafficSignsActive || objectsActive) && (\n            <button\n              type=\"button\" className=\"mly-detection-button mly-detection-export\"\n              onClick={onDownloadFeatures}\n              title={t('uiExportActiveSignsAndObjectsWithinTheMap')}\n              disabled={mapFeatureExportLoading}\n              aria-busy={mapFeatureExportLoading}\n              style={detectionExportButtonStyle}\n            >\n              <Icons.Download size={12} color=\"#ffffff\" />\n              <span style={detectionExportLabelStyle}>{mapFeatureExportLoading ? t('uiExporting') : t('uiExportArea')}</span>\n            </button>\n          )}\n\n          {/* AI OVERLAY BUTTON */}\n          {(trafficSignsActive || objectsActive) && imageId && (\n            <button\n              type=\"button\" className=\"mly-detection-button\"\n              onClick={onToggleDetections}\n              title={t('uiShowOrHideDetectionOutlines')}\n              aria-label={t('uiDetectionOutlines')}\n              aria-pressed={detectionsActive}\n              style={detectionOverlayButtonStyle(detectionsActive)}\n            >\n              <Icons.Detection size={11} />\n              <span style={detectionOverlayLabelStyle}> {t('uiAiOverlay')} </span>\n            </button>\n          )}\n\n          {/* AI TAG VISIBILITY TOGGLE */}\n          {detectionsActive && imageId && (trafficSignsActive || objectsActive) && (\n            <button\n              type=\"button\" className=\"mly-detection-button\"\n              onClick={onToggleAiTags}\n              title={showAiTags ? t('uiHideDetectionLabelsKeepOutlinesVisible') : t('uiShowLabelsForHoveredOrSelectedDetections')}\n              aria-label={t('uiDetectionLabels')}\n              aria-pressed={showAiTags}\n              style={detectionLabelsButtonStyle(showAiTags)}\n            >\n              {showAiTags ? <Icons.LabelsOn size={12} /> : <Icons.LabelsOff size={12} />}\n              <span> {t('uiLabels')} </span>\n            </button>\n          )}\n</React.Fragment>\n); };\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/styles/detectionControls.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Detection tools disclosure 1",
              "before": "import type { React } from 'jimu-core';\n/** Detection-control presentation; data export, overlays and labels remain runtime-owned. */\nexport const detectionExportButtonStyle: React.CSSProperties = { boxSizing: \"border-box\",\n    marginTop: \"4px\",\n    background: \"rgba(55, 213, 130, 0.3)\",\n    backdropFilter: \"blur(10px)\",\n    WebkitBackdropFilter: \"blur(10px)\",\n    color: \"#fff\",\n    borderRadius: \"6px\",\n    fontSize: \"9px\",\n    cursor: \"pointer\",\n    width: \"96px\",\n    fontWeight: 600,\n    letterSpacing: \"0.5px\",\n    display: \"flex\",\n    alignItems: \"center\",\n    justifyContent: \"center\",\n    gap: \"6px\",\n    pointerEvents: \"auto\",\n    transition: \"all 0.2s ease-in-out\",\n    boxShadow: \"0 4px 15px rgba(0,0,0,0.2)\",\n};\nexport const detectionExportLabelStyle: React.CSSProperties = { fontWeight: 700 };\nexport function detectionOverlayButtonStyle(detectionsActive: boolean): React.CSSProperties {\n    return { boxSizing: \"border-box\",\n        marginTop: \"4px\",\n        background: detectionsActive ? \"rgba(55, 213, 130, 0.8)\" : \"rgba(55, 213, 130, 0.3)\",\n        color: \"white\",\n        borderRadius: \"6px\",\n        width: \"96px\",\n        cursor: \"pointer\",\n        display: \"flex\",\n        alignItems: \"center\",\n        justifyContent: \"center\",\n        pointerEvents: \"auto\",\n        backdropFilter: \"blur(5px)\",\n        transition: \"background 0.2s\",\n    };\n}\nexport const detectionOverlayLabelStyle: React.CSSProperties = { fontSize: \"8.5px\", marginLeft: \"3px\", fontWeight: 700 };\nexport function detectionLabelsButtonStyle(showAiTags: boolean): React.CSSProperties {\n    return { boxSizing: \"border-box\",\n        background: showAiTags ? \"rgba(55, 213, 130, 0.25)\" : \"rgba(25, 30, 32, 0.65)\",\n        border: \"1px solid rgba(1, 1, 1, 0.7)\",\n        marginTop: \"2px\",\n        color: \"white\",\n        borderRadius: \"6px\",\n        width: \"96px\",\n        cursor: \"pointer\",\n        display: \"flex\",\n        alignItems: \"center\",\n        justifyContent: \"center\",\n        backdropFilter: \"blur(5px)\",\n        pointerEvents: \"auto\",\n        minHeight: \"32px\",\n        gap: \"5px\",\n        fontSize: \"11px\",\n    };\n}\n",
              "after": "import type { React } from 'jimu-core';\n/** Action hover is transient CSS; pressed appearance belongs only to toggle state. */\nconst button:React.CSSProperties={boxSizing:'border-box',marginTop:0,padding:'4px 6px',width:'100%',minHeight:24,\n display:'flex',alignItems:'center',justifyContent:'center',gap:5,fontSize:9,lineHeight:1.3,fontWeight:600,\n color:'#fff',border:'1px solid #648b7366',borderRadius:5,background:'rgba(55,213,130,0.3)',cursor:'pointer',\n transition:'background-color 120ms ease,border-color 120ms ease',pointerEvents:'auto'};\nexport const detectionExportButtonStyle:React.CSSProperties={...button};\nexport const detectionExportLabelStyle:React.CSSProperties={fontWeight:700};\nexport function detectionOverlayButtonStyle(active:boolean):React.CSSProperties{return {...button,background:active?'rgba(55,213,130,0.8)':button.background};}\nexport const detectionOverlayLabelStyle:React.CSSProperties={fontSize:9,fontWeight:700};\nexport function detectionLabelsButtonStyle(active:boolean):React.CSSProperties{return {...button,background:active?'rgba(55,213,130,0.8)':button.background};}\nexport const detectionControlsCss=`\n.mly-detection-button > svg { flex-shrink:0; width:12px; height:12px; }\n.mly-detection-button:focus-visible { outline:2px solid #c5f6d6; outline-offset:1px; }\n.mly-detection-button:disabled { opacity:.55; cursor:wait; }\n@media (hover:hover) and (pointer:fine) {\n .mly-info-panel .mly-detection-button:enabled:hover { background:rgba(55,213,130,.5) !important; }\n .mly-info-panel .mly-detection-button[aria-pressed=\"true\"]:enabled:hover { background:rgba(55,213,130,.9) !important; }\n}\n`;\n"
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
              "label": "Detection tools disclosure 1",
              "before": "/** Mount actual React controls in Chromium: compact width toggles, tool spacing and scrollbar interaction.\n * Set MAPILLARY_TYPESCRIPT, REACT_UMD_PATH and REACT_DOM_UMD_PATH to local test dependencies.\n */\nconst fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),{chromium}=require(process.env.MAPILLARY_PLAYWRIGHT||'playwright');\nconst root=process.env.PANEL_CONTROLS_SOURCE_ROOT||path.resolve(__dirname,'../src');const modules={};\nfunction bundle(rel){if(modules[rel])return;const code=ts.transpileModule(fs.readFileSync(path.join(root,rel),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,jsxFactory:'jsx',jsxFragmentFactory:'React.Fragment'}}).outputText;modules[rel]={code,deps:{}};for(const match of code.matchAll(/require\\([\"']([^\"']+)[\"']\\)/g)){const id=match[1];if(!id.startsWith('.'))continue;const base=path.posix.normalize(path.posix.join(path.posix.dirname(rel),id));const target=['.ts','.tsx',''].map(ext=>base+ext).find(f=>fs.existsSync(path.join(root,f)));if(!target)throw Error(id);modules[rel].deps[id]=target;bundle(target)}}\nbundle('components/InfoBox.tsx');bundle('components/FilterScrollRegion.tsx');\n(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,ignoreDefaultArgs:['--hide-scrollbars'],args:['--no-sandbox']});let checks=0;const trace=message=>{if(process.env.PANEL_TEST_DEBUG)console.log(message)};try{for(const mobile of [false,true]){const context=await browser.newContext({viewport:mobile?{width:375,height:667}:{width:1280,height:900},isMobile:mobile,hasTouch:mobile});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setContent('<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><style>body{margin:0;background:#506257;color:white}.host{position:relative;container-type:inline-size;width:300px;height:400px}#filters{width:300px;margin-top:8px} .mly-info-panel .mly-info-scroll{scrollbar-width:auto!important;scrollbar-gutter:stable}.mly-info-panel .mly-info-scroll::-webkit-scrollbar{display:block!important;width:12px}</style><div class=\"host\" id=\"info\"></div><div id=\"filters\"></div>');await page.addScriptTag({path:process.env.REACT_UMD_PATH||'/tmp/panel-react/package/umd/react.development.js'});await page.addScriptTag({path:process.env.REACT_DOM_UMD_PATH||'/tmp/panel-react-dom/package/umd/react-dom.development.js'});await page.evaluate(({modules})=>{const cache={};function load(name){if(cache[name])return cache[name].exports;const m={exports:{}};cache[name]=m;const def=modules[name];new Function('require','module','exports',def.code)(id=>id==='jimu-core'?{React,jsx:React.createElement}:id==='react'?{...React,default:React}:id==='react-dom'?{...ReactDOM,default:ReactDOM}:load(def.deps[id]),m,m.exports);return m.exports}const {InfoBox}=load('components/InfoBox.tsx'),{FilterScrollRegion}=load('components/FilterScrollRegion.tsx');window.infoRoot=ReactDOM.createRoot(document.getElementById('info'));window.infoRoot.render(React.createElement(InfoBox,{sequenceImages:[],imageId:'A',currentZoom:17,pointCloudVisible:true,measurePoints:[],sightTargets:[],pointCloudLength:0,pointCloudMaxLength:100,pointCloudWidth:0,pointCloudMaxWidth:80,address:'Nashville'}));window.filterRoot=ReactDOM.createRoot(document.getElementById('filters'));window.renderFilters=width=>window.filterRoot.render(React.createElement(FilterScrollRegion,null,React.createElement('div',{style:{width,flex:'0 0 auto',display:'flex',gap:8}},width>100?React.createElement('input',{'aria-label':'Username',style:{width:130,height:24}}):'Small',width>100?React.createElement('span',null,'Filter content'):null)));window.renderFilters(1400);},{modules});\n await page.getByRole('button',{name:'Open image details and tools'}).click();const toggle=page.getByRole('button',{name:'Widen details panel'});assert(await toggle.isVisible(),`Width toggle must be visible on ${mobile?'mobile':'desktop controller'}`);const panel=page.locator('.mly-info-panel');assert.equal((await panel.boundingBox()).width,96);await toggle.click();await page.waitForFunction(()=>document.querySelector('.mly-info-panel').classList.contains('is-wide'));assert.equal((await panel.boundingBox()).width,144);await page.getByRole('button',{name:'Use compact panel width'}).click();await page.locator('.mly-info-more > summary').click();const spacing=await page.locator('.mly-tool-heading').evaluateAll(nodes=>nodes.map(e=>{const svg=e.querySelector('svg').getBoundingClientRect(),text=e.querySelector('.mly-tool-text').getBoundingClientRect();return{text:e.textContent.trim(),gap:text.left-svg.right}}));assert.equal(spacing.length,5);for(const s of spacing)assert(s.gap>=4,JSON.stringify(s));checks+=3;\n trace('spacing done '+mobile);const bar=page.getByRole('scrollbar',{name:'Scroll filters horizontally'});await bar.waitFor({state:'visible'});const scroll=page.locator('.mly-filter-scroll'),thumb=page.locator('.mly-filter-progress > span');const initial=await scroll.evaluate(e=>e.scrollLeft);await page.evaluate(()=>{window.mapPointerDowns=0;document.addEventListener('pointerdown',()=>window.mapPointerDowns++)});const b=await thumb.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+1);await page.mouse.down();await page.mouse.move(b.x+b.width/2+60,b.y-20,{steps:6});await page.mouse.up();assert((await scroll.evaluate(e=>e.scrollLeft))>initial+100,'Dragging thumb outside its hit area must scroll');checks++;assert.equal(await page.evaluate(()=>window.mapPointerDowns),0,'Track dragging must not bubble into map gestures');\n if(mobile){await bar.press('Home');const box=await thumb.boundingBox(),cdp=await context.newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+1,id:1}]});for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+box.width/2+i*10,y:box.y+1,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert((await scroll.evaluate(e=>e.scrollLeft))>100,'Touch dragging must scroll');await cdp.detach();checks++;}\n\n trace('drag done '+mobile);await bar.focus();await page.keyboard.press('Home');await page.waitForFunction(()=>document.querySelector('.mly-filter-scroll').scrollLeft===0);await page.keyboard.press('ArrowRight');assert((await scroll.evaluate(e=>e.scrollLeft))>=39);await page.keyboard.press('End');await page.waitForFunction(()=>{const e=document.querySelector('.mly-filter-scroll');return Math.abs(e.scrollLeft-(e.scrollWidth-e.clientWidth))<2});await page.keyboard.press('Home');checks++;\n trace('keys done '+mobile);const track=await bar.boundingBox();assert.equal(track.height,8);assert.equal((await thumb.boundingBox()).height,2);await page.mouse.click(track.x+track.width-2,track.y+4);assert((await scroll.evaluate(e=>e.scrollLeft))>500);assert.equal(Number(await bar.getAttribute('aria-valuenow')),Math.round(await scroll.evaluate(e=>e.scrollLeft)));checks++;\n const cancelThumb=await thumb.boundingBox();await page.mouse.move(cancelThumb.x+cancelThumb.width/2,cancelThumb.y+1);await page.mouse.down();await bar.dispatchEvent('pointercancel',{pointerId:1,pointerType:'mouse',isPrimary:true});const canceledAt=await scroll.evaluate(e=>e.scrollLeft);await page.mouse.move(cancelThumb.x+cancelThumb.width/2-30,cancelThumb.y-20);await page.mouse.up();assert.equal(await scroll.evaluate(e=>e.scrollLeft),canceledAt);checks++;\n trace('track done '+mobile);await bar.press('Home');await scroll.hover();await page.mouse.wheel(0,120);await page.waitForFunction(()=>document.querySelector('.mly-filter-scroll').scrollLeft>50);if(!mobile){await page.getByRole('button',{name:'Scroll filters left',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.mly-filter-scroll').scrollLeft<2);await page.getByRole('button',{name:'Scroll filters right',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.mly-filter-scroll').scrollLeft>50);}else{assert.equal(await page.getByRole('button',{name:'Scroll filters left',exact:true}).count(),0)}checks++;\n trace('wheel/arrows done '+mobile);await bar.press('Home');const input=page.getByRole('textbox',{name:'Username'});await input.fill('tester');assert.equal(await input.inputValue(),'tester');await bar.press('End');await page.evaluate(()=>window.renderFilters(100));await page.waitForFunction(()=>document.querySelector('.mly-filter-progress').style.display==='none');assert.equal(await page.getByRole('scrollbar').count(),0);await page.evaluate(()=>window.renderFilters(1400));await bar.waitFor({state:'visible'});await bar.press('End');assert((await scroll.evaluate(e=>e.scrollLeft))>500);checks++;\n trace('resize done '+mobile);const thumbNow=await thumb.boundingBox();await page.mouse.move(thumbNow.x+thumbNow.width/2,thumbNow.y+1);await page.mouse.down();await page.evaluate(()=>{window.filterRoot.unmount();window.infoRoot.unmount()});await page.mouse.up();assert.deepEqual(errors,[]);checks++;await context.close()}console.log(checks+' real React/Chromium checks passed on compact desktop and touch/mobile: icon spacing, width toggle, thumb drag/capture, track click, keyboard, wheel/arrows, form typing, resize and teardown.');}finally{await browser.close()}})().catch(e=>{console.error(e.stack);process.exitCode=1});\n",
              "after": "/** Mount actual React controls in Chromium: compact width toggles, tool spacing and scrollbar interaction.\n * Set MAPILLARY_TYPESCRIPT, REACT_UMD_PATH and REACT_DOM_UMD_PATH to local test dependencies.\n */\nconst fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),{chromium}=require(process.env.MAPILLARY_PLAYWRIGHT||'playwright');\nconst root=process.env.PANEL_CONTROLS_SOURCE_ROOT||path.resolve(__dirname,'../src');const modules={};\nfunction bundle(rel){if(modules[rel])return;const code=ts.transpileModule(fs.readFileSync(path.join(root,rel),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,jsxFactory:'jsx',jsxFragmentFactory:'React.Fragment'}}).outputText;modules[rel]={code,deps:{}};for(const match of code.matchAll(/require\\([\"']([^\"']+)[\"']\\)/g)){const id=match[1];if(!id.startsWith('.'))continue;const base=path.posix.normalize(path.posix.join(path.posix.dirname(rel),id));const target=['.ts','.tsx',''].map(ext=>base+ext).find(f=>fs.existsSync(path.join(root,f)));if(!target)throw Error(id);modules[rel].deps[id]=target;bundle(target)}}\nbundle('components/InfoBox.tsx');bundle('components/FilterScrollRegion.tsx');\n(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,ignoreDefaultArgs:['--hide-scrollbars'],args:['--no-sandbox']});let checks=0;const trace=message=>{if(process.env.PANEL_TEST_DEBUG)console.log(message)};try{for(const mobile of [false,true]){const context=await browser.newContext({viewport:mobile?{width:375,height:667}:{width:1280,height:900},isMobile:mobile,hasTouch:mobile});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setContent('<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><style>body{margin:0;background:#506257;color:white}.host{position:relative;container-type:inline-size;width:300px;height:400px}#filters{width:300px;margin-top:8px} .mly-info-panel .mly-info-scroll{scrollbar-width:auto!important;scrollbar-gutter:stable}.mly-info-panel .mly-info-scroll::-webkit-scrollbar{display:block!important;width:12px}</style><div class=\"host\" id=\"info\"></div><div id=\"filters\"></div>');await page.addScriptTag({path:process.env.REACT_UMD_PATH||'/tmp/panel-react/package/umd/react.development.js'});await page.addScriptTag({path:process.env.REACT_DOM_UMD_PATH||'/tmp/panel-react-dom/package/umd/react-dom.development.js'});await page.evaluate(({modules})=>{const cache={};function load(name){if(cache[name])return cache[name].exports;const m={exports:{}};cache[name]=m;const def=modules[name];new Function('require','module','exports',def.code)(id=>id==='jimu-core'?{React,jsx:React.createElement}:id==='react'?{...React,default:React}:id==='react-dom'?{...ReactDOM,default:ReactDOM}:load(def.deps[id]),m,m.exports);return m.exports}const {InfoBox}=load('components/InfoBox.tsx'),{FilterScrollRegion}=load('components/FilterScrollRegion.tsx');window.infoRoot=ReactDOM.createRoot(document.getElementById('info'));window.infoProps={sequenceImages:[],imageId:'A',currentZoom:17,pointCloudVisible:true,measurePoints:[],sightTargets:[],pointCloudLength:0,pointCloudMaxLength:100,pointCloudWidth:0,pointCloudMaxWidth:80,address:'Nashville'};window.renderInfo=patch=>{Object.assign(window.infoProps,patch);window.infoRoot.render(React.createElement(InfoBox,window.infoProps));};window.renderInfo({});window.filterRoot=ReactDOM.createRoot(document.getElementById('filters'));window.renderFilters=width=>window.filterRoot.render(React.createElement(FilterScrollRegion,null,React.createElement('div',{style:{width,flex:'0 0 auto',display:'flex',gap:8}},width>100?React.createElement('input',{'aria-label':'Username',style:{width:130,height:24}}):'Small',width>100?React.createElement('span',null,'Filter content'):null)));window.renderFilters(1400);},{modules});\n await page.getByRole('button',{name:'Open image details and tools'}).click();const toggle=page.getByRole('button',{name:'Widen details panel'});assert(await toggle.isVisible(),`Width toggle must be visible on ${mobile?'mobile':'desktop controller'}`);const panel=page.locator('.mly-info-panel');assert.equal((await panel.boundingBox()).width,96);await toggle.click();await page.waitForFunction(()=>document.querySelector('.mly-info-panel').classList.contains('is-wide'));assert.equal((await panel.boundingBox()).width,144);await page.getByRole('button',{name:'Use compact panel width'}).click();await page.locator('.mly-info-more > summary').click();const spacing=await page.locator('.mly-tool-heading').evaluateAll(nodes=>nodes.map(e=>{const svg=e.querySelector('svg').getBoundingClientRect(),text=e.querySelector('.mly-tool-text').getBoundingClientRect();return{text:e.textContent.trim(),gap:text.left-svg.right}}));assert.equal(spacing.length,5);for(const s of spacing)assert(s.gap>=4,JSON.stringify(s));checks+=3;\n await page.getByRole('button',{name:'Close image details and tools'}).click();await page.locator('.mly-info-more').evaluate(node=>node.open=false);\n await page.evaluate(()=>window.renderInfo({trafficSignsActive:true,detectionsActive:true,showAiTags:true,detectionToolsRequest:1}));\n await page.getByRole('button',{name:'Detection outlines',exact:true}).waitFor({state:'visible'});\n assert.equal(await page.locator('.mly-info-more').evaluate(node=>node.open),true);checks++;\n const exportButton=page.locator('.mly-detection-export'),overlayButton=page.getByRole('button',{name:'Detection outlines',exact:true}),labelsButton=page.getByRole('button',{name:'Detection labels',exact:true});\n assert.equal(await overlayButton.getAttribute('aria-pressed'),'true');\n const sizes=await page.locator('.mly-detection-button').evaluateAll(nodes=>nodes.map(node=>({height:node.getBoundingClientRect().height,font:getComputedStyle(node).fontSize})));\n assert.equal(sizes.length,3);assert(sizes.every(size=>size.font==='9px'));assert(sizes.every(size=>size.height>=24));assert(sizes[2].height<=sizes[1].height+1);checks++;\n await page.addStyleTag({content:'.mly-detection-button{transition:none!important}'});\n await page.mouse.move(1,1);const resting=await exportButton.evaluate(node=>getComputedStyle(node).backgroundColor);\n if(!mobile){await exportButton.hover();assert.notEqual(await exportButton.evaluate(node=>getComputedStyle(node).backgroundColor),resting);await page.mouse.move(1,1);assert.equal(await exportButton.evaluate(node=>getComputedStyle(node).backgroundColor),resting);checks++;}\n await page.evaluate(()=>window.renderInfo({detectionsActive:false}));await labelsButton.waitFor({state:'detached'});assert.equal(await exportButton.evaluate(node=>getComputedStyle(node).backgroundColor),resting);checks++;\n await page.getByRole('button',{name:'Close image details and tools'}).click();await page.evaluate(()=>window.renderInfo({showAiTags:false}));assert.equal(await page.locator('.mly-info-body').isVisible(),false);await page.evaluate(()=>window.renderInfo({detectionToolsRequest:2}));await overlayButton.waitFor({state:'visible'});assert.equal(await page.locator('.mly-info-more').evaluate(node=>node.open),true);checks++;\n trace('spacing done '+mobile);const bar=page.getByRole('scrollbar',{name:'Scroll filters horizontally'});await bar.waitFor({state:'visible'});const scroll=page.locator('.mly-filter-scroll'),thumb=page.locator('.mly-filter-progress > span');const initial=await scroll.evaluate(e=>e.scrollLeft);await page.evaluate(()=>{window.mapPointerDowns=0;document.addEventListener('pointerdown',()=>window.mapPointerDowns++)});const b=await thumb.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+1);await page.mouse.down();await page.mouse.move(b.x+b.width/2+60,b.y-20,{steps:6});await page.mouse.up();assert((await scroll.evaluate(e=>e.scrollLeft))>initial+100,'Dragging thumb outside its hit area must scroll');checks++;assert.equal(await page.evaluate(()=>window.mapPointerDowns),0,'Track dragging must not bubble into map gestures');\n if(mobile){await bar.press('Home');const box=await thumb.boundingBox(),cdp=await context.newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+1,id:1}]});for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+box.width/2+i*10,y:box.y+1,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert((await scroll.evaluate(e=>e.scrollLeft))>100,'Touch dragging must scroll');await cdp.detach();checks++;}\n\n trace('drag done '+mobile);await bar.focus();await page.keyboard.press('Home');await page.waitForFunction(()=>document.querySelector('.mly-filter-scroll').scrollLeft===0);await page.keyboard.press('ArrowRight');assert((await scroll.evaluate(e=>e.scrollLeft))>=39);await page.keyboard.press('End');await page.waitForFunction(()=>{const e=document.querySelector('.mly-filter-scroll');return Math.abs(e.scrollLeft-(e.scrollWidth-e.clientWidth))<2});await page.keyboard.press('Home');checks++;\n trace('keys done '+mobile);const track=await bar.boundingBox();assert.equal(track.height,6);assert.equal((await thumb.boundingBox()).height,2);await page.mouse.click(track.x+track.width-2,track.y+4);assert((await scroll.evaluate(e=>e.scrollLeft))>500);assert.equal(Number(await bar.getAttribute('aria-valuenow')),Math.round(await scroll.evaluate(e=>e.scrollLeft)));checks++;\n const cancelThumb=await thumb.boundingBox();await page.mouse.move(cancelThumb.x+cancelThumb.width/2,cancelThumb.y+1);await page.mouse.down();await bar.dispatchEvent('pointercancel',{pointerId:1,pointerType:'mouse',isPrimary:true});const canceledAt=await scroll.evaluate(e=>e.scrollLeft);await page.mouse.move(cancelThumb.x+cancelThumb.width/2-30,cancelThumb.y-20);await page.mouse.up();assert.equal(await scroll.evaluate(e=>e.scrollLeft),canceledAt);checks++;\n trace('track done '+mobile);await bar.press('Home');await scroll.hover();await page.mouse.wheel(0,120);await page.waitForFunction(()=>document.querySelector('.mly-filter-scroll').scrollLeft>50);if(!mobile){await page.getByRole('button',{name:'Scroll filters left',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.mly-filter-scroll').scrollLeft<2);await page.getByRole('button',{name:'Scroll filters right',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.mly-filter-scroll').scrollLeft>50);}else{assert.equal(await page.getByRole('button',{name:'Scroll filters left',exact:true}).count(),0)}checks++;\n trace('wheel/arrows done '+mobile);await bar.press('Home');const input=page.getByRole('textbox',{name:'Username'});await input.fill('tester');assert.equal(await input.inputValue(),'tester');await bar.press('End');await page.evaluate(()=>window.renderFilters(100));await page.waitForFunction(()=>document.querySelector('.mly-filter-progress').style.display==='none');assert.equal(await page.getByRole('scrollbar').count(),0);await page.evaluate(()=>window.renderFilters(1400));await bar.waitFor({state:'visible'});await bar.press('End');assert((await scroll.evaluate(e=>e.scrollLeft))>500);checks++;\n trace('resize done '+mobile);const thumbNow=await thumb.boundingBox();await page.mouse.move(thumbNow.x+thumbNow.width/2,thumbNow.y+1);await page.mouse.down();await page.evaluate(()=>{window.filterRoot.unmount();window.infoRoot.unmount()});await page.mouse.up();assert.deepEqual(errors,[]);checks++;await context.close()}console.log(checks+' real React/Chromium checks passed on compact desktop and touch/mobile: icon spacing, width toggle, thumb drag/capture, track click, keyboard, wheel/arrows, form typing, resize and teardown.');}finally{await browser.close()}})().catch(e=>{console.error(e.stack);process.exitCode=1});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/objectNearbyLifecycle.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "Detection tools disclosure 1",
              "before": "const root=path.join(__dirname,'..'),compile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;\nconst moduleFixture={exports:{}};let lastPreview;\nclass Screen {constructor(point,element,clock,callback,appearance){this.appearance=appearance;lastPreview=this;}clear(){this.cleared=true}showMarker(...args){this.marker=args;this.cleared=false}show(...args){this.fan=args}}\nnew Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/imagery/nearbyHighlight.ts','utf8')))(()=>({ScreenDirectionCone:Screen}),moduleFixture,moduleFixture.exports);const {nearbyImagePose,NearbyImageHighlight}=moduleFixture.exports;\nconst image={id:'A',geometry:{type:'Point',coordinates:[0,0]},compass_angle:90};\ntest('Nearby uses capture heading with paired computed position; zero coordinates/heading are valid',()=>{assert.deepEqual(nearbyImagePose(image),{lon:0,lat:0,heading:90});assert.deepEqual(nearbyImagePose({...image,computed_geometry:{coordinates:[1,2]},computed_compass_angle:0}),{lon:1,lat:2,heading:0});assert.deepEqual(nearbyImagePose({...image,computed_geometry:{coordinates:[1,2]}}),{lon:0,lat:0,heading:90});assert.equal(nearbyImagePose({...image,compass_angle:undefined}).heading,null);assert.equal(nearbyImagePose({...image,geometry:{coordinates:[NaN,2]}}),null)});\ntest('preview is bounded and subdued; missing heading never invents a bearing; view retirement clears old preview',()=>{const owner=new NearbyImageHighlight(),view={container:{ownerDocument:{createElement(){}}}},modules={Point:class{constructor(p){Object.assign(this,p)}},Graphic:class{}};owner.update(view,modules,{imageId:'B'},image);assert.equal(lastPreview.fan[3],90);assert.equal(lastPreview.fan[4],4);assert.equal(lastPreview.appearance.markerRadius,5);assert.equal(lastPreview.appearance.opacity,'0.35');owner.clear();assert.equal(lastPreview.cleared,true);owner.update(undefined,null,{imageId:'B'},null);assert.equal(lastPreview.cleared,true);owner.update(view,modules,{imageId:'A'},image);assert.equal(lastPreview.cleared,true)});\nconst source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget'),method=name=>widget.members.find(n=>n.name?.getText(sf)===name).getText(sf);\nconst Harness=new Function('nearbyImagePose','LAYER_IDS','GRAPH_API',compile('class Harness{'+['_nearbySelectionRevision','selectedMapFeatureEnabled','clearSelectedMapFeature','toggleMapillaryTrafficSigns','toggleMapillaryObjects','selectNearbyImage','fetchAlternateImages'].map(method).join('\\n')+'};return Harness;'))(nearbyImagePose,{TRAFFIC_SIGNS_VT:'signs',TRAFFIC_SIGNS_FL:'signs-fl',OBJECTS_VT:'objects',OBJECTS_FL:'objects-fl'},{BASE:'https://fixture.invalid'});\nconst deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve}};\nfunction fixture(){const w=new Harness(),events=[];w.state={trafficSignsActive:true,objectsActive:true,imageTrayTab:'object',nearbyStripOpen:true,selectedFeatureMetadata:{id:'sign'},alternateImages:[{id:'capture'}],jimuMapView:{view:{}}};w._selectedMapFeatureKind='signs';w._objectDetailsRequest=0;w._alternateNavigationRequest=0;w._objectDetailsAbort=new AbortController();w._alternateNavigationAbort=new AbortController();w.setState=(patch,done)=>{Object.assign(w.state,patch);done?.()};w.syncMapFeatureCoverage=()=>{};w.syncDetectionLayerAvailability=()=>{};w.highlightNearbyPin=value=>events.push(['preview',value]);w.forceUpdate=()=>{};w.requestConeRedraw=()=>events.push('redraw');w.log=()=>{};w._selectionRequestId=0;return {w,events}}\ntest('turning off selected source closes object UI, aborts work, and keeps independent Nearby data',async()=>{const {w}=fixture();w.state.nearbyImages=[{id:'nearby'}];await w.toggleMapillaryTrafficSigns();assert.equal(w.state.selectedFeatureMetadata,null);assert.deepEqual(w.state.alternateImages,[]);assert.equal(w.state.nearbyStripOpen,false);assert.equal(w.state.imageTrayTab,'nearby');assert.equal(w._objectDetailsAbort.signal.aborted,true);assert.equal(w._alternateNavigationAbort.signal.aborted,true);assert.equal(w.selectedMapFeatureEnabled(),false);assert.deepEqual(w.state.nearbyImages,[{id:'nearby'}])});\ntest('turning off unrelated source preserves the selected object',async()=>{const {w}=fixture();await w.toggleMapillaryObjects();assert.equal(w.state.selectedFeatureMetadata.id,'sign');assert.equal(w.state.alternateImages.length,1);assert.equal(w._objectDetailsAbort.signal.aborted,false);assert.equal(w.selectedMapFeatureEnabled(),true)});\ntest('Nearby click clears preview first, then applies the displayed capture heading on the confirmed image',async()=>{const {w,events}=fixture(),opened=deferred();w.mapillaryViewer={moveTo:()=>opened.promise,getImage:async()=>({id:'A',compassAngle:0}),setCenter:center=>events.push(['center',center])};const pending=w.selectNearbyImage(image);assert.deepEqual(events[0],['preview',null]);assert.equal(events.some(e=>e[0]==='center'),false);opened.resolve();await pending;assert.deepEqual(events.find(e=>e[0]==='center'),['center',[.75,.5]]);assert.equal(w._lastBearing,90)});\ntest('a superseded Nearby click cannot rotate the replacement image',async()=>{const {w,events}=fixture(),a=deferred(),b=deferred();let id='B';w.mapillaryViewer={moveTo:imageId=>imageId==='A'?a.promise:b.promise,getImage:async()=>({id,compassAngle:0}),setCenter:center=>events.push(['center',center])};const first=w.selectNearbyImage(image),second=w.selectNearbyImage({...image,id:'B',compass_angle:180});b.resolve();await second;a.resolve();await first;assert.equal(events.filter(e=>e[0]==='center').length,1);assert.deepEqual(events.find(e=>e[0]==='center')[1],[0,.5])});\ntest('alternate navigation rejects disabled sources before any request starts',async()=>{const member=method('_handleSelectAlternateImage'),Guarded=new Function(compile('class Guarded{'+method('selectedMapFeatureEnabled')+'\\n'+member+'};return Guarded;'))(),w=new Guarded();w.state={trafficSignsActive:false,objectsActive:false};w._selectedMapFeatureKind='signs';w.fetchMapillaryJson=()=>assert.fail('disabled source issued a request');await w._handleSelectAlternateImage({id:'A'})});\n\n",
              "after": "const root=path.join(__dirname,'..'),compile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;\nconst moduleFixture={exports:{}};let lastPreview;\nclass Screen {constructor(point,element,clock,callback,appearance){this.appearance=appearance;lastPreview=this;}clear(){this.cleared=true}showMarker(...args){this.marker=args;this.cleared=false}show(...args){this.fan=args}}\nnew Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/imagery/nearbyHighlight.ts','utf8')))(()=>({ScreenDirectionCone:Screen}),moduleFixture,moduleFixture.exports);const {nearbyImagePose,NearbyImageHighlight}=moduleFixture.exports;\nconst image={id:'A',geometry:{type:'Point',coordinates:[0,0]},compass_angle:90};\ntest('Nearby uses capture heading with paired computed position; zero coordinates/heading are valid',()=>{assert.deepEqual(nearbyImagePose(image),{lon:0,lat:0,heading:90});assert.deepEqual(nearbyImagePose({...image,computed_geometry:{coordinates:[1,2]},computed_compass_angle:0}),{lon:1,lat:2,heading:0});assert.deepEqual(nearbyImagePose({...image,computed_geometry:{coordinates:[1,2]}}),{lon:0,lat:0,heading:90});assert.equal(nearbyImagePose({...image,compass_angle:undefined}).heading,null);assert.equal(nearbyImagePose({...image,geometry:{coordinates:[NaN,2]}}),null)});\ntest('preview is bounded and subdued; missing heading never invents a bearing; view retirement clears old preview',()=>{const owner=new NearbyImageHighlight(),view={container:{ownerDocument:{createElement(){}}}},modules={Point:class{constructor(p){Object.assign(this,p)}},Graphic:class{}};owner.update(view,modules,{imageId:'B'},image);assert.equal(lastPreview.fan[3],90);assert.equal(lastPreview.fan[4],4);assert.equal(lastPreview.appearance.markerRadius,5);assert.equal(lastPreview.appearance.opacity,'0.35');owner.clear();assert.equal(lastPreview.cleared,true);owner.update(undefined,null,{imageId:'B'},null);assert.equal(lastPreview.cleared,true);owner.update(view,modules,{imageId:'A'},image);assert.equal(lastPreview.cleared,true)});\nconst source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget'),method=name=>widget.members.find(n=>n.name?.getText(sf)===name).getText(sf);\nconst Harness=new Function('nearbyImagePose','LAYER_IDS','GRAPH_API',compile('class Harness{'+['_detectionToolsRequest','revealDetectionTools','_nearbySelectionRevision','selectedMapFeatureEnabled','clearSelectedMapFeature','toggleMapillaryTrafficSigns','toggleMapillaryObjects','selectNearbyImage','fetchAlternateImages'].map(method).join('\\n')+'};return Harness;'))(nearbyImagePose,{TRAFFIC_SIGNS_VT:'signs',TRAFFIC_SIGNS_FL:'signs-fl',OBJECTS_VT:'objects',OBJECTS_FL:'objects-fl'},{BASE:'https://fixture.invalid'});\nconst deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve}};\nfunction fixture(){const w=new Harness(),events=[];w.state={trafficSignsActive:true,objectsActive:true,imageTrayTab:'object',nearbyStripOpen:true,selectedFeatureMetadata:{id:'sign'},alternateImages:[{id:'capture'}],jimuMapView:{view:{}}};w._selectedMapFeatureKind='signs';w._objectDetailsRequest=0;w._alternateNavigationRequest=0;w._objectDetailsAbort=new AbortController();w._alternateNavigationAbort=new AbortController();w.setState=(patch,done)=>{Object.assign(w.state,patch);done?.()};w.syncMapFeatureCoverage=()=>{};w.syncDetectionLayerAvailability=()=>{};w.highlightNearbyPin=value=>events.push(['preview',value]);w.forceUpdate=()=>{};w.requestConeRedraw=()=>events.push('redraw');w.log=()=>{};w._selectionRequestId=0;return {w,events}}\ntest('turning off selected source closes object UI, aborts work, and keeps independent Nearby data',async()=>{const {w}=fixture();w.state.nearbyImages=[{id:'nearby'}];await w.toggleMapillaryTrafficSigns();assert.equal(w.state.selectedFeatureMetadata,null);assert.deepEqual(w.state.alternateImages,[]);assert.equal(w.state.nearbyStripOpen,false);assert.equal(w.state.imageTrayTab,'nearby');assert.equal(w._objectDetailsAbort.signal.aborted,true);assert.equal(w._alternateNavigationAbort.signal.aborted,true);assert.equal(w.selectedMapFeatureEnabled(),false);assert.deepEqual(w.state.nearbyImages,[{id:'nearby'}])});\ntest('turning off unrelated source preserves the selected object',async()=>{const {w}=fixture();await w.toggleMapillaryObjects();assert.equal(w.state.selectedFeatureMetadata.id,'sign');assert.equal(w.state.alternateImages.length,1);assert.equal(w._objectDetailsAbort.signal.aborted,false);assert.equal(w.selectedMapFeatureEnabled(),true)});\ntest('Nearby click clears preview first, then applies the displayed capture heading on the confirmed image',async()=>{const {w,events}=fixture(),opened=deferred();w.mapillaryViewer={moveTo:()=>opened.promise,getImage:async()=>({id:'A',compassAngle:0}),setCenter:center=>events.push(['center',center])};const pending=w.selectNearbyImage(image);assert.deepEqual(events[0],['preview',null]);assert.equal(events.some(e=>e[0]==='center'),false);opened.resolve();await pending;assert.deepEqual(events.find(e=>e[0]==='center'),['center',[.75,.5]]);assert.equal(w._lastBearing,90)});\ntest('a superseded Nearby click cannot rotate the replacement image',async()=>{const {w,events}=fixture(),a=deferred(),b=deferred();let id='B';w.mapillaryViewer={moveTo:imageId=>imageId==='A'?a.promise:b.promise,getImage:async()=>({id,compassAngle:0}),setCenter:center=>events.push(['center',center])};const first=w.selectNearbyImage(image),second=w.selectNearbyImage({...image,id:'B',compass_angle:180});b.resolve();await second;a.resolve();await first;assert.equal(events.filter(e=>e[0]==='center').length,1);assert.deepEqual(events.find(e=>e[0]==='center')[1],[0,.5])});\ntest('alternate navigation rejects disabled sources before any request starts',async()=>{const member=method('_handleSelectAlternateImage'),Guarded=new Function(compile('class Guarded{'+method('selectedMapFeatureEnabled')+'\\n'+member+'};return Guarded;'))(),w=new Guarded();w.state={trafficSignsActive:false,objectsActive:false};w._selectedMapFeatureKind='signs';w.fetchMapillaryJson=()=>assert.fail('disabled source issued a request');await w._handleSelectAlternateImage({id:'A'})});\n\n"
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
const prefix = 'detection-tools-disclosure-';

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
    if (manifest.installer !== 'detection-tools-disclosure' || !manifest.completed || manifest.uninstall) continue;
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
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-detection-tools-disclosure.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Detection tools disclosure confirmation is already installed. No files changed.');
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
  const manifest = { installer: 'detection-tools-disclosure', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Detection tools disclosure confirmation ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
