interface BestCaptureSolve<Route, Opportunity> {
  readonly route: Route | null;
  readonly opportunities: Opportunity[];
  readonly extraMinutes: number;
}

/** One instance per generation run. Store solved geometry and its selection atomically. */
export class CaptureSolveHistory<Route, Opportunity> {
  private recordValue: BestCaptureSolve<Route, Opportunity> = {
    route: null, opportunities: [], extraMinutes: Infinity,
  };

  get best(): BestCaptureSolve<Route, Opportunity> { return this.recordValue; }

  record(route: Route, opportunities: readonly Opportunity[], extraMinutes: number): void {
    if (extraMinutes < this.recordValue.extraMinutes) {
      this.recordValue = { route, opportunities: [...opportunities], extraMinutes };
    }
  }
}
