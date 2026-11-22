const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const source=fs.readFileSync(path.join(__dirname,'../src/runtime/widget.tsx'),'utf8');
const sf=ts.createSourceFile('widget.tsx',source,99,true,4);
const widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');
const member=name=>widget.members.find(n=>n.name?.getText(sf)===name);
const host=member('activeViewTransferHost').getText(sf);
const entry=member('onActiveViewChange').initializer.body.statements.slice(0,3).map(n=>n.getText(sf)).join('\n');
assert(entry.includes('this._activeViewTransfer.begin(jmv?.view)'),'exercise actual transfer entry');
const feature={exports:{}};
new Function('exports',compile(fs.readFileSync(path.join(__dirname,'../src/features/navigation/ActiveViewTransfer.ts'),'utf8')))(feature.exports);
const baseline=require('./fixtures/activeViewTransfer.baseline.json').prefix;
function fixture(legacy,options={}) {
  const events=[];
  const center={x:10,y:20};
  const previous={id:'old',type:'2d',map:{id:'old-map'},scale:400,center:{clone:()=>{events.push(['clone']);return center;}}};
  const view={id:'new',type:options.type||'3d',map:options.sameMap?previous.map:{id:'new-map'},scale:200,destroyed:false};
  if(options.sameView)Object.assign(previous,view);
  const active=options.sameView?view:previous;
  const norm=v=>v===view?'new-view':v===previous?'old-view':v;
  const record=(name,...args)=>{events.push([name,...args.map(norm)]);if(options.throwAt===name)throw Error(name);};
  const w={state:{jimuMapView:options.noPrevious?null:{view:active},turboModeActive:options.turbo!==false},
    _viewStartupRevision:0,_mapClickRevision:4,_sharedStartupImageId:'image',_sharedStartupBearing:50,
    _startupUrlParameters:options.url===false?null:'existing-url',_isFlyInActive:true,_hoverTimingTarget:'old-target',
    _routeGeneration:{pending:!!options.routePending,current:()=>options.routeCurrent!==false},
  };
  const owners={_hoverPreviewStatus:'clear',_coverageAlignmentDiagnostic:'clearHover',_pointCloudAdaptiveDisplay:'dispose',_lasso:'clear',_viewshed:'onViewChange',_sight:'onViewChange',_measurement:'onViewChange',_pointCloudAcquisition:'cancel',_pointCloudMapLayer:'invalidate',_rings:'onViewChange',_pendingCoverageHover:'clear',_coverageHoverResume:'dispose',mapClickHandle:'remove',pointerMoveHandle:'remove',_stationaryUrlBindings:'clear',_elevationProfile:'clear',_nativeCurrentImageMarker:'clear',_screenDirectionCone:'clear',_cameraCone:'dispose',_nativeSequenceSelection:'detach',_sharedTileRequests:'clear',_sequenceTileIndex:'clear',_hoverSequenceTiming:'cancel',_hoverTimingAbort:'abort',_reverseAddressEnrichment:'cancel',_backgroundRequests:'clear',_timeTravelAvailability:'clear',_cachedSequencePreview:'clear'};
  for(const [name,method]of Object.entries(owners))w[name]={[method]:(...args)=>record(name+'.'+method,...args)};
  for(const name of ['cancelCaptureRouteGeneration','syncSceneTerrain','disableTurboCoverageLayer','log','clearViewDependentAnalysis','clearSharedNotesView','clearMapLegendLayer','clearSolarGraphics','clearActiveSequenceLayer','clearGreenPulse','clearClickRipples','clearTurboHover','clearFieldNotesGroup','claimCurrentImagePresentation'])w[name]=(...args)=>record(name,...args);
  if(options.missingOptional)for(const key of ['_hoverPreviewStatus','_coverageAlignmentDiagnostic','_pointCloudAdaptiveDisplay','_lasso','_viewshed','_sight','_measurement','_rings','_pendingCoverageHover','_coverageHoverResume','mapClickHandle','pointerMoveHandle','_elevationProfile','_nativeCurrentImageMarker','_screenDirectionCone','_cameraCone','_hoverSequenceTiming','_hoverTimingAbort','_timeTravelAvailability','_cachedSequencePreview'])w[key]=null;
  w._coverageHoverHandler=()=>{};
  const url=()=>{record('readSharedLinkParameters');return 'parsed-url';};
  w.activeViewTransferHost=new Function('readSharedLinkParameters',compile('return class Harness {'+host+'};'))(url).prototype.activeViewTransferHost;
  w._activeViewTransfer=new feature.exports.ActiveViewTransfer(w.activeViewTransferHost());
  const run=legacy?new Function('readSharedLinkParameters','jmv',compile(baseline+'\nreturn {view,current:viewStartupCurrent,dimensionChanged,previousScale,previousCenter};')).bind(w,url):new Function('jmv',compile(entry+'\nreturn transfer;')).bind(w);
  const invalidate=()=>legacy?++w._viewStartupRevision:w._activeViewTransfer.invalidate();
  return {w,view,previous,events,center,run,invalidate};
}
function result(f,context,error){return {events:f.events,error:error?.message,context:context?{view:context.view===f.view,dimensionChanged:context.dimensionChanged,previousScale:context.previousScale,previousCenter:context.previousCenter,current:context.current()}:null,reset:{image:f.w._sharedStartupImageId,bearing:f.w._sharedStartupBearing,url:f.w._startupUrlParameters,flying:f.w._isFlyInActive,clickRevision:f.w._mapClickRevision,clickRemoved:f.w.mapClickHandle===null,pointerRemoved:f.w.pointerMoveHandle===null,resumeRemoved:f.w._coverageHoverResume===null,hoverHandlerRemoved:f.w._coverageHoverHandler===null,target:f.w._hoverTimingTarget}};}
function trace(legacy,options={}){const f=fixture(legacy,options);let context,error;try{context=f.run(options.input==='missing'?undefined:{view:options.input==='destroyed'?{...f.view,destroyed:true}:options.input==='noMap'?{...f.view,map:null}:f.view});}catch(e){error=e;}return result(f,context,error);}
for(const [name,options]of [
 ['dimension switch',{}],['same dimension',{type:'2d'}],['same map',{sameMap:true}],['same view',{sameView:true}],
 ['no previous view',{noPrevious:true}],['coverage disabled',{turbo:false}],['optional owners absent',{missingOptional:true}],
 ['parse startup URL lazily',{url:false}],['pending route changes view',{routePending:true}],
 ['same view keeps current route',{sameView:true,routePending:true}],['same view cancels stale route',{sameView:true,routePending:true,routeCurrent:false}],
 ['invalid view',{input:'missing',routePending:true}],['destroyed view',{input:'destroyed'}],['missing map',{input:'noMap'}],
 ['click removal failure',{throwAt:'mapClickHandle.remove'}],['pointer removal failure',{throwAt:'pointerMoveHandle.remove'}],
 ['tool failure propagates',{throwAt:'_viewshed.onViewChange'}],['analysis failure stops transfer',{throwAt:'clearViewDependentAnalysis'}],
 ['presentation failure stops transfer',{throwAt:'clearSolarGraphics'}],['request cleanup failure stops claim',{throwAt:'_sharedTileRequests.clear'}],
])test('frozen/current transfer trace: '+name,()=>assert.deepEqual(trace(false,options),trace(true,options)));
for(const change of ['commit','replacement','sameViewTransfer','mapReplacement','destroy','cleanup','invalidInput'])test('startup context identity: '+change,()=>{
 function run(legacy){const f=fixture(legacy),context=f.run({view:f.view});const values=[context.current()];f.w.state.jimuMapView={view:f.view};values.push(context.current());
  if(change==='replacement')f.w.state.jimuMapView={view:f.previous};
  if(change==='sameViewTransfer')f.run({view:f.view});
  if(change==='mapReplacement')f.view.map={id:'replacement-map'};
  if(change==='destroy')f.view.destroyed=true;
  if(change==='cleanup')f.invalidate();
  if(change==='invalidInput')f.run(undefined);
  values.push(context.current());return values;}
 const actual=run(false);assert.deepEqual(actual,run(true));assert.deepEqual(actual,[false,true,['commit','invalidInput'].includes(change)]);
});
test('full cleanup calls the same transfer owner invalidation before resetting fly-in state',()=>{
 const teardown=require('./helpers/widgetTeardownSource.cjs');
 assert.match(teardown.source,/if \(fullRemove\) \{\s*host\.retireViewRequests\(\);/);
 assert.match(teardown.action('retireViewRequests'),/this\._activeViewTransfer\.invalidate\(\);\s*this\._isFlyInActive = false;/);
 assert(!source.includes('_viewStartupRevision'),'one revision owner, no parallel widget counter');
});
test('resources are retired and presentation claimed before caller commits a new view',()=>{
 const f=fixture(false);const context=f.run({view:f.view});assert.equal(f.w.state.jimuMapView.view,f.previous);assert.equal(context.current(),false);
 assert.equal(f.events.at(-1)[0],'claimCurrentImagePresentation');
 const names=f.events.map(e=>e[0]);assert(names.indexOf('_stationaryUrlBindings.clear')<names.indexOf('disableTurboCoverageLayer'));
 assert(names.indexOf('clearViewDependentAnalysis')<names.indexOf('clearSolarGraphics'));
 assert(names.indexOf('_nativeSequenceSelection.detach')<names.indexOf('_sharedTileRequests.clear'));
});
