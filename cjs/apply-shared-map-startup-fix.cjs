#!/usr/bin/env node
'use strict';
/** Shared map startup and legend ownership installer. Plain source payload.
 * Validates all targets before writes. Preserves existing source bytes in local
 * backups, rejects links/conflicts, and rolls back its writes on failure.
 * --skip-tests skips test file writes/removals; it does not run tests.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const skipTests = args.includes('--skip-tests') || args.includes('--skip-test');
const uninstall = args.includes('--uninstall');
const payload = { entries: [
  { file: "src/runtime/widget.tsx", blocks: [
    { label: "src/runtime/widget.tsx startup block 1", before: `  private _turboRequestCount: number = 0;
  private _hasCheckedSharedState: boolean = false;
  private _sharedStateRestoreComplete: boolean = false;
`,
      after: `  private _turboRequestCount: number = 0;
  private _viewStartupRevision = 0;
  private _startupUrlParameters: URLSearchParams | null = null;
  private _sharedStateRestoreComplete: boolean = false;
` },
    { label: "src/runtime/widget.tsx startup block 2", before: `    if (!view || !this.ArcGISModules?.FeatureLayer || this.props.config.hideLegend) { this.clearMapLegendLayer(); return; }
    this._mapSymbolLegend ??= new MapSymbolLegend(properties => new this.ArcGISModules.FeatureLayer(properties));
`,
      after: `    if (!view || !this.ArcGISModules?.FeatureLayer || this.props.config.hideLegend) { this.clearMapLegendLayer(); return; }
    if (view.destroyed || view.ready === false) return;
    const targetType = this._startupUrlParameters?.get(SHARE_PARAMS.MAP_TYPE);
    // The host may expose its default 3D view before switching to a shared 2D view.
    if (!this._sharedStateRestoreComplete && (targetType === "2d" || targetType === "3d") && view.type !== targetType) return;
    this._mapSymbolLegend ??= new MapSymbolLegend(properties => new this.ArcGISModules.FeatureLayer(properties));
` },
    { label: "src/runtime/widget.tsx startup block 3", before: `    if (fullRemove) {
      this._sequenceRequests?.dispose(); this.clearSharedNotesView(); this.clearFieldNotesGroup(); }
`,
      after: `    if (fullRemove) {
      ++this._viewStartupRevision;
      this._isFlyInActive = false;
      this._sequenceRequests?.dispose(); this.clearSharedNotesView(); this.clearFieldNotesGroup(); }
` },
    { label: "src/runtime/widget.tsx startup block 4", before: `
  // Helper method to handle the shared URL
  private checkUrlForSharedState = async () => {
    // 1. Get the query string.
`,
      after: `
  /** Restore a shared link only after React, the view and ArcGIS modules are ready.
   * Coverage initializes independently so long sequence routes cannot block tiles.
   * The originating setup revision prevents stale views from owning restoration.
   */
  private async restoreSharedStateWhenReady(view: __esri.MapView | __esri.SceneView, current: () => boolean) {
    if (this._sharedStateRestoreComplete) return;
    try {
      await view.when();
      if (!current() || this._sharedStateRestoreComplete) return;
      await this.ensureArcGISModules();
      if (!current() || this._sharedStateRestoreComplete) return;
      await this.checkUrlForSharedState(current);
    } catch (error) {
      if (current() && (error as any)?.name !== "AbortError") console.warn("[MapView] Shared-link initialization failed:", error);
    }
  }

  // Helper method to handle the shared URL
  private checkUrlForSharedState = async (isStartupCurrent: () => boolean = () => true) => {
    const sharedView = this.state.jimuMapView?.view;
    if (!sharedView?.map || sharedView.destroyed) return;
    const sharedMap = sharedView.map;
    const current = () => isStartupCurrent() && this.state.jimuMapView?.view === sharedView &&
      sharedView.map === sharedMap && !sharedView.destroyed;
    if (!current()) return;
    // 1. Get the query string.
` },
    { label: "src/runtime/widget.tsx startup block 5", before: `    // because the widget runs in an iframe and its own URL won't have the params.
    const params = readSharedLinkParameters();

`,
      after: `    // because the widget runs in an iframe and its own URL won't have the params.
    const params = this._startupUrlParameters || readSharedLinkParameters();

` },
    { label: "src/runtime/widget.tsx startup block 6", before: `
    if (sharedId) {
      // MAP VIEW TYPE CHECK AND SWITCH
      const targetMapType = params.get(SHARE_PARAMS.MAP_TYPE); // '2d' or '3d'

      if (targetMapType && this.state.jimuMapView && !this._hasAttemptedMapSwitch) {
        const currentType = this.state.jimuMapView.view.type;

        // If the link was 2D but the map opened in 3D (or vice versa)
        if (currentType !== targetMapType) {
          this._hasAttemptedMapSwitch = true; // Ensure we only try this once
          try {
            const mvManager = MapViewManager.getInstance();
            const mapGroup = mvManager.getJimuMapViewGroup(this.state.jimuMapView.mapWidgetId);

            if (mapGroup) {
              this.log(\`Map mismatch: URL wants \${targetMapType}, current is \${currentType}. Switching...\`);

              // Reset the check flag so it runs AGAIN after the map switches
              this._hasCheckedSharedState = false;

              // Tell the Experience Builder Map Widget to toggle its 2D/3D state
              mapGroup.switchMap();

              // Exit now. The map will switch, trigger onActiveViewChange, and come back here automatically.
              return;
            }
          } catch (err) {
            console.warn("Could not auto-switch map view:", err);
          }
        }
      }

      this.log("Shared Mapillary ID found:", sharedId);
`,
      after: `
    // MAP VIEW TYPE CHECK AND SWITCH
    const targetMapType = params.get(SHARE_PARAMS.MAP_TYPE); // '2d' or '3d'

    if ((targetMapType === "2d" || targetMapType === "3d") && this.state.jimuMapView && !this._hasAttemptedMapSwitch) {
      const currentType = this.state.jimuMapView.view.type;

      // If the link was 2D but the map opened in 3D (or vice versa)
      if (currentType !== targetMapType) {
        try {
          const mvManager = MapViewManager.getInstance();
          const mapGroup = mvManager.getJimuMapViewGroup(this.state.jimuMapView.mapWidgetId);

          if (mapGroup) {
            this.log(\`Map mismatch: URL wants \${targetMapType}, current is \${currentType}. Switching...\`);

            this._hasAttemptedMapSwitch = true;
            // Observe asynchronous SDK switch failures; the new view starts its own setup.
            await mapGroup.switchMap();

            // Exit now. The map will switch, trigger onActiveViewChange, and come back here automatically.
            return;
          }
        } catch (err) {
          if (!current()) return;
          console.warn("Could not auto-switch map view:", err);
        }
      }
    }

    if (sharedId) {
      this.log("Shared Mapillary ID found:", sharedId);
` },
    { label: "src/runtime/widget.tsx startup block 7", before: `
        if (resp.ok) {
          const data = await resp.json();
          const seqId = data.sequence;
`,
      after: `
        if (!current()) return;
        if (resp.ok) {
          const data = await resp.json();
          if (!current()) return;
          const seqId = data.sequence;
` },
    { label: "src/runtime/widget.tsx startup block 8", before: `            await this.loadSequenceById(seqId, sharedId);

            // 2. ZOOM & CENTER the ArcGIS Map (Cinematic Fly-in)
            if (this.state.jimuMapView && this.ArcGISModules) {
              const view = this.state.jimuMapView.view;
              const { Point } = this.ArcGISModules;

              await restoreSharedMapCamera(view, coords, bearing, mapZoom, properties => new Point(properties));
            }

            // Write correct zoom to URL now while _isFlyInActive is still true
            // so the zoom watcher cannot interfere.
            if (this.state.jimuMapView) {
              const { imageId, sequenceImages } = this.state;
              const img = sequenceImages.find((s) => s.id === imageId);
              if (img) this.updateUrlWithCurrentImage(imageId!, img.lat, img.lon);
            }
`,
      after: `            await this.loadSequenceById(seqId, sharedId);
            if (!current()) return;

            // Restore only the originating view; a replacement owns its own camera.
            if (this.ArcGISModules) {
              const { Point } = this.ArcGISModules;
              await restoreSharedMapCamera(sharedView, coords, bearing, mapZoom, properties => new Point(properties));
              if (!current()) return;
            }
` },
    { label: "src/runtime/widget.tsx startup block 9", before: `            setTimeout(() => {
              this._isFlyInActive = false;
            }, 1500);
`,
      after: `            setTimeout(() => {
              if (current()) this._isFlyInActive = false;
            }, 1500);
` },
    { label: "src/runtime/widget.tsx startup block 10", before: `            //    image's compassAngle (same pattern used in _handleSelectAlternateImage).
            setTimeout(() => restoreSharedViewerBearing(sharedId, coords, bearing, this._sharedViewerBearingHost), 1000);
          }
`,
      after: `            //    image's compassAngle (same pattern used in _handleSelectAlternateImage).
            setTimeout(() => {
              if (current()) void restoreSharedViewerBearing(sharedId, coords, bearing, this._sharedViewerBearingHost);
            }, 1000);
          }
` },
    { label: "src/runtime/widget.tsx startup block 11", before: `      } catch (err) {
        console.error("Failed to load shared state", err);
      }
`,
      after: `      } catch (err) {
        if (current()) {
          this._isFlyInActive = false;
          if ((err as any)?.name !== "AbortError") console.error("Failed to load shared state", err);
        }
      }
` },
    { label: "src/runtime/widget.tsx startup block 12", before: `     */
    this._sharedStateRestoreComplete = true;
  };
`,
      after: `     */
    if (!sharedId && current()) {
      const latText = params.get(SHARE_PARAMS.LAT), lonText = params.get(SHARE_PARAMS.LON);
      const zoomText = params.get(SHARE_PARAMS.ZOOM), bearingText = params.get(SHARE_PARAMS.BEARING);
      const latitude = latText?.trim() ? Number(latText) : NaN;
      const longitude = lonText?.trim() ? Number(lonText) : NaN;
      const zoom = zoomText?.trim() ? Number(zoomText) : sharedView.zoom;
      const bearing = bearingText?.trim() ? Number(bearingText) : 0;
      if (Number.isFinite(latitude) && Math.abs(latitude) <= 90 && Number.isFinite(longitude) && Math.abs(longitude) <= 180 &&
          Number.isFinite(zoom) && Number.isFinite(bearing)) {
        this._isFlyInActive = true;
        try {
          const { Point } = this.ArcGISModules;
          await restoreSharedMapCamera(sharedView, [longitude, latitude], bearing, zoom, properties => new Point(properties));
        } catch (error) {
          if (current() && (error as any)?.name !== "AbortError") console.warn("[MapView] Could not restore the shared viewport:", error);
        } finally {
          if (current()) this._isFlyInActive = false;
        }
      }
    }
    if (current()) {
      this._sharedStateRestoreComplete = true;
      this.syncMapLegendLayer();
      this.updateUrlWithCurrentImage(this.state.imageId ?? undefined);
    }
  };
` },
    { label: "src/runtime/widget.tsx startup block 13", before: `    const requestId = ++this._turboRequestCount;
    this.beginTurboLoading(requestId);
    const task = this._turboLoadTask.then(async () => {
      if (controller.signal.aborted || requestId !== this._turboRequestCount) return;
      let loaded = false;
      try {
        await this.loadTurboCoverageLayer(forceUsernameFilter, requestId, controller);
        loaded = !!this.turboCoverageLayer;
      } catch (err) {
        if (!controller.signal.aborted && (err as any)?.name !== "AbortError") {
          console.warn("[Turbo] Coverage load failed", err);
`,
      after: `    const requestId = ++this._turboRequestCount;
    const view = this.state.jimuMapView?.view;
    const map = view?.map;
    const current = () => !!view && !!map && !controller.signal.aborted &&
      requestId === this._turboRequestCount && this.state.turboModeActive &&
      this.state.jimuMapView?.view === view && view.map === map && !view.destroyed;
    const attached = () => {
      const layer = this.turboCoverageLayer;
      return !!layer && !layer.destroyed && map?.findLayerById(LAYER_IDS.COVERAGE_VT) === layer;
    };
    this.beginTurboLoading(requestId);
    const task = this._turboLoadTask.then(async () => {
      let loaded = false;
      try {
        if (!current()) return;
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            await this.loadTurboCoverageLayer(forceUsernameFilter, requestId, controller);
            loaded = current() && attached();
            break;
          } catch (error) {
            const name = (error as any)?.name;
            // A current layer-view creation can abort during startup. Retry once;
            // detached layers and superseded views are owned by their newer request.
            if (attempt === 0 && current() && attached() &&
                (name === "AbortError" || name === "view:no-layerview-for-layer")) {
              this._loadedTurboFiltersKey = "";
              continue;
            }
            throw error;
          }
        }
      } catch (err) {
        if (current()) {
          console.warn("[Turbo] Coverage load failed", err);
` },
    { label: "src/runtime/widget.tsx startup block 14", before: `          this.finishTurboLoading();
          if (loaded && requestId === this._turboRequestCount) this.showTurboInteractionHelp();
        }
`,
      after: `          this.finishTurboLoading();
          if (loaded && current() && attached()) this.showTurboInteractionHelp();
        }
` },
    { label: "src/runtime/widget.tsx startup block 15", before: `    const current = () => !controller.signal.aborted && requestId === this._turboRequestCount && this.state.jimuMapView?.view === view && view.map === map && !view.destroyed;
    await this.ensureArcGISModules();
`,
      after: `    const current = () => !controller.signal.aborted && requestId === this._turboRequestCount && this.state.jimuMapView?.view === view && view.map === map && !view.destroyed;
    // Config and stationary callbacks also enter here before the active view is ready.
    await view.when();
    if (!current()) return;
    await this.ensureArcGISModules();
` },
    { label: "src/runtime/widget.tsx startup block 16", before: `    if (!view?.map || view.destroyed) return;
    this._pointCloudAdaptiveDisplay?.dispose();
`,
      after: `    if (!view?.map || view.destroyed) return;
    const startupRevision = ++this._viewStartupRevision;
    this._startupUrlParameters ??= readSharedLinkParameters();
    this._isFlyInActive = false;
    const startupMap = view.map;
    const viewStartupCurrent = () => startupRevision === this._viewStartupRevision &&
      this.state.jimuMapView?.view === view && view.map === startupMap && !view.destroyed;
    this._pointCloudAdaptiveDisplay?.dispose();
` },
    { label: "src/runtime/widget.tsx startup block 17", before: `    this.clearSharedNotesView();
    this.clearMapLegendLayer();
    this.clearSolarGraphics();
`,
      after: `    this.clearSharedNotesView();
    if (previousView?.map !== view.map) this.clearMapLegendLayer();
    this.clearSolarGraphics();
` },
    { label: "src/runtime/widget.tsx startup block 18", before: `        view.when(async () => {
          if (this.state.jimuMapView?.view !== view || !view.map || view.destroyed) {
            return;
`,
      after: `        view.when(async () => {
          if (!viewStartupCurrent()) {
            return;
` },
    { label: "src/runtime/widget.tsx startup block 19", before: `          await this.ensureArcGISModules();
          if (this.state.jimuMapView?.view !== view || !view.map || view.destroyed) return;
          await this.restoreRoutingLoginView(view);
          if (this.state.jimuMapView !== jmv || !view?.map) return;
          this.restoreMapGraphics();
`,
      after: `          await this.ensureArcGISModules();
          if (!viewStartupCurrent()) return;
          await this.restoreRoutingLoginView(view);
          if (!viewStartupCurrent()) return;
          this.restoreMapGraphics();
` },
    { label: "src/runtime/widget.tsx startup block 20", before: `          await this.enableTurboCoverageLayer();

`,
      after: `          await this.enableTurboCoverageLayer();
          if (!viewStartupCurrent()) return;

` },
    { label: "src/runtime/widget.tsx startup block 21", before: `        }).catch(error => {
          if (this.state.jimuMapView?.view === view && !view.destroyed) console.warn("[MapView] Resource restoration failed:", error);
        });
      },
    );
    // Ensure shared link is checked ONLY AFTER the map view is bound
    if (!this._hasCheckedSharedState) {
      this._hasCheckedSharedState = true;
      // Short delay to ensure React state has committed the map view
      setTimeout(() => {
        this.checkUrlForSharedState();
      }, 100);
    }

`,
      after: `        }).catch(error => {
          if (viewStartupCurrent() && (error as any)?.name !== "AbortError") console.warn("[MapView] Resource restoration failed:", error);
        });
        // Run independently of coverage/sequence loading, after this view is committed.
        void this.restoreSharedStateWhenReady(view, viewStartupCurrent);
      },
    );

` },
    { label: "src/runtime/widget.tsx startup block 22", before: `  private updateUrlWithCurrentImage(imageId?: string | null, _imageLat?: number, _imageLon?: number) {
    syncBrowserUrl(imageId, this._browserUrlStateHost);
`,
      after: `  private updateUrlWithCurrentImage(imageId?: string | null, _imageLat?: number, _imageLon?: number) {
    // Do not overwrite the incoming 2D/3D bookmark with the host's provisional view.
    if (!this._sharedStateRestoreComplete) return;
    syncBrowserUrl(imageId, this._browserUrlStateHost);
` },
  ] },
  { file: "src/features/map-graphics/MapSymbolLegend.ts", blocks: [
    { label: "src/features/map-graphics/MapSymbolLegend.ts startup block 1", before: `}
/** Owns the six map-symbol legend entries and removes the layer from its creating view.
 * Titles, labels and symbol properties stay together here. Host layers/renderers are never rewritten.
`,
      after: `}
/** Owns the six map-symbol legend entries and removes the layer from its creating map.
 * Titles, labels and symbol properties stay together here. Host layers/renderers are never rewritten.
` },
    { label: "src/features/map-graphics/MapSymbolLegend.ts startup block 2", before: `  layer: L | null = null;
  private view: V | null = null;
  private readonly createLayer: (properties: any) => L;
  constructor(createLayer: (properties: any) => L) { this.createLayer = createLayer; }
  /** Reuse the current view's legend or create its empty client-side FeatureLayer.
   * Widget ID scopes the layer identity; missing IDs retain the existing explorer fallback.
   * Runtime handles SDK readiness and the hideLegend configuration before calling this method.
   */
  sync(view: V, widgetId: string | null | undefined): void {
    if (this.view !== view) this.clear();
    if (this.layer) return;
`,
      after: `  layer: L | null = null;
  private map: NonNullable<SymbolLegendView<L>["map"]> | null = null;
  private readonly createLayer: (properties: any) => L;
  constructor(createLayer: (properties: any) => L) { this.createLayer = createLayer; }
  /** Reuse the current map's legend or create its empty client-side FeatureLayer.
   * Widget ID scopes the layer identity; missing IDs retain the existing explorer fallback.
   * Runtime handles SDK readiness and the hideLegend configuration before calling this method.
   * Different 2D/3D views sharing a map retain the same layer and host data source.
   */
  sync(view: V, widgetId: string | null | undefined): void {
    const map = view?.map;
    if (!map) { this.clear(); return; }
    if (this.map !== map) this.clear();
    if (this.layer) return;
` },
    { label: "src/features/map-graphics/MapSymbolLegend.ts startup block 3", before: `    });
    this.view = view; view.map!.add(this.layer);
  }
  /** Remove the legend from the original owning view, then destroy its layer.
   * Callers keep the existing clear order on view changes, hideLegend and widget teardown.
   */
  clear(): void {
    if (this.layer) { this.view?.map?.remove(this.layer); this.layer.destroy(); }
    this.layer = null; this.view = null;
  }
`,
      after: `    });
    this.map = map;
    try { map.add(this.layer); }
    catch (error) {
      // A failed SDK add must not leave a retained, unattached legend.
      try { this.clear(); } catch (_) { /* Preserve the original add failure. */ }
      throw error;
    }
  }
  /** Remove the legend from its saved creating map, then destroy its layer.
   * Releasing references first makes repeated or reentrant teardown safe, even if
   * the view now points at another map or SDK removal throws during a transition.
   */
  clear(): void {
    const layer = this.layer, map = this.map;
    this.layer = null; this.map = null;
    if (layer) {
      try { map?.remove(layer); }
      finally { layer.destroy(); }
    }
  }
` },
  ] },
], modules: [] };

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'shared-map-startup-';

function conflict(label) {
  throw new Error('Conflict in ' + label + '. No source files changed. Preserve local edits.');
}

/** Resolve a payload path and reject symbolic links, including parent folders. */
function targetFor(relative) {
  if (typeof relative !== 'string' || !relative || relative.includes('\\') || relative.includes(':') || relative.includes('\0')) throw new Error('Invalid patch path.');
  const parts = relative.split('/');
  if (parts.some(part => !part || part === '.' || part === '..')) throw new Error('Invalid patch path.');
  const target = path.resolve(root, ...parts);
  const relation = path.relative(root, target);
  if (!relation || relation.startsWith('..' + path.sep) || path.isAbsolute(relation)) throw new Error('Patch path escapes the widget folder.');
  let parent = root;
  for (let index = 0; index < parts.length; index++) {
    parent = path.join(parent, parts[index]);
    let stat;
    try { stat = fs.lstatSync(parent); } catch (error) { if (error.code === 'ENOENT') break; throw error; }
    if (stat.isSymbolicLink()) throw new Error('Symbolic links are not supported: ' + relative + '. No source files changed.');
    if (index < parts.length - 1 && !stat.isDirectory()) throw new Error('Parent path is not a folder: ' + relative);
    if (index === parts.length - 1 && !stat.isFile() && !stat.isDirectory()) throw new Error('Unsupported target type: ' + relative);
  }
  return target;
}

function readTarget(relative, required = false) {
  const file = targetFor(relative);
  let descriptor;
  try {
    descriptor = fs.openSync(file, fs.constants.O_RDONLY | noFollow);
    const stat = fs.fstatSync(descriptor);
    if (!stat.isFile()) throw new Error('Target is not a regular file: ' + relative);
    const bytes = fs.readFileSync(descriptor);
    return { file, bytes, mode: stat.mode, dev: stat.dev, ino: stat.ino };
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    if (required) throw new Error('Required file missing: ' + relative + '. No source files changed.');
    return { file, bytes: null };
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
}

function formatLike(text, original) {
  const raw = original.toString('utf8');
  const bom = raw.startsWith('\uFEFF') ? '\uFEFF' : '';
  return Buffer.from(bom + (raw.includes('\r\n') ? text.replace(/\n/g, '\r\n') : text));
}

/** Apply or reverse one exact insertion, preserving all text outside its anchors. */
function transformBlock(text, block, reverse) {
  const before = normalize(block.before), after = normalize(block.after);
  if (!before || !after || before === after) throw new Error('Invalid block: ' + block.label);
  const expected = reverse ? after : before;
  const replacement = reverse ? before : after;
  if (block.wholeFile) {
    if (text === replacement) return text;
    if (text !== expected) conflict(block.label);
    return replacement;
  }
  // Prefer the longest state when an insertion contains its original anchor.
  if (reverse) {
    const installedCount = count(text, after);
    if (installedCount === 1) return text.replace(after, () => before);
    if (installedCount > 1) conflict(block.label);
    if (count(text, before) === 1) {
      if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (partially edited diagnostic)');
      return text;
    }
    conflict(block.label);
  }
  const installedCount = count(text, after);
  if (installedCount === 1) return text;
  if (installedCount > 1) conflict(block.label);
  if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (existing declaration)');
  if (count(text, before) !== 1) conflict(block.label);
  return text.replace(before, () => after);
}

function ensureParents(relative) {
  const segments = relative.split('/');
  segments.pop();
  let current = '';
  for (const segment of segments) {
    current = current ? current + '/' + segment : segment;
    const directory = targetFor(current);
    try { fs.mkdirSync(directory); } catch (error) { if (error.code !== 'EEXIST') throw error; }
    const stat = fs.lstatSync(directory);
    if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Unsafe parent directory: ' + current);
  }
}

function assertUnchanged(item) {
  const latest = readTarget(item.relative);
  if (item.original === null ? latest.bytes !== null : latest.bytes === null || !latest.bytes.equals(item.original)) {
    throw new Error('File changed during validation: ' + item.relative + '. No source files changed.');
  }
}

function writeExact(descriptor, bytes) {
  let offset = 0;
  while (offset < bytes.length) {
    const written = fs.writeSync(descriptor, bytes, offset, bytes.length - offset, offset);
    if (!written) throw new Error('File write made no progress.');
    offset += written;
  }
}

/** Existing files are opened without truncation, then checked through that handle. */
function overwriteOriginal(item, bytes) {
  targetFor(item.relative);
  const descriptor = fs.openSync(item.file, fs.constants.O_RDWR | noFollow);
  try {
    const stat = fs.fstatSync(descriptor);
    const linked = fs.lstatSync(item.file);
    if (!stat.isFile() || linked.isSymbolicLink() || stat.dev !== linked.dev || stat.ino !== linked.ino || !fs.readFileSync(descriptor).equals(item.original)) throw new Error('File changed before write: ' + item.relative);
    item.started = true;
    fs.ftruncateSync(descriptor, 0);
    writeExact(descriptor, bytes);
    fs.fsyncSync(descriptor);
  } finally { fs.closeSync(descriptor); }
}

function rollback(items) {
  const errors = [];
  for (const item of [...items].reverse()) {
    if (!item.started) continue;
    try {
      targetFor(item.relative);
      if (item.original === null) {
        // Remove only the exclusively-created file owned by this installer.
        const stat = fs.lstatSync(item.file);
        if (stat.dev !== item.createdDev || stat.ino !== item.createdIno) throw new Error('Created file replaced by another process.');
        fs.unlinkSync(item.file);
      } else if (item.content === null) {
        const descriptor = fs.openSync(item.file, 'wx', item.mode & 0o777);
        try { fs.writeFileSync(descriptor, item.original); } finally { fs.closeSync(descriptor); }
      } else {
        const descriptor = fs.openSync(item.file, fs.constants.O_WRONLY | noFollow);
        try { fs.ftruncateSync(descriptor, 0); writeExact(descriptor, item.original); } finally { fs.closeSync(descriptor); }
      }
    } catch (error) { errors.push(item.relative + ': ' + error.message); }
  }
  return errors;
}

try {
  const allowed = ['--dry-run', '--skip-tests', '--skip-test', '--uninstall'];
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-shared-map-startup-fix.cjs [--dry-run] [--skip-tests] [--uninstall]');
  readTarget('src/runtime/widget.tsx', true);
  const writes = [], seen = new Set();
  for (const entry of payload.entries) {
    if (seen.has(entry.file)) throw new Error('Duplicate patch path: ' + entry.file);
    seen.add(entry.file);
    if (skipTests && entry.test) continue;
    const current = readTarget(entry.file, true);
    let text = normalize(current.bytes.toString('utf8'));
    const blocks = uninstall ? [...entry.blocks].reverse() : entry.blocks;
    for (const block of blocks) text = transformBlock(text, block, uninstall);
    if (uninstall && entry.absentAfterUninstall && entry.absentAfterUninstall.some(marker => text.includes(marker))) {
      conflict(entry.file + ' (edited diagnostic references remain)');
    }
    if (!uninstall && entry.requiredOccurrences && entry.requiredOccurrences.some(rule => count(text, rule.text) !== rule.count)) {
      conflict(entry.file + ' (diagnostic references differ)');
    }
    if (text !== normalize(current.bytes.toString('utf8'))) writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(text, current.bytes) });
  }
  for (const module of payload.modules) {
    if (seen.has(module.file)) throw new Error('Duplicate patch path: ' + module.file);
    seen.add(module.file);
    if (skipTests && module.test) continue;
    const current = readTarget(module.file);
    if (current.bytes !== null) {
      if (normalize(current.bytes.toString('utf8')) !== normalize(module.content)) conflict(module.file + ' (existing module)');
      if (uninstall) writes.push({ ...current, relative: module.file, original: current.bytes, content: null });
    } else if (!uninstall) {
      writes.push({ ...current, relative: module.file, original: null, content: Buffer.from(module.content) });
    }
  }
  console.log('Existing tests are preserved. This installer does not run tests.');
  if (!writes.length) {
    console.log(uninstall ? 'Startup fix is already uninstalled. No files changed.' : 'Startup fix is already installed. No files changed.');
    process.exit(0);
  }
  if (dry) {
    console.log('Dry run passed. Would ' + (uninstall ? 'uninstall' : 'install') + ':\n' + writes.map(item => '  ' + (item.content === null ? 'remove ' : item.original === null ? 'create ' : 'update ') + item.relative).join('\n'));
    process.exit(0);
  }
  // Complete every source guard before creating a backup or changing source files.
  for (const item of writes) assertUnchanged(item);
  const backupRelative = '.refactor-backups/' + prefix + (uninstall ? 'uninstall-' : '') + Date.now() + '-' + process.pid;
  ensureParents(backupRelative + '/changes.json');
  const backup = targetFor(backupRelative);
  for (const item of writes) {
    if (item.original === null) continue;
    const relative = backupRelative + '/' + item.relative;
    ensureParents(relative);
    const descriptor = fs.openSync(targetFor(relative), 'wx');
    try { fs.writeFileSync(descriptor, item.original); } finally { fs.closeSync(descriptor); }
  }
  const manifest = writes.map(item => ({ file: item.relative, operation: item.content === null ? 'remove' : item.original === null ? 'create' : 'update', originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) }));
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'shared-map-startup-fix', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
  for (const item of writes) assertUnchanged(item);
  try {
    for (const item of writes) {
      assertUnchanged(item);
      if (item.content === null) {
        targetFor(item.relative);
        fs.unlinkSync(item.file);
        item.started = true;
      } else if (item.original === null) {
        ensureParents(item.relative);
        const descriptor = fs.openSync(targetFor(item.relative), 'wx');
        const stat = fs.fstatSync(descriptor);
        item.createdDev = stat.dev; item.createdIno = stat.ino; item.started = true;
        try { fs.writeFileSync(descriptor, item.content); } finally { fs.closeSync(descriptor); }
      } else overwriteOriginal(item, item.content);
    }
  } catch (error) {
    const errors = rollback(writes);
    if (errors.length) throw new Error(error.message + '\nRollback needs attention; original bytes are in ' + backupRelative + ':\n' + errors.join('\n'));
    throw new Error(error.message + '\nInstaller writes rolled back. Original source files restored. Backup: ' + backupRelative);
  }
  console.log('Shared map startup fix ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. Refresh 2D/3D bookmarks with and without pKey and check coverage readiness.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}