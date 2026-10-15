import assert from 'node:assert/strict';
import {createAvatar} from '../themes/shunta-furukawa-info/assets/js/explorer-avatar.js';
createAvatar({onHeadBuilt({face}){
 const p=face.geometry.attributes.position;
 for(let i=0;i<p.count;i++){
  const radius=p.getX(i)**2+p.getY(i)**2+p.getZ(i)**2;
  assert.ok(Math.abs(radius-1)<1e-6,'face is a smooth primitive without sculpted jaw or lip bumps');
 }
 assert.equal(face.material.color.getHexString(),'f5f3f5');
}});
console.log('Simple jaw: smooth white oval with no anatomical relief.');
