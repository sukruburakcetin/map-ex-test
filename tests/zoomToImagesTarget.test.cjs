const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const root=path.resolve(__dirname,'..'),compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const originalMethod="  private async getZoomToImagesTarget(view: __esri.MapView | __esri.SceneView, signal: AbortSignal): Promise<number[] | __esri.Point | null> {\n    const id = this.state.imageId;\n    if (id) {\n      const selected = this.state.sequenceImages?.find((image: any) => String(image.id) === String(id)) || this._lastSuccessfulSelection?.sequenceImages?.find((image: any) => String(image.id) === String(id));\n      if (selected && Number.isFinite(selected.lon) && Number.isFinite(selected.lat) && Math.abs(selected.lon) <= 180 && Math.abs(selected.lat) <= 90) return [selected.lon, selected.lat];\n      const graphic = this.currentGreenGraphic;\n      if (String(graphic?.attributes?.image_id) === String(id) && graphic?.geometry?.type === \"point\") return graphic.geometry as __esri.Point;\n    }\n    // In a tilted globe view the screen center can be sky; sample lower ground before falling back to view.center.\n    let ground: __esri.Point | null = null;\n    for (const fraction of [0.5, 0.65, 0.8]) {\n      try { ground = view.toMap({ x: view.width / 2, y: view.height * fraction }) as __esri.Point; } catch (_) { ground = null; }\n      if (ground && Number.isFinite(ground.longitude) && Number.isFinite(ground.latitude)) break;\n      ground = null;\n    }\n    ground = ground || view.center;\n    if (!ground) return null;\n    if (view.zoom < 14 && this.turboCoverageLayer && !signal.aborted) {\n      try {\n        const pixel = view.toScreen(ground);\n        if (pixel) {\n          const nearby = await this.pickTurboRepresentative(pixel, view, signal, false, Math.min(160, Math.max(32, Math.min(view.width, view.height) * 0.15)));\n          if (nearby?.geometry?.type === \"point\") return nearby.geometry as __esri.Point;\n        }\n      } catch (_) { /* Missing/filtered coverage must not prevent navigation to the looked-at ground. */ }\n    }\n    return ground;\n  }\n";
const moduleSource=fs.readFileSync(root+'/src/features/navigation/zoomToImagesTarget.ts','utf8');
const ground={type:'point',longitude:10,latitude:20,tag:'ground'},center={type:'point',longitude:30,latitude:40,tag:'center'},picked={type:'point',longitude:50,latitude:60,tag:'picked'};
const scenarios={
 selected:{id:'A',images:[{id:'A',lon:1,lat:2}]},numericId:{id:'1',images:[{id:1,lon:3,lat:4}]},fallback:{id:'A',fallback:[{id:'A',lon:5,lat:6}]},
 currentPrecedence:{id:'A',images:[{id:'A',lon:1,lat:2}],fallback:[{id:'A',lon:5,lat:6}]},invalidCurrentDoesNotTryFallback:{id:'A',images:[{id:'A',lon:181,lat:2}],fallback:[{id:'A',lon:5,lat:6}]},
 invalidLongitude:{id:'A',images:[{id:'A',lon:NaN,lat:2}]},invalidLatitude:{id:'A',images:[{id:'A',lon:1,lat:91}]},boundaryCoordinates:{id:'A',images:[{id:'A',lon:-180,lat:90}]},
 matchingGraphic:{id:'A',graphic:{attributes:{image_id:'A'},geometry:picked}},otherGraphic:{id:'A',graphic:{attributes:{image_id:'B'},geometry:picked}},nonPointGraphic:{id:'A',graphic:{attributes:{image_id:'A'},geometry:{type:'polygon'}}},
 firstGround:{},secondGround:{samples:[null,ground]},thirdGround:{samples:['throw',{...ground,longitude:NaN},ground]},centerFallback:{samples:[null,null,null]},noGround:{samples:[null,null,null],center:null},
 lowZoomPick:{zoom:13,coverage:true},zoomBoundary:{zoom:14,coverage:true},belowZoomBoundary:{zoom:13.999,coverage:true},noCoverage:{zoom:2},aborted:{zoom:2,coverage:true,abort:true},
 radiusMinimum:{zoom:2,coverage:true,width:100,height:100},radiusMaximum:{zoom:2,coverage:true,width:3000,height:2000},radiusMiddle:{zoom:2,coverage:true,width:800,height:600},
 missingPixel:{zoom:2,coverage:true,pixel:null},projectionFailure:{zoom:2,coverage:true,pixel:'throw'},pickFailure:{zoom:2,coverage:true,pick:'throw'},pickMissing:{zoom:2,coverage:true,pick:null},pickNonPoint:{zoom:2,coverage:true,pick:{geometry:{type:'polygon'}}},abortDuringPick:{zoom:2,coverage:true,abortDuringPick:true},
};
async function execute(kind,options){
 const trace=[],controller=new AbortController();if(options.abort)controller.abort();let sample=0;
 const view={type:'3d',width:options.width??1000,height:options.height??800,zoom:options.zoom??18,center:options.center===undefined?center:options.center,
  toMap:pixel=>{trace.push(['map',pixel]);const point=(options.samples||[ground])[sample++];if(point==='throw')throw Error('sky');return point||null;},
  toScreen:point=>{assert(point===ground||point===center);trace.push(['screen',point.tag]);if(options.pixel==='throw')throw Error('projection');return options.pixel===undefined?{x:123,y:234}:options.pixel;}};
 const state={imageId:options.id,sequenceImages:options.images},fallback={sequenceImages:options.fallback};
 const pick=async(pixel,actualView,signal,preferImages,radius)=>{assert.equal(actualView,view);assert.equal(signal,controller.signal);trace.push(['pick',pixel,preferImages,radius]);if(options.abortDuringPick)controller.abort();if(options.pick==='throw')throw Error('unavailable');return options.pick===undefined?{geometry:picked}:options.pick;};
 let result;
 if(kind==='original'){const Runtime=new Function(compile('class Runtime{'+originalMethod+'};return Runtime;'))(),w=new Runtime();Object.assign(w,{state,_lastSuccessfulSelection:fallback,currentGreenGraphic:options.graphic,turboCoverageLayer:options.coverage?{}:null,pickTurboRepresentative:pick});result=await w.getZoomToImagesTarget(view,controller.signal);}
 else {const m={exports:{}};new Function('module','exports',compile(moduleSource))(m,m.exports);result=await m.exports.zoomToImagesTarget(view,controller.signal,{imageId:()=>state.imageId,images:()=>state.sequenceImages,fallbackImages:()=>fallback.sequenceImages,graphic:()=>options.graphic,hasCoverage:()=>!!options.coverage,pick:(pixel,v,s,r)=>pick(pixel,v,s,false,r)});}
 if(result&&!Array.isArray(result))assert(result===ground||result===center||result===picked);
 return {result:result?structuredClone(result):result,trace};
}
for(const [name,options] of Object.entries(scenarios))test('unchanged zoom target: '+name,async()=>{
 const a=await execute('original',options),b=await execute('extracted',options);assert.deepEqual(b,a);
 if(name==='selected'||name==='currentPrecedence')assert.deepEqual(b.result,[1,2]);
 if(name==='noGround')assert.equal(b.result,null);
 if(name==='secondGround')assert.equal(b.trace.filter(x=>x[0]==='map').length,2);
 if(name==='thirdGround')assert.equal(b.trace.filter(x=>x[0]==='map').length,3);
 if(name==='radiusMinimum')assert.equal(b.trace.find(x=>x[0]==='pick')[3],32);
 if(name==='radiusMaximum')assert.equal(b.trace.find(x=>x[0]==='pick')[3],160);
 if(name==='radiusMiddle')assert.equal(b.trace.find(x=>x[0]==='pick')[3],90);
 if(name==='aborted'||name==='zoomBoundary')assert(!b.trace.some(x=>x[0]==='pick'));
});
test('widget forwarding uses current selections and the existing non-preferred representative picker',async()=>{
 const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,99,true,4),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget'),names=['_zoomToImagesTargetHost','getZoomToImagesTarget'],members=widget.members.filter(n=>n.name&&names.includes(n.name.getText(sf))).map(n=>n.getText(sf)).join('\n');
 let call;const result=Promise.resolve(null),Runtime=new Function('zoomToImagesTarget',compile('class Runtime{'+members+'};return Runtime;'))((...args)=>{call=args;return result;}),w=new Runtime(),view={},signal=new AbortController().signal;
 w.state={imageId:'A',sequenceImages:[]};assert.equal(w.getZoomToImagesTarget(view,signal),result);assert.equal(call[0],view);assert.equal(call[1],signal);const host=call[2];assert.equal(host.imageId(),'A');w.state.imageId='B';assert.equal(host.imageId(),'B');w.getZoomToImagesTarget(view,signal);assert.equal(call[2],host);let pickedArgs;w.pickTurboRepresentative=(...args)=>{pickedArgs=args;return result;};const pixel={x:1,y:2};assert.equal(host.pick(pixel,view,signal,90),result);assert.deepEqual(pickedArgs,[pixel,view,signal,false,90]);
});
