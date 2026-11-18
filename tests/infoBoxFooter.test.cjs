/** Footer actions retain navigation semantics while presentation adapts to narrow cards. */
const { bindEnglish }=require('./helpers/englishFixture.cjs');
const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'../src'),compile=s=>ts.transpileModule(s,{fileName:'fixture.tsx',compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,jsxFactory:'jsx'}}).outputText,styles={exports:{}};
new Function('module','exports',compile(fs.readFileSync(root+'/styles/infoBox.ts','utf8')))(styles,styles.exports);const english=bindEnglish({}),m={exports:{}},jsx=(type,props,...children)=>({type,props,children});new Function('require','module','exports',compile(fs.readFileSync(root+'/components/info-box/ScrollDiscoveryFooter.tsx','utf8')))(id=>{if(id==='jimu-core')return{React:{},jsx};if(id==='../../i18n/WidgetLocale')return{useWidgetLocale:()=>({t:english._t,locale:'en'})};if(id==='../../styles/infoBox')return styles.exports;throw Error('Unexpected footer import: '+id)},m,m.exports);const {ScrollDiscoveryFooter:Footer}=m.exports;
const originalWindow=Object.getOwnPropertyDescriptor(global,'window');
test.afterEach(()=>{if(originalWindow)Object.defineProperty(global,'window',originalWindow);else delete global.window});
const buttons=node=>!node||typeof node!=='object'?[]:Array.isArray(node)?node.flatMap(buttons):[...(node.type==='button'?[node]:[]),...buttons(node.children)];
function setup(up,down,height=100,reduced=false){const calls=[];global.window={matchMedia:()=>({matches:reduced})};const ref={current:{clientHeight:height,scrollBy:p=>calls.push(['by',p]),scrollTo:p=>calls.push(['to',p])}};return{calls,ref,buttons:buttons(Footer({canScrollUp:up,canScrollDown:down,isOverflowing:true,scrollContainerRef:ref}))}}
test('both footer actions remain accessible and scroll the live panel',()=>{const x=setup(true,true);assert.equal(x.buttons.length,2);assert.equal(x.buttons[0].props['aria-label'],'Back to top of image controls');assert.equal(x.buttons[1].props['aria-label'],'Scroll to more image controls');x.buttons[0].props.onClick();x.buttons[1].props.onClick();assert.deepEqual(x.calls,[['to',{top:0,behavior:'smooth'}],['by',{top:80,behavior:'smooth'}]])});
test('start and end show only their applicable scroll action',()=>{assert.equal(setup(false,true).buttons.length,1);assert.equal(setup(true,false).buttons.length,1)});
test('small panels retain minimum scroll distance and reduced-motion preference',()=>{const x=setup(false,true,20,true);x.buttons[0].props.onClick();assert.deepEqual(x.calls,[['by',{top:60,behavior:'auto'}]])});
test('unmounted scroll target is safely ignored',()=>{const x=setup(true,true);x.ref.current=null;for(const b of x.buttons)b.props.onClick();assert.deepEqual(x.calls,[])});


test('existing footer handlers use a replacement viewport and its current height',()=>{
 const x=setup(true,true),replacementCalls=[];
 x.ref.current={clientHeight:200,scrollTo:p=>replacementCalls.push(['to',p]),scrollBy:p=>replacementCalls.push(['by',p])};
 x.buttons[0].props.onClick();x.buttons[1].props.onClick();
 assert.deepEqual(x.calls,[]);
 assert.deepEqual(replacementCalls,[['to',{top:0,behavior:'smooth'}],['by',{top:160,behavior:'smooth'}]]);
});
test('both actions honor live reduced-motion changes and a missing matchMedia falls back safely',()=>{
 const x=setup(true,true);window.matchMedia=()=>({matches:true});
 x.buttons[0].props.onClick();x.buttons[1].props.onClick();
 assert.deepEqual(x.calls,[['to',{top:0,behavior:'auto'}],['by',{top:80,behavior:'auto'}]]);
 delete window.matchMedia;x.calls.length=0;x.buttons[0].props.onClick();x.buttons[1].props.onClick();
 assert.deepEqual(x.calls,[['to',{top:0,behavior:'smooth'}],['by',{top:80,behavior:'smooth'}]]);
});
