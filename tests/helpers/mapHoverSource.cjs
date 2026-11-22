/** Bind production hover source to deterministic fixture timers and current widget capabilities. */
const fs=require('node:fs'),path=require('node:path');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const root=path.resolve(__dirname,'../..');
const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const sf=ts.createSourceFile('widget.tsx',fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),99,true,4);
const widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');
const binding=widget.members.find(n=>n.name?.getText(sf)==='mapHoverHost').getText(sf);
const featureSource=fs.readFileSync(root+'/src/features/navigation/mapHoverDispatch.ts','utf8');
const feature=ts.createSourceFile('hover.ts',featureSource,99,true,3);
let pointer,gate,replay;
function visit(n){if(ts.isReturnStatement(n)&&n.expression&&ts.isArrowFunction(n.expression))pointer=n.expression;if(ts.isNewExpression(n)&&n.expression.getText(feature)==='CoverageHoverResume'){gate=n.arguments[1];replay=n.arguments[2];}ts.forEachChild(n,visit);}
visit(feature);
if(!pointer||!gate||!replay)throw Error('Production hover interaction boundary missing');
const bind=w=>new Function(compile('return class Bindings {'+binding+'};'))().prototype.mapHoverHost.call(w);
exports.bindHoverHost=bind;
exports.createPointerHandler=(w,view,globals={})=>{
 const host=bind(w);return w._coverageHoverHandler=new Function('host','view',...Object.keys(globals),compile('let hoverHitTestTimeout=null;return ('+pointer.getText(feature)+');'))(host,view,...Object.values(globals));
};
exports.createReplayBindings=(w,view,mapContainer,globals={})=>{
 const host=bind(w);const get=source=>new Function('host','view','mapContainer',...Object.keys(globals),compile('return ('+source+');'))(host,view,mapContainer,...Object.values(globals));
 return {gate:get(gate.getText(feature)),replay:get(replay.getText(feature))};
};
exports.browserPointerCode=()=>compile('let hoverHitTestTimeout=null;class Bindings {'+binding+'};const host=Bindings.prototype.mapHoverHost.call(this);return ('+pointer.getText(feature)+');');
exports.createInteraction=(w,view,globals={},legacy=false)=>{
 const cache=new Map();
 function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;const m={exports:{}};cache.set(file,m);
  new Function('require','module','exports',...Object.keys(globals),compile(fs.readFileSync(file,'utf8')))(id=>load(path.resolve(path.dirname(file),id+'.ts')),m,m.exports,...Object.values(globals));
  for(const key of Object.keys(m.exports))if(key in globals)m.exports[key]=globals[key];return m.exports;
 }
 if(legacy){const baseline=require('../fixtures/mapHoverDispatch.baseline.json');const deps={CoverageHoverResume:load(root+'/src/features/coverage/CoverageHoverResume.ts').CoverageHoverResume,CoverageTouchHover:load(root+'/src/features/coverage/CoverageTouchHover.ts').CoverageTouchHover,LAYER_IDS:load(root+'/src/utils/constants.ts').LAYER_IDS,TURBO_LIMITS:load(root+'/src/utils/turboCoverageUtils.ts').TURBO_LIMITS,renderMapFeatureHoverLabel:load(root+'/src/features/imagery/hoverCard.ts').renderMapFeatureHoverLabel,tilePlace:load(root+'/src/features/places/tilePlace.ts').tilePlace,...globals};return new Function('view',...Object.keys(deps),compile(baseline.setup+'return ('+baseline.pointer+');')).call(w,view,...Object.values(deps));}
 return load(root+'/src/features/navigation/mapHoverDispatch.ts').createMapHoverHandler(view,bind(w));
};
