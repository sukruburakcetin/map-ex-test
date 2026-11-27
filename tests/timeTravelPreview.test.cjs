const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
function load(file,req=()=>{}){const m={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(path.join(__dirname,'../src',file),'utf8')))(req,m,m.exports);return m.exports}
const constants=load('utils/constants.ts'),geo=load('utils/geoUtils.ts');
const {relatedCaptures,loadTimeTravelPreview,createTimeTravelPreviewLoader}=load('features/imagery/timeTravelPreview.ts',id=>id.endsWith('constants')?constants:geo);
const current={id:'A',sequence:'s1',captured_at:'2020-01-01',computed_geometry:{coordinates:[29,41]},computed_compass_angle:359,thumb_1024_url:'https://example.com/A.jpg'};
const candidate={...current,id:'B',sequence:'s2',captured_at:'2021-01-01',computed_compass_angle:1,thumb_1024_url:'https://example.com/B.jpg'};
const response=(value,ok=true)=>({ok,json:async()=>value});
function mock(t,fn){const old=global.fetch;global.fetch=fn;t.after(()=>global.fetch=old)}
test('related previews retain proximity, different date/sequence and wrap-around heading rules',()=>{
 const invalid=[{...candidate,id:'A'},{...candidate,sequence:'s1'},{...candidate,captured_at:current.captured_at},{...candidate,computed_compass_angle:180},{...candidate,computed_compass_angle:undefined},{...candidate,computed_geometry:{coordinates:[30,41]}},{...candidate,thumb_1024_url:null}];
 assert.deepEqual(relatedCaptures(current,[...invalid,candidate,candidate]).map(x=>x.id),['B']);
 assert.equal(relatedCaptures(current,[{...candidate,is_pano:true,computed_compass_angle:180}]).length,1);
});
test('preview selection is date ordered, bounded and rejects invalid dates/geometry',()=>{
 const items=Array.from({length:20},(_,i)=>({...candidate,id:String(i),captured_at:`${2000+i}-01-01`}));
 const result=relatedCaptures(current,items);assert.equal(result.length,12);assert.equal(result[0].id,'19');
 assert.equal(relatedCaptures(current,[{...candidate,captured_at:'bad'},{...candidate,computed_geometry:{coordinates:[NaN,41]}}]).length,0);
});
test('on-demand loader performs two cancellable metadata requests and returns thumbnails without image downloads',async t=>{
 const urls=[],controller=new AbortController();mock(t,async(url,options)=>{urls.push(url);assert.equal(options.signal,controller.signal);return response(urls.length===1?current:{data:[candidate]})});
 const data=await loadTimeTravelPreview('A','a+b&c',controller.signal);assert.equal(urls.length,2);assert(urls.every(x=>x.includes('thumb_1024_url')));assert(urls[0].includes('access_token=a%2Bb%26c'));assert.equal(data.current.id,'A');assert.equal(data.alternatives[0].id,'B');
});
test('pre-aborted and interrupted JSON work never launches another request',async t=>{
 const controller=new AbortController();controller.abort();let calls=0;mock(t,async()=>{calls++;return response(current)});await assert.rejects(loadTimeTravelPreview('A','test',controller.signal),{name:'AbortError'});assert.equal(calls,0);
 const active=new AbortController();global.fetch=async()=>{calls++;return{ok:true,json:async()=>{active.abort();return current}}};await assert.rejects(loadTimeTravelPreview('A','test',active.signal),{name:'AbortError'});assert.equal(calls,1);
});
test('HTTP/API errors and missing source preview fail safely without candidate fetches',async t=>{
 let calls=0;mock(t,async()=>{calls++;return response({},false)});await assert.rejects(loadTimeTravelPreview('A','test',new AbortController().signal));assert.equal(calls,1);
 global.fetch=async()=>response({error:{message:'secret'}});await assert.rejects(loadTimeTravelPreview('A','test',new AbortController().signal),/could not load/);
 global.fetch=async()=>response({...current,thumb_1024_url:null});await assert.rejects(loadTimeTravelPreview('A','test',new AbortController().signal),/not available/);
});

test('searches later pages before showing the empty state and bounds the lookup', async t => {
 const cursors = [];
 mock(t, async url => {
  const request = new URL(url);
  if (!request.pathname.endsWith('/images')) return response(current);
  const cursor = request.searchParams.get('after');
  cursors.push(cursor);
  return response({
   data: cursor ? [candidate] : [],
   paging: { next: 'https://other.example/images', cursors: { after: String(cursors.length) } },
  });
 });
 const result = await loadTimeTravelPreview('A','token',new AbortController().signal);
 assert.deepEqual(cursors,[null,'1','2']);
 assert.deepEqual(result.alternatives.map(item=>item.id),['B']);
});

test('reopening the same capture reuses results while shared links and new credentials reload', async () => {
 let requests = 0;
 const load = createTimeTravelPreviewLoader(async () => {
  requests++;
  return { current: { id:'A' }, alternatives:[{ id:String(requests) }] };
 });
 const signal = new AbortController().signal;
 const first = await load('A','one',signal);
 assert.strictEqual(await load('A','one',signal),first);
 await load('A','one',signal,{imageId:'A',startId:'A',compareId:'B',split:50});
 assert.strictEqual(await load('A','one',signal),first);
 assert.notStrictEqual(await load('A','two',signal),first);
 assert.equal(requests,3);
});
