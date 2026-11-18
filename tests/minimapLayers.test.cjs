const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
function compile(s){return ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;}
const constants={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/utils/constants.ts','utf8')))(constants,constants.exports);
const m={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/minimap/minimapLayers.ts','utf8')))(()=>constants.exports,m,m.exports);const {buildMinimapLayers}=m.exports;
const golden=JSON.parse(fs.readFileSync(__dirname+'/fixtures/minimapLayers.baseline.json'));
const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),a=source.indexOf('      const layersToAdd = buildMinimapLayers<'),b=source.indexOf('      minimap.addMany(layersToAdd);',a);assert(a>0&&b>a);
const params=['VectorTileLayer','TILE_URLS','STYLE_SOURCE_IDS','STYLE_LAYER_IDS','console'];
const previous=new Function(...params,compile(golden.body+'return layersToAdd;'));
const adapter=new Function(...params,'buildMinimapLayers',compile(source.slice(a,b)+'return layersToAdd;'));
function execute(old,{active=[true,true,true],missing=false,failClone=-1,failCoverage=false,cyclic=-1,undefinedStyle=-1,failReader=-1,late=false,warnFail=false}={}){
 const calls=[],w={accessToken:'initial-token'},styles=[0,1,2].map(i=>({version:8,tag:i,layers:[{id:'layer-'+i,paint:{color:'green'}}]})),properties=['mapillaryVTLayer','mapillaryTrafficSignsLayer','mapillaryObjectsLayer'];
 if(cyclic>=0)styles[cyclic].self=styles[cyclic];if(undefinedStyle>=0)styles[undefinedStyle]=undefined;
 const layers=styles.map(style=>({style}));
 const mainLayers={includes:layer=>{const i=layers.indexOf(layer);calls.push(['includes',i]);return i>=0&&active[i];}};
 w.state={jimuMapView:{view:{map:{layers:mainLayers}}}};
 properties.forEach((name,i)=>Object.defineProperty(w,name,{get(){calls.push(['read',i]);if(i===failReader)throw Error('reader failed');return missing?null:layers[i];}}));
 let clones=0;
 class VectorTileLayer{constructor(options){const coverage=options.opacity===.8;calls.push(['construct',coverage?'coverage':'copy',options]);if(coverage&&failCoverage||!coverage&&clones++===failClone)throw Error('constructor failed');Object.assign(this,options);if(!coverage&&late)w.accessToken='late-token';}}
 const logging={warn:(...args)=>{calls.push(['warning',...args.map(v=>v instanceof Error?v.message:v)]);if(warnFail)throw Error('warning failed');}};
 const {TILE_URLS,STYLE_SOURCE_IDS,STYLE_LAYER_IDS}=constants.exports;let result,error;
 try{result=old?previous.call(w,VectorTileLayer,TILE_URLS,STYLE_SOURCE_IDS,STYLE_LAYER_IDS,logging):adapter.call(w,VectorTileLayer,TILE_URLS,STYLE_SOURCE_IDS,STYLE_LAYER_IDS,logging,buildMinimapLayers);}catch(e){error=e.message;}
 if(result){for(const layer of result){assert(!layers.includes(layer));for(const style of styles)assert.notEqual(layer.style,style);}}
 return {result:result?.map(layer=>({style:layer.style,opacity:layer.opacity})),error,calls};
}
function compare(options){const old=execute(true,options),actual=execute(false,options);assert.deepEqual(actual,old);return actual;}
for(let mask=0;mask<8;mask++)test('active layer mask '+mask,()=>{const active=[0,1,2].map(i=>!!(mask&(1<<i))),r=compare({active});assert.equal(r.result.length,active.filter(Boolean).length+1);assert.equal(r.result.at(-1).opacity,.8);});
test('absent layers still produce native minimap coverage',()=>assert.equal(compare({missing:true}).result.length,1));
for(const index of [0,1,2])test('copy constructor failure '+index+' preserves later attempts',()=>assert.equal(compare({failClone:index}).result.length,3));
for(const cyclic of [0,1,2])test('cyclic style '+cyclic+' is skipped silently',()=>assert.equal(compare({cyclic}).result.length,3));
for(const undefinedStyle of [0,1,2])test('undefined style '+undefinedStyle+' retains silent skip',()=>assert.equal(compare({undefinedStyle}).result.length,3));
for(const failReader of [0,1,2])test('layer getter failure '+failReader+' retains propagation',()=>assert.equal(compare({failReader}).error,'reader failed'));
test('native coverage failure retains warning and existing copies',()=>{const r=compare({failCoverage:true});assert.equal(r.result.length,3);assert.equal(r.calls.filter(c=>c[0]==='warning').length,1);});
test('warning callback failure retains propagation',()=>assert.equal(compare({failCoverage:true,warnFail:true}).error,'warning failed'));
test('token is read after copying the active layers',()=>{const r=compare({late:true});const style=r.result.at(-1).style;assert(Object.values(style.sources)[0].tiles[0].endsWith('access_token=late-token'));});
test('native point context and style IDs retain original values',()=>{const r=compare({active:[false,false,false]}),coverage=r.result[0];const image=coverage.style.layers.find(l=>l.type==='circle');assert.equal(image.paint['circle-opacity'],1);assert.equal(image.paint['circle-stroke-opacity'],1);assert.equal(image.paint['circle-radius'],2);});
test('map insertion and tracking reordering stay after construction and readiness',()=>{const ready=source.lastIndexOf('if (!current() || this.minimapView !== view || view.destroyed) return;',a),remove=source.indexOf('minimap.remove(this.minimapGraphicsLayer)',b),add=source.indexOf('minimap.add(this.minimapGraphicsLayer)',remove),track=source.indexOf('this.updateMinimapTracking()',add);assert(ready>0&&ready<a&&remove>b&&add>remove&&track>add);});
