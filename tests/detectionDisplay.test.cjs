const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const source=fs.readFileSync(path.join(__dirname,'../src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',source,99,true,4),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');
const names=['changeDetectionOverlap','changeDetectionOpacity','resetDetectionDisplay','changeMapFeatureSpriteScale','applyMapFeatureSpriteScale'];
const methods=widget.members.filter(n=>n.name&&names.includes(n.name.getText(sf))).map(n=>n.getText(sf)).join('\n');
function fixture() {
  const context={};vm.createContext(context);
  vm.runInContext(ts.transpileModule(`class Probe {state={};calls=[];setState(value,done){Object.assign(this.state,value);done?.();}applyMapFeatureCategories(kind,value){this.calls.push(['categories',kind,value]);}${methods}};globalThis.probe=new Probe();`,{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText,context);
  const p=context.probe;
  p._detectionLayers={setOpacity:(kind,value)=>p.calls.push(['opacity',kind,value]),applyAppearance:async kind=>p.calls.push(['appearance',kind])};
  return p;
}
test('opacity validates input and forwards only the chosen type',()=>{
  const p=fixture();p.changeDetectionOpacity('signs',.5);assert.equal(p.state.signOpacity,.5);assert.equal(p.state.objectOpacity,undefined);
  assert.equal(JSON.stringify(p.calls),JSON.stringify([['opacity','signs',.5]]));
  for(const value of [NaN,Infinity,0,1.1])p.changeDetectionOpacity('signs',value);assert.equal(p.calls.length,1);
});
test('Reset restores one type and retains the other type settings',()=>{
  const p=fixture();p.state={signOpacity:.3,objectOpacity:.6,signSpriteScale:2,objectSpriteScale:1.5,signDisplayMode:'highlight',objectDisplayMode:'highlight',signReduceOverlap:true,objectReduceOverlap:true,signLabels:true,objectLabels:true};
  p.resetDetectionDisplay('signs');
  assert.equal(p.state.signOpacity,1);assert.equal(p.state.signSpriteScale,1);assert.equal(p.state.signDisplayMode,'selected');assert.equal(p.state.signReduceOverlap,false);assert.equal(p.state.signLabels,false);
  assert.equal(p.state.objectOpacity,.6);assert.equal(p.state.objectSpriteScale,1.5);assert.equal(p.state.objectDisplayMode,'highlight');assert.equal(p.state.objectReduceOverlap,true);assert.equal(p.state.objectLabels,true);
  assert.equal(JSON.stringify(p.calls),JSON.stringify([['categories','signs',null],['appearance','signs']]));
});
test('overlap and size changes delegate appearance without resetting categories',async()=>{
  const p=fixture();p.changeDetectionOverlap('signs',true);p.changeMapFeatureSpriteScale('objects',1.5);await Promise.resolve();
  assert.equal(p.state.signReduceOverlap,true);assert.equal(p.state.objectSpriteScale,1.5);assert.equal(p.state.objectReduceOverlap,undefined);
  assert.equal(JSON.stringify(p.calls),JSON.stringify([['appearance','signs'],['appearance','objects']]));
  p.changeDetectionOverlap('signs','true');p.changeMapFeatureSpriteScale('signs',.1);assert.equal(p.calls.length,2);
});
