import { listenForViewerResize, observeViewerContainer } from './viewerResize';
import { imageryTooltipStyle } from '../../styles/imageryHoverCard';

/** Startup-only configuration; layer/request implementations stay with their existing features. */
export interface StartupConfig {
  turboDefaultStartDate?: string;
  turboDefaultEndDate?: string;
  turboDefaultIsPano?: boolean;
  turboDefaultOnFoot?: boolean | null;
  turboDefaultColorByDate?: boolean;
  turboCreator?: string;
}
interface StartupPresets {
  turboFilterStartDate: string;
  turboFilterEndDate: string;
  turboFilterIsPano: boolean | undefined;
  turboFilterOnFoot?: boolean;
  turboColorByDate: boolean;
}
/** Existing instance-owned invalidation and DOM slots. This coordinator creates no parallel lifetime owner. */
export interface StartupResources {
  startupRevision: number;
  startupDisposed: boolean;
  startupAbort: AbortController;
  spritePreloadTimer: ReturnType<typeof setTimeout> | null;
  introDismissTimer: ReturnType<typeof setTimeout> | null;
  overrideStyleSheet: HTMLStyleElement | null;
}
/** Live mount capabilities; React, ExB and concrete SDK/layer types stay at the widget boundary. */
export interface WidgetStartupHost extends StartupResources {
  readonly config: StartupConfig;
  readonly viewer: { resize(): void } | null;
  resizeObserver: ResizeObserver | null;
  tooltipDiv: HTMLDivElement | null;
  readonly sequenceVisibilityChange: () => void;
  readonly handleFullscreenChange: () => void;
  readonly handleWindowResize: () => void;
  readonly handleNudgeKeyDown: (event: KeyboardEvent) => void;
  readonly handleNudgeKeyUp: (event: KeyboardEvent) => void;
  readonly overrideStyles: string;
  container(): HTMLElement | null;
  syncSequenceDiagnostics(): void;
  updateOrganizationName(): unknown;
  installCoverageAlignmentDiagnostic(): void;
  initializePlacesLifecycle(): void;
  ensureArcGISModules(): Promise<unknown>;
  getUserIdFromUsername(username: string): Promise<number | undefined>;
  log(message: string): void;
  initMapillaryLayer(id: number | undefined, start: string | undefined, end: string | undefined, pano: boolean | undefined, quality: false): void;
  initMapillaryTrafficSignsLayer(): void;
  initMapillaryObjectsLayer(): void;
  applyPresets(presets: StartupPresets): void;
  setCreator(username: string): void;
  enableNativeCoverage(): void;
  restoreSequenceCache(): void;
  loadFieldNotesFromStorage(): void;
  syncSharedFieldNotes(): unknown;
  preloadTrafficSignOptions(): unknown;
  preloadObjectOptions(): unknown;
  ensureAlwaysOnCoverageLayer(): void;
  syncMapLegendLayer(): void;
}

/** Initialize one mount in the original order, checking its revision after asynchronous startup work.
 * Presets precede layer creation; deferred sprite work and injected DOM retain instance-owned cleanup slots.
 * Errors during module/preset setup are reported before the existing remaining startup steps continue.
 */
export async function mountWidget(host: WidgetStartupHost): Promise<void> {
    const startupRevision = ++host.startupRevision;
    if (host.startupDisposed) { host.startupDisposed = false; host.startupAbort = new AbortController(); }
    const currentStartup = () => !host.startupDisposed && startupRevision === host.startupRevision;
    host.syncSequenceDiagnostics();
    document.addEventListener('visibilitychange', host.sequenceVisibilityChange);
    void host.updateOrganizationName();
    host.installCoverageAlignmentDiagnostic();
    host.initializePlacesLifecycle();
    try {
      await host.ensureArcGISModules();
      if (!currentStartup()) return;

      // Apply creator/date presets before any coverage layer is created.
      const presetStartDate = host.config.turboDefaultStartDate || undefined;
      const presetEndDate = host.config.turboDefaultEndDate || undefined;
      const presetIsPano = host.config.turboDefaultIsPano ?? undefined;
      const presetOnFoot = host.config.turboDefaultOnFoot;
      const presetColorByDate = host.config.turboDefaultColorByDate ?? false;

      let defaultFilterId: number | undefined = undefined;
      if (host.config.turboCreator) {
        defaultFilterId = await host.getUserIdFromUsername(host.config.turboCreator);
        if (!currentStartup()) return;
        if (defaultFilterId) host.log(`Initializing Always-On layer for user ID: ${defaultFilterId}`);
      }

      host.initMapillaryLayer(defaultFilterId, presetStartDate, presetEndDate, presetIsPano, false);
      host.initMapillaryTrafficSignsLayer();
      host.initMapillaryObjectsLayer();

      host.applyPresets({
        turboFilterStartDate: presetStartDate || "",
        turboFilterEndDate: presetEndDate || "",
        turboFilterIsPano: presetIsPano,
        ...(typeof presetOnFoot === "boolean" ? { turboFilterOnFoot: presetOnFoot } : {}),
        turboColorByDate: presetColorByDate,
      });
    } catch (err) {
      if (!currentStartup()) return;
      console.error("ArcGIS modules failed to load:", err);
    }

    if (!currentStartup()) return;

    // Restore any cached sequence from previous session
    host.restoreSequenceCache();
    host.loadFieldNotesFromStorage();
    void host.syncSharedFieldNotes();

    observeViewerContainer(host);
    listenForViewerResize(host);

    // Add keyboard listener for W, A, S, D Point Cloud Nudging
    window.addEventListener("keydown", host.handleNudgeKeyDown);
    window.addEventListener("keyup", host.handleNudgeKeyUp);

    host.tooltipDiv = document.createElement("div");
    Object.assign(host.tooltipDiv.style, imageryTooltipStyle);
    document.body.appendChild(host.tooltipDiv);

    // Defer the heavy processing by 500ms to let the Map widget render first
    host.spritePreloadTimer = setTimeout(() => {
      host.spritePreloadTimer = null;
      if (!currentStartup()) return;
      host.preloadTrafficSignOptions();
      host.preloadObjectOptions();
    }, 500);

    const styleSheet = document.createElement("style");
    styleSheet.innerText = host.overrideStyles;
    host.overrideStyleSheet = styleSheet;
    document.head.appendChild(styleSheet);

    if (host.config.turboCreator) {
      host.setCreator(host.config.turboCreator);
    }

    host.enableNativeCoverage();

    // Check if we need to add the "Always On" layer now
    // If the MapView loaded BEFORE these modules, onActiveViewChange skipped the add.
    host.ensureAlwaysOnCoverageLayer();
    host.syncMapLegendLayer();
}

/** Invalidate pending startup before teardown and release only this instance's timers and stylesheet. */
export function disposeWidgetStartup(host: StartupResources): void {
    // Invalidate startup before teardown so late awaits cannot recreate resources.
    host.startupDisposed = true;
    ++host.startupRevision;
    host.startupAbort.abort();
    if (host.spritePreloadTimer !== null) clearTimeout(host.spritePreloadTimer);
    if (host.introDismissTimer !== null) clearTimeout(host.introDismissTimer);
    host.spritePreloadTimer = host.introDismissTimer = null;
    host.overrideStyleSheet?.remove(); host.overrideStyleSheet = null;
}
