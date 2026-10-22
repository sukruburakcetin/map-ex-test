/** Static chart-overlay styles; dynamic pixel positions remain in the indicator renderer. */
export const elevationIndicatorStyles = {
  "needle": {
    "position": "absolute",
    "top": "6px",
    "width": "2px",
    "borderLeft": "1.5px dashed #3498db",
    "pointerEvents": "none",
    "zIndex": "10",
    "transition": "left 0.15s ease-out"
  },
  "badge": {
    "position": "absolute",
    "transform": "translateX(-50%)",
    "bottom": "20px",
    "background": "rgba(247, 243, 243, 0.9)",
    "border": "1px solid #3498db",
    "color": "#32b432",
    "padding": "2px 6px",
    "borderRadius": "4px",
    "fontSize": "8px",
    "fontWeight": "bold",
    "pointerEvents": "none",
    "zIndex": "11",
    "whiteSpace": "nowrap",
    "transition": "left 0.15s ease-out"
  },
  "altitudeColor": "#3498db"
} as const;
