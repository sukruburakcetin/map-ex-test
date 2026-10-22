#!/usr/bin/env node
'use strict';
/** Green filter panel installer. Plain source payload.
 * Validates all targets before writes. Preserves existing source bytes in local
 * backups, rejects links/conflicts, and rolls back its writes on failure.
 * --skip-tests skips test file writes/removals; it does not run tests.
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
      "file": "src/components/FilterBar.tsx",
      "blocks": [
        {
          "label": "src/components/FilterBar.tsx green filter panel block 1",
          "before": "import { GlassDatePicker } from \"../components/GlassDatePicker\";\nimport { glassStyles } from \"../utils/styles\";\nimport { FilterBarProps } from \"./types\";\nimport { organizationFilterId } from \"../utils/organizationFilter\";\n",
          "after": "import { GlassDatePicker } from \"../components/GlassDatePicker\";\nimport { glassStyles } from \"../utils/styles\";\nimport { FilterScrollRegion } from \"./FilterScrollRegion\";\nimport { FilterBarProps } from \"./types\";\nimport { organizationFilterId } from \"../utils/organizationFilter\";\n"
        },
        {
          "label": "src/components/FilterBar.tsx green filter panel block 2",
          "before": "*/\nconst SpriteSize: React.FC<{ label: string; value: number; onChange: (value: number) => void }> = ({ label, value, onChange }) => (\n    <label title={`${label} icon size`} style={{ display: \"flex\", alignItems: \"center\", gap: 3, fontSize: 9, color: \"#e4eee8\", flexShrink: 0 }}>\n      Size<select aria-label={`${label} icon size`} value={value} onChange={event => onChange(Number(event.target.value))} style={{ height: 22, fontSize: 10, padding: \"0 2px\", borderRadius: 4, border: \"1px solid #ffffff35\", background: \"#214d36\", color: \"white\" }}>\n        {[0.75, 1, 1.25, 1.5, 2].map(scale => <option key={scale} value={scale}>{scale * 100}%</option>)}\n",
          "after": "*/\nconst SpriteSize: React.FC<{ label: string; value: number; onChange: (value: number) => void }> = ({ label, value, onChange }) => (\n    <label className=\"mly-filter-size\" title={`${label} icon size`} style={{ display: \"flex\", alignItems: \"center\", gap: 3, fontSize: 9, color: \"#e4eee8\", flexShrink: 0 }}>\n      Size<select aria-label={`${label} icon size`} value={value} onChange={event => onChange(Number(event.target.value))} style={{ height: 22, fontSize: 10, padding: \"0 2px\", borderRadius: 4, border: \"1px solid #ffffff35\", background: \"#214d36\", color: \"white\" }}>\n        {[0.75, 1, 1.25, 1.5, 2].map(scale => <option key={scale} value={scale}>{scale * 100}%</option>)}\n"
        },
        {
          "label": "src/components/FilterBar.tsx green filter panel block 3",
          "before": "\n    return (\n        <div\n            className=\"glass-scroll-container\"\n            role=\"region\" aria-label=\"Mapillary filters\"\n            style={{ ...glassStyles.filterBarContainer, height: 34, boxSizing: \"border-box\", flexWrap: \"nowrap\", justifyContent: \"flex-start\", padding: \"3px 5px\", gap: 5, overflowX: \"auto\", overflowY: \"hidden\", scrollbarWidth: \"none\", maxWidth: \"100%\", borderRadius: 10 }}\n        >\n            {/* Auto margins center spare space, resolving to zero when the row overflows. */}\n            <div style={{ display: \"flex\", flexShrink: 0, alignItems: \"center\", gap: 5, height: 26, marginInline: \"auto\" }}>\n            {/* TURBO MODE FILTER GROUP (GOLD) */}\n            {showTurboFilterBox && (\n                <div role=\"group\" aria-label=\"Coverage filters\" style={{ ...glassStyles.filterGroup(\"#FFD700\"), flexShrink: 0, height: 26, padding: \"0 3px\", boxSizing: \"border-box\" }}>\n\n                    {/* Username input */}\n",
          "after": "\n    return (\n        <FilterScrollRegion>\n            {/* COVERAGE FILTERS */}\n            {showTurboFilterBox && (\n                <div className=\"mly-filter-group\" role=\"group\" aria-label=\"Coverage filters\">\n\n                    {/* Username input */}\n"
        },
        {
          "label": "src/components/FilterBar.tsx green filter panel block 4",
          "before": "\n                    {/* Date range */}\n                    <div style={{ display: \"flex\", alignItems: \"center\", gap: \"2px\" }}>\n                        <GlassDatePicker floatingMenu\n                            selected={turboFilterStartDate ? new Date(turboFilterStartDate) : null}\n",
          "after": "\n                    {/* Date range */}\n                    <div className=\"mly-filter-dates\">\n                        <GlassDatePicker floatingMenu\n                            selected={turboFilterStartDate ? new Date(turboFilterStartDate) : null}\n"
        },
        {
          "label": "src/components/FilterBar.tsx green filter panel block 5",
          "before": "                    <div style={{ display: \"flex\", alignItems: \"center\", gap: \"4px\" }}>\n                        <span style={glassStyles.labelSmall}>Is Pano:</span>\n                        <div style={{ display: \"flex\", gap: \"2px\" }}>\n                            {([\n                                { label: \"All\", value: undefined },\n",
          "after": "                    <div style={{ display: \"flex\", alignItems: \"center\", gap: \"4px\" }}>\n                        <span style={glassStyles.labelSmall}>Is Pano:</span>\n                        <div className=\"mly-filter-pano\" style={{ display: \"flex\", gap: \"2px\" }}>\n                            {([\n                                { label: \"All\", value: undefined },\n"
        },
        {
          "label": "src/components/FilterBar.tsx green filter panel block 6",
          "before": "                                            fontSize: \"8px\",\n                                            fontWeight: isActive ? 700 : 400,\n                                            background: isActive ? \"rgba(255, 215, 0, 0.6)\" : \"rgba(255,255,255,0.1)\",\n                                            border: isActive ? \"1px solid rgba(255,215,0,0.8)\" : \"1px solid rgba(255,255,255,0.2)\",\n                                            borderRadius: \"3px\",\n                                            color: \"white\",\n",
          "after": "                                            fontSize: \"8px\",\n                                            fontWeight: isActive ? 700 : 400,\n                                            background: isActive ? \"#2b8054\" : \"#183f2c\",\n                                            border: isActive ? \"1px solid #74c397\" : \"1px solid #456b58\",\n                                            borderRadius: \"3px\",\n                                            color: \"white\",\n"
        },
        {
          "label": "src/components/FilterBar.tsx green filter panel block 7",
          "before": "                    </div>\n\n                    <label style={{ display: \"flex\", alignItems: \"center\", gap: 3, flexShrink: 0 }}>\n                        <span style={glassStyles.labelSmall}>Travel:</span>\n                        <select aria-label=\"Coverage travel method\" title=\"Filters sequence and image coverage. Zoom closer at overview scale. Other travel includes non-pedestrian capture methods.\" value={turboFilterOnFoot === undefined ? \"any\" : turboFilterOnFoot ? \"foot\" : \"other\"} onChange={event => onTurboTravelMethodChange?.(event.target.value === \"foot\" ? true : event.target.value === \"other\" ? false : undefined)} style={{ height: 22, maxWidth: 96, padding: \"0 3px\", fontSize: 10, borderRadius: 4, border: \"1px solid #ffffff35\", background: \"#214d36\", color: \"white\" }}>\n",
          "after": "                    </div>\n\n                    <label className=\"mly-filter-travel\" style={{ display: \"flex\", alignItems: \"center\", gap: 3, flexShrink: 0 }}>\n                        <span style={glassStyles.labelSmall}>Travel:</span>\n                        <select aria-label=\"Coverage travel method\" title=\"Filters sequence and image coverage. Zoom closer at overview scale. Other travel includes non-pedestrian capture methods.\" value={turboFilterOnFoot === undefined ? \"any\" : turboFilterOnFoot ? \"foot\" : \"other\"} onChange={event => onTurboTravelMethodChange?.(event.target.value === \"foot\" ? true : event.target.value === \"other\" ? false : undefined)} style={{ height: 22, maxWidth: 96, padding: \"0 3px\", fontSize: 10, borderRadius: 4, border: \"1px solid #ffffff35\", background: \"#214d36\", color: \"white\" }}>\n"
        },
        {
          "label": "src/components/FilterBar.tsx green filter panel block 8",
          "before": "            )}\n\n            {/* TRAFFIC SIGNS FILTER GROUP (ORANGE) */}\n            {showTrafficSignsFilterBox && (\n                <div role=\"group\" aria-label=\"Traffic sign filters\" style={{ ...glassStyles.filterGroup(\"#FFA500\"), flexShrink: 0, height: 26, padding: \"0 3px\", boxSizing: \"border-box\" }}>\n                    <GlassSelect floatingMenu compact\n                        value={trafficSignsFilterValue}\n                        onChange={onTrafficSignsFilterChange}\n                        options={trafficSignsOptions}\n                        accentColor=\"#FFA500\"\n                        menuPlacement=\"top\"\n                    />\n",
          "after": "            )}\n\n            {/* TRAFFIC SIGN FILTERS */}\n            {showTrafficSignsFilterBox && (\n                <div className=\"mly-filter-group mly-filter-group--features\" role=\"group\" aria-label=\"Traffic sign filters\">\n                    <GlassSelect floatingMenu compact\n                        value={trafficSignsFilterValue}\n                        onChange={onTrafficSignsFilterChange}\n                        options={trafficSignsOptions}\n                        accentColor=\"#63c38e\"\n                        menuPlacement=\"top\"\n                    />\n"
        },
        {
          "label": "src/components/FilterBar.tsx green filter panel block 9",
          "before": "            )}\n\n            {/* OBJECTS FILTER GROUP (RED) */}\n            {showObjectsFilterBox && (\n                <div role=\"group\" aria-label=\"Object filters\" style={{ ...glassStyles.filterGroup(\"#FF3C3C\"), flexShrink: 0, height: 26, padding: \"0 3px\", boxSizing: \"border-box\" }}>\n                    <GlassSelect floatingMenu compact\n                        value={objectsFilterValue}\n                        onChange={onObjectsFilterChange}\n                        options={objectsOptions}\n                        accentColor=\"#FF3C3C\"\n                        menuPlacement=\"top\"\n                    />\n",
          "after": "            )}\n\n            {/* OBJECT FILTERS */}\n            {showObjectsFilterBox && (\n                <div className=\"mly-filter-group mly-filter-group--features\" role=\"group\" aria-label=\"Object filters\">\n                    <GlassSelect floatingMenu compact\n                        value={objectsFilterValue}\n                        onChange={onObjectsFilterChange}\n                        options={objectsOptions}\n                        accentColor=\"#63c38e\"\n                        menuPlacement=\"top\"\n                    />\n"
        },
        {
          "label": "src/components/FilterBar.tsx green filter panel block 10",
          "before": "                </div>\n            )}\n            </div>\n        </div>\n    );\n};\n",
          "after": "                </div>\n            )}\n        </FilterScrollRegion>\n    );\n};\n"
        }
      ],
      "absentAfterUninstall": [
        "FilterScrollRegion"
      ],
      "requiredOccurrences": [
        {
          "text": "FilterScrollRegion",
          "count": 4
        }
      ]
    }
  ],
  "modules": [
    {
      "file": "src/components/FilterScrollRegion.tsx",
      "content": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\n\nconst filterPanelCss = `\n.mly-filter-panel { display:flex; align-items:center; gap:3px; width:100%; max-width:100%; min-width:0; height:38px; flex:0 0 38px; box-sizing:border-box; padding:2px 3px; margin-top:1px; border:1px solid #416756; border-radius:8px; background:linear-gradient(135deg,#142d26,#10231e); color:#e1f2e8; pointer-events:auto; z-index:10001; }\n.mly-filter-scroll { flex:1 1 0; min-width:0; height:32px; overflow-x:auto; overflow-y:hidden; scrollbar-width:thin; scrollbar-color:#548b70 transparent; overscroll-behavior-x:contain; touch-action:pan-x pan-y; }\n.mly-filter-scroll::-webkit-scrollbar { height:4px; }\n.mly-filter-scroll::-webkit-scrollbar-thumb { background:#548b70; border-radius:4px; }\n.mly-filter-scroll:focus-visible, .mly-filter-panel button:focus-visible, .mly-filter-panel input:focus-visible, .mly-filter-panel select:focus-visible { outline:2px solid #76dba5 !important; outline-offset:-2px; }\n.mly-filter-row { display:flex; align-items:center; justify-content:center; gap:5px; width:max-content; min-width:100%; height:28px; box-sizing:border-box; }\n.mly-filter-group { display:flex; align-items:center; gap:6px; flex:0 0 auto; height:28px; padding:0 4px; box-sizing:border-box; border:1px solid #416756; border-radius:6px; background:#1b392d; }\n.mly-filter-group label { margin:0 !important; min-height:0; line-height:1; }\n.mly-filter-group input[type=\"text\"] { height:24px !important; min-height:24px !important; padding-top:0 !important; padding-bottom:0 !important; box-sizing:border-box; border-radius:5px !important; border-color:#456b58 !important; background:#122c22 !important; }\n.mly-filter-group select { display:block; height:24px !important; min-height:24px !important; max-height:24px !important; box-sizing:border-box; margin:0; border:1px solid #507d64 !important; border-radius:5px; padding:0 4px !important; font-size:10px !important; line-height:normal; background:#173d2b !important; color:#edf7f0; color-scheme:dark; }\n.mly-filter-group .mly-filter-travel select { width:88px; min-width:0; }\n.mly-filter-size { height:24px; white-space:nowrap; }\n.mly-filter-size select { width:52px; min-width:52px; }\n.mly-filter-group--features > div:first-child { flex:0 0 180px !important; width:180px !important; min-width:0; }\n.mly-filter-group--features [role=\"combobox\"] { height:24px; min-height:24px; max-height:24px; padding:0 6px; border-color:#507d64; border-radius:5px; background:#173d2b; }\n.mly-filter-group button { box-sizing:border-box; }\n.mly-filter-dates { display:flex; align-items:center; gap:3px; }\n.mly-filter-dates button { height:24px; min-height:24px; max-height:24px; padding:0 5px; border-color:#456b58; background:#173d2b; }\n.mly-filter-pano button { height:24px; min-height:24px; padding:0 5px; }\n.mly-filter-nav { display:flex; align-items:center; justify-content:center; flex:0 0 24px; width:24px; height:28px; min-width:0; min-height:0; padding:0; border:1px solid #527d66; border-radius:5px; background:#1e4935; color:#d6f5e3; font:18px/1 system-ui,sans-serif; cursor:pointer; }\n.mly-filter-nav:disabled { opacity:.35; cursor:default; }\n.mly-filter-nav:not(:disabled):hover { background:#2d6247; }\n@media (hover:none) and (pointer:coarse) { .mly-filter-nav { display:none; } }\n`;\nlet nextFilterScrollId = 0;\n\n/** Own only the filter row's scrolling; never register map/viewer handlers. */\nexport const FilterScrollRegion: React.FC<{ children: React.ReactNode }> = ({ children }) => {\n  const viewport = React.useRef<HTMLDivElement>(null);\n  const row = React.useRef<HTMLDivElement>(null);\n  const [id] = React.useState(() => `mly-filter-scroll-${++nextFilterScrollId}`);\n  const [edges, setEdges] = React.useState({ overflow: false, left: false, right: false });\n  React.useEffect(() => {\n    const el = viewport.current, content = row.current;\n    if (!el || !content) return;\n    const win = el.ownerDocument.defaultView;\n    const update = () => {\n      const end = Math.max(0, el.scrollWidth - el.clientWidth);\n      const next = { overflow: end > 1, left: el.scrollLeft > 1, right: el.scrollLeft < end - 1 };\n      setEdges(old => old.overflow === next.overflow && old.left === next.left && old.right === next.right ? old : next);\n    };\n    const wheel = (event: WheelEvent) => {\n      if (event.defaultPrevented || event.ctrlKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;\n      const target = event.target as Element | null;\n      // Let native selects retain their wheel/keyboard behavior.\n      if (target?.closest?.('select, option, [contenteditable=\"true\"]')) return;\n      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? el.clientWidth : 1);\n      const end = Math.max(0, el.scrollWidth - el.clientWidth);\n      const next = Math.max(0, Math.min(end, el.scrollLeft + delta));\n      if (Math.abs(next - el.scrollLeft) < .5) return;\n      event.preventDefault(); event.stopPropagation(); el.scrollLeft = next;\n    };\n    el.addEventListener('scroll', update, { passive: true });\n    el.addEventListener('wheel', wheel, { passive: false });\n    const observer = win?.ResizeObserver ? new win.ResizeObserver(update) : null;\n    observer?.observe(el); observer?.observe(content);\n    win?.addEventListener('resize', update); update();\n    return () => {\n      el.removeEventListener('scroll', update); el.removeEventListener('wheel', wheel);\n      observer?.disconnect(); win?.removeEventListener('resize', update);\n    };\n  }, []);\n  const move = (direction: number) => {\n    const el = viewport.current;\n    if (el) el.scrollBy({ left: direction * Math.max(120, el.clientWidth * .75), behavior: 'smooth' });\n  };\n  return <div className=\"mly-filter-panel\">\n    <style>{filterPanelCss}</style>\n    {edges.overflow && <button type=\"button\" className=\"mly-filter-nav\" aria-label=\"Scroll filters left\" aria-controls={id} disabled={!edges.left} onClick={() => move(-1)}>\u2039</button>}\n    <div ref={viewport} id={id} className=\"mly-filter-scroll\" role=\"region\" aria-label=\"Mapillary filters\" tabIndex={0} onKeyDown={event => {\n      if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) return;\n      const el = event.currentTarget;\n      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); }\n      else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); el.scrollTo({ left: event.key === 'Home' ? 0 : el.scrollWidth, behavior: 'smooth' }); }\n    }}><div ref={row} className=\"mly-filter-row\">{children}</div></div>\n    {edges.overflow && <button type=\"button\" className=\"mly-filter-nav\" aria-label=\"Scroll filters right\" aria-controls={id} disabled={!edges.right} onClick={() => move(1)}>\u203a</button>}\n  </div>;\n};\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'green-filter-panel-';

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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-green-filter-panel.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
      conflict(entry.file + ' (edited organization filter references remain)');
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
    console.log(uninstall ? 'Green filter panel is already uninstalled. No files changed.' : 'Green filter panel is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'green-filter-panel', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Green filter panel ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. The green filter row supports desktop arrows, mouse-wheel scrolling and keyboard navigation; phones keep native touch swiping. Travel, Size, date and category controls share a common height.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
