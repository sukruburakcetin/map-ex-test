/** @jsx jsx */
/** @jsxFrag React.Fragment */
import { React, jsx } from "jimu-core";
import ReactDOM from "react-dom";
import * as Icons from "../components/Icons";
import { InfoBoxProps } from "./types";
import { NoteToolsSection } from '../features/field-notes/NoteToolsSection';
import { NearbyToolsSection } from '../features/imagery/NearbyToolsSection';
import { QualityToolsSection } from '../features/coverage/QualityToolsSection';
import { CoverageAnalysisTrigger } from '../features/coverage/CoverageAnalysisTrigger';
import { CoverageAnalysisResults } from '../features/coverage/CoverageAnalysisResults';
import { miniJoyStyle } from "../utils/styles";

interface ExtraTimePickerProps {
  value: number;
  disabled: boolean;
  onChange?: (minutes: number) => void;
}

class ExtraTimePicker extends React.PureComponent<ExtraTimePickerProps, { open: boolean }> {
  state = { open: false };
  private trigger = React.createRef<HTMLButtonElement>();
  private menu = React.createRef<HTMLDivElement>();
  private dismiss = (event: Event) => {
    if (!this.state.open || this.menu.current?.contains(event.target as Node) || this.trigger.current?.contains(event.target as Node)) return;
    this.setState({ open: false });
  };
  private escape = (event: KeyboardEvent) => {
    if (event.key === "Escape" && this.state.open) { event.preventDefault(); this.close(true); }
  };
  private close = (focus = false) => this.setState({ open: false }, () => { if (focus) this.trigger.current?.focus(); });
  private resize = () => this.close();
  componentDidMount() {
    document.addEventListener("pointerdown", this.dismiss);
    document.addEventListener("focusin", this.dismiss);
    document.addEventListener("keydown", this.escape);
    document.addEventListener("scroll", this.dismiss, true);
    window.addEventListener("resize", this.resize);
  }
  componentDidUpdate(previous: ExtraTimePickerProps) {
    if (!previous.disabled && this.props.disabled && this.state.open) this.close();
  }
  componentWillUnmount() {
    document.removeEventListener("pointerdown", this.dismiss);
    document.removeEventListener("focusin", this.dismiss);
    document.removeEventListener("keydown", this.escape);
    document.removeEventListener("scroll", this.dismiss, true);
    window.removeEventListener("resize", this.resize);
  }
  private position(): React.CSSProperties {
    const rect = this.trigger.current?.getBoundingClientRect();
    if (!rect) return {};
    const bounds = this.trigger.current?.closest(".mly-viewer-workspace")?.getBoundingClientRect();
    const left = Math.max(8, bounds?.left ?? 0);
    const right = Math.min(window.innerWidth - 8, bounds?.right ?? window.innerWidth);
    const top = Math.max(8, bounds?.top ?? 0);
    const bottom = Math.min(window.innerHeight - 8, bounds?.bottom ?? window.innerHeight);
    const width = Math.min(192, Math.max(0, right - left));
    const height = Math.min(142, Math.max(0, bottom - top));
    const above = bottom - rect.bottom < height + 6 && rect.top - top > bottom - rect.bottom;
    return { position: "fixed", left: Math.max(left, Math.min(rect.right - width, right - width)), top: Math.max(top, Math.min(above ? rect.top - height - 6 : rect.bottom + 6, bottom - height)), width, maxHeight: height, overflowY: "auto", zIndex: 2147483647, boxSizing: "border-box" };
  }
  render() {
    const { value, disabled, onChange } = this.props;
    const stepStyle: React.CSSProperties = { background: "none", border: "none", color: "white", fontSize: "8px", padding: "2px 3px", cursor: disabled ? "default" : "pointer" };
    return <div style={{ display: "flex", alignItems: "center", gap: "2px", minWidth: 0 }}>
      <button type="button" aria-label="Decrease extra time by 5 minutes" disabled={disabled || value <= 5} onClick={() => onChange?.(Math.max(5, value - 5))} style={{ ...stepStyle, opacity: disabled || value <= 5 ? 0.4 : 1 }}>−</button>
      <button type="button" ref={this.trigger} aria-haspopup="dialog" aria-expanded={this.state.open && !disabled} aria-label={`Extra time: ${value} minutes. Choose a preset`} title="Added travel time beyond the direct A → B route" disabled={disabled}
        onClick={() => this.setState({ open: !this.state.open }, () => { if (this.state.open) (this.menu.current?.querySelector<HTMLButtonElement>("button[aria-pressed='true']") || this.menu.current?.querySelector<HTMLButtonElement>("button[data-preset]"))?.focus(); })}
        style={{ background: "rgba(243,156,18,0.09)", border: "1px solid rgba(243,156,18,0.3)", borderRadius: "3px", color: "#f39c12", fontSize: "6.5px", fontWeight: 700, whiteSpace: "nowrap", padding: "2px 3px", cursor: disabled ? "default" : "pointer" }}>{value} min</button>
      <button type="button" aria-label="Increase extra time by 5 minutes" disabled={disabled || value >= 120} onClick={() => onChange?.(Math.min(120, value + 5))} style={{ ...stepStyle, opacity: disabled || value >= 120 ? 0.4 : 1 }}>+</button>
      {this.state.open && !disabled && ReactDOM.createPortal(
        <div ref={this.menu} role="dialog" aria-label="Choose extra route time" style={{ ...this.position(), background: "#142126", color: "#fff", border: "1px solid rgba(243,156,18,0.3)", borderRadius: "8px", padding: "8px", boxShadow: "0 6px 24px rgba(0,0,0,0.45)", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "11px", fontWeight: 600 }}>Extra time · {value} min</span>
            <button type="button" aria-label="Close extra time presets" onClick={() => this.close(true)} style={{ background: "none", border: "none", color: "#bac7cb", width: "28px", height: "28px", cursor: "pointer", fontSize: "18px" }}>×</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "4px" }}>
            {[15, 30, 45, 60, 90, 120].map(minutes => <button key={minutes} type="button" data-preset aria-pressed={value === minutes} disabled={disabled} onClick={() => { onChange?.(minutes); this.close(true); }}
              style={{ minHeight: "44px", padding: "4px", borderRadius: "5px", border: `1px solid ${value === minutes ? "#f39c12" : "rgba(255,255,255,0.14)"}`, background: value === minutes ? "rgba(243,156,18,0.16)" : "rgba(255,255,255,0.04)", color: value === minutes ? "#f6bc58" : "#e3eaed", fontSize: "12px", fontWeight: value === minutes ? 700 : 500, cursor: "pointer" }}>{minutes} min</button>)}
          </div>
        </div>, document.fullscreenElement || document.body)}
    </div>;
  }
}

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

          {this.props.pointCloudVisible && <button
            type="button" role="switch" aria-checked={!!this.props.pointCloudAdaptive}
            aria-label="Adaptive scene display"
            title="Adaptive scene display: fewer scene points while navigating; full detail when stopped. Analysis tools retain full detail."
            onClick={() => this.props.onPointCloudAdaptiveChange?.(!this.props.pointCloudAdaptive)}
            style={{ pointerEvents: "auto", marginTop: 4, width: 96, minHeight: 26, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4, padding: "5px 6px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.15)", background: this.props.pointCloudAdaptive ? "rgba(26,109,66,0.85)" : "rgba(35,35,35,0.75)", color: "rgba(255,255,255,0.85)", cursor: "pointer", fontSize: 8, fontWeight: 600 }}>
            <span>ADAPTIVE</span>
            <span aria-hidden="true" style={{ width: 17, height: 9, flexShrink: 0, borderRadius: 6, background: this.props.pointCloudAdaptive ? "#37d582" : "#727272", padding: 1, boxSizing: "border-box" }}><span style={{ display: "block", width: 7, height: 7, borderRadius: "50%", background: "white", transform: this.props.pointCloudAdaptive ? "translateX(8px)" : "translateX(0)", transition: "transform 120ms ease" }} /></span>
          </button>}

          {this.props.pointCloudSummary && <div role="status" style={{ pointerEvents: "auto", width: 96, boxSizing: "border-box", marginTop: 4, padding: "5px 6px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(20,20,20,0.8)", color: this.props.pointCloudIncomplete ? "#ffcc86" : "#a7d5be", fontSize: 8, lineHeight: 1.4 }}>
            {this.props.pointCloudPrevious && <div style={{ marginBottom: 4, fontWeight: 600, color: "#ffcc86" }}>Previous image cloud</div>}
            <details>
              <summary title={this.props.pointCloudSummary} style={{ cursor: "pointer", fontWeight: 600 }}>Cloud {this.props.pointCloudIncomplete ? "partial" : "loaded"}</summary>
              <div style={{ marginTop: 4, overflowWrap: "anywhere" }}>{this.props.pointCloudSummary}</div>
            </details>
            <div style={{ marginTop: 3 }}>{this.props.pointCloudSummary.split(" · ").find(part => part.includes(" visible"))?.replace(" visible", " corridor pts")}</div>
            {this.props.pointCloudIncomplete && <button type="button" title="Retry missing discovery/downloads; the data budgets still apply" disabled={this.props.pointCloudLoading} onClick={this.props.onRetryPointCloud} style={{ width: "100%", minHeight: 20, marginTop: 4, fontSize: 8, fontWeight: 600, padding: "3px 5px", background: "#214532", border: "1px solid #638974", borderRadius: 4, color: "#d3eadb", cursor: this.props.pointCloudLoading ? "wait" : "pointer", opacity: this.props.pointCloudLoading ? 0.6 : 1 }}>{this.props.pointCloudLoading ? "Retrying…" : this.props.pointCloudAutoPaused ? "Resume" : "Retry"}</button>}
          </div>}

          {this.props.pointCloudVisible &&
            (() => {
              const { pointCloudLength, pointCloudMaxLength, pointCloudActualLength, onLengthChange, pointCloudWidth, pointCloudMaxWidth, pointCloudActualWidth, onWidthChange } =
                this.props;

              const lengthStep = 5;
              const lengthSliderMax = pointCloudMaxLength + lengthStep;
              const isLengthFull = pointCloudLength <= 0;
              const lengthSliderValue = isLengthFull ? lengthSliderMax : pointCloudLength;

              const handleLengthDec = () => {
                if (isLengthFull) {
                  onLengthChange(pointCloudMaxLength);
                } else {
                  const next = pointCloudLength - lengthStep;
                  onLengthChange(next < 10 ? 10 : next);
                }
              };
              const handleLengthInc = () => {
                if (isLengthFull) return;
                const next = pointCloudLength + lengthStep;
                onLengthChange(next > pointCloudMaxLength ? 0 : next);
              };

              const hasWidth = pointCloudWidth !== undefined && !!onWidthChange;
              const minWidth = 5;
              const maxWidth = pointCloudMaxWidth ?? 80;
              const widthStep = 5;
              const widthValue = pointCloudWidth ?? minWidth;
              const widthSliderMax = maxWidth + widthStep;
              const isWidthFull = pointCloudWidth <= 0 || widthValue >= widthSliderMax;
              const widthSliderValue = isWidthFull ? widthSliderMax : widthValue;

              const handleWidthDec = () => {
                if (!onWidthChange) return;
                if (isWidthFull) {
                  onWidthChange(maxWidth);
                } else {
                  onWidthChange(Math.max(minWidth, widthValue - widthStep));
                }
              };
              const handleWidthInc = () => {
                if (!onWidthChange) return;
                const next = widthValue + widthStep;
                onWidthChange(next > maxWidth ? 0 : next);
              };

              const btnBase: React.CSSProperties = {
                width: "16px",
                height: "16px",
                borderRadius: "3px",
                border: "1px solid rgba(255,255,255,0.25)",
                background: "rgba(255,255,255,0.1)",
                color: "white",
                fontSize: "11px",
                lineHeight: "1",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                padding: 0,
                transition: "background 0.15s",
              };

              const divider = <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", margin: "6px 0 5px" }} />;

              return (
                <div
                  style={{
                    marginTop: "4px",
                    background: "rgba(20, 20, 20, 0.6)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "6px",
                    padding: "6px",
                    width: "96px",
                    border: "1px solid rgba(255,255,255,0.15)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                    display: "flex",
                    flexDirection: "column",
                    pointerEvents: "auto",
                    boxSizing: "border-box",
                  }}
                >
                  {/* LENGTH sub-section */}
                  <div style={{ fontSize: "7px", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "4px", textAlign: "center" }}>
                    LENGTH <span style={{ fontWeight: 400, opacity: 0.55, fontSize: "6px" }}>N↔S</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px", gap: "3px" }}>
                    <button
                      title="Decrease length by 5m"
                      onClick={handleLengthDec}
                      style={btnBase}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                    >
                      &#8722;
                    </button>
                    <div style={{ fontSize: "8px", fontWeight: "bold", color: isLengthFull ? "#37d582" : "#00FFFF", textAlign: "center", flex: 1 }}>
                      {this.state.sliderDragValue !== null
                        ? this.state.sliderDragValue >= lengthSliderMax
                          ? `FULL (~${pointCloudActualLength}m)`
                          : `${this.state.sliderDragValue}m`
                        : isLengthFull
                          ? `FULL (~${pointCloudActualLength}m)`
                          : `${pointCloudLength}m`}
                    </div>
                    <button
                      title={isLengthFull ? "Already at full length" : "Increase length by 5m"}
                      onClick={handleLengthInc}
                      style={{ ...btnBase, opacity: isLengthFull ? 0.35 : 1, cursor: isLengthFull ? "default" : "pointer" }}
                      onMouseEnter={(e) => {
                        if (!isLengthFull) e.currentTarget.style.background = "rgba(255,255,255,0.25)";
                      }}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                    >
                      +
                    </button>
                  </div>
                  <div style={{ position: "relative", width: "100%" }}>
                    <div
                      style={{
                        position: "absolute",
                        left: `${((pointCloudMaxLength - 10) / (lengthSliderMax - 10)) * 100}%`,
                        width: "1px",
                        height: "8px",
                        background: "rgba(255,255,255,0.4)",
                        pointerEvents: "none",
                        transform: "translateX(-50%)",
                      }}
                    />
                    <input
                      className="point-cloud-slider"
                      type="range"
                      min={10}
                      max={lengthSliderMax}
                      step={lengthStep}
                      value={this.state.sliderDragValue ?? lengthSliderValue}
                      onChange={(e) => this.setState({ sliderDragValue: Number(e.target.value) })}
                      onMouseUp={(e) => {
                        const val = Number((e.target as HTMLInputElement).value);
                        this.setState({ sliderDragValue: null });
                        onLengthChange(val >= lengthSliderMax ? 0 : val);
                      }}
                      onTouchEnd={(e) => {
                        const val = Number((e.target as HTMLInputElement).value);
                        this.setState({ sliderDragValue: null });
                        onLengthChange(val >= lengthSliderMax ? 0 : val);
                      }}
                      style={{ width: "100%", background: "transparent", cursor: "pointer", height: "3px", appearance: "none" }}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "3px", fontSize: "6.5px", color: "rgba(255,255,255,0.5)" }}>
                    <span>10m</span>
                    <span style={{ color: "rgba(255,255,255,0.35)" }}>{pointCloudMaxLength}m</span>
                    <span>FULL</span>
                  </div>

                  {/* WIDTH sub-section */}
                  {hasWidth && (
                    <React.Fragment>
                      {divider}
                      <div style={{ fontSize: "7px", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "4px", textAlign: "center" }}>
                        WIDTH <span style={{ fontWeight: 400, opacity: 0.55, fontSize: "6px" }}>E↔W</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px", gap: "3px" }}>
                        <button
                          title="Decrease width by 5m"
                          onClick={handleWidthDec}
                          style={{ ...btnBase, opacity: widthValue <= minWidth ? 0.35 : 1, cursor: widthValue <= minWidth ? "default" : "pointer" }}
                          onMouseEnter={(e) => {
                            if (widthValue > minWidth) e.currentTarget.style.background = "rgba(255,255,255,0.25)";
                          }}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                        >
                          &#8722;
                        </button>
                        <div style={{ fontSize: "8px", fontWeight: "bold", color: isWidthFull ? "#37d582" : "#FFD700", textAlign: "center", flex: 1 }}>
                          {this.state.sliderDragWidthValue !== null
                            ? this.state.sliderDragWidthValue >= widthSliderMax
                              ? `FULL (~${pointCloudActualWidth}m)`
                              : `${this.state.sliderDragWidthValue}m`
                            : isWidthFull
                              ? `FULL (~${pointCloudActualWidth}m)`
                              : `${widthValue}m`}
                        </div>
                        <button
                          title={isWidthFull ? "Already at full width" : "Increase width by 5m"}
                          onClick={handleWidthInc}
                          style={{ ...btnBase, opacity: isWidthFull ? 0.35 : 1, cursor: isWidthFull ? "default" : "pointer" }}
                          onMouseEnter={(e) => {
                            if (!isWidthFull) e.currentTarget.style.background = "rgba(255,255,255,0.25)";
                          }}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                        >
                          +
                        </button>
                      </div>
                      <div style={{ position: "relative", width: "100%" }}>
                        <div
                          style={{
                            position: "absolute",
                            left: `${((maxWidth - minWidth) / (widthSliderMax - minWidth)) * 100}%`,
                            width: "1px",
                            height: "8px",
                            background: "rgba(255,255,255,0.4)",
                            pointerEvents: "none",
                            transform: "translateX(-50%)",
                          }}
                        />
                        <input
                          className="point-cloud-slider"
                          type="range"
                          min={minWidth}
                          max={widthSliderMax}
                          step={widthStep}
                          value={this.state.sliderDragWidthValue ?? widthSliderValue}
                          onChange={(e) => this.setState({ sliderDragWidthValue: Number(e.target.value) })}
                          onMouseUp={(e) => {
                            const val = Number((e.target as HTMLInputElement).value);
                            this.setState({ sliderDragWidthValue: null });
                            onWidthChange!(val >= widthSliderMax ? 0 : val);
                          }}
                          onTouchEnd={(e) => {
                            const val = Number((e.target as HTMLInputElement).value);
                            this.setState({ sliderDragWidthValue: null });
                            onWidthChange!(val >= widthSliderMax ? 0 : val);
                          }}
                          style={{ width: "100%", background: "transparent", cursor: "pointer", height: "3px", appearance: "none" }}
                        />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "3px", fontSize: "6.5px", color: "rgba(255,255,255,0.5)" }}>
                        <span>{minWidth}m</span>
                        <span style={{ color: "rgba(255,255,255,0.35)" }}>{maxWidth}m</span>
                        <span>FULL</span>
                      </div>
                    </React.Fragment>
                  )}
                </div>
              );
            })()}

          {/* POINT CLOUD EXPORT */}
          {pointCloudVisible && (
            <div style={{ width: 96, pointerEvents: "auto", marginTop: 4 }}>
            <select disabled={this.props.pointCloudExportLoading} aria-label="Point-cloud export format" title="CSV: geographic coordinates. PLY: local metric XYZ with RGB. LAS: georeferenced WGS84 UTM for QGIS." value={this.state.pointCloudExportFormat || "csv"} onChange={event => this.setState({ pointCloudExportFormat: event.target.value === "las" ? "las" : event.target.value === "ply" ? "ply" : "csv" })} style={{ width: "100%", boxSizing: "border-box", height: 24, borderRadius: 4, border: "1px solid #638974", background: "#17241e", color: "#e2ece7", fontSize: 9 }}><option value="csv">CSV · Lat/Lon</option><option value="ply">PLY · XYZ/RGB</option><option value="las">LAS · QGIS/UTM</option></select>
            <button
              type="button" disabled={this.props.pointCloudExportLoading} aria-busy={!!this.props.pointCloudExportLoading}
              onClick={() => onDownloadPointCloud?.(this.state.pointCloudExportFormat || "csv")}
              title="Export all retained points with alignment and nudge (source altitude, not terrain-draped)"
              style={{ boxSizing: "border-box",
                marginTop: "4px",
                background: "rgba(30, 144, 255, 0.3)",
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
                border: "1px solid rgba(30, 144, 255, 0.5)",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                padding: "4px 0",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(30, 144, 255, 0.8)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(30, 144, 255, 0.3)")}
            >
              <Icons.Download size={12} color="#ffffff" />
              <span style={{ fontWeight: 700 }}>{this.props.pointCloudExportLoading ? "EXPORTING…" : "EXPORT"}</span>
            </button>
            </div>
          )}

          {/* SOLAR GLARE & SHADOW MODELING */}
          {this.props.enableSolar === true && <div
            style={{
              marginTop: "4px",
              background: isSolarMode ? "rgba(25, 25, 25, 0.85)" : "rgba(20, 20, 20, 0.6)",
              backdropFilter: "blur(10px)",
              borderRadius: "6px",
              padding: "5px",
              width: "96px",
              border: isSolarMode ? "1px solid rgba(255, 215, 0, 0.5)" : "1px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
              display: "flex",
              flexDirection: "column",
              pointerEvents: "auto",
              boxSizing: "border-box",
            }}
          >
            <button
              onClick={onToggleSolarMode}
              title="Toggle Solar Glare & Shadow Modeling"
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
              <span style={{ gap: "4px", whiteSpace: "nowrap",  fontSize: "7px", fontWeight: 600, color: isSolarMode ? "#ffd700" : "rgba(255,255,255,0.7)", display: "flex", alignItems: "center" }}>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0,  marginRight: 0 }}
                >
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
                SOLAR
              </span>
              <div
                style={{ flexShrink: 0,
                  width: "16px",
                  height: "8px",
                  borderRadius: "4px",
                  background: isSolarMode ? "#ffd700" : "rgba(255,255,255,0.3)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "1px",
                    left: isSolarMode ? "9px" : "1px",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "white",
                    transition: "left 0.2s",
                  }}
                />
              </div>
            </button>

            {isSolarMode && (
              <div style={{ marginTop: "4px", fontSize: "7px", color: "#ccc", textAlign: "left", lineHeight: "1.2" }}>
                Sun &amp; Shadow position modeled based on exact photo timestamp.
              </div>
            )}
          </div>}

          {/* ELEVATION PROFILE WIDGET TOGGLE */}
          {this.props.enableElevationProfile === true && sequenceImages && sequenceImages.length > 1 && (
            <div
              style={{
                marginTop: "4px",
                background: this.props.isElevationProfileActive ? "rgba(25, 25, 25, 0.85)" : "rgba(20, 20, 20, 0.6)",
                backdropFilter: "blur(10px)",
                borderRadius: "6px",
                padding: "5px",
                width: "96px",
                border: this.props.isElevationProfileActive ? "1px solid rgba(52, 152, 219, 0.6)" : "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                display: "flex",
                flexDirection: "column",
                pointerEvents: "auto",
                boxSizing: "border-box",
              }}
            >
              <button
                onClick={this.props.onToggleElevationProfile}
                title="Toggle Elevation Profile along sequence"
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
                <span
                  style={{ gap: "4px", whiteSpace: "nowrap",
                    fontSize: "7px",
                    fontWeight: 600,
                    color: this.props.isElevationProfileActive ? "#3498db" : "rgba(255,255,255,0.7)",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0,  marginRight: 0 }}
                  >
                    <path d="M3 20h18L14 7l-4 7-3-4-4 10z" />
                  </svg>
                  PROFILE
                </span>
                <div
                  style={{ flexShrink: 0,
                    width: "16px",
                    height: "8px",
                    borderRadius: "4px",
                    background: this.props.isElevationProfileActive ? "#3498db" : "rgba(255,255,255,0.3)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "1px",
                      left: this.props.isElevationProfileActive ? "9px" : "1px",
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "white",
                      transition: "left 0.2s",
                    }}
                  />
                </div>
              </button>
            </div>
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
                        <div style={{ marginTop: "4px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "4px" }}>
                          {/* Runtime Routing Engine */}
                          {runtimeRoutingEngine && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "3px",

                                background: "rgba(0,0,0,0.3)",

                                borderRadius: "2px",

                                padding: "2px 3px",

                                marginBottom: "3px",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "6px",
                                  color: "rgba(255,255,255,0.7)",
                                }}
                              >
                                Engine:
                              </span>

                              <select
                                value={runtimeRoutingEngine}
                                disabled={isGeneratingRoute}
                                onChange={(e) => {
                                  const engine = e.target.value as "world" | "osrm";

                                  onChangeRuntimeRoutingEngine?.(engine);
                                }}
                                style={{
                                  flex: 1,

                                  minWidth: 0,

                                  height: "16px",

                                  borderRadius: "2px",

                                  border: "1px solid rgba(255,255,255,0.2)",

                                  background: "rgba(255,255,255,0.1)",

                                  color: "#fff",

                                  fontSize: "6px",

                                  padding: "0 2px",

                                  cursor: isGeneratingRoute ? "wait" : "pointer",
                                }}
                              >
                                <option value="world" style={{ color: "#000" }}>
                                  Esri World
                                </option>

                                <option value="osrm" style={{ color: "#000" }}>
                                  OSRM
                                </option>
                              </select>
                            </div>
                          )}
                          {/* Runtime Travel Mode */}
                          {runtimeTravelMode && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "3px",

                                background: "rgba(0,0,0,0.3)",

                                borderRadius: "2px",

                                padding: "2px 3px",

                                marginBottom: "3px",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "6px",
                                  color: "rgba(255,255,255,0.7)",
                                }}
                              >
                                Mode:
                              </span>

                              <div
                                style={{
                                  flex: 1,
                                  minWidth: 0,
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                <select
                                  value={runtimeTravelMode}
                                  disabled={isGeneratingRoute}
                                  onChange={(e) => {
                                    const mode = e.target.value as "drive" | "walk" | "bike";

                                    onChangeRuntimeTravelMode?.(mode);
                                  }}
                                  style={{
                                    width: "100%",
                                    minWidth: 0,
                                    height: "16px",
                                    borderRadius: "2px",
                                    border: "1px solid rgba(255,255,255,0.2)",
                                    background: "rgba(255,255,255,0.1)",
                                    color: "#fff",
                                    fontSize: "6px",
                                    padding: "0 2px",
                                    cursor: isGeneratingRoute ? "wait" : "pointer",
                                  }}
                                >
                                  <option value="drive" disabled={travelModeAvailability ? !travelModeAvailability.drive : false} style={{ color: "#000" }}>
                                    🚗 Drive
                                  </option>

                                  <option value="walk" disabled={travelModeAvailability ? !travelModeAvailability.walk : false} style={{ color: "#000" }}>
                                    {travelModeAvailability && !travelModeAvailability.walk ? "🚶 Walk - Esri only" : "🚶 Walk"}
                                  </option>

                                  <option value="bike" disabled={travelModeAvailability ? !travelModeAvailability.bike : false} style={{ color: "#000" }}>
                                    {travelModeAvailability && !travelModeAvailability.bike ? "🚲 Bike - unavailable" : "🚲 Bike"}
                                  </option>
                                </select>
                              </div>
                            </div>
                          )}
                          {!routeData ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                              {/* Point A and B Selection Buttons */}
                              <div style={{ display: "flex", gap: "2px" }}>
                                <button
                                  onClick={() => onSetRoutePickMode?.(routePickMode === "start" ? null : "start")}
                                  title="Select Start Point (A) on map"
                                  style={{
                                    flex: 1,
                                    padding: "2px 0",
                                    fontSize: "6.5px",
                                    fontWeight: "bold",
                                    borderRadius: "2px",
                                    border: "1px solid rgba(46, 204, 113, 0.6)",

                                    background: routePickMode === "start" ? "rgba(46, 204, 113, 0.8)" : routeStartPoint ? "rgba(46, 204, 113, 0.3)" : "rgba(255,255,255,0.1)",

                                    color: "white",
                                    cursor: "pointer",
                                  }}
                                >
                                  {routePickMode === "start" ? "Click..." : routeStartPoint ? "A: ✓" : "A: Pick"}
                                </button>

                                <button
                                  onClick={() => onSetRoutePickMode?.(routePickMode === "end" ? null : "end")}
                                  title="Select Destination Point (B) on map"
                                  style={{
                                    flex: 1,
                                    padding: "2px 0",
                                    fontSize: "6.5px",
                                    fontWeight: "bold",
                                    borderRadius: "2px",
                                    border: "1px solid rgba(231, 76, 60, 0.6)",

                                    background: routePickMode === "end" ? "rgba(231, 76, 60, 0.8)" : routeEndPoint ? "rgba(231, 76, 60, 0.3)" : "rgba(255,255,255,0.1)",

                                    color: "white",
                                    cursor: "pointer",
                                  }}
                                >
                                  {routePickMode === "end" ? "Click..." : routeEndPoint ? "B: ✓" : "B: Pick"}
                                </button>
                              </div>

                              {/* CLEAR A / B */}
                              {(routeStartPoint || routeEndPoint) && (
                                <button
                                  onClick={onResetRoutePoints}
                                  title="Clear A and B route points"
                                  style={{
                                    width: "100%",
                                    padding: "2px 0",
                                    fontSize: "6px",
                                    fontWeight: 600,
                                    borderRadius: "2px",
                                    border: "1px solid rgba(231, 76, 60, 0.35)",
                                    background: "rgba(231, 76, 60, 0.12)",
                                    color: "rgba(255,255,255,0.8)",
                                    cursor: "pointer",
                                  }}
                                >
                                  ✕ Clear A / B
                                </button>
                              )}

                              {/* Extra time beyond the direct A to B route */}
                              <div title="Added travel time beyond the direct A → B route" style={{ display: "flex", alignItems: "center", flexDirection: "column", gap: "1px", background: "rgba(0,0,0,0.3)", borderRadius: "3px", padding: "2px 3px" }}>
                                <span style={{ fontSize: "6px", color: "rgba(255,255,255,0.7)", whiteSpace: "nowrap" }} title="Extra Time">ET</span>
                                <ExtraTimePicker value={routeSpareMinutes ?? 15} disabled={!!isGeneratingRoute} onChange={onChangeSpareMinutes} />
                              </div>

                              {/* Generate Route Button with Progress Bar */}
                              <button
                                onClick={onGenerateRoute}
                                disabled={isGeneratingRoute || !routeStartPoint || !routeEndPoint}
                                style={{
                                  position: "relative",
                                  width: "100%",
                                  borderRadius: "3px",
                                  border: "1px solid rgba(168, 85, 247, 0.5)",
                                  background: !routeStartPoint || !routeEndPoint ? "rgba(255,255,255,0.05)" : "rgba(168, 85, 247, 0.3)",
                                  color: !routeStartPoint || !routeEndPoint ? "rgba(255,255,255,0.3)" : "white",
                                  fontSize: "6.5px",
                                  fontWeight: 700,
                                  cursor: isGeneratingRoute ? "wait" : !routeStartPoint || !routeEndPoint ? "not-allowed" : "pointer",
                                  padding: "3px 0",
                                  display: "flex",
                                  justifyContent: "center",
                                  gap: "3px",
                                  overflow: "hidden",
                                }}
                              >
                                {isGeneratingRoute && routeGenerationProgress && (
                                  <div
                                    style={{
                                      position: "absolute",
                                      left: 0,
                                      top: 0,
                                      bottom: 0,
                                      width: `${Math.min(100, (routeGenerationProgress.usedMinutes / routeGenerationProgress.budgetMinutes) * 100)}%`,
                                      background: "rgba(168, 85, 247, 0.55)",
                                      transition: "width 0.25s ease-out",
                                      zIndex: 0,
                                    }}
                                  />
                                )}
                                <span style={{ position: "relative", zIndex: 1 }}>
                                  {isGeneratingRoute
                                    ? routeGenerationProgress
                                      ? `Routing... ${Math.round((routeGenerationProgress.usedMinutes / routeGenerationProgress.budgetMinutes) * 100)}%`
                                      : "Routing..."
                                    : "Generate Route"}
                                </span>
                              </button>
                            </div>
                          ) : (
                            /* ROUTE RESULT PANEL */
                            <div
                              style={{
                                background: "rgba(168, 85, 247, 0.15)",

                                borderRadius: "4px",

                                padding: "5px",

                                border: "1px solid rgba(168, 85, 247, 0.3)",
                              }}
                            >
                              {/*
                               * --------------------------------------------------------
                               * HEADER
                               * --------------------------------------------------------
                               */}
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  fontSize: "6.5px",
                                  color: "#a855f7",
                                  fontWeight: 700,
                                  marginBottom: "3px",
                                }}
                              >
                                <span>A ➔ B CAPTURE</span>

                                <span
                                  style={{
                                    color: "#fff",
                                  }}
                                >
                                  {Math.round(routeData.duration / 60)} min
                                </span>
                              </div>

                              {/*
                               * --------------------------------------------------------
                               * ROUTE DISTANCE
                               * --------------------------------------------------------
                               */}
                              <div
                                style={{
                                  fontSize: "8px",
                                  fontWeight: 800,
                                  color: "#fff",
                                  textAlign: "center",
                                  marginBottom: "4px",
                                }}
                              >
                                {(routeData.distance / 1000).toFixed(1)} km
                              </div>

                              {/*
                               * --------------------------------------------------------
                               * HEADLINE: USEFUL NEW COVERAGE
                               * --------------------------------------------------------
                               */}
                              {routeData.usefulCoverageMeters != null && (
                                <div
                                  title={"Selected missing/stale road traversed by " + "the final route that was not already covered " + "by the normal A → B baseline."}
                                  style={{
                                    background: "rgba(168, 85, 247, 0.22)",

                                    borderRadius: "3px",

                                    padding: "4px 3px",

                                    textAlign: "center",

                                    marginBottom: "3px",
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: "6px",
                                      color: "rgba(255,255,255,0.7)",
                                      fontWeight: 600,
                                    }}
                                  >
                                    USEFUL NEW COVERAGE
                                  </div>

                                  <div
                                    style={{
                                      fontSize: "9px",
                                      color: "#fff",
                                      fontWeight: 800,
                                    }}
                                  >
                                    +{(routeData.usefulCoverageMeters / 1000).toFixed(2)}
                                    {" km"}
                                  </div>
                                </div>
                              )}

                              {/*
                               * --------------------------------------------------------
                               * TARGET REALIZATION
                               * --------------------------------------------------------
                               */}
                              {routeData.targetRealizationPercent != null && (
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",

                                    alignItems: "center",

                                    fontSize: "6.5px",

                                    marginBottom: "2px",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "rgba(255,255,255,0.7)",
                                    }}
                                  >
                                    Target realization
                                  </span>

                                  <span
                                    style={{
                                      color: "#fff",
                                      fontWeight: 700,
                                    }}
                                  >
                                    {routeData.targetRealizationPercent.toFixed(0)}%
                                  </span>
                                </div>
                              )}

                              {/*
                               * --------------------------------------------------------
                               * NONE / STALE BREAKDOWN
                               * --------------------------------------------------------
                               */}
                              <div
                                style={{
                                  display: "flex",
                                  gap: "3px",
                                  marginTop: "3px",
                                }}
                              >
                                {routeData.incrementalNoneMeters != null && (
                                  <div
                                    title="New useful coverage on roads with no current Mapillary coverage."
                                    style={{
                                      flex: 1,

                                      background: "rgba(231, 76, 60, 0.16)",

                                      borderRadius: "3px",

                                      padding: "3px",

                                      textAlign: "center",
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontSize: "5.5px",
                                        color: "#ff7675",
                                        fontWeight: 700,
                                      }}
                                    >
                                      MISSING
                                    </div>

                                    <div
                                      style={{
                                        fontSize: "7px",
                                        color: "#fff",
                                        fontWeight: 700,
                                      }}
                                    >
                                      {(routeData.incrementalNoneMeters / 1000).toFixed(2)}
                                      {" km"}
                                    </div>
                                  </div>
                                )}

                                {routeData.incrementalStaleMeters != null && (
                                  <div
                                    title="New useful coverage on stale Mapillary road coverage."
                                    style={{
                                      flex: 1,

                                      background: "rgba(243, 156, 18, 0.16)",

                                      borderRadius: "3px",

                                      padding: "3px",

                                      textAlign: "center",
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontSize: "5.5px",
                                        color: "#f39c12",
                                        fontWeight: 700,
                                      }}
                                    >
                                      STALE
                                    </div>

                                    <div
                                      style={{
                                        fontSize: "7px",
                                        color: "#fff",
                                        fontWeight: 700,
                                      }}
                                    >
                                      {(routeData.incrementalStaleMeters / 1000).toFixed(2)}
                                      {" km"}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/*
                               * --------------------------------------------------------
                               * EXTRA TIME BUDGET
                               * --------------------------------------------------------
                               */}
                              {routeData.extraDurationMinutes != null && routeData.requestedExtraMinutes != null && (
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",

                                    alignItems: "center",

                                    marginTop: "4px",

                                    paddingTop: "3px",

                                    borderTop: "1px solid rgba(255,255,255,0.08)",

                                    fontSize: "6.5px",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "rgba(255,255,255,0.65)",
                                    }}
                                  >
                                    Extra time
                                  </span>

                                  <span
                                    style={{
                                      color: routeData.extraDurationMinutes > routeData.requestedExtraMinutes ? "#ff7675" : "#fff",

                                      fontWeight: 700,
                                    }}
                                  >
                                    {routeData.extraDurationMinutes.toFixed(0)}
                                    {" / "}
                                    {routeData.requestedExtraMinutes.toFixed(0)}
                                    {" min"}
                                  </span>
                                </div>
                              )}

                              {/*
                               * --------------------------------------------------------
                               * ACTIONS
                               * --------------------------------------------------------
                               */}
                              <div
                                style={{
                                  display: "flex",
                                  gap: "3px",
                                  marginTop: "4px",
                                }}
                              >
                                <button
                                  onClick={onDownloadRouteGPX}
                                  style={{
                                    flex: 1,
                                    background: "#a855f7",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "2px",
                                    fontSize: "6.5px",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    padding: "2px 0",
                                  }}
                                >
                                  ⬇️ GPX
                                </button>

                                <button
                                  onClick={onResetRoutePoints}
                                  title={"Clear route and A/B waypoints"}
                                  style={{
                                    background: "rgba(231, 76, 60, 0.4)",

                                    color: "white",
                                    border: "none",
                                    borderRadius: "2px",
                                    fontSize: "6.5px",
                                    cursor: "pointer",
                                    padding: "2px 5px",
                                  }}
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
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
            <div
              style={{
                marginTop: "4px",
                width: "96px",
                padding: "4px",
                boxSizing: "border-box",

                background: "rgba(20, 20, 20, 0.65)",

                backdropFilter: "blur(8px)",
                borderRadius: "6px",

                border: "1px solid rgba(168, 85, 247, 0.3)",

                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",

                pointerEvents: "auto",
              }}
            >
              <div
                style={{
                  fontSize: "6px",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.65)",
                  textAlign: "center",
                  marginBottom: "3px",
                }}
              >
                ROUTE POINTS
              </div>

              {/* A / B status */}
              <div
                style={{
                  display: "flex",
                  gap: "2px",
                  marginBottom: "3px",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "2px 0",
                    borderRadius: "2px",

                    background: routeStartPoint ? "rgba(46, 204, 113, 0.25)" : "rgba(255,255,255,0.06)",

                    color: routeStartPoint ? "#2ecc71" : "rgba(255,255,255,0.4)",

                    fontSize: "6.5px",
                    fontWeight: 700,
                  }}
                >
                  A {routeStartPoint ? "✓" : "—"}
                </div>

                <div
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "2px 0",
                    borderRadius: "2px",

                    background: routeEndPoint ? "rgba(231, 76, 60, 0.25)" : "rgba(255,255,255,0.06)",

                    color: routeEndPoint ? "#e74c3c" : "rgba(255,255,255,0.4)",

                    fontSize: "6.5px",
                    fontWeight: 700,
                  }}
                >
                  B {routeEndPoint ? "✓" : "—"}
                </div>
              </div>

              {/* Remove preserved A/B points */}
              <button
                onClick={onResetRoutePoints}
                title="Remove A and B route points"
                style={{
                  width: "100%",
                  borderRadius: "3px",

                  border: "1px solid rgba(231, 76, 60, 0.4)",

                  background: "rgba(231, 76, 60, 0.15)",

                  color: "#fff",

                  fontSize: "6.5px",
                  fontWeight: 600,

                  padding: "3px 0",

                  cursor: "pointer",
                }}
              >
                ✕ Clear A / B
              </button>
            </div>
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
