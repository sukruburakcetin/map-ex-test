#!/usr/bin/env node
'use strict';
/** Coverage view transition hardening installer. Plain source payload.
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
const payload = { entries: [{ file: "src/runtime/widget.tsx", blocks: [
  { label: "Coverage transition hardening block 1", before: `
        if (activeImg) {
          view.goTo(
            {
              center: [activeImg.lon, activeImg.lat],
`,
    after: `
        if (activeImg) {
          this.navigateMapView(view,
            {
              center: [activeImg.lon, activeImg.lat],
` },
  { label: "Coverage transition hardening block 2", before: `          );
        } else {
          view.goTo(
            {
              heading: event.bearing,
`,
    after: `          );
        } else {
          this.navigateMapView(view,
            {
              heading: event.bearing,
` },
  { label: "Coverage transition hardening block 3", before: `            if (view.type === "3d") {
              const camera = sceneFollowCamera(view, activeImg.lon, activeImg.lat);
              if (camera) view.goTo(camera, { animate: true, duration: 300 });
            }
            // 2D MAP MODE
`,
    after: `            if (view.type === "3d") {
              const camera = sceneFollowCamera(view, activeImg.lon, activeImg.lat);
              if (camera) this.navigateMapView(view, camera, { animate: true, duration: 300 });
            }
            // 2D MAP MODE
` },
  { label: "Coverage transition hardening block 4", before: `              // Standard Center
              if (position === "center") {
                view.goTo({ center: targetPoint, scale: followScale }, { animate: true, duration: 300 });
              }
              // Offset Logic
`,
    after: `              // Standard Center
              if (position === "center") {
                this.navigateMapView(view, { center: targetPoint, scale: followScale }, { animate: true, duration: 300 });
              }
              // Offset Logic
` },
  { label: "Coverage transition hardening block 5", before: `                    });

                    view.goTo({ center: newCenter, scale: followScale }, { animate: true, duration: 300 });
                  } else {
                    view.goTo({ center: targetPoint, scale: followScale }, { animate: true, duration: 300 });
                  }
                } catch (e) {
                  view.goTo({ center: targetPoint, scale: followScale }, { animate: true, duration: 300 });
                }
              }
`,
    after: `                    });

                    this.navigateMapView(view, { center: newCenter, scale: followScale }, { animate: true, duration: 300 });
                  } else {
                    this.navigateMapView(view, { center: targetPoint, scale: followScale }, { animate: true, duration: 300 });
                  }
                } catch (e) {
                  this.navigateMapView(view, { center: targetPoint, scale: followScale }, { animate: true, duration: 300 });
                }
              }
` },
  { label: "Coverage transition hardening block 6", before: `              );

              view.goTo(
                {
                  center: [img.geometry.coordinates[0], img.geometry.coordinates[1]],
`,
    after: `              );

              this.navigateMapView(view,
                {
                  center: [img.geometry.coordinates[0], img.geometry.coordinates[1]],
` },
  { label: "Coverage transition hardening block 7", before: `              );
            } else {
              view.goTo(
                {
                  center: [img.geometry.coordinates[0], img.geometry.coordinates[1]],
`,
    after: `              );
            } else {
              this.navigateMapView(view,
                {
                  center: [img.geometry.coordinates[0], img.geometry.coordinates[1]],
` },
  { label: "Coverage transition hardening block 8", before: `  }

  private ensureAlwaysOnCoverageLayer = () => {
    const view = this.state.jimuMapView?.view;
    if (!view?.map || view.destroyed || !this.ArcGISModules?.VectorTileLayer) return;
    this.coverageLayerForView(view);
    this.enforceMapillaryLayerOrder(view);
`,
    after: `  }

  /** Defer coverage until the incoming link's map type is active.
   * This also rejects calls retained by a previous active view.
   */
  private canInitializeCoverage(view: __esri.MapView | __esri.SceneView | null | undefined): boolean {
    if (!view?.map || view.destroyed || this.state.jimuMapView?.view !== view) return false;
    if (this._sharedStateRestoreComplete) return true;
    const parameters = this._startupUrlParameters || readSharedLinkParameters();
    const targetType = parameters.get(SHARE_PARAMS.MAP_TYPE);
    return (targetType !== "2d" && targetType !== "3d") || view.type === targetType;
  }

  /** Observe fire-and-forget navigation at its owner; interruption is expected.
   * Unexpected errors on the active view remain visible with operation context.
   */
  private navigateMapView(view: __esri.MapView | __esri.SceneView, target: any, options: any): void {
    const map = view?.map;
    const current = () => !!map && !view.destroyed && view.map === map && this.state.jimuMapView?.view === view;
    if (!current()) return;
    const failed = (error: any) => {
      if (current() && error?.name !== "AbortError") console.warn("[MapView] Navigation failed:", error);
    };
    try { void Promise.resolve(view.goTo(target, options)).catch(failed); }
    catch (error) { failed(error); }
  }

  private ensureAlwaysOnCoverageLayer = () => {
    const view = this.state.jimuMapView?.view;
    if (!view?.map || view.destroyed || !this.ArcGISModules?.VectorTileLayer) return;
    if (!view.ready || !this.canInitializeCoverage(view)) return;
    this.coverageLayerForView(view);
    this.enforceMapillaryLayerOrder(view);
`, declarations: ["private canInitializeCoverage(", "private navigateMapView("] },
  { label: "Coverage transition hardening block 9", before: `      this._sharedStateRestoreComplete = true;
      this.syncMapLegendLayer();
      this.updateUrlWithCurrentImage(this.state.imageId ?? undefined);
    }
`,
    after: `      this._sharedStateRestoreComplete = true;
      this.syncMapLegendLayer();
      // If a requested map switch was unavailable, initialize the surviving view.
      // An existing coverage request already owns initialization for the target view.
      if (!this._turboAbortController || this._turboAbortController.signal.aborted) {
        this.ensureAlwaysOnCoverageLayer();
        if (this.state.turboModeActive) void this.enableTurboCoverageLayer();
      }
      this.updateUrlWithCurrentImage(this.state.imageId ?? undefined);
    }
` },
  { label: "Coverage transition hardening block 10", before: `  /** Native tiles at distance; bounded, full-fidelity interactive Graphics at close zoom. */
  private async enableTurboCoverageLayer(forceUsernameFilter?: string) {
    if (!this.state.turboModeActive) return;
    this._turboAbortController?.abort();
    this._turboHoverPickAbort?.abort();
`,
    after: `  /** Native tiles at distance; bounded, full-fidelity interactive Graphics at close zoom. */
  private async enableTurboCoverageLayer(forceUsernameFilter?: string) {
    const view = this.state.jimuMapView?.view;
    if (!this.state.turboModeActive || !view?.map || !this.canInitializeCoverage(view)) return;
    this._turboAbortController?.abort();
    this._turboHoverPickAbort?.abort();
` },
  { label: "Coverage transition hardening block 11", before: `    this._turboAbortController = controller;
    const requestId = ++this._turboRequestCount;
    const view = this.state.jimuMapView?.view;
    const map = view?.map;
    const current = () => !!view && !!map && !controller.signal.aborted &&
      requestId === this._turboRequestCount && this.state.turboModeActive &&
      this.state.jimuMapView?.view === view && view.map === map && !view.destroyed;
    const attached = () => {
      const layer = this.turboCoverageLayer;
`,
    after: `    this._turboAbortController = controller;
    const requestId = ++this._turboRequestCount;
    const map = view.map;
    const current = () => !!view && !!map && !controller.signal.aborted &&
      requestId === this._turboRequestCount && this.state.turboModeActive &&
      this.canInitializeCoverage(view) && view.map === map && !view.destroyed;
    const attached = () => {
      const layer = this.turboCoverageLayer;
` },
  { label: "Coverage transition hardening block 12", before: `    const jmv = this.state.jimuMapView;
    const view = jmv?.view;
    if (!view?.map || view.destroyed) return;
    const map = view.map;
    const current = () => !controller.signal.aborted && requestId === this._turboRequestCount && this.state.jimuMapView?.view === view && view.map === map && !view.destroyed;
    // Config and stationary callbacks also enter here before the active view is ready.
    await view.when();
`,
    after: `    const jmv = this.state.jimuMapView;
    const view = jmv?.view;
    if (!view?.map || view.destroyed || !this.canInitializeCoverage(view)) return;
    const map = view.map;
    const current = () => !controller.signal.aborted && requestId === this._turboRequestCount && this.canInitializeCoverage(view) && view.map === map && !view.destroyed;
    // Config and stationary callbacks also enter here before the active view is ready.
    await view.when();
` },
  { label: "Coverage transition hardening block 13", before: `

  private disableTurboCoverageLayer() {
    this._turboClickPickAbort?.abort(); this._coverageFrameLookup?.clear();
    this.setState({ coverageFrameResolving: false });
`,
    after: `

  private disableTurboCoverageLayer(restoreStyle = true) {
    this._turboClickPickAbort?.abort(); this._coverageFrameLookup?.clear();
    this.setState({ coverageFrameResolving: false });
` },
  { label: "Coverage transition hardening block 14", before: `    const map = this.state.jimuMapView?.view?.map;
    const layer = this.turboCoverageLayer;
    if (layer) {
      if (this._turboCoverageAdded) map?.remove(layer);
      if (this._turboCoverageOriginalStyle && !(layer as any).destroyed) {
`,
    after: `    const map = this.state.jimuMapView?.view?.map;
    const layer = this.turboCoverageLayer;
    // A view transition cancels interaction work without restyling a retiring renderer.
    if (layer && restoreStyle) {
      if (this._turboCoverageAdded) map?.remove(layer);
      if (this._turboCoverageOriginalStyle && !(layer as any).destroyed) {
` },
  { label: "Coverage transition hardening block 15", before: `    const view = this.state.jimuMapView?.view;
    if (!view) return;
    view.goTo({ center: [note.lon, note.lat], zoom: Math.max(view.zoom, 18) }, { animate: true, duration: 600 });

    // If the note has an associated image, jump the viewer there too
`,
    after: `    const view = this.state.jimuMapView?.view;
    if (!view) return;
    this.navigateMapView(view, { center: [note.lon, note.lat], zoom: Math.max(view.zoom, 18) }, { animate: true, duration: 600 });

    // If the note has an associated image, jump the viewer there too
` },
  { label: "Coverage transition hardening block 16", before: `    // DETECT 2D / 3D DIMENSION SWITCH
    const previousView = this.state.jimuMapView?.view;
    if (previousView && previousView !== view && this.state.turboModeActive) this.disableTurboCoverageLayer();

    const previousViewType = previousView?.type;
`,
    after: `    // DETECT 2D / 3D DIMENSION SWITCH
    const previousView = this.state.jimuMapView?.view;
    if (previousView && previousView !== view && this.state.turboModeActive) this.disableTurboCoverageLayer(false);

    const previousViewType = previousView?.type;
` },
  { label: "Coverage transition hardening block 17", before: `    const currentImg = sequenceImages.find((img) => img.id === imageId);
    if (currentImg) {
      jimuMapView.view.goTo(
        {
          center: [currentImg.lon, currentImg.lat],
`,
    after: `    const currentImg = sequenceImages.find((img) => img.id === imageId);
    if (currentImg) {
      this.navigateMapView(jimuMapView.view,
        {
          center: [currentImg.lon, currentImg.lat],
` },
], requiredOccurrences: [{"text": "private canInitializeCoverage(", "count": 1}, {"text": "private navigateMapView(", "count": 1}], absentAfterUninstall: ["private canInitializeCoverage(", "private navigateMapView("] }], modules: [] };

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'coverage-view-transition-';

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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-coverage-view-transition-fix.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
    console.log(uninstall ? 'Transition fix is already uninstalled. No files changed.' : 'Transition fix is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'coverage-view-transition-fix', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Coverage view transition fix ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. Refresh 2D/3D bookmarks, then switch map types and check coverage readiness.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}