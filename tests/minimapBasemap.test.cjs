const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
function compile(s){const r=ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});assert.equal(r.diagnostics.filter(d=>d.category===1).length,0);return r.outputText;}
const m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/minimap/minimapBasemap.ts','utf8')))(m,m.exports);const {resolveMinimapBasemap}=m.exports;
const golden=JSON.parse(fs.readFileSync(__dirname+'/fixtures/minimapBasemap.baseline.json'));
const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),start=source.indexOf('      const basemapConfig = resolveMinimapBasemap('),end=source.indexOf('      // Create minimap map instance',start);assert(start>0&&end>start);
const previous=new Function('Basemap','console',compile(golden.body+'return basemapConfig;'));
const adapter=new Function('Basemap','console','resolveMinimapBasemap',compile(source.slice(start,end)+'return basemapConfig;'));
function execute(old,{id='custom',missing,failJSON=false,failRestore=false,failClone=false,failRead=false,failWarn=false}={}){
 const calls=[],json=Object.freeze({baseMapLayers:Object.freeze([{id:'layer'}])}),restored={kind:'restored'},cloned={kind:'cloned'};
 const basemap={id,toJSON(){calls.push(['serialize']);if(failJSON)throw Error('serialize failed');return json;},clone(){calls.push(['clone']);if(failClone)throw Error('clone failed');return cloned;}};
 const map={get basemap(){calls.push(['read']);if(failRead)throw Error('read failed');return missing==='null'?null:missing==='undefined'?undefined:basemap;}};
 const api={fromJSON(value){assert.equal(this,api);assert.equal(value,json);calls.push(['restore',value]);if(failRestore)throw Error('restore failed');return restored;}};
 const logging={warn:(...args)=>{calls.push(['warning',...args.map(a=>a instanceof Error?a.message:a)]);if(failWarn)throw Error('warning failed');}};
 let value,error;try{value=old?previous.call({state:{jimuMapView:{view:{map}}}},api,logging):adapter.call({state:{jimuMapView:{view:{map}}}},api,logging,resolveMinimapBasemap);}catch(e){error=e.message;}
 if(value&&typeof value==='object')assert(value===restored||value===cloned);return {value,error,calls};
}
function compare(options){const old=execute(true,options),actual=execute(false,options);assert.deepEqual(actual,old);return actual;}
const standard=['satellite','hybrid','oceans','osm','terrain','dark-gray','dark-gray-vector','gray','gray-vector','streets','streets-vector','streets-night-vector','streets-relief-vector','streets-navigation-vector','topo','topo-vector'];
for(const id of standard)test('standard basemap '+id+' retains ID fast path',()=>{const r=compare({id});assert.equal(r.value,id);assert.deepEqual(r.calls,[['read']]);});
for(const missing of ['null','undefined'])test('missing basemap '+missing+' uses default',()=>assert.equal(compare({missing}).value,'topo-vector'));
test('custom basemap uses JSON reconstruction before minimap creation',()=>{const r=compare();assert.equal(r.value.kind,'restored');assert.deepEqual(r.calls.map(c=>c[0]),['read','serialize','restore']);});
test('absent standard ID still uses JSON reconstruction',()=>compare({id:''}));
test('serialization failure retains warning then clone fallback',()=>{const r=compare({failJSON:true});assert.equal(r.value.kind,'cloned');assert.deepEqual(r.calls.map(c=>c[0]),['read','serialize','warning','clone']);});
test('restoration failure retains warning then clone fallback',()=>assert.equal(compare({failRestore:true}).value.kind,'cloned'));
test('clone failure retains both warnings and default',()=>{const r=compare({failJSON:true,failClone:true});assert.equal(r.value,'topo-vector');assert.equal(r.calls.filter(c=>c[0]==='warning').length,2);});
test('basemap read failure is caught at the same boundary',()=>assert.equal(compare({failRead:true}).value,'topo-vector'));
test('warning callback failure retains existing propagation',()=>assert.equal(compare({failJSON:true,failWarn:true}).error,'warning failed'));
test('basemap copy stays after minimap revision check and before Map construction',()=>{
 const check=source.lastIndexOf('if (!current()) return;',start),makeMap=source.indexOf('const minimap = new Map(',end);assert(check>0&&check<start&&makeMap>end);
});
