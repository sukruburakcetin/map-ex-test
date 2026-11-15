/** Beveled, closed local-metre solids in one Mesh, with per-component materials. */
export function nativeCurrentImageMesh(lon:number,lat:number,z:number,scale:number,radius:number,spread:number,heading:number,marker:boolean,fan:boolean,color:number[]=[0,255,0,1]) {
 const position:number[]=[],components:any[]=[];
 const section=(inner:number,outer:number,start:number,end:number,n:number,rgba:number[],height:(r:number)=>number)=>{
  const faces:number[]=[],base=position.length/3,full=Math.abs(end-start-360)<.001;
  for(let i=0;i<=n;i++){
   const a=(start+(end-start)*i/n)*Math.PI/180;
   for(const [r,h]of[[inner,height(inner)],[outer,height(outer)],[inner,.1],[outer,.1]])position.push(scale*r*Math.sin(a),scale*r*Math.cos(a),scale*h);
  }
  for(let i=0;i<n;i++){
   const a=base+i*4,b=a+4;
   if(inner>0)faces.push(a,b,b+1,a,b+1,a+1,a+2,b+3,b+2,a+2,a+3,b+3,a,b+2,b,a,a+2,b+2);
   else faces.push(a,b+1,a+1,a+2,a+3,b+3);
   faces.push(a+1,b+1,a+3,b+1,b+3,a+3);
  }
  if(!full){const a=base,b=base+n*4;faces.push(a,a+1,a+2,a+1,a+3,a+2,b,b+2,b+1,b+1,b+2,b+3);}
  components.push({faces,shading:'flat',material:{color:rgba,alphaMode:rgba[3]<1?'blend':'opaque',doubleSided:false}});
 };
 if(marker){
  section(0,5.2,0,360,32,color,()=>2.2);
  section(5.2,6,0,360,32,color,r=>2.2-(r-5.2)*1.3125);
  const bevel=components.pop();components[0].faces.push(...bevel.faces);
  section(6,8,0,360,32,[255,255,255,1],r=>1.15-(r-6)*.2);
 }
 if(fan){
  const height=(r:number)=>.4+Math.min(8,Math.max(0,r-8.5)*.2),edge=Math.max(8.5,radius-.8);
  section(8.5,edge,heading-spread/2,heading+spread/2,20,[255,179,0,.85],height);
  section(edge,radius,heading-spread/2,heading+spread/2,20,[255,153,0,1],height);
 }
 return {spatialReference:{wkid:4326},vertexSpace:{type:'local',origin:[lon,lat,z]},vertexAttributes:{position},components};
}
