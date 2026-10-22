import type { React } from 'jimu-core';
/** Image-side cloud elevation legend; deliberately separate from the map legend. */
export const cloudElevationLegendPanelStyle: React.CSSProperties = {
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
};
export const cloudElevationLegendHeadingStyle: React.CSSProperties = { fontSize: "7px", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "4px", textAlign: "center" };
export const cloudElevationLegendRowsStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "3px" };
export const cloudElevationLegendRowStyle: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "6.5px" };
export const cloudElevationLegendValueGroupStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: "3px" };
export function cloudElevationLegendMarkerStyle(color: string): React.CSSProperties {
    return {
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: color,
        border: "0.5px solid rgba(255,255,255,0.4)",
        flexShrink: 0,
    };
}
export const cloudElevationLegendValueStyle: React.CSSProperties = { color: "white", fontWeight: 600 };
export const cloudElevationLegendLabelStyle: React.CSSProperties = { color: "rgba(255,255,255,0.5)" };
