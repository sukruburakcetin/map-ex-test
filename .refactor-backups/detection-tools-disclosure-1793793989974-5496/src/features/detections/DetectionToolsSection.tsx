/** @jsx jsx */
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import { React, jsx } from 'jimu-core';
import * as Icons from '../../components/Icons';
import type { InfoBoxProps } from '../../components/types';
import { detectionExportButtonStyle, detectionExportLabelStyle, detectionOverlayButtonStyle, detectionOverlayLabelStyle, detectionLabelsButtonStyle } from '../../styles/detectionControls';

export type DetectionToolsSectionProps = Pick<InfoBoxProps, 'trafficSignsActive' | 'objectsActive' | 'imageId' | 'detectionsActive' | 'showAiTags' | 'mapFeatureExportLoading' | 'onDownloadFeatures' | 'onToggleDetections' | 'onToggleAiTags'>;

/** Present area export, image outlines and label actions with their existing availability rules.
 * Active signs or objects enable export; image actions also require an image, and labels require outlines.
 * Runtime callbacks own fetching, file generation and viewer updates. This component adds no effects.
 */
export const DetectionToolsSection: React.FC<DetectionToolsSectionProps> = ({ trafficSignsActive, objectsActive, imageId, detectionsActive, showAiTags, mapFeatureExportLoading, onDownloadFeatures, onToggleDetections, onToggleAiTags }) => { const { t, locale } = useWidgetLocale(); return (
<React.Fragment>
          {/* EXPORT BUTTON */}
          {(trafficSignsActive || objectsActive) && (
            <button
              onClick={onDownloadFeatures}
              title={t('uiExportActiveSignsAndObjectsWithinTheMap')}
              disabled={mapFeatureExportLoading}
              aria-busy={mapFeatureExportLoading}
              style={detectionExportButtonStyle}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(55, 213, 130, 0.95)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = detectionsActive ? "rgba(55, 213, 130, 0.8)" : "rgba(55, 213, 130, 0.3)")}
            >
              <Icons.Download size={12} color="#ffffff" />
              <span style={detectionExportLabelStyle}>{mapFeatureExportLoading ? t('uiExporting') : t('uiExportArea')}</span>
            </button>
          )}

          {/* AI OVERLAY BUTTON */}
          {(trafficSignsActive || objectsActive) && imageId && (
            <button
              onClick={onToggleDetections}
              title={t('uiShowOrHideDetectionOutlines')}
              aria-label={t('uiDetectionOutlines')}
              aria-pressed={detectionsActive}
              style={detectionOverlayButtonStyle(detectionsActive)}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(55, 213, 130, 0.95)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = detectionsActive ? "rgba(55, 213, 130, 0.8)" : "rgba(55, 213, 130, 0.3)")}
            >
              <Icons.Detection size={11} />
              <span style={detectionOverlayLabelStyle}> {t('uiAiOverlay')} </span>
            </button>
          )}

          {/* AI TAG VISIBILITY TOGGLE */}
          {detectionsActive && imageId && (trafficSignsActive || objectsActive) && (
            <button
              onClick={onToggleAiTags}
              title={showAiTags ? t('uiHideDetectionLabelsKeepOutlinesVisible') : t('uiShowLabelsForHoveredOrSelectedDetections')}
              aria-label={t('uiDetectionLabels')}
              aria-pressed={showAiTags}
              style={detectionLabelsButtonStyle(showAiTags)}
            >
              {showAiTags ? <Icons.LabelsOn size={14} /> : <Icons.LabelsOff size={14} />}
              <span> {t('uiLabels')} </span>
            </button>
          )}
</React.Fragment>
); };
