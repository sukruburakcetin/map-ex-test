const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),test=require('node:test'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const source=fs.readFileSync(path.join(__dirname,'../src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget'),member=name=>widget.members.find(n=>n.name?.getText(sf)===name),compile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
// Extract only Nearby reconciliation; unrelated route/coverage owners are not part of this harness.
const updateSource=require('./helpers/widgetUpdateSource.cjs'), update=updateSource.phase('reconcileFeatureDemand').body.statements,nearby=update.filter(node=>
 ts.isVariableStatement(node)&&node.declarationList.declarations.some(declaration=>['nearbyVisible','wasNearbyVisible'].includes(declaration.name.getText(updateSource.ast))) ||
 ts.isIfStatement(node)&&node.expression.getText(updateSource.ast)==='!nearbyVisible' ||
 ts.isExpressionStatement(node)&&node.expression.getText(updateSource.ast)==='host.nearbyDemandVisible = nearbyVisible');
assert.equal(nearby.length,4,'Nearby declarations, demand assignment and visibility branch must be identified uniquely');
const prefix='requireUpdate(nearby, this, prevState);';
class Discovery{constructor(deps){this.deps=deps;this.calls=[];this.cancelled=0;}schedule(...args){this.calls.push(args)}cancel(){this.cancelled++}}
const Harness=new Function('NearbyImageDiscovery','requireUpdate','nearby',compile('class Harness{'+['_nearbyDemandVisible','_nearbyPointerInside','nearbyPanelVisible','refreshNearbyAfterPause','fetchNearbyImages'].map(name=>member(name).getText(sf)).join('\n')+'\n updateDemand(prevState){'+prefix+'}};return Harness;'))(Discovery,updateSource.run,nearby);
function setup(){const w=new Harness();w.props={state:'OPENED'};w.state={imageId:'A',sequenceImages:[],nearbyStripOpen:false,imageTrayTab:'nearby',isLoading:false};w._userPaused=true;w._imageryOpeningRequest=null;w._liveSequenceFrames={find:id=>({id,lat:41,lon:29})};w.getCoverageDisplayPosition=(id,lon,lat)=>({lon,lat});w.setState=patch=>Object.assign(w.state,patch);return w}
test('closed panel creates no Nearby transport owner; explicit open uses immediate demand',()=>{const w=setup();w.fetchNearbyImages(41,29,'A');assert.equal(w._nearbyDiscovery,undefined);const before={...w.state};w.state.nearbyStripOpen=true;w.updateDemand(before);assert.equal(w._nearbyDiscovery.calls.length,1);assert.equal(w._nearbyDiscovery.calls[0][3],true);w.updateDemand({...w.state});assert.equal(w._nearbyDiscovery.calls.length,1)});
test('foreground busy state cancels Nearby and readiness resumes with idle priority, not a new immediate request',()=>{const w=setup(),before={...w.state};w.state.nearbyStripOpen=true;w.updateDemand(before);w._nearbyPointerInside=true;const opened={...w.state};w.state.isLoading=true;w._imageryOpeningRequest=3;w.updateDemand(opened);assert(w._nearbyDiscovery.cancelled>0);assert.equal(w._nearbyPointerInside,true);let previous={...w.state};w.state.isLoading=false;w.updateDemand(previous);assert.equal(w._nearbyDiscovery.calls.length,1);previous={...w.state};w._imageryOpeningRequest=null;w.updateDemand(previous);assert.equal(w._nearbyDiscovery.calls.length,2);assert.equal(w._nearbyDiscovery.calls[1][3],false)});
test('object-tab or closed widget suppresses Nearby; larger100 search requires explicit request',()=>{const w=setup();w.state.nearbyStripOpen=true;w.state.imageTrayTab='object';w.fetchNearbyImages(41,29,'A');assert.equal(w._nearbyDiscovery,undefined);w.state.imageTrayTab='nearby';w.refreshNearbyAfterPause(true,true);assert.equal(w._nearbyDiscovery.calls[0][4],true);w.props.state='CLOSED';w.fetchNearbyImages(41,29,'A');assert.equal(w._nearbyDiscovery.calls.length,1)});
test('real sequence opening cancels Nearby before reuse checks, state work or SDK dispatch',()=>{const active=ts.createSourceFile('opening.ts',require('./helpers/sequenceOpeningSource.cjs').source,99,true,3),opening=active.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='openSequence'),statements=opening.body.statements;assert.equal(statements[0].getText(active),'host.nearbyDiscovery?.cancel();');const run=new Function('host',compile(statements.slice(0,2).map(node=>node.getText(active)).join('\n'))),calls=[],w=require('./helpers/sequenceOpeningSource.cjs').install({_nearbyDiscovery:{cancel:()=>calls.push('cancel')},highlightNearbyPin:()=>calls.push('clear')});run(w.sequenceOpeningHost());assert.deepEqual(calls,['cancel','clear'])});

test('retired presentation owner cannot restart Nearby enrichment',()=>{const w=setup();w.state.nearbyStripOpen=true;w.state.jimuMapView={view:{map:{}}};w._currentImagePresentation={owns:()=>false};w.fetchNearbyImages(41,29,'A',true);assert.equal(w._nearbyDiscovery,undefined)});


test('object tab and hidden widget cancel demand, clear pointer state and resume with the appropriate priority',()=>{
 const w=setup();let previous={...w.state};w.state.nearbyStripOpen=true;w.updateDemand(previous);const owner=w._nearbyDiscovery;
 w._nearbyPointerInside=true;previous={...w.state};w.state.imageTrayTab='object';w.updateDemand(previous);
 assert.equal(owner.cancelled,1);assert.equal(w._nearbyPointerInside,false);assert.equal(owner.calls.length,1);
 previous={...w.state};w.state.imageTrayTab='nearby';w.updateDemand(previous);
 assert.strictEqual(w._nearbyDiscovery,owner);assert.equal(owner.calls.length,2);assert.equal(owner.calls[1][3],true);
 w._nearbyPointerInside=true;w.props.visible=false;w.updateDemand({...w.state});
 assert.equal(owner.cancelled,2);assert.equal(w._nearbyPointerInside,false);assert.equal(owner.calls.length,2);
 w.props.visible=true;w.updateDemand({...w.state});assert.equal(owner.calls.length,3);assert.equal(owner.calls[2][3],false);
});
test('playback starts no discovery; paused image changes reuse one owner with idle priority',()=>{
 const w=setup();w._userPaused=false;const closed={...w.state};w.state.nearbyStripOpen=true;w.updateDemand(closed);
 assert.equal(w._nearbyDiscovery,undefined);w._userPaused=true;w.refreshNearbyAfterPause();const owner=w._nearbyDiscovery;
 assert.deepEqual(owner.calls,[[41,29,'A',false,false]]);const previous={...w.state};w.state.imageId='B';w.updateDemand(previous);
 assert.strictEqual(w._nearbyDiscovery,owner);assert.deepEqual(owner.calls[1],[41,29,'B',false,false]);
 w.updateDemand({...w.state});assert.equal(owner.calls.length,2);
});
