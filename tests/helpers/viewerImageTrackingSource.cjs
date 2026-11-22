/** Exercise actual image-event forwarding, tracking workflow and the widget's live capability bindings. */
const fs=require('node:fs'),path=require('node:path');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const root=path.resolve(__dirname,'../..');
const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const sf=ts.createSourceFile('widget.tsx',fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),99,true,4),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');
const host=widget.members.find(n=>n.name?.getText(sf)==='viewerImageTrackingHost').getText(sf);
const eventSf=ts.createSourceFile('events.ts',fs.readFileSync(root+'/src/features/imagery/viewerEventBinding.ts','utf8'),99,true,3);
let callback;function visit(n){if(ts.isCallExpression(n)&&ts.isPropertyAccessExpression(n.expression)&&n.expression.name.text==='on'&&n.arguments[0]?.text==='image')callback=n.arguments[1];ts.forEachChild(n,visit);}visit(eventSf);
const mod={exports:{}};new Function('exports',compile(fs.readFileSync(root+'/src/features/imagery/viewerImageTracking.ts','utf8')))(mod.exports);
const Binding=new Function(compile('return class Binding {'+host+'};'))();
exports.trackViewerImage=mod.exports.trackViewerImage;
exports.install=w=>{w.viewerImageTrackingHost=Binding.prototype.viewerImageTrackingHost;return w;};
exports.createHandler=(w,profileEventViewer,redrawCone=()=>{},legacy=false,platform={})=>{
 if(legacy)return new Function('profileEventViewer','redrawCone',...Object.keys(platform),compile('return ('+require('../fixtures/viewerImageTracking.baseline.json').callback+');')).call(w,profileEventViewer,redrawCone,...Object.values(platform));
 exports.install(w);
 const active={exports:{}};new Function('exports',...Object.keys(platform),compile(fs.readFileSync(root+'/src/features/imagery/viewerImageTracking.ts','utf8')))(active.exports,...Object.values(platform));
 return new Function('trackViewerImage','profileEventViewer','redrawCone','imageTrackingHost',compile('return ('+callback.getText(eventSf)+');')).call(w,active.exports.trackViewerImage,profileEventViewer,redrawCone,w.viewerImageTrackingHost());
};
