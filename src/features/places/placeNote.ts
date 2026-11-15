import type { DetectionBounds } from '../detections/detectionPreview';
import type { Place } from './placesModel';
import type { DetectionContributionSeed } from '../detections/detectionNote';
export type PlaceNoteDestination='local'|'enterprise'|'workspace';
export interface PlaceNoteImage {imageId:string;bounds:DetectionBounds;capturedAt?:number}
export interface PlaceNoteImageContext {imageId:string;center:[number,number];capturedAt?:number}
export interface PlaceNoteOptions {pickLocation?:boolean;image?:PlaceNoteImage}
export interface PlaceContributionSeed {requestId:string;placeId:string;title:string;description:string;lon:number;lat:number;imageId:string|null;bounds?:DetectionBounds;attachmentId?:string}
export type ExternalContributionSeed=DetectionContributionSeed|PlaceContributionSeed;
export function placeNoteDescription(place:Place,image?:PlaceNoteImage):string {
 return [`Place: ${place.name}`,`Overture ID: ${place.id}`,`Category: ${place.category.replace(/_/g,' ')}`,[place.lat,place.lon].every(Number.isFinite)&&`Mapped place location: ${place.lat.toFixed(6)}, ${place.lon.toFixed(6)}`,place.address&&`Address: ${place.address}`,place.website&&`Website: ${place.website}`,place.release&&`Overture release: ${place.release}`,image&&`Mapillary image: ${image.imageId}`,image&&(typeof image.capturedAt==='number'&&Number.isFinite(new Date(image.capturedAt).getTime())?`Image captured: ${new Date(image.capturedAt).toISOString().slice(0,10)} (UTC)`:'Image capture date: unknown.'),image&&'Image association supplied by the user; place visibility is not confirmed.'].filter(Boolean).join('\n');
}
