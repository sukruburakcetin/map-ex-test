import type { React } from 'jimu-core';
/** Solar-tool presentation only; modeling and scene ownership stay in the runtime. */
export function solarPanelStyle(isSolarMode: boolean | undefined): React.CSSProperties {
    return {
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
    };
}
export const solarToggleStyle: React.CSSProperties = { gap: "4px", minHeight: 16,
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
export function solarHeadingStyle(isSolarMode: boolean | undefined): React.CSSProperties { return { gap: "4px", whiteSpace: "nowrap", fontSize: "7px", fontWeight: 600, color: isSolarMode ? "#ffd700" : "rgba(255,255,255,0.7)", display: "flex", alignItems: "center" }; }
export const solarIconStyle: React.CSSProperties = { flexShrink: 0, marginRight: 0 };
export function solarTrackStyle(isSolarMode: boolean | undefined): React.CSSProperties {
    return { flexShrink: 0,
        width: "16px",
        height: "8px",
        borderRadius: "4px",
        background: isSolarMode ? "#ffd700" : "rgba(255,255,255,0.3)",
        position: "relative",
    };
}
export function solarThumbStyle(isSolarMode: boolean | undefined): React.CSSProperties {
    return {
        position: "absolute",
        top: "1px",
        left: isSolarMode ? "9px" : "1px",
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background: "white",
        transition: "left 0.2s",
    };
}
export const solarDescriptionStyle: React.CSSProperties = { marginTop: "4px", fontSize: "7px", color: "#ccc", textAlign: "left", lineHeight: "1.2" };
