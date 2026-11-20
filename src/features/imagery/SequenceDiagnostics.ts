/** Local diagnostic callbacks; snapshot contents remain with the widget coordinator. */
export interface SequenceDiagnosticsHost {
  snapshot(): unknown;
  reset(): void;
  recordLongTask(duration: number): void;
}

/** Own only this widget's optional browser registry entry and long-task observer. */
export class SequenceDiagnostics {
  private entry: object | null = null;
  private observer: PerformanceObserver | null = null;

  constructor(private readonly host: SequenceDiagnosticsHost) {}

  clear(id: string): void {
    this.observer?.disconnect(); this.observer = null;
    const registry = typeof window === 'undefined' ? undefined : (window as any).__mapillarySequencePerformance;
    if (registry && registry[id] === this.entry) delete registry[id];
    this.entry = null;
  }

  sync(id: string, enabled: boolean, closed: boolean): void {
    this.clear(id);
    if (!enabled || closed || typeof window === 'undefined') return;
    const registry = (window as any).__mapillarySequencePerformance ??= Object.create(null);
    const entry = { snapshot: () => this.host.snapshot(), reset: () => this.host.reset() };
    registry[id] = entry; this.entry = entry;
    if (typeof PerformanceObserver !== 'undefined' && PerformanceObserver.supportedEntryTypes?.includes('longtask')) {
      this.observer = new PerformanceObserver(list => {
        for (const task of list.getEntries()) this.host.recordLongTask(task.duration);
      });
      this.observer.observe({ type: 'longtask', buffered: false });
    }
  }
}
