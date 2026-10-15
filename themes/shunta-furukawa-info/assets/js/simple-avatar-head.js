import * as T from './vendor/three.module.js';
import {surfaceGeometry,hairLock} from './avatar-surfaces.js';

// Graphic shapes, rather than anatomical features: the head stays recognizable
// at map scale and does not pick up skin highlights under the plaza lights.
export function createSimpleHead(){
 const head=new T.Group(),hair=new T.Group(),eyes=[],ears=[];
 const white=new T.MeshBasicMaterial({color:0xf5f3f5});
 const black=new T.MeshBasicMaterial({color:0x17171f,side:T.DoubleSide});
 function mesh(parent,geometry,material,name){
  const part=new T.Mesh(geometry,material);part.name=name;parent.add(part);return part;
 }
 function oval(parent,material,name,x,y,z,sx,sy,sz){
  const part=mesh(parent,new T.SphereGeometry(1,24,16),material,name);
  part.position.set(x,y,z);part.scale.set(sx,sy,sz);return part;
 }
 const face=oval(head,white,'simple-face',0,.025,0,.535,.565,.445);
 // The same smooth ellipsoid fits the face marks: no nose, sockets or lip relief.
 const frontZ=(x,y)=>.445*Math.sqrt(Math.max(0,1-(x/.535)**2-((y-.025)/.565)**2));
 function mark(name,cx,cy,rx,ry){
  return mesh(head,surfaceGeometry((r,t)=>{
   const a=t*Math.PI*2,x=cx+Math.cos(a)*rx*r,y=cy+Math.sin(a)*ry*r;
   return new T.Vector3(x,y,frontZ(x,y)+.006);
  },4,24,new T.Vector3(0,0,1)),black,name);
 }
 for(const side of [-1,1]){
  eyes.push(mark(`eye-${side}`,side*.205,-.015,.049,.068));
  const ear=oval(head,white,`ear-${side}`,side*.527,-.045,-.015,.075,.12,.07);
  ears.push({side,ear});
 }
 const smilePoints=[[-.115,-.205],[-.06,-.238],[0,-.249],[.06,-.238],[.115,-.205]];
 const smile=new T.CatmullRomCurve3(smilePoints.map(([x,y])=>new T.Vector3(x,y,frontZ(x,y)+.008)));
 mesh(head,new T.TubeGeometry(smile,20,.012,6,false),black,'simple-smile');
 head.add(hair);
 // One continuous cap and two broad swept shapes. No strand ridges, highlights,
 // ear bowls or separate back locks; the silhouette carries the hairstyle.
 const cap=surfaceGeometry((u,v)=>{
  const phi=v*Math.PI*2,front=Math.sin(phi),edge=front>0?1.52-.18*front:1.52-.64*front,theta=u*edge;
  return new T.Vector3(-Math.cos(phi)*Math.sin(theta)*.59,.14+Math.cos(theta)*.68,-.035+Math.sin(phi)*Math.sin(theta)*.49);
 },20,36);
 mesh(hair,cap,black,'hair-cap');
 const sweeps=[
  {points:[[.43,.53,.25],[.20,.53,.44],[-.15,.36,.50],[-.53,.20,.30]],width:.16},
  {points:[[.24,.68,.12],[-.04,.72,.26],[-.32,.57,.37],[-.58,.42,.18]],width:.12}
 ];
 sweeps.forEach(({points,width},i)=>mesh(hair,hairLock(points,width,.025).geometry,black,`hair-sweep-${i}`));
 return {head,face,eyes,hair,ears};
}
