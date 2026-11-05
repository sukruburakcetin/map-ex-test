/** Text-only companion to SDK polygon tags, whose text renderer excludes spherical cameras.
 * Uses public basic-image projection, not map coordinates or private SDK renderers. */
export interface PanoramaLabel { text: string; point: number[]; target?: boolean; }
export interface LabelViewer {
 projectFromBasic(point: number[]): Promise<number[] | null>;
 on(event: any, callback: () => void): void;
 off(event: any, callback: () => void): void;
}
export class PanoramaDetectionLabels {
 private root: HTMLDivElement;
 private nodes: HTMLSpanElement[];
 private disposed=false;
 private visible=true;
 private frame=0;
 private busy=false;
 private dirty=false;
 private revision=0;
 private observer: ResizeObserver | null=null;
 private events=['pov','fov','bearing','position'];
 constructor(private viewer:LabelViewer,private container:HTMLElement,private labels:PanoramaLabel[],visible:boolean){
  this.root=container.ownerDocument.createElement('div');
  this.root.className='mly-panorama-detection-labels';
  this.root.setAttribute('aria-hidden','true');
  Object.assign(this.root.style,{position:'absolute',inset:'0',overflow:'hidden',pointerEvents:'none',zIndex:'5'});
  this.nodes=labels.map(label=>{
   const node=container.ownerDocument.createElement('span');node.textContent=label.text;
   Object.assign(node.style,{position:'absolute',display:'none',color:label.target?'#ffff00':'#ffffff',fontSize:'9px',fontFamily:'"Inter","Segoe UI",Roboto,sans-serif',fontWeight:'600',lineHeight:'1.2',whiteSpace:'nowrap',textShadow:'1px 1px 2px rgba(0,0,0,.9)',transform:'translate(-50%,-50%)'});
   this.root.appendChild(node);return node;
  });
  container.appendChild(this.root);
  for(const event of this.events)viewer.on(event,this.schedule);
  viewer.on('image',this.dispose);viewer.on('remove',this.dispose);
  const Observer=container.ownerDocument.defaultView?.ResizeObserver;
  if(Observer){this.observer=new Observer(this.schedule);this.observer.observe(container);}
  this.setVisible(visible);
 }
 setVisible(visible:boolean){
  if(this.disposed)return;this.visible=visible;this.revision++;
  this.root.style.display=visible?'block':'none';
  for(const node of this.nodes)node.style.display='none';
  if(visible)this.schedule();
 }
 private schedule=()=>{
  if(this.disposed||!this.visible)return;
  this.revision++;this.dirty=true;
  if(this.busy||this.frame)return;
  this.frame=requestAnimationFrame(()=>{this.frame=0;void this.update();});
 };
 private async update(){
  if(this.disposed||!this.visible)return;
  this.busy=true;this.dirty=false;const revision=this.revision;
  const projected=await Promise.all(this.labels.map(async label=>{
   try{return await this.viewer.projectFromBasic(label.point);}catch{return null;}
  }));
  if(!this.disposed&&this.visible&&revision===this.revision){
   const width=this.container.clientWidth,height=this.container.clientHeight;
   projected.forEach((point,index)=>{
    const node=this.nodes[index];
    if(!point||!Number.isFinite(point[0])||!Number.isFinite(point[1])||point[0]<0||point[1]<0||point[0]>width||point[1]>height){node.style.display='none';return;}
    node.style.left=`${point[0]}px`;node.style.top=`${point[1]}px`;node.style.display='block';
   });
  }
  this.busy=false;if(this.dirty)this.schedule();
 }
 dispose=()=>{
  if(this.disposed)return;this.disposed=true;this.revision++;
  if(this.frame)cancelAnimationFrame(this.frame);this.frame=0;
  this.observer?.disconnect();this.observer=null;
  for(const event of this.events)this.viewer.off(event,this.schedule);
  this.viewer.off('image',this.dispose);this.viewer.off('remove',this.dispose);
  this.root.remove();
 };
}
