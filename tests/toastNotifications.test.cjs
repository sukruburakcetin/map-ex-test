/** Compare frozen toast behavior and the extracted timer owner with a deterministic clock. */
const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React}}).outputText;
const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8').replace(/^\uFEFF/,'').replace(/\r\n/g,'\n'),sf=ts.createSourceFile('widget.tsx',source,99,true,4),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');
const member=name=>widget.members.find(n=>n.name?.getText(sf)===name),text=name=>member(name).getText(sf);
const dismiss=member('_pointCloudLifecycle').initializer.arguments[0].properties.find(p=>p.name?.getText(sf)==='dismissProgress').initializer.getText(sf);
const baseline=JSON.parse(fs.readFileSync(__dirname+'/fixtures/toastNotifications.baseline.json','utf8'));
function fixture(original,{firstHandle=1,batched=false}={}){
 const trace=[],timers=new Map(),all=new Map(),pending=[];let serial=firstHandle,fail=null;
 const setTimeout=(callback,duration)=>{const id=serial++;trace.push(['schedule',id,duration]);timers.set(id,callback);all.set(id,callback);return id};
 const clearTimeout=id=>{trace.push(['cancel',id]);if(fail==='cancel')throw 'cancel failed';timers.delete(id)};
 const m={exports:{}};new Function('module','exports','setTimeout','clearTimeout',compile(fs.readFileSync(root+'/src/features/notifications/ToastNotifications.ts','utf8')))(m,m.exports,setTimeout,clearTimeout);
 const oldDismiss='private '+baseline.dismiss.trim().replace(/^dismissProgress:/,'dismissProgress =').replace(/,$/,';');
 const code=original?baseline.fields+'\n'+baseline.method+'\n'+oldDismiss:text('_toastNotifications')+'\n'+text('showToast')+'\nprivate dismissProgress = '+dismiss+';';
 const React={createElement:(type,props)=>({type,props})};
 const Runtime=new Function('ToastNotifications','setTimeout','clearTimeout','React','OwnedMessage',compile('class Runtime{'+code+'};return Runtime;'))(m.exports.ToastNotifications,setTimeout,clearTimeout,React,'OwnedMessage');
 const w=new Runtime();if(!original)Object.defineProperties(w,{_toastTimer:{get:()=>w._toastNotifications.timer,set:value=>w._toastNotifications.timer=value},_toastOwner:{get:()=>w._toastNotifications.owner,set:value=>w._toastNotifications.owner=value}});
 w.state={};w.setState=patch=>{trace.push(['state',structuredClone(patch),w._toastOwner,w._toastTimer]);if(fail==='publish')throw 'publish failed';if(batched)pending.push(()=>Object.assign(w.state,patch));else Object.assign(w.state,patch)};
 return{w,trace,timers,show:(...args)=>w.showToast(...args),dismiss:()=>w.dismissProgress(),fire:(id,force=false)=>{const callback=(force?all:timers).get(id);assert(callback,'scheduled callback exists');timers.delete(id);callback()},flush:()=>{while(pending.length)pending.shift()()},fail:value=>fail=value};
}
function compare(action,options){const a=fixture(true,options),b=fixture(false,options);action(a);action(b);assert.deepEqual(b.trace,a.trace);assert.deepEqual(b.w.state,a.w.state);assert.deepEqual([b.w._toastTimer,b.w._toastOwner],[a.w._toastTimer,a.w._toastOwner]);assert.deepEqual([...b.timers.keys()],[...a.timers.keys()]);return b;}
for(const message of ['hello','',null,undefined,0,{type:'span',props:{children:'hello'}}])test('message conversion and expiry: '+JSON.stringify(message),()=>compare(f=>{f.show(message);assert.equal(f.timers.size,1);f.fire(1);assert.equal(f.w.state.toastMessage,undefined)}));
for(const duration of [0,-1,1,2500,5000,NaN,Infinity])test('duration retains native timeout scheduling: '+duration,()=>compare(f=>{f.show('message',duration);f.fire(1)}));
test('replacement cancels the previous timer before publishing and scheduling',()=>compare(f=>{f.show('first',10,'point-cloud-progress');f.show('second',20);assert.equal(f.w._toastOwner,undefined);assert(!f.timers.has(1));f.fire(2)}));
test('owned progress dismissal cancels before clearing ownership and UI',()=>compare(f=>{f.show('progress',10,'point-cloud-progress');f.dismiss();assert.equal(f.timers.size,0);assert.equal(f.w.state.toastMessage,undefined)}));
test('cloud dismissal preserves a newer unrelated toast and its timer',()=>compare(f=>{f.show('progress',10,'point-cloud-progress');f.show('unrelated',20);const before=f.trace.length;f.dismiss();assert.equal(f.trace.length,before);assert(f.timers.has(2))}));
test('dismissal without owned progress does nothing',()=>compare(f=>{f.dismiss();assert.equal(f.trace.length,0)}));
test('repeated dismissal publishes only once and owner remains reusable',()=>compare(f=>{f.show('progress',10,'point-cloud-progress');f.dismiss();f.dismiss();f.show('again',20,'point-cloud-progress');f.fire(2)}));
test('expired progress is no longer dismissible',()=>compare(f=>{f.show('progress',10,'point-cloud-progress');f.fire(1);const before=f.trace.length;f.dismiss();assert.equal(f.trace.length,before)}));
test('owned progress without a timer still publishes dismissal',()=>compare(f=>{f.w._toastOwner='point-cloud-progress';f.dismiss();assert.equal(f.trace.filter(e=>e[0]==='state').length,1)}));
test('zero timer handle preserves the existing truthiness guard',()=>compare(f=>{f.show('progress',10,'point-cloud-progress');f.dismiss();assert.equal(f.trace.some(e=>e[0]==='cancel'),false)},{firstHandle:0}));
test('zero timer handle replacement retains the existing native scheduling behavior',()=>compare(f=>{f.show('first');f.show('second');assert.equal(f.timers.size,2)},{firstHandle:0}));
test('queued React publication retains show/expiry patch order',()=>compare(f=>{f.show('progress',10,'point-cloud-progress');f.fire(1);assert.equal(f.w.state.toastMessage,undefined);f.flush();assert.equal(f.w.state.toastMessage,undefined)},{batched:true}));
for(const phase of ['show','expiry','dismiss'])test('publication failure retains field-update ordering: '+phase,()=>compare(f=>{
 if(phase!=='show')f.show('progress',10,'point-cloud-progress');f.fail('publish');assert.throws(()=>phase==='show'?f.show('progress',10,'point-cloud-progress'):phase==='expiry'?f.fire(1):f.dismiss(),e=>e==='publish failed');
}));
for(const phase of ['replacement','dismiss'])test('timer cancellation failure preserves existing state: '+phase,()=>compare(f=>{f.show('progress',10,'point-cloud-progress');f.fail('cancel');assert.throws(()=>phase==='replacement'?f.show('second'):f.dismiss(),e=>e==='cancel failed')}));
test('already-queued old expiry preserves existing behavior after replacement',()=>compare(f=>{f.show('first',10,'point-cloud-progress');f.show('second',20,'point-cloud-progress');f.fire(1,true);assert.equal(f.w._toastTimer,null);assert.equal(f.w._toastOwner,undefined)}));
