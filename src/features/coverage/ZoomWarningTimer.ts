/** State publication stays with the widget; expiry and manual clearing differ. */
export interface ZoomWarningHost {
  show(message: string): void;
  hide(): void;
  clear(): void;
}

/** Own the existing single warning timer without changing publication order. */
export class ZoomWarningTimer {
  private timer: ReturnType<typeof setTimeout> | null = null;
  constructor(private readonly host: ZoomWarningHost) {}

  show(message: string, duration: number): void {
    this.cancel();
    this.host.show(message);
    if (duration > 0) {
      this.timer = setTimeout(() => {
        this.host.hide();
        this.timer = null;
      }, duration);
    }
  }

  clear(): void {
    this.cancel();
    this.host.clear();
  }

  /** Unmount cancels resources without publishing a state update. */
  cancel(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
