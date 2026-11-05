import { detectionPreviewLink, validDetectionBounds } from './detectionPreview';
import type { DetectionBounds } from './detectionPreview';
/** A 2D detection does not establish the object's ground location. Map location is user-picked. */
export interface DetectionNoteSelection { imageId:string; detectionId:string; title:string; bounds?:DetectionBounds; includePreview?:boolean; location?:{lon:number;lat:number;featureId:string}; }
export type DetectionNoteDestination='local'|'enterprise'|'workspace';
export interface DetectionContributionSeed extends DetectionNoteSelection { requestId:string;lon:number;lat:number; }
export function detectionNoteDescription(seed:DetectionNoteSelection):string {
 const link=seed.includePreview&&validDetectionBounds(seed.bounds)?detectionPreviewLink({imageId:seed.imageId,detectionId:seed.detectionId,bounds:seed.bounds}):'';
 return `Detected object: ${seed.title}\nMapillary image: ${seed.imageId}\nDetection ID: ${seed.detectionId}`+(link?'\n'+link:'');
}
export function validDetectionNoteLocation(point:{lon:number;lat:number}):boolean {
 return Number.isFinite(point.lon)&&Number.isFinite(point.lat)&&Math.abs(point.lon)<=180&&Math.abs(point.lat)<=90;
}

/** Accept only a verified detection-to-feature association, never the camera coordinate or a nearest sprite. */
export function mappedDetectionLocation(selection:DetectionNoteSelection,context:{featureId?:string;point?:{lon:number;lat:number}|null;images?:readonly {id:string;detectionId?:string}[]}):DetectionNoteSelection['location'] {
 if(!context.featureId||!context.point||!validDetectionNoteLocation(context.point)||!context.images?.some(image=>String(image.id)===selection.imageId&&String(image.detectionId)===selection.detectionId))return undefined;
 return {...context.point,featureId:context.featureId};
}
