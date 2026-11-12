// Pure rules for the exhibit puzzles. Every model is a fictional teaching model,
// not a production specification. No DOM access here so node tests can import it.
export const DIRS=[[0,-1],[1,0],[0,1],[-1,0]]; // N E S W as [dx,dy]
const BIT=[1,2,4,8];
export const rotatePipe=m=>((m<<1)&15)|(m>>3);
export const pipeMask=(kind,rot)=>{let m=kind==='I'?5:3;for(let i=0;i<rot%4;i++)m=rotatePipe(m);return m;};
const result=(issues,extra={})=>({ok:issues.length===0,issues,...extra});

// career-0: every patch flips the tests wired to it.
export function lampsOf(p,state){const lamps=[...p.start];state.forEach((on,i)=>{if(on)for(const k of p.patches[i].flips)lamps[k]^=1;});return lamps;}
function toggle(p,state){const lamps=lampsOf(p,state),red=lamps.filter(v=>!v).length;return result(red?[`まだ ${red} 項目が落ちています。当てた修正が、別の項目を反転させていないか確認しよう。`]:[],{lamps});}

// career-1: a looping command list drives the character across the stage.
export const COMMANDS=['なし','前進','右を向く','左を向く','ジャンプ'];
export function runProgram(p,state){let {x,y,d}=p.start;const trace=[{x,y,d}],stars=new Set();
 const at=(list,a,b)=>list.some(([c,e])=>c===a&&e===b),inside=(a,b)=>a>=0&&b>=0&&a<p.cols&&b<p.rows;
 if(!state.some(Boolean))return {ok:false,trace,stars:0,fail:'empty',slot:-1};
 for(let loop=0;loop<p.loops;loop++)for(let k=0;k<state.length;k++){const c=state[k];if(!c)continue;
  if(c===2||c===3){d=(d+(c===2?1:3))%4;trace.push({x,y,d,slot:k});continue;}
  const n=c===4?2:1,mx=x+DIRS[d][0],my=y+DIRS[d][1],nx=x+DIRS[d][0]*n,ny=y+DIRS[d][1]*n;
  if((c===4&&(!inside(mx,my)||at(p.walls,mx,my)))||!inside(nx,ny)||at(p.walls,nx,ny))return {ok:false,trace,stars:stars.size,fail:'bump',slot:k,loop};
  x=nx;y=ny;trace.push({x,y,d,slot:k,jump:c===4});
  if(at(p.holes,x,y))return {ok:false,trace,stars:stars.size,fail:'fall',slot:k,loop};
  p.stars.forEach(([a,b],i)=>{if(a===x&&b===y)stars.add(i);});
  if(x===p.goal[0]&&y===p.goal[1]){if(stars.size===p.stars.length)return {ok:true,trace,stars:stars.size,loop};return {ok:false,trace,stars:stars.size,fail:'star',slot:k,loop};}
 }
 return {ok:false,trace,stars:stars.size,fail:'short',slot:-1};
}
function program(p,state){const run=runProgram(p,state),n=run.slot+1,lap=(run.loop??0)+1;
 const text={empty:'命令が空です。枠をタップして命令を入れよう。',bump:`${lap}周目の${n}番で壁にぶつかりました。`,fall:`${lap}周目の${n}番で穴に落ちました。ジャンプなら1マス飛び越えられます。`,star:'ゴールには着いたけれど、スターを取り逃しています。',short:`${p.loops}周くり返してもゴールに届きませんでした。`}[run.fail];
 return result(run.ok?[]:[text],{run});
}

// career-2 / generic: rules judged on the arrangement.
function byRules(p,state,valid=true){const marks=p.rules.map(r=>Boolean(valid&&r.test(state,p))),bad=marks.filter(v=>!v).length;return result(bad?[`${p.rules.length}個の条件のうち、${bad}個がまだ満たされていません。`]:[],{marks});}
const isPermutation=state=>[...state].sort((a,b)=>a-b).every((v,i)=>v===i);

// career-3: (A op B) op C picks users; it must equal the wanted audience.
export const OPS=['かつ','または','ただし除く'];
export function pickUsers(p,state){const [a,o1,b,o2,c]=state,has=(u,k)=>u.has.includes(k),op=(l,o,r)=>o===0?l&&r:o===1?l||r:l&&!r;return p.users.map(u=>op(op(has(u,a),o1,has(u,b)),o2,has(u,c)));}
function rule(p,state){const picked=pickUsers(p,state),extra=picked.filter((v,i)=>v&&!p.target.includes(i)).length,missing=p.target.filter(i=>!picked[i]).length,issues=[];
 if(extra)issues.push(`届けるべきでない人が ${extra} 人、対象に入っています。`);if(missing)issues.push(`届けたい人が ${missing} 人、対象から漏れています。`);return result(issues,{picked});}

// work-0: follow the pipes from the inlet; the route must pass every checkpoint and leave by the outlet.
export function tracePipe(p,state){const mask=i=>pipeMask(p.kinds[i],state[i]);let [x,y]=p.entry.cell,from=p.entry.side;const path=[];
 for(let step=0;step<p.cols*p.rows+1;step++){const i=y*p.cols+x;if(path.includes(i)||!(mask(i)&BIT[from]))return {ok:false,path,broken:[x,y]};path.push(i);
  const out=BIT.findIndex((b,k)=>k!==from&&(mask(i)&b));if(x===p.exit.cell[0]&&y===p.exit.cell[1]&&out===p.exit.side){const missed=p.required.filter(r=>!path.includes(r.cell[1]*p.cols+r.cell[0]));return {ok:missed.length===0,path,done:true,missed};}
  const nx=x+DIRS[out][0],ny=y+DIRS[out][1];if(nx<0||ny<0||nx>=p.cols||ny>=p.rows)return {ok:false,path,leak:[x,y]};x=nx;y=ny;from=(out+2)%4;}
 return {ok:false,path};
}
function pipe(p,state){const t=tracePipe(p,state);return result(t.ok?[]:[t.done?`画面までは届いたけれど、${t.missed.map(r=>r.label).join('と')}を経由していません。`:t.path.length?`入口から ${t.path.length} マス目の先で途切れています。`:'入口の配管がつながっていません。'],{trace:t});}

// work-1: capacity must cover demand, servers start slowly, and the budget is fixed.
export function planReport(p,state){const short=[],fast=[];let prev=p.before;state.forEach((n,i)=>{if(n*p.per<p.demand[i])short.push(i);if(n-prev>p.maxUp)fast.push(i);prev=n;});return {short,fast,cost:state.reduce((a,b)=>a+b,0)};}
function plan(p,state){const r=planReport(p,state),issues=[],name=i=>p.slots[i];
 if(r.short.length)issues.push(`${r.short.map(name).join('・')} で処理能力が足りません。`);if(r.fast.length)issues.push(`${r.fast.map(name).join('・')} は増設が間に合いません（1区間に +${p.maxUp} 台まで）。`);if(r.cost>p.budget)issues.push(`合計 ${r.cost} 台ぶん。予算の ${p.budget} を超えています。`);return result(issues,{report:r});}

// work-2: every task waits for its prerequisites; a stage runs a limited number of tasks.
export function stageReport(p,state){const late=p.deps.filter(([a,b])=>state[a]>=state[b]),over=p.stages.map((_,s)=>state.filter(v=>v===s).length).map((n,s)=>n>p.cap?s:-1).filter(s=>s>=0);return {late,over};}
function stage(p,state){const r=stageReport(p,state),issues=[];if(r.over.length)issues.push(`${r.over.map(s=>p.stages[s]).join('・')} に ${p.cap} 個を超える作業が入っています。`);if(r.late.length){const [a,b]=r.late[0];issues.push(`「${p.labels[b]}」は「${p.labels[a]}」より後のステージに置く必要があります${r.late.length>1?`（ほか ${r.late.length-1} 件）`:''}。`);}return result(issues,{report:r});}

// knowledge: second-price auctions. A win costs the best competing price + 1, never the bid itself.
export function auctionReport(p,state){let paid=0,gain=0;const rows=p.auctions.map((a,i)=>{const bid=p.bids[state[i]],need=Math.max(a.rival,a.floor),won=bid>0&&bid>a.rival&&bid>=a.floor,pay=won?need+1:0;paid+=pay;if(won)gain+=a.value-pay;return {bid,won,pay};});return {rows,paid,gain};}
function auction(p,state){const r=auctionReport(p,state),issues=[];if(r.paid>p.budget)issues.push(`支払い合計 ${r.paid} 円。予算の ${p.budget} 円を超えています。`);if(r.gain<p.goal)issues.push(`利益は ${r.gain} 円。目標の ${p.goal} 円に届いていません。`);return result(issues,{report:r});}

// connect: each relay forwards the signal in a straight line to the next relay it faces.
export function traceRelay(p,state){const seen=[];let i=p.first;for(let step=0;step<=p.nodes.length;step++){if(seen.includes(i))return {ok:false,seen,loop:i};seen.push(i);const [x,y]=p.nodes[i],[dx,dy]=DIRS[state[i]];let nx=x+dx,ny=y+dy,next=-1;
  while(nx>=0&&ny>=0&&nx<p.cols&&ny<p.rows){if(nx===p.goal[0]&&ny===p.goal[1])return {ok:seen.length===p.nodes.length,seen,reached:true};next=p.nodes.findIndex(([a,b])=>a===nx&&b===ny);if(next>=0)break;nx+=dx;ny+=dy;}
  if(next<0)return {ok:false,seen,lost:i};i=next;}
 return {ok:false,seen};
}
function relay(p,state){const t=traceRelay(p,state),left=p.nodes.length-t.seen.length;return result(t.ok?[]:[t.reached?`受信局には届いたけれど、${left} 局を経由していません。全局をつなぐ必要があります。`:t.loop!==undefined?'信号が同じ中継局に戻って、ぐるぐる回っています。':`${t.seen.length} 局目の先に、受け取る局がありません。`],{trace:t});}

export function evaluate(p,state){
 if(!p||!Array.isArray(state)||state.length!==p.initial.length||!state.every(Number.isInteger))return {ok:false,issues:['状態を読み取れません。']};
 const range=(max,min=0)=>state.every(v=>v>=min&&v<=max);
 switch(p.type){
  case 'toggle':return range(1)?toggle(p,state):{ok:false,issues:[]};
  case 'program':return range(COMMANDS.length-1)?program(p,state):{ok:false,issues:[]};
  case 'deduce':return byRules(p,state,isPermutation(state));
  case 'rule':return state.every((v,i)=>v>=0&&v<(i%2?OPS.length:p.attrs.length))?rule(p,state):{ok:false,issues:[]};
  case 'matrix':return range(1)?byRules(p,state):{ok:false,issues:[]};
  case 'pipe':return range(3)?pipe(p,state):{ok:false,issues:[]};
  case 'plan':return range(p.max,1)?plan(p,state):{ok:false,issues:[]};
  case 'stage':return range(p.stages.length-1)?stage(p,state):{ok:false,issues:[]};
  case 'match':{if(!range(p.options.length-1))return {ok:false,issues:[]};const wrong=state.filter((v,i)=>v!==p.answer[i]).length;return result(wrong?[`${state.length}本のうち ${wrong} 本が、まだ正しい時代につながっていません。`]:[],{wrong});}
  case 'slots':return range(p.options.length-1)?byRules(p,state):{ok:false,issues:[]};
  case 'auction':return range(p.bids.length-1)?auction(p,state):{ok:false,issues:[]};
  case 'relay':return range(3)?relay(p,state):{ok:false,issues:[]};
  default:return {ok:false,issues:[]};
 }
}
export const solved=(p,state)=>evaluate(p,state).ok;
// How many values piece i can take, and its lowest value.
export function choices(p,i){switch(p.type){case 'toggle':case 'matrix':return 2;case 'program':return COMMANDS.length;case 'rule':return i%2?OPS.length:p.attrs.length;case 'pipe':return p.kinds[i]==='I'?2:4;case 'plan':return p.max;case 'stage':return p.stages.length;case 'deduce':return p.labels.length;case 'match':case 'slots':return p.options.length;case 'auction':return p.bids.length;case 'relay':return 4;default:return 1;}}
export const base=p=>p.type==='plan'?1:0;
