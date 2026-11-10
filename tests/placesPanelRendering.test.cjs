const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),m={exports:{}};
const categoryModule={exports:{}};
new Function('exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/places/tileCategories.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(categoryModule.exports);
const CategoryPickerStub=()=>null;
const jsx=(type,props,...children)=>({type,props,children});
const panelHooks={collapsed:false};
const ReactStub={useState:initial=>typeof initial==='boolean'?[panelHooks.collapsed,value=>{panelHooks.collapsed=typeof value==='function'?value(panelHooks.collapsed):value}]:[initial,()=>{}],useRef:value=>({current:value}),useId:()=> 'test-places-body',useEffect(){}};
function localRequire(name){
 if(name.endsWith('PlaceQualityControls'))return{PlaceQualityControls:()=>null};
 if(name.endsWith('TileCategoryPicker'))return{TileCategoryPicker:CategoryPickerStub};
 if(name.endsWith('tileCategories'))return categoryModule.exports;
 if(name==='jimu-core')return{React:ReactStub,jsx};
 if(name.endsWith('WidgetLocale'))return{useWidgetLocale:()=>({t:key=>key,owned:value=>value,formatLocale:'en-US'})};
 if(name.endsWith('SelectedPlaceCard'))return{placesScrollCss:'',SelectedPlaceSummary:()=>null};
 if(name.endsWith('LoadedPlacesList'))return{LoadedPlacesList:()=>null};
 throw Error(name);
}
new Function('exports','require',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/components/PlacesPanel.tsx'),'utf8'),{fileName:'PlacesPanel.tsx',compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React}}).outputText)(m.exports,localRequire);
const flatten=value=>typeof value==='string'?value:Array.isArray(value)?value.map(flatten).join(' '):value?.children?flatten(value.children):'';
test('tile mode describes loaded results without claiming the number of rendered map points',()=>{
 const props={status:{kind:'ready',count:200,limited:true,loadedCounts:{all:200}},group:'all',onGroup(){},onRetry(){},onClose(){}};
 const native=flatten(m.exports.PlacesPanel({...props,tileSource:true}));assert(native.includes('uiPoiResultRange'));assert(native.includes('uiPoiLoadMore'));assert(!native.includes('uiPlacesShown'));assert(!native.includes('uiOnlyPartOfThisAreaIsLoadedZoom'));
 const original=flatten(m.exports.PlacesPanel(props));assert(original.includes('uiPlacesShown'));assert(original.includes('uiOnlyPartOfThisAreaIsLoadedZoom'));
});

test('native list zoom message does not imply that tile rendering is unavailable',()=>{
 const props={status:{kind:'zoom',count:0},group:'all',onGroup(){},onRetry(){},onClose(){}};
 const native=flatten(m.exports.PlacesPanel({...props,tileSource:true}));assert(native.includes('uiLoadedPlaces: appZoomCloser'));assert(!native.includes('uiZoomCloserToSeeNearbyPlaces'));
 const original=flatten(m.exports.PlacesPanel(props));assert(original.includes('uiZoomCloserToSeeNearbyPlaces'));
});
test('tile mode delegates searchable category selection without legacy count controls',()=>{
 let family;const props={tileSource:true,tileFamily:'restaurant',onTileFamily:value=>family=value,status:{kind:'ready',count:2,loadedCounts:{all:2,health:0}},group:'all',onGroup(){throw Error('Legacy facet must not run')},onRetry(){},onClose(){}};
 const panel=m.exports.PlacesPanel(props),nodes=[];function walk(node){if(Array.isArray(node))node.forEach(walk);else if(node&&typeof node==='object'){nodes.push(node);walk(node.children)}}walk(panel);
 const picker=nodes.find(node=>node.type===CategoryPickerStub);assert(picker);assert.equal(picker.props.value,'restaurant');picker.props.onChange('cafe');assert.equal(family,'cafe');assert(!flatten(panel).includes('uiMoreCategories'));
});

test('unsupported native adapters do not present an enabled family control',()=>{
 const panel=m.exports.PlacesPanel({tileSource:true,tileFamily:'all',status:{kind:'ready',count:0},group:'all',onGroup(){},onRetry(){},onClose(){}}),nodes=[];
 function walk(value){if(Array.isArray(value))value.forEach(walk);else if(value&&typeof value==='object'){nodes.push(value);walk(value.children)}}walk(panel);
 assert.equal(nodes.find(node=>node.type===CategoryPickerStub).props.onChange,undefined);
});
test('filter loading disables controls and explains an independently selected place outside the list',()=>{
 const nodes=[],panel=m.exports.PlacesPanel({tileSource:true,tileLoading:true,status:{kind:'ready',count:0},places:[],selection:{place:{id:'outside'}},group:'all',onGroup(){},onRetry(){},onClose(){}});
 function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){nodes.push(n);walk(n.children)}}walk(panel);
 assert(flatten(panel).includes('uiPoiUpdating'));assert(!flatten(panel).includes('uiPoiSelectedNotInPage'));assert.equal(nodes.find(n=>n.type==='fieldset').props.disabled,true);
});
test('native paging exposes range navigation and keeps paging disabled for stale searches',()=>{
 const nodes=[];const panel=m.exports.PlacesPanel({tileSource:true,status:{kind:'search',count:200,limited:true,pageOffset:200,canSearch:true},group:'all',onGroup(){},onRetry(){},onClose(){},onLoadMore(){},onPreviousResults(){}});
 function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){nodes.push(n);walk(n.children)}}walk(panel);
 for(const label of ['uiPoiLoadMore','uiPoiPreviousResults'])assert.equal(nodes.find(n=>n.type==='button'&&(flatten(n)===label||n.props['aria-label']===label)).props.disabled,true);
 assert(flatten(panel).includes('uiPoiScaleHint'));assert(flatten(panel).includes('uiPoiPagedHint'));
});

test('compact tile panel keeps category and results available while advanced filters and help start collapsed',()=>{
 const nodes=[],panel=m.exports.PlacesPanel({tileSource:true,tileFamily:'all',tileQuality:{minimum:.75,hideClosed:true},onTileFamily(){},onTileQuality(){},status:{kind:'ready',count:200,limited:true},places:[],group:'all',onGroup(){},onRetry(){},onClose(){},onSelect(){}});
 function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){nodes.push(n);walk(n.children)}}walk(panel);
 const sections=nodes.filter(n=>n.type==='details');assert.equal(sections.length,2);assert(sections.every(n=>!n.props.open));assert(flatten(sections[0]).includes('uiPoiQualityFilters'));assert(flatten(sections[1]).includes('uiPoiScaleHint'));assert(flatten(sections[1]).includes('uiSelectAPlaceForDetailsSourceOvertureMaps'));
 const list=nodes.find(n=>n.props?.defaultOpen===true);assert(list);assert.equal(list.props.compact,true);assert(nodes.some(n=>n.type===CategoryPickerStub));
});

test('full-area search stays available after an empty result so the user can clear or retry',()=>{
 const search=()=>{},nodes=[],panel=m.exports.PlacesPanel({tileSource:true,onAreaSearch:search,onSelect(){},status:{kind:'ready',count:0,loadedCounts:{all:0},searchText:'missing'},group:'all',onGroup(){},onRetry(){},onClose(){}});
 function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){nodes.push(n);walk(n.children)}}walk(panel);
 const list=nodes.find(n=>n.props?.onAreaSearch===search);assert(list);assert.equal(list.props.searchText,'missing');assert(flatten(panel).includes('uiPoiNoSearchMatches'));
});
test('mobile hierarchy keeps refresh and close in a sticky header and groups all native filters',()=>{
 const close=()=>{},refresh=()=>{},nodes=[],panel=m.exports.PlacesPanel({tileSource:true,onSelect(){},onAreaSearch(){},onAutoUpdate(){},onSearch:refresh,onClose:close,onTileFamily(){},onTileQuality(){},tileFamily:'cafe',tileQuality:{minimum:.75,hideClosed:true},status:{kind:'ready',count:140,loadedCounts:{all:140}},group:'all',onGroup(){},onRetry(){}});
 function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){nodes.push(n);walk(n.children)}}walk(panel);
 const header=nodes.find(n=>n.props?.className==='mly-places-panel-header');assert.equal(header.props.style.position,'sticky');assert(flatten(header).includes('uiNearbyPlaces'));
 const childNodes=[];function collect(n){if(Array.isArray(n))n.forEach(collect);else if(n&&typeof n==='object'){childNodes.push(n);collect(n.children)}}collect(header);
 assert(childNodes.some(n=>n.props?.onClick===close));assert(childNodes.some(n=>n.props?.onClick===refresh));assert.equal(nodes.filter(n=>n.props?.onClick===refresh).length,1);
 const filters=nodes.find(n=>n.props?.className==='mly-place-filters');assert.equal(filters.type,'details');assert(!filters.props.open);assert(flatten(filters).includes('uiPoiQualityFilters'));assert(flatten(filters).includes('uiPoiAutoShort'));
 const list=nodes.find(n=>n.props?.defaultOpen===true);assert.equal(list.props.heading,'uiPoiResultRange');assert(!nodes.some(n=>n.type==='p'&&n.props?.role==='status'&&flatten(n)==='uiPoiResultRange'));
});

test('minimize and restore keep the Places contents mounted and never closes or disables the layer',()=>{
 panelHooks.collapsed=false;let closed=0,hover;
 const props={tileSource:true,onClose:()=>closed++,onHover:value=>hover=value,onSelect(){},onAreaSearch(){},onSearch(){},status:{kind:'ready',count:140,loadedCounts:{all:140}},group:'all',onGroup(){},onRetry(){}};
 const collect=tree=>{const all=[];function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){all.push(n);walk(n.children)}}walk(tree);return all};
 let all=collect(m.exports.PlacesPanel(props)),toggle=all.find(n=>n.props?.['aria-controls']==='test-places-body');assert.equal(toggle.props['aria-expanded'],true);assert.equal(toggle.props['aria-label'],'uiPoiMinimizePanel');toggle.props.onClick();
 all=collect(m.exports.PlacesPanel(props));const body=all.find(n=>n.props?.id==='test-places-body');assert.equal(body.props.hidden,true);assert.equal(body.props.style.display,'none');assert.equal(all.find(n=>n.type==='section').props.style.width,'auto');assert(all.some(n=>n.type==='button'&&flatten(n).includes('uiPoiRestoreCount')));assert(all.some(n=>n.props?.defaultOpen===true));assert.equal(closed,0);assert.equal(hover,null);
 toggle=all.find(n=>n.props?.['aria-controls']==='test-places-body');assert.equal(toggle.props['aria-label'],'uiPoiRestorePanel');toggle.props.onClick();
 all=collect(m.exports.PlacesPanel(props));assert.equal(all.find(n=>n.props?.id==='test-places-body').props.hidden,false);assert.equal(closed,0);panelHooks.collapsed=false;
});

test('panel title is a plain heading and minimize is distinct from close',()=>{
 panelHooks.collapsed=false;const nodes=[],panel=m.exports.PlacesPanel({tileSource:true,status:{kind:'ready',count:140},group:'all',onGroup(){},onRetry(){},onClose(){}});
 function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){nodes.push(n);walk(n.children)}}walk(panel);
 const minimize=nodes.find(n=>n.props?.['aria-label']==='uiPoiMinimizePanel');assert(minimize);assert.equal(flatten(minimize),'−');assert(nodes.some(n=>n.type==='strong'&&flatten(n)==='uiNearbyPlaces'));assert(!nodes.some(n=>n.type==='button'&&flatten(n)==='uiNearbyPlaces'));
 assert(nodes.some(n=>n.props?.['aria-label']==='uiCloseNearbyPlacesFilters'));
});

test('outside-page selection is explained after loading and failure offers an explicit retry',()=>{
 const props={tileSource:true,status:{kind:'ready',count:0},places:[],selection:{place:{id:'outside'}},group:'all',onGroup(){},onRetry(){},onClose(){},onSearch(){},onSelect(){}};
 assert(flatten(m.exports.PlacesPanel(props)).includes('uiPoiSelectedNotInPage'));
 const nodes=[],retry=()=>{},tree=m.exports.PlacesPanel({...props,status:{kind:'error',count:0},onRetry:retry});function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){nodes.push(n);walk(n.children)}}walk(tree);
 assert(nodes.some(n=>n.type==='button'&&n.props?.onClick===retry));assert.equal(nodes.find(n=>n.props?.defaultOpen===true).props.failed,true);
});
