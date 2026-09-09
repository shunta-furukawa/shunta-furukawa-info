import * as T from './vendor/three.module.js';
import {REFERENCE_FACE as F} from './avatar-reference.js';

// A sampled surface with a known outward direction. Keeping this explicit avoids
// both twisting hair sections and accidental back-facing garment panels.
export function surfaceGeometry(sample,rows=32,columns=24,outward=null){
 const positions=[],uv=[],indices=[];
 for(let i=0;i<=rows;i++)for(let j=0;j<=columns;j++){const p=sample(i/rows,j/columns);positions.push(p.x,p.y,p.z);uv.push(j/columns,i/rows);}
 let reverse=false;
 if(outward){const a=sample(.47,.47),du=sample(.48,.47).sub(a),dv=sample(.47,.48).sub(a);reverse=du.cross(dv).dot(outward)<0;}
 for(let i=0;i<rows;i++)for(let j=0;j<columns;j++){const a=i*(columns+1)+j,b=a+columns+1;if(reverse)indices.push(a,a+1,b,a+1,b+1,b);else indices.push(a,b,a+1,a+1,b,b+1);}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();return geo;
}

// Keep the established upper face, but give the lower face its own silhouette:
// broad cheeks, a softened jaw corner, diagonal jawline and a rounded chin tip.
// Points are [height, half-width]; matching tangents avoid visible corners.
function cranialWidth(y){const v=(y-.035)/.535,t=T.MathUtils.clamp((v+1)/.8,0,1);return .535*(.76+.24*t*t*(3-2*t))*Math.sqrt(Math.max(0,1-v*v));}
const jawStart=cranialWidth(-.14);
const jawCurves=[
 [[-.14,jawStart],[-.19,jawStart-.024],[-.245,.472],[-.29,.418]],
 [[-.29,.418],[-.335,.364],[-.433,.203],[-.475,.11]],
 [[-.475,.11],[-.491,.0746],[-.50,.045],[-.50,0]]
].map(points=>new T.CubicBezierCurve(...points.map(p=>new T.Vector2(...p))));
export function faceWidth(y){
 if(y>=-.14)return cranialWidth(y);if(y<=-.50)return 0;
 const curve=jawCurves.find(c=>y>=c.v3.x);let lo=0,hi=1;
 for(let i=0;i<24;i++){const mid=(lo+hi)*.5;if(curve.getPoint(mid).x>y)lo=mid;else hi=mid;}
 return curve.getPoint((lo+hi)*.5).y;
}
function jawSection(y){
 const t=T.MathUtils.clamp((-.14-y)/.36,0,1),blend=t*t*(3-2*t),v=(y-.035)/.535;
 // Move the underside forward into a chin, rather than collapsing the bottom
 // of a sphere back into the neck. The front remains continuous with the lips.
 return {center:.035+.205*blend,front:.435*Math.sqrt(Math.max(0,1-v*v))*(1-.45*blend),back:.43*Math.sqrt(Math.max(0,1-v*v))*(1-.45*blend)};
}
// Nose, cheeks, eye sockets and chin belong to one continuous face surface.
export function faceZ(x,y){
 const w=faceWidth(y),section=jawSection(y),round=w>1e-8?Math.sqrt(Math.max(0,1-(x/w)**2)):0,gauss=(a,b,sx,sy)=>Math.exp(-(((x-a)/sx)**2+((y-b)/sy)**2));
 return section.center+section.front*round+.044*gauss(0,-.095,.07,.125)+.012*(gauss(.24,-.11,.13,.12)+gauss(-.24,-.11,.13,.12))-.016*(gauss(F.eyeCenterX,F.eyeCenterY,.16,.13)+gauss(-F.eyeCenterX,F.eyeCenterY,.16,.13));
}
export function faceGeometry(){
 const geo=new T.SphereGeometry(1,64,48),p=geo.attributes.position;
 for(let i=0;i<p.count;i++){
  const y=.035+p.getY(i)*.535,ring=Math.hypot(p.getX(i),p.getZ(i)),x=ring>1e-8?p.getX(i)/ring*faceWidth(y):0,section=jawSection(y);
  const z=p.getZ(i)>=0?faceZ(x,y):section.center+(ring>1e-8?p.getZ(i)/ring*section.back:0);p.setXYZ(i,x,y,z);
 }
 geo.computeVertexNormals();return geo;
}
export function facePatch(cx,cy,rx,ry,depth=.006,almond=false){
 return surfaceGeometry((r,t)=>{const a=t*Math.PI*2,x=cx+Math.cos(a)*rx*r,y=cy+Math.sin(a)*ry*r*(almond?(.72+.28*Math.abs(Math.sin(a))):1);return new T.Vector3(x,y,faceZ(x,y)+depth);},8,40,new T.Vector3(0,0,1));
}

// A thin, cranial-surface-following lock, with a broad root and a sharp tip.
// Unlike a swept tube, its thickness is independent from its silhouette width.
export function hairLock(points,width,depth=.024,outward=[0,0,1]){
 const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),out=new T.Vector3(...outward).normalize();
 function sample(u,v,lift=0){
  const p=curve.getPoint(u),t=curve.getTangent(u),across=new T.Vector3().crossVectors(out,t).normalize();
  const span=width*(.64+.40*Math.sin(Math.PI*u))*(1-u)**.62+.0006,cross=(v-.5)*2;
  return p.addScaledVector(across,cross*span).addScaledVector(out,(depth*(1-cross*cross)-.065*cross*cross+lift)*Math.sin(Math.PI*(.12+.88*u)));
 }
 const geometry=surfaceGeometry(sample,32,12,out);return {geometry,sample,out};
}

// Soft, varying cross sections along a limb. They can also provide fitted panels
// (sleeve stripes, cuffs) without separate box-shaped parts sticking out.
export function fabricTube(points,widths,depths,{fold=.008,segments=28}={}){
 const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
 const profile=values=>new T.SplineCurve(values.map((v,i)=>new T.Vector2(i/(values.length-1),v)));
 const wp=profile(widths),dp=profile(depths);
 function sample(u,v,lift=0){
  const center=curve.getPoint(u),t=curve.getTangent(u),n=new T.Vector3(1,0,0).addScaledVector(t,-t.x).normalize(),b=new T.Vector3().crossVectors(t,n),a=v*Math.PI*2;
  const crease=fold*Math.sin(u*Math.PI*7+a*2)*Math.sin(Math.PI*u),rx=wp.getPoint(u).y+crease+lift,rz=dp.getPoint(u).y+crease+lift;
  return center.addScaledVector(n,Math.cos(a)*rx).addScaledVector(b,Math.sin(a)*rz);
 }
 // Parameter order is circumferential then longitudinal to keep normals outside.
 const geometry=surfaceGeometry((v,u)=>sample(u,v),32,segments);
 const caps=[0,1].map(end=>surfaceGeometry((r,v)=>curve.getPoint(end).lerp(sample(end,v),r),1,segments,curve.getTangent(end).multiplyScalar(end?1:-1)));
 return {geometry,sample,caps};
}

// A rounded upper lid, a shallower lower lid and mirrored inner/outer corners.
// This is intentionally asymmetric vertically; a scaled circle/almond loses the likeness.
const eyeCurves=[
 [[-1,-.08],[-.94,.54],[-.52,.99],[-.06,1]],
 [[-.06,1],[.53,1.02],[.96,.63],[1,.02]],
 [[1,.02],[.92,-.57],[.45,-.85],[.02,-.85]],
 [[.02,-.85],[-.48,-.85],[-.90,-.57],[-1,-.08]]
].map(points=>new T.CubicBezierCurve(...points.map(p=>new T.Vector2(...p))));
export function referenceEyeOutline(t){const q=Math.min(3.999999,t*4),i=Math.floor(q);return eyeCurves[i].getPoint(q-i);}
export function referenceEyePatch(cx,cy,side,scale=1,depth=.006){
 return surfaceGeometry((r,t)=>{const q=referenceEyeOutline(t),x=cx+side*q.x*F.eyeWidth*.5*scale*r,y=cy+q.y*F.eyeHeight/1.85*scale*r;return new T.Vector3(x,y,faceZ(x,y)+depth);},8,48,new T.Vector3(0,0,1));
}

// Only the upper edge has a dark eyelid. A tapered ribbon follows that edge;
// no enlarged dark eye-shaped backing can leak out around the lower sclera.
export function referenceUpperLidPatch(cx,cy,side){
 return surfaceGeometry((u,v)=>{
  const t=u*.5,q=referenceEyeOutline(t),a=referenceEyeOutline(Math.max(0,t-.0001)),b=referenceEyeOutline(Math.min(.5,t+.0001));
  const normal=new T.Vector2(-(b.y-a.y)*F.eyeHeight/1.85,(b.x-a.x)*F.eyeWidth*.5).normalize();
  const width=.014*Math.sin(Math.PI*u)**.65*(.75+.25*u),x=cx+side*(q.x*F.eyeWidth*.5+normal.x*width*v),y=cy+q.y*F.eyeHeight/1.85+normal.y*width*v;
  return new T.Vector3(x,y,faceZ(x,y)+.012);
 },48,2,new T.Vector3(0,0,1));
}

// Clip both the iris and pupil to the opening. The iris can meet the unlined
// lower edge naturally, but never spill onto the cheek or form a black border.
export function referenceIrisPatch(cx,cy,side,{rx=F.irisRadiusX,ry=F.irisRadiusY,depth=.008}={}){
 const boundary=Array.from({length:64},(_,i)=>{const p=referenceEyeOutline(i/64);return [cx+p.x*F.eyeWidth*.5,cy+p.y*F.eyeHeight/1.85];});
 let polygon=Array.from({length:48},(_,i)=>{const a=i/48*Math.PI*2;return [cx-F.irisOffset+Math.cos(a)*rx,cy+.005+Math.sin(a)*ry];});
 const cross=(a,b,p)=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
 for(let i=0;i<boundary.length;i++){
  const a=boundary[i],b=boundary[(i+1)%boundary.length],input=polygon;polygon=[];if(!input.length)break;
  for(let j=0;j<input.length;j++){const p=input[j],q=input[(j+1)%input.length],dp=cross(a,b,p),dq=cross(a,b,q),inside=dp<=1e-10,next=dq<=1e-10;
   if(inside)polygon.push(p);if(inside!==next){const t=dp/(dp-dq);polygon.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t]);}
  }
 }
 const center=polygon.reduce((sum,p)=>[sum[0]+p[0]/polygon.length,sum[1]+p[1]/polygon.length],[0,0]);
 return surfaceGeometry((r,t)=>{const q=t*polygon.length,i=Math.min(polygon.length-1,Math.floor(q)),a=polygon[i],b=polygon[(i+1)%polygon.length],f=q-i,px=center[0]+(a[0]+(b[0]-a[0])*f-center[0])*r,x=cx+side*(px-cx),y=center[1]+(a[1]+(b[1]-a[1])*f-center[1])*r;return new T.Vector3(x,y,faceZ(x,y)+depth);},8,64,new T.Vector3(0,0,1));
}
