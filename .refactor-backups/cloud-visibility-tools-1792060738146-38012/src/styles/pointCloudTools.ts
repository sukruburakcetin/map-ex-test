import type { React } from 'jimu-core';
/** Point-cloud tool presentation. Runtime owns picking, measurement and selection resources. */
export function cloudMeasurePanelStyle(isMeasureMode: boolean | undefined): React.CSSProperties {
    return {
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
    };
}
export const cloudToolToggleStyle: React.CSSProperties = { gap: "4px", minHeight: 16,
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
};
export function cloudMeasureHeadingStyle(isMeasureMode: boolean | undefined): React.CSSProperties { return { display: "inline-flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap", fontSize: "7px", fontWeight: 600, color: isMeasureMode ? "#1e90ff" : "rgba(255,255,255,0.7)" }; }
export const cloudToolIconStyle: React.CSSProperties = { flexShrink: 0, marginRight: 0, verticalAlign: "bottom" };
export function cloudMeasureTrackStyle(isMeasureMode: boolean | undefined): React.CSSProperties {
    return { flexShrink: 0,
        width: "16px",
        height: "8px",
        borderRadius: "4px",
        background: isMeasureMode ? "#1e90ff" : "rgba(255,255,255,0.3)",
        position: "relative",
    };
}
export function cloudMeasureThumbStyle(isMeasureMode: boolean | undefined): React.CSSProperties {
    return {
        position: "absolute",
        top: "1px",
        left: isMeasureMode ? "9px" : "1px",
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background: "white",
        transition: "left 0.2s",
    };
}
export const cloudToolHelpStyle: React.CSSProperties = { marginTop: "4px", fontSize: "7.5px", color: "#ccc", textAlign: "left" };
export const cloudMeasureReadyStyle: React.CSSProperties = { color: "#37d582", fontWeight: "bold" };
export const cloudToolClearStyle: React.CSSProperties = {
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
};
export function cloudLassoPanelStyle(isLassoMode: boolean | undefined): React.CSSProperties {
    return {
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
    };
}
export function cloudLassoHeadingStyle(isLassoMode: boolean | undefined): React.CSSProperties { return { display: "inline-flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap", fontSize: "7px", fontWeight: 600, color: isLassoMode ? "#00ffff" : "rgba(255,255,255,0.7)" }; }
export function cloudLassoTrackStyle(isLassoMode: boolean | undefined): React.CSSProperties {
    return { flexShrink: 0,
        width: "16px",
        height: "8px",
        borderRadius: "4px",
        background: isLassoMode ? "#00ffff" : "rgba(255,255,255,0.3)",
        position: "relative",
    };
}
export function cloudLassoThumbStyle(isLassoMode: boolean | undefined): React.CSSProperties {
    return {
        position: "absolute",
        top: "1px",
        left: isLassoMode ? "9px" : "1px",
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background: "white",
        transition: "left 0.2s",
    };
}
