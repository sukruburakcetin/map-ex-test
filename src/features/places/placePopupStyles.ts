/** Neutral imagery controls, overlap rows and their metadata; the popup shell uses SDK defaults. */
export const PLACE_POPUP_CSS = `
.mly-place-popup button.mly-place-open{box-sizing:border-box;display:block;width:100%;min-height:34px;margin:10px 0 0;padding:8px 10px;border:1px solid #c8cdd2;border-radius:5px;background:#fff;color:#25313d;font-family:inherit;font-weight:500;font-size:12px;line-height:1.35;text-align:left;white-space:normal;overflow-wrap:anywhere;cursor:pointer}
.mly-place-popup button.mly-place-open-primary{background:#f2f4f6;border-color:#9da7b1;color:#1f2933;font-weight:600}
.mly-place-popup button.mly-place-open:hover{background:#e9edf1;border-color:#89939c}
.mly-place-popup button.mly-place-open:disabled{opacity:.6;cursor:wait}
.mly-place-popup button.mly-place-open:focus-visible{outline:2px solid #2765a5;outline-offset:2px}
.mly-place-popup .mly-place-choice-meta{margin:4px 0 8px;font-size:11px;line-height:1.4;overflow-wrap:anywhere}
.mly-place-popup .mly-place-choice-note{margin:9px 0;font-size:11px;line-height:1.4;overflow-wrap:anywhere}
.mly-place-popup button.mly-place-group-row{display:flex;align-items:center;gap:8px;min-height:46px;margin-top:6px;padding:7px 9px}
.mly-place-popup .mly-place-group-row img{flex-shrink:0}
.mly-place-popup .mly-place-group-text{display:block;min-width:0;overflow-wrap:anywhere}
.mly-place-popup .mly-place-group-name{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;font-weight:600}
.mly-place-popup .mly-place-group-category{display:block;margin-top:2px;font-size:11px;color:#56616c}
.mly-place-popup button.mly-place-group-row[aria-current="true"]{border-color:#a18842;border-left-width:3px;background:#fff8e5}
.mly-place-popup button.mly-place-group-row[aria-current="true"]:hover{background:#fff0c5}
.mly-place-popup .mly-place-group-selected{display:inline-block;margin-top:3px;padding:1px 5px;border-radius:3px;background:#f3e0a7;color:#534215;font-size:10px;font-weight:600}
`;
