import assert from 'node:assert/strict';
import {blankSave,encodeSave,decodeSave,COINS,balance,unlock,jumpStep} from '../themes/shunta-furukawa-info/assets/js/explorer-save.js';
import {SIGNS} from '../themes/shunta-furukawa-info/assets/js/explorer-physics.js';
assert.ok(COINS.length>39);const s=blankSave();s.coins=COINS.map(x=>x.id);s.items=SIGNS.map(x=>x.id);s.visited=[...s.items];s.unlocked=[...s.items];s.color='#123abc';s.position={x:12.34,z:-22.12};s.yaw=-1.234;const encoded=encodeSave(s),decoded=decodeSave(encoded);for(const k of ['items','visited','unlocked','coins','color','position','yaw'])assert.deepEqual(decoded[k],s[k]);assert.equal(encoded.length,46);
for(const bad of ['', 'x'.repeat(5000),'<script>',encoded.slice(1)])assert.throws(()=>decodeSave(bad));
const poor=blankSave();assert.equal(unlock(poor,'profile'),false);poor.coins=[0,1,2];assert.equal(unlock(poor,'profile'),true);assert.equal(balance(poor),0);assert.equal(unlock(poor,'profile'),true);assert.equal(poor.unlocked.length,1);assert.equal(unlock(poor,'invalid'),false);
for(const fps of [30,60,120]){let j={phase:'launch',y:0,v:0,delay:.09},peak=0,landed=false;for(let i=0;i<fps*2;i++){j=jumpStep(j,1/fps);peak=Math.max(peak,j.y);if(j.phase==='land')landed=true;}assert.equal(j.phase,'ground');assert.ok(peak>1.3&&peak<1.7);assert.ok(landed);}
const url=new URL('https://shunta-furukawa.info/');for(const key of ['A','B','C'])url.searchParams.set(key,encoded);assert.ok(url.href.length<250);for(const key of ['A','B','C'])assert.equal(decodeSave(url.searchParams.get(key)).color,s.color);
console.log('Save URL: 3-slot round trip, invalid input, coin balance, one-time unlock, and jump landing at 30/60/120 fps passed.');
