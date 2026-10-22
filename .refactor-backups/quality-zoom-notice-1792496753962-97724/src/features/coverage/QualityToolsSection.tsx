/** @jsx jsx */
/** Quality toggle and band legend presentation only; coverage state and rebuilds remain parent-owned. */
import { React, jsx } from 'jimu-core';
import * as Icons from '../../components/Icons';
import type { InfoBoxProps } from '../../components/types';
import { qualityToolsSectionStyle, qualityToolsButtonStyle, qualityToolsLegendStyle, qualityToolsRangeStyle, getQualityToolsLabelStyle, getQualityToolsTrackStyle, getQualityToolsKnobStyle, getQualityToolsBandStyle, getQualityToolsSwatchStyle, getQualityToolsBandLabelStyle } from '../../styles/qualityTools';

export type QualityToolsSectionProps = Pick<InfoBoxProps, 'qualityViewActive' | 'onToggleQualityView' | 'selectedQualityBand' | 'onQualityLegendClick'>;

/** Keep legend colors/ranges, selected-band dimming and original callbacks; no effects or SDK work occur here. */
export const QualityToolsSection: React.FC<QualityToolsSectionProps> = props => {
  const { qualityViewActive, onToggleQualityView, selectedQualityBand, onQualityLegendClick } = props;
  return (
    <div
      style={qualityToolsSectionStyle}
    >
      <button
        onClick={onToggleQualityView}
        title={qualityViewActive ? "Quality View ON: lines coloured by image quality score" : "Quality View OFF: click to colour coverage lines by quality score"}
        style={qualityToolsButtonStyle}
      >
        <span
          style={getQualityToolsLabelStyle(qualityViewActive)}
        >
          <Icons.Star size={10} color={qualityViewActive ? "#F5A623" : "rgba(255,255,255,0.7)"} filled={qualityViewActive} />
          QUALITY
        </span>
        <div
          style={getQualityToolsTrackStyle(qualityViewActive)}
        >
          <div
            style={getQualityToolsKnobStyle(qualityViewActive)}
          />
        </div>
      </button>

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
                title={isSelected ? "Click to show all quality bands" : `Show only ${label} captures`}
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
