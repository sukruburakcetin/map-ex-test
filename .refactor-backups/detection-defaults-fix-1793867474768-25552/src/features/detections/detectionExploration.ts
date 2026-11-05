/** Image detection exploration is independent of map sprite visibility and export. */
export const detectionGroups = ['signs','objects','vehicles','people','markings','structures','other','background'] as const;
export type DetectionGroup = typeof detectionGroups[number];
export type DetectionLabelMode = 'focus' | 'all';
export interface DetectionExplorerOptions { mode: 'filtered' | 'explore'; groups: DetectionGroup[]; labelMode: DetectionLabelMode; }
export interface DetectionSummary { total:number; shown:number; counts:Partial<Record<DetectionGroup,number>>; loading?:boolean; error?:boolean; }
export const defaultDetectionExplorer:DetectionExplorerOptions={mode:'filtered',groups:['signs','objects','vehicles','people','markings','structures','other'],labelMode:'focus'};
export const detectionGroupNames:Record<DetectionGroup,string>={signs:'Traffic signs',objects:'Street objects',vehicles:'Vehicles',people:'People',markings:'Road markings',structures:'Structures',other:'Other',background:'Background'};
export function detectionGroup(value:string,knownSigns?:ReadonlySet<string>):DetectionGroup {
 const parts=value.split('--');
 if(knownSigns?.has(value)||['regulatory','warning','information','complementary','traffic-sign'].includes(parts[0]))return 'signs';
 if(parts[0]==='human'||parts[0]==='person')return 'people';
 if(parts[0]==='vehicle'||parts[1]==='vehicle')return 'vehicles';
 if(parts[0]==='nature'||parts[0]==='void'||parts[0]==='unlabeled'||parts[1]==='sky'||parts[1]==='terrain'||parts[1]==='vegetation'||parts[1]==='wire'||parts[1]==='wire-group')return 'background';
 if(parts[0]==='construction'&&((parts[1]==='flat'&&['road','sidewalk','parking','rail-track'].includes(parts[2]))||(parts[1]==='structure'&&['building','bridge','tunnel'].includes(parts[2]))))return 'background';
 if(parts[0]==='marking')return 'markings';
 if(parts[0]==='construction')return 'structures';
 if(parts[0]==='object')return 'objects';
 return 'other';
}
export function showDetection(value:string,group:DetectionGroup,options:DetectionExplorerOptions,filters:{signs:boolean;objects:boolean;signCode?:string;objectCode?:string;knownObjects:ReadonlySet<string>}):boolean {
 if(options.mode==='explore')return options.groups.includes(group);
 if(group==='signs')return filters.signs&&(!filters.signCode||filters.signCode==='All traffic signs'||filters.signCode===value);
 return filters.objects&&filters.knownObjects.has(value)&&(!filters.objectCode||filters.objectCode==='All points'||filters.objectCode===value);
}
