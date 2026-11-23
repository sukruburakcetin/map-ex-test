const fs=require('fs'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
function load(file,req){const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(__dirname+'/../src/features/map-graphics/'+file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(req,m,m.exports);return m.exports}
const{groundFanMatrix}=load('ScreenDirectionCone.ts',()=>({})),{HoverBearingSector}=load('HoverBearingSector.ts',()=>({groundFanMatrix}));
function setup(type='3d'){let removed=0,projections=0,created=0;const parent={appendChild(el){el.parentElement=this}},group={style:{setProperty(k,v){this[k]=v}},value:'',setAttribute(k,v){this.value=v},getAttribute(){return this.value}},element={style:{},setAttribute(){},querySelector:()=>group,remove(){removed++;this.parentElement=null}};const owner=new HoverBearingSector(p=>p,()=>{created++;return element}),geometry={longitude:0,latitude:0},view={type,zoom:18,rotation:0,camera:{},stationary:true,updating:false,toScreen:p=>{projections++;return{x:100+p.longitude*10000,y:100-p.latitude*10000*(type==='3d'?.25:1)}}};return{owner,parent,element,group,view,geometry,stats:()=>({removed,projections,created})}}
test('cone attaches to pulse center without changing its size or animation and caches settled projection',()=>{const x=setup();x.owner.show(x.parent,0,false);assert.equal(x.element.style.left,'50%');assert.equal(x.element.style.top,'50%');assert(x.element.innerHTML.includes('fill-opacity="0.45"'));x.owner.update(x.view,x.geometry,{x:100,y:100},0);assert.equal(x.element.style.display,'block');{const values=x.group.value.match(/matrix\(([^)]+)\)/)[1].split(',').map(Number);assert(Math.abs(values[0]-1)<.00001);assert(Math.abs(values[3]-.25)<.00001)};assert.equal(x.stats().projections,2);x.owner.update(x.view,x.geometry,{x:100,y:100},40);assert.equal(x.stats().projections,2);x.view.camera={};x.owner.update(x.view,x.geometry,{x:100,y:100},80);assert.equal(x.stats().projections,4);x.owner.clear();assert.equal(x.stats().removed,1)});
test('2D bearing rotates with projection; updating bearing reuses the decoration',()=>{const x=setup('2d');x.owner.show(x.parent,90,false);x.owner.update(x.view,x.geometry,{x:100,y:100},0);assert(x.group.value.includes('rotate(90)'));x.owner.show(x.parent,360,false);x.owner.update(x.view,x.geometry,{x:100,y:100},40);assert(x.group.value.includes('rotate(0)'));assert.equal(x.stats().created,1)});
test('missing or invalid bearings remove only the cone',()=>{for(const [bearing,pano]of[[null,false],[undefined,false],[NaN,false]]){const x=setup();x.owner.show(x.parent,20,false);x.owner.show(x.parent,bearing,pano);assert.equal(x.stats().removed,1);x.owner.update(x.view,x.geometry,{x:100,y:100},0);assert.equal(x.stats().projections,0)}});
test('hidden pulse hides its cone; projection failure recovers and cleanup prevents further work',()=>{const x=setup();x.owner.show(x.parent,0,false);x.owner.update(x.view,x.geometry,null,0);assert.equal(x.element.style.display,'none');const project=x.view.toScreen;x.view.toScreen=()=>null;x.owner.update(x.view,x.geometry,{x:100,y:100},40);assert.equal(x.element.style.display,'none');x.view.toScreen=project;x.owner.update(x.view,x.geometry,{x:100,y:100},80);assert.equal(x.element.style.display,'block');x.owner.clear();const n=x.stats().projections;x.owner.update(x.view,x.geometry,{x:100,y:100},120);assert.equal(x.stats().projections,n)});

test('panorama shows a static full-circle indicator rather than a directional wedge',()=>{const x=setup();x.owner.show(x.parent,20,true);x.owner.update(x.view,x.geometry,{x:100,y:100},0);assert.equal(x.element.style.display,'block');x.owner.clear()});

for(const type of ['2d','3d'])test(`${type} panorama ring needs no heading or map projections`,()=>{const x=setup(type);x.owner.show(x.parent,undefined,true);assert(x.element.innerHTML.includes('<circle'));assert(x.element.innerHTML.includes('data-panorama-pointer'));assert(x.element.innerHTML.includes('style="display:none"'));assert(!x.element.innerHTML.includes('<animate'));x.owner.update(x.view,x.geometry,{x:100,y:100},0);assert.equal(x.element.style.display,'block');assert.equal(x.stats().projections,0);x.owner.show(x.parent,undefined,true);x.owner.update(x.view,x.geometry,{x:100,y:100},40);assert.equal(x.stats().created,1);assert.equal(x.stats().projections,0);x.owner.update(x.view,x.geometry,null,80);assert.equal(x.element.style.display,'none');});
test('switching between panorama and perspective replaces only the decoration',()=>{const x=setup();x.owner.show(x.parent,undefined,true);assert(x.element.innerHTML.includes('<circle'));x.owner.show(x.parent,40,false);assert(x.element.innerHTML.includes('<path'));assert.equal(x.stats().removed,1);x.owner.show(x.parent,undefined,true);assert(x.element.innerHTML.includes('<circle'));assert.equal(x.stats().removed,2);x.owner.clear();assert.equal(x.stats().removed,3);});

for(const type of ['2d','3d'])test(`${type} panorama adds a small direction pointer and caches its single projection`,()=>{const x=setup(type);x.owner.show(x.parent,90,true);assert(x.element.innerHTML.includes('<circle'));assert(x.element.innerHTML.includes('M30 3 L35 11 L25 11 Z'));x.owner.update(x.view,x.geometry,{x:100,y:100},0);assert(x.group.value.includes('rotate(90)'));assert.equal(x.group.style.display,'block');assert.equal(x.stats().projections,1);x.owner.update(x.view,x.geometry,{x:100,y:100},40);assert.equal(x.stats().projections,1);x.owner.show(x.parent,0,true);x.owner.update(x.view,x.geometry,{x:100,y:100},80);assert(x.group.value.includes('rotate(0)'));assert.equal(x.stats().created,1);});
test('panorama loses only its pointer when metadata or projection is unavailable',()=>{const x=setup();x.owner.show(x.parent,90,true);x.owner.update(x.view,x.geometry,{x:100,y:100},0);x.owner.show(x.parent,undefined,true);x.owner.update(x.view,x.geometry,{x:100,y:100},40);assert.equal(x.element.style.display,'block');assert.equal(x.group.style.display,'none');assert.equal(x.stats().created,1);x.owner.show(x.parent,30,true);const project=x.view.toScreen;x.view.toScreen=()=>null;x.owner.update(x.view,x.geometry,{x:100,y:100},80);assert.equal(x.element.style.display,'block');assert.equal(x.group.style.display,'none');x.view.toScreen=()=>({x:100,y:100});x.owner.update(x.view,x.geometry,{x:100,y:100},120);assert.equal(x.group.style.display,'none');x.view.toScreen=project;x.owner.update(x.view,x.geometry,{x:100,y:100},160);assert.equal(x.group.style.display,'block');});

test('world-scale Web Mercator panorama uses capture bearing without a subpixel projection', () => {
 const x = setup('2d');
 Object.assign(x.view, { zoom: 1, rotation: 20, spatialReference: { isWebMercator: true } });
 x.view.toScreen = () => assert.fail('world-scale bearing must not project a tiny baseline');
 x.owner.show(x.parent, 35, true);
 for (const [now, pixel] of [[0, {x:100,y:100}], [40, {x:101,y:100}]]){
  x.owner.update(x.view, x.geometry, pixel, now);
  assert.match(x.group.value, /rotate\(55\)/);
 }
 x.view.rotation = 350;
 x.owner.update(x.view, x.geometry, { x: 100, y: 100 }, 80);
 assert.match(x.group.value, /rotate\(385\)/);
 assert.equal(x.group.style.display, 'block');
});

test('world-scale panorama on another map projection retains the projected direction', () => {
 const x = setup('2d');
 Object.assign(x.view, { zoom: 1, spatialReference: { isWebMercator: false } });
 x.owner.show(x.parent, 90, true);
 x.owner.update(x.view, x.geometry, { x: 100, y: 100 }, 0);
 assert.equal(x.stats().projections, 1);
 assert.match(x.group.value, /rotate\(90\)/);
});
