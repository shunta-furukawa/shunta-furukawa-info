import assert from 'node:assert/strict';
import * as T from '../themes/shunta-furukawa-info/assets/js/vendor/three.module.js';
import {createAvatar} from '../themes/shunta-furukawa-info/assets/js/explorer-avatar.js';
import {REFERENCE_FACE as F} from '../themes/shunta-furukawa-info/assets/js/avatar-reference.js';
import {referenceEyeOutline} from '../themes/shunta-furukawa-info/assets/js/avatar-surfaces.js';

function projectedArea(geometry){
 const p=geometry.attributes.position,index=geometry.index;let area=0;
 for(let i=0;i<index.count;i+=3){const a=index.getX(i),b=index.getX(i+1),c=index.getX(i+2);area+=Math.abs((p.getX(b)-p.getX(a))*(p.getY(c)-p.getY(a))-(p.getY(b)-p.getY(a))*(p.getX(c)-p.getX(a)))*.5;}
 return area;
}

const measured=[];
createAvatar({onHeadBuilt({head,face,eyeDetails}){
 for(const {side,sclera,iris,pupil,lid,glint} of eyeDetails){
  const parts=[face,sclera,iris,pupil,lid,glint],cx=side*F.eyeCenterX,cy=F.eyeCenterY;
  function hit(x,y){
   const origin=new T.Vector3(x,y,2).applyMatrix4(head.matrixWorld),direction=new T.Vector3(0,0,-1).transformDirection(head.matrixWorld);
   return new T.Raycaster(origin,direction).intersectObjects(parts,false)[0]?.object;
  }
  // This would hit the old black backing around the entire bottom perimeter.
  // Now the outside of the lower opening is uninterrupted skin on both eyes.
  for(const t of [.56,.64,.72,.80,.88,.96]){
   const p=referenceEyeOutline(t),a=referenceEyeOutline(t-.001),b=referenceEyeOutline(t+.001),out=new T.Vector2(-(b.y-a.y)*F.eyeHeight/1.85,(b.x-a.x)*F.eyeWidth*.5).normalize();
   assert.equal(hit(cx+side*(p.x*F.eyeWidth*.5+out.x*.005),cy+p.y*F.eyeHeight/1.85+out.y*.005),face,'no dark outline below the eye');
  }
  // The white crescents stay visible beside the iris; the top rim is
  // a separate lid, not a black border framing the entire opening.
  for(const localX of [-.427,.433])assert.ok(hit(cx+side*localX*F.eyeWidth,cy-.004)===sclera,'white at the corners');
  assert.equal(hit(cx-side*F.irisOffset,cy),pupil,'dark center of the iris');
  const q=referenceEyeOutline(.25);assert.equal(hit(cx+side*q.x*F.eyeWidth*.5,cy+q.y*F.eyeHeight/1.85+.004),lid,'upper lid remains visible');
  const irisShare=projectedArea(iris.geometry)/projectedArea(sclera.geometry),glintShare=projectedArea(glint.geometry)/projectedArea(iris.geometry);
  assert.ok(irisShare>.70&&irisShare<.80,`dark iris / opening: ${irisShare}`);
  assert.ok(glintShare>.007&&glintShare<.015,`small catchlight / iris: ${glintShare}`);
  const glints=head.children.filter(child=>child.name===`eye-${side}-catchlight`);assert.equal(glints.length,1,'one catchlight per eye');
  const box=new T.Box3().setFromBufferAttribute(glint.geometry.attributes.position),center=box.getCenter(new T.Vector3());
  assert.ok(center.x<cx-side*F.irisOffset&&center.y>cy,'same upper-left light direction in both eyes');
  for(const part of [sclera,iris,pupil,lid,glint]){assert.equal(part.castShadow,false);assert.equal(part.receiveShadow,false);}
  for(const part of [sclera,iris,pupil,lid])assert.ok(part.material.isMeshLambertMaterial,'no specular spots in addition to the designed catchlight');
  measured.push({side,irisShare,glintShare});
 }
}});
console.log('Eyes: no lower outline, visible white corners, upper lid, dark iris coverage and one small catchlight passed.',measured);
