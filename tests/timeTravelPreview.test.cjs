const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
function load(file,req=()=>{}){const m={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(path.join(__dirname,'../src',file),'utf8')))(req,m,m.exports);return m.exports}
const constants=load('utils/constants.ts'),geo=load('utils/geoUtils.ts');
const {relatedCaptures,loadTimeTravelPreview}=load('features/imagery/timeTravelPreview.ts',id=>id.endsWith('constants')?constants:geo);
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
