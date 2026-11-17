import { throwIfRoutingAborted } from '../../utils/routingCancellation';

export interface RouteRun {
  readonly signal: AbortSignal;
  current(): boolean;
  check(): void;
}

/** Only the active run may publish results or release its busy state. */
export class RouteGeneration {
  private active: { run: RouteRun; controller: AbortController } | null = null;
  get pending(): boolean { return this.active !== null; }
  current(): boolean { return this.active?.run.current() ?? false; }

  begin(valid: () => boolean): RouteRun {
    this.cancel();
    const controller = new AbortController();
    const run: RouteRun = {
      signal: controller.signal,
      current: () => this.active?.run === run && !controller.signal.aborted && valid(),
      check: () => {
        if (!run.current()) controller.abort();
        throwIfRoutingAborted(controller.signal);
      },
    };
    this.active = { run, controller };
    return run;
  }

  cancel(): boolean {
    const active = this.active;
    if (!active) return false;
    this.active = null;
    active.controller.abort();
    return true;
  }

  finish(run: RouteRun): boolean {
    if (this.active?.run !== run) return false;
    this.active = null;
    return true;
  }
}
