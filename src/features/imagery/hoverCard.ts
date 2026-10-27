import { imageryHoverCardStyles as styles } from '../../styles/imageryHoverCard';
/** Small theme-colored vector icons; no font downloads or external assets. */
function cardIcon(doc: Document, kind: 'creator' | 'calendar'): SVGSVGElement | HTMLSpanElement {
  if (typeof doc.createElementNS !== 'function') { const span = doc.createElement('span'); span.textContent = kind === 'creator' ? '◉' : '▦'; return span; }
  const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
  for (const [key, value] of Object.entries({ viewBox: '0 0 24 24', width: '14', height: '14', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.7', 'aria-hidden': 'true' })) svg.setAttribute(key, value);
  const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', kind === 'creator' ? 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2' : 'M4 5h16v16H4ZM8 2v6M16 2v6M4 10h16');
  svg.appendChild(path); svg.style.flexShrink = '0'; return svg;
}
/** Build a non-interactive preview with textContent, stable dimensions and no HTML interpolation. */
export function renderImageryHoverCard(host: HTMLElement, data: any, fallbackDate?: unknown, loading = false): void {
  Object.assign(host.style, styles.shell); if (!host.style.width || host.style.width === 'max-content') host.style.width = '240px'; host.style.display = 'block'; host.setAttribute('role', 'tooltip');
  host.textContent = ''; const doc = host.ownerDocument;
  const portal = doc.fullscreenElement || doc.body;
  if (portal && host.parentNode !== portal) portal.appendChild(host);
  const user = doc.createElement('div'); Object.assign(user.style, styles.creator);
  const userIcon = cardIcon(doc, 'creator'); userIcon.setAttribute('aria-hidden', 'true'); userIcon.style.color = '#83c9a5';
  const name = doc.createElement('b'); Object.assign(name.style, styles.name); name.textContent = loading ? 'Loading image details…' : data?.creator?.username || 'Creator unavailable';
  user.appendChild(userIcon); user.appendChild(name); host.appendChild(user);
  const date = doc.createElement('div'); Object.assign(date.style, styles.date);
  const icon = cardIcon(doc, 'calendar'); icon.setAttribute('aria-hidden', 'true');
  const label = doc.createElement('span'); const raw = data?.captured_at ?? fallbackDate;
  const captured = new Date(typeof raw === 'string' && /^\d+$/.test(raw) ? Number(raw) : raw as any);
  label.textContent = raw && Number.isFinite(captured.getTime()) ? captured.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : loading ? 'Preparing preview' : 'Capture date unavailable';
  date.appendChild(icon); date.appendChild(label); host.appendChild(date);
  const preview = doc.createElement('div'); Object.assign(preview.style, styles.preview); preview.textContent = loading || data?.thumb_256_url ? 'Loading preview…' : 'Preview unavailable'; host.appendChild(preview);
  if (data?.thumb_256_url) {
    const image = doc.createElement('img'); Object.assign(image.style, styles.image); image.alt = 'Street imagery preview'; image.decoding = 'async';
    image.onload = () => { if (preview.parentNode === host) { preview.textContent = ''; preview.appendChild(image); } };
    image.onerror = () => { if (preview.parentNode === host) preview.textContent = 'Preview unavailable'; };
    image.src = data.thumb_256_url;
  }
}
/** Anchor once beside the hover target, clamped to the widget/viewport and its available width. */
export function positionImageryHoverCard(host: HTMLElement, bounds: { left: number; right: number; top: number; bottom: number }, x: number, y: number): void {
  const viewport = host.ownerDocument.defaultView || { innerWidth: bounds.right, innerHeight: bounds.bottom };
  const left = Math.max(8, bounds.left), top = Math.max(8, bounds.top);
  const right = Math.max(left, Math.min(viewport.innerWidth - 8, bounds.right)), bottom = Math.max(top, Math.min(viewport.innerHeight - 8, bounds.bottom));
  const width = Math.min(240, Math.max(0, right - left)), height = Math.min(200, Math.max(0, bottom - top));
  Object.assign(host.style, { width: `${width}px`, maxHeight: `${bottom - top}px`, left: `${Math.max(left, Math.min(x + 16 + width <= right ? x + 16 : x - width - 16, right - width))}px`, top: `${Math.max(top, Math.min(y + 16, bottom - height))}px` });
}

const featureLabelSizes = new WeakMap<HTMLElement, { text: string; maxWidth: number; maxHeight: number; width: number; height: number }>();

/** The shared tooltip also hosts image previews. Reset preview dimensions for a
 * text-only feature label; measure once per label/available width, then reuse it.
 */
export function renderMapFeatureHoverLabel(host: HTMLElement, text: string,
  bounds: { left: number; right: number; top: number; bottom: number }, x: number, y: number): void {
  const doc = host.ownerDocument, viewport = doc.defaultView || { innerWidth: bounds.right, innerHeight: bounds.bottom };
  const left = Math.max(8, bounds.left), top = Math.max(8, bounds.top);
  const right = Math.max(left, Math.min(viewport.innerWidth - 8, bounds.right));
  const bottom = Math.max(top, Math.min(viewport.innerHeight - 8, bounds.bottom));
  const maxWidth = right - left, maxHeight = bottom - top, previous = featureLabelSizes.get(host);
  const reuse = previous?.text === text && previous.maxWidth === maxWidth && previous.maxHeight === maxHeight && host.style.width === 'max-content';
  const portal = doc.fullscreenElement || doc.body;
  if (portal && host.parentNode !== portal) portal.appendChild(host);
  if (!reuse) Object.assign(host.style, styles.shell, { width: 'max-content', maxWidth: `${maxWidth}px`,
    maxHeight: `${bottom - top}px`, height: 'auto', whiteSpace: 'normal', overflowWrap: 'anywhere' });
  host.textContent = text;
  host.style.display = 'block'; host.setAttribute('role', 'tooltip');
  const measured = reuse ? previous : host.getBoundingClientRect();
  const width = Math.min(measured.width, maxWidth), height = Math.min(measured.height, bottom - top);
  featureLabelSizes.set(host, { text, maxWidth, maxHeight, width, height });
  Object.assign(host.style, {
    left: `${Math.max(left, Math.min(x + 15 + width <= right ? x + 15 : x - width - 15, right - width))}px`,
    top: `${Math.max(top, Math.min(y + 15, bottom - height))}px`,
  });
}
