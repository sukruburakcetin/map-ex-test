/** Native Window timers and the production low-zoom pointer handler; no ArcGIS/network dependency. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const {chromium}=require('playwright'),root=path.resolve(__dirname,'..');
const compile=text=>ts.transpileModule(text,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const text=fs.readFileSync(path.join(root,'src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);let pointer;
function visit(node){if(ts.isCallExpression(node)&&node.expression.getText(sf)==='view.on'&&node.arguments[0]?.text==='pointer-move')pointer=node.arguments[1];ts.forEachChild(node,visit)}visit(sf);assert(pointer);
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const page=await browser.newPage();await page.goto('about:blank');
  const result=await page.evaluate(async({ownerCode,handlerCode})=>{
   const module={};new Function('exports',ownerCode)(module);const events=[];let picks=0,warnings=0,lookups=0;
   const view={zoom:4,type:'2d',container:{getBoundingClientRect:()=>({left:0,top:0})}},w={state:{turboModeActive:true,jimuMapView:{view}},turboCoverageLayer:{},tooltipDiv:{},
    pickTurboRepresentative:async()=>{lookups++;await new Promise(resolve=>setTimeout(resolve,350));return{attributes:{image_id:'A'}}},
    hitTestHoverLayers:async()=>({results:[]}),pickMapFeature:async()=>null,updateTurboHover:()=>picks++,clearTurboHoverDetails(){},updateTurboPickWarning:()=>warnings++,_t:key=>key};
   w._hoverPreviewStatus=new module.DelayedHoverStatus(value=>events.push(value));
   const handler=new Function('view','TURBO_LIMITS','LAYER_IDS',handlerCode).call(w,view,{pickRadiusPx:8,hoverRadiusPx:8},{OBJECTS_FL:'objects',TRAFFIC_SIGNS_FL:'signs'});
   handler({x:100,y:100});await new Promise(resolve=>setTimeout(resolve,500));w._hoverPreviewStatus.dispose();return{events,picks,warnings,lookups};
  },{ownerCode:compile(fs.readFileSync(path.join(root,'src/features/imagery/DelayedHoverStatus.ts'),'utf8')),handlerCode:compile('let hoverHitTestTimeout=null;return ('+pointer.getText(sf)+');')});
  assert.deepEqual(result,{events:[true,false],picks:1,warnings:0,lookups:1});console.log('PASS Chromium: native timers show/clear status and production low-zoom hover reaches the preview');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
