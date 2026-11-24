import type { CSSProperties } from "react";
export const container: CSSProperties = {
  flex: 1,
  minHeight: 0,
  position: "relative",
  background: "#000",
  boxSizing: "border-box",
};
export const viewer: CSSProperties = {
  width: "100%",
  height: "100%",
  position: "relative",
};
export const lasso: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  zIndex: 1000,
  cursor: "crosshair",
  pointerEvents: "auto",
  touchAction: "none",
  userSelect: "none",
  WebkitUserSelect: "none",
};
export const measurement: CSSProperties = {
  position: "absolute",
  display: "none",
  transform: "translate(-50%, -50%)",
  background: "rgba(20, 20, 20, 0.75)",
  backdropFilter: "blur(4px)",
  border: "1px solid rgba(255, 255, 0, 0.6)",
  color: "white",
  padding: "4px 8px",
  borderRadius: "6px",
  fontSize: "11px",
  fontWeight: "bold",
  pointerEvents: "none",
  zIndex: 1000,
  textAlign: "center",
  whiteSpace: "pre-wrap",
  boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
};
export const initialStateTextPrimary: CSSProperties = {
    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.8px",
    color: "#ffffff"
};

export const initialHeading: CSSProperties = {
  ...initialStateTextPrimary,
  textShadow: "var(--mly-theme-idle-text-shadow, 0 2px 4px rgba(0,0,0,0.5))",
  background: "linear-gradient(90deg, var(--mly-theme-text, #fff) 0%, var(--mly-theme-accent, #37d582) 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};
export const noImageIcon: CSSProperties = {
  filter: "drop-shadow(0 0 8px rgba(255,255,255,0.3))",
  color: "#fff",
  opacity: 0.9,
};

export const noImageContainer: CSSProperties = {
    position: "absolute",
    top: 0, left: 0, width: "100%", height: "100%",
    display: "flex", justifyContent: "center", alignItems: "center",
    zIndex: 5,
    background: "rgba(18, 20, 24, 0.75)", // Dark slate tint
    backdropFilter: "blur(12px) grayscale(50%)",
    WebkitBackdropFilter: "blur(12px) grayscale(50%)",
    opacity: 1,
    transition: "opacity 0.6s ease-in-out"
};

export const noImageContent: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "13px",
    fontWeight: 500,
    letterSpacing: "0.5px",
    textAlign: "center",
    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
    padding: "20px 30px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.05)",
    background: "rgba(255,255,255,0.03)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
};

export const initialStateContainer: CSSProperties = {
    position: "absolute",
    top: 0, left: 0, width: "100%", height: "100%",
    display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
    zIndex: 4,
    background: "var(--mly-theme-input, rgba(0, 0, 0, 0.15))",
    backdropFilter: "blur(2px)",
    WebkitBackdropFilter: "blur(2px)",
    transition: "all 0.3s ease"
};

export const initialStateCard: CSSProperties = {
    padding: "16px 18px",
    borderRadius: "16px",
    background: "var(--mly-theme-panel, rgba(30, 30, 35, 0.6))",
    border: "1px solid var(--mly-theme-idle-border, rgba(255, 255, 255, 0.1))",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.25)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "12px",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    animation: "mly-warning-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards, targetPulse 2s infinite"
};

export const initialStateTextSecondary: CSSProperties = {
    fontSize: "10px",
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: "2px",
    display: "none",
};

export const featuresLoadingBadge: CSSProperties = {
    position: "absolute",
    bottom: "28px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 12px",
    background: "rgba(20, 20, 20, 0.55)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    pointerEvents: "none",
    whiteSpace: "nowrap",
};

export const featuresLoadingSpinner: CSSProperties = {
    width: "12px",
    height: "12px",
    border: "2px solid rgba(255,255,255,0.25)",
    borderTopColor: "#ff9500",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    flexShrink: 0,
};

export const featuresLoadingText: CSSProperties = {
    color: "rgba(255,255,255,0.85)",
    fontSize: "11px",
    fontWeight: 500,
    letterSpacing: "0.2px",
};
