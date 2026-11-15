/** Whole-collection local search without DOM-sized option lists or network calls. */
const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const transpile=file=>ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/',file),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const normalize={exports:{}};new Function('module','exports',transpile('field-notes/noteSearch.ts'))(normalize,normalize.exports);
const m={exports:{}};new Function('require','module','exports',transpile('community-notes/localNoteChoices.ts'))(()=>normalize.exports,m,m.exports);
const {indexLocalNotes,findLocalNotes}=m.exports;
test('indexed search finds records at the end of a large collection without changing order/identity',()=>{
 const notes=Array.from({length:10000},(_,i)=>({id:String(i),category:'Inspection',note:i===9999?'Unique end observation':'Routine',status:'open',imageId:String(i)}));const index=indexLocalNotes(notes,'en');const result=findLocalNotes(index,'unique end','en');assert.equal(result.length,1);assert.equal(result[0].note,notes[9999]);assert.equal(findLocalNotes(index,'','en'),index);
});
test('search matches accents, resolution, status and image IDs literally',()=>{
 const note={id:'local',category:'Café',note:'100% (a+b)',resolutionNote:'Reviewed',status:'in_progress',imageId:'123456'},index=indexLocalNotes([note],'en');
 for(const query of ['cafe','100% (a+b)','reviewed','in progress','123456'])assert.equal(findLocalNotes(index,query,'en')[0].note,note);
 assert.equal(findLocalNotes(index,'.*','en').length,0);assert.equal(findLocalNotes(index,'cafe absent','en').length,0);
});
