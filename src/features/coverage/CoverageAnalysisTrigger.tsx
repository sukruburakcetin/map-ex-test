/** @jsx jsx */
/** Controlled coverage-analysis launch button. Results, cancellation, requests and map updates remain parent-owned. */
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import { React, jsx } from 'jimu-core';
import type { InfoBoxProps } from '../../components/types';
import { coverageAnalysisTriggerRowStyle, coverageAnalysisTriggerSpinnerStyle, coverageAnalysisTriggerHoverBackground, getCoverageAnalysisTriggerButtonStyle, getCoverageAnalysisTriggerBackground } from '../../styles/coverageAnalysis';

export type CoverageAnalysisTriggerProps = Pick<InfoBoxProps, 'currentZoom' | 'jimuMapViewZoom' | 'turboPointsAvailable' | 'coverageAnalysisLoading' | 'coverageResult' | 'onRunCoverageAnalysis'> & { turboMinZoom: number };

/** Preserve zoom/point/loading gates, tooltip priority and hover reset; no state or effects are owned here. */
export const CoverageAnalysisTrigger: React.FC<CoverageAnalysisTriggerProps> = props => {
 const { t, locale } = useWidgetLocale();

  const { currentZoom, jimuMapViewZoom, turboPointsAvailable, coverageAnalysisLoading, coverageResult, onRunCoverageAnalysis, turboMinZoom } = props;
  const zoom = currentZoom ?? jimuMapViewZoom ?? 0;
  const belowZoom = zoom < turboMinZoom;
  const noPoints = !turboPointsAvailable;
  const canRun = !belowZoom && !noPoints && !coverageAnalysisLoading;

  const tooltip = coverageAnalysisLoading
    ? t('uiAnalysing')
    : belowZoom
      ? `Zoom in to street level (≥ ${turboMinZoom}) first`
      : noPoints
        ? t('uiNoCoveragePointsLoadedInThisArea')
        : t('uiRunStreetCoverageAnalysis');

  const btnBg = getCoverageAnalysisTriggerBackground(canRun, !!coverageResult);

  return (
    <React.Fragment>
      {/* Coverage Analysis button */}
      <div
        className="mly-coverage-analysis-trigger" style={coverageAnalysisTriggerRowStyle}
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
               {t('uiAnalysing')} </React.Fragment>
          ) : (
            <span>{belowZoom ? t('uiZoomInToAnalyse') : noPoints ? t('uiWaitingForCoverage') : coverageResult ? t('uiRunNewAnalysis') : t('uiAnalyseCoverage')}</span>
          )}
        </button>
      </div>
      {!canRun && !coverageAnalysisLoading && <div role="status" style={{ fontSize: 8, lineHeight: 1.35, color: "#b5ccbf", padding: "3px 0" }}>
        {belowZoom ? t('uiMoveCloserToAnalyseTheseStreets') : t('uiWaitingForCoverageToFinishLoading')}
      </div>}
    </React.Fragment>
  );
};
