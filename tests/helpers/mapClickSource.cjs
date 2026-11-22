/** Load real click policy and bindings; optional dependency overrides retain existing fixture boundaries. */
const fs=require('node:fs'),path=require('node:path');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const root=path.resolve(__dirname,'../..');
const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8');
const sf=ts.createSourceFile('widget.tsx',source,99,true,4),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');
const member=name=>widget.members.find(n=>n.name?.getText(sf)===name).getText(sf);
let callback;function visit(n){if(ts.isCallExpression(n)&&n.expression.getText(sf)==='view.on'&&n.arguments[0]?.text==='click')callback=n.arguments[1];ts.forEachChild(n,visit);}visit(sf);
exports.createMapClickHandler=(w,view,overrides={},legacy=false)=>{
 const cache=new Map();
 function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;const m={exports:{}};cache.set(file,m);
  new Function('require','module','exports','console',compile(fs.readFileSync(file,'utf8')))(id=>load(path.resolve(path.dirname(file),id+'.ts')),m,m.exports,overrides.console||console);
  for(const key of Object.keys(m.exports))if(key in overrides)m.exports[key]=overrides[key];return m.exports;
 }
 const constants=load(root+'/src/utils/constants.ts');
 const globals={TURBO_LIMITS:overrides.TURBO_LIMITS||{pickRadiusPx:8},webMercatorUtils:overrides.webMercatorUtils||{webMercatorToGeographic:p=>p},
  coverageClickHitTest:load(root+'/src/features/coverage/coverageClickDispatch.ts').coverageClickHitTest,
  nearestLoadedFrame:load(root+'/src/features/coverage/nearestLoadedFrame.ts').nearestLoadedFrame,
  distanceMeters:load(root+'/src/utils/geoUtils.ts').distanceMeters,
  GRAPH_API:constants.GRAPH_API,LAYER_IDS:constants.LAYER_IDS,
  deferNoteObjectPopup:load(root+'/src/features/detections/NoteObjectChoice.ts').deferNoteObjectPopup,
  attachmentMetadata:load(root+'/src/features/detections/detectionImageAttachment.ts').attachmentMetadata,
  tilePlace:load(root+'/src/features/places/tilePlace.ts').tilePlace,
  ...overrides,
 };
 if(legacy){const original=require('../fixtures/mapClickDispatch.baseline.json').callback;return new Function('view',...Object.keys(globals),compile('return ('+original+');')).call(w,view,...Object.values(globals));}
 const Bindings=new Function(...Object.keys(globals),compile('return class Harness {'+member('prepareMapClick')+'\n'+member('mapClickDispatchHost')+'};'))(...Object.values(globals));
 w.prepareMapClick=Bindings.prototype.prepareMapClick;w.mapClickDispatchHost=Bindings.prototype.mapClickDispatchHost;
 const dispatch=load(root+'/src/features/navigation/mapClickDispatch.ts').dispatchMapClick;
 return new Function('view','dispatchMapClick',compile('return ('+callback.getText(sf)+');')).call(w,view,dispatch);
};
