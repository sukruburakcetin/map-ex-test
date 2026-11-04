#!/usr/bin/env node
'use strict';
/**
 * Selection layout cleanup confirmation. Compatible current v6 sources.
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
      "file": "src/features/map-graphics/NativeCurrentImageMarker.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Selection layout cleanup 1",
              "before": " }\n private useView(view:any):void{if(this.view!==view){this.clear();this.view=view;}}\n showMarker(view:any,lon:number,lat:number,color:any,id:string):void{\n  this.useView(view);if(this.model?.id!==String(id))this.fan=false;\n  this.marker=true;this.model={...this.model,lon,lat,color:Array.isArray(color)?color:[0,255,0,1],id:String(id)};this.start();\n }\n show(view:any,lon:number,lat:number,heading:number,metres:number,spread:number):void{\n",
              "after": " }\n private useView(view:any):void{if(this.view!==view){this.clear();this.view=view;}}\n showMarker(view:any,lon:number,lat:number,color:any,id:string):void{\n  this.useView(view);if(this.model?.id!==String(id)){\n   // Retire the previous selection synchronously; the replacement is projected\n   // on the next frame and must not coexist with a stale mesh/SVG meanwhile.\n   this.fan=false;this.nativeActive=false;this.key='';this.settled=null;\n   if(this.layer)this.layer.visible=false;\n   this.fallback.clear();this.presented(false,view);\n  }\n  this.marker=true;this.model={...this.model,lon,lat,color:Array.isArray(color)?color:[0,255,0,1],id:String(id)};this.start();\n }\n show(view:any,lon:number,lat:number,heading:number,metres:number,spread:number):void{\n"
            },
            {
              "label": "Selection layout cleanup 2",
              "before": " private update():void{\n  const view=this.view,m=this.model;if(!view||!m)return;\n  const cached=this.settled;\n  if(this.nativeActive&&view.stationary===true&&view.updating===false&&cached?.model===m&&cached.marker===this.marker&&cached.fan===this.fan&&cached.camera===view.camera&&cached.zoom===view.zoom&&cached.sampler===view.groundView?.elevationSampler)return;\n  // Readability at globe/overview scale remains the validated SVG representation.\n  if(view.zoom<10){this.showFallback(true);return;}\n  const source=this.factory.point({longitude:m.lon,latitude:m.lat,spatialReference:{wkid:4326}}),ground=renderedGroundPoint(view,source,this.factory.point);\n",
              "after": " private update():void{\n  const view=this.view,m=this.model;if(!view||!m)return;\n  const cached=this.settled;\n  if(this.nativeActive&&view.stationary===true&&view.updating===false&&cached?.model===m&&cached.marker===this.marker&&cached.fan===this.fan&&cached.camera===view.camera&&cached.zoom===view.zoom&&cached.width===view.width&&cached.height===view.height&&cached.container===view.container&&cached.sampler===view.groundView?.elevationSampler)return;\n  // Readability at globe/overview scale remains the validated SVG representation.\n  if(view.zoom<10){this.showFallback(true);return;}\n  const source=this.factory.point({longitude:m.lon,latitude:m.lat,spatialReference:{wkid:4326}}),ground=renderedGroundPoint(view,source,this.factory.point);\n"
            },
            {
              "label": "Selection layout cleanup 3",
              "before": "  }\n  const ready=this.layerView&&!this.layerView.suspended&&this.layerView.visible!==false&&(this.nativeActive||!this.layerView.updating);\n  if(!ready){this.showFallback(false);return;}\n  this.nativeActive=true;this.fallback.clear();this.presented(this.marker,view);this.settled={model:m,marker:this.marker,fan:this.fan,camera:view.camera,zoom:view.zoom,sampler:view.groundView?.elevationSampler};\n }\n clear():void{\n  const view=this.view;this.nativeActive=false;this.fallback.clear();this.presented(false,view);\n",
              "after": "  }\n  const ready=this.layerView&&!this.layerView.suspended&&this.layerView.visible!==false&&(this.nativeActive||!this.layerView.updating);\n  if(!ready){this.showFallback(false);return;}\n  this.nativeActive=true;this.fallback.clear();this.presented(this.marker,view);this.settled={model:m,marker:this.marker,fan:this.fan,camera:view.camera,zoom:view.zoom,width:view.width,height:view.height,container:view.container,sampler:view.groundView?.elevationSampler};\n }\n clear():void{\n  const view=this.view;this.nativeActive=false;this.fallback.clear();this.presented(false,view);\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/map-graphics/ScreenDirectionCone.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Selection layout cleanup 1",
              "before": " }\n showMarker(view: any, lon: number, lat: number, color: any, imageId: string): void {\n  if(view!==this.view)this.clear();\n  if(this.markerId!==String(imageId))this.fanVisible=false;\n  this.markerId=String(imageId);this.markerVisible=true;\n  const rgba=Array.isArray(color)?color:color?.toRgba?.();\n  const channel=(v:any,f:number)=>Number.isFinite(v)?Math.max(0,Math.min(255,v)):f;\n",
              "after": " }\n showMarker(view: any, lon: number, lat: number, color: any, imageId: string): void {\n  if(view!==this.view)this.clear();\n  if(this.markerId!==String(imageId)){\n   this.fanVisible=false;this.projectionCache=null;\n   if(this.element)this.element.style.display='none';\n   this.onMarkerPresented?.(false,view);\n  }\n  this.markerId=String(imageId);this.markerVisible=true;\n  const rgba=Array.isArray(color)?color:color?.toRgba?.();\n  const channel=(v:any,f:number)=>Number.isFinite(v)?Math.max(0,Math.min(255,v)):f;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/nativeCurrentImageMarker.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "Selection layout cleanup 1",
              "before": "test('late native layer-view resolution cannot revive cleared owner',async()=>{const x=setup();let resolve;x.view.whenLayerView=()=>new Promise(r=>resolve=r);x.owner.showMarker(x.view,0,0,[0,255,0,1],'A');x.tick(0);x.owner.clear();resolve(x.lv);await Promise.resolve();assert.equal(x.owner.layerView,null);assert.equal(x.layers.length,0)});\n\ntest('beveled disk has a flat raised center and sloped edge; sector rises gently toward its rim',()=>{const scale=.1,m=geometry.nativeCurrentImageMesh(0,0,0,scale,32,60,0,true,true),v=m.vertexAttributes.position;const heightsFor=(component)=>[...new Set(component.faces)].map(i=>v[i*3+2]/scale);assert(Math.abs(Math.max(...heightsFor(m.components[0]))-2.2)<1e-8);assert(heightsFor(m.components[0]).some(z=>Math.abs(z-1.15)<1e-8));assert(Math.abs(Math.max(...heightsFor(m.components[1]))-1.15)<1e-8);const body=heightsFor(m.components[2]),rim=heightsFor(m.components[3]);assert(Math.max(...rim)>Math.max(...body));assert(Math.max(...rim)>4&&Math.max(...rim)<6);assert.deepEqual(m.components[3].material.color,[255,153,0,1]);const large=geometry.nativeCurrentImageMesh(0,0,0,1,52,20,0,true,true);assert(Math.max(...large.vertexAttributes.position.filter((_,i)=>i%3===2))<=8.4+1e-8)});\n",
              "after": "test('late native layer-view resolution cannot revive cleared owner',async()=>{const x=setup();let resolve;x.view.whenLayerView=()=>new Promise(r=>resolve=r);x.owner.showMarker(x.view,0,0,[0,255,0,1],'A');x.tick(0);x.owner.clear();resolve(x.lv);await Promise.resolve();assert.equal(x.owner.layerView,null);assert.equal(x.layers.length,0)});\n\ntest('beveled disk has a flat raised center and sloped edge; sector rises gently toward its rim',()=>{const scale=.1,m=geometry.nativeCurrentImageMesh(0,0,0,scale,32,60,0,true,true),v=m.vertexAttributes.position;const heightsFor=(component)=>[...new Set(component.faces)].map(i=>v[i*3+2]/scale);assert(Math.abs(Math.max(...heightsFor(m.components[0]))-2.2)<1e-8);assert(heightsFor(m.components[0]).some(z=>Math.abs(z-1.15)<1e-8));assert(Math.abs(Math.max(...heightsFor(m.components[1]))-1.15)<1e-8);const body=heightsFor(m.components[2]),rim=heightsFor(m.components[3]);assert(Math.max(...rim)>Math.max(...body));assert(Math.max(...rim)>4&&Math.max(...rim)<6);assert.deepEqual(m.components[3].material.color,[255,153,0,1]);const large=geometry.nativeCurrentImageMesh(0,0,0,1,52,20,0,true,true);assert(Math.max(...large.vertexAttributes.position.filter((_,i)=>i%3===2))<=8.4+1e-8)});\n\ntest('new image immediately retires native and SVG visuals before the next projection frame',async()=>{const x=setup();x.owner.showMarker(x.view,0,0,[0,255,0,1],'A');x.owner.show(x.view,0,0,45,10,60);x.tick(0);await Promise.resolve();x.tick(120);assert.equal(x.layers[0].visible,true);x.owner.showMarker(x.view,.0001,0,[0,255,0,1],'B');assert.equal(x.layers[0].visible,false);assert.equal(x.owner.nativeActive,false);assert.equal(x.owner.fallback.element,null);x.owner.show(x.view,.0001,0,90,10,60);x.tick(240);assert.equal(x.layers.length,1);assert.equal(x.layers[0].graphics.length,1);assert.equal(x.layers[0].graphics[0].attributes.image_id,'B');assert.equal(x.layers[0].visible,true);assert.equal(x.owner.fallback.element,null);x.view.zoom=2;x.tick(360);assert(x.owner.fallback.element);x.owner.showMarker(x.view,.0002,0,[0,255,0,1],'C');assert.equal(x.owner.fallback.element,null);assert.equal(x.layers[0].visible,false);x.owner.clear()});\ntest('stationary native marker reprojects after viewport resize without changing camera identity',async()=>{const x=setup();x.owner.showMarker(x.view,0,0,[0,255,0,1],'A');x.tick(0);await Promise.resolve();x.view.stationary=true;x.view.updating=false;x.tick(120);x.tick(240);const before=x.stats().projections;x.view.width=500;x.view.height=200;x.tick(360);assert(x.stats().projections>before);assert.equal(x.layers.length,1);x.owner.clear()});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/screenDirectionCone.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "Selection layout cleanup 1",
              "before": "\ntest('2D combined marker stays round, shares fan anchor and restores fallback on projection failure',()=>{const x=setup(),states=[];x.view.type='2d';x.cone.onMarkerPresented=(shown)=>states.push(shown);x.cone.showMarker(x.view,1,2,[0,255,0,1],'A');x.cone.show(x.view,1,2,90,10,60);x.tick(0);const el=x.elements[0];assert.equal(el.marker.style.display,'');assert.equal(el.marker.getAttribute('transform'),'');assert.equal(el.style.left,'151px');assert.equal(el.style.top,'148px');assert.equal(states.at(-1),true);x.view.toScreen=()=>null;x.view.updating=true;x.tick(40);assert.equal(states.at(-1),false);x.cone.clear();assert.equal(x.stats().cancels,1)});\ntest('steady selection placeholder starts no animation or overlay in 2D',()=>{let requests=0,overlays=0;const bindings={graphic:null},layer={visible:true,add(){},remove(){},destroy(){}},owner=new pulse.SelectionPulse(bindings,{point:p=>p,layer:()=>layer,graphic:p=>p,overlay:()=>{overlays++;return null}},{request:()=>++requests,cancel(){},now:()=>0,clearInterval(){}}),view={type:'2d',map:{add(){},remove(){}},graphics:{remove(){}}};const graphic=owner.show(view,{},1,2,[0,255,0,1],'A',false);assert.equal(requests,0);assert.equal(overlays,0);assert.equal(graphic.attributes.image_id,'A');assert.equal(owner.show(view,{},3,4,[0,255,0,1],'A',false),graphic);assert.equal(requests,0);owner.dispose();assert.equal(bindings.graphic,null)});\n",
              "after": "\ntest('2D combined marker stays round, shares fan anchor and restores fallback on projection failure',()=>{const x=setup(),states=[];x.view.type='2d';x.cone.onMarkerPresented=(shown)=>states.push(shown);x.cone.showMarker(x.view,1,2,[0,255,0,1],'A');x.cone.show(x.view,1,2,90,10,60);x.tick(0);const el=x.elements[0];assert.equal(el.marker.style.display,'');assert.equal(el.marker.getAttribute('transform'),'');assert.equal(el.style.left,'151px');assert.equal(el.style.top,'148px');assert.equal(states.at(-1),true);x.view.toScreen=()=>null;x.view.updating=true;x.tick(40);assert.equal(states.at(-1),false);x.cone.clear();assert.equal(x.stats().cancels,1)});\ntest('steady selection placeholder starts no animation or overlay in 2D',()=>{let requests=0,overlays=0;const bindings={graphic:null},layer={visible:true,add(){},remove(){},destroy(){}},owner=new pulse.SelectionPulse(bindings,{point:p=>p,layer:()=>layer,graphic:p=>p,overlay:()=>{overlays++;return null}},{request:()=>++requests,cancel(){},now:()=>0,clearInterval(){}}),view={type:'2d',map:{add(){},remove(){}},graphics:{remove(){}}};const graphic=owner.show(view,{},1,2,[0,255,0,1],'A',false);assert.equal(requests,0);assert.equal(overlays,0);assert.equal(graphic.attributes.image_id,'A');assert.equal(owner.show(view,{},3,4,[0,255,0,1],'A',false),graphic);assert.equal(requests,0);owner.dispose();assert.equal(bindings.graphic,null)});\n\ntest('new image hides old-position SVG synchronously and reuses one overlay after resize',()=>{const x=setup();x.cone.showMarker(x.view,0,0,[0,255,0,1],'A');x.cone.show(x.view,0,0,45,10,60);x.tick(0);const el=x.elements[0];assert.equal(el.style.display,'block');x.view.width=500;x.cone.showMarker(x.view,10,0,[0,255,0,1],'B');assert.equal(el.style.display,'none');assert.equal(el.fan.style.display,'none');x.cone.show(x.view,10,0,90,10,60);x.tick(40);assert.equal(el.style.display,'block');assert.equal(x.elements.length,1);assert.equal(el.fan.style.display,'');x.cone.clear()});\n"
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
              "label": "Selection layout cleanup 1",
              "before": "    this.finishTurboLoading();\n    this.clearClickRipples();\n    this.clearGreenPulse();\n\n    if (this._coneRedrawRaf != null) {\n      cancelAnimationFrame(this._coneRedrawRaf);\n",
              "after": "    this.finishTurboLoading();\n    this.clearClickRipples();\n    this.clearGreenPulse();\n    // Responsive layout remounts must release both full renderers, not only\n    // hide their marker part while a fan/mesh and animation remain attached.\n    this._nativeCurrentImageMarker?.clear();\n    this._screenDirectionCone?.clear();\n    this._cameraCone?.dispose(this.state.jimuMapView?.view);\n\n\n    if (this._coneRedrawRaf != null) {\n      cancelAnimationFrame(this._coneRedrawRaf);\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/currentImageLayoutCleanup.test.cjs",
      "content": "const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),test=require('node:test'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst source=fs.readFileSync(path.join(__dirname,'../src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');\nconst cleanup=widget.members.find(n=>n.name?.getText(sf)==='cleanupWidgetEnvironment');\nconst statements=cleanup.body.statements,begin=statements.findIndex(n=>n.getText(sf)==='this.clearGreenPulse();'),end=statements.findIndex((n,i)=>i>begin&&n.getText(sf).startsWith('if (this._coneRedrawRaf'));\nconst code=statements.slice(begin,end).map(n=>n.getText(sf)).join('\\n'),run=new Function(ts.transpileModule('return function(){'+code+'}',{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText)();\ntest('real common cleanup releases both marker/cone renderers and native fallback layer on remount/minimize',()=>{const released=[],view={};const owner=name=>({clear:()=>released.push(name)});run.call({state:{jimuMapView:{view}},clearGreenPulse:()=>released.push('pulse'),_nativeCurrentImageMarker:owner('native'),_screenDirectionCone:owner('screen'),_cameraCone:{dispose:v=>{assert.equal(v,view);released.push('camera')}}});assert.deepEqual(released,['pulse','native','screen','camera']);assert(!cleanup.body.statements.slice(begin,end).some(ts.isIfStatement));});\ntest('cleanup is safe before marker renderers or view are initialized',()=>{run.call({state:{},clearGreenPulse(){}})});\ntest('unmount and visibility transitions use the same cleanup path',()=>{for(const name of ['componentWillUnmount','componentDidUpdate']){const method=widget.members.find(n=>n.name?.getText(sf)===name).getText(sf);assert(method.includes('this.cleanupWidgetEnvironment(true, true)'));}assert(widget.members.find(n=>n.name?.getText(sf)==='componentDidUpdate').getText(sf).includes('this.cleanupWidgetEnvironment(true, false)'));});\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'selection-layout-cleanup-';

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
    if (manifest.installer !== 'selection-layout-cleanup' || !manifest.completed || manifest.uninstall) continue;
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
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-selection-layout-cleanup.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Selection layout cleanup confirmation is already installed. No files changed.');
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
  const manifest = { installer: 'selection-layout-cleanup', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Selection layout cleanup confirmation ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
