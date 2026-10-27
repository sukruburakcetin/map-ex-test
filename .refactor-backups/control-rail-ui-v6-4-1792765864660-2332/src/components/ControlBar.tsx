/** @jsx jsx */
import { React, jsx } from "jimu-core";
import { glassStyles } from "../utils/styles";
import { controlBarInteractionCss, controlBarCompactCss } from '../styles/controlPanels';
import * as Icons from "../components/Icons";
import { ControlBarProps } from "./types";

/**
    * ControlBar
    * Vertical glass button panel docked at the left edge of the widget.
    * Contains:
    *  - Fullscreen toggle
    *  - Coverage filters
    *  - Traffic Signs group (main button + filter toggle)
    *  - Objects group (main button + filter toggle)
    * All click handlers are passed in as props - this component is purely
    * presentational and owns no state.
*/
export const ControlBar: React.FC<ControlBarProps> = ({
    hideTurboFilter,
    enableTrafficSigns,
    enableMapillaryObjects,
    isFullscreen,
    tilesActive,
    turboModeActive,
    showTurboFilterBox,
    trafficSignsActive,
    showTrafficSignsFilterBox,
    objectsActive,
    showObjectsFilterBox,
    jimuMapView,
    onToggleFullscreen,
    onToggleTurboFilter,
    onToggleTrafficSigns,
    onToggleTrafficSignsFilter,
    onToggleObjects,
    onToggleObjectsFilter
}) => {

    // Fullscreen control
    const singleButtons = [
        {
            id: "fullscreen",
            content: <Icons.Maximize size={20} />,
            onClick: onToggleFullscreen,
            title: "Maximize/Fullscreen",
            bg: "rgba(2, 117, 216, 0.9)",
            active: isFullscreen
        }
    ];

    return (
        <div
            className="glass-control-panel"
            style={{ ...glassStyles.container, background: "rgba(18,31,27,0.62)", border: "1px solid rgba(170,205,188,0.22)", borderRadius: 12, boxShadow: "0 4px 14px rgba(0,0,0,0.2)" }}
        >
<style>{controlBarInteractionCss}</style>
            <style>{controlBarCompactCss}</style>
            {/* SINGLE ICON BUTTONS */}
            {singleButtons.map((btn, i) => (
                <button
                            type="button"
                    className={`unified-control-buttons-mapped${btn.active ? " is-active" : ""}`}
                    key={i}
                    title={btn.title}
                    aria-label={btn.title}
                    aria-pressed={btn.active}
                    onClick={btn.onClick}
                    style={{ ...glassStyles.getButtonStyle(btn.active, btn.bg), boxSizing: "border-box", border: btn.active ? "1px solid rgba(195,230,214,0.65)" : "1px solid rgba(255,255,255,0.08)" }}
                >
                    {btn.content}
                </button>
            ))}

            {/* TURBO MODE GROUP */}
            {!hideTurboFilter && (
                <div style={glassStyles.groupContainer(turboModeActive)}>
                    {/* Turbo filter toggle */}
                    {!hideTurboFilter && (
                        <button
                            type="button"
                            className={`unified-control-buttons-filters${turboModeActive ? " is-hoverable" : ""}`}
                            title="Filter Coverage"
                            aria-label="Filter Coverage"
                            aria-expanded={showTurboFilterBox}
                            onClick={onToggleTurboFilter}
                            style={{
                                ...glassStyles.getButtonStyle(showTurboFilterBox, "rgba(255, 215, 0, 0.5)", true),
                                opacity: turboModeActive ? 1 : 0.6,
                                cursor: turboModeActive ? "pointer" : "default"
                            }}
                        >
                            <Icons.Filter size={16} />
                        </button>
                    )}
                </div>
            )}

            {/* TRAFFIC SIGNS GROUP */}
            {enableTrafficSigns !== false && (
                <div style={glassStyles.groupContainer(trafficSignsActive)}>
                    <button
                            type="button"
                        className={`unified-control-buttons${trafficSignsActive ? " is-active" : ""}`}
                        title="Toggle Mapillary Traffic Signs Layer"
                        aria-label="Toggle Mapillary Traffic Signs Layer"
                        aria-pressed={trafficSignsActive}
                        onClick={onToggleTrafficSigns}
                        style={{ ...glassStyles.getButtonStyle(trafficSignsActive, "rgba(147, 102, 19, 0.3)"), boxSizing: "border-box", border: trafficSignsActive ? "1px solid rgba(195,230,214,0.65)" : "1px solid rgba(255,255,255,0.08)" }}
                    >
                        <Icons.AllMapillaryTrafficSigns size={16}
                            style={{ filter: trafficSignsActive ? "drop-shadow(0 0 1.2px grey)" : "none" }}
                        />
                    </button>
                    {trafficSignsActive && <button
                            type="button"
                        className={`unified-control-buttons-filters${trafficSignsActive ? " is-hoverable" : ""}`}
                        title="Filter Traffic Signs"
                        aria-label="Filter Traffic Signs"
                        aria-expanded={showTrafficSignsFilterBox}
                        onClick={onToggleTrafficSignsFilter}
                        style={{
                            ...glassStyles.getButtonStyle(showTrafficSignsFilterBox, "rgba(255, 165, 0, 0.5)", true),
                            opacity: trafficSignsActive ? 1 : 0.6,
                            cursor: trafficSignsActive ? "pointer" : "default"
                        }}
                    >
                        <Icons.Filter size={16} />
                    </button>}
                </div>
            )}

            {/* OBJECTS GROUP */}
            {enableMapillaryObjects !== false && (
                <div style={glassStyles.groupContainer(objectsActive)}>
                    <button
                            type="button"
                        className={`unified-control-buttons${objectsActive ? " is-active" : ""}`}
                        title="Toggle Mapillary Objects Layer"
                        aria-label="Toggle Mapillary Objects Layer"
                        aria-pressed={objectsActive}
                        onClick={onToggleObjects}
                        style={{ ...glassStyles.getButtonStyle(objectsActive, "rgba(155, 55, 55, 0.3)"), boxSizing: "border-box", border: objectsActive ? "1px solid rgba(195,230,214,0.65)" : "1px solid rgba(255,255,255,0.08)" }}
                    >
                        <Icons.AllMapillaryObjects size={16}
                            style={{ filter: objectsActive ? "drop-shadow(0 0 0.2px grey)" : "none" }}
                        />
                    </button>
                    {objectsActive && <button
                            type="button"
                        className={`unified-control-buttons-filters${objectsActive ? " is-hoverable" : ""}`}
                        title="Filter Objects"
                        aria-label="Filter Objects"
                        aria-expanded={showObjectsFilterBox}
                        onClick={onToggleObjectsFilter}
                        style={{
                            ...glassStyles.getButtonStyle(showObjectsFilterBox, "rgba(255, 60, 60, 0.5)", true),
                            opacity: objectsActive ? 1 : 0.6,
                            cursor: objectsActive ? "pointer" : "default"
                        }}
                    >
                        <Icons.Filter size={16} />
                    </button>}
                </div>
            )}
        </div>
    );
};
