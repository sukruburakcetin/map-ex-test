interface ResizableViewer {
  resize?: () => void;
}

interface ViewerObservation {
  readonly viewer: ResizableViewer | null;
  resizeObserver: ResizeObserver | null;
  container(): HTMLElement | null;
}

interface ViewerResizeListeners {
  readonly handleFullscreenChange: () => void;
  readonly handleWindowResize: () => void;
}

const fullscreenEvents = [
  "fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "MSFullscreenChange",
];

export function observeViewerContainer(host: ViewerObservation, replace = false): void {
  if (replace) host.resizeObserver?.disconnect();
  host.resizeObserver = new ResizeObserver(() => host.viewer?.resize?.());
  const container = host.container();
  if (container) host.resizeObserver.observe(container);
}

export function releaseViewerObservation(host: Pick<ViewerObservation, "container" | "resizeObserver">): void {
  const observer = host.resizeObserver;
  if (!observer) return;
  const container = host.container();
  if (container) observer.unobserve(container);
  observer.disconnect();
  host.resizeObserver = null;
}

export function listenForViewerResize(host: ViewerResizeListeners): void {
  for (const event of fullscreenEvents) document.addEventListener(event, host.handleFullscreenChange);
  window.addEventListener("resize", host.handleWindowResize);
}

export function unlistenForViewerResize(host: ViewerResizeListeners): void {
  for (const event of fullscreenEvents) document.removeEventListener(event, host.handleFullscreenChange);
  window.removeEventListener("resize", host.handleWindowResize);
}

export function resizeForBrowserFullscreen(viewer: ResizableViewer | null): void {
  try {
    viewer?.resize?.();
  } catch {
    console.warn("Viewer resize suppressed during fullscreen toggle");
  }
}

export function resizeForWindow(viewer: ResizableViewer | null, restoreCamera: () => void): void {
  if (!viewer?.resize) return;
  try {
    viewer.resize();
    restoreCamera();
  } catch {
    // The viewer can be hidden or destroyed during window resize.
  }
}
