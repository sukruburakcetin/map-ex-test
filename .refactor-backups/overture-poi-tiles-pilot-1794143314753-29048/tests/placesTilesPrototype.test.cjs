const fs=require('node:fs'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),m={exports:{}};
new Function('exports',ts.transpileModule(fs.readFileSync(require('node:path').join(__dirname,'../src/features/places/PlacesTilesPrototype.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports);
function setup(query){
 const events=[],chosen=[];let watcher;
 class Tiles{load(){return Promise.resolve()}destroy(){events.push('destroy-tiles')}}
 class Service{fields=[{name:'gers_id'}];load(){return Promise.resolve()}queryFeatures(q,o){events.push(q);return query(q,o)}destroy(){events.push('destroy-service')}}
 const view={ready:true,stationary:true,map:{add(){events.push('add')},remove(){events.push('remove')}},watch(_,fn){watcher=fn;return{remove(){}}},on(){return{remove(){events.push('remove-click')}}},toMap:p=>({...p,spatialReference:{wkid:3857}}),toScreen:p=>p};
 const errors=[];const p=new m.exports.PlacesTilesPrototype({view,modules:{VectorTileLayer:Tiles,FeatureLayer:Service},selected:a=>chosen.push(a.gers_id),error:e=>errors.push(e)});
 return {p,events,chosen,errors,move:()=>watcher(false)};
}
const start=h=>h.p.start('https://example.org/VectorTileServer/resources/styles/root.json','https://example.org/FeatureServer/0');
test('native tiles are attached and click query is bounded and unfiltered',async()=>{
 const h=setup(async()=>({features:[{attributes:{gers_id:'a'},geometry:{x:1,y:2}}]}));await start(h);await h.p.pick({x:0,y:0});
 assert.deepEqual(h.chosen,['a']);const q=h.events.find(e=>e.num);assert.equal(q.num,32);assert.equal(q.where,'1=1');h.p.stop();assert(h.events.includes('remove-click'));
});
test('truncated candidates never select an arbitrary nearest place',async()=>{
 const h=setup(async()=>({exceededTransferLimit:true,features:[{attributes:{gers_id:'a'},geometry:{x:0,y:0}}]}));await start(h);await h.p.pick({x:0,y:0});assert.deepEqual(h.chosen,[]);assert.equal(h.errors.length,1);h.p.stop();
});
test('moving or stopping discards an outstanding click',async()=>{
 for(const action of ['move','stop']){let resolve;const h=setup(()=>new Promise(r=>resolve=r));await start(h);const pending=h.p.pick({x:0,y:0});action==='move'?h.move():h.p.stop();resolve({features:[{attributes:{gers_id:'late'},geometry:{x:0,y:0}}]});await pending;assert.deepEqual(h.chosen,[]);h.p.stop();}
});
test('failed service preparation removes resources without attaching tiles',async()=>{
 const h=setup(async()=>({features:[]}));await assert.rejects(h.p.start('http://example.org/style.json','https://example.org/FeatureServer/0'),/HTTPS/);assert(!h.events.includes('add'));
});
test('stopping during service preparation prevents later layer attachment',async()=>{
 let release;const events=[];
 class Tiles{load(){return new Promise(r=>release=r)}destroy(){events.push('destroy')}}
 class Service{fields=[{name:'gers_id'}];load(){return Promise.resolve()}destroy(){}}
 const p=new m.exports.PlacesTilesPrototype({view:{ready:true,map:{add(){events.push('add')},remove(){}}},modules:{VectorTileLayer:Tiles,FeatureLayer:Service},selected(){},error(){}});
 const pending=p.start('https://example.org/style.json','https://example.org/FeatureServer/0');p.stop();release();await pending;assert.deepEqual(events,['destroy']);
});
test('service load failure destroys the candidate layer',async()=>{
 const events=[];
 class Tiles{load(){return Promise.resolve()}destroy(){events.push('destroy')}}
 class Service{load(){return Promise.reject(new Error('offline'))}destroy(){events.push('service-destroy')}}
 const p=new m.exports.PlacesTilesPrototype({view:{ready:true,map:{add(){events.push('add')},remove(){}}},modules:{VectorTileLayer:Tiles,FeatureLayer:Service},selected(){},error(){}});
 await assert.rejects(p.start('https://example.org/style.json','https://example.org/FeatureServer/0'),/offline/);assert.deepEqual(events,['destroy','service-destroy']);
});
