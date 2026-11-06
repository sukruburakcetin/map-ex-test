import type { DetectionBounds } from './detectionPreview';
import { validDetectionBounds, readDetectionPreview, detectionPreviewFrame } from './detectionPreview';
export interface DetectionImageReference { imageId:string; detectionId?:string;placeId?:string; bounds:DetectionBounds; attachmentId?:string }
export const validAttachmentId=(id:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
export function validSavedCrop(data:string):boolean {return typeof data==='string'&&data.length<=150000&&/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(data);}
export function attachmentMetadata(value:string):{text:string;reference:DetectionImageReference|null} {
 const place=/\n?\[Place image\]\(urn:mapillary-place-image:([^\s)]+)\)/.exec(value);
 if(place){try{const [imageId,encoded,crop,id,...extra]=place[1].split(':'),placeId=decodeURIComponent(encoded),v=crop.split(',').map(Number),bounds={x:v[0],y:v[1],width:v[2],height:v[3]};if(extra.length||!/^\d+$/.test(imageId)||!placeId||placeId.length>160||/[\x00-\x1f]/.test(placeId)||v.length!==4||!validDetectionBounds(bounds)||!validAttachmentId(id))return{text:value,reference:null};return{text:(value.slice(0,place.index)+value.slice(place.index+place[0].length)).trim(),reference:{imageId,placeId,bounds,attachmentId:id}};}catch{return{text:value,reference:null};}}
 const match=/\n?\[Detection image\]\(urn:mapillary-detection:([^\s)]+)\)/.exec(value);
 if(!match){const legacy=readDetectionPreview(value);return{text:legacy.text,reference:legacy.preview||null};}
 try{const [imageId,detectionId,crop,id]=match[1].split(':');const values=crop.split(',').map(Number),bounds={x:values[0],y:values[1],width:values[2],height:values[3]};if(!/^\d+$/.test(imageId)||!/^\d+$/.test(detectionId)||values.length!==4||!validDetectionBounds(bounds)||id&&!validAttachmentId(id))return{text:value,reference:null};return{text:(value.slice(0,match.index)+value.slice(match.index+match[0].length)).trim(),reference:{imageId,detectionId,bounds,...(id?{attachmentId:id}:{})}};}catch{return{text:value,reference:null};}
}
export function withAttachmentMetadata(text:string,seed:{imageId:string;detectionId:string;bounds?:DetectionBounds;attachmentId?:string}):string {
 const clean=attachmentMetadata(text).text;
 if(!/^\d+$/.test(seed.imageId)||!/^\d+$/.test(seed.detectionId)||!validDetectionBounds(seed.bounds))return clean;
 const b=seed.bounds,id=seed.attachmentId&&validAttachmentId(seed.attachmentId)?seed.attachmentId:'';
 return clean+`\n[Detection image](urn:mapillary-detection:${seed.imageId}:${seed.detectionId}:${[b.x,b.y,b.width,b.height].join(',')}${id?':'+id:''})`;
}
export function withPlaceAttachmentMetadata(text:string,seed:{placeId:string;imageId:string|null;bounds?:DetectionBounds;attachmentId?:string}):string {
 const clean=attachmentMetadata(text).text;
 if(!seed.imageId||!/^\d+$/.test(seed.imageId)||!seed.placeId||seed.placeId.length>160||/[\x00-\x1f]/.test(seed.placeId)||!validDetectionBounds(seed.bounds)||!seed.attachmentId||!validAttachmentId(seed.attachmentId))return clean;
 const b=seed.bounds;return clean+`\n[Place image](urn:mapillary-place-image:${seed.imageId}:${encodeURIComponent(seed.placeId).replace(/[!'()*]/g,char=>'%'+char.charCodeAt(0).toString(16))}:${[b.x,b.y,b.width,b.height].join(',')}:${seed.attachmentId})`;
}
function database():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const request=indexedDB.open('mapillary-detection-crops-v1',1);request.onupgradeneeded=()=>request.result.createObjectStore('images');request.onerror=()=>reject(request.error);request.onsuccess=()=>resolve(request.result);});}
export async function storeDetectionCrop(id:string,data:string):Promise<void>{if(!validAttachmentId(id)||!validSavedCrop(data))throw Error('Invalid detection image.');const db=await database();try{await new Promise<void>((resolve,reject)=>{const tx=db.transaction('images','readwrite');tx.objectStore('images').put(data,id);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}finally{db.close();}}
export async function readDetectionCrop(id:string):Promise<string>{if(!validAttachmentId(id))throw Error('Invalid attachment reference.');const db=await database();try{return await new Promise<string>((resolve,reject)=>{const tx=db.transaction('images'),request=tx.objectStore('images').get(id);request.onsuccess=()=>validSavedCrop(request.result)?resolve(request.result):reject(Error('The saved crop is unavailable in this browser.'));request.onerror=()=>reject(request.error);});}finally{db.close();}}
export async function deleteDetectionCrop(id:string):Promise<void>{const db=await database();try{await new Promise<void>((resolve,reject)=>{const tx=db.transaction('images','readwrite');tx.objectStore('images').delete(id);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});}finally{db.close();}}
export async function captureDetectionCrop(seed:{imageId:string;bounds?:DetectionBounds},load:(id:string,signal:AbortSignal)=>Promise<string>,signal:AbortSignal):Promise<string>{
 if(!validDetectionBounds(seed.bounds))throw Error('This detection has no usable image bounds.');
 const url=await load(seed.imageId,signal);const uri=new URL(url);if(uri.protocol!=='https:')throw Error('Invalid image URL.');
 const response=await fetch(uri.href,{signal,credentials:'omit',referrerPolicy:'no-referrer'});if(!response.ok)throw Error('Could not download the detection image.');const blob=await response.blob();if(blob.size>16*1024*1024)throw Error('The source image is too large.');
 const bitmap=await createImageBitmap(blob);try{if(signal.aborted)throw new DOMException('Cancelled','AbortError');const b=detectionPreviewFrame(seed.bounds,bitmap.width/bitmap.height),w=b.width*bitmap.width,h=b.height*bitmap.height,scale=Math.min(1,480/Math.max(w,h)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(w*scale));canvas.height=Math.max(1,Math.round(h*scale));const ctx=canvas.getContext('2d');if(!ctx)throw Error('Image capture is unavailable.');ctx.drawImage(bitmap,b.x*bitmap.width,b.y*bitmap.height,w,h,0,0,canvas.width,canvas.height);let data=canvas.toDataURL('image/jpeg',.82);if(data.length>150000)data=canvas.toDataURL('image/jpeg',.55);if(!validSavedCrop(data))throw Error('The crop is too large to attach.');return data;}finally{bitmap.close();}
}
