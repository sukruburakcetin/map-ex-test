/** @jsx jsx */
import { React, jsx } from "jimu-core";
import * as Icons from "./Icons";
import { controlBarInteractionCss, controlBarCompactCss } from "../styles/controlPanels";

interface FullscreenControlsProps {
    showMinimap: boolean;
    onExit: () => void;
    onToggleMinimap: () => void;
}

/** Keep portal controls consistent with the slim viewer rail. */
export const FullscreenControls: React.FC<FullscreenControlsProps> = ({ showMinimap, onExit, onToggleMinimap }) => (
    <div className="glass-control-panel mly-control-rail mly-fullscreen-controls" role="group" aria-label="Fullscreen controls">
        <style>{controlBarInteractionCss}{controlBarCompactCss}{`
          .glass-control-panel.mly-control-rail.mly-fullscreen-controls {
            top: calc(8px + env(safe-area-inset-top, 0px));
            left: calc(8px + env(safe-area-inset-left, 0px));
            max-height: calc(100% - 16px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)) !important;
          }
        `}</style>
        <button type="button" className="mly-rail-button" title="Exit fullscreen" aria-label="Exit fullscreen" onClick={onExit}>
            <Icons.Minimize size={18}/>
        </button>
        <span className="mly-rail-divider" aria-hidden="true"/>
        <button type="button" className="mly-rail-button" title={showMinimap ? "Hide minimap" : "Show minimap"}
            aria-label={showMinimap ? "Hide minimap" : "Show minimap"} aria-pressed={showMinimap} onClick={onToggleMinimap}>
            {showMinimap ? <Icons.MapOpen size={18}/> : <Icons.MapClosed size={18}/>}
        </button>
    </div>
);
