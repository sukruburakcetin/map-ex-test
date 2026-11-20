const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
const compile=source=>{const r=ts.transpileModule(source,{reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}});assert.equal(r.diagnostics.filter(d=>d.category===1).length,0);return r.outputText;};
const constants={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/utils/constants.ts','utf8')))(constants,constants.exports);
const owner={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/coverage/TurboViewBindings.ts','utf8')))(()=>constants.exports,owner,owner.exports);
const baseline=JSON.parse(fs.readFileSync(__dirname+'/fixtures/turboViewBindings.baseline.json'));
const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');
const field=widget.members.find(n=>n.name?.getText(sf)==='_turboViewBindings').getText(sf);
const oldClass=new Function('debounceUtil','TIMING',compile('return class Harness{'+baseline.defaults+'\nbind(view){'+baseline.bind+'}\nclear(){'+baseline.clear+'}}'));
const newClass=new Function('TurboViewBindings','debounceUtil',compile('return class Harness{'+field+'\nbind(view){this._turboViewBindings.bind(view);}\nclear(){this._turboViewBindings.clear();}}'));
function fixture(previous){
 const events=[],watches=[],debounces=[];let deferred=null;
 const debounce=(cb,ms)=>{events.push(['debounce',ms]);let queued;const fn=value=>{queued=value;events.push(['queued',value]);};fn.flush=()=>cb(queued);fn.cancel=()=>events.push(['cancel']);debounces.push(fn);return fn;};
 const C=previous?oldClass(debounce,constants.exports.TIMING):newClass(owner.exports.TurboViewBindings,debounce),w=new C();
 Object.assign(w,{state:{jimuMapView:null,turboModeActive:true,turboFilterUsername:'',sequenceId:'seq'},props:{config:{}},_selectionAbort:new AbortController(),_selectionRequestId:7,_liveSequenceFrames:{complete:false},
  enableTurboCoverageLayer(...args){events.push(['coverage',...args]);return deferred||Promise.resolve();},
  refreshActivePulseAnchor(v){events.push(['pulse',v.name]);},showCachedSequencePreview(id,request,signal){events.push(['preview',id,request,signal===this._selectionAbort.signal]);},
  showTurboInteractionHelp(){events.push(['help']);},_nativeSequenceSelection:{refreshSymbols(){events.push(['symbols']);}}});
 const view=(name,type='2d')=>({name,type,map:{},destroyed:false,watch(property,callback){const record={name,property,callback,removed:false};watches.push(record);events.push(['watch',name,property]);return{remove(){record.removed=true;events.push(['remove',name,property]);}};}});
 return{w,events,watches,debounces,view,bind(v){w.state.jimuMapView={view:v};w.bind(v);},emit(v,kind,value){const record=watches.findLast(r=>r.name===v.name&&(kind==='stationary'?r.property==='stationary':r.property!=='stationary'));assert(record);return record.callback(value);},defer(){let resolve,reject;deferred=new Promise((a,b)=>{resolve=a;reject=b;});return{resolve,reject};}};
}
async function compare(action){const traces=[];for(const previous of [true,false]){const f=fixture(previous);await action(f);traces.push({events:f.events,watches:f.watches.map(({callback,...r})=>r)});}assert.deepEqual(traces[1],traces[0]);}
for(const type of ['2d','3d']){
 test(`${type} registration and interaction callbacks preserve event order`,()=>compare(async f=>{const v=f.view('one',type);f.bind(v);f.emit(v,'zoom');f.emit(v,'stationary',true);await f.debounces[0].flush();}));
 test(`${type} replacements preserve individual handle removal order`,()=>compare(f=>{f.bind(f.view('one',type));f.bind(f.view('two',type));f.w.clear();f.w.clear();}));
}
for(const [username,creator] of [['',''],[' alice ','bob'],['  ','bob'],['',' bob '],['',undefined]]){
 test(`creator precedence ${JSON.stringify([username,creator])}`,()=>compare(async f=>{const v=f.view('one');f.bind(v);f.w.state.turboFilterUsername=username;f.w.props.config.turboCreator=creator;f.emit(v,'stationary',true);await f.debounces[0].flush();}));
}
for(const reason of ['other','map','destroyed']){
 const invalidate=(f,v)=>{if(reason==='other')f.w.state.jimuMapView={view:f.view('two')};if(reason==='map')v.map=null;if(reason==='destroyed')v.destroyed=true;};
 test(`late stationary event ignored: ${reason}`,()=>compare(async f=>{const v=f.view('one');f.bind(v);f.emit(v,'stationary',true);invalidate(f,v);await f.debounces[0].flush();}));
 test(`late zoom event ignored: ${reason}`,()=>compare(f=>{const v=f.view('one');f.bind(v);invalidate(f,v);f.emit(v,'zoom');}));
}
test('moving view does not refresh coverage',()=>compare(async f=>{const v=f.view('one');f.bind(v);f.emit(v,'stationary',false);await f.debounces[0].flush();}));
test('inactive Turbo still refreshes symbols but does not show help or fetch',()=>compare(async f=>{const v=f.view('one');f.bind(v);f.w.state.turboModeActive=false;f.emit(v,'zoom');f.emit(v,'stationary',true);await f.debounces[0].flush();}));
test('debounced refresh reads latest filter and active state',()=>compare(async f=>{const v=f.view('one');f.bind(v);f.emit(v,'stationary',true);f.w.state.turboFilterUsername='latest';await f.debounces[0].flush();}));
for(const missing of ['sequence','abort','complete']){
 test(`preview suppression: ${missing}`,()=>compare(async f=>{const v=f.view('one');f.bind(v);if(missing==='sequence')f.w.state.sequenceId=null;if(missing==='abort')f.w._selectionAbort=null;if(missing==='complete')f.w._liveSequenceFrames.complete=true;f.emit(v,'stationary',true);await f.debounces[0].flush();}));
}
test('preview identity is read after awaited coverage',()=>compare(async f=>{const v=f.view('one');f.bind(v);const d=f.defer();f.emit(v,'stationary',true);const pending=f.debounces[0].flush();f.w.state.sequenceId='latest';f.w._selectionRequestId=8;d.resolve();await pending;}));
test('coverage rejection propagates without pulse or preview',()=>compare(async f=>{const v=f.view('one');f.bind(v);const d=f.defer();f.emit(v,'stationary',true);const pending=f.debounces[0].flush();d.reject(new Error('coverage failed'));await assert.rejects(pending,/coverage failed/);}));
test('preserves in-flight completion semantics after view replacement',()=>compare(async f=>{const v=f.view('one');f.bind(v);const d=f.defer();f.emit(v,'stationary',true);const pending=f.debounces[0].flush();f.bind(f.view('two'));d.resolve();await pending;}));
test('clear preserves existing pending debounce lifetime',()=>compare(async f=>{const v=f.view('one');f.bind(v);f.emit(v,'stationary',true);f.w.clear();await f.debounces[0].flush();}));
test('clear before binding and same-view rebinding remain safe',()=>compare(f=>{f.w.clear();const v=f.view('one');f.bind(v);f.bind(v);f.w.clear();}));
