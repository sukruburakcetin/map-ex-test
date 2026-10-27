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

/** InfoBox shell, viewport and status-card geometry. Overflow observation stays component-owned. */
export function infoPanelShellStyle(isOverflowing: boolean): React.CSSProperties {
    return {
        position: "absolute",
        top: "2px",
        right: isOverflowing ? "0" : "4px",
        zIndex: 10002,
        maxHeight: "calc(100% - 170px)",
        display: "flex",
        flexDirection: "column",
        pointerEvents: "none",
    };
}
export function infoControlsViewportStyle(isOverflowing: boolean): React.CSSProperties {
    return {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        pointerEvents: "auto",
        minHeight: 0,
        flexShrink: 1,
        overflowY: "auto",
        overflowX: "hidden",
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(255,255,255,0.25) transparent",
        paddingRight: isOverflowing ? "4px" : "0px",
    };
}
export const infoStatusCardStyle: React.CSSProperties = { boxSizing: "border-box",
    fontSize: "8.5px",
    color: "white",
    background: "rgba(0, 0, 0, 0.35)",
    backdropFilter: "blur(5px)",
    borderRadius: "6px",
    width: "96px",
    textAlign: "left",
    padding: "5px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
    border: "1px solid rgba(255,255,255,0.1)",
    pointerEvents: "auto",
};
export const infoPanelResponsiveCss = `
          @container (max-width: 480px) {
            .mly-info-panel { max-height: calc(100% - 124px) !important; }
            .mly-info-footer { margin-top: 1px !important; border-color: rgba(167,213,190,0.1) !important; background: rgba(18,31,27,0.5) !important; box-shadow: none !important; }
            .mly-info-footer button { min-height: 20px !important; padding: 1px 2px !important; font-size: 7.5px !important; }
            .mly-info-more-hint { animation: none !important; }
          }
        `;

/** Compact location-first card aligned with the existing 96px tool sections. */
export const infoDetailsCss = `
.mly-info-panel { font-family: "Segoe UI", sans-serif; width: 96px; max-width: calc(100% - 44px); gap: 0; border-radius: 8px; overflow: hidden; box-shadow: 0 3px 10px #0003; }
.mly-info-toggle { pointer-events: auto; width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 4px; padding: 4px 5px; min-height: 24px; border: 0; border-radius: 0; background: rgba(18,31,27,.7); backdrop-filter: blur(8px); color: #d6f1df; font: inherit; font-size: 10px; cursor: pointer; }
.mly-info-location { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mly-info-body { min-height: 0; display: flex; flex-direction: column; pointer-events: auto; border-radius: 0; background: rgba(18,31,27,.62); backdrop-filter: blur(8px); padding: 0; }
.mly-info-body[hidden] { display: none; }
.mly-info-panel .mly-info-scroll { align-items: stretch !important; padding-right: 0 !important; scrollbar-width: none; }
.mly-info-panel .mly-info-scroll::-webkit-scrollbar { display: none; }
.mly-info-panel .info-box { width: 100% !important; max-width: none !important; padding: 4px !important; background: transparent !important; box-shadow: none !important; border: 0 !important; font-size: 9px !important; }
.mly-info-panel .info-box button { font-size: 9px !important; min-height: 26px; line-height: 1.3; }
.mly-info-panel .info-box button > span { font-size: inherit !important; }
.mly-info-panel .mly-image-coordinates summary, .mly-info-panel .mly-info-more summary { cursor: pointer; padding: 6px 4px; font-size: 9px; color: #c7dfd0; }
.mly-info-panel .mly-info-more { border-top: 1px solid #ffffff16; margin-top: 3px; }
.mly-info-panel .mly-info-footer { width: 100% !important; margin-right: 0 !important; }
.mly-info-panel .mly-info-footer button { min-height: 24px !important; font-size: 8px !important; }
.mly-info-panel button:focus-visible, .mly-info-panel summary:focus-visible { outline: 2px solid #b4f3ca; outline-offset: -2px; }

.mly-info-panel .mly-info-quick { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 3px; }
.mly-info-panel .mly-info-quick button { min-width: 0; min-height: 28px; padding: 3px 2px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; border: 0; border-radius: 4px; background: rgba(255,255,255,.055); color: #d9e5de; font: inherit; font-size: 8px !important; line-height: 1.15; cursor: pointer; }
.mly-info-panel .mly-info-quick button[aria-pressed="true"], .mly-info-panel .mly-info-quick button[aria-expanded="true"] { background: rgba(57,168,111,.24); color: #a3f2c1; box-shadow: inset 0 -2px #56c18a; }
.mly-info-panel .mly-quick-count { font-size: 7px; line-height: 1; color: #96dcb1; }
.mly-info-panel .mly-quick-count:empty { display: none; }
.mly-info-panel .mly-quick-state { width: 10px; height: 2px; border-radius: 2px; background: #ffffff4a; }
.mly-info-panel [aria-pressed="true"] .mly-quick-state { background: #77e9a9; }
.mly-info-panel .mly-info-more { margin-top: 0; }
.mly-info-panel .mly-info-more > summary { padding: 5px 4px; font-size: 8px; }
@media (hover:hover) { .mly-info-panel .mly-info-quick button:hover { background: #ffffff20; } }
@media (max-width: 480px) {
  .mly-info-panel { max-height: min(58%, calc(100% - 12px)) !important; }
  .mly-info-panel .info-box button { min-height: 24px; }
}
@container (max-width: 480px) {
  .mly-info-panel { max-height: min(58%, calc(100% - 12px)) !important; }
  .mly-info-panel .info-box button { min-height: 24px; }
}
`;
