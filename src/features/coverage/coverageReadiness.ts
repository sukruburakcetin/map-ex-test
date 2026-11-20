/** Minimal layer-view contract; the widget supplies the actual ArcGIS view/layer. */
export interface CoverageReadinessView<Layer> {
  whenLayerView(layer: Layer): Promise<{
    updating: boolean;
    watch(property: "updating", callback: (updating: boolean) => void): { remove(): void };
  }>;
}

/** Wait for visible coverage using the existing timeout, abort and watcher lifecycle. */
export async function waitForCoverageReady<Layer>(view: CoverageReadinessView<Layer>, layer: Layer, signal: AbortSignal): Promise<void> {
  const cancelled = () => new DOMException("Cancelled", "AbortError");
  if (signal.aborted) throw cancelled();
  await new Promise<void>((resolve, reject) => {
    let handle: { remove(): void } | undefined;
    let settled = false;
    let deadline: ReturnType<typeof setTimeout> | undefined;
    const finish = (error?: unknown) => {
      if (settled) return;
      settled = true; if (deadline) clearTimeout(deadline); handle?.remove(); signal.removeEventListener("abort", abort);
      if (error) reject(error); else resolve();
    };
    const abort = () => finish(cancelled());
    signal.addEventListener("abort", abort, { once: true });
    // SceneView can keep updating at globe scale. Do not leave UX pending forever.
    deadline = setTimeout(() => finish(new Error("Coverage readiness timed out")), 15000);
    view.whenLayerView(layer).then(layerView => {
      if (settled) return;
      handle = layerView.watch("updating", updating => { if (!updating) finish(); });
      if (!layerView.updating) finish();
    }).catch(error => finish(error));
  });
}
