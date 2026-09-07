import assert from 'node:assert/strict';
import {movementVector,movePlayer,nearestSign,SIGNS,WORLD_RADIUS,PLAYER_RADIUS} from '../themes/shunta-furukawa-info/assets/js/explorer-physics.js';
const diagonal=movementVector(1,-1,0);assert.ok(Math.abs(Math.hypot(diagonal.x,diagonal.z)-1)<1e-10,'Diagonal movement must not be faster');
const quarterTurn=movementVector(0,-1,Math.PI/2);assert.ok(Math.abs(quarterTurn.x+1)<1e-10&&Math.abs(quarterTurn.z)<1e-10,'Movement follows the camera');
assert.deepEqual(movePlayer({x:0,z:0},{x:0,z:0},[]),{x:0,z:0});
const obstacle={x:0,z:-3,r:1};const stopped=movePlayer({x:0,z:0},{x:0,z:-20},[obstacle]);assert.ok(stopped.z>-3+1+PLAYER_RADIUS-.001,'Large steps must not tunnel through obstacles');
const slid=movePlayer({x:0,z:-1.4},{x:3,z:-1},[obstacle]);assert.ok(slid.x>2,'Player can slide along an obstacle');
const edge=movePlayer({x:0,z:0},{x:100,z:100},[]);assert.ok(Math.hypot(edge.x,edge.z)<=WORLD_RADIUS-PLAYER_RADIUS+.0001,'The island boundary contains the player');
assert.equal(nearestSign({x:0,z:15}),null,'Cannot inspect distant signs from spawn');
for(const s of SIGNS){assert.equal(nearestSign({x:s.x,z:s.z+2}).id,s.id);assert.notEqual(nearestSign({x:s.x,z:s.z+4})?.id,s.id);}
console.log('Explorer: movement, camera-relative direction, collision, sliding, boundary and all 10 sign interaction ranges passed.');
