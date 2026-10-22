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
