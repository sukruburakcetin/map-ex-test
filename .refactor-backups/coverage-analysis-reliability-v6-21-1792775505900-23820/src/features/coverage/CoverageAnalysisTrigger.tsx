/** @jsx jsx */
/** Controlled coverage-analysis launch button. Results, cancellation, requests and map updates remain parent-owned. */
import { React, jsx } from 'jimu-core';
import type { InfoBoxProps } from '../../components/types';
import { coverageAnalysisTriggerRowStyle, coverageAnalysisTriggerSpinnerStyle, coverageAnalysisTriggerHoverBackground, getCoverageAnalysisTriggerButtonStyle, getCoverageAnalysisTriggerBackground } from '../../styles/coverageAnalysis';

export type CoverageAnalysisTriggerProps = Pick<InfoBoxProps, 'currentZoom' | 'jimuMapViewZoom' | 'turboPointsAvailable' | 'coverageAnalysisLoading' | 'coverageResult' | 'onRunCoverageAnalysis'> & { turboMinZoom: number };

/** Preserve zoom/point/loading gates, tooltip priority and hover reset; no state or effects are owned here. */
export const CoverageAnalysisTrigger: React.FC<CoverageAnalysisTriggerProps> = props => {
  const { currentZoom, jimuMapViewZoom, turboPointsAvailable, coverageAnalysisLoading, coverageResult, onRunCoverageAnalysis, turboMinZoom } = props;
  const zoom = currentZoom ?? jimuMapViewZoom ?? 0;
  const belowZoom = zoom < turboMinZoom;
  const noPoints = !turboPointsAvailable;
  const canRun = !belowZoom && !noPoints && !coverageAnalysisLoading;

  const tooltip = coverageAnalysisLoading
    ? "Analysing…"
    : belowZoom
      ? `Zoom in to street level (≥ ${turboMinZoom}) first`
      : noPoints
        ? "No Coverage points loaded in this area"
        : "Run Street Coverage Analysis";

  const btnBg = getCoverageAnalysisTriggerBackground(canRun, !!coverageResult);

  return (
    <React.Fragment>
      {/* Coverage Analysis button */}
      <div
        style={coverageAnalysisTriggerRowStyle}
      >
        <button
          onClick={canRun ? onRunCoverageAnalysis : undefined}
          title={tooltip}
          style={getCoverageAnalysisTriggerButtonStyle(canRun, btnBg)}
          onMouseEnter={(e) => {
            if (canRun) e.currentTarget.style.background = coverageAnalysisTriggerHoverBackground;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = btnBg;
          }}
        >
          {coverageAnalysisLoading ? (
            <React.Fragment>
              <div
                style={coverageAnalysisTriggerSpinnerStyle}
              />
              Analysing…
            </React.Fragment>
          ) : (
            <span>{belowZoom ? "Zoom in to analyse" : noPoints ? "Analyse Not Ready" : coverageResult ? "Run New Analysis" : "Analyse Coverage"}</span>
          )}
        </button>
      </div>
    </React.Fragment>
  );
};
