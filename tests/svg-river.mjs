import assert from 'node:assert/strict';
import {swapPieces,dialValue,slotAt} from '../themes/shunta-furukawa-info/assets/js/puzzle-svg.js';
import {waterAt,riverCenter,riverWalkable,canReachCoin,underCoin,AVATAR_REACH,RIVER} from '../themes/shunta-furukawa-info/assets/js/explorer-river.js';
import {COINS,jumpStep,blankSave,encodeSave,decodeSave} from '../themes/shunta-furukawa-info/assets/js/explorer-save.js';
import {movePlayer} from '../themes/shunta-furukawa-info/assets/js/explorer-physics.js';
assert.deepEqual(swapPieces([0,1,2,3],0,3),[3,1,2,0]);assert.deepEqual(swapPieces([0,1],0,-1),[0,1]);assert.equal(slotAt(395,195,[{x:395,y:85},{x:395,y:195}]),1);assert.equal(slotAt(-10,-10,[{x:395,y:85}]),-1);
assert.deepEqual([[0,-1],[1,0],[0,1],[-1,0]].map(([x,y])=>dialValue(x,y,0,0)),[0,1,2,3]);
assert.equal(waterAt(35,riverCenter(35)),true);assert.equal(waterAt(RIVER.bridgeX,riverCenter(RIVER.bridgeX)),false);assert.equal(riverWalkable(35,riverCenter(35),0),false);assert.equal(riverWalkable(35,riverCenter(35),1),true);
const airborne=COINS.filter(c=>c.y>2);assert.equal(airborne.length,14);assert.ok(airborne.every(c=>c.value>=5),'Jumping pays more');
// Airborne coins hang clear of a standing avatar's head, are flagged as overhead when walked under,
// and are taken for most of a jump rather than only at its peak.
for(const c of airborne){assert.ok(c.y-.58>2.85+.2,'Coin '+c.id+' clears the head');assert.equal(underCoin({x:c.x,z:c.z,y:0},c),true);assert.equal(underCoin({x:c.x,z:c.z,y:1.5},c),false);assert.equal(underCoin({x:c.x+2,z:c.z,y:0},c),false);}
for(const fps of [30,60,120]){let j={phase:'launch',y:0,v:0,delay:.09},air=0,reach=0;for(let i=0;i<fps*2;i++){j=jumpStep(j,1/fps);if(j.phase==='air'){air++;if(canReachCoin({x:0,z:0,y:j.y},{x:0,z:0,y:airborne[0].y}))reach++;}}assert.ok(reach/air>.6,`An overhead coin is within reach for most of a jump at ${fps} fps`);}
for(const c of COINS.filter(c=>c.y<2)){assert.equal(canReachCoin({x:c.x,z:c.z,y:0},c),true);assert.equal(underCoin({x:c.x,z:c.z,y:0},c),false);}
assert.ok(AVATAR_REACH>2.85);for(const c of airborne){assert.equal(canReachCoin({x:c.x,z:c.z,y:0},c),false);assert.equal(canReachCoin({x:c.x,z:c.z,y:1.5},c),true);}assert.equal(COINS.length,128);assert.equal(new Set(COINS.map(c=>c.id)).size,128);assert.deepEqual(COINS.map(c=>c.id),COINS.map((_,i)=>i));assert.ok(COINS.every(c=>!waterAt(c.x,c.z,.3)||c.y>2),'No ground coin sits in the water');assert.ok(COINS.every(c=>Math.hypot(c.x,c.z)<55));
for(const fps of [30,60,120])for(const speed of [8,13]){const x=35,z=riverCenter(x);let p={x,z:z-2.1},j={phase:'launch',y:0,v:0,delay:.09},fell=false;for(let i=0;i<fps;i++){p=movePlayer(p,{x:0,z:speed/fps},[],(a,b)=>riverWalkable(a,b,j.y));j=jumpStep(j,1/fps);if(j.y<=.08&&waterAt(p.x,p.z)){fell=true;break;}}assert.equal(fell,false,`${fps} fps, speed ${speed} crossing`);assert.ok(p.z>z+1.55);}
const blocked=movePlayer({x:35,z:riverCenter(35)-2.1},{x:0,z:10},[],(x,z)=>riverWalkable(x,z,0));assert.ok(blocked.z<riverCenter(35)-1.55,'Cannot walk into water');const s=blankSave();s.coins=[0,50,100,127];assert.deepEqual(decodeSave(encodeSave(s)).coins,s.coins);
console.log('SVG drop/rotation mapping, stable coin IDs, jump-only pickups, bridge/water collision and river crossings at 30/60/120fps passed.');
