/** @jsx jsx */
import { React, jsx } from "jimu-core";
import { controlBarInteractionCss, controlBarCompactCss } from "../styles/controlPanels";
import * as Icons from "./Icons";
import { ControlBarProps } from "./types";

/** Presentational rail: layer toggles and their filters keep independent actions. */
export const ControlBar: React.FC<ControlBarProps> = (props) => {
    const layer = (kind: "signs" | "objects", active: boolean, expanded: boolean,
        toggle: () => void, filter: () => void) => {
        const label = kind === "signs" ? "Traffic signs" : "Objects";
        return <div className="mly-rail-group" role="group" aria-label={label} key={kind}>
            <button type="button" className="mly-rail-button" title={label}
                aria-label={label} aria-pressed={active} onClick={toggle}>
                {kind === "signs" ? <Icons.AllMapillaryTrafficSigns size={18}/> : <Icons.AllMapillaryObjects size={18}/>}
                {active && <span className="mly-rail-check" aria-hidden="true">✓</span>}
            </button>
            {active && <button type="button" className="mly-rail-button mly-rail-filter"
                title={`Filter ${label.toLowerCase()}`} aria-label={`Filter ${label.toLowerCase()}`}
                aria-expanded={expanded} onClick={filter}><Icons.Filter size={18}/></button>}
        </div>;
    };
    return <div className="glass-control-panel mly-control-rail" role="group" aria-label="Map controls">
        <style>{controlBarInteractionCss}{controlBarCompactCss}</style>
        <button type="button" className="mly-rail-button" title={props.isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            aria-label={props.isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            aria-pressed={props.isFullscreen} onClick={props.onToggleFullscreen}><Icons.Maximize size={20}/></button>
        {(!props.hideTurboFilter || props.enableTrafficSigns !== false || props.enableMapillaryObjects !== false) && <span className="mly-rail-divider" aria-hidden="true"/>}
        {!props.hideTurboFilter && <button type="button" className="mly-rail-button mly-rail-filter"
            title={props.turboModeActive ? "Coverage filters" : "Coverage filters unavailable"}
            aria-label="Coverage filters" aria-expanded={props.showTurboFilterBox}
            disabled={!props.turboModeActive} onClick={props.onToggleTurboFilter}><Icons.Filter size={20}/></button>}
        {props.enableTrafficSigns !== false && layer("signs", !!props.trafficSignsActive, props.showTrafficSignsFilterBox, props.onToggleTrafficSigns, props.onToggleTrafficSignsFilter)}
        {props.enableMapillaryObjects !== false && layer("objects", !!props.objectsActive, props.showObjectsFilterBox, props.onToggleObjects, props.onToggleObjectsFilter)}
        {props.enablePlaces && <div className="mly-rail-group" role="group" aria-label="Nearby places">
            <button type="button" className="mly-rail-button" title={props.placesAvailable ? "Nearby places" : "Nearby places unavailable"}
                aria-label="Nearby places" aria-pressed={!!props.placesActive} disabled={!props.placesAvailable} onClick={props.onTogglePlaces}>
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 22s8-8 8-13a8 8 0 0 0-16 0c0 5 8 13 8 13Z"/><circle cx="12" cy="9" r="2.5"/></svg>
                {props.placesActive && <span className="mly-rail-check" aria-hidden="true">✓</span>}
            </button>
            {props.placesActive && <button type="button" className="mly-rail-button mly-rail-filter" aria-label="Filter nearby places" title="Filter nearby places" aria-expanded={!!props.placesPanelOpen} onClick={props.onTogglePlacesPanel}><Icons.Filter size={18}/></button>}
        </div>}
    </div>;
};
