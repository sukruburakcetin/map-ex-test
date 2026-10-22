import { SHARE_PARAMS } from '../../utils/constants';

/** Point access used by URL serialization; SDK projection remains supplied by the host. */
export interface UrlStatePoint {
  longitude: number | null | undefined;
  latitude: number | null | undefined;
  x: number;
  y: number;
  spatialReference?: { isWGS84?: boolean } | null;
}
export interface UrlStateView<P> { center: P | null | undefined; zoom: number; type: string; }
export interface UrlStateWindow {
  self: unknown;
  top: unknown;
  parent?: UrlStateWindow | null;
  location: { href: string };
  history: { replaceState(data: unknown, title: string, url: string): void };
}
export interface BrowserUrlStateHost<P> {
  getView(): UrlStateView<P> | null | undefined;
  toGeographic(center: P): P | null;
  getWindow(): UrlStateWindow;
  getBearing(): number;
  warn(error: unknown): void;
}

/** Write the existing bookmark contract without adding history entries or navigation.
 * Serializes map centre (not image coordinates): lat/lon use six decimal places,
 * zoom/bearing one. Retains unrelated query parameters, clears the transient hash,
 * and uses parent history when framed. Cross-origin/SDK/history errors are reported
 * through the host's existing warning. Bearing remains present in map-only URLs,
 * including the original delete/reinsert order; changing that is a separate behavior change.
 * No listeners, timers, debounce, caches or requests are created by this module.
 */
export function syncBrowserUrl<P extends UrlStatePoint>(imageId: string | null | undefined,
  host: BrowserUrlStateHost<P>): void {
    try {
      const view = host.getView();
      if (!view) return;

      const center = view.center;

      /*
       * SceneView / MapView may briefly have
       * no center while Experience Builder is
       * switching between 2D and 3D.
       *
       * Never touch x/y until we've confirmed
       * the Point exists.
       */
      if (!center) {
        return;
      }

      let geoCenter: P;

      if (center.spatialReference?.isWGS84) {
        geoCenter = center;
      } else {
        const converted = host.toGeographic(center);

        if (!converted) {
          return;
        }

        geoCenter = converted;
      }

      const lon = geoCenter.longitude ?? geoCenter.x;

      const lat = geoCenter.latitude ?? geoCenter.y;

      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return;
      }

      const browserWindow = host.getWindow();
      const targetWindow = browserWindow.self !== browserWindow.top && browserWindow.parent ? browserWindow.parent : browserWindow;

      const url = new URL(targetWindow.location.href);

      /*
       * MAP viewport state
       */
      url.searchParams.set(SHARE_PARAMS.LAT, lat.toFixed(6));

      url.searchParams.set(SHARE_PARAMS.LON, lon.toFixed(6));

      url.searchParams.set(SHARE_PARAMS.ZOOM, Number.isFinite(view.zoom) ? view.zoom.toFixed(1) : "");

      url.searchParams.set(SHARE_PARAMS.MAP_TYPE, view.type === "3d" ? "3d" : "2d");

      /*
       * MAPILLARY viewer state
       */
      if (imageId) {
        url.searchParams.set(SHARE_PARAMS.IMAGE_ID, imageId);

        url.searchParams.set(SHARE_PARAMS.BEARING, host.getBearing().toFixed(1));
      } else {
        /*
         * Pure map state:
         * no Mapillary image has been selected yet.
         */
        url.searchParams.delete(SHARE_PARAMS.IMAGE_ID);

        url.searchParams.delete(SHARE_PARAMS.BEARING);
      }

      url.searchParams.set(SHARE_PARAMS.BEARING, host.getBearing().toFixed(1));

      // Remove transient Experience Builder
      // data-source selection state.
      url.hash = "";

      targetWindow.history.replaceState(null, "", url.toString());
    } catch (err) {
      host.warn(err);
    }
  }

/** Browser boundary for copying the already-synchronized bookmark URL. */
export interface BrowserShareLinkHost {
  getWindow(): UrlStateWindow & { isSecureContext?: boolean };
  getClipboard(): Pick<Clipboard, 'writeText'> | undefined;
  getDocument(): Document;
  onCopied(method: 'clipboard' | 'textarea'): void;
  onFailure(): void;
  onError(error: unknown): void;
}

/** Copy the current parent/top-level URL without rebuilding or navigating it.
 * Retains secure clipboard first, then the existing offscreen textarea fallback,
 * focus/select/copy/remove order, and distinct feedback for both success paths.
 * Cross-origin/read failures use the existing error callback without a fallback URL.
 * Runtime owns image-selection eligibility and toast presentation.
 */
export async function copyBrowserShareLink(host: BrowserShareLinkHost): Promise<void> {
  try {
    const browserWindow = host.getWindow();
    const targetWindow = browserWindow.self !== browserWindow.top && browserWindow.parent ? browserWindow.parent : browserWindow;
    const urlString = targetWindow.location.href;
    if (host.getClipboard() && browserWindow.isSecureContext) {
      try {
        await host.getClipboard()!.writeText(urlString);
        host.onCopied('clipboard');
        return;
      } catch (error) {}
    }
    try {
      const document = host.getDocument();
      const textArea = document.createElement('textarea');
      textArea.value = urlString;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) { host.onCopied('textarea'); return; }
    } catch (error) {}
    host.onFailure();
  } catch (error) { host.onError(error); }
}
