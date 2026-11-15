/** InfoBox quality controls and legend styles; scoring and coverage rendering remain feature/runtime-owned. */
import type { React } from 'jimu-core';
export const qualityToolsSectionStyle: React.CSSProperties = {
    marginTop: "5px",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    paddingTop: "4px",
};
export const qualityToolsButtonStyle: React.CSSProperties = {
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
export const qualityToolsLegendStyle: React.CSSProperties = { marginTop: "4px", display: "flex", flexDirection: "column", gap: "2px" };
export const qualityToolsRangeStyle: React.CSSProperties = { color: "rgba(255,255,255,0.4)", marginLeft: "auto" };
export function getQualityToolsLabelStyle(active: boolean | undefined): React.CSSProperties {
    return {
        display: "flex",
        alignItems: "center",
        gap: "3px",
        fontWeight: 600,
        fontSize: "8px",
        lineHeight: 1,
        paddingTop: "1px",
        color: active ? "#F5A623" : "rgba(255,255,255,0.7)",
    };
}
export function getQualityToolsTrackStyle(active: boolean | undefined): React.CSSProperties {
    return {
        width: "16px",
        height: "8px",
        borderRadius: "4px",
        background: active ? "#F5A623" : "rgba(255,255,255,0.3)",
        position: "relative",
        flexShrink: 0,
        transition: "background 0.2s",
    };
}
export function getQualityToolsKnobStyle(active: boolean | undefined): React.CSSProperties {
    return {
        position: "absolute",
        top: "1px",
        left: active ? "9px" : "1px",
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background: "white",
        transition: "left 0.2s",
    };
}
export function getQualityToolsBandStyle(isSelected: boolean, isAnySelected: boolean): React.CSSProperties {
    return {
        display: "flex",
        alignItems: "center",
        gap: "4px",
        fontSize: "7px",
        cursor: "pointer",
        opacity: isAnySelected && !isSelected ? 0.3 : 1,
        transition: "opacity 0.2s ease",
    };
}
export function getQualityToolsSwatchStyle(color: string): React.CSSProperties { return { width: "8px", height: "3px", borderRadius: "2px", background: color, flexShrink: 0 }; }
export function getQualityToolsBandLabelStyle(isSelected: boolean): React.CSSProperties { return { color: "rgba(255,255,255,0.85)", fontWeight: isSelected ? 700 : 500 }; }
