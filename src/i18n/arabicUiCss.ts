/** Scope bidi text to widget-owned Arabic UI. Map/viewer coordinates and scroll math stay physical. */
export const arabicUiCss = `
.widget-mapillary[dir="rtl"], .mly-fullscreen-viewer[dir="rtl"], .widget-setting-mapillary[dir="rtl"], .mly-travel-backdrop[dir="rtl"] { text-align:start; }
.widget-mapillary[dir="rtl"] input[type="number"], .widget-setting-mapillary[dir="rtl"] input[type="number"],
.widget-mapillary[dir="rtl"] input[type="url"], .widget-setting-mapillary[dir="rtl"] input[type="url"],
.widget-setting-mapillary[dir="rtl"] input[placeholder^="https://"], .widget-setting-mapillary[dir="rtl"] input[placeholder*="mapillary_user"] { direction:ltr; unicode-bidi:isolate; text-align:left; }
.widget-mapillary[dir="rtl"] canvas, .mly-fullscreen-viewer[dir="rtl"] canvas { direction:ltr; }
.mly-travel-backdrop[dir="rtl"] .mly-travel-frame, .mly-travel-backdrop[dir="rtl"] input[type="range"] { direction:ltr; }
`;
