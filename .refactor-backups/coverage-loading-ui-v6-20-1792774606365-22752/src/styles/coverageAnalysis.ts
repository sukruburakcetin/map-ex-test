/** Coverage-analysis trigger presentation; analysis scheduling and result state remain runtime-owned. */
import type { React } from 'jimu-core';
export const coverageAnalysisTriggerRowStyle: React.CSSProperties = {
    marginTop: "5px",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    paddingTop: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
};
export const coverageAnalysisTriggerSpinnerStyle: React.CSSProperties = {
    width: "8px",
    height: "8px",
    border: "1.5px solid rgba(255,255,255,0.2)",
    borderTopColor: "#1e90ff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    flexShrink: 0,
};
export function getCoverageAnalysisTriggerButtonStyle(canRun: boolean, btnBg: string): React.CSSProperties {
    return {
        width: "100%",
        textAlign: "center",
        borderRadius: "4px",
        border: `1px solid ${canRun ? "rgba(30, 144, 255, 0.4)" : "rgba(255,255,255,0.1)"}`,
        background: btnBg,
        color: canRun ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.65)",
        fontSize: "7px",
        fontWeight: 500,
        cursor: canRun ? "pointer" : "not-allowed",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        transition: "background 0.2s, color 0.2s",
        whiteSpace: "nowrap",
        opacity: canRun ? 1 : 0.5,
    };
}
export function getCoverageAnalysisTriggerBackground(canRun: boolean, hasResult: boolean): string { return canRun && hasResult ? "rgba(30, 144, 255, 0.42)" : "rgba(30, 144, 255, 0.17)"; }
export const coverageAnalysisTriggerHoverBackground = "rgba(30, 144, 255, 0.3)";

/** Coverage-analysis progress and results card; routing is composed by the parent. */
export const coverageResultsPanelStyle: React.CSSProperties = {
    marginTop: "3px",
    padding: "0 5px 5px 5px",
    borderRadius: "6px",
    background: "rgba(0, 0, 0, 0.40)",
    border: "1px solid rgba(30, 144, 255, 0.3)",
    backdropFilter: "blur(5px)",
    pointerEvents: "auto",
    width: "96px",
    boxSizing: "border-box",
};
export const coverageResultsHeaderStyle: React.CSSProperties = {
    fontSize: "7.4px",
    fontWeight: 600,
    color: "rgba(255,255,255,0.7)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(255,255,255,0.2)",
    marginBottom: "3px",
    marginTop: "1.5px",
};
export const coverageResultsDismissStyle: React.CSSProperties = { background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "10px", margin: "0", padding: "0" };
export const coverageResultsProgressStyle: React.CSSProperties = { textAlign: "center", fontSize: "8px", color: "#ccc", padding: "1px" };
export const coverageResultsDotsStyle: React.CSSProperties = { display: "inline-block", width: "12px", textAlign: "left" };
export const coverageResultsCancelStyle: React.CSSProperties = { display: "block", margin: "4px auto", fontSize: "10px", padding: "2px 6px", background: "transparent", color: "#ddd", border: "1px solid #68777a", borderRadius: "4px", cursor: "pointer" };
export const coverageResultsTierRowStyle: React.CSSProperties = { marginBottom: "3px" };
export const coverageResultsTierLineStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "7px" };
export const coverageResultsTierLabelGroupStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: "3px" };
export const coverageResultsTierLabelStyle: React.CSSProperties = { color: "rgba(255,255,255,0.9)", fontWeight: 500 };
export const coverageResultsTierAgeStyle: React.CSSProperties = { color: "rgba(255,255,255,0.5)" };
export const coverageResultsTierPercentStyle: React.CSSProperties = { fontWeight: 700, color: "#fff" };
export const coverageResultsTierDistanceStyle: React.CSSProperties = { textAlign: "right", fontSize: "6.5px", color: "rgba(255,255,255,0.5)", marginTop: "1px" };
export const coverageResultsBarStyle: React.CSSProperties = {
    height: "4px",
    borderRadius: "2px",
    background: "rgba(255,255,255,0.1)",
    display: "flex",
    overflow: "hidden",
    marginBottom: "5px",
};
export const coverageResultsTotalsStyle: React.CSSProperties = { textAlign: "center", marginBottom: "5px" };
export const coverageResultsCoveredStyle: React.CSSProperties = { fontWeight: 800, fontSize: "9px", color: "#fff" };
export const coverageResultsSegmentsStyle: React.CSSProperties = { fontSize: "6.5px", color: "rgba(255,255,255,0.5)" };
export function getCoverageResultsTierDotStyle(color: string): React.CSSProperties { return { width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0 }; }
export function getCoverageResultsBarPartStyle(percent: number, color: string): React.CSSProperties { return { width: `${percent}%`, background: color }; }
export function getCoverageResultsMapToggleStyle(coverageSegmentsVisible: boolean | undefined): React.CSSProperties {
    return {
        width: "100%",
        marginTop: "3px",
        borderRadius: "3px",
        border: "1px solid rgba(255,255,255,0.15)",
        background: coverageSegmentsVisible ? "rgba(30, 144, 255, 0.4)" : "rgba(255,255,255,0.1)",
        color: "white",
        fontSize: "7px",
        fontWeight: 600,
        cursor: "pointer",
        padding: "3px 0",
    };
}
