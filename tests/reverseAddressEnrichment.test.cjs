/** Frozen runtime versus extracted optional-address ownership, with controlled queue/transport. */
const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const root=path.resolve(__dirname,'..'),compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const original=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/reverseAddressEnrichment.baseline.json'),'utf8')).method;
const src=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8').replace(/^\uFEFF/,'').replace(/\r\n/g,'\n'),sf=ts.createSourceFile('widget.tsx',src,99,true,4),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget'),member=name=>widget.members.find(n=>n.name?.getText(sf)===name).getText(sf);
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return{promise,resolve,reject}};
function fixture(kind,{heldQueue=false,missingView=false}={}){
 const trace=[],requests=[],jobs=[],state={image:'A',view:missingView?undefined:{id:'view-A'}},ids=new WeakMap();let serial=0;
 const id=signal=>{if(!ids.has(signal))ids.set(signal,++serial);return ids.get(signal)};
 const fetchReverseAddress=(lat,lon,publish,signal)=>{trace.push(['fetch',lat,lon,id(signal)]);const gate=deferred();requests.push({gate,publish,signal});return gate.promise};
 const module={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/imagery/ReverseAddressEnrichment.ts','utf8')))(name=>{assert.equal(name,'../../services/geocoding/reverseAddress');return{fetchReverseAddress}},module,module.exports);
 const code=kind==='original'?original:member('_reverseAddressEnrichment')+'\n'+member('fetchReverseGeocode');
 const Runtime=new Function('ReverseAddressEnrichment','fetchReverseAddress','console',compile('class Runtime{'+code+'};return Runtime;'))(module.exports.ReverseAddressEnrichment,fetchReverseAddress,{warn:(...args)=>trace.push(['warn',...args])}),w=new Runtime();
 w.state={get imageId(){trace.push(['image',state.image]);return state.image},get jimuMapView(){trace.push(['view',state.view?.id]);return state.view?{view:state.view}:undefined}};
 w.setState=patch=>{trace.push(['state',patch]);state.address=patch.address};
 w.runSequenceBackground=(work,signal)=>{trace.push(['queue',id(signal)]);signal.addEventListener('abort',()=>trace.push(['abort',id(signal)]),{once:true});if(!heldQueue)return work(signal);const gate=deferred();jobs.push({gate,signal});return gate.promise.then(()=>{if(signal.aborted)throw new DOMException('Cancelled','AbortError');return work(signal)})};
 const cancel=()=>kind==='original'?w._reverseGeocodeAbort?.abort():w._reverseAddressEnrichment.cancel();
 const clear=()=>{if(kind==='original'){w._reverseGeocodeAbort?.abort();w._reverseGeocodeAbort=null}else w._reverseAddressEnrichment.clear()};
 return{w,state,trace,requests,jobs,cancel,clear,run:(lat=41,lon=29)=>w.fetchReverseGeocode(lat,lon)};
}
async function compare(action,options){const a=fixture('original',options),b=fixture('extracted',options);await action(a);await action(b);assert.deepEqual(b.trace,a.trace);assert.deepEqual(b.state,a.state);return b;}
for(const [lat,lon]of [[41,29],[0,0],[-85,-180],[NaN,Infinity]])test('coordinates and successful publication preserved: '+lat+','+lon,async()=>{
 const x=await compare(async f=>{const task=f.run(lat,lon);f.requests[0].publish('Address');f.requests[0].gate.resolve();await task;f.cancel()});assert.equal(x.state.address,'Address');assert.equal(x.trace.filter(t=>t[0]==='fetch').length,1);assert(!x.trace.some(t=>t[0]==='abort'));
});
test('missing map context retains original publication policy',async()=>{const x=await compare(async f=>{const task=f.run();f.requests[0].publish('Address');f.requests[0].gate.resolve();await task},{missingView:true});assert.equal(x.state.address,'Address')});
for(const change of ['image','view','both'])test('stale '+change+' cannot publish',async()=>{const x=await compare(async f=>{const task=f.run();if(change!=='view')f.state.image='B';if(change!=='image')f.state.view={id:'view-B'};f.requests[0].publish('stale');f.requests[0].gate.resolve();await task});assert.equal(x.state.address,undefined)});
for(const action of ['cancel','clear'])test(action+' suppresses ignored-abort publication and permits reuse',async()=>{const x=await compare(async f=>{const old=f.run();f[action]();f.requests[0].publish('stale');f.requests[0].gate.resolve();await old;const next=f.run();f.requests[1].publish('fresh');f.requests[1].gate.resolve();await next;f[action]()});assert.equal(x.state.address,'fresh');assert.equal(x.trace.filter(t=>t[0]==='abort').length,1)});
test('old completion cannot clear a newer pending controller',async()=>{const x=await compare(async f=>{const old=f.run(),next=f.run();f.requests[0].gate.resolve();await old;f.cancel();f.requests[1].publish('cancelled');f.requests[1].gate.resolve();await next});assert.equal(x.state.address,undefined);assert.equal(x.trace.filter(t=>t[0]==='abort').length,2)});
test('new success stays published when old transport completes last',async()=>{const x=await compare(async f=>{const old=f.run(),next=f.run();f.requests[1].publish('new');f.requests[1].gate.resolve();await next;f.requests[0].publish('old');f.requests[0].gate.resolve();await old});assert.equal(x.state.address,'new')});
for(const cancelled of [false,true])test('request rejection warning boundary; cancelled='+cancelled,async()=>{const error=Error('offline');const x=await compare(async f=>{const task=f.run();if(cancelled)f.cancel();f.requests[0].gate.reject(error);await task});assert.equal(x.trace.filter(t=>t[0]==='warn').length,cancelled?0:1)});
test('queue retains the existing signal and starts no transport before release',async()=>{const x=await compare(async f=>{const task=f.run();assert.equal(f.requests.length,0);f.jobs[0].gate.resolve();await Promise.resolve();f.requests[0].publish('queued');f.requests[0].gate.resolve();await task},{heldQueue:true});assert.equal(x.state.address,'queued')});
test('cancelled queued work starts no transport and emits no warning',async()=>{const x=await compare(async f=>{const task=f.run();f.cancel();f.jobs[0].gate.resolve();await task},{heldQueue:true});assert.equal(x.requests.length,0);assert(!x.trace.some(t=>t[0]==='warn'))});
test('queue rejection keeps existing warning and cleanup behavior',async()=>{const error=Error('queue failed');await compare(async f=>{const task=f.run();f.jobs[0].gate.reject(error);await task;f.cancel()},{heldQueue:true})});
test('clear while old work remains pending does not detach the next run on old completion',async()=>{await compare(async f=>{const old=f.run();f.clear();const next=f.run();f.requests[0].gate.resolve();await old;f.cancel();assert(f.requests[1].signal.aborted);f.requests[1].gate.resolve();await next})});
test('abort short-circuits selection reads before publication',async()=>{const x=await compare(async f=>{const task=f.run();f.cancel();const reads=f.trace.filter(t=>t[0]==='image'||t[0]==='view').length;f.requests[0].publish('stale');assert.equal(f.trace.filter(t=>t[0]==='image'||t[0]==='view').length,reads);f.requests[0].gate.resolve();await task});assert.equal(x.state.address,undefined)});
test('image mismatch short-circuits view reads',async()=>{await compare(async f=>{const task=f.run();f.state.image='B';const views=f.trace.filter(t=>t[0]==='view').length;f.requests[0].publish('stale');assert.equal(f.trace.filter(t=>t[0]==='view').length,views);f.requests[0].gate.resolve();await task})});
test('widget forwarding returns the owner promise and reuses its stable owner',async()=>{const f=fixture('extracted'),owner=f.w._reverseAddressEnrichment,promise=Promise.resolve();let args;owner.run=(...values)=>{args=values;return promise};assert.equal(f.run(1,2),promise);assert.deepEqual(args,[1,2]);assert.equal(f.w._reverseAddressEnrichment,owner)});

// Freeze cancellation placement inside the existing lifecycle bodies, including sequence presentation.
for(const {name,sha256} of JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/reverseAddressEnrichment.baseline.json'),'utf8')).lifecycle){
 test(`lifecycle ${name} changes only the existing cancellation call`,()=>{
  let lifecycle=member(name);
  if(name==='loadSequenceById') {
   assert(lifecycle.includes('openSequence('),'actual sequence opening entry');
   lifecycle=require('./fixtures/sequenceOpening.baseline.json').method.trim();
  }
  if(name==='bindMapillaryEvents') {
   assert(lifecycle.includes('bindViewerEvents(this.viewerEventsHost())'),'actual viewer binding entry');
   lifecycle=require('./fixtures/viewerEventBinding.baseline.json').method;
   const callback='event => trackViewerImage(event, profileEventViewer, redrawCone, imageTrackingHost)';
   assert.equal(lifecycle.split(callback).length,2,'one image tracking delegation');
   lifecycle=lifecycle.replace(callback,require('./fixtures/viewerImageTracking.baseline.json').callback).replace('    const imageTrackingHost = this.viewerImageTrackingHost();\n','');
  }
  if(name==='cleanupWidgetEnvironment'){assert(lifecycle.includes('cleanupWidgetEnvironment(resetState, fullRemove, this.widgetTeardownHost())'));lifecycle=require('./fixtures/widgetTeardown.baseline.json').cleanup.trim().replace('this._activeViewTransfer.invalidate();','++this._viewStartupRevision;');}
  if(name==='onActiveViewChange') {
   const setup='    const hoverHandler = createMapHoverHandler(view, this.mapHoverHost());\n\n';
   assert.equal(lifecycle.split(setup).length,2,'one hover interaction binding');
   const hover=require('./fixtures/mapHoverDispatch.baseline.json');
   lifecycle=lifecycle.replace(setup,hover.setup);
   const pointer='this._coverageHoverHandler = hoverHandler';
   assert.equal(lifecycle.split(pointer).length,2,'one pointer registration');
   lifecycle=lifecycle.replace(pointer,hover.argument);
   const click='evt => dispatchMapClick(evt, this.mapClickDispatchHost(view))';
   assert.equal(lifecycle.split(click).length,2,'one production click delegation');
   lifecycle=lifecycle.replace(click,require('./fixtures/mapClickDispatch.baseline.json').callback);
   const attach='    this._activeViewTransfer.attach(transfer, this.activeViewAttachmentHost(view, jmv));\n\n';
   assert.equal(lifecycle.split(attach).length,2,'one production attachment delegation');
   lifecycle=lifecycle.replace(attach,require('./fixtures/activeViewAttachment.baseline.json').block);
   const transfer='    const transfer = this._activeViewTransfer.begin(jmv?.view);\n    if (!transfer) return;\n    const { view } = transfer;\n';
   assert.equal(lifecycle.split(transfer).length,2,'one production transfer delegation');
   lifecycle=lifecycle.replace(transfer,require('./fixtures/activeViewTransfer.baseline.json').prefix);
  }
  if(name==='onActiveViewChange') {
   // Startup moved in stage 91; retain the original lifecycle-wide cancellation placement assertion.
   const ready='() => restoreActiveView({ view, current: viewStartupCurrent, dimensionChanged, previousScale, previousCenter }, this.activeViewStartupHost(view, jmv))';
   assert.equal(lifecycle.split(ready).length,2,'one production startup delegation');
   lifecycle=lifecycle.replace(ready,require('./fixtures/activeViewStartup.baseline.json').callback);
  }
  const restored=lifecycle
   .replaceAll('this._reverseAddressEnrichment.clear();','this._reverseGeocodeAbort?.abort(); this._reverseGeocodeAbort = null;')
   .replaceAll('this._reverseAddressEnrichment.cancel();','this._reverseGeocodeAbort?.abort();');
  assert.equal(require('node:crypto').createHash('sha256').update(restored).digest('hex'),sha256);
 });
}
