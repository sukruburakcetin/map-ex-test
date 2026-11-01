/** @jsx jsx */
import { useWidgetLocale } from '../i18n/WidgetLocale';
import { React, jsx } from "jimu-core";
import { getImageryLoadingOverlayStyle, imageryLoadingAnimationCss, imageryLoadingCardStyle, imagerySpinnerStyle, imageryLoadingTextStyle } from '../styles/imageryLoading';

export const ImageryLoading: React.FC<{ loading: boolean; hasImage: boolean; representative?: boolean 
  resolving?: boolean; progress?: string; onCancel?: () => void}> = ({ loading, hasImage, representative, resolving, progress, onCancel}) => {
 const { t, locale } = useWidgetLocale();

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
        <span title={representative ? t('uiOpeningRepresentativeStreetImageryZoomCloserToChoose') : t('uiOpeningStreetImagery')} style={imageryLoadingTextStyle}>{resolving ? `Finding nearest frame${progress ? ` · ${progress}` : "…"}` : slow ? t('uiOpeningImageryTakingLongerThanUsual') : representative ? t('uiOpeningRepresentativeImageryZoomCloserToChooseA') : t('uiOpeningStreetImagery')}</span>
        {resolving && onCancel && <button type="button" onClick={onCancel} className="mly-imagery-cancel"> {t('uiCancel')} </button>}
      </div>
    </div>;
};
