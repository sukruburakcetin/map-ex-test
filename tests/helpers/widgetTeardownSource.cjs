/** Execute the concrete widget bindings and ordered teardown, or the frozen pre-extraction methods. */
const fs=require('node:fs'),path=require('node:path'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const root=path.resolve(__dirname,'../..'),compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const sf=ts.createSourceFile('widget.tsx',fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),99,true,4),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget'),member=name=>widget.members.find(n=>n.name?.getText(sf)===name);
exports.source=fs.readFileSync(root+'/src/features/lifecycle/widgetTeardown.ts','utf8');exports.ast=ts.createSourceFile('teardown.ts',exports.source,99,true,3);
exports.phase=name=>exports.ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text===name);
exports.action=name=>member('widgetTeardownHost').body.statements.find(ts.isReturnStatement).expression.properties.find(n=>n.name?.getText(sf)===name).initializer.getText(sf);
exports.install=(w,platform={},legacy=false)=>{
 const resize=require('./viewerResizeSource.cjs')(platform);
 const active={exports:{}};
 new Function('exports','require',...Object.keys(platform),compile(exports.source))(active.exports,id=>{
  if(id==='./viewerResize')return resize;
  throw Error('Unexpected runtime dependency '+id);
 },...Object.values(platform));
 const members=legacy?Object.values(require('../fixtures/widgetTeardown.baseline.json')).join('\n'):['cleanupWidgetEnvironment','componentWillUnmount','widgetTeardownHost'].map(name=>member(name).getText(sf)).join('\n');
 const globals={clearImageryHoverCardCache:()=>{},deleteDetectionCrop:async()=>{},...platform,...active.exports};
 const Binding=new Function(...Object.keys(globals),compile('return class Binding {'+members+'};'))(...Object.values(globals));
 for(const key of legacy?['cleanupWidgetEnvironment','componentWillUnmount']:['cleanupWidgetEnvironment','componentWillUnmount','widgetTeardownHost'])w[key]=Binding.prototype[key];return w;
};
/** Run retained owner-focused assertions through the actual capability binding. */
exports.run=(statements,w,fullRemove=true)=>{exports.install(w);return new Function('host','fullRemove',compile(statements.map(n=>n.getText(exports.ast)).join('\n')))(w.widgetTeardownHost(),fullRemove)};
