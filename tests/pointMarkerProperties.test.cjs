/** Frozen marker methods versus extracted property factories, retaining allocation and ownership traces. */
const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const root=path.resolve(__dirname,'..'),compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8').replace(/^\uFEFF/,'').replace(/\r\n/g,'\n'),sf=ts.createSourceFile('widget.tsx',source,99,true,4),w=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');
const baseline=JSON.parse(fs.readFileSync(__dirname+'/fixtures/pointMarkerProperties.baseline.json','utf8')).methods;
const m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/map-graphics/pointMarkerProperties.ts','utf8')))(m,m.exports);const {legacySequencePointProperties,clickedLocationPointProperties}=m.exports;
function fixture(original,{type='2d',turbo=false,missing=null,fail=null}={}){
 const methods=Object.keys(baseline).map(name=>original?baseline[name]:w.members.find(n=>n.name?.getText(sf)===name).getText(sf)).join('\n');
 const Runtime=new Function('legacySequencePointProperties','clickedLocationPointProperties',compile('class Runtime{'+methods+'};return Runtime;'))(legacySequencePointProperties,clickedLocationPointProperties);
 const widget=new Runtime(),trace=[],graphics=[],points=new Map();let serial=0;
 const record=(name,...args)=>{trace.push([name,...args]);if(fail===name)throw 'failed '+name};
 const view={type,graphics:{remove:g=>record('remove',g.id)}};
 widget.state={turboModeActive:turbo,jimuMapView:missing==='view'?null:{view}};
 widget.ArcGISModules=missing==='modules'?null:{Graphic:class{constructor(properties){record('construct',structuredClone(properties));const graphic={...properties,id:++serial};graphics.push(graphic);return graphic}}};
 widget.clickedLocationGraphic=null;
 widget._activeSequenceOverlay={points};widget.ensureActiveSequenceLayer=v=>{assert.equal(v,view);record('layer');return{add:g=>record('layerAdd',g.id)}};
 widget._ownedMapResources={addGraphic:(v,g)=>{assert.equal(v,view);record('owned',g.id)}};
 return{w:widget,view,trace,graphics,points,legacy:(...args)=>widget.drawPointWithoutRemoving(...args),click:(...args)=>widget.drawPoint(...args)};
}
function compare(action,options){const a=fixture(true,options),b=fixture(false,options);action(a);action(b);assert.deepEqual(b.trace,a.trace);assert.deepEqual(b.graphics,a.graphics);assert.deepEqual([...b.points],[...a.points]);assert.deepEqual(b.w.clickedLocationGraphic,a.w.clickedLocationGraphic);return b;}
for(const type of ['2d','3d'])for(const [name,args] of [
 ['defaults',[1,2]],['selected blue',[1,2,[0,0,255,1],'S','I']],['temporary red',[1,2,[255,0,0,1],'S','I']],
 ['no sequence',[0,0,[0,0,255,1]]],['empty ids',[-71,42,[0,0,255,1],'','']],['coordinate key',[1,2,[0,0,255,1],'S']],
 ['unusual coordinates',[NaN,Infinity,[1,2,3,0],'S','I']],
])test(`${type} legacy ${name}`,()=>compare(f=>f.legacy(...args),{type}));
for(const type of ['2d','3d'])test(type+' repeated sequence ID updates the existing point after constructing new properties',()=>compare(f=>{f.legacy(1,2,[0,0,255,1],'S','I');f.legacy(3,4,[0,0,255,.2],'S','I');assert.equal(f.points.size,1);assert.equal(f.points.get('S:I').geometry.longitude,3);assert.equal(f.trace.filter(e=>e[0]==='layerAdd').length,1)},{type}));
test('deferred batches are populated before layer submission without losing deduplication',()=>compare(f=>{const batch=[];f.legacy(1,2,undefined,'S','I',batch);f.legacy(3,4,undefined,'S','I',batch);assert.equal(batch.length,1);assert.equal(batch[0],f.points.get('S:I'));assert(!f.trace.some(e=>e[0]==='layerAdd'))}));
for(const missing of ['view','modules'])for(const name of ['legacy','click'])test(name+' missing '+missing+' allocates nothing',()=>compare(f=>{f[name](1,2);assert.equal(f.graphics.length,0)},{missing}));
test('Turbo legacy drawing returns before property construction or allocation',()=>compare(f=>{f.legacy(1,2,undefined,'S','I');assert.equal(f.graphics.length,0)},{turbo:true}));
for(const type of ['2d','3d'])test(type+' clicked marker replacement keeps remove/allocate/attach/reference order',()=>compare(f=>{f.click(1,2);f.click(3,4);assert.equal(f.w.clickedLocationGraphic,f.graphics[1]);assert(f.graphics[1].__isSequenceOverlay)},{type}));
for(const fail of ['construct','layer','layerAdd','owned'])test('legacy '+fail+' failure retains propagation and partial ownership',()=>compare(f=>assert.throws(()=>f.legacy(1,2,undefined,fail==='owned'?undefined:'S','I'),e=>e==='failed '+fail),{fail}));
for(const fail of ['construct','owned'])test('clicked '+fail+' failure retains publication boundary',()=>compare(f=>assert.throws(()=>f.click(1,2),e=>e==='failed '+fail),{fail}));
test('clicked removal failure preserves the original clicked reference',()=>compare(f=>{f.w.clickedLocationGraphic={id:'old'};assert.throws(()=>f.click(1,2),e=>e==='failed remove');assert.equal(f.w.clickedLocationGraphic.id,'old')},{fail:'remove'}));
test('factories retain borrowed color identity and give each call fresh nested properties',()=>{
 const color=[1,2,3,1];for(const is3D of [false,true]){const a=legacySequencePointProperties(1,2,color,is3D,'S','I'),b=legacySequencePointProperties(1,2,color,is3D,'S','I');assert.equal(is3D?a.symbol.symbolLayers[0].material.color:a.symbol.color,color);assert.notEqual(a.geometry,b.geometry);assert.notEqual(a.geometry.spatialReference,b.geometry.spatialReference);assert.notEqual(a.symbol,b.symbol);assert.notEqual(a.attributes,b.attributes);if(is3D){assert.notEqual(a.symbol.symbolLayers[0],b.symbol.symbolLayers[0]);assert.notEqual(a.symbol.verticalOffset,b.symbol.verticalOffset)}else assert.notEqual(a.symbol.outline,b.symbol.outline)}
 const a=clickedLocationPointProperties(1,2),b=clickedLocationPointProperties(1,2);a.symbol.outline.width=99;a.geometry.spatialReference.wkid=7;assert.equal(b.symbol.outline.width,2);assert.equal(b.geometry.spatialReference.wkid,4326);assert.notEqual(a.attributes,b.attributes);
});
