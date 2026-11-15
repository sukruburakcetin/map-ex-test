const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const directory=path.join(__dirname,'../src/features/field-notes');
/** Emulate case-insensitive filename lookup with the host's TS-before-TSX order. */
function resolve(stem,names=fs.readdirSync(directory)){
 for(const extension of ['.ts','.tsx','.js']){
  const found=names.find(name=>name.toLowerCase()===(stem+extension).toLowerCase());
  if(found)return found;
 }
}
test('the previous component/helper pair resolves the component request to the helper on a case-insensitive filesystem',()=>{
 const oldNames=['NoteSearch.tsx','noteSearch.ts'];assert.equal(resolve('NoteSearch',oldNames),'noteSearch.ts');
 const source=fs.readFileSync(path.join(directory,'noteSearch.ts'),'utf8'),m={exports:{}};
 new Function('module','exports',ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText)(m,m.exports);
 assert.equal(typeof m.exports.filterNotes,'function');assert.equal(m.exports.NoteSearch,undefined);
});
test('note feature module stems are unique across case and TS/TSX extensions',()=>{
 const stems=new Map();for(const name of fs.readdirSync(directory).filter(name=>/\.tsx?$/.test(name))){const key=name.replace(/\.tsx?$/,'').toLowerCase();assert(!stems.has(key),`${name} collides with ${stems.get(key)}`);stems.set(key,name);}
});
test('both lists import the distinctly named component and its runtime export exists',()=>{
 for(const file of ['LocalNotesList.tsx','EnterpriseNotesList.tsx']){
  const source=fs.readFileSync(path.join(directory,file),'utf8');
  assert(source.includes("import { NotesSearchControls } from './NotesSearchControls'"));
  assert.equal(resolve('NotesSearchControls'),'NotesSearchControls.tsx');
 }
 const source=fs.readFileSync(path.join(directory,'NotesSearchControls.tsx'),'utf8'),m={exports:{}};
 new Function('require','module','exports',ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,jsxFactory:'jsx'}}).outputText)(()=>({}),m,m.exports);
 assert.equal(typeof m.exports.NotesSearchControls,'function');
});
