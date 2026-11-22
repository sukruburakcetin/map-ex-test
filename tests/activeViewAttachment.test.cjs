const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const source=fs.readFileSync(path.join(__dirname,'../src/runtime/widget.tsx'),'utf8');
const sf=ts.createSourceFile('widget.tsx',source,99,true,4),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');
const member=name=>widget.members.find(n=>n.name?.getText(sf)===name);
const factory=member('activeViewAttachmentHost').getText(sf);
const entry=member('onActiveViewChange').initializer.body.statements[3].getText(sf);
assert.equal(entry,'this._activeViewTransfer.attach(transfer, this.activeViewAttachmentHost(view, jmv));');
const feature={exports:{}};new Function('exports',compile(fs.readFileSync(path.join(__dirname,'../src/features/navigation/ActiveViewTransfer.ts'),'utf8')))(feature.exports);
const original=require('./fixtures/activeViewAttachment.baseline.json').block;
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return{promise,resolve,reject};};
const flush=async()=>{for(let i=0;i<20;i++)await Promise.resolve();};
function fixture(legacy,options={}){
 const events=[],warnings=[],ready=deferred(),restored=deferred(),commits=[],tasks=[];
 let valid=true;
 const map={},view={map,destroyed:false,when:callback=>{
  events.push(['register']);if(options.throwReady)throw Error('registration');
  const task=ready.promise.then(()=>{events.push(['ready']);return callback();});tasks.push(task);return task;
 }};
 const jmv={view},w={state:{jimuMapView:{view:{}}},_loadedTurboFiltersKey:'old'};
 const current=()=>valid&&w.state.jimuMapView?.view===view&&view.map===map&&!view.destroyed;
 const context={view,current,dimensionChanged:true,previousScale:300,previousCenter:{x:1,y:2}};
 w.setState=(patch,callback)=>{
  events.push(['state',patch.jimuMapView===jmv?'commit':'turbo',patch.pointCloudLoading,patch.turboModeActive]);
  const apply=()=>{Object.assign(w.state,patch);if(callback){events.push(['committed']);callback();}};
  if(callback&&options.deferredCommit)commits.push(apply);else apply();
 };
 w._viewZoomBindings={bind:v=>events.push(['zoom',v===view])};
 w._turboViewBindings={bind:v=>events.push(['turbo',v===view,w._loadedTurboFiltersKey])};
 w.enforceMapillaryLayerOrder=v=>{events.push(['order',v===view]);if(options.orderThrows)throw Error('order');};
 w.activeViewStartupHost=(v,j)=>{events.push(['startupHost',v===view,j===jmv]);return 'startup-host';};
 w.restoreSharedStateWhenReady=(v,c)=>{events.push(['shared',v===view,c===current,c()]);return new Promise(()=>{});};
 const restoreActiveView=(ctx,host)=>{events.push(['restore',ctx.view===view,ctx.current===current,ctx.current(),ctx.dimensionChanged,ctx.previousScale,ctx.previousCenter,host]);return restored.promise;};
 const logger={warn:(message,error)=>warnings.push([message,error?.message])};
 w.activeViewAttachmentHost=new Function('restoreActiveView','console',compile('return class Harness {'+factory+'};'))(restoreActiveView,logger).prototype.activeViewAttachmentHost;
 w._activeViewTransfer=new feature.exports.ActiveViewTransfer({currentView:()=>w.state.jimuMapView?.view});
 const run=legacy?new Function('view','jmv','viewStartupCurrent','dimensionChanged','previousScale','previousCenter','restoreActiveView','console',compile(original)).bind(w,view,jmv,current,true,300,context.previousCenter,restoreActiveView,logger):new Function('transfer','view','jmv',compile(entry)).bind(w,context,view,jmv);
 return{w,view,events,warnings,ready,restored,commits,tasks,current,run,invalidate:()=>{valid=false;}};
}
async function trace(legacy,options={}){
 const f=fixture(legacy,options);let error;
 try{f.run();}catch(e){error=e.message;}
 const immediate=structuredClone(f.events);
 if(options.readyBeforeCommit){f.ready.resolve();await flush();}
 try{for(const commit of f.commits)commit();}catch(e){error=e.message;}
 if(options.change==='view')f.w.state.jimuMapView={view:{}};
 if(options.change==='map')f.view.map={};
 if(options.change==='destroy')f.view.destroyed=true;
 if(options.change==='removeMap')f.view.map=null;
 if(options.change==='revision')f.invalidate();
 if(options.readyFailure)f.ready.reject(Object.assign(Error('ready failed'),{name:options.abort?'AbortError':'Error'}));else f.ready.resolve();
 await flush();const whileRestoring=structuredClone(f.events);
 if(options.restoreFailure)f.restored.reject(Object.assign(Error('restore failed'),{name:options.abort?'AbortError':'Error'}));else f.restored.resolve();
 // Rejection handlers belong to production registration; observing SDK tasks avoids fixture-only unhandled work.
 await Promise.allSettled(f.tasks);await flush();
 return{immediate,whileRestoring,events:f.events,warnings:f.warnings,error};
}
for(const [name,options]of [
 ['synchronous commit',{}],['deferred React commit',{deferredCommit:true}],['view ready before React commit',{deferredCommit:true,readyBeforeCommit:true}],
 ['restoration rejects',{restoreFailure:true}],['expected restoration abort',{restoreFailure:true,abort:true}],
 ['view readiness rejects',{readyFailure:true}],['expected readiness abort',{readyFailure:true,abort:true}],
 ['stale revision rejects silently',{change:'revision',restoreFailure:true}],['retired view rejects silently',{change:'view',restoreFailure:true}],
 ['destroyed view rejects silently',{change:'destroy',readyFailure:true}],['layer ordering failure is isolated',{orderThrows:true}],
 ['synchronous registration failure',{throwReady:true}],['deferred registration failure',{throwReady:true,deferredCommit:true}],
 ['view replaced during readiness',{change:'view'}],['map removed during readiness',{change:'removeMap'}],
 ['destroyed during readiness',{change:'destroy'}],['same-view revision retains original layer-order guard',{change:'revision'}],
 ['same-view map replacement retains original layer-order guard',{change:'map'}],
])test('frozen/current attachment trace: '+name,async()=>assert.deepEqual(await trace(false,options),await trace(true,options)));
test('shared links do not wait for readiness or coverage; zoom and Turbo do not wait for React commitment',async()=>{
 const f=fixture(false,{deferredCommit:true});f.run();assert.deepEqual(f.events.map(e=>e[0]),['state','zoom','state','turbo','register']);
 f.commits[0]();assert.deepEqual(f.events.slice(-3).map(e=>e[0]),['committed','register','shared']);
 f.ready.resolve();await flush();assert(f.events.some(e=>e[0]==='restore'));assert(f.events.some(e=>e[0]==='order'));
 assert.equal(f.warnings.length,0);f.restored.resolve();await Promise.allSettled(f.tasks);
});
test('startup registration directly returns the restoration promise without another asynchronous handoff',()=>{
 const f=fixture(false),host=f.w.activeViewAttachmentHost(f.view,{view:f.view});
 let callback;host.commit=ready=>ready();host.whenReady=ready=>{callback??=ready;return Promise.resolve();};host.shared=()=>{};
 f.w._activeViewTransfer.attach({view:f.view,current:f.current},host);
 assert.equal(callback(),f.restored.promise);
});
