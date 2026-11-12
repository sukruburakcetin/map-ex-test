/** Administrator-only area preparation. No data fetches or credentials in profiles. */
export interface PlacesAreaProfile {
  schema:'mapillary-places-area-v1'; name:string; bbox:[number,number,number,number];
  source:'portal'|'external'; release:'latest'; output_directory:string; max_features:number;
}
export function placesAreaSlug(name:string):string {
  return name.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)||'places-area';
}
export function placesAreaProfile(name:string,bbox:readonly number[],source:'portal'|'external'):PlacesAreaProfile {
  name=name.trim();
  if(!name || name.length>80)throw Error('Give the area a name of up to 80 characters.');
  if(!['portal','external'].includes(source)||bbox.length!==4||!bbox.every(Number.isFinite))throw Error('The map area is invalid.');
  const [w,s,e,n]=bbox;
  if(w < -180||e>180||w>=e||s < -85.051129||n>85.051129||s>=n)throw Error('Choose a smaller area within one side of the date line.');
  return {schema:'mapillary-places-area-v1',name,bbox:[w,s,e,n],source,release:'latest',output_directory:'places-data/'+placesAreaSlug(name)+'/'+source,max_features:25000};
}
function visibleAreaMap(view:any):boolean {
  if(!view||view.destroyed)return false;
  let element=view.container;
  // Builder can retain an active-but-hidden preview. Check its actual frame too.
  if(!element || typeof element==='string' || typeof element.getBoundingClientRect!=='function')return true;
  for(let depth=0;element&&depth<5;depth++){
    const rect=element.getBoundingClientRect();
    if(element.isConnected===false||rect.width<=0||rect.height<=0)return false;
    const win=element.ownerDocument?.defaultView,style=win?.getComputedStyle?.(element);
    if(style&&(style.display==='none'||style.visibility==='hidden'||style.opacity==='0'))return false;
    element=win?.frameElement;
  }
  return true;
}
export function activePlacesAreaView(group:any):any|null {
  const direct=typeof group?.getActiveJimuMapView==='function'?group.getActiveJimuMapView():null;
  if(direct?.view&&visibleAreaMap(direct.view))return direct.view;
  const views:any[]=Object.values(group?.jimuMapViews||{}).filter((v:any)=>visibleAreaMap(v?.view));
  const active=views.find(v=>group?.activeViewId&&v.id===group.activeViewId||v.isActive===true);
  if(active?.view)return active.view;
  return views.length===1?views[0]?.view||null:null;
}
export function placesAreaExtent(view:any,geographic:(extent:any)=>any):[number,number,number,number] {
  if(!view?.ready||view.destroyed||view.type!=='2d'||!view.stationary||!view.extent)throw Error('Frame the area in a ready 2D map, then try again.');
  const extent=view.extent,reference=extent.spatialReference;
  const wkid=reference?.latestWkid||reference?.wkid;
  if(![4326,3857,102100,102113].includes(wkid))throw Error('Use a WGS84 or Web Mercator map to select the area.');
  const value=wkid===4326?extent:geographic(extent);
  const bbox:[number,number,number,number]=[value?.xmin,value?.ymin,value?.xmax,value?.ymax];
  return placesAreaProfile('Area',bbox,'portal').bbox;
}

