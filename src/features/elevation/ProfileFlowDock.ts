/** Move the optional mobile profile into widget-owned flow, never onto the map. */
export interface DockedProfileWidget { container?: HTMLElement | string | null; }
export interface ProfileDockView {
  destroyed?: boolean;
  ui: { add(widget: any, position: string): unknown; remove(widget: any): unknown };
}
export class ProfileFlowDock {
  private registered: boolean;
  private host: HTMLElement | null = null;
  private parking: HTMLElement | null = null;
  private disposed = false;
  constructor(private readonly view: ProfileDockView, private readonly widget: DockedProfileWidget,
    private readonly getHost: () => HTMLElement | null, registered = false) { this.registered = registered; }

  place(mobile: boolean): void {
    if (this.disposed || this.view.destroyed) return;
    const node = this.widget.container;
    if (mobile) {
      if (!node || typeof node === 'string') return;
      const host = this.getHost();
      if (this.registered) { this.view.ui.remove(this.widget); this.registered = false; }
      if (this.host && this.host !== host) this.host.style.display = 'none';
      this.host = host;
      if (host) {
        host.style.display = 'block';
        if (node.parentElement !== host) host.appendChild(node);
      } else {
        // Normal layout may disappear during fullscreen or a React remount.
        // Keep the live widget detached until its own flow host is available.
        this.parking ??= node.ownerDocument.createElement('div');
        if (node.parentElement !== this.parking) this.parking.appendChild(node);
      }
    } else {
      if (!this.registered) { this.view.ui.add(this.widget, 'bottom-leading'); this.registered = true; }
      if (this.host) this.host.style.display = 'none';
      this.host = null;
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    if (this.host) this.host.style.display = 'none';
    if (this.registered && !this.view.destroyed) this.view.ui.remove(this.widget);
    const node = this.widget.container;
    if (!this.registered && node && typeof node !== 'string') node.remove();
    this.host = null; this.parking = null;
  }
}

/** Use map/viewport width, including touch landscape; narrow desktop sidebars stay desktop. */
export function useFlowProfile(map: HTMLElement | null, _dock: HTMLElement | null, win: Window): boolean {
  const width = Math.min(map?.clientWidth || win.innerWidth, win.innerWidth);
  return width <= 768 || width <= 900 && win.matchMedia('(pointer: coarse)').matches;
}
