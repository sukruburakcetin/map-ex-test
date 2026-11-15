import { TILE_CATEGORIES } from './tileCategories';
import type { PlaceBbox } from './placesModel';
/** Public runtime configuration: a service root, never a FeatureServer or credential-bearing URL. */
export function placesApiUrl(value:unknown):string|null {
  if(typeof value!=='string'||!value.trim())return null;
  try{const url=new URL(value.trim());if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||/\/(?:FeatureServer|VectorTileServer)(?:\/|$)/i.test(url.pathname)||/\/(?:style\.json|query|search|status)\/?$/i.test(url.pathname))return null;
    return url.origin+url.pathname.replace(/\/+$/,'');
  }catch{return null;}
}
export function placesApiEndpoints(base:string):{base:string;style:string;query:string;search:string;status:string} {
  const url=placesApiUrl(base);if(!url)throw new Error('Expected a Places API base HTTPS URL');
  return{base:url,style:url+'/style.json',query:url+'/query',search:url+'/search',status:url+'/status'};
}
export function placesApiSibling(queryUrl:string,endpoint:'status'|'search'):string {
  const url=new URL(queryUrl);if(url.protocol!=='https:'||url.username||url.password||!url.pathname.endsWith('/query'))throw new Error('Expected a Places API query endpoint');
  url.pathname=url.pathname.slice(0,-5)+endpoint;return url.toString();
}
export interface PlacesApiMetadata {bbox:PlaceBbox;count:number|null;release:string}
export function validatePlacesApiMetadata(result:any):PlacesApiMetadata {
  if(!result||result.ready===false||result.paging_version!==1||result.scale_display_version!==1||result.text_search_version!==1)throw new Error('Incompatible Places service protocol; update the service');
  if(result.category_filter_version!==1||!Array.isArray(result.supported_icon_families)||TILE_CATEGORIES.some(([id])=>!result.supported_icon_families.includes(id)))throw new Error('Incompatible Places service category filters');
  const bbox=result.bbox;
  if(!Array.isArray(bbox)||bbox.length!==4||!bbox.every(Number.isFinite)||bbox[0]>=bbox[2]||bbox[1]>=bbox[3]||bbox[0]<-180||bbox[2]>180||bbox[1]<-85.051129||bbox[3]>85.051129)throw new Error('Invalid Places service extent');
  return{bbox:[...bbox] as PlaceBbox,count:Number.isSafeInteger(result.count)&&result.count>=0?result.count:null,release:typeof result.release==='string'?result.release.slice(0,80):''};
}
/** Explicit builder test only; importing configuration makes no request. */
export async function testPlacesApi(base:string,signal?:AbortSignal):Promise<PlacesApiMetadata> {
  const endpoint=placesApiEndpoints(base).status,controller=new AbortController(),cancel=()=>controller.abort();
  if(signal?.aborted)controller.abort();signal?.addEventListener('abort',cancel,{once:true});const timeout=setTimeout(cancel,8000);
  try{const response=await fetch(endpoint,{signal:controller.signal,credentials:'omit'});if(!response.ok)throw new Error('Places service could not be reached');return validatePlacesApiMetadata(await response.json());}
  finally{clearTimeout(timeout);signal?.removeEventListener('abort',cancel);}
}
