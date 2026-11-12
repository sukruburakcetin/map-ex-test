const fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const root=path.resolve(__dirname,'../src');
function load(name){const m={exports:{}};new Function('exports',ts.transpileModule(fs.readFileSync(path.join(root,name),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports);return m.exports;}
const {placesAreaProfile,placesAreaSlug,placesAreaExtent,activePlacesAreaView}=load('features/places/placesAreaProfile.ts');
const {projectPlacesArea,createPlacesAreaPreview}=load('features/places/placesAreaPreview.ts');
test('profiles preserve the map rectangle and publishing mode without URLs or credentials',()=>{
 const p=placesAreaProfile('İstanbul operations',[28.9,40.9,29.1,41.1],'portal');assert.equal(p.output_directory,'places-data/istanbul-operations/portal');assert.equal(p.release,'latest');assert.deepEqual(p.bbox,[28.9,40.9,29.1,41.1]);assert(!JSON.stringify(p).includes('https:'));
 for(const bbox of [[170,0,-170,1],[-190,0,0,1],[0,0,NaN,1]])assert.throws(()=>placesAreaProfile('Area',bbox,'portal'));
 assert.throws(()=>placesAreaProfile('',[0,0,1,1],'portal'));assert.equal(placesAreaSlug('中文'),'places-area');
});
test('selection converts Web Mercator and rejects unstable, 3D and unsupported maps',()=>{
 const extent={xmin:1,ymin:2,xmax:3,ymax:4,spatialReference:{wkid:3857}},view={ready:true,type:'2d',stationary:true,extent};assert.deepEqual(placesAreaExtent(view,()=>({xmin:28.9,ymin:40.9,xmax:29.1,ymax:41.1})),[28.9,40.9,29.1,41.1]);
 for(const change of [{ready:false},{stationary:false},{type:'3d'},{destroyed:true},{extent:{...extent,spatialReference:{wkid:32635}}}])assert.throws(()=>placesAreaExtent({...view,...change},x=>x));
});
test('ambiguous map groups never guess which view is active',()=>{
 const a={id:'a',view:{}},b={id:'b',isActive:true,view:{}};assert.equal(activePlacesAreaView({jimuMapViews:{a,b}}),b.view);assert.equal(activePlacesAreaView({activeViewId:'a',jimuMapViews:{a,b}}),a.view);assert.equal(activePlacesAreaView({jimuMapViews:{a:{view:{}},b:{view:{}}}}),null);
});
function mapView(){
 const view={ready:true,type:'2d',stationary:true,width:400,height:300,extent:{xmin:28.9,ymin:40.9,xmax:29.1,ymax:41.1,spatialReference:{wkid:4326}},map:{add(){throw Error('No map-layer mutation allowed')},remove(){throw Error('No map-layer mutation allowed')}},goTo(){throw Error('No camera movement allowed')}};
 view.toScreen=p=>({x:(p.x-view.extent.xmin)/(view.extent.xmax-view.extent.xmin)*view.width,y:(view.extent.ymax-p.y)/(view.extent.ymax-view.extent.ymin)*view.height});return view;
}
test('projection follows real map coordinates and distinguishes visible/inside/outside boundaries',()=>{
 const view=mapView(),extent={...view.extent};assert.equal(projectPlacesArea(view,extent).state,'visible');
 view.extent={...extent,xmin:28.95,xmax:29.05,ymin:40.95,ymax:41.05};assert.equal(projectPlacesArea(view,extent).state,'inside');
 view.extent={...extent,xmin:30,xmax:31};assert.equal(projectPlacesArea(view,extent).state,'outside');
 assert.equal(projectPlacesArea({...view,toScreen:()=>null},extent).state,'unavailable');assert.deepEqual(extent,{xmin:28.9,ymin:40.9,xmax:29.1,ymax:41.1,spatialReference:{wkid:4326}});
});
const text=fs.readFileSync(path.join(root,'setting/setting.tsx'),'utf8'),sf=ts.createSourceFile('setting.tsx',text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cls=sf.statements.find(ts.isClassDeclaration),names=new Set(['placesAreaPreview','placesAreaView','placesAreaRevision','showPlacesArea','clearPlacesArea','capturePlacesArea','downloadPlacesArea']);
const members=cls.members.filter(n=>n.name&&names.has(n.name.getText(sf))).map(n=>n.getText(sf)).join('\n');
function fixture({hold=false,fail=false}={}){
 const events=[],previews=[],view=mapView(),group={jimuMapViews:{one:{id:'one',isActive:true,view}}};let release;
 const load=async names=>{events.push(names);if(hold)await new Promise(r=>release=r);if(fail)throw Error('https://example.com/?token=secret');return[{webMercatorToGeographic:e=>e}]};
 const create=(v,extent,options)=>{const p={active:true,refresh(){const state=projectPlacesArea(v,extent).state;options.onState?.(state);return state},destroy(){p.active=false}};previews.push(p);return p};
 const out={exports:{}};new Function('exports','MapViewManager','loadArcGISJSAPIModules','placesAreaExtent','placesAreaProfile','placesSourceKind','activePlacesAreaView','placesAreaSlug','createPlacesAreaPreview',ts.transpileModule('export class Fixture{'+members+'}',{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(out.exports,{getInstance:()=>({getJimuMapViewGroup:()=>group})},load,placesAreaExtent,placesAreaProfile,c=>c.placesSource,activePlacesAreaView,placesAreaSlug,create);
 const w=new out.exports.Fixture();w.props={id:'w',useMapWidgetIds:['map'],config:{placesSource:'portal'}};w.context={owned:s=>s};w.state={placesAreaName:'Istanbul',placesAreaProfile:null};w.setState=p=>Object.assign(w.state,p);return {w,view,previews,events,release:()=>release?.(),tick:()=>new Promise(r=>setImmediate(r))};
}
test('Use and Show preserve camera/extent and repeated captures have one preview owner',async()=>{
 const h=fixture(),before=JSON.stringify(h.view.extent);await h.w.capturePlacesArea();h.w.showPlacesArea();assert.equal(JSON.stringify(h.view.extent),before);assert.deepEqual(h.events,[['esri/geometry/support/webMercatorUtils']]);
 assert.deepEqual(h.w.state.placesAreaProfile.bbox,[28.9,40.9,29.1,41.1]);await h.w.capturePlacesArea();assert.equal(h.previews.filter(p=>p.active).length,1);h.w.clearPlacesArea();assert.equal(h.previews.filter(p=>p.active).length,0);
 const pending=fixture({hold:true}),work=pending.w.capturePlacesArea();await pending.tick();pending.w.clearPlacesArea();pending.release();await work;assert.equal(pending.previews.length,0);
});
test('SDK failures cannot leak raw URLs or tokens',async()=>{const h=fixture({fail:true});await h.w.capturePlacesArea();assert(!h.w.state.placesAreaError.includes('token'));assert.equal(h.previews.length,0)});
test('profile download uses the original reviewed rectangle and current name/source',async()=>{
 const h=fixture();await h.w.capturePlacesArea();h.w.state.placesAreaName='Regional operations';h.w.props.config.placesSource='external';const previous={document:global.document,URL:global.URL,setTimeout:global.setTimeout};let blob,anchor;
 try{global.URL={createObjectURL:b=>(blob=b,'blob:test'),revokeObjectURL(){}};global.setTimeout=()=>{};global.document={body:{appendChild:a=>anchor=a},createElement:()=>({style:{},click(){},remove(){}})};h.w.downloadPlacesArea();const p=JSON.parse(await blob.text());assert.equal(p.name,'Regional operations');assert.equal(p.source,'external');assert.equal(anchor.download,'regional-operations.places-area.json');assert.deepEqual(p.bbox,[28.9,40.9,29.1,41.1]);}finally{Object.assign(global,previous)}
});
test('screen overlay uses the map owner document and cleans DOM and map watchers',()=>{
 const made=[];let removed=0;
 const doc={createElement:tag=>new Element(tag),createElementNS:(ns,tag)=>new Element(tag,ns)};
 class Element{constructor(tag,ns){Object.assign(this,{tag,namespaceURI:ns||null,ownerDocument:doc,style:{},attributes:{},children:[],isConnected:true});made.push(this)}setAttribute(k,v){this.attributes[k]=v}appendChild(child){if(child.parentNode)child.remove();this.children.push(child);child.parentNode=this}append(...children){children.forEach(c=>this.appendChild(c))}remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(c=>c!==this);this.parentNode=null}querySelector(){return null}getBoundingClientRect(){return{width:400,height:300}}}
 const view=mapView();view.container=new Element('map');const callbacks=[];view.watch=(_,fn)=>(callbacks.push(fn),{remove(){removed++}});const initial=JSON.stringify(view.extent),extent={...view.extent};
 const labels={visible:'Saved',inside:'Inside',outside:'Outside',unavailable:'Unavailable'};const p=createPlacesAreaPreview(view,extent,{labels});assert.equal(p.refresh(),'visible');assert.equal(view.container.children.length,1);assert(made.every(e=>e.ownerDocument===doc));
 assert.equal(view.container.children[0].style.pointerEvents,'none');assert.equal(JSON.stringify(view.extent),initial);view.extent={...extent,xmin:30,xmax:31};callbacks[0]();assert.equal(p.refresh(),'outside');p.destroy();p.destroy();assert.equal(view.container.children.length,0);assert.equal(removed,6);
});

test('a hidden cached Builder view cannot steal area selection from the visible map',()=>{
 const hidden={view:{container:{getBoundingClientRect:()=>({width:0,height:0})}}},visible={isActive:true,view:{container:{isConnected:true,getBoundingClientRect:()=>({width:400,height:300})}}};
 assert.equal(activePlacesAreaView({getActiveJimuMapView:()=>hidden,jimuMapViews:{hidden,visible}}),visible.view);
 assert.equal(activePlacesAreaView({getActiveJimuMapView:()=>hidden,jimuMapViews:{hidden}}),null);
});
