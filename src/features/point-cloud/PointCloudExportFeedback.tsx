/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import * as Icons from '../../components/Icons';
import type { PointCloudExportNotice } from './PointCloudExport';

/** Keep export wording, visual feedback and toast duration together, separate from format writers.
 * The callback is synchronous; preparation feedback still precedes calibration reads/writer execution.
 */
export function showPointCloudExportFeedback(showToast: (content: React.ReactNode, duration?: number) => void, notice: PointCloudExportNotice): void {
  if (notice.kind === 'unavailable') { showToast('No point cloud available to export.'); return; }
  const format = notice.format;
  if (notice.kind === 'preparing') {
    if (format !== 'csv') { showToast(`Preparing ${format.toUpperCase()} export…`, 10000); return; }
    showToast(
      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
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
        Preparing CSV Export...
      </span>,
      2000,
    );
    return;
  }
  if (notice.kind === 'complete') {
    if (format !== 'csv') {
      showToast(format === "las" ? "LAS exported with WGS84 UTM coordinates and RGB. Source height datum is unverified." : "PLY exported: local metric XYZ and RGB. Origin is recorded in the file.");
      return;
    }
    showToast(
      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <Icons.Check size={14} color="#37d582" />
        Point Cloud Exported!
      </span>,
      3000,
    );
    return;
  }
  showToast(format === 'csv' ? 'Export failed.' : `${format.toUpperCase()} export failed. Check that the cloud has valid coordinates${format === "las" ? " within UTM coverage" : ""}.`);
}
