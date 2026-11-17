export function throwIfRoutingAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new DOMException('Routing cancelled', 'AbortError');
}
