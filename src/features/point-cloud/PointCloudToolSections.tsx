/** @jsx jsx */
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import { React, jsx } from 'jimu-core';
import * as Icons from '../../components/Icons';
import type { InfoBoxProps } from '../../components/types';
import { cloudMeasurePanelStyle, cloudToolToggleStyle, cloudMeasureHeadingStyle, cloudToolIconStyle, cloudMeasureTrackStyle, cloudMeasureThumbStyle, cloudToolHelpStyle, cloudMeasureReadyStyle, cloudToolClearStyle, cloudLassoPanelStyle, cloudLassoHeadingStyle, cloudLassoTrackStyle, cloudLassoThumbStyle, cloudSightPanelStyle, cloudSightHeadingStyle, cloudSightTrackStyle, cloudSightThumbStyle, cloudViewshedPanelStyle, cloudViewshedHeadingStyle, cloudViewshedTrackStyle, cloudViewshedThumbStyle } from '../../styles/pointCloudTools';

export type PointCloudMeasureToolsProps = Pick<InfoBoxProps, 'isMeasureMode' | 'measurePoints' | 'onToggleMeasureMode' | 'onClearMeasurement'>;

/** Show the supplied measurement progress and forward toggle/clear actions; no distances are calculated here.
 * InfoBox retains the point-cloud visibility guard. No tool state or event subscriptions are owned here.
 */
export const PointCloudMeasureTools: React.FC<PointCloudMeasureToolsProps> = ({ isMeasureMode, measurePoints, onToggleMeasureMode, onClearMeasurement }) => { const { t, locale } = useWidgetLocale(); return (
<div
              style={cloudMeasurePanelStyle(isMeasureMode)}
            >
              <button
                onClick={onToggleMeasureMode}
                title={t('uiToggle3dTapeMeasure')}
                style={cloudToolToggleStyle}
              >
                <span className="mly-tool-heading" style={cloudMeasureHeadingStyle(isMeasureMode)}>
                  <Icons.Measure size={12} style={cloudToolIconStyle} />
                  <span className="mly-tool-text"> {t('uiMeasure')} </span>
                </span>
                <div
                  style={cloudMeasureTrackStyle(isMeasureMode)}
                >
                  <div
                    style={cloudMeasureThumbStyle(isMeasureMode)}
                  />
                </div>
              </button>

              {isMeasureMode && (
                <div style={cloudToolHelpStyle}>
                  {(!measurePoints || measurePoints.length === 0) && t('uiFirstPoint')}
                  {measurePoints && measurePoints.length === 1 && t('uiSecondPoint')}
                  {measurePoints && measurePoints.length === 2 && <div style={cloudMeasureReadyStyle}> {t('uiReady')} </div>}
                  {measurePoints && measurePoints.length > 0 && (
                    <button
                      onClick={onClearMeasurement}
                      style={cloudToolClearStyle}
                    >
                       {t('uiClear')} </button>
                  )}
                </div>
              )}
            </div>
); };

export type PointCloudLassoToolsProps = Pick<InfoBoxProps, 'isLassoMode' | 'onToggleLassoMode' | 'onClearLasso'>;

/** Show lasso instructions and forward toggle/clear actions; drawing and selection stay runtime-owned.
 * InfoBox retains the point-cloud visibility guard. No tool state or event subscriptions are owned here.
 */
export const PointCloudLassoTools: React.FC<PointCloudLassoToolsProps> = ({ isLassoMode, onToggleLassoMode, onClearLasso }) => { const { t, locale } = useWidgetLocale(); return (
<div
              style={cloudLassoPanelStyle(isLassoMode)}
            >
              <button
                onClick={onToggleLassoMode}
                title={t('uiToggleLassoPointSelection')}
                style={cloudToolToggleStyle}
              >
                <span className="mly-tool-heading" style={cloudLassoHeadingStyle(isLassoMode)}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={cloudToolIconStyle}>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM12 22c-5.52 0-10-4.48-10-10S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z" />
                    <circle cx="12" cy="12" r="3" fill="currentColor" />
                  </svg>
                  <span className="mly-tool-text"> {t('uiLasso')} </span>
                </span>
                <div
                  style={cloudLassoTrackStyle(isLassoMode)}
                >
                  <div
                    style={cloudLassoThumbStyle(isLassoMode)}
                  />
                </div>
              </button>

              {isLassoMode && (
                <div style={cloudToolHelpStyle}>
                   {t('uiDrawOnImageToSelect')} <button
                    onClick={onClearLasso}
                    style={cloudToolClearStyle}
                  >
                     {t('uiClear')} </button>
                </div>
              )}
            </div>
); };

export type PointCloudSightToolsProps = Pick<InfoBoxProps, 'isSightMode' | 'sightObserver' | 'sightTargets' | 'onToggleSightMode' | 'onClearSight'>;

/** Show observer/target guidance and forward toggle/clear actions; ray calculations stay runtime-owned.
 * InfoBox retains the point-cloud visibility guard. No tool state or event subscriptions are owned here.
 */
export const PointCloudSightTools: React.FC<PointCloudSightToolsProps> = ({ isSightMode, sightObserver, sightTargets, onToggleSightMode, onClearSight }) => { const { t, locale } = useWidgetLocale(); return (
<div
              style={cloudSightPanelStyle(isSightMode)}
            >
              <button
                onClick={onToggleSightMode}
                title={t('uiToggle3dLineOfSight')}
                style={cloudToolToggleStyle}
              >
                <span className="mly-tool-heading" style={cloudSightHeadingStyle(isSightMode)}>
                  <Icons.Eye size={12} style={cloudToolIconStyle} />
                  <span className="mly-tool-text"> {t('uiSight')} </span>
                </span>
                <div
                  style={cloudSightTrackStyle(isSightMode)}
                >
                  <div
                    style={cloudSightThumbStyle(isSightMode)}
                  />
                </div>
              </button>

              {isSightMode && (
                <div style={cloudToolHelpStyle}>
                  {!sightObserver && t('uiObserverPoint')}
                  {sightObserver && t('uiAddTargets')}
                  {(sightObserver || (sightTargets && sightTargets.length > 0)) && (
                    <button
                      onClick={onClearSight}
                      style={cloudToolClearStyle}
                    >
                       {t('uiClear')} </button>
                  )}
                </div>
              )}
            </div>
); };

export type PointCloudViewshedToolsProps = Pick<InfoBoxProps, 'isViewshedMode' | 'onToggleViewshedMode' | 'onClearViewshed'>;

/** Show viewshed instructions and forward toggle/clear actions; blind-spot calculations stay runtime-owned.
 * InfoBox retains the point-cloud visibility guard. No tool state or event subscriptions are owned here.
 */
export const PointCloudViewshedTools: React.FC<PointCloudViewshedToolsProps> = ({ isViewshedMode, onToggleViewshedMode, onClearViewshed }) => { const { t, locale } = useWidgetLocale(); return (
<div
              style={cloudViewshedPanelStyle(isViewshedMode)}
            >
              <button
                onClick={onToggleViewshedMode}
                title={t('uiToggle3dViewshedBlindSpotAnalysis')}
                style={cloudToolToggleStyle}
              >
                <span className="mly-tool-heading" style={cloudViewshedHeadingStyle(isViewshedMode)}>
                  <Icons.Viewshed size={12} style={cloudToolIconStyle} />
                  <span className="mly-tool-text"> {t('uiViewshed')} </span>
                </span>
                <div
                  style={cloudViewshedTrackStyle(isViewshedMode)}
                >
                  <div
                    style={cloudViewshedThumbStyle(isViewshedMode)}
                  />
                </div>
              </button>

              {isViewshedMode && (
                <div style={cloudToolHelpStyle}>
                   {t('uiClickCloudToCalculateBlindSpots')} <button
                    onClick={onClearViewshed}
                    style={cloudToolClearStyle}
                  >
                     {t('uiClear')} </button>
                </div>
              )}
            </div>
); };
