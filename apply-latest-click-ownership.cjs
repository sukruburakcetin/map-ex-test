#!/usr/bin/env node
'use strict';
/**
 * Latest map click ownership. Compatible current v6 sources.
 * --dry-run checks all targets; --uninstall restores exact previous bytes.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const uninstall = args.includes('--uninstall');
const payload = {
  "entries": [
    {
      "file": "src/runtime/widget.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Latest click ownership 1",
              "before": "  private _coverageHoverHandler: ((event: any) => void) | null = null;\n  private _turboMapLeaveCleanup: (() => void) | null = null;\n  private _turboClickPickAbort: AbortController | null = null;\n\n\n  // Point Cloud Variables\n",
              "after": "  private _coverageHoverHandler: ((event: any) => void) | null = null;\n  private _turboMapLeaveCleanup: (() => void) | null = null;\n  private _turboClickPickAbort: AbortController | null = null;\n  private _mapClickRevision = 0;\n\n\n  // Point Cloud Variables\n"
            },
            {
              "label": "Latest click ownership 2",
              "before": "    }\n\n    if (fullRemove) {\n      this._turboMapLeaveCleanup?.();\n      this._turboMapLeaveCleanup = null;\n      this.disableTurboCoverageLayer();\n",
              "after": "    }\n\n    if (fullRemove) {\n      ++this._mapClickRevision; // Pending SDK results cannot survive close/reopen.\n      this._turboMapLeaveCleanup?.();\n      this._turboMapLeaveCleanup = null;\n      this.disableTurboCoverageLayer();\n"
            },
            {
              "label": "Latest click ownership 3",
              "before": "\n    this._coverageHoverResume?.dispose(); this._coverageHoverResume = null; this._coverageHoverHandler = null;\n    // Remove click / hover handlers from the previous active view\n    if (this.mapClickHandle) {\n      try {\n        this.mapClickHandle.remove();\n",
              "after": "\n    this._coverageHoverResume?.dispose(); this._coverageHoverResume = null; this._coverageHoverHandler = null;\n    // Remove click / hover handlers from the previous active view\n    ++this._mapClickRevision;\n    if (this.mapClickHandle) {\n      try {\n        this.mapClickHandle.remove();\n"
            },
            {
              "label": "Latest click ownership 4",
              "before": "    this.mapClickHandle = view.on(\"click\", async (evt) => {\n      if (this.props.state === \"CLOSED\") return;\n      this._coverageHoverResume?.leave();\n      this._placesExploreAbort?.abort(); this._placesExploreAbort = null;\n      const clickStartedAt = performance.now();\n      // Freeze the individual preview identity before hit tests or pointer movement.\n      const coverageRevisionAtClick = this._turboRequestCount;\n      const coverageClickCurrent = () => this.state.jimuMapView?.view === view && !view.destroyed &&\n        this.state.turboModeActive && !!this.turboCoverageLayer &&\n        this._turboRequestCount === coverageRevisionAtClick;\n      const hoveredPoint = this._coverageSelectionTargets.snapshot(this.coverageSelectionContext(), evt,\n",
              "after": "    this.mapClickHandle = view.on(\"click\", async (evt) => {\n      if (this.props.state === \"CLOSED\") return;\n      this._coverageHoverResume?.leave();\n      // Claim the click before any await. SDK hit tests cannot be aborted, so\n      // late results must lose ownership before they can open imagery or tools.\n      const clickRevision = this._mapClickRevision = (this._mapClickRevision ?? 0) + 1;\n      const clickCurrent = () => this._mapClickRevision === clickRevision &&\n        this.state.jimuMapView?.view === view && !view.destroyed && this.props.state !== \"CLOSED\";\n      this._turboClickPickAbort?.abort();\n      this._mapFeatureClickAbort?.abort();\n      if (this.state.coverageFrameResolving) this.setState({ coverageFrameResolving: false });\n      this._placesExploreAbort?.abort(); this._placesExploreAbort = null;\n      const clickStartedAt = performance.now();\n      // Freeze the individual preview identity before hit tests or pointer movement.\n      const coverageRevisionAtClick = this._turboRequestCount;\n      const coverageClickCurrent = () => clickCurrent() &&\n        this.state.turboModeActive && !!this.turboCoverageLayer &&\n        this._turboRequestCount === coverageRevisionAtClick;\n      const hoveredPoint = this._coverageSelectionTargets.snapshot(this.coverageSelectionContext(), evt,\n"
            },
            {
              "label": "Latest click ownership 5",
              "before": "          places: !!this.state.placesActive,\n          detectionFeatures: !!this.mapillaryObjectsFeatureLayer || !!this.mapillaryTrafficSignsFeatureLayer,\n        }, () => view.hitTest(evt));\n        const enterpriseNoteHit = response.results.find((result: any) => (result.layer || result.graphic?.layer) === this._sharedNotesLayer);\n        if (enterpriseNoteHit && (enterpriseNoteHit as any).graphic) {\n          view.openPopup({ features: [(enterpriseNoteHit as any).graphic], location: (enterpriseNoteHit as any).graphic.geometry });\n",
              "after": "          places: !!this.state.placesActive,\n          detectionFeatures: !!this.mapillaryObjectsFeatureLayer || !!this.mapillaryTrafficSignsFeatureLayer,\n        }, () => view.hitTest(evt));\n        if (!clickCurrent()) return;\n        const enterpriseNoteHit = response.results.find((result: any) => (result.layer || result.graphic?.layer) === this._sharedNotesLayer);\n        if (enterpriseNoteHit && (enterpriseNoteHit as any).graphic) {\n          view.openPopup({ features: [(enterpriseNoteHit as any).graphic], location: (enterpriseNoteHit as any).graphic.geometry });\n"
            },
            {
              "label": "Latest click ownership 6",
              "before": "            const request = this._selectionRequestId;\n            try { imageId = await this.nearestCoverageImage(seqId, { lon: point.longitude, lat: point.latitude }, this._selectionAbort?.signal || new AbortController().signal); }\n            catch { return; }\n            if (request !== this._selectionRequestId || !coverageClickCurrent()) return;\n          }\n          if (imageId) {\n            await this.loadSequenceById(seqId, imageId, { lon: point.longitude, lat: point.latitude }, false, false, clickStartedAt);\n            return;\n          }\n",
              "after": "            const request = this._selectionRequestId;\n            try { imageId = await this.nearestCoverageImage(seqId, { lon: point.longitude, lat: point.latitude }, this._selectionAbort?.signal || new AbortController().signal); }\n            catch { return; }\n            if (!clickCurrent() || request !== this._selectionRequestId || !coverageClickCurrent()) return;\n          }\n          if (imageId) {\n            if (!clickCurrent()) return;\n            await this.loadSequenceById(seqId, imageId, { lon: point.longitude, lat: point.latitude }, false, false, clickStartedAt);\n            return;\n          }\n"
            },
            {
              "label": "Latest click ownership 7",
              "before": "        // Native detection tiles need a local pick only while a detection mode is active.\n        const selectedFeature = featureHit || (this.state.objectsActive || this.state.trafficSignsActive\n          ? await this.pickMapFeature({ x: evt.x, y: evt.y }, view, featureController.signal) : null);\n        if (featureController.signal.aborted) return;\n        if (selectedFeature && (selectedFeature as any).graphic) {\n          this._selectedMapFeature = selectedFeature;\n          const attrs = (selectedFeature as any).graphic.attributes;\n",
              "after": "        // Native detection tiles need a local pick only while a detection mode is active.\n        const selectedFeature = featureHit || (this.state.objectsActive || this.state.trafficSignsActive\n          ? await this.pickMapFeature({ x: evt.x, y: evt.y }, view, featureController.signal) : null);\n        if (!clickCurrent() || featureController.signal.aborted) return;\n        if (selectedFeature && (selectedFeature as any).graphic) {\n          this._selectedMapFeature = selectedFeature;\n          const attrs = (selectedFeature as any).graphic.attributes;\n"
            },
            {
              "label": "Latest click ownership 8",
              "before": "          const pickController = new AbortController();\n          this._turboClickPickAbort = pickController;\n          const picked = coveragePreviewAtClick || await this.pickTurboGraphic({ x: evt.x, y: evt.y }, view, pickController.signal) || await this.pickTurboRepresentative({ x: evt.x, y: evt.y }, view, pickController.signal);\n          if (pickController.signal.aborted) return;\n          turboHits = picked ? [{ graphic: picked, layer: this.turboCoverageLayer } as any] : [];\n          if (turboHits.length > 0) {\n            // 1. Mathematically find the ABSOLUTE closest overlapping point\n",
              "after": "          const pickController = new AbortController();\n          this._turboClickPickAbort = pickController;\n          const picked = coveragePreviewAtClick || await this.pickTurboGraphic({ x: evt.x, y: evt.y }, view, pickController.signal) || await this.pickTurboRepresentative({ x: evt.x, y: evt.y }, view, pickController.signal);\n          if (!coverageClickCurrent() || pickController.signal.aborted) return;\n          turboHits = picked ? [{ graphic: picked, layer: this.turboCoverageLayer } as any] : [];\n          if (turboHits.length > 0) {\n            // 1. Mathematically find the ABSOLUTE closest overlapping point\n"
            },
            {
              "label": "Latest click ownership 9",
              "before": "                    });\n                    if (resp.ok) {\n                      const data = await resp.json();\n                      seqId = data.sequence;\n                      safeGraphic.attributes.sequence_id = seqId;\n                    }\n",
              "after": "                    });\n                    if (resp.ok) {\n                      const data = await resp.json();\n                      if (!coverageClickCurrent() || pickController.signal.aborted) return;\n                      seqId = data.sequence;\n                      safeGraphic.attributes.sequence_id = seqId;\n                    }\n"
            },
            {
              "label": "Latest click ownership 10",
              "before": "                    return;\n                  }\n                }\n                if (pickController.signal.aborted) return;\n                if (seqId) {\n                  // Coverage hit tests can miss the thin active route at regional zooms.\n                  // For that same loaded sequence, resolve the click entirely in memory.\n",
              "after": "                    return;\n                  }\n                }\n                if (!coverageClickCurrent() || pickController.signal.aborted) return;\n                if (seqId) {\n                  // Coverage hit tests can miss the thin active route at regional zooms.\n                  // For that same loaded sequence, resolve the click entirely in memory.\n"
            },
            {
              "label": "Latest click ownership 11",
              "before": "                    this.setState({ coverageFrameResolving: true });\n                    try {\n                      const nearby = await this.ensureCoverageFrameLookup().resolve(view, String(seqId), location, pickController.signal);\n                      if (pickController.signal.aborted || this._turboClickPickAbort !== pickController || this.state.jimuMapView?.view !== view) return;\n                      if (!nearby) {\n                        this.updateTurboPickWarning(this._t('appNoNearbyFrameWasFoundHereZoomCloserTo'), \"zoom\");\n                        return;\n                      }\n                      imageId = nearby;\n                    } catch (error) {\n                      if (pickController.signal.aborted || this._turboClickPickAbort !== pickController || this.state.jimuMapView?.view !== view) return;\n                      this.updateTurboPickWarning((error as any)?.name === \"TimeoutError\"\n                        ? this._owned(\"Nearby imagery is taking longer to respond. Try again; downloaded tiles will be reused.\")\n                        : this._owned(\"Nearby imagery could not load. Check your connection and try again.\"), \"zoom\");\n",
              "after": "                    this.setState({ coverageFrameResolving: true });\n                    try {\n                      const nearby = await this.ensureCoverageFrameLookup().resolve(view, String(seqId), location, pickController.signal);\n                      if (!coverageClickCurrent() || pickController.signal.aborted || this._turboClickPickAbort !== pickController) return;\n                      if (!nearby) {\n                        this.updateTurboPickWarning(this._t('appNoNearbyFrameWasFoundHereZoomCloserTo'), \"zoom\");\n                        return;\n                      }\n                      imageId = nearby;\n                    } catch (error) {\n                      if (!coverageClickCurrent() || pickController.signal.aborted || this._turboClickPickAbort !== pickController) return;\n                      this.updateTurboPickWarning((error as any)?.name === \"TimeoutError\"\n                        ? this._owned(\"Nearby imagery is taking longer to respond. Try again; downloaded tiles will be reused.\")\n                        : this._owned(\"Nearby imagery could not load. Check your connection and try again.\"), \"zoom\");\n"
            },
            {
              "label": "Latest click ownership 12",
              "before": "        // Imagery exploration uses Turbo; unrelated map tools remain available.\n        this.showToast(this._t('appEnableTurboCoverageToSelectStreetImagery'), 3000);\n      } catch (error) {\n        console.error(\"Click error\", error);\n        if (this.state.turboModeActive && (error as any)?.name !== \"AbortError\") this.updateTurboPickWarning(this._t('appImageLookupCouldNotLoadCheckYourConnectionAnd'), \"retry\");\n\n",
              "after": "        // Imagery exploration uses Turbo; unrelated map tools remain available.\n        this.showToast(this._t('appEnableTurboCoverageToSelectStreetImagery'), 3000);\n      } catch (error) {\n        if (!clickCurrent()) return;\n        console.error(\"Click error\", error);\n        if (this.state.turboModeActive && (error as any)?.name !== \"AbortError\") this.updateTurboPickWarning(this._t('appImageLookupCouldNotLoadCheckYourConnectionAnd'), \"retry\");\n\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/coverageClickDispatch.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "Latest click ownership 1",
              "before": "  x.widget.setRoutePoint = () => x.trace.push('route pick'); await x.handler();\n  assert.deepEqual(x.trace, ['route pick']);\n});\n",
              "after": "  x.widget.setRoutePoint = () => x.trace.push('route pick'); await x.handler();\n  assert.deepEqual(x.trace, ['route pick']);\n});\n\ntest('a slow older SDK hit cannot replace a newer clicked image', async () => {\n  const x = setup({ priority: 'notes' }), pending = [];\n  let imageId = 'older-image';\n  x.widget._coverageSelectionTargets.snapshot = () => ({ imageId, sequenceId: 'sequence', geometry: { type: 'point', longitude: 1, latitude: 2 } });\n  x.view.hitTest = () => new Promise(resolve => pending.push(resolve));\n  const older = x.handler(); imageId = 'newer-image'; const newer = x.handler();\n  pending[1]({ results: [] }); await newer;\n  pending[0]({ results: [] }); await older;\n  assert.deepEqual(x.trace, [['open image', 'sequence', 'newer-image']]);\n});\ntest('a stale SDK note hit cannot open a popup after a newer coverage click', async () => {\n  const x = setup({ priority: 'notes' }), pending = [];\n  x.view.hitTest = () => new Promise(resolve => pending.push(resolve));\n  x.view.openPopup = () => x.trace.push('stale popup');\n  const older = x.handler(), newer = x.handler();\n  pending[1]({ results: [] }); await newer;\n  pending[0]({ results: [{ layer: x.widget._sharedNotesLayer, graphic: { geometry: {} } }] }); await older;\n  assert(!x.trace.includes('stale popup'));\n});\ntest('closing the widget while SDK picking waits prevents image opening', async () => {\n  const x = setup({ priority: 'notes' }), work = x.handler();\n  x.widget.props.state = 'CLOSED'; x.release({ results: [] }); await work;\n  assert.deepEqual(x.trace, ['SDK hit test']);\n});\ntest('a newer click cancels an in-flight native detection pick before SDK dispatch completes', async () => {\n  const x = setup({ detection: true }); let finish;\n  x.widget.pickMapFeature = () => new Promise(resolve => { finish = resolve; });\n  const first = x.handler(); await flush();\n  const signal = x.widget._mapFeatureClickAbort.signal;\n  x.widget.state.routePickMode = 'A'; x.widget.setRoutePoint = () => {};\n  await x.handler(); assert.equal(signal.aborted, true);\n  finish(null); await first;\n  assert(!x.trace.some(event => Array.isArray(event) && event[0] === 'open image'));\n});\n\ntest('an obsolete rejected SDK lookup cannot replace the newer click with an error warning', async () => {\n  const x = setup({ priority: 'notes' }); let reject;\n  let calls = 0;\n  x.view.hitTest = () => ++calls === 1 ? new Promise((_resolve, fail) => { reject = fail; }) : Promise.resolve({ results: [] });\n  x.widget.updateTurboPickWarning = () => x.trace.push('stale warning');\n  const older = x.handler(); await x.handler();\n  reject(Error('old SDK failure')); await older;\n  assert.deepEqual(x.trace, [['open image', 'sequence', 'exact-image']]);\n});\ntest('a superseded sequence-ID request cannot open an image when transport ignores abort', async t => {\n  const x = setup(); let release, signal;\n  x.widget._coverageSelectionTargets.snapshot = () => ({ imageId: 'old', geometry: { type: 'point', longitude: 1, latitude: 2 } });\n  const original = global.fetch; t.after(() => { global.fetch = original; });\n  global.fetch = (_url, options) => { signal = options.signal; return new Promise(resolve => { release = resolve; }); };\n  const older = x.handler(); await flush();\n  x.widget.state.routePickMode = 'A'; x.widget.setRoutePoint = () => {};\n  await x.handler(); assert.equal(signal.aborted, true);\n  release({ ok: true, json: async () => ({ sequence: 'late-sequence' }) }); await older;\n  assert(!x.trace.some(event => Array.isArray(event) && event[0] === 'open image'));\n});\ntest('a superseded regional resolver cannot open its late nearby image', async () => {\n  const x = setup({ regional: true }); let release, signal;\n  x.widget._coverageFrameHoverTarget = { sequenceId: 'sequence' };\n  x.widget.getTurboOrganizationId = () => undefined;\n  x.widget._liveSequenceFrames = { complete: null };\n  x.widget.ensureCoverageFrameLookup = () => ({ resolve: (_view, _sequence, _point, currentSignal) => {\n    signal = currentSignal; return new Promise(resolve => { release = resolve; });\n  } });\n  const older = x.handler(); x.release({ results: [] }); await flush();\n  assert.equal(x.widget.state.coverageFrameResolving, true);\n  x.widget.state.routePickMode = 'A'; x.widget.setRoutePoint = () => {};\n  await x.handler(); assert.equal(signal.aborted, true);\n  assert.equal(x.widget.state.coverageFrameResolving, false);\n  release('late-image'); await older;\n  assert(!x.trace.some(event => Array.isArray(event) && event[0] === 'open image'));\n});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "docs/LATEST-CLICK-OWNERSHIP.md",
      "content": "# Latest map click owns pending selection\n\nThe click callback previously acquired cancellation ownership only after awaited SDK/feature work. Two SDK hit tests could complete in reverse order and open the older image last. Stale results could also open a shared-note popup or open imagery after the widget closed.\n\nA monotonic click revision is now captured before the first await. A click may commit only while its revision, active view and open-widget state still match. A newer click immediately aborts pending native detection and coverage-frame picks. This also applies when the new click is consumed by a route tool rather than imagery. Current shared-note, point-cloud, Places and detection priority is unchanged.\n\nGuards run after SDK hit testing, native detection picking, sequence-ID metadata and regional nearby-frame resolution. Obsolete errors are discarded before logging a user-facing warning. Full cleanup and view-handler replacement invalidate revisions, preventing stale work from surviving close/reopen or reattachment to the same view. SDK hit tests themselves are not abortable; their late results are ignored. Already accepted viewer navigation retains its existing selection-request cancellation mechanism.\n\nThe patch adds no timers, downloads, listeners or animation work. It does not change hover presentation, cached previews, selected-sequence styles, coordinate lookup policy or image IDs.\n\n## Validation\n\nFour new real-callback regressions first reproduced reversed click order, stale note popup, post-close image opening and late detection consumption; all failed on the preceding version. After the fix, 117 targeted checks pass, including seven new click-race cases, accurate hover, faint-sequence retention, cache adoption, image-first loading and timing. Additional cases exercise an SDK rejection after a newer click, a sequence-ID transport that ignores abort, and a late regional frame result. Runtime source parses successfully. These are controlled asynchronous traces, not a live-host performance benchmark or full Experience Builder build.\n\n## Install\n\nApply after `apply-faster-hovered-image-opening.cjs`, from the widget root:\n\n    node apply-latest-click-ownership.cjs\n\nRebuild/reload Experience Builder. Use `--dry-run` to check compatibility without source writes. Tests/builds are not run by the installer. The standalone uninstaller restores this patch only and retains the earlier hover crash fix and faster-opening changes. Conflicting source edits are refused.\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'latest-click-ownership-';

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
      if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (partially edited patch)');
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


function transformEntry(text, entry) {
  const results = new Set();
  for (const variant of entry.variants) {
    try {
      let next = text;
      for (const block of variant.blocks) next = transformBlock(next, block, false);
      results.add(next);
    } catch (error) {
      if (!error.message.startsWith('Conflict in ')) throw error;
    }
  }
  if (results.size !== 1) conflict(entry.file + (results.size ? ' (ambiguous baseline)' : ' (unsupported or edited source)'));
  return [...results][0];
}

function uninstallWrites() {
  const backupRoot = targetFor('.refactor-backups');
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.121 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'latest-click-ownership' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.121 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.121 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.121 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-latest-click-ownership.cjs [--dry-run] [--uninstall]');
  readTarget('src/runtime/widget.tsx', true);
  let writes;
  if (uninstall) writes = uninstallWrites();
  else {
    const seen = new Set(); writes = [];
    for (const entry of payload.entries) {
      if (seen.has(entry.file)) throw new Error('Duplicate patch path: ' + entry.file);
      seen.add(entry.file);
      const current = readTarget(entry.file, entry.content === undefined);
      if (entry.content !== undefined) {
        if (current.bytes === null) {
          writes.push({ ...current, relative: entry.file, original: null, content: Buffer.from(entry.content) });
        } else {
          const text = normalize(current.bytes.toString('utf8'));
          if (text !== normalize(entry.content)) {
            if (!entry.variants) conflict(entry.file + ' (existing helper/test differs)');
            const next = transformEntry(text, entry);
            if (next !== normalize(entry.content)) conflict(entry.file + ' (unexpected helper result)');
            writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(next, current.bytes) });
          }
        }
        continue;
      }
      const text = normalize(current.bytes.toString('utf8')), next = transformEntry(text, entry);
      if (next !== text) writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(next, current.bytes) });
    }
  }
  if (!writes.length) {
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Latest map click ownership is already installed. No files changed.');
    process.exit(0);
  }
  for (const item of writes) assertUnchanged(item);
  if (dry) {
    console.log('Dry run passed. Would ' + (uninstall ? 'restore' : 'update') + ':\n' + writes.map(item => '  ' + item.relative).join('\n'));
    process.exit(0);
  }
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
  const manifest = { installer: 'latest-click-ownership', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
  const manifestPath = targetFor(backupRelative + '/changes.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
  for (const item of writes) assertUnchanged(item);
  try {
    for (const item of writes) {
      assertUnchanged(item);
      if (item.content === null) {
        targetFor(item.relative); fs.unlinkSync(item.file); item.started = true;
      } else if (item.original === null) {
        ensureParents(item.relative);
        const descriptor = fs.openSync(targetFor(item.relative), 'wx');
        const stat = fs.fstatSync(descriptor);
        item.createdDev = stat.dev; item.createdIno = stat.ino; item.started = true;
        try { fs.writeFileSync(descriptor, item.content); } finally { fs.closeSync(descriptor); }
      } else overwriteOriginal(item, item.content);
    }
    manifest.completed = true;
    // Write completion through the existing guarded regular file, not a followed link.
    const metadata = readTarget(backupRelative + '/changes.json', true);
    overwriteOriginal({ ...metadata, relative: backupRelative + '/changes.json', original: metadata.bytes }, Buffer.from(JSON.stringify(manifest, null, 2) + '\n'));
  } catch (error) {
    const errors = rollback(writes);
    if (errors.length) throw new Error(error.message + '\nRollback needs attention. Backup: ' + backupRelative + '\n' + errors.join('\n'));
    throw new Error(error.message + '\nInstaller writes rolled back. Original files restored. Backup: ' + backupRelative);
  }
  console.log('Latest map click ownership ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
