/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import type { InfoBoxProps } from '../../components/types';
import { yearLegendPanelStyle, yearLegendHeadingStyle, yearLegendRowStyle, yearLegendMarkerStyle, yearLegendLabelStyle, yearLegendScrollbarCss } from '../../styles/coverageYearLegend';

export type CoverageYearLegendProps = Pick<InfoBoxProps, 'selectedTurboYear' | 'onYearLegendClick'> & {
 turboYearLegend: NonNullable<InfoBoxProps['turboYearLegend']>;
};

/** Present supplied year colors and selection; forward clicks to the existing year-filter callback.
 * InfoBox retains date-coloring and nonempty-legend visibility checks. No filtering or requests run here.
 */
export const CoverageYearLegend: React.FC<CoverageYearLegendProps> = ({ turboYearLegend, selectedTurboYear, onYearLegendClick }) => (
<div
                  className="year-legend-scroll"
                  style={yearLegendPanelStyle}
                >
                  <style>{yearLegendScrollbarCss}</style>
                  <div style={yearLegendHeadingStyle}>YEARS</div>
                  {turboYearLegend.map((item) => {
                    const isSelected = selectedTurboYear === item.year;
                    const isAnySelected = !!selectedTurboYear;
                    return (
                      <div
                        key={item.year}
                        onClick={() => onYearLegendClick(item.year)}
                        title={isSelected ? "Click to show all years" : `Filter by ${item.year}`}
                        style={yearLegendRowStyle(isSelected, isAnySelected)}
                      >
                        <span
                          style={yearLegendMarkerStyle(isSelected, item)}
                        />
                        <span
                          style={yearLegendLabelStyle(isSelected)}
                        >
                          {item.year}
                        </span>
                      </div>
                    );
                  })}
                </div>
);
