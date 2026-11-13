/** @jsx jsx */
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import { DetectionExplorerControls } from './DetectionExplorerControls';
import { React, jsx } from 'jimu-core';
import * as Icons from '../../components/Icons';
import type { InfoBoxProps } from '../../components/types';
import { detectionControlsCss, detectionExportButtonStyle, detectionExportLabelStyle, detectionOverlayButtonStyle, detectionOverlayLabelStyle, detectionLabelsButtonStyle } from '../../styles/detectionControls';

export type DetectionToolsSectionProps = Pick<InfoBoxProps, 'trafficSignsActive' | 'objectsActive' | 'imageId' | 'detectionsActive' | 'showAiTags' | 'mapFeatureExportLoading' | 'onDownloadFeatures' | 'onToggleDetections' | 'onToggleAiTags' | 'detectionExplorer' | 'detectionSummary' | 'onChangeDetectionExplorer'>;

/** Present area export, image outlines and label actions with their existing availability rules.
 * Active signs or objects enable export; image actions also require an image, and labels require outlines.
 * Runtime callbacks own fetching, file generation and viewer updates. This component adds no effects.
 */
export const DetectionToolsSection: React.FC<DetectionToolsSectionProps> = ({ trafficSignsActive, objectsActive, imageId, detectionsActive, showAiTags, mapFeatureExportLoading, onDownloadFeatures, onToggleDetections, onToggleAiTags, detectionExplorer, detectionSummary, onChangeDetectionExplorer }) => { const { t, locale } = useWidgetLocale(); return (
<React.Fragment>
          <style>{detectionControlsCss}</style>
          {/* EXPORT BUTTON */}
          {(trafficSignsActive || objectsActive) && (
            <button
              type="button" className="mly-detection-button mly-detection-export mly-text-action"
              onClick={onDownloadFeatures}
              title={t('uiExportActiveSignsAndObjectsWithinTheMap')}
              disabled={mapFeatureExportLoading}
              aria-busy={mapFeatureExportLoading}
              style={detectionExportButtonStyle}
            >
              <Icons.Download size={12} color="#ffffff" />
              <span style={detectionExportLabelStyle}>{mapFeatureExportLoading ? t('uiExporting') : t('uiExportArea')}</span>
            </button>
          )}

          {/* AI OVERLAY BUTTON */}
          {(trafficSignsActive || objectsActive) && imageId && (
            <button
              type="button" className="mly-detection-button mly-text-action"
              onClick={onToggleDetections}
              title={t('uiShowOrHideDetectionOutlines')}
              aria-label={t('uiDetectionOutlines')}
              aria-pressed={detectionsActive}
              style={detectionOverlayButtonStyle(detectionsActive)}
            >
              <Icons.Detection size={11} />
              <span style={detectionOverlayLabelStyle}> {t('uiAiOverlay')} </span>
            </button>
          )}

          {/* AI TAG VISIBILITY TOGGLE */}
          {detectionsActive && imageId && (trafficSignsActive || objectsActive) && (
            <button
              type="button" className="mly-detection-button mly-text-action"
              onClick={onToggleAiTags}
              title={showAiTags ? t('uiHideDetectionLabelsKeepOutlinesVisible') : t('uiDetectionLabels')}
              aria-label={t('uiDetectionLabels')}
              aria-pressed={showAiTags}
              style={detectionLabelsButtonStyle(showAiTags)}
            >
              {showAiTags ? <Icons.LabelsOn size={12} /> : <Icons.LabelsOff size={12} />}
              <span> {t('uiLabels')} </span>
            </button>
          )}
{detectionsActive && imageId && (trafficSignsActive || objectsActive) && detectionExplorer && detectionSummary && onChangeDetectionExplorer && <DetectionExplorerControls options={detectionExplorer} summary={detectionSummary} onChange={onChangeDetectionExplorer}/>}
</React.Fragment>
); };
