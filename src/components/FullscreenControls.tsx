/** @jsx jsx */
import { useWidgetLocale } from '../i18n/WidgetLocale';
import { React, jsx } from "jimu-core";
import * as Icons from "./Icons";
import { fullscreenControlRailCss } from "../styles/fullscreenViewer";
import { controlBarInteractionCss, controlBarCompactCss } from "../styles/controlPanels";

interface FullscreenControlsProps {
    showMinimap: boolean;
    onExit: () => void;
    onToggleMinimap: () => void;
}

/** Keep portal controls consistent with the slim viewer rail. */
export const FullscreenControls: React.FC<FullscreenControlsProps> = ({ showMinimap, onExit, onToggleMinimap }) => { const { t, locale } = useWidgetLocale(); return (
    <div className="glass-control-panel mly-control-rail mly-fullscreen-controls" role="group" aria-label={t('uiFullscreenControls')}>
        <style>{controlBarInteractionCss}{controlBarCompactCss}{fullscreenControlRailCss}</style>
        <button type="button" className="mly-rail-button" title={t('uiExitFullscreen')} aria-label={t('uiExitFullscreen')} onClick={onExit}>
            <Icons.Minimize color="currentColor" size={18}/>
        </button>
        <span className="mly-rail-divider" aria-hidden="true"/>
        <button type="button" className="mly-rail-button" title={showMinimap ? t('uiHideMinimap') : t('uiShowMinimap')}
            aria-label={showMinimap ? t('uiHideMinimap') : t('uiShowMinimap')} aria-pressed={showMinimap} onClick={onToggleMinimap}>
            {showMinimap ? <Icons.MapOpen size={18}/> : <Icons.MapClosed size={18}/>}
        </button>
    </div>
); };
