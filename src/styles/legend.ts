import type { React } from "jimu-core";

// Used to create the small colored dots in the map legend (e.g., green for active frame, blue for sequence).
export const legendCircleStyle = (color: string): React.CSSProperties => ({
    display: "inline-block",
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: color,
    marginRight: "4px",
    border: "1px solid rgba(255,255,255,0.3)", // Softer border
    flexShrink: 0    // Prevents circle from squishing
});

export const legendRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '2px'
};

export const legendTextStyle: React.CSSProperties = {
    fontSize: '9px',
    color: 'rgba(255,255,255,0.9)',
    whiteSpace: 'nowrap',
    fontWeight: 400
};

export const compactButtonStyle: React.CSSProperties = {
    marginTop: '4px',
    background: 'rgba(217, 83, 79, 0.2)',
    border: '1px solid rgba(217, 83, 79, 0.3)',
    color: '#ff908d',
    borderRadius: '2px',
    fontSize: '8px',
    padding: '2px 0',
    cursor: 'pointer',
    width: '100%',
    fontWeight: 700
};
