import assert from 'node:assert/strict';
import * as T from '../themes/shunta-furukawa-info/assets/js/vendor/three.module.js';
import {createAvatar} from '../themes/shunta-furukawa-info/assets/js/explorer-avatar.js';
import {REFERENCE_FACE as F} from '../themes/shunta-furukawa-info/assets/js/avatar-reference.js';
import {faceZ,referenceEyeOutline,referenceIrisPatch} from '../themes/shunta-furukawa-info/assets/js/avatar-surfaces.js';

// Check the built geometry in a front projection, not merely the input constants.
// Ranges reflect the new front-view crop: smaller eyes and more cheek margin.
let measured;
createAvatar({onHeadBuilt({head,face,eyes,hair}){
 const faceBox=new T.Box3().setFromObject(face),hairBox=new T.Box3().setFromObject(hair),faceWidth=faceBox.max.x-faceBox.min.x;
 const boxes=eyes.map(eye=>new T.Box3().setFromObject(eye)),centers=boxes.map(b=>b.getCenter(new T.Vector3()));
 const eyeWidth=boxes[0].max.x-boxes[0].min.x,eyeHeight=boxes[0].max.y-boxes[0].min.y,line=new T.Vector3(0,F.eyeCenterY,0).applyMatrix4(head.matrixWorld);
 measured={eyeWidth:eyeWidth/faceWidth,eyeAspect:eyeHeight/eyeWidth,eyeSpacing:(centers[1].x-centers[0].x)/faceWidth,eyeFromChin:(line.y-faceBox.min.y)/faceWidth,hairWidth:(hairBox.max.x-hairBox.min.x)/faceWidth,crownAboveEyes:(hairBox.max.y-line.y)/faceWidth};
 for(const [name,min,max] of [['eyeWidth',.23,.25],['eyeAspect',.79,.85],['eyeSpacing',.445,.475],['eyeFromChin',.46,.50],['hairWidth',1.52,1.64],['crownAboveEyes',.89,1.02]])assert.ok(measured[name]>=min&&measured[name]<=max,`${name}: ${measured[name]}`);
 // Hair volume must not place the scalp in front of either pupil. Test straight
 // on and slightly from above, the two viewpoints used by the reference sheet.
 for(const tilt of [0,.2])for(const side of [-1,1]){
  const x=side*(F.eyeCenterX-F.irisOffset),y=F.eyeCenterY+.005,target=new T.Vector3(x,y,faceZ(x,y)+.004).applyMatrix4(head.matrixWorld),out=new T.Vector3(0,tilt,1).normalize(),ray=new T.Raycaster(target.clone().addScaledVector(out,3),out.clone().negate());
  const eyeHit=ray.intersectObjects(eyes,false)[0],hairHit=ray.intersectObject(hair,true)[0];assert.ok(eyeHit,'eye exists on its sightline');assert.ok(!hairHit||eyeHit.distance<hairHit.distance,'hair leaves the pupil visible');
 }
}});
for(const side of [-1,1]){
 const x=side*F.eyeCenterX,y=F.eyeCenterY,iris=referenceIrisPatch(x,y,side),p=iris.attributes.position;
 const outline=Array.from({length:64},(_,i)=>{const q=referenceEyeOutline(i/64);return [x+q.x*F.eyeWidth*.5,y+q.y*F.eyeHeight/1.85];});
 for(let i=0;i<p.count;i++){
  const px=x+side*(p.getX(i)-x),py=p.getY(i);assert.ok(Number.isFinite(p.getZ(i)));
  for(let j=0;j<outline.length;j++){const a=outline[j],b=outline[(j+1)%outline.length];assert.ok((b[0]-a[0])*(py-a[1])-(b[1]-a[1])*(px-a[0])<1e-6,'iris stays within the lid');}
 }
}
console.log('Reference: projected eye/face and hair/face ratios, mirrored lids, clipped irises and unobstructed pupils passed.',measured);
