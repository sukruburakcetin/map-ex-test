/** @jsx jsx */
import { useWidgetLocale } from '../i18n/WidgetLocale';
import { React, jsx } from 'jimu-core';
import { filterPanelCss } from '../styles/filterBar';

let nextFilterScrollId = 0;

/** Own only the filter row's scrolling; never register map/viewer handlers. */
export const FilterScrollRegion: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {t,locale} = useWidgetLocale();
  const viewport = React.useRef<HTMLDivElement>(null);
  const row = React.useRef<HTMLDivElement>(null);
  const progressThumb = React.useRef<HTMLSpanElement>(null);
  const progressTrack = React.useRef<HTMLDivElement>(null);
  const [id] = React.useState(() => `mly-filter-scroll-${++nextFilterScrollId}`);
  const [edges, setEdges] = React.useState({ overflow: false, left: false, right: false });
  React.useEffect(() => {
    const el = viewport.current, content = row.current;
    if (!el || !content) return;
    const win = el.ownerDocument.defaultView;
    const update = () => {
      const end = Math.max(0, el.scrollWidth - el.clientWidth);
      // Keep the two-pixel visual thumb and ARIA values synchronized without rerendering filters.
      const trackWidth = progressTrack.current?.clientWidth || el.clientWidth;
      const thumbWidth = Math.min(trackWidth, Math.max(16, trackWidth * el.clientWidth / Math.max(1, el.scrollWidth)));
      if (progressThumb.current) {
        progressThumb.current.style.width = `${thumbWidth}px`;
        progressThumb.current.style.left = `${end ? Math.max(0, Math.min(end, el.scrollLeft)) / end * (trackWidth - thumbWidth) : 0}px`;
      }
      progressTrack.current?.setAttribute('aria-valuemax', String(Math.round(end)));
      progressTrack.current?.setAttribute('aria-valuenow', String(Math.round(el.scrollLeft)));
      const next = { overflow: end > 1, left: el.scrollLeft > 1, right: el.scrollLeft < end - 1 };
      setEdges(old => old.overflow === next.overflow && old.left === next.left && old.right === next.right ? old : next);
    };
    const wheel = (event: WheelEvent) => {
      if (event.defaultPrevented || event.ctrlKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
      const target = event.target as Element | null;
      // Let native selects retain their wheel/keyboard behavior.
      if (target?.closest?.('select, option, [contenteditable="true"]')) return;
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? el.clientWidth : 1);
      const end = Math.max(0, el.scrollWidth - el.clientWidth);
      const next = Math.max(0, Math.min(end, el.scrollLeft + delta));
      if (Math.abs(next - el.scrollLeft) < .5) return;
      event.preventDefault(); event.stopPropagation(); el.scrollLeft = next;
    };
    // Pointer capture keeps thumb dragging active outside the thin visual track.
    // The 6px hit area sits below controls; only the painted bar remains 2px tall.
    const track = progressTrack.current;
    let drag: { id: number; x: number; scroll: number; ratio: number } | null = null;
    const down = (event: PointerEvent) => {
      if (!track || drag || event.isPrimary === false || (event.pointerType === 'mouse' && event.button !== 0)) return;
      const end = Math.max(0, el.scrollWidth - el.clientWidth);
      const bounds = track.getBoundingClientRect();
      const thumb = progressThumb.current;
      const thumbWidth = thumb?.getBoundingClientRect().width || 0;
      const travel = bounds.width - thumbWidth;
      if (end <= 0 || travel <= 0) return;
      event.preventDefault(); event.stopPropagation();
      if (event.target !== thumb) el.scrollLeft = Math.max(0, Math.min(end, (event.clientX - bounds.left - thumbWidth / 2) / travel * end));
      drag = { id: event.pointerId, x: event.clientX, scroll: el.scrollLeft, ratio: end / travel };
      try { track.setPointerCapture(event.pointerId); } catch { /* Detached hosts cannot capture. */ }
      update();
    };
    const pointerMove = (event: PointerEvent) => {
      if (!drag || drag.id !== event.pointerId) return;
      event.preventDefault(); event.stopPropagation();
      el.scrollLeft = drag.scroll + (event.clientX - drag.x) * drag.ratio;
      update();
    };
    const endDrag = (event: PointerEvent) => {
      if (!drag || drag.id !== event.pointerId) return;
      drag = null; event.stopPropagation();
      try { if (track?.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId); } catch { /* Host teardown. */ }
    };
    const trackKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const amount = event.key === 'ArrowLeft' ? -40 : event.key === 'ArrowRight' ? 40
        : event.key === 'PageUp' ? -el.clientWidth : event.key === 'PageDown' ? el.clientWidth : null;
      if (amount === null && event.key !== 'Home' && event.key !== 'End') return;
      event.preventDefault(); event.stopPropagation();
      el.scrollLeft = event.key === 'Home' ? 0 : event.key === 'End' ? el.scrollWidth : el.scrollLeft + (amount || 0);
      update();
    };
    track?.addEventListener('pointerdown', down);
    track?.addEventListener('pointermove', pointerMove);
    track?.addEventListener('pointerup', endDrag);
    track?.addEventListener('pointercancel', endDrag);
    track?.addEventListener('lostpointercapture', endDrag);
    track?.addEventListener('keydown', trackKey);
    track?.addEventListener('wheel', wheel, { passive: false });
    el.addEventListener('scroll', update, { passive: true });
    el.addEventListener('wheel', wheel, { passive: false });
    const observer = win?.ResizeObserver ? new win.ResizeObserver(update) : null;
    observer?.observe(el); observer?.observe(content);
    win?.addEventListener('resize', update); update();
    return () => {
      if (drag) { try { if (track?.hasPointerCapture(drag.id)) track.releasePointerCapture(drag.id); } catch { /* Detached track. */ } drag = null; }
      track?.removeEventListener('pointerdown', down); track?.removeEventListener('pointermove', pointerMove);
      track?.removeEventListener('pointerup', endDrag); track?.removeEventListener('pointercancel', endDrag);
      track?.removeEventListener('lostpointercapture', endDrag); track?.removeEventListener('keydown', trackKey);
      track?.removeEventListener('wheel', wheel);
      el.removeEventListener('scroll', update); el.removeEventListener('wheel', wheel);
      observer?.disconnect(); win?.removeEventListener('resize', update);
    };
  }, []);
  const move = (direction: number) => {
    const el = viewport.current;
    if (el) el.scrollBy({ left: direction * Math.max(120, el.clientWidth * .75), behavior: 'smooth' });
  };
  return <div dir="ltr" lang={locale} className={`mly-filter-panel${edges.overflow ? ' has-overflow' : ''}`}>
    <style>{filterPanelCss}</style>
    {edges.overflow && <button type="button" className="mly-filter-nav" aria-label={t('scrollLeft')} aria-controls={id} disabled={!edges.left} onClick={() => move(-1)}>‹</button>}
    <div className="mly-filter-scroll-wrap">
    <div ref={viewport} id={id} className="mly-filter-scroll" role="region" aria-label={t('filters')} tabIndex={0} onKeyDown={event => {
      if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) return;
      const el = event.currentTarget;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); }
      else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); el.scrollTo({ left: event.key === 'Home' ? 0 : el.scrollWidth, behavior: 'smooth' }); }
    }}><div ref={row} className="mly-filter-row">{children}</div></div>
    <div ref={progressTrack} className="mly-filter-progress" role="scrollbar" aria-label={t('scrollFilters')} aria-orientation="horizontal" aria-controls={id} aria-valuemin={0} tabIndex={0} style={{ display: edges.overflow ? 'block' : 'none' }}><span ref={progressThumb} /></div>
    </div>
    {edges.overflow && <button type="button" className="mly-filter-nav" aria-label={t('scrollRight')} aria-controls={id} disabled={!edges.right} onClick={() => move(1)}>›</button>}
  </div>;
};
