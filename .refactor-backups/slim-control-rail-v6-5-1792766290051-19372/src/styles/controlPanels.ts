/** Control-panel static styles. Keep CSS text and style-tag injection order unchanged. */
export const controlBarInteractionCss = `.glass-control-panel button[class], .glass-control-panel button[class]:hover, .glass-control-panel.glass-control-panel .unified-control-buttons-filters, .glass-control-panel.glass-control-panel .unified-control-buttons-filters.is-hoverable:hover, .glass-image-utility-panel .utility-button, .glass-image-utility-panel .utility-button:hover { transform: none !important; transition: background-color 140ms ease, box-shadow 140ms ease, border-color 140ms ease !important; } .glass-control-panel button svg, .glass-image-utility-panel .utility-button svg { transform: none !important; transition: none !important; }`;

/** Scoped rail rules override legacy sidebar sizing without affecting viewer utilities. */
export const controlBarCompactCss = `
.glass-control-panel.mly-control-rail {
  --mly-rail-target: 40px;
  position: absolute; top: 4px; z-index: 10003;
  display: flex; flex-direction: column; align-items: center;
  width: calc(var(--mly-rail-target) + 10px); box-sizing: border-box;
  max-height: calc(100% - 8px) !important; overflow-y: auto; overflow-x: hidden;
  gap: 4px !important; padding: 4px; scrollbar-width: thin;
  scrollbar-color: #6c9c83 transparent; overscroll-behavior: contain;
  border: 1px solid #416756; border-radius: 12px;
  background: rgba(19,39,31,.96); color: #e7f3ec;
  box-shadow: 0 3px 12px rgba(0,0,0,.24);
}
.glass-control-panel.mly-control-rail::-webkit-scrollbar { display: block; width: 3px; }
.glass-control-panel.mly-control-rail::-webkit-scrollbar-thumb { background: #6c9c83; border-radius: 3px; }
.mly-control-rail > *, .mly-control-rail .mly-rail-button { flex-shrink: 0; }
.mly-control-rail .mly-rail-group { gap: 4px; padding: 0; }
.mly-control-rail .mly-rail-divider { height: 1px; width: 26px; margin: 2px 0; background: #416756; }
.mly-control-rail .mly-rail-button {
  position: relative; width: var(--mly-rail-target); height: var(--mly-rail-target);
  min-width: var(--mly-rail-target); min-height: var(--mly-rail-target);
  box-sizing: border-box; display: flex; align-items: center; justify-content: center;
  padding: 0; margin: 0; border: 1px solid transparent; border-radius: 8px;
  background: transparent; color: #d8e9df; cursor: pointer; touch-action: manipulation;
}
.mly-control-rail .mly-rail-button[aria-pressed="true"],
.mly-control-rail .mly-rail-button[aria-expanded="true"] {
  background: #2e6247; border-color: #78bc94; color: #fff;
}
.mly-control-rail .mly-rail-button:disabled { opacity: .4; cursor: default; }
.mly-control-rail .mly-rail-button:focus-visible { outline: 2px solid #c1ffda; outline-offset: -3px; }
.mly-control-rail .mly-rail-button svg { width: 22px !important; height: 22px !important; pointer-events: none; }
.mly-control-rail .mly-rail-filter svg { width: 18px !important; height: 18px !important; }
.mly-control-rail .mly-rail-check { position: absolute; right: 2px; bottom: 0; font-size: 11px; line-height: 14px; font-weight: 700; pointer-events: none; }
@media (hover: hover) and (pointer: fine) {
  .mly-control-rail .mly-rail-button:enabled:hover { background: #355744; }
}
/* Touch targets grow on phones, tablets and hybrid devices, including narrow embedded widgets. */
@media (any-pointer: coarse), (max-width: 480px) {
  .glass-control-panel.mly-control-rail { --mly-rail-target: 44px; }
}
@container (max-width: 480px) {
  .glass-control-panel.mly-control-rail { --mly-rail-target: 44px; }
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
