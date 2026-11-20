const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
function compile(source){const r=ts.transpileModule(source,{reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}});assert.equal(r.diagnostics.filter(d=>d.category===1).length,0);return r.outputText;}
const baseline=JSON.parse(fs.readFileSync(__dirname+'/fixtures/sequencePaint.baseline.json'));
const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');
const method=widget.members.find(n=>n.name?.getText(sf)==='waitForSequencePaint').getText(sf);
const moduleSource=compile(fs.readFileSync(root+'/src/features/imagery/sequencePaint.ts','utf8'));
function fixture(previous,{visibility='visible',missing=false,abortOnListen=false}={}){
 const events=[],frames=new Map(),listeners=new Set();let next=0;
 const signal={aborted:false,addEventListener(name,fn,options){events.push(['listen',name,options]);listeners.add(fn);if(abortOnListen)this.aborted=true;},removeEventListener(name,fn){events.push(['unlisten',name]);listeners.delete(fn);}};
 const doc=missing?undefined:{visibilityState:visibility};
 const request=cb=>{const id=++next;frames.set(id,cb);events.push(['request',id]);return id;};
 const cancel=id=>{events.push(['cancel',id]);frames.delete(id);};
 const globals=['document','requestAnimationFrame','cancelAnimationFrame','DOMException'];
 const values=[doc,request,cancel,DOMException];
 let C;
 if(previous)C=new Function(...globals,compile('return class Harness{'+baseline.method+'}'))(...values);
 else{const m={exports:{}};new Function(...globals,'module','exports',moduleSource)(...values,m,m.exports);C=new Function('waitForSequencePaint',compile('return class Harness{'+method+'}'))(m.exports.waitForSequencePaint);}
 let outcome='pending';const pending=new C().waitForSequencePaint(signal).then(()=>{outcome='resolved';events.push(['resolve']);},e=>{outcome=e.name;events.push(['reject',e.name,e.message]);});
 return{events,frames,listeners,signal,doc,pending,get outcome(){return outcome;},abort(){signal.aborted=true;for(const fn of [...listeners])fn();},frame(){const first=frames.entries().next().value;assert(first,'expected scheduled frame');frames.delete(first[0]);events.push(['frame',first[0]]);first[1]();}};
}
const tick=()=>Promise.resolve();
async function compare(action,options){const traces=[];for(const previous of [true,false]){const f=fixture(previous,options);await action(f);await tick();traces.push({events:f.events,outcome:f.outcome,frames:[...f.frames.keys()],listeners:f.listeners.size});}assert.deepEqual(traces[1],traces[0]);return traces[1];}
test('resolves only after two frames and removes listener',async()=>{const trace=await compare(async f=>{assert.equal(f.outcome,'pending');f.frame();await tick();assert.equal(f.outcome,'pending');f.frame();await f.pending;assert.equal(f.outcome,'resolved');assert.equal(f.listeners.size,0);});assert.equal(trace.frames.length,0);});
for(const visibility of ['hidden','prerender','unloaded'])test(`rejects document ${visibility} before scheduling`,()=>compare(async f=>{await tick();assert.equal(f.outcome,'AbortError');await f.pending;assert.equal(f.frames.size,0);assert.equal(f.listeners.size,0);},{visibility}));
test('missing document rejects without scheduling',()=>compare(async f=>{await f.pending;assert.equal(f.frames.size,0);},{missing:true}));
test('abort before first frame cancels queued frame',()=>compare(async f=>{f.abort();await f.pending;assert.equal(f.frames.size,0);assert.equal(f.listeners.size,0);assert.equal(f.outcome,'AbortError');}));
test('abort between frames cancels second frame',()=>compare(async f=>{f.frame();f.abort();await f.pending;assert.equal(f.frames.size,0);assert.equal(f.outcome,'AbortError');}));
test('repeated abort does not repeat cleanup',()=>compare(async f=>{f.abort();f.abort();await f.pending;}));
test('abort after completion leaves resolved result unchanged',()=>compare(async f=>{f.frame();f.frame();await f.pending;f.abort();assert.equal(f.outcome,'resolved');}));
test('visibility is checked at entry, not again between frames',()=>compare(async f=>{f.doc.visibilityState='hidden';f.frame();f.frame();await f.pending;assert.equal(f.outcome,'resolved');}));
test('abort racing listener registration is caught by trailing check',()=>compare(async f=>{await f.pending;assert.equal(f.outcome,'AbortError');assert.equal(f.frames.size,0);},{abortOnListen:true}));
test('pre-aborted signal rejects before scheduling',async()=>{
 // Execute both actual implementations with a real already-aborted signal.
 const c=new AbortController();c.abort();const traces=[];
 for(const previous of [true,false]){
  const m={exports:{}},events=[];const args=[{visibilityState:'visible'},()=>events.push('request'),()=>events.push('cancel'),DOMException];let run;
  if(previous){const C=new Function('document','requestAnimationFrame','cancelAnimationFrame','DOMException',compile('return class Harness{'+baseline.method+'}'))(...args);run=s=>new C().waitForSequencePaint(s);}
  else{new Function('document','requestAnimationFrame','cancelAnimationFrame','DOMException','module','exports',moduleSource)(...args,m,m.exports);run=m.exports.waitForSequencePaint;}
  await assert.rejects(run(c.signal),{name:'AbortError',message:'Cancelled'});traces.push(events);
 }assert.deepEqual(traces,[[],[]]);
});
