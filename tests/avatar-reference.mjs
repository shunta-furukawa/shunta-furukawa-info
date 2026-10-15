import assert from 'node:assert/strict';
import * as T from '../themes/shunta-furukawa-info/assets/js/vendor/three.module.js';
import {createAvatar} from '../themes/shunta-furukawa-info/assets/js/explorer-avatar.js';
createAvatar({onHeadBuilt({head,face,eyes,hair}){
 const size=new T.Box3().setFromObject(face).getSize(new T.Vector3());
 const hairSize=new T.Box3().setFromObject(hair).getSize(new T.Vector3());
 assert.ok(hairSize.x/size.x>1&&hairSize.x/size.x<1.5,'hair stays close to the skull');
 assert.ok(new T.Box3().setFromObject(eyes[0]).getSize(new T.Vector3()).x/size.x<.12,'small graphic eyes');
 assert.equal(hair.children.length,3,'one cap and two broad sweep shapes');
 for(const mesh of hair.children)assert.ok(mesh.material.isMeshBasicMaterial,'no realistic hair reflections');
 for(const angle of [-.6,0,.6])for(const side of [-1,1]){
  const target=new T.Vector3(side*.205,-.015,.404).applyMatrix4(head.matrixWorld),out=new T.Vector3(Math.sin(angle),0,Math.cos(angle));
  assert.ok(eyes.includes(new T.Raycaster(target.clone().addScaledVector(out,3),out.clone().negate()).intersectObject(head,true)[0]?.object),'eyes remain visible from three-quarter views');
 }
}});
console.log('Icon identity: white face, small eyes and simple black swept hair, with clear sightlines.');
