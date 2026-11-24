import type { CSSProperties } from "react";

export const widgetContainer: CSSProperties = {
  width: "100%",
  height: "100%",
  position: "relative",
  display: "flex",
  flexDirection: "column",
  border: "none",
  boxSizing: "border-box",
  overflow: "hidden",
  margin: "0",
  padding: "0",
  containerType: "size",
};

export const mapConnectionHost: CSSProperties = { display: "none" };

export const profileFlowDock: CSSProperties = {
  display: "none",
  flex: "0 0 auto",
  width: "100%",
  minHeight: 0,
  minWidth: 0,
  overflow: "hidden",
  boxSizing: "border-box",
  borderBottom: "1px solid rgba(127,127,127,0.25)",
};

export const viewerWorkspace: CSSProperties = {
  flex: "1 1 0",
  minHeight: 0,
  minWidth: 0,
  position: "relative",
  containerType: "size",
  containerName: "mly-viewer-pane",
  isolation: "isolate",
  zIndex: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const baseToastStyle: CSSProperties = {
    position: "absolute",
    bottom: "40px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "rgba(20, 20, 30, 0.85)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "12px",
    padding: "clamp(6px, 1.5cqw, 8px) clamp(12px, 3cqw, 16px)",
    color: "#fff",
    fontSize: "clamp(9px, 2.2cqw, 11px)",
    fontWeight: 500,
    zIndex: 99999,
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    whiteSpace: "nowrap",
    animation: "fadeIn 0.2s ease-out"
};

export const toastContainer: CSSProperties = {
  ...baseToastStyle,
  top: undefined,
  display: "flex",
  alignItems: "center",
  gap: 10,
  maxWidth: "calc(100% - 24px)",
  width: "max-content",
  whiteSpace: "normal",
  boxSizing: "border-box",
};

export const loadingToastContainer: CSSProperties = {
  ...toastContainer,
  top: 12,
  bottom: "auto",
};

export const toastMessage: CSSProperties = {
  flex: "1 1 auto",
  minWidth: 0,
  maxWidth: "100%",
  whiteSpace: "normal",
  overflowWrap: "anywhere",
};

export const missingMapContainer: CSSProperties = {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(15, 15, 20, 0.85)",
    backdropFilter: "blur(5px)",
    WebkitBackdropFilter: "blur(5px)",
    zIndex: 10005,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px"
};

export const missingMapCard: CSSProperties = {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "8px",
    padding: "20px",
    maxWidth: "280px",
    textAlign: "center",
    color: "#fff",
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
};

export const missingMapIcon: CSSProperties = {
    color: "#ffc107",
    marginBottom: "12px",
    display: "flex",
    justifyContent: "center"
};

export const missingMapTitle: CSSProperties = {
    margin: "0 0 10px 0",
    fontSize: "15px",
    color: "rgba(232, 190, 20, 0.7)",
    fontWeight: 600,
    letterSpacing: "0.5px"
};

export const missingMapText: CSSProperties = {
    margin: "0 0 15px 0",
    fontSize: "12px",
    color: "rgba(255,255,255,0.7)",
    lineHeight: "1.5"
};

export const missingMapInstructionsBox: CSSProperties = {
    background: "rgba(0, 0, 0, 0.4)",
    borderRadius: "6px",
    padding: "12px",
    textAlign: "left",
    border: "1px solid rgba(255,255,255,0.05)"
};

export const missingMapInstructionsTitle: CSSProperties = {
    fontSize: "11px",
    fontWeight: 700,
    color: "#37d582",
    marginBottom: "8px",
    letterSpacing: "0.5px"
};

export const missingMapInstructionsList: CSSProperties = {
    margin: 0,
    paddingLeft: "18px",
    fontSize: "11px",
    color: "rgba(255,255,255,0.85)",
    lineHeight: "1.8"
};
