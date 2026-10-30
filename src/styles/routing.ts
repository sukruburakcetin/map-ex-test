/** Route controls and result presentation; services, route scoring and waypoint state remain runtime-owned. */
import type { React } from 'jimu-core';
import type { InfoBoxProps } from '../components/types';
export const routeControlsStyle: React.CSSProperties = { marginTop: "4px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "4px" };
export const routeChoiceRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "3px",
    background: "rgba(0,0,0,0.3)",
    borderRadius: "2px",
    padding: "2px 3px",
    marginBottom: "3px",
};
export const routeChoiceLabelStyle: React.CSSProperties = {
    fontSize: "6px",
    color: "rgba(255,255,255,0.7)",
};
export const routeOptionStyle: React.CSSProperties = { color: "#000" };
export const routeModeGroupStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
};
export const routeDraftStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "3px" };
export const routePointButtonsStyle: React.CSSProperties = { display: "flex", gap: "2px" };
export const routeClearPointsStyle: React.CSSProperties = {
    width: "100%",
    padding: "2px 0",
    fontSize: "6px",
    fontWeight: 600,
    borderRadius: "2px",
    border: "1px solid rgba(231, 76, 60, 0.35)",
    background: "rgba(231, 76, 60, 0.12)",
    color: "rgba(255,255,255,0.8)",
    cursor: "pointer",
};
export const routeBudgetStyle: React.CSSProperties = { display: "flex", alignItems: "center", flexDirection: "column", gap: "1px", background: "rgba(0,0,0,0.3)", borderRadius: "3px", padding: "2px 3px" };
export const routeBudgetLabelStyle: React.CSSProperties = { fontSize: "6px", color: "rgba(255,255,255,0.7)", whiteSpace: "nowrap" };
export const routeGenerateLabelStyle: React.CSSProperties = { position: "relative", zIndex: 1 };
export const routeResultStyle: React.CSSProperties = {
    background: "rgba(168, 85, 247, 0.15)",
    borderRadius: "4px",
    padding: "5px",
    border: "1px solid rgba(168, 85, 247, 0.3)",
};
export const routeResultHeaderStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "6.5px",
    color: "#a855f7",
    fontWeight: 700,
    marginBottom: "3px",
};
export const routeResultDurationStyle: React.CSSProperties = {
    color: "#fff",
};
export const routeResultDistanceStyle: React.CSSProperties = {
    fontSize: "8px",
    fontWeight: 800,
    color: "#fff",
    textAlign: "center",
    marginBottom: "4px",
};
export const routeUsefulCoverageStyle: React.CSSProperties = {
    background: "rgba(168, 85, 247, 0.22)",
    borderRadius: "3px",
    padding: "4px 3px",
    textAlign: "center",
    marginBottom: "3px",
};
export const routeMetricLabelStyle: React.CSSProperties = {
    fontSize: "6px",
    color: "rgba(255,255,255,0.7)",
    fontWeight: 600,
};
export const routeUsefulDistanceStyle: React.CSSProperties = {
    fontSize: "9px",
    color: "#fff",
    fontWeight: 800,
};
export const routeRealizationStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "6.5px",
    marginBottom: "2px",
};
export const routeMutedLabelStyle: React.CSSProperties = {
    color: "rgba(255,255,255,0.7)",
};
export const routeMetricValueStyle: React.CSSProperties = {
    color: "#fff",
    fontWeight: 700,
};
export const routeBreakdownStyle: React.CSSProperties = {
    display: "flex",
    gap: "3px",
    marginTop: "3px",
};
export const routeMissingStyle: React.CSSProperties = {
    flex: 1,
    background: "rgba(231, 76, 60, 0.16)",
    borderRadius: "3px",
    padding: "3px",
    textAlign: "center",
};
export const routeMissingLabelStyle: React.CSSProperties = {
    fontSize: "5.5px",
    color: "#ff7675",
    fontWeight: 700,
};
export const routeBreakdownValueStyle: React.CSSProperties = {
    fontSize: "7px",
    color: "#fff",
    fontWeight: 700,
};
export const routeStaleStyle: React.CSSProperties = {
    flex: 1,
    background: "rgba(243, 156, 18, 0.16)",
    borderRadius: "3px",
    padding: "3px",
    textAlign: "center",
};
export const routeStaleLabelStyle: React.CSSProperties = {
    fontSize: "5.5px",
    color: "#f39c12",
    fontWeight: 700,
};
export const routeExtraTimeStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "4px",
    paddingTop: "3px",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    fontSize: "6.5px",
};
export const routeExtraTimeLabelStyle: React.CSSProperties = {
    color: "rgba(255,255,255,0.65)",
};
export const routeResultActionsStyle: React.CSSProperties = {
    display: "flex",
    gap: "3px",
    marginTop: "4px",
};
export const routeGpxStyle: React.CSSProperties = {
    flex: 1,
    background: "#a855f7",
    color: "white",
    border: "none",
    borderRadius: "2px",
    fontSize: "6.5px",
    fontWeight: "bold",
    cursor: "pointer",
    padding: "2px 0",
};
export const routeResetStyle: React.CSSProperties = {
    background: "rgba(231, 76, 60, 0.4)",
    color: "white",
    border: "none",
    borderRadius: "2px",
    fontSize: "6.5px",
    cursor: "pointer",
    padding: "2px 5px",
};
export function getRouteEngineSelectStyle(isGeneratingRoute: boolean | undefined): React.CSSProperties {
    return {
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
    };
}
export function getRouteModeSelectStyle(isGeneratingRoute: boolean | undefined): React.CSSProperties {
    return {
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
    };
}
export function getRouteStartButtonStyle(routePickMode: InfoBoxProps["routePickMode"], hasPoint: boolean): React.CSSProperties {
    return {
        flex: 1,
        padding: "2px 0",
        fontSize: "6.5px",
        fontWeight: "bold",
        borderRadius: "2px",
        border: "1px solid rgba(46, 204, 113, 0.6)",
        background: routePickMode === "start" ? "rgba(46, 204, 113, 0.8)" : hasPoint ? "rgba(46, 204, 113, 0.3)" : "rgba(255,255,255,0.1)",
        color: "white",
        cursor: "pointer",
    };
}
export function getRouteEndButtonStyle(routePickMode: InfoBoxProps["routePickMode"], hasPoint: boolean): React.CSSProperties {
    return {
        flex: 1,
        padding: "2px 0",
        fontSize: "6.5px",
        fontWeight: "bold",
        borderRadius: "2px",
        border: "1px solid rgba(231, 76, 60, 0.6)",
        background: routePickMode === "end" ? "rgba(231, 76, 60, 0.8)" : hasPoint ? "rgba(231, 76, 60, 0.3)" : "rgba(255,255,255,0.1)",
        color: "white",
        cursor: "pointer",
    };
}
export function getRouteGenerateStyle(isGeneratingRoute: boolean | undefined, hasStart: boolean, hasEnd: boolean): React.CSSProperties {
    return {
        position: "relative",
        width: "100%",
        borderRadius: "3px",
        border: "1px solid rgba(168, 85, 247, 0.5)",
        background: !hasStart || !hasEnd ? "rgba(255,255,255,0.05)" : "rgba(168, 85, 247, 0.3)",
        color: !hasStart || !hasEnd ? "rgba(255,255,255,0.3)" : "white",
        fontSize: "6.5px",
        fontWeight: 700,
        cursor: isGeneratingRoute ? "wait" : !hasStart || !hasEnd ? "not-allowed" : "pointer",
        padding: "3px 0",
        display: "flex",
        justifyContent: "center",
        gap: "3px",
        overflow: "hidden",
    };
}
export function getRouteProgressStyle(routeGenerationProgress: NonNullable<InfoBoxProps["routeGenerationProgress"]>): React.CSSProperties {
    return {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: `${Math.min(100, (routeGenerationProgress.usedMinutes / routeGenerationProgress.budgetMinutes) * 100)}%`,
        background: "rgba(168, 85, 247, 0.55)",
        transition: "width 0.25s ease-out",
        zIndex: 0,
    };
}
export function getRouteExtraTimeValueStyle(extraDurationMinutes: number, requestedExtraMinutes: number): React.CSSProperties {
    return {
        color: extraDurationMinutes > requestedExtraMinutes ? "#ff7675" : "#fff",
        fontWeight: 700,
    };
}

/** Preserved waypoint controls remain usable independently of coverage-analysis results. */
export const routePointsCardStyle: React.CSSProperties = {
    marginTop: "4px",
    width: "100%",
    minWidth: 0,
    maxWidth: "100%",
    padding: "4px",
    boxSizing: "border-box",
    background: "rgba(20, 20, 20, 0.65)",
    backdropFilter: "blur(8px)",
    borderRadius: "6px",
    border: "1px solid rgba(168, 85, 247, 0.3)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    pointerEvents: "auto",
};
export const routePointsHeadingStyle: React.CSSProperties = {
    fontSize: "6px",
    fontWeight: 700,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    marginBottom: "3px",
};
export const routePointsRowStyle: React.CSSProperties = {
    display: "flex",
    gap: "2px",
    marginBottom: "3px",
};
export const routePointsClearStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: "3px",
    border: "1px solid rgba(231, 76, 60, 0.4)",
    background: "rgba(231, 76, 60, 0.15)",
    color: "#fff",
    fontSize: "6.5px",
    fontWeight: 600,
    padding: "3px 0",
    cursor: "pointer",
};
export function getRoutePointAStyle(hasPoint: boolean): React.CSSProperties {
    return {
        flex: 1,
        textAlign: "center",
        padding: "2px 0",
        borderRadius: "2px",
        background: hasPoint ? "rgba(46, 204, 113, 0.25)" : "rgba(255,255,255,0.06)",
        color: hasPoint ? "#2ecc71" : "rgba(255,255,255,0.4)",
        fontSize: "6.5px",
        fontWeight: 700,
    };
}
export function getRoutePointBStyle(hasPoint: boolean): React.CSSProperties {
    return {
        flex: 1,
        textAlign: "center",
        padding: "2px 0",
        borderRadius: "2px",
        background: hasPoint ? "rgba(231, 76, 60, 0.25)" : "rgba(255,255,255,0.06)",
        color: hasPoint ? "#e74c3c" : "rgba(255,255,255,0.4)",
        fontSize: "6.5px",
        fontWeight: 700,
    };
}
