/** @jsx jsx */
import { useWidgetLocale } from '../i18n/WidgetLocale';
import { React, jsx } from "jimu-core";
import * as Icons from "./Icons";
import { controlBarInteractionCss, controlBarCompactCss } from "../styles/controlPanels";

interface FullscreenControlsProps {
    showMinimap: boolean;
    onExit: () => void;
    onToggleMinimap: () => void;
}

/** Keep portal controls consistent with the slim viewer rail. */
export const FullscreenControls: React.FC<FullscreenControlsProps> = ({ showMinimap, onExit, onToggleMinimap }) => { const { t, locale } = useWidgetLocale(); return (
    <div className="glass-control-panel mly-control-rail mly-fullscreen-controls" role="group" aria-label={t('uiFullscreenControls')}>
        <style>{controlBarInteractionCss}{controlBarCompactCss}{`
          .glass-control-panel.mly-control-rail.mly-fullscreen-controls {
            top: calc(8px + env(safe-area-inset-top, 0px));
            left: calc(8px + env(safe-area-inset-left, 0px));
            max-height: calc(100% - 16px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)) !important;
          }
        `}</style>
        <button type="button" className="mly-rail-button" title={t('uiExitFullscreen')} aria-label={t('uiExitFullscreen')} onClick={onExit}>
            <Icons.Minimize size={18}/>
        </button>
        <span className="mly-rail-divider" aria-hidden="true"/>
        <button type="button" className="mly-rail-button" title={showMinimap ? t('uiHideMinimap') : t('uiShowMinimap')}
            aria-label={showMinimap ? t('uiHideMinimap') : t('uiShowMinimap')} aria-pressed={showMinimap} onClick={onToggleMinimap}>
            {showMinimap ? <Icons.MapOpen size={18}/> : <Icons.MapClosed size={18}/>}
        </button>
    </div>
); };
