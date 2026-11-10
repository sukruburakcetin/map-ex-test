import { isTileCategory } from './tileCategories';
import { PLACE_GROUPS, PlaceGroup, placesServiceUrl } from './placesModel';
type Store = Pick<Storage, 'getItem' | 'setItem'>;
const allowed = (value: unknown): value is PlaceGroup => typeof value === 'string' && PLACE_GROUPS.includes(value as PlaceGroup);
/** localStorage already scopes origin; isolate app path, widget and credential-free service. */
export function placePreferenceKey(widgetId: unknown, appPath: string, serviceUrl: string | undefined): string | null {
  const url = placesServiceUrl(serviceUrl);
  if (!url || widgetId == null || !appPath) return null;
  return 'mly:places:category:v1:' + JSON.stringify([appPath, String(widgetId), url]);
}
export function readPlaceCategory(storage: () => Store, key: string | null, fallback: PlaceGroup = 'all'): PlaceGroup {
  const safe = allowed(fallback) ? fallback : 'all';
  if (!key) return safe;
  try { const value = storage().getItem(key); return allowed(value) ? value : safe; } catch { return safe; }
}
export function savePlaceCategory(storage: () => Store, key: string | null, category: PlaceGroup): void {
  if (!key || !allowed(category)) return;
  try { storage().setItem(key, category); } catch { /* In-memory selection still works when browser storage is blocked. */ }
}

/** Separate validated toggle, scoped by the same widget/app/service key as categories. */
export function readPlaceAutoUpdate(storage:()=>Store,key:string|null,fallback=true):boolean {
 if(!key)return fallback;
 try{const value=storage().getItem(key+':auto-update:v1');return value==='true'?true:value==='false'?false:fallback;}catch{return fallback;}
}
export function savePlaceAutoUpdate(storage:()=>Store,key:string|null,value:boolean):void {
 if(!key||typeof value!=='boolean')return;
 try{storage().setItem(key+':auto-update:v1',String(value));}catch{/* Session-only when storage is blocked. */}
}

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
