/** @jsx jsx */
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import { React, jsx } from 'jimu-core';
import * as Icons from '../../components/Icons';
import type { InfoBoxProps } from '../../components/types';
import { calibrationPanelStyle, calibrationToggleStyle, calibrationHeadingStyle, calibrationIconStyle, calibrationDisclosureStyle, calibrationBodyStyle, calibrationStepsStyle, calibrationFineStepStyle, calibrationHiddenRadioStyle, calibrationCoarseStepStyle, calibrationPadStyle, calibrationResetStyle, calibrationVerticalRowStyle, calibrationVerticalButtonStyle } from '../../styles/pointCloudCalibration';

export type PointCloudCalibrationControlsProps = Pick<InfoBoxProps, 'showCalibrationPanel' | 'nudgeStep' | 'onToggleCalibrationPanel' | 'onJoystickNudge' | 'onResetCalibration' | 'onSetNudgeStep'> & {
 miniJoyStyle: React.CSSProperties;
};

/** Display calibration steps and forward axis/direction, reset and disclosure actions unchanged.
 * Runtime owns alignment offsets and scene updates. InfoBox retains cloud visibility and supplies
 * the existing shared joystick style for compatibility with legacy style layouts.
 */
export const PointCloudCalibrationControls: React.FC<PointCloudCalibrationControlsProps> = ({ showCalibrationPanel, nudgeStep, onToggleCalibrationPanel, onJoystickNudge, onResetCalibration, onSetNudgeStep, miniJoyStyle }) => { const { t, locale } = useWidgetLocale(); return (
<div
              style={calibrationPanelStyle(showCalibrationPanel)}
            >
              <button
                onClick={onToggleCalibrationPanel}
                title={t('uiCalibratePointCloudGpsDrift')}
                style={calibrationToggleStyle}
              >
                <span className="mly-tool-heading" style={calibrationHeadingStyle(showCalibrationPanel)}>
                  <Icons.Crosshair size={12} style={calibrationIconStyle} />
                  <span className="mly-tool-text"> {t('uiCalibrate')} </span>
                </span>
                <div style={calibrationDisclosureStyle}>{showCalibrationPanel ? "▼" : "▲"}</div>
              </button>

              {showCalibrationPanel && (
                <div style={calibrationBodyStyle}>
                  {/* Step size toggle */}
                  <div style={calibrationStepsStyle}>
                    <label style={calibrationFineStepStyle(nudgeStep)}>
                      <input type="radio" checked={nudgeStep === 0.1} onChange={() => onSetNudgeStep?.(0.1)} style={calibrationHiddenRadioStyle} />  {t('ui01m')} </label>
                    <label style={calibrationCoarseStepStyle(nudgeStep)}>
                      <input type="radio" checked={nudgeStep === 1.0} onChange={() => onSetNudgeStep?.(1.0)} style={calibrationHiddenRadioStyle} />  {t('ui10m')} </label>
                  </div>

                  {/* Micro D-Pad */}
                  <div style={calibrationPadStyle}>
                    <div />
                    <button onClick={() => onJoystickNudge?.("y", 1)} style={miniJoyStyle}>
                      ▲
                    </button>
                    <div />
                    <button onClick={() => onJoystickNudge?.("x", -1)} style={miniJoyStyle}>
                      ◀
                    </button>
                    <button
                      title={t('uiResetCalibration')} aria-label={t('uiResetCalibration')} onClick={onResetCalibration}
                      style={calibrationResetStyle(miniJoyStyle)}
                    >
                       {t('uiRst')} </button>
                    <button onClick={() => onJoystickNudge?.("x", 1)} style={miniJoyStyle}>
                      ▶
                    </button>
                    <div />
                    <button onClick={() => onJoystickNudge?.("y", -1)} style={miniJoyStyle}>
                      ▼
                    </button>
                    <div />
                  </div>

                  {/* Vertical Z-controls */}
                  <div style={calibrationVerticalRowStyle}>
                    <button onClick={() => onJoystickNudge?.("z", -1)} style={calibrationVerticalButtonStyle(miniJoyStyle)}>
                       {t('uiZ')} </button>
                    <button onClick={() => onJoystickNudge?.("z", 1)} style={calibrationVerticalButtonStyle(miniJoyStyle)}>
                       {t('uiZ2')} </button>
                  </div>
                </div>
              )}
            </div>
); };
