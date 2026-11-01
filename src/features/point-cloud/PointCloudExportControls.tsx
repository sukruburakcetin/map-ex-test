/** @jsx jsx */
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import { React, jsx } from 'jimu-core';
import * as Icons from '../../components/Icons';
import type { InfoBoxProps } from '../../components/types';
import { cloudExportPanelStyle, cloudExportSelectStyle, cloudExportButtonStyle, cloudExportLabelStyle } from '../../styles/pointCloudControls';

export type PointCloudExportControlsProps = Pick<InfoBoxProps, 'pointCloudExportLoading' | 'onDownloadPointCloud'> & {
 format: 'csv' | 'ply' | 'las';
 onFormatChange: (format: 'csv' | 'ply' | 'las') => void;
};

/** Select an export format and forward the explicit download action.
 * InfoBox retains the selection across visibility changes; runtime owns file generation.
 */
export const PointCloudExportControls: React.FC<PointCloudExportControlsProps> = ({ format, onFormatChange, pointCloudExportLoading, onDownloadPointCloud }) => { const { t, locale } = useWidgetLocale(); return (
<div className="mly-cloud-export" style={cloudExportPanelStyle}>
            <select disabled={pointCloudExportLoading} aria-label={t('uiPointCloudExportFormat')} title={t('uiCsvGeographicCoordinatesPlyLocalMetricXyzWith')} value={format} onChange={event => onFormatChange(event.target.value === "las" ? "las" : event.target.value === "ply" ? "ply" : "csv")} style={cloudExportSelectStyle}><option value="csv"> {t('uiCsvLatLon')} </option><option value="ply"> {t('uiPlyXyzRgb')} </option><option value="las"> {t('uiLasQgisUtm')} </option></select>
            <button
              type="button" disabled={pointCloudExportLoading} aria-busy={!!pointCloudExportLoading}
              onClick={() => onDownloadPointCloud?.(format)}
              title={t('uiExportAllRetainedPointsWithAlignmentAndNudge')}
              style={cloudExportButtonStyle}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(30, 144, 255, 0.8)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(30, 144, 255, 0.3)")}
            >
              <Icons.Download size={12} color="#ffffff" />
              <span style={cloudExportLabelStyle}>{pointCloudExportLoading ? t('uiExporting') : t('uiExport2')}</span>
            </button>
            </div>
); };
