const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const root=path.join(__dirname,'../src');
function fixture(){
 let index=0,dirty=false;const slots=[],pending=[],scrolls=[],jsx=(type,props,...children)=>({type,props:props||{},children}),cache=new Map();
 const React={useState(initial){const i=index++;if(!(i in slots))slots[i]=initial;return[slots[i],value=>{const next=typeof value==='function'?value(slots[i]):value;if(next!==slots[i]){slots[i]=next;dirty=true}}]},useRef(initial){const i=index++;return slots[i]||(slots[i]={current:initial})},useMemo:fn=>fn(),useEffect(fn,deps){const i=index++;if(!slots[i]||deps.some((v,n)=>v!==slots[i][n])){slots[i]=deps;pending.push(fn)}}};
 function load(file){if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);new Function('exports','require',ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React}}).outputText)(m.exports,id=>{
 if(id==='jimu-core')return{React,jsx};if(id.endsWith('WidgetLocale'))return{useWidgetLocale:()=>({t:k=>k,owned:s=>s,formatLocale:'en-US'})};if(id.endsWith('placeIcons'))return{placeCategoryIcon:()=>''};if(id.endsWith('PresentationText'))return{englishPresentation:{text:s=>s}};
 return load(path.relative(root,path.resolve(root,path.dirname(file),id+'.ts')));
 });return m.exports;}
 const {LoadedPlacesList}=load('components/LoadedPlacesList.tsx');
 const places=Array.from({length:12},(_,i)=>({id:'p'+i,name:'Place '+String(11-i).padStart(2,'0'),category:'school',group:'education',lat:i*.001,lon:0}));
 const props={defaultOpen:true,compact:true,visible:true,places,origin:{lon:0,lat:0,kind:'map'},onSelect(){},onAreaSearch(){},onShowOnMap(){},searchText:'school'};
 function render(){let nodes;
  for(let turns=0;turns<10;turns++){
   index=0;dirty=false;const tree=LoadedPlacesList(props);nodes=[];
   function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){nodes.push(n);walk(n.children)}}walk(tree);
   const rowNodes=nodes.filter(n=>n.props['data-place-id']);for(const n of nodes)if(n.props.ref&&n.props.role==='group')n.props.ref.current={querySelectorAll:()=>rowNodes.map(row=>({dataset:{placeId:row.props['data-place-id']},scrollIntoView:()=>scrolls.push(row.props['data-place-id'])}))};
   while(pending.length)pending.shift()();if(!dirty)return nodes;
  }throw Error('Effects did not settle');
 }
 return{props,places,render,scrolls};
}
const selected=nodes=>nodes.filter(n=>n.props['data-place-id']&&n.props['aria-pressed']);
test('map selection reveals its row even with an active area search, after result replacement and sorting',()=>{
 const h=fixture();h.props.selectedId='p9';h.props.revealRequest=1;let nodes=h.render();assert.equal(selected(nodes)[0].props['data-place-id'],'p9');assert(h.scrolls.includes('p9'));
 nodes.find(n=>n.type==='select').props.onChange({target:{value:'name'}});nodes=h.render();assert.equal(selected(nodes)[0].props['data-place-id'],'p9');
 h.props.places=[h.places[9]];nodes=h.render();assert.equal(selected(nodes).length,1);
 h.props.places=[h.places[0]];nodes=h.render();assert.equal(selected(nodes).length,0);
});
test('minimized lists do not scroll the page or override manual paging on restore',()=>{
 const h=fixture();h.props.selectedId='p1';h.props.revealRequest=1;let nodes=h.render();h.props.visible=false;h.render();const initialScrolls=h.scrolls.length;h.props.visible=true;nodes=h.render();assert.equal(h.scrolls.length,initialScrolls);nodes.find(n=>n.props['aria-label']==='uiNextPlaces').props.onClick();nodes=h.render();assert.equal(selected(nodes).length,0);
 h.props.visible=false;h.render();const previous=h.scrolls.length;h.props.visible=true;nodes=h.render();assert.equal(selected(nodes).length,0);assert.equal(h.scrolls.length,previous);
 h.props.visible=false;h.props.selectedId='p9';h.props.revealRequest=2;h.render();assert.equal(h.scrolls.length,previous);h.props.visible=true;nodes=h.render();assert.equal(selected(nodes)[0].props['data-place-id'],'p9');assert.equal(h.scrolls.at(-1),'p9');
});
test('Show on map is a separate row action and loading/failure suppress misleading empty messages',()=>{
 const h=fixture(),calls=[];h.props.onShowOnMap=id=>calls.push(id);let nodes=h.render();nodes.find(n=>n.props['aria-label']==='uiShowOnMap: Place 11').props.onClick();assert.deepEqual(calls,['p0']);
 h.props.places=[];h.props.loading=true;nodes=h.render();assert(!nodes.some(n=>n.type==='p'));assert(nodes.some(n=>n.props['aria-busy']===true));
 h.props.loading=false;h.props.failed=true;nodes=h.render();assert(!nodes.some(n=>n.type==='p'));h.props.failed=false;nodes=h.render();assert(nodes.some(n=>n.type==='p'));
});
test('Show on map centers the clicked row instead of a stale asynchronous selection',()=>{
 const source=ts.createSourceFile('widget.tsx',fs.readFileSync(path.join(root,'runtime/widget.tsx'),'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);const widget=source.statements.find(n=>ts.isClassDeclaration(n));
 const names=new Set(['goToSelectedPlace','showListedPlaceOnMap','centerPlaceOnMap']);const methods=widget.members.filter(n=>n.name&&names.has(n.name.getText(source))).map(n=>n.getText(source)).join('\n');assert.equal(methods.includes('showListedPlaceOnMap'),true);
 const m={exports:{}};new Function('exports',ts.transpileModule('export class Fixture {\n'+methods+'\n}',{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports);
 const h=new m.exports.Fixture(),old={id:'old',lon:1,lat:1},clicked={id:'clicked',lon:2,lat:2},calls=[];h.state={placesActive:true,selectedPlace:old,placesList:[clicked],jimuMapView:{view:{ready:true,zoom:17}}};h.ArcGISModules={Point:class{constructor(p){Object.assign(this,p)}}};h._places={open:(_,id)=>{calls.push(id);return true}};h.navigateMapView=(view,target)=>calls.push(target);h.showListedPlaceOnMap('clicked');assert.equal(calls[0],'clicked');assert.equal(calls[1].target.longitude,2);assert.equal(calls[1].zoom,17);h.showListedPlaceOnMap('missing');assert.equal(calls.length,2);
});
