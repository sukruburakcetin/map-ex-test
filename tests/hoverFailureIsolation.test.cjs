const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const source=fs.readFileSync(path.join(__dirname,'../src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
let pointer;function visit(node){if(ts.isCallExpression(node)&&node.expression.getText(sf)==='view.on'&&node.arguments[0]?.text==='pointer-move')pointer=node.arguments[1];ts.forEachChild(node,visit)}visit(sf);assert(pointer);
const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function deferred(){let resolve,reject;return{promise:new Promise((yes,no)=>{resolve=yes;reject=no}),resolve,reject};}
function setup({type='3d',pick,feature,hit}={}){
 const jobs=[],trace=[],view={type,zoom:19.9,container:{getBoundingClientRect:()=>({left:0,top:0})}};
 const w={state:{turboModeActive:true,jimuMapView:{view}},turboCoverageLayer:{},tooltipDiv:{},
  pickTurboGraphic:pick||(async()=>({attributes:{image_id:'image'}})),hitTestHoverLayers:hit||(async()=>({results:[]})),pickMapFeature:feature||(async()=>null),
  updateTurboHover:()=>trace.push('imagery'),clearTurboHoverDetails:()=>trace.push('clear'),
  log:()=>trace.push('debug'),updateTurboPickWarning:()=>trace.push('warning'),_t:key=>key};
 const handler=new Function('view','TURBO_LIMITS','LAYER_IDS','setTimeout','clearTimeout','renderMapFeatureHoverLabel',compile('let hoverHitTestTimeout=null;return ('+pointer.getText(sf)+');')).call(w,view,{pickRadiusPx:8,hoverRadiusPx:8},{OBJECTS_FL:'objects',TRAFFIC_SIGNS_FL:'signs'},fn=>{jobs.push(fn);return jobs.length},()=>{},()=>trace.push('feature label'));
 return{w,view,trace,move:()=>handler({x:100,y:100}),run:()=>jobs.shift()()};
}
for(const type of ['2d','3d'])test(`${type}: failed native detection lookup preserves successful coverage hover without an imagery error`,async()=>{
 const x=setup({type,feature:async()=>{throw Error('optional feature unavailable')}});x.move();await x.run();
 assert(x.trace.includes('imagery'));assert(!x.trace.includes('clear'));assert(!x.trace.includes('warning'));
});
test('a detection error before slow coverage completion does not cancel that coverage',async()=>{
 const coverage=deferred(),x=setup({pick:()=>coverage.promise,feature:async()=>{throw Error('feature failure')}});
 x.move();const task=x.run();await flush();coverage.resolve({attributes:{image_id:'image'}});await task;
 assert(x.trace.includes('imagery'));assert(!x.trace.includes('clear'));assert(!x.trace.includes('warning'));
});
test('a successful native detection retains priority over imagery',async()=>{
 const x=setup({feature:async()=>({graphic:{attributes:{name:'Sign'}}})});x.move();await x.run();assert.equal(x.trace.at(-1),'feature label');assert(x.trace.includes('clear'));
});
test('an SDK detection hit avoids the native fallback and retains priority',async()=>{
 let calls=0;const x=setup({hit:async()=>({results:[{layer:{id:'signs'},graphic:{attributes:{name:'Sign'}}}]}),feature:async()=>{calls++;throw Error('must not run')}});x.move();await x.run();assert.equal(calls,0);assert.equal(x.trace.at(-1),'feature label');
});
test('a failed optional lookup cannot manufacture a hover when coverage misses',async()=>{
 const x=setup({pick:async()=>null,feature:async()=>{throw Error('feature failure')}});x.move();await x.run();assert(!x.trace.includes('imagery'));assert(x.trace.includes('clear'));assert(!x.trace.includes('warning'));
});
test('late failure after pointer cancellation produces neither fallback feedback nor warnings',async()=>{
 const feature=deferred(),x=setup({feature:()=>feature.promise});x.move();const work=x.run();await flush();x.w._turboHoverPickAbort.abort();const before=x.trace.slice();feature.reject(Error('late failure'));await work;assert.deepEqual(x.trace,before);
});
test('late failure after view replacement produces neither fallback feedback nor warnings',async()=>{
 const feature=deferred(),x=setup({feature:()=>feature.promise});x.move();const work=x.run();await flush();x.w.state.jimuMapView.view={};const before=x.trace.slice();feature.reject(Error('old view'));await work;assert.deepEqual(x.trace,before);
});
