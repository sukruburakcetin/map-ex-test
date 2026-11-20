const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const root=path.resolve(__dirname,'..'),compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const originalMethods="  private clearSequenceDiagnostics() {\n    this._sequenceLongTaskObserver?.disconnect(); this._sequenceLongTaskObserver = null;\n    const registry = typeof window === 'undefined' ? undefined : (window as any).__mapillarySequencePerformance;\n    if (registry && registry[this.props.id] === this._sequenceDiagnosticsEntry) delete registry[this.props.id];\n    this._sequenceDiagnosticsEntry = null;\n  }\n\n  private syncSequenceDiagnostics() {\n    this.clearSequenceDiagnostics();\n    if (!this.props.config.debugMode || this.props.state === 'CLOSED' || typeof window === 'undefined') return;\n    const registry = (window as any).__mapillarySequencePerformance ??= Object.create(null);\n    const entry = { snapshot: () => this.sequenceDiagnosticsSnapshot(), reset: () => { this._sequencePerformance.reset(); this._nearbyDiscovery?.resetStats(); } };\n    registry[this.props.id] = entry; this._sequenceDiagnosticsEntry = entry;\n    if (typeof PerformanceObserver !== 'undefined' && PerformanceObserver.supportedEntryTypes?.includes('longtask')) {\n      this._sequenceLongTaskObserver = new PerformanceObserver(list => {\n        for (const task of list.getEntries()) this._sequencePerformance.recordLongTask(task.duration);\n      });\n      this._sequenceLongTaskObserver.observe({ type: 'longtask', buffered: false });\n    }\n  }\n";
const moduleSource=fs.readFileSync(root+'/src/features/imagery/SequenceDiagnostics.ts','utf8');
function fixture(kind,options={}){
 const trace=[],observers=[],browser=options.noWindow?undefined:{};let value=1;
 class Observer {static supportedEntryTypes=options.noSupport?['resource']:options.noTypes?undefined:['longtask'];constructor(callback){this.callback=callback;this.number=observers.length;observers.push(this);trace.push(['create',this.number]);}observe(options){trace.push(['observe',this.number,options]);}disconnect(){trace.push(['disconnect',this.number]);}}
 const host={snapshot:()=>{trace.push(['snapshot',value]);return {value};},reset:()=>{trace.push(['reset',value]);value++;},recordLongTask:duration=>trace.push(['longtask',duration])};
 const observerType=options.noObserver?undefined:Observer;
 const m={exports:{}};new Function('module','exports','window','PerformanceObserver',compile(moduleSource))(m,m.exports,browser,observerType);
 let runtime;
 if(kind==='original'){
  const Runtime=new Function('window','PerformanceObserver',compile('class Runtime{'+originalMethods+'};return Runtime;'))(browser,observerType);runtime=new Runtime();runtime._sequenceDiagnosticsEntry=null;runtime._sequenceLongTaskObserver=null;runtime.props={id:'A',config:{debugMode:true}};runtime.sequenceDiagnosticsSnapshot=host.snapshot;runtime._sequencePerformance={reset:host.reset,recordLongTask:host.recordLongTask};
 }else runtime=new m.exports.SequenceDiagnostics(host);
 const sync=(enabled=true,closed=false,id='A')=>{if(kind==='original'){runtime.props={id,config:{debugMode:enabled},state:closed?'CLOSED':'OPENED'};runtime.syncSequenceDiagnostics();}else runtime.sync(id,enabled,closed);};
 const clear=(id='A')=>{if(kind==='original'){runtime.props.id=id;runtime.clearSequenceDiagnostics();}else runtime.clear(id);};
 return {trace,browser,observers,sync,clear,host,owner:m.exports.SequenceDiagnostics,registry:()=>browser?.__mapillarySequencePerformance,state:()=>({trace:structuredClone(trace),keys:Object.keys(browser?.__mapillarySequencePerformance||{}),nullPrototype:browser?.__mapillarySequencePerformance?Object.getPrototypeOf(browser.__mapillarySequencePerformance)===null:null}),emit:(index,durations)=>observers[index].callback({getEntries:()=>durations.map(duration=>({duration}))})};
}
const scenarios={
 enabled:f=>{f.sync();assert.equal(f.observers.length,1);assert.equal(Object.getPrototypeOf(f.registry()),null);},
 disabled:f=>{f.sync(false);assert.equal(f.registry(),undefined);},
 closed:f=>{f.sync(true,true);assert.equal(f.registry(),undefined);},
 noWindow:f=>{f.sync();assert.equal(f.observers.length,0);},
 noObserver:f=>{f.sync();assert(f.registry().A);assert.equal(f.observers.length,0);},
 noSupport:f=>{f.sync();assert(f.registry().A);assert.equal(f.observers.length,0);},
 noTypes:f=>{f.sync();assert(f.registry().A);assert.equal(f.observers.length,0);},
 callbacks:f=>{f.sync();assert.deepEqual(f.registry().A.snapshot(),{value:1});f.registry().A.reset();assert.deepEqual(f.registry().A.snapshot(),{value:2});},
 longtasks:f=>{f.sync();f.emit(0,[10,75,120]);},
 emptyLongtasks:f=>{f.sync();f.emit(0,[]);},
 clear:f=>{f.sync();f.clear();assert(!f.registry().A);},
 clearTwice:f=>{f.sync();f.clear();f.clear();assert.equal(f.trace.filter(x=>x[0]==='disconnect').length,1);},
 resync:f=>{f.sync();const first=f.registry().A;f.sync();assert.notEqual(f.registry().A,first);assert.equal(f.observers.length,2);},
 disableAfterEnable:f=>{f.sync();f.sync(false);assert(!f.registry().A);},
 closeAfterEnable:f=>{f.sync();f.sync(true,true);assert(!f.registry().A);},
 preserveReplacement:f=>{f.sync();const replacement={sentinel:true};f.registry().A=replacement;f.clear();assert.equal(f.registry().A,replacement);},
 preserveOtherWidget:f=>{f.sync();f.registry().B={sentinel:true};f.clear();assert.deepEqual(f.registry().B,{sentinel:true});},
 preserveExistingRegistry:f=>{f.browser.__mapillarySequencePerformance={B:{sentinel:true}};f.sync();assert(f.registry().B.sentinel);f.clear();},
};
for(const [name,scenario] of Object.entries(scenarios))test('unchanged diagnostic lifecycle: '+name,()=>{
 const results=[];for(const kind of ['original','extracted']){const options={};if(['noWindow','noObserver','noSupport','noTypes'].includes(name))options[name]=true;const f=fixture(kind,options);scenario(f);results.push(f.state());}assert.deepEqual(results[1],results[0]);
});
test('widget delegates current gates and keeps snapshot/reset callbacks live',()=>{
 const f=fixture('extracted'),source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,99,true,4),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');
 const names=['_sequenceDiagnostics','clearSequenceDiagnostics','syncSequenceDiagnostics'],members=widget.members.filter(n=>n.name&&names.includes(n.name.getText(sf))).map(n=>n.getText(sf)).join('\n');
 const Runtime=new Function('SequenceDiagnostics',compile('class Runtime{'+members+'};return Runtime;'))(f.owner),w=new Runtime();let snapshot=1,resets=0,nearbyResets=0;w.props={id:'A',config:{debugMode:false},state:'OPENED'};w.sequenceDiagnosticsSnapshot=()=>({snapshot});w._sequencePerformance={reset:()=>resets++,recordLongTask:f.host.recordLongTask};w.syncSequenceDiagnostics();assert(!f.registry());w.props.config.debugMode=true;w.syncSequenceDiagnostics();assert.deepEqual(f.registry().A.snapshot(),{snapshot:1});snapshot=2;assert.deepEqual(f.registry().A.snapshot(),{snapshot:2});f.registry().A.reset();assert.equal(resets,1);w._nearbyDiscovery={resetStats:()=>nearbyResets++};f.registry().A.reset();assert.equal(nearbyResets,1);w.props.state='CLOSED';w.syncSequenceDiagnostics();assert(!f.registry().A);w.clearSequenceDiagnostics();
});
