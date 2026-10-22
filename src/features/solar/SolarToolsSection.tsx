/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import type { InfoBoxProps } from '../../components/types';
import { solarPanelStyle, solarToggleStyle, solarHeadingStyle, solarIconStyle, solarTrackStyle, solarThumbStyle, solarDescriptionStyle } from '../../styles/solarControls';

export type SolarToolsSectionProps = Pick<InfoBoxProps, 'isSolarMode' | 'onToggleSolarMode'>;

/** Display the solar switch and active-mode explanation; forward clicks without owning model state.
 * InfoBox retains the feature-enabled visibility guard. Rendering starts no calculations or requests.
 */
export const SolarToolsSection: React.FC<SolarToolsSectionProps> = ({ isSolarMode, onToggleSolarMode }) => (
<div
            style={solarPanelStyle(isSolarMode)}
          >
            <button
              onClick={onToggleSolarMode}
              title="Toggle Solar Glare & Shadow Modeling"
              style={solarToggleStyle}
            >
              <span style={solarHeadingStyle(isSolarMode)}>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={solarIconStyle}
                >
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
                SOLAR
              </span>
              <div
                style={solarTrackStyle(isSolarMode)}
              >
                <div
                  style={solarThumbStyle(isSolarMode)}
                />
              </div>
            </button>

            {isSolarMode && (
              <div style={solarDescriptionStyle}>
                Sun &amp; Shadow position modeled based on exact photo timestamp.
              </div>
            )}
          </div>
);
