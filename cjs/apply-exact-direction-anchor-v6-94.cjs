#!/usr/bin/env node
'use strict';
/**
 * Exact 3D direction anchor v6.94. Compatible current v6 sources.
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
              "label": "direction hover forwarding 0",
              "before": "  private _turboLoadingTimer: ReturnType<typeof setTimeout> | null = null;\n  private _selectionPulse: SelectionPulse<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> | null = null;\n  private _nativeImageAnchorAbort: AbortController | null = null;\n  private _nativeImageAnchorKey = '';\n  private _clickRippleAnimations: ClickRippleAnimations<__esri.Graphic, __esri.MapView | __esri.SceneView> | null = null;\n  private _nativeCurrentImageMarker: NativeCurrentImageMarker | null = null;\n  private _screenDirectionCone: ScreenDirectionCone | null = null;\n  private _cameraCone: CameraConeGraphics<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> | null = null;\n",
              "after": "  private _turboLoadingTimer: ReturnType<typeof setTimeout> | null = null;\n  private _selectionPulse: SelectionPulse<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> | null = null;\n  private _nativeImageAnchorAbort: AbortController | null = null;\n  private _nativeImageAnchorKey = '';\n  private _directionAnchorAbort: AbortController | null = null;\n  private _clickRippleAnimations: ClickRippleAnimations<__esri.Graphic, __esri.MapView | __esri.SceneView> | null = null;\n  private _nativeCurrentImageMarker: NativeCurrentImageMarker | null = null;\n  private _screenDirectionCone: ScreenDirectionCone | null = null;\n  private _cameraCone: CameraConeGraphics<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> | null = null;\n"
            },
            {
              "label": "direction hover forwarding 1",
              "before": "  /** Forward the resolved navigation target to the map/minimap pulse owner. */\n  private drawDirectionHighlight(hoveredImg: { id: string; lon: number; lat: number }) {\n    const view = this.state.jimuMapView?.view;\n    if (!view || !this.ArcGISModules) return;\n    const anchor = view.type === '3d' ? this.getCoverageDisplayPosition(String(hoveredImg.id), hoveredImg.lon, hoveredImg.lat) : hoveredImg;\n    this.ensureDirectionHoverMarker().draw(view, { id: hoveredImg.id, lon: anchor.lon, lat: anchor.lat });\n  }\n\n  /** Release the navigation-target marker, matching minimap marker and pulse interval. */\n  private clearDirectionHighlight() {\n    this._directionHighlight?.clear();\n  }\n\n  // #regionend Direction Hover System\n",
              "after": "  /** Forward the resolved navigation target to the map/minimap pulse owner. */\n  private drawDirectionHighlight(hoveredImg: { id: string; lon: number; lat: number }) {\n    const view = this.state.jimuMapView?.view;\n    if (!view || !this.ArcGISModules) return;\n    if (view.type !== '3d') { this.ensureDirectionHoverMarker().draw(view, hoveredImg); return; }\n    void this.resolveDirectionHoverAnchor(view, hoveredImg);\n  }\n\n  /** Resolve this exact navigation image in coverage tiles; never choose a neighbouring ID. */\n  private async resolveDirectionHoverAnchor(view: __esri.MapView | __esri.SceneView, image: { id: string; lon: number; lat: number }) {\n    this._directionAnchorAbort?.abort();\n    const controller = new AbortController(); this._directionAnchorAbort = controller;\n    const context = { ...this.coverageSelectionContext() }, token = this.accessToken;\n    const current = () => this._directionAnchorAbort === controller && !controller.signal.aborted &&\n      this.state.jimuMapView?.view === view && !view.destroyed && this.accessToken === token &&\n      this.coverageSelectionContext().revision === context.revision && this.coverageSelectionContext().layer === context.layer;\n    const { lon, lat } = image;\n    try {\n      if (context.enabled && context.individual && !this._coverageSelectionTargets.anchor(context, image.id)) {\n        const zoom = ZOOM.TILE_FETCH, n = 2 ** zoom;\n        const x = Math.max(0, Math.min(n - 1, Math.floor((lon + 180) / 360 * n)));\n        const latitude = Math.max(-85.05112878, Math.min(85.05112878, lat));\n        const y = Math.max(0, Math.min(n - 1, Math.floor((1 - Math.asinh(Math.tan(latitude * Math.PI / 180)) / Math.PI) / 2 * n)));\n        const tiles: [number, number, number][] = [[x, y, zoom]];\n        // API and tile quantization can straddle a boundary. Reuse adjacent cached bytes only.\n        for (const [tileKey] of this._turboTileCache.snapshot()) {\n          const [z, tx, ty] = tileKey.split('/').map(Number);\n          if (z === zoom && Math.abs(tx - x) <= 1 && Math.abs(ty - y) <= 1 && (tx !== x || ty !== y)) tiles.push([tx, ty, z]);\n        }\n        for (const tile of tiles) {\n          if (!current()) return;\n          const [tx, ty, z] = tile;\n          const cached = this._turboTileCache.get(`${z}/${tx}/${ty}`);\n          const buffer = cached ?? await this.runSequenceBackground(signal => this.getTurboTileBuffer(tile, signal), controller.signal);\n          if (!current()) return;\n          if (!buffer.byteLength) continue;\n          const index = this._sequenceTileIndex.has(buffer)\n            ? await this.getSequenceTileIndex(buffer, controller.signal)\n            : await this.runSequenceBackground(signal => this.getSequenceTileIndex(buffer, signal), controller.signal);\n          if (!current()) return;\n          const point = nativeImageAnchor(buffer, index, bytes => new VectorTile(new Pbf(new Uint8Array(bytes))), tile, image.id);\n          if (!point) continue;\n          const geometry = new this.ArcGISModules.Point({ ...point, spatialReference: { wkid: 3857 } });\n          this._coverageSelectionTargets.retain(this.coverageSelectionContext(), image.id, geometry);\n          break;\n        }\n      }\n    } catch (error) {\n      if (current() && (error as any)?.name !== 'AbortError') this.log('[Mapillary] Direction coverage anchor unavailable:', error);\n    } finally {\n      if (current()) {\n        const anchor = this.getCoverageDisplayPosition(image.id, lon, lat);\n        this.ensureDirectionHoverMarker().draw(view, { id: image.id, lon: anchor.lon, lat: anchor.lat });\n      }\n      if (this._directionAnchorAbort === controller) this._directionAnchorAbort = null;\n    }\n  }\n\n  /** Release the navigation-target marker, matching minimap marker and pulse interval. */\n  private clearDirectionHighlight() {\n    this._directionAnchorAbort?.abort(); this._directionAnchorAbort = null;\n    this._directionHighlight?.clear();\n  }\n\n  // #regionend Direction Hover System\n"
            }
          ]
        }
      ]
    },
    {
      "file": "docs/EXACT-DIRECTION-HOVER-ANCHOR.md",
      "content": "# v6.94: Exact coverage position for 3D arrow hover\n\nRequires v6.93. Install with `node apply-exact-direction-anchor-v6-94.cjs`, rebuild and reload.\n\n3D arrow hover resolves the target image's exact ID in coverage tile data before displaying its marker. Existing retained display anchors, cached bytes, shared tile transport and shared indexes are reused. A cache miss can request one tile through the existing background queue; neighbouring tiles are searched only when already cached. No nearest-point snapping or alternate-image selection occurs.\n\nLeaving hover, changing target/view/token or changing coverage revision prevents late results from drawing. Resolved positions are retained in the existing bounded display-anchor cache. A missing exact match or lookup failure retains the original source position. 2D arrow rendering, discovery priority, sequence selection, picking and coverage loading are unchanged. Existing v6.93 steady 3D marker styling remains.\n\nFive runtime-method tests cover exact IDs, cache reuse, cold requests, unmatched targets and stale/cancelled work. SDK build passes. A visual check is still needed in the user's 3D scene; this addresses coordinate mismatch, not every possible native-renderer projection offset.\n\nRollback: `node apply-exact-direction-anchor-v6-94.cjs --uninstall`, rebuild and reload.\n"
    },
    {
      "file": "tests/directionHoverAnchor.test.cjs",
      "content": "const fs=require('fs'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst source=fs.readFileSync(__dirname+'/../src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cls=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');const names=['resolveDirectionHoverAnchor','clearDirectionHighlight'];const code=ts.transpileModule('class Runtime{'+names.map(name=>cls.members.find(n=>n.name?.getText(sf)===name).getText(sf)).join('\\n')+'}',{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;\nfunction setup({warm=true,match=true}={}){const calls=[],draws=[],anchors=new Map(),view={type:'3d'},context={view,layer:{},revision:1,enabled:true,individual:true},buffer=new ArrayBuffer(1);let downloads=0;const Runtime=new Function('ZOOM','nativeImageAnchor','VectorTile','Pbf',code+';return Runtime')({TILE_FETCH:14},(b,i,decode,tile,id)=>{calls.push(id);return match?{longitude:5,latitude:6}:null},class{},class{}),w=new Runtime();w.state={jimuMapView:{view}};w.accessToken='token';w.ArcGISModules={Point:class{constructor(p){Object.assign(this,p)}}};w.coverageSelectionContext=()=>context;w._coverageSelectionTargets={anchor:(c,id)=>anchors.get(id),retain:(c,id,g)=>anchors.set(id,g)};w.getCoverageDisplayPosition=(id,lon,lat)=>anchors.has(id)?{lon:anchors.get(id).longitude,lat:anchors.get(id).latitude}:{lon,lat};w._turboTileCache={snapshot:()=>[],get:()=>warm?buffer:undefined};w._sequenceTileIndex={has:()=>true};w.getSequenceTileIndex=async()=>({});w.runSequenceBackground=(fn,signal)=>fn(signal);w.getTurboTileBuffer=async()=>{downloads++;return buffer};w.ensureDirectionHoverMarker=()=>({draw:(v,img)=>draws.push(img)});w.log=()=>{};return{w,view,context,calls,draws,anchors,buffer,downloads:()=>downloads}}\ntest('exact hovered ID uses cached tile anchor instead of raw API coordinates, then reuses retained anchor',async()=>{const x=setup();await x.w.resolveDirectionHoverAnchor(x.view,{id:'A',lon:1,lat:2});assert.deepEqual(x.calls,['A']);assert.deepEqual(x.draws,[{id:'A',lon:5,lat:6}]);assert.equal(x.downloads(),0);await x.w.resolveDirectionHoverAnchor(x.view,{id:'A',lon:1,lat:2});assert.equal(x.calls.length,1)});\ntest('unmatched exact ID preserves source position and never picks a nearby image',async()=>{const x=setup({match:false});await x.w.resolveDirectionHoverAnchor(x.view,{id:'A',lon:1,lat:2});assert.deepEqual(x.calls,['A']);assert.deepEqual(x.draws,[{id:'A',lon:1,lat:2}]);assert.equal(x.anchors.size,0)});\ntest('cold target makes one shared tile request',async()=>{const x=setup({warm:false});await x.w.resolveDirectionHoverAnchor(x.view,{id:'A',lon:1,lat:2});assert.equal(x.downloads(),1);assert.equal(x.draws[0].lon,5)});\ntest('leaving hover aborts pending work and late response cannot recreate marker',async()=>{const x=setup({warm:false});let release;x.w.getTurboTileBuffer=()=>new Promise(resolve=>release=resolve);const pending=x.w.resolveDirectionHoverAnchor(x.view,{id:'A',lon:1,lat:2});const controller=x.w._directionAnchorAbort;x.w.clearDirectionHighlight();release(x.buffer);await pending;assert(controller.signal.aborted);assert.equal(x.draws.length,0);assert.equal(x.anchors.size,0)});\ntest('new target cancels old result; revision change suppresses stale marker',async()=>{const x=setup({warm:false});let release;x.w.getTurboTileBuffer=()=>new Promise(resolve=>release=resolve);const old=x.w.resolveDirectionHoverAnchor(x.view,{id:'A',lon:1,lat:2});x.w._turboTileCache.get=()=>x.buffer;await x.w.resolveDirectionHoverAnchor(x.view,{id:'B',lon:1,lat:2});release(x.buffer);await old;assert.deepEqual(x.draws.map(p=>p.id),['B']);x.w.getSequenceTileIndex=async()=>{x.context.revision++;return{}};await x.w.resolveDirectionHoverAnchor(x.view,{id:'C',lon:1,lat:2});assert.equal(x.draws.length,1)});\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'exact-direction-anchor-v6-94-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.94 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'exact-direction-anchor-v6-94' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.94 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.94 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.94 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-exact-direction-anchor-v6-94.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Exact 3D direction anchor v6.94 is already installed. No files changed.');
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
  const manifest = { installer: 'exact-direction-anchor-v6-94', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Exact 3D direction anchor v6.94 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
