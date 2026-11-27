export type RoadCooldownReason = "rate-limit" | "capacity";

function retryAfterMs(response: Response, now: number): number | undefined {
  const header = response.headers?.get("Retry-After")?.trim();
  if (!header) return;
  const delay = /^\d+$/.test(header) ? Number(header) * 1000 : Date.parse(header) - now;
  return Number.isFinite(delay) ? Math.max(1000, delay) : undefined;
}

/** Bounded road-server retries; callers own analysis cancellation and cooldown state. */
export async function fetchCoverageRoads(query: string, signal: AbortSignal, options: {
  fetch: typeof fetch;
  delay: (ms: number, signal: AbortSignal) => Promise<void>;
  endpoint?: string;
  splitQueries?: readonly [string, string];
  onRetry: (reason: "timeout" | "network" | "server" | "area-limit") => void;
  capacityBackoffMs?: number;
  onRateLimit: (retryAt: number, reason: RoadCooldownReason) => void;
}): Promise<any> {
  const endpoint = options.endpoint || 'https://overpass-api.de/api/interpreter';
  try {
    const url = new URL(endpoint);
    if (url.protocol !== 'https:' || url.username || url.password || url.hash) throw new Error();
  } catch {
    throw new Error('Enter a valid HTTPS Overpass interpreter URL in Coverage defaults.');
  }
  const read = async (body: string, canRetry: boolean, timeoutMs = 35_000) => {
    let reason: "timeout" | "network" | "server" | "area-limit" = "server";
    if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
    const request = new AbortController();
    const abort = () => request.abort();
    signal.addEventListener('abort', abort, { once: true });
    const timer = setTimeout(abort, timeoutMs);
    try {
      let response: Response | undefined;
      let data: any;
      let capacityMessage = false;
      let areaLimit: string | undefined;
      try {
        response = await options.fetch(endpoint, { method: 'POST', body: new URLSearchParams({ data: body }), signal: request.signal });
        if (response.ok) data = await response.json();
        else if (response.status === 422) {
          const refusal = await response.json().catch(() => null);
          if (typeof refusal?.error === "string" &&
              /^Road area (too large|contains too many (segments|vertices))\. Zoom in and try again\.$/.test(refusal.error)) {
            areaLimit = refusal.error;
          }
        }
        else if ([502, 503, 504].includes(response.status) && typeof response.text === "function") {
          const message = await response.text();
          capacityMessage = /queue is full|all query workers are busy|currently at capacity/i.test(message);
        }
        if (request.signal.aborted) throw new DOMException('Cancelled', 'AbortError');
      } catch (error) {
        if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
        if (!request.signal.aborted && !(error instanceof TypeError)) throw error;
        if (!canRetry) {
          if (request.signal.aborted) throw new Error('Road network request timed out. Please try again.');
          throw error;
        }
        reason = request.signal.aborted ? "timeout" : "network";
        response = undefined;
      }
      if (response?.ok) {
        const timedOut = typeof data?.remark === 'string' && /timed out|timeout/i.test(data.remark);
        if (!timedOut) return { data };
        reason = "timeout";
        if (!canRetry) throw new Error('Road network request timed out. Please try again.');
      } else if (response) {
        const busy = [502, 503, 504].includes(response.status);
        const now = Date.now();
        const retryAfter = retryAfterMs(response, now);
        if (response.status === 429 || capacityMessage || (busy && retryAfter !== undefined)) {
          const rateLimited = response.status === 429;
          const delay = retryAfter ?? (rateLimited ? 60_000 : options.capacityBackoffMs ?? 15_000);
          options.onRateLimit(now + delay, rateLimited ? "rate-limit" : "capacity");
          const summary = rateLimited ? "Road server is rate-limited (429)." : "Road service is at capacity.";
          throw new Error(`${summary} Try again in ${Math.ceil(delay / 1000)} seconds.`);
        }
        if (areaLimit) {
          if (canRetry && options.splitQueries) return { reason: "area-limit" as const };
          throw new Error(areaLimit);
        }
        if (response.status === 504) reason = "timeout";
        if (!busy || !canRetry) throw new Error(busy
          ? `Road server is temporarily unavailable (${response.status}). Please try again shortly.`
          : `Road request failed (${response.status}). Please try again later.`);
      }
    } finally {
      clearTimeout(timer);
      signal.removeEventListener('abort', abort);
    }
    return { reason };
  };

  const first = await read(query, true);
  if (!first.reason) return first.data;
  const split = (first.reason === "timeout" || first.reason === "area-limit") && options.splitQueries;
  options.onRetry(first.reason);
  if (first.reason !== "area-limit") await options.delay(3000, signal);
  if (!split) return (await read(query, false)).data;

  const ways = new Map<number | string, unknown>();
  for (const part of split) {
    const { data } = await read(part, false, 18_000);
    if (!data || data.remark || !Array.isArray(data.elements)) throw new Error('Road server returned incomplete data. Previous results are preserved.');
    for (const element of data.elements) {
      if (element?.type === "way" && element.id != null) ways.set(element.id, element);
    }
  }
  return { elements: [...ways.values()] };
}
