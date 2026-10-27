#!/usr/bin/env node
'use strict';
/**
 * Fullscreen minimap lifecycle fix v6.7. Compatible current v6 sources.
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
              "label": "src/runtime/widget.tsx block 1",
              "before": "\n  // UI elements\n  private tooltipDiv: HTMLDivElement | null = null;\n  private minimapView: __esri.MapView | null = null;\n  private minimapGraphicsLayer: __esri.GraphicsLayer | null = null;\n\n  // Caches and timeouts\n  private sequenceCoordsCache: Record<string, { id: string; lat: number; lon: number }[]> = {};\n",
              "after": "\n  // UI elements\n  private tooltipDiv: HTMLDivElement | null = null;\n  private minimapView: __esri.MapView | null = null;\n  private _minimapRevision = 0;\n  private _minimapReady = false;\n  private minimapGraphicsLayer: __esri.GraphicsLayer | null = null;\n\n  // Caches and timeouts\n  private sequenceCoordsCache: Record<string, { id: string; lat: number; lon: number }[]> = {};\n"
            },
            {
              "label": "src/runtime/widget.tsx block 2",
              "before": "   * It replicates the main map's basemap and specific Vector Tile layers (safely re-creating them to avoid cloning errors),\n   * and binds click events to allow users to jump to different frames within the sequence.\n   */\n  private async createMinimap() {\n    if (!this.minimapContainer.current || !this.state.jimuMapView || !this.ArcGISModules) return;\n\n    this.destroyMinimap();\n\n    try {\n      // 1. Load 'esri/Basemap' in addition to others\n      const [MapView, Map, GraphicsLayer, Basemap] = await loadArcGISJSAPIModules([\"esri/views/MapView\", \"esri/Map\", \"esri/layers/GraphicsLayer\", \"esri/Basemap\"]);\n\n      const { VectorTileLayer } = this.ArcGISModules;\n\n      this.minimapGraphicsLayer = new GraphicsLayer({\n",
              "after": "   * It replicates the main map's basemap and specific Vector Tile layers (safely re-creating them to avoid cloning errors),\n   * and binds click events to allow users to jump to different frames within the sequence.\n   */\n  private async createMinimap() {\n    if (!this.state.isFullscreen || !this.minimapContainer.current || !this.state.jimuMapView || !this.ArcGISModules) return;\n\n    this.destroyMinimap();\n    const revision = this._minimapRevision;\n    const container = this.minimapContainer.current;\n    const owner = this.state.jimuMapView;\n    const current = () => revision === this._minimapRevision && this.state.isFullscreen &&\n      this.minimapContainer.current === container && this.state.jimuMapView === owner;\n\n    try {\n      // 1. Load 'esri/Basemap' in addition to others\n      const [MapView, Map, GraphicsLayer, Basemap] = await loadArcGISJSAPIModules([\"esri/views/MapView\", \"esri/Map\", \"esri/layers/GraphicsLayer\", \"esri/Basemap\"]);\n      if (!current()) return;\n\n      const { VectorTileLayer } = this.ArcGISModules;\n\n      this.minimapGraphicsLayer = new GraphicsLayer({\n"
            },
            {
              "label": "src/runtime/widget.tsx block 3",
              "before": "        constraints: { rotationEnabled: true, snapToZoom: true, minZoom: 0, maxZoom: 20 },\n        navigation: { mouseWheelZoomEnabled: true, browserTouchPanEnabled: true },\n      });\n\n      await this.minimapView.when();\n\n      // Safe Layer Transfer\n      const layersToAdd: __esri.Layer[] = [];\n      const mainLayers = this.state.jimuMapView.view.map.layers;\n",
              "after": "        constraints: { rotationEnabled: true, snapToZoom: true, minZoom: 0, maxZoom: 20 },\n        navigation: { mouseWheelZoomEnabled: true, browserTouchPanEnabled: true },\n      });\n\n      const view = this.minimapView;\n      await view.when();\n      if (!current() || this.minimapView !== view || view.destroyed) return;\n      this._minimapReady = true;\n\n      // Safe Layer Transfer\n      const layersToAdd: __esri.Layer[] = [];\n      const mainLayers = this.state.jimuMapView.view.map.layers;\n"
            },
            {
              "label": "src/runtime/widget.tsx block 4",
              "before": "      });\n\n      this.setState({ minimapView: this.minimapView });\n    } catch (err) {\n      console.error(\"Error creating minimap:\", err);\n      this.destroyMinimap();\n    }\n  }\n",
              "after": "      });\n\n      this.setState({ minimapView: this.minimapView });\n    } catch (err) {\n      if (!current()) return;\n      console.error(\"Error creating minimap:\", err);\n      this.destroyMinimap();\n    }\n  }\n"
            },
            {
              "label": "src/runtime/widget.tsx block 5",
              "before": "   * Fully disposes of the minimap view, map instance, and associated graphics layers.\n   * This ensures WebGL contexts are released and prevents memory leaks when the user exits fullscreen mode.\n   */\n  private destroyMinimap() {\n    this._minimapTrackingOwner = null; this._minimapFrameDot = null; this._minimapFrameCone = null;\n    this._minimapSequenceLine = null; this._minimapSequenceGeometry = null; this._minimapFrameId = null;\n    this.log(\"Destroying minimap...\");\n\n",
              "after": "   * Fully disposes of the minimap view, map instance, and associated graphics layers.\n   * This ensures WebGL contexts are released and prevents memory leaks when the user exits fullscreen mode.\n   */\n  private destroyMinimap() {\n    ++this._minimapRevision;\n    this._minimapReady = false;\n    this._minimapTrackingOwner = null; this._minimapFrameDot = null; this._minimapFrameCone = null;\n    this._minimapSequenceLine = null; this._minimapSequenceGeometry = null; this._minimapFrameId = null;\n    this.log(\"Destroying minimap...\");\n\n"
            },
            {
              "label": "src/runtime/widget.tsx block 6",
              "before": "   * a pulsing location dot, a camera direction cone, and the sequence polyline.\n   */\n  private updateMinimapTracking() {\n    const layer = this.minimapGraphicsLayer, view = this.minimapView;\n    if (!layer || !view || (view as any).destroyed || !this.ArcGISModules || !this.state.imageId) return;\n    const image = this._liveSequenceFrames.current || this._liveSequenceFrames.find(this.state.imageId) || this.state.sequenceImages.find(p => String(p.id) === String(this.state.imageId));\n    if (!image) return;\n    if (this._minimapTrackingOwner !== layer) {\n      this._minimapTrackingOwner = layer; this._minimapFrameDot = null; this._minimapFrameCone = null;\n",
              "after": "   * a pulsing location dot, a camera direction cone, and the sequence polyline.\n   */\n  private updateMinimapTracking() {\n    const layer = this.minimapGraphicsLayer, view = this.minimapView;\n    if (!this._minimapReady || !layer || !view || !view.ready || view.destroyed || !this.ArcGISModules || !this.state.imageId) return;\n    const image = this._liveSequenceFrames.current || this._liveSequenceFrames.find(this.state.imageId) || this.state.sequenceImages.find(p => String(p.id) === String(this.state.imageId));\n    if (!image) return;\n    if (this._minimapTrackingOwner !== layer) {\n      this._minimapTrackingOwner = layer; this._minimapFrameDot = null; this._minimapFrameCone = null;\n"
            },
            {
              "label": "src/runtime/widget.tsx block 7",
              "before": "\n        // Create minimap only in fullscreen\n        if (this.state.isFullscreen) {\n          setTimeout(() => {\n            this.createMinimap();\n          }, 300);\n        }\n\n        // Center map on current frame when exiting fullscreen\n",
              "after": "\n        // Create minimap only in fullscreen\n        if (this.state.isFullscreen) {\n          setTimeout(() => {\n            if (this.state.isFullscreen) void this.createMinimap();\n          }, 300);\n        }\n\n        // Center map on current frame when exiting fullscreen\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/minimapLifecycle.test.cjs",
      "content": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst source=fs.readFileSync(path.join(__dirname,'../src/runtime/widget.tsx'),'utf8'),ast=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);let members;function scan(n){if(ts.isClassDeclaration(n)&&n.name?.text==='Widget')members=n.members;ts.forEachChild(n,scan);}scan(ast);const methods=['createMinimap','destroyMinimap','updateMinimapTracking'].map(name=>members.find(m=>m.name?.getText(ast)===name).getText(ast)).join('\\n');\nfunction deferred(){let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return{promise,resolve,reject};}\nfunction fixture(){const modules=deferred(),ready=deferred(),views=[];let loads=0;class Graphics{constructor(){this.graphics={reorder(){}};}removeAll(){}destroy(){}add(){}remove(){}}class Map{constructor(o){Object.assign(this,o);}addMany(){}remove(){}add(){}}class View{constructor(o){Object.assign(this,o);this.ready=false;this.destroyed=false;this.goCalls=0;views.push(this);}when(){return ready.promise.then(()=>{this.ready=true;});}on(){}goTo(){assert(this.ready&&!this.destroyed);this.goCalls++;return Promise.resolve();}destroy(){this.destroyed=true;}}class Graphic{constructor(o){Object.assign(this,o);}}const code=ts.transpileModule('class Harness{'+methods+'}\\nreturn Harness;',{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText;const Harness=new Function('loadArcGISJSAPIModules','LAYER_IDS','ZOOM','TILE_URLS','STYLE_SOURCE_IDS','STYLE_LAYER_IDS','createConeGeometry','distanceMeters',code)(()=>{loads++;return modules.promise;},{MINIMAP_TRACKING:'tracking'},{MINIMAP_OFFSET:2},{COVERAGE:'tile'},{MAPILLARY:'mapillary'},{SEQUENCE:'sequence',IMAGE:'image'},()=>({}),()=>0);const w=new Harness();Object.assign(w,{_minimapRevision:0,_minimapReady:false,state:{isFullscreen:true,jimuMapView:{view:{map:{basemap:{id:'topo-vector'},layers:[]},center:[0,0],zoom:15}},sequenceId:null,sequenceImages:[{id:'a',lon:1,lat:2}],imageId:'a'},minimapContainer:{current:{innerHTML:''}},ArcGISModules:{VectorTileLayer:class{},Graphic},_liveSequenceFrames:{current:{id:'a',lon:1,lat:2},complete:true},setState(o){Object.assign(this.state,o);},log(){}});return{w,modules,ready,views,get loads(){return loads;},load(){modules.resolve([View,Map,Graphics,{fromJSON(){}}]);}};}\nconst tick=()=>new Promise(resolve=>setImmediate(resolve));\ntest('tracking does not navigate or consume the frame before readiness; ready startup tracks once',async()=>{const f=fixture(),task=f.w.createMinimap();f.load();await tick();assert.equal(f.views.length,1);f.w.updateMinimapTracking();assert.equal(f.views[0].goCalls,0);assert.equal(f.w._minimapFrameId,null);f.ready.resolve();await task;assert.equal(f.views[0].goCalls,1);f.w.updateMinimapTracking();assert.equal(f.views[0].goCalls,1);});\ntest('exit while modules load cannot create a detached MapView',async()=>{const f=fixture(),task=f.w.createMinimap();f.w.state.isFullscreen=false;f.w.destroyMinimap();f.load();await task;assert.equal(f.views.length,0);});\ntest('exit while MapView initializes cannot resume tracking',async()=>{const f=fixture(),task=f.w.createMinimap();f.load();await tick();f.w.destroyMinimap();f.ready.resolve();await task;assert.equal(f.views[0].destroyed,true);assert.equal(f.views[0].goCalls,0);assert.equal(f.w._minimapReady,false);});\ntest('a stale initialization rejection cannot destroy a newer ready minimap',async()=>{const f=fixture(),old=f.w.createMinimap();f.load();await tick();const fresh={ready:true,destroyed:false};f.w.destroyMinimap();f.w.minimapView=fresh;f.w._minimapReady=true;f.ready.reject(Error('old startup failed'));await old;assert.equal(f.w.minimapView,fresh);assert.equal(f.w._minimapReady,true);});\ntest('delayed creation after leaving fullscreen is a no-op',async()=>{const f=fixture();f.w.state.isFullscreen=false;await f.w.createMinimap();assert.equal(f.loads,0);});\ntest('SDK readiness guard blocks navigation even if the owner flag remains set',()=>{const f=fixture();f.w._minimapReady=true;f.w.minimapView={ready:false,destroyed:false,goTo(){throw Error('must not navigate');}};f.w.minimapGraphicsLayer={};f.w.updateMinimapTracking();assert.equal(f.w._minimapFrameId,undefined);});\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'minimap-lifecycle-fix-v6-7-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.7 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'minimap-lifecycle-fix-v6-7' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.7 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.7 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.7 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-minimap-lifecycle-fix-v6-7.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Minimap lifecycle v6.7 is already installed. No files changed.');
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
  const manifest = { installer: 'minimap-lifecycle-fix-v6-7', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Minimap lifecycle v6.7 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
