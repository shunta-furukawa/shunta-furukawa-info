import assert from 'node:assert/strict';
import * as T from '../themes/shunta-furukawa-info/assets/js/vendor/three.module.js';
import {createAvatar} from '../themes/shunta-furukawa-info/assets/js/explorer-avatar.js';
createAvatar({onHeadBuilt({head,face,eyes}){
 assert.equal(eyes.length,2);
 for(const [i,eye] of eyes.entries()){
  assert.ok(eye.material.isMeshBasicMaterial,'eyes stay graphic under scene lights');
  assert.equal(eye.material.color.getHexString(),'17171f');
  const side=i===0?-1:1,target=new T.Vector3(side*.205,-.015,2).applyMatrix4(head.matrixWorld);
  const direction=new T.Vector3(0,0,-1).transformDirection(head.matrixWorld);
  assert.equal(new T.Raycaster(target,direction).intersectObject(head,true)[0]?.object,eye,'hair and face do not hide the eye');
 }
 assert.ok(face.material.isMeshBasicMaterial,'skin has no realistic highlights');
 assert.equal(head.children.filter(o=>/iris|pupil|lid|catchlight/.test(o.name)).length,0);
}});
console.log('Simple eyes: two visible flat black marks without anatomical layers.');
