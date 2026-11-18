const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
function compile(s){const r=ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});assert.equal(r.diagnostics.filter(d=>d.category===1).length,0);return r.outputText;}
const m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/routing/routingAuthentication.ts','utf8')))(m,m.exports);
const {discoverPortalRoutingService,isRoutingAuthenticationFailure}=m.exports;
const golden=JSON.parse(fs.readFileSync(__dirname+'/fixtures/routingAuthentication.baseline.json'));
const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,99,true,4),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');
const member=name=>widget.members.find(n=>n.name?.getText(sf)===name).getText(sf);
function classifier(method){return new (new Function('isRoutingAuthenticationFailure',compile('return class Fixture{'+method+'}'))(isRoutingAuthenticationFailure))();}
const old=classifier(golden.classifyMethod),current=classifier(member('isRoutingAuthenticationError'));
for(const [name,value] of [
 ['401',{status:401}],['403 string',{status:'403'}],['498 details',{details:{httpStatus:498}}],['499 response',{response:{status:499}}],
 ['status priority',{details:{httpStatus:500},response:{status:401}}],['zero priority',{details:{httpStatus:0},status:401}],['null falls through',{details:{httpStatus:null},status:401}],
 ['TOKEN',{message:'TOKEN expired'}],['credential',{message:'credential missing'}],['authentication',{message:'authentication failed'}],['unauthorized','Unauthorized'],['not authorized','not authorized'],['forbidden',{details:{message:'FORBIDDEN'}}],['broad token match',{message:'tokenization failed'}],['ordinary',{message:'network unavailable'}],['empty message wins',{message:'',details:{message:'token expired'}}],['null',null],['undefined',undefined],['number',403],
])test('classification '+name,()=>{const expected=old.isRoutingAuthenticationError(value);assert.equal(current.isRoutingAuthenticationError(value),expected);assert.equal(isRoutingAuthenticationFailure(value),expected);});
test('throwing coercions keep existing exception behavior',()=>{const error={status:Symbol('invalid')};assert.throws(()=>old.isRoutingAuthenticationError(error),TypeError);assert.throws(()=>current.isRoutingAuthenticationError(error),TypeError);});
function portalFixture(previous,options={}){
 const {fail,gate}=options,services=Object.hasOwn(options,'services')?options.services:{route:{url:'https://portal.example/route'}};
 const calls=[],warnings=[];class Portal{constructor(){calls.push('construct');if(fail==='construct')throw Error('constructor failed');this.helperServices=services;}async load(){calls.push('load');if(fail==='load')throw Error('load failed');if(gate)await gate.promise;}}
 const loader=async names=>{calls.push(['modules',names]);if(fail==='modules')throw Error('module failed');return fail==='empty'?[]:[Portal];};
 const logging={warn:(...args)=>{warnings.push(args.map(a=>a instanceof Error?a.message:a));if(fail==='warn')throw Error('warning failed');}};
 const Type=new Function('loadArcGISJSAPIModules','console','discoverPortalRoutingService',compile('return class Fixture{'+(previous?golden.portalMethod:member('resolvePortalRouteService'))+'}'))(loader,logging,discoverPortalRoutingService);
 return {w:new Type(),calls,warnings};
}
async function comparePortal(options){
 async function run(previous){const f=portalFixture(previous,options);let value,error;try{value=await f.w.resolvePortalRouteService();}catch(e){error=e.message;}return {value,error,calls:f.calls,warnings:f.warnings};}
 const before=await run(true),after=await run(false);assert.deepEqual(after,before);return after;
}
for(const [name,services] of [['present',{route:{url:'https://portal.example/route'}}],['empty',{route:{url:''}}],['missing route',{}],['missing services',undefined],['null services',null]])test('portal '+name,()=>comparePortal({services}));
for(const fail of ['modules','construct','load','empty'])test('portal failure '+fail,async()=>{const r=await comparePortal({fail});assert.equal(r.value,null);assert.equal(r.warnings.length,1);assert.equal(r.warnings[0][0],'[CaptureRoute] Could not discover portal route service:');});
test('deferred portal load must settle before publishing its URL',async()=>{for(const previous of [true,false]){let resolve;const gate={promise:new Promise(r=>resolve=r)},f=portalFixture(previous,{gate});let settled=false;const pending=f.w.resolvePortalRouteService();pending.then(()=>settled=true);for(let i=0;i<4;i++)await Promise.resolve();assert.equal(settled,false);assert.equal(f.calls.filter(e=>e==='load').length,1);resolve();assert.equal(await pending,'https://portal.example/route');}});
