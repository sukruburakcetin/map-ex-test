const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const root=path.resolve(__dirname,'..'),compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
function load(rel){const m={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(path.join(root,'src',rel+'.ts'),'utf8')))(id=>load(path.posix.normalize(path.posix.join(path.posix.dirname(rel),id))),m,m.exports);return m.exports;}
const {ZOOM,TILE_URLS,DEFAULT_FILTER_LABELS}=load('utils/constants'),{turboTiles,turboFootprintBboxes}=load('utils/turboCoverageUtils'),{lonLatToWebMercator}=load('utils/geoUtils');
const {renderMapFeatureHoverLabel,renderImageryHoverCard,positionImageryHoverCard}=load('features/imagery/hoverCard');
const source=fs.readFileSync(path.join(root,'src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget'),method=widget.members.find(n=>n.name?.getText(sf)==='pickMapFeature').getText(sf);
let reads=0;const feature={extent:4096,properties:{id:'feature-1',value:'object--support--utility-pole'},loadGeometry:()=>[[{x:0,y:0}]]};
const Runtime=new Function('ZOOM','TILE_URLS','DEFAULT_FILTER_LABELS','turboTiles','turboFootprintBboxes','lonLatToWebMercator','VectorTile','Pbf','TurboSpatialIndex','formatTrafficSignName','objectNameMap',compile('class Runtime{'+method+'}')+';return Runtime;')(ZOOM,TILE_URLS,DEFAULT_FILTER_LABELS,turboTiles,turboFootprintBboxes,lonLatToWebMercator,class{constructor(){const layer={length:1,feature:()=>{reads++;return feature;}};this.layers={traffic_sign:layer,point:layer};}},class{},class{static bytes(){return 0;}},v=>'Sign '+v,{});
for(const type of ['2d','3d'])for(const kind of ['signs','objects'])for(const zoom of [13.999,13.99999,14,16])test(`${type} ${kind}: native feature picking at map zoom ${zoom}`,async()=>{
 reads=0;const w=new Runtime(),layer={visible:true},view={type,zoom,stationary:true,map:{layers:{includes:l=>l===layer}},toMap:()=>({longitude:0,latitude:0,z:100}),toScreen:()=>({x:100,y:100})};
 w.state={jimuMapView:{view},trafficSignsActive:kind==='signs',objectsActive:kind==='objects'};w.mapillaryTrafficSignsLayer=kind==='signs'?layer:null;w.mapillaryObjectsLayer=kind==='objects'?layer:null;w._mapFeatureFilterCodes=new Map();w._mapFeatureTiles={get:()=>new ArrayBuffer(1)};w._mapFeatureIndexes={get:()=>undefined,reserve:()=>false};w.ArcGISModules={Point:class{constructor(p){Object.assign(this,p);}},Graphic:class{constructor(p){Object.assign(this,p);}}};
 const result=await w.pickMapFeature({x:100,y:100},view,new AbortController().signal);
 if(zoom<13.9999){assert.equal(result,null);assert.equal(reads,0);}else{assert.equal(result.graphic.attributes.id,'feature-1');assert.equal(result.layer,layer);assert.equal(reads,1);}
});
test('cancelled or moving views cannot pick a source-zoom-14 feature',async()=>{
 const w=new Runtime(),view={zoom:14,stationary:false};w.state={jimuMapView:{view}};assert.equal(await w.pickMapFeature({x:0,y:0},view,new AbortController().signal),null);view.stationary=true;const controller=new AbortController();controller.abort();assert.equal(await w.pickMapFeature({x:0,y:0},view,controller.signal),null);
});

function documentHost(){
 const doc={defaultView:{innerWidth:500,innerHeight:300},fullscreenElement:null,createElement:tag=>node(tag)};
 function node(tag){return{tag,style:{},children:[],textContent:'',ownerDocument:doc,parentNode:null,attributes:{},setAttribute(k,v){this.attributes[k]=v;},appendChild(child){this.children.push(child);child.parentNode=this;}};}
 doc.body=node('body');const host=node('div');doc.body.appendChild(host);host.measures=0;host.getBoundingClientRect=()=>{host.measures++;const width=Math.min(host.textContent.length*6+26,parseFloat(host.style.maxWidth)||500);return{width,height:Math.ceil((host.textContent.length*6+26)/width)*18+26};};return{doc,host};
}
test('a short feature label replaces the old 240px imagery width and safely displays literal text',()=>{
 const {host}=documentHost();host.style.width='240px';host.style.maxHeight='200px';renderMapFeatureHoverLabel(host,'Pole',{left:0,right:500,top:0,bottom:300},40,40);assert.equal(host.style.width,'max-content');assert.equal(host.textContent,'Pole');assert(host.getBoundingClientRect().width<100);assert.equal(host.attributes.role,'tooltip');
 renderMapFeatureHoverLabel(host,'<img src=x onerror=alert(1)>',{left:0,right:500,top:0,bottom:300},40,40);assert.equal(host.children.length,0);assert.equal(host.textContent,'<img src=x onerror=alert(1)>');
});
test('same label reuses its measurement after pointer clearing; longer labels and narrower maps remeasure and clamp',()=>{
 const {host}=documentHost(),bounds={left:0,right:500,top:0,bottom:300};renderMapFeatureHoverLabel(host,'Pole',bounds,450,270);const firstWidth=parseFloat(host.style.left);assert(firstWidth<450);assert(parseFloat(host.style.top)<270);host.textContent='';host.style.display='none';renderMapFeatureHoverLabel(host,'Pole',bounds,200,100);assert.equal(host.measures,1);
 renderMapFeatureHoverLabel(host,'Warning School-zone G2',bounds,200,100);assert.equal(host.measures,2);renderMapFeatureHoverLabel(host,'Warning School-zone G2',{...bounds,right:150},140,270);assert.equal(host.measures,3);assert.equal(host.style.maxWidth,'142px');assert(parseFloat(host.style.left)>=8);assert.equal(host.style.overflowWrap,'anywhere');renderMapFeatureHoverLabel(host,'Warning School-zone G2',{...bounds,right:150,bottom:150},140,140);assert.equal(host.measures,4);assert.equal(host.style.maxHeight,'142px');
});
test('switching from a feature label back to imagery restores preview dimensions and invalidates label measurement',()=>{
 const {host}=documentHost(),bounds={left:0,right:500,top:0,bottom:300};renderMapFeatureHoverLabel(host,'Pole',bounds,40,40);positionImageryHoverCard(host,bounds,40,40);renderImageryHoverCard(host,{creator:{username:'Example'},captured_at:1700000000000});assert.equal(host.style.width,'240px');assert.equal(host.children.length,3);host.children=[];renderMapFeatureHoverLabel(host,'Pole',bounds,40,40);assert.equal(host.style.width,'max-content');assert.equal(host.measures,2);
});
