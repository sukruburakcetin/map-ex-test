const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),test=require('node:test'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const source=fs.readFileSync(path.join(__dirname,'../src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');
const methods=['setupDetectionHover','toggleAiTags'].map(name=>widget.members.find(n=>n.name?.getText(sf)===name).getText(sf)).join('\n');
class PolygonGeometry {constructor(polygon){this.polygon=polygon}}
class OutlineTag {constructor(id,geometry,options){Object.assign(this,{id,geometry,options})}}
// Bounds are outside this label-only suite; the geometry adapter is explicitly inert,
// matching the existing detection-exploration fixture. SDK outlines and timers stay controlled.
function fixture(target=null){const intervals=new Map(),timeouts=new Map(),viewerHandlers=new Map(),visibility=[],active=[];let counter=0;const Harness=new Function('PolygonGeometry','OutlineTag','getDetectionColor','detectionThumbnailBounds','setInterval','clearInterval','setTimeout','clearTimeout',ts.transpileModule('class Harness{'+methods+'};return Harness;',{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText)(PolygonGeometry,OutlineTag,()=>0x00ff00,()=>undefined,callback=>{intervals.set(++counter,callback);return counter},id=>intervals.delete(id),callback=>{timeouts.set(++counter,callback);return counter},id=>timeouts.delete(id));const w=new Harness(),container=new EventTarget(),tags=['pole','stop'].map(id=>new OutlineTag(id,new PolygonGeometry([[0,0],[1,1]]),{text:id})),component={tags,ids:[],async getTagIdsAt(){return this.ids},removeAll(){this.tags=[]},add(tags){this.tags.push(...tags)}};container.querySelector=()=>({getBoundingClientRect:()=>({left:0,top:0})});w.viewerContainer={current:container};w.state={showAiTags:true,targetDetectionId:target,imageId:'image-A',detectionsActive:true};w.setState=(update,done)=>{Object.assign(w.state,typeof update==='function'?update(w.state):update);done?.()};w.mapillaryViewer={getComponent:()=>component,on:(name,callback)=>viewerHandlers.set(name,callback),off:(name,callback)=>{if(viewerHandlers.get(name)===callback)viewerHandlers.delete(name)}};w._panoramaDetectionLabels={setVisible:value=>visibility.push(value),setActive:ids=>active.push(ids)};w.getDetectionValueFromTagId=id=>'object--'+id;w.setupDetectionHover(component,tags);return {w,component,intervals,timeouts,container,viewerHandlers,visibility,active,flushTimeouts(){const callbacks=[...timeouts.values()];timeouts.clear();for(const callback of callbacks)callback()}}}
test('off/on restores all labels with no hovered or selected detection',()=>{const x=fixture();for(let i=0;i<3;i++){x.w.toggleAiTags();assert.equal(x.w.state.showAiTags,false);assert(x.component.tags.every(tag=>tag.options.text===''));assert.equal(x.component.tags.length,2);x.w.toggleAiTags();assert.equal(x.w.state.showAiTags,true);assert.deepEqual(x.component.tags.map(tag=>tag.options.text),['Object Pole','Object Stop']);assert.equal(x.component.tags.length,2);}x.component._detectionHoverCleanup()});
test('target flashing preserves label setting and outline emphasis',()=>{const x=fixture('stop');x.component._refreshDetectionLabels();assert(x.component.tags.every(tag=>tag.options.text));assert.equal(x.component.tags.find(tag=>tag.id==='stop').options.lineWidth,4);x.w.toggleAiTags();for(const callback of x.intervals.values())callback();assert(x.component.tags.every(tag=>tag.options.text===''));x.w.toggleAiTags();for(const callback of x.intervals.values())callback();assert(x.component.tags.every(tag=>tag.options.text));assert.equal(x.component.tags.find(tag=>tag.id==='stop').options.fillOpacity,0);x.component._detectionHoverCleanup();assert.equal(x.intervals.size,0);assert.equal(x.component._refreshDetectionLabels,undefined)});
test('toggle works safely before detection tags have loaded',()=>{const x=fixture();x.component._detectionHoverCleanup();x.w.toggleAiTags();assert.equal(x.w.state.showAiTags,false);x.w.toggleAiTags();assert.equal(x.w.state.showAiTags,true)});


/** Dispatch a pointer event and settle the async tag hit without advancing fake timers. */
async function move(x){
 x.container.dispatchEvent(Object.assign(new Event('mousemove'),{clientX:20,clientY:30}));
 await new Promise(resolve=>setImmediate(resolve));
}
test('label toggle forwards visibility to panorama labels without replacing the viewer or outline geometry',()=>{
 const x=fixture(),viewer=x.w.mapillaryViewer,polygons=x.component.tags.map(tag=>tag.geometry.polygon);
 x.w.toggleAiTags();x.w.toggleAiTags();
 assert.deepEqual(x.visibility,[false,true]);assert.strictEqual(x.w.mapillaryViewer,viewer);
 x.component.tags.forEach((tag,i)=>assert.strictEqual(tag.geometry.polygon,polygons[i]));
 x.component._detectionHoverCleanup();
});
test('focus mode limits label text to hovered or targeted detections and all mode restores labels',async()=>{
 const x=fixture('stop');x.w.state.detectionExplorer={labelMode:'focus'};x.component._refreshDetectionLabels();
 assert.deepEqual(x.component.tags.map(tag=>tag.options.text),['','Object Stop']);
 assert.deepEqual([...x.active.at(-1)],['stop']);x.component.ids=['pole'];await move(x);x.flushTimeouts();
 assert.deepEqual(x.component.tags.map(tag=>tag.options.text),['Object Pole','Object Stop']);
 x.w.toggleAiTags();assert(x.component.tags.every(tag=>tag.options.text===''));
 x.w.toggleAiTags();assert(x.component.tags.every(tag=>tag.options.text));
 x.container.dispatchEvent(new Event('mouseleave'));
 assert.deepEqual(x.component.tags.map(tag=>tag.options.text),['','Object Stop']);
 x.w.state.detectionExplorer.labelMode='all';x.component._refreshDetectionLabels();
 assert(x.component.tags.every(tag=>tag.options.text));assert.strictEqual(x.active.at(-1),null);
 x.component._detectionHoverCleanup();
});
test('viewer removal retires pending hover, flash timer and label callback without touching a replacement viewer',async()=>{
 const x=fixture('stop');let resolve;x.component.getTagIdsAt=()=>new Promise(done=>resolve=done);
 await move(x);const cleanup=x.viewerHandlers.get('remove');assert.equal(typeof cleanup,'function');
 const replacement={getComponent:()=>null};x.w.mapillaryViewer=replacement;cleanup();cleanup();
 assert.equal(x.intervals.size,0);assert.equal(x.timeouts.size,0);assert.equal(x.viewerHandlers.size,0);
 assert.equal(x.component._refreshDetectionLabels,undefined);const tags=x.component.tags;
 resolve(['pole']);await new Promise(done=>setImmediate(done));x.flushTimeouts();
 assert.strictEqual(x.component.tags,tags);assert.strictEqual(x.w.mapillaryViewer,replacement);
 x.w.toggleAiTags();assert.deepEqual(x.visibility,[false]);
});
test('newer pointer hit wins when an older tag query completes last',async()=>{
 const x=fixture();x.w.state.detectionExplorer={labelMode:'focus'};const resolve=[];
 x.component.getTagIdsAt=()=>new Promise(done=>resolve.push(done));await move(x);await move(x);
 resolve[1](['stop']);await new Promise(done=>setImmediate(done));x.flushTimeouts();
 assert.deepEqual(x.component.tags.map(tag=>tag.options.text),['','Object Stop']);const tags=x.component.tags;
 resolve[0](['pole']);await new Promise(done=>setImmediate(done));x.flushTimeouts();
 assert.strictEqual(x.component.tags,tags);assert.deepEqual(x.component.tags.map(tag=>tag.options.text),['','Object Stop']);
 x.component._detectionHoverCleanup();
});
