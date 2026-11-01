#!/usr/bin/env node
'use strict';
/**
 * Stable 3D direction hover v6.93. Compatible current v6 sources.
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
      "file": "src/features/map-graphics/DirectionHoverMarker.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "steady ground target",
              "before": "/** Pulsing navigation-target marker, matching minimap marker and interval lifetime. */\nexport interface DirectionMarkerGraphic { symbol: any; }\nexport interface DirectionMarkerView<G> {\n  type: string;\n  graphics: { add(graphic: G): unknown; remove(graphic: G): unknown };\n}\nexport interface DirectionMarkerMinimap<G> {\n  graphics: { forEach(callback: (graphic: G) => void): void };\n  add(graphic: G): unknown;\n  remove(graphic: G): unknown;\n}\nexport interface DirectionMarkerHost<G> {\n  getView(): DirectionMarkerView<G> | null | undefined;\n  getMinimap(): DirectionMarkerMinimap<G> | null;\n  createGraphic(properties: any): G;\n  setInterval(callback: () => void, milliseconds: number): ReturnType<typeof setInterval>;\n  clearInterval(handle: ReturnType<typeof setInterval>): void;\n}\n\n/** Owns the yellow direction-hover visuals; coordinate lookup and hover identity stay host-owned.\n * Preserves the 60 ms interval, 16\u201320 px pulse, 3D lift/callout and tagged minimap cleanup.\n * The host readers retain the existing cleanup policy of using the currently active view/layer.\n */\nexport class DirectionHoverMarker<G extends DirectionMarkerGraphic> {\n  graphic: G | null = null;\n  private readonly host: DirectionMarkerHost<G>;\n  constructor(host: DirectionMarkerHost<G>) { this.host = host; }\n  private get minimapGraphicsLayer(): DirectionMarkerMinimap<G> | null { return this.host.getMinimap(); }\n\n  /** Draw a WGS84 navigation target after the host has resolved its coordinates.\n   * Replaces the previous marker and timer; no image requests or subscriptions are created here.\n   */\n  draw(view: DirectionMarkerView<G>, hoveredImg: { id: string; lon: number; lat: number }): void {\n    // Remove any existing highlight before drawing a new one\n    this.clear();\n    const is3D = view.type === \"3d\";\n\n    const geometry = {\n      type: \"point\",\n      longitude: hoveredImg.lon,\n      latitude: hoveredImg.lat,\n      spatialReference: { wkid: 4326 },\n    };\n\n    // Helper function to create the correct symbol for 2D or 3D\n    const getSymbol = (currentSize: number) => {\n      if (is3D) {\n        return {\n          type: \"point-3d\",\n\n          /*\n           * Keep the hover marker visible while the\n           * SceneView camera rotates / changes pitch.\n           */\n          disableDepthTestDistance: Number.POSITIVE_INFINITY,\n\n          symbolLayers: [\n            {\n              type: \"icon\",\n\n              /*\n               * JSAPI native visibility behavior.\n               * Same fix used by the green pulse.\n               */\n              occludedVisibility: {\n                mode: \"visible\",\n              },\n\n              resource: {\n                primitive: \"circle\",\n              },\n\n              material: {\n                color: [255, 255, 0, 0.8],\n              },\n\n              outline: {\n                color: [255, 165, 0, 1],\n                size: 2,\n              },\n\n              size: currentSize,\n            },\n          ],\n\n          /*\n           * Keep your existing lifted hover design.\n           * Unlike the green point, this is already\n           * sufficiently undraped from the ground.\n           */\n          verticalOffset: {\n            screenLength: 45,\n            maxWorldLength: 100,\n            minWorldLength: 5,\n          },\n\n          callout: {\n            type: \"line\",\n            size: 2,\n            color: [255, 165, 0, 1],\n\n            border: {\n              color: [0, 0, 0, 0.3],\n            },\n          },\n        };\n      } else {\n        // Standard 2D rendering\n        return {\n          type: \"simple-marker\",\n          style: \"circle\",\n          color: [255, 255, 0, 0.8],\n          size: currentSize,\n          outline: { color: [255, 165, 0, 1], width: 3 },\n        };\n      }\n    };\n\n    const graphic = this.host.createGraphic({\n      geometry: geometry,\n      symbol: getSymbol(16) as any,\n    });\n\n    view.graphics.add(graphic);\n    this.graphic = graphic;\n\n    // Also add a simple yellow marker to the minimap so the hover is visible there too\n    if (this.minimapGraphicsLayer) {\n      const minimapHoverGraphic = this.host.createGraphic({\n        geometry: geometry,\n        symbol: {\n          type: \"simple-marker\",\n          style: \"circle\",\n          color: [255, 255, 0, 0.85],\n          size: 12,\n          outline: { color: [255, 165, 0, 1], width: 2 },\n        } as any,\n      });\n      (minimapHoverGraphic as any).__isDirectionHover = true;\n      this.minimapGraphicsLayer.add(minimapHoverGraphic);\n    }\n\n    // Pulse animation state\n    let growing = true;\n    let size = 16;\n\n    // Creates a pulsing effect by oscillating marker size\n    const pulseInterval = this.host.setInterval(() => {\n      if (!this.graphic) {\n        this.host.clearInterval(pulseInterval);\n        return;\n      }\n\n      size += growing ? 0.5 : -0.5;\n      if (size >= 20) growing = false;\n      if (size <= 16) growing = true;\n\n      this.graphic.symbol = getSymbol(size) as any;\n    }, 60);\n\n    // Store interval reference for cleanup\n    (graphic as any)._pulseInterval = pulseInterval;\n  }\n\n  /** Stop the active pulse, remove the map graphic and remove tagged minimap markers only.\n   * Repeated clears are harmless; unrelated minimap graphics remain untouched.\n   */\n  clear(): void {\n    if (this.graphic) {\n      // Stop pulse animation\n      if ((this.graphic as any)._pulseInterval) {\n        this.host.clearInterval((this.graphic as any)._pulseInterval);\n      }\n      // Remove graphic from the map view\n      const view = this.host.getView();\n      if (view) {\n        view.graphics.remove(this.graphic);\n      }\n      // Remove from minimap too\n      if (this.minimapGraphicsLayer) {\n        const toRemove: G[] = [];\n        this.minimapGraphicsLayer.graphics.forEach((g: G) => {\n          if ((g as any).__isDirectionHover) toRemove.push(g);\n        });\n        toRemove.forEach((g) => this.minimapGraphicsLayer!.remove(g));\n      }\n      this.graphic = null;\n    }\n  }\n}\n",
              "after": "/** Ground-aligned navigation target; 3D is steady, 2D retains its existing pulse. */\nexport interface DirectionMarkerGraphic { symbol: any; geometry?: any; visible?: boolean; }\nexport interface DirectionMarkerView<G> {\n type: string;\n graphics: { add(graphic: G): unknown; remove(graphic: G): unknown };\n}\nexport interface DirectionMarkerMinimap<G> {\n graphics: { forEach(callback: (graphic: G) => void): void };\n add(graphic: G): unknown; remove(graphic: G): unknown;\n}\ninterface GroundMarker {\n showMarker(view: any, lon: number, lat: number, color: any, imageId: string): void;\n clear(): void;\n}\nexport interface DirectionMarkerHost<G> {\n getView(): DirectionMarkerView<G> | null | undefined;\n getMinimap(): DirectionMarkerMinimap<G> | null;\n createGraphic(properties: any): G;\n createGroundMarker?(presented: (visible: boolean) => void): GroundMarker;\n setInterval(callback: () => void, milliseconds: number): ReturnType<typeof setInterval>;\n clearInterval(handle: ReturnType<typeof setInterval>): void;\n}\nexport class DirectionHoverMarker<G extends DirectionMarkerGraphic> {\n graphic: G | null = null;\n private view: DirectionMarkerView<G> | null = null;\n private minimap: DirectionMarkerMinimap<G> | null = null;\n private minimapGraphic: G | null = null;\n private ground: GroundMarker | null = null;\n private timer: ReturnType<typeof setInterval> | null = null;\n constructor(private readonly host: DirectionMarkerHost<G>) {}\n draw(view: DirectionMarkerView<G>, image: {id: string; lon: number; lat: number}): void {\n  const geometry={type:'point',longitude:image.lon,latitude:image.lat,spatialReference:{wkid:4326}};\n  const symbol=(size:number)=>view.type==='3d'?{\n   type:'point-3d',symbolLayers:[{type:'icon',resource:{primitive:'circle'},material:{color:[255,193,7,1]},size:12,\n    outline:{color:'white',size:2},occludedVisibility:{mode:'visible'}}]\n  }:{type:'simple-marker',style:'circle',color:[255,255,0,.8],size,outline:{color:[255,165,0,1],width:3}};\n  // Reposition the existing 3D target without rebuilding its Graphic or display owner.\n  if(this.view===view && view.type==='3d' && this.graphic){\n   this.graphic.geometry=geometry;\n   if(this.minimapGraphic)this.minimapGraphic.geometry=geometry;\n   this.ground?.showMarker(view,image.lon,image.lat,[255,193,7,1],image.id);\n   return;\n  }\n  this.clear();this.view=view;\n  const graphic=this.host.createGraphic({geometry,symbol:symbol(16)});\n  this.graphic=graphic;view.graphics.add(graphic);\n  this.minimap=this.host.getMinimap();\n  if(this.minimap){\n   this.minimapGraphic=this.host.createGraphic({geometry,symbol:{type:'simple-marker',style:'circle',color:[255,255,0,.85],size:12,outline:{color:[255,165,0,1],width:2}}});\n   (this.minimapGraphic as any).__isDirectionHover=true;this.minimap.add(this.minimapGraphic);\n  }\n  if(view.type==='3d'){\n   // ScreenDirectionCone uses rendered terrain, bounded ground projection and settled caching.\n   // Keep a steady native fallback until the overlay has a valid screen anchor.\n   try {\n    this.ground=this.host.createGroundMarker?.(presented=>{if(this.graphic===graphic)graphic.visible=!presented})||null;\n    this.ground?.showMarker(view,image.lon,image.lat,[255,193,7,1],image.id);\n   } catch {this.ground?.clear();this.ground=null;graphic.visible=true;}\n   return;\n  }\n  let growing=true,size=16;\n  this.timer=this.host.setInterval(()=>{\n   if(this.graphic!==graphic)return;\n   size+=growing ? .5 : -.5;if(size>=20)growing=false;if(size<=16)growing=true;\n   graphic.symbol=symbol(size);\n  },60);\n }\n clear(): void {\n  if(this.timer!==null)this.host.clearInterval(this.timer);this.timer=null;\n  this.ground?.clear();this.ground=null;\n  if(this.graphic)this.view?.graphics.remove(this.graphic);\n  if(this.minimapGraphic)this.minimap?.remove(this.minimapGraphic);\n  this.graphic=null;this.minimapGraphic=null;this.minimap=null;this.view=null;\n }\n}\n",
              "wholeFile": true
            }
          ]
        }
      ]
    },
    {
      "file": "src/runtime/widget.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "direction hover forwarding 0",
              "before": "    return this._directionHighlight ??= new DirectionHoverMarker({\n      getView: () => this.state.jimuMapView?.view,\n      getMinimap: () => this.minimapGraphicsLayer,\n      createGraphic: properties => new this.ArcGISModules.Graphic(properties),\n      setInterval: (callback, milliseconds) => setInterval(callback, milliseconds),\n      clearInterval: handle => clearInterval(handle),\n    });\n  }\n",
              "after": "    return this._directionHighlight ??= new DirectionHoverMarker({\n      getView: () => this.state.jimuMapView?.view,\n      getMinimap: () => this.minimapGraphicsLayer,\n      createGraphic: properties => new this.ArcGISModules.Graphic(properties),\n      createGroundMarker: presented => new ScreenDirectionCone(\n        properties => new this.ArcGISModules.Point(properties), () => document.createElement('div'),\n        { request: callback => requestAnimationFrame(callback), cancel: frame => cancelAnimationFrame(frame) },\n        visible => presented(visible)),\n      setInterval: (callback, milliseconds) => setInterval(callback, milliseconds),\n      clearInterval: handle => clearInterval(handle),\n    });\n  }\n"
            },
            {
              "label": "direction hover forwarding 1",
              "before": "  /** Forward the resolved navigation target to the map/minimap pulse owner. */\n  private drawDirectionHighlight(hoveredImg: { id: string; lon: number; lat: number }) {\n    const view = this.state.jimuMapView?.view;\n    if (!view || !this.ArcGISModules) return;\n    this.ensureDirectionHoverMarker().draw(view, hoveredImg);\n  }\n\n  /** Release the navigation-target marker, matching minimap marker and pulse interval. */\n  private clearDirectionHighlight() {\n",
              "after": "  /** Forward the resolved navigation target to the map/minimap pulse owner. */\n  private drawDirectionHighlight(hoveredImg: { id: string; lon: number; lat: number }) {\n    const view = this.state.jimuMapView?.view;\n    if (!view || !this.ArcGISModules) return;\n    const anchor = view.type === '3d' ? this.getCoverageDisplayPosition(String(hoveredImg.id), hoveredImg.lon, hoveredImg.lat) : hoveredImg;\n    this.ensureDirectionHoverMarker().draw(view, { id: hoveredImg.id, lon: anchor.lon, lat: anchor.lat });\n  }\n\n  /** Release the navigation-target marker, matching minimap marker and pulse interval. */\n  private clearDirectionHighlight() {\n"
            }
          ]
        }
      ]
    },
    {
      "file": "docs/STABLE-3D-DIRECTION-HOVER.md",
      "content": "# v6.93: Ground-aligned 3D navigation-arrow hover\n\nApply over the latest GitHub sources plus v6.92: `node apply-stable-direction-hover-v6-93.cjs`, rebuild and reload.\n\nThe viewer-arrow hover target in 3D is a steady amber disk with a white rim. It has no lifted callout, pulse interval or repeated symbol replacement. A marker-only ScreenDirectionCone projects it onto rendered ground and caches settled projections. Only one overlay/tracker exists while a target is hovered; clearing hover disposes it. The existing coverage display anchor is used where available. No image lookup, sequence selection, picking or coverage pipeline changes are included.\n\nA steady native icon remains as the fallback when the projected overlay is unavailable. The matching minimap marker remains. 2D keeps the existing yellow pulse. Graphic identity is reused when changing 3D targets. Cleanup removes graphics from the original view and minimap even after the active view changes.\n\nValidation: 3 target lifecycle tests, 15 shared ground-projection tests and strict owner compilation pass. This removes the lifted symbol and animated 3D symbol replacements; alignment and flicker still require a visual check on the user's SceneView/GPU.\n\nRollback: `node apply-stable-direction-hover-v6-93.cjs --uninstall`, rebuild and reload.\n"
    },
    {
      "file": "tests/directionHoverStable.test.cjs",
      "content": "const fs=require('fs'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst m={exports:{}};new Function('exports','module',ts.transpileModule(fs.readFileSync(__dirname+'/../src/features/map-graphics/DirectionHoverMarker.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports,m);const{DirectionHoverMarker}=m.exports;\nfunction setup(type='3d'){const graphics=[],mini=[],timers=new Map(),calls=[];let cb,clears=0;const view={type,graphics:{add:g=>graphics.push(g),remove:g=>{const i=graphics.indexOf(g);if(i>=0)graphics.splice(i,1)}}},minimap={graphics:{forEach:fn=>mini.forEach(fn)},add:g=>mini.push(g),remove:g=>{const i=mini.indexOf(g);if(i>=0)mini.splice(i,1)}};const host={getView:()=>view,getMinimap:()=>minimap,createGraphic:p=>({...p}),setInterval:fn=>{timers.set(1,fn);return 1},clearInterval:id=>timers.delete(id),createGroundMarker:fn=>{cb=fn;return{showMarker:(...args)=>calls.push(args),clear:()=>clears++}}};return{owner:new DirectionHoverMarker(host),view,graphics,mini,timers,calls,present:v=>cb(v),clears:()=>clears}}\ntest('3D uses one steady ground marker with no lift, callout or timer',()=>{const x=setup();x.owner.draw(x.view,{id:'A',lon:1,lat:2});const g=x.owner.graphic,s=g.symbol;assert.equal(x.timers.size,0);assert.equal(s.verticalOffset,undefined);assert.equal(s.callout,undefined);x.present(true);assert.equal(g.visible,false);x.owner.draw(x.view,{id:'B',lon:3,lat:4});assert.equal(x.owner.graphic,g);assert.equal(g.symbol,s);assert.equal(x.graphics.length,1);assert.equal(x.mini.length,1);assert.equal(g.geometry.longitude,3);assert.equal(x.calls.length,2);x.present(false);assert.equal(g.visible,true);x.owner.clear();assert.equal(x.graphics.length,0);assert.equal(x.mini.length,0);assert.equal(x.clears(),1)});\ntest('cleanup uses original view and minimap and tolerates repeated clear',()=>{const x=setup();x.owner.draw(x.view,{id:'A',lon:1,lat:2});const other={type:'3d',graphics:{add(){},remove(){throw Error('wrong view')}}};x.owner.host.getView=()=>other;x.owner.clear();x.owner.clear();assert.equal(x.graphics.length,0);assert.equal(x.mini.length,0)});\ntest('2D retains its original bounded pulse and cancels it on cleanup',()=>{const x=setup('2d');x.owner.draw(x.view,{id:'A',lon:1,lat:2});assert.equal(x.timers.size,1);assert.equal(x.calls.length,0);for(let i=0;i<100;i++){x.timers.get(1)();assert(x.owner.graphic.symbol.size>=16&&x.owner.graphic.symbol.size<=20)}x.owner.clear();assert.equal(x.timers.size,0)});\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'stable-direction-hover-v6-93-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.93 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'stable-direction-hover-v6-93' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.93 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.93 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.93 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-stable-direction-hover-v6-93.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Stable 3D direction hover v6.93 is already installed. No files changed.');
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
  const manifest = { installer: 'stable-direction-hover-v6-93', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Stable 3D direction hover v6.93 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
