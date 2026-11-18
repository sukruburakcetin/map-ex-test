const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
function compile(s){return ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;}
const geometry={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/routing/captureRouteGeometry.ts','utf8')))(geometry,geometry.exports);
const {normalizeCaptureRoutePaths}=geometry.exports,renderer={exports:{}};
new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/routing/captureRouteRenderer.ts','utf8')))(()=>geometry.exports,renderer,renderer.exports);
const {renderCaptureRouteGraphics}=renderer.exports;
const golden=JSON.parse(fs.readFileSync(__dirname+'/fixtures/captureRouteRenderer.baseline.json'));
const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,99,true,4),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');
const method=widget.members.find(n=>n.name?.getText(sf)==='drawCaptureRoute').getText(sf);
const oldFactory=new Function('loadArcGISJSAPIModules','normalizeCaptureRoutePaths',compile('return class Fixture{'+golden.method+'}'));
const newFactory=new Function('loadArcGISJSAPIModules','renderCaptureRouteGraphics',compile('return class Fixture{'+method+'}'));
async function execute(previous,{existing=false,paths=[[[0,0,7],[1,1,8]]],change,fail,noView=false,noModules=false,initialCurrent=true,destroyed=false}={}){
 const events=[],drawn=[],foreign={id:'foreign'};let resolve,reject,layer,current=initialCurrent,graphics=0;
 const gate=new Promise((a,b)=>{resolve=a;reject=b;});
 class Layer{constructor(properties){events.push(['layer',properties]);if(fail==='layer')throw Error('layer failed');this.id=properties.id;}removeAll(){events.push(['clear']);if(fail==='clear')throw Error('clear failed');}add(g){events.push(['add',g]);if(fail==='add')throw Error('add failed');drawn.push(g);}}
 const Graphic=label=>class{constructor(properties){events.push(['graphic',label,properties]);graphics++;if(fail==='graphic'||fail==='graphic2'&&graphics===2)throw Error('graphic failed');Object.assign(this,properties);}};
 const loader=names=>{events.push(['modules',names]);return gate;};
 const Type=previous?oldFactory(loader,normalizeCaptureRoutePaths):newFactory(loader,renderCaptureRouteGraphics),w=new Type();
 const attached=[foreign],view={map:{add:l=>{events.push(['attach',l.id]);attached.push(l);}},destroyed};
 w.state={jimuMapView:noView?null:{view}};w.ArcGISModules=noModules?null:{Graphic:Graphic('initial')};
 if(existing){layer=new Layer({id:'existing'});events.length=0;}
 Object.defineProperty(w,'_routeGraphicLayer',{get:()=>layer||null,set:value=>{events.push(['set-layer',value.id]);layer=value;}});
 const pending=w.drawCaptureRoute(paths,()=>current);
 if(change==='cancel')current=false;if(change==='view')w.state.jimuMapView={view:{map:{}}};if(change==='map')view.map={};if(change==='destroy')view.destroyed=true;if(change==='sdk')w.ArcGISModules={Graphic:Graphic('late')};
 if(fail==='modules')reject(Error('modules failed'));else resolve([Layer]);
 let error;try{await pending;}catch(e){error=e.message;}
 assert(attached.includes(foreign));if(drawn.length){const normalized=normalizeCaptureRoutePaths(paths);for(const g of drawn){for(let i=0;i<normalized.length;i++)assert.equal(g.geometry.paths[i],normalized[i]);}}
 return JSON.parse(JSON.stringify({events,error,layerId:layer?.id,drawn,attached:attached.map(l=>l.id)}));
}
async function compare(options){const old=await execute(true,options),actual=await execute(false,options);assert.deepEqual(actual,old);return actual;}
for(const existing of [false,true])for(const [name,paths] of [['flat',[[0,0],[1,1]]],['3D',[[[0,0,7],[1,1,8]]]],['multipart',[[[0,0],[1,1]],[[2,2],[3,3]]]]])test(name+' existing='+existing,async()=>{const r=await compare({existing,paths});assert.equal(r.drawn.length,2);});
for(const [i,paths] of [[],null,[[0,0]],[[0,0],[1,NaN]]].entries())test('invalid geometry '+i+' does not clear or load',async()=>assert.deepEqual((await compare({existing:true,paths})).events,[]));
for(const change of ['cancel','view','map','destroy'])test('stale module loading '+change,async()=>{const r=await compare({change});assert.deepEqual(r.events.map(e=>e[0]),['modules']);assert.equal(r.layerId,undefined);});
test('Graphic constructor is read after loading',async()=>{const r=await compare({change:'sdk'});assert(r.events.filter(e=>e[0]==='graphic').every(e=>e[1]==='late'));});
for(const fail of ['modules','layer','clear','graphic','graphic2','add'])test('failure propagation/order '+fail,async()=>assert((await compare({fail})).error));
for(const options of [{noView:true},{noModules:true},{initialCurrent:false},{destroyed:true}])test('early return '+JSON.stringify(options),async()=>assert.deepEqual((await compare(options)).events,[]));
test('widget retains layer cleanup outside the renderer',()=>{
 for(const name of ['clearCaptureRoute','clearViewDependentAnalysis']){const node=widget.members.find(n=>n.name?.getText(sf)===name);assert(node.getText(sf).includes('this._routeGraphicLayer'));}
});
