/* Paste into the application's DevTools console after enabling widget debug mode.
 * Manual snapshots only: no polling, observers, network calls or automatic UI actions.
 */
(() => {
  let active = null;
  const records = [];
  const heap = () => Number.isFinite(performance.memory?.usedJSHeapSize) ? performance.memory.usedJSHeapSize : null;
  const clone = value => JSON.parse(JSON.stringify(value));
  window.mapillaryPlacesAudit = {
    start(label, widgetId) {
      if (active) throw new Error('Stop or cancel the current phase first.');
      const registry = window.__mapillarySequencePerformance || {}, ids = Object.keys(registry);
      const id = widgetId == null && ids.length === 1 ? ids[0] : String(widgetId ?? '');
      const entry = registry[id];
      if (!entry) throw new Error('Enable widget debug mode and choose the application frame. Pass a widget ID if several are active.');
      entry.reset();
      active = { label: String(label || 'phase').slice(0, 80), id, entry, started: performance.now(), heapStart: heap() };
      return { label: active.label, widgetId: id, instruction: 'Perform the same browsing actions, then call mapillaryPlacesAudit.stop().' };
    },
    stop() {
      if (!active) throw new Error('Start a phase first.');
      const phase = active; active = null;
      if (window.__mapillarySequencePerformance?.[phase.id] !== phase.entry) throw new Error('Widget diagnostics changed during this phase. Repeat it.');
      const snapshot = phase.entry.snapshot();
      const result = clone({ label: phase.label, elapsedMs: performance.now() - phase.started,
        timings: snapshot.timings, counters: snapshot.counters, playbackFrameGaps: snapshot.playbackFrameGaps,
        longTasks: snapshot.longTasks, places: snapshot.places, tiles: snapshot.tiles,
        sequenceIndex: snapshot.sequenceIndex, background: snapshot.background, routes: snapshot.routes, nearby: snapshot.nearby,
        view: snapshot.view, imageTiling: snapshot.imageTiling, allPageHeapStartBytes: phase.heapStart, allPageHeapEndBytes: heap() });
      records.push(result); if (records.length > 10) records.shift();
      return clone(result);
    },
    cancel() { active = null; },
    report() { return clone(records); },
    clear() { active = null; records.length = 0; },
  };
  return 'Places audit ready. Use mapillaryPlacesAudit.start("places-off"), then .stop().';
})();
