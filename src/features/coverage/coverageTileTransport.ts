/** Stable widget bindings; cache/request ownership remains with the caller. */
export interface CoverageTileTransportHost {
  getToken(): string;
  begin(): { finish(): void; cancel(): void } | undefined;
  count(): void;
  publish(key: string, buffer: ArrayBuffer): void;
}

/** Existing bounded tile transport, including retry and token-valid cache publication. */
export async function fetchCoverageTile(tile: [number, number, number], signal: AbortSignal, token: string, urlTemplate: string, host: CoverageTileTransportHost): Promise<ArrayBuffer> {
  const [x, y, z] = tile, key = `${z}/${x}/${y}`;
  const url = `${urlTemplate.replace("{z}", String(z)).replace("{x}", String(x)).replace("{y}", String(y))}?access_token=${token}`;
  const timing = host.begin();
  host.count();
  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
      try {
        const response = await fetch(url, { signal });
        if (response.status === 204 || response.status === 404) {
          if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
          const empty = new ArrayBuffer(0);
          if (host.getToken() !== token) throw new DOMException("Cancelled", "AbortError");
          host.publish(key, empty); timing?.finish();
          return empty;
        }
        if (!response.ok) {
          if (attempt === 0 && (response.status === 429 || response.status >= 500)) {
            await new Promise(resolve => setTimeout(resolve, 200));
            continue;
          }
          const error = new Error(`Turbo tile ${key}: HTTP ${response.status}`) as Error & { status: number };
          error.status = response.status;
          throw error;
        }
        const buffer = await response.arrayBuffer();
        if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
        if (host.getToken() !== token) throw new DOMException("Cancelled", "AbortError");
        host.publish(key, buffer); timing?.finish();
        return buffer;
      } catch (err) {
        const status = (err as any)?.status;
        if (signal.aborted || (err as any)?.name === "AbortError" || attempt === 1 || (status && status !== 429 && status < 500)) throw err;
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    throw new Error(`Turbo tile ${key} could not load`);
  } finally { timing?.cancel(); }
}
