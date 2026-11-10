/** @jsx jsx */
import { useWidgetLocale } from '../i18n/WidgetLocale';
import { React, jsx } from "jimu-core";
import { controlBarInteractionCss, controlBarCompactCss, mapSpriteLoadingCss } from "../styles/controlPanels";
import * as Icons from "./Icons";
import { ControlBarProps } from "./types";

/** Presentational rail: layer toggles and their filters keep independent actions. */
export const ControlBar: React.FC<ControlBarProps> = (props) => {
 const { t, locale, owned } = useWidgetLocale();

    const [placesIconFailed,setPlacesIconFailed]=React.useState(false);
    const layer = (kind: "signs" | "objects", active: boolean, expanded: boolean,
        toggle: () => void, filter: () => void) => {
        const label = kind === "signs" ? t('uiTrafficSigns') : t('uiObjects');
        const status=active?(kind==='signs'?props.signSpritesStatus:props.objectSpritesStatus):'idle';
        const loading=status==='loading';
        const hint=loading?owned(kind==='signs'?'Loading traffic sign icons…':'Loading object icons…'):status==='error'?owned('Icons could not load. Toggle off and on to retry.'):label;
        return <div className="mly-rail-group" role="group" aria-label={label} key={kind}>
            <button type="button" className="mly-rail-button" title={hint}
                aria-label={label} aria-busy={loading} aria-pressed={active} onClick={toggle}>
                {kind === "signs" ? <Icons.AllMapillaryTrafficSigns size={18}/> : <Icons.AllMapillaryObjects size={18}/>}
                {loading?<span className="mly-rail-loading" aria-hidden="true"/>:status==='error'?<span className="mly-rail-check" aria-hidden="true">!</span>:active&&<span className="mly-rail-check" aria-hidden="true">✓</span>}
            </button>
            {active && <button type="button" className="mly-rail-button mly-rail-filter"
                title={t('uiFilterLayer',{label})} aria-label={t('uiFilterLayer',{label})}
                aria-expanded={expanded} onClick={filter}><Icons.Filter size={18}/></button>}
        </div>;
    };
    return <div className="glass-control-panel mly-control-rail" role="group" aria-label={t('uiMapControls')}>
        <style>{controlBarInteractionCss}{controlBarCompactCss}{mapSpriteLoadingCss}</style>
        <button type="button" className="mly-rail-button" title={props.isFullscreen ? t('uiExitFullscreen') : t('uiFullscreen')}
            aria-label={props.isFullscreen ? t('uiExitFullscreen') : t('uiFullscreen')}
            aria-pressed={props.isFullscreen} onClick={props.onToggleFullscreen}><Icons.Maximize size={20}/></button>
        {(!props.hideTurboFilter || props.enableTrafficSigns !== false || props.enableMapillaryObjects !== false) && <span className="mly-rail-divider" aria-hidden="true"/>}
        {!props.hideTurboFilter && <button type="button" className="mly-rail-button mly-rail-filter"
            title={props.turboModeActive ? t('uiCoverageFilters') : t('uiCoverageFiltersUnavailable')}
            aria-label={t('uiCoverageFilters')} aria-expanded={props.showTurboFilterBox}
            disabled={!props.turboModeActive} onClick={props.onToggleTurboFilter}><Icons.Filter size={20}/></button>}
        {props.enableTrafficSigns !== false && layer("signs", !!props.trafficSignsActive, props.showTrafficSignsFilterBox, props.onToggleTrafficSigns, props.onToggleTrafficSignsFilter)}
        {props.enableMapillaryObjects !== false && layer("objects", !!props.objectsActive, props.showObjectsFilterBox, props.onToggleObjects, props.onToggleObjectsFilter)}
        {props.enablePlaces && <div className="mly-rail-group" role="group" aria-label={t('uiNearbyPlaces')}>
            <button type="button" className="mly-rail-button" title={props.placesAvailable ? t('uiNearbyPlaces') : t('uiNearbyPlacesUnavailable')}
                aria-label={t('uiNearbyPlaces')} aria-pressed={!!props.placesActive} disabled={!props.placesAvailable} onClick={props.onTogglePlaces} data-mly-places-toggle="true">
                {!placesIconFailed?<img src="https://avatars.githubusercontent.com/u/120673461?s=280&v=4" alt="" aria-hidden="true" width="22" height="22" referrerPolicy="no-referrer" onError={()=>setPlacesIconFailed(true)} style={{display:'block',objectFit:'contain',borderRadius:3}}/>:<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 22s8-8 8-13a8 8 0 0 0-16 0c0 5 8 13 8 13Z"/><circle cx="12" cy="9" r="2.5"/></svg>}
                {props.placesActive && <span className="mly-rail-check" aria-hidden="true">✓</span>}
            </button>
            {props.placesActive && <button type="button" className="mly-rail-button mly-rail-filter" aria-label={t('uiFilterNearbyPlaces')} title={t('uiFilterNearbyPlaces')} aria-expanded={!!props.placesPanelOpen} onClick={props.onTogglePlacesPanel}><Icons.Filter size={18}/></button>}
        </div>}
    </div>;
};
