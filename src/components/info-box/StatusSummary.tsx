/** @jsx jsx */
import { useWidgetLocale } from '../../i18n/WidgetLocale';
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
export const StatusSummary: React.FC<StatusSummaryProps> = ({ address, turboCreator, turboOrganization, turboOrganizationName, onCopyCoordinates, currentImg }) => { const { t, locale , owned} = useWidgetLocale(); return (
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
                <details className="mly-image-coordinates"><summary> {t('uiCoordinates')} </summary>
                  <button type="button" className="mly-coordinate-card" disabled={!onCopyCoordinates}
                    title={t('uiClickOrTapToCopyLatitudeLongitude')}
                    aria-label={t('uiCopyCoordinates',{lat:currentImg.lat.toFixed(6),lon:currentImg.lon.toFixed(6)})}
                    onClick={() => onCopyCoordinates?.(currentImg.lat, currentImg.lon)}>
                    <span className="mly-coordinate-value" aria-label={t('uiLatitude',{lat:currentImg.lat.toFixed(6)})}>
                      <span>{Math.abs(currentImg.lat).toFixed(6)}<small>°</small></span>
                      <span className="mly-coordinate-direction">{currentImg.lat < 0 ? t('uiS') : t('uiN')}</span>
                    </span>
                    <span className="mly-coordinate-value" aria-label={t('uiLongitude',{lon:currentImg.lon.toFixed(6)})}>
                      <span>{Math.abs(currentImg.lon).toFixed(6)}<small>°</small></span>
                      <span className="mly-coordinate-direction">{currentImg.lon < 0 ? t('uiW') : t('uiE')}</span>
                    </span>
                  </button>
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
                title={turboOrganizationName ? owned("{value0} · Organization ID: {value1}",{value0:String(turboOrganizationName),value1:String(turboOrganization)}) : owned("Organization ID: {value0}",{value0:String(turboOrganization)})}
                aria-label={t('uiOrganization',{name:String(turboOrganizationName || turboOrganization)})}>
                 {t('uiOrg')} {turboOrganizationName || turboOrganization}
              </div>}
</React.Fragment>
); };
