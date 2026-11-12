import { isTileCategory } from './tileCategories';
type Store = Pick<Storage, 'getItem' | 'setItem'>;

export interface TilePlacePreferences {family:string;autoUpdate:boolean;minimum:number|null;hideClosed:boolean}
export function tilePlacePreferenceKey(widgetId:unknown,appPath:string,source:string):string|null {
 try{const url=new URL(source);if(url.protocol!=='https:'||url.username||url.password||widgetId==null||!appPath)return null;return'mly:places:tiles:v1:'+JSON.stringify([appPath,String(widgetId),url.origin+url.pathname.replace(/\/(?:style\.json|query)\/?$/,'').replace(/\/+$/,'')]);}catch{return null;}
}
export function readTilePlacePreferences(storage:()=>Store,key:string|null):TilePlacePreferences {
 const defaults:TilePlacePreferences={family:'all',autoUpdate:true,minimum:null,hideClosed:false};if(!key)return defaults;
 try{const p=JSON.parse(storage().getItem(key)||'null');if(!p||typeof p!=='object')return defaults;return{
 family:isTileCategory(p.family)?p.family:'all',autoUpdate:typeof p.autoUpdate==='boolean'?p.autoUpdate:true,
 minimum:p.minimum===null||typeof p.minimum==='number'&&Number.isFinite(p.minimum)&&p.minimum>=0&&p.minimum<=1?p.minimum:null,hideClosed:p.hideClosed===true};}catch{return defaults;}
}
export function saveTilePlacePreferences(storage:()=>Store,key:string|null,value:TilePlacePreferences):void {
 if(!key)return;try{storage().setItem(key,JSON.stringify({family:isTileCategory(value.family)?value.family:'all',autoUpdate:!!value.autoUpdate,minimum:value.minimum===null||Number.isFinite(value.minimum)&&value.minimum>=0&&value.minimum<=1?value.minimum:null,hideClosed:!!value.hideClosed}));}catch{/* Current-session filters still work. */}
}
