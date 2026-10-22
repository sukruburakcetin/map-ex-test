#!/usr/bin/env node
'use strict';
/** Elevation profile layout and playback rendering fix. Plain source payload.
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
      "file": "src/features/elevation/profileIndicator.ts",
      "blocks": [
        {
          "label": "src/features/elevation/profileIndicator.ts layout and playback fix 1",
          "before": "  private native: HTMLElement | null = null;\n  private nativeDisplay = '';\n  private svg: SVGSVGElement | null = null;\n  private frameLabel: HTMLDivElement | null = null;\n  private inspectLabel: HTMLDivElement | null = null;\n  private frameLine: SVGLineElement | null = null;\n",
          "after": "  private native: HTMLElement | null = null;\n  private nativeDisplay = '';\n  private main: HTMLElement | null = null;\n  private mainHeight = '';\n  private mainHeightPriority = '';\n  private svg: SVGSVGElement | null = null;\n  private frameLabel: HTMLDivElement | null = null;\n  private loadingLabel: HTMLDivElement | null = null;\n  private inspectLabel: HTMLDivElement | null = null;\n  private frameLine: SVGLineElement | null = null;\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts layout and playback fix 2",
          "before": "  private resize: ResizeObserver | null = null;\n  private raf: number | null = null;\n  private disposed = false;\n  private frame: FramePosition | null = null;\n",
          "after": "  private resize: ResizeObserver | null = null;\n  private raf: number | null = null;\n  private refreshTimer: number | null = null;\n  private lastRender = -Infinity;\n  private disposed = false;\n  private frame: FramePosition | null = null;\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts layout and playback fix 3",
          "before": "  private start = 0;\n  private end: number;\n  private readonly height = 240;\n  private readonly left = 50;\n  private readonly top = 12;\n",
          "after": "  private start = 0;\n  private end: number;\n  private readonly height = 200;\n  private readonly left = 50;\n  private readonly top = 12;\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts layout and playback fix 4",
          "before": "    const win = this.root.ownerDocument.defaultView;\n    if (!win) return;\n    this.observer = new win.MutationObserver(records => {\n      if (records.some(record => !this.host?.contains(record.target))) this.refresh();\n    });\n    this.observer.observe(this.root, { childList: true, subtree: true });\n",
          "after": "    const win = this.root.ownerDocument.defaultView;\n    if (!win) return;\n    this.observer = new win.MutationObserver(() => {\n      // SDK legend/status updates do not change profile geometry. Remount only\n      // if its chart node was replaced; sample changes have their own watch.\n      if (!this.host?.isConnected || !this.native?.isConnected) this.refresh();\n    });\n    this.observer.observe(this.root, { childList: true, subtree: true });\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts layout and playback fix 5",
          "before": "    this.restoreNative(); this.host?.remove(); this.resize?.disconnect();\n    this.native = native; this.nativeDisplay = native.style.display; native.style.display = 'none';\n    const doc = native.ownerDocument, host = doc.createElement('div'); this.host = host;\n    host.className = 'mly-profile-frame-chart';\n    Object.assign(host.style, { padding: '4px 12px 0', boxSizing: 'border-box', width: '100%' });\n    const label = doc.createElement('div'); this.frameLabel = label;\n    Object.assign(label.style, { fontSize: '11px', fontWeight: '600', minHeight: '32px', color: 'inherit' });\n    const controls = doc.createElement('div');\n    Object.assign(controls.style, { display: 'flex', gap: '4px', justifyContent: 'flex-end' });\n    for (const [text, title, action] of [\n      ['\u2212', 'Zoom out along the sequence', () => this.zoom(2)],\n",
          "after": "    this.restoreNative(); this.host?.remove(); this.resize?.disconnect();\n    this.native = native; this.nativeDisplay = native.style.display; native.style.display = 'none';\n    // ArcGIS fixes this flex wrapper at --chart-height (180px). The custom\n    // label, controls, chart and inspection text must all participate in flow.\n    this.main = native.closest<HTMLElement>('.esri-elevation-profile__main-container');\n    if (this.main) {\n      this.mainHeight = this.main.style.getPropertyValue('height');\n      this.mainHeightPriority = this.main.style.getPropertyPriority('height');\n      this.main.style.setProperty('height', 'auto', 'important');\n    }\n    const doc = native.ownerDocument, host = doc.createElement('div'); this.host = host;\n    host.className = 'mly-profile-frame-chart';\n    Object.assign(host.style, { padding: '4px 8px 0', boxSizing: 'border-box', width: '100%', minWidth: '0', flex: '0 0 auto' });\n    const label = doc.createElement('div'); this.frameLabel = label;\n    Object.assign(label.style, { fontSize: '11px', fontWeight: '600', minHeight: '30px', lineHeight: '1.35', marginBottom: '4px', overflowWrap: 'anywhere', color: 'inherit' });\n    const loading = doc.createElement('div'); this.loadingLabel = loading;\n    Object.assign(loading.style, { fontSize: '10px', lineHeight: '1.3', minHeight: '14px', opacity: '0.8' });\n    loading.textContent = this.widget.viewModel.progress < 1 ? 'Sampling elevations\u2026' : '';\n    const controls = doc.createElement('div');\n    Object.assign(controls.style, { display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'flex-end', marginBottom: '4px' });\n    for (const [text, title, action] of [\n      ['\u2212', 'Zoom out along the sequence', () => this.zoom(2)],\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts layout and playback fix 6",
          "before": "      const button = doc.createElement('button'); button.type = 'button'; button.textContent = text; button.title = title;\n      button.setAttribute('aria-label', title);\n      Object.assign(button.style, { fontSize: '10px', padding: '2px 5px', cursor: 'pointer', background: 'transparent', color: 'inherit', border: '1px solid #aaa', borderRadius: '3px' });\n      button.addEventListener('click', action); controls.appendChild(button);\n    }\n",
          "after": "      const button = doc.createElement('button'); button.type = 'button'; button.textContent = text; button.title = title;\n      button.setAttribute('aria-label', title);\n      Object.assign(button.style, { fontSize: '10px', fontFamily: 'inherit', lineHeight: '1.1', minHeight: '24px', padding: '2px 5px', cursor: 'pointer', background: 'transparent', color: 'inherit', border: '1px solid #aaa', borderRadius: '3px' });\n      button.addEventListener('click', action); controls.appendChild(button);\n    }\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts layout and playback fix 7",
          "before": "    svg.setAttribute('width', '100%'); svg.setAttribute('height', String(this.height));\n    svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Sequence elevation in metres. Dashed blue line marks the confirmed current image.');\n    svg.style.display = 'block'; svg.style.overflow = 'hidden';\n    svg.addEventListener('pointermove', this.inspect);\n    svg.addEventListener('pointerleave', this.clearInspection);\n    const inspect = doc.createElement('div'); this.inspectLabel = inspect;\n    Object.assign(inspect.style, { fontSize: '10px', minHeight: '26px', opacity: '0.85' });\n    inspect.textContent = 'Move over the chart to inspect sampled elevations.';\n    host.append(label, controls, svg, inspect); native.before(host);\n    const win = doc.defaultView;\n    if (win?.ResizeObserver) {\n      this.resize = new win.ResizeObserver(() => this.refresh()); this.resize.observe(host);\n    }\n  }\n  /** Frame movement only touches text and one SVG line, never re-queries profiles. */\n  setFrame(id: string | null): void {\n    this.frame = id ? this.index.frames.get(String(id)) || null : null;\n    this.updateFrame();\n  }\n  refresh = (): void => {\n    if (this.disposed || this.raf !== null || !this.root) return;\n    const win = this.root.ownerDocument.defaultView; if (!win) return;\n    this.raf = win.requestAnimationFrame(() => { this.raf = null; this.mount(); this.render(); });\n  };\n  private lines(): ProfileLine[] { return this.widget.profiles.toArray().filter(line => line.visible); }\n  private render(): void {\n    if (!this.svg || !this.host || this.disposed) return;\n    const measured = this.svg.getBoundingClientRect().width;\n    if (measured <= this.left + this.right) return;\n    this.width = measured; this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);\n    const plotWidth = this.width - this.left - this.right, plotHeight = this.height - this.top - this.bottom;\n    const lines = this.lines(); let min = Infinity, max = -Infinity;\n    for (const line of lines) for (const sample of line.samples || []) {\n      if (typeof sample.elevation === 'number' && Number.isFinite(sample.elevation)) { min = Math.min(min, sample.elevation); max = Math.max(max, sample.elevation); }\n",
          "after": "    svg.setAttribute('width', '100%'); svg.setAttribute('height', String(this.height));\n    svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Sequence elevation in metres. Dashed blue line marks the confirmed current image.');\n    svg.setAttribute('preserveAspectRatio', 'none');\n    Object.assign(svg.style, { display: 'block', width: '100%', height: `${this.height}px`, minHeight: `${this.height}px`, flex: `0 0 ${this.height}px`, overflow: 'hidden' });\n    svg.addEventListener('pointermove', this.inspect);\n    svg.addEventListener('pointerleave', this.clearInspection);\n    const inspect = doc.createElement('div'); this.inspectLabel = inspect;\n    Object.assign(inspect.style, { fontSize: '10px', lineHeight: '1.35', minHeight: '26px', paddingTop: '4px', overflowWrap: 'anywhere', opacity: '0.85' });\n    inspect.textContent = 'Move over the chart to inspect sampled elevations.';\n    host.append(label, loading, controls, svg, inspect); native.before(host);\n    const win = doc.defaultView;\n    if (win?.ResizeObserver) {\n      this.resize = new win.ResizeObserver(() => {\n        if (this.svg && this.svg.clientWidth > 0 && this.svg.clientWidth !== this.width) this.refresh();\n      });\n      this.resize.observe(svg);\n    }\n  }\n  /** Frame movement only touches text and one SVG line, never re-queries profiles. */\n  setFrame(id: string | null): void {\n    const next = id ? this.index.frames.get(String(id)) || null : null;\n    if (this.frame === next) return;\n    this.frame = next; this.updateFrame();\n  }\n  refresh = (): void => {\n    if (this.disposed || this.raf !== null || this.refreshTimer !== null || !this.root) return;\n    const win = this.root.ownerDocument.defaultView; if (!win) return;\n    const schedule = () => {\n      this.refreshTimer = null;\n      if (this.disposed) return;\n      this.raf = win.requestAnimationFrame(() => {\n        this.raf = null; this.lastRender = win.performance.now(); this.mount(); this.render();\n      });\n    };\n    // Profile refinement can arrive in many chunks. Bound full redraws to 10 Hz;\n    // confirmed-frame text/needle changes remain immediate and bypass this queue.\n    const wait = Math.max(0, 100 - (win.performance.now() - this.lastRender));\n    if (wait > 0) this.refreshTimer = win.setTimeout(schedule, wait);\n    else schedule();\n  };\n  private lines(): ProfileLine[] { return this.widget.profiles.toArray().filter(line => line.visible); }\n  private render(): void {\n    if (!this.svg || !this.host || this.disposed) return;\n    // SVG viewBox coordinates use local CSS pixels, not transformed screen pixels.\n    const measured = this.svg.clientWidth || this.svg.getBoundingClientRect().width;\n    if (measured <= this.left + this.right) return;\n    this.width = measured; this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);\n    const plotWidth = this.width - this.left - this.right, plotHeight = this.height - this.top - this.bottom;\n    const lines = this.lines(); let min = Infinity, max = -Infinity;\n    if (this.loadingLabel) this.loadingLabel.textContent = this.widget.viewModel.progress < 1 ? 'Sampling elevations\u2026' : '';\n    for (const line of lines) for (const sample of line.samples || []) {\n      if (typeof sample.elevation === 'number' && Number.isFinite(sample.elevation)) { min = Math.min(min, sample.elevation); max = Math.max(max, sample.elevation); }\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts layout and playback fix 8",
          "before": "      const node = this.svg!.ownerDocument.createElementNS(svgNS, tag);\n      for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));\n      if (text !== undefined) node.textContent = text; children.push(node); return node;\n    };\n    for (let i = 0; i <= 4; i++) {\n",
          "after": "      const node = this.svg!.ownerDocument.createElementNS(svgNS, tag);\n      for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));\n      if (text !== undefined) { node.textContent = text; node.style.fontSize = '10px'; node.style.fontFamily = 'inherit'; }\n      children.push(node); return node;\n    };\n    for (let i = 0; i <= 4; i++) {\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts layout and playback fix 9",
          "before": "      element('line', { x1: this.left, x2: this.width - this.right, y1: y, y2: y, stroke: '#aaa', 'stroke-opacity': 0.2 });\n      element('text', { x: this.left - 6, y: y + 3, 'text-anchor': 'end', 'font-size': 10, fill: 'currentColor' }, available ? `${Math.round(max - i / 4 * (max - min))} m` : '');\n      const x = this.left + i / 4 * plotWidth, distance = this.start + i / 4 * (this.end - this.start);\n      element('text', { x, y: this.height - 8, 'text-anchor': i === 4 ? 'end' : i === 0 ? 'start' : 'middle', 'font-size': 10, fill: 'currentColor' }, this.index.total >= 1000 ? `${(distance / 1000).toFixed(1)} km` : `${Math.round(distance)} m`);\n    }\n    for (const line of lines) {\n",
          "after": "      element('line', { x1: this.left, x2: this.width - this.right, y1: y, y2: y, stroke: '#aaa', 'stroke-opacity': 0.2 });\n      element('text', { x: this.left - 6, y: y + 3, 'text-anchor': 'end', 'font-size': 10, fill: 'currentColor' }, available ? `${Math.round(max - i / 4 * (max - min))} m` : '');\n      const tickStride = plotWidth < 180 ? 4 : plotWidth < 360 ? 2 : 1;\n      if (i % tickStride === 0) {\n        const x = this.left + i / 4 * plotWidth, distance = this.start + i / 4 * (this.end - this.start);\n        element('text', { x, y: this.height - 8, 'text-anchor': i === 4 ? 'end' : i === 0 ? 'start' : 'middle', 'font-size': 10, fill: 'currentColor' }, this.index.total >= 1000 ? `${(distance / 1000).toFixed(1)} km` : `${Math.round(distance)} m`);\n      }\n    }\n    for (const line of lines) {\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts layout and playback fix 10",
          "before": "    const span = this.end - this.start; this.start = Math.max(0, Math.min(this.index.total - span, this.start + span * factor)); this.end = this.start + span; this.render();\n  }\n  private restoreNative(): void { if (this.native) this.native.style.display = this.nativeDisplay; }\n  dispose(): void {\n    this.disposed = true; this.observer?.disconnect(); this.resize?.disconnect();\n    if (this.raf !== null) this.root?.ownerDocument.defaultView?.cancelAnimationFrame(this.raf);\n    this.raf = null; this.host?.remove(); this.restoreNative(); this.host = null; this.root = null;\n  }\n}\n",
          "after": "    const span = this.end - this.start; this.start = Math.max(0, Math.min(this.index.total - span, this.start + span * factor)); this.end = this.start + span; this.render();\n  }\n  private restoreNative(): void {\n    if (this.native) this.native.style.display = this.nativeDisplay;\n    if (this.main?.style.getPropertyValue('height') === 'auto' && this.main.style.getPropertyPriority('height') === 'important') {\n      if (this.mainHeight) this.main.style.setProperty('height', this.mainHeight, this.mainHeightPriority);\n      else this.main.style.removeProperty('height');\n    }\n    this.main = null;\n  }\n  dispose(): void {\n    this.disposed = true; this.observer?.disconnect(); this.resize?.disconnect();\n    if (this.raf !== null) this.root?.ownerDocument.defaultView?.cancelAnimationFrame(this.raf);\n    if (this.refreshTimer !== null) this.root?.ownerDocument.defaultView?.clearTimeout(this.refreshTimer);\n    this.raf = null; this.refreshTimer = null; this.host?.remove(); this.restoreNative(); this.host = null; this.root = null;\n  }\n}\n"
        }
      ],
      "absentAfterUninstall": [
        "refreshTimer",
        "mainHeightPriority",
        "loadingLabel"
      ],
      "requiredOccurrences": [
        {
          "text": "refreshTimer",
          "count": 7
        },
        {
          "text": "mainHeightPriority",
          "count": 3
        },
        {
          "text": "loadingLabel",
          "count": 4
        }
      ]
    },
    {
      "file": "src/features/elevation/ElevationProfileController.ts",
      "blocks": [
        {
          "label": "src/features/elevation/ElevationProfileController.ts layout and playback fix 1",
          "before": "      if (view.type === '3d') profiles.push({ type: 'view', title: '3D Infrastructure', color: '#3498db', viewVisualizationEnabled: false });\n      this.widget = new ElevationProfile({ view, profiles, input: inputGraphic, unit: 'meters', unitOptions: ['meters'],\n        visibleElements: { selectButton: false, sketchButton: false, settingsButton: false, clearButton: false, uniformChartScalingToggle: false } });\n      this.widget!.viewModel.hoveredChartPosition = null;\n      this.images = snapshot; this.pendingImages = null;\n",
          "after": "      if (view.type === '3d') profiles.push({ type: 'view', title: '3D Infrastructure', color: '#3498db', viewVisualizationEnabled: false });\n      this.widget = new ElevationProfile({ view, profiles, input: inputGraphic, unit: 'meters', unitOptions: ['meters'],\n        visibleElements: { chart: false, selectButton: false, sketchButton: false, settingsButton: false, clearButton: false, uniformChartScalingToggle: false } });\n      this.widget!.viewModel.hoveredChartPosition = null;\n      this.images = snapshot; this.pendingImages = null;\n"
        }
      ],
      "absentAfterUninstall": [],
      "requiredOccurrences": []
    },
    {
      "file": "src/features/elevation/README.md",
      "blocks": [
        {
          "label": "src/features/elevation/README.md layout and playback fix 1",
          "before": "Only confirmed viewer image events may drive the current-image line. An optimistic selection, missing frame, or mismatching route/viewer hides the line. A separate grey line and \u201cInspecting profile\u201d text show interpolated sample values under the pointer. Inspection neither changes imagery nor navigates the map. ArcGIS's sample-snapped map visualizations are disabled, leaving the existing green active-image marker authoritative.\n\nThe SDK still owns terrain queries, loading progress, profile visibility switches and statistics. Its native chart is hidden while this renderer is attached and restored during cleanup. The renderer does not use private chart internals, arbitrary SVG paths, screenshot readback or predicted frames. Sample rendering preserves missing-data gaps and bounds SVG complexity by chart width.\n\nRoute replacement and view transfer remove the old chart, watch, widget and fallback terrain source. The controller removes widgets from their creating view. The elevation profile never changes the visible map's Ground; the independent 3D-terrain setting owns optional scene terrain.\n",
          "after": "Only confirmed viewer image events may drive the current-image line. An optimistic selection, missing frame, or mismatching route/viewer hides the line. A separate grey line and \u201cInspecting profile\u201d text show interpolated sample values under the pointer. Inspection neither changes imagery nor navigates the map. ArcGIS's sample-snapped map visualizations are disabled, leaving the existing green active-image marker authoritative.\n\nThe SDK still owns terrain queries, loading progress, profile visibility switches and statistics. Its native chart is disabled through `visibleElements.chart: false` so a second chart is never initialized. The renderer expands the SDK main wrapper to its content height and restores that local layout override during cleanup. Distance ticks adapt to panel width. Frame changes do not rebuild paths; sample refinement redraws are coalesced to at most 10 Hz. Resize handling ignores height-only changes, and SDK status/legend DOM mutations do not invalidate chart geometry. The renderer does not use private chart internals, arbitrary SVG paths, screenshot readback or predicted frames. Sample rendering preserves missing-data gaps and bounds SVG complexity by chart width.\n\nRoute replacement and view transfer remove the old chart, watch, widget and fallback terrain source. The controller removes widgets from their creating view. The elevation profile never changes the visible map's Ground; the independent 3D-terrain setting owns optional scene terrain.\n"
        }
      ],
      "absentAfterUninstall": [],
      "requiredOccurrences": []
    }
  ],
  "modules": []
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'profile-layout-performance-fix-';

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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-profile-layout-performance-fix.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
    console.log(uninstall ? 'Profile layout and playback fix is already uninstalled. No files changed.' : 'Profile layout and playback fix is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'profile-layout-performance-fix', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Profile layout and playback fix ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. Recheck the elevation profile and sequence playback. The legend follows the chart in normal flow; ordinary frame changes do not rebuild chart paths.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
