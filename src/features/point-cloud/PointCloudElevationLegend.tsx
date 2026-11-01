/** @jsx jsx */
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import { jsx } from 'jimu-core';
import { cloudElevationLegendPanelStyle, cloudElevationLegendHeadingStyle, cloudElevationLegendRowsStyle, cloudElevationLegendRowStyle, cloudElevationLegendValueGroupStyle, cloudElevationLegendMarkerStyle, cloudElevationLegendValueStyle, cloudElevationLegendLabelStyle } from '../../styles/pointCloudElevationLegend';

/** Present the existing elevation color key without changing point coloring or map legend entries.
 * InfoBox retains the cloud-visible/elevation-mode guard. Labels describe the existing display scale.
 */
export function PointCloudElevationLegend() {
 const { t, locale } = useWidgetLocale();

 return (
<div
              style={cloudElevationLegendPanelStyle}
            >
              <div style={cloudElevationLegendHeadingStyle}> {t('uiElevation')} </div>
              <div style={cloudElevationLegendRowsStyle}>
                {[
                  { val: "15m+", col: "#FF0000", lbl: t('uiTall') },
                  { val: "7.0m", col: "#FFFF00", lbl: t('uiPoles') },
                  { val: "2.5m", col: "#00FF00", lbl: t('uiFences') },
                  { val: "0.0m", col: "#00FFFF", lbl: t('uiRoad') },
                  { val: t('uiBelow'), col: "#0000FF", lbl: t('uiDitch') },
                ].map((item) => (
                  <div key={item.val} style={cloudElevationLegendRowStyle}>
                    <div style={cloudElevationLegendValueGroupStyle}>
                      <div
                        style={cloudElevationLegendMarkerStyle(item.col)}
                      />
                      <span style={cloudElevationLegendValueStyle}>{item.val}</span>
                    </div>
                    <span style={cloudElevationLegendLabelStyle}>{item.lbl}</span>
                  </div>
                ))}
              </div>
            </div>
 );
}
