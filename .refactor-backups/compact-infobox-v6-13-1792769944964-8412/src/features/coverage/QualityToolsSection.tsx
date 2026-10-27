/** @jsx jsx */
/** Quality toggle and band legend presentation only; coverage state and rebuilds remain parent-owned. */
import { React, jsx } from 'jimu-core';
import * as Icons from '../../components/Icons';
import type { InfoBoxProps } from '../../components/types';
import { qualityToolsSectionStyle, qualityToolsButtonStyle, qualityToolsLegendStyle, qualityToolsRangeStyle, getQualityToolsLabelStyle, getQualityToolsTrackStyle, getQualityToolsKnobStyle, getQualityToolsBandStyle, getQualityToolsSwatchStyle, getQualityToolsBandLabelStyle } from '../../styles/qualityTools';

export type QualityToolsSectionProps = Pick<InfoBoxProps, 'qualityViewActive' | 'onToggleQualityView' | 'selectedQualityBand' | 'onQualityLegendClick' | 'currentZoom' | 'jimuMapViewZoom' | 'qualityViewType'>;

/** Presentation thresholds, adjustable independently for each view type. */
export const QUALITY_HINT_ZOOM = { '2d': 6, '3d': 8 } as const;

/** Keep legend colors/ranges, selected-band dimming and original callbacks; no effects or SDK work occur here. */
export const QualityToolsSection: React.FC<QualityToolsSectionProps> = props => {
  const { qualityViewActive, onToggleQualityView, selectedQualityBand, onQualityLegendClick, currentZoom, jimuMapViewZoom, qualityViewType } = props;
  const zoom = Number.isFinite(jimuMapViewZoom) ? jimuMapViewZoom : currentZoom;
  const threshold = qualityViewType ? QUALITY_HINT_ZOOM[qualityViewType] : undefined;
  const showZoomNotice = qualityViewActive && (threshold === undefined || !Number.isFinite(zoom) || zoom! < threshold);
  return (
    <div
      style={qualityToolsSectionStyle}
    >
      <button
        type="button" aria-pressed={!!qualityViewActive}
        onClick={onToggleQualityView}
        title={qualityViewActive ? "Quality View ON: lines coloured by image quality score" : "Quality View OFF: click to colour coverage lines by quality score"}
        style={qualityToolsButtonStyle}
      >
        <span
          style={getQualityToolsLabelStyle(qualityViewActive)}
        >
          <Icons.Star size={10} color={qualityViewActive ? "#F5A623" : "rgba(255,255,255,0.7)"} filled={qualityViewActive} />
          Color coverage by quality
        </span>
        <div
          style={getQualityToolsTrackStyle(qualityViewActive)}
        >
          <div
            style={getQualityToolsKnobStyle(qualityViewActive)}
          />
        </div>
      </button>

      {showZoomNotice && (
        <div role="status" style={{ marginTop: 4, padding: '3px 5px', borderLeft: '2px solid #F5A623', background: 'rgba(245,166,35,0.10)', color: '#fff0ce', fontSize: 9, lineHeight: 1.25, overflowWrap: 'anywhere' }}>
          Zoom closer for image detail.
        </div>
      )}

      {qualityViewActive && (
        <div style={qualityToolsLegendStyle}>
          {(
            [
              ["#35AF6D", "Good", "≥0.70", "good"],
              ["#F5A623", "Fair", "0.45–0.70", "fair"],
              ["#D0021B", "Poor", "0.10–0.45", "poor"],
              ["#A855F7", "Unscored", "N/A", "unscored"],
            ] as [string, string, string, "good" | "fair" | "poor" | "unscored"][]
          ).map(([color, label, range, band]) => {
            const isSelected = selectedQualityBand === band;
            const isAnySelected = !!selectedQualityBand;
            return (
              <div
                key={label}
                onClick={() => onQualityLegendClick(band)}
                title={(band === 'unscored' ? 'Purple means score unavailable, not poor quality. ' : '') + (isSelected ? "Click to show all quality bands" : `Show only ${label} captures`)}
                style={getQualityToolsBandStyle(isSelected, isAnySelected)}
              >
                <div style={getQualityToolsSwatchStyle(color)} />
                <span style={getQualityToolsBandLabelStyle(isSelected)}>{label}</span>
                {range && <span style={qualityToolsRangeStyle}>{range}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
