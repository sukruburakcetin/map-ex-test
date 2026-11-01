#!/usr/bin/env node
'use strict';
/**
 * Compact filter bar v6.92. Compatible current v6 sources.
 * --dry-run checks all targets; --uninstall restores exact previous bytes.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const uninstall = args.includes('--uninstall');
const payload = {
  "entries": [
    {
      "file": "src/components/FilterScrollRegion.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "compact filter spacing",
              "before": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\n\nconst filterPanelCss = `\n.mly-filter-panel { display:flex; align-items:center; gap:3px; width:100%; max-width:100%; min-width:0; height:42px; flex:0 0 42px; box-sizing:border-box; padding:2px 3px; background:linear-gradient(135deg,#142d26,#10231e); color:#e1f2e8; pointer-events:auto; z-index:10001; }\n.mly-filter-scroll-wrap { position:relative; flex:1 1 0; min-width:0; height:36px; }\n.mly-filter-panel .mly-filter-scroll { width:100%; min-width:0; height:28px; overflow-x:auto; overflow-y:hidden; scrollbar-width:none !important; -ms-overflow-style:none; overscroll-behavior-x:contain; touch-action:pan-x pan-y; }\n.mly-filter-panel .mly-filter-scroll::-webkit-scrollbar { display:none !important; width:0 !important; height:0 !important; }\n.mly-filter-panel .mly-filter-scroll::-webkit-scrollbar-button { display:none !important; width:0 !important; height:0 !important; }\n.mly-filter-progress { position:absolute; left:0; right:0; bottom:0; height:8px; cursor:pointer; touch-action:none; border-radius:2px; outline-offset:0; }\n.mly-filter-progress::before { content:\"\"; position:absolute; left:0; right:0; top:3px; height:2px; background:rgba(106,167,133,.18); border-radius:1px; }\n.mly-filter-progress > span { display:block; position:absolute; top:3px; height:2px; border-radius:1px; background:#548b70; cursor:grab; }\n.mly-filter-progress:active > span { cursor:grabbing; }\n.mly-filter-progress:focus-visible { outline:1px solid #76dba5; }\n\n.mly-filter-scroll:focus-visible, .mly-filter-panel button:focus-visible, .mly-filter-panel input:focus-visible, .mly-filter-panel select:focus-visible { outline:2px solid #76dba5 !important; outline-offset:-2px; }\n.mly-filter-row { display:flex; align-items:center; justify-content:center; gap:5px; width:max-content; min-width:100%; height:28px; box-sizing:border-box; }\n.mly-filter-group { display:flex; align-items:center; gap:6px; flex:0 0 auto; height:28px; padding:0 4px; box-sizing:border-box; border:1px solid #416756; border-radius:6px; background:#1b392d; }\n.mly-filter-group label { margin:0 !important; min-height:0; line-height:1; }\n.mly-filter-group input[type=\"text\"] { height:24px !important; min-height:24px !important; padding-top:0 !important; padding-bottom:0 !important; box-sizing:border-box; border-radius:5px !important; border-color:#456b58 !important; background:#122c22 !important; }\n.mly-filter-group select { display:block; height:24px !important; min-height:24px !important; max-height:24px !important; box-sizing:border-box; margin:0; border:1px solid #507d64 !important; border-radius:5px; padding:0 4px !important; font-size:10px !important; line-height:normal; background:#173d2b !important; color:#edf7f0; color-scheme:dark; }\n.mly-filter-group .mly-filter-travel select { width:88px; min-width:0; }\n.mly-filter-size { height:24px; white-space:nowrap; }\n.mly-filter-size select { width:64px; min-width:64px; flex:0 0 64px; }\n.mly-filter-group--features > div:first-child { flex:0 0 180px !important; width:180px !important; min-width:0; }\n.mly-filter-group--features [role=\"combobox\"] { height:24px; min-height:24px; max-height:24px; padding:0 6px; border-color:#507d64; border-radius:5px; background:#173d2b; }\n.mly-filter-group button { box-sizing:border-box; }\n.mly-filter-dates { display:flex; align-items:center; gap:3px; }\n.mly-filter-dates button { height:24px; min-height:24px; max-height:24px; padding:0 5px; border-color:#456b58; background:#173d2b; }\n.mly-filter-pano button { height:24px; min-height:24px; padding:0 5px; }\n.mly-filter-nav { display:flex; align-items:center; justify-content:center; flex:0 0 24px; width:24px; height:28px; min-width:0; min-height:0; padding:0; border:1px solid #527d66; border-radius:5px; background:#1e4935; color:#d6f5e3; font:18px/1 system-ui,sans-serif; cursor:pointer; }\n.mly-filter-nav:disabled { opacity:.35; cursor:default; }\n.mly-filter-nav:not(:disabled):hover { background:#2d6247; }\n@media (hover:none) and (pointer:coarse) { .mly-filter-nav { display:none; } }\n`;\nlet nextFilterScrollId = 0;\n\n/** Own only the filter row's scrolling; never register map/viewer handlers. */\nexport const FilterScrollRegion: React.FC<{ children: React.ReactNode }> = ({ children }) => {\n  const viewport = React.useRef<HTMLDivElement>(null);\n  const row = React.useRef<HTMLDivElement>(null);\n  const progressThumb = React.useRef<HTMLSpanElement>(null);\n  const progressTrack = React.useRef<HTMLDivElement>(null);\n  const [id] = React.useState(() => `mly-filter-scroll-${++nextFilterScrollId}`);\n  const [edges, setEdges] = React.useState({ overflow: false, left: false, right: false });\n  React.useEffect(() => {\n    const el = viewport.current, content = row.current;\n    if (!el || !content) return;\n    const win = el.ownerDocument.defaultView;\n    const update = () => {\n      const end = Math.max(0, el.scrollWidth - el.clientWidth);\n      // Keep the two-pixel visual thumb and ARIA values synchronized without rerendering filters.\n      const trackWidth = progressTrack.current?.clientWidth || el.clientWidth;\n      const thumbWidth = Math.min(trackWidth, Math.max(16, trackWidth * el.clientWidth / Math.max(1, el.scrollWidth)));\n      if (progressThumb.current) {\n        progressThumb.current.style.width = `${thumbWidth}px`;\n        progressThumb.current.style.left = `${end ? Math.max(0, Math.min(end, el.scrollLeft)) / end * (trackWidth - thumbWidth) : 0}px`;\n      }\n      progressTrack.current?.setAttribute('aria-valuemax', String(Math.round(end)));\n      progressTrack.current?.setAttribute('aria-valuenow', String(Math.round(el.scrollLeft)));\n      const next = { overflow: end > 1, left: el.scrollLeft > 1, right: el.scrollLeft < end - 1 };\n      setEdges(old => old.overflow === next.overflow && old.left === next.left && old.right === next.right ? old : next);\n    };\n    const wheel = (event: WheelEvent) => {\n      if (event.defaultPrevented || event.ctrlKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;\n      const target = event.target as Element | null;\n      // Let native selects retain their wheel/keyboard behavior.\n      if (target?.closest?.('select, option, [contenteditable=\"true\"]')) return;\n      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? el.clientWidth : 1);\n      const end = Math.max(0, el.scrollWidth - el.clientWidth);\n      const next = Math.max(0, Math.min(end, el.scrollLeft + delta));\n      if (Math.abs(next - el.scrollLeft) < .5) return;\n      event.preventDefault(); event.stopPropagation(); el.scrollLeft = next;\n    };\n    // Pointer capture keeps thumb dragging active outside the thin visual track.\n    // The 8px hit area sits below controls; only the painted bar remains 2px tall.\n    const track = progressTrack.current;\n    let drag: { id: number; x: number; scroll: number; ratio: number } | null = null;\n    const down = (event: PointerEvent) => {\n      if (!track || drag || event.isPrimary === false || (event.pointerType === 'mouse' && event.button !== 0)) return;\n      const end = Math.max(0, el.scrollWidth - el.clientWidth);\n      const bounds = track.getBoundingClientRect();\n      const thumb = progressThumb.current;\n      const thumbWidth = thumb?.getBoundingClientRect().width || 0;\n      const travel = bounds.width - thumbWidth;\n      if (end <= 0 || travel <= 0) return;\n      event.preventDefault(); event.stopPropagation();\n      if (event.target !== thumb) el.scrollLeft = Math.max(0, Math.min(end, (event.clientX - bounds.left - thumbWidth / 2) / travel * end));\n      drag = { id: event.pointerId, x: event.clientX, scroll: el.scrollLeft, ratio: end / travel };\n      try { track.setPointerCapture(event.pointerId); } catch { /* Detached hosts cannot capture. */ }\n      update();\n    };\n    const pointerMove = (event: PointerEvent) => {\n      if (!drag || drag.id !== event.pointerId) return;\n      event.preventDefault(); event.stopPropagation();\n      el.scrollLeft = drag.scroll + (event.clientX - drag.x) * drag.ratio;\n      update();\n    };\n    const endDrag = (event: PointerEvent) => {\n      if (!drag || drag.id !== event.pointerId) return;\n      drag = null; event.stopPropagation();\n      try { if (track?.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId); } catch { /* Host teardown. */ }\n    };\n    const trackKey = (event: KeyboardEvent) => {\n      if (event.altKey || event.ctrlKey || event.metaKey) return;\n      const amount = event.key === 'ArrowLeft' ? -40 : event.key === 'ArrowRight' ? 40\n        : event.key === 'PageUp' ? -el.clientWidth : event.key === 'PageDown' ? el.clientWidth : null;\n      if (amount === null && event.key !== 'Home' && event.key !== 'End') return;\n      event.preventDefault(); event.stopPropagation();\n      el.scrollLeft = event.key === 'Home' ? 0 : event.key === 'End' ? el.scrollWidth : el.scrollLeft + (amount || 0);\n      update();\n    };\n    track?.addEventListener('pointerdown', down);\n    track?.addEventListener('pointermove', pointerMove);\n    track?.addEventListener('pointerup', endDrag);\n    track?.addEventListener('pointercancel', endDrag);\n    track?.addEventListener('lostpointercapture', endDrag);\n    track?.addEventListener('keydown', trackKey);\n    track?.addEventListener('wheel', wheel, { passive: false });\n    el.addEventListener('scroll', update, { passive: true });\n    el.addEventListener('wheel', wheel, { passive: false });\n    const observer = win?.ResizeObserver ? new win.ResizeObserver(update) : null;\n    observer?.observe(el); observer?.observe(content);\n    win?.addEventListener('resize', update); update();\n    return () => {\n      if (drag) { try { if (track?.hasPointerCapture(drag.id)) track.releasePointerCapture(drag.id); } catch { /* Detached track. */ } drag = null; }\n      track?.removeEventListener('pointerdown', down); track?.removeEventListener('pointermove', pointerMove);\n      track?.removeEventListener('pointerup', endDrag); track?.removeEventListener('pointercancel', endDrag);\n      track?.removeEventListener('lostpointercapture', endDrag); track?.removeEventListener('keydown', trackKey);\n      track?.removeEventListener('wheel', wheel);\n      el.removeEventListener('scroll', update); el.removeEventListener('wheel', wheel);\n      observer?.disconnect(); win?.removeEventListener('resize', update);\n    };\n  }, []);\n  const move = (direction: number) => {\n    const el = viewport.current;\n    if (el) el.scrollBy({ left: direction * Math.max(120, el.clientWidth * .75), behavior: 'smooth' });\n  };\n  return <div className=\"mly-filter-panel\">\n    <style>{filterPanelCss}</style>\n    {edges.overflow && <button type=\"button\" className=\"mly-filter-nav\" aria-label=\"Scroll filters left\" aria-controls={id} disabled={!edges.left} onClick={() => move(-1)}>\u2039</button>}\n    <div className=\"mly-filter-scroll-wrap\">\n    <div ref={viewport} id={id} className=\"mly-filter-scroll\" role=\"region\" aria-label=\"Mapillary filters\" tabIndex={0} onKeyDown={event => {\n      if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) return;\n      const el = event.currentTarget;\n      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); }\n      else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); el.scrollTo({ left: event.key === 'Home' ? 0 : el.scrollWidth, behavior: 'smooth' }); }\n    }}><div ref={row} className=\"mly-filter-row\">{children}</div></div>\n    <div ref={progressTrack} className=\"mly-filter-progress\" role=\"scrollbar\" aria-label=\"Scroll filters horizontally\" aria-orientation=\"horizontal\" aria-controls={id} aria-valuemin={0} tabIndex={0} style={{ display: edges.overflow ? 'block' : 'none' }}><span ref={progressThumb} /></div>\n    </div>\n    {edges.overflow && <button type=\"button\" className=\"mly-filter-nav\" aria-label=\"Scroll filters right\" aria-controls={id} disabled={!edges.right} onClick={() => move(1)}>\u203a</button>}\n  </div>;\n};\n",
              "after": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\n\nconst filterPanelCss = `\n.mly-filter-panel { display:flex; align-items:center; gap:3px; width:100%; max-width:100%; min-width:0; height:30px; flex:0 0 30px; box-sizing:border-box; padding:1px 3px; background:linear-gradient(135deg,#142d26,#10231e); color:#e1f2e8; pointer-events:auto; z-index:10001; }\n.mly-filter-panel.has-overflow { height:36px; flex-basis:36px; }\n.mly-filter-scroll-wrap { position:relative; flex:1 1 0; min-width:0; height:28px; }\n.mly-filter-panel.has-overflow .mly-filter-scroll-wrap { height:34px; }\n.mly-filter-panel .mly-filter-scroll { width:100%; min-width:0; height:28px; overflow-x:auto; overflow-y:hidden; scrollbar-width:none !important; -ms-overflow-style:none; overscroll-behavior-x:contain; touch-action:pan-x pan-y; }\n.mly-filter-panel .mly-filter-scroll::-webkit-scrollbar { display:none !important; width:0 !important; height:0 !important; }\n.mly-filter-panel .mly-filter-scroll::-webkit-scrollbar-button { display:none !important; width:0 !important; height:0 !important; }\n.mly-filter-progress { position:absolute; left:0; right:0; bottom:0; height:6px; cursor:pointer; touch-action:none; border-radius:2px; outline-offset:0; }\n.mly-filter-progress::before { content:\"\"; position:absolute; left:0; right:0; top:2px; height:2px; background:rgba(106,167,133,.18); border-radius:1px; }\n.mly-filter-progress > span { display:block; position:absolute; top:2px; height:2px; border-radius:1px; background:#548b70; cursor:grab; }\n.mly-filter-progress:active > span { cursor:grabbing; }\n.mly-filter-progress:focus-visible { outline:1px solid #76dba5; }\n\n.mly-filter-scroll:focus-visible, .mly-filter-panel button:focus-visible, .mly-filter-panel input:focus-visible, .mly-filter-panel select:focus-visible { outline:2px solid #76dba5 !important; outline-offset:-2px; }\n.mly-filter-row { display:flex; align-items:center; justify-content:center; gap:5px; width:max-content; min-width:100%; height:28px; box-sizing:border-box; }\n.mly-filter-group { display:flex; align-items:center; gap:6px; flex:0 0 auto; height:28px; padding:0 4px; box-sizing:border-box; border:1px solid #416756; border-radius:6px; background:#1b392d; }\n.mly-filter-group label { margin:0 !important; min-height:0; line-height:1; }\n.mly-filter-group input[type=\"text\"] { height:24px !important; min-height:24px !important; padding-top:0 !important; padding-bottom:0 !important; box-sizing:border-box; border-radius:5px !important; border-color:#456b58 !important; background:#122c22 !important; }\n.mly-filter-group select { display:block; height:24px !important; min-height:24px !important; max-height:24px !important; box-sizing:border-box; margin:0; border:1px solid #507d64 !important; border-radius:5px; padding:0 4px !important; font-size:10px !important; line-height:normal; background:#173d2b !important; color:#edf7f0; color-scheme:dark; }\n.mly-filter-group .mly-filter-travel select { width:88px; min-width:0; }\n.mly-filter-size { height:24px; white-space:nowrap; }\n.mly-filter-size select { width:64px; min-width:64px; flex:0 0 64px; }\n.mly-filter-group--features > div:first-child { flex:0 0 180px !important; width:180px !important; min-width:0; }\n.mly-filter-group--features [role=\"combobox\"] { height:24px; min-height:24px; max-height:24px; padding:0 6px; border-color:#507d64; border-radius:5px; background:#173d2b; }\n.mly-filter-group button { box-sizing:border-box; }\n.mly-filter-dates { display:flex; align-items:center; gap:3px; }\n.mly-filter-dates button { height:24px; min-height:24px; max-height:24px; padding:0 5px; border-color:#456b58; background:#173d2b; }\n.mly-filter-pano button { height:24px; min-height:24px; padding:0 5px; }\n.mly-filter-nav { display:flex; align-items:center; justify-content:center; flex:0 0 24px; width:24px; height:28px; min-width:0; min-height:0; padding:0; border:1px solid #527d66; border-radius:5px; background:#1e4935; color:#d6f5e3; font:18px/1 system-ui,sans-serif; cursor:pointer; }\n.mly-filter-nav:disabled { opacity:.35; cursor:default; }\n.mly-filter-nav:not(:disabled):hover { background:#2d6247; }\n@media (hover:none) and (pointer:coarse) { .mly-filter-nav { display:none; } }\n`;\nlet nextFilterScrollId = 0;\n\n/** Own only the filter row's scrolling; never register map/viewer handlers. */\nexport const FilterScrollRegion: React.FC<{ children: React.ReactNode }> = ({ children }) => {\n  const viewport = React.useRef<HTMLDivElement>(null);\n  const row = React.useRef<HTMLDivElement>(null);\n  const progressThumb = React.useRef<HTMLSpanElement>(null);\n  const progressTrack = React.useRef<HTMLDivElement>(null);\n  const [id] = React.useState(() => `mly-filter-scroll-${++nextFilterScrollId}`);\n  const [edges, setEdges] = React.useState({ overflow: false, left: false, right: false });\n  React.useEffect(() => {\n    const el = viewport.current, content = row.current;\n    if (!el || !content) return;\n    const win = el.ownerDocument.defaultView;\n    const update = () => {\n      const end = Math.max(0, el.scrollWidth - el.clientWidth);\n      // Keep the two-pixel visual thumb and ARIA values synchronized without rerendering filters.\n      const trackWidth = progressTrack.current?.clientWidth || el.clientWidth;\n      const thumbWidth = Math.min(trackWidth, Math.max(16, trackWidth * el.clientWidth / Math.max(1, el.scrollWidth)));\n      if (progressThumb.current) {\n        progressThumb.current.style.width = `${thumbWidth}px`;\n        progressThumb.current.style.left = `${end ? Math.max(0, Math.min(end, el.scrollLeft)) / end * (trackWidth - thumbWidth) : 0}px`;\n      }\n      progressTrack.current?.setAttribute('aria-valuemax', String(Math.round(end)));\n      progressTrack.current?.setAttribute('aria-valuenow', String(Math.round(el.scrollLeft)));\n      const next = { overflow: end > 1, left: el.scrollLeft > 1, right: el.scrollLeft < end - 1 };\n      setEdges(old => old.overflow === next.overflow && old.left === next.left && old.right === next.right ? old : next);\n    };\n    const wheel = (event: WheelEvent) => {\n      if (event.defaultPrevented || event.ctrlKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;\n      const target = event.target as Element | null;\n      // Let native selects retain their wheel/keyboard behavior.\n      if (target?.closest?.('select, option, [contenteditable=\"true\"]')) return;\n      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? el.clientWidth : 1);\n      const end = Math.max(0, el.scrollWidth - el.clientWidth);\n      const next = Math.max(0, Math.min(end, el.scrollLeft + delta));\n      if (Math.abs(next - el.scrollLeft) < .5) return;\n      event.preventDefault(); event.stopPropagation(); el.scrollLeft = next;\n    };\n    // Pointer capture keeps thumb dragging active outside the thin visual track.\n    // The 6px hit area sits below controls; only the painted bar remains 2px tall.\n    const track = progressTrack.current;\n    let drag: { id: number; x: number; scroll: number; ratio: number } | null = null;\n    const down = (event: PointerEvent) => {\n      if (!track || drag || event.isPrimary === false || (event.pointerType === 'mouse' && event.button !== 0)) return;\n      const end = Math.max(0, el.scrollWidth - el.clientWidth);\n      const bounds = track.getBoundingClientRect();\n      const thumb = progressThumb.current;\n      const thumbWidth = thumb?.getBoundingClientRect().width || 0;\n      const travel = bounds.width - thumbWidth;\n      if (end <= 0 || travel <= 0) return;\n      event.preventDefault(); event.stopPropagation();\n      if (event.target !== thumb) el.scrollLeft = Math.max(0, Math.min(end, (event.clientX - bounds.left - thumbWidth / 2) / travel * end));\n      drag = { id: event.pointerId, x: event.clientX, scroll: el.scrollLeft, ratio: end / travel };\n      try { track.setPointerCapture(event.pointerId); } catch { /* Detached hosts cannot capture. */ }\n      update();\n    };\n    const pointerMove = (event: PointerEvent) => {\n      if (!drag || drag.id !== event.pointerId) return;\n      event.preventDefault(); event.stopPropagation();\n      el.scrollLeft = drag.scroll + (event.clientX - drag.x) * drag.ratio;\n      update();\n    };\n    const endDrag = (event: PointerEvent) => {\n      if (!drag || drag.id !== event.pointerId) return;\n      drag = null; event.stopPropagation();\n      try { if (track?.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId); } catch { /* Host teardown. */ }\n    };\n    const trackKey = (event: KeyboardEvent) => {\n      if (event.altKey || event.ctrlKey || event.metaKey) return;\n      const amount = event.key === 'ArrowLeft' ? -40 : event.key === 'ArrowRight' ? 40\n        : event.key === 'PageUp' ? -el.clientWidth : event.key === 'PageDown' ? el.clientWidth : null;\n      if (amount === null && event.key !== 'Home' && event.key !== 'End') return;\n      event.preventDefault(); event.stopPropagation();\n      el.scrollLeft = event.key === 'Home' ? 0 : event.key === 'End' ? el.scrollWidth : el.scrollLeft + (amount || 0);\n      update();\n    };\n    track?.addEventListener('pointerdown', down);\n    track?.addEventListener('pointermove', pointerMove);\n    track?.addEventListener('pointerup', endDrag);\n    track?.addEventListener('pointercancel', endDrag);\n    track?.addEventListener('lostpointercapture', endDrag);\n    track?.addEventListener('keydown', trackKey);\n    track?.addEventListener('wheel', wheel, { passive: false });\n    el.addEventListener('scroll', update, { passive: true });\n    el.addEventListener('wheel', wheel, { passive: false });\n    const observer = win?.ResizeObserver ? new win.ResizeObserver(update) : null;\n    observer?.observe(el); observer?.observe(content);\n    win?.addEventListener('resize', update); update();\n    return () => {\n      if (drag) { try { if (track?.hasPointerCapture(drag.id)) track.releasePointerCapture(drag.id); } catch { /* Detached track. */ } drag = null; }\n      track?.removeEventListener('pointerdown', down); track?.removeEventListener('pointermove', pointerMove);\n      track?.removeEventListener('pointerup', endDrag); track?.removeEventListener('pointercancel', endDrag);\n      track?.removeEventListener('lostpointercapture', endDrag); track?.removeEventListener('keydown', trackKey);\n      track?.removeEventListener('wheel', wheel);\n      el.removeEventListener('scroll', update); el.removeEventListener('wheel', wheel);\n      observer?.disconnect(); win?.removeEventListener('resize', update);\n    };\n  }, []);\n  const move = (direction: number) => {\n    const el = viewport.current;\n    if (el) el.scrollBy({ left: direction * Math.max(120, el.clientWidth * .75), behavior: 'smooth' });\n  };\n  return <div className={`mly-filter-panel${edges.overflow ? ' has-overflow' : ''}`}>\n    <style>{filterPanelCss}</style>\n    {edges.overflow && <button type=\"button\" className=\"mly-filter-nav\" aria-label=\"Scroll filters left\" aria-controls={id} disabled={!edges.left} onClick={() => move(-1)}>\u2039</button>}\n    <div className=\"mly-filter-scroll-wrap\">\n    <div ref={viewport} id={id} className=\"mly-filter-scroll\" role=\"region\" aria-label=\"Mapillary filters\" tabIndex={0} onKeyDown={event => {\n      if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) return;\n      const el = event.currentTarget;\n      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); }\n      else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); el.scrollTo({ left: event.key === 'Home' ? 0 : el.scrollWidth, behavior: 'smooth' }); }\n    }}><div ref={row} className=\"mly-filter-row\">{children}</div></div>\n    <div ref={progressTrack} className=\"mly-filter-progress\" role=\"scrollbar\" aria-label=\"Scroll filters horizontally\" aria-orientation=\"horizontal\" aria-controls={id} aria-valuemin={0} tabIndex={0} style={{ display: edges.overflow ? 'block' : 'none' }}><span ref={progressThumb} /></div>\n    </div>\n    {edges.overflow && <button type=\"button\" className=\"mly-filter-nav\" aria-label=\"Scroll filters right\" aria-controls={id} disabled={!edges.right} onClick={() => move(1)}>\u203a</button>}\n  </div>;\n};\n",
              "wholeFile": true
            }
          ]
        }
      ]
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'compact-filter-bar-v6-92-';

function conflict(label) {
  throw new Error('Conflict in ' + label + '. No source files changed. Preserve local edits.');
}

/** Resolve a payload path and reject symbolic links, including parent folders. */
function targetFor(relative) {
  if (typeof relative !== 'string' || !relative || relative.includes('\\') || relative.includes(':') || relative.includes('\0')) throw new Error('Invalid patch path.');
  const parts = relative.split('/');
  if (parts.some(part => !part || part === '.' || part === '..')) throw new Error('Invalid patch path.');
  const target = path.resolve(root, ...parts);
  const relation = path.relative(root, target);
  if (!relation || relation.startsWith('..' + path.sep) || path.isAbsolute(relation)) throw new Error('Patch path escapes the widget folder.');
  let parent = root;
  for (let index = 0; index < parts.length; index++) {
    parent = path.join(parent, parts[index]);
    let stat;
    try { stat = fs.lstatSync(parent); } catch (error) { if (error.code === 'ENOENT') break; throw error; }
    if (stat.isSymbolicLink()) throw new Error('Symbolic links are not supported: ' + relative + '. No source files changed.');
    if (index < parts.length - 1 && !stat.isDirectory()) throw new Error('Parent path is not a folder: ' + relative);
    if (index === parts.length - 1 && !stat.isFile() && !stat.isDirectory()) throw new Error('Unsupported target type: ' + relative);
  }
  return target;
}

function readTarget(relative, required = false) {
  const file = targetFor(relative);
  let descriptor;
  try {
    descriptor = fs.openSync(file, fs.constants.O_RDONLY | noFollow);
    const stat = fs.fstatSync(descriptor);
    if (!stat.isFile()) throw new Error('Target is not a regular file: ' + relative);
    const bytes = fs.readFileSync(descriptor);
    return { file, bytes, mode: stat.mode, dev: stat.dev, ino: stat.ino };
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    if (required) throw new Error('Required file missing: ' + relative + '. No source files changed.');
    return { file, bytes: null };
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
}

function formatLike(text, original) {
  const raw = original.toString('utf8');
  const bom = raw.startsWith('\uFEFF') ? '\uFEFF' : '';
  return Buffer.from(bom + (raw.includes('\r\n') ? text.replace(/\n/g, '\r\n') : text));
}

/** Apply or reverse one exact insertion, preserving all text outside its anchors. */
function transformBlock(text, block, reverse) {
  const before = normalize(block.before), after = normalize(block.after);
  if (!before || !after || before === after) throw new Error('Invalid block: ' + block.label);
  const expected = reverse ? after : before;
  const replacement = reverse ? before : after;
  if (block.wholeFile) {
    if (text === replacement) return text;
    if (text !== expected) conflict(block.label);
    return replacement;
  }
  // Prefer the longest state when an insertion contains its original anchor.
  if (reverse) {
    const installedCount = count(text, after);
    if (installedCount === 1) return text.replace(after, () => before);
    if (installedCount > 1) conflict(block.label);
    if (count(text, before) === 1) {
      if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (partially edited patch)');
      return text;
    }
    conflict(block.label);
  }
  const installedCount = count(text, after);
  if (installedCount === 1) return text;
  if (installedCount > 1) conflict(block.label);
  if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (existing declaration)');
  if (count(text, before) !== 1) conflict(block.label);
  return text.replace(before, () => after);
}

function ensureParents(relative) {
  const segments = relative.split('/');
  segments.pop();
  let current = '';
  for (const segment of segments) {
    current = current ? current + '/' + segment : segment;
    const directory = targetFor(current);
    try { fs.mkdirSync(directory); } catch (error) { if (error.code !== 'EEXIST') throw error; }
    const stat = fs.lstatSync(directory);
    if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Unsafe parent directory: ' + current);
  }
}

function assertUnchanged(item) {
  const latest = readTarget(item.relative);
  if (item.original === null ? latest.bytes !== null : latest.bytes === null || !latest.bytes.equals(item.original)) {
    throw new Error('File changed during validation: ' + item.relative + '. No source files changed.');
  }
}

function writeExact(descriptor, bytes) {
  let offset = 0;
  while (offset < bytes.length) {
    const written = fs.writeSync(descriptor, bytes, offset, bytes.length - offset, offset);
    if (!written) throw new Error('File write made no progress.');
    offset += written;
  }
}

/** Existing files are opened without truncation, then checked through that handle. */
function overwriteOriginal(item, bytes) {
  targetFor(item.relative);
  const descriptor = fs.openSync(item.file, fs.constants.O_RDWR | noFollow);
  try {
    const stat = fs.fstatSync(descriptor);
    const linked = fs.lstatSync(item.file);
    if (!stat.isFile() || linked.isSymbolicLink() || stat.dev !== linked.dev || stat.ino !== linked.ino || !fs.readFileSync(descriptor).equals(item.original)) throw new Error('File changed before write: ' + item.relative);
    item.started = true;
    fs.ftruncateSync(descriptor, 0);
    writeExact(descriptor, bytes);
    fs.fsyncSync(descriptor);
  } finally { fs.closeSync(descriptor); }
}

function rollback(items) {
  const errors = [];
  for (const item of [...items].reverse()) {
    if (!item.started) continue;
    try {
      targetFor(item.relative);
      if (item.original === null) {
        // Remove only the exclusively-created file owned by this installer.
        const stat = fs.lstatSync(item.file);
        if (stat.dev !== item.createdDev || stat.ino !== item.createdIno) throw new Error('Created file replaced by another process.');
        fs.unlinkSync(item.file);
      } else if (item.content === null) {
        const descriptor = fs.openSync(item.file, 'wx', item.mode & 0o777);
        try { fs.writeFileSync(descriptor, item.original); } finally { fs.closeSync(descriptor); }
      } else {
        const descriptor = fs.openSync(item.file, fs.constants.O_WRONLY | noFollow);
        try { fs.ftruncateSync(descriptor, 0); writeExact(descriptor, item.original); } finally { fs.closeSync(descriptor); }
      }
    } catch (error) { errors.push(item.relative + ': ' + error.message); }
  }
  return errors;
}


function transformEntry(text, entry) {
  const results = new Set();
  for (const variant of entry.variants) {
    try {
      let next = text;
      for (const block of variant.blocks) next = transformBlock(next, block, false);
      results.add(next);
    } catch (error) {
      if (!error.message.startsWith('Conflict in ')) throw error;
    }
  }
  if (results.size !== 1) conflict(entry.file + (results.size ? ' (ambiguous baseline)' : ' (unsupported or edited source)'));
  return [...results][0];
}

function uninstallWrites() {
  const backupRoot = targetFor('.refactor-backups');
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.92 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'compact-filter-bar-v6-92' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.92 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.92 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.92 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-compact-filter-bar-v6-92.cjs [--dry-run] [--uninstall]');
  readTarget('src/runtime/widget.tsx', true);
  let writes;
  if (uninstall) writes = uninstallWrites();
  else {
    const seen = new Set(); writes = [];
    for (const entry of payload.entries) {
      if (seen.has(entry.file)) throw new Error('Duplicate patch path: ' + entry.file);
      seen.add(entry.file);
      const current = readTarget(entry.file, entry.content === undefined);
      if (entry.content !== undefined) {
        if (current.bytes === null) {
          writes.push({ ...current, relative: entry.file, original: null, content: Buffer.from(entry.content) });
        } else {
          const text = normalize(current.bytes.toString('utf8'));
          if (text !== normalize(entry.content)) {
            if (!entry.variants) conflict(entry.file + ' (existing helper/test differs)');
            const next = transformEntry(text, entry);
            if (next !== normalize(entry.content)) conflict(entry.file + ' (unexpected helper result)');
            writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(next, current.bytes) });
          }
        }
        continue;
      }
      const text = normalize(current.bytes.toString('utf8')), next = transformEntry(text, entry);
      if (next !== text) writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(next, current.bytes) });
    }
  }
  if (!writes.length) {
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Compact filter bar v6.92 is already installed. No files changed.');
    process.exit(0);
  }
  for (const item of writes) assertUnchanged(item);
  if (dry) {
    console.log('Dry run passed. Would ' + (uninstall ? 'restore' : 'update') + ':\n' + writes.map(item => '  ' + item.relative).join('\n'));
    process.exit(0);
  }
  const backupRelative = '.refactor-backups/' + prefix + (uninstall ? 'uninstall-' : '') + Date.now() + '-' + process.pid;
  ensureParents(backupRelative + '/changes.json');
  const backup = targetFor(backupRelative);
  for (const item of writes) {
    if (item.original === null) continue;
    const relative = backupRelative + '/' + item.relative;
    ensureParents(relative);
    const descriptor = fs.openSync(targetFor(relative), 'wx');
    try { fs.writeFileSync(descriptor, item.original); } finally { fs.closeSync(descriptor); }
  }
  const manifest = { installer: 'compact-filter-bar-v6-92', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
  const manifestPath = targetFor(backupRelative + '/changes.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
  for (const item of writes) assertUnchanged(item);
  try {
    for (const item of writes) {
      assertUnchanged(item);
      if (item.content === null) {
        targetFor(item.relative); fs.unlinkSync(item.file); item.started = true;
      } else if (item.original === null) {
        ensureParents(item.relative);
        const descriptor = fs.openSync(targetFor(item.relative), 'wx');
        const stat = fs.fstatSync(descriptor);
        item.createdDev = stat.dev; item.createdIno = stat.ino; item.started = true;
        try { fs.writeFileSync(descriptor, item.content); } finally { fs.closeSync(descriptor); }
      } else overwriteOriginal(item, item.content);
    }
    manifest.completed = true;
    // Write completion through the existing guarded regular file, not a followed link.
    const metadata = readTarget(backupRelative + '/changes.json', true);
    overwriteOriginal({ ...metadata, relative: backupRelative + '/changes.json', original: metadata.bytes }, Buffer.from(JSON.stringify(manifest, null, 2) + '\n'));
  } catch (error) {
    const errors = rollback(writes);
    if (errors.length) throw new Error(error.message + '\nRollback needs attention. Backup: ' + backupRelative + '\n' + errors.join('\n'));
    throw new Error(error.message + '\nInstaller writes rolled back. Original files restored. Backup: ' + backupRelative);
  }
  console.log('Compact filter bar v6.92 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
