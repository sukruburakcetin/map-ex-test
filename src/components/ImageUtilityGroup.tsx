/** @jsx jsx */
import { React, jsx } from "jimu-core";
import { glassStyles } from "../utils/styles";
import { imageUtilityInteractionCss, pointCloudModeCss, imageUtilityPanelStyle } from '../styles/controlPanels';
import * as Icons from "./Icons";
import { ImageUtilityGroupProps } from "./types";

/**
    * ImageUtilityGroup
    * Floating vertical button strip rendered inside the viewer area.
    * Contains: Time Travel, Share, Download, Sync Heading, Center Map.
    * Each button is independently hidden via config flags.
*/
export const ImageUtilityGroup: React.FC<ImageUtilityGroupProps> = ({
    // config flags
    hideTimeTravel,
    hideShareButton,
    hideImageDownload,
    hideSyncHeadingButton,
    hideCenterMapButton,
    hidePointCloud,
    // state
    hasTimeTravel,
    isDownloading,
    syncHeading,
    is3D,
    imageId,
    sequenceImages,
    pointCloudFollowImages,
    onPointCloudFollowImagesChange,
    pointCloudLoading,
    pointCloudAutoPaused,
    pointCloudActive,
    pointCloudVisible,
    pointCloudAvailable,
    // callbacks
    onTimeTravel,
    onShare,
    onDownload,
    onToggleSyncHeading,
    onCenterMap,
    onTogglePointCloud,
}) => (
    <div
        className="glass-image-utility-panel"
        style={imageUtilityPanelStyle}
    >
<style>{imageUtilityInteractionCss}</style>
        {/* 1. Time Travel */}
        {!hideTimeTravel && hasTimeTravel && (
            <button
                className="utility-button"
                title="Open in Mapillary Time Travel"
                onClick={() => {
                    const currentImg = sequenceImages.find(i => i.id === imageId);
                    if (currentImg) onTimeTravel(currentImg.lat, currentImg.lon, imageId!);
                }}
                style={glassStyles.getButtonStyle(true, "rgba(240, 185, 5, 0.3)")}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.15)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1.05)")}
            >
                <Icons.TimeTravel style={{ color: "#FFD700" }} />
            </button>
        )}

        {/* 2. Share */}
        {!hideShareButton && (
            <button
                className="utility-button"
                title="Share current view"
                onClick={onShare}
                style={glassStyles.getButtonStyle(false, "rgba(255, 255, 255, 0.2)")}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.15)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            >
                <Icons.Share />
            </button>
        )}

        {/* 3. Download */}
        {!hideImageDownload && (
            <button
                className="utility-button"
                title="Download current image (High Res)"
                onClick={onDownload}
                style={glassStyles.getButtonStyle(false, "rgba(255, 255, 255, 0.2)")}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.15)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            >
                {isDownloading ? (
                    <div style={{
                        width: "14px",
                        height: "14px",
                        border: "2px solid #fff",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                    }} />
                ) : (
                    <Icons.Download />
                )}
            </button>
        )}

        {/* 4. Sync Heading (3D only) */}
        {is3D && !hideSyncHeadingButton && (
            <button
                className="utility-button"
                title={syncHeading ? "Lock Map Rotation (Fixed North)" : "Rotate The Map With the Camera"}
                onClick={onToggleSyncHeading}
                style={{
                    ...glassStyles.getButtonStyle(syncHeading, "rgba(52, 152, 219, 0.9)"),
                    boxShadow: syncHeading ? "0 0 10px rgba(52, 152, 219, 0.6)" : "none",
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.15)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            >
                {syncHeading ? <Icons.CompassLocked /> : <Icons.CompassUnlocked />}
            </button>
        )}

        {/* 5. Center Map */}
        {!hideCenterMapButton && (
            <button
                className="utility-button"
                title="Center map on current frame"
                onClick={onCenterMap}
                style={glassStyles.getButtonStyle(false, "rgba(255, 255, 255, 0.2)")}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.15)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            >
                <Icons.Crosshair size={16} />
            </button>
        )}

        {/* 6. Point Cloud, 3D only, hidden when no sfm_cluster or config hides it */}
        {is3D && !hidePointCloud && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, position: "relative", pointerEvents: "auto" }}>
            <button
                className="utility-button"
                title={
                    pointCloudLoading
                        ? "Cancel point-cloud loading"
                        : pointCloudAvailable === false
                        ? "No point cloud available for this image"
                        : (pointCloudVisible || pointCloudActive)
                        ? `Point cloud ${pointCloudAutoPaused ? "PAUSED" : pointCloudFollowImages ? "AUTO" : "ON"} — click to close`
                        : `Load point cloud (${pointCloudFollowImages ? "auto-follow" : "current image"})`
                }
                onClick={pointCloudAvailable === false && !pointCloudLoading && !pointCloudVisible && !pointCloudActive ? undefined : onTogglePointCloud}
                aria-label={pointCloudLoading ? "Cancel point-cloud loading" : (pointCloudVisible || pointCloudActive) ? "Close point cloud" : "Load point cloud"}
                aria-pressed={(!!pointCloudVisible || !!pointCloudActive) || !!pointCloudLoading}
                style={{
                    ...glassStyles.getButtonStyle(
                        (!!pointCloudVisible || !!pointCloudActive),
                        "rgba(120, 80, 255, 0.45)"
                    ),
                    position: "relative",
                    opacity: pointCloudAvailable === false && !pointCloudLoading && !pointCloudVisible && !pointCloudActive ? 0.35 : 1,
                    cursor: pointCloudAvailable === false && !pointCloudLoading && !pointCloudVisible && !pointCloudActive
                        ? "default"
                        : "pointer",
                    boxShadow: pointCloudVisible
                        ? "0 0 10px rgba(120, 80, 255, 0.5)"
                        : "none",
                }}
                onMouseEnter={e => {
                    if (!pointCloudLoading && pointCloudAvailable !== false)
                        e.currentTarget.style.transform = "scale(1.15)";
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = pointCloudVisible
                        ? "scale(1.1)"
                        : "scale(1)";
                }}
            >
                {pointCloudLoading ? (
                    <div style={{
                        width: "14px",
                        height: "14px",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "rgba(120, 80, 255, 0.9)",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                    }} />
                ) : (
                    <Icons.PointCloud size={16} />
                )}
                {(!pointCloudLoading && (pointCloudVisible || pointCloudActive)) && <span aria-hidden="true" style={{ position: "absolute", bottom: -3, left: "50%", transform: "translateX(-50%)", borderRadius: 3, padding: "1px 3px", background: pointCloudLoading ? "#614523" : "#315e43", color: "white", fontSize: 6, fontWeight: 700, lineHeight: 1.2, pointerEvents: "none" }}>{pointCloudLoading ? "CANCEL" : pointCloudAutoPaused ? "PAUSED" : pointCloudFollowImages ? "AUTO" : "ON"}</span>}
            </button>
                {pointCloudVisible && <details
                  className="mapillary-point-cloud-mode"
                  style={{ position: "relative", pointerEvents: "auto", flexShrink: 0, width: 12, overflow: "visible" }}
                  onKeyDown={event => { if (event.key === "Escape") { event.currentTarget.open = false; event.currentTarget.querySelector("summary")?.focus(); } }}
                  >
                  <style>{pointCloudModeCss}</style>
                  <summary aria-label="Choose point-cloud mode" title={`Point-cloud mode: ${pointCloudFollowImages ? "Auto-follow" : "Current image"}`} style={{ listStyle: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, width: 12, minWidth: 12, height: 24, boxSizing: "border-box", cursor: "pointer", pointerEvents: "auto", padding: "2px", borderRadius: 5, background: "rgba(86,62,144,0.9)", border: "1px solid rgba(200,184,255,0.6)", color: "#fff", fontSize: 7, fontWeight: 700 }}><svg aria-hidden="true" width="10" height="6" viewBox="0 0 10 6" style={{ display: "block", flexShrink: 0 }}><path d="M1 1 L5 5 L9 1" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg></summary>
                  <div role="group" aria-label="Point-cloud mode" style={{ position: "absolute", bottom: "calc(100% + 5px)", right: 0, zIndex: 10003, width: 142, boxSizing: "border-box", padding: 5, borderRadius: 6, border: "1px solid #638974", background: "#17241e", color: "#e2ece7", boxShadow: "0 4px 14px rgba(0,0,0,0.4)", display: "flex", flexDirection: "column", gap: 3 }}>
                    {[{ label: "Current image", follow: false }, { label: "Auto-follow", follow: true }].map(mode => <button
                      key={mode.label} type="button" aria-pressed={!!pointCloudFollowImages === mode.follow}
                      title={mode.follow ? "Fetch point clouds automatically as you browse images" : "Close point cloud when you change images"}
                      onClick={event => {
                        event.stopPropagation();
                        const menu = event.currentTarget.closest("details"); if (menu) menu.open = false;
                        if (!!pointCloudFollowImages !== mode.follow) onPointCloudFollowImagesChange?.(mode.follow);
                      }}
                      style={{ width: "100%", minHeight: 28, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 6, padding: "5px 6px", borderRadius: 4, border: "1px solid transparent", background: !!pointCloudFollowImages === mode.follow ? "#294e3a" : "transparent", color: "#e2ece7", cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 500, lineHeight: 1.3, textAlign: "left", whiteSpace: "nowrap" }}>
                      <span aria-hidden="true" style={{ width: 12, flexShrink: 0, pointerEvents: "none" }}>{!!pointCloudFollowImages === mode.follow ? "✓" : ""}</span><span style={{ pointerEvents: "none" }}>{mode.label}</span>
                    </button>)}
                  </div>
                </details>}

            </div>
        )}
        {is3D && !hidePointCloud && pointCloudLoading && <button type="button" aria-label="Cancel point-cloud loading" onClick={onTogglePointCloud} style={{ pointerEvents: "auto", position: "relative", zIndex: 10001, gridColumn: "1 / -1", minHeight: 24, padding: "3px 5px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.35)", background: "#493d36", color: "white", cursor: "pointer", fontSize: 10, fontWeight: 600 }}>Cancel</button>}
    </div>
);
