/** @jsx jsx */
import { OwnedMessage } from '../../i18n/WidgetLocale';
import { useWidgetLocale } from '../../i18n/WidgetLocale';
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
 const { t, locale } = useWidgetLocale();

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
                     {t('uiLength')} <span style={cloudCorridorAxisStyle}> {t('uiNS')} </span>
                  </div>
                  <div style={cloudCorridorStepRowStyle}>
                    <button
                      title={t('uiDecreaseLengthBy5m')}
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
                          ? <OwnedMessage source={"FULL (~{value0}m)"} values={{value0:String(pointCloudActualLength)}}/>
                          : `${props.sliderDragValue}m`
                        : isLengthFull
                          ? <OwnedMessage source={"FULL (~{value0}m)"} values={{value0:String(pointCloudActualLength)}}/>
                          : `${pointCloudLength}m`}
                    </div>
                    <button
                      title={isLengthFull ? t('uiAlreadyAtFullLength') : t('uiIncreaseLengthBy5m')}
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
                    <span> {t('ui10m2')} </span>
                    <span style={cloudCorridorScaleMaximumStyle}>{pointCloudMaxLength} {t('uiM')} </span>
                    <span> {t('uiFull')} </span>
                  </div>

                  {/* WIDTH sub-section */}
                  {hasWidth && (
                    <React.Fragment>
                      {divider}
                      <div style={cloudCorridorHeadingStyle}>
                         {t('uiWidth')} <span style={cloudCorridorAxisStyle}> {t('uiEW')} </span>
                      </div>
                      <div style={cloudCorridorStepRowStyle}>
                        <button
                          title={t('uiDecreaseWidthBy5m')}
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
                              ? <OwnedMessage source={"FULL (~{value0}m)"} values={{value0:String(pointCloudActualWidth)}}/>
                              : `${props.sliderDragWidthValue}m`
                            : isWidthFull
                              ? <OwnedMessage source={"FULL (~{value0}m)"} values={{value0:String(pointCloudActualWidth)}}/>
                              : `${widthValue}m`}
                        </div>
                        <button
                          title={isWidthFull ? t('uiAlreadyAtFullWidth') : t('uiIncreaseWidthBy5m')}
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
                        <span>{minWidth} {t('uiM')} </span>
                        <span style={cloudCorridorScaleMaximumStyle}>{maxWidth} {t('uiM')} </span>
                        <span> {t('uiFull')} </span>
                      </div>
                    </React.Fragment>
                  )}
                </div>
              );
};
