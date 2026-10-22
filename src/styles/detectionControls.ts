import type { React } from 'jimu-core';
/** Detection-control presentation; data export, overlays and labels remain runtime-owned. */
export const detectionExportButtonStyle: React.CSSProperties = { boxSizing: "border-box",
    marginTop: "4px",
    background: "rgba(55, 213, 130, 0.3)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    color: "#fff",
    borderRadius: "6px",
    fontSize: "9px",
    cursor: "pointer",
    width: "96px",
    fontWeight: 600,
    letterSpacing: "0.5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    pointerEvents: "auto",
    transition: "all 0.2s ease-in-out",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
};
export const detectionExportLabelStyle: React.CSSProperties = { fontWeight: 700 };
export function detectionOverlayButtonStyle(detectionsActive: boolean): React.CSSProperties {
    return { boxSizing: "border-box",
        marginTop: "4px",
        background: detectionsActive ? "rgba(55, 213, 130, 0.8)" : "rgba(55, 213, 130, 0.3)",
        color: "white",
        borderRadius: "6px",
        width: "96px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "auto",
        backdropFilter: "blur(5px)",
        transition: "background 0.2s",
    };
}
export const detectionOverlayLabelStyle: React.CSSProperties = { fontSize: "8.5px", marginLeft: "3px", fontWeight: 700 };
export function detectionLabelsButtonStyle(showAiTags: boolean): React.CSSProperties {
    return { boxSizing: "border-box",
        background: showAiTags ? "rgba(55, 213, 130, 0.25)" : "rgba(25, 30, 32, 0.65)",
        border: "1px solid rgba(1, 1, 1, 0.7)",
        marginTop: "2px",
        color: "white",
        borderRadius: "6px",
        width: "96px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(5px)",
        pointerEvents: "auto",
        minHeight: "32px",
        gap: "5px",
        fontSize: "11px",
    };
}
