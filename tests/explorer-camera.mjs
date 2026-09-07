import assert from 'node:assert/strict';
import {followYaw,minimapHeading,signYaw,createMovementFrame} from '../themes/shunta-furukawa-info/assets/js/explorer-camera.js';
import {BASE_SIGNS,movementVector} from '../themes/shunta-furukawa-info/assets/js/explorer-physics.js';
const delta=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
for(const fps of [30,60,120]){let yaw=0;const frame=createMovementFrame();for(let i=0;i<fps*8;i++){const v=movementVector(1,0,frame.resolve(1,0,yaw));assert.ok(Math.abs(v.x-1)<1e-9&&Math.abs(v.z)<1e-9,'Held strafe must not curve with follow camera');const next=followYaw(yaw,Math.PI/2,1/fps);assert.ok(Math.abs(next-yaw)<=.8/fps+1e-9);yaw=next;}assert.ok(Math.abs(delta(yaw,-Math.PI/2))<.002,'Camera reaches avatar back');}
assert.equal(followYaw(1,2,.1,false),1);
assert.ok(followYaw(Math.PI-.01,.01,.1)>Math.PI-.01,'Shortest path crosses wrap boundary');
const frame=createMovementFrame();frame.resolve(1,0,0);assert.equal(frame.resolve(1,0,1,true),1);frame.reset();assert.equal(frame.resolve(1,0,2),2);
for(const yaw of [0,Math.PI/2,Math.PI,-Math.PI/2]){const rotation=minimapHeading(yaw);assert.ok(Math.abs(Math.sin(rotation)-Math.sin(yaw))<1e-9);assert.ok(Math.abs(-Math.cos(rotation)-Math.cos(yaw))<1e-9);}
for(const s of BASE_SIGNS){const yaw=signYaw(s),dx=s.approach[0]-s.x,dz=s.approach[1]-s.z;assert.ok(Number.isFinite(yaw));assert.ok((Math.sin(yaw)*dx+Math.cos(yaw)*dz)/Math.hypot(dx,dz)>.999);}
console.log('Camera: stable held movement, bounded follow at 30/60/120 fps, manual override, angle wrap, avatar map heading and 13 sign approaches passed.');
