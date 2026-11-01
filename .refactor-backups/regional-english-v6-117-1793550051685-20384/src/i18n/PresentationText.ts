/** Per-widget presentation only. Never localize request values, stored records or arbitrary user content. */
export type TextValues = Record<string,string|number>;
export interface TextCatalog { [key:string]: string; }
const normalize=(s:string)=>s.replace(/\s+/g,' ').trim();
const escape=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function interpolate(template:string,values:TextValues={}):string{return template.replace(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g,(all,key)=>Object.prototype.hasOwnProperty.call(values,key)?String(values[key]):all)}
/** Exact templates use a Map. Matching already-rendered notices is cached and used only at UI boundaries. */
export function presentationFormatter(english:TextCatalog,current:TextCatalog,known:readonly TextCatalog[]=[]):(source:string,values?:TextValues)=>string {
 const sources=new Map<string,string>(),patterns:{key:string;names:string[];regex:RegExp;prefix:string}[]=[];
 for(const catalog of [english,...known,current])for(const[key,value]of Object.entries(catalog)){
  const template=normalize(value);sources.set(template,key);
  const names=[...template.matchAll(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g)].map(x=>x[1]);
  if(names.length){const parts=template.split(/\{[a-zA-Z][a-zA-Z0-9_]*\}/g);if(parts.join('').replace(/[^\p{L}]/gu,'').length>=3)patterns.push({key,names,regex:new RegExp('^'+parts.map(escape).join('([\\s\\S]*?)')+'$'),prefix:parts[0]});}
 }
 patterns.sort((a,b)=>b.prefix.length-a.prefix.length);
 const cache=new Map<string,string>();
 return (source,values)=>{
  if(typeof source!=='string')return source==null?'':String(source);
  const normalized=normalize(source),key=sources.get(normalized);
  if(key)return interpolate(current[key]??english[key]??source,values);
  if(values)return interpolate(source,values);
  const hit=cache.get(source);if(hit!==undefined)return hit;
  let result=source;
  for(const p of (normalized.length<=2048?patterns:[])){if(p.prefix&&!normalized.startsWith(p.prefix))continue;const match=p.regex.exec(normalized);if(!match)continue;const parameters:TextValues={};p.names.forEach((name,i)=>parameters[name]=match[i+1]);result=interpolate(current[p.key]??english[p.key]??source,parameters);break;}
  cache.set(source,result);if(cache.size>256)cache.delete(cache.keys().next().value!);return result;
 };
}
export interface Presentation {
 readonly locale:string;
 text(source:string,values?:TextValues):string;
 date(value:Date|number,options?:Intl.DateTimeFormatOptions):string;
 number(value:number,options?:Intl.NumberFormatOptions):string;
 bind(target:any,property:string,getter:()=>string):string;
 bindAttribute(target:any,attribute:string,getter:()=>string):void;
 release(target:any):void;
 onChange(callback:()=>void):{remove():void};
}
/** Bind only properties whose content was constructed by the widget, never data-only properties. */
export class PresentationText implements Presentation {
 locale='en';
 private formatter:(source:string,values?:TextValues)=>string=(source,values)=>interpolate(source,values);
 private bindings=new Map<any,Map<string,{attribute:boolean;getter:()=>string}>>();
 private listeners=new Set<()=>void>();
 private created=new WeakMap<object,number>();
 private dates=new Map<string,Intl.DateTimeFormat>();
 private numbers=new Map<string,Intl.NumberFormat>();
 text=(source:string,values?:TextValues):string=>this.formatter(source,values);
 date=(value:Date|number,options?:Intl.DateTimeFormatOptions):string=>{const key=JSON.stringify(options||{});let f=this.dates.get(key);if(!f){f=new Intl.DateTimeFormat(this.locale,options);this.dates.set(key,f)}return f.format(value)};
 number=(value:number,options?:Intl.NumberFormatOptions):string=>{const key=JSON.stringify(options||{});let f=this.numbers.get(key);if(!f){f=new Intl.NumberFormat(this.locale,options);this.numbers.set(key,f)}return f.format(value)};
 private write(target:any,key:string,entry:{attribute:boolean;getter:()=>string}):string {
  let value:string;try{value=entry.getter()}catch{value=this.text((entry as any).last || '')}(entry as any).last=value;if(entry.attribute){if(target.getAttribute?.(key)!==value)target.setAttribute(key,value)}else if(target[key]!==value)target[key]=value;return value;
 }
 bind(target:any,property:string,getter:()=>string):string {
  if(!target)return '';
  let entries=this.bindings.get(target);if(!entries){entries=new Map();this.bindings.set(target,entries);this.created.set(target,Date.now());this.prune()}
  const entry={attribute:false,getter};entries.set(property,entry);return this.write(target,property,entry);
 }
 bindAttribute(target:any,attribute:string,getter:()=>string):void {
  if(!target)return;let entries=this.bindings.get(target);if(!entries){entries=new Map();this.bindings.set(target,entries);this.created.set(target,Date.now());this.prune()}
  const entry={attribute:true,getter};entries.set(attribute,entry);this.write(target,attribute,entry);
 }
 private prune():void {
  if(this.bindings.size<=512)return;const now=Date.now();
  for(const target of this.bindings.keys())if(target.destroyed===true||(target.isConnected===false&&now-(this.created.get(target)||0)>2000))this.bindings.delete(target);
  while(this.bindings.size>1024){const old=[...this.bindings.keys()].find(target=>target.isConnected===false)||this.bindings.keys().next().value;this.bindings.delete(old);}
 }
 release(target:any):void {if(!target)return;for(const node of this.bindings.keys())if(node===target)this.bindings.delete(node);else if(typeof node?.nodeType==='number'&&target.contains?.(node))this.bindings.delete(node)}
 onChange(callback:()=>void):{remove():void}{this.listeners.add(callback);return{remove:()=>this.listeners.delete(callback)}}
 update(locale:string,formatter:(source:string,values?:TextValues)=>string):void {
  this.locale=locale;this.formatter=formatter;this.dates.clear();this.numbers.clear();
  for(const[target,entries]of this.bindings){if(target.destroyed===true){this.bindings.delete(target);continue}for(const[key,entry]of entries){try{const current=entry.attribute?target.getAttribute?.(key):target[key];if((entry as any).last!==undefined&&current!==(entry as any).last){entries.delete(key);continue}this.write(target,key,entry)}catch{/* A retiring popup must not block the other owners. */}}}
  for(const callback of this.listeners){try{callback()}catch{/* Retiring owner. */}}
 }
 clear():void{this.bindings.clear();this.listeners.clear();this.dates.clear();this.numbers.clear()}
 get bindingCount():number{return this.bindings.size}
}
/** Backwards-compatible English for standalone owners and unit fixtures. No bindings or watchers. */
export const englishPresentation:Presentation={locale:'en',text:interpolate,date:(value,options)=>new Intl.DateTimeFormat('en',options).format(value),number:(value,options)=>new Intl.NumberFormat('en',options).format(value),bind:(target,key,getter)=>(target[key]=getter()),bindAttribute:(target,key,getter)=>target.setAttribute(key,getter()),release(){},onChange:()=>({remove(){}})};
