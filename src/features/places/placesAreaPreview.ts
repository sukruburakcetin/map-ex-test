/** Builder preview in the map's own DOM realm. No map layers or camera changes. */
export type PlacesAreaPreviewState='visible'|'inside'|'outside'|'unavailable';
export interface AreaPreviewProjection { points:{x:number;y:number}[];width:number;height:number;state:PlacesAreaPreviewState }
function inside(point:{x:number;y:number},polygon:{x:number;y:number}[]):boolean {
  let result=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
    const a=polygon[i],b=polygon[j];
    if((a.y>point.y)!==(b.y>point.y)&&point.x<(b.x-a.x)*(point.y-a.y)/(b.y-a.y)+a.x)result=!result;
  }
  return result;
}
function crosses(a:{x:number;y:number},b:{x:number;y:number},width:number,height:number):boolean {
  // Liang–Barsky segment clipping: check the real boundary, not just its bbox.
  const dx=b.x-a.x,dy=b.y-a.y,p=[-dx,dx,-dy,dy],q=[a.x,width-a.x,a.y,height-a.y];let low=0,high=1;
  for(let i=0;i<4;i++){
    if(p[i]===0){if(q[i]<0)return false;continue;}
    const t=q[i]/p[i];if(p[i]<0)low=Math.max(low,t);else high=Math.min(high,t);
    if(low>high)return false;
  }
  return true;
}
export function projectPlacesArea(view:any,extent:any):AreaPreviewProjection {
  const empty:AreaPreviewProjection={points:[],width:0,height:0,state:'unavailable'};
  const width=Number(view?.width),height=Number(view?.height);
  if(view?.destroyed||view?.type!=='2d'||!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0||typeof view.toScreen!=='function')return empty;
  if(![extent?.xmin,extent?.ymin,extent?.xmax,extent?.ymax].every(Number.isFinite))return empty;
  const template=extent.center||view.center;
  const points=[ [extent.xmin,extent.ymin],[extent.xmax,extent.ymin],[extent.xmax,extent.ymax],[extent.xmin,extent.ymax] ].map(([x,y])=>{
    const point=typeof template?.clone==='function'?template.clone():{};
    point.x=x;point.y=y;point.spatialReference=extent.spatialReference;
    const pixel=view.toScreen(point);return {x:Number(pixel?.x),y:Number(pixel?.y)};
  });
  if(points.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)))return empty;
  const visible=points.some((p,i)=>crosses(p,points[(i+1)%4],width,height));
  const state:PlacesAreaPreviewState=visible?'visible':inside({x:width/2,y:height/2},points)?'inside':'outside';
  return {points,width,height,state};
}
export function createPlacesAreaPreview(view:any,extent:any,options:{labels:Record<PlacesAreaPreviewState,string>;onState?(state:PlacesAreaPreviewState):void}) {
  const container=typeof view?.container==='string'?globalThis.document?.getElementById(view.container):view?.container;
  const doc:Document|undefined=container?.ownerDocument;
  if(!doc || !container?.appendChild)throw Error('The map preview container is unavailable.');
  const host=doc.createElement('div');host.setAttribute('data-mly-places-area-preview','');host.setAttribute('aria-hidden','true');
  Object.assign(host.style,{position:'absolute',inset:'0',pointerEvents:'none',zIndex:'10000',overflow:'hidden'});
  const svg=doc.createElementNS('http://www.w3.org/2000/svg','svg');
  Object.assign(svg.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',overflow:'hidden'});
  const halo=doc.createElementNS(svg.namespaceURI,'path'),path=doc.createElementNS(svg.namespaceURI,'path');
  for(const line of [halo,path]){line.setAttribute('vector-effect','non-scaling-stroke');line.setAttribute('stroke-linejoin','round');svg.appendChild(line);}
  halo.setAttribute('fill','none');halo.setAttribute('stroke','#ffffff');halo.setAttribute('stroke-width','10');
  path.setAttribute('fill','rgba(35,130,80,0.035)');path.setAttribute('stroke','#08603c');path.setAttribute('stroke-width','4');path.setAttribute('stroke-dasharray','12 7');
  const badge=doc.createElement('div');
  Object.assign(badge.style,{position:'absolute',left:'10px',bottom:'10px',maxWidth:'calc(100% - 20px)',padding:'4px 7px',border:'1px solid #9bdbb7',borderRadius:'4px',background:'#173e2d',color:'#f1fff6',font:'12px system-ui,sans-serif',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',pointerEvents:'none'});
  host.append(svg,badge);
  let destroyed=false,last:PlacesAreaPreviewState|undefined;const handles:any[]=[];
  const publish=(state:PlacesAreaPreviewState)=>{badge.textContent=options.labels[state];if(last!==state){last=state;options.onState?.(state);}return state;};
  const refresh=():PlacesAreaPreviewState=>{
    if(destroyed)return 'unavailable';
    const root=container.querySelector?.('.esri-view-root')||container;
    if(host.parentNode!==root)root.appendChild(host);
    const rect=root.getBoundingClientRect?.();
    if(view.destroyed||root.isConnected===false||rect&&(rect.width<=0||rect.height<=0)){svg.style.visibility='hidden';return publish('unavailable');}
    try{
      const projection=projectPlacesArea(view,extent);
      if(projection.state==='unavailable'){svg.style.visibility='hidden';return publish('unavailable');}
      svg.style.visibility='visible';svg.setAttribute('viewBox','0 0 '+projection.width+' '+projection.height);
      const d=projection.points.map((p,i)=>(i===0?'M':'L')+p.x+' '+p.y).join(' ')+' Z';
      halo.setAttribute('d',d);path.setAttribute('d',d);
      return publish(projection.state);
    }catch(_error){svg.style.visibility='hidden';return publish('unavailable');}
  };
  for(const property of ['extent','width','height','rotation','padding','destroyed'])if(typeof view.watch==='function')handles.push(view.watch(property,refresh));
  try{refresh();}catch(error){for(const h of handles)h?.remove?.();host.remove();throw error;}
  return {refresh,destroy(){if(destroyed)return;destroyed=true;for(const h of handles)h?.remove?.();host.remove();}};
}
