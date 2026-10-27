/** @jsx jsx */
import { React, jsx } from "jimu-core";
import { SplashScreenProps } from "./types";
import { MAPILLARY_IMAGE } from "../utils/mapillary-image-base64";
import { getSplashOverlayStyle, splashAnimationCss } from '../styles/splashScreen';

/** A quiet field-notebook introduction; optional preparation never blocks exploration. */
export const SplashScreen: React.FC<SplashScreenProps> = ({ showIntro, filtersLoaded, onDismiss }) => {
    React.useEffect(() => {
        if (!showIntro || filtersLoaded || !onDismiss) return;
        const timer = setTimeout(onDismiss, 8000);
        return () => clearTimeout(timer);
    }, [showIntro, filtersLoaded, onDismiss]);
    if (!showIntro) return null;
    return <div className="mly-intro" style={getSplashOverlayStyle(filtersLoaded)}>
      <style>{splashAnimationCss}</style>
      <div className="mly-intro-layout">
        <div className="mly-intro-copy">
          <div className="mly-intro-brand"><img src={MAPILLARY_IMAGE} alt="" width={24} height={24}/><span>Mapillary Explorer</span></div>
          <h2>Every street<br className="mly-intro-break"/> has a story.</h2>
          <p>Take a closer look at the places around you.<br/>Find imagery. Trace a route. See what’s next.</p>
          <div className="mly-intro-bottom">
            {onDismiss && <button type="button" onClick={onDismiss}>Start exploring <svg aria-hidden="true" width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2 10 10 2M3 2h7v7"/></svg></button>}
            <span className="mly-intro-status" role="status">{!filtersLoaded && <span className="mly-intro-loading" aria-hidden="true"/>}{filtersLoaded ? "Ready to explore" : "Preparing your tools"}</span>
          </div>
        </div>
        <div className="mly-intro-scene" aria-hidden="true">
          <svg viewBox="0 0 480 112" preserveAspectRatio="xMidYMid slice">
            <rect width="480" height="112" fill="#d9dfca"/>
            <g fill="#c5ceb5"><path d="M0 0H60V41H0ZM76 0H155V41H76ZM171 0H259V41H171ZM275 0H350V41H275ZM366 0H480V41H366ZM0 57H60V112H0ZM76 57H155V112H76ZM171 57H259V112H171ZM275 57H350V112H275ZM366 57H480V112H366Z"/></g>
            <g stroke="#f4f2e6" strokeWidth="4" fill="none"><path d="M68 0V112M163 0V112M267 0V112M358 0V112M0 49H480"/></g>
            <path d="M0 85H68V49H163V16H267V49H358V85H480" fill="none" stroke="#35624d" strokeWidth="2.5" strokeLinejoin="round"/>
            <circle cx="267" cy="49" r="10" fill="#f4f2e6"/>
            <circle cx="267" cy="49" r="4" fill="#35624d"/>
            <circle cx="68" cy="85" r="3" fill="#35624d"/>
            <circle cx="358" cy="85" r="3" fill="#35624d"/>
          </svg>
          <span className="mly-intro-caption">FIND A STREET <span>FOLLOW ITS STORY</span></span>
        </div>
      </div>
    </div>;
};
