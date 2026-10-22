/** GlassSelect presentation only; menu lifecycle, portals and input handling stay in the component. */
import type { React } from 'jimu-core';

export const base: React.CSSProperties = {
    position: "relative",
    display: "inline-block",
    width: "100%",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    fontSize: "10px",
    userSelect: "none",
    WebkitUserSelect: "none",
};

export const controlStyle = (accent: string, open: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "4px",
    padding: "3px 6px",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: `1px solid ${open ? accent : "rgba(255,255,255,0.15)"}`,
    borderRadius: open ? "6px 6px 0 0" : "6px",
    color: "#fff",
    cursor: "pointer",
    minHeight: "24px",
    boxShadow: open ? `0 0 8px ${accent}55` : "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    boxSizing: "border-box" as const,
    minWidth: "130px",
});

export const menuStyle = (accent: string, placement: "top" | "bottom"): React.CSSProperties => ({
    fontFamily: '"Segoe UI", system-ui, sans-serif',
    fontSize: "10px",
    lineHeight: 1.4,
    position: "absolute",
    [placement === "top" ? "bottom" : "top"]: "100%",
    left: 0,
    right: 0,
    zIndex: 99999,
    maxHeight: "200px",
    overflowY: "auto",
    background: "rgba(15,15,15,0.92)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    border: `1px solid ${accent}66`,
    borderTop: placement === "top" ? `1px solid ${accent}66` : "none",
    borderBottom: placement === "bottom" ? `1px solid ${accent}66` : "none",
    borderRadius: placement === "top" ? "6px 6px 0 0" : "0 0 6px 6px",
    boxShadow: `0 8px 24px rgba(0,0,0,0.5), 0 0 12px ${accent}33`,
    scrollbarWidth: "thin" as const,
    scrollbarColor: `${accent}55 transparent`,
});

export const optionStyle = (hovered: boolean, selected: boolean, accent: string): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "5px 8px",
    cursor: "pointer",
    color: selected ? "#fff" : "rgba(255,255,255,0.82)",
    background: selected
        ? `${accent}33`
        : hovered
        ? "rgba(255,255,255,0.08)"
        : "transparent",
    fontWeight: selected ? 600 : 400,
    borderLeft: selected ? `2px solid ${accent}` : "2px solid transparent",
    transition: "background 0.1s",
    boxSizing: "border-box" as const,
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
});

export const chevron = (open: boolean, accent: string): React.CSSProperties => ({
    flexShrink: 0,
    width: "8px",
    height: "8px",
    borderRight: `1.5px solid ${open ? accent : "rgba(255,255,255,0.5)"}`,
    borderBottom: `1.5px solid ${open ? accent : "rgba(255,255,255,0.5)"}`,
    transform: open ? "rotate(-135deg) translateY(2px)" : "rotate(45deg) translateY(-2px)",
    transition: "transform 0.2s, border-color 0.15s",
    marginLeft: "2px",
});
