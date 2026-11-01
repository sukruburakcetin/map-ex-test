/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import * as Icons from '../../components/Icons';
import type { PointCloudResult } from '../../utils/pointCloudUtils';
type Toast = (content: React.ReactNode, duration?: number, owner?: 'point-cloud-progress') => void;

/** Preserve loaded counts, crop dimensions, duplicate wording and the 6000 ms success feedback. */
export function showPointCloudLoadedFeedback(showToast: Toast, result: PointCloudResult, initialPoints: readonly unknown[], length: number, width: number): void {
    const totalPoints = result.points.length;
    const dupes = result.duplicatesRemoved;
    const visiblePoints = initialPoints.length;

    // Final success toast with dedup stats
    showToast(
      <span style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Icons.Check size={14} color="#37d582" />
          <b>Point cloud loaded:</b> {result.clusterCount} cluster{result.clusterCount !== 1 ? "s" : ""}
        </span>
        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)", paddingLeft: "20px" }}>
          {totalPoints.toLocaleString()} pts total
          {dupes > 0 ? ` · ${dupes.toLocaleString()} dupes removed` : ""}
        </span>
        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", paddingLeft: "20px" }}>
          {visiblePoints.toLocaleString()} pts visible at {length}m × {width}m
        </span>
        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", paddingLeft: "20px" }}>Use T, F, G, H, R, V to align or use calibration panel.</span>
      </span>,
      6000,
    );
}

/** Present only progress already accepted by acquisition's current-request guards.
 * Keep the progress owner and 15000 ms duration so completion can retire late progress.
 */
export function showPointCloudProgressFeedback(showToast: Toast, status: string, automatic: boolean): void {
    const loadingPrefix = automatic ? "Auto-loading next segment" : "Downloading 3D Point Cloud";
    showToast(
      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div
          style={{
            width: "12px",
            height: "12px",
            border: "2px solid rgba(255,255,255,0.3)",
            borderTopColor: "#fff",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <span>
          <b>{loadingPrefix}:</b> {status}
        </span>
      </span>,
      15000,
      "point-cloud-progress",
    );
}
