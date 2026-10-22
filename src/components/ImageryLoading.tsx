/** @jsx jsx */
import { React, jsx } from "jimu-core";
import { getImageryLoadingOverlayStyle, imageryLoadingAnimationCss, imageryLoadingCardStyle, imagerySpinnerStyle, imageryLoadingTextStyle } from '../styles/imageryLoading';

export const ImageryLoading: React.FC<{ loading: boolean; hasImage: boolean; representative?: boolean 
  resolving?: boolean; progress?: string; onCancel?: () => void}> = ({ loading, hasImage, representative, resolving, progress, onCancel}) => {
    const [slow, setSlow] = React.useState(false);
    React.useEffect(() => {
        setSlow(false);
        if (!loading) return;
        const timer = setTimeout(() => setSlow(true), 8000);
        return () => clearTimeout(timer);
    }, [loading]);
    if (!loading) return null;
    return <div style={getImageryLoadingOverlayStyle(hasImage)}>
      <style>{imageryLoadingAnimationCss}</style>
      <div role="status" aria-live="polite" style={imageryLoadingCardStyle}>
        <span aria-hidden="true" className="mly-imagery-spinner" style={imagerySpinnerStyle} />
        <span title={representative ? "Opening representative street imagery. Zoom closer to choose a specific image." : "Opening street imagery"} style={imageryLoadingTextStyle}>{resolving ? `Finding nearest frame${progress ? ` · ${progress}` : "…"}` : slow ? "Opening imagery · Taking longer than usual" : representative ? "Opening representative imagery · Zoom closer to choose a frame" : "Opening street imagery"}</span>
        {resolving && onCancel && <button type="button" onClick={onCancel} className="mly-imagery-cancel">Cancel</button>}
      </div>
    </div>;
};
