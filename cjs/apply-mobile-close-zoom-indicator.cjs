#!/usr/bin/env node
'use strict';
/**
 * Mobile close zoom indicator confirmation. Compatible current v6 sources.
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
              "label": "Mobile close zoom indicator 1",
              "before": "import { ScreenDirectionCone } from './ScreenDirectionCone';\nimport { renderedGroundPoint } from './SelectionPulse';\nimport { nativeCurrentImageMesh } from './nativeCurrentImageMesh';\n\n",
              "after": "import { ScreenDirectionCone, mobileCloseZoomIndicator } from './ScreenDirectionCone';\nimport { renderedGroundPoint } from './SelectionPulse';\nimport { nativeCurrentImageMesh } from './nativeCurrentImageMesh';\n\n"
            },
            {
              "label": "Mobile close zoom indicator 2",
              "before": " }\n private update():void{\n  const view=this.view,m=this.model;if(!view||!m)return;\n  const cached=this.settled;\n  if(this.nativeActive&&view.stationary===true&&view.updating===false&&cached?.model===m&&cached.marker===this.marker&&cached.fan===this.fan&&cached.camera===view.camera&&cached.zoom===view.zoom&&cached.width===view.width&&cached.height===view.height&&cached.container===view.container&&cached.sampler===view.groundView?.elevationSampler)return;\n  // Readability at globe/overview scale remains the validated SVG representation.\n",
              "after": " }\n private update():void{\n  const view=this.view,m=this.model;if(!view||!m)return;\n  // Close phone views use the existing SVG at a stable 14px circle / 32px fan\n  // rather than shrinking a mesh from a highly nonlinear 10m projection sample.\n  if(mobileCloseZoomIndicator(view)){this.showFallback(true);return;}\n  const cached=this.settled;\n  if(this.nativeActive&&view.stationary===true&&view.updating===false&&cached?.model===m&&cached.marker===this.marker&&cached.fan===this.fan&&cached.camera===view.camera&&cached.zoom===view.zoom&&cached.width===view.width&&cached.height===view.height&&cached.container===view.container&&cached.sampler===view.groundView?.elevationSampler)return;\n  // Readability at globe/overview scale remains the validated SVG representation.\n"
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
              "label": "Mobile close zoom indicator 1",
              "before": " if(scale<.001)return null;\n const n=(value:number)=>Math.abs(value)<1e-8?0:Number(value.toFixed(6));\n return `matrix(${n(right.x/scale)},${n(right.y/scale)},${n(-front.x/scale)},${n(-front.y/scale)},0,0)`;\n}\n\n/** One SVG anchor: current-image circle and fan share the ground-plane orientation. */\n",
              "after": " if(scale<.001)return null;\n const n=(value:number)=>Math.abs(value)<1e-8?0:Number(value.toFixed(6));\n return `matrix(${n(right.x/scale)},${n(right.y/scale)},${n(-front.x/scale)},${n(-front.y/scale)},0,0)`;\n}\n\n/** Beyond street-detail zoom, use a screen-size floor on phones/narrow maps.\n * The marker stays at its geographic anchor; only its visual size stabilizes. */\nexport function mobileCloseZoomIndicator(view:any):boolean {\n if(!(view?.zoom>=21))return false;\n const narrow=Number.isFinite(view.width)&&view.width>0&&view.width<=480;\n const touch=view.container?.ownerDocument?.defaultView?.matchMedia?.('(pointer: coarse)')?.matches===true;\n return narrow||touch;\n}\n\n/** One SVG anchor: current-image circle and fan share the ground-plane orientation. */\n"
            },
            {
              "label": "Mobile close zoom indicator 2",
              "before": "  const view=this.view,element=this.element,m=this.model;if(!view||!element||!m)return;\n  const hide=()=>{element.style.display='none';this.onMarkerPresented?.(false,view);};\n  if(view.container.ownerDocument?.visibilityState==='hidden'){hide();return;}\n  let pixel:any,orientation:string;\n  const cache=this.projectionCache;\n  if(cache&&cache.model===m&&cache.fanVisible===this.fanVisible&&cache.markerVisible===this.markerVisible&&cache.camera===view.camera&&cache.zoom===view.zoom&&cache.rotation===view.rotation&&cache.width===view.width&&cache.height===view.height&&view.stationary===true&&view.updating===false){pixel=cache.pixel;orientation=cache.orientation;}\n  else {\n   const source=this.point({longitude:m.lon,latitude:m.lat,spatialReference:{wkid:4326}});\n   let ground=view.type==='3d'?renderedGroundPoint(view,source,this.point):source;\n",
              "after": "  const view=this.view,element=this.element,m=this.model;if(!view||!element||!m)return;\n  const hide=()=>{element.style.display='none';this.onMarkerPresented?.(false,view);};\n  if(view.container.ownerDocument?.visibilityState==='hidden'){hide();return;}\n  const mobileCloseZoom=mobileCloseZoomIndicator(view);\n  let pixel:any,orientation:string;\n  const cache=this.projectionCache;\n  if(cache&&cache.model===m&&cache.mobileCloseZoom===mobileCloseZoom&&cache.fanVisible===this.fanVisible&&cache.markerVisible===this.markerVisible&&cache.camera===view.camera&&cache.zoom===view.zoom&&cache.rotation===view.rotation&&cache.width===view.width&&cache.height===view.height&&view.stationary===true&&view.updating===false){pixel=cache.pixel;orientation=cache.orientation;}\n  else {\n   const source=this.point({longitude:m.lon,latitude:m.lat,spatialReference:{wkid:4326}});\n   let ground=view.type==='3d'?renderedGroundPoint(view,source,this.point):source;\n"
            },
            {
              "label": "Mobile close zoom indicator 3",
              "before": "   if(!pixel||!Number.isFinite(pixel.x)||!Number.isFinite(pixel.y)||pixel.x<0||pixel.y<0||pixel.x>view.width||pixel.y>view.height){hide();return;}\n   orientation='rotate(0)';\n   if(this.fanVisible||(view.type==='3d'&&this.markerVisible)){\n    const radians=m.heading*Math.PI/180,distance=Math.min(50000,Math.max(10,156543.03392804097/2**(view.zoom||0)*40)),cos=Math.max(.01,Math.cos(m.lat*Math.PI/180));\n    const tip=this.point({longitude:m.lon+Math.sin(radians)*distance/(111320*cos),latitude:Math.max(-89,Math.min(89,m.lat+Math.cos(radians)*distance/111320)),z:ground.z||0,spatialReference:{wkid:4326}});\n    const projected=view.toScreen(tip),dx=projected?.x-pixel.x,dy=projected?.y-pixel.y;\n    const bearing=Number.isFinite(dx)&&Number.isFinite(dy)&&Math.hypot(dx,dy)>.001?Math.atan2(dx,-dy)*180/Math.PI:m.heading-(view.type==='3d'?view.camera?.heading||0:view.rotation||0);\n    orientation=`rotate(${bearing})`;\n    if(view.type==='3d'){\n     const side=this.point({longitude:m.lon+Math.cos(radians)*distance/(111320*cos),latitude:Math.max(-89,Math.min(89,m.lat-Math.sin(radians)*distance/111320)),z:ground.z||0,spatialReference:{wkid:4326}}),q=view.toScreen(side);\n     const matrix=q&&groundFanMatrix({x:dx,y:dy},{x:q.x-pixel.x,y:q.y-pixel.y});if(matrix)orientation=matrix;\n    }\n   }\n   this.projectionCache={model:m,fanVisible:this.fanVisible,markerVisible:this.markerVisible,pixel,orientation,camera:view.camera,zoom:view.zoom,rotation:view.rotation,width:view.width,height:view.height};\n  }\n  element.style.display='block';\n  const position=haloOverlayPosition(view.container,element,pixel,view.width,view.height);if(!position){hide();return;}\n",
              "after": "   if(!pixel||!Number.isFinite(pixel.x)||!Number.isFinite(pixel.y)||pixel.x<0||pixel.y<0||pixel.x>view.width||pixel.y>view.height){hide();return;}\n   orientation='rotate(0)';\n   if(this.fanVisible||(view.type==='3d'&&this.markerVisible)){\n    const radians=m.heading*Math.PI/180,cos=Math.max(.01,Math.cos(m.lat*Math.PI/180));\n    const distance=mobileCloseZoom?Math.max(.01,156543.03392804097/2**view.zoom*cos*4):Math.min(50000,Math.max(10,156543.03392804097/2**(view.zoom||0)*40));\n    const tip=this.point({longitude:m.lon+Math.sin(radians)*distance/(111320*cos),latitude:Math.max(-89,Math.min(89,m.lat+Math.cos(radians)*distance/111320)),z:ground.z||0,spatialReference:{wkid:4326}});\n    const projected=view.toScreen(tip),dx=projected?.x-pixel.x,dy=projected?.y-pixel.y;\n    const bearing=Number.isFinite(dx)&&Number.isFinite(dy)&&Math.hypot(dx,dy)>.001?Math.atan2(dx,-dy)*180/Math.PI:m.heading-(view.type==='3d'?view.camera?.heading||0:view.rotation||0);\n    orientation=`rotate(${bearing})`;\n    if(view.type==='3d'&&!mobileCloseZoom){\n     const side=this.point({longitude:m.lon+Math.cos(radians)*distance/(111320*cos),latitude:Math.max(-89,Math.min(89,m.lat-Math.sin(radians)*distance/111320)),z:ground.z||0,spatialReference:{wkid:4326}}),q=view.toScreen(side);\n     const matrix=q&&groundFanMatrix({x:dx,y:dy},{x:q.x-pixel.x,y:q.y-pixel.y});if(matrix)orientation=matrix;\n    }\n   }\n   this.projectionCache={mobileCloseZoom,model:m,fanVisible:this.fanVisible,markerVisible:this.markerVisible,pixel,orientation,camera:view.camera,zoom:view.zoom,rotation:view.rotation,width:view.width,height:view.height};\n  }\n  element.style.display='block';\n  const position=haloOverlayPosition(view.container,element,pixel,view.width,view.height);if(!position){hide();return;}\n"
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
              "label": "Mobile close zoom indicator 1",
              "before": "\ntest('new image immediately retires native and SVG visuals before the next projection frame',async()=>{const x=setup();x.owner.showMarker(x.view,0,0,[0,255,0,1],'A');x.owner.show(x.view,0,0,45,10,60);x.tick(0);await Promise.resolve();x.tick(120);assert.equal(x.layers[0].visible,true);x.owner.showMarker(x.view,.0001,0,[0,255,0,1],'B');assert.equal(x.layers[0].visible,false);assert.equal(x.owner.nativeActive,false);assert.equal(x.owner.fallback.element,null);x.owner.show(x.view,.0001,0,90,10,60);x.tick(240);assert.equal(x.layers.length,1);assert.equal(x.layers[0].graphics.length,1);assert.equal(x.layers[0].graphics[0].attributes.image_id,'B');assert.equal(x.layers[0].visible,true);assert.equal(x.owner.fallback.element,null);x.view.zoom=2;x.tick(360);assert(x.owner.fallback.element);x.owner.showMarker(x.view,.0002,0,[0,255,0,1],'C');assert.equal(x.owner.fallback.element,null);assert.equal(x.layers[0].visible,false);x.owner.clear()});\ntest('stationary native marker reprojects after viewport resize without changing camera identity',async()=>{const x=setup();x.owner.showMarker(x.view,0,0,[0,255,0,1],'A');x.tick(0);await Promise.resolve();x.view.stationary=true;x.view.updating=false;x.tick(120);x.tick(240);const before=x.stats().projections;x.view.width=500;x.view.height=200;x.tick(360);assert(x.stats().projections>before);assert.equal(x.layers.length,1);x.owner.clear()});\n",
              "after": "\ntest('new image immediately retires native and SVG visuals before the next projection frame',async()=>{const x=setup();x.owner.showMarker(x.view,0,0,[0,255,0,1],'A');x.owner.show(x.view,0,0,45,10,60);x.tick(0);await Promise.resolve();x.tick(120);assert.equal(x.layers[0].visible,true);x.owner.showMarker(x.view,.0001,0,[0,255,0,1],'B');assert.equal(x.layers[0].visible,false);assert.equal(x.owner.nativeActive,false);assert.equal(x.owner.fallback.element,null);x.owner.show(x.view,.0001,0,90,10,60);x.tick(240);assert.equal(x.layers.length,1);assert.equal(x.layers[0].graphics.length,1);assert.equal(x.layers[0].graphics[0].attributes.image_id,'B');assert.equal(x.layers[0].visible,true);assert.equal(x.owner.fallback.element,null);x.view.zoom=2;x.tick(360);assert(x.owner.fallback.element);x.owner.showMarker(x.view,.0002,0,[0,255,0,1],'C');assert.equal(x.owner.fallback.element,null);assert.equal(x.layers[0].visible,false);x.owner.clear()});\ntest('stationary native marker reprojects after viewport resize without changing camera identity',async()=>{const x=setup();x.owner.showMarker(x.view,0,0,[0,255,0,1],'A');x.tick(0);await Promise.resolve();x.view.stationary=true;x.view.updating=false;x.tick(120);x.tick(240);const before=x.stats().projections;x.view.width=500;x.view.height=200;x.tick(360);assert(x.stats().projections>before);assert.equal(x.layers.length,1);x.owner.clear()});\n\ntest('mobile close-zoom threshold hides mesh, uses stable SVG and restores native rendering on zoom-out',async()=>{const x=setup();x.view.width=393;x.view.zoom=20.9;x.owner.showMarker(x.view,0,0,[0,255,0,1],'A');x.owner.show(x.view,0,0,0,10,60);x.tick(0);await Promise.resolve();x.tick(120);assert.equal(x.owner.nativeActive,true);const meshes=x.stats().meshes;for(const [index,zoom]of[21,23.8,25].entries()){x.view.zoom=zoom;x.tick(240+index*120);assert.equal(x.owner.nativeActive,false);assert.equal(x.layers[0].visible,false);assert(x.owner.fallback.element);assert.equal(x.stats().meshes,meshes);}x.view.zoom=20.9;x.tick(600);assert.equal(x.owner.nativeActive,true);assert.equal(x.owner.fallback.element,null);assert.equal(x.layers.length,1);x.owner.clear()});\n"
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
              "label": "Mobile close zoom indicator 1",
              "before": "test('steady selection placeholder starts no animation or overlay in 2D',()=>{let requests=0,overlays=0;const bindings={graphic:null},layer={visible:true,add(){},remove(){},destroy(){}},owner=new pulse.SelectionPulse(bindings,{point:p=>p,layer:()=>layer,graphic:p=>p,overlay:()=>{overlays++;return null}},{request:()=>++requests,cancel(){},now:()=>0,clearInterval(){}}),view={type:'2d',map:{add(){},remove(){}},graphics:{remove(){}}};const graphic=owner.show(view,{},1,2,[0,255,0,1],'A',false);assert.equal(requests,0);assert.equal(overlays,0);assert.equal(graphic.attributes.image_id,'A');assert.equal(owner.show(view,{},3,4,[0,255,0,1],'A',false),graphic);assert.equal(requests,0);owner.dispose();assert.equal(bindings.graphic,null)});\n\ntest('new image hides old-position SVG synchronously and reuses one overlay after resize',()=>{const x=setup();x.cone.showMarker(x.view,0,0,[0,255,0,1],'A');x.cone.show(x.view,0,0,45,10,60);x.tick(0);const el=x.elements[0];assert.equal(el.style.display,'block');x.view.width=500;x.cone.showMarker(x.view,10,0,[0,255,0,1],'B');assert.equal(el.style.display,'none');assert.equal(el.fan.style.display,'none');x.cone.show(x.view,10,0,90,10,60);x.tick(40);assert.equal(el.style.display,'block');assert.equal(x.elements.length,1);assert.equal(el.fan.style.display,'');x.cone.clear()});\n",
              "after": "test('steady selection placeholder starts no animation or overlay in 2D',()=>{let requests=0,overlays=0;const bindings={graphic:null},layer={visible:true,add(){},remove(){},destroy(){}},owner=new pulse.SelectionPulse(bindings,{point:p=>p,layer:()=>layer,graphic:p=>p,overlay:()=>{overlays++;return null}},{request:()=>++requests,cancel(){},now:()=>0,clearInterval(){}}),view={type:'2d',map:{add(){},remove(){}},graphics:{remove(){}}};const graphic=owner.show(view,{},1,2,[0,255,0,1],'A',false);assert.equal(requests,0);assert.equal(overlays,0);assert.equal(graphic.attributes.image_id,'A');assert.equal(owner.show(view,{},3,4,[0,255,0,1],'A',false),graphic);assert.equal(requests,0);owner.dispose();assert.equal(bindings.graphic,null)});\n\ntest('new image hides old-position SVG synchronously and reuses one overlay after resize',()=>{const x=setup();x.cone.showMarker(x.view,0,0,[0,255,0,1],'A');x.cone.show(x.view,0,0,45,10,60);x.tick(0);const el=x.elements[0];assert.equal(el.style.display,'block');x.view.width=500;x.cone.showMarker(x.view,10,0,[0,255,0,1],'B');assert.equal(el.style.display,'none');assert.equal(el.fan.style.display,'none');x.cone.show(x.view,10,0,90,10,60);x.tick(40);assert.equal(el.style.display,'block');assert.equal(x.elements.length,1);assert.equal(el.fan.style.display,'');x.cone.clear()});\n\ntest('phone close zoom keeps a 14px circle and uncompressed fan from zoom 21 onward',()=>{const x=setup();x.view.width=393;x.view.height=500;x.view.toScreen=p=>({x:150+p.longitude*1000,y:150-p.latitude*100});x.view.zoom=20.9;x.cone.showMarker(x.view,0,0,[0,255,0,1],'A');x.cone.show(x.view,0,0,0,10,60);x.tick(0);assert(x.elements[0].fan.getAttribute('transform').includes('matrix'));for(const [index,zoom]of[21,23.8,25].entries()){x.view.zoom=zoom;x.tick(40+index*40);const element=x.elements[0];assert.equal(element.style.display,'block');assert(element.fan.getAttribute('transform').includes('rotate('));assert(!element.marker.getAttribute('transform').includes('matrix'));assert(element.innerHTML.includes('r=\"7\"'));assert(element.innerHTML.includes('A32 32'));}assert.equal(x.elements.length,1);x.view.zoom=20;x.tick(200);assert(x.elements[0].fan.getAttribute('transform').includes('matrix'));x.cone.clear()});\ntest('wide desktop views retain ground orientation at extreme zoom',()=>{const x=setup();x.view.width=1000;x.view.zoom=23.8;x.view.toScreen=p=>({x:150+p.longitude*1000,y:150-p.latitude*1000});x.cone.show(x.view,0,0,0,10,60);x.tick(0);assert(x.elements[0].fan.getAttribute('transform').includes('matrix'));x.cone.clear()});\n"
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
const prefix = 'mobile-close-zoom-indicator-';

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
    if (manifest.installer !== 'mobile-close-zoom-indicator' || !manifest.completed || manifest.uninstall) continue;
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
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-mobile-close-zoom-indicator.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Mobile close zoom indicator confirmation is already installed. No files changed.');
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
  const manifest = { installer: 'mobile-close-zoom-indicator', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Mobile close zoom indicator confirmation ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
