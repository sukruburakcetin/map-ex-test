export interface DetectionBounds {x:number;y:number;width:number;height:number}
export interface DetectionPreview {imageId:string;detectionId:string;bounds:DetectionBounds}
export type DetectionPreviewLoader=(imageId:string,signal:AbortSignal)=>Promise<string>;
export function validDetectionBounds(bounds:DetectionBounds|undefined):bounds is DetectionBounds {
 return !!bounds&&[bounds.x,bounds.y,bounds.width,bounds.height].every(Number.isFinite)&&bounds.x>=0&&bounds.y>=0&&bounds.width>0&&bounds.height>0&&bounds.x+bounds.width<=1.000001&&bounds.y+bounds.height<=1.000001;
}
export function detectionPreviewLink(preview:DetectionPreview):string {
 if(!/^\d+$/.test(preview.imageId)||!/^\d+$/.test(preview.detectionId)||!validDetectionBounds(preview.bounds))return '';
 const params=new URLSearchParams({pKey:preview.imageId,focus:'photo',noteDetection:preview.detectionId,noteCrop:[preview.bounds.x,preview.bounds.y,preview.bounds.width,preview.bounds.height].join(',')});
 return `[Mapillary detection preview](https://www.mapillary.com/app/?${params})`;
}
/** Portable opt-in reference in existing note text. No signed URL, token or image bytes persist. */
export function readDetectionPreview(text:string):{text:string;preview:DetectionPreview|null;url?:string} {
 const match=/\[Mapillary detection preview\]\((https:\/\/www\.mapillary\.com\/app\/\?[^\s)]+)\)/.exec(text);
 if(!match)return{text,preview:null};
 try{const url=new URL(match[1]);if(url.origin!=='https://www.mapillary.com'||url.pathname!=='/app/')return{text,preview:null};
 const imageId=url.searchParams.get('pKey')||'',detectionId=url.searchParams.get('noteDetection')||'',crop=(url.searchParams.get('noteCrop')||'').split(',').map(Number);
 if(crop.length!==4)return{text,preview:null};const bounds={x:crop[0],y:crop[1],width:crop[2],height:crop[3]};
 if(!/^\d+$/.test(imageId)||!/^\d+$/.test(detectionId)||!validDetectionBounds(bounds))return{text,preview:null};
 return{text:(text.slice(0,match.index)+text.slice(match.index+match[0].length)).trim(),preview:{imageId,detectionId,bounds},url:detectionPreviewLink({imageId,detectionId,bounds}).slice('[Mapillary detection preview]('.length,-1)};
 }catch{return{text,preview:null};}
}
/** Include a little context rather than reducing a long pole to a few-pixel-wide strip. */
export function detectionPreviewFrame(bounds:DetectionBounds,imageRatio:number):DetectionBounds {
 const ratio=Number.isFinite(imageRatio)&&imageRatio>0?imageRatio:2;
 const width=Math.min(1,Math.max(bounds.width,.03,bounds.height*.5/ratio));
 const height=Math.min(1,Math.max(bounds.height,.03,bounds.width*ratio/3));
 return{x:Math.max(0,Math.min(1-width,bounds.x+bounds.width/2-width/2)),y:Math.max(0,Math.min(1-height,bounds.y+bounds.height/2-height/2)),width,height};
}
