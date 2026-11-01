/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import * as Icons from '../../components/Icons';
import type { InfoBoxProps } from '../../components/types';
import { detectionExportButtonStyle, detectionExportLabelStyle, detectionOverlayButtonStyle, detectionOverlayLabelStyle, detectionLabelsButtonStyle } from '../../styles/detectionControls';

export type DetectionToolsSectionProps = Pick<InfoBoxProps, 'trafficSignsActive' | 'objectsActive' | 'imageId' | 'detectionsActive' | 'showAiTags' | 'mapFeatureExportLoading' | 'onDownloadFeatures' | 'onToggleDetections' | 'onToggleAiTags'>;

/** Present area export, image outlines and label actions with their existing availability rules.
 * Active signs or objects enable export; image actions also require an image, and labels require outlines.
 * Runtime callbacks own fetching, file generation and viewer updates. This component adds no effects.
 */
export const DetectionToolsSection: React.FC<DetectionToolsSectionProps> = ({ trafficSignsActive, objectsActive, imageId, detectionsActive, showAiTags, mapFeatureExportLoading, onDownloadFeatures, onToggleDetections, onToggleAiTags }) => (
<React.Fragment>
          {/* EXPORT BUTTON */}
          {(trafficSignsActive || objectsActive) && (
            <button
              onClick={onDownloadFeatures}
              title="Export active signs and objects within the map bounding box, using current filters"
              disabled={mapFeatureExportLoading}
              aria-busy={mapFeatureExportLoading}
              style={detectionExportButtonStyle}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(55, 213, 130, 0.95)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = detectionsActive ? "rgba(55, 213, 130, 0.8)" : "rgba(55, 213, 130, 0.3)")}
            >
              <Icons.Download size={12} color="#ffffff" />
              <span style={detectionExportLabelStyle}>{mapFeatureExportLoading ? "EXPORTING…" : "EXPORT AREA"}</span>
            </button>
          )}

          {/* AI OVERLAY BUTTON */}
          {(trafficSignsActive || objectsActive) && imageId && (
            <button
              onClick={onToggleDetections}
              title="Show or hide detection outlines"
              aria-label="Detection outlines"
              aria-pressed={detectionsActive}
              style={detectionOverlayButtonStyle(detectionsActive)}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(55, 213, 130, 0.95)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = detectionsActive ? "rgba(55, 213, 130, 0.8)" : "rgba(55, 213, 130, 0.3)")}
            >
              <Icons.Detection size={11} />
              <span style={detectionOverlayLabelStyle}>AI OVERLAY</span>
            </button>
          )}

          {/* AI TAG VISIBILITY TOGGLE */}
          {detectionsActive && imageId && (trafficSignsActive || objectsActive) && (
            <button
              onClick={onToggleAiTags}
              title={showAiTags ? "Hide detection labels; keep outlines visible" : "Show labels for hovered or selected detections"}
              aria-label="Detection labels"
              aria-pressed={showAiTags}
              style={detectionLabelsButtonStyle(showAiTags)}
            >
              {showAiTags ? <Icons.LabelsOn size={14} /> : <Icons.LabelsOff size={14} />}
              <span>Labels</span>
            </button>
          )}
</React.Fragment>
);
