/** Point-cloud display-control styles. Existing legacy styles remain in their original module. */
import type { React } from 'jimu-core';

/** Point-cloud diagnostics and adaptive-display controls; acquisition/follow behavior remains runtime-owned. */
export function getCloudAdaptiveButtonStyle(pointCloudAdaptive: boolean | undefined): React.CSSProperties { return { pointerEvents: "auto", marginTop: 4, width: 96, minHeight: 26, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4, padding: "5px 6px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.15)", background: pointCloudAdaptive ? "rgba(26,109,66,0.85)" : "rgba(35,35,35,0.75)", color: "rgba(255,255,255,0.85)", cursor: "pointer", fontSize: 8, fontWeight: 600 }; }
export function getCloudAdaptiveTrackStyle(pointCloudAdaptive: boolean | undefined): React.CSSProperties { return { width: 17, height: 9, flexShrink: 0, borderRadius: 6, background: pointCloudAdaptive ? "#37d582" : "#727272", padding: 1, boxSizing: "border-box" }; }
export function getCloudAdaptiveThumbStyle(pointCloudAdaptive: boolean | undefined): React.CSSProperties { return { display: "block", width: 7, height: 7, borderRadius: "50%", background: "white", transform: pointCloudAdaptive ? "translateX(8px)" : "translateX(0)", transition: "transform 120ms ease" }; }
export function getCloudStatusCardStyle(pointCloudIncomplete: boolean | undefined): React.CSSProperties { return { pointerEvents: "auto", width: 96, boxSizing: "border-box", marginTop: 4, padding: "5px 6px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(20,20,20,0.8)", color: pointCloudIncomplete ? "#ffcc86" : "#a7d5be", fontSize: 8, lineHeight: 1.4 }; }
export const cloudPreviousBadgeStyle: React.CSSProperties = { marginBottom: 4, fontWeight: 600, color: "#ffcc86" };
export const cloudStatusSummaryStyle: React.CSSProperties = { cursor: "pointer", fontWeight: 600 };
export const cloudStatusDetailsStyle: React.CSSProperties = { marginTop: 4, overflowWrap: "anywhere" };
export const cloudStatusVisibleStyle: React.CSSProperties = { marginTop: 3 };
export function getCloudStatusRetryStyle(pointCloudLoading: boolean | undefined): React.CSSProperties { return { width: "100%", minHeight: 20, marginTop: 4, fontSize: 8, fontWeight: 600, padding: "3px 5px", background: "#214532", border: "1px solid #638974", borderRadius: 4, color: "#d3eadb", cursor: pointCloudLoading ? "wait" : "pointer", opacity: pointCloudLoading ? 0.6 : 1 }; }
