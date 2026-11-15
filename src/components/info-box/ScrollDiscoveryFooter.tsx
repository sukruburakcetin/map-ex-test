/** @jsx jsx */
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import { React, jsx } from 'jimu-core';
import { infoFooterPanelStyle, infoFooterRowStyle, infoFooterUpStyle, infoFooterDownStyle, infoFooterHintCss } from '../../styles/infoBox';

export interface ScrollDiscoveryFooterProps {
 canScrollDown: boolean;
 canScrollUp: boolean;
 isOverflowing: boolean;
 scrollContainerRef: { readonly current: HTMLDivElement | null };
}

/** Navigate the existing controls viewport using supplied overflow state.
 * InfoBox owns resize observation and ref lifetime. Actions read the live viewport, preserve
 * the minimum/relative scroll distance and respect reduced motion without adding listeners.
 */
export const ScrollDiscoveryFooter: React.FC<ScrollDiscoveryFooterProps> = ({ canScrollDown, canScrollUp, isOverflowing, scrollContainerRef }) => { const { t, locale } = useWidgetLocale(); return (
<div className="mly-info-footer" style={infoFooterPanelStyle(isOverflowing, canScrollDown)}>
          <style>{infoFooterHintCss}</style>
          <div style={{ ...infoFooterRowStyle, gridTemplateColumns: canScrollUp && canScrollDown ? "20px minmax(0,1fr)" : "minmax(0,1fr)" }}>
            {canScrollUp && <button className="mly-text-action" type="button" aria-label={t('uiBackToTopOfImageControls')} title={t('uiBackToTop')} onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })} style={infoFooterUpStyle(canScrollDown)}>{canScrollDown ? "↑" : t('uiBackToTop2')}</button>}
            {canScrollDown && <button className="mly-text-action" type="button" aria-label={t('uiScrollToMoreImageControls')} title={t('uiShowMoreControls')} onClick={() => { const panel = scrollContainerRef.current; if (panel) panel.scrollBy({ top: Math.max(60, panel.clientHeight * 0.8), behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }} style={infoFooterDownStyle}><span> {t('uiMoreControls')} </span><span className="mly-info-more-hint" aria-hidden="true">↓</span></button>}
          </div>
        </div>
); };
