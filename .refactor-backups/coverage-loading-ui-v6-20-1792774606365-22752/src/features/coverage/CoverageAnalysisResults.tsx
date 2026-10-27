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
              className="mly-coverage-results"
              style={coverageResultsPanelStyle}
            >
              {/* Header */}
              <div
                style={coverageResultsHeaderStyle}
              >
                <span>STREET COVERAGE</span>
                <button
                  onClick={onDismissCoverageResult}
                  style={coverageResultsDismissStyle}
                >
                  ×
                </button>
              </div>

              {coverageAnalysisLoading && (
                <>
                  <style>{`
      @keyframes mly-coverage-dot { 0%, 70%, 100% { opacity: .2; } 35% { opacity: 1; } }
      .mly-coverage-loading-dots { display: inline-flex; width: 12px; justify-content: space-around; vertical-align: baseline; }
      .mly-coverage-loading-dots > span { animation: mly-coverage-dot 1.2s ease-in-out infinite; }
      .mly-coverage-loading-dots > span:nth-child(2) { animation-delay: .16s; }
      .mly-coverage-loading-dots > span:nth-child(3) { animation-delay: .32s; }
      @media (prefers-reduced-motion: reduce) { .mly-coverage-loading-dots > span { animation: none; opacity: .7; } }
    `}</style>

                  <div style={coverageResultsProgressStyle}>
                    <span role="status" aria-live="polite">{(coverageAnalysisProgress || "Analysing").replace(/(?:…|\.{3})+\s*$/, "")}<span className="mly-coverage-loading-dots" aria-hidden="true"><span>.</span><span>.</span><span>.</span></span></span>
                  </div>
                  <button onClick={onCancelCoverageAnalysis} style={coverageResultsCancelStyle}>Cancel</button>
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
                      <div style={coverageResultsTierLineStyle}>
                        <div style={coverageResultsTierLabelGroupStyle}>
                          <div style={getCoverageResultsTierDotStyle(color)} />
                          <span style={coverageResultsTierLabelStyle}>{label}</span>
                          <span style={coverageResultsTierAgeStyle}>{age}</span>
                        </div>
                        <span style={coverageResultsTierPercentStyle}>{pct}%</span>
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
