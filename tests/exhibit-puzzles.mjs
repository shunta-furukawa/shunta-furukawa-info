import assert from 'node:assert/strict';
import {PUZZLES,solved,evaluate,rotatePipe} from '../themes/shunta-furukawa-info/assets/js/exhibit-puzzles.js';
import {choices,base,runProgram,tracePipe,traceRelay,planReport,auctionReport,pickUsers,lampsOf} from '../themes/shunta-furukawa-info/assets/js/puzzle-logic.js';
import {SIGNS} from '../themes/shunta-furukawa-info/assets/js/explorer-physics.js';
import {blankSave,encodeSave,decodeSave} from '../themes/shunta-furukawa-info/assets/js/explorer-save.js';
assert.deepEqual(Object.keys(PUZZLES).sort(),SIGNS.filter(s=>s.id!=='profile').map(s=>s.id).sort());
// Enumerate every reachable arrangement of a puzzle (permutations for the ordering puzzle).
function* arrangements(p){const n=p.initial.length;if(p.type==='deduce'){const walk=function*(head,rest){if(!rest.length)yield head;for(const v of rest)yield* walk([...head,v],rest.filter(x=>x!==v));};yield* walk([],p.initial.map((_,i)=>i));return;}
 const state=p.initial.map(()=>base(p));while(true){yield [...state];let i=0;while(i<n){if(++state[i]<base(p)+choices(p,i))break;state[i]=base(p);i++;}if(i===n)return;}}
const solutions={};
for(const [id,p] of Object.entries(PUZZLES)){
 assert.equal(solved(p,p.initial),false,id+' must start unsolved');assert.equal(solved(p,p.answer),true,id+' answer must succeed');
 assert.equal(solved(p,[]),false);assert.equal(solved(p,p.initial.map(()=>99)),false,id+' rejects out-of-range values');assert.equal(solved(p,p.initial.map(()=>.5)),false);
 assert.ok(p.hints.length>=3,id+' has three hint levels');assert.ok(p.debrief&&p.success&&p.intro&&p.title);
 const failed=evaluate(p,p.initial);assert.ok(failed.issues.length>=1&&failed.issues.every(t=>typeof t==='string'&&t.length>5),id+' explains a failed attempt');
 p.initial.forEach((v,i)=>assert.ok(v>=base(p)&&v<base(p)+choices(p,i),id+' initial in range'));
 let total=0;const found=[];for(const s of arrangements(p)){total++;if(solved(p,s))found.push(s.join(','));}solutions[id]={found,total};
}
const unique=id=>assert.deepEqual(solutions[id].found,[PUZZLES[id].answer.join(',')],id+' has exactly one solution');
// Deduction puzzles promise a single answer in their text.
for(const id of ['career-0','career-1','career-2','career-4','work-1','work-2','skills','philosophy','connect'])unique(id);
// Every stated rule is individually satisfiable but not by the starting arrangement alone.
for(const id of ['career-2','career-4','philosophy']){const p=PUZZLES[id];assert.ok(evaluate(p,p.initial).marks.some(v=>!v));assert.ok(evaluate(p,p.answer).marks.every(Boolean));}
// career-0: patches are independent, so order and repetition never matter.
{const p=PUZZLES['career-0'];assert.equal(new Set([...arrangements(p)].map(s=>lampsOf(p,s).join(''))).size,64);assert.equal(p.start.filter(v=>!v).length,3);}
// career-1: the answer needs the loop, a jump and the star; walking into walls or holes fails.
{const p=PUZZLES['career-1'],run=runProgram(p,p.answer);assert.equal(run.loop,1);assert.equal(run.stars,1);assert.equal(runProgram(p,[1,1,1,1,1]).fail,'fall');assert.equal(runProgram(p,[0,0,0,0,0]).fail,'empty');assert.equal(runProgram(p,[2,2,1,1,1]).fail,'bump');assert.equal(runProgram(p,[2,0,0,0,0]).fail,'short');}
// career-3: equivalent spellings of the same rule are accepted, single-attribute rules are not.
{const p=PUZZLES['career-3'];assert.ok(solutions['career-3'].found.length<=4);assert.equal(solved(p,[1,1,0,0,4]),true);assert.equal(solved(p,[4,0,4,0,4]),false);assert.deepEqual(pickUsers(p,p.answer).map((v,i)=>v?i:-1).filter(i=>i>=0),p.target);assert.ok(p.target.every(i=>p.users[i].has.includes(4)),'Only consenting users are wanted');}
// work-0: the direct top route is rejected because it skips the checkpoints.
{const p=PUZZLES['work-0'],t=tracePipe(p,p.answer);assert.equal(t.path.length,8);assert.equal(tracePipe(p,p.initial).ok,false);assert.equal(rotatePipe(3),6);assert.equal(rotatePipe(9),3);assert.ok(solutions['work-0'].found.every(s=>tracePipe(p,s.split(',').map(Number)).path.length===8),'Every accepted arrangement uses the same route');}
// work-1: the starting plan covers demand but scales too fast; the answer spends the whole budget.
{const p=PUZZLES['work-1'],start=planReport(p,p.initial),end=planReport(p,p.answer);assert.deepEqual(start.short,[]);assert.ok(start.fast.length>=2);assert.equal(end.cost,p.budget);}
// knowledge: second price is independent of the bid; the highest-value slot is a trap.
{const p=PUZZLES.knowledge;const a=auctionReport(p,[3,0,0,3,3]),b=auctionReport(p,[5,0,0,5,5]);assert.equal(a.paid,b.paid);assert.equal(a.gain,317);assert.equal(solved(p,[3,5,0,3,3]),false,'Winning everything profitable exceeds the budget');assert.equal(solved(p,[0,5,0,3,0]),false);assert.ok(auctionReport(p,[0,0,5,0,0]).gain<0);
 const winners=new Set(solutions.knowledge.found.map(s=>auctionReport(p,s.split(',').map(Number)).rows.map(r=>r.won?1:0).join('')));assert.deepEqual([...winners],['10011']);}
// connect: the signal visits all seven relays before leaving.
{const p=PUZZLES.connect;assert.equal(traceRelay(p,p.answer).seen.length,7);}
const save=blankSave();save.items=Object.keys(PUZZLES);assert.deepEqual(decodeSave(encodeSave(save)).items.sort(),save.items.sort());
console.log('All 12 puzzles: unsolved start, verified answer, exhaustive solution counts ('+Object.entries(solutions).map(([k,v])=>`${k} ${v.found.length}/${v.total}`).join(', ')+'), failure explanations and completed-item URL persistence passed.');
