/** Point-cloud display-control styles. Existing legacy styles remain in their original module. */
import type { React } from 'jimu-core';

/** Point-cloud diagnostics and adaptive-display controls; acquisition/follow behavior remains runtime-owned. */
export function getCloudAdaptiveButtonStyle(pointCloudAdaptive: boolean | undefined): React.CSSProperties { return { pointerEvents: "auto", marginTop: 4, width: 96, minHeight: 26, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4, padding: "5px 6px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.15)", background: pointCloudAdaptive ? "rgba(26,109,66,0.85)" : "rgba(35,35,35,0.75)", color: "rgba(255,255,255,0.85)", cursor: "pointer", fontSize: 8, fontWeight: 600 }; }
export function getCloudAdaptiveTrackStyle(pointCloudAdaptive: boolean | undefined): React.CSSProperties { return { width: 17, height: 9, flexShrink: 0, borderRadius: 6, background: pointCloudAdaptive ? "#37d582" : "#727272", padding: 1, boxSizing: "border-box" }; }
export function getCloudAdaptiveThumbStyle(pointCloudAdaptive: boolean | undefined): React.CSSProperties { return { display: "block", width: 7, height: 7, borderRadius: "50%", background: "white", transform: pointCloudAdaptive ? "translateX(8px)" : "translateX(0)", transition: "transform 120ms ease" }; }
export function getCloudStatusCardStyle(pointCloudIncomplete: boolean | undefined): React.CSSProperties { return { pointerEvents: "auto", width: 96, boxSizing: "border-box", marginTop: 4, padding: "5px 6px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(20,20,20,0.8)", color: pointCloudIncomplete ? "#ffcc86" : "#a7d5be", fontSize: 8, lineHeight: 1.4 }; }
export const cloudPreviousBadgeStyle: React.CSSProperties = { marginBottom: 4, fontWeight: 600, color: "#ffcc86" };
export const cloudStatusSummaryStyle: React.CSSProperties = { cursor: "pointer", fontWeight: 600 };
export const cloudStatusDetailsStyle: React.CSSProperties = { marginTop: 4, overflowWrap: "anywhere" };
export const cloudStatusVisibleStyle: React.CSSProperties = { marginTop: 3 };
export function getCloudStatusRetryStyle(pointCloudLoading: boolean | undefined): React.CSSProperties { return { width: "100%", minHeight: 20, marginTop: 4, fontSize: 8, fontWeight: 600, padding: "3px 5px", background: "#214532", border: "1px solid #638974", borderRadius: 4, color: "#d3eadb", cursor: pointCloudLoading ? "wait" : "pointer", opacity: pointCloudLoading ? 0.6 : 1 }; }

/** Corridor presentation. FULL is a sentinel beyond the numeric slider range. */
export const cloudCorridorButtonStyle: React.CSSProperties = {
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
export const cloudCorridorDividerStyle: React.CSSProperties = { borderTop: "1px solid rgba(255,255,255,0.12)", margin: "6px 0 5px" };
export const cloudCorridorPanelStyle: React.CSSProperties = {
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
};
export const cloudCorridorHeadingStyle: React.CSSProperties = { fontSize: "7px", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "4px", textAlign: "center" };
export const cloudCorridorAxisStyle: React.CSSProperties = { fontWeight: 400, opacity: 0.55, fontSize: "6px" };
export const cloudCorridorStepRowStyle: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px", gap: "3px" };
export function cloudCorridorLengthValueStyle(isLengthFull: boolean): React.CSSProperties { return { fontSize: "8px", fontWeight: "bold", color: isLengthFull ? "#37d582" : "#00FFFF", textAlign: "center", flex: 1 }; }
export function cloudCorridorLengthIncreaseStyle(isLengthFull: boolean, btnBase: React.CSSProperties): React.CSSProperties { return { ...btnBase, opacity: isLengthFull ? 0.35 : 1, cursor: isLengthFull ? "default" : "pointer" }; }
export const cloudCorridorSliderTrackStyle: React.CSSProperties = { position: "relative", width: "100%" };
export function cloudCorridorLengthMarkerStyle(pointCloudMaxLength: number, lengthSliderMax: number): React.CSSProperties {
    return {
        position: "absolute",
        left: `${((pointCloudMaxLength - 10) / (lengthSliderMax - 10)) * 100}%`,
        width: "1px",
        height: "8px",
        background: "rgba(255,255,255,0.4)",
        pointerEvents: "none",
        transform: "translateX(-50%)",
    };
}
export const cloudCorridorSliderStyle: React.CSSProperties = { width: "100%", background: "transparent", cursor: "pointer", height: "3px", appearance: "none" };
export const cloudCorridorScaleStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", marginTop: "3px", fontSize: "6.5px", color: "rgba(255,255,255,0.5)" };
export const cloudCorridorScaleMaximumStyle: React.CSSProperties = { color: "rgba(255,255,255,0.35)" };
export function cloudCorridorWidthDecreaseStyle(widthValue: number, minWidth: number, btnBase: React.CSSProperties): React.CSSProperties { return { ...btnBase, opacity: widthValue <= minWidth ? 0.35 : 1, cursor: widthValue <= minWidth ? "default" : "pointer" }; }
export function cloudCorridorWidthValueStyle(isWidthFull: boolean): React.CSSProperties { return { fontSize: "8px", fontWeight: "bold", color: isWidthFull ? "#37d582" : "#FFD700", textAlign: "center", flex: 1 }; }
export function cloudCorridorWidthIncreaseStyle(isWidthFull: boolean, btnBase: React.CSSProperties): React.CSSProperties { return { ...btnBase, opacity: isWidthFull ? 0.35 : 1, cursor: isWidthFull ? "default" : "pointer" }; }
export function cloudCorridorWidthMarkerStyle(minWidth: number, maxWidth: number, widthSliderMax: number): React.CSSProperties {
    return {
        position: "absolute",
        left: `${((maxWidth - minWidth) / (widthSliderMax - minWidth)) * 100}%`,
        width: "1px",
        height: "8px",
        background: "rgba(255,255,255,0.4)",
        pointerEvents: "none",
        transform: "translateX(-50%)",
    };
}

