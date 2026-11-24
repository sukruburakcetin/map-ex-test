import type { CSSProperties } from "react";
export const container: CSSProperties = {
  position: "absolute",
  height: "var(--tray-height)",
  boxSizing: "border-box",
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 999999990,
  background: "var(--mly-theme-panel, rgba(12,12,12,0.92))",
  backdropFilter: "blur(10px)",
  borderTop: "1px solid var(--mly-theme-border, rgba(255,255,255,0.1))",
  padding: "6px 8px",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  animation: "nearbySlideUp 0.2s ease-out",
};
export const responsiveCss = `
                            .mapillary-image-tray { --tray-height:176px; --tray-image-height:104px; --tray-card-width:clamp(140px,25vw,220px); }
                            @media(max-width:600px),(max-height:500px) { .mapillary-image-tray { --tray-height:148px; --tray-image-height:76px; --tray-card-width:160px; } }

                            @keyframes nearbySlideUp {
                                from { transform: translateY(100%); opacity: 0; }
                                to   { transform: translateY(0);    opacity: 1; }
                            }
                        `;
export const header: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  height: "24px",
  flexShrink: 0,
  fontSize: "9px",
  color: "rgba(255,255,255,0.45)",
};
export const tabs: CSSProperties = { display: "flex", gap: 8 };
/** Apply the active-tab color without changing button geometry. */
export function tab(selected: boolean): CSSProperties {
  return {
    background: "none",
    border: 0,
    color: selected ? "var(--mly-theme-accent, #8bdbb7)" : "var(--mly-theme-muted, #bbb)",
    padding: "6px",
    cursor: "pointer",
  };
}
export const searchMore: CSSProperties = {
  fontSize: 9,
  padding: "2px 5px",
  border: "1px solid var(--mly-theme-border, #648b73)",
  borderRadius: 4,
  background: "var(--mly-theme-control, #214233)",
  color: "var(--mly-theme-text, #e1eee5)",
  cursor: "pointer",
};
export const close: CSSProperties = {
  background: "none",
  border: "none",
  color: "rgba(255,255,255,0.4)",
  cursor: "pointer",
  fontSize: "11px",
  padding: "0 2px",
  lineHeight: 1,
};
/** Hide the nearby panel without unmounting its scroll container. */
export function nearbyRow(hidden: boolean): CSSProperties {
  return {
    display: hidden ? "none" : "flex",
    flex: "1 1 0",
    minHeight: 0,
    alignItems: "flex-start",
    overflowY: "hidden",
    gap: "5px",
    overflowX: "auto",
    scrollSnapType: "x mandatory",
    scrollbarWidth: "thin",
    scrollbarColor: "var(--mly-theme-border, rgba(255,255,255,0.2)) transparent",
    paddingBottom: "2px",
  };
}
export const nearbyLoading: CSSProperties = {
  fontSize: 11,
  padding: 8,
  color: "var(--mly-theme-muted, #b5ccbf)",
};
/** Highlight the pending capture while the current viewer image is unchanged. */
export function nearbyCard(isCurrent: boolean): CSSProperties {
  return {
    flex: "0 0 auto",
    width: "var(--tray-card-width)",
    scrollSnapAlign: "start",
    cursor: "pointer",
    borderRadius: "5px",
    overflow: "hidden",
    border: isCurrent ? "2px solid var(--mly-theme-accent, #05a056)" : "2px solid transparent",
    position: "relative",
    transition: "transform 0.12s",
  };
}
export const nearbyThumbnail: CSSProperties = {
  width: "100%",
  height: "var(--tray-image-height)",
  objectFit: "cover",
  display: "block",
};
export const caption: CSSProperties = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  background: "linear-gradient(transparent, rgba(0,0,0,0.78))",
  padding: "10px 4px 3px",
  fontSize: "8px",
  color: "var(--mly-theme-text, rgba(255,255,255,0.85))",
  lineHeight: 1.3,
};
export const creator: CSSProperties = {
  fontWeight: 600,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};
export const captureDate: CSSProperties = { opacity: 0.7 };
/** Hide the associated panel without discarding its scroll position. */
export function associatedRow(visible: boolean): CSSProperties {
  return {
    display: visible ? "flex" : "none",
    gap: 6,
    flex: "1 1 0",
    minHeight: 0,
    overflowX: "auto",
    overflowY: "hidden",
    alignItems: "flex-start",
    color: "var(--mly-theme-text, #ddd)",
    fontSize: 12,
  };
}
export const associatedStatus: CSSProperties = { alignSelf: "center" };
/** Mark the associated capture currently displayed in the viewer. */
export function associatedCard(selected: boolean): CSSProperties {
  return {
    flex: "0 0 auto",
    width: "var(--tray-card-width)",
    padding: 0,
    transition: "transform 0.12s",
    background: "var(--mly-theme-control, #182321)",
    color: "var(--mly-theme-text, #ddd)",
    border: selected ? "2px solid var(--mly-theme-accent, #05a056)" : "2px solid transparent",
    borderRadius: 5,
    overflow: "hidden",
    cursor: "pointer",
  };
}
export const associatedPreview: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "var(--tray-image-height)",
  background: "var(--mly-theme-panel, #0f1618)",
};
export const associatedImageFrame: CSSProperties = {
  display: "inline-block",
  position: "relative",
  lineHeight: 0,
};
export const associatedThumbnail: CSSProperties = {
  width: "auto",
  height: "auto",
  maxWidth: "var(--tray-card-width)",
  maxHeight: "var(--tray-image-height)",
  display: "block",
};
export const detectionOutline: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
};
export const associatedCaption: CSSProperties = {
  display: "block",
  padding: "3px 4px",
  height: 20,
  boxSizing: "border-box",
  fontSize: 10,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};
