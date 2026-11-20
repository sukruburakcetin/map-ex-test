/** Yield two browser frames; preserve cancellation and entry visibility semantics. */
export function waitForSequencePaint(signal: AbortSignal): Promise<void> {
  if (signal.aborted || typeof document === 'undefined' || document.visibilityState !== 'visible')
    return Promise.reject(new DOMException('Cancelled', 'AbortError'));
  return new Promise((resolve, reject) => {
    let frame = 0;
    const cleanup = () => { signal.removeEventListener('abort', abort); if (frame) cancelAnimationFrame(frame); };
    const abort = () => { cleanup(); reject(new DOMException('Cancelled', 'AbortError')); };
    signal.addEventListener('abort', abort, { once: true });
    frame = requestAnimationFrame(() => { frame = requestAnimationFrame(() => { cleanup(); resolve(); }); });
    if (signal.aborted) abort();
  });
}
