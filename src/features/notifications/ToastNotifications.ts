/** Notification ownership lets cloud cleanup preserve a newer unrelated toast. */
export type ToastOwner = 'point-cloud-progress';

/** Rendering/localization and React state publication stay with the host. */
export interface ToastNotificationHost<Message> {
  show(message: Message): void;
  hide(): void;
}

/** Own the existing toast timer and optional progress owner without changing expiry order. */
export class ToastNotifications<Message> {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private owner: ToastOwner | undefined;
  constructor(private readonly host: ToastNotificationHost<Message>) {}

  /** Replace the previous toast, then schedule expiry for every supplied duration. */
  show(message: Message, duration: number, owner?: ToastOwner): void {
    if (this.timer) clearTimeout(this.timer);
    this.owner = owner;
    this.host.show(message);
    this.timer = setTimeout(() => {
      this.host.hide();
      this.owner = undefined;
      this.timer = null;
    }, duration);
  }

  /** Dismiss only a matching progress toast, clearing resources before UI publication. */
  dismiss(owner: ToastOwner): void {
    if (this.owner === owner) {
      if (this.timer) clearTimeout(this.timer);
      this.timer = null; this.owner = undefined;
      this.host.hide();
    }
  }
}
