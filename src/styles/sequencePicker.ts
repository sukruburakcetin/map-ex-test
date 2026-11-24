import type { React } from "jimu-core";

export const sequencePickerStyles = {
    // The horizontal "revolver" style picker at the top of the viewer for selecting different sequences.
    sequencePickerContainer: {
        background: "rgba(20, 20, 30, 0.65)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        padding: "3px 4px",
        borderRadius: "20px",
        border: "1px solid rgba(150, 150, 150, 0.3)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        gap: "4px",
        justifyContent: "center",
        marginTop: "2px",
        overflow: "hidden"
    } as React.CSSProperties,

    // Styling for individual sequence items in the picker.
    sequenceSlot: (isActive: boolean): React.CSSProperties => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        padding: "3px 8px",
        borderRadius: "12px",
        cursor: "pointer",
        background: isActive ? "rgba(255, 255, 255, 0.35)" : "transparent",
          border: isActive
        ? "1px solid rgba(210, 210, 210, 0.20)"
        : "1px solid rgba(175,175,175,0.3)",
        boxShadow: isActive
        ? "inset 0 2px 4px rgba(0,0,0,0.5)"
        : "1px 1px 1px 1px",
        transition: "all 0.15s ease",
        flex: "1 1 0",
        minWidth: "0"
    }),

    sequenceArrow: {
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        color: "#fff",
        borderRadius: "50%",
        width: "18px",
        height: "18px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: "9px",
        transition: "background 0.2s"
    } as React.CSSProperties,

    sequenceDot: (color: string): React.CSSProperties => ({
        display: "inline-block",
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        backgroundColor: color,
        border: "1px solid rgba(255,255,255,0.8)",
        boxShadow: "0 0 4px rgba(0,0,0,0.5)",
        flexShrink: 0
    }),

    sequenceText: {
        whiteSpace: "nowrap",
        fontSize: "9px",
        color: "#fff",
        fontWeight: 500,
        textShadow: "0 1px 2px rgba(0,0,0,0.5)",
        overflow: "hidden",
        textOverflow: "ellipsis"
    } as React.CSSProperties,
};
