/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import * as Icons from '../Icons';
import type { InfoBoxProps } from '../types';
import { infoStatusHeaderStyle, infoStatusTitleStyle, infoStatusSearchStyle, infoStatusZoomStyle, infoStatusAddressStyle, infoStatusGlobeStyle, infoStatusCoordinatesStyle, infoStatusCoordinateRowStyle, infoStatusCoordinateLabelStyle, infoStatusCreatorStyle } from '../../styles/infoBox';

export type StatusSummaryProps = Pick<InfoBoxProps, 'currentZoom' | 'jimuMapViewZoom' | 'address' | 'turboCreator' | 'onCopyCoordinates'> & {
 currentImg: InfoBoxProps['sequenceImages'][number] | null | undefined;
};

/** Show status values with the existing zoom fallback and six-decimal coordinate display.
 * InfoBox selects the current image; coordinate clicks forward original numeric values to
 * the runtime clipboard callback. This component performs no lookup, geocoding or clipboard access.
 */
export const StatusSummary: React.FC<StatusSummaryProps> = ({ currentZoom, jimuMapViewZoom, address, turboCreator, onCopyCoordinates, currentImg }) => (
<React.Fragment>
              {/* Header / zoom */}
              <div
                style={infoStatusHeaderStyle}
              >
                <span style={infoStatusTitleStyle}>STATUS</span>
                <span>
                  <Icons.Search size={9} style={infoStatusSearchStyle} />
                  <span style={infoStatusZoomStyle}>Z: {currentZoom !== undefined ? currentZoom.toFixed(1) : jimuMapViewZoom?.toFixed(1)}</span>
                </span>
              </div>

              {/* Address */}
              {address && (
                <div style={infoStatusAddressStyle}>
                  <Icons.Globe size={12} style={infoStatusGlobeStyle} />
                  {address}
                </div>
              )}

              {/* Coordinates */}
              {currentImg && (
                <button type="button" title="Copy Latitude, Longitude" aria-label={`Copy coordinates ${currentImg.lat.toFixed(6)}, ${currentImg.lon.toFixed(6)}`} onClick={() => onCopyCoordinates?.(currentImg.lat, currentImg.lon)} style={infoStatusCoordinatesStyle}>
                  <span style={infoStatusCoordinateRowStyle}>
                    <span style={infoStatusCoordinateLabelStyle}>LAT</span>
                    <span>{currentImg.lat.toFixed(6)}</span>
                  </span>
                  <span style={infoStatusCoordinateRowStyle}>
                    <span style={infoStatusCoordinateLabelStyle}>LON</span>
                    <span>{currentImg.lon.toFixed(6)}</span>
                  </span>
                </button>
              )}

              {/* Locked creator tag */}
              {turboCreator && (
                <div
                  style={infoStatusCreatorStyle}
                >
                  {turboCreator}
                </div>
              )}
</React.Fragment>
);
