/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import * as Icons from '../../components/Icons';
import type { InfoBoxProps } from '../../components/types';
import { cloudMeasurePanelStyle, cloudToolToggleStyle, cloudMeasureHeadingStyle, cloudToolIconStyle, cloudMeasureTrackStyle, cloudMeasureThumbStyle, cloudToolHelpStyle, cloudMeasureReadyStyle, cloudToolClearStyle, cloudLassoPanelStyle, cloudLassoHeadingStyle, cloudLassoTrackStyle, cloudLassoThumbStyle, cloudSightPanelStyle, cloudSightHeadingStyle, cloudSightTrackStyle, cloudSightThumbStyle, cloudViewshedPanelStyle, cloudViewshedHeadingStyle, cloudViewshedTrackStyle, cloudViewshedThumbStyle } from '../../styles/pointCloudTools';

export type PointCloudMeasureToolsProps = Pick<InfoBoxProps, 'isMeasureMode' | 'measurePoints' | 'onToggleMeasureMode' | 'onClearMeasurement'>;

/** Show the supplied measurement progress and forward toggle/clear actions; no distances are calculated here.
 * InfoBox retains the point-cloud visibility guard. No tool state or event subscriptions are owned here.
 */
export const PointCloudMeasureTools: React.FC<PointCloudMeasureToolsProps> = ({ isMeasureMode, measurePoints, onToggleMeasureMode, onClearMeasurement }) => (
<div
              style={cloudMeasurePanelStyle(isMeasureMode)}
            >
              <button
                onClick={onToggleMeasureMode}
                title="Toggle 3D Tape Measure"
                style={cloudToolToggleStyle}
              >
                <span style={cloudMeasureHeadingStyle(isMeasureMode)}>
                  <Icons.Measure size={12} style={cloudToolIconStyle} />
                  MEASURE
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
                  {(!measurePoints || measurePoints.length === 0) && "Select 1st point"}
                  {measurePoints && measurePoints.length === 1 && "Select 2nd point"}
                  {measurePoints && measurePoints.length === 2 && <div style={cloudMeasureReadyStyle}>Ready</div>}
                  {measurePoints && measurePoints.length > 0 && (
                    <button
                      onClick={onClearMeasurement}
                      style={cloudToolClearStyle}
                    >
                      CLEAR
                    </button>
                  )}
                </div>
              )}
            </div>
);

export type PointCloudLassoToolsProps = Pick<InfoBoxProps, 'isLassoMode' | 'onToggleLassoMode' | 'onClearLasso'>;

/** Show lasso instructions and forward toggle/clear actions; drawing and selection stay runtime-owned.
 * InfoBox retains the point-cloud visibility guard. No tool state or event subscriptions are owned here.
 */
export const PointCloudLassoTools: React.FC<PointCloudLassoToolsProps> = ({ isLassoMode, onToggleLassoMode, onClearLasso }) => (
<div
              style={cloudLassoPanelStyle(isLassoMode)}
            >
              <button
                onClick={onToggleLassoMode}
                title="Toggle Lasso Point Selection"
                style={cloudToolToggleStyle}
              >
                <span style={cloudLassoHeadingStyle(isLassoMode)}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={cloudToolIconStyle}>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM12 22c-5.52 0-10-4.48-10-10S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z" />
                    <circle cx="12" cy="12" r="3" fill="currentColor" />
                  </svg>
                  LASSO
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
                  Draw on image to select.
                  <button
                    onClick={onClearLasso}
                    style={cloudToolClearStyle}
                  >
                    CLEAR
                  </button>
                </div>
              )}
            </div>
);

export type PointCloudSightToolsProps = Pick<InfoBoxProps, 'isSightMode' | 'sightObserver' | 'sightTargets' | 'onToggleSightMode' | 'onClearSight'>;

/** Show observer/target guidance and forward toggle/clear actions; ray calculations stay runtime-owned.
 * InfoBox retains the point-cloud visibility guard. No tool state or event subscriptions are owned here.
 */
export const PointCloudSightTools: React.FC<PointCloudSightToolsProps> = ({ isSightMode, sightObserver, sightTargets, onToggleSightMode, onClearSight }) => (
<div
              style={cloudSightPanelStyle(isSightMode)}
            >
              <button
                onClick={onToggleSightMode}
                title="Toggle 3D Line of Sight"
                style={cloudToolToggleStyle}
              >
                <span style={cloudSightHeadingStyle(isSightMode)}>
                  <Icons.Eye size={12} style={cloudToolIconStyle} />
                  SIGHT
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
                  {!sightObserver && "Select Observer point"}
                  {sightObserver && "Click to add Targets"}
                  {(sightObserver || (sightTargets && sightTargets.length > 0)) && (
                    <button
                      onClick={onClearSight}
                      style={cloudToolClearStyle}
                    >
                      CLEAR
                    </button>
                  )}
                </div>
              )}
            </div>
);

export type PointCloudViewshedToolsProps = Pick<InfoBoxProps, 'isViewshedMode' | 'onToggleViewshedMode' | 'onClearViewshed'>;

/** Show viewshed instructions and forward toggle/clear actions; blind-spot calculations stay runtime-owned.
 * InfoBox retains the point-cloud visibility guard. No tool state or event subscriptions are owned here.
 */
export const PointCloudViewshedTools: React.FC<PointCloudViewshedToolsProps> = ({ isViewshedMode, onToggleViewshedMode, onClearViewshed }) => (
<div
              style={cloudViewshedPanelStyle(isViewshedMode)}
            >
              <button
                onClick={onToggleViewshedMode}
                title="Toggle 3D Viewshed (Blind Spot) Analysis"
                style={cloudToolToggleStyle}
              >
                <span style={cloudViewshedHeadingStyle(isViewshedMode)}>
                  <Icons.Viewshed size={12} style={cloudToolIconStyle} />
                  VIEWSHED
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
                  Click cloud to calculate blind spots.
                  <button
                    onClick={onClearViewshed}
                    style={cloudToolClearStyle}
                  >
                    CLEAR
                  </button>
                </div>
              )}
            </div>
);
