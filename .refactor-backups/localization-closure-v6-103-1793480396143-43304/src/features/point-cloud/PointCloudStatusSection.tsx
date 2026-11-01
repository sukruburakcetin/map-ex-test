/** @jsx jsx */
/** Point-cloud display controls only. InfoBox retains their independent visibility guards. */
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import { React, jsx } from 'jimu-core';
import type { InfoBoxProps } from '../../components/types';
import { getCloudAdaptiveButtonStyle, getCloudAdaptiveTrackStyle, getCloudAdaptiveThumbStyle, getCloudStatusCardStyle, cloudPreviousBadgeStyle, cloudStatusSummaryStyle, cloudStatusDetailsStyle, cloudStatusVisibleStyle, getCloudStatusRetryStyle } from '../../styles/pointCloudControls';

export type PointCloudAdaptiveControlProps = Pick<InfoBoxProps, 'pointCloudAdaptive' | 'onPointCloudAdaptiveChange'>;

/** Forward the existing adaptive toggle; display sampling and scene behavior remain parent-owned. */
export const PointCloudAdaptiveControl: React.FC<PointCloudAdaptiveControlProps> = props => {
 const { t, locale } = useWidgetLocale();

  const { pointCloudAdaptive, onPointCloudAdaptiveChange } = props;
  return (
<button
            type="button" role="switch" aria-checked={!!pointCloudAdaptive}
            aria-label={t('uiAdaptiveSceneDisplay')}
            title={t('uiAdaptiveSceneDisplayFewerScenePointsWhileNavigating')}
            onClick={() => onPointCloudAdaptiveChange?.(!pointCloudAdaptive)}
            style={getCloudAdaptiveButtonStyle(pointCloudAdaptive)}>
            <span> {t('uiAdaptive')} </span>
            <span aria-hidden="true" style={getCloudAdaptiveTrackStyle(pointCloudAdaptive)}><span style={getCloudAdaptiveThumbStyle(pointCloudAdaptive)} /></span>
          </button>
  );
};

export type PointCloudStatusProps = Pick<InfoBoxProps, 'pointCloudIncomplete' | 'pointCloudPrevious' | 'pointCloudLoading' | 'pointCloudAutoPaused' | 'onRetryPointCloud'> & { pointCloudSummary: string };

/** Present cloud diagnostics and forward Retry/Resume; no request, formatting policy or mode state is owned here. */
export const PointCloudStatus: React.FC<PointCloudStatusProps> = props => {
 const { t, locale } = useWidgetLocale();

  const { pointCloudSummary, pointCloudIncomplete, pointCloudPrevious, pointCloudLoading, pointCloudAutoPaused, onRetryPointCloud } = props;
  return (
<div role="status" style={getCloudStatusCardStyle(pointCloudIncomplete)}>
            {pointCloudPrevious && <div style={cloudPreviousBadgeStyle}> {t('uiPreviousImageCloud')} </div>}
            <details>
              <summary title={pointCloudSummary} style={cloudStatusSummaryStyle}> {t('uiCloud')} {pointCloudIncomplete ? t('uiPartial') : t('uiLoaded')}</summary>
              <div style={cloudStatusDetailsStyle}>{pointCloudSummary}</div>
            </details>
            <div style={cloudStatusVisibleStyle}>{pointCloudSummary.split(" · ").find(part => part.includes(" visible"))?.replace(" visible", " corridor pts")}</div>
            {pointCloudIncomplete && <button type="button" title={t('uiRetryMissingDiscoveryDownloadsTheDataBudgetsStill')} disabled={pointCloudLoading} onClick={onRetryPointCloud} style={getCloudStatusRetryStyle(pointCloudLoading)}>{pointCloudLoading ? t('uiRetrying') : pointCloudAutoPaused ? t('uiResume') : t('uiRetry')}</button>}
          </div>
  );
};
