const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),React=require('react'),{JSDOM}=require('jsdom');
const sourceRoot=path.join(__dirname,'../src');
function loadCard(){const cache=new Map();function load(file){if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);
 new Function('exports','require',ts.transpileModule(fs.readFileSync(path.join(sourceRoot,file),'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React,jsxFactory:'jsx'}}).outputText)(m.exports,id=>{
 if(id==='jimu-core')return{React,jsx:React.createElement};if(id.endsWith('WidgetLocale'))return{useWidgetLocale:()=>({t:k=>k,owned:s=>s,formatLocale:'en-US'})};if(id.endsWith('placeIcons'))return{placeCategoryIcon:()=> 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'};if(id.endsWith('LinkedDetectionPreview'))return{DetectionCrop:()=>null};
 const relative=path.relative(sourceRoot,path.resolve(sourceRoot,path.dirname(file),id));return load(relative+(id.endsWith('PlaceNoteActions')?'.tsx':'.ts'));
 });return m.exports;}
 return load('components/SelectedPlaceCard.tsx').SelectedPlaceSummary;
}
test('repeated POI selections keep exactly one note action and preserve/reset the right draft',async()=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'https://widget.test'}),saved=new Map();
 for(const [key,value]of Object.entries({window:dom.window,document:dom.window.document,navigator:dom.window.navigator,HTMLElement:dom.window.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true})){saved.set(key,Object.getOwnPropertyDescriptor(global,key));Object.defineProperty(global,key,{value,writable:true,configurable:true});}
 const errors=[],originalError=console.error;console.error=(...args)=>errors.push(args.map(String).join(' '));
 const act=React.act||require('react-dom/test-utils').act;
 const {createRoot}=require('react-dom/client'),root=createRoot(document.getElementById('root')),Card=loadCard(),created=[];
 const places={a:{id:'a',name:'Place A',category:'bookstore',group:'shop',confidence:.9,lon:1,lat:1,address:'',website:'',release:''},b:{id:'b',name:'Place B',category:'cafe',group:'cafe',confidence:.9,lon:2,lat:2,address:'',website:'',release:''}};
 const button=name=>Array.from(document.querySelectorAll('button')).find(node=>node.textContent===name);
 const click=async name=>{const node=button(name);assert(node,'Missing button: '+name);await act(async()=>node.dispatchEvent(new window.MouseEvent('click',{bubbles:true})))};
 function App(){const [place,setPlace]=React.useState(places.a);return React.createElement('main',null,React.createElement('button',{onClick:()=>setPlace({...places.a})},'Select A'),React.createElement('button',{onClick:()=>setPlace({...places.b})},'Select B'),React.createElement(Card,{place,link:false,onLink(){},onDetails(){},onClear(){},enterpriseEnabled:true,onNote:destination=>created.push({destination,id:place.id})}));}
 try{
  await act(async()=>root.render(React.createElement(App)));
  const counts=[];for(let i=0;i<12;i++){await click(i%2?'Select A':'Select B');counts.push(Array.from(document.querySelectorAll('button')).filter(n=>n.textContent==='Add field note').length)}
  assert.deepEqual(counts,Array(12).fill(1),'A field-note action accumulated after changing selected POIs');
  assert(!errors.some(message=>/same key|unique.*key/i.test(message)),'React reported conflicting child keys: '+errors.join('\n'));
  await click('Add field note');let destination=document.querySelector('select[aria-label="Place note destination"]');assert(destination);assert.deepEqual(Array.from(destination.options).map(o=>o.value),['local','enterprise','workspace']);
  await act(async()=>{destination.value='workspace';destination.dispatchEvent(new window.Event('change',{bubbles:true}))});
  await click('Select A');assert.equal(document.querySelector('select[aria-label="Place note destination"]').value,'workspace','Same-POI updates should retain the draft');
  await click('Select B');assert.equal(document.querySelector('select[aria-label="Place note destination"]'),null,'A different POI needs fresh note state');assert(button('Add field note'));
  await click('Add field note');destination=document.querySelector('select[aria-label="Place note destination"]');assert.equal(destination.value,'local');
  await act(async()=>{destination.value='enterprise';destination.dispatchEvent(new window.Event('change',{bubbles:true}))});await click('Create draft here');assert.deepEqual(created,[{destination:'enterprise',id:'b'}]);
 }finally{
  await act(async()=>root.unmount());console.error=originalError;dom.window.close();for(const[key,descriptor]of saved){if(descriptor)Object.defineProperty(global,key,descriptor);else delete global[key];}
 }
});
