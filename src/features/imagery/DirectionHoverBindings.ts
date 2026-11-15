/** Minimal interface to Mapillary's existing private direction-hover observable. */
export interface DirectionHoverViewer { getComponent(name: 'direction'): unknown; }
export interface DirectionHoverBindingsHost {
  onHover(imageId: string | null): void;
  log(...args: any[]): void;
  createMouseMove?: (touch: Touch) => MouseEvent;
}

/** Owns the direction subscription and three passive touch listeners as one binding.
 * Lookup, Graph requests and marker animation remain separate owners. Rebinding
 * releases prior listeners/subscription so one touch produces one hover action.
 */
export class DirectionHoverBindings {
  private unsubscribe: (() => void) | null = null;
  private container: HTMLElement | null = null;
  private move: ((event: TouchEvent) => void) | null = null;
  private end: (() => void) | null = null;
  private readonly host: DirectionHoverBindingsHost;
  private readonly createMouseMove: (touch: Touch) => MouseEvent;

  constructor(host: DirectionHoverBindingsHost) {
    this.host = host;
    this.createMouseMove = host.createMouseMove ?? (touch => new MouseEvent('mousemove', {
      bubbles: true, cancelable: true, view: window,
      clientX: touch.clientX, clientY: touch.clientY,
      screenX: touch.screenX, screenY: touch.screenY,
    }));
  }

  /** Attach the existing observable and single-touch mousemove bridge.
   * A missing viewer/component/observable retains the original diagnostics and no-op behavior.
   * Existing bindings are replaced only after a usable observable has been found.
   */
  bind(viewer: DirectionHoverViewer | null | undefined, container: HTMLElement | null): void {
    if (!viewer) return;
    try {
      const directionComponent: any = viewer.getComponent('direction');
      if (!directionComponent) { console.warn('DirectionComponent not found'); return; }
      if (!directionComponent._hoveredId$) { console.warn('_hoveredId$ not available on DirectionComponent'); return; }
      this.clear();
      const subscription = directionComponent._hoveredId$.subscribe((hoveredId: string | null) => {
        this.host.log('Direction hover:', hoveredId);
        this.host.onHover(hoveredId);
      });
      this.unsubscribe = () => subscription.unsubscribe();
      if (container) {
        this.container = container;
        this.move = event => {
          if (event.touches.length > 1) return;
          const mouseEvent = this.createMouseMove(event.touches[0]);
          if (event.target) event.target.dispatchEvent(mouseEvent);
        };
        this.end = () => this.host.onHover(null);
        container.addEventListener('touchstart', this.move, { passive: true });
        container.addEventListener('touchmove', this.move, { passive: true });
        container.addEventListener('touchend', this.end, { passive: true });
      }
    } catch (error) { console.warn('Failed to setup direction hover:', error); }
  }

  /** Release the observable and listeners from their original container; safe to call repeatedly. */
  clear(): void {
    const unsubscribe = this.unsubscribe;
    this.unsubscribe = null;
    try { unsubscribe?.(); }
    finally {
      if (this.container) {
        if (this.move) {
          this.container.removeEventListener('touchstart', this.move);
          this.container.removeEventListener('touchmove', this.move);
        }
        if (this.end) this.container.removeEventListener('touchend', this.end);
      }
      this.container = null; this.move = null; this.end = null;
    }
  }
}
