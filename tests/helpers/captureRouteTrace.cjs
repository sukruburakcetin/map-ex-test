/** Record actual fixture side effects without adding awaits to provider calls. */
const assert=require('node:assert/strict');
const {fixture}=require('./captureRouteFixture.cjs');
const clean=value=>JSON.parse(JSON.stringify(value,(_key,v)=>v&&typeof v==='object'&&typeof v.message==='string'&&typeof v.name==='string'?{name:v.name,message:v.message}:v));
function recorded(f){
 const events=[],signals=[],ids=new WeakMap();const signalId=signal=>{if(!ids.has(signal)){ids.set(signal,signals.length);signals.push(signal)}return ids.get(signal)};
 const wrap=(object,name,kind,project=args=>args)=>{const old=object[name];object[name]=function(...args){events.push([kind,clean(project(args))]);return old.apply(this,args)}};
 wrap(f.api,'solve','solve',([options])=>({...options,signal:signalId(options.signal)}));
 if(f.api.preflightOrderedStops)wrap(f.api,'preflightOrderedStops','preflight',([stops,signal])=>({stops,signal:signalId(signal)}));
 for(const [name,kind] of [['createCaptureRoutingProvider','provider'],['log','log'],['_t','translate'],['showToast','toast'],['setState','state'],['buildCaptureTargetSegments','targets']])wrap(f.w,name,kind);
 wrap(f.w,'restoreRoutingLoginView','restore',()=>[]);wrap(f.w,'drawCaptureRoute','draw',([paths])=>paths);
 return{f,events,signals};
}
async function compareCaptureRoute(original,action,options={}){
 const a=recorded(fixture({...options,methodSource:original,jsxTrace:true})),b=recorded(fixture({...options,jsxTrace:true}));
 await action(a.f);await action(b.f);
 assert.deepEqual(b.events,a.events);assert.deepEqual(clean(b.f.errors),clean(a.f.errors));
 assert.deepEqual(clean(b.f.states),clean(a.f.states));assert.deepEqual(clean(b.f.coverage),clean(a.f.coverage));
 assert.deepEqual(b.signals.map(s=>s.aborted),a.signals.map(s=>s.aborted));
 assert.equal(b.f.solves.length,a.f.solves.length);assert.equal(b.f.preflights.length,a.f.preflights.length);
 return b.f;
}

module.exports={compareCaptureRoute};
