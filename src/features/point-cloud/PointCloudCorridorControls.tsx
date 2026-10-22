/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import type { InfoBoxProps } from '../../components/types';
import { cloudCorridorButtonStyle, cloudCorridorDividerStyle, cloudCorridorPanelStyle, cloudCorridorHeadingStyle, cloudCorridorAxisStyle, cloudCorridorStepRowStyle, cloudCorridorLengthValueStyle, cloudCorridorLengthIncreaseStyle, cloudCorridorSliderTrackStyle, cloudCorridorLengthMarkerStyle, cloudCorridorSliderStyle, cloudCorridorScaleStyle, cloudCorridorScaleMaximumStyle, cloudCorridorWidthDecreaseStyle, cloudCorridorWidthValueStyle, cloudCorridorWidthIncreaseStyle, cloudCorridorWidthMarkerStyle } from '../../styles/pointCloudControls';

export type PointCloudCorridorControlsProps = Pick<InfoBoxProps, 'pointCloudLength' | 'pointCloudMaxLength' | 'pointCloudActualLength' | 'onLengthChange' | 'pointCloudWidth' | 'pointCloudMaxWidth' | 'pointCloudActualWidth' | 'onWidthChange'> & {
 sliderDragValue: number | null;
 sliderDragWidthValue: number | null;
 onLengthDragChange: (value: number | null) => void;
 onWidthDragChange: (value: number | null) => void;
};

/** Preview slider drags without applying cloud updates; commit on mouse/touch release.
 * InfoBox owns draft lifetime and the runtime owns corridor filtering. Zero means FULL.
 */
export const PointCloudCorridorControls: React.FC<PointCloudCorridorControlsProps> = props => {
const { pointCloudLength, pointCloudMaxLength, pointCloudActualLength, onLengthChange, pointCloudWidth, pointCloudMaxWidth, pointCloudActualWidth, onWidthChange } =
                props;

              const lengthStep = 5;
              const lengthSliderMax = pointCloudMaxLength + lengthStep;
              const isLengthFull = pointCloudLength <= 0;
              const lengthSliderValue = isLengthFull ? lengthSliderMax : pointCloudLength;

              const handleLengthDec = () => {
                if (isLengthFull) {
                  onLengthChange(pointCloudMaxLength);
                } else {
                  const next = pointCloudLength - lengthStep;
                  onLengthChange(next < 10 ? 10 : next);
                }
              };
              const handleLengthInc = () => {
                if (isLengthFull) return;
                const next = pointCloudLength + lengthStep;
                onLengthChange(next > pointCloudMaxLength ? 0 : next);
              };

              const hasWidth = pointCloudWidth !== undefined && !!onWidthChange;
              const minWidth = 5;
              const maxWidth = pointCloudMaxWidth ?? 80;
              const widthStep = 5;
              const widthValue = pointCloudWidth ?? minWidth;
              const widthSliderMax = maxWidth + widthStep;
              const isWidthFull = (pointCloudWidth as number) <= 0 || widthValue >= widthSliderMax;
              const widthSliderValue = isWidthFull ? widthSliderMax : widthValue;

              const handleWidthDec = () => {
                if (!onWidthChange) return;
                if (isWidthFull) {
                  onWidthChange(maxWidth);
                } else {
                  onWidthChange(Math.max(minWidth, widthValue - widthStep));
                }
              };
              const handleWidthInc = () => {
                if (!onWidthChange) return;
                const next = widthValue + widthStep;
                onWidthChange(next > maxWidth ? 0 : next);
              };

              const btnBase = cloudCorridorButtonStyle;

              const divider = <div style={cloudCorridorDividerStyle} />;

              return (
                <div
                  style={cloudCorridorPanelStyle}
                >
                  {/* LENGTH sub-section */}
                  <div style={cloudCorridorHeadingStyle}>
                    LENGTH <span style={cloudCorridorAxisStyle}>N↔S</span>
                  </div>
                  <div style={cloudCorridorStepRowStyle}>
                    <button
                      title="Decrease length by 5m"
                      onClick={handleLengthDec}
                      style={btnBase}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                    >
                      &#8722;
                    </button>
                    <div style={cloudCorridorLengthValueStyle(isLengthFull)}>
                      {props.sliderDragValue !== null
                        ? props.sliderDragValue >= lengthSliderMax
                          ? `FULL (~${pointCloudActualLength}m)`
                          : `${props.sliderDragValue}m`
                        : isLengthFull
                          ? `FULL (~${pointCloudActualLength}m)`
                          : `${pointCloudLength}m`}
                    </div>
                    <button
                      title={isLengthFull ? "Already at full length" : "Increase length by 5m"}
                      onClick={handleLengthInc}
                      style={cloudCorridorLengthIncreaseStyle(isLengthFull, btnBase)}
                      onMouseEnter={(e) => {
                        if (!isLengthFull) e.currentTarget.style.background = "rgba(255,255,255,0.25)";
                      }}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                    >
                      +
                    </button>
                  </div>
                  <div style={cloudCorridorSliderTrackStyle}>
                    <div
                      style={cloudCorridorLengthMarkerStyle(pointCloudMaxLength, lengthSliderMax)}
                    />
                    <input
                      className="point-cloud-slider"
                      type="range"
                      min={10}
                      max={lengthSliderMax}
                      step={lengthStep}
                      value={props.sliderDragValue ?? lengthSliderValue}
                      onChange={(e) => props.onLengthDragChange(Number(e.target.value))}
                      onMouseUp={(e) => {
                        const val = Number((e.target as HTMLInputElement).value);
                        props.onLengthDragChange(null);
                        onLengthChange(val >= lengthSliderMax ? 0 : val);
                      }}
                      onTouchEnd={(e) => {
                        const val = Number((e.target as HTMLInputElement).value);
                        props.onLengthDragChange(null);
                        onLengthChange(val >= lengthSliderMax ? 0 : val);
                      }}
                      style={cloudCorridorSliderStyle}
                    />
                  </div>
                  <div style={cloudCorridorScaleStyle}>
                    <span>10m</span>
                    <span style={cloudCorridorScaleMaximumStyle}>{pointCloudMaxLength}m</span>
                    <span>FULL</span>
                  </div>

                  {/* WIDTH sub-section */}
                  {hasWidth && (
                    <React.Fragment>
                      {divider}
                      <div style={cloudCorridorHeadingStyle}>
                        WIDTH <span style={cloudCorridorAxisStyle}>E↔W</span>
                      </div>
                      <div style={cloudCorridorStepRowStyle}>
                        <button
                          title="Decrease width by 5m"
                          onClick={handleWidthDec}
                          style={cloudCorridorWidthDecreaseStyle(widthValue, minWidth, btnBase)}
                          onMouseEnter={(e) => {
                            if (widthValue > minWidth) e.currentTarget.style.background = "rgba(255,255,255,0.25)";
                          }}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                        >
                          &#8722;
                        </button>
                        <div style={cloudCorridorWidthValueStyle(isWidthFull)}>
                          {props.sliderDragWidthValue !== null
                            ? props.sliderDragWidthValue >= widthSliderMax
                              ? `FULL (~${pointCloudActualWidth}m)`
                              : `${props.sliderDragWidthValue}m`
                            : isWidthFull
                              ? `FULL (~${pointCloudActualWidth}m)`
                              : `${widthValue}m`}
                        </div>
                        <button
                          title={isWidthFull ? "Already at full width" : "Increase width by 5m"}
                          onClick={handleWidthInc}
                          style={cloudCorridorWidthIncreaseStyle(isWidthFull, btnBase)}
                          onMouseEnter={(e) => {
                            if (!isWidthFull) e.currentTarget.style.background = "rgba(255,255,255,0.25)";
                          }}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                        >
                          +
                        </button>
                      </div>
                      <div style={cloudCorridorSliderTrackStyle}>
                        <div
                          style={cloudCorridorWidthMarkerStyle(minWidth, maxWidth, widthSliderMax)}
                        />
                        <input
                          className="point-cloud-slider"
                          type="range"
                          min={minWidth}
                          max={widthSliderMax}
                          step={widthStep}
                          value={props.sliderDragWidthValue ?? widthSliderValue}
                          onChange={(e) => props.onWidthDragChange(Number(e.target.value))}
                          onMouseUp={(e) => {
                            const val = Number((e.target as HTMLInputElement).value);
                            props.onWidthDragChange(null);
                            onWidthChange!(val >= widthSliderMax ? 0 : val);
                          }}
                          onTouchEnd={(e) => {
                            const val = Number((e.target as HTMLInputElement).value);
                            props.onWidthDragChange(null);
                            onWidthChange!(val >= widthSliderMax ? 0 : val);
                          }}
                          style={cloudCorridorSliderStyle}
                        />
                      </div>
                      <div style={cloudCorridorScaleStyle}>
                        <span>{minWidth}m</span>
                        <span style={cloudCorridorScaleMaximumStyle}>{maxWidth}m</span>
                        <span>FULL</span>
                      </div>
                    </React.Fragment>
                  )}
                </div>
              );
};
