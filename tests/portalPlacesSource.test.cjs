const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const root=path.resolve(__dirname,'../src'),cache=new Map();function load(file){if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);new Function('exports','require',ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports,id=>load(path.relative(root,path.resolve(root,path.dirname(file),id+'.ts'))));return m.exports;}
const source=load('features/places/placesSource.ts'),portal=load('features/places/PortalPlacesSource.ts'),{PlacesVectorLayer}=load('features/places/PlacesVectorLayer.ts');
const tiles='https://portal.example.com/server/rest/services/Hosted/Places/VectorTileServer',query='https://portal.example.com/server/rest/services/Hosted/Places/FeatureServer/0';
const attributes={gers_id:'place-1',place_name:'Test café',category:'cafe',icon_group:'cafe',confidence:.75,operating_status:'open',address:'One Street',website:'https://example.com/',data_release:'2026-10-21.0'};
const record=()=>({attributes:{...attributes},geometry:{x:-86.15,y:39.77}});
function metadata(){return{geometryType:'esriGeometryPoint',capabilities:'Query',objectIdField:'OBJECTID',fields:[{name:'OBJECTID',type:'esriFieldTypeOID'},...portal.PORTAL_PLACE_FIELDS.map(name=>({name,type:name==='confidence'?'esriFieldTypeDouble':'esriFieldTypeString'}))],maxRecordCount:2000,advancedQueryCapabilities:{supportsPagination:true,supportsOrderBy:true},extent:{xmin:-87,ymin:39,xmax:-85,ymax:41,spatialReference:{wkid:4326}}}}
function style(){return{version:8,metadata:{'mly:places':{version:1,queryUrl:query,fields:[...portal.PORTAL_TILE_FIELDS],sourceLayers:['places'],release:'2026-10-21.0'}},layers:[{id:'icons',type:'symbol','source-layer':'places',layout:{'icon-image':'{icon_group}','icon-allow-overlap':false},filter:['==','kind','poi']},{id:'labels',type:'symbol','source-layer':'places',layout:{'text-field':'{_name}'}}]}}
// Independent protobuf fixture with string and double values.
function fixture(props=attributes,layerName='places'){const v=n=>{const a=[];do{const b=n%128;n=Math.floor(n/128);a.push(b+(n?128:0))}while(n);return Buffer.from(a)},f=(id,b)=>Buffer.concat([v(id*8+2),v(b.length),b]),str=s=>Buffer.from(s);const entries=Object.entries(props);let layer=Buffer.concat([f(1,str(layerName)),...entries.map(([k])=>f(3,str(k))),...entries.map(([,value])=>{if(typeof value==='number'){const b=Buffer.alloc(9);b[0]=25;b.writeDoubleLE(value,1);return f(4,b)}return f(4,f(1,str(value)))})]);const tags=Buffer.concat(entries.map((_,i)=>Buffer.concat([v(i),v(i)])));layer=Buffer.concat([layer,f(2,Buffer.concat([f(2,tags),Buffer.from([24,1])])),Buffer.from([120,2])]);const bytes=f(3,layer);return bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.length)}
function setup(options={}){const calls=[],layers=[],map=[{id:'existing'}],errors=[];let selected=0;
 const request=async(url,opts)=>{calls.push({url,opts});if(opts.signal?.aborted)throw new DOMException('Aborted','AbortError');if(url===query){if(options.queryError)throw options.queryError;return{data:options.metadata||metadata()}};if(url===query+'/query'&&opts.query.returnCountOnly)return{data:{count:options.totalCount??options.sourceFeatureCount}};if(url===query+'/query')return{data:{features:opts.query.resultRecordCount===1?[record()]:options.features||[record()],spatialReference:{wkid:4326},geometryType:'esriGeometryPoint',exceededTransferLimit:options.limited===true}};if(url===tiles&&options.tileMetadata)return{data:options.tileMetadata};if(url===tiles)return{data:{...(options.maxLOD===undefined?{}:{maxLOD:options.maxLOD}),tileInfo:{rows:512,cols:512,origin:{x:-20037508.342789244,y:20037508.342789244},spatialReference:{wkid:3857},lods:[{level:15},{level:17},{level:19}]}}};if(url.startsWith(tiles+'/tile/'))return{data:options.clusterTile?fixture(options.clusterTile,'places_clusters'):fixture(options.tileAttributes||attributes)};throw Error('Unexpected URL '+url)};
 class Tiles{constructor(p){Object.assign(this,p);this.currentStyleInfo={style:style()};if(options.clusters){this.currentStyleInfo.style.metadata['mly:places'].clusters=options.clusters;this.currentStyleInfo.style.layers.push({id:'mly-place-clusters',type:'circle','source-layer':'places_clusters'},{id:'mly-place-cluster-counts',type:'symbol','source-layer':'places_clusters',layout:{'text-field':'{n_all}'}})}if(options.sourceFeatureCount!==undefined)this.currentStyleInfo.style.metadata['mly:places'].sourceFeatureCount=options.sourceFeatureCount;layers.push(this)}async load(){if(options.loadError)throw options.loadError;if(options.hold)await options.hold()}setStyleLayer(l){const i=this.currentStyleInfo.style.layers.findIndex(x=>x.id===l.id);this.currentStyleInfo.style.layers[i]=l}destroy(){this.destroyed=true}}
 const backend=new portal.PortalPlacesSource(tiles,query,request),view={ready:true,stationary:true,zoom:16,map:{add:l=>map.push(l),remove:l=>{const i=map.indexOf(l);if(i!==-1)map.splice(i,1)}},watch(){return{remove(){}}},toMap:p=>({...p,spatialReference:{wkid:3857}}),toScreen:()=>({x:100,y:100})};
 const renderer=new PlacesVectorLayer({portal:backend,view,modules:{VectorTileLayer:Tiles,Point:class{constructor(p){Object.assign(this,p)}},get FeatureLayer(){throw Error('FeatureLayer construction forbidden')}},selected(){selected++},error:e=>errors.push(e)});
 return{backend,renderer,calls,layers,map,errors,view,request,Tiles};}
test('new apps default to Portal; existing external settings and explicit source changes remain predictable',()=>{
 assert.equal(source.placesSourceKind({}),'portal');assert.equal(source.placesSourceKind({placesApiUrl:'https://example.com/places'}),'external');assert.equal(source.placesSourceKind({placesSource:'portal',placesApiUrl:'https://example.com/places'}),'portal');assert(source.placesSourceKey({placesPortalTilesUrl:tiles,placesPortalQueryUrl:query}));assert.equal(source.placesSourceKey({placesPortalTilesUrl:tiles}),null);
 for(const value of ['http://example.com/VectorTileServer',tiles+'?token=secret',tiles+'#a','https://name:pass@example.com/VectorTileServer',tiles+'/resources/styles/root.json'])assert.equal(source.portalPlacesUrl(value,'tiles'),null);
 assert.equal(source.portalPlacesUrl(query+'/', 'query'),query);
});
test('Portal connection validates schema, real query syntax, style pairing and actual MVT attributes',async()=>{
 const h=setup();const result=await h.backend.test(new h.Tiles({}),new AbortController().signal);assert.equal(result.release,'2026-10-21.0');assert(h.calls.some(c=>c.opts.responseType==='array-buffer'));assert(h.calls.some(c=>c.opts.query?.where?.includes('UPPER(')));assert.equal(h.map.length,1);
 for(const change of [m=>m.fields.pop(),m=>m.advancedQueryCapabilities.supportsPagination=false,m=>m.maxRecordCount=199,m=>m.geometryType='esriGeometryPolygon']){const m=metadata();change(m);assert.throws(()=>portal.validatePortalPlacesLayer(m));}
 const broken=setup({tileAttributes:{...attributes,confidence:.1}});await assert.rejects(broken.backend.test(new broken.Tiles({}),new AbortController().signal),/attributes differ/);
 const wrong=style();wrong.metadata['mly:places'].queryUrl=query.replace('/0','/1');assert.throws(()=>h.backend.validateStyle(wrong),/matching query URL/);
});
test('native Portal rendering, filtered queries, 200-row paging, dense picks and cleanup stay bounded',async()=>{
 const h=setup();try{await h.renderer.start(tiles,query);assert.equal(h.map.length,2);assert.equal(h.map[0].id,'existing');assert.equal(h.calls.filter(c=>c.opts.responseType==='array-buffer').length,1);
 await h.renderer.setFamily('cafe');await h.renderer.setQuality(.7,true);assert.equal(h.map.length,2);assert(h.layers.slice(0,-1).every(l=>l.destroyed));
 const filter=h.layers.at(-1).currentStyleInfo.style.layers[0].filter;assert.equal(filter[0],'all');assert(JSON.stringify(filter).includes('confidence'));assert.deepEqual(h.renderer.quality,{minimum:.7,hideClosed:true});
 const page=await h.renderer.queryArea([-87,39,-85,41],new AbortController().signal,null,200,"O'Brien_50%");assert.equal(page.offset,200);const q=h.calls.at(-1).opts.query;assert.equal(q.resultRecordCount,200);assert.equal(q.resultOffset,200);assert.equal(q.orderByFields,'OBJECTID ASC');assert(q.where.includes("O''BRIEN\\_50\\%"));assert(q.where.includes("icon_group = 'cafe'"));assert(q.where.includes('confidence >= 0.7'));assert(q.where.includes('operating_status IS NULL'));
 await h.renderer.resolve({x:100,y:100});assert.equal(h.calls.at(-1).opts.query.resultRecordCount,32);
 assert.equal(h.calls.filter(c=>c.opts.responseType==='array-buffer').length,1,'sample verified only once per source');
 }finally{h.renderer.stop()}assert.equal(h.map.length,1);
 const dense=setup({limited:true});try{await dense.renderer.start(tiles,query);assert.equal(await dense.renderer.resolve({x:100,y:100}),null);assert(dense.errors.some(e=>e.code==='dense'))}finally{dense.renderer.stop()}
});
test('Portal cancellation cannot attach late tiles; invalid queries and packages fail closed',async()=>{
 let release;const h=setup({hold:()=>new Promise(r=>release=r)});const pending=h.renderer.start(tiles,query);await new Promise(r=>setImmediate(r));h.renderer.stop();release();await assert.rejects(pending,{name:'AbortError'});assert.equal(h.map.length,1);assert(h.layers.every(l=>l.destroyed));
 const b=setup({tileAttributes:{gers_id:'different'}});await assert.rejects(b.renderer.start(tiles,query),/not retained/);assert.equal(b.map.length,1);assert(b.layers.every(l=>l.destroyed));
 await assert.rejects(b.backend.queryArea([-87,39,-85,41],new AbortController().signal,null,3),/offset/);
 assert.throws(()=>portal.portalPlacesWhere({family:"cafe' OR 1=1",minimum:null,hideClosed:false}),/filters/);
});

test('restored packages validate the full query count and request only an actually cached LOD',async()=>{
 const h=setup({sourceFeatureCount:1,totalCount:1,maxLOD:15});await h.backend.test(new h.Tiles({}),new AbortController().signal);
 const count=h.calls.find(c=>c.opts.query?.returnCountOnly);assert(count);assert.equal(count.opts.query.where,'1=1');
 const tile=h.calls.find(c=>c.opts.responseType==='array-buffer');assert(tile.url.includes('/tile/15/'),'use cached maxLOD 15, not the scheme-only level 19');
 const mismatch=setup({sourceFeatureCount:50,totalCount:7089});await assert.rejects(mismatch.backend.test(new mismatch.Tiles({}),new AbortController().signal),/different place counts/);
 assert.equal(mismatch.calls.filter(c=>c.opts.responseType==='array-buffer').length,0);
 const invalid=style();invalid.metadata['mly:places'].sourceFeatureCount=0;assert.throws(()=>h.backend.validateStyle(invalid),/source feature count/);
});

test('incomplete authenticated service metadata is identified before native layer loading',async()=>{
 const h=setup({tileMetadata:{currentVersion:12.1,capabilities:'TilesOnly,Tilemap',minLOD:14,maxLOD:15}});
 await assert.rejects(h.backend.test(new h.Tiles({}),new AbortController().signal),/tileInfo is missing/);
 assert.equal(h.calls.filter(c=>c.opts.responseType==='array-buffer').length,0);
});
test('SDK request and style failures report stages/statuses without leaking tokens or raw URLs',async()=>{
 const secret='sensitive-token-value';
 const h=setup({queryError:{details:{httpStatus:200,raw:{code:499,message:'token='+secret},url:'https://p.example/?token='+secret}}});
 await assert.rejects(h.backend.test(new h.Tiles({}),new AbortController().signal),e=>e instanceof portal.PortalPlacesConfigurationError&&e.message.includes('Query-layer metadata')&&e.message.includes('499')&&!e.message.includes(secret));
 const b=setup({loadError:{details:{httpStatus:404,url:'https://p.example/?token='+secret},message:secret}});
 await assert.rejects(b.backend.test(new b.Tiles({}),new AbortController().signal),e=>e.message.includes('Vector tile style/resources')&&e.message.includes('404')&&!e.message.includes(secret));
 const wrapped=new portal.PortalPlacesSource(tiles,query,{default:setup().request});
 await wrapped.metadata(new AbortController().signal);
 assert.throws(()=>new portal.PortalPlacesSource(tiles,query,{}),/request module is unavailable/);
 const owned=new portal.PortalPlacesConfigurationError('Missing schema field');assert.equal(portal.portalPlacesFailure('stage',owned),owned);
});

test('Portal text search uses supported SQL and preserves category labels and literal escaping',()=>{
 const where=portal.portalPlacesWhere(portal.PORTAL_DEFAULT_FILTERS,'historic site');
 assert(!where.includes('REPLACE('));
 assert(where.includes("UPPER(category) LIKE '%HISTORIC\\_SITE%'"));
 assert(where.includes("UPPER(place_name) LIKE '%HISTORIC SITE%'"));
 const escaped=portal.portalPlacesWhere(portal.PORTAL_DEFAULT_FILTERS,"O'Brien_50%");
 assert(escaped.includes("O''BRIEN\\_50\\%"));
});

test('Portal map hides name layers without removing icons, filters or published style settings',async()=>{
 const h=setup();await h.backend.configureLayer(new h.Tiles({}),portal.PORTAL_DEFAULT_FILTERS,new AbortController().signal);
 const layers=h.layers[0].currentStyleInfo.style.layers;
 assert.equal(layers.find(l=>l.id==='labels').layout.visibility,'none');
 assert.equal(layers.find(l=>l.id==='icons').layout['icon-image'],'{icon_group}');
 assert.equal(layers.find(l=>l.id==='icons').layout['icon-allow-overlap'],false);
 assert(layers.every(l=>l.filter));
 const layer=new h.Tiles({});layer.currentStyleInfo.style.layers[0].layout['text-field']='{place_name}';
 await h.backend.configureLayer(layer,portal.PORTAL_DEFAULT_FILTERS,new AbortController().signal);
 assert.equal(layer.currentStyleInfo.style.layers[0].layout['text-field'],undefined);
 assert.equal(layer.currentStyleInfo.style.layers[0].layout['icon-optional'],true);
});

const clusterContract=()=>({version:1,layer:'places_clusters',cells:8,minzoom:14,maxzoom:16,cachedMaxZoom:15,scoreBlockSize:32,scores:[0,.75,.800001]});
test('cluster counts preserve exact thresholds, category, nulls and closed status',()=>{
 const c=clusterContract(),props={n_all:5,o_all:4,n_cafe:3,o_cafe:2,h_all_0:1,h_all_1:2,h_all_2:1,j_all_0:1,j_all_1:1,j_all_2:1,h_cafe_2:1};
 assert.equal(portal.portalClusterCount(c,{family:'all',minimum:null,hideClosed:false},props),5);
 assert.equal(portal.portalClusterCount(c,{family:'all',minimum:.750001,hideClosed:false},props),1);
 assert.equal(portal.portalClusterCount(c,{family:'cafe',minimum:.8,hideClosed:false},props),1);
 assert.equal(portal.portalClusterCount(c,{family:'all',minimum:1,hideClosed:false},props),0);
 const huge={scores:Array.from({length:8192},(_,i)=>i/8192)};
 assert(portal.portalClusterCountKeys(huge,{family:'all',minimum:.00001,hideClosed:true}).length<290);
});
test('cluster labels survive readability filtering, maxScale is cleared and cluster picks stay on bounded tiles',async()=>{
 const options={clusters:clusterContract()},h=setup(options);const layer=new h.Tiles({});
 await h.backend.configureLayer(layer,portal.PORTAL_DEFAULT_FILTERS,new AbortController().signal);
 assert.equal(layer.maxScale,0);assert.equal(layer.currentStyleInfo.style.layers.find(l=>l.id==='labels').layout.visibility,'none');
 const counts=layer.currentStyleInfo.style.layers.find(l=>l.id==='mly-place-cluster-counts');assert.equal(counts.layout['text-field'],'{n_all}');assert.notEqual(counts.layout.visibility,'none');
 const x=4250,y=6217,z=14,cx=4,cy=4,px=(x+(cx+.5)/8)/2**z,py=(y+(cy+.5)/8)/2**z;
 const lon=px*360-180,lat=Math.atan(Math.sinh(Math.PI*(1-2*py)))*180/Math.PI;
 options.clusterTile={tile_z:z,tile_x:x,tile_y:y,cell_x:cx,cell_y:cy,n_all:1,o_all:1};
 const geometry={xmin:lon-.00001,xmax:lon+.00001,ymin:lat-.00001,ymax:lat+.00001,spatialReference:{wkid:4326}},signal=new AbortController().signal;
 let result=await h.backend.queryPick(geometry,signal,{zoom:15});assert.equal(result.features[0].attributes.cluster_count,1);
 const calls=h.calls.length;await h.backend.queryPick(geometry,signal,{zoom:15});assert.equal(h.calls.length,calls,'cluster tiles cached');
 await h.backend.queryPick(geometry,signal,{zoom:18.4});assert(h.calls.at(-1).url.endsWith('/query'));
 const low=await h.backend.queryPick(geometry,signal,{zoom:10});assert.equal(low.features.length,0);
});
