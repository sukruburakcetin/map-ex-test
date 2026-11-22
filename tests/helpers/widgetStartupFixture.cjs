/** Browser/clock trace fixture for actual mount and startup invalidation boundaries. */
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject}};
const flush=()=>new Promise(r=>setImmediate(r));
function fixture(legacy=false,config={}){
 const events=[],nodes=[],observers=[],timers=new Map();let id=0;
 const log=(name,...args)=>events.push([name,...args]);
 const document={addEventListener:(type,handler)=>log('document-listen',type,handler?.key),createElement:tag=>{const node={tag,style:{},innerText:'',remove(){log('remove',tag);const at=nodes.indexOf(node);if(at>=0)nodes.splice(at,1)}};log('create',tag);return node},head:{appendChild:node=>{nodes.push(node);log('head',node.tag)}},body:{appendChild:node=>{nodes.push(node);log('body',node.tag)}}};
 const platform={document,window:{addEventListener:(type,handler)=>log('window-listen',type,handler?.key)},ResizeObserver:class{constructor(callback){this.callback=callback;observers.push(this);log('observer')}observe(target){log('observe',target.key)}},setTimeout:(work,delay)=>{timers.set(++id,{work,delay});log('timer',id,delay);return id},clearTimeout:timer=>{log('clear-timer',timer);timers.delete(timer)},console:{error:(message,error)=>log('error',message,error?.message)},overrideStyles:'fixture override stylesheet'};
 const w={props:{config:{...config}},state:{},_startupRevision:0,_startupDisposed:false,_startupAbort:new AbortController(),_spritePreloadTimer:null,_introDismissTimer:null,_overrideStyleSheet:null,resizeObserver:null,tooltipDiv:null,viewerContainer:{current:{key:'container'}},mapillaryViewer:{resize:()=>log('resize','original')}};
 for(const name of ['_sequenceVisibilityChange','handleFullscreenChange','handleWindowResize','handleNudgeKeyDown','handleNudgeKeyUp']){w[name]=()=>{};w[name].key=name;}
 for(const name of ['syncSequenceDiagnostics','updateOrganizationName','installCoverageAlignmentDiagnostic','initializePlacesLifecycle','initMapillaryLayer','initMapillaryTrafficSignsLayer','initMapillaryObjectsLayer','restoreSequenceCache','loadFieldNotesFromStorage','syncSharedFieldNotes','ensureAlwaysOnCoverageLayer','syncMapLegendLayer','preloadTrafficSignOptions','preloadObjectOptions'])w[name]=(...args)=>log(name,...args);
 w.log=message=>log('log',message);w.ensureArcGISModules=async()=>log('modules');w.getUserIdFromUsername=async user=>{log('creator',user);return 42};w.setState=patch=>{Object.assign(w.state,patch);log('state',patch)};
 require('./widgetStartupSource.cjs').install(w,platform,legacy);
 const result=()=>({events,state:w.state,revision:w._startupRevision,disposed:w._startupDisposed,aborted:w._startupAbort.signal.aborted,preloadTimer:w._spritePreloadTimer,introTimer:w._introDismissTimer,timers:[...timers].map(([id,t])=>[id,t.delay]),nodes:nodes.map(node=>({tag:node.tag,style:node.style,text:node.innerText})),sheet:nodes.indexOf(w._overrideStyleSheet),tooltip:nodes.indexOf(w.tooltipDiv),observers:observers.length});
 return {w,platform,events,nodes,observers,timers,log,result,flush,deferred};
}
exports.fixture=fixture;exports.deferred=deferred;exports.flush=flush;
