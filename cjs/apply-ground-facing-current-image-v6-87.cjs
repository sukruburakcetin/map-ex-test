#!/usr/bin/env node
'use strict';
/**
 * Ground facing current image v6.87. Compatible current v6 sources.
 * --dry-run checks all targets; --uninstall restores exact previous bytes.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const uninstall = args.includes('--uninstall');
const payload = {
  "entries": [
    {
      "file": "src/features/map-graphics/ScreenDirectionCone.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "steady 3D cleanup src/features/map-graphics/ScreenDirectionCone.ts",
              "before": "import { renderedGroundPoint } from './SelectionPulse';\n\n/** Convert screen coordinates to the existing absolute-positioning parent; never restyle the map. */\nexport function haloOverlayPosition(host: HTMLElement, element: HTMLElement, pixel: { x: number; y: number }, width: number, height: number): { x: number; y: number } | null {\n const parent = element.offsetParent as HTMLElement | null, win = host.ownerDocument.defaultView;\n if (!parent || !win || width <= 0 || height <= 0) return null;\n const box = host.getBoundingClientRect();\n if (!(box.width > 0 && box.height > 0)) return null;\n const x = box.left + pixel.x * box.width / width, y = box.top + pixel.y * box.height / height;\n const root = parent === host.ownerDocument.documentElement || (parent === host.ownerDocument.body && win.getComputedStyle(parent).position === 'static');\n if (root) return { x: x + win.scrollX, y: y + win.scrollY };\n const offset = parent.getBoundingClientRect();\n const sx = parent.offsetWidth > 0 ? offset.width / parent.offsetWidth : 1;\n const sy = parent.offsetHeight > 0 ? offset.height / parent.offsetHeight : 1;\n if (!(sx > 0 && sy > 0)) return null;\n return { x: (x - offset.left) / sx - parent.clientLeft + parent.scrollLeft,\n  y: (y - offset.top) / sy - parent.clientTop + parent.scrollTop };\n}\n\n\n/** Local ground-plane projection, normalized so tilt cannot inflate the fan. */\nexport function groundFanMatrix(front: { x: number; y: number }, right: { x: number; y: number }): string | null {\n if (![front?.x,front?.y,right?.x,right?.y].every(Number.isFinite)) return null;\n const aa=right.x**2+right.y**2, bb=front.x**2+front.y**2, dot=right.x*front.x+right.y*front.y;\n const scale=Math.sqrt((aa+bb+Math.sqrt((aa-bb)**2+4*dot**2))/2);\n if(scale<.001)return null;\n const n=(value:number)=>Math.abs(value)<1e-8?0:Number(value.toFixed(6));\n return `matrix(${n(right.x/scale)},${n(right.y/scale)},${n(-front.x/scale)},${n(-front.y/scale)},0,0)`;\n}\n\n/** One SVG anchor: round current-image circle plus a ground-oriented fan group. */\nexport class ScreenDirectionCone {\n private element: HTMLDivElement | null = null;\n private view: any = null;\n private frame: number | null = null;\n private projectionCache: any = null;\n private model: { lon: number; lat: number; heading: number; radius: number; spread: number } | null = null;\n private fanVisible=false;\n private markerVisible=false;\n private markerId: string | null=null;\n private markerFill='#00ff00';\n private markerOpacity='1';\n private geometryKey='';\n constructor(private point: (properties: any) => any, private createElement: () => HTMLDivElement,\n  private clock: { request(callback: FrameRequestCallback): number; cancel(frame: number): void },\n  private onMarkerPresented?: (presented: boolean, view: any) => void) {}\n show(view: any, lon: number, lat: number, heading: number, metres: number, spread: number): void {\n  if(view!==this.view)this.clear();\n  this.fanVisible=true;\n  const radius=Math.min(52,Math.max(18,32*Math.sqrt(metres/10))),angle=Math.min(120,Math.max(15,spread));\n  this.setModel(lon,lat,heading,radius,angle);\n  if(this.ensureElement(view)){this.syncParts();this.start(view);}\n }\n showMarker(view: any, lon: number, lat: number, color: any, imageId: string): void {\n  if(view!==this.view)this.clear();\n  if(this.markerId!==String(imageId))this.fanVisible=false;\n  this.markerId=String(imageId);this.markerVisible=true;\n  const rgba=Array.isArray(color)?color:color?.toRgba?.();\n  const channel=(v:any,f:number)=>Number.isFinite(v)?Math.max(0,Math.min(255,v)):f;\n  this.markerFill=rgba?`rgb(${channel(rgba[0],0)},${channel(rgba[1],255)},${channel(rgba[2],0)})`:'#00ff00';\n  this.markerOpacity=rgba&&Number.isFinite(rgba[3])?String(Math.max(0,Math.min(1,rgba[3]))):'1';\n  const m=this.model;this.setModel(lon,lat,m?.heading||0,m?.radius||32,m?.spread||60);\n  if(this.ensureElement(view)){this.syncParts();this.start(view);}\n }\n hideCone(): void { this.fanVisible=false;this.syncParts();if(!this.markerVisible)this.clear(); }\n hideMarker(): void { this.markerVisible=false;this.markerId=null;this.syncParts();this.onMarkerPresented?.(false,this.view);if(!this.fanVisible)this.clear(); }\n private setModel(lon:number,lat:number,heading:number,radius:number,spread:number):void {\n  const p=this.model;\n  if(!p||p.lon!==lon||p.lat!==lat||p.heading!==heading||p.radius!==radius||p.spread!==spread)this.model={lon,lat,heading,radius,spread};\n }\n private ensureElement(view:any):boolean {\n  if(!this.element){\n   const host=view.container;if(!host||typeof host.appendChild!=='function')return false;\n   const el=this.createElement();el.setAttribute('aria-hidden','true');\n   Object.assign(el.style,{position:'absolute',pointerEvents:'none',width:'120px',height:'120px',zIndex:'8',display:'none',transformOrigin:'50% 50%',transform:'translate(-50%, -50%)'});\n   host.appendChild(el);this.element=el;this.view=view;\n  }\n  const m=this.model!,key=`${m.radius}/${m.spread}`;\n  if(this.geometryKey!==key){\n   const a=m.spread*Math.PI/360,inner=9,x=Math.sin(a),y=Math.cos(a),r=m.radius;\n   const left=`${60-r*x} ${60-r*y}`,right=`${60+r*x} ${60-r*y}`,start=`${60-inner*x} ${60-inner*y}`,end=`${60+inner*x} ${60-inner*y}`;\n   this.element.innerHTML=`<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"120\" height=\"120\" viewBox=\"0 0 120 120\"><g data-direction-fan=\"true\"><path d=\"M${start} L${left} A${r} ${r} 0 0 1 ${right} L${end} A${inner} ${inner} 0 0 0 ${start} Z\" fill=\"#ffb300\" fill-opacity=\"0.55\" stroke=\"#ff9800\" stroke-width=\"1.25\" stroke-linejoin=\"round\"/></g><circle data-current-image-marker=\"true\" cx=\"60\" cy=\"60\" r=\"7\" fill=\"#00ff00\" stroke=\"#ffffff\" stroke-width=\"2\"/></svg>`;\n   this.geometryKey=key;\n  }\n  return true;\n }\n private syncParts():void {\n  const fan=this.element?.querySelector('[data-direction-fan]') as SVGElement|null;\n  const marker=this.element?.querySelector('[data-current-image-marker]') as SVGElement|null;\n  if(fan)fan.style.display=this.fanVisible?'':'none';\n  if(marker){marker.style.display=this.markerVisible?'':'none';marker.setAttribute('fill',this.markerFill);marker.setAttribute('fill-opacity',this.markerOpacity);}\n }\n private start(view:any):void {\n  if(this.frame!=null)return;\n  let last=-Infinity;\n  const track=(now:number)=>{\n   if(this.view!==view||!this.element||view.destroyed){this.clear();return;}\n   if(now-last>=32){last=now;try{this.position();}catch{this.element.style.display='none';this.onMarkerPresented?.(false,view);}}\n   this.frame=this.clock.request(track);\n  };\n  this.frame=this.clock.request(track);\n }\n private position():void {\n  const view=this.view,element=this.element,m=this.model;if(!view||!element||!m)return;\n  const hide=()=>{element.style.display='none';this.onMarkerPresented?.(false,view);};\n  if(view.container.ownerDocument?.visibilityState==='hidden'){hide();return;}\n  let pixel:any,orientation:string;\n  const cache=this.projectionCache;\n  if(cache&&cache.model===m&&cache.fanVisible===this.fanVisible&&cache.camera===view.camera&&cache.zoom===view.zoom&&cache.rotation===view.rotation&&cache.width===view.width&&cache.height===view.height&&view.stationary===true&&view.updating===false){pixel=cache.pixel;orientation=cache.orientation;}\n  else {\n   const source=this.point({longitude:m.lon,latitude:m.lat,spatialReference:{wkid:4326}});\n   let ground=view.type==='3d'?renderedGroundPoint(view,source,this.point):source;\n   if(!ground&&view.zoom<14)ground=this.point({longitude:m.lon,latitude:m.lat,z:0,spatialReference:{wkid:4326}});\n   pixel=ground&&view.toScreen(ground);\n   if(!pixel||!Number.isFinite(pixel.x)||!Number.isFinite(pixel.y)||pixel.x<0||pixel.y<0||pixel.x>view.width||pixel.y>view.height){hide();return;}\n   orientation='rotate(0)';\n   if(this.fanVisible){\n    const radians=m.heading*Math.PI/180,distance=Math.min(50000,Math.max(10,156543.03392804097/2**(view.zoom||0)*40)),cos=Math.max(.01,Math.cos(m.lat*Math.PI/180));\n    const tip=this.point({longitude:m.lon+Math.sin(radians)*distance/(111320*cos),latitude:Math.max(-89,Math.min(89,m.lat+Math.cos(radians)*distance/111320)),z:ground.z||0,spatialReference:{wkid:4326}});\n    const projected=view.toScreen(tip),dx=projected?.x-pixel.x,dy=projected?.y-pixel.y;\n    const bearing=Number.isFinite(dx)&&Number.isFinite(dy)&&Math.hypot(dx,dy)>.001?Math.atan2(dx,-dy)*180/Math.PI:m.heading-(view.type==='3d'?view.camera?.heading||0:view.rotation||0);\n    orientation=`rotate(${bearing})`;\n    if(view.type==='3d'){\n     const side=this.point({longitude:m.lon+Math.cos(radians)*distance/(111320*cos),latitude:Math.max(-89,Math.min(89,m.lat-Math.sin(radians)*distance/111320)),z:ground.z||0,spatialReference:{wkid:4326}}),q=view.toScreen(side);\n     const matrix=q&&groundFanMatrix({x:dx,y:dy},{x:q.x-pixel.x,y:q.y-pixel.y});if(matrix)orientation=matrix;\n    }\n   }\n   this.projectionCache={model:m,fanVisible:this.fanVisible,pixel,orientation,camera:view.camera,zoom:view.zoom,rotation:view.rotation,width:view.width,height:view.height};\n  }\n  element.style.display='block';\n  const position=haloOverlayPosition(view.container,element,pixel,view.width,view.height);if(!position){hide();return;}\n  const left=`${position.x}px`,top=`${position.y}px`;\n  if(element.style.left!==left)element.style.left=left;if(element.style.top!==top)element.style.top=top;\n  const fan=element.querySelector('[data-direction-fan]'),transform=`translate(60 60) ${orientation} translate(-60 -60)`;\n  if(fan&&fan.getAttribute('transform')!==transform)fan.setAttribute('transform',transform);\n  this.onMarkerPresented?.(this.markerVisible,view);\n }\n clear():void {\n  this.onMarkerPresented?.(false,this.view);\n  if(this.frame!=null)this.clock.cancel(this.frame);\n  this.frame=null;this.element?.remove();this.element=null;this.view=null;this.model=null;this.projectionCache=null;this.geometryKey='';this.markerVisible=false;this.fanVisible=false;this.markerId=null;\n }\n}\n",
              "after": "import { renderedGroundPoint } from './SelectionPulse';\n\n/** Convert screen coordinates to the existing absolute-positioning parent; never restyle the map. */\nexport function haloOverlayPosition(host: HTMLElement, element: HTMLElement, pixel: { x: number; y: number }, width: number, height: number): { x: number; y: number } | null {\n const parent = element.offsetParent as HTMLElement | null, win = host.ownerDocument.defaultView;\n if (!parent || !win || width <= 0 || height <= 0) return null;\n const box = host.getBoundingClientRect();\n if (!(box.width > 0 && box.height > 0)) return null;\n const x = box.left + pixel.x * box.width / width, y = box.top + pixel.y * box.height / height;\n const root = parent === host.ownerDocument.documentElement || (parent === host.ownerDocument.body && win.getComputedStyle(parent).position === 'static');\n if (root) return { x: x + win.scrollX, y: y + win.scrollY };\n const offset = parent.getBoundingClientRect();\n const sx = parent.offsetWidth > 0 ? offset.width / parent.offsetWidth : 1;\n const sy = parent.offsetHeight > 0 ? offset.height / parent.offsetHeight : 1;\n if (!(sx > 0 && sy > 0)) return null;\n return { x: (x - offset.left) / sx - parent.clientLeft + parent.scrollLeft,\n  y: (y - offset.top) / sy - parent.clientTop + parent.scrollTop };\n}\n\n\n/** Local ground-plane projection, normalized so tilt cannot inflate the fan. */\nexport function groundFanMatrix(front: { x: number; y: number }, right: { x: number; y: number }): string | null {\n if (![front?.x,front?.y,right?.x,right?.y].every(Number.isFinite)) return null;\n const aa=right.x**2+right.y**2, bb=front.x**2+front.y**2, dot=right.x*front.x+right.y*front.y;\n const scale=Math.sqrt((aa+bb+Math.sqrt((aa-bb)**2+4*dot**2))/2);\n if(scale<.001)return null;\n const n=(value:number)=>Math.abs(value)<1e-8?0:Number(value.toFixed(6));\n return `matrix(${n(right.x/scale)},${n(right.y/scale)},${n(-front.x/scale)},${n(-front.y/scale)},0,0)`;\n}\n\n/** One SVG anchor: current-image circle and fan share the ground-plane orientation. */\nexport class ScreenDirectionCone {\n private element: HTMLDivElement | null = null;\n private view: any = null;\n private frame: number | null = null;\n private projectionCache: any = null;\n private model: { lon: number; lat: number; heading: number; radius: number; spread: number } | null = null;\n private fanVisible=false;\n private markerVisible=false;\n private markerId: string | null=null;\n private markerFill='#00ff00';\n private markerOpacity='1';\n private geometryKey='';\n constructor(private point: (properties: any) => any, private createElement: () => HTMLDivElement,\n  private clock: { request(callback: FrameRequestCallback): number; cancel(frame: number): void },\n  private onMarkerPresented?: (presented: boolean, view: any) => void) {}\n show(view: any, lon: number, lat: number, heading: number, metres: number, spread: number): void {\n  if(view!==this.view)this.clear();\n  this.fanVisible=true;\n  const radius=Math.min(52,Math.max(18,32*Math.sqrt(metres/10))),angle=Math.min(120,Math.max(15,spread));\n  this.setModel(lon,lat,heading,radius,angle);\n  if(this.ensureElement(view)){this.syncParts();this.start(view);}\n }\n showMarker(view: any, lon: number, lat: number, color: any, imageId: string): void {\n  if(view!==this.view)this.clear();\n  if(this.markerId!==String(imageId))this.fanVisible=false;\n  this.markerId=String(imageId);this.markerVisible=true;\n  const rgba=Array.isArray(color)?color:color?.toRgba?.();\n  const channel=(v:any,f:number)=>Number.isFinite(v)?Math.max(0,Math.min(255,v)):f;\n  this.markerFill=rgba?`rgb(${channel(rgba[0],0)},${channel(rgba[1],255)},${channel(rgba[2],0)})`:'#00ff00';\n  this.markerOpacity=rgba&&Number.isFinite(rgba[3])?String(Math.max(0,Math.min(1,rgba[3]))):'1';\n  const m=this.model;this.setModel(lon,lat,m?.heading||0,m?.radius||32,m?.spread||60);\n  if(this.ensureElement(view)){this.syncParts();this.start(view);}\n }\n hideCone(): void { this.fanVisible=false;this.syncParts();if(!this.markerVisible)this.clear(); }\n hideMarker(): void { this.markerVisible=false;this.markerId=null;this.syncParts();this.onMarkerPresented?.(false,this.view);if(!this.fanVisible)this.clear(); }\n private setModel(lon:number,lat:number,heading:number,radius:number,spread:number):void {\n  const p=this.model;\n  if(!p||p.lon!==lon||p.lat!==lat||p.heading!==heading||p.radius!==radius||p.spread!==spread)this.model={lon,lat,heading,radius,spread};\n }\n private ensureElement(view:any):boolean {\n  if(!this.element){\n   const host=view.container;if(!host||typeof host.appendChild!=='function')return false;\n   const el=this.createElement();el.setAttribute('aria-hidden','true');\n   Object.assign(el.style,{position:'absolute',pointerEvents:'none',width:'120px',height:'120px',zIndex:'8',display:'none',transformOrigin:'50% 50%',transform:'translate(-50%, -50%)'});\n   host.appendChild(el);this.element=el;this.view=view;\n  }\n  const m=this.model!,key=`${m.radius}/${m.spread}`;\n  if(this.geometryKey!==key){\n   const a=m.spread*Math.PI/360,inner=9,x=Math.sin(a),y=Math.cos(a),r=m.radius;\n   const left=`${60-r*x} ${60-r*y}`,right=`${60+r*x} ${60-r*y}`,start=`${60-inner*x} ${60-inner*y}`,end=`${60+inner*x} ${60-inner*y}`;\n   this.element.innerHTML=`<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"120\" height=\"120\" viewBox=\"0 0 120 120\"><g data-direction-fan=\"true\"><path d=\"M${start} L${left} A${r} ${r} 0 0 1 ${right} L${end} A${inner} ${inner} 0 0 0 ${start} Z\" fill=\"#ffb300\" fill-opacity=\"0.55\" stroke=\"#ff9800\" stroke-width=\"1.25\" stroke-linejoin=\"round\"/></g><circle data-current-image-marker=\"true\" cx=\"60\" cy=\"60\" r=\"7\" fill=\"#00ff00\" stroke=\"#ffffff\" stroke-width=\"2\"/></svg>`;\n   this.geometryKey=key;\n  }\n  return true;\n }\n private syncParts():void {\n  const fan=this.element?.querySelector('[data-direction-fan]') as SVGElement|null;\n  const marker=this.element?.querySelector('[data-current-image-marker]') as SVGElement|null;\n  if(fan)fan.style.display=this.fanVisible?'':'none';\n  if(marker){marker.style.display=this.markerVisible?'':'none';marker.setAttribute('fill',this.markerFill);marker.setAttribute('fill-opacity',this.markerOpacity);}\n }\n private start(view:any):void {\n  if(this.frame!=null)return;\n  let last=-Infinity;\n  const track=(now:number)=>{\n   if(this.view!==view||!this.element||view.destroyed){this.clear();return;}\n   if(now-last>=32){last=now;try{this.position();}catch{this.element.style.display='none';this.onMarkerPresented?.(false,view);}}\n   this.frame=this.clock.request(track);\n  };\n  this.frame=this.clock.request(track);\n }\n private position():void {\n  const view=this.view,element=this.element,m=this.model;if(!view||!element||!m)return;\n  const hide=()=>{element.style.display='none';this.onMarkerPresented?.(false,view);};\n  if(view.container.ownerDocument?.visibilityState==='hidden'){hide();return;}\n  let pixel:any,orientation:string;\n  const cache=this.projectionCache;\n  if(cache&&cache.model===m&&cache.fanVisible===this.fanVisible&&cache.markerVisible===this.markerVisible&&cache.camera===view.camera&&cache.zoom===view.zoom&&cache.rotation===view.rotation&&cache.width===view.width&&cache.height===view.height&&view.stationary===true&&view.updating===false){pixel=cache.pixel;orientation=cache.orientation;}\n  else {\n   const source=this.point({longitude:m.lon,latitude:m.lat,spatialReference:{wkid:4326}});\n   let ground=view.type==='3d'?renderedGroundPoint(view,source,this.point):source;\n   if(!ground&&view.zoom<14)ground=this.point({longitude:m.lon,latitude:m.lat,z:0,spatialReference:{wkid:4326}});\n   pixel=ground&&view.toScreen(ground);\n   if(!pixel||!Number.isFinite(pixel.x)||!Number.isFinite(pixel.y)||pixel.x<0||pixel.y<0||pixel.x>view.width||pixel.y>view.height){hide();return;}\n   orientation='rotate(0)';\n   if(this.fanVisible||(view.type==='3d'&&this.markerVisible)){\n    const radians=m.heading*Math.PI/180,distance=Math.min(50000,Math.max(10,156543.03392804097/2**(view.zoom||0)*40)),cos=Math.max(.01,Math.cos(m.lat*Math.PI/180));\n    const tip=this.point({longitude:m.lon+Math.sin(radians)*distance/(111320*cos),latitude:Math.max(-89,Math.min(89,m.lat+Math.cos(radians)*distance/111320)),z:ground.z||0,spatialReference:{wkid:4326}});\n    const projected=view.toScreen(tip),dx=projected?.x-pixel.x,dy=projected?.y-pixel.y;\n    const bearing=Number.isFinite(dx)&&Number.isFinite(dy)&&Math.hypot(dx,dy)>.001?Math.atan2(dx,-dy)*180/Math.PI:m.heading-(view.type==='3d'?view.camera?.heading||0:view.rotation||0);\n    orientation=`rotate(${bearing})`;\n    if(view.type==='3d'){\n     const side=this.point({longitude:m.lon+Math.cos(radians)*distance/(111320*cos),latitude:Math.max(-89,Math.min(89,m.lat-Math.sin(radians)*distance/111320)),z:ground.z||0,spatialReference:{wkid:4326}}),q=view.toScreen(side);\n     const matrix=q&&groundFanMatrix({x:dx,y:dy},{x:q.x-pixel.x,y:q.y-pixel.y});if(matrix)orientation=matrix;\n    }\n   }\n   this.projectionCache={model:m,fanVisible:this.fanVisible,markerVisible:this.markerVisible,pixel,orientation,camera:view.camera,zoom:view.zoom,rotation:view.rotation,width:view.width,height:view.height};\n  }\n  element.style.display='block';\n  const position=haloOverlayPosition(view.container,element,pixel,view.width,view.height);if(!position){hide();return;}\n  const left=`${position.x}px`,top=`${position.y}px`;\n  if(element.style.left!==left)element.style.left=left;if(element.style.top!==top)element.style.top=top;\n  const fan=element.querySelector('[data-direction-fan]'),transform=`translate(60 60) ${orientation} translate(-60 -60)`;\n  if(fan&&fan.getAttribute('transform')!==transform)fan.setAttribute('transform',transform);\n  const marker=element.querySelector('[data-current-image-marker]'),markerTransform=view.type==='3d'?transform:'';\n  if(marker&&marker.getAttribute('transform')!==markerTransform)marker.setAttribute('transform',markerTransform);\n  this.onMarkerPresented?.(this.markerVisible,view);\n }\n clear():void {\n  this.onMarkerPresented?.(false,this.view);\n  if(this.frame!=null)this.clock.cancel(this.frame);\n  this.frame=null;this.element?.remove();this.element=null;this.view=null;this.model=null;this.projectionCache=null;this.geometryKey='';this.markerVisible=false;this.fanVisible=false;this.markerId=null;\n }\n}\n",
              "wholeFile": true
            }
          ]
        }
      ]
    },
    {
      "file": "tests/screenDirectionCone.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "steady 3D cleanup tests/screenDirectionCone.test.cjs",
              "before": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');function load(file,req){const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/map-graphics',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(req,m,m.exports);return m.exports}const pulse=load('SelectionPulse.ts',()=>({selectionPulseOverlayStyle:()=>({})})),{ScreenDirectionCone,groundFanMatrix}=load('ScreenDirectionCone.ts',()=>pulse);\nfunction setup(){let frame,requests=0,cancels=0,removed=0,projections=0;const elements=[],parent={offsetWidth:300,offsetHeight:300,clientLeft:0,clientTop:0,scrollLeft:0,scrollTop:0,getBoundingClientRect:()=>({left:0,top:0,width:300,height:300})},host={style:{position:''},getBoundingClientRect:()=>({left:0,top:0,width:300,height:300}),ownerDocument:{visibilityState:'visible',defaultView:{scrollX:0,scrollY:0,getComputedStyle:()=>({position:'relative'})}},appendChild(){}},view={type:'3d',zoom:14.1,width:300,height:300,stationary:true,updating:false,rotation:0,camera:{heading:0},container:host,map:{ground:{layers:[]}},toScreen:p=>(projections++,{x:150+p.longitude,y:150-p.latitude})};const cone=new ScreenDirectionCone(p=>({...p}),()=>{const part=()=>({style:{},attributes:{},setAttribute(k,v){this.attributes[k]=v},getAttribute(k){return this.attributes[k]}}),fan=part(),marker=part();const element={fan,marker,querySelector:selector=>selector==='[data-direction-fan]'?fan:marker,offsetParent:parent,style:{},setAttribute(){},remove(){removed++},innerHTML:'',firstChild:null};elements.push(element);return element},{request:cb=>(frame=cb,++requests),cancel:()=>cancels++});return{cone,view,elements,tick:t=>frame(t),stats:()=>({requests,cancels,removed,projections})}}\ntest('fan keeps pixel dimensions at zoom 14.1, 12.6 and full overview, with no animation',()=>{const x=setup();x.cone.show(x.view,0,0,0,5,60);x.tick(0);const el=x.elements[0],svg=el.innerHTML;assert.equal(el.style.width,'120px');assert.equal(el.style.display,'block');assert(svg.includes('A9 9'));assert(!svg.includes('<animate'));assert.equal(el.fan.getAttribute('transform'),'translate(60 60) matrix(1,0,0,1,0,0) translate(-60 -60)');assert.equal(el.style.transform,'translate(-50%, -50%)');let time=40;for(const zoom of[12.6,0]){x.view.zoom=zoom;x.tick(time);time+=40;assert.equal(el.innerHTML,svg);assert.equal(el.style.display,'block')}assert.equal(x.view.container.style.position,'');x.cone.clear()});\ntest('idle projection is cached; updates preserve element and cleanup cancels tracker',()=>{const x=setup();x.cone.show(x.view,0,0,0,5,60);x.tick(0);assert.equal(x.stats().projections,3);x.tick(40);assert.equal(x.stats().projections,3);x.cone.show(x.view,0,0,90,5,60);x.tick(80);assert.equal(x.elements.length,1);assert(x.elements[0].fan.getAttribute('transform').includes('matrix(0,1,-1,0,0,0)'));x.cone.clear();assert.equal(x.stats().cancels,1);assert.equal(x.stats().removed,1);const n=x.stats().requests;x.tick(120);assert.equal(x.stats().requests,n)});\ntest('unknown near terrain hides fan, but overview still projects on globe surface',()=>{const x=setup();x.view.map.ground.layers=[{}];x.cone.show(x.view,0,0,0,5,60);x.tick(0);assert.equal(x.elements[0].style.display,'none');x.view.zoom=0;x.tick(40);assert.equal(x.elements[0].style.display,'block');x.cone.clear()});\ntest('offscreen anchor hides fan and style is pointer transparent',()=>{const x=setup();x.cone.show(x.view,1000,0,0,5,60);x.tick(0);assert.equal(x.elements[0].style.display,'none');assert.equal(x.elements[0].style.pointerEvents,'none');x.cone.clear()});\n\ntest('all four actual viewer zoom steps lengthen while narrowing, reusing one element and tracker',()=>{const x=setup(),radii=[];for(const [length,spread]of[[10,60],[15,40],[20,30],[30,20]]){x.cone.show(x.view,0,0,0,length,spread);const svg=x.elements[0].innerHTML,radius=Number(svg.match(/ A([0-9.]+) /)[1]);radii.push(radius);assert(radius<=52);assert(svg.includes('viewBox=\"0 0 120 120\"'))}assert.equal(radii[0],32);for(let i=1;i<radii.length;i++)assert(radii[i]>radii[i-1]);assert.equal(radii[3],52);assert.equal(x.elements.length,1);assert.equal(x.stats().requests,1);x.cone.show(x.view,0,0,0,1000,20);assert.equal(Number(x.elements[0].innerHTML.match(/ A([0-9.]+) /)[1]),52);x.cone.clear()});\n\ntest('3D fan follows ground foreshortening instead of remaining a camera-facing sector',()=>{assert.equal(groundFanMatrix({x:0,y:-1},{x:1,y:0}),'matrix(1,0,0,1,0,0)');assert.equal(groundFanMatrix({x:0,y:-.25},{x:1,y:0}),'matrix(1,0,0,0.25,0,0)');assert.equal(groundFanMatrix({x:NaN,y:0},{x:1,y:0}),null);assert.equal(groundFanMatrix({x:0,y:0},{x:0,y:0}),null);const x=setup();x.view.toScreen=p=>({x:150+p.longitude,y:150-p.latitude*.25});x.cone.show(x.view,0,0,0,10,60);x.tick(0);assert(x.elements[0].fan.getAttribute('transform').includes('matrix(1,0,0,0.25,0,0)'));x.cone.clear()});\ntest('oblique ground projection cannot stretch the fan beyond its requested radius',()=>{const matrix=groundFanMatrix({x:2,y:-.1},{x:2,y:.1}),[a,b,c,d]=matrix.slice(7,-1).split(',').map(Number);for(let i=0;i<360;i++){const x=Math.cos(i*Math.PI/180),y=Math.sin(i*Math.PI/180);assert(Math.hypot(a*x+c*y,b*x+d*y)<=1.000002)}});\ntest('2D keeps the screen-facing fan without ground tilt',()=>{const x=setup();x.view.type='2d';x.cone.show(x.view,0,0,0,10,60);x.tick(0);assert(x.elements[0].fan.getAttribute('transform').includes('rotate(0)'));x.cone.clear()});\n\ntest('combined circle and fan share one anchor, while only the fan tilts',()=>{const x=setup();x.view.toScreen=p=>({x:150+p.longitude,y:150-p.latitude*.25});x.cone.showMarker(x.view,0,0,[0,255,0,1],'A');x.cone.show(x.view,0,0,0,10,60);x.tick(0);const el=x.elements[0];assert.equal(x.elements.length,1);assert(el.innerHTML.includes('data-current-image-marker'));assert(el.innerHTML.includes('r=\"7\"'));assert(el.innerHTML.includes('stroke=\"#ffffff\"'));assert.equal(el.marker.style.display,'');assert.equal(el.marker.getAttribute('fill'),'rgb(0,255,0)');assert(el.fan.getAttribute('transform').includes('matrix(1,0,0,0.25,0,0)'));assert.equal(el.marker.getAttribute('transform'),undefined);assert.equal(el.style.transform,'translate(-50%, -50%)');x.cone.hideCone();assert.equal(el.fan.style.display,'none');assert.equal(el.marker.style.display,'');assert.equal(x.stats().removed,0);x.cone.hideMarker();assert.equal(x.stats().removed,1);assert.equal(x.stats().cancels,1)});\ntest('new image updates anchor without duplicating component and clears stale fan',()=>{const x=setup();x.cone.showMarker(x.view,0,0,[0,255,0,1],'A');x.cone.show(x.view,0,0,0,10,60);x.tick(0);x.cone.showMarker(x.view,1,2,[0,255,0,1],'B');x.tick(40);assert.equal(x.elements.length,1);assert.equal(x.elements[0].style.left,'151px');assert.equal(x.elements[0].fan.style.display,'none');x.cone.clear()});\ntest('cone-only 2D use does not draw a second current-image circle',()=>{const x=setup();x.view.type='2d';x.cone.show(x.view,0,0,0,10,60);x.tick(0);assert.equal(x.elements[0].marker.style.display,'none');x.cone.clear()});\ntest('native fallback is enabled whenever combined marker cannot be presented',()=>{const x=setup(),states=[];x.cone.onMarkerPresented=(visible,view)=>states.push(visible);x.cone.showMarker(x.view,0,0,[0,255,0,1],'A');x.tick(0);assert.equal(states.at(-1),true);const project=x.view.toScreen;x.view.toScreen=()=>null;x.view.updating=true;x.tick(40);assert.equal(states.at(-1),false);x.view.toScreen=project;x.tick(80);assert.equal(states.at(-1),true);x.cone.clear()});\n",
              "after": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');function load(file,req){const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/map-graphics',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(req,m,m.exports);return m.exports}const pulse=load('SelectionPulse.ts',()=>({selectionPulseOverlayStyle:()=>({})})),{ScreenDirectionCone,groundFanMatrix}=load('ScreenDirectionCone.ts',()=>pulse);\nfunction setup(){let frame,requests=0,cancels=0,removed=0,projections=0;const elements=[],parent={offsetWidth:300,offsetHeight:300,clientLeft:0,clientTop:0,scrollLeft:0,scrollTop:0,getBoundingClientRect:()=>({left:0,top:0,width:300,height:300})},host={style:{position:''},getBoundingClientRect:()=>({left:0,top:0,width:300,height:300}),ownerDocument:{visibilityState:'visible',defaultView:{scrollX:0,scrollY:0,getComputedStyle:()=>({position:'relative'})}},appendChild(){}},view={type:'3d',zoom:14.1,width:300,height:300,stationary:true,updating:false,rotation:0,camera:{heading:0},container:host,map:{ground:{layers:[]}},toScreen:p=>(projections++,{x:150+p.longitude,y:150-p.latitude})};const cone=new ScreenDirectionCone(p=>({...p}),()=>{const part=()=>({style:{},attributes:{},setAttribute(k,v){this.attributes[k]=v},getAttribute(k){return this.attributes[k]}}),fan=part(),marker=part();const element={fan,marker,querySelector:selector=>selector==='[data-direction-fan]'?fan:marker,offsetParent:parent,style:{},setAttribute(){},remove(){removed++},innerHTML:'',firstChild:null};elements.push(element);return element},{request:cb=>(frame=cb,++requests),cancel:()=>cancels++});return{cone,view,elements,tick:t=>frame(t),stats:()=>({requests,cancels,removed,projections})}}\ntest('fan keeps pixel dimensions at zoom 14.1, 12.6 and full overview, with no animation',()=>{const x=setup();x.cone.show(x.view,0,0,0,5,60);x.tick(0);const el=x.elements[0],svg=el.innerHTML;assert.equal(el.style.width,'120px');assert.equal(el.style.display,'block');assert(svg.includes('A9 9'));assert(!svg.includes('<animate'));assert.equal(el.fan.getAttribute('transform'),'translate(60 60) matrix(1,0,0,1,0,0) translate(-60 -60)');assert.equal(el.style.transform,'translate(-50%, -50%)');let time=40;for(const zoom of[12.6,0]){x.view.zoom=zoom;x.tick(time);time+=40;assert.equal(el.innerHTML,svg);assert.equal(el.style.display,'block')}assert.equal(x.view.container.style.position,'');x.cone.clear()});\ntest('idle projection is cached; updates preserve element and cleanup cancels tracker',()=>{const x=setup();x.cone.show(x.view,0,0,0,5,60);x.tick(0);assert.equal(x.stats().projections,3);x.tick(40);assert.equal(x.stats().projections,3);x.cone.show(x.view,0,0,90,5,60);x.tick(80);assert.equal(x.elements.length,1);assert(x.elements[0].fan.getAttribute('transform').includes('matrix(0,1,-1,0,0,0)'));x.cone.clear();assert.equal(x.stats().cancels,1);assert.equal(x.stats().removed,1);const n=x.stats().requests;x.tick(120);assert.equal(x.stats().requests,n)});\ntest('unknown near terrain hides fan, but overview still projects on globe surface',()=>{const x=setup();x.view.map.ground.layers=[{}];x.cone.show(x.view,0,0,0,5,60);x.tick(0);assert.equal(x.elements[0].style.display,'none');x.view.zoom=0;x.tick(40);assert.equal(x.elements[0].style.display,'block');x.cone.clear()});\ntest('offscreen anchor hides fan and style is pointer transparent',()=>{const x=setup();x.cone.show(x.view,1000,0,0,5,60);x.tick(0);assert.equal(x.elements[0].style.display,'none');assert.equal(x.elements[0].style.pointerEvents,'none');x.cone.clear()});\n\ntest('all four actual viewer zoom steps lengthen while narrowing, reusing one element and tracker',()=>{const x=setup(),radii=[];for(const [length,spread]of[[10,60],[15,40],[20,30],[30,20]]){x.cone.show(x.view,0,0,0,length,spread);const svg=x.elements[0].innerHTML,radius=Number(svg.match(/ A([0-9.]+) /)[1]);radii.push(radius);assert(radius<=52);assert(svg.includes('viewBox=\"0 0 120 120\"'))}assert.equal(radii[0],32);for(let i=1;i<radii.length;i++)assert(radii[i]>radii[i-1]);assert.equal(radii[3],52);assert.equal(x.elements.length,1);assert.equal(x.stats().requests,1);x.cone.show(x.view,0,0,0,1000,20);assert.equal(Number(x.elements[0].innerHTML.match(/ A([0-9.]+) /)[1]),52);x.cone.clear()});\n\ntest('3D fan follows ground foreshortening instead of remaining a camera-facing sector',()=>{assert.equal(groundFanMatrix({x:0,y:-1},{x:1,y:0}),'matrix(1,0,0,1,0,0)');assert.equal(groundFanMatrix({x:0,y:-.25},{x:1,y:0}),'matrix(1,0,0,0.25,0,0)');assert.equal(groundFanMatrix({x:NaN,y:0},{x:1,y:0}),null);assert.equal(groundFanMatrix({x:0,y:0},{x:0,y:0}),null);const x=setup();x.view.toScreen=p=>({x:150+p.longitude,y:150-p.latitude*.25});x.cone.show(x.view,0,0,0,10,60);x.tick(0);assert(x.elements[0].fan.getAttribute('transform').includes('matrix(1,0,0,0.25,0,0)'));x.cone.clear()});\ntest('oblique ground projection cannot stretch the fan beyond its requested radius',()=>{const matrix=groundFanMatrix({x:2,y:-.1},{x:2,y:.1}),[a,b,c,d]=matrix.slice(7,-1).split(',').map(Number);for(let i=0;i<360;i++){const x=Math.cos(i*Math.PI/180),y=Math.sin(i*Math.PI/180);assert(Math.hypot(a*x+c*y,b*x+d*y)<=1.000002)}});\ntest('2D keeps the screen-facing fan without ground tilt',()=>{const x=setup();x.view.type='2d';x.cone.show(x.view,0,0,0,10,60);x.tick(0);assert(x.elements[0].fan.getAttribute('transform').includes('rotate(0)'));x.cone.clear()});\n\ntest('combined circle and fan share one anchor and the same ground-plane transform',()=>{const x=setup();x.view.toScreen=p=>({x:150+p.longitude,y:150-p.latitude*.25});x.cone.showMarker(x.view,0,0,[0,255,0,1],'A');x.cone.show(x.view,0,0,0,10,60);x.tick(0);const el=x.elements[0];assert.equal(x.elements.length,1);assert(el.innerHTML.includes('data-current-image-marker'));assert(el.innerHTML.includes('r=\"7\"'));assert(el.innerHTML.includes('stroke=\"#ffffff\"'));assert.equal(el.marker.style.display,'');assert.equal(el.marker.getAttribute('fill'),'rgb(0,255,0)');assert(el.fan.getAttribute('transform').includes('matrix(1,0,0,0.25,0,0)'));assert.equal(el.marker.getAttribute('transform'),el.fan.getAttribute('transform'));assert.equal(el.style.transform,'translate(-50%, -50%)');x.cone.hideCone();assert.equal(el.fan.style.display,'none');assert.equal(el.marker.style.display,'');assert.equal(x.stats().removed,0);x.cone.hideMarker();assert.equal(x.stats().removed,1);assert.equal(x.stats().cancels,1)});\ntest('new image updates anchor without duplicating component and clears stale fan',()=>{const x=setup();x.cone.showMarker(x.view,0,0,[0,255,0,1],'A');x.cone.show(x.view,0,0,0,10,60);x.tick(0);x.cone.showMarker(x.view,1,2,[0,255,0,1],'B');x.tick(40);assert.equal(x.elements.length,1);assert.equal(x.elements[0].style.left,'151px');assert.equal(x.elements[0].fan.style.display,'none');x.cone.clear()});\ntest('cone-only 2D use does not draw a second current-image circle',()=>{const x=setup();x.view.type='2d';x.cone.show(x.view,0,0,0,10,60);x.tick(0);assert.equal(x.elements[0].marker.style.display,'none');x.cone.clear()});\ntest('native fallback is enabled whenever combined marker cannot be presented',()=>{const x=setup(),states=[];x.cone.onMarkerPresented=(visible,view)=>states.push(visible);x.cone.showMarker(x.view,0,0,[0,255,0,1],'A');x.tick(0);assert.equal(states.at(-1),true);const project=x.view.toScreen;x.view.toScreen=()=>null;x.view.updating=true;x.tick(40);assert.equal(states.at(-1),false);x.view.toScreen=project;x.tick(80);assert.equal(states.at(-1),true);x.cone.clear()});\n\ntest('marker-only display remains ground-oriented after hiding the cone',()=>{const x=setup();x.view.toScreen=p=>({x:150+p.longitude,y:150-p.latitude*.25});x.cone.showMarker(x.view,0,0,[0,255,0,1],'A');x.tick(0);const el=x.elements[0];assert(el.marker.getAttribute('transform').includes('matrix(1,0,0,0.25,0,0)'));assert.equal(el.fan.style.display,'none');x.cone.show(x.view,0,0,0,10,60);x.tick(40);x.cone.hideCone();x.tick(80);assert.equal(el.marker.getAttribute('transform'),el.fan.getAttribute('transform'));assert.equal(el.marker.style.display,'');x.cone.clear()});\n",
              "wholeFile": true
            }
          ]
        }
      ]
    },
    {
      "file": "docs/GROUND-FACING-CURRENT-IMAGE.md",
      "content": "# v6.87 ground-facing combined marker\nRequires v6.86. Applies the same normalized projected ground-plane transform to the SVG circle and cone. Circle becomes an ellipse at shallow camera angles; white outline follows that shape. Marker-only display also computes the ground basis after hiding the cone. At top-down view it remains circular. One shared anchor, existing radius caps, viewer zoom length/narrowing and overview visibility remain. No shadow, animation, native symbol swaps, map layout changes or new loops. Circle-only mode now needs the same three projection calls as fan mode when the cache changes, instead of one; settled cache avoids those calls.\n\nThis is a ground-facing SVG overlay, not an actual terrain mesh, and does not add building occlusion. Native Graphic remains hidden while SVG is presented, retaining identity/navigation/fallback behavior. Existing selection/hover algorithms and 2D presentation unchanged. Install/rebuild/restart/refresh; --uninstall restores v6.86 round screen-facing circle, then rebuild/reload.\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'ground-facing-current-image-v6-87-';

function conflict(label) {
  throw new Error('Conflict in ' + label + '. No source files changed. Preserve local edits.');
}

/** Resolve a payload path and reject symbolic links, including parent folders. */
function targetFor(relative) {
  if (typeof relative !== 'string' || !relative || relative.includes('\\') || relative.includes(':') || relative.includes('\0')) throw new Error('Invalid patch path.');
  const parts = relative.split('/');
  if (parts.some(part => !part || part === '.' || part === '..')) throw new Error('Invalid patch path.');
  const target = path.resolve(root, ...parts);
  const relation = path.relative(root, target);
  if (!relation || relation.startsWith('..' + path.sep) || path.isAbsolute(relation)) throw new Error('Patch path escapes the widget folder.');
  let parent = root;
  for (let index = 0; index < parts.length; index++) {
    parent = path.join(parent, parts[index]);
    let stat;
    try { stat = fs.lstatSync(parent); } catch (error) { if (error.code === 'ENOENT') break; throw error; }
    if (stat.isSymbolicLink()) throw new Error('Symbolic links are not supported: ' + relative + '. No source files changed.');
    if (index < parts.length - 1 && !stat.isDirectory()) throw new Error('Parent path is not a folder: ' + relative);
    if (index === parts.length - 1 && !stat.isFile() && !stat.isDirectory()) throw new Error('Unsupported target type: ' + relative);
  }
  return target;
}

function readTarget(relative, required = false) {
  const file = targetFor(relative);
  let descriptor;
  try {
    descriptor = fs.openSync(file, fs.constants.O_RDONLY | noFollow);
    const stat = fs.fstatSync(descriptor);
    if (!stat.isFile()) throw new Error('Target is not a regular file: ' + relative);
    const bytes = fs.readFileSync(descriptor);
    return { file, bytes, mode: stat.mode, dev: stat.dev, ino: stat.ino };
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    if (required) throw new Error('Required file missing: ' + relative + '. No source files changed.');
    return { file, bytes: null };
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
}

function formatLike(text, original) {
  const raw = original.toString('utf8');
  const bom = raw.startsWith('\uFEFF') ? '\uFEFF' : '';
  return Buffer.from(bom + (raw.includes('\r\n') ? text.replace(/\n/g, '\r\n') : text));
}

/** Apply or reverse one exact insertion, preserving all text outside its anchors. */
function transformBlock(text, block, reverse) {
  const before = normalize(block.before), after = normalize(block.after);
  if (!before || !after || before === after) throw new Error('Invalid block: ' + block.label);
  const expected = reverse ? after : before;
  const replacement = reverse ? before : after;
  if (block.wholeFile) {
    if (text === replacement) return text;
    if (text !== expected) conflict(block.label);
    return replacement;
  }
  // Prefer the longest state when an insertion contains its original anchor.
  if (reverse) {
    const installedCount = count(text, after);
    if (installedCount === 1) return text.replace(after, () => before);
    if (installedCount > 1) conflict(block.label);
    if (count(text, before) === 1) {
      if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (partially edited patch)');
      return text;
    }
    conflict(block.label);
  }
  const installedCount = count(text, after);
  if (installedCount === 1) return text;
  if (installedCount > 1) conflict(block.label);
  if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (existing declaration)');
  if (count(text, before) !== 1) conflict(block.label);
  return text.replace(before, () => after);
}

function ensureParents(relative) {
  const segments = relative.split('/');
  segments.pop();
  let current = '';
  for (const segment of segments) {
    current = current ? current + '/' + segment : segment;
    const directory = targetFor(current);
    try { fs.mkdirSync(directory); } catch (error) { if (error.code !== 'EEXIST') throw error; }
    const stat = fs.lstatSync(directory);
    if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Unsafe parent directory: ' + current);
  }
}

function assertUnchanged(item) {
  const latest = readTarget(item.relative);
  if (item.original === null ? latest.bytes !== null : latest.bytes === null || !latest.bytes.equals(item.original)) {
    throw new Error('File changed during validation: ' + item.relative + '. No source files changed.');
  }
}

function writeExact(descriptor, bytes) {
  let offset = 0;
  while (offset < bytes.length) {
    const written = fs.writeSync(descriptor, bytes, offset, bytes.length - offset, offset);
    if (!written) throw new Error('File write made no progress.');
    offset += written;
  }
}

/** Existing files are opened without truncation, then checked through that handle. */
function overwriteOriginal(item, bytes) {
  targetFor(item.relative);
  const descriptor = fs.openSync(item.file, fs.constants.O_RDWR | noFollow);
  try {
    const stat = fs.fstatSync(descriptor);
    const linked = fs.lstatSync(item.file);
    if (!stat.isFile() || linked.isSymbolicLink() || stat.dev !== linked.dev || stat.ino !== linked.ino || !fs.readFileSync(descriptor).equals(item.original)) throw new Error('File changed before write: ' + item.relative);
    item.started = true;
    fs.ftruncateSync(descriptor, 0);
    writeExact(descriptor, bytes);
    fs.fsyncSync(descriptor);
  } finally { fs.closeSync(descriptor); }
}

function rollback(items) {
  const errors = [];
  for (const item of [...items].reverse()) {
    if (!item.started) continue;
    try {
      targetFor(item.relative);
      if (item.original === null) {
        // Remove only the exclusively-created file owned by this installer.
        const stat = fs.lstatSync(item.file);
        if (stat.dev !== item.createdDev || stat.ino !== item.createdIno) throw new Error('Created file replaced by another process.');
        fs.unlinkSync(item.file);
      } else if (item.content === null) {
        const descriptor = fs.openSync(item.file, 'wx', item.mode & 0o777);
        try { fs.writeFileSync(descriptor, item.original); } finally { fs.closeSync(descriptor); }
      } else {
        const descriptor = fs.openSync(item.file, fs.constants.O_WRONLY | noFollow);
        try { fs.ftruncateSync(descriptor, 0); writeExact(descriptor, item.original); } finally { fs.closeSync(descriptor); }
      }
    } catch (error) { errors.push(item.relative + ': ' + error.message); }
  }
  return errors;
}


function transformEntry(text, entry) {
  const results = new Set();
  for (const variant of entry.variants) {
    try {
      let next = text;
      for (const block of variant.blocks) next = transformBlock(next, block, false);
      results.add(next);
    } catch (error) {
      if (!error.message.startsWith('Conflict in ')) throw error;
    }
  }
  if (results.size !== 1) conflict(entry.file + (results.size ? ' (ambiguous baseline)' : ' (unsupported or edited source)'));
  return [...results][0];
}

function uninstallWrites() {
  const backupRoot = targetFor('.refactor-backups');
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.87 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'ground-facing-current-image-v6-87' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.87 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.87 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.87 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-ground-facing-current-image-v6-87.cjs [--dry-run] [--uninstall]');
  readTarget('src/runtime/widget.tsx', true);
  let writes;
  if (uninstall) writes = uninstallWrites();
  else {
    const seen = new Set(); writes = [];
    for (const entry of payload.entries) {
      if (seen.has(entry.file)) throw new Error('Duplicate patch path: ' + entry.file);
      seen.add(entry.file);
      const current = readTarget(entry.file, entry.content === undefined);
      if (entry.content !== undefined) {
        if (current.bytes === null) {
          writes.push({ ...current, relative: entry.file, original: null, content: Buffer.from(entry.content) });
        } else {
          const text = normalize(current.bytes.toString('utf8'));
          if (text !== normalize(entry.content)) {
            if (!entry.variants) conflict(entry.file + ' (existing helper/test differs)');
            const next = transformEntry(text, entry);
            if (next !== normalize(entry.content)) conflict(entry.file + ' (unexpected helper result)');
            writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(next, current.bytes) });
          }
        }
        continue;
      }
      const text = normalize(current.bytes.toString('utf8')), next = transformEntry(text, entry);
      if (next !== text) writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(next, current.bytes) });
    }
  }
  if (!writes.length) {
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Ground facing current image v6.87 is already installed. No files changed.');
    process.exit(0);
  }
  for (const item of writes) assertUnchanged(item);
  if (dry) {
    console.log('Dry run passed. Would ' + (uninstall ? 'restore' : 'update') + ':\n' + writes.map(item => '  ' + item.relative).join('\n'));
    process.exit(0);
  }
  const backupRelative = '.refactor-backups/' + prefix + (uninstall ? 'uninstall-' : '') + Date.now() + '-' + process.pid;
  ensureParents(backupRelative + '/changes.json');
  const backup = targetFor(backupRelative);
  for (const item of writes) {
    if (item.original === null) continue;
    const relative = backupRelative + '/' + item.relative;
    ensureParents(relative);
    const descriptor = fs.openSync(targetFor(relative), 'wx');
    try { fs.writeFileSync(descriptor, item.original); } finally { fs.closeSync(descriptor); }
  }
  const manifest = { installer: 'ground-facing-current-image-v6-87', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
  const manifestPath = targetFor(backupRelative + '/changes.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
  for (const item of writes) assertUnchanged(item);
  try {
    for (const item of writes) {
      assertUnchanged(item);
      if (item.content === null) {
        targetFor(item.relative); fs.unlinkSync(item.file); item.started = true;
      } else if (item.original === null) {
        ensureParents(item.relative);
        const descriptor = fs.openSync(targetFor(item.relative), 'wx');
        const stat = fs.fstatSync(descriptor);
        item.createdDev = stat.dev; item.createdIno = stat.ino; item.started = true;
        try { fs.writeFileSync(descriptor, item.content); } finally { fs.closeSync(descriptor); }
      } else overwriteOriginal(item, item.content);
    }
    manifest.completed = true;
    // Write completion through the existing guarded regular file, not a followed link.
    const metadata = readTarget(backupRelative + '/changes.json', true);
    overwriteOriginal({ ...metadata, relative: backupRelative + '/changes.json', original: metadata.bytes }, Buffer.from(JSON.stringify(manifest, null, 2) + '\n'));
  } catch (error) {
    const errors = rollback(writes);
    if (errors.length) throw new Error(error.message + '\nRollback needs attention. Backup: ' + backupRelative + '\n' + errors.join('\n'));
    throw new Error(error.message + '\nInstaller writes rolled back. Original files restored. Backup: ' + backupRelative);
  }
  console.log('Ground facing current image v6.87 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
