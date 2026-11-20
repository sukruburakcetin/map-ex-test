interface PendingView { container?: unknown; destroyed?: boolean; width?: number; height?: number; }
/** Neutral lookup feedback. Uses the existing delayed-status signal, with no timer or animation loop. */
export class PendingCoverageHover<V extends PendingView> {
  private pending: { view: V; x: number; y: number; signal: AbortSignal; finish(): void } | null = null;
  private element: HTMLElement | null = null;
  private parent: HTMLElement | null = null;
  private busy = false;
  constructor(private readonly current: (view: V) => boolean, private readonly create: () => HTMLElement | null) {}

  begin(view: V, point: { x: number; y: number }, signal: AbortSignal): () => void {
    this.pending?.finish();
    if (signal.aborted || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return () => {};
    const finish = () => {
      signal.removeEventListener('abort', finish);
      if (this.pending !== token) return;
      this.pending = null; this.hide();
    };
    const token = { view, x: point.x, y: point.y, signal, finish };
    this.pending = token; signal.addEventListener('abort', finish, { once: true });
    if (signal.aborted) finish(); else this.render();
    return finish;
  }
  loading(busy: boolean): void { this.busy = busy; this.render(); }
  clear(): void { this.pending?.finish(); this.element?.remove(); this.element = null; this.parent = null; }
  private hide(): void { if (this.element) this.element.style.display = 'none'; }
  private render(): void {
    const pending = this.pending;
    if (!this.busy || !pending || pending.signal.aborted || pending.view.destroyed || !this.current(pending.view)) { this.hide(); return; }
    const host = pending.view.container as HTMLElement | null;
    if (!host || typeof host.appendChild !== 'function' || host.isConnected === false) { this.hide(); return; }
    if (this.parent !== host) { this.element?.remove(); this.element = null; this.parent = host; }
    if (!this.element) {
      const element = this.create(); if (!element) return;
      element.setAttribute('aria-hidden', 'true'); element.setAttribute('data-mapillary-pending-hover', 'true');
      Object.assign(element.style, { position: 'absolute', pointerEvents: 'none', zIndex: '9', width: '28px', height: '16px', borderRadius: '8px',
        background: 'rgba(14,32,28,0.85)', border: '1px solid rgba(157,206,184,0.45)' });
      element.innerHTML = '<svg width="28" height="16" viewBox="0 0 28 16" xmlns="http://www.w3.org/2000/svg"><g fill="#b8d8ca"><circle cx="7" cy="8" r="1.5"/><circle cx="14" cy="8" r="1.5"/><circle cx="21" cy="8" r="1.5"/></g></svg>';
      host.appendChild(element); this.element = element;
    }
    const width = pending.view.width || host.clientWidth, height = pending.view.height || host.clientHeight;
    const left = width > 0 ? Math.max(2, Math.min(pending.x + 12, width - 32)) : pending.x + 12;
    const top = height > 0 ? Math.max(2, Math.min(pending.y + 12, height - 20)) : pending.y + 12;
    Object.assign(this.element.style, { left: `${left}px`, top: `${top}px`, display: 'block' });
  }
}
