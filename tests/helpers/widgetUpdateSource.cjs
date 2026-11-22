/** Execute the real update phases and concrete live adapter, or the frozen pre-extraction lifecycle. */
const fs=require('node:fs'),path=require('node:path'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const root=path.resolve(__dirname,'../..'),compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const cache=new Map();function load(file){if(cache.has(file))return cache.get(file);const m={exports:{}};new Function('exports','require',compile(fs.readFileSync(root+'/src/'+file+'.ts','utf8')))(m.exports,id=>load(path.posix.normalize(path.posix.join(path.posix.dirname(file),id))));cache.set(file,m.exports);return m.exports;}
const sources={placesSourceKey:load('features/places/placesSource').placesSourceKey,organizationFilterId:load('utils/organizationFilter').organizationFilterId};
const sf=ts.createSourceFile('widget.tsx',fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),99,true,4),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget'),member=name=>widget.members.find(n=>n.name?.getText(sf)===name).getText(sf);
exports.source=fs.readFileSync(root+'/src/features/lifecycle/widgetUpdate.ts','utf8');exports.ast=ts.createSourceFile('update.ts',exports.source,99,true,3);
exports.phase=name=>exports.ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text===name);
exports.install=(w,platform={},legacy=false)=>{
 const resize=require('./viewerResizeSource.cjs')(platform);
 const active={exports:{}};
 new Function('exports','require',...Object.keys(platform),compile(exports.source))(active.exports,id=>{
  if(id==='./viewerResize')return resize;
  throw Error('Unexpected runtime dependency '+id);
 },...Object.values(platform));
 const members=legacy?require('../fixtures/widgetUpdate.baseline.json').method:['componentDidUpdate','widgetUpdateHost'].map(member).join('\n');
 const globals={...sources,...platform,reconcileWidgetUpdate:active.exports.reconcileWidgetUpdate};
 const Binding=new Function(...Object.keys(globals),compile('return class Binding {'+members+'};'))(...Object.values(globals));
 if(!legacy && !w._coverageAnalysis) w._coverageAnalysis={get currentCheck(){return w._coverageAnalysisCurrent;}};
 w.componentDidUpdate=Binding.prototype.componentDidUpdate;if(!legacy)w.widgetUpdateHost=Binding.prototype.widgetUpdateHost;return w;
};
/** Bind a narrowly scoped actual phase statement to the concrete widget capabilities for retained feature checks. */
exports.run=(statements,w,prevState,prevProps=w.props)=>{exports.install(w);return new Function('host','prevState','prevProps',compile(statements.map(n=>n.getText(exports.ast)).join('\n')))(w.widgetUpdateHost(),prevState,prevProps)};
