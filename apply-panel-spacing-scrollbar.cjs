#!/usr/bin/env node
'use strict';
/** Panel spacing and scrollbar installer. Plain source payload.
 * Validates all targets before writes. Preserves existing source bytes in local
 * backups, rejects links/conflicts, and rolls back its writes on failure.
 * --skip-tests is accepted for compatibility. Regression files are included; no tests run here.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const skipTests = args.includes('--skip-tests') || args.includes('--skip-test');
const uninstall = args.includes('--uninstall');
const payload = {
  "entries": [
    {
      "file": "src/styles/infoBox.ts",
      "blocks": [
        {
          "label": "src/styles/infoBox.ts panel refinement 1",
          "before": "    .mly-info-panel.is-wide .mly-route-controls select { min-width: 0; max-width: 100%; }\n  }\n}\n@media (max-width: 600px), (pointer: coarse), (hover: none) {\n  .mly-info-width-toggle { display: none; }\n  .mly-info-panel.is-wide { width: 96px; }\n}\n@container (max-width: 480px) {\n  .mly-info-width-toggle { display: none; }\n  .mly-info-panel.is-wide { width: 96px; }\n}\n@media (max-width: 480px) {\n  .mly-info-panel { max-height: min(58%, calc(100% - 12px)) !important; }\n  .mly-info-panel .info-box button { min-height: 24px; }\n",
          "after": "    .mly-info-panel.is-wide .mly-route-controls select { min-width: 0; max-width: 100%; }\n  }\n}\n@media (max-width: 480px) {\n  .mly-info-panel { max-height: min(58%, calc(100% - 12px)) !important; }\n  .mly-info-panel .info-box button { min-height: 24px; }\n"
        },
        {
          "label": "src/styles/infoBox.ts panel refinement 2",
          "before": ".mly-info-panel .mly-info-more button > span { white-space: normal !important; overflow-wrap: anywhere; }\n.mly-info-panel .mly-cloud-export > :is(button,select) { width: 100% !important; }\n.mly-info-panel .mly-info-footer button { min-width: 0; box-sizing: border-box; text-align: center; }\n@container mly-info (max-width: 115px) {\n .mly-info-more button > span { display: block !important; }\n .mly-info-more button > span > svg { vertical-align: middle; }\n}\n`;\n",
          "after": ".mly-info-panel .mly-info-more button > span { white-space: normal !important; overflow-wrap: anywhere; }\n.mly-info-panel .mly-cloud-export > :is(button,select) { width: 100% !important; }\n.mly-info-panel .mly-info-footer button { min-width: 0; box-sizing: border-box; text-align: center; }\n/* Keep icon/text spacing while permitting labels to wrap independently of switches. */\n.mly-info-panel .mly-info-more .mly-tool-heading { display: inline-flex !important; align-items: center; gap: 5px; flex: 1; min-width: 0; text-align: left; }\n.mly-info-panel .mly-info-more .mly-tool-heading > svg { flex: 0 0 auto; }\n.mly-info-panel .mly-info-more .mly-tool-text { display: block; min-width: 0; line-height: 1.3; }\n/* Width expansion is available in narrow controllers and on touch screens too. */\n.mly-info-width-toggle { flex-basis: 24px; min-height: 28px; }\n`;\n"
        }
      ],
      "absentAfterUninstall": [
        "Width expansion is available in narrow controllers"
      ],
      "requiredOccurrences": [
        {
          "text": "Width expansion is available in narrow controllers",
          "count": 1
        }
      ]
    },
    {
      "file": "src/components/FilterScrollRegion.tsx",
      "blocks": [
        {
          "label": "src/components/FilterScrollRegion.tsx panel refinement 1",
          "before": "import { React, jsx } from 'jimu-core';\n\nconst filterPanelCss = `\n.mly-filter-panel { display:flex; align-items:center; gap:3px; width:100%; max-width:100%; min-width:0; height:38px; flex:0 0 38px; box-sizing:border-box; padding:2px 3px; background:linear-gradient(135deg,#142d26,#10231e); color:#e1f2e8; pointer-events:auto; z-index:10001; }\n.mly-filter-scroll-wrap { position:relative; flex:1 1 0; min-width:0; height:32px; }\n.mly-filter-panel .mly-filter-scroll { width:100%; min-width:0; height:30px; overflow-x:auto; overflow-y:hidden; scrollbar-width:none !important; -ms-overflow-style:none; overscroll-behavior-x:contain; touch-action:pan-x pan-y; }\n.mly-filter-panel .mly-filter-scroll::-webkit-scrollbar { display:none !important; width:0 !important; height:0 !important; }\n.mly-filter-panel .mly-filter-scroll::-webkit-scrollbar-button { display:none !important; width:0 !important; height:0 !important; }\n.mly-filter-progress { position:absolute; left:0; right:0; bottom:0; height:2px; overflow:hidden; pointer-events:none; border-radius:1px; background:rgba(106,167,133,.10); }\n.mly-filter-progress > span { display:block; position:absolute; top:0; height:2px; border-radius:1px; background:#548b70; }\n.mly-filter-scroll:focus-visible, .mly-filter-panel button:focus-visible, .mly-filter-panel input:focus-visible, .mly-filter-panel select:focus-visible { outline:2px solid #76dba5 !important; outline-offset:-2px; }\n.mly-filter-row { display:flex; align-items:center; justify-content:center; gap:5px; width:max-content; min-width:100%; height:28px; box-sizing:border-box; }\n.mly-filter-group { display:flex; align-items:center; gap:6px; flex:0 0 auto; height:28px; padding:0 4px; box-sizing:border-box; border:1px solid #416756; border-radius:6px; background:#1b392d; }\n",
          "after": "import { React, jsx } from 'jimu-core';\n\nconst filterPanelCss = `\n.mly-filter-panel { display:flex; align-items:center; gap:3px; width:100%; max-width:100%; min-width:0; height:42px; flex:0 0 42px; box-sizing:border-box; padding:2px 3px; background:linear-gradient(135deg,#142d26,#10231e); color:#e1f2e8; pointer-events:auto; z-index:10001; }\n.mly-filter-scroll-wrap { position:relative; flex:1 1 0; min-width:0; height:36px; }\n.mly-filter-panel .mly-filter-scroll { width:100%; min-width:0; height:28px; overflow-x:auto; overflow-y:hidden; scrollbar-width:none !important; -ms-overflow-style:none; overscroll-behavior-x:contain; touch-action:pan-x pan-y; }\n.mly-filter-panel .mly-filter-scroll::-webkit-scrollbar { display:none !important; width:0 !important; height:0 !important; }\n.mly-filter-panel .mly-filter-scroll::-webkit-scrollbar-button { display:none !important; width:0 !important; height:0 !important; }\n.mly-filter-progress { position:absolute; left:0; right:0; bottom:0; height:8px; cursor:pointer; touch-action:none; border-radius:2px; outline-offset:0; }\n.mly-filter-progress::before { content:\"\"; position:absolute; left:0; right:0; top:3px; height:2px; background:rgba(106,167,133,.18); border-radius:1px; }\n.mly-filter-progress > span { display:block; position:absolute; top:3px; height:2px; border-radius:1px; background:#548b70; cursor:grab; }\n.mly-filter-progress:active > span { cursor:grabbing; }\n.mly-filter-progress:focus-visible { outline:1px solid #76dba5; }\n\n.mly-filter-scroll:focus-visible, .mly-filter-panel button:focus-visible, .mly-filter-panel input:focus-visible, .mly-filter-panel select:focus-visible { outline:2px solid #76dba5 !important; outline-offset:-2px; }\n.mly-filter-row { display:flex; align-items:center; justify-content:center; gap:5px; width:max-content; min-width:100%; height:28px; box-sizing:border-box; }\n.mly-filter-group { display:flex; align-items:center; gap:6px; flex:0 0 auto; height:28px; padding:0 4px; box-sizing:border-box; border:1px solid #416756; border-radius:6px; background:#1b392d; }\n"
        },
        {
          "label": "src/components/FilterScrollRegion.tsx panel refinement 2",
          "before": "  const viewport = React.useRef<HTMLDivElement>(null);\n  const row = React.useRef<HTMLDivElement>(null);\n  const progressThumb = React.useRef<HTMLSpanElement>(null);\n  const [id] = React.useState(() => `mly-filter-scroll-${++nextFilterScrollId}`);\n  const [edges, setEdges] = React.useState({ overflow: false, left: false, right: false });\n  React.useEffect(() => {\n",
          "after": "  const viewport = React.useRef<HTMLDivElement>(null);\n  const row = React.useRef<HTMLDivElement>(null);\n  const progressThumb = React.useRef<HTMLSpanElement>(null);\n  const progressTrack = React.useRef<HTMLDivElement>(null);\n  const [id] = React.useState(() => `mly-filter-scroll-${++nextFilterScrollId}`);\n  const [edges, setEdges] = React.useState({ overflow: false, left: false, right: false });\n  React.useEffect(() => {\n"
        },
        {
          "label": "src/components/FilterScrollRegion.tsx panel refinement 3",
          "before": "    const win = el.ownerDocument.defaultView;\n    const update = () => {\n      const end = Math.max(0, el.scrollWidth - el.clientWidth);\n      // Update the two-pixel decoration directly; scrolling does not rerender filters.\n      if (progressThumb.current) {\n        progressThumb.current.style.width = `${el.scrollWidth ? Math.min(1, el.clientWidth / el.scrollWidth) * 100 : 100}%`;\n        progressThumb.current.style.left = `${el.scrollWidth ? Math.max(0, Math.min(end, el.scrollLeft)) / el.scrollWidth * 100 : 0}%`;\n      }\n      const next = { overflow: end > 1, left: el.scrollLeft > 1, right: el.scrollLeft < end - 1 };\n      setEdges(old => old.overflow === next.overflow && old.left === next.left && old.right === next.right ? old : next);\n    };\n",
          "after": "    const win = el.ownerDocument.defaultView;\n    const update = () => {\n      const end = Math.max(0, el.scrollWidth - el.clientWidth);\n      // Keep the two-pixel visual thumb and ARIA values synchronized without rerendering filters.\n      const trackWidth = progressTrack.current?.clientWidth || el.clientWidth;\n      const thumbWidth = Math.min(trackWidth, Math.max(16, trackWidth * el.clientWidth / Math.max(1, el.scrollWidth)));\n      if (progressThumb.current) {\n        progressThumb.current.style.width = `${thumbWidth}px`;\n        progressThumb.current.style.left = `${end ? Math.max(0, Math.min(end, el.scrollLeft)) / end * (trackWidth - thumbWidth) : 0}px`;\n      }\n      progressTrack.current?.setAttribute('aria-valuemax', String(Math.round(end)));\n      progressTrack.current?.setAttribute('aria-valuenow', String(Math.round(el.scrollLeft)));\n      const next = { overflow: end > 1, left: el.scrollLeft > 1, right: el.scrollLeft < end - 1 };\n      setEdges(old => old.overflow === next.overflow && old.left === next.left && old.right === next.right ? old : next);\n    };\n"
        },
        {
          "label": "src/components/FilterScrollRegion.tsx panel refinement 4",
          "before": "      if (Math.abs(next - el.scrollLeft) < .5) return;\n      event.preventDefault(); event.stopPropagation(); el.scrollLeft = next;\n    };\n    el.addEventListener('scroll', update, { passive: true });\n    el.addEventListener('wheel', wheel, { passive: false });\n    const observer = win?.ResizeObserver ? new win.ResizeObserver(update) : null;\n    observer?.observe(el); observer?.observe(content);\n    win?.addEventListener('resize', update); update();\n    return () => {\n      el.removeEventListener('scroll', update); el.removeEventListener('wheel', wheel);\n      observer?.disconnect(); win?.removeEventListener('resize', update);\n    };\n",
          "after": "      if (Math.abs(next - el.scrollLeft) < .5) return;\n      event.preventDefault(); event.stopPropagation(); el.scrollLeft = next;\n    };\n    // Pointer capture keeps thumb dragging active outside the thin visual track.\n    // The 8px hit area sits below controls; only the painted bar remains 2px tall.\n    const track = progressTrack.current;\n    let drag: { id: number; x: number; scroll: number; ratio: number } | null = null;\n    const down = (event: PointerEvent) => {\n      if (!track || drag || event.isPrimary === false || (event.pointerType === 'mouse' && event.button !== 0)) return;\n      const end = Math.max(0, el.scrollWidth - el.clientWidth);\n      const bounds = track.getBoundingClientRect();\n      const thumb = progressThumb.current;\n      const thumbWidth = thumb?.getBoundingClientRect().width || 0;\n      const travel = bounds.width - thumbWidth;\n      if (end <= 0 || travel <= 0) return;\n      event.preventDefault(); event.stopPropagation();\n      if (event.target !== thumb) el.scrollLeft = Math.max(0, Math.min(end, (event.clientX - bounds.left - thumbWidth / 2) / travel * end));\n      drag = { id: event.pointerId, x: event.clientX, scroll: el.scrollLeft, ratio: end / travel };\n      try { track.setPointerCapture(event.pointerId); } catch { /* Detached hosts cannot capture. */ }\n      update();\n    };\n    const pointerMove = (event: PointerEvent) => {\n      if (!drag || drag.id !== event.pointerId) return;\n      event.preventDefault(); event.stopPropagation();\n      el.scrollLeft = drag.scroll + (event.clientX - drag.x) * drag.ratio;\n      update();\n    };\n    const endDrag = (event: PointerEvent) => {\n      if (!drag || drag.id !== event.pointerId) return;\n      drag = null; event.stopPropagation();\n      try { if (track?.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId); } catch { /* Host teardown. */ }\n    };\n    const trackKey = (event: KeyboardEvent) => {\n      if (event.altKey || event.ctrlKey || event.metaKey) return;\n      const amount = event.key === 'ArrowLeft' ? -40 : event.key === 'ArrowRight' ? 40\n        : event.key === 'PageUp' ? -el.clientWidth : event.key === 'PageDown' ? el.clientWidth : null;\n      if (amount === null && event.key !== 'Home' && event.key !== 'End') return;\n      event.preventDefault(); event.stopPropagation();\n      el.scrollLeft = event.key === 'Home' ? 0 : event.key === 'End' ? el.scrollWidth : el.scrollLeft + (amount || 0);\n      update();\n    };\n    track?.addEventListener('pointerdown', down);\n    track?.addEventListener('pointermove', pointerMove);\n    track?.addEventListener('pointerup', endDrag);\n    track?.addEventListener('pointercancel', endDrag);\n    track?.addEventListener('lostpointercapture', endDrag);\n    track?.addEventListener('keydown', trackKey);\n    track?.addEventListener('wheel', wheel, { passive: false });\n    el.addEventListener('scroll', update, { passive: true });\n    el.addEventListener('wheel', wheel, { passive: false });\n    const observer = win?.ResizeObserver ? new win.ResizeObserver(update) : null;\n    observer?.observe(el); observer?.observe(content);\n    win?.addEventListener('resize', update); update();\n    return () => {\n      if (drag) { try { if (track?.hasPointerCapture(drag.id)) track.releasePointerCapture(drag.id); } catch { /* Detached track. */ } drag = null; }\n      track?.removeEventListener('pointerdown', down); track?.removeEventListener('pointermove', pointerMove);\n      track?.removeEventListener('pointerup', endDrag); track?.removeEventListener('pointercancel', endDrag);\n      track?.removeEventListener('lostpointercapture', endDrag); track?.removeEventListener('keydown', trackKey);\n      track?.removeEventListener('wheel', wheel);\n      el.removeEventListener('scroll', update); el.removeEventListener('wheel', wheel);\n      observer?.disconnect(); win?.removeEventListener('resize', update);\n    };\n"
        },
        {
          "label": "src/components/FilterScrollRegion.tsx panel refinement 5",
          "before": "      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); }\n      else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); el.scrollTo({ left: event.key === 'Home' ? 0 : el.scrollWidth, behavior: 'smooth' }); }\n    }}><div ref={row} className=\"mly-filter-row\">{children}</div></div>\n    <div className=\"mly-filter-progress\" aria-hidden=\"true\" style={{ display: edges.overflow ? 'block' : 'none' }}><span ref={progressThumb} /></div>\n    </div>\n    {edges.overflow && <button type=\"button\" className=\"mly-filter-nav\" aria-label=\"Scroll filters right\" aria-controls={id} disabled={!edges.right} onClick={() => move(1)}>\u203a</button>}\n  </div>;\n",
          "after": "      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); }\n      else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); el.scrollTo({ left: event.key === 'Home' ? 0 : el.scrollWidth, behavior: 'smooth' }); }\n    }}><div ref={row} className=\"mly-filter-row\">{children}</div></div>\n    <div ref={progressTrack} className=\"mly-filter-progress\" role=\"scrollbar\" aria-label=\"Scroll filters horizontally\" aria-orientation=\"horizontal\" aria-controls={id} aria-valuemin={0} tabIndex={0} style={{ display: edges.overflow ? 'block' : 'none' }}><span ref={progressThumb} /></div>\n    </div>\n    {edges.overflow && <button type=\"button\" className=\"mly-filter-nav\" aria-label=\"Scroll filters right\" aria-controls={id} disabled={!edges.right} onClick={() => move(1)}>\u203a</button>}\n  </div>;\n"
        }
      ],
      "absentAfterUninstall": [
        "const progressTrack ="
      ],
      "requiredOccurrences": [
        {
          "text": "const progressTrack =",
          "count": 1
        }
      ]
    },
    {
      "file": "src/features/point-cloud/PointCloudToolSections.tsx",
      "blocks": [
        {
          "label": "src/features/point-cloud/PointCloudToolSections.tsx panel refinement 1",
          "before": "                title=\"Toggle 3D Tape Measure\"\n                style={cloudToolToggleStyle}\n              >\n                <span style={cloudMeasureHeadingStyle(isMeasureMode)}>\n                  <Icons.Measure size={12} style={cloudToolIconStyle} />\n                  MEASURE\n                </span>\n                <div\n                  style={cloudMeasureTrackStyle(isMeasureMode)}\n",
          "after": "                title=\"Toggle 3D Tape Measure\"\n                style={cloudToolToggleStyle}\n              >\n                <span className=\"mly-tool-heading\" style={cloudMeasureHeadingStyle(isMeasureMode)}>\n                  <Icons.Measure size={12} style={cloudToolIconStyle} />\n                  <span className=\"mly-tool-text\">MEASURE</span>\n                </span>\n                <div\n                  style={cloudMeasureTrackStyle(isMeasureMode)}\n"
        },
        {
          "label": "src/features/point-cloud/PointCloudToolSections.tsx panel refinement 2",
          "before": "                title=\"Toggle Lasso Point Selection\"\n                style={cloudToolToggleStyle}\n              >\n                <span style={cloudLassoHeadingStyle(isLassoMode)}>\n                  <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" style={cloudToolIconStyle}>\n                    <path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM12 22c-5.52 0-10-4.48-10-10S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z\" />\n                    <circle cx=\"12\" cy=\"12\" r=\"3\" fill=\"currentColor\" />\n                  </svg>\n                  LASSO\n                </span>\n                <div\n                  style={cloudLassoTrackStyle(isLassoMode)}\n",
          "after": "                title=\"Toggle Lasso Point Selection\"\n                style={cloudToolToggleStyle}\n              >\n                <span className=\"mly-tool-heading\" style={cloudLassoHeadingStyle(isLassoMode)}>\n                  <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" style={cloudToolIconStyle}>\n                    <path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM12 22c-5.52 0-10-4.48-10-10S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z\" />\n                    <circle cx=\"12\" cy=\"12\" r=\"3\" fill=\"currentColor\" />\n                  </svg>\n                  <span className=\"mly-tool-text\">LASSO</span>\n                </span>\n                <div\n                  style={cloudLassoTrackStyle(isLassoMode)}\n"
        },
        {
          "label": "src/features/point-cloud/PointCloudToolSections.tsx panel refinement 3",
          "before": "                title=\"Toggle 3D Line of Sight\"\n                style={cloudToolToggleStyle}\n              >\n                <span style={cloudSightHeadingStyle(isSightMode)}>\n                  <Icons.Eye size={12} style={cloudToolIconStyle} />\n                  SIGHT\n                </span>\n                <div\n                  style={cloudSightTrackStyle(isSightMode)}\n",
          "after": "                title=\"Toggle 3D Line of Sight\"\n                style={cloudToolToggleStyle}\n              >\n                <span className=\"mly-tool-heading\" style={cloudSightHeadingStyle(isSightMode)}>\n                  <Icons.Eye size={12} style={cloudToolIconStyle} />\n                  <span className=\"mly-tool-text\">SIGHT</span>\n                </span>\n                <div\n                  style={cloudSightTrackStyle(isSightMode)}\n"
        },
        {
          "label": "src/features/point-cloud/PointCloudToolSections.tsx panel refinement 4",
          "before": "                title=\"Toggle 3D Viewshed (Blind Spot) Analysis\"\n                style={cloudToolToggleStyle}\n              >\n                <span style={cloudViewshedHeadingStyle(isViewshedMode)}>\n                  <Icons.Viewshed size={12} style={cloudToolIconStyle} />\n                  VIEWSHED\n                </span>\n                <div\n                  style={cloudViewshedTrackStyle(isViewshedMode)}\n",
          "after": "                title=\"Toggle 3D Viewshed (Blind Spot) Analysis\"\n                style={cloudToolToggleStyle}\n              >\n                <span className=\"mly-tool-heading\" style={cloudViewshedHeadingStyle(isViewshedMode)}>\n                  <Icons.Viewshed size={12} style={cloudToolIconStyle} />\n                  <span className=\"mly-tool-text\">VIEWSHED</span>\n                </span>\n                <div\n                  style={cloudViewshedTrackStyle(isViewshedMode)}\n"
        }
      ],
      "absentAfterUninstall": [
        "className=\"mly-tool-heading\""
      ],
      "requiredOccurrences": [
        {
          "text": "className=\"mly-tool-heading\"",
          "count": 4
        }
      ]
    },
    {
      "file": "src/features/point-cloud/PointCloudCalibrationControls.tsx",
      "blocks": [
        {
          "label": "src/features/point-cloud/PointCloudCalibrationControls.tsx panel refinement 1",
          "before": "                title=\"Calibrate Point Cloud GPS Drift\"\n                style={calibrationToggleStyle}\n              >\n                <span style={calibrationHeadingStyle(showCalibrationPanel)}>\n                  <Icons.Crosshair size={12} style={calibrationIconStyle} />\n                  CALIBRATE\n                </span>\n                <div style={calibrationDisclosureStyle}>{showCalibrationPanel ? \"\u25bc\" : \"\u25b2\"}</div>\n              </button>\n",
          "after": "                title=\"Calibrate Point Cloud GPS Drift\"\n                style={calibrationToggleStyle}\n              >\n                <span className=\"mly-tool-heading\" style={calibrationHeadingStyle(showCalibrationPanel)}>\n                  <Icons.Crosshair size={12} style={calibrationIconStyle} />\n                  <span className=\"mly-tool-text\">CALIBRATE</span>\n                </span>\n                <div style={calibrationDisclosureStyle}>{showCalibrationPanel ? \"\u25bc\" : \"\u25b2\"}</div>\n              </button>\n"
        }
      ],
      "absentAfterUninstall": [
        "className=\"mly-tool-heading\""
      ],
      "requiredOccurrences": [
        {
          "text": "className=\"mly-tool-heading\"",
          "count": 1
        }
      ]
    },
    {
      "file": "docs/REFACTORING-ROADMAP.md",
      "blocks": [
        {
          "label": "docs/REFACTORING-ROADMAP.md panel refinement 1",
          "before": "## Infobox content-width layout\n\nAnalysis, routing, point-cloud and detection controls now inherit the infobox content width, including space consumed by its scrollbar. A named `mly-info` inline-size container lets compact route choices stack at the panel's width instead of relying on the application's desktop viewport. Coverage tiers keep their percentage column while labels/ages wrap. Disclosure tool cards and export buttons use border-box sizing and full parent width; labels can wrap without losing switches. The scroll footer uses a two-column grid only when both actions are present, with the more-controls label and arrow centered together. Existing callbacks, analysis/routing data and resource lifecycles are unchanged. `tests/infoBoxLayout.browser.cjs` checks actual presentation components in Chromium across controller/mobile widths, expanded states, and all footer modes. Full Experience Builder visual verification remains necessary.\n",
          "after": "## Infobox content-width layout\n\nAnalysis, routing, point-cloud and detection controls now inherit the infobox content width, including space consumed by its scrollbar. A named `mly-info` inline-size container lets compact route choices stack at the panel's width instead of relying on the application's desktop viewport. Coverage tiers keep their percentage column while labels/ages wrap. Disclosure tool cards and export buttons use border-box sizing and full parent width; labels can wrap without losing switches. The scroll footer uses a two-column grid only when both actions are present, with the more-controls label and arrow centered together. Existing callbacks, analysis/routing data and resource lifecycles are unchanged. `tests/infoBoxLayout.browser.cjs` checks actual presentation components in Chromium across controller/mobile widths, expanded states, and all footer modes. Full Experience Builder visual verification remains necessary.\n\n## Compact panel spacing, expansion and filter scrollbar\n\nPoint-cloud tool headings now keep an explicit 5px icon/text gap, with text in its own shrinkable span. Remove the compact block-display override that collapsed icon spacing. Keep the existing width toggle available for narrow Widget Controller hosts and touch devices; the wide card remains constrained by its parent. Filter scrolling now exposes the existing two-pixel visual line as an accessible scrollbar with an eight-pixel hit area below the fields. Pointer capture supports mouse/touch dragging beyond the track, track clicks jump position, and keyboard commands update scroll position/ARIA values. Preserve wheel, navigation arrows and native form input behavior. Native listeners/capture are released on teardown. `tests/panelControls.browser.cjs` mounts the actual React components in Chromium to verify these interactions alongside the existing responsive-layout checks.\n"
        }
      ],
      "absentAfterUninstall": [
        "## Compact panel spacing, expansion and filter scrollbar"
      ],
      "requiredOccurrences": [
        {
          "text": "## Compact panel spacing, expansion and filter scrollbar",
          "count": 1
        }
      ]
    }
  ],
  "modules": [
    {
      "file": "tests/panelControls.browser.cjs",
      "content": "/** Mount actual React controls in Chromium: compact width toggles, tool spacing and scrollbar interaction.\n * Set MAPILLARY_TYPESCRIPT, REACT_UMD_PATH and REACT_DOM_UMD_PATH to local test dependencies.\n */\nconst fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),{chromium}=require(process.env.MAPILLARY_PLAYWRIGHT||'playwright');\nconst root=process.env.PANEL_CONTROLS_SOURCE_ROOT||path.resolve(__dirname,'../src');const modules={};\nfunction bundle(rel){if(modules[rel])return;const code=ts.transpileModule(fs.readFileSync(path.join(root,rel),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,jsxFactory:'jsx',jsxFragmentFactory:'React.Fragment'}}).outputText;modules[rel]={code,deps:{}};for(const match of code.matchAll(/require\\([\"']([^\"']+)[\"']\\)/g)){const id=match[1];if(!id.startsWith('.'))continue;const base=path.posix.normalize(path.posix.join(path.posix.dirname(rel),id));const target=['.ts','.tsx',''].map(ext=>base+ext).find(f=>fs.existsSync(path.join(root,f)));if(!target)throw Error(id);modules[rel].deps[id]=target;bundle(target)}}\nbundle('components/InfoBox.tsx');bundle('components/FilterScrollRegion.tsx');\n(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,ignoreDefaultArgs:['--hide-scrollbars'],args:['--no-sandbox']});let checks=0;const trace=message=>{if(process.env.PANEL_TEST_DEBUG)console.log(message)};try{for(const mobile of [false,true]){const context=await browser.newContext({viewport:mobile?{width:375,height:667}:{width:1280,height:900},isMobile:mobile,hasTouch:mobile});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setContent('<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><style>body{margin:0;background:#506257;color:white}.host{position:relative;container-type:inline-size;width:300px;height:400px}#filters{width:300px;margin-top:8px} .mly-info-panel .mly-info-scroll{scrollbar-width:auto!important;scrollbar-gutter:stable}.mly-info-panel .mly-info-scroll::-webkit-scrollbar{display:block!important;width:12px}</style><div class=\"host\" id=\"info\"></div><div id=\"filters\"></div>');await page.addScriptTag({path:process.env.REACT_UMD_PATH||'/tmp/panel-react/package/umd/react.development.js'});await page.addScriptTag({path:process.env.REACT_DOM_UMD_PATH||'/tmp/panel-react-dom/package/umd/react-dom.development.js'});await page.evaluate(({modules})=>{const cache={};function load(name){if(cache[name])return cache[name].exports;const m={exports:{}};cache[name]=m;const def=modules[name];new Function('require','module','exports',def.code)(id=>id==='jimu-core'?{React,jsx:React.createElement}:id==='react'?{...React,default:React}:id==='react-dom'?{...ReactDOM,default:ReactDOM}:load(def.deps[id]),m,m.exports);return m.exports}const {InfoBox}=load('components/InfoBox.tsx'),{FilterScrollRegion}=load('components/FilterScrollRegion.tsx');window.infoRoot=ReactDOM.createRoot(document.getElementById('info'));window.infoRoot.render(React.createElement(InfoBox,{sequenceImages:[],imageId:'A',currentZoom:17,pointCloudVisible:true,measurePoints:[],sightTargets:[],pointCloudLength:0,pointCloudMaxLength:100,pointCloudWidth:0,pointCloudMaxWidth:80,address:'Nashville'}));window.filterRoot=ReactDOM.createRoot(document.getElementById('filters'));window.renderFilters=width=>window.filterRoot.render(React.createElement(FilterScrollRegion,null,React.createElement('div',{style:{width,flex:'0 0 auto',display:'flex',gap:8}},width>100?React.createElement('input',{'aria-label':'Username',style:{width:130,height:24}}):'Small',width>100?React.createElement('span',null,'Filter content'):null)));window.renderFilters(1400);},{modules});\n await page.getByRole('button',{name:'Open image details and tools'}).click();const toggle=page.getByRole('button',{name:'Widen details panel'});assert(await toggle.isVisible(),`Width toggle must be visible on ${mobile?'mobile':'desktop controller'}`);const panel=page.locator('.mly-info-panel');assert.equal((await panel.boundingBox()).width,96);await toggle.click();await page.waitForFunction(()=>document.querySelector('.mly-info-panel').classList.contains('is-wide'));assert.equal((await panel.boundingBox()).width,144);await page.getByRole('button',{name:'Use compact panel width'}).click();await page.locator('.mly-info-more > summary').click();const spacing=await page.locator('.mly-tool-heading').evaluateAll(nodes=>nodes.map(e=>{const svg=e.querySelector('svg').getBoundingClientRect(),text=e.querySelector('.mly-tool-text').getBoundingClientRect();return{text:e.textContent.trim(),gap:text.left-svg.right}}));assert.equal(spacing.length,5);for(const s of spacing)assert(s.gap>=4,JSON.stringify(s));checks+=3;\n trace('spacing done '+mobile);const bar=page.getByRole('scrollbar',{name:'Scroll filters horizontally'});await bar.waitFor({state:'visible'});const scroll=page.locator('.mly-filter-scroll'),thumb=page.locator('.mly-filter-progress > span');const initial=await scroll.evaluate(e=>e.scrollLeft);await page.evaluate(()=>{window.mapPointerDowns=0;document.addEventListener('pointerdown',()=>window.mapPointerDowns++)});const b=await thumb.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+1);await page.mouse.down();await page.mouse.move(b.x+b.width/2+60,b.y-20,{steps:6});await page.mouse.up();assert((await scroll.evaluate(e=>e.scrollLeft))>initial+100,'Dragging thumb outside its hit area must scroll');checks++;assert.equal(await page.evaluate(()=>window.mapPointerDowns),0,'Track dragging must not bubble into map gestures');\n if(mobile){await bar.press('Home');const box=await thumb.boundingBox(),cdp=await context.newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+1,id:1}]});for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+box.width/2+i*10,y:box.y+1,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert((await scroll.evaluate(e=>e.scrollLeft))>100,'Touch dragging must scroll');await cdp.detach();checks++;}\n\n trace('drag done '+mobile);await bar.focus();await page.keyboard.press('Home');await page.waitForFunction(()=>document.querySelector('.mly-filter-scroll').scrollLeft===0);await page.keyboard.press('ArrowRight');assert((await scroll.evaluate(e=>e.scrollLeft))>=39);await page.keyboard.press('End');await page.waitForFunction(()=>{const e=document.querySelector('.mly-filter-scroll');return Math.abs(e.scrollLeft-(e.scrollWidth-e.clientWidth))<2});await page.keyboard.press('Home');checks++;\n trace('keys done '+mobile);const track=await bar.boundingBox();assert.equal(track.height,8);assert.equal((await thumb.boundingBox()).height,2);await page.mouse.click(track.x+track.width-2,track.y+4);assert((await scroll.evaluate(e=>e.scrollLeft))>500);assert.equal(Number(await bar.getAttribute('aria-valuenow')),Math.round(await scroll.evaluate(e=>e.scrollLeft)));checks++;\n const cancelThumb=await thumb.boundingBox();await page.mouse.move(cancelThumb.x+cancelThumb.width/2,cancelThumb.y+1);await page.mouse.down();await bar.dispatchEvent('pointercancel',{pointerId:1,pointerType:'mouse',isPrimary:true});const canceledAt=await scroll.evaluate(e=>e.scrollLeft);await page.mouse.move(cancelThumb.x+cancelThumb.width/2-30,cancelThumb.y-20);await page.mouse.up();assert.equal(await scroll.evaluate(e=>e.scrollLeft),canceledAt);checks++;\n trace('track done '+mobile);await bar.press('Home');await scroll.hover();await page.mouse.wheel(0,120);await page.waitForFunction(()=>document.querySelector('.mly-filter-scroll').scrollLeft>50);if(!mobile){await page.getByRole('button',{name:'Scroll filters left',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.mly-filter-scroll').scrollLeft<2);await page.getByRole('button',{name:'Scroll filters right',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.mly-filter-scroll').scrollLeft>50);}else{assert.equal(await page.getByRole('button',{name:'Scroll filters left',exact:true}).count(),0)}checks++;\n trace('wheel/arrows done '+mobile);await bar.press('Home');const input=page.getByRole('textbox',{name:'Username'});await input.fill('tester');assert.equal(await input.inputValue(),'tester');await bar.press('End');await page.evaluate(()=>window.renderFilters(100));await page.waitForFunction(()=>document.querySelector('.mly-filter-progress').style.display==='none');assert.equal(await page.getByRole('scrollbar').count(),0);await page.evaluate(()=>window.renderFilters(1400));await bar.waitFor({state:'visible'});await bar.press('End');assert((await scroll.evaluate(e=>e.scrollLeft))>500);checks++;\n trace('resize done '+mobile);const thumbNow=await thumb.boundingBox();await page.mouse.move(thumbNow.x+thumbNow.width/2,thumbNow.y+1);await page.mouse.down();await page.evaluate(()=>{window.filterRoot.unmount();window.infoRoot.unmount()});await page.mouse.up();assert.deepEqual(errors,[]);checks++;await context.close()}console.log(checks+' real React/Chromium checks passed on compact desktop and touch/mobile: icon spacing, width toggle, thumb drag/capture, track click, keyboard, wheel/arrows, form typing, resize and teardown.');}finally{await browser.close()}})().catch(e=>{console.error(e.stack);process.exitCode=1});\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'panel-spacing-scrollbar-';

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
      if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (partially edited organization filter)');
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

try {
  const allowed = ['--dry-run', '--skip-tests', '--skip-test', '--uninstall'];
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-panel-spacing-scrollbar.cjs [--dry-run] [--skip-tests] [--uninstall]');
  readTarget('src/runtime/widget.tsx', true);
  const writes = [], seen = new Set();
  for (const entry of payload.entries) {
    if (seen.has(entry.file)) throw new Error('Duplicate patch path: ' + entry.file);
    seen.add(entry.file);
    if (skipTests && entry.test) continue;
    const current = readTarget(entry.file, true);
    let text = normalize(current.bytes.toString('utf8'));
    const blocks = uninstall ? [...entry.blocks].reverse() : entry.blocks;
    for (const block of blocks) text = transformBlock(text, block, uninstall);
    if (uninstall && entry.absentAfterUninstall && entry.absentAfterUninstall.some(marker => text.includes(marker))) {
      conflict(entry.file + ' (edited native selection references remain)');
    }
    if (!uninstall && entry.requiredOccurrences && entry.requiredOccurrences.some(rule => count(text, rule.text) !== rule.count)) {
      conflict(entry.file + ' (organization filter references differ)');
    }
    if (text !== normalize(current.bytes.toString('utf8'))) writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(text, current.bytes) });
  }
  for (const module of payload.modules) {
    if (seen.has(module.file)) throw new Error('Duplicate patch path: ' + module.file);
    seen.add(module.file);
    if (skipTests && module.test) continue;
    const current = readTarget(module.file);
    if (current.bytes !== null) {
      if (normalize(current.bytes.toString('utf8')) !== normalize(module.content)) conflict(module.file + ' (existing module)');
      if (uninstall) writes.push({ ...current, relative: module.file, original: current.bytes, content: null });
    } else if (!uninstall) {
      writes.push({ ...current, relative: module.file, original: null, content: Buffer.from(module.content) });
    }
  }
  console.log('Existing tests are preserved. This installer does not run tests.');
  if (!writes.length) {
    console.log(uninstall ? 'Panel spacing and scrollbar is already uninstalled. No files changed.' : 'Panel spacing and scrollbar is already installed. No files changed.');
    process.exit(0);
  }
  if (dry) {
    console.log('Dry run passed. Would ' + (uninstall ? 'uninstall' : 'install') + ':\n' + writes.map(item => '  ' + (item.content === null ? 'remove ' : item.original === null ? 'create ' : 'update ') + item.relative).join('\n'));
    process.exit(0);
  }
  // Complete every source guard before creating a backup or changing source files.
  for (const item of writes) assertUnchanged(item);
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
  const manifest = writes.map(item => ({ file: item.relative, operation: item.content === null ? 'remove' : item.original === null ? 'create' : 'update', originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) }));
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'panel-spacing-scrollbar', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
  for (const item of writes) assertUnchanged(item);
  try {
    for (const item of writes) {
      assertUnchanged(item);
      if (item.content === null) {
        targetFor(item.relative);
        fs.unlinkSync(item.file);
        item.started = true;
      } else if (item.original === null) {
        ensureParents(item.relative);
        const descriptor = fs.openSync(targetFor(item.relative), 'wx');
        const stat = fs.fstatSync(descriptor);
        item.createdDev = stat.dev; item.createdIno = stat.ino; item.started = true;
        try { fs.writeFileSync(descriptor, item.content); } finally { fs.closeSync(descriptor); }
      } else overwriteOriginal(item, item.content);
    }
  } catch (error) {
    const errors = rollback(writes);
    if (errors.length) throw new Error(error.message + '\nRollback needs attention; original bytes are in ' + backupRelative + ':\n' + errors.join('\n'));
    throw new Error(error.message + '\nInstaller writes rolled back. Original source files restored. Backup: ' + backupRelative);
  }
  console.log('Panel spacing and scrollbar ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tool label spacing, compact/mobile panel expansion and draggable thin filter scrolling are enabled. Use uninstall-panel-spacing-scrollbar.cjs to revert this update.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
