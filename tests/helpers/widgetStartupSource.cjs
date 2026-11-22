/** Load actual startup coordination and widget bindings with controlled browser scheduling. */
const fs=require('node:fs'),path=require('node:path'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const root=path.resolve(__dirname,'../..'),compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const sf=ts.createSourceFile('widget.tsx',fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),99,true,4),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget'),member=name=>widget.members.find(n=>n.name?.getText(sf)===name).getText(sf);
const styles={exports:{}};new Function('exports',compile(fs.readFileSync(root+'/src/styles/imageryHoverCard.ts','utf8')))(styles.exports);
exports.install=(w,platform={},legacy=false)=>{
 const active={exports:{}};new Function('exports','require',...Object.keys(platform),compile(fs.readFileSync(root+'/src/features/lifecycle/widgetStartup.ts','utf8')))(active.exports,name=>{if(name!=='../../styles/imageryHoverCard')throw Error('Unexpected runtime dependency '+name);return styles.exports},...Object.values(platform));
 const members=legacy?Object.values(require('../fixtures/widgetStartup.baseline.json')).join('\n'):['componentDidMount','disposeStartupResources','widgetStartupHost'].map(member).join('\n');
 const bindings=new Function('mountWidget','disposeWidgetStartup',...Object.keys(platform),compile('return class Bindings {'+members+'};'))(active.exports.mountWidget,active.exports.disposeWidgetStartup,...Object.values(platform));
 for(const key of legacy?['componentDidMount','disposeStartupResources']:['componentDidMount','disposeStartupResources','widgetStartupHost'])w[key]=bindings.prototype[key];
 return w;
};
