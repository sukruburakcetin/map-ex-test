/** Load the actual viewer coordinator with fixture platform scheduling; no event policy is substituted. */
const fs=require('node:fs'),path=require('node:path');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const root=path.resolve(__dirname,'../..');
const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const sf=ts.createSourceFile('widget.tsx',fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),99,true,4),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');
const member=name=>widget.members.find(n=>n.name?.getText(sf)===name).getText(sf);
exports.install=(w,platform={},legacy=false)=>{
 const clocks={setTimeout:()=>1,requestAnimationFrame:()=>1,...platform};
 const tracking={exports:{}};new Function('exports',...Object.keys(clocks),compile(fs.readFileSync(root+'/src/features/imagery/viewerImageTracking.ts','utf8')))(tracking.exports,...Object.values(clocks));
 const binding={exports:{}};new Function('require','exports',...Object.keys(clocks),compile(fs.readFileSync(root+'/src/features/imagery/viewerEventBinding.ts','utf8')))(name=>{if(name!=='./viewerImageTracking')throw Error('Unexpected runtime dependency '+name);return tracking.exports;},binding.exports,...Object.values(clocks));
 const globals={bindViewerEvents:binding.exports.bindViewerEvents,trackViewerImage:tracking.exports.trackViewerImage,debounceUtil:work=>work,PlaybackBindings:class{bind(){}},...clocks};
 const members=legacy?require('../fixtures/viewerEventBinding.baseline.json').method:member('bindMapillaryEvents')+'\n'+member('viewerEventsHost');
 const Runtime=new Function(...Object.keys(globals),compile('return class Runtime {'+member('viewerImageTrackingHost')+'\n'+members+'};'))(...Object.values(globals));
 w.viewerImageTrackingHost=Runtime.prototype.viewerImageTrackingHost;w.bindMapillaryEvents=Runtime.prototype.bindMapillaryEvents;
 if(!legacy)w.viewerEventsHost=Runtime.prototype.viewerEventsHost;
 return w;
};
