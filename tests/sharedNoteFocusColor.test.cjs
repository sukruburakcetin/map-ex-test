/** Shared Local copies retain Enterprise workflow colors through actual focus-layer creation. */
const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
function load(file){const m={exports:{}};const code=ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;new Function('module','exports',code)(m,m.exports);return m.exports;}
const {FieldNoteMap}=load('src/features/field-notes/FieldNoteMap.ts'),{buildLocalNoteGraphic}=load('src/features/field-notes/mapGraphic.ts');
const base={id:'local-shared',category:'Damaged sign',source:'manual',note:'Review sign',lon:1,lat:2,createdAt:1,sharedStatus:'shared',sharedGlobalId:'record',sharedLayerUrl:'https://example.test/FeatureServer/0'};
const color=g=>g.symbol.type==='point-3d'?g.symbol.symbolLayers[0].material.color:g.symbol.color;
for(const type of ['2d','3d'])for(const [status,expected] of Object.entries({open:'#35b7c4',in_progress:'#f5a623',completed:'#05a056',dismissed:'#888888'})){
 test(`${type}: Show on map retains ${status} Enterprise color for a shared manual copy`,async()=>{
  const note={...base,status},original=structuredClone(note),layers=[];const view={type,map:{add(){},remove(){}}};
  const map=new FieldNoteMap({readContext:()=>({view,ready:true,disposed:false}),readNotes:()=>[note],readShared:()=>({loaded:true,view,url:note.sharedLayerUrl}),clearPending(){},
   loadGroupFactory:async()=>props=>({...props,layers:{items:[],includes(l){return this.items.includes(l)},add(l){this.items.push(l)}},destroy(){}}),
   loadLayerFactory:async()=>props=>{const l={...props,graphics:[],add(g){this.graphics.push(g)},removeAll(){this.graphics=[]},destroy(){}};layers.push(l);return l},
   readGraphicFactory:()=>(n,is3D)=>buildLocalNoteGraphic(n,is3D),highlightNote:async()=>({remove(){}})});
  await map.focusNote(note);const graphic=layers.find(l=>l.id==='workspace-note-selection').graphics[0];assert.equal(color(graphic),expected);assert.equal(graphic.attributes.id,note.id);assert.equal(graphic.geometry.longitude,1);assert.equal(graphic.geometry.latitude,2);assert.deepEqual(note,original);
 });
}
test('unshared/failed manual drafts retain manual color; detections retain their source color',()=>{
 for(const sharedStatus of [undefined,'failed','saving'])assert.deepEqual(color(buildLocalNoteGraphic({...base,sharedStatus,status:'completed'},false)),[245,166,35,1]);
 assert.deepEqual(color(buildLocalNoteGraphic({...base,sharedStatus:undefined,source:'mapillary-detection'},true)),[53,175,109,1]);
});
test('workspace category color remains authoritative; missing/unknown shared status uses Enterprise default',()=>{
 assert.equal(color(buildLocalNoteGraphic({...base,workspace:{color:'#123456'},status:'completed'},false)),'#123456');
 for(const status of [undefined,'unknown'])assert.equal(color(buildLocalNoteGraphic({...base,status},true)),'#35b7c4');
});
