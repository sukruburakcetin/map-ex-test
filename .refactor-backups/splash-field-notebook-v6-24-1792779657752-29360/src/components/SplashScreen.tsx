/** @jsx jsx */
import { React, jsx } from "jimu-core";
import { SplashScreenProps } from "./types";
import { MAPILLARY_IMAGE } from "../utils/mapillary-image-base64";
import { getSplashOverlayStyle, splashAnimationCss } from '../styles/splashScreen';

/** Quiet, responsive map-to-street introduction; optional preparation never blocks exploration. */
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
          <div className="mly-intro-brand"><img src={MAPILLARY_IMAGE} alt="" width={24} height={24}/><span>MAPILLARY / EXPLORER</span></div>
          <h2>A different<br className="mly-intro-break"/> view of the street.</h2>
          <p>Follow the map. Step into imagery.<br/>Find your next place to capture.</p>
          <div className="mly-intro-bottom">
            {onDismiss && <button type="button" onClick={onDismiss}>Explore map <svg aria-hidden="true" width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2 10 10 2M3 2h7v7"/></svg></button>}
            <span className="mly-intro-status" role="status">{!filtersLoaded && <span className="mly-intro-loading" aria-hidden="true"/>}{filtersLoaded ? "Ready to explore" : "Getting things ready"}</span>
          </div>
        </div>
        <div className="mly-intro-scene" aria-hidden="true">
          <svg viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice">
            <rect width="300" height="300" fill="#1d3d32"/>
            <path d="M0 0H152V300H0Z" fill="#244b3c"/>
            <g fill="#305b46"><path d="M0 0H52V60H0ZM67 0H136V60H67ZM0 78H52V141H0ZM67 78H136V141H67ZM0 158H52V224H0ZM67 158H136V224H67ZM0 242H52V300H0ZM67 242H136V300H67Z"/></g>
            <g fill="none" stroke="#8da494" strokeWidth="5"><path d="M59 0V300M144 0V300M0 69H160M0 150H160M0 233H160"/></g>
            <path d="M26 270H59V150H144" fill="none" stroke="#8de0a7" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="59" cy="150" r="7" fill="#b9f1c8" stroke="#244b3c" strokeWidth="3"/>
            <path d="M153 0H300V300H153Z" fill="#789689"/>
            <path d="M153 0H300V130L226 111 153 130Z" fill="#acc3b2"/>
            <path d="M153 66L192 94V167L153 196Z" fill="#3f6654"/>
            <path d="M153 82L180 101V155L153 174Z" fill="#648673"/>
            <path d="M300 51L259 87V172L300 211Z" fill="#375b4a"/>
            <path d="M300 73L270 96V153L300 181Z" fill="#668776"/>
            <path d="M213 130H237L300 300H153Z" fill="#314d42"/>
            <path d="M213 130L161 300M237 130L295 300" fill="none" stroke="#c1cabb" strokeWidth="2"/>
            <path d="M225 146V158M225 173V195M225 220V260" fill="none" stroke="#d3d9bf" strokeWidth="2"/>
            <path d="M144 0V300" stroke="#b1d8bd" strokeWidth="1" opacity=".5"/>
            <circle cx="144" cy="150" r="15" fill="#c4eccd"/>
            <path d="M138 150H150M146 146L150 150 146 154" fill="none" stroke="#254b38" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="mly-intro-caption">ON THE MAP <span>IN THE MOMENT</span></span>
        </div>
      </div>
    </div>;
};
