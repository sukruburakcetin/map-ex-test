import { axisPixel, sampledElevation, sampledPath } from './profileTracking';
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
/** Own the distance axis instead of inferring it from SDK SVG/canvas internals.
 * The SDK still owns profile generation, progress UI, legend and statistics.
 * Native sampled map inspection is disabled: the existing active-image marker
 * remains the sole frame marker. Inspecting this chart never navigates the map.
 */
export class ProfileFrameChart {
  private host: HTMLDivElement | null = null;
  private native: HTMLElement | null = null;
  private nativeDisplay = '';
  private svg: SVGSVGElement | null = null;
  private frameLabel: HTMLDivElement | null = null;
  private inspectLabel: HTMLDivElement | null = null;
  private frameLine: SVGLineElement | null = null;
  private inspectionLine: SVGLineElement | null = null;
  private observer: MutationObserver | null = null;
  private resize: ResizeObserver | null = null;
  private raf: number | null = null;
  private disposed = false;
  private frame: FramePosition | null = null;
  private width = 440;
  private start = 0;
  private end: number;
  private readonly height = 240;
  private readonly left = 50;
  private readonly top = 12;
  private readonly bottom = 30;
  private readonly right = 12;
  private root: HTMLElement | null = null;
  constructor(private readonly widget: ElevationIndicatorWidget, private readonly index: FrameDistanceIndex) {
    this.end = index.total;
    const container = widget.container;
    this.root = typeof container === 'string' ? document.getElementById(container) : container || null;
    if (!this.root) return;
    const win = this.root.ownerDocument.defaultView;
    if (!win) return;
    this.observer = new win.MutationObserver(records => {
      if (records.some(record => !this.host?.contains(record.target))) this.refresh();
    });
    this.observer.observe(this.root, { childList: true, subtree: true });
    this.mount(); this.refresh();
  }
  private mount(): void {
    if (!this.root || this.disposed) return;
    const native = this.root.querySelector<HTMLElement>('.esri-elevation-profile__chart-container');
    if (!native) return;
    if (this.host?.isConnected && this.native === native) return;
    this.restoreNative(); this.host?.remove(); this.resize?.disconnect();
    this.native = native; this.nativeDisplay = native.style.display; native.style.display = 'none';
    const doc = native.ownerDocument, host = doc.createElement('div'); this.host = host;
    host.className = 'mly-profile-frame-chart';
    Object.assign(host.style, { padding: '4px 12px 0', boxSizing: 'border-box', width: '100%' });
    const label = doc.createElement('div'); this.frameLabel = label;
    Object.assign(label.style, { fontSize: '11px', fontWeight: '600', minHeight: '32px', color: 'inherit' });
    const controls = doc.createElement('div');
    Object.assign(controls.style, { display: 'flex', gap: '4px', justifyContent: 'flex-end' });
    for (const [text, title, action] of [
      ['−', 'Zoom out along the sequence', () => this.zoom(2)],
      ['+', 'Zoom in along the sequence', () => this.zoom(0.5)],
      ['←', 'Show earlier sequence distance', () => this.pan(-0.25)],
      ['→', 'Show later sequence distance', () => this.pan(0.25)],
      ['Full sequence', 'Reset the chart distance axis', () => { this.start = 0; this.end = this.index.total; this.render(); }],
    ] as const) {
      const button = doc.createElement('button'); button.type = 'button'; button.textContent = text; button.title = title;
      button.setAttribute('aria-label', title);
      Object.assign(button.style, { fontSize: '10px', padding: '2px 5px', cursor: 'pointer', background: 'transparent', color: 'inherit', border: '1px solid #aaa', borderRadius: '3px' });
      button.addEventListener('click', action); controls.appendChild(button);
    }
    const svg = doc.createElementNS(svgNS, 'svg'); this.svg = svg;
    svg.setAttribute('width', '100%'); svg.setAttribute('height', String(this.height));
    svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Sequence elevation in metres. Dashed blue line marks the confirmed current image.');
    svg.style.display = 'block'; svg.style.overflow = 'hidden';
    svg.addEventListener('pointermove', this.inspect);
    svg.addEventListener('pointerleave', this.clearInspection);
    const inspect = doc.createElement('div'); this.inspectLabel = inspect;
    Object.assign(inspect.style, { fontSize: '10px', minHeight: '26px', opacity: '0.85' });
    inspect.textContent = 'Move over the chart to inspect sampled elevations.';
    host.append(label, controls, svg, inspect); native.before(host);
    const win = doc.defaultView;
    if (win?.ResizeObserver) {
      this.resize = new win.ResizeObserver(() => this.refresh()); this.resize.observe(host);
    }
  }
  /** Frame movement only touches text and one SVG line, never re-queries profiles. */
  setFrame(id: string | null): void {
    this.frame = id ? this.index.frames.get(String(id)) || null : null;
    this.updateFrame();
  }
  refresh = (): void => {
    if (this.disposed || this.raf !== null || !this.root) return;
    const win = this.root.ownerDocument.defaultView; if (!win) return;
    this.raf = win.requestAnimationFrame(() => { this.raf = null; this.mount(); this.render(); });
  };
  private lines(): ProfileLine[] { return this.widget.profiles.toArray().filter(line => line.visible); }
  private render(): void {
    if (!this.svg || !this.host || this.disposed) return;
    const measured = this.svg.getBoundingClientRect().width;
    if (measured <= this.left + this.right) return;
    this.width = measured; this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
    const plotWidth = this.width - this.left - this.right, plotHeight = this.height - this.top - this.bottom;
    const lines = this.lines(); let min = Infinity, max = -Infinity;
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
      if (text !== undefined) node.textContent = text; children.push(node); return node;
    };
    for (let i = 0; i <= 4; i++) {
      const y = this.top + i / 4 * plotHeight;
      element('line', { x1: this.left, x2: this.width - this.right, y1: y, y2: y, stroke: '#aaa', 'stroke-opacity': 0.2 });
      element('text', { x: this.left - 6, y: y + 3, 'text-anchor': 'end', 'font-size': 10, fill: 'currentColor' }, available ? `${Math.round(max - i / 4 * (max - min))} m` : '');
      const x = this.left + i / 4 * plotWidth, distance = this.start + i / 4 * (this.end - this.start);
      element('text', { x, y: this.height - 8, 'text-anchor': i === 4 ? 'end' : i === 0 ? 'start' : 'middle', 'font-size': 10, fill: 'currentColor' }, this.index.total >= 1000 ? `${(distance / 1000).toFixed(1)} km` : `${Math.round(distance)} m`);
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
    if (this.frameLabel) {
      this.frameLabel.textContent = frame
        ? `Current image · Frame ${frame.ordinal.toLocaleString()}/${this.index.images.length.toLocaleString()} · ${Math.round(frame.distance).toLocaleString()} m${frame.altitude !== undefined ? ` · GPS altitude ${frame.altitude.toFixed(1)} m` : ''}`
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
    if (this.inspectLabel) this.inspectLabel.textContent = 'Move over the chart to inspect sampled elevations.';
  };
  private zoom(factor: number): void {
    const span = Math.min(this.index.total, Math.max(Math.min(10, this.index.total), (this.end - this.start) * factor));
    const center = this.frame && this.frame.distance >= this.start && this.frame.distance <= this.end ? this.frame.distance : (this.start + this.end) / 2;
    this.start = Math.max(0, Math.min(center - span / 2, this.index.total - span)); this.end = this.start + span; this.render();
  }
  private pan(factor: number): void {
    const span = this.end - this.start; this.start = Math.max(0, Math.min(this.index.total - span, this.start + span * factor)); this.end = this.start + span; this.render();
  }
  private restoreNative(): void { if (this.native) this.native.style.display = this.nativeDisplay; }
  dispose(): void {
    this.disposed = true; this.observer?.disconnect(); this.resize?.disconnect();
    if (this.raf !== null) this.root?.ownerDocument.defaultView?.cancelAnimationFrame(this.raf);
    this.raf = null; this.host?.remove(); this.restoreNative(); this.host = null; this.root = null;
  }
}
