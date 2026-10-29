#!/usr/bin/env node
'use strict';
/**
 * Playback zoom scheduling v6.64. Compatible current v6 sources.
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
              "label": "playback zoom scheduling 1",
              "before": "/** @jsx jsx */\n/** @jsxFrag React.Fragment */\nimport { rankPlaceImagery, facePlaceInPanorama, placeImageryBbox, PlaceImagery } from '../features/places/nearbyPlaceImagery';\nimport { ArcGISPlaces } from \"../features/places/ArcGISPlaces\";\nimport { placePreferenceKey, readPlaceCategory, savePlaceCategory } from '../features/places/placePreferences';\nimport { paddedPlacesExtent } from '../features/places/publishedPlacesExtent';\n",
              "after": "/** @jsx jsx */\n/** @jsxFrag React.Fragment */\nimport { PlaybackZoomUi } from '../features/imagery/PlaybackZoomUi';\nimport { rankPlaceImagery, facePlaceInPanorama, placeImageryBbox, PlaceImagery } from '../features/places/nearbyPlaceImagery';\nimport { ArcGISPlaces } from \"../features/places/ArcGISPlaces\";\nimport { placePreferenceKey, readPlaceCategory, savePlaceCategory } from '../features/places/placePreferences';\nimport { paddedPlacesExtent } from '../features/places/publishedPlacesExtent';\n"
            },
            {
              "label": "playback zoom scheduling 2",
              "before": "  private coneSpreads = [60, 40, 30, 20];\n  private coneLengths = [10, 15, 20, 30];\n  private zoomStepIndex = 0;\n  private _lastBearing: number = 0;\n  private _coneRedrawRaf: number | null = null;\n\n  // Debounced function\n  private debouncedTurboFilter: (() => void) & { cancel?: () => void };\n",
              "after": "  private coneSpreads = [60, 40, 30, 20];\n  private coneLengths = [10, 15, 20, 30];\n  private zoomStepIndex = 0;\n  private _lastBearing: number = 0;\n  private _playbackZoomUi: PlaybackZoomUi<__esri.MapView | __esri.SceneView> | null = null;\n  private _coneRedrawRaf: number | null = null;\n\n  // Debounced function\n  private debouncedTurboFilter: (() => void) & { cancel?: () => void };\n"
            },
            {
              "label": "playback zoom scheduling 3",
              "before": "      this._debouncedBearingUrlUpdate();\n\n      const view = this.state.jimuMapView?.view;\n\n      if (view && view.type === \"3d\" && this.props.config.syncMapWithImage === true && !this._isFlyInActive && this.state.syncHeading && (this.state.lockToImage || view.stationary !== false)) {\n        const activeImg = this._liveSequenceFrames.current || this._liveSequenceFrames.find(this.state.imageId);\n\n        if (activeImg && this.state.lockToImage) {\n          this.navigateMapView(view,\n",
              "after": "      this._debouncedBearingUrlUpdate();\n\n      const view = this.state.jimuMapView?.view;\n\n      if (view && (this._userPaused || !view.interacting) && view.type === \"3d\" && this.props.config.syncMapWithImage === true && !this._isFlyInActive && this.state.syncHeading && (this.state.lockToImage || view.stationary !== false)) {\n        const activeImg = this._liveSequenceFrames.current || this._liveSequenceFrames.find(this.state.imageId);\n\n        if (activeImg && this.state.lockToImage) {\n          this.navigateMapView(view,\n"
            },
            {
              "label": "playback zoom scheduling 4",
              "before": "\n    this._nativeSequenceSelection.detach();\n\n    // Clean up zoom watcher and cancel any pending zoom URL update\n    if (this.zoomDisplayHandle) {\n      this.zoomDisplayHandle.remove();\n      this.zoomDisplayHandle = null;\n    }\n",
              "after": "\n    this._nativeSequenceSelection.detach();\n\n    // Clean up zoom watcher and cancel any pending zoom URL update\n    this._playbackZoomUi?.cancel();\n    if (this.zoomDisplayHandle) {\n      this.zoomDisplayHandle.remove();\n      this.zoomDisplayHandle = null;\n    }\n"
            },
            {
              "label": "playback zoom scheduling 5",
              "before": "    /*\n     * Remove the previous MapView's watcher before\n     * attaching anything to the new 2D/3D view.\n     */\n    if (this.zoomDisplayHandle) {\n      this.zoomDisplayHandle.remove();\n      this.zoomDisplayHandle = null;\n    }\n",
              "after": "    /*\n     * Remove the previous MapView's watcher before\n     * attaching anything to the new 2D/3D view.\n     */\n    this._playbackZoomUi?.cancel();\n    if (this.zoomDisplayHandle) {\n      this.zoomDisplayHandle.remove();\n      this.zoomDisplayHandle = null;\n    }\n"
            },
            {
              "label": "playback zoom scheduling 6",
              "before": "      if (this.state.jimuMapView?.view !== view || !view.map || view.destroyed) {\n        return;\n      }\n\n      this.setState({\n        currentZoom: newZoom,\n      });\n\n      this._debouncedZoomUrlUpdate();\n      void this.refreshSequenceMarkerWindow();\n\n      // Share the existing cone frame: zoom events never rebuild imagery or add timers.\n      if (this._coneRedrawRaf == null) this._coneRedrawRaf = requestAnimationFrame(() => {\n        this._coneRedrawRaf = null;\n        if (this.state.jimuMapView?.view !== view || view.destroyed) return;\n        const image = this._liveSequenceFrames.current || this._liveSequenceFrames.find(this.state.imageId);\n        if (image && String(image.id) === String(this.state.imageId))\n          this.drawCone(image.lon, image.lat, this._lastBearing || 0, this.coneLengths[this.zoomStepIndex], this.coneSpreads[this.zoomStepIndex]);\n      });\n\n      /*\n       * Keep quality hint behavior.\n       */\n",
              "after": "      if (this.state.jimuMapView?.view !== view || !view.map || view.destroyed) {\n        return;\n      }\n\n      this.queueZoomUi(view, newZoom);\n\n      this._debouncedZoomUrlUpdate();\n      void this.refreshSequenceMarkerWindow();\n\n      /*\n       * Keep quality hint behavior.\n       */\n"
            },
            {
              "label": "playback zoom scheduling 7",
              "before": "  private ensureCameraConeOwner(): CameraConeGraphics<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> {\n    return this._cameraCone ??= new CameraConeGraphics(properties => new this.ArcGISModules.GraphicsLayer(properties));\n  }\n\n  /** Keep visible by default; explicit lock reuses the existing center/direction navigation. */\n  private syncMapToImage(activeImg: { id: string; lon: number; lat: number }, view: __esri.MapView | __esri.SceneView) {\n    const followAnchor = this.getCoverageDisplayPosition(String(activeImg.id), activeImg.lon, activeImg.lat);\n    const followPoint = followAnchor.geometry || new this.ArcGISModules.Point({ longitude: followAnchor.lon, latitude: followAnchor.lat });\n    if (this.props.config.syncMapWithImage === true && !this._isFlyInActive &&\n        shouldRecenterImage(view, followPoint, this.state.lockToImage)) {\n",
              "after": "  private ensureCameraConeOwner(): CameraConeGraphics<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> {\n    return this._cameraCone ??= new CameraConeGraphics(properties => new this.ArcGISModules.GraphicsLayer(properties));\n  }\n\n  /** Only readout/extra zoom-cone work yields; sequence picking and highlights do not. */\n  private queueZoomUi(view: __esri.MapView | __esri.SceneView, zoom: number): void {\n    this._playbackZoomUi ??= new PlaybackZoomUi({\n      current: owner => this.state.jimuMapView?.view === owner && !!owner.map && !owner.destroyed,\n      readout: (_owner, value) => { if (this.state.currentZoom !== value) this.setState({ currentZoom: value }); },\n      cone: owner => {\n        if (this._coneRedrawRaf != null) return;\n        this._coneRedrawRaf = requestAnimationFrame(() => {\n          this._coneRedrawRaf = null;\n          if (this.state.jimuMapView?.view !== owner || owner.destroyed) return;\n          const image = this._liveSequenceFrames.current || this._liveSequenceFrames.find(this.state.imageId);\n          if (image && String(image.id) === String(this.state.imageId))\n            this.drawCone(image.lon, image.lat, this._lastBearing || 0, this.coneLengths[this.zoomStepIndex], this.coneSpreads[this.zoomStepIndex]);\n        });\n      },\n      now: () => performance.now(), timer: (work, delay) => setTimeout(work, delay), cancel: handle => clearTimeout(handle),\n    });\n    this._playbackZoomUi.push(view, zoom, this._userPaused === false);\n  }\n\n  /** Keep visible by default; explicit lock reuses the existing center/direction navigation. */\n  private syncMapToImage(activeImg: { id: string; lon: number; lat: number }, view: __esri.MapView | __esri.SceneView) {\n    // Manual input owns the camera while playing, including lock mode. Next image resumes following.\n    if (this._userPaused === false && view.interacting) return;\n    const followAnchor = this.getCoverageDisplayPosition(String(activeImg.id), activeImg.lon, activeImg.lat);\n    const followPoint = followAnchor.geometry || new this.ArcGISModules.Point({ longitude: followAnchor.lon, latitude: followAnchor.lat });\n    if (this.props.config.syncMapWithImage === true && !this._isFlyInActive &&\n        shouldRecenterImage(view, followPoint, this.state.lockToImage)) {\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/imageFollowPolicy.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "playback zoom scheduling 1",
              "before": "test('3D no-data/throwing sampler uses public terrain intersections',()=>{const v=footprintView();v.groundView={elevationSampler:{noDataValue:-999,queryElevation:()=>({z:-999})}};assert.equal(follow(v,{longitude:9,latitude:5},false),true);v.groundView.elevationSampler.queryElevation=()=>{throw Error('Unavailable')};assert.equal(follow(v,{longitude:9,latitude:5},false),true)});\ntest('3D rotated ground footprint handles image positions inside and outside',()=>{const v=footprintView();v.toMap=({x,y})=>({longitude:5+(x-y)/10,latitude:5+(x+y-100)/10});assert.equal(follow(v,{longitude:5,latitude:5},false),false);assert.equal(follow(v,{longitude:10,latitude:10},false),true)});\ntest('sky rays and unavailable footprint defer rather than moving on unknown data',()=>{const v=footprintView();v.toMap=()=>null;assert.equal(follow(v,{longitude:9,latitude:5},false),false)});\ntest('public footprint fallback accepts Web Mercator anchors',()=>{const v=footprintView(),mercator=(lon,lat)=>({x:lon*Math.PI/180*6378137,y:Math.asinh(Math.tan(lat*Math.PI/180))*6378137,spatialReference:{wkid:3857}});assert.equal(follow(v,mercator(5,5),false),false);assert.equal(follow(v,mercator(9,5),false),true)});\n",
              "after": "test('3D no-data/throwing sampler uses public terrain intersections',()=>{const v=footprintView();v.groundView={elevationSampler:{noDataValue:-999,queryElevation:()=>({z:-999})}};assert.equal(follow(v,{longitude:9,latitude:5},false),true);v.groundView.elevationSampler.queryElevation=()=>{throw Error('Unavailable')};assert.equal(follow(v,{longitude:9,latitude:5},false),true)});\ntest('3D rotated ground footprint handles image positions inside and outside',()=>{const v=footprintView();v.toMap=({x,y})=>({longitude:5+(x-y)/10,latitude:5+(x+y-100)/10});assert.equal(follow(v,{longitude:5,latitude:5},false),false);assert.equal(follow(v,{longitude:10,latitude:10},false),true)});\ntest('sky rays and unavailable footprint defer rather than moving on unknown data',()=>{const v=footprintView();v.toMap=()=>null;assert.equal(follow(v,{longitude:9,latitude:5},false),false)});\ntest('public footprint fallback accepts Web Mercator anchors',()=>{const v=footprintView(),mercator=(lon,lat)=>({x:lon*Math.PI/180*6378137,y:Math.asinh(Math.tan(lat*Math.PI/180))*6378137,spatialReference:{wkid:3857}});assert.equal(follow(v,mercator(5,5),false),false);assert.equal(follow(v,mercator(9,5),false),true)});\n\ntest('playback respects active manual input in both map modes, including lock; following resumes on next image',()=>{for(const type of ['2d','3d'])for(const locked of [false,true]){const{w,v}=runtime(type,'center',locked);v.toScreen=()=>({x:101,y:50});v.interacting=true;w.syncMapToImage({id:'A',lon:1,lat:2},v);assert.equal(w.moves.length,0);v.interacting=false;w.syncMapToImage({id:'B',lon:1,lat:2},v);assert.equal(w.moves.length,1)}});\ntest('3D bearing following yields to active manual input during playback and resumes afterward',()=>{let branch;function visit(n){if(ts.isIfStatement(n)&&n.expression.getText(sf).includes('this.state.syncHeading')&&n.expression.getText(sf).includes('syncMapWithImage'))branch=n;ts.forEachChild(n,visit)}visit(cl);const Heading=new Function(compile('class Heading{run(view,event){'+branch.getText(sf)+'}}')+'return Heading;')();for(const locked of [false,true]){const w=new Heading();w.props={config:{syncMapWithImage:true}};w.state={syncHeading:true,lockToImage:locked,imageId:'A'};w._userPaused=false;w._liveSequenceFrames={current:{lon:1,lat:2}};let moves=0;w.navigateMapView=()=>moves++;w.run({type:'3d',stationary:true,interacting:true},{bearing:75});assert.equal(moves,0);w.run({type:'3d',stationary:true,interacting:false},{bearing:75});assert.equal(moves,1)}});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/imagery/PlaybackZoomUi.ts",
      "content": "/** One bounded timer for nonessential zoom UI during playback. No selection/hover ownership. */\nexport class PlaybackZoomUi<View> {\n  private pending: { view: View; zoom: number; at: number } | null = null;\n  private timer: any = null;\n  private generation = 0;\n  constructor(private host: {\n    current(view: View): boolean;\n    readout(view: View, zoom: number): void;\n    cone(view: View): void;\n    now(): number;\n    timer(work: () => void, delay: number): any;\n    cancel(handle: any): void;\n  }, private readonly interval = 120) {}\n  push(view: View, zoom: number, playing: boolean): void {\n    if (!Number.isFinite(zoom) || !this.host.current(view)) return;\n    if (!playing) { this.cancel(); this.host.readout(view, zoom); this.host.cone(view); return; }\n    if (this.pending && this.pending.view !== view) this.cancel();\n    this.pending = { view, zoom, at: this.host.now() };\n    this.schedule();\n  }\n  private schedule(): void {\n    if (this.timer !== null) return;\n    const generation = this.generation;\n    this.timer = this.host.timer(() => {\n      if (generation !== this.generation) return;\n      this.timer = null;\n      const pending = this.pending;\n      if (!pending || !this.host.current(pending.view)) { this.cancel(); return; }\n      this.host.readout(pending.view, pending.zoom);\n      if (this.host.now() - pending.at >= this.interval) {\n        this.cancel(); this.host.cone(pending.view);\n      } else this.schedule();\n    }, this.interval);\n  }\n  cancel(): void {\n    ++this.generation;\n    if (this.timer !== null) this.host.cancel(this.timer);\n    this.timer = null; this.pending = null;\n  }\n}\n"
    },
    {
      "file": "tests/playbackZoomUi.test.cjs",
      "content": "const fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;\nconst m={exports:{}};new Function('module','exports',compile(fs.readFileSync(path.join(__dirname,'../src/features/imagery/PlaybackZoomUi.ts'),'utf8')))(m,m.exports);const{PlaybackZoomUi}=m.exports;\nfunction fixture(){let now=0,id=0;const timers=new Map(),readouts=[],cones=[];const f={view:{},readouts,cones,timers};f.ui=new PlaybackZoomUi({current:view=>view===f.view,readout:(view,z)=>readouts.push(z),cone:view=>cones.push(view),now:()=>now,timer:(fn,ms)=>{timers.set(++id,{fn,at:now+ms});return id},cancel:id=>timers.delete(id)});f.advance=ms=>{now+=ms;for(const[id,t]of[...timers])if(t.at<=now){timers.delete(id);t.fn()}};return f}\ntest('dense playback zoom uses one timer, bounded latest-value readouts and one settled cone',()=>{const f=fixture();for(let i=0;i<100;i++){f.ui.push(f.view,10+i/100,true);assert.equal(f.timers.size,1);f.advance(10)}assert(f.readouts.length<=9);assert.equal(f.cones.length,0);f.advance(240);assert.equal(f.readouts.at(-1),10.99);assert.equal(f.cones.length,1);assert.equal(f.timers.size,0)});\ntest('paused zoom is immediate and cancels playback work',()=>{const f=fixture();f.ui.push(f.view,12,true);f.ui.push(f.view,13,false);assert.deepEqual(f.readouts,[13]);assert.equal(f.cones.length,1);assert.equal(f.timers.size,0);f.advance(1000);assert.deepEqual(f.readouts,[13])});\ntest('cancelled and stale views cannot update UI even when an old timer callback arrives',()=>{const f=fixture();f.ui.push(f.view,12,true);const callback=[...f.timers.values()][0].fn;f.ui.cancel();callback();assert.equal(f.readouts.length,0);f.ui.push(f.view,13,true);f.view={};f.advance(240);assert.equal(f.readouts.length,0);assert.equal(f.timers.size,0);f.ui.push(f.view,14,true);f.advance(120);assert.deepEqual(f.readouts,[14])});\n"
    },
    {
      "file": "docs/PLAYBACK-ZOOM.md",
      "content": "# Playback while zooming · v6.64\n\nBased on GitHub main `85c38df612a2dbd4e0812ecb30bb3779c5abfcb4` (2026-10-27).\n\nDuring playback, zoom readout React updates are coalesced to at most once per 120ms. The extra zoom-triggered camera-cone redraw waits for a quiet zoom interval (normally 120–240ms after the last zoom event). Paused zoom readouts remain immediate. Per-image marker, cone, minimap and metadata tracking continue on their existing paths. Only one short-lived timer is retained; stale views and cleanup cancel it.\n\nAutomatic image following and 3D bearing-follow navigation yield while the SDK reports active user interaction during playback, including image-lock mode. Following resumes on subsequent image/bearing events after input ends. This avoids issuing competing camera moves while the user controls the map; it does not stop playback or change the follow policy outside active input.\n\nSelection and hover behavior are protected: no changes to coverage files, picking methods, highlight methods, click/pointer-move callbacks, the image callback or zoom-driven selection refreshes. The zoom readout is UI state; picking continues using live SDK view values. No tile, imagery fetch, sequence enumeration, filter, symbol-sizing formula or hover timing is changed.\n\nThis reduces avoidable scheduling work; it does not eliminate the map renderer's tile decoding, GPU work or texture-upload contention. No deployed FPS improvement is claimed from static review or synthetic scheduling tests.\n\n## Verify locally\n\n1. Use the same sequence, viewport, playback speed, zoom range and optional layers before/after. Warm the imagery route and map tiles first.\n2. Start playback and repeat the same zoom gestures in 2D, then 3D if used. Repeat with map follow off/on and image lock on/off. Playback must keep advancing and manual input must not fight automatic following.\n3. Confirm the zoom-related UI catches up shortly after input stops. Stop playback and confirm immediate paused zoom UI behavior.\n4. Confirm sequence selection, hover previews, blue highlighting and zoom alignment behave exactly as before, including zooming through 14.\n5. Capture comparable Chrome Performance recordings for actual rendering/long tasks. Existing playback image-gap diagnostics measure image transitions, not GPU FPS. Use a real phone for phone performance.\n\nQuality messages and native selection sizing retain their existing zoom paths. Optional active layers and actual map rendering may still contribute to contention.\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'playback-zoom-scheduling-v6-64-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.64 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'playback-zoom-scheduling-v6-64' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.64 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.64 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.64 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-playback-zoom-scheduling-v6-64.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Playback zoom scheduling v6.64 is already installed. No files changed.');
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
  const manifest = { installer: 'playback-zoom-scheduling-v6-64', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Playback zoom scheduling v6.64 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
