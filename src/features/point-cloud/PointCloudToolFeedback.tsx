/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import * as Icons from '../../components/Icons';
import type { PointCloudTool } from './PointCloudTools';

/** Keep existing tool instructions, icons and 3000/4000 ms durations; called only on enable. */
export function showPointCloudToolFeedback(showToast: (content: React.ReactNode, duration?: number) => void, tool: PointCloudTool): void {
  if (tool === 'sight') {
    showToast(<span style={{ display: "flex", alignItems: "center", gap: "6px" }}>3D Sight Mode: Click to place Observer, then click Targets.</span>, 4000);
    return;
  }
  if (tool === 'viewshed') {
    showToast(
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Icons.Viewshed size={14} /> 360° Viewshed Mode: Click on the point cloud to drop an observer.
            </span>,
            4000,
          );
    return;
  }
  if (tool === 'measure') {
    showToast(
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Icons.Measure size={14} /> 3D Measure Mode Active: Click two points.
            </span>,
            3000,
          );
    return;
  }
  if (tool === 'lasso') {
    showToast(<span style={{ display: "flex", alignItems: "center", gap: "6px" }}>Lasso Mode Active: Draw on the image to select points.</span>, 4000);
    return;
  }
}
