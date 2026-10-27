/** Native popup entry plus one owned close watcher; no keyboard trap or polling. */
export class PlacePopupFocus {
  private session: { view: any; content: HTMLElement; origin: HTMLElement | null; popup?: any; handle?: { remove(): void } } | null = null;
  private active(): HTMLElement | null {
    let node = typeof document === 'undefined' ? null : document.activeElement;
    while (node?.shadowRoot?.activeElement) node = node.shadowRoot.activeElement;
    return node as HTMLElement | null;
  }
  private inside(node: HTMLElement | null, session: NonNullable<PlacePopupFocus['session']>): boolean {
    if (!node) return false;
    // Follow composed ancestry so Calcite's shadow-DOM controls count as popup focus.
    for (let current: any = node; current; current = current.parentNode || current.host) {
      if (current === session.content || current === session.popup?.container) return true;
    }
    return false;
  }
  capture(view: any): HTMLElement | null {
    const active = this.active(), session = this.session;
    if (session && session.view === view && this.inside(active, session)) return session.origin;
    return active && active !== document.body ? active : null;
  }
  open(view: any, options: { content: HTMLElement; [key: string]: any }, origin: HTMLElement | null): void {
    this.cancel();
    const session = { view, content: options.content, origin } as NonNullable<PlacePopupFocus['session']>;
    this.session = session;
    try {
      void Promise.resolve(view.openPopup({ ...options, shouldFocus: true })).then(() => {
        if (this.session !== session || view.destroyed) return;
        const popup = view.popup;
        if (!popup || popup.content !== session.content) { this.cancel(); return; }
        session.popup = popup;
        const changed = () => {
          if (this.session !== session) return;
          if (popup.content !== session.content) this.cancel();
          else if (popup.visible === false) this.finish(session);
        };
        session.handle = popup.watch?.(['visible', 'content'], changed);
        changed();
      }).catch(() => { if (this.session === session) this.cancel(); });
    } catch { this.cancel(); }
  }
  private finish(session: NonNullable<PlacePopupFocus['session']>): void {
    const active = this.active();
    const restore = !session.view.destroyed && (this.inside(active, session) || !active || active === document.body || active === session.view.container);
    this.cancel();
    if (!restore) return;
    const origin = session.origin;
    if (origin?.isConnected && !origin.hasAttribute('disabled') && origin.getClientRects().length) origin.focus({ preventScroll: true });
    else session.view.focus?.();
  }
  cancel(): void {
    const session = this.session; this.session = null;
    session?.handle?.remove();
  }
}
