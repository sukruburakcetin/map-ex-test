import type { CSSProperties } from "react";

export const filterInputStyle: CSSProperties = {
    background: "rgba(0, 0, 0, 0.2)",
    border: "1px solid var(--mly-theme-border, #456b58)",
    borderRadius: "20px",
    padding: "4px 20px 4px 10px",
    color: "var(--mly-theme-text, #edf7f0)",
    fontSize: "10px",
    width: "110px",
    outline: "none",
    transition: "all 0.2s",
    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)"
};

export const filterLabelStyle: CSSProperties = {
    fontSize: '9px',
    color: 'var(--mly-theme-text, #e1f2e8)',
    fontWeight: 500
};

export const filterPanelCss = `
.mly-filter-panel { container-type:inline-size; display:flex; align-items:center; gap:3px; width:100%; max-width:100%; min-width:0; height:30px; flex:0 0 30px; box-sizing:border-box; padding:1px 3px; background:var(--mly-theme-panel, linear-gradient(135deg,#142d26,#10231e)); color:var(--mly-theme-text, #e1f2e8); pointer-events:auto; z-index:10001; }
.mly-filter-panel.has-overflow { height:36px; flex-basis:36px; }
.mly-filter-scroll-wrap { position:relative; flex:1 1 0; min-width:0; height:28px; }
.mly-filter-panel.has-overflow .mly-filter-scroll-wrap { height:34px; }
.mly-filter-panel .mly-filter-scroll { width:100%; min-width:0; height:28px; overflow-x:auto; overflow-y:hidden; scrollbar-width:none !important; -ms-overflow-style:none; overscroll-behavior-x:contain; touch-action:pan-x pan-y; }
.mly-filter-panel .mly-filter-scroll::-webkit-scrollbar { display:none !important; width:0 !important; height:0 !important; }
.mly-filter-panel .mly-filter-scroll::-webkit-scrollbar-button { display:none !important; width:0 !important; height:0 !important; }
.mly-filter-progress { position:absolute; left:0; right:0; bottom:0; height:6px; cursor:pointer; touch-action:none; border-radius:2px; outline-offset:0; }
.mly-filter-progress::before { content:""; position:absolute; left:0; right:0; top:2px; height:2px; background:rgba(106,167,133,.18); border-radius:1px; }
.mly-filter-progress > span { display:block; position:absolute; top:2px; height:2px; border-radius:1px; background:#548b70; cursor:grab; }
.mly-filter-progress:active > span { cursor:grabbing; }
.mly-filter-progress:focus-visible { outline:1px solid var(--mly-theme-accent, #76dba5); }

.mly-filter-scroll:focus-visible, .mly-filter-panel button:focus-visible, .mly-filter-panel input:focus-visible, .mly-filter-panel select:focus-visible { outline:2px solid var(--mly-theme-accent, #76dba5) !important; outline-offset:-2px; }
.mly-filter-row { display:flex; align-items:center; justify-content:center; gap:5px; width:max-content; min-width:100%; height:28px; box-sizing:border-box; }
.mly-filter-group { display:flex; align-items:center; gap:6px; flex:0 0 auto; height:28px; padding:0 4px; box-sizing:border-box; border:1px solid var(--mly-theme-border, #416756); border-radius:6px; background:var(--mly-theme-control, #1b392d); }
.mly-filter-panel[lang="ar"] .mly-filter-group { direction:rtl; text-align:start; }
.mly-filter-group label { margin:0 !important; min-height:0; line-height:1; }
.mly-filter-group input[type="text"]::placeholder { color:var(--mly-theme-muted, #b5ccbf); opacity:1; }
.mly-filter-date-toggle:focus-within:has(input:focus-visible) { outline:2px solid var(--mly-theme-accent, #76dba5); outline-offset:1px; }
.mly-filter-group input[type="text"] { height:24px !important; min-height:24px !important; padding-top:0 !important; padding-bottom:0 !important; box-sizing:border-box; border-radius:5px !important; border-color:var(--mly-theme-border, #456b58) !important; background:var(--mly-theme-input, #122c22) !important; }
.mly-filter-group select { display:block; height:24px !important; min-height:24px !important; max-height:24px !important; box-sizing:border-box; margin:0; border:1px solid var(--mly-theme-border, #507d64) !important; border-radius:5px; padding:0 4px !important; font-size:10px !important; line-height:normal; background:var(--mly-theme-control, #173d2b) !important; color:var(--mly-theme-text, #edf7f0); color-scheme:var(--mly-theme-color-scheme, dark); }
.mly-filter-group .mly-filter-travel select { width:88px; min-width:0; }
.mly-filter-size { height:24px; white-space:nowrap; }
.mly-filter-size select { width:64px; min-width:64px; flex:0 0 64px; }
.mly-filter-group--features { width:min(280px, calc(100vw - 24px)); width:min(280px, calc(100vw - 24px), 100cqw); gap:8px; }
.mly-filter-group--features > div:first-child { flex:1 1 0 !important; width:auto !important; min-width:0; }
.mly-filter-group--features .mly-category-trigger { width:100%; max-width:100% !important; display:flex; align-items:center; justify-content:space-between; gap:6px; }
.mly-filter-group--features button.mly-category-trigger .mly-category-summary { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap !important; text-align:start; }
.mly-filter-group--features .mly-category-trigger[data-filtered="true"] { background:var(--mly-theme-selected, #31543d) !important; }
.mly-filter-group--features .mly-detection-display { min-width:0; max-width:48%; }
.mly-filter-group--features button.mly-detection-display-trigger .mly-detection-display-label { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap !important; }
.mly-filter-group--features .mly-detection-display-trigger { display:flex; align-items:center; gap:4px; background:transparent !important; border-color:transparent !important; }
.mly-filter-group--features .mly-detection-display-trigger:is(:hover,[aria-expanded="true"]) { background:var(--mly-theme-hover, #2d6247) !important; }
.mly-filter-group--features [role="combobox"] { height:24px; min-height:24px; max-height:24px; padding:0 6px; border-color:var(--mly-theme-border, #507d64); border-radius:5px; background:var(--mly-theme-control, #173d2b); }
.mly-filter-group button { box-sizing:border-box; }
.mly-filter-dates { display:flex; align-items:center; gap:3px; }
.mly-filter-dates button { height:24px; min-height:24px; max-height:24px; padding:0 5px; border-color:var(--mly-theme-border, #456b58); background:var(--mly-theme-control, #173d2b); }
.mly-filter-pano button { height:24px; min-height:24px; padding:0 5px; }
.mly-filter-nav { display:flex; align-items:center; justify-content:center; flex:0 0 24px; width:24px; height:28px; min-width:0; min-height:0; padding:0; border:1px solid var(--mly-theme-border, #527d66); border-radius:5px; background:var(--mly-theme-control, #1e4935); color:var(--mly-theme-text, #d6f5e3); font:18px/1 system-ui,sans-serif; cursor:pointer; }
.mly-filter-nav:disabled { opacity:.35; cursor:default; }
.mly-filter-nav:not(:disabled):hover { background:var(--mly-theme-hover, #2d6247); }
@media (hover:none) and (pointer:coarse) { .mly-filter-nav { display:none; } }
`;
