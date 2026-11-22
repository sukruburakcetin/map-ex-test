import type { CSSProperties } from "react";
import { glassStyles } from "../utils/styles";

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
  isolation: "isolate",
  zIndex: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

export const toastContainer: CSSProperties = {
  ...glassStyles.toastContainer,
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
