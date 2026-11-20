const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const root=path.resolve(__dirname,'..'),compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
// Frozen original transport: compare outcomes, requests, retries, timing and cache publication.
const originalMethod="  private async fetchTurboTileBuffer(tile: [number, number, number], signal: AbortSignal, token: string): Promise<ArrayBuffer> {\n    const [x, y, z] = tile, key = `${z}/${x}/${y}`;\n    const url = `${TILE_URLS.COVERAGE.replace(\"{z}\", String(z)).replace(\"{x}\", String(x)).replace(\"{y}\", String(y))}?access_token=${token}`;\n    const timing = this._sequencePerformance?.begin('tile-load');\n    this._sequencePerformance?.count('tileRequests');\n    try {\n      for (let attempt = 0; attempt < 2; attempt++) {\n        if (signal.aborted) throw new DOMException(\"Cancelled\", \"AbortError\");\n        try {\n          const response = await fetch(url, { signal });\n          if (response.status === 204 || response.status === 404) {\n            if (signal.aborted) throw new DOMException(\"Cancelled\", \"AbortError\");\n            const empty = new ArrayBuffer(0);\n            if (this.accessToken !== token) throw new DOMException(\"Cancelled\", \"AbortError\");\n            this._turboTileCache.set(key, empty); timing?.finish();\n            return empty;\n          }\n          if (!response.ok) {\n            if (attempt === 0 && (response.status === 429 || response.status >= 500)) {\n              await new Promise(resolve => setTimeout(resolve, 200));\n              continue;\n            }\n            const error = new Error(`Turbo tile ${key}: HTTP ${response.status}`) as Error & { status: number };\n            error.status = response.status;\n            throw error;\n          }\n          const buffer = await response.arrayBuffer();\n          if (signal.aborted) throw new DOMException(\"Cancelled\", \"AbortError\");\n          if (this.accessToken !== token) throw new DOMException(\"Cancelled\", \"AbortError\");\n          this._turboTileCache.set(key, buffer); timing?.finish();\n          return buffer;\n        } catch (err) {\n          const status = (err as any)?.status;\n          if (signal.aborted || (err as any)?.name === \"AbortError\" || attempt === 1 || (status && status !== 429 && status < 500)) throw err;\n          await new Promise(resolve => setTimeout(resolve, 200));\n        }\n      }\n      throw new Error(`Turbo tile ${key} could not load`);\n    } finally { timing?.cancel(); }\n  }\n";
const source=fs.readFileSync(root+'/src/features/coverage/coverageTileTransport.ts','utf8');
const scenarios={
 success:{steps:[200]},empty204:{steps:[204]},missing404:{steps:[404]},
 badRequest:{steps:[400]},unauthorized:{steps:[401]},forbidden:{steps:[403]},
 rateLimitRecovery:{steps:[429,200]},serverRecovery:{steps:[503,200]},serverExhausted:{steps:[500,503]},rateLimitExhausted:{steps:[429,429]},
 networkRecovery:{steps:['network',200]},networkExhausted:{steps:['network','network']},bodyRecovery:{steps:['body',200]},bodyExhausted:{steps:['body','body']},
 preaborted:{steps:[200],preabort:true},abortBody:{steps:[200],abortBody:true},staleBody:{steps:[200],staleBody:true},staleEmpty:{steps:[204],staleFetch:true},abortEmpty:{steps:[404],abortFetch:true},abortBackoff:{steps:[500,200],abortBackoff:true},abortError:{steps:['abort']},noTiming:{steps:[200],noTiming:true},
};
async function execute(kind,options){
 const trace=[],controller=new AbortController();let token='fixture-token',index=0;
 if(options.preabort)controller.abort();
 const setTimeout=(fn,ms)=>{trace.push(['delay',ms]);if(options.abortBackoff)controller.abort();fn();return 1;};
 const bytes=new ArrayBuffer(7),timing=options.noTiming?undefined:{finish:()=>trace.push(['finish']),cancel:()=>trace.push(['cancel'])};
 const host={getToken:()=>token,begin:()=>{trace.push(['begin']);return timing;},count:()=>trace.push(['count']),publish:(key,value)=>trace.push(['cache',key,value.byteLength])};
 const fetch=async(url,{signal})=>{
  assert.equal(signal,controller.signal);trace.push(['fetch',url]);const step=options.steps[index++];assert.notEqual(step,undefined,'request budget exceeded');
  if(step==='network')throw Error('network failure');if(step==='abort')throw new DOMException('Cancelled','AbortError');
  if(options.staleFetch)token='replacement';if(options.abortFetch)controller.abort();
  return {status:typeof step==='number'?step:200,ok:step==='body'||(step>=200&&step<300),arrayBuffer:async()=>{trace.push(['body']);if(step==='body')throw Error('body failure');if(options.abortBody)controller.abort();if(options.staleBody)token='replacement';return bytes;}};
 };
 let run;
 if(kind==='original'){
  const Runtime=new Function('fetch','setTimeout','TILE_URLS',compile('class Runtime{'+originalMethod+'};return Runtime;'))(fetch,setTimeout,{COVERAGE:'https://fixture.invalid/{z}/{x}/{y}'}),w=new Runtime();
  Object.defineProperty(w,'accessToken',{get:()=>token});w._sequencePerformance={begin:host.begin,count:host.count};w._turboTileCache={set:host.publish};run=()=>w.fetchTurboTileBuffer([3,4,6],controller.signal,'fixture-token');
 }else {const m={exports:{}};new Function('module','exports','fetch','setTimeout',compile(source))(m,m.exports,fetch,setTimeout);run=()=>m.exports.fetchCoverageTile([3,4,6],controller.signal,'fixture-token','https://fixture.invalid/{z}/{x}/{y}',host);}
 let outcome;try{const b=await run();outcome=['bytes',b.byteLength];}catch(error){outcome=['error',error.name,error.message,error.status];}
 return {trace,outcome,requests:index};
}
for(const [name,options] of Object.entries(scenarios))test('unchanged tile transport: '+name,async()=>{
 const a=await execute('original',options),b=await execute('extracted',options);assert.deepEqual(b,a);assert(b.requests<=2);
 if(name==='success')assert.deepEqual(b.outcome,['bytes',7]);
 if(name==='empty204'||name==='missing404')assert.deepEqual(b.outcome,['bytes',0]);
 if(name.startsWith('stale')||name.startsWith('abort')||name==='preaborted'){assert.equal(b.outcome[1],'AbortError');assert(!b.trace.some(x=>x[0]==='cache'));}
 if(name==='badRequest'||name==='unauthorized'||name==='forbidden')assert.equal(b.requests,1);
 if(name.includes('Recovery'))assert.deepEqual(b.trace.filter(x=>x[0]==='delay'),[['delay',200]]);
});
