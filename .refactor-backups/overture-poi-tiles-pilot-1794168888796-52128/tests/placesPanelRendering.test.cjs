const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),m={exports:{}};
const jsx=(type,props,...children)=>({type,props,children});
function localRequire(name){
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
 const native=flatten(m.exports.PlacesPanel({...props,tileSource:true}));assert(native.includes('uiLoadedPlaces: 200+'));assert(native.includes('uiCountsAreForLoadedPlaces'));assert(!native.includes('uiPlacesShown'));assert(!native.includes('uiOnlyPartOfThisAreaIsLoadedZoom'));
 const original=flatten(m.exports.PlacesPanel(props));assert(original.includes('uiPlacesShown'));assert(original.includes('uiOnlyPartOfThisAreaIsLoadedZoom'));
});

test('native list zoom message does not imply that tile rendering is unavailable',()=>{
 const props={status:{kind:'zoom',count:0},group:'all',onGroup(){},onRetry(){},onClose(){}};
 const native=flatten(m.exports.PlacesPanel({...props,tileSource:true}));assert(native.includes('uiLoadedPlaces: appZoomCloser'));assert(!native.includes('uiZoomCloserToSeeNearbyPlaces'));
 const original=flatten(m.exports.PlacesPanel(props));assert(original.includes('uiZoomCloserToSeeNearbyPlaces'));
});
