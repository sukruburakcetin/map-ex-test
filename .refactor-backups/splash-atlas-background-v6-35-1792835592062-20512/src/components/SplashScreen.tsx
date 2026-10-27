/** @jsx jsx */
import { React, jsx } from "jimu-core";
import { SplashScreenProps } from "./types";
import { MAPILLARY_IMAGE } from "../utils/mapillary-image-base64";
import { getSplashOverlayStyle, splashAnimationCss } from '../styles/splashScreen';

/** Static panoramic viewfinder; preparation and dismissal stay independent of the artwork. */
export const SplashScreen: React.FC<SplashScreenProps> = ({ showIntro, filtersLoaded, onDismiss }) => {
    const sceneId = React.useId().replace(/:/g, '');
    React.useEffect(() => {
        if (!showIntro || filtersLoaded || !onDismiss) return;
        const timer = setTimeout(onDismiss, 8000);
        return () => clearTimeout(timer);
    }, [showIntro, filtersLoaded, onDismiss]);
    if (!showIntro) return null;
    return <div className="mly-intro" style={getSplashOverlayStyle(filtersLoaded)}>
      <style>{splashAnimationCss}</style>
      <div className="mly-intro-layout">
        <div className="mly-intro-scene">
          <svg aria-hidden="true" viewBox="0 0 640 280" preserveAspectRatio="xMidYMid slice">
            <defs><linearGradient id={`${sceneId}-sky`} x2="0" y2="1"><stop stopColor="#36565e"/><stop offset="1" stopColor="#93aaa1"/></linearGradient></defs>
            <rect width="640" height="280" fill={`url(#${sceneId}-sky)`}/>
            <circle cx="414" cy="83" r="24" fill="#d7d5b0" opacity=".7"/>
            <path d="M0 137 95 121 139 135 219 109 285 125 332 111 419 129 514 104 640 135V280H0Z" fill="#607f77"/>
            <path d="M0 74 94 93V225L0 280Z" fill="#203f3f"/>
            <path d="M96 100 169 118V203L96 242Z" fill="#315553"/>
            <path d="M172 121 239 133V183L172 215Z" fill="#456a60"/>
            <path d="M640 60 548 96V229L640 280Z" fill="#214744"/>
            <path d="M545 106 477 124V202L545 241Z" fill="#365b50"/>
            <path d="M475 128 415 138V184L475 215Z" fill="#4f7362"/>
            <g fill="#abc2a3" opacity=".35"><path d="M19 109 37 112V144L19 144ZM54 116 73 120V144H54ZM112 129 127 132V155H112ZM143 136 156 139V155H143ZM564 116 584 110V144H564ZM605 101 625 95V144H605ZM489 143 503 139V158H489ZM517 135 532 131V158H517Z"/></g>
            <path d="M304 146H349L523 280H124Z" fill="#293f40"/>
            <path d="M304 146 147 280M349 146 500 280" fill="none" stroke="#9eb5a2" strokeWidth="2"/>
            <path d="M326 153V163M326 178V196M326 220V259" fill="none" stroke="#d4d4ad" strokeWidth="2"/>
            <g stroke="#294b45" strokeWidth="2"><path d="M265 150V100M390 150V106"/><path d="M265 100H278M390 106H380"/></g>
            <g fill="#a3baa5"><ellipse cx="280" cy="100" rx="5" ry="2"/><ellipse cx="378" cy="106" rx="4" ry="2"/></g>
            <path d="M0 266H640V280H0Z" fill="#203b35" opacity=".35"/>
          </svg>
          <div className="mly-intro-brand"><img src={MAPILLARY_IMAGE} alt="" width={22} height={22}/><span>Mapillary Explorer</span></div>
          <div className="mly-viewfinder-frame" aria-hidden="true"><i/><i/><i/><i/></div>
          <span className="mly-intro-caption" aria-hidden="true">A wider world. One street at a time.</span>
        </div>
        <div className="mly-intro-copy">
          <div className="mly-intro-heading"><h2>Find your point of view.</h2><p>Street imagery, connected by the map.</p></div>
          <div className="mly-intro-bottom">
            {onDismiss && <button type="button" onClick={onDismiss} disabled={filtersLoaded}>Start exploring <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2 6h8M6 2l4 4-4 4"/></svg></button>}
            <span className="mly-intro-status" role="status">{!filtersLoaded && <span className="mly-intro-loading" aria-hidden="true"/>}{filtersLoaded ? "Ready to explore" : "Preparing your tools"}</span>
          </div>
        </div>
      </div>
    </div>;
};
