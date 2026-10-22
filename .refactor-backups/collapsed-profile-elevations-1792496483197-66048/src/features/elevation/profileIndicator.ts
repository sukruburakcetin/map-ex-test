import { axisPixel, sampledElevation, sampledPath } from './profileTracking';
import { useFlowProfile } from './ProfileFlowDock';
import type { FrameDistanceIndex, FramePosition, ProfileSample } from './profileTracking';
export type { ElevationIndicatorImage } from './profileTracking';
export interface ProfileLine {
  title?: string | null;
  visible: boolean;
  color: { toCss(): string };
  samples?: readonly ProfileSample[] | null;
}
export interface ElevationIndicatorWidget {
  container?: HTMLElement | string | null;
  profiles: { toArray(): ProfileLine[] };
  viewModel: { progress: number; hoveredChartPosition: number | null | undefined };
}
const svgNS = 'http://www.w3.org/2000/svg';
let mobileProfileId = 0;
export interface ProfileMobileLayout {
  container: HTMLElement | null;
  getDock(): HTMLElement | null;
  getExpanded(): boolean;
  setExpanded(expanded: boolean): void;
  move(mobile: boolean): void;
}
const mobileProfileCss = `
.mly-profile-header, .mly-profile-summary, .mly-profile-mobile-altitudes, .mly-profile-mobile-toolbar, .mly-profile-mobile-layers { display: none; }
/* The flow wrapper belongs to React, so SDK class/style updates cannot reset it. */
.mly-profile-flow-dock > *,
.mly-profile-flow-dock .esri-elevation-profile,
.mly-profile-flow-dock .esri-elevation-profile.esri-component.esri-widget--panel {
  position: relative !important; inset: auto !important; width: 100% !important; max-width: 100% !important;
  margin: 0 !important; padding: 0 !important; max-height: none !important; height: auto !important;
  box-sizing: border-box; overflow: hidden; box-shadow: none;
}
.mly-profile-flow-dock .esri-elevation-profile__main-container { height: auto !important; }
.mly-profile-flow-dock .esri-elevation-profile__header,
.mly-profile-flow-dock .esri-elevation-profile-legend { display: none !important; }
.mly-profile-frame-chart.mly-profile-mobile { padding: 0 !important; display: flex; flex-direction: column; min-height: 0; max-height: var(--mly-profile-max-height); overflow: hidden; }
.mly-profile-mobile .mly-profile-header { display: flex; align-items: center; min-height: 44px; flex: 0 0 44px; min-width: 0; }
.mly-profile-mobile .mly-profile-summary { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-width: 0; min-height: 44px; flex: 1 1 0; padding: 0 8px; border: 0; background: transparent; color: inherit; font-size: 11px; font-weight: 600; line-height: 1.3; font-family: inherit; cursor: pointer; text-align: start; }
.mly-profile-mobile:not(.mly-profile-collapsed) .mly-profile-summary span:first-child { white-space: normal; }
.mly-profile-summary span:first-child { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mly-profile-mobile .mly-profile-body { display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 0 6px; }
.mly-profile-mobile.mly-profile-collapsed .mly-profile-body { display: none; }
.mly-profile-mobile .mly-profile-frame-label, .mly-profile-mobile .mly-profile-desktop-controls { display: none !important; }
.mly-profile-mobile .mly-profile-mobile-altitudes { display: flex; flex-wrap: wrap; gap: 4px 10px; min-height: 28px; align-items: center; padding: 4px; font-size: 11px; line-height: 1.3; }
.mly-profile-mobile .mly-profile-loading:empty { display: none; }
.mly-profile-mobile .mly-profile-loading { display: none; }
.mly-profile-mobile .mly-profile-summary[aria-busy="true"]::after { content: "…"; }
.mly-profile-plot { position: relative; flex: 0 0 auto; }
.mly-profile-mobile .mly-profile-inspection { position: absolute; left: 48px; right: 4px; bottom: 22px; min-height: 0 !important; max-height: 40px; overflow: auto; padding: 2px 4px !important; font-size: 10px !important; background: var(--calcite-color-foreground-1, #faf8f8); opacity: .95 !important; pointer-events: none; }
.mly-profile-mobile .mly-profile-inspection:empty { display: none; }
.mly-profile-mobile .mly-profile-mobile-toolbar { display: flex; align-items: center; gap: 0; height: 44px; flex: 0 0 auto; }
.mly-profile-mobile.mly-profile-collapsed .mly-profile-mobile-toolbar { display: none; }
.mly-profile-mobile-toolbar button { display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; width: 44px; height: 44px; min-width: 44px; min-height: 44px; padding: 0; color: inherit; background: transparent; border: 0; border-radius: 4px; font: inherit; font-size: 18px; line-height: 1; cursor: pointer; }
.mly-profile-mobile-toolbar button:hover, .mly-profile-mobile-toolbar button[aria-expanded="true"] { background: rgba(127,127,127,.12); }
.mly-profile-mobile-toolbar button:focus-visible { outline: 2px solid #1684c4; outline-offset: -3px; }
.mly-profile-mobile-toolbar svg { width: 18px; height: 18px; pointer-events: none; }
.mly-profile-mobile .mly-profile-mobile-layers:not([hidden]) { display: block; flex: 0 0 auto; max-height: max(44px, calc(var(--mly-profile-max-height) - 44px)); overflow-y: auto; overscroll-behavior: contain; }
.mly-profile-mobile-layers label { display: flex; align-items: center; gap: 8px; min-height: 44px; box-sizing: border-box; padding: 6px 8px; font-size: 11px; line-height: 1.3; cursor: pointer; }
.mly-profile-mobile-layers input { width: 18px; height: 18px; flex-shrink: 0; margin: 0; }
`;
/** Own the distance axis instead of inferring it from SDK SVG/canvas internals.
 * The SDK still owns profile generation, progress UI, legend and statistics.
 * Native sampled map inspection is disabled: the existing active-image marker
 * remains the sole frame marker. Inspecting this chart never navigates the map.
 */
export class ProfileFrameChart {
  private host: HTMLDivElement | null = null;
  private native: HTMLElement | null = null;
  private nativeDisplay = '';
  private main: HTMLElement | null = null;
  private mainHeight = '';
  private mainHeightPriority = '';
  private svg: SVGSVGElement | null = null;
  private frameLabel: HTMLDivElement | null = null;
  private loadingLabel: HTMLDivElement | null = null;
  private inspectLabel: HTMLDivElement | null = null;
  private frameLine: SVGLineElement | null = null;
  private inspectionLine: SVGLineElement | null = null;
  private observer: MutationObserver | null = null;
  private resize: ResizeObserver | null = null;
  private raf: number | null = null;
  private refreshTimer: number | null = null;
  private lastRender = -Infinity;
  private disposed = false;
  private frame: FramePosition | null = null;
  private width = 440;
  private start = 0;
  private end: number;
  private height = 200;
  private mobile = false;
  private mobileExpanded = false;
  private mobileSummary: HTMLSpanElement | null = null;
  private summaryButton: HTMLButtonElement | null = null;
  private mobileAltitudes: HTMLDivElement | null = null;
  private mobileResize: ResizeObserver | null = null;
  private dockResize: ResizeObserver | null = null;
  private observedDockParent: HTMLElement | null = null;
  private readonly layerChecks = new Map<ProfileLine, HTMLInputElement>();
  private readonly left = 50;
  private readonly top = 12;
  private readonly bottom = 30;
  private readonly right = 12;
  private root: HTMLElement | null = null;
  private readonly cameraLines: ProfileLine[];
  constructor(private readonly widget: ElevationIndicatorWidget, private readonly index: FrameDistanceIndex, private readonly layout?: ProfileMobileLayout) {
    this.end = index.total;
    this.cameraLines = ([
      ['computedAltitude', 'Computed camera altitude', '#f39c12'],
      ['reportedAltitude', 'Reported camera altitude', '#a855f7'],
    ] as const).map(([field, title, color]) => ({ title, visible: true, color: { toCss: () => color },
      samples: [...index.frames.values()].map(frame => ({ distance: frame.distance, elevation: frame[field] ?? null })),
    })).filter(line => line.samples.some(sample => sample.elevation !== null));
    const container = widget.container;
    this.root = typeof container === 'string' ? document.getElementById(container) : container || null;
    if (!this.root) return;
    const win = this.root.ownerDocument.defaultView;
    if (!win) return;
    this.observer = new win.MutationObserver(() => {
      // SDK legend/status updates do not change profile geometry. Remount only
      // if its chart node was replaced; sample changes have their own watch.
      if (!this.host || !this.root?.contains(this.host) || !this.native || !this.root.contains(this.native)) this.refresh();
    });
    this.observer.observe(this.root, { childList: true, subtree: true });
    this.mobileExpanded = this.layout?.getExpanded() ?? false;
    if (this.layout?.container && win.ResizeObserver) {
      this.mobileResize = new win.ResizeObserver(this.updateResponsive);
      this.mobileResize.observe(this.layout.container);
    }
    if (win.ResizeObserver) this.dockResize = new win.ResizeObserver(this.updateResponsive);
    win.addEventListener('resize', this.updateResponsive);
    this.mount(); this.refresh();
  }
  private mount(): void {
    if (!this.root || this.disposed) return;
    const native = this.root.querySelector<HTMLElement>('.esri-elevation-profile__chart-container');
    if (!native) return;
    if (this.host && this.root.contains(this.host) && this.native === native) return;
    this.restoreNative(); this.host?.remove(); this.resize?.disconnect();
    this.native = native; this.nativeDisplay = native.style.display; native.style.display = 'none';
    // ArcGIS fixes this flex wrapper at --chart-height (180px). The custom
    // label, controls, chart and inspection text must all participate in flow.
    this.main = native.closest<HTMLElement>('.esri-elevation-profile__main-container');
    if (this.main) {
      this.mainHeight = this.main.style.getPropertyValue('height');
      this.mainHeightPriority = this.main.style.getPropertyPriority('height');
      this.main.style.setProperty('height', 'auto', 'important');
    }
    const doc = native.ownerDocument, host = doc.createElement('div'); this.host = host;
    host.className = 'mly-profile-frame-chart';
    Object.assign(host.style, { padding: '4px 8px 0', boxSizing: 'border-box', width: '100%', minWidth: '0', flex: '0 0 auto' });
    const style = doc.createElement('style'); style.textContent = mobileProfileCss;
    const summary = doc.createElement('button'); this.summaryButton = summary;
    summary.type = 'button'; summary.className = 'mly-profile-summary';
    summary.style.fontSize = '11px'; summary.style.fontWeight = '600';
    summary.setAttribute('aria-label', 'Expand or collapse elevation profile');
    const summaryText = doc.createElement('span'); this.mobileSummary = summaryText;
    const chevron = doc.createElement('span'); chevron.textContent = '⌃'; chevron.setAttribute('aria-hidden', 'true');
    summary.append(summaryText, chevron);
    summary.addEventListener('click', () => {
      this.mobileExpanded = !this.mobileExpanded; this.layout?.setExpanded(this.mobileExpanded);
      this.updateResponsive(); this.refresh();
    });
    const body = doc.createElement('div'); body.className = 'mly-profile-body'; body.id = `mly-profile-body-${++mobileProfileId}`;
    summary.setAttribute('aria-controls', body.id);
    const altitudes = doc.createElement('div'); altitudes.className = 'mly-profile-mobile-altitudes'; this.mobileAltitudes = altitudes;
    const header = doc.createElement('div'); header.className = 'mly-profile-header';
    header.appendChild(summary); host.append(style, header, body);
    const label = doc.createElement('div'); this.frameLabel = label;
    label.className = 'mly-profile-frame-label';
    Object.assign(label.style, { fontSize: '11px', fontWeight: '600', minHeight: '30px', lineHeight: '1.35', marginBottom: '4px', overflowWrap: 'anywhere', color: 'inherit' });
    const loading = doc.createElement('div'); this.loadingLabel = loading; loading.className = 'mly-profile-loading';
    Object.assign(loading.style, { fontSize: '10px', lineHeight: '1.3', minHeight: '14px', opacity: '0.8' });
    loading.textContent = this.widget.viewModel.progress < 1 ? 'Sampling elevations…' : '';
    const controls = doc.createElement('div'); controls.className = 'mly-profile-desktop-controls';
    Object.assign(controls.style, { display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'flex-end', marginBottom: '4px' });
    for (const [text, title, action] of [
      ['−', 'Zoom out along the sequence', () => this.zoom(2)],
      ['+', 'Zoom in along the sequence', () => this.zoom(0.5)],
      ['←', 'Show earlier sequence distance', () => this.pan(-0.25)],
      ['→', 'Show later sequence distance', () => this.pan(0.25)],
      ['Full sequence', 'Reset the chart distance axis', () => { this.start = 0; this.end = this.index.total; this.render(); }],
    ] as const) {
      const button = doc.createElement('button'); button.type = 'button'; button.textContent = text; button.title = title;
      button.setAttribute('aria-label', title);
      Object.assign(button.style, { fontSize: '10px', fontFamily: 'inherit', lineHeight: '1.1', minHeight: '24px', padding: '2px 5px', cursor: 'pointer', background: 'transparent', color: 'inherit', border: '1px solid #aaa', borderRadius: '3px' });
      button.addEventListener('click', action); controls.appendChild(button);
    }
    const svg = doc.createElementNS(svgNS, 'svg'); this.svg = svg;
    svg.setAttribute('width', '100%'); svg.setAttribute('height', String(this.height));
    svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Sequence elevation in metres. Dashed blue line marks the confirmed current image.');
    svg.setAttribute('preserveAspectRatio', 'none');
    Object.assign(svg.style, { display: 'block', width: '100%', height: `${this.height}px`, minHeight: `${this.height}px`, flex: `0 0 ${this.height}px`, overflow: 'hidden' });
    svg.addEventListener('pointermove', this.inspect);
    svg.addEventListener('pointerdown', event => { if (this.mobile) { event.stopPropagation(); this.inspect(event); } });
    svg.addEventListener('click', event => { if (this.mobile) event.stopPropagation(); });
    svg.style.touchAction = 'pan-y';
    svg.addEventListener('pointerleave', () => { if (!this.mobile) this.clearInspection(); });
    const inspect = doc.createElement('div'); this.inspectLabel = inspect; inspect.className = 'mly-profile-inspection';
    Object.assign(inspect.style, { fontSize: '10px', lineHeight: '1.35', minHeight: '26px', paddingTop: '4px', overflowWrap: 'anywhere', opacity: '0.85' });
    inspect.textContent = 'Move over the chart to inspect sampled elevations.';
    const plot = doc.createElement('div'); plot.className = 'mly-profile-plot'; plot.append(svg, inspect);
    body.append(label, loading, controls, plot);
    const cameraLegend = doc.createElement('div');
    cameraLegend.className = 'esri-elevation-profile-legend';
    for (const line of this.cameraLines) {
      const row = doc.createElement('label'); row.className = 'esri-elevation-profile-legend-item';
      Object.assign(row.style, { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', marginBottom: '3px', cursor: 'pointer', borderLeft: `3px solid ${line.color.toCss()}` });
      row.title = 'Mapillary camera-height estimate. Missing values are gaps; this is not a surveyed bridge-deck elevation.';
      const check = doc.createElement('input'); check.type = 'checkbox'; check.checked = line.visible;
      check.setAttribute('aria-label', line.title || 'Camera altitude');
      check.addEventListener('change', () => { line.visible = check.checked; this.refresh(); });
      const name = doc.createElement('span'); name.textContent = line.title || 'Camera altitude';
      Object.assign(name.style, { fontSize: '12px', lineHeight: '1.3' });
      row.append(check, name); cameraLegend.appendChild(row);
    }
    if (!this.cameraLines.length) {
      const unavailable = doc.createElement('div'); unavailable.textContent = 'Camera altitude unavailable in this sequence.';
      Object.assign(unavailable.style, { fontSize: '10px', lineHeight: '1.35', padding: '4px 0' }); cameraLegend.appendChild(unavailable);
    }
    body.appendChild(cameraLegend);
    const layers = doc.createElement('div'); layers.className = 'mly-profile-mobile-layers'; layers.hidden = true; layers.id = `${body.id}-layers`; layers.setAttribute('role', 'region'); layers.setAttribute('aria-label', 'Profile layers');
    layers.appendChild(altitudes);
    this.layerChecks.clear();
    for (const line of [...this.widget.profiles.toArray(), ...this.cameraLines]) {
      const row = doc.createElement('label'); row.style.borderLeft = `3px solid ${line.color.toCss()}`;
      const check = doc.createElement('input'); check.type = 'checkbox'; check.checked = line.visible;
      check.setAttribute('aria-label', line.title || 'Elevation layer');
      check.addEventListener('change', () => { line.visible = check.checked; this.refresh(); });
      const name = doc.createElement('span'); name.textContent = line.title || 'Elevation layer';
      row.append(check, name); layers.appendChild(row); this.layerChecks.set(line, check);
    }
    const toolbar = doc.createElement('div'); toolbar.className = 'mly-profile-mobile-toolbar';
    for (const [text, title, action] of [
      ['−', 'Zoom out along the sequence', () => this.zoom(2)],
      ['+', 'Zoom in along the sequence', () => this.zoom(0.5)],
      ['↺', 'Reset the chart distance axis', () => { this.start = 0; this.end = this.index.total; this.render(); }],
    ] as const) {
      const button = doc.createElement('button'); button.type = 'button'; button.textContent = text; button.title = title; button.setAttribute('aria-label', title);
      button.addEventListener('click', action); toolbar.appendChild(button);
    }
    const layerButton = doc.createElement('button'); layerButton.type = 'button';
    layerButton.title = 'Layers'; layerButton.setAttribute('aria-label', 'Layers');
    const layerIcon = doc.createElementNS(svgNS, 'svg'); layerIcon.setAttribute('viewBox', '0 0 24 24');
    layerIcon.setAttribute('aria-hidden', 'true'); layerIcon.setAttribute('focusable', 'false');
    const layerPath = doc.createElementNS(svgNS, 'path');
    layerPath.setAttribute('d', 'M12 3 3 8l9 5 9-5-9-5ZM3 12l9 5 9-5M3 16l9 5 9-5');
    layerPath.setAttribute('fill', 'none'); layerPath.setAttribute('stroke', 'currentColor');
    layerPath.setAttribute('stroke-width', '1.6'); layerPath.setAttribute('stroke-linejoin', 'round');
    layerIcon.appendChild(layerPath); layerButton.appendChild(layerIcon);
    layerButton.setAttribute('aria-expanded', 'false'); layerButton.setAttribute('aria-controls', layers.id);
    layerButton.addEventListener('click', () => {
      layers.hidden = !layers.hidden; layerButton.setAttribute('aria-expanded', String(!layers.hidden));
      // Scroll only the sheet body so opening Layers immediately reveals its
      // checkboxes without moving the map, viewer or document.
      body.scrollTop = layers.hidden ? 0 : body.scrollHeight;
    });
    toolbar.appendChild(layerButton); header.appendChild(toolbar); body.appendChild(layers); native.before(host);
    this.updateResponsive();
    const win = doc.defaultView;
    if (win?.ResizeObserver) {
      this.resize = new win.ResizeObserver(() => {
        if (this.svg && this.svg.clientWidth > 0 && this.svg.clientWidth !== this.width) this.refresh();
      });
      this.resize.observe(svg);
    }
  }
  /** Frame movement only touches text and one SVG line, never re-queries profiles. */
  setFrame(id: string | null): void {
    const next = id ? this.index.frames.get(String(id)) || null : null;
    if (this.frame === next) return;
    this.frame = next; this.updateFrame();
  }
  refresh = (): void => {
    if (this.disposed || this.raf !== null || this.refreshTimer !== null || !this.root) return;
    const win = this.root.ownerDocument.defaultView; if (!win) return;
    const schedule = () => {
      this.refreshTimer = null;
      if (this.disposed) return;
      this.raf = win.requestAnimationFrame(() => {
        this.raf = null; this.lastRender = win.performance.now(); this.mount(); this.render();
      });
    };
    // Profile refinement can arrive in many chunks. Bound full redraws to 10 Hz;
    // confirmed-frame text/needle changes remain immediate and bypass this queue.
    const wait = Math.max(0, 100 - (win.performance.now() - this.lastRender));
    if (wait > 0) this.refreshTimer = win.setTimeout(schedule, wait);
    else schedule();
  };
  private lines(): ProfileLine[] { return [...this.widget.profiles.toArray(), ...this.cameraLines].filter(line => line.visible); }
  private render(): void {
    if (!this.svg || !this.host || !this.root?.isConnected || this.disposed) return;
    for (const [line, check] of this.layerChecks) check.checked = line.visible;
    this.summaryButton?.setAttribute('aria-busy', String(this.widget.viewModel.progress < 1));
    if (this.mobile && !this.mobileExpanded) return;
    // SVG viewBox coordinates use local CSS pixels, not transformed screen pixels.
    const measured = this.svg.clientWidth || this.svg.getBoundingClientRect().width;
    if (measured <= this.left + this.right) return;
    this.width = measured; this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
    const plotWidth = this.width - this.left - this.right, plotHeight = this.height - this.top - this.bottom;
    const lines = this.lines(); let min = Infinity, max = -Infinity;
    if (this.loadingLabel) this.loadingLabel.textContent = this.widget.viewModel.progress < 1 ? 'Sampling elevations…' : '';
    for (const line of lines) for (const sample of line.samples || []) {
      if (typeof sample.elevation === 'number' && Number.isFinite(sample.elevation)) { min = Math.min(min, sample.elevation); max = Math.max(max, sample.elevation); }
    }
    const available = Number.isFinite(min) && Number.isFinite(max);
    if (!available) { min = 0; max = 1; }
    const pad = Math.max((max - min) * 0.08, 1); min -= pad; max += pad;
    const children: SVGElement[] = [];
    const element = <K extends keyof SVGElementTagNameMap>(tag: K, attributes: Record<string, string | number>, text?: string): SVGElementTagNameMap[K] => {
      const node = this.svg!.ownerDocument.createElementNS(svgNS, tag);
      for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
      if (text !== undefined) { node.textContent = text; node.style.fontSize = '10px'; node.style.fontFamily = 'inherit'; }
      children.push(node); return node;
    };
    for (let i = 0; i <= 4; i++) {
      const y = this.top + i / 4 * plotHeight;
      if (!this.mobile || i % 2 === 0) {
      element('line', { x1: this.left, x2: this.width - this.right, y1: y, y2: y, stroke: '#aaa', 'stroke-opacity': 0.2 });
      element('text', { x: this.left - 6, y: y + 3, 'text-anchor': 'end', 'font-size': 10, fill: 'currentColor' }, available ? `${Math.round(max - i / 4 * (max - min))} m` : '');
      }
      const tickStride = plotWidth < 180 ? 4 : plotWidth < 360 ? 2 : 1;
      if (i % tickStride === 0) {
        const x = this.left + i / 4 * plotWidth, distance = this.start + i / 4 * (this.end - this.start);
        element('text', { x, y: this.height - 8, 'text-anchor': i === 4 ? 'end' : i === 0 ? 'start' : 'middle', 'font-size': 10, fill: 'currentColor' }, this.index.total >= 1000 ? `${(distance / 1000).toFixed(1)} km` : `${Math.round(distance)} m`);
      }
    }
    for (const line of lines) {
      element('path', { d: sampledPath(line.samples || [], this.start, this.end, this.left, plotWidth, this.top, plotHeight, min, max), fill: 'none', stroke: line.color.toCss(), 'stroke-width': 2, 'stroke-linejoin': 'round' });
    }
    if (!available) element('text', { x: this.width / 2, y: this.height / 2, 'text-anchor': 'middle', 'font-size': 12, fill: 'currentColor' }, this.widget.viewModel.progress < 1 ? 'Sampling elevation…' : 'No elevation samples available');
    this.frameLine = element('line', { y1: this.top, y2: this.top + plotHeight, stroke: '#3498db', 'stroke-width': 1.5, 'stroke-dasharray': '5 4', 'pointer-events': 'none' });
    this.inspectionLine = element('line', { y1: this.top, y2: this.top + plotHeight, stroke: '#888', 'stroke-width': 1, 'pointer-events': 'none', visibility: 'hidden' });
    this.svg.replaceChildren(...children); this.clearInspection(); this.updateFrame();
  }
  private updateFrame(): void {
    const frame = this.frame;
    if (this.mobileSummary) this.mobileSummary.textContent = frame
      ? `${this.mobileExpanded ? 'Frame ' + frame.ordinal.toLocaleString() : 'Profile · Frame ' + frame.ordinal.toLocaleString() + '/' + this.index.images.length.toLocaleString()} · ${frame.distance >= 1000 ? (frame.distance / 1000).toFixed(2) + ' km' : Math.round(frame.distance) + ' m'}`
      : 'Profile · Waiting for current image';
    if (this.mobileAltitudes && this.mobile && this.mobileExpanded) {
      const chips: HTMLSpanElement[] = [];
      if (frame) for (const [name, value, color, fullName] of [
        ['Computed', frame.computedAltitude, '#9a5800', 'Computed camera altitude'],
        ['Reported', frame.reportedAltitude, '#8b46b2', 'Reported camera altitude'],
      ] as const) {
        if (value === undefined) continue;
        const chip = this.mobileAltitudes.ownerDocument.createElement('span'); chip.style.color = color;
        chip.textContent = `${name}: ${value.toFixed(1)} m`; chip.title = fullName; chips.push(chip);
      }
      this.mobileAltitudes.replaceChildren(...chips);
      if (!chips.length) this.mobileAltitudes.textContent = 'Camera altitude unavailable';
    }
    if (this.frameLabel) {
      this.frameLabel.textContent = frame
        ? `Current image · Frame ${frame.ordinal.toLocaleString()}/${this.index.images.length.toLocaleString()} · ${Math.round(frame.distance).toLocaleString()} m${frame.computedAltitude !== undefined ? ` · Computed camera altitude ${frame.computedAltitude.toFixed(1)} m` : ''}${frame.reportedAltitude !== undefined ? ` · Reported camera altitude ${frame.reportedAltitude.toFixed(1)} m` : ''}${frame.computedAltitude === undefined && frame.reportedAltitude === undefined ? ' · Camera altitude unavailable' : ''}`
        : 'Waiting for a confirmed image in this profile…';
      this.frameLabel.title = frame ? `Current Mapillary image ID: ${frame.id}` : '';
    }
    if (this.host) { if (frame) this.host.dataset.imageId = frame.id; else delete this.host.dataset.imageId; }
    if (!this.frameLine) return;
    const x = frame ? axisPixel(frame.distance, this.start, this.end, this.left, this.width - this.left - this.right) : null;
    this.frameLine.setAttribute('visibility', x === null ? 'hidden' : 'visible');
    if (x !== null) { this.frameLine.setAttribute('x1', String(x)); this.frameLine.setAttribute('x2', String(x)); }
    else if (frame && this.frameLabel) this.frameLabel.textContent += ' · outside chart view';
  }
  private inspect = (event: PointerEvent): void => {
    if (!this.svg || !this.inspectionLine || !this.inspectLabel) return;
    const rect = this.svg.getBoundingClientRect(); if (!rect.width) return;
    const x = (event.clientX - rect.left) / rect.width * this.width;
    if (x < this.left || x > this.width - this.right) { this.clearInspection(); return; }
    const distance = this.start + (x - this.left) / (this.width - this.left - this.right) * (this.end - this.start);
    this.inspectionLine.setAttribute('x1', String(x)); this.inspectionLine.setAttribute('x2', String(x)); this.inspectionLine.setAttribute('visibility', 'visible');
    this.inspectLabel.textContent = `Inspecting profile · ${Math.round(distance).toLocaleString()} m · ` + this.lines().map(line => {
      const elevation = sampledElevation(line.samples || [], distance);
      return `${line.title || 'Elevation'}: ${elevation === null ? 'no data' : elevation.toFixed(1) + ' m'}`;
    }).join(' · ');
  };
  private clearInspection = (): void => {
    this.inspectionLine?.setAttribute('visibility', 'hidden');
    if (this.inspectLabel) this.inspectLabel.textContent = this.mobile ? '' : 'Move over the chart to inspect sampled elevations.';
  };
  private zoom(factor: number): void {
    const span = Math.min(this.index.total, Math.max(Math.min(10, this.index.total), (this.end - this.start) * factor));
    const center = this.frame && this.frame.distance >= this.start && this.frame.distance <= this.end ? this.frame.distance : (this.start + this.end) / 2;
    this.start = Math.max(0, Math.min(center - span / 2, this.index.total - span)); this.end = this.start + span; this.render();
  }
  private pan(factor: number): void {
    const span = this.end - this.start; this.start = Math.max(0, Math.min(this.index.total - span, this.start + span * factor)); this.end = this.start + span; this.render();
  }
  /** React calls this when the normal-mode flow host mounts or disappears. */
  refreshLayout(): void { this.updateResponsive(); this.refresh(); }
  private updateResponsive = (): void => {
    if (!this.root || !this.host || this.disposed) return;
    const win = this.root.ownerDocument.defaultView; if (!win) return;
    const map = this.layout?.container;
    const dockParent = this.layout?.getDock()?.parentElement || null;
    if (dockParent !== this.observedDockParent) {
      this.dockResize?.disconnect(); this.observedDockParent = dockParent;
      if (dockParent) this.dockResize?.observe(dockParent);
    }
    const mobile = useFlowProfile(map || null, this.layout?.getDock() || null, win);
    this.mobile = mobile; this.layout?.move(mobile);
    // Only mutate our own chart wrapper, never the SDK-managed class attribute.
    this.host.classList.toggle('mly-profile-mobile', mobile);
    this.host.classList.toggle('mly-profile-collapsed', mobile && !this.mobileExpanded);
    this.summaryButton?.setAttribute('aria-expanded', String(this.mobileExpanded));
    if (this.summaryButton?.lastElementChild) this.summaryButton.lastElementChild.textContent = this.mobileExpanded ? '⌄' : '⌃';
    // Reserve at least 112px of the widget for imagery and its existing footer.
    // Short panes scroll within the profile; the map never loses space or moves.
    const widgetHeight = dockParent?.clientHeight || win.innerHeight;
    const panelMaxHeight = Math.max(44, Math.min(156, widgetHeight - 112));
    const oldHeight = this.height;
    this.height = mobile ? Math.max(80, Math.min(112, panelMaxHeight - 44)) : 200;
    if (mobile) this.host.style.setProperty('--mly-profile-max-height', `${panelMaxHeight}px`);
    else this.host.style.removeProperty('--mly-profile-max-height');
    if (this.svg) {
      this.svg.setAttribute('height', String(this.height));
      Object.assign(this.svg.style, { height: `${this.height}px`, minHeight: `${this.height}px`, flex: `0 0 ${this.height}px` });
    }
    this.updateFrame(); this.clearInspection();
    if (oldHeight !== this.height || this.svg && this.svg.clientWidth !== this.width) this.refresh();
  };
  private restoreNative(): void {
    if (this.native) this.native.style.display = this.nativeDisplay;
    if (this.main?.style.getPropertyValue('height') === 'auto' && this.main.style.getPropertyPriority('height') === 'important') {
      if (this.mainHeight) this.main.style.setProperty('height', this.mainHeight, this.mainHeightPriority);
      else this.main.style.removeProperty('height');
    }
    this.main = null;
  }
  dispose(): void {
    this.disposed = true; this.observer?.disconnect(); this.resize?.disconnect(); this.mobileResize?.disconnect(); this.dockResize?.disconnect();
    this.root?.ownerDocument.defaultView?.removeEventListener('resize', this.updateResponsive);
    this.layerChecks.clear();
    if (this.raf !== null) this.root?.ownerDocument.defaultView?.cancelAnimationFrame(this.raf);
    if (this.refreshTimer !== null) this.root?.ownerDocument.defaultView?.clearTimeout(this.refreshTimer);
    this.raf = null; this.refreshTimer = null; this.host?.remove(); this.restoreNative(); this.host = null; this.root = null;
  }
}
