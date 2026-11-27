import { OVERPASS_ROAD_QUERY, STREET_COVERAGE_CONFIG } from '../../utils/constants';
import { classifyCoverageAsync, coverageAnalysisDelay, insetBbox, parseOverpassRoads, segmentMidpointInBbox, type RoadSegment } from '../../utils/geoUtils';
import type { TurboBbox, TurboFilters, TurboPoint } from '../../utils/turboCoverageUtils';
import type { LocaleValue } from '../../i18n/WidgetLocale';
import { fetchFeatureLayerRoads, isRoadFeatureLayer } from './fetchFeatureLayerRoads';
import { fetchCoverageRoads, type RoadCooldownReason } from './fetchCoverageRoads';

interface Extent { xmin: number; ymin: number; xmax: number; ymax: number }
interface AnalysisView { extent?: Extent | null; destroyed?: boolean }
interface AnalysisStatus { coverageAnalysisLoading?: boolean; coverageAnalysisProgress?: string }
type Coverage = Awaited<ReturnType<typeof classifyCoverageAsync>>;

export interface CoverageAnalysisHost<View extends AnalysisView> {
  map(): { view: View } | null;
  loading(): boolean;
  coverageReady(): boolean;
  filters(): TurboFilters;
  username(): string;
  configuredUsername(): string | undefined;
  roadEndpoint?(): string | undefined;
  token(): string;
  turboActive(): boolean;
  watchExtent(view: View, callback: () => void): { remove(): void };
  geographic(view: View): Extent;
  visitCoverage(bbox: TurboBbox, filters: TurboFilters, signal: AbortSignal, visit: (point: TurboPoint) => void): Promise<void>;
  translate: LocaleValue['t'];
  owned(message: string): string;
  formatNumber(value: number): string;
  showToast(message: string, duration?: number): void;
  showCooldown(seconds: number): void;
  update(patch: AnalysisStatus): void;
  publish(bbox: TurboBbox, innerBbox: TurboBbox, segments: RoadSegment[], coverage: Coverage): void;
  log(message: string): void;
}

/** Owns coverage analysis from road fetch through guarded result publication. */
export class CoverageAnalysisRun<View extends AnalysisView> {
  private retryAt = 0;
  private cooldownReason: RoadCooldownReason = "rate-limit";
  private capacityFailures = 0;
  private roadCache?: { view: View; area: string; expires: number; segments: RoadSegment[] };
  private lastRoadEndpoint: string | undefined;
  private controller: AbortController | null = null;
  private revision = 0;
  private current: (() => boolean) | null = null;

  constructor(private readonly host: CoverageAnalysisHost<View>) {}

  get currentCheck(): (() => boolean) | null { return this.current; }

  cancel(): void {
    ++this.revision;
    this.current = null;
    this.controller?.abort();
    this.controller = null;
    this.host.update({ coverageAnalysisLoading: false, coverageAnalysisProgress: undefined });
  }

  async run() {
    const host = this.host;
    const map = host.map();
    if (host.loading() || this.controller) return;
    if (!map || !host.coverageReady()) {
      host.showToast(host.translate('appCoverageIsStillLoadingTryAgainWhenItIs'), 4000);
      return;
    }
    const view = map.view;
    const extentKey = () => view.extent ? [view.extent.xmin, view.extent.ymin, view.extent.xmax, view.extent.ymax].join('/') : '';
    const area = extentKey();
    const roadEndpoint = host.roadEndpoint?.();
    if (this.lastRoadEndpoint !== roadEndpoint) {
      this.retryAt = 0;
      this.capacityFailures = 0;
      this.roadCache = undefined;
      this.lastRoadEndpoint = roadEndpoint;
    }
    const cached = this.roadCache;
    const cachedSegments = cached && cached.view === view && cached.area === area && cached.expires > Date.now()
      ? cached.segments : undefined;
    if (!cachedSegments && Date.now() < this.retryAt) {
      const seconds = Math.ceil((this.retryAt - Date.now()) / 1000);
      if (this.cooldownReason === "capacity") {
        host.showToast(host.owned(`Road service is at capacity. Try again in ${seconds} seconds.`), 5000);
      } else {
        host.showCooldown(seconds);
      }
      return;
    }

    this.cancel();
    const revision = this.revision;
    const controller = new AbortController();
    this.controller = controller;
    const signal = controller.signal;
    const filters = host.filters();
    const inputKey = () => JSON.stringify({
      filters: host.filters(), username: host.username(),
      configuredUsername: host.configuredUsername(), roadEndpoint: host.roadEndpoint?.(), token: host.token()
    });
    const key = inputKey();
    const current = () => !signal.aborted && revision === this.revision && !view.destroyed &&
      host.map()?.view === view && host.turboActive() && key === inputKey() && area === extentKey();
    this.current = current;
    const areaWatch = host.watchExtent(view, () => {
      if (!signal.aborted && !current()) {
        this.cancel();
        host.showToast(host.translate('appAnalysisStoppedBecauseTheMapAreaChangedRunIt'), 5000);
      }
    });
    const progress = (message: string) => { if (current()) host.update({ coverageAnalysisProgress: message }); };
    host.update({ coverageAnalysisLoading: true, coverageAnalysisProgress: host.owned("Fetching streets…") });
    let stage: "roads" | "imagery" | "classification" = "roads";

    try {
      // 1. Current View Bounding Box
      const geo = host.geographic(map.view);
      const { xmin: west, ymin: south, xmax: east, ymax: north } = geo;

      let segments = cachedSegments;
      if (!segments) {
        if (roadEndpoint && isRoadFeatureLayer(roadEndpoint)) {
          segments = await fetchFeatureLayerRoads(roadEndpoint, [west, south, east, north], signal);
          if (!current()) return;
        } else {
          // 2. Fetch OSM Road Network (with Overpass retry mechanism)
          const query = OVERPASS_ROAD_QUERY(south, west, north, east);
          const midLatitude = (north + south) / 2;
          const midLongitude = (east + west) / 2;
          const splitQueries: [string, string] = (east - west) * Math.cos(midLatitude * Math.PI / 180) >= north - south
            ? [OVERPASS_ROAD_QUERY(south, west, north, midLongitude, 12), OVERPASS_ROAD_QUERY(south, midLongitude, north, east, 12)]
            : [OVERPASS_ROAD_QUERY(south, west, midLatitude, east, 12), OVERPASS_ROAD_QUERY(midLatitude, west, north, east, 12)];
          const osmData = await fetchCoverageRoads(query, signal, {
            splitQueries,
            fetch: (url, options) => fetch(url, options), delay: coverageAnalysisDelay, endpoint: roadEndpoint,
            onRetry: reason => progress(host.owned(reason === "timeout" ? "Road request timed out. Loading smaller road areas…"
              : reason === "area-limit" ? "Road area is large. Loading it in two parts…"
              : reason === "network" ? "Could not reach the road service. Retrying…"
                : "Road service temporarily unavailable. Retrying…")),
            capacityBackoffMs: 15_000 * 2 ** this.capacityFailures,
            onRateLimit: (retryAt, reason) => {
              if (!current()) return;
              this.retryAt = retryAt;
              this.cooldownReason = reason;
              if (reason === "capacity") this.capacityFailures = Math.min(this.capacityFailures + 1, 2);
            },
          });
          if (!current()) return;
          if (!osmData || osmData.remark || !Array.isArray(osmData.elements)) throw new Error("Road server returned incomplete data. Please retry later; previous results are preserved.");
          this.capacityFailures = 0;
          segments = parseOverpassRoads(osmData);
        }
        if (segments.length && segments.length <= 100_000) {
          this.roadCache = { view, area, expires: Date.now() + 10 * 60_000, segments };
        }
      }
      if (!segments.length) {
        host.showToast(host.translate('appNoRoadNetworkFoundInThisArea'));
        return;
      }

      // 3. Inset Inner Bounding Box (Edge Truncation Filter)
      const innerBbox = insetBbox([west, south, east, north], STREET_COVERAGE_CONFIG.ANALYSIS_INSET_METERS);
      const innerSegments = segments.filter((seg) => segmentMidpointInBbox(seg, innerBbox));
      if (!innerSegments.length) {
        host.showToast(host.translate('appAnalysisAreaTooSmallAfterEdgeFilteringZoomOut'));
        return;
      }

      host.log(`Coverage analysis: ${segments.length} total segments → ${innerSegments.length} inner segments (${segments.length - innerSegments.length} edge segments excluded)`);

      stage = "imagery";
      progress("Loading imagery coverage…");

      // 5. Visit the original filtered tile points, not a sampled display layer.
      let points: [number, number][] = [];
      let pointTimestamps: (number | null)[] = [];
      await host.visitCoverage([west, south, east, north], filters, signal, (point: TurboPoint) => {
        points.push([point.lon, point.lat]);
        pointTimestamps.push(point.capturedAt);
        if (points.length % 25000 === 0) progress(`Loading imagery: ${host.formatNumber(points.length)} points…`);
      });
      if (!current()) return;
      if (!points.length) {
        host.showToast(host.translate('appNoCoveragePointsFoundForThisAreaAndThe'));
        return;
      }

      // 6. Snap Points to Road Segments & Classify Tiers
      stage = "classification";
      progress("Classifying roads…");
      const coverage = await classifyCoverageAsync(
        points,
        innerSegments,
        STREET_COVERAGE_CONFIG.SNAP_THRESHOLD_METERS,
        STREET_COVERAGE_CONFIG.MIN_POINTS_PER_SEGMENT,
        STREET_COVERAGE_CONFIG.HIGHWAY_THRESHOLDS,
        pointTimestamps,
        {
          signal, onProgress: (completed: number, total: number) => progress(completed === 0 ? "Indexing imagery…" : `Classifying roads: ${host.formatNumber(completed)} / ${host.formatNumber(total)}`),
          onTransferred: () => { points = []; pointTimestamps = []; }
        },
      );
      if (!current()) return;

      // 7. Store Results in State
      host.publish([west, south, east, north], innerBbox, innerSegments, coverage);
      host.log(`Coverage: ${coverage.percentCovered}% covered; fresh:${coverage.freshCount} aging:${coverage.agingCount} stale:${coverage.staleCount} none:${coverage.noneCount}`);
    } catch (err) {
      if (!current()) return;
      console.error("Coverage analysis failed:", err);

      const isTimeout = err instanceof DOMException && err.name === "AbortError";

      const message = isTimeout ? "Road network request timed out. Please try again later."
        : err instanceof TypeError && /fetch|network/i.test(err.message)
          ? stage === "roads" ? "Could not reach the road server. Check your connection or try again later."
            : stage === "imagery" ? "Mapillary imagery coverage could not load. Check your connection or try again later."
              : "Background analysis could not finish. Please retry."
          : err instanceof Error ? err.message : "Coverage analysis failed. Please retry.";
      host.showToast(message, 5000);
    } finally {
      areaWatch.remove();
      if (revision === this.revision) {
        this.controller = null;
        this.current = null;
        host.update({ coverageAnalysisLoading: false, coverageAnalysisProgress: undefined });
      }
    }
  }
}
