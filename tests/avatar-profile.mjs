import assert from 'node:assert/strict';
import * as T from '../themes/shunta-furukawa-info/assets/js/vendor/three.module.js';
import {createAvatar} from '../themes/shunta-furukawa-info/assets/js/explorer-avatar.js';

createAvatar({onHeadBuilt({head,face,hair,ears}){
 const vertices=face.geometry.attributes.position,rows=new Map();
 for(let i=0;i<vertices.count;i++){const y=vertices.getY(i);rows.set(y,Math.max(rows.get(y)??-Infinity,vertices.getZ(i)));}
 const profileAt=y=>[...rows].reduce((a,b)=>Math.abs(b[0]-y)<Math.abs(a[0]-y)?b:a)[1];
 const nose=profileAt(-.105),bridge=profileAt(-.025),philtrum=profileAt(-.19),lips=profileAt(-.235),fold=profileAt(-.294),chin=profileAt(-.355);
 assert.ok(nose-bridge>.055,'nose tip projects beyond the bridge in the built mesh');
 assert.ok(nose-lips>.09,'nose has a distinct underside before the mouth');
 assert.ok(lips-philtrum>.004,'lips have a small projection');
 assert.ok(lips-fold>.02&&chin-fold>.015,'lower lip, fold and chin are distinct');
 const faceSize=new T.Box3().setFromObject(face).getSize(new T.Vector3()),hairSize=new T.Box3().setFromObject(hair).getSize(new T.Vector3());
 assert.ok(faceSize.z/faceSize.x>.94&&faceSize.z/faceSize.x<1.08,'rounded cranium has real front-to-back depth');
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
 console.log('Profile: sculpted nose/lips/chin, cranium depth and exposed ears on both sides passed.',{nose,bridge,lips,fold,chin});
}});
