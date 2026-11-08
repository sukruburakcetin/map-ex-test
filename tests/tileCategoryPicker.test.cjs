const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const compile=(source,fileName)=>ts.transpileModule(source,{fileName,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React}}).outputText;
function moduleFile(file){const m={exports:{}};new Function('exports',compile(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),file))(m.exports);return m.exports}
const categories=moduleFile('src/features/places/tileCategories.ts'),en=moduleFile('src/i18n/runtimeMessages.ts').runtimeEn,tr=moduleFile('src/i18n/locales/tr.ts').default;
const source=compile(fs.readFileSync(path.join(__dirname,'../src/components/TileCategoryPicker.tsx'),'utf8'),'TileCategoryPicker.tsx');
function setup(enabled=true){
 const slots=[],effects=[],listeners=new Map(),chosen=[];let index=0,tree,focused,scrolls=0;const savedDocument=global.document;
 const walk=(value,visit)=>{if(Array.isArray(value))value.forEach(child=>walk(child,visit));else if(value&&typeof value==='object'){visit(value);walk(value.children,visit)}};
 const jsx=(type,props,...children)=>{
  const node={type,props:props||{},children,focus(){focused=node},scrollIntoView(){scrolls++},contains(target){let found=false;walk(node,child=>{if(child===target)found=true});return found},querySelector(){let active;walk(node,child=>{if(child.props['data-category-active']==='true')active=child});return active}};
  if(props?.ref)props.ref.current=node;return node;
 };
 const React={
  useState(initial){const at=index++;if(!slots[at])slots[at]={value:typeof initial==='function'?initial():initial};return[slots[at].value,value=>slots[at].value=typeof value==='function'?value(slots[at].value):value]},
  useRef(initial){const at=index++;return(slots[at]||=( {current:initial,ref:true} ))},
  useId(){index++;return'category-test'},
  useMemo(fn){index++;return fn()},
  useEffect(fn,deps){const at=index++,old=slots[at];if(!old||deps.some((value,i)=>value!==old.deps[i])){old?.cleanup?.();slots[at]={deps};effects.push(()=>slots[at].cleanup=fn())}},
 };
 global.document={addEventListener:(type,fn)=>listeners.set(type,fn),removeEventListener:(type,fn)=>{if(listeners.get(type)===fn)listeners.delete(type)}};
 const m={exports:{}};const text=key=>en[key]||key;
 new Function('exports','require',source)(m.exports,name=>name==='jimu-core'?{React,jsx}:name.endsWith('WidgetLocale')?{useWidgetLocale:()=>({t:text,formatLocale:'en-US'})}:categories);
 const props={value:'all',onChange:enabled?value=>{chosen.push(value);props.value=value}:undefined};
 function render(){index=0;for(const slot of slots)if(slot?.ref)slot.current=null;tree=m.exports.TileCategoryPicker(props);while(effects.length)effects.shift()();return tree}
 const find=predicate=>{let found;walk(tree,node=>{if(!found&&predicate(node))found=node});return found};
 return{api:m.exports,chosen,props,listeners,render,find,get focused(){return focused},get scrolls(){return scrolls},dispose(){for(const slot of slots)slot?.cleanup?.();global.document=savedDocument}};
}
const key=value=>({key:value,ctrlKey:false,preventDefault(){this.prevented=true},stopPropagation(){this.stopped=true}});
test('localized menu search supports accents, IDs, all families and Turkish casing',()=>{
 const h=setup();try{
  const all=h.api.categoryOptions(k=>en[k]||k,'en-US','');assert.equal(all.length,29);assert.equal(all[0].id,'all');assert.equal(all.at(-1).id,'other');
  assert.deepEqual(h.api.categoryOptions(k=>en[k]||k,'en-US','cafe').map(o=>o.id),['cafe']);
  assert.deepEqual(h.api.categoryOptions(k=>tr[k]||k,'tr-TR','ibadet').map(o=>o.id),['worship']);
  assert.deepEqual(h.api.categoryOptions(k=>en[k]||k,'en-US','unmatchable'),[]);
 }finally{h.dispose()}
});
test('typing filters locally, arrows move the active option and Enter chooses once',()=>{
 const h=setup();try{
  h.render();h.find(n=>n.type==='button').props.onClick({stopPropagation(){}});h.render();assert.equal(h.focused.type,'input');assert.equal(h.listeners.size,1);
  h.find(n=>n.type==='input').props.onChange({target:{value:'cafe'}});h.render();assert.equal(h.chosen.length,0);
  const input=h.find(n=>n.type==='input'),options=[];function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n?.children){if(n.props?.role==='option')options.push(n);walk(n.children)}}walk(h.render());assert.equal(options.length,1);
  input.props.onKeyDown(key('ArrowDown'));h.render();h.find(n=>n.type==='input').props.onKeyDown(key('Enter'));h.render();assert.deepEqual(h.chosen,['cafe']);assert(!h.find(n=>n.type==='input'));assert.equal(h.focused.type,'button');assert.equal(h.listeners.size,0);assert(h.scrolls>0);
 }finally{h.dispose()}
});
test('Escape and outside click dismiss without changing the selected category',()=>{
 const h=setup();try{
  h.render();h.find(n=>n.type==='button').props.onClick({stopPropagation(){}});h.render();const escape=key('Escape');h.find(n=>n.type==='input').props.onKeyDown(escape);h.render();assert(escape.stopped);assert(!h.find(n=>n.type==='input'));assert.deepEqual(h.chosen,[]);
  h.find(n=>n.type==='button').props.onClick({stopPropagation(){}});h.render();h.listeners.get('pointerdown')({target:{}});h.render();assert(!h.find(n=>n.type==='input'));assert.equal(h.listeners.size,0);
 }finally{h.dispose()}
});
test('disabled adapters cannot open the picker and empty search exposes a status message',()=>{
 const disabled=setup(null);try{disabled.render();const button=disabled.find(n=>n.type==='button');assert(button.props.disabled);button.props.onClick({stopPropagation(){}});disabled.render();assert(!disabled.find(n=>n.type==='input'))}finally{disabled.dispose()}
 const h=setup();try{h.render();h.find(n=>n.type==='button').props.onClick({stopPropagation(){}});h.render();h.find(n=>n.type==='input').props.onChange({target:{value:'no-such-category'}});h.render();assert(h.find(n=>n.props.role==='status'));h.find(n=>n.type==='input').props.onKeyDown(key('Enter'));assert.equal(h.chosen.length,0)}finally{h.dispose()}
});

test('selecting the current family does not reload data and menu wheel does not zoom the map',()=>{
 const h=setup();try{h.render();h.find(n=>n.type==='button').props.onClick({stopPropagation(){}});h.render();
 let stopped=0;h.find(n=>!!n.props.onWheel).props.onWheel({stopPropagation(){stopped++},preventDefault(){throw Error('Native scrolling must remain available')}});assert.equal(stopped,1);
 h.find(n=>n.type==='input').props.onKeyDown(key('Enter'));h.render();assert.equal(h.chosen.length,0);assert(!h.find(n=>n.type==='input'));
 }finally{h.dispose()}
});
