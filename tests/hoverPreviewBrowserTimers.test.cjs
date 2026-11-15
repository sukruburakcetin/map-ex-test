const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
const compile=text=>ts.transpileModule(text,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
test('default timers are invoked with a browser-safe receiver',()=>{
 const module={exports:{}},tasks=new Map(),events=[];let next=0;
 function browserSetTimeout(callback,delay){'use strict';if(this!==undefined&&this!==globalThis)throw new TypeError('Illegal invocation');assert.equal(delay,250);tasks.set(++next,callback);return next}
 function browserClearTimeout(handle){'use strict';if(this!==undefined&&this!==globalThis)throw new TypeError('Illegal invocation');tasks.delete(handle)}
 new Function('exports','setTimeout','clearTimeout',compile(fs.readFileSync(path.join(root,'src/features/imagery/DelayedHoverStatus.ts'),'utf8')))(module.exports,browserSetTimeout,browserClearTimeout);
 const owner=new module.exports.DelayedHoverStatus(value=>events.push(value));
 const first=owner.begin(new AbortController().signal);first();assert.equal(tasks.size,0);
 const second=owner.begin(new AbortController().signal);const [id,callback]=[...tasks][0];tasks.delete(id);callback();assert.deepEqual(events,[true]);second();assert.deepEqual(events,[true,false]);
});
