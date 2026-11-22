const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
function compile(source,fileName='fixture.ts'){
  const result=ts.transpileModule(source,{fileName,compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
  assert.equal(result.diagnostics.filter(d=>d.category===1).length,0);return result.outputText;
}
const m={exports:{}};
new Function('module','exports',compile(fs.readFileSync(root+'/src/features/routing/captureRouteGeometry.ts','utf8')))(m,m.exports);
const {normalizeCaptureRoutePaths:normalize}=m.exports;
const invalid=[undefined,null,{},[],[[]],[[0,0]],[[[0,0]]],[[0,0],[1,NaN]],[[0,0],[1,Infinity]],[[0,0],[1,'2']],[[0,0],[1,1,undefined]],[[[0,0],[1,1]],[]],[[[0,0],[1,1]],[2,2]],new Array(2),[[0,0],new Array(2)]];
for(const [i,input] of invalid.entries())test('rejects malformed geometry '+i,()=>assert.equal(normalize(input),null));
test('valid 2D/3D and multipart input retain original coordinate references',()=>{
  const line=Object.freeze([Object.freeze([0,0,7]),Object.freeze([1,1,8])]);
  assert.equal(normalize(line)[0],line);assert.equal(normalize({coordinates:line})[0],line);
  const paths=Object.freeze([line,Object.freeze([[2,2],[3,3]])]);assert.equal(normalize(paths),paths);assert.equal(normalize({coordinates:paths}),paths);
});
const widget=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8');
const sf=ts.createSourceFile('widget.tsx',widget,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const owner=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');
const member=name=>owner.members.find(n=>n.name?.getText(sf)===name).getText(sf);
const renderer={exports:{}};
new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/routing/captureRouteRenderer.ts','utf8')))(()=>({normalizeCaptureRoutePaths:normalize}),renderer,renderer.exports);
const Factory=new Function('normalizeCaptureRoutePaths','loadArcGISJSAPIModules','renderCaptureRouteGraphics',compile('return class Fixture {'+member('drawCaptureRoute')+'}'));
function setup(existing=true){
  const calls=[],graphics=[];let resolve;
  const pending=new Promise(r=>resolve=r);
  class Layer{removeAll(){calls.push('clear');}add(g){graphics.push(g);}}
  const view={map:{add:()=>calls.push('attach')},destroyed:false};
  const Fixture=Factory(normalize,()=>{calls.push('load');return pending;},renderer.exports.renderCaptureRouteGraphics);
  const w=new Fixture();w.state={jimuMapView:{view}};w.ArcGISModules={Graphic:class{constructor(properties){Object.assign(this,properties);}}};
  if(existing)w._routeGraphicLayer=new Layer();
  return {w,view,calls,graphics,resolve:()=>resolve([Layer])};
}
test('invalid geometry leaves an existing route untouched and avoids SDK loading',async()=>{
  for(const input of invalid){const f=setup();await f.w.drawCaptureRoute(input);assert.deepEqual(f.calls,[]);assert.equal(f.graphics.length,0);}
});
test('valid drawing retains both purple symbols, spatial reference and coordinate identity',async()=>{
  const f=setup(),line=[[0,0,7],[1,1,8]];await f.w.drawCaptureRoute(line);
  assert.deepEqual(f.calls,['clear']);assert.equal(f.graphics.length,2);
  for(const g of f.graphics){assert.equal(g.geometry.paths[0],line);assert.equal(g.geometry.spatialReference.wkid,4326);}
  assert.deepEqual(f.graphics.map(g=>g.symbol),[{type:'simple-line',color:[168,85,247,.35],width:8},{type:'simple-line',color:[168,85,247,1],width:3.5,style:'solid'}]);
});
for(const change of ['cancel','view','map','destroy'])test('pending layer load rejects stale '+change,async()=>{
  const f=setup(false);let current=true;const pending=f.w.drawCaptureRoute([[0,0],[1,1]],()=>current);
  if(change==='cancel')current=false;
  if(change==='view')f.w.state.jimuMapView={view:{map:{}}};
  if(change==='map')f.view.map={};
  if(change==='destroy')f.view.destroyed=true;
  f.resolve();await pending;assert.deepEqual(f.calls,['load']);assert.equal(f.w._routeGraphicLayer,undefined);assert.equal(f.graphics.length,0);
});
test('a valid new layer attaches and draws only after loading',async()=>{
  const f=setup(false),pending=f.w.drawCaptureRoute([[0,0],[1,1]]);assert.deepEqual(f.calls,['load']);f.resolve();await pending;assert.deepEqual(f.calls,['load','attach','clear']);assert.equal(f.graphics.length,2);
});
test('final evaluation stays before drawing and publication in the execution workflow',()=>{
  const method=require('./helpers/captureExecutionSource.cjs').captureExecutionSource();
  const evaluate=method.indexOf('= evaluateFinalCaptureRoute({');
  const draw=method.indexOf('await this.drawCaptureRoute(finalPaths, run.current);',evaluate);
  const check=method.indexOf('run.check();',draw);
  const publish=method.indexOf('routeData: buildCaptureRouteData(',check);
  assert(evaluate>0&&draw>evaluate&&check>draw&&publish>check);
});
