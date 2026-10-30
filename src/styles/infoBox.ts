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
export const infoFooterRowStyle: React.CSSProperties = { display: "grid", gap: 2, minWidth: 0 };
export function infoFooterUpStyle(canScrollDown: boolean): React.CSSProperties { return { flex: canScrollDown ? "0 0 22px" : "1 1 auto", minWidth: 0, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 26, padding: "3px 2px", border: "none", background: "transparent", borderRadius: 4, color: "#d6ebdf", fontSize: 8, cursor: "pointer" }; }
export const infoFooterDownStyle: React.CSSProperties = { minWidth: 0, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", gap: 2, textAlign: "center", flex: "1 1 auto", minHeight: 26, padding: "3px 2px", border: "none", background: "transparent", borderRadius: 4, color: "#d6ebdf", fontSize: 8, cursor: "pointer", whiteSpace: "normal" };
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
.mly-info-panel { container: mly-info / inline-size; min-width: 0; box-sizing: border-box; font-family: "Segoe UI", sans-serif; width: 96px; max-width: calc(100% - 44px); gap: 0; border-radius: 8px; overflow: hidden; box-shadow: 0 3px 10px #0003; }
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

.mly-info-panel .mly-coordinate-card { width: 100%; box-sizing: border-box; text-align: left; cursor: copy; font: inherit; margin: 0 0 4px; padding: 5px 4px; border: 1px solid #8ab89b2e; border-radius: 5px; background: linear-gradient(145deg,rgba(120,175,143,.09),rgba(10,23,17,.22)); }
.mly-info-panel .mly-coordinate-value { display: flex; align-items: baseline; justify-content: space-between; gap: 2px; color: #e0eee5; font-size: 9px; line-height: 1.8; font-variant-numeric: tabular-nums; white-space: nowrap; }
.mly-info-panel .mly-coordinate-value small { font-size: 8px; opacity: .55; padding-left: 1px; }
.mly-info-panel .mly-coordinate-direction { color: #8ed4ac; font-size: 8px; font-weight: 600; }
.mly-info-panel .mly-coordinate-card:disabled { opacity: .45; cursor: default; }
@media (hover:hover) { .mly-info-panel .mly-coordinate-card:enabled:hover { border-color: #8ed4ac88; } }


.mly-info-header { display: flex; flex-shrink: 0; background: rgba(18,31,27,.7); }
.mly-info-header .mly-info-toggle { flex: 1; min-width: 0; width: auto; background: transparent; }
.mly-info-width-toggle { pointer-events: auto; flex: 0 0 20px; display: flex; align-items: center; justify-content: center; padding: 0; border: 0; border-left: 1px solid #ffffff12; background: transparent; color: #b9d4c4; cursor: pointer; }
.mly-info-width-toggle[hidden] { display: none; }
.mly-info-panel.is-wide { width: 144px; }
.mly-info-panel.is-wide .mly-info-more > div { width: 100% !important; box-sizing: border-box; }
@media (hover:hover) { .mly-info-width-toggle:hover { background: #ffffff12; } }

/* Keep disclosures short; their content must not reserve empty card space. */
.mly-info-panel .mly-info-more > summary, .mly-info-panel .mly-image-coordinates > summary { padding: 3px 4px; margin: 0; min-height: 0; line-height: 1.25; }
.mly-info-panel .mly-info-more > .info-box { margin: 0 !important; padding: 0 4px !important; min-height: 0 !important; height: auto !important; }
.mly-info-panel .mly-image-coordinates { margin: 0; padding: 0; }
@media (min-width: 601px) and (hover: hover) and (pointer: fine) {
  @container (min-width: 481px) {
    .mly-info-panel.is-wide .mly-coverage-results, .mly-info-panel.is-wide .mly-cloud-export, .mly-info-panel.is-wide .mly-route-controls, .mly-info-panel.is-wide .mly-route-points { width: 100% !important; max-width: 100%; box-sizing: border-box; min-width: 0; }
    .mly-info-panel.is-wide .mly-cloud-export > button { width: 100% !important; }
    .mly-info-panel.is-wide .mly-info-body { font-size: 11px; }
    .mly-info-panel.is-wide .mly-info-body :is(div,span,label,summary,button,select,input) { font-size: 11px !important; }
    .mly-info-panel.is-wide .mly-info-body :is(button,select) { min-height: 28px; box-sizing: border-box; }
    .mly-info-panel.is-wide .mly-info-quick button { min-height: 34px; }
    .mly-info-panel.is-wide .mly-info-quick .mly-quick-count { font-size: 9px !important; }
    .mly-info-panel.is-wide .mly-info-toggle { font-size: 12px; min-height: 28px; }
    .mly-info-panel.is-wide .mly-info-body summary { font-size: 10px !important; }
    .mly-info-panel.is-wide .mly-coverage-results button, .mly-info-panel.is-wide .mly-route-controls button { white-space: normal; }
    .mly-info-panel.is-wide .mly-route-controls select { min-width: 0; max-width: 100%; }
  }
}
@media (max-width: 480px) {
  .mly-info-panel { max-height: min(58%, calc(100% - 12px)) !important; }
  .mly-info-panel .info-box button { min-height: 24px; }
}
@container (max-width: 480px) {
  .mly-info-panel { max-height: min(58%, calc(100% - 12px)) !important; }
  .mly-info-panel .info-box button { min-height: 24px; }
}

/* Analysis/routing cards fit their actual parent in every host and input mode.
 * Named queries measure the infobox itself, including a compact Widget Controller. */
.mly-info-panel :is(.mly-coverage-results,.mly-route-controls,.mly-route-points) { width: 100% !important; max-width: 100%; min-width: 0; box-sizing: border-box; flex-shrink: 0; }
.mly-info-panel :is(.mly-coverage-results,.mly-route-controls,.mly-route-points) :is(div,span,label,button,select) { min-width: 0; box-sizing: border-box; }
.mly-info-panel :is(.mly-coverage-results,.mly-route-controls,.mly-route-points) button { max-width: 100%; white-space: normal; overflow-wrap: anywhere; }
.mly-info-panel .mly-coverage-tier-line { display: grid !important; grid-template-columns: minmax(0,1fr) auto; gap: 3px; }
.mly-info-panel .mly-coverage-tier-label { flex-wrap: wrap; column-gap: 3px; row-gap: 0; }
.mly-info-panel .mly-coverage-tier-percent { white-space: nowrap; }
.mly-info-panel .mly-route-choice select { width: 100%; max-width: 100%; }
.mly-info-panel .mly-route-metric-row { flex-wrap: wrap; gap: 2px 4px; }
.mly-info-panel .mly-route-result-actions { display: grid !important; grid-template-columns: minmax(0,1fr) auto; }
@container mly-info (max-width: 115px) {
 .mly-route-choice { display: grid !important; grid-template-columns: minmax(0,1fr); gap: 2px !important; }
 .mly-route-choice select { min-height: 24px; }
 .mly-route-pick-buttons { display: grid !important; grid-template-columns: repeat(2,minmax(0,1fr)); }
 .mly-route-pick-buttons button { min-height: 24px; }
 .mly-coverage-results > div:first-child { flex-wrap: wrap; gap: 2px; }
 .mly-route-metric-row { align-items: flex-start !important; }
}

/* Every disclosure tool shares the infobox content width, including its scrollbar gutter. */
.mly-info-panel .mly-info-more { min-width: 0; max-width: 100%; }
.mly-info-panel .mly-info-more > :not(summary) { width: 100% !important; max-width: 100%; min-width: 0; box-sizing: border-box; flex-shrink: 0; }
.mly-info-panel .mly-info-more :is(div,span,label,button,select,input) { min-width: 0; box-sizing: border-box; }
.mly-info-panel .mly-info-more :is(button,select,input[type="range"]) { max-width: 100%; }
.mly-info-panel .mly-info-more button { white-space: normal; overflow-wrap: anywhere; }
.mly-info-panel .mly-info-more button > span { white-space: normal !important; overflow-wrap: anywhere; }
.mly-info-panel .mly-cloud-export > :is(button,select) { width: 100% !important; }
.mly-info-panel .mly-info-footer button { min-width: 0; box-sizing: border-box; text-align: center; }
/* Keep icon/text spacing while permitting labels to wrap independently of switches. */
.mly-info-panel .mly-info-more .mly-tool-heading { display: inline-flex !important; align-items: center; gap: 5px; flex: 1; min-width: 0; text-align: left; }
.mly-info-panel .mly-info-more .mly-tool-heading > svg { flex: 0 0 auto; }
.mly-info-panel .mly-info-more .mly-tool-text { display: block; min-width: 0; line-height: 1.3; }
/* Width expansion is available in narrow controllers and on touch screens too. */
.mly-info-width-toggle { flex-basis: 24px; min-height: 28px; }
`;
