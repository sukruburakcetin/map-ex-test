import type { React } from 'jimu-core';
/** Date-coverage legend presentation; selecting years remains runtime-owned. */
export const yearLegendPanelStyle: React.CSSProperties = {
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
};
export const yearLegendHeadingStyle: React.CSSProperties = { fontSize: "8px", fontWeight: 600, opacity: 0.7, marginBottom: "2px", textAlign: "center", width: "100%" };
export function yearLegendRowStyle(isSelected: boolean, isAnySelected: boolean): React.CSSProperties {
    return {
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
    };
}
export function yearLegendMarkerStyle(isSelected: boolean, item: {
    color: string;
}): React.CSSProperties {
    return {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        backgroundColor: item.color,
        border: isSelected ? "1.5px solid white" : "1px solid rgba(255,255,255,0.6)",
        boxShadow: isSelected ? "0 0 4px rgba(255,255,255,0.8)" : "none",
        flexShrink: 0,
    };
}
export function yearLegendLabelStyle(isSelected: boolean): React.CSSProperties {
    return {
        whiteSpace: "nowrap",
        fontWeight: isSelected ? 800 : 400,
        color: isSelected ? "#fff" : "rgba(255,255,255,0.9)",
    };
}
export const yearLegendScrollbarCss = `.year-legend-scroll::-webkit-scrollbar { display: none; }`;
