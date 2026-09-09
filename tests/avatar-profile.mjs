import assert from 'node:assert/strict';
import * as T from '../themes/shunta-furukawa-info/assets/js/vendor/three.module.js';
import {createAvatar} from '../themes/shunta-furukawa-info/assets/js/explorer-avatar.js';

createAvatar({onHeadBuilt({head,face,hair,ears}){
 const vertices=face.geometry.attributes.position,rows=new Map();
 for(let i=0;i<vertices.count;i++){const y=vertices.getY(i);rows.set(y,Math.max(rows.get(y)??-Infinity,vertices.getZ(i)));}
 const profileAt=y=>[...rows].reduce((a,b)=>Math.abs(b[0]-y)<Math.abs(a[0]-y)?b:a)[1];
 const nose=profileAt(-.105),bridge=profileAt(-.025),philtrum=profileAt(-.19),lips=profileAt(-.235),fold=profileAt(-.294),chin=profileAt(-.355);
 assert.ok(nose-bridge>.025&&nose-bridge<.040,'lower nose tip still projects gently beyond the bridge');
 assert.ok(nose-lips>.08&&nose-lips<.11,'half-height nose keeps a gentle underside before the mouth');
 // The reference has a soft lower face, without separate lip/chin lobes or a
 // groove between them. Check the actual mesh from below the nose to the tip.
 const lowerRows=[...rows].filter(([y])=>y<-.19).sort((a,b)=>b[0]-a[0]);
 for(let i=1;i<lowerRows.length;i++)assert.ok(lowerRows[i][1]<lowerRows[i-1][1],'mouth-to-chin silhouette recedes smoothly without a projecting chin bump');
 assert.ok(philtrum>lips&&lips>fold&&fold>chin,'no alternating lip/chin bulges');
 // Duplicated seam and pole positions must also share their shading normals.
 const normals=face.geometry.attributes.normal,shared=new Map();
 for(let i=0;i<vertices.count;i++){
  const key=[vertices.getX(i),vertices.getY(i),vertices.getZ(i)].map(v=>Math.round(v*1e6)).join(','),normal=new T.Vector3().fromBufferAttribute(normals,i);
  if(shared.has(key))assert.ok(normal.distanceTo(shared.get(key))<1e-6,'continuous shading across the skin seam');else shared.set(key,normal);
 }
 const faceSize=new T.Box3().setFromObject(face).getSize(new T.Vector3()),hairSize=new T.Box3().setFromObject(hair).getSize(new T.Vector3());
 // These bounds include the nose tip, so the shorter nose reduces total depth.
 assert.ok(faceSize.z/faceSize.x>.90&&faceSize.z/faceSize.x<1.02,'rounded head retains depth with the shorter nose');
 assert.ok(hairSize.z/hairSize.x>.72,'rear haircut follows the deeper cranium');
 for(const {side,ear} of ears){
  const size=new T.Box3().setFromObject(ear).getSize(new T.Vector3());assert.ok(size.x>.07,'ear has a raised outer rim and recessed bowl');
  // Check both side profiles and a slightly forward view, at the lobe, bowl
  // and upper ear. Hair must leave all three landmarks unobstructed.
  for(const angle of [0,Math.PI/8])for(const y of [-.08,0,.05]){
   const target=new T.Vector3(side*.56,y,.035).applyMatrix4(head.matrixWorld),out=new T.Vector3(side*Math.cos(angle),0,Math.sin(angle));
   const hit=new T.Raycaster(target.clone().addScaledVector(out,3),out.clone().negate()).intersectObject(head,true)[0];
   assert.ok(ear.children.includes(hit?.object),'ear is visible outside the scalp and sideburns');
  }
  // The nose silhouette is visible from either side, not hidden by the fringe.
  const target=new T.Vector3(0,-.105,nose-.012).applyMatrix4(head.matrixWorld),out=new T.Vector3(side,0,0);
  const hit=new T.Raycaster(target.clone().addScaledVector(out,3),out.clone().negate()).intersectObject(head,true)[0];
  assert.equal(hit?.object,face,'nose forms the visible side silhouette');
 }
 console.log('Profile: distinct nose, smooth lower face and shading, cranium depth and exposed ears on both sides passed.',{nose,bridge,lips,fold,chin});
}});
