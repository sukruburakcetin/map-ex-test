const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const root=path.join(__dirname,'../src'),cache=new Map(),jsx=(type,props,...children)=>({type,props:props||{},children}),Note=()=>null;
function load(file){if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);new Function('exports','require',ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React}}).outputText)(m.exports,id=>{
 if(id==='jimu-core')return{React:{},jsx};if(id.endsWith('WidgetLocale'))return{useWidgetLocale:()=>({t:k=>'localized:'+k,owned:x=>x})};if(id.endsWith('placeIcons'))return{placeCategoryIcon:()=>''};if(id.endsWith('PlaceNoteActions'))return{PlaceNoteActions:Note};
 return load(path.relative(root,path.resolve(root,path.dirname(file),id+'.ts')));
});return m.exports;}
const {SelectedPlaceSummary,selectedPlaceCategory}=load('components/SelectedPlaceCard.tsx');
const flatten=n=>typeof n==='string'?n:Array.isArray(n)?n.map(flatten).join(' '):n&&typeof n==='object'?flatten(n.children):'';
function nodes(tree){const result=[];function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){result.push(n);walk(n.children)}}walk(tree);return result}
const base={place:{id:'book',name:'The First Edition Rare Books with a very long name',category:'books_music_and_video_store',group:'shop',address:'123 Main Street',website:'https://example.com',release:'2026-10',confidence:.9,operatingStatus:'open'},link:true,onDetails(){},onClear(){},onLink(){}};
test('selected header has distinct Clear action, two-line title and full accessible name',()=>{
 const all=nodes(SelectedPlaceSummary(base)),clear=all.find(n=>n.props['aria-label']==='localized:uiClearSelectedPlace'),title=all.find(n=>n.props.title===base.place.name);
 assert.equal(clear.props.onClick,base.onClear);assert.equal(flatten(clear),'localized:uiPoiClearShort');assert(!all.some(n=>n.type==='button'&&flatten(n)==='×'));
 assert.equal(title.props.onClick,base.onDetails);assert.equal(title.props.style.WebkitLineClamp,2);assert(title.props['aria-label'].includes(base.place.name));
});
test('secondary details start collapsed with full identity, address, camera link and source retained',()=>{
 const tree=SelectedPlaceSummary({...base,onBack(){}}),all=nodes(tree),details=all.find(n=>n.type==='details');assert(details);assert(!details.props.open);assert.equal(details.props.key,base.place.id);
 for(const value of [base.place.name,base.place.address,'books music and video store',base.place.id,base.place.release,'localized:uiPoiConfidence','localized:uiPoiOperatingStatus','localized:uiOverture'])assert(flatten(details).includes(value));
 const checkbox=nodes(details).find(n=>n.type==='input');assert.equal(checkbox.props.checked,true);assert(all.some(n=>n.props.title==='localized:uiCenterTheMapOnThisPlace'));
});
test('imagery and all note preparation props stay outside collapsed secondary details',()=>{
 const note=()=>{},image=()=>{},cancel=()=>{},props={...base,onImagery:image,onNote:note,enterpriseEnabled:true,currentImageId:'image',onGetNoteImage:async()=>null,onLoadNotePreview:()=>{},notePhase:'capturing',onCancelNote:cancel};
 const tree=SelectedPlaceSummary(props),all=nodes(tree),details=all.find(n=>n.type==='details'),actions=all.find(n=>n.type===Note);
 assert(all.some(n=>n.type==='button'&&n.props.onClick===image));assert(!nodes(details).some(n=>n.type===Note||n.props.onClick===image));assert.equal(actions.props.onNote,note);assert.equal(actions.props.enterpriseEnabled,true);assert.equal(actions.props.phase,'capturing');assert.equal(actions.props.onCancel,cancel);assert.equal(actions.props.onGetImage,props.onGetNoteImage);assert.equal(actions.props.currentImageId,'image');
});
test('category summary uses localized families and precise book labels',()=>{
 const t=k=>'translated:'+k;assert.equal(selectedPlaceCategory(base.place,t),'translated:uiPoiBooksMusicVideo');assert.equal(selectedPlaceCategory({...base.place,category:'bookstore'},t),'translated:uiPoiBookshop');assert.equal(selectedPlaceCategory({...base.place,category:'new_unknown_shop_category'},t),'translated:uiPoiShop');assert.equal(selectedPlaceCategory({...base.place,category:'new',group:'unknown'},t),'translated:uiPoiOther');
});
