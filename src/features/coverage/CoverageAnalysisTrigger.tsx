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
          type="button" disabled={!canRun} aria-disabled={!canRun}
          onClick={onRunCoverageAnalysis}
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
            <span>{belowZoom ? "Zoom in to analyse" : noPoints ? "Waiting for coverage" : coverageResult ? "Run New Analysis" : "Analyse Coverage"}</span>
          )}
        </button>
      </div>
      {!canRun && !coverageAnalysisLoading && <div role="status" style={{ fontSize: 8, lineHeight: 1.35, color: "#b5ccbf", padding: "3px 0" }}>
        {belowZoom ? "Move closer to analyse these streets." : "Waiting for coverage to finish loading."}
      </div>}
    </React.Fragment>
  );
};
