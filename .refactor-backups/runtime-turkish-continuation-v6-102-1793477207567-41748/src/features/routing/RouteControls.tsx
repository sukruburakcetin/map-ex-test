/** @jsx jsx */
/** @jsxFrag React.Fragment */
/** Routing controls and extra-time picker UI. Route services, analysis and waypoint state remain parent-owned. */
import { React, jsx } from 'jimu-core';
import ReactDOM from 'react-dom';
import type { InfoBoxProps } from '../../components/types';
import { routeControlsStyle, routeChoiceRowStyle, routeChoiceLabelStyle, getRouteEngineSelectStyle, routeOptionStyle, routeModeGroupStyle, getRouteModeSelectStyle, routeDraftStyle, routePointButtonsStyle, getRouteStartButtonStyle, getRouteEndButtonStyle, routeClearPointsStyle, routeBudgetStyle, routeBudgetLabelStyle, getRouteGenerateStyle, getRouteProgressStyle, routeGenerateLabelStyle, routeResultStyle, routeResultHeaderStyle, routeResultDurationStyle, routeResultDistanceStyle, routeUsefulCoverageStyle, routeMetricLabelStyle, routeUsefulDistanceStyle, routeRealizationStyle, routeMutedLabelStyle, routeMetricValueStyle, routeBreakdownStyle, routeMissingStyle, routeMissingLabelStyle, routeBreakdownValueStyle, routeStaleStyle, routeStaleLabelStyle, routeExtraTimeStyle, routeExtraTimeLabelStyle, getRouteExtraTimeValueStyle, routeResultActionsStyle, routeGpxStyle, routeResetStyle, routePointsCardStyle, routePointsHeadingStyle, routePointsRowStyle, getRoutePointAStyle, getRoutePointBStyle, routePointsClearStyle } from '../../styles/routing';

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
  /**
   * Position the floating tool menu from its trigger bounds while keeping it inside the viewport.
   */
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


export type RouteControlsProps = Pick<InfoBoxProps, 'runtimeRoutingEngine' | 'isGeneratingRoute' | 'onChangeRuntimeRoutingEngine' | 'runtimeTravelMode' | 'onChangeRuntimeTravelMode' | 'travelModeAvailability' | 'routeData' | 'routePickMode' | 'onSetRoutePickMode' | 'routeStartPoint' | 'routeEndPoint' | 'onResetRoutePoints' | 'routeSpareMinutes' | 'onChangeSpareMinutes' | 'onGenerateRoute' | 'routeGenerationProgress' | 'onDownloadRouteGPX'>;

/** Render route drafting/progress/results and forward original callbacks; no requests or route calculation occur here. */
export const RouteControls: React.FC<RouteControlsProps> = props => {
  const { runtimeRoutingEngine, isGeneratingRoute, onChangeRuntimeRoutingEngine, runtimeTravelMode, onChangeRuntimeTravelMode, travelModeAvailability, routeData, routePickMode, onSetRoutePickMode, routeStartPoint, routeEndPoint, onResetRoutePoints, routeSpareMinutes, onChangeSpareMinutes, onGenerateRoute, routeGenerationProgress, onDownloadRouteGPX } = props;
  return (
    <div className="mly-route-controls" style={routeControlsStyle}>
      {/* Runtime Routing Engine */}
      {runtimeRoutingEngine && (
        <div
          className="mly-route-choice" style={routeChoiceRowStyle}
        >
          <span
            style={routeChoiceLabelStyle}
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
            style={getRouteEngineSelectStyle(isGeneratingRoute)}
          >
            <option value="world" style={routeOptionStyle}>
              Esri World
            </option>

            <option value="osrm" style={routeOptionStyle}>
              OSRM
            </option>
          </select>
        </div>
      )}
      {/* Runtime Travel Mode */}
      {runtimeTravelMode && (
        <div
          className="mly-route-choice" style={routeChoiceRowStyle}
        >
          <span
            style={routeChoiceLabelStyle}
          >
            Mode:
          </span>

          <div
            style={routeModeGroupStyle}
          >
            <select
              value={runtimeTravelMode}
              disabled={isGeneratingRoute}
              onChange={(e) => {
                const mode = e.target.value as "drive" | "walk" | "bike";

                onChangeRuntimeTravelMode?.(mode);
              }}
              style={getRouteModeSelectStyle(isGeneratingRoute)}
            >
              <option value="drive" disabled={travelModeAvailability ? !travelModeAvailability.drive : false} style={routeOptionStyle}>
                🚗 Drive
              </option>

              <option value="walk" disabled={travelModeAvailability ? !travelModeAvailability.walk : false} style={routeOptionStyle}>
                {travelModeAvailability && !travelModeAvailability.walk ? "🚶 Walk - Esri only" : "🚶 Walk"}
              </option>

              <option value="bike" disabled={travelModeAvailability ? !travelModeAvailability.bike : false} style={routeOptionStyle}>
                {travelModeAvailability && !travelModeAvailability.bike ? "🚲 Bike - unavailable" : "🚲 Bike"}
              </option>
            </select>
          </div>
        </div>
      )}
      {!routeData ? (
        <div style={routeDraftStyle}>
          {/* Point A and B Selection Buttons */}
          <div className="mly-route-pick-buttons" style={routePointButtonsStyle}>
            <button
              onClick={() => onSetRoutePickMode?.(routePickMode === "start" ? null : "start")}
              title="Select Start Point (A) on map"
              style={getRouteStartButtonStyle(routePickMode, !!routeStartPoint)}
            >
              {routePickMode === "start" ? "Click..." : routeStartPoint ? "A: ✓" : "A: Pick"}
            </button>

            <button
              onClick={() => onSetRoutePickMode?.(routePickMode === "end" ? null : "end")}
              title="Select Destination Point (B) on map"
              style={getRouteEndButtonStyle(routePickMode, !!routeEndPoint)}
            >
              {routePickMode === "end" ? "Click..." : routeEndPoint ? "B: ✓" : "B: Pick"}
            </button>
          </div>

          {/* CLEAR A / B */}
          {(routeStartPoint || routeEndPoint) && (
            <button
              onClick={onResetRoutePoints}
              title="Clear A and B route points"
              style={routeClearPointsStyle}
            >
              ✕ Clear A / B
            </button>
          )}

          {/* Extra time beyond the direct A to B route */}
          <div title="Added travel time beyond the direct A → B route" style={routeBudgetStyle}>
            <span style={routeBudgetLabelStyle} title="Extra Time">ET</span>
            <ExtraTimePicker value={routeSpareMinutes ?? 15} disabled={!!isGeneratingRoute} onChange={onChangeSpareMinutes} />
          </div>

          {/* Generate Route Button with Progress Bar */}
          <button
            onClick={onGenerateRoute}
            disabled={isGeneratingRoute || !routeStartPoint || !routeEndPoint}
            style={getRouteGenerateStyle(isGeneratingRoute, !!routeStartPoint, !!routeEndPoint)}
          >
            {isGeneratingRoute && routeGenerationProgress && (
              <div
                style={getRouteProgressStyle(routeGenerationProgress)}
              />
            )}
            <span style={routeGenerateLabelStyle}>
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
          style={routeResultStyle}
        >
          {/*
           * --------------------------------------------------------
           * HEADER
           * --------------------------------------------------------
           */}
          <div
            className="mly-route-metric-row" style={routeResultHeaderStyle}
          >
            <span>A ➔ B CAPTURE</span>

            <span
              style={routeResultDurationStyle}
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
            style={routeResultDistanceStyle}
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
              style={routeUsefulCoverageStyle}
            >
              <div
                style={routeMetricLabelStyle}
              >
                USEFUL NEW COVERAGE
              </div>

              <div
                style={routeUsefulDistanceStyle}
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
              className="mly-route-metric-row" style={routeRealizationStyle}
            >
              <span
                style={routeMutedLabelStyle}
              >
                Target realization
              </span>

              <span
                style={routeMetricValueStyle}
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
            style={routeBreakdownStyle}
          >
            {routeData.incrementalNoneMeters != null && (
              <div
                title="New useful coverage on roads with no current Mapillary coverage."
                style={routeMissingStyle}
              >
                <div
                  style={routeMissingLabelStyle}
                >
                  MISSING
                </div>

                <div
                  style={routeBreakdownValueStyle}
                >
                  {(routeData.incrementalNoneMeters / 1000).toFixed(2)}
                  {" km"}
                </div>
              </div>
            )}

            {routeData.incrementalStaleMeters != null && (
              <div
                title="New useful coverage on stale Mapillary road coverage."
                style={routeStaleStyle}
              >
                <div
                  style={routeStaleLabelStyle}
                >
                  STALE
                </div>

                <div
                  style={routeBreakdownValueStyle}
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
              className="mly-route-metric-row" style={routeExtraTimeStyle}
            >
              <span
                style={routeExtraTimeLabelStyle}
              >
                Extra time
              </span>

              <span
                style={getRouteExtraTimeValueStyle(routeData.extraDurationMinutes, routeData.requestedExtraMinutes)}
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
            className="mly-route-result-actions" style={routeResultActionsStyle}
          >
            <button
              onClick={onDownloadRouteGPX}
              style={routeGpxStyle}
            >
              ⬇️ GPX
            </button>

            <button
              onClick={onResetRoutePoints}
              title={"Clear route and A/B waypoints"}
              style={routeResetStyle}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


export type RoutePointControlsProps = Pick<InfoBoxProps, 'routeStartPoint' | 'routeEndPoint' | 'onResetRoutePoints'>;

/** Display preserved A/B points and forward reset; InfoBox owns visibility after results clear or map switches. */
export const RoutePointControls: React.FC<RoutePointControlsProps> = props => {
  const { routeStartPoint, routeEndPoint, onResetRoutePoints } = props;
  return (
    <div
      className="mly-route-points"
      style={routePointsCardStyle}
    >
      <div
        style={routePointsHeadingStyle}
      >
        ROUTE POINTS
      </div>

      {/* A / B status */}
      <div
        style={routePointsRowStyle}
      >
        <div
          style={getRoutePointAStyle(!!routeStartPoint)}
        >
          A {routeStartPoint ? "✓" : "—"}
        </div>

        <div
          style={getRoutePointBStyle(!!routeEndPoint)}
        >
          B {routeEndPoint ? "✓" : "—"}
        </div>
      </div>

      {/* Remove preserved A/B points */}
      <button
        onClick={onResetRoutePoints}
        title="Remove A and B route points"
        style={routePointsClearStyle}
      >
        ✕ Clear A / B
      </button>
    </div>
  );
};
