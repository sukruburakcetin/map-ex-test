import type { React } from 'jimu-core';
/** InfoBox status presentation. Keep layout values aligned with the existing compact status card. */
export const infoStatusHeaderStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "3px",
    opacity: 0.8,
    fontSize: "10px",
    borderBottom: "1px solid rgba(255,255,255,0.2)",
    paddingBottom: "4px",
};
export const infoStatusTitleStyle: React.CSSProperties = { fontWeight: 600, fontSize: "8px" };
export const infoStatusSearchStyle: React.CSSProperties = { marginRight: "2px", marginLeft: "2px" };
export const infoStatusZoomStyle: React.CSSProperties = { fontSize: "8px" };
export const infoStatusAddressStyle: React.CSSProperties = { marginBottom: "3px", color: "#37d582", fontWeight: 500 };
export const infoStatusGlobeStyle: React.CSSProperties = { marginRight: "4px" };
export const infoStatusCoordinatesStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "2px", width: "100%", opacity: 0.9, padding: "2px 0", background: "transparent", border: "none", borderRadius: 3, color: "inherit", font: "inherit", textAlign: "left", cursor: "copy", userSelect: "text" };
export const infoStatusCoordinateRowStyle: React.CSSProperties = { display: "flex", alignItems: "center" };
export const infoStatusCoordinateLabelStyle: React.CSSProperties = { width: "25px", fontSize: "9px", color: "#aaa" };
export const infoStatusCreatorStyle: React.CSSProperties = {
    marginTop: "4px",
    padding: "1px 3px",
    background: "rgba(55, 213, 130, 0.2)",
    border: "1px solid rgba(55, 213, 130, 0.4)",
    borderRadius: "3px",
    fontSize: "9px",
    color: "#37d582",
    textAlign: "center",
};

/** Discovery footer styles; compact-container overrides remain in the InfoBox shell. */
export function infoFooterPanelStyle(isOverflowing: boolean, canScrollDown: boolean): React.CSSProperties { return { pointerEvents: "auto", width: 96, boxSizing: "border-box", marginTop: 3, marginRight: isOverflowing ? 4 : 0, alignSelf: "flex-end", flexShrink: 0, borderRadius: 5, border: "1px solid rgba(167,213,190,0.25)", background: "rgba(18,31,27,0.94)", boxShadow: canScrollDown ? "0 -5px 8px rgba(18,31,27,0.35)" : "none" }; }
export const infoFooterRowStyle: React.CSSProperties = { display: "flex", gap: 2 };
export function infoFooterUpStyle(canScrollDown: boolean): React.CSSProperties { return { flex: canScrollDown ? "0 0 22px" : "1 1 auto", minHeight: 26, padding: "3px 2px", border: "none", background: "transparent", borderRadius: 4, color: "#d6ebdf", fontSize: 8, cursor: "pointer" }; }
export const infoFooterDownStyle: React.CSSProperties = { flex: "1 1 auto", minHeight: 26, padding: "3px 2px", border: "none", background: "transparent", borderRadius: 4, color: "#d6ebdf", fontSize: 8, cursor: "pointer", whiteSpace: "nowrap" };
export const infoFooterHintCss = `
            @keyframes mly-info-more-hint { 50% { transform: translateY(2px); } }
            .mly-info-more-hint { display: inline-block; animation: mly-info-more-hint 800ms ease-out 2; }
            @media (prefers-reduced-motion: reduce) { .mly-info-more-hint { animation: none; } }
          `;
