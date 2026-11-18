const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
function compile(s){return ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;}
const fixture=JSON.parse(fs.readFileSync(__dirname+'/fixtures/minimapSelection.baseline.json'));
const helper=new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/minimap/minimapSelection.ts','utf8')));
const source=fs.readFileSync(root+'/src/features/minimap/minimapSelection.ts','utf8').replaceAll('host.state()', 'this.state').replaceAll('host.loadSequence(', 'this.loadSequenceById(');
const a=source.indexOf('const { closestImg, minDist } = nearestMinimapSequenceImage('),b=source.indexOf('// If within 5m',a),c=source.indexOf('const globalClosest = nearestMinimapDiscoveryImage('),d=source.indexOf('if (!globalClosest)',c);assert(a>0&&b>a&&c>b&&d>c);
const oldLocal=new Function('distanceMeters','clickLon','clickLat',compile(fixture.local+'return {closestImg,minDist};'));
const oldGlobal=new Function('distanceMeters','clickLon','clickLat','fullSeqs',compile(fixture.discovery+'return globalClosest;'));
const newLocal=new Function('nearestMinimapSequenceImage','clickLon','clickLat',compile(source.slice(a,b)+'return {closestImg,minDist};'));
const newGlobal=new Function('nearestMinimapDiscoveryImage','clickLon','clickLat','fullSeqs',compile(source.slice(c,d)+'return globalClosest;'));
const images=Object.freeze([1,2,3].map(n=>Object.freeze({id:'img-'+n,lat:n,lon:n*10}))),sequences=Object.freeze([{sequenceId:'S1',images:images.slice(0,2)},{sequenceId:'S2',images:images.slice(2)}]);
function helpers(measure){const m={exports:{}};helper(()=>({distanceMeters:measure}),m,m.exports);return m.exports;}
function compare(values,{empty=false}={}){
 const input=empty?[]:images,seq=empty?[]:sequences,oldCalls=[],newCalls=[];
 const measure=calls=>(...args)=>{calls.push(args);return values[args[0]-1];};const oldDistance=measure(oldCalls),h=helpers(measure(newCalls));
 const beforeLocal=oldLocal.call({state:{sequenceImages:input}},oldDistance,99,88),afterLocal=newLocal.call({state:{sequenceImages:input}},h.nearestMinimapSequenceImage,99,88);
 assert.deepEqual(afterLocal,beforeLocal);assert.equal(afterLocal.closestImg,beforeLocal.closestImg);
 const beforeGlobal=oldGlobal(oldDistance,99,88,seq),afterGlobal=newGlobal(h.nearestMinimapDiscoveryImage,99,88,seq);assert.deepEqual(afterGlobal,beforeGlobal);assert.deepEqual(newCalls,oldCalls);return {local:afterLocal,global:afterGlobal};
}
for(const values of [[3,2,1],[1,2,3],[2,2,2],[NaN,1,0],[Infinity,2,1],[Infinity,Infinity,Infinity],[-1,-2,-3],[0,0,0]])test('distance sequence '+values,()=>compare(values));
test('empty searches retain null/infinite results',()=>{const r=compare([],{empty:true});assert.equal(r.local.closestImg,null);assert.equal(r.local.minDist,Infinity);assert.equal(r.global,null);});
test('local and discovery retain distinct first-NaN behavior',()=>{const r=compare([NaN,1,0]);assert.equal(r.local.closestImg.id,'img-3');assert.equal(r.global.imgId,'img-1');assert(Number.isNaN(r.global.dist));});
test('ties preserve the first image and sequence',()=>{const r=compare([2,2,2]);assert.equal(r.local.closestImg,images[0]);assert.equal(r.global.seqId,'S1');});
test('varied distances preserve exact distance-call order and coordinate argument order',()=>{for(let i=0;i<50;i++)compare([i%7,(i*3)%7,(i*5)%7]);});
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const branchStart=source.lastIndexOf('// 1. Check if the click is near a point in the CURRENT sequence',a),branchEnd=source.indexOf('// 2. Click is elsewhere',branchStart);
const oldJump=new AsyncFunction('distanceMeters','clickLon','clickLat',compile(fixture.jumpBranch));
const newJump=new AsyncFunction('nearestMinimapSequenceImage','clickLon','clickLat',compile(source.slice(branchStart,branchEnd)));
for(const [distance,currentId,sequenceId,expected] of [[4.999,'current','S',1],[5,'current','S',0],[5.001,'current','S',0],[0,'img-1','S',0],[0,'current',null,0]])test('jump guard '+distance+'/'+currentId+'/'+sequenceId,async()=>{
 async function run(old){const calls=[],state={sequenceImages:[images[0]],imageId:currentId,sequenceId},w={state,loadSequenceById:async(...args)=>calls.push(args)};if(old)await oldJump.call(w,()=>distance,99,88);else await newJump.call(w,helpers(()=>distance).nearestMinimapSequenceImage,99,88);return calls;}
 const before=await run(true),actual=await run(false);assert.deepEqual(actual,before);assert.equal(actual.length,expected);
});
