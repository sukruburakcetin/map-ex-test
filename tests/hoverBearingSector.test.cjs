const fs=require('fs'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
function load(file,req){const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(__dirname+'/../src/features/map-graphics/'+file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(req,m,m.exports);return m.exports}
const{groundFanMatrix}=load('ScreenDirectionCone.ts',()=>({})),{HoverBearingSector}=load('HoverBearingSector.ts',()=>({groundFanMatrix}));
function setup(type='3d'){let removed=0,projections=0,created=0;const parent={appendChild(el){el.parentElement=this}},group={style:{setProperty(k,v){this[k]=v}},value:'',setAttribute(k,v){this.value=v},getAttribute(){return this.value}},element={style:{},setAttribute(){},querySelector:()=>group,remove(){removed++;this.parentElement=null}};const owner=new HoverBearingSector(p=>p,()=>{created++;return element}),geometry={longitude:0,latitude:0},view={type,zoom:18,rotation:0,camera:{},stationary:true,updating:false,toScreen:p=>{projections++;return{x:100+p.longitude*10000,y:100-p.latitude*10000*(type==='3d'?.25:1)}}};return{owner,parent,element,group,view,geometry,stats:()=>({removed,projections,created})}}
test('cone attaches to pulse center without changing its size or animation and caches settled projection',()=>{const x=setup();x.owner.show(x.parent,0);assert.equal(x.element.style.left,'50%');assert.equal(x.element.style.top,'50%');assert(x.element.innerHTML.includes('fill-opacity="0.45"'));x.owner.update(x.view,x.geometry,{x:100,y:100},0);assert.equal(x.element.style.display,'block');{const values=x.group.value.match(/matrix\(([^)]+)\)/)[1].split(',').map(Number);assert(Math.abs(values[0]-1)<.00001);assert(Math.abs(values[3]-.25)<.00001)};assert.equal(x.stats().projections,2);x.owner.update(x.view,x.geometry,{x:100,y:100},40);assert.equal(x.stats().projections,2);x.view.camera={};x.owner.update(x.view,x.geometry,{x:100,y:100},80);assert.equal(x.stats().projections,4);x.owner.clear();assert.equal(x.stats().removed,1)});
test('2D bearing rotates with projection; updating bearing reuses the decoration',()=>{const x=setup('2d');x.owner.show(x.parent,90);x.owner.update(x.view,x.geometry,{x:100,y:100},0);assert(x.group.value.includes('rotate(90)'));x.owner.show(x.parent,360);x.owner.update(x.view,x.geometry,{x:100,y:100},40);assert(x.group.value.includes('rotate(0)'));assert.equal(x.stats().created,1)});
test('missing or invalid bearings remove only the cone',()=>{for(const bearing of [null,undefined,NaN]){const x=setup();x.owner.show(x.parent,20);x.owner.show(x.parent,bearing);assert.equal(x.stats().removed,1);x.owner.update(x.view,x.geometry,{x:100,y:100},0);assert.equal(x.stats().projections,0)}});
test('hidden pulse hides its cone; projection failure recovers and cleanup prevents further work',()=>{const x=setup();x.owner.show(x.parent,0);x.owner.update(x.view,x.geometry,null,0);assert.equal(x.element.style.display,'none');const project=x.view.toScreen;x.view.toScreen=()=>null;x.owner.update(x.view,x.geometry,{x:100,y:100},40);assert.equal(x.element.style.display,'none');x.view.toScreen=project;x.owner.update(x.view,x.geometry,{x:100,y:100},80);assert.equal(x.element.style.display,'block');x.owner.clear();const n=x.stats().projections;x.owner.update(x.view,x.geometry,{x:100,y:100},120);assert.equal(x.stats().projections,n)});

for (const type of ['2d', '3d']) test(`${type}: close panorama uses the same projected cone as a regular photo`, () => {
 const regular = setup(type), pano = setup(type);
 regular.owner.show(regular.parent, 30);
 pano.owner.show(pano.parent, 30, 14);
 regular.owner.update(regular.view, regular.geometry, {x:100,y:100}, 0);
 pano.owner.update(pano.view, pano.geometry, {x:100,y:100}, 0);
 assert.equal(pano.element.innerHTML, regular.element.innerHTML);
 assert.equal(pano.group.value, regular.group.value);
 assert.deepEqual(pano.stats(), regular.stats());
});
test('current panorama heading rotates the same cone and falls back to capture bearing', () => {
 const x = setup('2d');
 let live;
 x.owner.show(x.parent, 90, 14, () => live);
 x.owner.update(x.view, x.geometry, {x:100,y:100}, 0);
 assert.match(x.group.value, /rotate\(90\)/);
 live = 0;
 x.owner.update(x.view, x.geometry, {x:100,y:100}, 40);
 assert.match(x.group.value, /rotate\(0\)/);
 assert.equal(x.stats().created,1);
 assert.equal(x.stats().projections,2);
 live = undefined;
 x.owner.update(x.view, x.geometry, {x:100,y:100}, 80);
 assert.match(x.group.value, /rotate\(90\)/);
});
test('zoom and bearing gates hide the cone without projecting or reading the viewer below threshold', () => {
 const x = setup('2d');
 let live, reads = 0;
 x.owner.show(x.parent, undefined, 14, () => { reads++; return live; });
 x.view.zoom = 13.99;
 x.owner.update(x.view, x.geometry, {x:100,y:100}, 0);
 assert.equal(reads,0);
 assert.equal(x.stats().projections,0);
 assert.equal(x.element.style.display,'none');
 x.view.zoom = 14;
 x.owner.update(x.view, x.geometry, {x:100,y:100}, 10);
 assert.equal(x.stats().projections,0);
 assert.equal(x.element.style.display,'none');
 live = 270;
 x.owner.update(x.view, x.geometry, {x:100,y:100}, 50);
 assert.match(x.group.value, /rotate\(-90\)/);
 assert.equal(x.element.style.display,'block');
 x.view.zoom = 13.99;
 x.owner.update(x.view, x.geometry, {x:100,y:100}, 60);
 assert.equal(reads,2);
 assert.equal(x.element.style.display,'none');
});
