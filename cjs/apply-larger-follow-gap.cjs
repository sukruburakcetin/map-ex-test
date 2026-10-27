#!/usr/bin/env node
'use strict';
/** Larger follow gap installer. Plain source payload.
 * Validates all targets before writes. Preserves existing source bytes in local
 * backups, rejects links/conflicts, and rolls back its writes on failure.
 * --skip-tests is accepted for compatibility. Regression files are included; no tests run here.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const skipTests = args.includes('--skip-tests') || args.includes('--skip-test');
const uninstall = args.includes('--uninstall');
const payload = {
  "entries": [
    {
      "file": "src/features/imagery/imageFollowPolicy.ts",
      "blocks": [
        {
          "label": "larger follow gap",
          "before": "/** Minimal SDK boundary for checking the rendered viewport rather than its rotated extent. */\nexport interface ImageFollowView {\n type: string; width: number; height: number; stationary?: boolean;\n toScreen(point: any): { x: number; y: number } | null | undefined;\n groundView?: { elevationSampler?: { queryElevation(point: any): any; noDataValue?: number | null } | null } | null;\n}\n\n/** Default follow moves as the image enters an inset edge band; lock preserves continuous follow.\n * Scene projection needs ground height because toScreen does not apply graphic-layer draping.\n * Use only the synchronous rendered-terrain sampler, never a service request. While terrain or\n * viewport dimensions are unavailable, defer movement instead of jumping on a false projection.\n */\nexport function shouldRecenterImage(view: ImageFollowView, point: any, locked: boolean): boolean {\n if (locked) return true;\n if (view.stationary === false || view.width <= 0 || view.height <= 0) return false;\n let projection = point;\n if (view.type === '3d') {\n  try {\n   const sampler = view.groundView?.elevationSampler;\n   const ground = sampler?.queryElevation(point);\n   if (!ground || !Number.isFinite(ground.z) || ground.z === sampler?.noDataValue) return false;\n   projection = ground;\n  } catch { return false; }\n }\n try {\n  // CSS-pixel inset: 8% of each dimension, capped at 48 px. Small/mobile\n  // viewports retain most of their usable area; no fixed ground-distance buffer.\n  const insetX = Math.min(48, view.width * 0.08);\n  const insetY = Math.min(48, view.height * 0.08);\n  const pixel = view.toScreen(projection);\n  return !pixel || !Number.isFinite(pixel.x) || !Number.isFinite(pixel.y) ||\n   pixel.x < insetX || pixel.y < insetY || pixel.x > view.width - insetX || pixel.y > view.height - insetY;\n } catch { return false; }\n}\n",
          "after": "/** Minimal SDK boundary for checking the rendered viewport rather than its rotated extent. */\nexport interface ImageFollowView {\n type: string; width: number; height: number; stationary?: boolean;\n toScreen(point: any): { x: number; y: number } | null | undefined;\n groundView?: { elevationSampler?: { queryElevation(point: any): any; noDataValue?: number | null } | null } | null;\n}\n\n/** Default follow moves as the image enters an inset edge band; lock preserves continuous follow.\n * Scene projection needs ground height because toScreen does not apply graphic-layer draping.\n * Use only the synchronous rendered-terrain sampler, never a service request. While terrain or\n * viewport dimensions are unavailable, defer movement instead of jumping on a false projection.\n */\nexport function shouldRecenterImage(view: ImageFollowView, point: any, locked: boolean): boolean {\n if (locked) return true;\n if (view.stationary === false || view.width <= 0 || view.height <= 0) return false;\n let projection = point;\n if (view.type === '3d') {\n  try {\n   const sampler = view.groundView?.elevationSampler;\n   const ground = sampler?.queryElevation(point);\n   if (!ground || !Number.isFinite(ground.z) || ground.z === sampler?.noDataValue) return false;\n   projection = ground;\n  } catch { return false; }\n }\n try {\n  // CSS-pixel inset: 12% of each dimension, capped at 64 px. Small/mobile\n  // viewports retain most of their usable area; no fixed ground-distance buffer.\n  const insetX = Math.min(64, view.width * 0.12);\n  const insetY = Math.min(64, view.height * 0.12);\n  const pixel = view.toScreen(projection);\n  return !pixel || !Number.isFinite(pixel.x) || !Number.isFinite(pixel.y) ||\n   pixel.x < insetX || pixel.y < insetY || pixel.x > view.width - insetX || pixel.y > view.height - insetY;\n } catch { return false; }\n}\n"
        }
      ],
      "absentAfterUninstall": [
        "Math.min(64, view.width * 0.12)"
      ],
      "requiredOccurrences": [
        {
          "text": "Math.min(64, view.width * 0.12)",
          "count": 1
        }
      ]
    },
    {
      "file": "tests/imageFollowPolicy.test.cjs",
      "blocks": [
        {
          "label": "larger follow gap",
          "before": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');const compile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,m={exports:{}};new Function('module','exports',compile(fs.readFileSync(path.join(__dirname,'../src/features/imagery/imageFollowPolicy.ts'),'utf8')))(m,m.exports);const {shouldRecenterImage:follow}=m.exports;\nconst view=(x=50,y=50)=>({type:'2d',width:100,height:100,toScreen:()=>({x,y})});\ntest('images inside the inset safe area do not move the map',()=>{for(const [x,y] of [[50,50],[8,8],[92,92]])assert.equal(follow(view(x,y),{},false),false)});\ntest('image outside any viewport edge recenters',()=>{for(const [x,y] of [[-1,50],[101,50],[50,-1],[50,101]])assert.equal(follow(view(x,y),{},false),true)});\ntest('lock restores continuous following even while image is visible',()=>assert.equal(follow(view(),{},true),true));\ntest('default mode respects an active map gesture and unavailable dimensions',()=>{assert.equal(follow({...view(101),stationary:false},{},false),false);assert.equal(follow({...view(101),width:0},{},false),false)});\ntest('3D checks ground projection rather than raw anchor altitude',()=>{const point={z:100000},ground={z:50};let projected;const v={...view(),type:'3d',groundView:{elevationSampler:{queryElevation:p=>(assert.equal(p,point),ground)}},toScreen:p=>(projected=p,{x:50,y:50})};assert.equal(follow(v,point,false),false);assert.equal(projected,ground);v.toScreen=()=>({x:101,y:50});assert.equal(follow(v,point,false),true)});\ntest('3D missing terrain and no-data defer follow rather than jumping',()=>{const v={...view(101),type:'3d'};assert.equal(follow(v,{},false),false);v.groundView={elevationSampler:{noDataValue:-999,queryElevation:()=>({z:-999})}};assert.equal(follow(v,{},false),false)});\nconst file=fs.readFileSync(path.join(__dirname,'../src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',file,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');assert.equal(sf.parseDiagnostics.length,0);const method=cl.members.find(n=>n.name?.getText(sf)==='syncMapToImage').getText(sf);const Harness=new Function('shouldRecenterImage','sceneFollowCamera','webMercatorUtils',compile('class Harness{'+method+'};')+'return Harness;')(follow,()=>({camera:true}),{geographicToWebMercator:p=>({x:p.longitude,y:p.latitude})});\nfunction runtime(type='2d',position='center',locked=false){const w=new Harness();w.props={config:{syncMapWithImage:true,syncMapPosition:position}};w.state={lockToImage:locked,imageId:'A'};w.getCoverageDisplayPosition=()=>({lon:1,lat:2});w.ArcGISModules={Point:class{constructor(p){Object.assign(this,p)}}};w.moves=[];w.navigateMapView=(...a)=>w.moves.push(a);w._userPaused=false;const v={...view(),type,scale:1234,extent:{width:100,height:200},groundView:{elevationSampler:{queryElevation:()=>({z:30})}}};return{w,v}}\ntest('actual runtime keeps visible image still in all configured directions',()=>{for(const p of ['center','east','west','north','south']){const {w,v}=runtime('2d',p);w.syncMapToImage({id:'A',lon:1,lat:2},v);assert.equal(w.moves.length,0)}});\ntest('actual runtime recenters outside, preserves scale and each direction offset',()=>{for(const [p,x,y] of [['center',undefined,undefined],['east',-24,2],['west',26,2],['north',1,-48],['south',1,52]]){const {w,v}=runtime('2d',p);v.toScreen=()=>({x:101,y:50});w.syncMapToImage({id:'A',lon:1,lat:2},v);assert.equal(w.moves.length,1);assert.equal(w.moves[0][1].scale,1234);if(x!==undefined){assert.equal(w.moves[0][1].center.x,x);assert.equal(w.moves[0][1].center.y,y)}}});\ntest('actual 3D runtime follows only outside unless locked',()=>{for(const locked of [false,true]){const {w,v}=runtime('3d','center',locked);w.syncMapToImage({id:'A',lon:1,lat:2},v);assert.equal(w.moves.length,locked?1:0);v.toScreen=()=>({x:101,y:50});w.syncMapToImage({id:'A',lon:1,lat:2},v);assert.equal(w.moves.length,locked?2:1)}});\ntest('disabled sync and fly-in suppress navigation in both modes',()=>{for(const lock of [false,true]){const {w,v}=runtime('2d','center',lock);v.toScreen=()=>({x:101,y:50});w.props.config.syncMapWithImage=false;w.syncMapToImage({id:'A',lon:1,lat:2},v);assert.equal(w.moves.length,0);w.props.config.syncMapWithImage=true;w._isFlyInActive=true;w.syncMapToImage({id:'A',lon:1,lat:2},v);assert.equal(w.moves.length,0)}});\ntest('bearing follow rotates without recentering unless image lock is enabled',()=>{let branch;function visit(n){if(ts.isIfStatement(n)&&n.expression.getText(sf).includes('this.state.syncHeading')&&n.expression.getText(sf).includes('syncMapWithImage'))branch=n;ts.forEachChild(n,visit)}visit(cl);assert(branch);const Heading=new Function(compile('class Heading{run(view,event){'+branch.getText(sf)+'}}')+'return Heading;')();for(const locked of [false,true]){const w=new Heading();w.props={config:{syncMapWithImage:true}};w.state={syncHeading:true,lockToImage:locked,imageId:'A'};w._liveSequenceFrames={current:{lon:1,lat:2}};let target;w.navigateMapView=(view,t)=>target=t;w.run({type:'3d'},{bearing:75});assert.equal(target.heading,75);assert.equal('center' in target,locked);target=undefined;w.run({type:'3d',stationary:false},{bearing:90});assert.equal(!!target,locked)}});\n\ntest('follow triggers just before each edge, while the marker is still visible',()=>{for(const [x,y] of [[7,50],[93,50],[50,7],[50,93]])assert.equal(follow(view(x,y),{},false),true)});\ntest('insets scale for mobile and cap at 48 CSS pixels on large maps',()=>{const mobile={...view(),width:320,height:200};mobile.toScreen=()=>({x:24,y:100});assert.equal(follow(mobile,{},false),true);mobile.toScreen=()=>({x:26,y:100});assert.equal(follow(mobile,{},false),false);const large={...view(),width:2000,height:1200};large.toScreen=()=>({x:49,y:500});assert.equal(follow(large,{},false),false);large.toScreen=()=>({x:47,y:500});assert.equal(follow(large,{},false),true)});\ntest('automatic recenter glides during playback; locked tracking retains its original timing',()=>{for(const type of ['2d','3d'])for(const locked of [false,true]){const {w,v}=runtime(type,'center',locked);v.toScreen=()=>({x:101,y:50});w.syncMapToImage({id:'A',lon:1,lat:2},v);assert.deepEqual(w.moves[0][2],locked?{animate:false,duration:0}:{animate:true,duration:450,easing:'ease-in-out'})}});\ntest('default follow does not restart a recenter during camera movement',()=>{const {w,v}=runtime();v.stationary=false;v.toScreen=()=>({x:101,y:50});w.syncMapToImage({id:'A',lon:1,lat:2},v);assert.equal(w.moves.length,0)});\n",
          "after": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');const compile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,m={exports:{}};new Function('module','exports',compile(fs.readFileSync(path.join(__dirname,'../src/features/imagery/imageFollowPolicy.ts'),'utf8')))(m,m.exports);const {shouldRecenterImage:follow}=m.exports;\nconst view=(x=50,y=50)=>({type:'2d',width:100,height:100,toScreen:()=>({x,y})});\ntest('images inside the inset safe area do not move the map',()=>{for(const [x,y] of [[50,50],[12,12],[88,88]])assert.equal(follow(view(x,y),{},false),false)});\ntest('image outside any viewport edge recenters',()=>{for(const [x,y] of [[-1,50],[101,50],[50,-1],[50,101]])assert.equal(follow(view(x,y),{},false),true)});\ntest('lock restores continuous following even while image is visible',()=>assert.equal(follow(view(),{},true),true));\ntest('default mode respects an active map gesture and unavailable dimensions',()=>{assert.equal(follow({...view(101),stationary:false},{},false),false);assert.equal(follow({...view(101),width:0},{},false),false)});\ntest('3D checks ground projection rather than raw anchor altitude',()=>{const point={z:100000},ground={z:50};let projected;const v={...view(),type:'3d',groundView:{elevationSampler:{queryElevation:p=>(assert.equal(p,point),ground)}},toScreen:p=>(projected=p,{x:50,y:50})};assert.equal(follow(v,point,false),false);assert.equal(projected,ground);v.toScreen=()=>({x:101,y:50});assert.equal(follow(v,point,false),true)});\ntest('3D missing terrain and no-data defer follow rather than jumping',()=>{const v={...view(101),type:'3d'};assert.equal(follow(v,{},false),false);v.groundView={elevationSampler:{noDataValue:-999,queryElevation:()=>({z:-999})}};assert.equal(follow(v,{},false),false)});\nconst file=fs.readFileSync(path.join(__dirname,'../src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',file,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');assert.equal(sf.parseDiagnostics.length,0);const method=cl.members.find(n=>n.name?.getText(sf)==='syncMapToImage').getText(sf);const Harness=new Function('shouldRecenterImage','sceneFollowCamera','webMercatorUtils',compile('class Harness{'+method+'};')+'return Harness;')(follow,()=>({camera:true}),{geographicToWebMercator:p=>({x:p.longitude,y:p.latitude})});\nfunction runtime(type='2d',position='center',locked=false){const w=new Harness();w.props={config:{syncMapWithImage:true,syncMapPosition:position}};w.state={lockToImage:locked,imageId:'A'};w.getCoverageDisplayPosition=()=>({lon:1,lat:2});w.ArcGISModules={Point:class{constructor(p){Object.assign(this,p)}}};w.moves=[];w.navigateMapView=(...a)=>w.moves.push(a);w._userPaused=false;const v={...view(),type,scale:1234,extent:{width:100,height:200},groundView:{elevationSampler:{queryElevation:()=>({z:30})}}};return{w,v}}\ntest('actual runtime keeps visible image still in all configured directions',()=>{for(const p of ['center','east','west','north','south']){const {w,v}=runtime('2d',p);w.syncMapToImage({id:'A',lon:1,lat:2},v);assert.equal(w.moves.length,0)}});\ntest('actual runtime recenters outside, preserves scale and each direction offset',()=>{for(const [p,x,y] of [['center',undefined,undefined],['east',-24,2],['west',26,2],['north',1,-48],['south',1,52]]){const {w,v}=runtime('2d',p);v.toScreen=()=>({x:101,y:50});w.syncMapToImage({id:'A',lon:1,lat:2},v);assert.equal(w.moves.length,1);assert.equal(w.moves[0][1].scale,1234);if(x!==undefined){assert.equal(w.moves[0][1].center.x,x);assert.equal(w.moves[0][1].center.y,y)}}});\ntest('actual 3D runtime follows only outside unless locked',()=>{for(const locked of [false,true]){const {w,v}=runtime('3d','center',locked);w.syncMapToImage({id:'A',lon:1,lat:2},v);assert.equal(w.moves.length,locked?1:0);v.toScreen=()=>({x:101,y:50});w.syncMapToImage({id:'A',lon:1,lat:2},v);assert.equal(w.moves.length,locked?2:1)}});\ntest('disabled sync and fly-in suppress navigation in both modes',()=>{for(const lock of [false,true]){const {w,v}=runtime('2d','center',lock);v.toScreen=()=>({x:101,y:50});w.props.config.syncMapWithImage=false;w.syncMapToImage({id:'A',lon:1,lat:2},v);assert.equal(w.moves.length,0);w.props.config.syncMapWithImage=true;w._isFlyInActive=true;w.syncMapToImage({id:'A',lon:1,lat:2},v);assert.equal(w.moves.length,0)}});\ntest('bearing follow rotates without recentering unless image lock is enabled',()=>{let branch;function visit(n){if(ts.isIfStatement(n)&&n.expression.getText(sf).includes('this.state.syncHeading')&&n.expression.getText(sf).includes('syncMapWithImage'))branch=n;ts.forEachChild(n,visit)}visit(cl);assert(branch);const Heading=new Function(compile('class Heading{run(view,event){'+branch.getText(sf)+'}}')+'return Heading;')();for(const locked of [false,true]){const w=new Heading();w.props={config:{syncMapWithImage:true}};w.state={syncHeading:true,lockToImage:locked,imageId:'A'};w._liveSequenceFrames={current:{lon:1,lat:2}};let target;w.navigateMapView=(view,t)=>target=t;w.run({type:'3d'},{bearing:75});assert.equal(target.heading,75);assert.equal('center' in target,locked);target=undefined;w.run({type:'3d',stationary:false},{bearing:90});assert.equal(!!target,locked)}});\n\ntest('follow triggers just before each edge, while the marker is still visible',()=>{for(const [x,y] of [[11,50],[89,50],[50,11],[50,89]])assert.equal(follow(view(x,y),{},false),true)});\ntest('insets scale for mobile and cap at 64 CSS pixels on large maps',()=>{const mobile={...view(),width:320,height:200};mobile.toScreen=()=>({x:37,y:100});assert.equal(follow(mobile,{},false),true);mobile.toScreen=()=>({x:39,y:100});assert.equal(follow(mobile,{},false),false);const large={...view(),width:2000,height:1200};large.toScreen=()=>({x:65,y:500});assert.equal(follow(large,{},false),false);large.toScreen=()=>({x:63,y:500});assert.equal(follow(large,{},false),true)});\ntest('automatic recenter glides during playback; locked tracking retains its original timing',()=>{for(const type of ['2d','3d'])for(const locked of [false,true]){const {w,v}=runtime(type,'center',locked);v.toScreen=()=>({x:101,y:50});w.syncMapToImage({id:'A',lon:1,lat:2},v);assert.deepEqual(w.moves[0][2],locked?{animate:false,duration:0}:{animate:true,duration:450,easing:'ease-in-out'})}});\ntest('default follow does not restart a recenter during camera movement',()=>{const {w,v}=runtime();v.stationary=false;v.toScreen=()=>({x:101,y:50});w.syncMapToImage({id:'A',lon:1,lat:2},v);assert.equal(w.moves.length,0)});\n"
        }
      ],
      "absentAfterUninstall": [
        "cap at 64 CSS pixels"
      ],
      "requiredOccurrences": [
        {
          "text": "cap at 64 CSS pixels",
          "count": 1
        }
      ]
    },
    {
      "file": "docs/REFACTORING-ROADMAP.md",
      "blocks": [
        {
          "label": "larger follow gap",
          "before": "an 8% CSS-pixel inset per axis, capped at 48 px",
          "after": "a 12% CSS-pixel inset per axis, capped at 64 px"
        }
      ],
      "absentAfterUninstall": [
        "a 12% CSS-pixel inset per axis, capped at 64 px"
      ],
      "requiredOccurrences": [
        {
          "text": "a 12% CSS-pixel inset per axis, capped at 64 px",
          "count": 1
        }
      ]
    }
  ],
  "modules": []
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'larger-follow-gap-';

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
      if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (partially edited organization filter)');
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

try {
  const allowed = ['--dry-run', '--skip-tests', '--skip-test', '--uninstall'];
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-larger-follow-gap.cjs [--dry-run] [--skip-tests] [--uninstall]');
  readTarget('src/runtime/widget.tsx', true);
  const writes = [], seen = new Set();
  for (const entry of payload.entries) {
    if (seen.has(entry.file)) throw new Error('Duplicate patch path: ' + entry.file);
    seen.add(entry.file);
    if (skipTests && entry.test) continue;
    const current = readTarget(entry.file, true);
    let text = normalize(current.bytes.toString('utf8'));
    const blocks = uninstall ? [...entry.blocks].reverse() : entry.blocks;
    for (const block of blocks) text = transformBlock(text, block, uninstall);
    if (uninstall && entry.absentAfterUninstall && entry.absentAfterUninstall.some(marker => text.includes(marker))) {
      conflict(entry.file + ' (edited native selection references remain)');
    }
    if (!uninstall && entry.requiredOccurrences && entry.requiredOccurrences.some(rule => count(text, rule.text) !== rule.count)) {
      conflict(entry.file + ' (organization filter references differ)');
    }
    if (text !== normalize(current.bytes.toString('utf8'))) writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(text, current.bytes) });
  }
  for (const module of payload.modules) {
    if (seen.has(module.file)) throw new Error('Duplicate patch path: ' + module.file);
    seen.add(module.file);
    if (skipTests && module.test) continue;
    const current = readTarget(module.file);
    if (current.bytes !== null) {
      if (normalize(current.bytes.toString('utf8')) !== normalize(module.content)) conflict(module.file + ' (existing module)');
      if (uninstall) writes.push({ ...current, relative: module.file, original: current.bytes, content: null });
    } else if (!uninstall) {
      writes.push({ ...current, relative: module.file, original: null, content: Buffer.from(module.content) });
    }
  }
  console.log('Existing tests are preserved. This installer does not run tests.');
  if (!writes.length) {
    console.log(uninstall ? 'Larger follow gap is already uninstalled. No files changed.' : 'Larger follow gap is already installed. No files changed.');
    process.exit(0);
  }
  if (dry) {
    console.log('Dry run passed. Would ' + (uninstall ? 'uninstall' : 'install') + ':\n' + writes.map(item => '  ' + (item.content === null ? 'remove ' : item.original === null ? 'create ' : 'update ') + item.relative).join('\n'));
    process.exit(0);
  }
  // Complete every source guard before creating a backup or changing source files.
  for (const item of writes) assertUnchanged(item);
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
  const manifest = writes.map(item => ({ file: item.relative, operation: item.content === null ? 'remove' : item.original === null ? 'create' : 'update', originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) }));
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'larger-follow-gap', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
  for (const item of writes) assertUnchanged(item);
  try {
    for (const item of writes) {
      assertUnchanged(item);
      if (item.content === null) {
        targetFor(item.relative);
        fs.unlinkSync(item.file);
        item.started = true;
      } else if (item.original === null) {
        ensureParents(item.relative);
        const descriptor = fs.openSync(targetFor(item.relative), 'wx');
        const stat = fs.fstatSync(descriptor);
        item.createdDev = stat.dev; item.createdIno = stat.ino; item.started = true;
        try { fs.writeFileSync(descriptor, item.content); } finally { fs.closeSync(descriptor); }
      } else overwriteOriginal(item, item.content);
    }
  } catch (error) {
    const errors = rollback(writes);
    if (errors.length) throw new Error(error.message + '\nRollback needs attention; original bytes are in ' + backupRelative + ':\n' + errors.join('\n'));
    throw new Error(error.message + '\nInstaller writes rolled back. Original source files restored. Backup: ' + backupRelative);
  }
  console.log('Larger follow gap ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Follow gap is now 12%, capped at 64 pixels; animation timing is unchanged.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
