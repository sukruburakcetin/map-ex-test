/** Prepare a replacement while its displayed predecessor remains untouched. */
export interface PreparedTileHost<L> {
  create(style: any, previous: L | null): L;
  attach(layer: L, previous: L | null): void;
  ready(layer: L, signal: AbortSignal): Promise<void>;
  commit(layer: L, previous: L | null): void;
  discard(layer: L): void;
}

export async function prepareVectorTileLayer<L>(host: PreparedTileHost<L>, style: any,
  previous: L | null, signal: AbortSignal): Promise<L> {
  const check = () => { if (signal.aborted) throw new DOMException('Cancelled', 'AbortError'); };
  check();
  const layer = host.create(style, previous);
  let committed = false;
  try {
    host.attach(layer, previous);
    await host.ready(layer, signal);
    check();
    host.commit(layer, previous);
    committed = true;
    return layer;
  } finally {
    if (!committed) host.discard(layer);
  }
}
