const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require(process.env.MAPILLARY_TYPESCRIPT || 'typescript');
const compile = source => ts.transpileModule(source, {compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const source = fs.readFileSync(path.join(__dirname,'../src/runtime/widget.tsx'),'utf8');
const sf = ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const widget = sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');
const factory = widget.members.find(n=>n.name?.getText(sf)==='activeViewStartupHost');
const {createStartupCallback} = require('./helpers/activeViewStartupSource.cjs');
assert(factory,'exercise production startup host');
const feature={exports:{}};
new Function('exports',compile(fs.readFileSync(path.join(__dirname,'../src/features/navigation/activeViewStartup.ts'),'utf8')))(feature.exports);
const baseline=require('./fixtures/activeViewStartup.baseline.json').callback;
const flush=async()=>{for(let i=0;i<20;i++)await Promise.resolve();};
function fixture(legacy, options={}) {
  const events=[], warnings=[];
  let current=options.initialCurrent!==false;
  const gates={};
  for(const name of ['goTo','modules','camera','coverage']) {
    let resolve,reject;
    const promise=new Promise((a,b)=>{resolve=a;reject=b;});
    gates[name]={promise,resolve,reject};
  }
  const record=(name,...args)=>events.push([name,...args]);
  const view={type:options.type||'3d',map:{},destroyed:false,goTo:(...args)=>{record('goTo',...args);return gates.goTo.promise;}};
  const image={id:'image',lon:10,lat:20};
  const w={
    state:{jimuMapView:{view},imageId:options.noImage?null:'image',pointCloudVisible:true,isSightMode:true,isMeasureMode:true,measurePoints:[1]},
    _pointCloudAcquisition:{result:true},_sharedStateRestoreComplete:options.restored!==false,_isFlyInActive:!!options.flying,
    _liveSequenceFrames:{current:options.noImage?null:options.mismatch?{...image,id:'other'}:image,find:()=>null},
    _lastBearing:0,coneLengths:[15],coneSpreads:[30],zoomStepIndex:0,
    ensureArcGISModules:()=>{record('modules');return gates.modules.promise;},
    restoreRoutingLoginView:()=>{record('camera');return gates.camera.promise;},
    ensureAlwaysOnCoverageLayer:()=>record('attach'),
    enableTurboCoverageLayer:()=>{record('coverage');return gates.coverage.promise;},
    ensureSightOwner:()=>({activate:()=>{record('sight');return new Promise(()=>{});}}),
    _stationaryUrlBindings:{bind:v=>record('watcher',v===view)},
  };
  for(const name of ['restoreMapGraphics','syncPlaces','renderPointCloudMapLayer','clearPointCloud','updateMeasurementGraphics','syncSharedFieldNotes','restoreMapillaryFeatureLayersForView','drawCone','updateUrlWithCurrentImage'])
    w[name]=(...args)=>{record(name,...args);if(options.throwOptional&&name==='restoreMapGraphics')throw Error('optional');if(name==='syncSharedFieldNotes')return new Promise(()=>{});};
  const logger={warn:(message,error)=>warnings.push([message,error.message])};
  w.activeViewStartupHost=new Function('console',compile('return class Harness {'+factory.getText(sf)+'};'))(logger).prototype.activeViewStartupHost;
  const context={view,current:()=>current,dimensionChanged:options.dimensionChanged!==false,previousScale:options.scale===undefined?200:options.scale,previousCenter:options.center===undefined?{x:1,y:2}:options.center};
  const run=legacy?new Function('view','viewStartupCurrent','dimensionChanged','previousScale','previousCenter','jmv','console',compile('return ('+baseline+');')).call(w,view,context.current,context.dimensionChanged,context.previousScale,context.previousCenter,'jmv',logger).bind(w):createStartupCallback(w,context,'jmv',feature.exports.restoreActiveView,logger);
  return {w,view,events,warnings,gates,run,invalidate:()=>{current=false;}};
}
async function trace(legacy, options={}, action=()=>{}) {
  const f=fixture(legacy,options);
  const pending=f.run().then(()=>null,error=>error.message);
  await flush();await action(f,'start');
  for(const name of ['goTo','modules','camera','coverage']) {
    if(options.fail===name)f.gates[name].reject(Error(name+' failed'));
    else f.gates[name].resolve();
    await flush();await action(f,name);
  }
  return {events:f.events,warnings:f.warnings,error:await pending};
}
const scenarios=[
  ['normal 3D restoration',{}],['2D cloud clearing',{type:'2d'}],['no scale transfer',{dimensionChanged:false}],
  ['no center',{center:null}],['zero scale',{scale:0}],['nonfinite scale',{scale:NaN}],
  ['initial shared-link restore',{restored:false}],['fly-in owns camera',{flying:true}],
  ['missing image still writes URL',{noImage:true}],['mismatched image avoids cone',{mismatch:true}],
  ['goTo failure continues',{fail:'goTo'}],['module failure propagates',{fail:'modules',dimensionChanged:false}],
  ['camera failure propagates',{fail:'camera',dimensionChanged:false}],['coverage failure is observed',{fail:'coverage'}],
  ['optional failure keeps coverage observed',{throwOptional:true,fail:'coverage'}],['stale at entry',{initialCurrent:false}],
];
for(const [name,options]of scenarios)test('frozen/current startup trace: '+name,async()=>assert.deepEqual(await trace(false,options),await trace(true,options)));
for(const boundary of ['start','goTo','modules','camera'])test('frozen/current cancellation after '+boundary,async()=>{
  const action=(f,at)=>{if(at===boundary)f.invalidate();};
  assert.deepEqual(await trace(false,{},action),await trace(true,{},action));
});
for(const change of ['replace','destroy','removeMap'])test('view invalidation during scale transfer: '+change,async()=>{
  const action=(f,at)=>{if(at==='start'){if(change==='replace')f.w.state.jimuMapView.view={};else if(change==='destroy')f.view.destroyed=true;else f.view.map=null;}};
  const actual=await trace(false,{},action);assert.deepEqual(actual,await trace(true,{},action));assert.deepEqual(actual.events.map(e=>e[0]),['goTo']);
});
test('optional tools and feature layers run while coverage remains pending; URL and watcher follow coverage',async()=>{
  const f=fixture(false);const pending=f.run();f.gates.goTo.resolve();f.gates.modules.resolve();f.gates.camera.resolve();await flush();
  assert.deepEqual(f.events.map(e=>e[0]),['goTo','modules','camera','attach','coverage','restoreMapGraphics','syncPlaces','renderPointCloudMapLayer','sight','updateMeasurementGraphics','syncSharedFieldNotes','restoreMapillaryFeatureLayersForView']);
  f.gates.coverage.resolve();await pending;
  assert.deepEqual(f.events.slice(-3),[['drawCone',10,20,0,15,30],['updateUrlWithCurrentImage','image'],['watcher',true]]);
});
