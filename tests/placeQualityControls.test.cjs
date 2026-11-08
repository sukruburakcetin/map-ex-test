const fs=require('node:fs'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
function setup(minimum=.5){
 let index=0;const slots=[],effects=[],calls=[],m={exports:{}};
 const React={useState(initial){const i=index++;if(!(i in slots))slots[i]=initial;return[slots[i],v=>slots[i]=v]},useRef(initial){const i=index++;return slots[i]||(slots[i]={current:initial})},useEffect(fn,deps){const i=index++;if(!slots[i]||deps.some((v,n)=>v!==slots[i][n])){slots[i]=deps;effects.push(fn)}}};
 const jsx=(type,props,...children)=>({type,props,children});
 new Function('exports','require',ts.transpileModule(fs.readFileSync(require('node:path').join(__dirname,'../src/components/PlaceQualityControls.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React}}).outputText)(m.exports,name=>name==='jimu-core'?{React,jsx}:{useWidgetLocale:()=>({t:k=>k})});
 const props={minimum,hideClosed:false,onChange:(...args)=>calls.push(args)};
 function render(){index=0;const tree=m.exports.PlaceQualityControls(props),inputs=[];function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){if(n.type==='input')inputs.push(n);walk(n.children)}}walk(tree);while(effects.length)effects.shift()();return inputs.map(n=>n.props)}
 return{render,calls,props};
}
test('slider drafts locally and commits once on release, keyboard completion or blur',()=>{
 const h=setup();let [,range]=h.render();range.onChange({target:{value:'.73'}});assert.equal(h.calls.length,0);
 [,range]=h.render();range.onPointerUp();range.onBlur();assert.deepEqual(h.calls,[[.73,false]]);
 range.onChange({target:{value:'.74'}});[,range]=h.render();range.onKeyUp({key:'ArrowRight'});assert.deepEqual(h.calls.at(-1),[.74,false]);
});
test('all scores disables threshold inputs and closed filtering preserves the applied minimum',()=>{
 const h=setup(null);let [all,range,number,closed]=h.render();assert(range.disabled&&number.disabled);all.onChange({target:{checked:false}});assert.deepEqual(h.calls,[[.5,false]]);
 h.props.minimum=.5;[all,range,number,closed]=h.render();closed.onChange({target:{checked:true}});assert.deepEqual(h.calls.at(-1),[.5,true]);all.onChange({target:{checked:true}});assert.deepEqual(h.calls.at(-1),[null,false]);
});
test('invalid numeric drafts are not applied and pointer cancellation restores the applied value',()=>{
 const h=setup();let [,range,number]=h.render();number.onChange({target:{value:'2'}});[,range,number]=h.render();number.onBlur({currentTarget:{checkValidity:()=>false,reportValidity(){}}});assert.equal(h.calls.length,0);
 [,range]=h.render();assert.equal(range.value,.5);range.onChange({target:{value:'.9'}});[,range]=h.render();range.onPointerCancel();[,range]=h.render();assert.equal(range.value,.5);
});
