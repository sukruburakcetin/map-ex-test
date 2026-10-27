/** Scope the SDK shell by its owned content; never recolor unrelated map popups. */
export const PLACE_POPUP_CSS = `
.esri-popup__main-container:has(.mly-place-popup){
  --calcite-color-background:#172b23;--calcite-color-foreground-1:#1b3128;--calcite-color-foreground-2:#243f32;
  --calcite-color-foreground-3:#2c4b3b;--calcite-color-text-1:#edf3e7;--calcite-color-text-2:#b8cdbd;
  --calcite-color-text-3:#a4bcae;--calcite-color-border-1:#49685a;--calcite-color-border-2:#395448;
  --calcite-color-brand:#b5dbb9;--calcite-color-brand-hover:#c6e6c8;--calcite-color-text-inverse:#14271f;
  background:#1b3128;color:#edf3e7;border:1px solid #49685a;border-radius:10px;
  box-shadow:0 8px 24px #08170f40;overflow:hidden;
}
.esri-popup__main-container:has(.mly-place-popup) .esri-popup__header,
.esri-popup__main-container:has(.mly-place-popup) .esri-popup__footer{background:#172b23;color:#edf3e7}
.esri-popup__main-container:has(.mly-place-popup) .esri-popup__header-title{font-size:12px;font-weight:600;letter-spacing:.01em}
.esri-popup__main-container:has(.mly-place-popup) .esri-popup__button,
.esri-popup__main-container:has(.mly-place-popup) .esri-popup__action{color:#c4dccb}
.esri-popup__main-container:has(.mly-place-popup) .esri-popup__content{margin:10px 12px}
:is(.esri-popup,arcgis-popup):has(.mly-place-popup) .esri-popup__pointer-direction{background:#1b3128}
.mly-place-popup{box-sizing:border-box;min-width:0;color:#edf3e7;background:#1b3128;font-family:inherit;font-size:12px;line-height:1.45;overflow-wrap:anywhere;color-scheme:dark}
.mly-place-popup .mly-place-name{display:block;font-size:16px;font-weight:650;line-height:1.3;color:#f3eedb;margin:0 0 5px}
.mly-place-popup .mly-place-category{display:inline-block;font-size:10px;line-height:1.3;text-transform:capitalize;color:#c4dccb;background:#294537;border:1px solid #49685a;border-radius:4px;padding:3px 6px;margin:0 0 6px}
.mly-place-popup .mly-place-address{font-size:11px;color:#b8cdbd;margin:3px 0 8px}
.mly-place-popup .mly-place-website{display:inline-block;font-size:11px;color:#b8e3d2;text-decoration:underline;text-underline-offset:3px;margin:0 0 5px}
.mly-place-popup .mly-place-open{box-sizing:border-box;display:block;width:100%;min-height:34px;margin:10px 0 0;padding:8px 10px;border:1px solid #61846e;border-radius:6px;background:#284b38;color:#edf3e7;font-family:inherit;font-weight:600;font-size:12px;line-height:1.35;text-align:left;white-space:normal;overflow-wrap:anywhere;cursor:pointer;transition:background .12s}
.mly-place-popup .mly-place-open-primary{background:#b5dbb9;color:#173426;border-color:#b5dbb9}
.mly-place-popup .mly-place-open:hover{background:#365d44}
.mly-place-popup .mly-place-open-primary:hover{background:#c6e6c8;color:#142b20}
.mly-place-popup .mly-place-open:disabled{opacity:.6;cursor:wait}
.mly-place-popup :is(button,a):focus-visible{outline:2px solid #ffda74;outline-offset:2px}
.mly-place-popup .mly-place-meta{font-size:10px;line-height:1.5;color:#b8cdbd;margin:5px 2px 9px}
.mly-place-popup .mly-place-source{font-size:10px;line-height:1.5;color:#a4bcae;border-top:1px solid #49685a80;padding-top:8px;margin:11px 0 0}
@media(prefers-reduced-motion:reduce){.mly-place-popup .mly-place-open{transition:none}}
`;
