/** Execute production sequence coordination and the widget's live adapter, or the frozen pre-extraction method. */
const fs=require('node:fs'),path=require('node:path'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const root=path.resolve(__dirname,'../..');
const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,99,true,4),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');
const member=name=>widget.members.find(n=>n.name?.getText(sf)===name).getText(sf);
exports.source=fs.readFileSync(root+'/src/features/imagery/sequenceOpening.ts','utf8');
exports.install=(w,legacy=false,platform={})=>{
 const active={exports:{}};new Function('exports',...Object.keys(platform),compile(exports.source))(active.exports,...Object.values(platform));
 const members=legacy?require('../fixtures/sequenceOpening.baseline.json').method:member('loadSequenceById')+'\n'+member('sequenceOpeningHost');
 const Binding=new Function('openSequence',...Object.keys(platform),compile('return class Binding {'+members+'};'))(active.exports.openSequence,...Object.values(platform));
 w.loadSequenceById=Binding.prototype.loadSequenceById;
 if(!legacy)w.sequenceOpeningHost=Binding.prototype.sequenceOpeningHost;
 return w;
};
