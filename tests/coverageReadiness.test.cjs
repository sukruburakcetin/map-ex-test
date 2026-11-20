const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const root=path.resolve(__dirname,'..');
const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
// Frozen pre-extraction implementation for lifecycle/result/call-order comparison.
const originalMethod="  private async waitForTurboCoverageReady(view: __esri.MapView | __esri.SceneView, layer: __esri.VectorTileLayer, signal: AbortSignal) {\n    const cancelled = () => new DOMException(\"Cancelled\", \"AbortError\");\n    if (signal.aborted) throw cancelled();\n    await new Promise<void>((resolve, reject) => {\n      let handle: __esri.WatchHandle | undefined;\n      let settled = false;\n      let deadline: ReturnType<typeof setTimeout> | undefined;\n      const finish = (error?: unknown) => {\n        if (settled) return;\n        settled = true; if (deadline) clearTimeout(deadline); handle?.remove(); signal.removeEventListener(\"abort\", abort);\n        if (error) reject(error); else resolve();\n      };\n      const abort = () => finish(cancelled());\n      signal.addEventListener(\"abort\", abort, { once: true });\n      // SceneView can keep updating at globe scale. Do not leave UX pending forever.\n      deadline = setTimeout(() => finish(new Error(\"Coverage readiness timed out\")), 15000);\n      view.whenLayerView(layer).then(layerView => {\n        if (settled) return;\n        handle = layerView.watch(\"updating\", updating => { if (!updating) finish(); });\n        if (!layerView.updating) finish();\n      }).catch(error => finish(error));\n    });\n  }\n";
const moduleSource=fs.readFileSync(root+'/src/features/coverage/coverageReadiness.ts','utf8');
const flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};
function fixture(kind) {
 const trace=[],timers=new Map(),listeners=new Set();let id=0,resolve,reject,watcher;
 const waiting=new Promise((a,b)=>{resolve=a;reject=b;});
 const signal={aborted:false,addEventListener:(name,fn,options)=>{trace.push(['listen',name,options.once]);listeners.add(fn);},removeEventListener:(name,fn)=>{trace.push(['unlisten',name]);listeners.delete(fn);}};
 const setTimeout=(fn,ms)=>{trace.push(['timer',ms]);timers.set(++id,fn);return id;};
 const clearTimeout=key=>{trace.push(['clear',key]);timers.delete(key);};
 let run;
 if(kind==='original'){const Runtime=new Function('setTimeout','clearTimeout',compile('class Runtime{'+originalMethod+'};return Runtime;'))(setTimeout,clearTimeout);const runtime=new Runtime();run=(...args)=>runtime.waitForTurboCoverageReady(...args);}
 else {const m={exports:{}};new Function('module','exports','setTimeout','clearTimeout',compile(moduleSource))(m,m.exports,setTimeout,clearTimeout);run=m.exports.waitForCoverageReady;}
 const layer={identity:'coverage'},view={whenLayerView:actual=>{assert.equal(actual,layer);trace.push(['layer']);return waiting;}};
 const layerView=updating=>({updating,watch:(name,fn)=>{trace.push(['watch',name]);watcher=fn;return {remove:()=>trace.push(['remove'])};}});
 let outcome='pending';
 return {trace,timers,listeners,signal,begin:()=>run(view,layer,signal).then(()=>{outcome='ready';},error=>{outcome=[error.name,error.message];}),resolve:updating=>resolve(layerView(updating)),reject:()=>reject(Error('layer failure')),update:value=>{trace.push(['update',value]);watcher?.(value);},abort:()=>{signal.aborted=true;for(const fn of [...listeners])fn();},timeout:()=>{for(const fn of [...timers.values()])fn();},snapshot:()=>({trace:structuredClone(trace),timers:timers.size,listeners:listeners.size,outcome})};
}
const scenarios={
 ready:async f=>{f.resolve(false);},
 updating:async f=>{f.resolve(true);await flush();f.update(true);await flush();assert.equal(f.snapshot().outcome,'pending');f.update(false);},
 preaborted:async f=>{},
 abortPending:async f=>{f.abort();},
 abortWatching:async f=>{f.resolve(true);await flush();f.abort();},
 timeoutPending:async f=>{f.timeout();},
 timeoutWatching:async f=>{f.resolve(true);await flush();f.timeout();},
 layerFailure:async f=>{f.reject();},
 lateLayerAfterAbort:async f=>{f.abort();f.resolve(false);},
 lateLayerAfterTimeout:async f=>{f.timeout();f.resolve(true);},
 lateFailureAfterAbort:async f=>{f.abort();f.reject();},
 lateEventsAfterReady:async f=>{f.resolve(false);await flush();f.abort();f.update(false);f.timeout();},
};
for(const [name,scenario] of Object.entries(scenarios))test('unchanged coverage readiness: '+name,async()=>{
 const snapshots=[];
 for(const kind of ['original','extracted']){const f=fixture(kind);if(name==='preaborted')f.signal.aborted=true;const pending=f.begin();await scenario(f);await pending;await flush();const result=f.snapshot();assert.equal(result.timers,0);assert.equal(result.listeners,0);assert.notEqual(result.outcome,'pending');snapshots.push(result);}
 assert.deepEqual(snapshots[1],snapshots[0]);
 if(name==='ready'||name==='updating'||name==='lateEventsAfterReady')assert.equal(snapshots[1].outcome,'ready');
 if(name==='preaborted')assert.deepEqual(snapshots[1].trace,[]);
 if(name.includes('Timeout')||name.startsWith('timeout'))assert.deepEqual(snapshots[1].outcome,['Error','Coverage readiness timed out']);
 if(name==='lateLayerAfterAbort'||name==='lateLayerAfterTimeout')assert(!snapshots[1].trace.some(x=>x[0]==='watch'));
});
test('widget forwards the same view, layer and cancellation signal to coverage owner',async()=>{
 const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,99,true,4),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget'),method=widget.members.find(n=>n.name?.getText(sf)==='waitForTurboCoverageReady').getText(sf);
 const view={},layer={},signal=new AbortController().signal,result=Promise.resolve(),calls=[];
 const Runtime=new Function('waitForCoverageReady',compile('class Runtime{'+method+'};return Runtime;'))((...args)=>{calls.push(args);return result;});
 assert.equal(new Runtime().waitForTurboCoverageReady(view,layer,signal),result);assert.deepEqual(calls,[[view,layer,signal]]);
});
