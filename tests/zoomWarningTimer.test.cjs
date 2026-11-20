const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const root=path.resolve(__dirname,'..'),compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
// Original show/clear methods plus the original teardown-only cancellation block.
const originalMembers="private _zoomWarningTimeout: any = null;\n  private showZoomWarning(message: string, duration: number = TIMING.WARNING_DEFAULT_MS) {\n    // 1. Clear previous timer to prevent conflicts\n    if (this._zoomWarningTimeout) {\n      clearTimeout(this._zoomWarningTimeout);\n      this._zoomWarningTimeout = null;\n    }\n\n    // 2. Set the message\n    this.setState({ zoomWarningMessage: message, turboWarningAction: undefined, turboWarningIsHelp: false });\n\n    // 3. If duration > 0, set a timer to auto-hide.\n    // If duration is 0, do nothing (it stays visible).\n    if (duration > 0) {\n      this._zoomWarningTimeout = setTimeout(() => {\n        this.setState({ zoomWarningMessage: undefined });\n        this._zoomWarningTimeout = null;\n      }, duration);\n    }\n  }\n\n  // Helper to manually clear the warning\n  private clearZoomWarning() {\n    if (this._zoomWarningTimeout) {\n      clearTimeout(this._zoomWarningTimeout);\n      this._zoomWarningTimeout = null;\n    }\n    this.setState({ zoomWarningMessage: undefined, turboWarningAction: undefined, turboWarningIsHelp: false });\n  }\n\n cancelWarningTimer(){\n    if (this._zoomWarningTimeout) {\n      clearTimeout(this._zoomWarningTimeout);\n      this._zoomWarningTimeout = null;\n    }\n }";
const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,99,true,4),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget'),names=['_zoomWarningTimer','showZoomWarning','clearZoomWarning'],members=widget.members.filter(n=>n.name&&names.includes(n.name.getText(sf))).map(n=>n.getText(sf)).join('\n');
const moduleSource=fs.readFileSync(root+'/src/features/coverage/ZoomWarningTimer.ts','utf8');
function fixture(kind){
 const trace=[],timers=new Map();let next=0;
 const setTimeout=(callback,duration)=>{const id=++next;trace.push(['timer',id,duration]);timers.set(id,{callback,duration});return id;};
 const clearTimeout=id=>{trace.push(['cancel',id]);timers.delete(id);};
 const m={exports:{}};new Function('module','exports','setTimeout','clearTimeout',compile(moduleSource))(m,m.exports,setTimeout,clearTimeout);
 const Runtime=new Function('ZoomWarningTimer','setTimeout','clearTimeout','TIMING',compile('class Runtime{'+(kind==='original'?originalMembers:members+'\n cancelWarningTimer(){this._zoomWarningTimer.cancel();}')+'};return Runtime;'))(m.exports.ZoomWarningTimer,setTimeout,clearTimeout,{WARNING_DEFAULT_MS:4000}),w=new Runtime();
 w.state={zoomWarningMessage:undefined,turboWarningAction:'retry',turboWarningIsHelp:true};w.setState=patch=>{trace.push(['state',structuredClone(patch)]);Object.assign(w.state,patch);};
 return {w,trace,timers,show:(...args)=>w.showZoomWarning(...args),clear:()=>w.clearZoomWarning(),cancel:()=>w.cancelWarningTimer(),fire:()=>{const [id,timer]=timers.entries().next().value||[];assert(timer,'expected a scheduled warning');timers.delete(id);trace.push(['fire',id]);timer.callback();},snapshot:()=>({trace:structuredClone(trace),state:structuredClone(w.state),pending:[...timers].map(([id,t])=>[id,t.duration])})};
}
const scenarios={
 defaultDuration:f=>{f.show('A');assert.equal([...f.timers.values()][0].duration,4000);},
 explicitDuration:f=>{f.show('A',150);},
 zeroDuration:f=>{f.show('A',0);assert.equal(f.timers.size,0);},
 negativeDuration:f=>{f.show('A',-10);assert.equal(f.timers.size,0);},
 nonFiniteDuration:f=>{f.show('A',NaN);assert.equal(f.timers.size,0);},
 expiry:f=>{f.show('A');f.fire();assert.equal(f.w.state.zoomWarningMessage,undefined);},
 expiryKeepsNewAction:f=>{f.show('A');f.w.state.turboWarningAction='zoom';f.w.state.turboWarningIsHelp=true;f.fire();assert.equal(f.w.state.turboWarningAction,'zoom');assert.equal(f.w.state.turboWarningIsHelp,true);},
 replacement:f=>{f.show('A',100);f.show('B',200);assert.equal(f.timers.size,1);f.fire();},
 replaceWithPersistent:f=>{f.show('A');f.show('B',0);assert.equal(f.timers.size,0);assert.equal(f.w.state.zoomWarningMessage,'B');},
 persistentThenTimed:f=>{f.show('A',0);f.show('B',20);f.fire();},
 emptyMessage:f=>{f.show('',10);f.fire();},
 clearPending:f=>{f.show('A');f.clear();assert.equal(f.timers.size,0);assert.equal(f.w.state.turboWarningAction,undefined);assert.equal(f.w.state.turboWarningIsHelp,false);},
 clearPersistent:f=>{f.show('A',0);f.clear();},
 clearIdle:f=>{f.clear();},
 clearTwice:f=>{f.show('A');f.clear();f.clear();},
 cancelWithoutPublishing:f=>{f.show('A');const writes=f.trace.filter(x=>x[0]==='state').length;f.cancel();assert.equal(f.trace.filter(x=>x[0]==='state').length,writes);assert.equal(f.timers.size,0);},
 cancelTwice:f=>{f.show('A');f.cancel();f.cancel();assert.equal(f.trace.filter(x=>x[0]==='cancel').length,1);},
 cancelAfterExpiry:f=>{f.show('A');f.fire();f.cancel();assert.equal(f.trace.filter(x=>x[0]==='cancel').length,0);},
 reusableAfterCancel:f=>{f.show('A');f.cancel();f.show('B');f.fire();},
};
for(const [name,scenario] of Object.entries(scenarios))test('unchanged zoom warning timer: '+name,()=>{
 const results=[];for(const kind of ['original','extracted']){const f=fixture(kind);scenario(f);results.push(f.snapshot());}assert.deepEqual(results[1],results[0]);
});
test('widget teardown retains resource-only warning cancellation at its original cleanup boundary',()=>{
 const unmount=widget.members.find(n=>n.name?.getText(sf)==='componentWillUnmount');assert.equal(unmount.body.statements.at(-1).getText(sf),'this._zoomWarningTimer.cancel();');assert(!source.includes('this._zoomWarningTimeout'));
});
