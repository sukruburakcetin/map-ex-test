#!/usr/bin/env node
'use strict';
/**
 * Current image presentation ownership confirmation. Compatible current v6 sources.
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
              "label": "Current image presentation ownership 1",
              "before": "import { ClickRippleAnimations } from '../features/map-graphics/ClickRippleAnimations';\nimport { NativeCurrentImageMarker } from '../features/map-graphics/NativeCurrentImageMarker';\nimport { ScreenDirectionCone } from '../features/map-graphics/ScreenDirectionCone';\nimport { SelectionPulse, renderedGroundPoint } from '../features/map-graphics/SelectionPulse';\nimport { capConeFootprint } from \"../features/map-graphics/capConeFootprint\";\nimport { projectedConeRadius } from \"../features/map-graphics/projectedConeRadius\";\n",
              "after": "import { ClickRippleAnimations } from '../features/map-graphics/ClickRippleAnimations';\nimport { NativeCurrentImageMarker } from '../features/map-graphics/NativeCurrentImageMarker';\nimport { ScreenDirectionCone } from '../features/map-graphics/ScreenDirectionCone';\nimport { CurrentImagePresentationOwner } from '../features/map-graphics/CurrentImagePresentationOwner';\nimport { SelectionPulse, renderedGroundPoint } from '../features/map-graphics/SelectionPulse';\nimport { capConeFootprint } from \"../features/map-graphics/capConeFootprint\";\nimport { projectedConeRadius } from \"../features/map-graphics/projectedConeRadius\";\n"
            },
            {
              "label": "Current image presentation ownership 2",
              "before": "  private _clickRippleAnimations: ClickRippleAnimations<__esri.Graphic, __esri.MapView | __esri.SceneView> | null = null;\n  private _nativeCurrentImageMarker: NativeCurrentImageMarker | null = null;\n  private _screenDirectionCone: ScreenDirectionCone | null = null;\n  private _cameraCone: CameraConeGraphics<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> | null = null;\n  private _turboMetadataCache = new TurboMetadataCache<any>();\n  private _turboTileCache = new TurboTileCache();\n",
              "after": "  private _clickRippleAnimations: ClickRippleAnimations<__esri.Graphic, __esri.MapView | __esri.SceneView> | null = null;\n  private _nativeCurrentImageMarker: NativeCurrentImageMarker | null = null;\n  private _screenDirectionCone: ScreenDirectionCone | null = null;\n  private readonly _currentImagePresentation = new CurrentImagePresentationOwner();\n  private claimCurrentImagePresentation(view: __esri.MapView | __esri.SceneView): void {\n    if(!view?.map||view.destroyed||this.props.visible===false||this.props.state==='CLOSED')return;\n    this._currentImagePresentation.activate(view.map,String(this.props.id),()=>{\n      this._nativeImageAnchorAbort?.abort();this._nativeImageAnchorAbort=null;this._nativeImageAnchorKey='';\n      if(this._coneRedrawRaf!=null){cancelAnimationFrame(this._coneRedrawRaf);this._coneRedrawRaf=null;}\n      this._nativeCurrentImageMarker?.clear();this._screenDirectionCone?.clear();\n      this._selectionPulse?.dispose();this._cameraCone?.dispose(view);\n    });\n  }\n  private _cameraCone: CameraConeGraphics<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> | null = null;\n  private _turboMetadataCache = new TurboMetadataCache<any>();\n  private _turboTileCache = new TurboTileCache();\n"
            },
            {
              "label": "Current image presentation ownership 3",
              "before": "  // destroys Mapillary viewer instance, clears DOM container,\n  // and resets internal state if requested.\n  private cleanupWidgetEnvironment(resetState: boolean = false, fullRemove: boolean = true) {\n    if (resetState || fullRemove) { this._placesExploreAbort?.abort(); this._places?.dispose(); this._places = null; this._placesView = null; }\n    this.clearSequenceDiagnostics();\n    this._hoverTimingAbort?.abort(); this._hoverSequenceTiming?.cancel();\n",
              "after": "  // destroys Mapillary viewer instance, clears DOM container,\n  // and resets internal state if requested.\n  private cleanupWidgetEnvironment(resetState: boolean = false, fullRemove: boolean = true) {\n    this._currentImagePresentation?.release();\n    if (resetState || fullRemove) { this._placesExploreAbort?.abort(); this._places?.dispose(); this._places = null; this._placesView = null; }\n    this.clearSequenceDiagnostics();\n    this._hoverTimingAbort?.abort(); this._hoverSequenceTiming?.cancel();\n"
            },
            {
              "label": "Current image presentation ownership 4",
              "before": "      this.cleanupWidgetEnvironment(true, false);\n    }\n\n    // Closed: Full cleanup\n    if (prevProps.state === \"OPENED\" && this.props.state === \"CLOSED\") {\n      this.log(\"Widget closed - cleaning up completely\");\n",
              "after": "      this.cleanupWidgetEnvironment(true, false);\n    }\n\n    if(prevProps.visible===false&&this.props.visible!==false&&this.state.jimuMapView?.view)\n      this.claimCurrentImagePresentation(this.state.jimuMapView.view);\n\n    // Closed: Full cleanup\n    if (prevProps.state === \"OPENED\" && this.props.state === \"CLOSED\") {\n      this.log(\"Widget closed - cleaning up completely\");\n"
            },
            {
              "label": "Current image presentation ownership 5",
              "before": "\n    // 3. Handle Reopening (Seamless Filter Loading)\n    if (prevProps.state === \"CLOSED\" && this.props.state === \"OPENED\" && this.state.jimuMapView) {\n      this.log(\"Widget reopened - initializing environment...\");\n\n      // A. Define the initialization logic that should run ONLY after the layer is ready\n",
              "after": "\n    // 3. Handle Reopening (Seamless Filter Loading)\n    if (prevProps.state === \"CLOSED\" && this.props.state === \"OPENED\" && this.state.jimuMapView) {\n      this.claimCurrentImagePresentation(this.state.jimuMapView.view);\n      this.log(\"Widget reopened - initializing environment...\");\n\n      // A. Define the initialization logic that should run ONLY after the layer is ready\n"
            },
            {
              "label": "Current image presentation ownership 6",
              "before": "    this._reverseGeocodeAbort?.abort(); this._backgroundRequests.clear();\n    this._timeTravelAvailability?.clear(); this._cachedSequencePreview?.clear();\n    this.clearFieldNotesGroup();\n    // Commit the NEW MapView first.\n    // Only then restore graphics and sign/object watchers.\n    this.setState(\n",
              "after": "    this._reverseGeocodeAbort?.abort(); this._backgroundRequests.clear();\n    this._timeTravelAvailability?.clear(); this._cachedSequencePreview?.clear();\n    this.clearFieldNotesGroup();\n    this.claimCurrentImagePresentation(view);\n    // Commit the NEW MapView first.\n    // Only then restore graphics and sign/object watchers.\n    this.setState(\n"
            },
            {
              "label": "Current image presentation ownership 7",
              "before": "\n    // CLICK HANDLER\n    this.mapClickHandle = view.on(\"click\", async (evt) => {\n      if (this.props.state === \"CLOSED\") return;\n      if(this._workspaceNoteLocation?.active){\n        evt.stopPropagation();const point=view.toMap(evt);\n        this._workspaceNoteLocation.consume(view,point?{lon:point.longitude,lat:point.latitude}:null);\n",
              "after": "\n    // CLICK HANDLER\n    this.mapClickHandle = view.on(\"click\", async (evt) => {\n      if (this.props.state === \"CLOSED\"||this.props.visible===false) return;\n      this.claimCurrentImagePresentation?.(view);\n      if(this._workspaceNoteLocation?.active){\n        evt.stopPropagation();const point=view.toMap(evt);\n        this._workspaceNoteLocation.consume(view,point?{lon:point.longitude,lat:point.latitude}:null);\n"
            },
            {
              "label": "Current image presentation ownership 8",
              "before": "      // late results must lose ownership before they can open imagery or tools.\n      const clickRevision = this._mapClickRevision = (this._mapClickRevision ?? 0) + 1;\n      const clickCurrent = () => this._mapClickRevision === clickRevision &&\n        this.state.jimuMapView?.view === view && !view.destroyed && this.props.state !== \"CLOSED\";\n      this._turboClickPickAbort?.abort();\n      this._mapFeatureClickAbort?.abort();\n      if (this.state.coverageFrameResolving) this.setState({ coverageFrameResolving: false });\n",
              "after": "      // late results must lose ownership before they can open imagery or tools.\n      const clickRevision = this._mapClickRevision = (this._mapClickRevision ?? 0) + 1;\n      const clickCurrent = () => this._mapClickRevision === clickRevision &&\n        this.state.jimuMapView?.view === view && !view.destroyed && this.props.state !== \"CLOSED\" &&\n        (!this._currentImagePresentation||this._currentImagePresentation.owns(view.map));\n      this._turboClickPickAbort?.abort();\n      this._mapFeatureClickAbort?.abort();\n      if (this.state.coverageFrameResolving) this.setState({ coverageFrameResolving: false });\n"
            },
            {
              "label": "Current image presentation ownership 9",
              "before": "  private drawPulsingPoint(lon: number, lat: number, baseColor: any = [0, 255, 0, 1], imageId = this.state.imageId) {\n    const view = this.state.jimuMapView?.view;\n    if (!view || !this.ArcGISModules || !Number.isFinite(lon) || !Number.isFinite(lat)) return null;\n    const anchor = this.getCoverageDisplayPosition(String(imageId), lon, lat);\n    const graphic = this.ensureSelectionPulseOwner().show(view, anchor, lon, lat, baseColor, imageId, false);\n    {\n",
              "after": "  private drawPulsingPoint(lon: number, lat: number, baseColor: any = [0, 255, 0, 1], imageId = this.state.imageId) {\n    const view = this.state.jimuMapView?.view;\n    if (!view || !this.ArcGISModules || !Number.isFinite(lon) || !Number.isFinite(lat)) return null;\n    if(this._currentImagePresentation&&!this._currentImagePresentation.owns(view.map))return null;\n    const anchor = this.getCoverageDisplayPosition(String(imageId), lon, lat);\n    const graphic = this.ensureSelectionPulseOwner().show(view, anchor, lon, lat, baseColor, imageId, false);\n    {\n"
            },
            {
              "label": "Current image presentation ownership 10",
              "before": "  private drawCone(lon: number, lat: number, heading: number, radiusMeters = 5, spreadDeg = 60) {\n    const view = this.state.jimuMapView?.view;\n    if (!view || !this.ArcGISModules || ![lon, lat, heading, radiusMeters, spreadDeg].every(Number.isFinite) || radiusMeters <= 0 || spreadDeg <= 0 || spreadDeg >= 180) return null;\n    const screenCone = this.ensureScreenDirectionCone();\n    if (screenCone) {\n      const anchor = this.getCoverageDisplayPosition(String(this.state.imageId), lon, lat);\n",
              "after": "  private drawCone(lon: number, lat: number, heading: number, radiusMeters = 5, spreadDeg = 60) {\n    const view = this.state.jimuMapView?.view;\n    if (!view || !this.ArcGISModules || ![lon, lat, heading, radiusMeters, spreadDeg].every(Number.isFinite) || radiusMeters <= 0 || spreadDeg <= 0 || spreadDeg >= 180) return null;\n    if(this._currentImagePresentation&&!this._currentImagePresentation.owns(view.map))return null;\n    const screenCone = this.ensureScreenDirectionCone();\n    if (screenCone) {\n      const anchor = this.getCoverageDisplayPosition(String(this.state.imageId), lon, lat);\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/map-graphics/CurrentImagePresentationOwner.ts",
      "content": "/** A layout/HMR remount may leave an old widget alive on the same map. Share\n * presentation ownership across module copies, scoped by map and widget ID. */\ntype Entry={retire:()=>void};\ntype Registry=WeakMap<object,Map<string,Entry>>;\nconst key=Symbol.for('mapillary-explorer.current-image-presentations.v1');\nconst scope=globalThis as unknown as Record<symbol,Registry>;\nconst registry:Registry=scope[key]||(scope[key]=new WeakMap());\nexport class CurrentImagePresentationOwner {\n private map:object|null=null;\n private widgetId='';\n private entry:Entry|null=null;\n activate(map:object,widgetId:string,retire:()=>void):void {\n  if(this.owns(map)&&this.widgetId===widgetId)return;\n  this.release();\n  let owners=registry.get(map);if(!owners){owners=new Map();registry.set(map,owners);}\n  const previous=owners.get(widgetId),entry={retire};\n  this.map=map;this.widgetId=widgetId;this.entry=entry;\n  // Publish the new owner before retiring the old one. Its cleanup/callbacks\n  // cannot delete or redraw the replacement's resources.\n  owners.set(widgetId,entry);\n  if(previous)previous.retire();\n }\n owns(map:object):boolean {return !!this.entry&&this.map===map&&registry.get(map)?.get(this.widgetId)===this.entry;}\n release():void {\n  if(this.map&&this.entry){const owners=registry.get(this.map);if(owners?.get(this.widgetId)===this.entry){owners.delete(this.widgetId);if(!owners.size)registry.delete(this.map);}}\n  this.map=null;this.entry=null;\n }\n}\n"
    },
    {
      "file": "tests/currentImagePresentationOwner.test.cjs",
      "content": "const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),test=require('node:test'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;\nfunction load(){const m={exports:{}};new Function('module','exports',compile(fs.readFileSync(path.join(__dirname,'../src/features/map-graphics/CurrentImagePresentationOwner.ts'),'utf8')))(m,m.exports);return m.exports.CurrentImagePresentationOwner;}const Owner=load();\ntest('five same-widget owners leave one active presentation and reject retired asynchronous callbacks',()=>{const map={},owners=[],retired=[];for(let i=0;i<5;i++){const owner=new Owner();owners.push(owner);owner.activate(map,'widget-A',()=>retired.push(i));}assert.deepEqual(retired,[0,1,2,3]);assert.deepEqual(owners.map(owner=>owner.owns(map)),[false,false,false,false,true]);for(const owner of owners.slice(0,4))owner.release();assert.equal(owners[4].owns(map),true);owners[4].release();});\ntest('ownership is shared across loaded module copies; independent widgets/maps remain untouched',()=>{const Other=load(),map={},otherMap={},a=new Owner(),b=new Other(),independent=new Owner(),differentMap=new Owner();let retired=0;a.activate(map,'A',()=>retired++);independent.activate(map,'B',()=>assert.fail('other widget retired'));differentMap.activate(otherMap,'A',()=>assert.fail('other map retired'));b.activate(map,'A',()=>{});assert.equal(retired,1);assert.equal(a.owns(map),false);assert.equal(independent.owns(map),true);assert.equal(differentMap.owns(otherMap),true);a.release();assert.equal(b.owns(map),true);for(const o of [b,independent,differentMap])o.release()});\ntest('same instance activation is idempotent and can explicitly reacquire after a layout return',()=>{const map={},a=new Owner(),b=new Owner();let retired=0;a.activate(map,'A',()=>retired++);a.activate(map,'A',()=>retired++);assert.equal(retired,0);b.activate(map,'A',()=>{});assert.equal(retired,1);a.activate(map,'A',()=>{});assert.equal(a.owns(map),true);assert.equal(b.owns(map),false);a.release();b.release()});\nconst source=fs.readFileSync(path.join(__dirname,'../src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget'),method=name=>widget.members.find(n=>n.name?.getText(sf)===name).getText(sf);\nconst Harness=new Function('CurrentImagePresentationOwner',compile('class Harness{'+['_currentImagePresentation','claimCurrentImagePresentation','drawPulsingPoint','drawCone'].map(method).join('\\n')+'};return Harness;'))(Owner);\ntest('actual runtime handoff clears old renderers and late old draw calls cannot create a marker or cone',()=>{const map={},view={map,type:'2d'},a=new Harness(),b=new Harness(),cleared=[];for(const w of [a,b]){w.props={id:'same-widget',state:'OPENED'};w.state={jimuMapView:{view}};w.ArcGISModules={};}a._nativeCurrentImageMarker={clear:()=>cleared.push('native')};a._screenDirectionCone={clear:()=>cleared.push('svg')};a._selectionPulse={dispose:()=>cleared.push('selection')};a._cameraCone={dispose:v=>{assert.equal(v,view);cleared.push('fallback')}};a.claimCurrentImagePresentation(view);b.claimCurrentImagePresentation(view);assert.deepEqual(cleared,['native','svg','selection','fallback']);assert.equal(a.drawPulsingPoint(1,2,undefined,'old'),null);assert.equal(a.drawCone(1,2,0),null);b._currentImagePresentation.release();});\ntest('hidden/closed widgets cannot steal presentation ownership',()=>{const view={map:{}},a=new Harness();for(const props of [{id:'a',visible:false},{id:'a',state:'CLOSED'}]){a.props=props;a.claimCurrentImagePresentation(view);assert.equal(a._currentImagePresentation.owns(view.map),false)}});\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'current-image-presentation-ownership-';

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
      if (entry.content !== undefined && next !== normalize(entry.content)) continue;
      if (entry.required && !entry.required.every(fragment => next.includes(fragment))) continue;
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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed collaboration workspaces upgrade installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'current-image-presentation-ownership' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null && change.resultSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after collaboration workspaces upgrade installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      if (change.resultSha256 === null) {
        if (current.bytes === null) writes.push({ ...current, relative: change.file, original: null, content: original });
        else if (digest(current.bytes) !== change.originalSha256) conflict(change.file + ' (replacement at removed component path)');
        continue;
      }
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after collaboration workspaces upgrade installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed collaboration workspaces upgrade installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-current-image-presentation-ownership.cjs [--dry-run] [--uninstall]');
  readTarget('src/runtime/widget.tsx', true);
  let writes;
  if (uninstall) writes = uninstallWrites();
  else {
    const seen = new Set(); writes = [];
    for (const entry of payload.entries) {
      if (seen.has(entry.file)) throw new Error('Duplicate patch path: ' + entry.file);
      seen.add(entry.file);
      if (entry.removeIfContent !== undefined) {
        const current = readTarget(entry.file);
        if (current.bytes === null) continue;
        if (normalize(current.bytes.toString('utf8')) !== normalize(entry.removeIfContent)) conflict(entry.file + ' (edited retired component)');
        writes.push({ ...current, relative: entry.file, original: current.bytes, content: null });
        continue;
      }
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Current image presentation ownership confirmation is already installed. No files changed.');
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
  const manifest = { installer: 'current-image-presentation-ownership', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Current image presentation ownership confirmation ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
