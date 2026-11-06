import type { Place } from './placesModel';
import type { DetectionContributionSeed } from '../detections/detectionNote';
export type PlaceNoteDestination='local'|'enterprise'|'workspace';
export interface PlaceContributionSeed {requestId:string;placeId:string;title:string;description:string;lon:number;lat:number;imageId:null}
export type ExternalContributionSeed=DetectionContributionSeed|PlaceContributionSeed;
export function placeNoteDescription(place:Place):string {
 return [`Place: ${place.name}`,`Overture ID: ${place.id}`,`Category: ${place.category.replace(/_/g,' ')}`,place.address&&`Address: ${place.address}`,place.website&&`Website: ${place.website}`,place.release&&`Overture release: ${place.release}`].filter(Boolean).join('\n');
}
