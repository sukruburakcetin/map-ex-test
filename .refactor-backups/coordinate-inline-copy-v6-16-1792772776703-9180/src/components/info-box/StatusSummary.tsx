/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import * as Icons from '../Icons';
import type { InfoBoxProps } from '../types';
import { infoStatusAddressStyle, infoStatusGlobeStyle, infoStatusCreatorStyle } from '../../styles/infoBox';

export type StatusSummaryProps = Pick<InfoBoxProps, 'currentZoom' | 'jimuMapViewZoom' | 'address' | 'turboCreator' | 'turboOrganization' | 'turboOrganizationName' | 'onCopyCoordinates'> & {
 currentImg: InfoBoxProps['sequenceImages'][number] | null | undefined;
};

/** Location and expandable six-decimal coordinates.
 * InfoBox selects the current image; coordinate clicks forward original numeric values to
 * the runtime clipboard callback. This component performs no lookup, geocoding or clipboard access.
 */
export const StatusSummary: React.FC<StatusSummaryProps> = ({ address, turboCreator, turboOrganization, turboOrganizationName, onCopyCoordinates, currentImg }) => (
<React.Fragment>
              {/* Address */}
              {address && (
                <div style={infoStatusAddressStyle}>
                  <Icons.Globe size={12} style={infoStatusGlobeStyle} />
                  {address}
                </div>
              )}

              {/* Coordinates */}
              {currentImg && (
                <details className="mly-image-coordinates"><summary>Coordinates</summary>
                  <div className="mly-coordinate-card" role="group" aria-label="Image coordinates in decimal degrees">
                    <div className="mly-coordinate-value" aria-label={`Latitude ${currentImg.lat.toFixed(6)} degrees`}>
                      <span>{Math.abs(currentImg.lat).toFixed(6)}<small>°</small></span>
                      <span className="mly-coordinate-direction">{currentImg.lat < 0 ? "S" : "N"}</span>
                    </div>
                    <div className="mly-coordinate-value" aria-label={`Longitude ${currentImg.lon.toFixed(6)} degrees`}>
                      <span>{Math.abs(currentImg.lon).toFixed(6)}<small>°</small></span>
                      <span className="mly-coordinate-direction">{currentImg.lon < 0 ? "W" : "E"}</span>
                    </div>
                    <button type="button" className="mly-coordinate-copy" disabled={!onCopyCoordinates}
                      title="Copy latitude, longitude as signed decimal degrees"
                      aria-label={`Copy coordinates ${currentImg.lat.toFixed(6)}, ${currentImg.lon.toFixed(6)}`}
                      onClick={() => onCopyCoordinates?.(currentImg.lat, currentImg.lon)}>Copy coordinates</button>
                  </div>
                </details>
              )}

              {/* Locked creator tag */}
              {turboCreator && (
                <div
                  style={infoStatusCreatorStyle}
                >
                  {turboCreator}
                </div>
              )}
              {turboOrganization && <div
                style={{ ...infoStatusCreatorStyle, maxWidth: "100%", minWidth: 0, boxSizing: "border-box", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                title={turboOrganizationName ? `${turboOrganizationName} · Organization ID: ${turboOrganization}` : `Organization ID: ${turboOrganization}`}
                aria-label={`Organization: ${turboOrganizationName || turboOrganization}`}>
                Org: {turboOrganizationName || turboOrganization}
              </div>}
</React.Fragment>
);
