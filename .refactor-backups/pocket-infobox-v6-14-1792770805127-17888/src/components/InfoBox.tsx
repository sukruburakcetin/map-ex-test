/** @jsx jsx */
/** @jsxFrag React.Fragment */
import { React, jsx } from 'jimu-core';

import type { InfoBoxProps } from './types';

import { ScrollDiscoveryFooter } from './info-box/ScrollDiscoveryFooter';
import { StatusSummary } from './info-box/StatusSummary';

import { CoverageAnalysisResults } from '../features/coverage/CoverageAnalysisResults';
import { CoverageAnalysisTrigger } from '../features/coverage/CoverageAnalysisTrigger';
import { CoverageYearLegend } from '../features/coverage/CoverageYearLegend';
import { QualityToolsSection } from '../features/coverage/QualityToolsSection';
import { DetectionToolsSection } from '../features/detections/DetectionToolsSection';
import { ElevationToolsSection } from '../features/elevation/ElevationToolsSection';
import { NoteToolsSection } from '../features/field-notes/NoteToolsSection';
import { NearbyToolsSection } from '../features/imagery/NearbyToolsSection';
import { PointCloudCalibrationControls } from '../features/point-cloud/PointCloudCalibrationControls';
import { PointCloudCorridorControls } from '../features/point-cloud/PointCloudCorridorControls';
import { PointCloudElevationLegend } from '../features/point-cloud/PointCloudElevationLegend';
import { PointCloudExportControls } from '../features/point-cloud/PointCloudExportControls';
import { PointCloudAdaptiveControl, PointCloudStatus } from '../features/point-cloud/PointCloudStatusSection';
import { PointCloudMeasureTools, PointCloudLassoTools, PointCloudSightTools, PointCloudViewshedTools } from '../features/point-cloud/PointCloudToolSections';
import { RouteControls, RoutePointControls } from '../features/routing/RouteControls';
import { SolarToolsSection } from '../features/solar/SolarToolsSection';

import { infoPanelShellStyle, infoControlsViewportStyle, infoStatusCardStyle, infoPanelResponsiveCss, infoDetailsCss } from '../styles/infoBox';

import { miniJoyStyle } from '../utils/styles';

/** Extra-time presets are owned by features/routing/RouteControls.tsx. */

interface InfoBoxState {
  detailsOpen: boolean;
  isOverflowing: boolean;
  canScrollDown: boolean;
  canScrollUp: boolean;
  sliderDragValue: number | null;
  pointCloudExportFormat?: "csv" | "ply" | "las";
  sliderDragWidthValue: number | null;
}
/**
 * Compose status and feature controls while owning their scroll viewport.
 * Overflow observation, slider drafts and export-format selection stay here;
 * child sections display supplied state and runtime callbacks own SDK operations.
 */
export class InfoBox extends React.PureComponent<InfoBoxProps, InfoBoxState> {
  private panelToggleRef = React.createRef<HTMLButtonElement>();
  private scrollResizeObserver: ResizeObserver | null = null;
  private scrollContainerRef = React.createRef<HTMLDivElement>();

  constructor(props: InfoBoxProps) {
    super(props);
    this.state = {
      detailsOpen: false,
      isOverflowing: false,
      canScrollDown: false,
      canScrollUp: false,
      sliderDragValue: null,
      sliderDragWidthValue: null,
    };
  }

  /** Observe viewport resizing after its ref is available; use the same callback for scroll and resize. */
  componentDidMount() {
    this.checkOverflow();
    window.addEventListener("resize", this.checkOverflow);
    if (typeof ResizeObserver !== "undefined" && this.scrollContainerRef.current) { this.scrollResizeObserver = new ResizeObserver(this.checkOverflow); this.scrollResizeObserver.observe(this.scrollContainerRef.current); }
  }

  componentDidUpdate() {
    this.checkOverflow();
  }

  /** Release every resize subscription owned by this panel before its viewport is discarded. */
  componentWillUnmount() {
    window.removeEventListener("resize", this.checkOverflow); this.scrollResizeObserver?.disconnect(); this.scrollResizeObserver = null;
  }

  checkOverflow = () => {
    if (this.scrollContainerRef.current) {
      const { scrollHeight, clientHeight, scrollTop } = this.scrollContainerRef.current;

      const isOverflowing = scrollHeight > clientHeight + 1;
      const atBottom = Math.abs(scrollHeight - clientHeight - scrollTop) <= 2;

      const canScrollDown = isOverflowing && !atBottom;
      const canScrollUp = isOverflowing && scrollTop > 2;

      if (this.state.isOverflowing !== isOverflowing || this.state.canScrollDown !== canScrollDown || this.state.canScrollUp !== canScrollUp) {
        this.setState({ isOverflowing, canScrollDown, canScrollUp });
      }
    }
  };

  render() {
    const { isOverflowing } = this.state;
    const {
      hideInfoBox,
      turboCreator,
      turboOrganization,
      turboOrganizationName,
      imageId,
      address,
      currentZoom,
      jimuMapViewZoom,
      sequenceImages,
      turboModeActive,
      turboColorByDate,
      turboYearLegend,
      selectedTurboYear,
      trafficSignsActive,
      objectsActive,
      detectionsActive,
      showAiTags,
      onYearLegendClick,
      onDownloadFeatures,
      onToggleDetections,
      onToggleAiTags,
      coverageAnalysisLoading,
      coverageAnalysisProgress,
      onCancelCoverageAnalysis,
      coverageResult,
      coverageSegmentsVisible,
      onToggleCoverageSegments,
      onRunCoverageAnalysis,
      onDismissCoverageResult,
      turboPointsAvailable,
      turboMinZoom = 16,
      hideCoverageAnalysis,
      pointCloudVisible,
      isMeasureMode,
      measurePoints,
      onToggleMeasureMode,
      onClearMeasurement,
      isLassoMode,
      onToggleLassoMode,
      onClearLasso,
      isSightMode,
      sightObserver,
      sightTargets,
      onToggleSightMode,
      onClearSight,
      isViewshedMode,
      onToggleViewshedMode,
      onClearViewshed,
      showCalibrationPanel,
      nudgeStep,
      onToggleCalibrationPanel,
      onJoystickNudge,
      onResetCalibration,
      onSetNudgeStep,
      pointCloudColorMode,
      onDownloadPointCloud,
      qualityViewActive,
      onToggleQualityView,
      selectedQualityBand,
      onQualityLegendClick,
      nearbyCount,
      nearbyLoading,
      nearbyStripOpen,
      onToggleNearbyStrip,
      fieldNotesCount,
      isAnnotationMode,
      fieldNotesListOpen,
      onToggleAnnotationMode,
      onToggleFieldNotesList,
      isSolarMode,
      onToggleSolarMode,
      routeData,
      isGeneratingRoute,
      onGenerateRoute,
      onDownloadRouteGPX,
      routeStartPoint,
      routeEndPoint,
      routeSpareMinutes,
      routePickMode,
      onSetRoutePickMode,
      onChangeSpareMinutes,
      onResetRoutePoints,
      runtimeRoutingEngine,
      onChangeRuntimeRoutingEngine,
      runtimeTravelMode,
      onChangeRuntimeTravelMode,
      travelModeAvailability,
      routeGenerationProgress,
    } = this.props;

    const currentImg = imageId && sequenceImages.length > 0 ? sequenceImages.find((img) => img.id === imageId) : null;

    return (
      <div
        className={`mly-info-panel${this.state.detailsOpen ? " is-open" : ""}`}
        onKeyDown={event => { if (event.key === "Escape" && this.state.detailsOpen) { event.stopPropagation(); this.setState({ detailsOpen: false }, () => this.panelToggleRef.current?.focus()); } }}
        style={infoPanelShellStyle(isOverflowing)}
      >
        <style>{infoPanelResponsiveCss}{infoDetailsCss}</style>
        <button ref={this.panelToggleRef} type="button" className="mly-info-toggle"
          aria-expanded={this.state.detailsOpen} aria-label={this.state.detailsOpen ? "Close image details and tools" : "Open image details and tools"}
          onClick={() => this.setState(previous => ({ detailsOpen: !previous.detailsOpen }))}>
          <span className="mly-info-location" title={!hideInfoBox && address ? address : "Image tools"}>{!hideInfoBox && address ? address : "Image tools"}</span>
          <span aria-hidden="true">{this.state.detailsOpen ? "×" : "⌃"}</span>
        </button>
        <div className="mly-info-body" hidden={!this.state.detailsOpen}>
        <div
          ref={this.scrollContainerRef}
          className="mly-info-scroll"
          onScroll={this.checkOverflow}
          style={infoControlsViewportStyle(isOverflowing)}
        >
          {/* STATUS CARD */}
          {!hideInfoBox && (
            <div
              className="info-box"
              style={infoStatusCardStyle}
            >
              <StatusSummary currentImg={currentImg} currentZoom={currentZoom} jimuMapViewZoom={jimuMapViewZoom} address={null} turboCreator={turboCreator} turboOrganization={turboOrganization} turboOrganizationName={turboOrganizationName} onCopyCoordinates={this.props.onCopyCoordinates} />



              {!hideCoverageAnalysis && <QualityToolsSection qualityViewType={this.props.qualityViewType} currentZoom={currentZoom} jimuMapViewZoom={jimuMapViewZoom} qualityViewActive={qualityViewActive} onToggleQualityView={onToggleQualityView} selectedQualityBand={selectedQualityBand} onQualityLegendClick={onQualityLegendClick} />}

              {imageId && <NearbyToolsSection nearbyCount={nearbyCount} nearbyLoading={nearbyLoading} nearbyStripOpen={nearbyStripOpen} onToggleNearbyStrip={onToggleNearbyStrip} />}
              <NoteToolsSection fieldNotesCount={fieldNotesCount} isAnnotationMode={isAnnotationMode} fieldNotesListOpen={fieldNotesListOpen} onToggleAnnotationMode={onToggleAnnotationMode} onToggleFieldNotesList={onToggleFieldNotesList} />

              {/* Turbo year legend */}
              {turboModeActive && turboColorByDate && turboYearLegend && turboYearLegend.length > 0 && (
                <CoverageYearLegend turboYearLegend={turboYearLegend} selectedTurboYear={selectedTurboYear} onYearLegendClick={onYearLegendClick} />
              )}
            </div>
          )}

          <details className="mly-info-more"><summary>More controls</summary>
              {!hideInfoBox && turboModeActive && !hideCoverageAnalysis && <CoverageAnalysisTrigger currentZoom={currentZoom} jimuMapViewZoom={jimuMapViewZoom} turboPointsAvailable={turboPointsAvailable} coverageAnalysisLoading={coverageAnalysisLoading} coverageResult={coverageResult} onRunCoverageAnalysis={onRunCoverageAnalysis} turboMinZoom={turboMinZoom} />}

          {/* 3D TAPE MEASURE */}
          {pointCloudVisible && (
            <PointCloudMeasureTools isMeasureMode={isMeasureMode} measurePoints={measurePoints} onToggleMeasureMode={onToggleMeasureMode} onClearMeasurement={onClearMeasurement} />
          )}

          {/* 3D LASSO SELECTION */}
          {/* This panel allows users to draw a 2D shape over the panoramic image to select 3D points */}
          {pointCloudVisible && (
            <PointCloudLassoTools isLassoMode={isLassoMode} onToggleLassoMode={onToggleLassoMode} onClearLasso={onClearLasso} />
          )}

          {/* 3D LINE OF SIGHT */}
          {pointCloudVisible && (
            <PointCloudSightTools isSightMode={isSightMode} sightObserver={sightObserver} sightTargets={sightTargets} onToggleSightMode={onToggleSightMode} onClearSight={onClearSight} />
          )}

          {/* 3D VIEWSHED ANALYSIS */}
          {pointCloudVisible && (
            <PointCloudViewshedTools isViewshedMode={isViewshedMode} onToggleViewshedMode={onToggleViewshedMode} onClearViewshed={onClearViewshed} />
          )}

          {/* POINT CLOUD CALIBRATION MICRO-JOYSTICK */}
          {pointCloudVisible && (
            <PointCloudCalibrationControls
              showCalibrationPanel={showCalibrationPanel}
              nudgeStep={nudgeStep}
              onToggleCalibrationPanel={onToggleCalibrationPanel}
              onJoystickNudge={onJoystickNudge}
              onResetCalibration={onResetCalibration}
              onSetNudgeStep={onSetNudgeStep}
              miniJoyStyle={miniJoyStyle}
            />
          )}

          {/* POINT CLOUD ELEVATION HEATMAP LEGEND */}
          {pointCloudVisible && pointCloudColorMode === "elevation" && (
            <PointCloudElevationLegend />
          )}

          {/* POINT CLOUD LENGTH + WIDTH SLIDERS */}

          {this.props.pointCloudVisible && <PointCloudAdaptiveControl pointCloudAdaptive={this.props.pointCloudAdaptive} onPointCloudAdaptiveChange={this.props.onPointCloudAdaptiveChange} />}

          {this.props.pointCloudSummary && <PointCloudStatus pointCloudSummary={this.props.pointCloudSummary} pointCloudIncomplete={this.props.pointCloudIncomplete} pointCloudPrevious={this.props.pointCloudPrevious} pointCloudLoading={this.props.pointCloudLoading} pointCloudAutoPaused={this.props.pointCloudAutoPaused} onRetryPointCloud={this.props.onRetryPointCloud} />}

          {this.props.pointCloudVisible && <PointCloudCorridorControls
            pointCloudLength={this.props.pointCloudLength}
            pointCloudMaxLength={this.props.pointCloudMaxLength}
            pointCloudActualLength={this.props.pointCloudActualLength}
            onLengthChange={this.props.onLengthChange}
            pointCloudWidth={this.props.pointCloudWidth}
            pointCloudMaxWidth={this.props.pointCloudMaxWidth}
            pointCloudActualWidth={this.props.pointCloudActualWidth}
            onWidthChange={this.props.onWidthChange}
            sliderDragValue={this.state.sliderDragValue}
            sliderDragWidthValue={this.state.sliderDragWidthValue}
            onLengthDragChange={value => this.setState({ sliderDragValue: value })}
            onWidthDragChange={value => this.setState({ sliderDragWidthValue: value })}
          />}

          {/* POINT CLOUD EXPORT */}
          {pointCloudVisible && (
            <PointCloudExportControls
              format={this.state.pointCloudExportFormat || "csv"}
              onFormatChange={format => this.setState({ pointCloudExportFormat: format })}
              pointCloudExportLoading={this.props.pointCloudExportLoading}
              onDownloadPointCloud={onDownloadPointCloud}
            />
          )}

          {/* SOLAR GLARE & SHADOW MODELING */}
          {this.props.enableSolar === true && <SolarToolsSection isSolarMode={isSolarMode} onToggleSolarMode={onToggleSolarMode} />}

          {/* ELEVATION PROFILE WIDGET TOGGLE */}
          {this.props.enableElevationProfile === true && !!imageId && (
            <ElevationToolsSection isElevationProfileActive={this.props.isElevationProfileActive} onToggleElevationProfile={this.props.onToggleElevationProfile} />
          )}

          <DetectionToolsSection
            trafficSignsActive={trafficSignsActive}
            objectsActive={objectsActive}
            imageId={imageId}
            detectionsActive={detectionsActive}
            showAiTags={showAiTags}
            mapFeatureExportLoading={this.props.mapFeatureExportLoading}
            onDownloadFeatures={onDownloadFeatures}
            onToggleDetections={onToggleDetections}
            onToggleAiTags={onToggleAiTags}
          />

          </details>

          {(coverageAnalysisLoading || coverageResult) && (
            <CoverageAnalysisResults coverageAnalysisLoading={coverageAnalysisLoading} coverageAnalysisProgress={coverageAnalysisProgress} onCancelCoverageAnalysis={onCancelCoverageAnalysis} coverageResult={coverageResult} coverageSegmentsVisible={coverageSegmentsVisible} onToggleCoverageSegments={onToggleCoverageSegments} onDismissCoverageResult={onDismissCoverageResult}
              renderRoutingControls={() => (coverageSegmentsVisible && (
                        <RouteControls runtimeRoutingEngine={runtimeRoutingEngine} isGeneratingRoute={isGeneratingRoute} onChangeRuntimeRoutingEngine={onChangeRuntimeRoutingEngine} runtimeTravelMode={runtimeTravelMode} onChangeRuntimeTravelMode={onChangeRuntimeTravelMode} travelModeAvailability={travelModeAvailability} routeData={routeData} routePickMode={routePickMode} onSetRoutePickMode={onSetRoutePickMode} routeStartPoint={routeStartPoint} routeEndPoint={routeEndPoint} onResetRoutePoints={onResetRoutePoints} routeSpareMinutes={routeSpareMinutes} onChangeSpareMinutes={onChangeSpareMinutes} onGenerateRoute={onGenerateRoute} routeGenerationProgress={routeGenerationProgress} onDownloadRouteGPX={onDownloadRouteGPX} />
                      ))} />
          )}

          {/* PERSISTENT ROUTE POINT CONTROLS
                        ------------------------------------------------------------
                        A/B coordinates can survive a 2D ↔ 3D map switch even though
                        the old coverage analysis is intentionally discarded.

                        This gives the user a way to remove those preserved points
                        without having to run Street Coverage Analysis again.
                    */}
          {!coverageResult && !coverageAnalysisLoading && !routeData && (routeStartPoint || routeEndPoint) && (
            <RoutePointControls routeStartPoint={routeStartPoint} routeEndPoint={routeEndPoint} onResetRoutePoints={onResetRoutePoints} />
          )}
        </div>

        {(this.state.canScrollDown || this.state.canScrollUp) && <ScrollDiscoveryFooter canScrollDown={this.state.canScrollDown} canScrollUp={this.state.canScrollUp} isOverflowing={isOverflowing} scrollContainerRef={this.scrollContainerRef} />}
        </div>

      </div>
    );
  }
}
