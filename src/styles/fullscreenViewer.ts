import type { CSSProperties } from "react";
import { fullscreenOverlayStyle } from "../utils/styles";
export const overlay: CSSProperties = {
  ...fullscreenOverlayStyle,
  containerType: "size",
};
export const responsiveCss = `
          .mly-fullscreen-viewer.mly-minimap-expanded .minimap-container {
            width: min(420px, calc(100% - 24px)) !important; max-width: 420px !important;
            height: min(280px, 42dvh) !important;
          }
          .mly-fullscreen-viewer.mly-minimap-expanded .glass-image-utility-panel, .mly-fullscreen-viewer.mly-minimap-expanded .mly-fullscreen-location { display: none !important; }
          .mly-fullscreen-location { position: absolute; top: 12px; right: 12px; max-width: 200px; z-index: 10002; padding: 5px 7px; border-radius: 6px; background: #14251ddd; color: #e2ece7; font-size: 10px; }
          .mly-fullscreen-location button { padding: 3px 0; background: none; border: 0; color: #bdd8c8; cursor: pointer; font: inherit; }
          @media (max-width: 768px) { .mly-fullscreen-location { top: calc(76px + env(safe-area-inset-top, 0px)); right: 8px; max-width: 46%; font-size: 9px; } }
          /* Keep mobile perspective navigation clear of widget overlays. */
          @media (max-width: 768px) {
            .mly-fullscreen-viewer .minimap-container {
              top: calc(90px + env(safe-area-inset-top, 0px)) !important;
              bottom: auto !important; left: calc(8px + env(safe-area-inset-left, 0px)) !important;
              width: min(30vw, 112px) !important; max-width: 112px !important;
              height: 78px !important; border-radius: 8px !important;
            }
            .mly-fullscreen-viewer .glass-image-utility-panel {
              top: calc(178px + env(safe-area-inset-top, 0px)) !important;
              bottom: auto !important; right: auto !important;
              left: calc(8px + env(safe-area-inset-left, 0px)) !important;
              padding: 3px !important; gap: 3px !important;
              border-radius: 9px !important; background: rgba(20, 27, 24, 0.48) !important;
              box-shadow: 0 2px 8px #0003 !important;
            }
            .mly-fullscreen-viewer .mapillary-point-cloud-mode > div[role="group"] {
              left: calc(100% + 6px) !important; right: auto !important;
              top: 0 !important; bottom: auto !important;
            }
            .mly-fullscreen-viewer .glass-image-utility-panel .utility-button {
              width: 24px !important; height: 24px !important;
            }
            .mly-fullscreen-viewer .glass-image-utility-panel .utility-button svg {
              width: 14px !important; height: 14px !important;
            }
          }
          @media (max-width: 768px) and (max-height: 440px) {
            .mly-fullscreen-viewer .minimap-container {
              top: calc(78px + env(safe-area-inset-top, 0px)) !important;
              width: 96px !important; height: 64px !important;
            }
            .mly-fullscreen-viewer .glass-image-utility-panel {
              top: calc(78px + env(safe-area-inset-top, 0px)) !important;
              left: calc(114px + env(safe-area-inset-left, 0px)) !important;
            }
          }
        `;
export const locationTitle: CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};
export const minimapHeader: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: 36,
  padding: "3px 36px 3px 8px",
  boxSizing: "border-box",
  background: "#14251d",
  color: "#e2ece7",
  fontSize: 10,
};
export const coordinatesButton: CSSProperties = {
  padding: 0,
  border: 0,
  background: "none",
  color: "#bdd8c8",
  font: "inherit",
  cursor: "pointer",
};
/** Reserve space for the expanded header outside the ArcGIS-owned viewport. */
export function minimapViewport(
  minimapExpanded: boolean | undefined,
): CSSProperties {
  return {
    width: "100%",
    height: minimapExpanded ? "calc(100% - 36px)" : "100%",
    marginTop: minimapExpanded ? 36 : 0,
  };
}
export const expandButton: CSSProperties = {
  position: "absolute",
  top: 3,
  right: 3,
  zIndex: 10002,
  width: 26,
  height: 26,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid #ffffff45",
  borderRadius: 4,
  background: "#17251ede",
  color: "white",
  cursor: "pointer",
};
