/** @jsx jsx */
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
export const ScrollDiscoveryFooter: React.FC<ScrollDiscoveryFooterProps> = ({ canScrollDown, canScrollUp, isOverflowing, scrollContainerRef }) => (
<div className="mly-info-footer" style={infoFooterPanelStyle(isOverflowing, canScrollDown)}>
          <style>{infoFooterHintCss}</style>
          <div style={{ ...infoFooterRowStyle, gridTemplateColumns: canScrollUp && canScrollDown ? "20px minmax(0,1fr)" : "minmax(0,1fr)" }}>
            {canScrollUp && <button type="button" aria-label="Back to top of image controls" title="Back to top" onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })} style={infoFooterUpStyle(canScrollDown)}>{canScrollDown ? "↑" : "Back to top ↑"}</button>}
            {canScrollDown && <button type="button" aria-label="Scroll to more image controls" title="Show more controls" onClick={() => { const panel = scrollContainerRef.current; if (panel) panel.scrollBy({ top: Math.max(60, panel.clientHeight * 0.8), behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }} style={infoFooterDownStyle}><span>More controls</span><span className="mly-info-more-hint" aria-hidden="true">↓</span></button>}
          </div>
        </div>
);
