/** Native ArcGIS adapter with recording SDK handles and controlled readiness. */
const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const source=fs.readFileSync(path.join(__dirname,'../src/features/field-notes/nativeNoteHighlight.ts'),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return{resolve,promise}};
function setup(){
 const ready=deferred(),sdk=deferred(),events=[];let current=true,watch;const graphic={geometry:{type:'point'}};
 const view={popup:{visible:false,selectedFeature:null},whenLayerView:()=>ready.promise,openPopup:options=>{events.push('popup');view.popup.visible=true;view.popup.selectedFeature=options.features[0];},closePopup:()=>{events.push('close');view.popup.visible=false;watch?.(false)}};
 const layerView={highlight:target=>{assert.equal(target,graphic);events.push('highlight');return{remove:()=>events.push('remove-highlight')}}};
 const reactive={watch:(read,callback)=>{watch=callback;return{remove:()=>events.push('remove-watch')}}};const m={exports:{}};
 new Function('require','module','exports',code)(()=>({loadArcGISJSAPIModules:()=>sdk.promise}),m,m.exports);
 return{events,view,graphic,setCurrent:v=>current=v,ready:()=>{ready.resolve(layerView);sdk.resolve([reactive])},start:()=>m.exports.startNoteHighlight(view,{},graphic,()=>current),dismiss:()=>{view.popup.visible=false;watch(false)}};
}
test('selects using layerView.highlight and opens the corresponding native popup',async()=>{const h=setup(),pending=h.start();assert.deepEqual(h.events,[]);h.ready();const handle=await pending;assert.deepEqual(h.events,['highlight','popup']);handle.remove();assert.deepEqual(h.events,['highlight','popup','remove-highlight','remove-watch','close']);handle.remove();assert.equal(h.events.length,5)});
test('closing popup releases the highlight and observer',async()=>{const h=setup(),pending=h.start();h.ready();await pending;h.dismiss();assert.equal(h.events.filter(x=>x==='remove-highlight').length,1);assert.equal(h.events.filter(x=>x==='remove-watch').length,1)});
test('retired selection cannot highlight or open popup after SDK readiness',async()=>{const h=setup(),pending=h.start();h.setCurrent(false);h.ready();await pending;assert.deepEqual(h.events,[])});
test('cleanup does not close a popup owned by another feature',async()=>{const h=setup(),pending=h.start();h.ready();const handle=await pending;h.view.popup.selectedFeature={};handle.remove();assert(!h.events.includes('close'))});
test('synchronous popup failure releases all native handles',async()=>{const h=setup();h.view.openPopup=()=>{throw Error('popup unavailable')};const pending=h.start();h.ready();await assert.rejects(pending,{message:'popup unavailable'});assert.deepEqual(h.events,['highlight','remove-highlight','remove-watch'])});
test('late asynchronous popup opening checks selection ownership again',async()=>{const h=setup(),opened=deferred();h.view.openPopup=options=>{h.view.popup.selectedFeature=options.features[0];return opened.promise};const pending=h.start();h.ready();await pending;h.setCurrent(false);opened.resolve();await Promise.resolve();assert(h.events.includes('remove-highlight'));assert(h.events.includes('close'))});

test('popup that finishes opening after handle removal is closed again',async()=>{const h=setup(),opened=deferred();h.view.openPopup=()=>opened.promise;const pending=h.start();h.ready();const handle=await pending;h.setCurrent(false);handle.remove();h.view.popup.selectedFeature=h.graphic;h.view.popup.visible=true;opened.resolve();await Promise.resolve();assert.equal(h.view.popup.visible,false);assert.equal(h.events.filter(x=>x==='remove-highlight').length,1)});
