/** Bounded road-server retries; callers own analysis cancellation and rate-limit state. */
export async function fetchCoverageRoads(query: string, signal: AbortSignal, options: {
  fetch: typeof fetch;
  delay: (ms: number, signal: AbortSignal) => Promise<void>;
  onRetry: () => void;
  onRateLimit: (retryAt: number) => void;
}): Promise<any> {
  for (let attempt = 0; attempt < 2; attempt++) {
    if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
    const request = new AbortController();
    const abort = () => request.abort();
    signal.addEventListener('abort', abort, { once: true });
    const timer = setTimeout(abort, 35000);
    let retry = false;
    try {
      const response = await options.fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: query, signal: request.signal });
      if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
      if (response.ok) return await response.json();
      if (response.status === 429) {
        const header = response.headers.get('Retry-After')?.trim();
        let delay = 60000;
        if (header && /^\d+$/.test(header) && Number.isFinite(Number(header))) delay = Math.max(1000, Number(header) * 1000);
        else if (header && Number.isFinite(Date.parse(header)) && Date.parse(header) > Date.now()) delay = Date.parse(header) - Date.now();
        options.onRateLimit(Date.now() + delay);
        throw new Error(`Road server is rate-limited (429). Try again in ${Math.ceil(delay / 1000)} seconds.`);
      }
      retry = attempt === 0 && [502, 503, 504].includes(response.status);
      if (!retry) throw new Error([502, 503, 504].includes(response.status)
        ? `Road server is temporarily unavailable (${response.status}). Please try again shortly.`
        : `Road request failed (${response.status}). Please try again later.`);
    } finally {
      clearTimeout(timer);
      signal.removeEventListener('abort', abort);
    }
    if (retry) {
      options.onRetry();
      await options.delay(3000, signal);
    }
  }
  throw new Error('Road request could not finish.');
}
