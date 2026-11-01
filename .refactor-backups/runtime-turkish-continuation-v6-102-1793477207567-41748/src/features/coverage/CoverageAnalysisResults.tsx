/** @jsx jsx */
/** @jsxFrag React.Fragment */
/** Controlled coverage progress/results card; analysis, routing state and SDK resources remain parent-owned. */
import { React, jsx } from 'jimu-core';
import type { InfoBoxProps } from '../../components/types';
import { coverageResultsPanelStyle, coverageResultsHeaderStyle, coverageResultsDismissStyle, coverageResultsProgressStyle, coverageResultsDotsStyle, coverageResultsCancelStyle, coverageResultsTierRowStyle, coverageResultsTierLineStyle, coverageResultsTierLabelGroupStyle, getCoverageResultsTierDotStyle, coverageResultsTierLabelStyle, coverageResultsTierAgeStyle, coverageResultsTierPercentStyle, coverageResultsTierDistanceStyle, coverageResultsBarStyle, getCoverageResultsBarPartStyle, coverageResultsTotalsStyle, coverageResultsCoveredStyle, coverageResultsSegmentsStyle, getCoverageResultsMapToggleStyle } from '../../styles/coverageAnalysis';

export type CoverageAnalysisResultsProps = Pick<InfoBoxProps, 'coverageAnalysisLoading' | 'coverageAnalysisProgress' | 'onCancelCoverageAnalysis' | 'coverageResult' | 'coverageSegmentsVisible' | 'onToggleCoverageSegments' | 'onDismissCoverageResult'> & {
  /** Evaluated only inside ready results, after the existing summary and map toggle. */
  renderRoutingControls: () => React.ReactNode;
};

/** Preserve progress/status text, rounded percentages, tier order and callbacks without owning state or effects. */
export const CoverageAnalysisResults: React.FC<CoverageAnalysisResultsProps> = props => {
  const { coverageAnalysisLoading, coverageAnalysisProgress, onCancelCoverageAnalysis, coverageResult, coverageSegmentsVisible, onToggleCoverageSegments, onDismissCoverageResult, renderRoutingControls } = props;
  return (
<div
              className={`mly-coverage-results${coverageAnalysisLoading ? " is-loading" : ""}`}
              style={coverageResultsPanelStyle}
            >
              {/* Header */}
              <div
                style={coverageResultsHeaderStyle}
              >
                <span>{coverageAnalysisLoading ? "Street coverage" : "STREET COVERAGE"}</span>
                {!coverageAnalysisLoading && <button type="button" aria-label="Dismiss street coverage results"
                  onClick={onDismissCoverageResult}
                  style={coverageResultsDismissStyle}
                >
                  ×
                </button>}
              </div>

              {coverageAnalysisLoading && (
                <>
                  <style>{`
      @keyframes mly-coverage-scan { from { transform: translateX(-110%); } to { transform: translateX(330%); } }
      .mly-coverage-results.is-loading { border-color: #78b49455 !important; background: linear-gradient(145deg,rgba(28,51,40,.9),rgba(14,28,22,.8)) !important; }
      .mly-coverage-results.is-loading > div:first-child { border-bottom: 0 !important; min-height: 22px; margin: 0 !important; font-size: 9px; color: #e0eee5 !important; }
      .mly-coverage-scan { height: 3px; border-radius: 3px; overflow: hidden; background: #a9d6b71c; margin: 3px 0 7px; }
      .mly-coverage-scan > span { display: block; width: 32%; height: 100%; border-radius: inherit; background: linear-gradient(90deg,#4daf7955,#9ae6b7,#4daf7955); animation: mly-coverage-scan 1.5s ease-in-out infinite; }
      .mly-coverage-results.is-loading button:hover { background: #ffffff12 !important; }
      @media (prefers-reduced-motion: reduce) { .mly-coverage-scan > span { animation: none; margin: 0 auto; } }
    `}</style>

                  <div style={coverageResultsProgressStyle} role="status" aria-live="polite" aria-atomic="true">
                    {(coverageAnalysisProgress || "Analysing coverage").replace(/(?:…|\.{3})+\s*$/, "")}
                  </div>
                  <div className="mly-coverage-scan" aria-hidden="true"><span/></div>
                  <button type="button" onClick={onCancelCoverageAnalysis} style={coverageResultsCancelStyle}>Cancel</button>
                </>
              )}

              {coverageResult &&
                !coverageAnalysisLoading &&
                (() => {
                  const r = coverageResult;
                  const total = r.totalCount || 1;
                  const freshPct = Math.round((r.freshCount / total) * 100);
                  const agingPct = Math.round((r.agingCount / total) * 100);
                  const stalePct = Math.round((r.staleCount / total) * 100);
                  const nonePct = Math.round((r.noneCount / total) * 100);

                  const row = (color: string, label: string, age: string, pct: number, km: number) => (
                    <div style={coverageResultsTierRowStyle}>
                      <div className="mly-coverage-tier-line" style={coverageResultsTierLineStyle}>
                        <div className="mly-coverage-tier-label" style={coverageResultsTierLabelGroupStyle}>
                          <div style={getCoverageResultsTierDotStyle(color)} />
                          <span style={coverageResultsTierLabelStyle}>{label}</span>
                          <span style={coverageResultsTierAgeStyle}>{age}</span>
                        </div>
                        <span className="mly-coverage-tier-percent" style={coverageResultsTierPercentStyle}>{pct}%</span>
                      </div>
                      <div style={coverageResultsTierDistanceStyle}>{km} km</div>
                    </div>
                  );

                  return (
                    <React.Fragment>
                      {/* Segmented Colored Bar */}
                      <div
                        style={coverageResultsBarStyle}
                      >
                        {freshPct > 0 && <div style={getCoverageResultsBarPartStyle(freshPct, "#37d582")} />}
                        {agingPct > 0 && <div style={getCoverageResultsBarPartStyle(agingPct, "#ffc107")} />}
                        {stalePct > 0 && <div style={getCoverageResultsBarPartStyle(stalePct, "#ff6e32")} />}
                        {nonePct > 0 && <div style={getCoverageResultsBarPartStyle(nonePct, "#dc3232")} />}
                      </div>

                      {/* Totals */}
                      <div style={coverageResultsTotalsStyle}>
                        <div style={coverageResultsCoveredStyle}>{r.percentCovered}% covered</div>
                        <div style={coverageResultsSegmentsStyle}>
                          {r.coveredCount} / {r.totalCount} segments
                        </div>
                      </div>

                      {/* Data Rows */}
                      {row("#37d582", "Fresh", "(<2y)", freshPct, r.freshKm)}
                      {row("#ffc107", "Aging", "(2-4y)", agingPct, r.agingKm)}
                      {row("#ff6e32", "Stale", "(>4y)", stalePct, r.staleKm)}
                      {row("#dc3232", "None", "", nonePct, r.noneKm)}

                      {/* Toggle Button */}
                      <button
                        onClick={onToggleCoverageSegments}
                        style={getCoverageResultsMapToggleStyle(coverageSegmentsVisible)}
                      >
                        {coverageSegmentsVisible ? "HIDE MAP" : "SHOW MAP"}
                      </button>

                      {renderRoutingControls()}
                    </React.Fragment>
                  );
                })()}
            </div>
  );
};
