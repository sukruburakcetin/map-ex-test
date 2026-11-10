const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
function setup(remote){let index=0;const slots=[],submissions=[],m={exports:{}},jsx=(type,props,...children)=>({type,props:props||{},children});
 const React={useState(v){const i=index++;if(!(i in slots))slots[i]=v;return[slots[i],v=>slots[i]=typeof v==='function'?v(slots[i]):v]},useMemo:fn=>fn(),useRef:v=>({current:v}),useEffect(){}};
 new Function('exports','require',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/components/LoadedPlacesList.tsx'),'utf8'),{fileName:'LoadedPlacesList.tsx',compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React}}).outputText)(m.exports,id=>{
 if(id==='jimu-core')return{React,jsx};if(id.endsWith('WidgetLocale'))return{useWidgetLocale:()=>({t:k=>k,owned:s=>s,formatLocale:'en-US'})};if(id.endsWith('placeIcons'))return{placeCategoryIcon:()=>''};
 if(id.endsWith('placeListUtils'))return{PLACE_LIST_PAGE_SIZE:4,filterLoadedPlaces:(rows,q)=>rows.filter(r=>r.name.includes(q)),placeListDistance:()=>0};throw Error(id);
 });
 const props={defaultOpen:true,compact:true,places:[{id:'a',name:'Alpha',category:'school',group:'education'},{id:'b',name:'Beta',category:'school',group:'education'}],onSelect(){},...(remote?{onAreaSearch:text=>submissions.push(text)}:{})};
 function render(){index=0;const tree=m.exports.LoadedPlacesList(props),nodes=[];function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){nodes.push(n);walk(n.children)}}walk(tree);return nodes}
 return {props,render,submissions};
}
test('area search drafts without requests or filtering only the current page, then submits explicitly',()=>{
 const h=setup(true);let nodes=h.render();nodes.find(n=>n.type==='input').props.onChange({target:{value:'missing'}});nodes=h.render();assert.equal(h.submissions.length,0);assert.equal(nodes.filter(n=>n.props['data-place-id']).length,2);assert.equal(nodes.find(n=>n.type==='input').props.maxLength,120);
 nodes.find(n=>n.type==='form').props.onSubmit({preventDefault(){}});assert.deepEqual(h.submissions,['missing']);
 h.props.searchText='missing';h.props.places=[];nodes=h.render();const clear=nodes.find(n=>n.type==='button'&&n.props['aria-label']==='uiPoiClearAreaSearch');assert(clear);clear.props.onClick();assert.equal(h.submissions.at(-1),'');assert.equal(h.render().find(n=>n.type==='input').props.value,'');
});
test('legacy list still filters loaded results locally',()=>{
 const h=setup(false);h.render().find(n=>n.type==='input').props.onChange({target:{value:'Alpha'}});assert.equal(h.render().filter(n=>n.props['data-place-id']).length,1);assert.equal(h.submissions.length,0);
});
