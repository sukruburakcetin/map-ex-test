/** @jsx jsx */
import { React, jsx } from 'jimu-core';

const filterPanelCss = `
.mly-filter-panel { display:flex; align-items:center; gap:3px; width:100%; max-width:100%; min-width:0; height:38px; flex:0 0 38px; box-sizing:border-box; padding:2px 3px; margin-top:1px; border:1px solid #416756; border-radius:8px; background:linear-gradient(135deg,#142d26,#10231e); color:#e1f2e8; pointer-events:auto; z-index:10001; }
.mly-filter-scroll { flex:1 1 0; min-width:0; height:32px; overflow-x:auto; overflow-y:hidden; scrollbar-width:thin; scrollbar-color:#548b70 transparent; overscroll-behavior-x:contain; touch-action:pan-x pan-y; }
.mly-filter-scroll::-webkit-scrollbar { height:4px; }
.mly-filter-scroll::-webkit-scrollbar-thumb { background:#548b70; border-radius:4px; }
.mly-filter-scroll:focus-visible, .mly-filter-panel button:focus-visible, .mly-filter-panel input:focus-visible, .mly-filter-panel select:focus-visible { outline:2px solid #76dba5 !important; outline-offset:-2px; }
.mly-filter-row { display:flex; align-items:center; justify-content:center; gap:5px; width:max-content; min-width:100%; height:28px; box-sizing:border-box; }
.mly-filter-group { display:flex; align-items:center; gap:6px; flex:0 0 auto; height:28px; padding:0 4px; box-sizing:border-box; border:1px solid #416756; border-radius:6px; background:#1b392d; }
.mly-filter-group label { margin:0 !important; min-height:0; line-height:1; }
.mly-filter-group input[type="text"] { height:24px !important; min-height:24px !important; padding-top:0 !important; padding-bottom:0 !important; box-sizing:border-box; border-radius:5px !important; border-color:#456b58 !important; background:#122c22 !important; }
.mly-filter-group select { display:block; height:24px !important; min-height:24px !important; max-height:24px !important; box-sizing:border-box; margin:0; border:1px solid #507d64 !important; border-radius:5px; padding:0 4px !important; font-size:10px !important; line-height:normal; background:#173d2b !important; color:#edf7f0; color-scheme:dark; }
.mly-filter-group .mly-filter-travel select { width:88px; min-width:0; }
.mly-filter-size { height:24px; white-space:nowrap; }
.mly-filter-size select { width:52px; min-width:52px; }
.mly-filter-group--features > div:first-child { flex:0 0 180px !important; width:180px !important; min-width:0; }
.mly-filter-group--features [role="combobox"] { height:24px; min-height:24px; max-height:24px; padding:0 6px; border-color:#507d64; border-radius:5px; background:#173d2b; }
.mly-filter-group button { box-sizing:border-box; }
.mly-filter-dates { display:flex; align-items:center; gap:3px; }
.mly-filter-dates button { height:24px; min-height:24px; max-height:24px; padding:0 5px; border-color:#456b58; background:#173d2b; }
.mly-filter-pano button { height:24px; min-height:24px; padding:0 5px; }
.mly-filter-nav { display:flex; align-items:center; justify-content:center; flex:0 0 24px; width:24px; height:28px; min-width:0; min-height:0; padding:0; border:1px solid #527d66; border-radius:5px; background:#1e4935; color:#d6f5e3; font:18px/1 system-ui,sans-serif; cursor:pointer; }
.mly-filter-nav:disabled { opacity:.35; cursor:default; }
.mly-filter-nav:not(:disabled):hover { background:#2d6247; }
@media (hover:none) and (pointer:coarse) { .mly-filter-nav { display:none; } }
`;
let nextFilterScrollId = 0;

/** Own only the filter row's scrolling; never register map/viewer handlers. */
export const FilterScrollRegion: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const viewport = React.useRef<HTMLDivElement>(null);
  const row = React.useRef<HTMLDivElement>(null);
  const [id] = React.useState(() => `mly-filter-scroll-${++nextFilterScrollId}`);
  const [edges, setEdges] = React.useState({ overflow: false, left: false, right: false });
  React.useEffect(() => {
    const el = viewport.current, content = row.current;
    if (!el || !content) return;
    const win = el.ownerDocument.defaultView;
    const update = () => {
      const end = Math.max(0, el.scrollWidth - el.clientWidth);
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
    el.addEventListener('scroll', update, { passive: true });
    el.addEventListener('wheel', wheel, { passive: false });
    const observer = win?.ResizeObserver ? new win.ResizeObserver(update) : null;
    observer?.observe(el); observer?.observe(content);
    win?.addEventListener('resize', update); update();
    return () => {
      el.removeEventListener('scroll', update); el.removeEventListener('wheel', wheel);
      observer?.disconnect(); win?.removeEventListener('resize', update);
    };
  }, []);
  const move = (direction: number) => {
    const el = viewport.current;
    if (el) el.scrollBy({ left: direction * Math.max(120, el.clientWidth * .75), behavior: 'smooth' });
  };
  return <div className="mly-filter-panel">
    <style>{filterPanelCss}</style>
    {edges.overflow && <button type="button" className="mly-filter-nav" aria-label="Scroll filters left" aria-controls={id} disabled={!edges.left} onClick={() => move(-1)}>‹</button>}
    <div ref={viewport} id={id} className="mly-filter-scroll" role="region" aria-label="Mapillary filters" tabIndex={0} onKeyDown={event => {
      if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) return;
      const el = event.currentTarget;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); }
      else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); el.scrollTo({ left: event.key === 'Home' ? 0 : el.scrollWidth, behavior: 'smooth' }); }
    }}><div ref={row} className="mly-filter-row">{children}</div></div>
    {edges.overflow && <button type="button" className="mly-filter-nav" aria-label="Scroll filters right" aria-controls={id} disabled={!edges.right} onClick={() => move(1)}>›</button>}
  </div>;
};
