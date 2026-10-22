/** @jsx jsx */
/** @jsxFrag React.Fragment */
import { React, jsx } from "jimu-core";
import * as Icons from "../components/Icons";
import { InfoBoxProps } from "./types";
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
              {/* Header / zoom */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "3px",
                  opacity: 0.8,
                  fontSize: "10px",
                  borderBottom: "1px solid rgba(255,255,255,0.2)",
                  paddingBottom: "4px",
                }}
              >
                <span style={{ fontWeight: 600, fontSize: "8px" }}>STATUS</span>
                <span>
                  <Icons.Search size={9} style={{ marginRight: "2px", marginLeft: "2px" }} />
                  <span style={{ fontSize: "8px" }}>Z: {currentZoom !== undefined ? currentZoom.toFixed(1) : jimuMapViewZoom?.toFixed(1)}</span>
                </span>
              </div>

              {/* Address */}
              {address && (
                <div style={{ marginBottom: "3px", color: "#37d582", fontWeight: 500 }}>
                  <Icons.Globe size={12} style={{ marginRight: "4px" }} />
                  {address}
                </div>
              )}

              {/* Coordinates */}
              {currentImg && (
                <button type="button" title="Copy Latitude, Longitude" aria-label={`Copy coordinates ${currentImg.lat.toFixed(6)}, ${currentImg.lon.toFixed(6)}`} onClick={() => this.props.onCopyCoordinates?.(currentImg.lat, currentImg.lon)} style={{ display: "flex", flexDirection: "column", gap: "2px", width: "100%", opacity: 0.9, padding: "2px 0", background: "transparent", border: "none", borderRadius: 3, color: "inherit", font: "inherit", textAlign: "left", cursor: "copy", userSelect: "text" }}>
                  <span style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ width: "25px", fontSize: "9px", color: "#aaa" }}>LAT</span>
                    <span>{currentImg.lat.toFixed(6)}</span>
                  </span>
                  <span style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ width: "25px", fontSize: "9px", color: "#aaa" }}>LON</span>
                    <span>{currentImg.lon.toFixed(6)}</span>
                  </span>
                </button>
              )}

              {/* Locked creator tag */}
              {turboCreator && (
                <div
                  style={{
                    marginTop: "4px",
                    padding: "1px 3px",
                    background: "rgba(55, 213, 130, 0.2)",
                    border: "1px solid rgba(55, 213, 130, 0.4)",
                    borderRadius: "3px",
                    fontSize: "9px",
                    color: "#37d582",
                    textAlign: "center",
                  }}
                >
                  {turboCreator}
                </div>
              )}

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
            <div
              style={{
                marginTop: "4px",
                background: "rgba(20, 20, 20, 0.6)",
                backdropFilter: "blur(10px)",
                borderRadius: "6px",
                padding: "5px",
                width: "96px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                display: "flex",
                flexDirection: "column",
                pointerEvents: "auto",
                boxSizing: "border-box",
              }}
            >
              <div style={{ fontSize: "7px", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "4px", textAlign: "center" }}>ELEVATION</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                {[
                  { val: "15m+", col: "#FF0000", lbl: "Tall" },
                  { val: "7.0m", col: "#FFFF00", lbl: "Poles" },
                  { val: "2.5m", col: "#00FF00", lbl: "Fences" },
                  { val: "0.0m", col: "#00FFFF", lbl: "Road" },
                  { val: "Below", col: "#0000FF", lbl: "Ditch" },
                ].map((item) => (
                  <div key={item.val} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "6.5px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: item.col,
                          border: "0.5px solid rgba(255,255,255,0.4)",
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ color: "white", fontWeight: 600 }}>{item.val}</span>
                    </div>
                    <span style={{ color: "rgba(255,255,255,0.5)" }}>{item.lbl}</span>
                  </div>
                ))}
              </div>
            </div>
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

        {(this.state.canScrollDown || this.state.canScrollUp) && <div className="mly-info-footer" style={{ pointerEvents: "auto", width: 96, boxSizing: "border-box", marginTop: 3, marginRight: isOverflowing ? 4 : 0, alignSelf: "flex-end", flexShrink: 0, borderRadius: 5, border: "1px solid rgba(167,213,190,0.25)", background: "rgba(18,31,27,0.94)", boxShadow: this.state.canScrollDown ? "0 -5px 8px rgba(18,31,27,0.35)" : "none" }}>
          <style>{`
            @keyframes mly-info-more-hint { 50% { transform: translateY(2px); } }
            .mly-info-more-hint { display: inline-block; animation: mly-info-more-hint 800ms ease-out 2; }
            @media (prefers-reduced-motion: reduce) { .mly-info-more-hint { animation: none; } }
          `}</style>
          <div style={{ display: "flex", gap: 2 }}>
            {this.state.canScrollUp && <button type="button" aria-label="Back to top of image controls" title="Back to top" onClick={() => this.scrollContainerRef.current?.scrollTo({ top: 0, behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })} style={{ flex: this.state.canScrollDown ? "0 0 22px" : "1 1 auto", minHeight: 26, padding: "3px 2px", border: "none", background: "transparent", borderRadius: 4, color: "#d6ebdf", fontSize: 8, cursor: "pointer" }}>{this.state.canScrollDown ? "↑" : "Back to top ↑"}</button>}
            {this.state.canScrollDown && <button type="button" aria-label="Scroll to more image controls" title="Show more controls" onClick={() => { const panel = this.scrollContainerRef.current; if (panel) panel.scrollBy({ top: Math.max(60, panel.clientHeight * 0.8), behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }} style={{ flex: "1 1 auto", minHeight: 26, padding: "3px 2px", border: "none", background: "transparent", borderRadius: 4, color: "#d6ebdf", fontSize: 8, cursor: "pointer", whiteSpace: "nowrap" }}><span className="mly-info-more-hint">More controls ↓</span></button>}
          </div>
        </div>}

      </div>
    );
  }
}
