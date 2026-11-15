const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const root=path.resolve(__dirname,'../src'),cache=new Map();function load(file){if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);new Function('exports','require',ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports,id=>load(path.relative(root,path.resolve(root,path.dirname(file),id+'.ts'))));return m.exports;}
const {placesSourceKey,placesSourceKind}=load('features/places/placesSource.ts');
const text=fs.readFileSync(path.join(root,'setting/setting.tsx'),'utf8'),sf=ts.createSourceFile('setting.tsx',text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cls=sf.statements.find(ts.isClassDeclaration),wanted=new Set(['placesAreaPreview','placesAreaView','placesAreaRevision','clearPlacesArea','placesTestAbort','componentWillUnmount','componentDidUpdate','onPlacesApiChange','onPlacesSourceSetting','testPlacesConnection']);
const members=cls.members.filter(n=>n.name&&wanted.has(n.name.getText(sf))).map(n=>n.getText(sf)).join('\n');
function setup({hold=false,fail=false}={}){
 let release,loads=0,destroyed=0,tests=0;
 class PortalError extends Error{}
 class Layer{destroy(){destroyed++}}
 class Backend{constructor(t,q){this.tilesUrl=t}async test(layer,signal){tests++;if(hold)await new Promise(r=>release=r);if(signal.aborted)throw new DOMException('Aborted','AbortError');if(fail)throw new PortalError('Missing or incompatible Places field: confidence');return{count:null,release:'release-1'}}}
 const m={exports:{}};new Function('exports','placesSourceKey','placesSourceKind','loadArcGISJSAPIModules','PortalPlacesSource','PortalPlacesConfigurationError','testPlacesApi',ts.transpileModule('export class Fixture{'+members+'}',{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports,placesSourceKey,placesSourceKind,async names=>{loads++;assert.deepEqual(names,['esri/request','esri/layers/VectorTileLayer']);return[()=>{},Layer]},Backend,PortalError,()=>{throw Error('External provider was not selected')});
 const w=new m.exports.Fixture();w.context={locale:'en'};w.state={placesTestStatus:'idle',placesTestInfo:''};w.setState=patch=>Object.assign(w.state,typeof patch==='function'?patch(w.state):patch);w.props={id:'w',config:{placesPortalTilesUrl:'https://p.example/VectorTileServer',placesPortalQueryUrl:'https://p.example/FeatureServer/0',set(k,v){return{...this,[k]:v}}},onSettingChange:p=>w.props.config=p.config};
 return{w,tick:()=>new Promise(r=>setImmediate(r)),release:()=>release?.(),get stats(){return{loads,destroyed,tests}}};
}
test('saving Portal URLs makes no requests; explicit test uses SDK authentication and destroys its temporary native layer',async()=>{
 const h=setup();h.w.onPlacesSourceSetting('placesSource','portal');assert.equal(h.stats.loads,0);await h.w.testPlacesConnection();assert.equal(h.w.state.placesTestStatus,'ok');assert.equal(h.w.state.placesTestInfo,'release-1');assert.equal(h.stats.loads,1);assert.equal(h.stats.destroyed,1);h.w.componentWillUnmount();
});
test('changing either Portal URL or source mode cancels and suppresses late success',async()=>{
 for(const [key,value] of [['placesPortalTilesUrl','https://other.example/VectorTileServer'],['placesPortalQueryUrl','https://p.example/FeatureServer/1'],['placesSource','external']]){
 const h=setup({hold:true}),pending=h.w.testPlacesConnection();await h.tick();h.w.onPlacesSourceSetting(key,value);h.release();await pending;assert.equal(h.w.state.placesTestStatus,'idle');assert.equal(h.stats.destroyed,1);h.w.componentWillUnmount();}
});
test('schema errors are actionable; unmount aborts authentication/query work and clears resources',async()=>{
 const h=setup({fail:true});await h.w.testPlacesConnection();assert.equal(h.w.state.placesTestStatus,'error');assert(h.w.state.placesTestInfo.includes('confidence'));assert.equal(h.stats.destroyed,1);
 const next=setup({hold:true}),pending=next.w.testPlacesConnection();await next.tick();next.w.componentWillUnmount();next.release();await pending;assert.equal(next.stats.destroyed,1);
});
