/** @jsx jsx */
/** Nearby-capture trigger presentation. Discovery, playback scheduling and tray state remain parent-owned. */
import { React, jsx } from 'jimu-core';
import * as Icons from '../../components/Icons';
import type { InfoBoxProps } from '../../components/types';
import { nearbyToolsSectionStyle, nearbyToolsButtonStyle, nearbyToolsLoadingStyle, nearbyToolsCountStyle, getNearbyToolsLabelStyle, getNearbyToolsChevronStyle } from '../../styles/nearbyTools';

export type NearbyToolsSectionProps = Pick<InfoBoxProps, 'nearbyCount' | 'nearbyLoading' | 'nearbyStripOpen' | 'onToggleNearbyStrip'>;

/** Forward the tray toggle without effects or requests; InfoBox retains its image-selected visibility guard. */
export const NearbyToolsSection: React.FC<NearbyToolsSectionProps> = props => {
  const { nearbyCount, nearbyLoading, nearbyStripOpen, onToggleNearbyStrip } = props;
  return (
    <div
      style={nearbyToolsSectionStyle}
    >
      <button
        type="button" aria-label="Nearby images" aria-expanded={!!nearbyStripOpen}
        onClick={onToggleNearbyStrip}
        title="Show captures nearby"
        style={nearbyToolsButtonStyle}
      >
        <span
          style={getNearbyToolsLabelStyle(nearbyStripOpen)}
        >
          <Icons.Camera size={9} />
          Nearby
          {nearbyLoading ? (
            <span style={nearbyToolsLoadingStyle}>…</span>
          ) : nearbyCount != null && nearbyCount > 0 ? (
            <span
              style={nearbyToolsCountStyle}
            >
              {nearbyCount}
            </span>
          ) : null}
        </span>
        {/* chevron */}
        <svg
          width="8"
          height="8"
          viewBox="0 0 10 10"
          fill="white"
          style={getNearbyToolsChevronStyle(nearbyStripOpen)}
        >
          <path d="M1 3l4 4 4-4" />
        </svg>
      </button>
    </div>
  );
};
