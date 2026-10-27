/** Control-panel static styles. Keep CSS text and style-tag injection order unchanged. */
export const controlBarInteractionCss = `.glass-control-panel button[class], .glass-control-panel button[class]:hover, .glass-control-panel.glass-control-panel .unified-control-buttons-filters, .glass-control-panel.glass-control-panel .unified-control-buttons-filters.is-hoverable:hover, .glass-image-utility-panel .utility-button, .glass-image-utility-panel .utility-button:hover { transform: none !important; transition: background-color 140ms ease, box-shadow 140ms ease, border-color 140ms ease !important; } .glass-control-panel button svg, .glass-image-utility-panel .utility-button svg { transform: none !important; transition: none !important; }`;

/** Scoped rail rules override legacy sidebar sizing without affecting viewer utilities. */
export const controlBarCompactCss = `
.glass-control-panel.mly-control-rail {
  --mly-rail-target: 34px;
  --mly-rail-height: 34px;
  position: absolute; top: 4px; z-index: 10003;
  display: flex; flex-direction: column; align-items: center;
  width: calc(var(--mly-rail-target) + 6px); box-sizing: border-box;
  max-height: calc(100% - 8px) !important; overflow-y: auto; overflow-x: hidden;
  gap: 2px !important; padding: 2px; scrollbar-width: thin;
  scrollbar-color: #6c9c83 transparent; overscroll-behavior: contain;
  border: 1px solid rgba(170,205,188,.24); border-radius: 10px;
  background: rgba(18,31,27,.68);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); color: #e7f3ec;
  box-shadow: 0 3px 12px rgba(0,0,0,.24);
}
.glass-control-panel.mly-control-rail::-webkit-scrollbar { display: block; width: 3px; }
.glass-control-panel.mly-control-rail::-webkit-scrollbar-thumb { background: #6c9c83; border-radius: 3px; }
.mly-control-rail > *, .mly-control-rail .mly-rail-button { flex-shrink: 0; }
.mly-control-rail .mly-rail-group { gap: 1px; padding: 0; }
.mly-control-rail .mly-rail-divider { height: 1px; width: 18px; margin: 2px 0; background: rgba(170,205,188,.25); }
.mly-control-rail .mly-rail-button {
  position: relative; width: var(--mly-rail-target); height: var(--mly-rail-height);
  min-width: var(--mly-rail-target); min-height: var(--mly-rail-height);
  box-sizing: border-box; display: flex; align-items: center; justify-content: center;
  padding: 0; margin: 0; border: 1px solid transparent; border-radius: 8px;
  background: transparent; color: #d8e9df; cursor: pointer; touch-action: manipulation;
}
.mly-control-rail .mly-rail-button[aria-pressed="true"],
.mly-control-rail .mly-rail-button[aria-expanded="true"] {
  background: rgba(77,142,103,.23); border-color: rgba(150,210,174,.32); color: #fff;
}
.mly-control-rail .mly-rail-button:disabled { opacity: .4; cursor: default; }
.mly-control-rail .mly-rail-button:focus-visible { outline: 2px solid #c1ffda; outline-offset: -3px; }
.mly-control-rail .mly-rail-button svg { width: 18px !important; height: 18px !important; pointer-events: none; }
.mly-control-rail .mly-rail-filter svg { width: 14px !important; height: 14px !important; }
.mly-control-rail .mly-rail-check { position: absolute; right: 1px; bottom: 0; font-size: 9px; line-height: 14px; font-weight: 700; pointer-events: none; }
@media (hover: hover) and (pointer: fine) {
  .mly-control-rail .mly-rail-button:enabled:hover { background: rgba(129,180,149,.18); }
}
/* Compact phone, touch and narrow embedded viewers without changing desktop sizing. */
@media (any-pointer: coarse), (max-width: 480px) {
  .glass-control-panel.mly-control-rail {
    --mly-rail-target: 28px; --mly-rail-height: 28px;
    gap: 1px !important; border-radius: 8px;
  }
  .mly-control-rail .mly-rail-button { border-radius: 6px; }
  .mly-control-rail .mly-rail-filter { height: 24px; min-height: 24px; }
  .mly-control-rail .mly-rail-button svg { width: 16px !important; height: 16px !important; }
  .mly-control-rail .mly-rail-filter svg { width: 12px !important; height: 12px !important; }
  .mly-control-rail .mly-rail-divider { margin: 1px 0; }
}
@container (max-width: 480px) {
  .glass-control-panel.mly-control-rail {
    --mly-rail-target: 28px; --mly-rail-height: 28px;
    gap: 1px !important; border-radius: 8px;
  }
  .mly-control-rail .mly-rail-button { border-radius: 6px; }
  .mly-control-rail .mly-rail-filter { height: 24px; min-height: 24px; }
  .mly-control-rail .mly-rail-button svg { width: 16px !important; height: 16px !important; }
  .mly-control-rail .mly-rail-filter svg { width: 12px !important; height: 12px !important; }
  .mly-control-rail .mly-rail-divider { margin: 1px 0; }
}
@media (prefers-reduced-motion: reduce) {
  .mly-control-rail button[class] { transition: none !important; }
}
`;

export const imageUtilityInteractionCss = `.glass-control-panel button[class], .glass-control-panel button[class]:hover, .glass-image-utility-panel .utility-button, .glass-image-utility-panel .utility-button:hover { transform: none !important; transition: background-color 140ms ease, box-shadow 140ms ease, border-color 140ms ease !important; } .glass-control-panel button svg, .glass-image-utility-panel .utility-button svg { transform: none !important; transition: none !important; }`;

export const pointCloudModeCss = `.mapillary-point-cloud-mode > summary { display: flex !important; visibility: visible !important; opacity: 1 !important; } .mapillary-point-cloud-mode > summary::-webkit-details-marker { display: none; }`;

export const imageUtilityPanelStyle = {
            position: "absolute",
            bottom: "22px",
            right: "55px",
            zIndex: 10000,
            gap: "3px",
            padding: "1px 3px 1px 2px",
            background: "rgba(20, 20, 20, 0.4)",
            backdropFilter: "blur(1px)",
            WebkitBackdropFilter: "blur(1px)",
            borderRadius: "12px",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.30)",
        } as const;

/** Scoped dock rules take precedence over legacy utility grids and fullscreen offsets. */
export const utilityDockCss = `
.glass-image-utility-panel.mly-utility-dock {
  position: absolute; z-index: 10000; top: auto !important; left: auto !important; right: 56px !important; bottom: 44px !important;
  display: flex !important; flex-wrap: wrap; align-items: center; justify-content: center; grid-template-columns: none !important;
  width: max-content; max-width: calc(100% - 100px); box-sizing: border-box;
  gap: 2px !important; padding: 3px !important; border: 1px solid #95bea044; border-radius: 9px !important;
  background: rgba(20,40,31,.83) !important; backdrop-filter: blur(8px); box-shadow: 0 3px 12px #0003 !important;
}
.glass-image-utility-panel.mly-utility-dock .utility-button {
  position: relative; flex: 0 0 auto; width: 30px !important; height: 30px !important; box-sizing: border-box; margin: 0;
  display: flex; align-items: center; justify-content: center; gap: 4px; padding: 0; border: 1px solid transparent; border-radius: 6px;
  background: transparent; color: #d6e9de; cursor: pointer; touch-action: manipulation;
  transform: none !important; filter: none !important; box-shadow: none !important; transition: background-color 120ms ease !important;
}
.glass-image-utility-panel.mly-utility-dock .utility-button svg { width: 16px !important; height: 16px !important; transform: none !important; pointer-events: none; }
.glass-image-utility-panel.mly-utility-dock .utility-button[aria-pressed="true"], .glass-image-utility-panel.mly-utility-dock .utility-button[aria-expanded="true"] { background: #39654b; border-color: #8dc4a166; color: #f0fff4; }
.glass-image-utility-panel.mly-utility-dock .utility-button:disabled { opacity: .35; cursor: default; }
.glass-image-utility-panel.mly-utility-dock .mly-dock-cloud { flex-direction: column; gap: 0; }
.glass-image-utility-panel.mly-utility-dock .mly-dock-cloud.is-loading { flex-direction: row; gap: 6px; width: 70px !important; font: 10px "Segoe UI",sans-serif; background: #365743; }
.mly-dock-mode { font: 6px/1 "Segoe UI",sans-serif; color: #c9ebd4; }
.mly-dock-divider { width: 1px; height: 16px; margin: 0 1px; background: #a6cbb533; }
.mly-dock-download-dot { position: absolute; right: 3px; bottom: 3px; width: 4px; height: 4px; background: #b0e3c1; border-radius: 50%; }
@keyframes mly-dock-spin { to { transform: rotate(360deg); } }
.mly-dock-spinner { flex: 0 0 8px; width: 8px; height: 8px; border: 1px solid #b5d4bd55; border-top-color: #d7f4df; border-radius: 50%; animation: mly-dock-spin 1s linear infinite; }
.mly-utility-popover { box-sizing: border-box; overflow: auto; overscroll-behavior: contain; padding: 5px; border: 1px solid #648b73; border-radius: 8px; background: #192f24; box-shadow: 0 5px 18px #0005; color: #e1eee5; font-family: "Segoe UI",sans-serif; }
.mly-utility-popover button { width: 100%; box-sizing: border-box; display: flex; align-items: center; gap: 8px; min-height: 34px; padding: 7px; margin: 0; border: 0; border-radius: 5px; background: transparent; color: inherit; font: inherit; font-size: 12px; text-align: left; cursor: pointer; }
.mly-utility-popover button:disabled { opacity: .5; cursor: default; }
.mly-utility-popover button[aria-pressed="true"] { color: #bcf0cd; background: #31543d; }
.mly-dock-mode-options { margin-top: 4px; padding-top: 5px; border-top: 1px solid #ffffff16; }
.mly-dock-menu-label { display: block; padding: 3px 7px; font-size: 10px; color: #9fbaa9; }
.mly-dock-choice { width: 15px; flex-shrink: 0; }
.mly-utility-popover button:focus-visible, .mly-utility-dock button:focus-visible { outline: 2px solid #c5f6d6; outline-offset: -2px; }
@media (hover:hover) { .glass-image-utility-panel.mly-utility-dock .utility-button:enabled:hover, .mly-utility-popover button:enabled:hover { background: #7db18d33; } }
.mly-dock-cloud-group { display: flex; align-items: center; gap: 0; }
.glass-image-utility-panel.mly-utility-dock .mly-dock-mode-trigger { width: 18px !important; border-left: 1px solid #a6cbb533; }
.glass-image-utility-panel.mly-utility-dock .mly-dock-mode-trigger svg { width: 10px !important; height: 10px !important; }
.mly-dock-option-copy { display: flex; flex-direction: column; gap: 3px; }
.mly-dock-option-copy small { font-size: 10px; line-height: 1.3; color: #a9c1b2; }
@media (max-width: 768px), (pointer: coarse) {
  .glass-image-utility-panel.mly-utility-dock { display: grid !important; grid-template-columns: repeat(3,max-content) !important; top: auto !important; left: auto !important; right: 56px !important; bottom: 18px !important; gap: 1px !important; padding: 2px !important; }
  .glass-image-utility-panel.mly-utility-dock .utility-button { width: 22px !important; height: 22px !important; }
  .glass-image-utility-panel.mly-utility-dock .utility-button svg { width: 13px !important; height: 13px !important; }
  .glass-image-utility-panel.mly-utility-dock .mly-dock-divider { display: none; }
  .glass-image-utility-panel.mly-utility-dock .mly-dock-cloud-group { grid-column: span 2; justify-self: stretch; }
  .glass-image-utility-panel.mly-utility-dock .mly-dock-mode-trigger { width: 18px !important; }
  .glass-image-utility-panel.mly-utility-dock .mly-dock-cloud.is-loading { width: 70px !important; }
}
@container (max-width: 480px) {
  .glass-image-utility-panel.mly-utility-dock { display: grid !important; grid-template-columns: repeat(3,max-content) !important; top: auto !important; left: auto !important; right: 56px !important; bottom: 18px !important; gap: 1px !important; padding: 2px !important; }
  .glass-image-utility-panel.mly-utility-dock .utility-button { width: 22px !important; height: 22px !important; }
  .glass-image-utility-panel.mly-utility-dock .utility-button svg { width: 13px !important; height: 13px !important; }
  .glass-image-utility-panel.mly-utility-dock .mly-dock-divider { display: none; }
  .glass-image-utility-panel.mly-utility-dock .mly-dock-cloud-group { grid-column: span 2; justify-self: stretch; }
  .glass-image-utility-panel.mly-utility-dock .mly-dock-mode-trigger { width: 18px !important; }
  .glass-image-utility-panel.mly-utility-dock .mly-dock-cloud.is-loading { width: 70px !important; }
}
/* Retain the original fullscreen mobile location below the minimap. */
@media (max-width: 768px) {
  .mly-fullscreen-viewer:not(.mly-minimap-expanded) .glass-image-utility-panel.mly-utility-dock { top: calc(178px + env(safe-area-inset-top,0px)) !important; left: calc(8px + env(safe-area-inset-left,0px)) !important; right: auto !important; bottom: auto !important; }
}
@media (max-width: 768px) and (max-height: 440px) {
  .mly-fullscreen-viewer:not(.mly-minimap-expanded) .glass-image-utility-panel.mly-utility-dock { top: calc(78px + env(safe-area-inset-top,0px)) !important; left: calc(114px + env(safe-area-inset-left,0px)) !important; }
}
@media (prefers-reduced-motion: reduce) { .mly-dock-spinner { animation: none; } .glass-image-utility-panel.mly-utility-dock .utility-button { transition: none !important; } }
`;
