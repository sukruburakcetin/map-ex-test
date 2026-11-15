const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),m={exports:{}};
const presentation={locale:'en',text:(value,args={})=>value.replace(/\{(\w+)\}/g,(_,key)=>args[key]??'')};
function localRequire(name){
 if(name.endsWith('placesModel'))return{placesWebsite:value=>{try{const url=new URL(value);return ['http:','https:'].includes(url.protocol)?url.href:''}catch{return ''}}};
 if(name.endsWith('PresentationText'))return{englishPresentation:presentation};
 if(name.endsWith('nearbyPlaceImagery'))return{placeImageryChoiceMeta:image=>`${image.distance} m`,placeImageryDirectionLabel:()=> 'Facing the place'};
 throw Error(name);
}
new Function('exports','require',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/places/TilesPlacePopup.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports,localRequire);
function setup(explore){
 let watcher;const opened=[],requests=[];
 const view={popup:{visible:false,content:null},openPopup(options){this.popup={...options,visible:true}},closePopup(){this.popup.visible=false;watcher?.()},watch(_,fn){watcher=fn;return{remove(){watcher=null}}}};
 const popup=new m.exports.TilesPlacePopup({view,explore:(place,radius,signal)=>{requests.push({place,radius,signal});return explore(place,radius,signal)},open:image=>opened.push(image)});
 const attrs={gers_id:'poi',place_name:'<img src=x onerror=bad()>',category:null,confidence:null,operating_status:null,address:'Main Street',website:'javascript:bad()',data_release:'2026-10-21.0'};
 const show=()=>popup.show(attrs,{longitude:-86.13,latitude:39.775});
 const find=tag=>view.popup.content.children.filter(child=>child.tag===tag);
 return{popup,view,attrs,show,find,opened,requests,close:()=>{view.popup.visible=false;watcher?.()}};
}
const saved=global.document;
function element(tag){return{tag,children:[],style:{},textContent:'',disabled:false,hidden:false,appendChild(child){this.children.push(child)},setAttribute(){}}}
test.before(()=>global.document={createElement:element});test.after(()=>global.document=saved);
test('details are text, unsafe links omitted, and opening the popup makes no imagery request',()=>{
 const h=setup(async()=>[]);h.show();assert.equal(h.requests.length,0);assert.equal(h.find('strong')[0].textContent,h.attrs.place_name);assert.equal(h.find('a').length,0);assert(h.find('div').some(e=>e.textContent==='Confidence: Not provided'));h.popup.clear();
});
test('search widens only after explicit click, and opening a suggestion is explicit',async()=>{
 const image={id:'image',distance:25};const h=setup(async(_,radius)=>radius===75?[]:[image]);h.show();const button=h.find('button')[0];
 await button.onclick();assert.equal(h.requests[0].radius,75);assert.equal(button.textContent,'Search within 250 m');assert.equal(h.requests.length,1);
 await button.onclick();assert.equal(h.requests[1].radius,250);assert.equal(h.opened.length,0);await button.onclick();assert.deepEqual(h.opened,[image]);h.popup.clear();
});
test('closing or replacing a selected place aborts pending imagery and discards stale results',async()=>{
 for(const action of ['close','replace','clear']){let resolve;const h=setup(()=>new Promise(r=>resolve=r));h.show();const content=h.view.popup.content,button=h.find('button')[0];const pending=button.onclick();
 if(action==='close')h.close();else if(action==='replace')h.show();else h.popup.clear();
 assert(h.requests[0].signal.aborted);resolve([{id:'late',distance:1}]);await pending;assert.equal(h.opened.length,0);assert(!content.children.some(c=>String(c.textContent).startsWith('Suggested view')));h.popup.clear();}
});
test('failed search allows retry, prevents double requests and limits alternatives',async()=>{
 let reject,resolve;const h=setup(()=>new Promise((a,b)=>{resolve=a;reject=b}));h.show();const button=h.find('button')[0];const first=button.onclick();await button.onclick();assert.equal(h.requests.length,1);reject(Error('offline'));await first;assert.equal(button.disabled,false);assert(button.textContent.startsWith('Retry'));
 const second=button.onclick();resolve(Array.from({length:6},(_,i)=>({id:String(i),distance:i})));await second;const alternatives=h.find('div').find(e=>e.children.length);assert.equal(alternatives.children.length,2);h.popup.clear();
});
