/** @jsx jsx */
/** @jsxFrag React.Fragment */
import { React, jsx } from "jimu-core";
import type { InfoBoxProps } from "./types";
import { NoteToolsSection } from '../features/field-notes/NoteToolsSection';
import { NearbyToolsSection } from '../features/imagery/NearbyToolsSection';
import { QualityToolsSection } from '../features/coverage/QualityToolsSection';
import { CoverageAnalysisTrigger } from '../features/coverage/CoverageAnalysisTrigger';
import { CoverageAnalysisResults } from '../features/coverage/CoverageAnalysisResults';
import { RouteControls, RoutePointControls } from '../features/routing/RouteControls';
import { PointCloudAdaptiveControl, PointCloudStatus } from '../features/point-cloud/PointCloudStatusSection';
import { PointCloudCorridorControls } from '../features/point-cloud/PointCloudCorridorControls';
import { PointCloudExportControls } from '../features/point-cloud/PointCloudExportControls';
import { SolarToolsSection } from '../features/solar/SolarToolsSection';
import { ElevationToolsSection } from '../features/elevation/ElevationToolsSection';
import { DetectionToolsSection } from '../features/detections/DetectionToolsSection';
import { CoverageYearLegend } from '../features/coverage/CoverageYearLegend';
import { PointCloudMeasureTools, PointCloudLassoTools, PointCloudSightTools, PointCloudViewshedTools } from '../features/point-cloud/PointCloudToolSections';
import { PointCloudCalibrationControls } from '../features/point-cloud/PointCloudCalibrationControls';
import { PointCloudElevationLegend } from '../features/point-cloud/PointCloudElevationLegend';
import { StatusSummary } from './info-box/StatusSummary';
import { ScrollDiscoveryFooter } from './info-box/ScrollDiscoveryFooter';
import { miniJoyStyle } from "../utils/styles";

/** Extra-time presets are owned by features/routing/RouteControls.tsx. */

interface InfoBoxState {
  isOverflowing: boolean;
  canScrollDown: boolean;
  canScrollUp: boolean;
  sliderDragValue: number | null;
  pointCloudExportFormat?: "csv" | "ply" | "las";
  sliderDragWidthValue: number | null;
}
/**
 * InfoBox
 * Right-hand side panel stack containing:
 *  - Status / coordinates / address card
 *  - Turbo year-legend with click-to-filter
 *  - Coverage Analysis
 *  - Feature export button (when traffic signs or objects active)
 *  - AI Overlay toggle button
 *  - AI tag show/hide toggle
 *  - Alternate images panel
 */
export class InfoBox extends React.PureComponent<InfoBoxProps, InfoBoxState> {
  private scrollResizeObserver: ResizeObserver | null = null;
  private scrollContainerRef = React.createRef<HTMLDivElement>();

  constructor(props: InfoBoxProps) {
    super(props);
    this.state = {
      isOverflowing: false,
      canScrollDown: false,
      canScrollUp: false,
      sliderDragValue: null,
      sliderDragWidthValue: null,
    };
  }

  componentDidMount() {
    this.checkOverflow();
    window.addEventListener("resize", this.checkOverflow);
    if (typeof ResizeObserver !== "undefined" && this.scrollContainerRef.current) { this.scrollResizeObserver = new ResizeObserver(this.checkOverflow); this.scrollResizeObserver.observe(this.scrollContainerRef.current); }
  }

  componentDidUpdate() {
    this.checkOverflow();
  }

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
      alternateImages,
      onYearLegendClick,
      onDownloadFeatures,
      onToggleDetections,
      onToggleAiTags,
      onCloseAlternates,
      onSelectAlternateImage,
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
        className="mly-info-panel"
        style={{
          position: "absolute",
          top: "2px",
          right: isOverflowing ? "0" : "4px",
          zIndex: 10002,
          maxHeight: "calc(100% - 170px)",
          display: "flex",
          flexDirection: "column",
          pointerEvents: "none",
        }}
      >
        <style>{`
          @container (max-width: 480px) {
            .mly-info-panel { max-height: calc(100% - 124px) !important; }
            .mly-info-footer { margin-top: 1px !important; border-color: rgba(167,213,190,0.1) !important; background: rgba(18,31,27,0.5) !important; box-shadow: none !important; }
            .mly-info-footer button { min-height: 20px !important; padding: 1px 2px !important; font-size: 7.5px !important; }
            .mly-info-more-hint { animation: none !important; }
          }
        `}</style>
        <div
          ref={this.scrollContainerRef}
          onScroll={this.checkOverflow}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            pointerEvents: "auto",
            minHeight: 0,
            flexShrink: 1,
            overflowY: "auto",
            overflowX: "hidden",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.25) transparent",
            paddingRight: isOverflowing ? "4px" : "0px",
          }}
        >
          {/* STATUS CARD */}
          {!hideInfoBox && (
            <div
              className="info-box"
              style={{ boxSizing: "border-box",
                fontSize: "8.5px",
                color: "white",
                background: "rgba(0, 0, 0, 0.35)",
                backdropFilter: "blur(5px)",
                borderRadius: "6px",
                width: "96px",
                textAlign: "left",
                padding: "5px",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255,255,255,0.1)",
                pointerEvents: "auto",
              }}
            >
              <StatusSummary currentImg={currentImg} currentZoom={currentZoom} jimuMapViewZoom={jimuMapViewZoom} address={address} turboCreator={turboCreator} onCopyCoordinates={this.props.onCopyCoordinates} />

              {turboModeActive && !hideCoverageAnalysis && <CoverageAnalysisTrigger currentZoom={currentZoom} jimuMapViewZoom={jimuMapViewZoom} turboPointsAvailable={turboPointsAvailable} coverageAnalysisLoading={coverageAnalysisLoading} coverageResult={coverageResult} onRunCoverageAnalysis={onRunCoverageAnalysis} turboMinZoom={turboMinZoom} />}

              {!hideCoverageAnalysis && <QualityToolsSection qualityViewActive={qualityViewActive} onToggleQualityView={onToggleQualityView} selectedQualityBand={selectedQualityBand} onQualityLegendClick={onQualityLegendClick} />}

              {imageId && <NearbyToolsSection nearbyCount={nearbyCount} nearbyLoading={nearbyLoading} nearbyStripOpen={nearbyStripOpen} onToggleNearbyStrip={onToggleNearbyStrip} />}
              <NoteToolsSection fieldNotesCount={fieldNotesCount} isAnnotationMode={isAnnotationMode} fieldNotesListOpen={fieldNotesListOpen} onToggleAnnotationMode={onToggleAnnotationMode} onToggleFieldNotesList={onToggleFieldNotesList} />

              {/* Turbo year legend */}
              {turboModeActive && turboColorByDate && turboYearLegend && turboYearLegend.length > 0 && (
                <CoverageYearLegend turboYearLegend={turboYearLegend} selectedTurboYear={selectedTurboYear} onYearLegendClick={onYearLegendClick} />
              )}
            </div>
          )}

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
          {this.props.enableElevationProfile === true && sequenceImages && sequenceImages.length > 1 && (
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
    );
  }
}
