const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
function compile(s){const r=ts.transpileModule(s,{reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}});assert.equal(r.diagnostics.filter(d=>d.category===1).length,0);return r.outputText;}
const geoSource=ts.createSourceFile('geoUtils.ts',fs.readFileSync(root+'/src/utils/geoUtils.ts','utf8'),ts.ScriptTarget.Latest,true);
let activeTrace;
const geometry={};for(const name of ['distanceMeters','calculateBearing']){const n=geoSource.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text===name);const m={exports:{}};new Function('module','exports',compile(n.getText(geoSource)))(m,m.exports);const original=m.exports[name];geometry[name]=(...args)=>{activeTrace?.push([name,...args]);return original(...args);};}
const owner={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/streetBearing.ts','utf8')))(()=>geometry,owner,owner.exports);
const baseline=JSON.parse(fs.readFileSync(__dirname+'/fixtures/streetBearing.baseline.json'));
const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');
const method=widget.members.find(n=>n.name?.getText(sf)==='getStreetBearing').getText(sf);
const Old=new Function('distanceMeters','calculateBearing',compile('return class Harness{'+baseline.method+'}'))(geometry.distanceMeters,geometry.calculateBearing);
const Current=new Function('streetBearing',compile('return class Harness{'+method+'}'))(owner.exports.streetBearing);
const point=(id,east=0,north=0)=>({id,lon:east/111320,lat:north/111320});
function compare(options={}){const {images,imageId='A',context}=options;const fallback=Object.prototype.hasOwnProperty.call(options,'fallback')?options.fallback:287;const before=JSON.stringify({images,context});const results=[],traces=[];for(const C of [Old,Current]){const w=new C();w.state={imageId,sequenceImages:images};w._lastBearing=fallback;w._pointCloudSequenceContext=context;activeTrace=[];results.push(w.getStreetBearing());traces.push(activeTrace);activeTrace=undefined;}assert.deepEqual(results[1],results[0]);assert.deepEqual(traces[1],traces[0]);assert.equal(JSON.stringify({images,context}),before);return results[1];}
for(const images of [undefined,null,[]])test(`missing route ${String(images)} retains fallback`,()=>assert.equal(compare({images}),287));
for(const imageId of [null,0,''])test(`missing image ${String(imageId)} retains fallback`,()=>assert.equal(compare({images:[point(imageId),point('next',30)],imageId}),287));
test('unknown image uses live bearing fallback',()=>assert.equal(compare({images:[point('B')]}),287));
test('single image retains live bearing fallback',()=>assert.equal(compare({images:[point('A')]}),287));
test('numeric and string identities compare as before',()=>assert.equal(compare({images:[point(1),point(2,20)],imageId:'1'}),90));
test('forward distant sample bypasses nearby GPS jitter',()=>assert.equal(compare({images:[point('A'),point('jitter',0,1),point('far',20)]}),90));
test('forward distant sample takes precedence over backward sample',()=>assert.equal(compare({images:[point('back',0,-30),point('A'),point('far',20)]}),90));
test('end-of-route uses forward direction from backward sample',()=>assert.equal(compare({images:[point('back',-20),point('jitter',0,-1),point('A')]}),90));
test('short route uses immediate next neighbour',()=>assert.equal(compare({images:[point('A'),point('next',5)]}),90));
test('short route end uses immediate previous neighbour',()=>assert.equal(compare({images:[point('prev',-5),point('A')]}),90));
test('coincident neighbours preserve existing geometry result',()=>compare({images:[point('A'),point('next')]}));
test('matching point-cloud context overrides live route',()=>assert.equal(compare({images:[point('A'),point('next',0,30)],context:{imageId:'A',points:[point('A'),point('next',30)]}}),90));
test('mismatched point-cloud context does not override live route',()=>assert.equal(compare({images:[point('A'),point('next',0,30)],context:{imageId:'B',points:[point('A'),point('next',30)]}}),0));
test('empty matching context retains fallback rather than using another route',()=>assert.equal(compare({images:[point('A'),point('next',30)],context:{imageId:'A',points:[]}}),287));
for(const fallback of [0,undefined,NaN,-10])test(`fallback semantics retained for ${fallback}`,()=>compare({images:[],fallback}));
test('varied deterministic routes retain original direction without mutation',()=>{let seed=17;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};for(let trial=0;trial<250;trial++){const size=1+Math.floor(random()*20),images=[];let east=0,north=0;for(let i=0;i<size;i++){east+=(random()-.5)*40;north+=(random()-.5)*40;images.push(point(String(i),east,north));}compare({images,imageId:String(Math.floor(random()*size)),fallback:random()*360});}});
