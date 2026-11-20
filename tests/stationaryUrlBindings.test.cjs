const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
function compile(source){const r=ts.transpileModule(source,{reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}});assert.equal(r.diagnostics.filter(d=>d.category===1).length,0);return r.outputText;}
const owner={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/navigation/StationaryUrlBindings.ts','utf8')))(owner,owner.exports);
const baseline=JSON.parse(fs.readFileSync(__dirname+'/fixtures/stationaryUrlBindings.baseline.json'));
const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');
const field=widget.members.find(n=>n.name?.getText(sf)==='_stationaryUrlBindings').getText(sf);
const Old=new Function(compile('return class Harness{'+baseline.defaults+'\nbind(view){'+baseline.bind+'}\nclear(){'+baseline.clear+'}}'))();
const Current=new Function('StationaryUrlBindings',compile('return class Harness{'+field+'\nbind(view){this._stationaryUrlBindings.bind(view);}\nclear(){this._stationaryUrlBindings.clear();}}'))(owner.exports.StationaryUrlBindings);
function fixture(previous){const events=[],watches=[],w=new (previous?Old:Current)();Object.assign(w,{state:{jimuMapView:null,imageId:'imageA'},_isFlyInActive:false,refreshActivePulseAnchor(v){events.push(['pulse',v.name]);},updateUrlWithCurrentImage(id){events.push(['url',id]);}});
 const view=name=>({name,map:{},destroyed:false,watch(property,callback){const r={name,property,callback,removed:false};watches.push(r);events.push(['watch',name,property]);return{remove(){r.removed=true;events.push(['remove',name,property]);}};}});
 return{w,events,watches,view,bind(v){w.state.jimuMapView={view:v};w.bind(v);},emit(v,value){const r=watches.findLast(r=>r.name===v.name);assert(r);r.callback(value);}};
}
function compare(action){const traces=[];for(const previous of [true,false]){const f=fixture(previous);action(f);traces.push({events:f.events,watches:f.watches.map(({callback,...r})=>r)});}assert.deepEqual(traces[1],traces[0]);}
test('stationary true refreshes pulse then writes URL',()=>compare(f=>{const v=f.view('one');f.bind(v);f.emit(v,true);}));
test('moving view causes no work',()=>compare(f=>{const v=f.view('one');f.bind(v);f.emit(v,false);}));
for(const reason of ['other','map','destroyed','no-current'])test(`stale view ignored: ${reason}`,()=>compare(f=>{const v=f.view('one');f.bind(v);if(reason==='other')f.w.state.jimuMapView={view:f.view('two')};if(reason==='map')v.map=null;if(reason==='destroyed')v.destroyed=true;if(reason==='no-current')f.w.state.jimuMapView=null;f.emit(v,true);}));
test('fly-in retains pulse refresh while suppressing URL',()=>compare(f=>{const v=f.view('one');f.bind(v);f.w._isFlyInActive=true;f.emit(v,true);f.w._isFlyInActive=false;f.emit(v,true);}));
for(const id of ['latest',null,undefined,''])test(`latest image ID ${String(id)}`,()=>compare(f=>{const v=f.view('one');f.bind(v);f.w.state.imageId=id;f.emit(v,true);}));
test('each stationary event reads current image ID',()=>compare(f=>{const v=f.view('one');f.bind(v);f.emit(v,true);f.w.state.imageId='imageB';f.emit(v,true);}));
test('view replacement removes old handle before registering new',()=>compare(f=>{const v=f.view('one');f.bind(v);const next=f.view('two');f.bind(next);f.emit(v,true);f.emit(next,true);}));
test('same-view rebind removes and replaces watcher',()=>compare(f=>{const v=f.view('one');f.bind(v);f.bind(v);f.emit(v,true);}));
test('clear before binding and repeated clear are safe',()=>compare(f=>{f.w.clear();const v=f.view('one');f.bind(v);f.w.clear();f.w.clear();}));
test('clear followed by bind preserves watcher lifecycle',()=>compare(f=>{f.bind(f.view('one'));f.w.clear();const v=f.view('two');f.bind(v);f.emit(v,true);}));
test('retains existing callback behavior if SDK delivers after removal',()=>compare(f=>{const v=f.view('one');f.bind(v);f.w.clear();f.emit(v,true);}));
test('fly-in state is read after pulse work',()=>compare(f=>{const v=f.view('one');f.bind(v);f.w.refreshActivePulseAnchor=function(v){f.events.push(['pulse',v.name]);this._isFlyInActive=true;};f.emit(v,true);}));
test('image identity is read after pulse work',()=>compare(f=>{const v=f.view('one');f.bind(v);f.w.refreshActivePulseAnchor=function(v){f.events.push(['pulse',v.name]);this.state.imageId='from-pulse';};f.emit(v,true);}));
