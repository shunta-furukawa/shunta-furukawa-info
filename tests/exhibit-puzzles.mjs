import assert from 'node:assert/strict';
import {PUZZLES,solved,rotatePipe,loads} from '../themes/shunta-furukawa-info/assets/js/exhibit-puzzles.js';
import {SIGNS} from '../themes/shunta-furukawa-info/assets/js/explorer-physics.js';
import {blankSave,encodeSave,decodeSave} from '../themes/shunta-furukawa-info/assets/js/explorer-save.js';
assert.deepEqual(Object.keys(PUZZLES).sort(),SIGNS.filter(s=>s.id!=='profile').map(s=>s.id).sort());
for(const [id,p] of Object.entries(PUZZLES)){assert.equal(solved(p,p.initial),false,id+' must start unsolved');assert.equal(solved(p,p.answer),true,id+' answer must succeed');assert.equal(solved(p,[]),false);assert.ok(p.hints.length>=2);if(p.type==='order')assert.deepEqual([...p.initial].sort(),[...p.answer].sort());else if(p.type==='pipe')for(let i=0;i<4;i++){let value=p.initial[i],found=false;for(let r=0;r<4;r++){found ||= value===p.answer[i];value=rotatePipe(value);}assert.ok(found);}else p.answer.forEach((v,i)=>assert.ok(v>=0&&v<(p.choices?.[i]||p.options).length));}
const load=PUZZLES['work-1'];assert.equal(solved(load,[1,0,0,1]),true,'Alternative balanced routing accepted');assert.equal(solved(load,[0,0,1,1]),false);assert.deepEqual(loads(load,[0,1,1,0]),[6,6]);
let routes=0;for(const a of [3,6,12,9])for(const b of [3,6,12,9])for(const c of [3,6,12,9])for(const d of [3,6,12,9])if(solved(PUZZLES['work-0'],[a,b,c,d]))routes++;assert.equal(routes,1,'Only complete physical pipe route accepted');
const save=blankSave();save.items=Object.keys(PUZZLES);assert.deepEqual(decodeSave(encodeSave(save)).items.sort(),save.items.sort());
console.log('All 12 puzzles: incomplete initial state, reachable solution, alternative load routing, exhaustive pipe connectivity and completed-item URL persistence passed.');
