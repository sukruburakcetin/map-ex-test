/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import type { InfoBoxProps } from '../../components/types';
import { elevationPanelStyle, elevationToggleStyle, elevationHeadingStyle, elevationIconStyle, elevationTrackStyle, elevationThumbStyle } from '../../styles/elevationControls';

export type ElevationToolsSectionProps = Pick<InfoBoxProps, 'isElevationProfileActive' | 'onToggleElevationProfile'>;

/** Display the elevation-profile switch and forward clicks without owning profile state.
 * InfoBox retains feature and sequence-length visibility guards. Rendering starts no sampling or requests.
 */
export const ElevationToolsSection: React.FC<ElevationToolsSectionProps> = ({ isElevationProfileActive, onToggleElevationProfile }) => (
<div
              style={elevationPanelStyle(isElevationProfileActive)}
            >
              <button
                onClick={onToggleElevationProfile}
                title="Toggle Elevation Profile along sequence"
                style={elevationToggleStyle}
              >
                <span
                  style={elevationHeadingStyle(isElevationProfileActive)}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={elevationIconStyle}
                  >
                    <path d="M3 20h18L14 7l-4 7-3-4-4 10z" />
                  </svg>
                  PROFILE
                </span>
                <div
                  style={elevationTrackStyle(isElevationProfileActive)}
                >
                  <div
                    style={elevationThumbStyle(isElevationProfileActive)}
                  />
                </div>
              </button>
            </div>
);
