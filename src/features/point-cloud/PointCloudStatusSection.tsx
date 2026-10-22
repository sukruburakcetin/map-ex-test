/** @jsx jsx */
/** Point-cloud display controls only. InfoBox retains their independent visibility guards. */
import { React, jsx } from 'jimu-core';
import type { InfoBoxProps } from '../../components/types';
import { getCloudAdaptiveButtonStyle, getCloudAdaptiveTrackStyle, getCloudAdaptiveThumbStyle, getCloudStatusCardStyle, cloudPreviousBadgeStyle, cloudStatusSummaryStyle, cloudStatusDetailsStyle, cloudStatusVisibleStyle, getCloudStatusRetryStyle } from '../../styles/pointCloudControls';

export type PointCloudAdaptiveControlProps = Pick<InfoBoxProps, 'pointCloudAdaptive' | 'onPointCloudAdaptiveChange'>;

/** Forward the existing adaptive toggle; display sampling and scene behavior remain parent-owned. */
export const PointCloudAdaptiveControl: React.FC<PointCloudAdaptiveControlProps> = props => {
  const { pointCloudAdaptive, onPointCloudAdaptiveChange } = props;
  return (
<button
            type="button" role="switch" aria-checked={!!pointCloudAdaptive}
            aria-label="Adaptive scene display"
            title="Adaptive scene display: fewer scene points while navigating; full detail when stopped. Analysis tools retain full detail."
            onClick={() => onPointCloudAdaptiveChange?.(!pointCloudAdaptive)}
            style={getCloudAdaptiveButtonStyle(pointCloudAdaptive)}>
            <span>ADAPTIVE</span>
            <span aria-hidden="true" style={getCloudAdaptiveTrackStyle(pointCloudAdaptive)}><span style={getCloudAdaptiveThumbStyle(pointCloudAdaptive)} /></span>
          </button>
  );
};

export type PointCloudStatusProps = Pick<InfoBoxProps, 'pointCloudIncomplete' | 'pointCloudPrevious' | 'pointCloudLoading' | 'pointCloudAutoPaused' | 'onRetryPointCloud'> & { pointCloudSummary: string };

/** Present cloud diagnostics and forward Retry/Resume; no request, formatting policy or mode state is owned here. */
export const PointCloudStatus: React.FC<PointCloudStatusProps> = props => {
  const { pointCloudSummary, pointCloudIncomplete, pointCloudPrevious, pointCloudLoading, pointCloudAutoPaused, onRetryPointCloud } = props;
  return (
<div role="status" style={getCloudStatusCardStyle(pointCloudIncomplete)}>
            {pointCloudPrevious && <div style={cloudPreviousBadgeStyle}>Previous image cloud</div>}
            <details>
              <summary title={pointCloudSummary} style={cloudStatusSummaryStyle}>Cloud {pointCloudIncomplete ? "partial" : "loaded"}</summary>
              <div style={cloudStatusDetailsStyle}>{pointCloudSummary}</div>
            </details>
            <div style={cloudStatusVisibleStyle}>{pointCloudSummary.split(" · ").find(part => part.includes(" visible"))?.replace(" visible", " corridor pts")}</div>
            {pointCloudIncomplete && <button type="button" title="Retry missing discovery/downloads; the data budgets still apply" disabled={pointCloudLoading} onClick={onRetryPointCloud} style={getCloudStatusRetryStyle(pointCloudLoading)}>{pointCloudLoading ? "Retrying…" : pointCloudAutoPaused ? "Resume" : "Retry"}</button>}
          </div>
  );
};
