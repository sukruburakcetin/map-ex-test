/** @jsx jsx */
import { OwnedMessage } from '../../i18n/WidgetLocale';
import { React, jsx } from 'jimu-core';
import * as Icons from '../../components/Icons';
import type { PointCloudExportNotice } from './PointCloudExport';

/** Keep export wording, visual feedback and toast duration together, separate from format writers.
 * The callback is synchronous; preparation feedback still precedes calibration reads/writer execution.
 */
export function showPointCloudExportFeedback(showToast: (content: React.ReactNode, duration?: number) => void, notice: PointCloudExportNotice): void {
  if (notice.kind === 'unavailable') { showToast(<OwnedMessage source={"No point cloud available to export."}/>); return; }
  const format = notice.format;
  if (notice.kind === 'preparing') {
    if (format !== 'csv') { showToast(<OwnedMessage source={"Preparing {value0} export…"} values={{value0:String(format.toUpperCase())}}/>, 10000); return; }
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
         <OwnedMessage source={"Preparing CSV Export..."}/> </span>,
      2000,
    );
    return;
  }
  if (notice.kind === 'complete') {
    if (format !== 'csv') {
      showToast(format === "las" ? <OwnedMessage source={"LAS exported with WGS84 UTM coordinates and RGB. Source height datum is unverified."}/> : <OwnedMessage source={"PLY exported: local metric XYZ and RGB. Origin is recorded in the file."}/>);
      return;
    }
    showToast(
      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <Icons.Check size={14} color="#37d582" />
         <OwnedMessage source={"Point Cloud Exported!"}/> </span>,
      3000,
    );
    return;
  }
  showToast(format === 'csv' ? <OwnedMessage source={"Export failed."}/> : <OwnedMessage source={"{value0} export failed. Check that the cloud has valid coordinates{value1}."} values={{value0:String(format.toUpperCase()),value1:String(format === "las" ? " within UTM coverage" : "")}}/>);
}
