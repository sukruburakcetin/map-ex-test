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
                <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round">
                    {kind === "signs" ? <React.Fragment><path d="M12 3 21 18H3Z"/><path d="M12 8v4m0 3h.01M12 18v4"/></React.Fragment>
                        : <React.Fragment><path d="m12 3 9 5v9l-9 5-9-5V8Z"/><path d="m3 8 9 5 9-5M12 13v9m-4.5-16.5 9 5"/></React.Fragment>}
                </svg>
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
    </div>;
};
