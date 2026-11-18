const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
function compile(s){const r=ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});assert.equal(r.diagnostics.filter(d=>d.category===1).length,0);return r.outputText;}
const m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/routing/routePointGraphic.ts','utf8')))(m,m.exports);
const {createRoutePointGraphic}=m.exports;
const golden=JSON.parse(fs.readFileSync(__dirname+'/fixtures/routePointGraphic.baseline.json'));
const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,99,true,4),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');
const method=widget.members.find(n=>n.name?.getText(sf)==='drawRoutePointMarker').getText(sf);
const Old=new Function(compile('return class Fixture{'+golden.method+'}'));
const Current=new Function('createRoutePointGraphic',compile('return class Fixture{'+method+'}'));
function run(previous,{type='start',viewType='2d',lon=12.3,lat=45.6,existing=true,noView=false,noModules=false,fail}={}){
 const events=[],oldA={id:'old-A'},oldB={id:'old-B'},foreign={id:'foreign'},graphics=[foreign,...(existing?[oldA,oldB]:[])];
 class Point{constructor(properties){events.push(['point',properties]);if(fail==='point')throw Error('point failed');Object.assign(this,properties);}}
 class Graphic{constructor(properties){events.push(['graphic',properties]);if(fail==='graphic')throw Error('graphic failed');Object.assign(this,properties);}}
 const Type=previous?Old():Current(createRoutePointGraphic),w=new Type();
 const view={type:viewType,graphics:{remove:g=>{events.push(['remove',g.id]);const i=graphics.indexOf(g);if(i>=0)graphics.splice(i,1);}}};
 Object.assign(w,{state:{jimuMapView:noView?null:{view}},ArcGISModules:noModules?null:{Graphic,Point},_routePointAGraphic:existing?oldA:null,_routePointBGraphic:existing?oldB:null,_ownedMapResources:{addGraphic:(v,g)=>{assert.equal(v,view);events.push(['own-add']);graphics.push(g);}}});
 let error;try{w.drawRoutePointMarker(type,lon,lat);}catch(e){error=e.message;}
 const target=type==='start'?w._routePointAGraphic:w._routePointBGraphic;
 assert(graphics.includes(foreign));
 if(!noView&&!noModules&&!fail){assert(graphics.includes(target));assert.equal(type==='start'?w._routePointBGraphic:w._routePointAGraphic,existing?(type==='start'?oldB:oldA):null);}
 // Normalize SDK test-instance prototypes; retained identity is asserted separately above.
 return JSON.parse(JSON.stringify({events,error,graphics,target,a:w._routePointAGraphic,b:w._routePointBGraphic},(_,v)=>typeof v==='number'&&!Number.isFinite(v)?String(v):v));
}
function compare(options){const old=run(true,options),actual=run(false,options);assert.deepEqual(actual,old);return actual;}
for(const type of ['start','end'])for(const viewType of ['2d','3d'])for(const existing of [false,true])test(type+' '+viewType+' existing='+existing,()=>{
 const r=compare({type,viewType,existing}),symbol=r.target.symbol;assert.equal(r.target.geometry.spatialReference.wkid,4326);assert.equal(symbol.type,viewType==='3d'?'point-3d':'simple-marker');
 assert.deepEqual(r.events.map(e=>e[0]),existing?['remove','point','graphic','own-add']:['point','graphic','own-add']);
});
for(const flag of ['noView','noModules'])test('missing '+flag+' leaves all graphics untouched',()=>assert.deepEqual(compare({[flag]:true}).events,[]));
for(const fail of ['point','graphic'])test('constructor failure preserves earlier removal/order '+fail,()=>assert.equal(compare({fail}).error,fail+' failed'));
for(const coords of [[0,0],[-180,-90],[180,90],[NaN,Infinity]])test('coordinate semantics '+coords,()=>compare({lon:coords[0],lat:coords[1]}));
test('unknown view types retain 2D marker fallback',()=>assert.equal(compare({viewType:'other'}).target.symbol.type,'simple-marker'));
test('factory creates fresh symbols and geometry for each call',()=>{
 class Point{constructor(p){Object.assign(this,p);}}class Graphic{constructor(p){Object.assign(this,p);}}
 const input={isStart:true,is3D:true,lon:1,lat:2,Graphic,Point},a=createRoutePointGraphic(input),b=createRoutePointGraphic(input);
 assert.notEqual(a,b);assert.notEqual(a.geometry,b.geometry);assert.notEqual(a.symbol,b.symbol);assert.notEqual(a.symbol.symbolLayers[0].material.color,b.symbol.symbolLayers[0].material.color);
});
