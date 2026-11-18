const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,99,true,4),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');
const member=name=>widget.members.find(n=>n.name?.getText(sf)===name).getText(sf);
const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
function fixture(){
 const events=[],graphics=[],cones=[],moves=[],warnings=[];
 class Graphic{constructor(properties){Object.assign(this,properties);graphics.push(this);events.push(['construct',properties.symbol.type]);}}
 const makeLayer=()=>({items:[],add(g){this.items.push(g);events.push(['add',g.symbol.type]);},remove(g){this.items=this.items.filter(v=>v!==g);events.push(['remove',g.symbol.type]);},removeAll(){this.items=[];events.push(['clear']);},destroy(){events.push(['layer-destroy']);},graphics:{reorder(g,index){events.push(['reorder',g.symbol.type,index]);}}});
 const Type=new Function('createConeGeometry','console',compile('return class Fixture{'+member('updateMinimapTracking')+'\n'+member('destroyMinimap')+'}'))((...args)=>{cones.push(args);return {type:'polygon',args};},{warn:(...args)=>warnings.push(args)});
 const w=new Type(),layer=makeLayer(),view={ready:true,destroyed:false,zoom:15,goTo(properties,options){const gate=deferred();moves.push({properties,options,...gate});return gate.promise;},destroy(){events.push(['view-destroy']);this.destroyed=true;w.updateMinimapTracking();}};
 Object.assign(w,{minimapGraphicsLayer:layer,minimapView:view,minimapContainer:{current:{innerHTML:'minimap'}},_minimapRevision:0,_minimapReady:true,_lastBearing:0,ArcGISModules:{Graphic},state:{imageId:'A',sequenceId:'S',sequenceImages:[]},_liveSequenceFrames:{current:{id:'A',lon:1,lat:2},find:()=>null},log(){},setState(p){Object.assign(this.state,p);}});
 return {w,layer,view,events,graphics,cones,moves,warnings,makeLayer};
}
const flush=async()=>{for(let i=0;i<5;i++)await Promise.resolve();};
test('bearing-only updates reuse dot/cone SDK graphics and navigate only once',()=>{
 const f=fixture();f.w.updateMinimapTracking();const dot=f.w._minimapFrameDot,cone=f.w._minimapFrameCone,point=dot.geometry;
 for(let i=1;i<=50;i++){f.w._lastBearing=i;f.w.updateMinimapTracking();}
 assert.equal(f.graphics.length,2);assert.equal(f.moves.length,1);assert.equal(f.w._minimapFrameDot,dot);assert.equal(dot.geometry,point);assert.equal(f.w._minimapFrameCone,cone);assert.equal(f.layer.items.length,2);assert.equal(f.cones.length,51);assert.equal(f.cones.at(-1)[2],50);
});
test('new frames move existing dot/cone and trigger one navigation per ID',()=>{
 const f=fixture();f.w.updateMinimapTracking();const dot=f.w._minimapFrameDot,point=dot.geometry;
 f.w._liveSequenceFrames.current={id:'B',lon:3,lat:4};f.w.state.imageId='B';f.w.updateMinimapTracking();f.w.updateMinimapTracking();
 assert.equal(f.graphics.length,2);assert.equal(f.moves.length,2);assert.equal(f.w._minimapFrameDot,dot);assert.notEqual(dot.geometry,point);assert.equal(dot.geometry.longitude,3);assert.deepEqual(f.moves[1].properties.center,[3,4]);assert.deepEqual(f.moves[1].options,{animate:false});
});
test('unchanged sequence geometry is retained; changed geometry replaces only its line',()=>{
 const f=fixture(),first={id:'geometry-1'};f.w._liveSequenceLine={sequenceId:'S',geometry:first};f.w.updateMinimapTracking();const line=f.w._minimapSequenceLine;
 for(let i=0;i<5;i++)f.w.updateMinimapTracking();assert.equal(f.graphics.length,3);assert.equal(f.w._minimapSequenceLine,line);
 const next={id:'geometry-2'};f.w._liveSequenceLine={sequenceId:'S',geometry:next};f.w.updateMinimapTracking();assert.equal(f.graphics.length,4);assert(!f.layer.items.includes(line));assert.equal(f.w._minimapSequenceLine.geometry,next);assert.deepEqual(f.events.at(-1),['reorder','simple-line',0]);
});
test('mismatched sequence removes the stale line and preserves frame graphics',()=>{
 const f=fixture();f.w._liveSequenceLine={sequenceId:'S',geometry:{}};f.w.updateMinimapTracking();f.w.state.sequenceId='other';f.w.updateMinimapTracking();assert.equal(f.w._minimapSequenceLine,null);assert.equal(f.layer.items.length,2);assert.equal(f.graphics.length,3);
});
test('changing tracking layer creates graphics for the new owner once',()=>{
 const f=fixture();f.w.updateMinimapTracking();const oldDot=f.w._minimapFrameDot;f.w.minimapGraphicsLayer=f.makeLayer();f.w.updateMinimapTracking();f.w.updateMinimapTracking();assert.notEqual(f.w._minimapFrameDot,oldDot);assert.equal(f.graphics.length,4);assert.equal(f.moves.length,2);assert.equal(f.w.minimapGraphicsLayer.items.length,2);
});
for(const reason of ['not-ready','no-layer','no-view','sdk-not-ready','destroyed','no-modules','no-id','no-image'])test('guard '+reason+' performs no rendering/navigation',()=>{
 const f=fixture();f.w._minimapFrameId=null;
 if(reason==='not-ready')f.w._minimapReady=false;if(reason==='no-layer')f.w.minimapGraphicsLayer=null;if(reason==='no-view')f.w.minimapView=null;if(reason==='sdk-not-ready')f.view.ready=false;if(reason==='destroyed')f.view.destroyed=true;if(reason==='no-modules')f.w.ArcGISModules=null;if(reason==='no-id')f.w.state.imageId=null;if(reason==='no-image')f.w._liveSequenceFrames.current=null;
 f.w.updateMinimapTracking();assert.equal(f.graphics.length,0);assert.equal(f.moves.length,0);assert.equal(f.cones.length,0);assert.equal(f.w._minimapFrameId,null);
});
for(const [zoom,expected] of [[0,15],[NaN,15],[-1,14],[14,14],[16,16],[20,18]])test('zoom '+zoom+' retains navigation clamp '+expected,()=>{const f=fixture();f.view.zoom=zoom;f.w.updateMinimapTracking();assert.equal(f.moves[0].properties.zoom,expected);});
for(const reason of ['abort','other','changed-view','destroyed'])test('navigation rejection '+reason+' retains warning guard',async()=>{
 const f=fixture();f.w.updateMinimapTracking();const error=new Error('navigation failed');if(reason==='abort')error.name='AbortError';if(reason==='changed-view')f.w.minimapView={};if(reason==='destroyed')f.view.destroyed=true;f.moves[0].reject(error);await flush();assert.equal(f.warnings.length,reason==='other'?1:0);if(reason==='other')assert.equal(f.warnings[0][1],error);
});
test('teardown clears before destroying view/layer and blocks reentrant tracking',()=>{
 const f=fixture();f.w.updateMinimapTracking();const count=f.moves.length,allocated=f.graphics.length;f.events.length=0;
 f.w.minimapWatchHandle={remove:()=>f.events.push(['watch-remove'])};Object.defineProperty(f.view,'container',{set:value=>{assert.equal(value,null);assert.equal(f.w.minimapView,null);f.events.push(['detach-container']);}});
 f.w.destroyMinimap();assert.deepEqual(f.events.map(e=>e[0]),['watch-remove','clear','detach-container','view-destroy','layer-destroy']);assert.equal(f.moves.length,count);assert.equal(f.graphics.length,allocated);assert.equal(f.w._minimapFrameId,null);assert.equal(f.w.minimapView,null);assert.equal(f.w.minimapGraphicsLayer,null);assert.equal(f.w.minimapContainer.current.innerHTML,'');assert.equal(f.w._minimapReady,false);
});
test('frame lookup falls back to live cache before stored sequence images',()=>{const f=fixture();f.w._liveSequenceFrames.current=null;f.w._liveSequenceFrames.find=()=>({id:'cache',lon:5,lat:6});f.w.state.sequenceImages=[{id:'A',lon:7,lat:8}];f.w.updateMinimapTracking();assert.deepEqual(f.moves[0].properties.center,[5,6]);});
test('stored sequence fallback retains string-normalized ID lookup',()=>{const f=fixture();f.w._liveSequenceFrames.current=null;f.w.state.imageId='42';f.w.state.sequenceImages=[{id:42,lon:7,lat:8}];f.w.updateMinimapTracking();assert.deepEqual(f.moves[0].properties.center,[7,8]);});
test('missing/nonfinite bearing retains zero fallback',()=>{const f=fixture();f.w._lastBearing=NaN;f.w.updateMinimapTracking();assert.deepEqual(f.cones[0],[1,2,0,30,60]);});
