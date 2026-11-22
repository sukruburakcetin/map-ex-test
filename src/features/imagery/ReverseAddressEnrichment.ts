import { fetchReverseAddress } from '../../services/geocoding/reverseAddress';

export interface ReverseAddressEnrichmentHost<View> {
  imageId(): string | null | undefined;
  view(): View | undefined;
  runBackground(work: (signal: AbortSignal) => Promise<void>, signal: AbortSignal): Promise<void>;
  publish(address: string): void;
  warn(error: unknown): void;
}

/** Own optional address cancellation; scheduling, UI and live selection stay host-bound. */
export class ReverseAddressEnrichment<View> {
  private controller: AbortController | null = null;

  constructor(private readonly host: ReverseAddressEnrichmentHost<View>) {}

  /** Abort the previous lookup and publish only for its captured image/view.
   * Preserve the existing queue signal, error boundary and current-owner cleanup.
   */
  async run(lat: number, lon: number): Promise<void> {
    this.cancel();
    const controller = new AbortController(); this.controller = controller;
    const imageId = this.host.imageId(), view = this.host.view();
    try {
      await this.host.runBackground(signal => fetchReverseAddress(lat, lon, address => {
        if (!signal.aborted && this.host.imageId() === imageId && this.host.view() === view) this.host.publish(address);
      }, signal), controller.signal);
    } catch (error) { if (!controller.signal.aborted) this.host.warn(error); }
    finally { if (this.controller === controller) this.controller = null; }
  }

  /** Abort without detaching; the owning run retains its existing finally boundary. */
  cancel(): void { this.controller?.abort(); }

  /** Match teardown/reset: abort, then detach without publishing UI state. Reusable. */
  clear(): void { this.controller?.abort(); this.controller = null; }
}
