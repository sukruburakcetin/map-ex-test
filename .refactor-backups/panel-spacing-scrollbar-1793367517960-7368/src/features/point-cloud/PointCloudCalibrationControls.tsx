/** @jsx jsx */
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
export const PointCloudCalibrationControls: React.FC<PointCloudCalibrationControlsProps> = ({ showCalibrationPanel, nudgeStep, onToggleCalibrationPanel, onJoystickNudge, onResetCalibration, onSetNudgeStep, miniJoyStyle }) => (
<div
              style={calibrationPanelStyle(showCalibrationPanel)}
            >
              <button
                onClick={onToggleCalibrationPanel}
                title="Calibrate Point Cloud GPS Drift"
                style={calibrationToggleStyle}
              >
                <span style={calibrationHeadingStyle(showCalibrationPanel)}>
                  <Icons.Crosshair size={12} style={calibrationIconStyle} />
                  CALIBRATE
                </span>
                <div style={calibrationDisclosureStyle}>{showCalibrationPanel ? "▼" : "▲"}</div>
              </button>

              {showCalibrationPanel && (
                <div style={calibrationBodyStyle}>
                  {/* Step size toggle */}
                  <div style={calibrationStepsStyle}>
                    <label style={calibrationFineStepStyle(nudgeStep)}>
                      <input type="radio" checked={nudgeStep === 0.1} onChange={() => onSetNudgeStep?.(0.1)} style={calibrationHiddenRadioStyle} /> 0.1m
                    </label>
                    <label style={calibrationCoarseStepStyle(nudgeStep)}>
                      <input type="radio" checked={nudgeStep === 1.0} onChange={() => onSetNudgeStep?.(1.0)} style={calibrationHiddenRadioStyle} /> 1.0m
                    </label>
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
                      onClick={onResetCalibration}
                      style={calibrationResetStyle(miniJoyStyle)}
                    >
                      RST
                    </button>
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
                      ▼ Z
                    </button>
                    <button onClick={() => onJoystickNudge?.("z", 1)} style={calibrationVerticalButtonStyle(miniJoyStyle)}>
                      ▲ Z
                    </button>
                  </div>
                </div>
              )}
            </div>
);
