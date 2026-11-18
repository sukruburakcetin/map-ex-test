const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
function compile(s){return ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;}
const m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/minimap/minimapViewOptions.ts','utf8')))(m,m.exports);const {buildMinimapViewOptions}=m.exports;
const golden=JSON.parse(fs.readFileSync(__dirname+'/fixtures/minimapViewOptions.baseline.json'));
const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),a=source.indexOf('      this.minimapView = new MapView(buildMinimapViewOptions({'),b=source.indexOf('      const view = this.minimapView;',a);assert(a>0&&b>a);
const previous=new Function('MapView','minimap','ZOOM',compile(golden.body));
const adapter=new Function('MapView','minimap','ZOOM','buildMinimapViewOptions',compile(source.slice(a,b)));
function execute(old,{zoom=15,offset=3,id=null,images=[],failCenter=false,failZoom=false}={}){
 const events=[],center=Object.freeze({longitude:10,latitude:20}),map=Object.freeze({id:'map'}),container=Object.freeze({id:'container'});
 const view={get center(){events.push('center');if(failCenter)throw Error('center failed');return center;},get zoom(){events.push('zoom');if(failZoom)throw Error('zoom failed');return zoom;}};
 const state=Object.freeze({jimuMapView:{view},imageId:id,sequenceImages:Object.freeze(images.map(i=>Object.freeze(i)))});
 const w={get state(){events.push('state');return state;},minimapContainer:{get current(){events.push('container');return container;}}};
 class MapView{constructor(options){events.push('construct');this.options=options;}}
 let error;try{if(old)previous.call(w,MapView,map,{MINIMAP_OFFSET:offset});else adapter.call(w,MapView,map,{MINIMAP_OFFSET:offset},buildMinimapViewOptions);}catch(e){error=e.message;}
 const options=w.minimapView?.options;if(options){assert.equal(options.map,map);assert.equal(options.container,container);if(!id||!images.some(img=>img.id===id))assert.equal(options.center,center);}
 return {options,error,events};
}
function compare(input){const old=execute(true,input),actual=execute(false,input);assert.deepEqual(actual,old);return actual;}
for(const zoom of [0,-1,2,3,5,15,NaN,Infinity])test('fallback zoom '+zoom,()=>{const r=compare({zoom});assert.equal(r.options.zoom,Math.max(3,zoom-3));});
test('matching image determines center and fixed image zoom',()=>{const r=compare({id:'image',images:[{id:'image',lon:1,lat:2}]});assert.deepEqual(r.options.center,[1,2]);assert.equal(r.options.zoom,15);});
test('unmatched image retains main center but image zoom',()=>{const r=compare({id:'missing',images:[{id:'other',lon:1,lat:2}]});assert.equal(r.options.center.longitude,10);assert.equal(r.options.zoom,15);});
test('empty string ID retains fallback path',()=>compare({id:'',images:[{id:'',lon:1,lat:2}]}));
test('numeric/string IDs retain strict matching behavior',()=>compare({id:'42',images:[{id:42,lon:1,lat:2}]}));
test('first duplicate matching image wins',()=>assert.deepEqual(compare({id:'A',images:[{id:'A',lon:1,lat:2},{id:'A',lon:3,lat:4}]}).options.center,[1,2]));
test('image zoom path does not read main-view zoom',()=>{const r=compare({id:'A',failZoom:true});assert.equal(r.error,undefined);assert(!r.events.includes('zoom'));});
test('center read failure retains original boundary',()=>assert.equal(compare({failCenter:true}).error,'center failed'));
test('fallback zoom read failure retains original boundary',()=>assert.equal(compare({failZoom:true}).error,'zoom failed'));
test('options retain constraints, navigation and empty UI',()=>{const o=compare().options;assert.deepEqual(o.ui,{components:[]});assert.deepEqual(o.constraints,{rotationEnabled:true,snapToZoom:true,minZoom:0,maxZoom:20});assert.deepEqual(o.navigation,{mouseWheelZoomEnabled:true,browserTouchPanEnabled:true});});
test('nonfinite image coordinates remain forwarded unchanged',()=>compare({id:'A',images:[{id:'A',lon:NaN,lat:Infinity}]}));
test('varied offsets and image states match prior options and read order',()=>{for(let i=0;i<40;i++)compare({zoom:i/3,offset:i%5,id:i%2?'A':null,images:[{id:'A',lon:i,lat:i/2}]});});
test('each initialization creates fresh mutable option containers',()=>{const state=()=>({jimuMapView:{view:{center:{},zoom:15}},imageId:null,sequenceImages:[]}),input={state,container:()=>null,map:{},zoomOffset:3},a=buildMinimapViewOptions(input),b=buildMinimapViewOptions(input);assert.notEqual(a,b);assert.notEqual(a.ui.components,b.ui.components);assert.notEqual(a.constraints,b.constraints);assert.notEqual(a.navigation,b.navigation);});
