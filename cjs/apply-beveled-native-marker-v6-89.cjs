#!/usr/bin/env node
'use strict';
/**
 * Beveled native marker trial v6.89. Compatible current v6 sources.
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
      "file": "src/features/map-graphics/nativeCurrentImageMesh.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "steady 3D cleanup src/features/map-graphics/nativeCurrentImageMesh.ts",
              "before": "/** Thin, closed local-metre solids in one Mesh, with per-component materials. */\nexport function nativeCurrentImageMesh(lon:number,lat:number,z:number,scale:number,radius:number,spread:number,heading:number,marker:boolean,fan:boolean,color:number[]=[0,255,0,1]) {\n const position:number[]=[],components:any[]=[];\n const section=(inner:number,outer:number,start:number,end:number,n:number,rgba:number[],height:(r:number)=>number)=>{\n  const faces:number[]=[],base=position.length/3,full=Math.abs(end-start-360)<.001;\n  for(let i=0;i<=n;i++){\n   const a=(start+(end-start)*i/n)*Math.PI/180;\n   for(const [r,h]of[[inner,height(inner)],[outer,height(outer)],[inner,.1],[outer,.1]])position.push(scale*r*Math.sin(a),scale*r*Math.cos(a),scale*h);\n  }\n  for(let i=0;i<n;i++){\n   const a=base+i*4,b=a+4;\n   if(inner>0)faces.push(a,b,b+1,a,b+1,a+1,a+2,b+3,b+2,a+2,a+3,b+3,a,b+2,b,a,a+2,b+2);\n   else faces.push(a,b+1,a+1,a+2,a+3,b+3);\n   faces.push(a+1,b+1,a+3,b+1,b+3,a+3);\n  }\n  if(!full){const a=base,b=base+n*4;faces.push(a,a+1,a+2,a+1,a+3,a+2,b,b+2,b+1,b+1,b+2,b+3);}\n  components.push({faces,shading:'flat',material:{color:rgba,alphaMode:rgba[3]<1?'blend':'opaque',doubleSided:false}});\n };\n if(marker){section(0,6,0,360,32,color,()=>.65);section(6,8,0,360,32,[255,255,255,1],()=>.65);}\n if(fan)section(8.5,radius,heading-spread/2,heading+spread/2,20,[255,179,0,.7],r=>.35+Math.max(0,r-8.5)*.035);\n return {spatialReference:{wkid:4326},vertexSpace:{type:'local',origin:[lon,lat,z]},vertexAttributes:{position},components};\n}\n",
              "after": "/** Beveled, closed local-metre solids in one Mesh, with per-component materials. */\nexport function nativeCurrentImageMesh(lon:number,lat:number,z:number,scale:number,radius:number,spread:number,heading:number,marker:boolean,fan:boolean,color:number[]=[0,255,0,1]) {\n const position:number[]=[],components:any[]=[];\n const section=(inner:number,outer:number,start:number,end:number,n:number,rgba:number[],height:(r:number)=>number)=>{\n  const faces:number[]=[],base=position.length/3,full=Math.abs(end-start-360)<.001;\n  for(let i=0;i<=n;i++){\n   const a=(start+(end-start)*i/n)*Math.PI/180;\n   for(const [r,h]of[[inner,height(inner)],[outer,height(outer)],[inner,.1],[outer,.1]])position.push(scale*r*Math.sin(a),scale*r*Math.cos(a),scale*h);\n  }\n  for(let i=0;i<n;i++){\n   const a=base+i*4,b=a+4;\n   if(inner>0)faces.push(a,b,b+1,a,b+1,a+1,a+2,b+3,b+2,a+2,a+3,b+3,a,b+2,b,a,a+2,b+2);\n   else faces.push(a,b+1,a+1,a+2,a+3,b+3);\n   faces.push(a+1,b+1,a+3,b+1,b+3,a+3);\n  }\n  if(!full){const a=base,b=base+n*4;faces.push(a,a+1,a+2,a+1,a+3,a+2,b,b+2,b+1,b+1,b+2,b+3);}\n  components.push({faces,shading:'flat',material:{color:rgba,alphaMode:rgba[3]<1?'blend':'opaque',doubleSided:false}});\n };\n if(marker){\n  section(0,5.2,0,360,32,color,()=>2.2);\n  section(5.2,6,0,360,32,color,r=>2.2-(r-5.2)*1.3125);\n  const bevel=components.pop();components[0].faces.push(...bevel.faces);\n  section(6,8,0,360,32,[255,255,255,1],r=>1.15-(r-6)*.2);\n }\n if(fan){\n  const height=(r:number)=>.4+Math.min(8,Math.max(0,r-8.5)*.2),edge=Math.max(8.5,radius-.8);\n  section(8.5,edge,heading-spread/2,heading+spread/2,20,[255,179,0,.85],height);\n  section(edge,radius,heading-spread/2,heading+spread/2,20,[255,153,0,1],height);\n }\n return {spatialReference:{wkid:4326},vertexSpace:{type:'local',origin:[lon,lat,z]},vertexAttributes:{position},components};\n}\n",
              "wholeFile": true
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
              "label": "steady 3D cleanup tests/nativeCurrentImageMarker.test.cjs",
              "before": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');function load(file,req=()=>({})){const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/map-graphics',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(req,m,m.exports);return m.exports}const pulse=load('SelectionPulse.ts',()=>({selectionPulseOverlayStyle:()=>({})})),screen=load('ScreenDirectionCone.ts',()=>pulse),geometry=load('nativeCurrentImageMesh.ts'),{NativeCurrentImageMarker}=load('NativeCurrentImageMarker.ts',name=>name.includes('ScreenDirectionCone')?screen:name.includes('SelectionPulse')?pulse:geometry);\nfunction setup(){let frame,requests=0,cancels=0,meshes=0,projections=0;const layers=[],states=[],lv={visible:true,updating:false,suspended:false},parent={offsetWidth:300,offsetHeight:300,clientLeft:0,clientTop:0,scrollLeft:0,scrollTop:0,getBoundingClientRect:()=>({left:0,top:0,width:300,height:300})},view={type:'3d',zoom:20,stationary:false,updating:true,camera:{},width:300,height:300,map:{ground:{layers:[]},add:l=>layers.push(l),remove:l=>layers.splice(layers.indexOf(l),1)},container:{ownerDocument:{visibilityState:'visible',defaultView:{scrollX:0,scrollY:0,getComputedStyle:()=>({position:'relative'})}},appendChild(){},getBoundingClientRect:()=>({left:0,top:0,width:300,height:300})},whenLayerView:()=>Promise.resolve(lv),ppm:5,toScreen:p=>(projections++,{x:150+p.longitude*111320*view.ppm,y:150-p.latitude*111320*view.ppm})};const factory={point:p=>({...p}),mesh:p=>(meshes++,p),graphic:p=>({...p}),layer:p=>({...p,visible:true,graphics:[],add(g){this.graphics.push(g)},destroy(){this.destroyed=true}}),element:()=>{const part=()=>({style:{},attrs:{},setAttribute(k,v){this.attrs[k]=v},getAttribute(k){return this.attrs[k]}}),fan=part(),marker=part();return{style:{},offsetParent:parent,setAttribute(){},remove(){},querySelector:s=>s.includes('direction-fan')?fan:marker}}};const owner=new NativeCurrentImageMarker(factory,{request:cb=>(frame=cb,++requests),cancel:()=>cancels++},(v,view)=>states.push(v));return{owner,view,layers,states,lv,tick:t=>frame(t),stats:()=>({requests,cancels,meshes,projections})}}\ntest('single native mesh has valid bounded faces, local origin and green/white/orange materials',()=>{const m=geometry.nativeCurrentImageMesh(1,2,3,.1,32,60,45,true,true);assert.deepEqual(m.vertexSpace.origin,[1,2,3]);assert.equal(m.components.length,3);const n=m.vertexAttributes.position.length/3;assert(n<500);for(const c of m.components){assert.equal(c.faces.length%3,0);for(const i of c.faces)assert(Number.isInteger(i)&&i>=0&&i<n)}assert.deepEqual(m.components[0].material.color,[0,255,0,1]);assert.deepEqual(m.components[1].material.color,[255,255,255,1]);assert.equal(m.components[2].material.alphaMode,'blend');assert.equal(m.spatialReference.wkid,4326)});\ntest('native trial retains one Graphic, waits for layer readiness and updates geometry only on change',async()=>{const x=setup();x.owner.showMarker(x.view,0,0,[0,255,0,1],'A');x.owner.show(x.view,0,0,45,10,60);x.tick(0);assert.equal(x.layers.length,1);assert.equal(x.owner.nativeActive,false);await Promise.resolve();x.tick(120);assert.equal(x.owner.nativeActive,true);const g=x.layers[0].graphics[0],symbol=g.symbol;assert.equal(g.geometry.components.length,3);const meshes=x.stats().meshes;x.tick(240);assert.equal(x.stats().meshes,meshes);x.view.ppm=10;x.tick(360);assert.equal(x.layers[0].graphics[0],g);assert.equal(g.symbol,symbol);assert.equal(x.stats().meshes,meshes+1);x.view.stationary=true;x.view.updating=false;x.tick(480);const projected=x.stats().projections;x.tick(600);assert.equal(x.stats().projections,projected);x.owner.clear();assert.equal(x.layers.length,0);assert.equal(x.owner.frame,null);assert.equal(x.stats().cancels,1)});\ntest('overview switches to SVG without a huge physical mesh, then native resumes',async()=>{const x=setup();x.owner.showMarker(x.view,0,0,[0,255,0,1],'A');x.owner.show(x.view,0,0,0,10,60);x.tick(0);await Promise.resolve();x.tick(120);assert.equal(x.owner.nativeActive,true);x.view.zoom=2;x.tick(240);assert.equal(x.owner.nativeActive,false);assert.equal(x.layers[0].visible,false);assert(x.owner.fallback.element);assert.equal(x.states.at(-1),true);x.view.zoom=20;x.tick(360);assert.equal(x.owner.nativeActive,true);assert.equal(x.owner.fallback.element,null);x.owner.hideCone();x.tick(480);assert.equal(x.layers[0].graphics[0].geometry.components.length,2);x.owner.hideMarker();assert.equal(x.layers.length,0)});\ntest('late native layer-view resolution cannot revive cleared owner',async()=>{const x=setup();let resolve;x.view.whenLayerView=()=>new Promise(r=>resolve=r);x.owner.showMarker(x.view,0,0,[0,255,0,1],'A');x.tick(0);x.owner.clear();resolve(x.lv);await Promise.resolve();assert.equal(x.owner.layerView,null);assert.equal(x.layers.length,0)});\n",
              "after": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');function load(file,req=()=>({})){const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/map-graphics',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(req,m,m.exports);return m.exports}const pulse=load('SelectionPulse.ts',()=>({selectionPulseOverlayStyle:()=>({})})),screen=load('ScreenDirectionCone.ts',()=>pulse),geometry=load('nativeCurrentImageMesh.ts'),{NativeCurrentImageMarker}=load('NativeCurrentImageMarker.ts',name=>name.includes('ScreenDirectionCone')?screen:name.includes('SelectionPulse')?pulse:geometry);\nfunction setup(){let frame,requests=0,cancels=0,meshes=0,projections=0;const layers=[],states=[],lv={visible:true,updating:false,suspended:false},parent={offsetWidth:300,offsetHeight:300,clientLeft:0,clientTop:0,scrollLeft:0,scrollTop:0,getBoundingClientRect:()=>({left:0,top:0,width:300,height:300})},view={type:'3d',zoom:20,stationary:false,updating:true,camera:{},width:300,height:300,map:{ground:{layers:[]},add:l=>layers.push(l),remove:l=>layers.splice(layers.indexOf(l),1)},container:{ownerDocument:{visibilityState:'visible',defaultView:{scrollX:0,scrollY:0,getComputedStyle:()=>({position:'relative'})}},appendChild(){},getBoundingClientRect:()=>({left:0,top:0,width:300,height:300})},whenLayerView:()=>Promise.resolve(lv),ppm:5,toScreen:p=>(projections++,{x:150+p.longitude*111320*view.ppm,y:150-p.latitude*111320*view.ppm})};const factory={point:p=>({...p}),mesh:p=>(meshes++,p),graphic:p=>({...p}),layer:p=>({...p,visible:true,graphics:[],add(g){this.graphics.push(g)},destroy(){this.destroyed=true}}),element:()=>{const part=()=>({style:{},attrs:{},setAttribute(k,v){this.attrs[k]=v},getAttribute(k){return this.attrs[k]}}),fan=part(),marker=part();return{style:{},offsetParent:parent,setAttribute(){},remove(){},querySelector:s=>s.includes('direction-fan')?fan:marker}}};const owner=new NativeCurrentImageMarker(factory,{request:cb=>(frame=cb,++requests),cancel:()=>cancels++},(v,view)=>states.push(v));return{owner,view,layers,states,lv,tick:t=>frame(t),stats:()=>({requests,cancels,meshes,projections})}}\ntest('single native mesh has valid bounded faces, local origin and green/white/orange materials',()=>{const m=geometry.nativeCurrentImageMesh(1,2,3,.1,32,60,45,true,true);assert.deepEqual(m.vertexSpace.origin,[1,2,3]);assert.equal(m.components.length,4);const n=m.vertexAttributes.position.length/3;assert(n<700);for(const c of m.components){assert.equal(c.faces.length%3,0);for(const i of c.faces)assert(Number.isInteger(i)&&i>=0&&i<n)}assert.deepEqual(m.components[0].material.color,[0,255,0,1]);assert.deepEqual(m.components[1].material.color,[255,255,255,1]);assert.equal(m.components[2].material.alphaMode,'blend');assert.equal(m.spatialReference.wkid,4326)});\ntest('native trial retains one Graphic, waits for layer readiness and updates geometry only on change',async()=>{const x=setup();x.owner.showMarker(x.view,0,0,[0,255,0,1],'A');x.owner.show(x.view,0,0,45,10,60);x.tick(0);assert.equal(x.layers.length,1);assert.equal(x.owner.nativeActive,false);await Promise.resolve();x.tick(120);assert.equal(x.owner.nativeActive,true);const g=x.layers[0].graphics[0],symbol=g.symbol;assert.equal(g.geometry.components.length,4);const meshes=x.stats().meshes;x.tick(240);assert.equal(x.stats().meshes,meshes);x.view.ppm=10;x.tick(360);assert.equal(x.layers[0].graphics[0],g);assert.equal(g.symbol,symbol);assert.equal(x.stats().meshes,meshes+1);x.view.stationary=true;x.view.updating=false;x.tick(480);const projected=x.stats().projections;x.tick(600);assert.equal(x.stats().projections,projected);x.owner.clear();assert.equal(x.layers.length,0);assert.equal(x.owner.frame,null);assert.equal(x.stats().cancels,1)});\ntest('overview switches to SVG without a huge physical mesh, then native resumes',async()=>{const x=setup();x.owner.showMarker(x.view,0,0,[0,255,0,1],'A');x.owner.show(x.view,0,0,0,10,60);x.tick(0);await Promise.resolve();x.tick(120);assert.equal(x.owner.nativeActive,true);x.view.zoom=2;x.tick(240);assert.equal(x.owner.nativeActive,false);assert.equal(x.layers[0].visible,false);assert(x.owner.fallback.element);assert.equal(x.states.at(-1),true);x.view.zoom=20;x.tick(360);assert.equal(x.owner.nativeActive,true);assert.equal(x.owner.fallback.element,null);x.owner.hideCone();x.tick(480);assert.equal(x.layers[0].graphics[0].geometry.components.length,2);x.owner.hideMarker();assert.equal(x.layers.length,0)});\ntest('late native layer-view resolution cannot revive cleared owner',async()=>{const x=setup();let resolve;x.view.whenLayerView=()=>new Promise(r=>resolve=r);x.owner.showMarker(x.view,0,0,[0,255,0,1],'A');x.tick(0);x.owner.clear();resolve(x.lv);await Promise.resolve();assert.equal(x.owner.layerView,null);assert.equal(x.layers.length,0)});\n\ntest('beveled disk has a flat raised center and sloped edge; sector rises gently toward its rim',()=>{const scale=.1,m=geometry.nativeCurrentImageMesh(0,0,0,scale,32,60,0,true,true),v=m.vertexAttributes.position;const heightsFor=(component)=>[...new Set(component.faces)].map(i=>v[i*3+2]/scale);assert(Math.abs(Math.max(...heightsFor(m.components[0]))-2.2)<1e-8);assert(heightsFor(m.components[0]).some(z=>Math.abs(z-1.15)<1e-8));assert(Math.abs(Math.max(...heightsFor(m.components[1]))-1.15)<1e-8);const body=heightsFor(m.components[2]),rim=heightsFor(m.components[3]);assert(Math.max(...rim)>Math.max(...body));assert(Math.max(...rim)>4&&Math.max(...rim)<6);assert.deepEqual(m.components[3].material.color,[255,153,0,1]);const large=geometry.nativeCurrentImageMesh(0,0,0,1,52,20,0,true,true);assert(Math.max(...large.vertexAttributes.position.filter((_,i)=>i%3===2))<=8.4+1e-8)});\n",
              "wholeFile": true
            }
          ]
        }
      ]
    },
    {
      "file": "docs/BEVELED-NATIVE-MARKER-TRIAL.md",
      "content": "# v6.89 beveled native marker visual trial\nRequires v6.88. Geometry/material-only experiment: raised flat green center (2.2 nominal pixel units high), green sloped bevel down to1.15 units, white rim sloping to0.75. Base remains0.1: no pedestal, callout or extra vertical offset. Sector rises at a 0.2 local slope toward the outer arc (default about5.1 nominal pixel units, capped8.4) and adds a thin opaque amber edge. Orange body is85% opaque. Cast shadows remain disabled; shading comes from native geometry normals and SceneView lighting. One Mesh Graphic, four material components, bounded564 vertices at current tessellation. This increases mesh detail slightly; no performance improvement claimed.\n\nNative owner, camera scaling/hysteresis, SVG overview fallback, 2D, selection/hover and cleanup unchanged. SVG overview appearance intentionally unchanged: this visual difference is visible only in close-up native mode. Rebuild/restart/hard-refresh. --uninstall restores v6.88; then uninstall v6.88 to return to v6.87. Rebuild/reload after rollbacks. Experimental visual comparison, not a production recommendation.\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'beveled-native-marker-v6-89-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.89 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'beveled-native-marker-v6-89' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.89 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.89 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.89 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-beveled-native-marker-v6-89.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Beveled native marker trial v6.89 is already installed. No files changed.');
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
  const manifest = { installer: 'beveled-native-marker-v6-89', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Beveled native marker trial v6.89 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
