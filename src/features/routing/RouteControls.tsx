/** @jsx jsx */
/** @jsxFrag React.Fragment */
import { RoutePreviewControls } from './RoutePreviewControls';
/** Routing controls and extra-time picker UI. Route services, analysis and waypoint state remain parent-owned. */
import { OwnedMessage } from '../../i18n/WidgetLocale';
import { useWidgetLocale, WidgetLocaleContext } from '../../i18n/WidgetLocale';
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
 static contextType = WidgetLocaleContext;
 declare context: React.ContextType<typeof WidgetLocaleContext>;

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
      <button type="button" aria-label={this.context.t('uiDecreaseExtraTimeBy5Minutes')} disabled={disabled || value <= 5} onClick={() => onChange?.(Math.max(5, value - 5))} style={{ ...stepStyle, opacity: disabled || value <= 5 ? 0.4 : 1 }}>−</button>
      <button className="mly-text-action" type="button" ref={this.trigger} aria-haspopup="dialog" aria-expanded={this.state.open && !disabled} aria-label={this.context.t('uiExtraPreset',{minutes:value})} title={this.context.t('uiAddedTravelTimeBeyondTheDirectAB')} disabled={disabled}
        onClick={() => this.setState({ open: !this.state.open }, () => { if (this.state.open) (this.menu.current?.querySelector<HTMLButtonElement>("button[aria-pressed='true']") || this.menu.current?.querySelector<HTMLButtonElement>("button[data-preset]"))?.focus(); })}
        style={{ background: "rgba(243,156,18,0.09)", border: "1px solid rgba(243,156,18,0.3)", borderRadius: "3px", color: "#f39c12", fontSize: "6.5px", fontWeight: 700, whiteSpace: "nowrap", padding: "2px 3px", cursor: disabled ? "default" : "pointer" }}>{value}  {this.context.t('uiMin')} </button>
      <button type="button" aria-label={this.context.t('uiIncreaseExtraTimeBy5Minutes')} disabled={disabled || value >= 120} onClick={() => onChange?.(Math.min(120, value + 5))} style={{ ...stepStyle, opacity: disabled || value >= 120 ? 0.4 : 1 }}>+</button>
      {this.state.open && !disabled && ReactDOM.createPortal(
        <div ref={this.menu} role="dialog" aria-label={this.context.t('uiChooseExtraRouteTime')} style={{ ...this.position(), background: "#142126", color: "#fff", border: "1px solid rgba(243,156,18,0.3)", borderRadius: "8px", padding: "8px", boxShadow: "0 6px 24px rgba(0,0,0,0.45)", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "11px", fontWeight: 600 }}> {this.context.t('uiExtraTime')} {value}  {this.context.t('uiMin')} </span>
            <button type="button" aria-label={this.context.t('uiCloseExtraTimePresets')} onClick={() => this.close(true)} style={{ background: "none", border: "none", color: "#bac7cb", width: "28px", height: "28px", cursor: "pointer", fontSize: "18px" }}>×</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "4px" }}>
            {[15, 30, 45, 60, 90, 120].map(minutes => <button className="mly-text-action" key={minutes} type="button" data-preset aria-pressed={value === minutes} disabled={disabled} onClick={() => { onChange?.(minutes); this.close(true); }}
              style={{ minHeight: "44px", padding: "4px", borderRadius: "5px", border: `1px solid ${value === minutes ? "#f39c12" : "rgba(255,255,255,0.14)"}`, background: value === minutes ? "rgba(243,156,18,0.16)" : "rgba(255,255,255,0.04)", color: value === minutes ? "#f6bc58" : "#e3eaed", fontSize: "12px", fontWeight: value === minutes ? 700 : 500, cursor: "pointer" }}>{minutes}  {this.context.t('uiMin')} </button>)}
          </div>
        </div>, document.fullscreenElement || document.body)}
    </div>;
  }
}


export type RouteControlsProps = Pick<InfoBoxProps, 'routePreviewHost' | 'runtimeRoutingEngine' | 'isGeneratingRoute' | 'onChangeRuntimeRoutingEngine' | 'runtimeTravelMode' | 'onChangeRuntimeTravelMode' | 'travelModeAvailability' | 'routeData' | 'routePickMode' | 'onSetRoutePickMode' | 'routeStartPoint' | 'routeEndPoint' | 'onResetRoutePoints' | 'routeSpareMinutes' | 'onChangeSpareMinutes' | 'onGenerateRoute' | 'routeGenerationProgress' | 'onDownloadRouteGPX'>;

/** Render route drafting/progress/results and forward original callbacks; no requests or route calculation occur here. */
export const RouteControls: React.FC<RouteControlsProps> = props => {
 const { t, locale , owned} = useWidgetLocale();

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
             {t('uiEngine')} </span>

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
               {t('uiEsriWorld')} </option>

            <option value="osrm" style={routeOptionStyle}>
               {t('uiOsrm')} </option>
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
             {t('uiMode')} </span>

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
                 {t('uiDrive')} </option>

              <option value="walk" disabled={travelModeAvailability ? !travelModeAvailability.walk : false} style={routeOptionStyle}>
                {travelModeAvailability && !travelModeAvailability.walk ? t('uiWalkEsriOnly') : t('uiWalk')}
              </option>

              <option value="bike" disabled={travelModeAvailability ? !travelModeAvailability.bike : false} style={routeOptionStyle}>
                {travelModeAvailability && !travelModeAvailability.bike ? t('uiBikeUnavailable') : t('uiBike')}
              </option>
            </select>
          </div>
        </div>
      )}
      {!routeData ? (
        <div style={routeDraftStyle}>
          {/* Point A and B Selection Buttons */}
          <div className="mly-route-pick-buttons" style={routePointButtonsStyle}>
            <button className="mly-text-action"
              onClick={() => onSetRoutePickMode?.(routePickMode === "start" ? null : "start")}
              title={t('uiSelectStartPointAOnMap')}
              style={getRouteStartButtonStyle(routePickMode, !!routeStartPoint)}
            >
              {routePickMode === "start" ? t('uiClick') : routeStartPoint ? t('uiA') : t('uiAPick')}
            </button>

            <button className="mly-text-action"
              onClick={() => onSetRoutePickMode?.(routePickMode === "end" ? null : "end")}
              title={t('uiSelectDestinationPointBOnMap')}
              style={getRouteEndButtonStyle(routePickMode, !!routeEndPoint)}
            >
              {routePickMode === "end" ? t('uiClick') : routeEndPoint ? t('uiB') : t('uiBPick')}
            </button>
          </div>

          {/* CLEAR A / B */}
          {(routeStartPoint || routeEndPoint) && (
            <button className="mly-text-action"
              onClick={onResetRoutePoints}
              title={t('uiClearAAndBRoutePoints')}
              style={routeClearPointsStyle}
            >
               {t('uiClearAB')} </button>
          )}

          {/* Extra time beyond the direct A to B route */}
          <div title={t('uiAddedTravelTimeBeyondTheDirectAB')} style={routeBudgetStyle}>
            <span style={routeBudgetLabelStyle} title={t('uiExtraTime2')}> {t('uiEt')} </span>
            <ExtraTimePicker value={routeSpareMinutes ?? 15} disabled={!!isGeneratingRoute} onChange={onChangeSpareMinutes} />
          </div>

          {/* Generate Route Button with Progress Bar */}
          <button className="mly-text-action"
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
                  ? <OwnedMessage source={"Routing... {value0}%"} values={{value0:String(Math.round((routeGenerationProgress.usedMinutes / routeGenerationProgress.budgetMinutes) * 100))}}/>
                  : t('uiRouting')
                : t('uiGenerateRoute')}
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
            <span> {t('uiABCapture')} </span>

            <span
              style={routeResultDurationStyle}
            >
              {Math.round(routeData.duration / 60)}  {t('uiMin')} </span>
          </div>

          {/*
           * --------------------------------------------------------
           * ROUTE DISTANCE
           * --------------------------------------------------------
           */}
          <div
            style={routeResultDistanceStyle}
          >
            {(routeData.distance / 1000).toFixed(1)}  {t('uiKm')} </div>

          {/*
           * --------------------------------------------------------
           * HEADLINE: USEFUL NEW COVERAGE
           * --------------------------------------------------------
           */}
          {routeData.usefulCoverageMeters != null && (
            <div
              title={owned("Selected missing/stale road traversed by") + owned("the final route that was not already covered") + owned("by the normal A → B baseline.")}
              style={routeUsefulCoverageStyle}
            >
              <div
                style={routeMetricLabelStyle}
              >
                 {t('uiUsefulNewCoverage')} </div>

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
                 {t('uiTargetRealization')} </span>

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
                title={t('uiNewUsefulCoverageOnRoadsWithNoCurrent')}
                style={routeMissingStyle}
              >
                <div
                  style={routeMissingLabelStyle}
                >
                   {t('uiMissing')} </div>

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
                title={t('uiNewUsefulCoverageOnStaleMapillaryRoadCoverage')}
                style={routeStaleStyle}
              >
                <div
                  style={routeStaleLabelStyle}
                >
                   {t('uiStale')} </div>

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
                 {t('uiExtraTime3')} </span>

              <span
                style={getRouteExtraTimeValueStyle(routeData.extraDurationMinutes, routeData.requestedExtraMinutes)}
              >
                {routeData.extraDurationMinutes.toFixed(0)}
                {" / "}
                {routeData.requestedExtraMinutes.toFixed(0)}
                {<OwnedMessage source={"min"}/>}
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
            <button className="mly-text-action"
              onClick={onDownloadRouteGPX}
              style={routeGpxStyle}
            >
               {t('uiGpx')} </button>

            <button
              onClick={onResetRoutePoints}
              title={owned("Clear route and A/B waypoints")}
              style={routeResetStyle}
            >
              ✕
            </button>
          </div>
          <RoutePreviewControls route={routeData} host={props.routePreviewHost}/>
        </div>
      )}
    </div>
  );
};


export type RoutePointControlsProps = Pick<InfoBoxProps, 'routeStartPoint' | 'routeEndPoint' | 'onResetRoutePoints'>;

/** Display preserved A/B points and forward reset; InfoBox owns visibility after results clear or map switches. */
export const RoutePointControls: React.FC<RoutePointControlsProps> = props => {
 const { t, locale , owned} = useWidgetLocale();

  const { routeStartPoint, routeEndPoint, onResetRoutePoints } = props;
  return (
    <div
      className="mly-route-points"
      style={routePointsCardStyle}
    >
      <div
        style={routePointsHeadingStyle}
      >
         {t('uiRoutePoints')} </div>

      {/* A / B status */}
      <div
        style={routePointsRowStyle}
      >
        <div
          style={getRoutePointAStyle(!!routeStartPoint)}
        >
           {t('uiA2')} {routeStartPoint ? "✓" : "—"}
        </div>

        <div
          style={getRoutePointBStyle(!!routeEndPoint)}
        >
           {t('uiB2')} {routeEndPoint ? "✓" : "—"}
        </div>
      </div>

      {/* Remove preserved A/B points */}
      <button className="mly-text-action"
        onClick={onResetRoutePoints}
        title={t('uiRemoveAAndBRoutePoints')}
        style={routePointsClearStyle}
      >
         {t('uiClearAB')} </button>
    </div>
  );
};
