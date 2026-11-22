/** Exercise production component binding and capability host, retaining geometry/color fixture boundaries. */
const fs=require('node:fs'),path=require('node:path');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const root=path.resolve(__dirname,'../..');
const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const sf=ts.createSourceFile('widget.tsx',fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),99,true,4),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');
const member=name=>widget.members.find(n=>n.name?.getText(sf)===name).getText(sf);
exports.install=(w,globals,legacy=false)=>{
 const cache=new Map();
 function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;const m={exports:{}};cache.set(file,m);
  new Function('require','module','exports',...Object.keys(globals),compile(fs.readFileSync(file,'utf8')))(id=>{
   if(id==='mapillary-js')return{OutlineTag:globals.OutlineTag,PolygonGeometry:globals.PolygonGeometry};
   if(id.endsWith('mapillaryDetections'))return{getDetectionColor:globals.getDetectionColor};
   return load(path.resolve(path.dirname(file),id+'.ts'));
  },m,m.exports,...Object.values(globals));
  for(const key of Object.keys(m.exports))if(key in globals)m.exports[key]=globals[key];return m.exports;
 }
 const dependencies={mappedDetectionLocation:load(root+'/src/features/detections/detectionNote.ts').mappedDetectionLocation,...globals};
 if(!legacy)dependencies.bindDetectionHover=load(root+'/src/features/detections/detectionHover.ts').bindDetectionHover;
 const code=legacy?require('../fixtures/detectionHover.baseline.json').method:member('setupDetectionHover')+'\n'+member('detectionHoverHost');
 const Runtime=new Function(...Object.keys(dependencies),compile('return class Harness {'+code+'};'))(...Object.values(dependencies));
 w.setupDetectionHover=Runtime.prototype.setupDetectionHover;
 if(!legacy)w.detectionHoverHost=Runtime.prototype.detectionHoverHost;
 return w;
};
