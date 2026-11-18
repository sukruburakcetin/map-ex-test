const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
function compile(s){const r=ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});assert.equal(r.diagnostics.filter(d=>d.category===1).length,0);return r.outputText;}
const m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/routing/runtimeRoutingSettings.ts','utf8')))(m,m.exports);
const {planRuntimeRoutingEngineChange,planRuntimeTravelModeChange}=m.exports;
const fixture=JSON.parse(fs.readFileSync(__dirname+'/fixtures/runtimeRoutingSettings.baseline.json'));
const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,99,true,4),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');
const methods=['handleRuntimeRoutingEngineChange','handleRuntimeTravelModeChange'].map(name=>widget.members.find(n=>n.name?.getText(sf)===name).getText(sf)).join('\n');
const Old=new Function(compile('return class Fixture{'+fixture.methods+'}'))();
const Current=new Function('planRuntimeRoutingEngineChange','planRuntimeTravelModeChange',compile('return class Fixture{'+methods+'}'))(planRuntimeRoutingEngineChange,planRuntimeTravelModeChange);
function compare({engine,mode,current='walk',busy=false,layer=true}){
 const initial=Object.freeze({routeTravelMode:current,isGeneratingRoute:busy,routingEngineOverride:'world',routeData:{id:'old-route'},routeGenerationProgress:{usedMinutes:2},routeStartPoint:[1,2],routeEndPoint:[3,4],routeSpareMinutes:15,coverage:{id:'analysis'},bbox:[0,0,1,1]});
 function run(Type){const w=new Type(),events=[];w.state={...initial};if(layer)w._routeGraphicLayer={removeAll:()=>events.push(['clear'])};w.setState=patch=>{events.push(['state',patch]);Object.assign(w.state,patch);};w.log=message=>events.push(['log',message]);if(engine)w.handleRuntimeRoutingEngineChange(engine);else w.handleRuntimeTravelModeChange(mode);
 for(const k of ['routeStartPoint','routeEndPoint','routeSpareMinutes','coverage','bbox'])assert.equal(w.state[k],initial[k]);return {state:w.state,events};}
 const old=run(Old),actual=run(Current);assert.deepEqual(actual,old);
 assert.deepEqual(actual.events.map(e=>e[0]),busy?[]:layer?['clear','state','log']:['state','log']);
 const plan=engine?planRuntimeRoutingEngineChange(engine,initial):planRuntimeTravelModeChange(mode,initial);
 if(busy)assert.equal(plan,null);else {assert.deepEqual(plan.patch,actual.events.find(e=>e[0]==='state')[1]);assert.equal(plan.message,actual.events.at(-1)[1]);}
 return actual;
}
for(const engine of ['world','osrm'])for(const current of ['drive','walk','bike'])for(const busy of [false,true])test(engine+' from '+current+' busy='+busy,()=>compare({engine,current,busy}));
for(const mode of ['drive','walk','bike'])for(const busy of [false,true])test('travel '+mode+' busy='+busy,()=>compare({mode,busy}));
test('absent route layer still publishes and logs',()=>{compare({engine:'osrm',layer:false});compare({mode:'bike',layer:false});});
test('same engine/mode selection retains existing invalidation behavior',()=>{compare({engine:'world',current:'drive'});compare({mode:'walk',current:'walk'});});
test('plans are independent records and do not mutate frozen state',()=>{
 const state=Object.freeze({isGeneratingRoute:false,routeTravelMode:'walk'}),a=planRuntimeRoutingEngineChange('osrm',state),b=planRuntimeRoutingEngineChange('osrm',state);assert.notEqual(a,b);assert.notEqual(a.patch,b.patch);assert.equal(state.routeTravelMode,'walk');assert.equal(a.patch.routeTravelMode,'drive');
});
