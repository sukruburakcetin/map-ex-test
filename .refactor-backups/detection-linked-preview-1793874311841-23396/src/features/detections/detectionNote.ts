/** A 2D detection does not establish the object's ground location. Map location is user-picked. */
export interface DetectionNoteSelection { imageId:string; detectionId:string; title:string; }
export type DetectionNoteDestination='local'|'enterprise'|'workspace';
export interface DetectionContributionSeed extends DetectionNoteSelection { requestId:string;lon:number;lat:number; }
export function detectionNoteDescription(seed:DetectionNoteSelection):string {
 return `Detected object: ${seed.title}\nMapillary image: ${seed.imageId}\nDetection ID: ${seed.detectionId}`;
}
export function validDetectionNoteLocation(point:{lon:number;lat:number}):boolean {
 return Number.isFinite(point.lon)&&Number.isFinite(point.lat)&&Math.abs(point.lon)<=180&&Math.abs(point.lat)<=90;
}
