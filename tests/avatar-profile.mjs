import assert from 'node:assert/strict';
import * as T from '../themes/shunta-furukawa-info/assets/js/vendor/three.module.js';
import {createAvatar} from '../themes/shunta-furukawa-info/assets/js/explorer-avatar.js';
createAvatar({onHeadBuilt({head,face,ears}){
 const size=new T.Box3().setFromObject(face).getSize(new T.Vector3());
 assert.ok(size.z/size.x>.75&&size.z/size.x<.9,'rounded shallow mascot head');
 assert.equal(ears.length,2);
 for(const {ear} of ears){assert.ok(ear.isMesh,'ear is one simple shape');assert.equal(ear.material,face.material);}
 const smile=head.getObjectByName('simple-smile');assert.ok(smile);
 assert.equal(smile.material.color.getHexString(),'17171f');
 assert.ok(!head.children.some(o=>/nose|nostril|brow/.test(o.name)));
}});
console.log('Simple profile: rounded head, plain ears and one smile stroke.');
