const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.join(__dirname,'../src'),cache=new Map();
function load(rel){const file=path.resolve(root,rel);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);new Function('require','module','exports',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(id=>load(path.relative(root,path.resolve(path.dirname(file),id+'.ts'))),m,m.exports);return m.exports;}
test('local preferences round-trip, isolate sources and tolerate blocked or invalid storage',()=>{
 const p=load('features/places/placePreferences.ts'),data=new Map(),store=()=>({getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)}),key=p.tilePlacePreferenceKey('w','/app','https://localhost:3444/query?token=secret');
 assert(!key.includes('secret'));assert.notEqual(key,p.tilePlacePreferenceKey('w','/other','https://localhost:3444/query'));assert.notEqual(key,p.tilePlacePreferenceKey('w','/app','https://localhost:3445/query'));assert(p.tilePlacePreferenceKey('w','/app','https://example.org/query'));assert.notEqual(p.tilePlacePreferenceKey('w','/app','https://example.org/a/query'),p.tilePlacePreferenceKey('w','/app','https://example.org/b/query'));
 const value={family:'cafe',autoUpdate:false,minimum:.75,hideClosed:true};p.saveTilePlacePreferences(store,key,value);assert.deepEqual(p.readTilePlacePreferences(store,key),value);
 data.set(key,JSON.stringify({family:'invalid',minimum:2,autoUpdate:'false'}));assert.deepEqual(p.readTilePlacePreferences(store,key),{family:'all',autoUpdate:true,minimum:null,hideClosed:false});assert.doesNotThrow(()=>p.saveTilePlacePreferences(()=>{throw Error('blocked')},key,value));assert.equal(p.readTilePlacePreferences(()=>{throw Error('blocked')},key).family,'all');
});
test('same-area search caches by captured origin and publishes that snapshot',async()=>{
 const {PlacesController}=load('features/places/PlacesController.ts');let origin={lon:.1,lat:.1,kind:'image'},queries=[],shown=[],state,now=0,next=0;const timers=new Map(),idles=new Map(),view={token:{},bbox:[0,0,1,1],zoom:16,stationary:true};
 const c=new PlacesController({manualSearch:true,hybridSearch:false,searchOrigin:()=>origin,view:()=>view,busy:()=>false,query:async(b,s,g,o)=>{queries.push(o);return{features:[{attributes:{gers_id:String(o.lon),place_name:'Test',category:'school',place_group:'education',confidence:.99},geometry:{x:.5,y:.5}}],limited:false}},display:p=>shown=p,visible(){},clear(){},status:s=>state=s,timer:(work,ms)=>{const id=++next;timers.set(id,{work,at:now+ms});return id},cancelTimer:id=>timers.delete(id),idle:work=>{const id=++next;idles.set(id,work);return id},cancelIdle:id=>idles.delete(id),now:()=>now});
 const advance=async()=>{now+=650;for(const[id,t]of[...timers])if(t.at<=now){timers.delete(id);t.work()}for(const[id,work]of[...idles]){idles.delete(id);work()}await new Promise(r=>setImmediate(r))};
 c.setEnabled(true);c.searchArea();await advance();assert.equal(queries.length,1);assert.equal(state.resultOrigin.lon,.1);
 origin={lon:.2,lat:.2,kind:'image'};c.searchArea();await advance();assert.equal(queries.length,2);assert.equal(shown[0].id,'0.2');assert.equal(state.resultOrigin.lon,.2);
 c.searchArea();await advance();assert.equal(queries.length,2);c.dispose();
});
function pagedFixture(){
 const {PlacesController}=load('features/places/PlacesController.ts');let origin={lon:.1,lat:.1,kind:'image'},state,shown=[],now=0,id=0,query=async()=>({features:[],limited:false});const timers=new Map(),idles=new Map(),requests=[],view={token:{},bbox:[0,0,1,1],zoom:16,stationary:true};
 const c=new PlacesController({paged:true,manualSearch:true,hybridSearch:false,searchOrigin:()=>origin,view:()=>view,busy:()=>false,normalize:rows=>rows,query:async(b,g,s,o,offset,text)=>{requests.push({bbox:b,signal:s,origin:o,offset,text});return query(offset,s,text)},display:p=>shown=p,visible(){},clear(){},status:s=>state=s,timer:(work,ms)=>{const n=++id;timers.set(n,{work,at:now+ms});return n},cancelTimer:n=>timers.delete(n),idle:work=>{const n=++id;idles.set(n,work);return n},cancelIdle:n=>idles.delete(n),now:()=>now});
 const tick=()=>new Promise(r=>setImmediate(r));return {c,view,requests,get state(){return state},get shown(){return shown},setOrigin:p=>origin=p,setQuery:q=>query=q,async advance(){now+=650;for(const[n,t]of[...timers])if(t.at<=now){timers.delete(n);t.work()}for(const[n,work]of[...idles]){idles.delete(n);work()}await tick()},tick};
}
const pageRows=offset=>Array.from({length:200},(_,i)=>({id:String(offset+i),name:'Place',category:'school',address:'',website:'',release:'',confidence:.9,group:'education',lon:.5,lat:.5}));
test('paging traverses beyond 200 in bounded pages, retaining search origin and supporting previous',async()=>{
 const h=pagedFixture();h.setQuery(async offset=>({features:pageRows(offset),limited:offset<400}));h.c.setEnabled(true);h.c.searchArea();await h.advance();
 assert.equal(h.state.pageOffset,0);h.c.loadMore();await h.tick();assert.equal(h.state.pageOffset,200);assert.equal(h.shown.length,200);assert.equal(h.shown[0].id,'200');assert.deepEqual(h.requests[0].origin,h.requests[1].origin);
 h.c.loadMore();await h.tick();assert.equal(h.state.pageOffset,400);assert.equal(h.state.limited,false);h.c.loadMore();assert.equal(h.requests.length,3);
 h.c.previousPage();await h.tick();assert.equal(h.state.pageOffset,200);assert.equal(h.shown[0].id,'200');assert.equal(h.requests.at(-1).offset,200);h.c.dispose();
});
test('page failure retains results and can retry; repeated clicks have one transport',async()=>{
 const h=pagedFixture();h.setQuery(async offset=>({features:pageRows(offset),limited:true}));h.c.setEnabled(true);h.c.searchArea();await h.advance();
 h.setQuery(async()=>{throw Error('offline')});h.c.loadMore();await h.tick();assert.equal(h.state.pageError,true);assert.equal(h.state.pageOffset,0);assert.equal(h.shown[0].id,'0');
 let release;h.setQuery(()=>new Promise(r=>release=r));h.c.loadMore();h.c.loadMore();assert.equal(h.requests.length,3);assert.equal(h.state.pageLoading,true);release({features:pageRows(200),limited:false});await h.tick();assert.equal(h.state.pageError,false);assert.equal(h.state.pageOffset,200);h.c.dispose();
});
test('movement or filter reset discards pending pages and prevents stale pagination',async()=>{
 for(const action of ['move','reset','origin']){
  const h=pagedFixture();h.setQuery(async offset=>({features:pageRows(offset),limited:true}));h.c.setEnabled(true);h.c.searchArea();await h.advance();
  let release;h.setQuery(()=>new Promise(r=>release=r));h.c.loadMore();
  if(action==='move'){h.view.bbox=[1,0,2,1];h.c.sync()}else if(action==='reset'){h.c.resetResults()}else {h.setOrigin({lon:.2,lat:.2,kind:'image'});h.c.sync()}
  release({features:pageRows(200),limited:true});await h.tick();assert.notEqual(h.shown[0]?.id,'200');const calls=h.requests.length;h.c.loadMore();assert.equal(h.requests.length,calls);h.c.dispose();
 }
});

test('full-area search resets paging, scopes caches by term and carries the term to later pages',async()=>{
 const h=pagedFixture();h.setQuery(async(offset,signal,text)=>({features:pageRows(offset).map(p=>({...p,id:(text||'all')+p.id})),limited:true}));h.c.setEnabled(true);h.c.searchArea();await h.advance();
 h.c.setSearchText('hidden');await h.advance();assert.equal(h.requests.at(-1).offset,0);assert.equal(h.requests.at(-1).text,'hidden');assert.equal(h.state.searchText,'hidden');assert.equal(h.shown[0].id,'hidden0');
 h.c.loadMore();await h.tick();assert.equal(h.requests.at(-1).text,'hidden');assert.equal(h.state.pageOffset,200);
 h.c.setSearchText('');await h.advance();assert.equal(h.state.searchText,'');assert.equal(h.state.pageOffset,0);assert.equal(h.shown[0].id,'all0');h.c.dispose();
});
test('a late response for an older search term never replaces the new search',async()=>{
 const h=pagedFixture();h.setQuery(async()=>({features:pageRows(0),limited:true}));h.c.setEnabled(true);h.c.searchArea();await h.advance();let release;
 h.setQuery((offset,signal,text)=>text==='old'?new Promise(r=>release=r):Promise.resolve({features:pageRows(0).map(p=>({...p,id:'new'+p.id})),limited:false}));
 h.c.setSearchText('old');await h.advance();h.c.setSearchText('new');await h.advance();release({features:pageRows(200),limited:false});await h.tick();await h.advance();assert.equal(h.shown[0].id,'new0');assert.equal(h.state.searchText,'new');h.c.dispose();
});
