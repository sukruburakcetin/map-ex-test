#!/usr/bin/env node
'use strict';
/**
 * Panorama AI labels confirmation. Compatible current v6 sources.
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
              "label": "Panorama AI labels 1",
              "before": "import { createYearBasedRenderer, YEAR_COLOR_PALETTE } from \"../utils/mapillaryRenderers\";\nimport { loadImage, cropSpriteImage, processInChunks } from \"../utils/spriteUtils\";\nimport { Viewer, OutlineTag, PolygonGeometry, geodeticToEnu, RenderPass } from \"mapillary-js\";\nimport \"mapillary-js/dist/mapillary.css\";\nimport { InfoBox } from \"../components/InfoBox\";\nimport { shouldRecenterImage } from \"../features/imagery/imageFollowPolicy\";\n",
              "after": "import { createYearBasedRenderer, YEAR_COLOR_PALETTE } from \"../utils/mapillaryRenderers\";\nimport { loadImage, cropSpriteImage, processInChunks } from \"../utils/spriteUtils\";\nimport { Viewer, OutlineTag, PolygonGeometry, geodeticToEnu, RenderPass } from \"mapillary-js\";\nimport { PanoramaDetectionLabels } from '../features/detections/PanoramaDetectionLabels';\nimport \"mapillary-js/dist/mapillary.css\";\nimport { InfoBox } from \"../components/InfoBox\";\nimport { shouldRecenterImage } from \"../features/imagery/imageFollowPolicy\";\n"
            },
            {
              "label": "Panorama AI labels 2",
              "before": "  private _detectionLoadRequest = 0;\n  private _detectionAbort: AbortController | null = null;\n\n  private clearDetectionOverlays() {\n    ++this._detectionLoadRequest;\n    this._detectionAbort?.abort(); this._detectionAbort = null;\n    this._pendingDetectionFocus = null;\n",
              "after": "  private _detectionLoadRequest = 0;\n  private _detectionAbort: AbortController | null = null;\n\n  private _panoramaDetectionLabels: PanoramaDetectionLabels | null = null;\n\n  private clearDetectionOverlays() {\n    this._panoramaDetectionLabels?.dispose(); this._panoramaDetectionLabels = null;\n    ++this._detectionLoadRequest;\n    this._detectionAbort?.abort(); this._detectionAbort = null;\n    this._pendingDetectionFocus = null;\n"
            },
            {
              "label": "Panorama AI labels 3",
              "before": "      }\n      const newId = String(event.image.id);\n      this._stopRoutePreview?.();\n      this._detectionAbort?.abort();\n      this._timeTravelAvailability?.cancelUnless(newId);\n      this._nearbyDiscovery?.cancel();\n",
              "after": "      }\n      const newId = String(event.image.id);\n      this._stopRoutePreview?.();\n      this._panoramaDetectionLabels?.dispose(); this._panoramaDetectionLabels = null;\n      this._detectionAbort?.abort();\n      this._timeTravelAvailability?.cancelUnless(newId);\n      this._nearbyDiscovery?.cancel();\n"
            },
            {
              "label": "Panorama AI labels 4",
              "before": "        delete (tagComponent as any)._detectionHoverCleanup;\n      }\n\n      tagComponent.removeAll();\n\n      const tags: OutlineTag[] = [];\n",
              "after": "        delete (tagComponent as any)._detectionHoverCleanup;\n      }\n\n      this._panoramaDetectionLabels?.dispose(); this._panoramaDetectionLabels = null;\n      tagComponent.removeAll();\n\n      const tags: OutlineTag[] = [];\n"
            },
            {
              "label": "Panorama AI labels 5",
              "before": "\n        // hover listeners after tags are added\n        this.setupDetectionHover(tagComponent, tags);\n      }\n    } catch (err) {\n      if (!controller.signal.aborted && (err as any)?.name !== 'AbortError') console.error(\"Failed to load image detections:\", err);\n",
              "after": "\n        // hover listeners after tags are added\n        this.setupDetectionHover(tagComponent, tags);\n        if (activeImage.cameraType === 'spherical' && this.viewerContainer.current) {\n          this._panoramaDetectionLabels = new PanoramaDetectionLabels(viewer, this.viewerContainer.current,\n            tags.map(tag => ({ text: this.getDetectionValueFromTagId(tag.id).split('--').map(part => part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ')).join(' '),\n              point: (tag.geometry as PolygonGeometry).getPoleOfInaccessibility2d(),\n              target: String(tag.id) === String(this.state.targetDetectionId) })), this.state.showAiTags);\n        }\n      }\n    } catch (err) {\n      if (!controller.signal.aborted && (err as any)?.name !== 'AbortError') console.error(\"Failed to load image detections:\", err);\n"
            },
            {
              "label": "Panorama AI labels 6",
              "before": "    this.setState((prev: { showAiTags: boolean }) => ({ showAiTags: !prev.showAiTags }), () => {\n      const tags = this.mapillaryViewer?.getComponent(\"tag\");\n      (tags as any)?._refreshDetectionLabels?.();\n    });\n  };\n\n",
              "after": "    this.setState((prev: { showAiTags: boolean }) => ({ showAiTags: !prev.showAiTags }), () => {\n      const tags = this.mapillaryViewer?.getComponent(\"tag\");\n      (tags as any)?._refreshDetectionLabels?.();\n      this._panoramaDetectionLabels?.setVisible(this.state.showAiTags);\n    });\n  };\n\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/detections/PanoramaDetectionLabels.ts",
      "content": "/** Text-only companion to SDK polygon tags, whose text renderer excludes spherical cameras.\n * Uses public basic-image projection, not map coordinates or private SDK renderers. */\nexport interface PanoramaLabel { text: string; point: number[]; target?: boolean; }\nexport interface LabelViewer {\n projectFromBasic(point: number[]): Promise<number[] | null>;\n on(event: any, callback: () => void): void;\n off(event: any, callback: () => void): void;\n}\nexport class PanoramaDetectionLabels {\n private root: HTMLDivElement;\n private nodes: HTMLSpanElement[];\n private disposed=false;\n private visible=true;\n private frame=0;\n private busy=false;\n private dirty=false;\n private revision=0;\n private observer: ResizeObserver | null=null;\n private events=['pov','fov','bearing','position'];\n constructor(private viewer:LabelViewer,private container:HTMLElement,private labels:PanoramaLabel[],visible:boolean){\n  this.root=container.ownerDocument.createElement('div');\n  this.root.className='mly-panorama-detection-labels';\n  this.root.setAttribute('aria-hidden','true');\n  Object.assign(this.root.style,{position:'absolute',inset:'0',overflow:'hidden',pointerEvents:'none',zIndex:'5'});\n  this.nodes=labels.map(label=>{\n   const node=container.ownerDocument.createElement('span');node.textContent=label.text;\n   Object.assign(node.style,{position:'absolute',display:'none',color:label.target?'#ffff00':'#ffffff',fontSize:'9px',fontFamily:'\"Inter\",\"Segoe UI\",Roboto,sans-serif',fontWeight:'600',lineHeight:'1.2',whiteSpace:'nowrap',textShadow:'1px 1px 2px rgba(0,0,0,.9)',transform:'translate(-50%,-50%)'});\n   this.root.appendChild(node);return node;\n  });\n  container.appendChild(this.root);\n  for(const event of this.events)viewer.on(event,this.schedule);\n  viewer.on('image',this.dispose);viewer.on('remove',this.dispose);\n  const Observer=container.ownerDocument.defaultView?.ResizeObserver;\n  if(Observer){this.observer=new Observer(this.schedule);this.observer.observe(container);}\n  this.setVisible(visible);\n }\n setVisible(visible:boolean){\n  if(this.disposed)return;this.visible=visible;this.revision++;\n  this.root.style.display=visible?'block':'none';\n  for(const node of this.nodes)node.style.display='none';\n  if(visible)this.schedule();\n }\n private schedule=()=>{\n  if(this.disposed||!this.visible)return;\n  this.revision++;this.dirty=true;\n  if(this.busy||this.frame)return;\n  this.frame=requestAnimationFrame(()=>{this.frame=0;void this.update();});\n };\n private async update(){\n  if(this.disposed||!this.visible)return;\n  this.busy=true;this.dirty=false;const revision=this.revision;\n  const projected=await Promise.all(this.labels.map(async label=>{\n   try{return await this.viewer.projectFromBasic(label.point);}catch{return null;}\n  }));\n  if(!this.disposed&&this.visible&&revision===this.revision){\n   const width=this.container.clientWidth,height=this.container.clientHeight;\n   projected.forEach((point,index)=>{\n    const node=this.nodes[index];\n    if(!point||!Number.isFinite(point[0])||!Number.isFinite(point[1])||point[0]<0||point[1]<0||point[0]>width||point[1]>height){node.style.display='none';return;}\n    node.style.left=`${point[0]}px`;node.style.top=`${point[1]}px`;node.style.display='block';\n   });\n  }\n  this.busy=false;if(this.dirty)this.schedule();\n }\n dispose=()=>{\n  if(this.disposed)return;this.disposed=true;this.revision++;\n  if(this.frame)cancelAnimationFrame(this.frame);this.frame=0;\n  this.observer?.disconnect();this.observer=null;\n  for(const event of this.events)this.viewer.off(event,this.schedule);\n  this.viewer.off('image',this.dispose);this.viewer.off('remove',this.dispose);\n  this.root.remove();\n };\n}\n"
    },
    {
      "file": "tests/panoramaDetectionLabels.browser.cjs",
      "content": "const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),{chromium}=require('playwright');\nconst code=ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/detections/PanoramaDetectionLabels.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;\n(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setContent('<div id=\"host\" style=\"position:relative;width:400px;height:300px\"></div>');await page.evaluate(code=>{const m={exports:{}};new Function('module','exports',code)(m,m.exports);window.Labels=m.exports.PanoramaDetectionLabels;window.host=document.getElementById('host');window.handlers=new Map();window.projections=0;window.result=[120,140];window.pending=[];window.hold=false;window.viewer={on:(event,fn)=>{if(!handlers.has(event))handlers.set(event,new Set());handlers.get(event).add(fn)},off:(event,fn)=>handlers.get(event)?.delete(fn),projectFromBasic:async()=>{projections++;return hold?new Promise(resolve=>pending.push(resolve)):result}};window.emit=event=>[...(handlers.get(event)||[])].forEach(fn=>fn());window.make=visible=>new Labels(viewer,host,[{text:'Utility pole',point:[.4,.6]}],visible);window.layer=make(true);},code);\nconst label=page.locator('.mly-panorama-detection-labels span');await label.waitFor({state:'visible'});assert.equal(await label.textContent(),'Utility pole');assert.equal(await label.evaluate(e=>e.style.left),'120px');assert.equal(await page.locator('.mly-panorama-detection-labels').evaluate(e=>getComputedStyle(e).pointerEvents),'none');\nawait page.evaluate(()=>{result=[240,80];emit('pov')});await page.waitForFunction(()=>document.querySelector('.mly-panorama-detection-labels span').style.left==='240px');\nawait page.evaluate(()=>layer.setVisible(false));await label.waitFor({state:'hidden'});await page.evaluate(()=>{result=[200,70];layer.setVisible(true)});await label.waitFor({state:'visible'});await page.waitForFunction(()=>document.querySelector('.mly-panorama-detection-labels span').style.left==='200px');\nawait page.evaluate(()=>{result=null;emit('fov')});await label.waitFor({state:'hidden'});await page.evaluate(()=>{result=[-10,60];emit('bearing')});await page.waitForTimeout(50);assert.equal(await label.isVisible(),false);\nawait page.evaluate(()=>{result=[100,60];emit('pov')});await label.waitFor({state:'visible'});await page.evaluate(()=>{host.style.width='80px'});await label.waitFor({state:'hidden'});\nawait page.evaluate(()=>{host.style.width='400px';hold=true;emit('pov')});await page.waitForFunction(()=>pending.length>0);await page.evaluate(()=>{emit('image');pending.splice(0).forEach(resolve=>resolve([20,20]));});assert.equal(await page.locator('.mly-panorama-detection-labels').count(),0);assert.equal(await page.evaluate(()=>[...handlers.values()].reduce((n,s)=>n+s.size,0)),0);\nawait page.evaluate(()=>{hold=false;layer=make(false)});await label.waitFor({state:'attached'});assert.equal(await label.isVisible(),false);await page.evaluate(()=>layer.setVisible(true));await label.waitFor({state:'visible'});await page.evaluate(()=>emit('remove'));assert.equal(await page.locator('.mly-panorama-detection-labels').count(),0);\nawait page.evaluate(()=>{layer=make(true);viewer.projectFromBasic=async()=>{throw Error('projection unavailable')};emit('pov')});await page.waitForTimeout(50);assert.equal(await label.isVisible(),false);await page.evaluate(()=>{layer.dispose();layer.dispose()});assert.deepEqual(errors,[]);console.log('PASS: panorama text, camera motion, toggle off/on, null/off-screen/rejected projection, resize, pending image change, remove and idempotent cleanup.');}finally{await browser.close()}})().catch(error=>{console.error(error);process.exitCode=1});\n"
    },
    {
      "file": "tests/panoramaDetectionRuntime.test.cjs",
      "content": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst src=fs.readFileSync(path.join(__dirname,'../src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');\nconst methods=['loadDetections','clearDetectionOverlays','toggleAiTags','getDetectionValueFromTagId'].map(name=>widget.members.find(n=>n.name?.getText(sf)===name).getText(sf)).join('\\n');\nfunction fixture(cameraType='spherical'){\n const created=[];class Geometry{constructor(polygon){this.polygon=polygon}getPoleOfInaccessibility2d(){return[.4,.5]}}\n class Tag{constructor(id,geometry,options){Object.assign(this,{id,geometry,...options})}}\n class Labels{constructor(viewer,container,labels,visible){Object.assign(this,{viewer,container,labels,visible,disposed:false});created.push(this)}dispose(){this.disposed=true}setVisible(value){this.visible=value}}\n const Runtime=new Function('GRAPH_API','fetch','DETECTION_HIDDEN_RAW','DETECTION_HIDDEN_CATEGORIES','decodeAndNormalizeGeometry','PolygonGeometry','OutlineTag','getDetectionColor','PanoramaDetectionLabels',ts.transpileModule('class Runtime{'+methods+'};return Runtime;',{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText)({BASE:'fixture'},async()=>({ok:true,json:async()=>({data:[{id:'pole',value:'object--utility-pole',geometry:'fixture'}]})}),[],[],()=>[[.3,.4],[.5,.4],[.5,.6]],Geometry,Tag,()=>0xff00,Labels);\n const w=new Runtime(),component={removeAll(){},add(){}};Object.assign(w,{state:{imageId:'A',detectionsActive:true,trafficSignsActive:true,objectsActive:false,showAiTags:true},viewerContainer:{current:{}},_detectionLoadRequest:0,detectionTagMap:new Map(),mapillaryViewer:{getImage:async()=>({id:'A',cameraType}),getComponent:()=>component},runSequenceBackground:fn=>fn(new AbortController().signal),setupDetectionHover(){},log(){},setState(update,callback){Object.assign(this.state,typeof update==='function'?update(this.state):update);callback?.()}});return{w,created};\n}\ntest('spherical detections create projected labels and honor off/on plus overlay cleanup',async()=>{const {w,created}=fixture();await w.loadDetections('A');assert.equal(created.length,1);assert.equal(created[0].labels[0].text,'Object Utility pole');assert.deepEqual(created[0].labels[0].point,[.4,.5]);w.toggleAiTags();assert.equal(created[0].visible,false);w.toggleAiTags();assert.equal(created[0].visible,true);w.clearDetectionOverlays();assert.equal(created[0].disposed,true);assert.equal(w._panoramaDetectionLabels,null)});\ntest('ordinary photos keep SDK-only labels without a duplicate text layer',async()=>{const {w,created}=fixture('perspective');await w.loadDetections('A');assert.equal(created.length,0)});\ntest('replacement disposes prior text and a stale image response creates no text',async()=>{const {w,created}=fixture();await w.loadDetections('A');await w.loadDetections('A');assert.equal(created[0].disposed,true);assert.equal(created.length,2);w.mapillaryViewer.getImage=async()=>({id:'B',cameraType:'spherical'});await w.loadDetections('A');assert.equal(created.length,2);w.clearDetectionOverlays()});\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'panorama-ai-labels-';

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
    if (manifest.installer !== 'panorama-ai-labels' || !manifest.completed || manifest.uninstall) continue;
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
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-panorama-ai-labels.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Panorama AI labels confirmation is already installed. No files changed.');
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
  const manifest = { installer: 'panorama-ai-labels', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Panorama AI labels confirmation ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
