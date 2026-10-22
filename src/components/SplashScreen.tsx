/** @jsx jsx */
import { React, jsx } from "jimu-core";
import { SplashScreenProps } from "./types";
import { MAPILLARY_IMAGE } from "../utils/mapillary-image-base64";
import { getSplashOverlayStyle, splashAnimationCss, splashBackdropStyle, splashCardStyle, splashLogoStyle, splashEyebrowStyle, splashTitleStyle, splashTaglineStyle, splashStatusStyle } from '../styles/splashScreen';

/** Existing route design with staggered heartbeat pulses; CSS only, reduced-motion safe. */
export const SplashScreen: React.FC<SplashScreenProps> = ({ showIntro, filtersLoaded, onDismiss }) => {
    const gradientId = React.useRef(`mly-intro-flow-${Math.random().toString(36).slice(2)}`).current;
    React.useEffect(() => {
        if (!showIntro || filtersLoaded || !onDismiss) return;
        // Decorative intro must not block the map if optional filter preparation fails.
        const timer = setTimeout(onDismiss, 8000);
        return () => clearTimeout(timer);
    }, [showIntro, filtersLoaded, onDismiss]);
    if (!showIntro) return null;
    return <div className="mly-intro" style={getSplashOverlayStyle(filtersLoaded)}>
      <style>{splashAnimationCss}</style>
      <svg aria-hidden="true" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" style={splashBackdropStyle}>
        <defs><linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="0" y1="400" x2="600" y2="0"><stop offset="0" stopColor="#52bd87" stopOpacity="0" /><stop offset="0.45" stopColor="#87f2b4" /><stop offset="0.65" stopColor="#c8ffdd" /><stop offset="1" stopColor="#52bd87" stopOpacity="0" /></linearGradient></defs>
        <g stroke="#7eb799" strokeWidth="1" fill="none" opacity="0.17"><path d="M0 80H600M0 170H600M0 280H600M100 0V400M230 0V400M390 0V400M510 0V400" /><path d="M0 390L600 30" /></g>
        <path className="mly-intro-route" opacity="0.17" pathLength="1" d="M40 280H230V170H390V80H550" fill="none" stroke="#6be4a0" strokeWidth="3" />
        <g fill="none" stroke={`url(#${gradientId})`} strokeWidth="2">
          {["M0 80H600", "M0 170H600", "M0 280H600", "M100 0V400", "M230 0V400", "M390 0V400", "M510 0V400", "M0 390L600 30", "M40 280H230V170H390V80H550"].map((road, index) =>
            <path key={road} className="mly-intro-flow" pathLength="1" d={road} style={{ animationDelay: `${-index * 260}ms`, animationPlayState: filtersLoaded ? "paused" : "running" }} />
          )}
        </g>
      </svg>
      <div className="mly-intro-card" style={splashCardStyle}>
        <img src={MAPILLARY_IMAGE} alt="" width={42} height={42} style={splashLogoStyle} />
        <div style={splashEyebrowStyle}>MAPILLARY</div>
        <div style={splashTitleStyle}>Explorer</div>
        <p style={splashTaglineStyle}>Explore imagery. Find coverage. Plan your next capture.</p>
        <div role="status" style={splashStatusStyle}>{filtersLoaded ? "Ready to explore" : "Preparing imagery tools…"}</div>

      </div>
    </div>;
};
