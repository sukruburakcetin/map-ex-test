const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText,root=path.resolve(__dirname,'..');
function load(name){const file=path.resolve(root,name.endsWith('.ts')?name:path.join(name==='geoUtils'?'src/utils':'src/features/places',name+'.ts')),m={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(file,'utf8')))(id=>load(path.relative(root,path.resolve(path.dirname(file),id+'.ts'))),m,m.exports);return m.exports;}

const model=load('placesModel'),{PlacesController}=load('PlacesController');
const row=(i=1,extra={})=>({attributes:{gers_id:'gers-'+i,place_name:'School '+i,category:'school',place_group:'education',confidence:.98,...extra},geometry:{x:.5,y:.5}});
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function fixture(manualSearch=false){let now=0,id=0;const timers=new Map(),idle=new Map(),calls=[],displays=[],statuses=[];const f={view:{token:{},bbox:[0,0,1,1],zoom:16,stationary:true},busy:false,clears:0,visible:true,calls,displays,statuses};const host={manualSearch,view:()=>f.view,busy:()=>f.busy,query:(bbox,signal)=>new Promise((resolve,reject)=>calls.push({bbox,signal,resolve,reject})),display:(places,token)=>displays.push({places,token}),visible:v=>f.visible=v,clear:()=>f.clears++,status:s=>statuses.push(s),timer:(work,ms)=>{const key=++id;timers.set(key,{work,at:now+ms});return key;},cancelTimer:k=>timers.delete(k),idle:work=>{const key=++id;idle.set(key,work);return key;},cancelIdle:k=>idle.delete(k),now:()=>now};f.controller=new PlacesController(host);f.advance=async(ms=650)=>{now+=ms;for(const[k,t]of[...timers])if(t.at<=now){timers.delete(k);t.work();}for(const[k,work]of[...idle]){idle.delete(k);work();}await flush();};f.complete=async(features=[row()],limited=false)=>{calls.at(-1).resolve({features,limited});await flush();};f.pending=()=>timers.size+idle.size;return f;}
test('bounded vector-tile browsing remains available at overview zoom 12 and hides below its supported range',async()=>{
 const f=fixture();f.controller.host.paged=true;f.view.zoom=12;
 f.controller.setEnabled(true);await f.advance();assert.equal(f.calls.length,1);await f.complete();assert.equal(f.visible,true);
 f.view.zoom=11.9;f.controller.sync();await f.advance();assert.equal(f.visible,false);assert.equal(f.statuses.at(-1).kind,'zoom');f.controller.dispose();
});

test('feature-backed browsing retains its original minimum detail level',async()=>{const f=fixture();f.view.zoom=14;f.controller.setEnabled(true);await f.advance();assert.equal(f.calls.length,0);assert.equal(f.visible,false);f.controller.dispose();});
