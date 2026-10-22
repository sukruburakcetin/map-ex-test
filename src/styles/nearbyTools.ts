/** Compact InfoBox nearby-capture control styles; keep feature styling outside presentation logic. */
import type { React } from 'jimu-core';
export const nearbyToolsSectionStyle: React.CSSProperties = {
    marginTop: "5px",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    paddingTop: "4px",
};
export const nearbyToolsButtonStyle: React.CSSProperties = {
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
export const nearbyToolsLoadingStyle: React.CSSProperties = { opacity: 0.5 };
export const nearbyToolsCountStyle: React.CSSProperties = {
    background: "#05a056",
    color: "white",
    borderRadius: "8px",
    padding: "1px 4px 0px",
    fontSize: "6.5px",
    fontWeight: 700,
};
export function getNearbyToolsLabelStyle(open: boolean | undefined): React.CSSProperties {
    return {
        fontSize: "7.5px",
        lineHeight: 1,
        fontWeight: 600,
        color: open ? "#05a056" : "rgba(255,255,255,0.7)",
        display: "flex",
        alignItems: "center",
        gap: "4px",
    };
}
export function getNearbyToolsChevronStyle(open: boolean | undefined): React.CSSProperties { return { transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", opacity: 0.6 }; }
