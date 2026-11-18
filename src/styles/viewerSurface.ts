import type { CSSProperties } from "react";
import { glassStyles } from "../utils/styles";
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
export const initialHeading: CSSProperties = {
  ...glassStyles.initialStateTextPrimary,
  background: "linear-gradient(90deg, #fff 0%, #37d582 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};
export const noImageIcon: CSSProperties = {
  filter: "drop-shadow(0 0 8px rgba(255,255,255,0.3))",
  color: "#fff",
  opacity: 0.9,
};
