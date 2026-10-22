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
                <div
                  className="year-legend-scroll"
                  style={{
                    marginTop: "4px",
                    paddingTop: "4px",
                    borderTop: "1px solid rgba(255,255,255,0.2)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    maxHeight: "65px",
                    overflowY: "auto",
                    pointerEvents: "auto",
                    overflowX: "hidden",
                    scrollbarColor: "rgba(255,255,255,0.3) transparent",
                  }}
                >
                  <style>{`.year-legend-scroll::-webkit-scrollbar { display: none; }`}</style>
                  <div style={{ fontSize: "8px", fontWeight: 600, opacity: 0.7, marginBottom: "2px", textAlign: "center", width: "100%" }}>YEARS</div>
                  {turboYearLegend.map((item) => {
                    const isSelected = selectedTurboYear === item.year;
                    const isAnySelected = !!selectedTurboYear;
                    return (
                      <div
                        key={item.year}
                        onClick={() => onYearLegendClick(item.year)}
                        title={isSelected ? "Click to show all years" : `Filter by ${item.year}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: "3px",
                          gap: "6px",
                          width: "100%",
                          flexShrink: 0,
                          cursor: "pointer",
                          opacity: isAnySelected && !isSelected ? 0.3 : 1,
                          transition: "all 0.2s ease",
                          transform: isSelected ? "scale(1.1)" : "scale(1)",
                        }}
                      >
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: item.color,
                            border: isSelected ? "1.5px solid white" : "1px solid rgba(255,255,255,0.6)",
                            boxShadow: isSelected ? "0 0 4px rgba(255,255,255,0.8)" : "none",
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            whiteSpace: "nowrap",
                            fontWeight: isSelected ? 800 : 400,
                            color: isSelected ? "#fff" : "rgba(255,255,255,0.9)",
                          }}
                        >
                          {item.year}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 3D TAPE MEASURE */}
          {pointCloudVisible && (
            <div
              style={{
                marginTop: "4px",
                background: isMeasureMode ? "rgba(25, 25, 25, 0.85)" : "rgba(20, 20, 20, 0.6)",
                backdropFilter: "blur(10px)",
                borderRadius: "6px",
                padding: "5px",
                width: "96px",
                border: isMeasureMode ? "1px solid rgba(30, 144, 255, 0.5)" : "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                display: "flex",
                flexDirection: "column",
                pointerEvents: "auto",
                boxSizing: "border-box",
              }}
            >
              <button
                onClick={onToggleMeasureMode}
                title="Toggle 3D Tape Measure"
                style={{ gap: "4px", minHeight: 16,
                  background: "none",
                  border: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  cursor: "pointer",
                  color: "white",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center",  gap: "4px", whiteSpace: "nowrap",  fontSize: "7px", fontWeight: 600, color: isMeasureMode ? "#1e90ff" : "rgba(255,255,255,0.7)" }}>
                  <Icons.Measure size={12} style={{ flexShrink: 0,  marginRight: 0, verticalAlign: "bottom" }} />
                  MEASURE
                </span>
                <div
                  style={{ flexShrink: 0,
                    width: "16px",
                    height: "8px",
                    borderRadius: "4px",
                    background: isMeasureMode ? "#1e90ff" : "rgba(255,255,255,0.3)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "1px",
                      left: isMeasureMode ? "9px" : "1px",
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "white",
                      transition: "left 0.2s",
                    }}
                  />
                </div>
              </button>

              {isMeasureMode && (
                <div style={{ marginTop: "4px", fontSize: "7.5px", color: "#ccc", textAlign: "left" }}>
                  {(!measurePoints || measurePoints.length === 0) && "Select 1st point"}
                  {measurePoints && measurePoints.length === 1 && "Select 2nd point"}
                  {measurePoints && measurePoints.length === 2 && <div style={{ color: "#37d582", fontWeight: "bold" }}>Ready</div>}
                  {measurePoints && measurePoints.length > 0 && (
                    <button
                      onClick={onClearMeasurement}
                      style={{
                        marginTop: "5px",
                        width: "100%",
                        background: "rgba(255,0,0,0.2)",
                        border: "1px solid rgba(255,0,0,0.4)",
                        color: "#ffcccc",
                        borderRadius: "3px",
                        padding: "2px 0",
                        fontSize: "7.5px",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      CLEAR
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 3D LASSO SELECTION */}
          {/* This panel allows users to draw a 2D shape over the panoramic image to select 3D points */}
          {pointCloudVisible && (
            <div
              style={{
                marginTop: "4px",
                background: isLassoMode ? "rgba(25, 25, 25, 0.85)" : "rgba(20, 20, 20, 0.6)",
                backdropFilter: "blur(10px)",
                borderRadius: "6px",
                padding: "5px",
                width: "96px",
                border: isLassoMode ? "1px solid rgba(0, 255, 255, 0.5)" : "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                display: "flex",
                flexDirection: "column",
                pointerEvents: "auto",
                boxSizing: "border-box",
              }}
            >
              <button
                onClick={onToggleLassoMode}
                title="Toggle Lasso Point Selection"
                style={{ gap: "4px", minHeight: 16,
                  background: "none",
                  border: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  cursor: "pointer",
                  color: "white",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center",  gap: "4px", whiteSpace: "nowrap",  fontSize: "7px", fontWeight: 600, color: isLassoMode ? "#00ffff" : "rgba(255,255,255,0.7)" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0,  marginRight: 0, verticalAlign: "bottom" }}>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM12 22c-5.52 0-10-4.48-10-10S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z" />
                    <circle cx="12" cy="12" r="3" fill="currentColor" />
                  </svg>
                  LASSO
                </span>
                <div
                  style={{ flexShrink: 0,
                    width: "16px",
                    height: "8px",
                    borderRadius: "4px",
                    background: isLassoMode ? "#00ffff" : "rgba(255,255,255,0.3)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "1px",
                      left: isLassoMode ? "9px" : "1px",
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "white",
                      transition: "left 0.2s",
                    }}
                  />
                </div>
              </button>

              {isLassoMode && (
                <div style={{ marginTop: "4px", fontSize: "7.5px", color: "#ccc", textAlign: "left" }}>
                  Draw on image to select.
                  <button
                    onClick={onClearLasso}
                    style={{
                      marginTop: "5px",
                      width: "100%",
                      background: "rgba(255,0,0,0.2)",
                      border: "1px solid rgba(255,0,0,0.4)",
                      color: "#ffcccc",
                      borderRadius: "3px",
                      padding: "2px 0",
                      fontSize: "7.5px",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    CLEAR
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 3D LINE OF SIGHT */}
          {pointCloudVisible && (
            <div
              style={{
                marginTop: "4px",
                background: isSightMode ? "rgba(25, 25, 25, 0.85)" : "rgba(20, 20, 20, 0.6)",
                backdropFilter: "blur(10px)",
                borderRadius: "6px",
                padding: "5px",
                width: "96px",
                border: isSightMode ? "1px solid rgba(168, 85, 247, 0.5)" : "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                display: "flex",
                flexDirection: "column",
                pointerEvents: "auto",
                boxSizing: "border-box",
              }}
            >
              <button
                onClick={onToggleSightMode}
                title="Toggle 3D Line of Sight"
                style={{ gap: "4px", minHeight: 16,
                  background: "none",
                  border: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  cursor: "pointer",
                  color: "white",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center",  gap: "4px", whiteSpace: "nowrap",  fontSize: "7px", fontWeight: 600, color: isSightMode ? "#a855f7" : "rgba(255,255,255,0.7)" }}>
                  <Icons.Eye size={12} style={{ flexShrink: 0,  marginRight: 0, verticalAlign: "bottom" }} />
                  SIGHT
                </span>
                <div
                  style={{ flexShrink: 0,
                    width: "16px",
                    height: "8px",
                    borderRadius: "4px",
                    background: isSightMode ? "#a855f7" : "rgba(255,255,255,0.3)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "1px",
                      left: isSightMode ? "9px" : "1px",
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "white",
                      transition: "left 0.2s",
                    }}
                  />
                </div>
              </button>

              {isSightMode && (
                <div style={{ marginTop: "4px", fontSize: "7.5px", color: "#ccc", textAlign: "left" }}>
                  {!sightObserver && "Select Observer point"}
                  {sightObserver && "Click to add Targets"}
                  {(sightObserver || (sightTargets && sightTargets.length > 0)) && (
                    <button
                      onClick={onClearSight}
                      style={{
                        marginTop: "5px",
                        width: "100%",
                        background: "rgba(255,0,0,0.2)",
                        border: "1px solid rgba(255,0,0,0.4)",
                        color: "#ffcccc",
                        borderRadius: "3px",
                        padding: "2px 0",
                        fontSize: "7.5px",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      CLEAR
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 3D VIEWSHED ANALYSIS */}
          {pointCloudVisible && (
            <div
              style={{
                marginTop: "4px",
                background: isViewshedMode ? "rgba(25, 25, 25, 0.85)" : "rgba(20, 20, 20, 0.6)",
                backdropFilter: "blur(10px)",
                borderRadius: "6px",
                padding: "5px",
                width: "96px",
                border: isViewshedMode ? "1px solid rgba(255, 85, 85, 0.5)" : "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                display: "flex",
                flexDirection: "column",
                pointerEvents: "auto",
                boxSizing: "border-box",
              }}
            >
              <button
                onClick={onToggleViewshedMode}
                title="Toggle 3D Viewshed (Blind Spot) Analysis"
                style={{ gap: "4px", minHeight: 16,
                  background: "none",
                  border: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  cursor: "pointer",
                  color: "white",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center",  gap: "4px", whiteSpace: "nowrap",  fontSize: "7px", fontWeight: 600, color: isViewshedMode ? "#ff5555" : "rgba(255,255,255,0.7)" }}>
                  <Icons.Viewshed size={12} style={{ flexShrink: 0,  marginRight: 0, verticalAlign: "bottom" }} />
                  VIEWSHED
                </span>
                <div
                  style={{ flexShrink: 0,
                    width: "16px",
                    height: "8px",
                    borderRadius: "4px",
                    background: isViewshedMode ? "#ff5555" : "rgba(255,255,255,0.3)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "1px",
                      left: isViewshedMode ? "9px" : "1px",
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "white",
                      transition: "left 0.2s",
                    }}
                  />
                </div>
              </button>

              {isViewshedMode && (
                <div style={{ marginTop: "4px", fontSize: "7.5px", color: "#ccc", textAlign: "left" }}>
                  Click cloud to calculate blind spots.
                  <button
                    onClick={onClearViewshed}
                    style={{
                      marginTop: "5px",
                      width: "100%",
                      background: "rgba(255,0,0,0.2)",
                      border: "1px solid rgba(255,0,0,0.4)",
                      color: "#ffcccc",
                      borderRadius: "3px",
                      padding: "2px 0",
                      fontSize: "7.5px",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    CLEAR
                  </button>
                </div>
              )}
            </div>
          )}

          {/* POINT CLOUD CALIBRATION MICRO-JOYSTICK */}
          {pointCloudVisible && (
            <div
              style={{
                marginTop: "4px",
                background: showCalibrationPanel ? "rgba(25, 25, 25, 0.85)" : "rgba(20, 20, 20, 0.6)",
                backdropFilter: "blur(10px)",
                borderRadius: "6px",
                padding: "5px",
                width: "96px",
                border: showCalibrationPanel ? "1px solid rgba(255, 193, 7, 0.5)" : "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                display: "flex",
                flexDirection: "column",
                pointerEvents: "auto",
                boxSizing: "border-box",
              }}
            >
              <button
                onClick={onToggleCalibrationPanel}
                title="Calibrate Point Cloud GPS Drift"
                style={{ gap: "4px", minHeight: 16,
                  background: "none",
                  border: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  cursor: "pointer",
                  color: "white",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center",  gap: "4px", whiteSpace: "nowrap",  fontSize: "7px", fontWeight: 600, color: showCalibrationPanel ? "#ffc107" : "rgba(255,255,255,0.7)" }}>
                  <Icons.Crosshair size={12} style={{ flexShrink: 0,  marginRight: 0, verticalAlign: "middle" }} />
                  CALIBRATE
                </span>
                <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.5)" }}>{showCalibrationPanel ? "▼" : "▲"}</div>
              </button>

              {showCalibrationPanel && (
                <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {/* Step size toggle */}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "7px", background: "rgba(0,0,0,0.3)", padding: "3px", borderRadius: "3px" }}>
                    <label style={{ cursor: "pointer", color: nudgeStep === 0.1 ? "#37d582" : "white" }}>
                      <input type="radio" checked={nudgeStep === 0.1} onChange={() => onSetNudgeStep?.(0.1)} style={{ display: "none" }} /> 0.1m
                    </label>
                    <label style={{ cursor: "pointer", color: nudgeStep === 1.0 ? "#37d582" : "white" }}>
                      <input type="radio" checked={nudgeStep === 1.0} onChange={() => onSetNudgeStep?.(1.0)} style={{ display: "none" }} /> 1.0m
                    </label>
                  </div>

                  {/* Micro D-Pad */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px", justifyItems: "center", marginTop: "2px" }}>
                    <div />
                    <button onClick={() => onJoystickNudge?.("y", 1)} style={miniJoyStyle}>
                      ▲
                    </button>
                    <div />
                    <button onClick={() => onJoystickNudge?.("x", -1)} style={miniJoyStyle}>
                      ◀
                    </button>
                    <button
                      onClick={onResetCalibration}
                      style={{ ...miniJoyStyle, fontSize: "6px", background: "rgba(255,0,0,0.3)", borderColor: "rgba(255,0,0,0.5)", fontWeight: "bold" }}
                    >
                      RST
                    </button>
                    <button onClick={() => onJoystickNudge?.("x", 1)} style={miniJoyStyle}>
                      ▶
                    </button>
                    <div />
                    <button onClick={() => onJoystickNudge?.("y", -1)} style={miniJoyStyle}>
                      ▼
                    </button>
                    <div />
                  </div>

                  {/* Vertical Z-controls */}
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "4px", marginTop: "2px" }}>
                    <button onClick={() => onJoystickNudge?.("z", -1)} style={{ ...miniJoyStyle, width: "32px", fontSize: "7.5px" }}>
                      ▼ Z
                    </button>
                    <button onClick={() => onJoystickNudge?.("z", 1)} style={{ ...miniJoyStyle, width: "32px", fontSize: "7.5px" }}>
                      ▲ Z
                    </button>
                  </div>
                </div>
              )}
            </div>
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

          {/* EXPORT BUTTON */}
          {(trafficSignsActive || objectsActive) && (
            <button
              onClick={onDownloadFeatures}
              title="Export active signs and objects within the map bounding box, using current filters"
              disabled={this.props.mapFeatureExportLoading}
              aria-busy={this.props.mapFeatureExportLoading}
              style={{ boxSizing: "border-box",
                marginTop: "4px",
                background: "rgba(55, 213, 130, 0.3)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                color: "#fff",
                borderRadius: "6px",
                fontSize: "9px",
                cursor: "pointer",
                width: "96px",
                fontWeight: 600,
                letterSpacing: "0.5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                pointerEvents: "auto",
                transition: "all 0.2s ease-in-out",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(55, 213, 130, 0.95)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = detectionsActive ? "rgba(55, 213, 130, 0.8)" : "rgba(55, 213, 130, 0.3)")}
            >
              <Icons.Download size={12} color="#ffffff" />
              <span style={{ fontWeight: 700 }}>{this.props.mapFeatureExportLoading ? "EXPORTING…" : "EXPORT AREA"}</span>
            </button>
          )}

          {/* AI OVERLAY BUTTON */}
          {(trafficSignsActive || objectsActive) && imageId && (
            <button
              onClick={onToggleDetections}
              title="Show or hide detection outlines"
              aria-label="Detection outlines"
              aria-pressed={detectionsActive}
              style={{ boxSizing: "border-box",
                marginTop: "4px",
                background: detectionsActive ? "rgba(55, 213, 130, 0.8)" : "rgba(55, 213, 130, 0.3)",
                color: "white",
                borderRadius: "6px",
                width: "96px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "auto",
                backdropFilter: "blur(5px)",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(55, 213, 130, 0.95)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = detectionsActive ? "rgba(55, 213, 130, 0.8)" : "rgba(55, 213, 130, 0.3)")}
            >
              <Icons.Detection size={11} />
              <span style={{ fontSize: "8.5px", marginLeft: "3px", fontWeight: 700 }}>AI OVERLAY</span>
            </button>
          )}

          {/* AI TAG VISIBILITY TOGGLE */}
          {detectionsActive && imageId && (trafficSignsActive || objectsActive) && (
            <button
              onClick={onToggleAiTags}
              title={showAiTags ? "Hide detection labels; keep outlines visible" : "Show labels for hovered or selected detections"}
              aria-label="Detection labels"
              aria-pressed={showAiTags}
              style={{ boxSizing: "border-box",
                background: showAiTags ? "rgba(55, 213, 130, 0.25)" : "rgba(25, 30, 32, 0.65)",
                border: "1px solid rgba(1, 1, 1, 0.7)",
                marginTop: "2px",
                color: "white",
                borderRadius: "6px",
                width: "96px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(5px)",
                pointerEvents: "auto",
                minHeight: "32px",
                gap: "5px",
                fontSize: "11px",
              }}
            >
              {showAiTags ? <Icons.LabelsOn size={14} /> : <Icons.LabelsOff size={14} />}
              <span>Labels</span>
            </button>
          )}

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
