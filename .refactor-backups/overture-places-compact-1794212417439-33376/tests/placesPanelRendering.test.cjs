const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),m={exports:{}};
const categoryModule={exports:{}};
new Function('exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/places/tileCategories.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(categoryModule.exports);
const CategoryPickerStub=()=>null;
const jsx=(type,props,...children)=>({type,props,children});
function localRequire(name){
 if(name.endsWith('PlaceQualityControls'))return{PlaceQualityControls:()=>null};
 if(name.endsWith('TileCategoryPicker'))return{TileCategoryPicker:CategoryPickerStub};
 if(name.endsWith('tileCategories'))return categoryModule.exports;
 if(name==='jimu-core')return{React:{},jsx};
 if(name.endsWith('WidgetLocale'))return{useWidgetLocale:()=>({t:key=>key,owned:value=>value,formatLocale:'en-US'})};
 if(name.endsWith('SelectedPlaceCard'))return{placesScrollCss:'',SelectedPlaceSummary:()=>null};
 if(name.endsWith('LoadedPlacesList'))return{LoadedPlacesList:()=>null};
 throw Error(name);
}
new Function('exports','require',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/components/PlacesPanel.tsx'),'utf8'),{fileName:'PlacesPanel.tsx',compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React}}).outputText)(m.exports,localRequire);
const flatten=value=>typeof value==='string'?value:Array.isArray(value)?value.map(flatten).join(' '):value?.children?flatten(value.children):'';
test('tile mode describes loaded results without claiming the number of rendered map points',()=>{
 const props={status:{kind:'ready',count:200,limited:true,loadedCounts:{all:200}},group:'all',onGroup(){},onRetry(){},onClose(){}};
 const native=flatten(m.exports.PlacesPanel({...props,tileSource:true}));assert(native.includes('uiPoiResultRange'));assert(native.includes('uiPoiMoreResultsAvailable'));assert(!native.includes('uiPlacesShown'));assert(!native.includes('uiOnlyPartOfThisAreaIsLoadedZoom'));
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
 assert(flatten(panel).includes('uiPoiUpdating'));assert(flatten(panel).includes('uiPoiSelectedOutsideList'));assert.equal(nodes.find(n=>n.type==='fieldset').props.disabled,true);
});
test('native paging exposes range navigation and keeps paging disabled for stale searches',()=>{
 const nodes=[];const panel=m.exports.PlacesPanel({tileSource:true,status:{kind:'search',count:200,limited:true,pageOffset:200,canSearch:true},group:'all',onGroup(){},onRetry(){},onClose(){},onLoadMore(){},onPreviousResults(){}});
 function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){nodes.push(n);walk(n.children)}}walk(panel);
 for(const label of ['uiPoiLoadMore','uiPoiPreviousResults'])assert.equal(nodes.find(n=>n.type==='button'&&flatten(n)===label).props.disabled,true);
 assert(flatten(panel).includes('uiPoiScaleHint'));assert(flatten(panel).includes('uiPoiPagedHint'));
});
