/** Style only imagery buttons; the popup shell and all other content use SDK defaults. */
export const PLACE_POPUP_CSS = `
.mly-place-popup button.mly-place-open{box-sizing:border-box;display:block;width:100%;min-height:34px;margin:10px 0 0;padding:8px 10px;border:1px solid #c8cdd2;border-radius:5px;background:#fff;color:#25313d;font-family:inherit;font-weight:500;font-size:12px;line-height:1.35;text-align:left;white-space:normal;overflow-wrap:anywhere;cursor:pointer}
.mly-place-popup button.mly-place-open-primary{background:#f2f4f6;border-color:#9da7b1;color:#1f2933;font-weight:600}
.mly-place-popup button.mly-place-open:hover{background:#e9edf1;border-color:#89939c}
.mly-place-popup button.mly-place-open:disabled{opacity:.6;cursor:wait}
.mly-place-popup button.mly-place-open:focus-visible{outline:2px solid #2765a5;outline-offset:2px}
`;
