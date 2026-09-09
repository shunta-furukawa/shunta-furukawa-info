import assert from 'node:assert/strict';
import * as T from '../themes/shunta-furukawa-info/assets/js/vendor/three.module.js';
import {createAvatar} from '../themes/shunta-furukawa-info/assets/js/explorer-avatar.js';
import {faceWidth,faceZ} from '../themes/shunta-furukawa-info/assets/js/avatar-surfaces.js';

// Broad cheeks lead into a diagonal mandible, then a short rounded chin.
assert.ok(faceWidth(-.20)>.47);
assert.ok(faceWidth(-.34)>.34&&faceWidth(-.34)<.37);
assert.ok(faceWidth(-.475)>.10&&faceWidth(-.475)<.12);
let previous=faceWidth(-.14);
for(let y=-.141;y>-.5;y-=.001){const w=faceWidth(y);assert.ok(w<previous,'jaw tapers without a bulge or shelf');previous=w;}
for(const y of [-.14,-.29,-.475]){
 const step=.0001,a=(faceWidth(y)-faceWidth(y-step))/step,b=(faceWidth(y+step)-faceWidth(y))/step;
 assert.ok(Math.abs(a-b)<.12,'rounded joins instead of hard corners');
}
assert.ok(faceZ(0,-.46)>.30,'chin has forward volume');
assert.ok(faceZ(0,-.50)>.23,'chin tip does not collapse into the neck');

createAvatar({onHeadBuilt({head,face}){
 const p=face.geometry.attributes.position;let chinVertices=0;
 for(let i=0;i<p.count;i++)if(p.getY(i)<-.499){chinVertices++;assert.ok(Math.abs(p.getX(i))<.001);assert.ok(p.getZ(i)>.23);}
 assert.ok(chinVertices>0,'the actual mesh contains the new chin');
 // A chin hidden inside the hoodie would still look missing. Check the built
 // character, including its hood, from front and both three-quarter directions.
 for(const angle of [-Math.PI/4,0,Math.PI/4]){
  const x=0,y=-.46,target=new T.Vector3(x,y,faceZ(x,y)).applyMatrix4(head.matrixWorld),out=new T.Vector3(Math.sin(angle),.05,Math.cos(angle)).normalize();
  const hit=new T.Raycaster(target.clone().addScaledVector(out,3),out.clone().negate()).intersectObject(head.parent,true)[0];
  assert.equal(hit?.object,face,'chin remains visible in front of the hood');
 }
}});
console.log('Jaw: tapered silhouette, rounded joins, forward chin geometry and hood clearance passed.');
