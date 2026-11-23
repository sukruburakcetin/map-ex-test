/* Run as a DevTools Snippet in the ExB app, then:
 * __mapillaryHoverProfiler.start({ label: 'cold', durationMs: 30000 });
 * Hover 5–10 distinct targets, holding each ~1 second. stop() returns a redacted report.
 * Repeat with label:'warm' over the SAME targets without refreshing.
 * No listeners/observers/frame sampling are attached until start(). dispose() removes this API.
 */
(() => {
  'use strict';
  const name = '__mapillaryHoverProfiler', brand = 'mapillary-hover-profiler/1';
  const previous = window[name];
  if (previous) {
    if (previous.brand !== brand) throw new Error('Profiler name is already in use; nothing overwritten.');
    previous.dispose();
  }
  let active = null, last = null;
  const captures = {}; // Fixed cold/warm/mixed keys only; reports contain aggregates, never raw entries.
  const bucket = (limit = 256) => {
    const values = []; let count = 0, total = 0, maximum = 0;
    return { add(value) { if (!Number.isFinite(value) || value < 0) return; count++; total += value; maximum = Math.max(maximum, value); if (values.length < limit) values.push(value); else values[(count - 1) % limit] = value; },
      report() { const sorted = values.slice().sort((a, b) => a - b), p = q => sorted.length ? sorted[Math.ceil(sorted.length * q) - 1] : null;
        return { count, retained: values.length, meanMs: count ? total / count : null, p50Ms: p(.5), p95Ms: p(.95), maxMs: count ? maximum : null }; } };
  };
  function start(options = {}) {
    const label = options.label || 'mixed';
    if (!['cold', 'warm', 'mixed'].includes(label)) throw new Error('Use label cold, warm or mixed.');
    const root = options.root || document;
    if (root !== document && (!(root instanceof Element) || !root.isConnected)) throw new Error('root must be a connected widget element or document.');
    const requested = options.durationMs == null ? 30000 : Number(options.durationMs);
    if (!Number.isFinite(requested)) throw new Error('durationMs must be finite.');
    const durationMs = Math.max(5000, Math.min(60000, requested));
    if (active) active.stop('restarted');
    const started = performance.now(), cleanups = [], limits = { resourceEntries: 512, scannedNodesPerBatch: 128 };
    const timings = { pointerToNewPulse: bucket(), pointerToCard: bucket(), cardToThumbnail: bucket(), pointerToThumbnail: bucket(), frameGap: bucket(4096), longTask: bucket() };
    const resources = { metadata: bucket(), coverage: bucket(), thumbnail: bucket() };
    const counts = { pointerEvents: 0, clicks: 0, distinctPulses: 0, cards: 0, thumbnails: 0, frameGapsOver32Ms: 0, frameGapsOver50Ms: 0, hiddenTransitions: 0, resourceEntriesSkipped: 0, scanBatchesTruncated: 0, resourceTimingDetailsVisible: 0 };
    const unsupported = [], resourceKeys = new Set(), markers = new WeakSet();
    let stopped = false, pointerAt = null, hover = null, lastFrame = null, frame = null, timeout = null;
    const within = node => root === document || (node instanceof Node && root.contains(node));
    const visible = () => document.visibilityState === 'visible';
    function resource(entry, forcedKind) {
      if (stopped || entry.startTime < started) return;
      let kind = forcedKind;
      if (!kind) { let host; try { host = new URL(entry.name, location.href).hostname; } catch { return; }
        if (host === 'graph.mapillary.com') kind = 'metadata';
        else if (host === 'tiles.mapillary.com') kind = 'coverage';
        else if (/(^|\.)fbcdn\.net$/.test(host) || host === 'images.mapillary.com') kind = 'thumbnail';
        else return;
      }
      // URLs are used transiently only to deduplicate. Neither keys nor URLs enter the report.
      const key = `${entry.startTime}|${entry.duration}|${entry.name}`;
      if (resourceKeys.has(key)) return;
      if (resourceKeys.size >= limits.resourceEntries) { counts.resourceEntriesSkipped++; return; }
      resourceKeys.add(key); resources[kind].add(entry.duration);
      if (entry.responseStart > 0) counts.resourceTimingDetailsVisible++;
    }
    function thumbnail(host) {
      if (!hover || !visible() || host.style.display === 'none') return;
      const preview = Array.from(host.children).find(node => node.tagName === 'DIV' && node.style.height === '120px' && node.style.width === '100%');
      if (!preview) return;
      const now = performance.now();
      if (hover.cardAt === null) { hover.cardAt = now; counts.cards++; timings.pointerToCard.add(now - hover.pointerAt); }
      if (hover.thumbnailReady) return;
      const image = preview.querySelector('img');
      if (!image || !image.complete || image.naturalWidth <= 0) return;
      hover.thumbnailReady = true; counts.thumbnails++;
      timings.cardToThumbnail.add(now - hover.cardAt); timings.pointerToThumbnail.add(now - hover.pointerAt);
      // Handles CDNs not identifiable by hostname; still emits only aggregate duration.
      if (typeof performance.getEntriesByName === 'function') for (const entry of performance.getEntriesByName(image.currentSrc || image.src, 'resource')) resource(entry, 'thumbnail');
    }
    function inspect(element, cards) {
      if (!(element instanceof Element)) return;
      const card = element.closest('[role="tooltip"]'); if (card) cards.add(card);
      if (element.getAttribute('role') === 'tooltip') cards.add(element);
      const style = element.style, parent = element.parentElement;
      if (!style || !parent || markers.has(element) || !within(element)) return;
      if ((style.backgroundColor || '').replace(/\s+/g, '') !== 'rgba(165,42,42,0.95)' || style.pointerEvents !== 'none' || parent.style.width !== '60px' || parent.style.height !== '60px') return;
      markers.add(element);
      const now = performance.now();
      if (!visible() || pointerAt === null) { hover = null; return; }
      hover = { pointerAt, pulseAt: now, cardAt: null, thumbnailReady: false };
      counts.distinctPulses++; timings.pointerToNewPulse.add(now - pointerAt);
    }
    const mutations = new MutationObserver(records => {
      if (stopped) return;
      const cards = new Set(); let scanned = 0;
      for (const record of records) {
        if (record.target instanceof Element) { const host = record.target.closest('[role="tooltip"]'); if (host) cards.add(host); }
        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) continue;
          const walker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT);
          let element = node;
          do { if (++scanned > limits.scannedNodesPerBatch) break; inspect(element, cards); element = walker.nextNode(); } while (element);
          if (scanned > limits.scannedNodesPerBatch) break;
        }
        if (scanned > limits.scannedNodesPerBatch) break;
      }
      if (scanned > limits.scannedNodesPerBatch) counts.scanBatchesTruncated++;
      for (const card of cards) thumbnail(card);
    });
    const pointer = event => {
      if (!within(event.target) || event.pointerType === 'touch' || event.isPrimary === false || event.buttons) { pointerAt = null; hover = null; return; }
      if (visible()) { pointerAt = performance.now(); counts.pointerEvents++; }
    };
    const click = () => { pointerAt = null; hover = null; counts.clicks++; };
    const visibility = () => { lastFrame = null; pointerAt = null; hover = null; counts.hiddenTransitions++; };
    const onLoad = event => { if (event.target instanceof HTMLImageElement) { const host = event.target.closest('[role="tooltip"]'); if (host) thumbnail(host); } };
    function tick(now) {
      if (stopped) return;
      if (visible()) {
        if (lastFrame !== null) { const gap = now - lastFrame; timings.frameGap.add(gap); if (gap > 32) counts.frameGapsOver32Ms++; if (gap > 50) counts.frameGapsOver50Ms++; }
        lastFrame = now;
      } else lastFrame = null;
      frame = requestAnimationFrame(tick);
    }
    const report = reason => ({ schema: brand, label, reason, elapsedMs: Math.max(0, performance.now() - started),
      scope: 'instrumented DOM-ready and frame-scheduling timings; not paint completion or renderer FPS',
      method: 'Hover distinct targets and hold ~1 second. Pointer timings start at the latest qualifying pointer event. Same-marker regional changes are not inferred.',
      metrics: Object.fromEntries(Object.entries(timings).map(([key, value]) => [key, value.report()])),
      resources: Object.fromEntries(Object.entries(resources).map(([key, value]) => [key, value.report()])), counts: { ...counts }, unsupported: unsupported.slice(),
      limits: { ...limits, captureMs: durationMs, metricSamples: 256, frameSamples: 4096 },
      caveats: ['Profiler observers and RAF sampling add overhead only during capture.', 'Resource timings may be restricted by cross-origin Timing-Allow-Origin; transferSize=0 is not classified as a cache hit.', 'Cold/warm are manual protocol labels, not inferred cache states.', 'No raw URLs, image IDs, coordinates, DOM text or request headers are exported.'] });
    const capture = { report: () => report('running'), stop(reason = 'manual') {
      if (stopped) return last;
      stopped = true;
      if (frame !== null) cancelAnimationFrame(frame);
      if (timeout !== null) clearTimeout(timeout);
      mutations.disconnect(); for (const cleanup of cleanups) cleanup();
      last = report(reason); captures[label] = last; active = null; hover = null; pointerAt = null; resourceKeys.clear();
      return last;
    } };
    // Set up only owned, passive listeners. No fetch/XHR, image prototype, history or SDK patching.
    try {
      for (const [type, handler] of [['pointermove', pointer], ['pointerdown', click], ['load', onLoad], ['visibilitychange', visibility]]) {
        document.addEventListener(type, handler, { capture: true, passive: true }); cleanups.push(() => document.removeEventListener(type, handler, true));
      }
      mutations.observe(document.body || document.documentElement, { childList: true, subtree: true });
      for (const type of ['resource', 'longtask']) {
        if (typeof PerformanceObserver === 'undefined' || !PerformanceObserver.supportedEntryTypes?.includes(type)) { unsupported.push(type); continue; }
        const observer = new PerformanceObserver(list => { if (stopped) return; for (const entry of list.getEntries()) if (type === 'resource') resource(entry); else if (entry.startTime >= started && visible()) timings.longTask.add(entry.duration); });
        cleanups.push(() => observer.disconnect()); observer.observe({ type, buffered: false });
      }
      active = capture; frame = requestAnimationFrame(tick);
      timeout = setTimeout(() => { capture.stop('duration'); console.info('[Mapillary hover profiler] Capture complete. Use __mapillaryHoverProfiler.report() to inspect the redacted report.'); }, durationMs);
    } catch (error) { capture.stop('setup-error'); throw error; }
    return { label, durationMs, running: true };
  }
  const api = { brand, start, stop: () => active ? active.stop() : last, report: () => active ? active.report() : last,
    export() { if (active) active.stop('exported'); return { schema: brand, captures: { ...captures } }; },
    get running() { return active !== null; }, dispose() { if (active) active.stop('disposed'); if (window[name] === api) delete window[name]; } };
  Object.defineProperty(window, name, { value: api, configurable: true });
})();
