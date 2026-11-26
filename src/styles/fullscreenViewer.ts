import type { CSSProperties } from "react";

export const overlay: CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "#000",
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    containerType: "size"
};

export const getMinimapContainerStyle = (showMinimap: boolean): CSSProperties => ({
    position: 'absolute',
    bottom: '30px',
    left: '30px',
    width: '330px',
    height: '220px',
    background: "rgba(20, 20, 20, 0.4)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "5px",
    overflow: "hidden",
    boxShadow: `
        0 8px 32px 0 rgba(0, 0, 0, 0.6),
        inset 0 0 0 1px rgba(255, 255, 255, 0.05)
    `,
    zIndex: 10001,
    visibility: showMinimap ? 'visible' : 'hidden',
    opacity: showMinimap ? 1 : 0,
    pointerEvents: showMinimap ? 'auto' : 'none',
    transition: "all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)",
    transform: showMinimap ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
});

export const responsiveCss = `
          .mly-fullscreen-viewer.mly-minimap-expanded .minimap-container {
            width: min(420px, calc(100% - 24px)) !important; max-width: 420px !important;
            height: min(280px, 42dvh) !important;
          }
          .mly-fullscreen-viewer.mly-minimap-expanded .glass-image-utility-panel, .mly-fullscreen-viewer.mly-minimap-expanded .mly-fullscreen-location { display: none !important; }
          .mly-fullscreen-location { position: absolute; top: 12px; right: 12px; max-width: 200px; z-index: 10002; padding: 5px 7px; border-radius: 6px; background: var(--mly-theme-chrome, #14251ddd); color: var(--mly-theme-text, #e2ece7); font-size: 10px; }
          .mly-fullscreen-location button { padding: 3px 0; background: none; border: 0; color: var(--mly-theme-muted, #bdd8c8); cursor: pointer; font: inherit; }
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
              border-radius: 9px !important; background: var(--mly-theme-chrome, rgba(20, 27, 24, 0.48)) !important;
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
  background: "var(--mly-theme-panel, #14251d)",
  color: "var(--mly-theme-text, #e2ece7)",
  fontSize: 10,
};
export const coordinatesButton: CSSProperties = {
  padding: 0,
  border: 0,
  background: "none",
  color: "var(--mly-theme-muted, #bdd8c8)",
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
  border: "1px solid var(--mly-theme-border, #ffffff45)",
  borderRadius: 4,
  background: "var(--mly-theme-chrome, #17251ede)",
  color: "var(--mly-theme-text, #edf7f0)",
  cursor: "pointer",
};

export const fullscreenControlRailCss = `
          .glass-control-panel.mly-control-rail.mly-fullscreen-controls {
            top: calc(8px + env(safe-area-inset-top, 0px));
            left: calc(8px + env(safe-area-inset-left, 0px));
            max-height: calc(100% - 16px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)) !important;
          }
        `;
