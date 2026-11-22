const fs = require('node:fs'), path = require('node:path'), test = require('node:test'), assert = require('node:assert/strict');
const ts = require(process.env.MAPILLARY_TYPESCRIPT || 'typescript');
const source = fs.readFileSync(path.join(__dirname, '../src/runtime/widget.tsx'), 'utf8');
const sf = ts.createSourceFile('widget.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const widget = sf.statements.find(n => ts.isClassDeclaration(n) && n.name?.text === 'Widget');
const {createStartupCallback} = require('./helpers/activeViewStartupSource.cjs');
const factory = widget.members.find(n => n.name?.getText(sf) === 'activeViewStartupHost');
const featureCode = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/features/navigation/activeViewStartup.ts'), 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText;
const feature = {exports:{}}; new Function('exports', featureCode)(feature.exports);
const bindHost = ts.transpileModule('return class Harness { ' + factory.getText(sf) + ' };', {compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText;
const deferred = () => { let resolve, reject; const promise = new Promise((a,b) => { resolve=a; reject=b; }); return {promise,resolve,reject}; };
const flush = async () => { for (let i=0;i<15;i++) await Promise.resolve(); };
function fixture() {
  const events=[], warnings=[], modules=deferred(), camera=deferred(), coverage=deferred();
  let current=true;
  const view={type:'2d',map:{},destroyed:false};
  const w={ state:{jimuMapView:{view}}, _pointCloudAcquisition:{}, _sharedStateRestoreComplete:false,
    ensureArcGISModules:()=>modules.promise, restoreRoutingLoginView:()=>camera.promise,
    ensureAlwaysOnCoverageLayer:()=>events.push('attach'), enableTurboCoverageLayer:()=>{events.push('coverage');return coverage.promise;},
    _stationaryUrlBindings:{bind:()=>events.push('watcher')},
  };
  for (const name of ['restoreMapGraphics','syncPlaces','syncSharedFieldNotes','restoreMapillaryFeatureLayersForView']) w[name]=()=>events.push(name);
  w.activeViewStartupHost = new Function('console', bindHost)({warn:(...args)=>warnings.push(args)}).prototype.activeViewStartupHost;
  const run = createStartupCallback(w,{view,current:()=>current,dimensionChanged:false,previousScale:1,previousCenter:null},{view},feature.exports.restoreActiveView,{warn:(...args)=>warnings.push(args)});
  return {w,events,warnings,modules,camera,coverage,run,invalidate:()=>{current=false;}};
}
test('coverage waits for modules and restored camera, then starts before optional restoration without waiting for tiles',async()=>{
  const f=fixture(),run=f.run(); await flush(); assert.deepEqual(f.events,[]);
  f.modules.resolve(); await flush(); assert.deepEqual(f.events,[]);
  f.camera.resolve(); await flush();
  assert.deepEqual(f.events,['attach','coverage','restoreMapGraphics','syncPlaces','syncSharedFieldNotes','restoreMapillaryFeatureLayersForView']);
  f.coverage.resolve();await run;assert.equal(f.events.at(-1),'watcher');assert.equal(f.events.filter(e=>e==='coverage').length,1);
});
for(const boundary of ['modules','camera'])test('stale view at '+boundary+' cannot start coverage',async()=>{
  const f=fixture(),run=f.run();if(boundary==='modules')f.invalidate();f.modules.resolve();await flush();f.invalidate();f.camera.resolve();await run;assert.deepEqual(f.events,[]);
});
test('optional restoration failure does not prevent already-started coverage',async()=>{
  const f=fixture();f.w.restoreMapGraphics=()=>{throw Error('optional failure');};const run=f.run();f.modules.resolve();f.camera.resolve();await assert.rejects(run,/optional failure/);assert.deepEqual(f.events,['attach','coverage']);f.coverage.reject(Error('tile failure'));await flush();assert.equal(f.warnings.length,1);
});
test('coverage failure is observed while optional restoration and URL watcher remain usable',async()=>{
  const f=fixture(),run=f.run();f.modules.resolve();f.camera.resolve();await flush();f.coverage.reject(Error('tile failure'));await run;assert.equal(f.warnings.length,1);assert.equal(f.events.at(-1),'watcher');
});
test('late coverage settlement cannot bind the old URL watcher',async()=>{
  const f=fixture(),run=f.run();f.modules.resolve();f.camera.resolve();await flush();f.invalidate();f.coverage.resolve();await run;assert(!f.events.includes('watcher'));
});
test('expected coverage cancellation does not produce a warning',async()=>{
  const f=fixture(),run=f.run();f.modules.resolve();f.camera.resolve();await flush();f.coverage.reject(Object.assign(Error('cancelled'),{name:'AbortError'}));await run;assert.equal(f.warnings.length,0);
});
