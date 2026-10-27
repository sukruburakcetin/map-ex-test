#!/usr/bin/env node
'use strict';
/**
 * Places popup v6.39. Compatible current v6 sources.
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
              "before": "  private setPlacesGroup = (placesGroup: PlaceGroup) => {\n    if (!PLACE_GROUPS.includes(placesGroup)) return;\n    this.setState({ placesGroup }, () => this._places?.controller.setGroup(placesGroup));\n  };\n  private showPlacesHit(results: any[]): boolean { return !!this._places?.open(results); }\n  private async explorePlace(place: Place) {\n    const view = this.state.jimuMapView?.view;\n    if (!view || view.destroyed) return;\n    this._placesExploreAbort?.abort(); const controller = new AbortController(); this._placesExploreAbort = controller;\n",
              "after": "  private setPlacesGroup = (placesGroup: PlaceGroup) => {\n    if (!PLACE_GROUPS.includes(placesGroup)) return;\n    this.setState({ placesGroup }, () => this._places?.controller.setGroup(placesGroup));\n  };\n  private showPlacesHit(results: any[], targetId?: string | null): boolean { return !!this._places?.open(results, targetId); }\n  private async explorePlace(place: Place) {\n    const view = this.state.jimuMapView?.view;\n    if (!view || view.destroyed) return;\n    this._placesExploreAbort?.abort(); const controller = new AbortController(); this._placesExploreAbort = controller;\n"
            },
            {
              "label": "src/runtime/widget.tsx block 2",
              "before": "        await this._annotationCloudPick.pick(() => view.hitTest(evt), point as AnnotationMapPoint);\n        return;\n      }\n\n      this.setState({ clickLon: point.longitude, clickLat: point.latitude });\n\n      try {\n        const response = await view.hitTest(evt);\n",
              "after": "        await this._annotationCloudPick.pick(() => view.hitTest(evt), point as AnnotationMapPoint);\n        return;\n      }\n\n      // Stop the automatic popup click synchronously, before the first hit-test await.\n      // The captured ID survives an unrestricted SDK hit test omitting this small marker.\n      const placesOwnerAtClick = this.state.placesActive ? this._places : null;\n      const placeTargetAtClick = placesOwnerAtClick?.screenTarget(evt) || null;\n      if (placeTargetAtClick) evt.stopPropagation();\n      this.setState({ clickLon: point.longitude, clickLat: point.latitude });\n\n      try {\n        const response = await view.hitTest(evt);\n"
            },
            {
              "label": "src/runtime/widget.tsx block 3",
              "before": "\n        // A direct Places marker hit opens local details before coverage's wider pick radius.\n        // Route/annotation modes, shared notes and point-cloud tools retain priority.\n        if (this.state.jimuMapView?.view !== view || view.destroyed) return;\n        if (this.state.placesActive && this.showPlacesHit(response.results)) return;\n\n        // A valid individual image preview owns this click. Otherwise blue route\n        // navigation keeps its existing exact-point/nearest-loaded-frame behavior.\n        if (pointPreviewAtClick && !coverageClickCurrent()) return;\n",
              "after": "\n        // A direct Places marker hit opens local details before coverage's wider pick radius.\n        // Route/annotation modes, shared notes and point-cloud tools retain priority.\n        if (this.state.jimuMapView?.view !== view || view.destroyed) return;\n        if (this.state.placesActive && this._places === placesOwnerAtClick && this.showPlacesHit(response.results, placeTargetAtClick)) return;\n\n        // A valid individual image preview owns this click. Otherwise blue route\n        // navigation keeps its existing exact-point/nearest-loaded-frame behavior.\n        if (pointPreviewAtClick && !coverageClickCurrent()) return;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/places/ArcGISPlaces.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/features/places/ArcGISPlaces.ts block 1",
              "before": "      const place = this.records.get(hit.graphic?.attributes?.place_id); if (place) return place;\n    }\n    return null;\n  }\n  open(results: any[]): boolean {\n    const place = this.hit(results), view = this.host.view();\n    if (!place || !view) return false;\n    const content = document.createElement('div');\n    const name = document.createElement('strong'); name.textContent = place.name; content.appendChild(name);\n    for (const text of [place.category.replace(/_/g, ' '), place.address]) if (text) { const line = document.createElement('p'); line.textContent = text; content.appendChild(line); }\n",
              "after": "      const place = this.records.get(hit.graphic?.attributes?.place_id); if (place) return place;\n    }\n    return null;\n  }\n  /** Capture only the visible marker footprint, without another SDK hit test or request. */\n  screenTarget(screen: { x: number; y: number }): string | null {\n    const view = this.host.view();\n    if (this.disposed || !this.graphics?.visible || this.ownerView !== view || view?.destroyed || !Number.isFinite(screen.x) || !Number.isFinite(screen.y)) return null;\n    let nearest: string | null = null, distance = 6 * 6;\n    for (const graphic of this.graphics.graphics?.toArray?.() || []) {\n      const id = graphic.attributes?.place_id;\n      if (!this.records.has(id)) continue;\n      const point = view.toScreen(graphic.geometry);\n      if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) continue;\n      const squared = (point.x - screen.x) ** 2 + (point.y - screen.y) ** 2;\n      if (squared <= distance) { nearest = id; distance = squared; }\n    }\n    return nearest;\n  }\n  open(results: any[], targetId?: string | null): boolean {\n    const view = this.host.view();\n    const valid = !this.disposed && this.graphics?.visible && this.ownerView === view && !view?.destroyed;\n    const place = (valid && targetId ? this.records.get(targetId) : null) || this.hit(results);\n    if (!place || !view) return false;\n    const content = document.createElement('div');\n    const name = document.createElement('strong'); name.textContent = place.name; content.appendChild(name);\n    for (const text of [place.category.replace(/_/g, ' '), place.address]) if (text) { const line = document.createElement('p'); line.textContent = text; content.appendChild(line); }\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/overturePlaces.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "tests/overturePlaces.test.cjs block 1",
              "before": " const {ArcGISPlaces}=load('ArcGISPlaces');let serviceCount=0,query=null,explored=null,removed=0,busy=false;const layers=[],ui=[];\n const element=()=>({children:[],style:{},appendChild(x){this.children.push(x);},remove(){}});\n const oldDocument=global.document,oldWindow=global.window;global.document={createElement:element,addEventListener(){},removeEventListener(){}};global.window={};\n class FeatureLayer{constructor(){serviceCount++;this.fields=['gers_id','place_name','category','place_group','confidence','address','website','data_release'].map(name=>({name}));}async load(){}async queryFeatures(q){query=q;return{features:[row(1,{place_name:'<img onerror=evil()>',website:'javascript:evil()'})]};}destroy(){}}\n class GraphicsLayer{constructor(p){Object.assign(this,{visible:true},p);}removeAll(){this.items=[];}addMany(xs){this.items=xs;}destroy(){this.destroyed=true;}}\n class Value{constructor(p){Object.assign(this,p);}}\n const view={ready:true,zoom:16,stationary:true,extent:{xmin:0,ymin:0,xmax:1,ymax:1,spatialReference:{isGeographic:true}},map:{add(x,index){assert.equal(index,0);layers.push(x);},remove(x){layers.splice(layers.indexOf(x),1);}},ui:{add(x){ui.push(x);},remove(x){ui.splice(ui.indexOf(x),1);}},watch(){return{remove(){removed++;}};},openPopup(x){this.popup=x;},closePopup(){this.popup=null;}};\n const owner=new ArcGISPlaces({id:'test',url:'https://host/FeatureServer/0',modules:{FeatureLayer,GraphicsLayer,SimpleMarkerSymbol:Value,Graphic:Value,Point:Value},view:()=>view,geographic:x=>x,busy:()=>busy,status(){},explore:p=>explored=p});\n try{\n assert.equal(serviceCount,0);assert.equal(layers.length,0);owner.controller.setEnabled(true);await new Promise(r=>setTimeout(r,710));\n assert.equal(serviceCount,1);assert.equal(layers.length,1);assert(layers[0] instanceof GraphicsLayer);assert.equal(query.num,200);assert.equal(query.where,'confidence >= 0.95');assert.equal(query.outSpatialReference.wkid,4326);assert.equal(layers[0].items.length,1);\n const hits=[{layer:layers[0],graphic:layers[0].items[0]}];busy=true;assert.equal(owner.hoverLayer,null);assert(owner.open(hits));assert.equal(serviceCount,1);busy=false;assert.equal(view.popup.content.children[0].textContent,'<img onerror=evil()>');assert(!view.popup.content.children.some(x=>x.href==='javascript:evil()'));assert.equal(explored,null);view.popup.content.children.find(x=>x.textContent==='Explore nearby imagery').onclick();assert.equal(explored.id,'gers-1');\n assert.equal(owner.hit([{layer:{},graphic:layers[0].items[0]}]),null);owner.controller.setEnabled(false);assert.equal(layers.length,0);assert.equal(ui.length,0);assert.equal(view.popup,null);\n }finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}assert.equal(removed,1);\n});\ntest('idle scheduling has a deadline and retains cancellation without bypassing foreground gates',()=>{\n",
              "after": " const {ArcGISPlaces}=load('ArcGISPlaces');let serviceCount=0,query=null,explored=null,removed=0,busy=false;const layers=[],ui=[];\n const element=()=>({children:[],style:{},appendChild(x){this.children.push(x);},remove(){}});\n const oldDocument=global.document,oldWindow=global.window;global.document={createElement:element,addEventListener(){},removeEventListener(){}};global.window={};\n class FeatureLayer{constructor(){serviceCount++;this.fields=['gers_id','place_name','category','place_group','confidence','address','website','data_release'].map(name=>({name}));}async load(){}async queryFeatures(q){query=q;return{features:[row(1,{place_name:'<img onerror=evil()>',website:'javascript:evil()'})]};}destroy(){}}\n class GraphicsLayer{constructor(p){Object.assign(this,{visible:true},p);}removeAll(){this.items=[];}addMany(xs){this.items=xs;this.graphics={toArray:()=>this.items};}destroy(){this.destroyed=true;}}\n class Value{constructor(p){Object.assign(this,p);}}\n const view={toScreen:()=>({x:10,y:10}),ready:true,zoom:16,stationary:true,extent:{xmin:0,ymin:0,xmax:1,ymax:1,spatialReference:{isGeographic:true}},map:{add(x,index){assert.equal(index,0);layers.push(x);},remove(x){layers.splice(layers.indexOf(x),1);}},ui:{add(x){ui.push(x);},remove(x){ui.splice(ui.indexOf(x),1);}},watch(){return{remove(){removed++;}};},openPopup(x){this.popup=x;},closePopup(){this.popup=null;}};\n const owner=new ArcGISPlaces({id:'test',url:'https://host/FeatureServer/0',modules:{FeatureLayer,GraphicsLayer,SimpleMarkerSymbol:Value,Graphic:Value,Point:Value},view:()=>view,geographic:x=>x,busy:()=>busy,status(){},explore:p=>explored=p});\n try{\n assert.equal(serviceCount,0);assert.equal(layers.length,0);owner.controller.setEnabled(true);await new Promise(r=>setTimeout(r,710));\n assert.equal(serviceCount,1);assert.equal(layers.length,1);assert(layers[0] instanceof GraphicsLayer);assert.equal(query.num,200);assert.equal(query.where,'confidence >= 0.95');assert.equal(query.outSpatialReference.wkid,4326);assert.equal(layers[0].items.length,1);\n const hits=[{layer:layers[0],graphic:layers[0].items[0]}];assert.equal(owner.screenTarget({x:10,y:10}),'gers-1');assert.equal(owner.screenTarget({x:17,y:10}),null);assert(owner.open([],owner.screenTarget({x:10,y:10})));busy=true;assert.equal(owner.hoverLayer,null);assert(owner.open(hits));assert.equal(serviceCount,1);busy=false;assert.equal(view.popup.content.children[0].textContent,'<img onerror=evil()>');assert(!view.popup.content.children.some(x=>x.href==='javascript:evil()'));assert.equal(explored,null);view.popup.content.children.find(x=>x.textContent==='Explore nearby imagery').onclick();assert.equal(explored.id,'gers-1');\n assert.equal(owner.hit([{layer:{},graphic:layers[0].items[0]}]),null);owner.controller.setEnabled(false);assert.equal(layers.length,0);assert.equal(ui.length,0);assert.equal(view.popup,null);\n }finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}assert.equal(removed,1);\n});\ntest('idle scheduling has a deadline and retains cancellation without bypassing foreground gates',()=>{\n"
            },
            {
              "label": "tests/overturePlaces.test.cjs block 2",
              "before": " const w={props:{state:'OPENED'},state:{jimuMapView:{view},turboModeActive:true,placesActive:true},_coverageSelectionTargets:{snapshot:()=>null},coverageSelectionContext:()=>({}),_sharedNotesLayer:null,_pointCloudHits:{route:()=>false},setState(){},showPlacesHit(){opened++;return true;},pickMapFeature(){picks++;throw Error('must not pick coverage or features for direct POI');}};\n const make=new Function('view','TURBO_LIMITS',compile('return '+callback.getText(sf)));const handler=make.call(w,view,{pickRadiusPx:10});await handler({x:20,y:20});assert.equal(opened,1);assert.equal(picks,0);\n view.destroyed=true;await handler({x:20,y:20});assert.equal(opened,1);\n});\n",
              "after": " const w={props:{state:'OPENED'},state:{jimuMapView:{view},turboModeActive:true,placesActive:true},_coverageSelectionTargets:{snapshot:()=>null},coverageSelectionContext:()=>({}),_sharedNotesLayer:null,_pointCloudHits:{route:()=>false},setState(){},showPlacesHit(){opened++;return true;},pickMapFeature(){picks++;throw Error('must not pick coverage or features for direct POI');}};\n const make=new Function('view','TURBO_LIMITS',compile('return '+callback.getText(sf)));const handler=make.call(w,view,{pickRadiusPx:10});await handler({x:20,y:20});assert.equal(opened,1);assert.equal(picks,0);\n view.destroyed=true;await handler({x:20,y:20});assert.equal(opened,1);\n});\ntest('POI click stops automatic popup handling before asynchronous hitTest and retains a missed marker ID',async()=>{\n let callback;function visit(n){if(ts.isCallExpression(n)&&n.expression.getText(sf)==='view.on'&&n.arguments[0]?.text==='click')callback=n.arguments[1];ts.forEachChild(n,visit);}visit(sf);\n let resolve,stopped=0,opened=0,target;const view={destroyed:false,toMap:()=>({longitude:1,latitude:1}),hitTest:()=>new Promise(r=>resolve=r)};\n const owner={screenTarget:()=> 'gers-1'};\n const w={props:{state:'OPENED'},state:{jimuMapView:{view},turboModeActive:true,placesActive:true},_places:owner,_coverageSelectionTargets:{snapshot:()=>null},coverageSelectionContext:()=>({}),_sharedNotesLayer:null,_pointCloudHits:{route:()=>false},setState(){},showPlacesHit(results,id){assert.deepEqual(results,[]);target=id;opened++;return true;}};\n const handler=new Function('view','TURBO_LIMITS',compile('return '+callback.getText(sf))).call(w,view,{pickRadiusPx:10});const pending=handler({x:10,y:10,stopPropagation(){stopped++;}});assert.equal(stopped,1);assert.equal(opened,0);resolve({results:[]});await pending;assert.equal(target,'gers-1');assert.equal(opened,1);\n});\n"
            }
          ]
        }
      ]
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'places-popup-v6-39-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.39 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'places-popup-v6-39' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.39 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.39 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.39 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-places-popup-v6-39.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Places popup v6.39 is already installed. No files changed.');
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
  const manifest = { installer: 'places-popup-v6-39', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Places popup v6.39 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
