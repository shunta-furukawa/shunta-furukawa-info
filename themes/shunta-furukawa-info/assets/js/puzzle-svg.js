import {DIRS,COMMANDS,OPS,choices,base,lampsOf,pickUsers,tracePipe,planReport,stageReport,auctionReport,traceRelay} from './puzzle-logic.js';
const NS='http://www.w3.org/2000/svg';
const node=(tag,attrs={},text)=>{const n=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));if(text!==undefined)n.textContent=text;return n;};
const add=(g,tag,a,t)=>{const n=node(tag,a,t);g.append(n);return n;};
const text=(g,x,y,t,size=17,anchor='middle',cls='')=>add(g,'text',{x,y,'text-anchor':anchor,'font-size':size,fill:'currentColor',class:cls},t);
const line=(g,d,cls='svg-wire')=>add(g,'path',{d,class:cls,fill:'none'});
const circle=(g,x,y,r,cls)=>add(g,'circle',{cx:x,cy:y,r,class:cls});
const rect=(g,x,y,w,h,rx,cls)=>add(g,'rect',{x,y,width:w,height:h,rx,class:cls});
const still=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.body.classList.contains('world-motion-off');
export function swapPieces(state,from,to){const out=[...state];if(Number.isInteger(from)&&Number.isInteger(to)&&from>=0&&to>=0&&from<out.length&&to<out.length)[out[from],out[to]]=[out[to],out[from]];return out;}
export function dialValue(x,y,cx,cy){return (Math.round((Math.atan2(y-cy,x-cx)+Math.PI/2)/(Math.PI/2))+4)%4;}
export function slotAt(x,y,centers,radius=65){return centers.findIndex(c=>Math.hypot(c.x-x,c.y-y)<radius);}
// Next value for piece i: wraps for selectors, clamps for quantities.
export function stepValue(p,state,i,d){const n=choices(p,i),b=base(p),v=state[i]-b+d;return b+(p.type==='plan'?Math.max(0,Math.min(n-1,v)):((v%n)+n)%n);}
const COMMAND_ICON=['M-4 0H4','M0 20V-18M-13-5 0-18 13-5','M-14 20V0Q-14-10-4-10H14M4-20 14-10 4 0','M14 20V0Q14-10 4-10H-14M-4-20-14-10-4 0','M-22 16Q0-40 22 16M11 9 22 16 26 3'];
const HEIGHT={toggle:430,program:420,deduce:210,pipe:392,plan:332,stage:452,match:420,relay:424};

function drawSVG(p,state,{selected=null,won=false,feedback=null,change,select}){
 const n=state.length,height=HEIGHT[p.type],svg=node('svg',{viewBox:`0 0 500 ${height}`,class:'puzzle-machine puzzle-'+p.type,'aria-label':p.title,role:'group'}),centers=[];let drag=null;
 rect(svg,3,3,494,height-6,26,'svg-chassis');
 const piece=(i,x,y,label,parent=svg)=>{const group=add(parent,'g',{'data-piece':i,tabindex:won?-1:0,role:'button','aria-label':label,'aria-disabled':String(won),class:'svg-piece'+(selected===i?' selected':''),transform:`translate(${x} ${y})`});centers[i]={x,y};
  group.addEventListener('keydown',e=>{if(won)return;const back=['ArrowLeft','ArrowDown'].includes(e.key),forward=['ArrowRight','ArrowUp'].includes(e.key);if(['Enter',' '].includes(e.key)){e.preventDefault();tap(i);}else if(back||forward){e.preventDefault();if(p.type==='deduce'){const j=(i+(back?n-1:1))%n;change(swapPieces(state,i,j),j);}else cycle(i,back?-1:1);}});return group;};
 const cycle=(i,d=1)=>{const next=[...state];next[i]=stepValue(p,state,i,d);change(next,i);};
 const tap=i=>{if(p.type==='deduce'){if(selected===null)select(i);else change(swapPieces(state,selected,i),i);}else if(p.type==='plan'&&state[i]===p.max)change(Object.assign([...state],{[i]:1}),i);else cycle(i);};

 if(p.type==='toggle'){
  const lamps=lampsOf(p,state),y=i=>62+i*64;text(svg,94,30,'修正',17);text(svg,390,30,'テスト項目',17);
  p.patches.forEach((patch,i)=>patch.flips.forEach(k=>line(svg,`M174 ${y(i)}C250 ${y(i)} 250 ${y(k)} 316 ${y(k)}`,'svg-link'+(state[i]?' live':''))));
  lamps.forEach((ok,k)=>{circle(svg,332,y(k),16,ok?'svg-pass':'svg-fail');line(svg,ok?`M324 ${y(k)}l6 6 10-12`:`M325 ${y(k)-7}l14 14M339 ${y(k)-7}l-14 14`,'svg-mark');text(svg,358,y(k)+7,p.lamps[k],19,'start');});
  p.patches.forEach((patch,i)=>{const g=piece(i,94,y(i),`修正「${patch.label}」：${state[i]?'適用中':'未適用'}。${patch.flips.map(k=>p.lamps[k]).join('・')}を反転`);rect(g,-80,-23,160,46,23,'svg-token'+(state[i]?' on':''));text(g,0,7,patch.label,19);});
 }else if(p.type==='program'){
  const size=62,x0=64,y0=18,cx=c=>x0+size*c+size/2,cy=r=>y0+size*r+size/2,run=feedback?.run,has=(list,c,r)=>list.some(([a,b])=>a===c&&b===r);
  for(let r=0;r<p.rows;r++)for(let c=0;c<p.cols;c++){rect(svg,x0+size*c+2,y0+size*r+2,size-4,size-4,8,has(p.walls,c,r)?'svg-wall':'svg-cell');if(has(p.holes,c,r))circle(svg,cx(c),cy(r),19,'svg-hole');}
  p.stars.forEach(([c,r])=>line(add(svg,'g',{transform:`translate(${cx(c)} ${cy(r)})`}),'M0-17 5-6 17-5 8 3 11 15 0 8-11 15-8 3-17-5-5-6Z','svg-star'));
  line(add(svg,'g',{transform:`translate(${cx(p.goal[0])} ${cy(p.goal[1])})`}),'M-10 20V-20M-10-20H16L8-10 16 0H-10','svg-flag');
  const steps=run?.trace||[p.start],d=steps.map((s,i)=>(i?'L':'M')+cx(s.x)+' '+cy(s.y)).join('');if(run&&steps.length>1)line(svg,d,'svg-trail');
  const last=steps[steps.length-1],hero=add(svg,'g',{transform:`translate(${cx(last.x)} ${cy(last.y)}) rotate(${last.d*90})`,class:'svg-hero'+(run&&!run.ok&&run.fail!=='short'&&run.fail!=='empty'?' fallen':'')});circle(hero,0,0,17,'svg-plug');line(hero,'M0-9V7M-7-2 0-9 7-2','svg-heading');
  if(run&&steps.length>1&&!still()){const ghost=circle(svg,0,0,8,'svg-packet');add(ghost,'animateMotion',{path:d,dur:Math.max(1.2,steps.length*.22)+'s',repeatCount:won?'indefinite':'1',fill:'freeze'});}
  state.forEach((v,i)=>{const x=82+i*84,g=piece(i,x,336,`${i+1}番の命令：${COMMANDS[v]}。タップで切り替え`);rect(g,-33,-33,66,66,14,'svg-socket'+(run&&run.slot===i?' bad':''));line(g,COMMAND_ICON[v],v?'svg-icon':'svg-icon faint');text(svg,x,394,COMMANDS[v],16);text(svg,x,294,String(i+1),16,'middle','svg-dim');});
 }else if(p.type==='deduce'){
  line(svg,'M50 96H450','svg-track');state.forEach((v,i)=>{const x=58+i*96;circle(svg,x,96,45,'svg-socket');text(svg,x,168,`${i+1}番目`,16,'middle','svg-dim');const g=piece(i,x,96,`${i+1}番目 ${p.labels[v]}。ドラッグまたは2つ選択で交換`);circle(g,0,0,40,'svg-token');text(g,0,7,p.labels[v],19);});
 }else if(p.type==='pipe'){
  const size=110,x0=30,y0=26,cx=c=>x0+size*c+size/2,cy=r=>y0+size*r+size/2,trace=tracePipe(p,state),ey=cy(p.entry.cell[1]),xy=cy(p.exit.cell[1]);
  line(svg,`M4 ${ey}H${x0}`,'svg-pipe');line(svg,`M4 ${ey}H${x0}`,'svg-water'+(won?' flowing':''));line(svg,`M${x0+size*p.cols} ${xy}H496`,'svg-pipe');if(trace.done)line(svg,`M${x0+size*p.cols} ${xy}H496`,'svg-water'+(won?' flowing':''));
  text(svg,62,height-13,'← 入口',16,'middle','svg-dim');text(svg,424,height-13,'ライブ画面 ↗',16,'middle','svg-dim');
  state.forEach((v,i)=>{const c=i%p.cols,r=Math.floor(i/p.cols),need=p.required.find(q=>q.cell[0]===c&&q.cell[1]===r),wet=trace.path.includes(i),g=piece(i,cx(c),cy(r),`${r+1}段目・左から${c+1}番目の${p.kinds[i]==='I'?'直線':'曲がり'}配管${need?'（'+need.label+'）':''}。タップで回転`);
   rect(g,-52,-52,104,104,14,'svg-socket'+(need?' checkpoint':''));const d=p.kinds[i]==='I'?'M0-55V55':'M0-55V-12Q0 0 12 0H55',inner=add(g,'g',{transform:`rotate(${v*90})`});line(inner,d,'svg-pipe');if(wet)line(inner,d,'svg-water'+(won?' flowing':''));
   if(need){circle(g,0,0,15,wet?'svg-pass':'svg-check');text(g,0,45,need.label,16,'middle','svg-tag');}});
 }else if(p.type==='plan'){
  const col=56,x0=26,floor=262,unit=34,report=planReport(p,state),cx=i=>x0+col*i+col/2;
  for(let k=1;k<=p.max;k++)line(svg,`M${x0} ${floor-unit*k}H${x0+col*n}`,'svg-grid');line(svg,`M${x0} ${floor}H${x0+col*n}`,'svg-track');
  text(svg,x0,32,'■ 台数  ━ 負荷',16,'start','svg-dim');text(svg,474,32,`合計 ${report.cost} / ${p.budget} 台`,18,'end',report.cost>p.budget?'svg-warn':'');
  state.forEach((v,i)=>{const bad=report.short.includes(i),fast=report.fast.includes(i),g=piece(i,cx(i),floor,`${p.slots[i]}：${v}台、必要な負荷 ${p.demand[i]}、処理能力 ${v*p.per}${bad?'、不足':''}${fast?'、増設が間に合わない':''}。上下キーで増減`);
   rect(g,-col/2,-unit*p.max-14,col,unit*p.max+14,0,'svg-hit');rect(g,-20,-unit*v,40,unit*v,6,'svg-bar'+(bad?' bad':''));text(g,0,-unit*v/2+7,String(v),19,'middle','svg-bar-label');
   if(fast)text(g,0,-unit*v-8,'急',17,'middle','svg-warn');text(svg,cx(i),floor+24,p.slots[i],16);text(svg,cx(i),floor+48,`負荷${p.demand[i]}`,15,'middle','svg-dim');});
  line(svg,p.demand.map((d,i)=>`${i?'L':'M'}${x0+col*i} ${floor-d*unit/p.per}H${x0+col*(i+1)}`).join(''),'svg-demand');
 }else if(p.type==='stage'){
  const report=stageReport(p,state),bx=b=>10+b*122,filled=p.stages.map(()=>0);
  p.stages.forEach((label,b)=>{const load=state.filter(v=>v===b).length;add(svg,'path',{d:`M${bx(b)} 64V424Q${bx(b)} 436 ${bx(b)+12} 436H${bx(b)+100}Q${bx(b)+112} 436 ${bx(b)+112} 424V64`,class:'svg-bin'+(load>p.cap?' bad':'')});text(svg,bx(b)+56,34,label,16);text(svg,bx(b)+56,55,`${load} / ${p.cap}`,15,'middle',load>p.cap?'svg-warn':'svg-dim');});
  state.forEach((v,i)=>{const late=feedback&&report.late.some(([,b])=>b===i),g=piece(i,bx(v)+56,96+filled[v]++*50,`${p.labels[i]}：${p.stages[v]}。左右のステージへドラッグ`);rect(g,-54,-21,108,42,12,'svg-token'+(late?' bad':''));text(g,0,6,p.labels[i],16);});
 }else if(p.type==='match'){
  const ly=i=>45+i*64,ry=j=>70+j*70;state.forEach((v,i)=>line(svg,`M215 ${ly(i)}C295 ${ly(i)} 285 ${ry(v)} 360 ${ry(v)}`,'svg-cable'+(won?' flowing':'')));
  p.options.forEach((label,j)=>{circle(svg,360,ry(j),22,'svg-port');text(svg,390,ry(j)+7,label,18,'start');});
  state.forEach((v,i)=>{const g=piece(i,215,ly(i),`${p.labels[i]}：${p.options[v]}につながっています。右の端子へドラッグ`);circle(g,0,0,20,'svg-plug');line(g,'M-6-6H6V6H-6Z','svg-icon');text(svg,188,ly(i)+7,p.labels[i],18,'end');});
 }else if(p.type==='relay'){
  const size=96,x0=10,y0=20,cx=c=>x0+size*c+size/2,cy=r=>y0+size*r+size/2,trace=traceRelay(p,state),at=i=>[cx(p.nodes[i][0]),cy(p.nodes[i][1])];
  for(let r=0;r<p.rows;r++)for(let c=0;c<p.cols;c++)circle(svg,cx(c),cy(r),3,'svg-bolt');
  const tip=trace.seen[trace.seen.length-1],[tx,ty]=at(tip),[dx,dy]=DIRS[state[tip]];let d=trace.seen.map((i,k)=>(k?'L':'M')+at(i).join(' ')).join('');
  if(trace.reached)d+=`L${cx(p.goal[0])} ${cy(p.goal[1])}`;line(svg,d,'svg-signal'+(won?' flowing':''));
  if(!trace.reached&&trace.loop===undefined){const far=Math.max(0,Math.min(dx?(dx>0?p.cols-1-p.nodes[tip][0]:p.nodes[tip][0]):(dy>0?p.rows-1-p.nodes[tip][1]:p.nodes[tip][1])))*size+30;line(svg,`M${tx} ${ty}l${dx*far} ${dy*far}`,'svg-signal lost');}
  rect(svg,cx(p.goal[0])-30,cy(p.goal[1])-30,60,60,12,trace.reached&&trace.ok?'svg-pass':'svg-port');text(svg,cx(p.goal[0]),cy(p.goal[1])+6,'受信',17,'middle',trace.reached&&trace.ok?'svg-ink':'');
  state.forEach((v,i)=>{const [x,y]=at(i),on=trace.seen.includes(i),g=piece(i,x,y,`${i===p.first?'送信局':'中継局'} ${i+1}：アンテナは${['上','右','下','左'][v]}向き。${on?'受信中':'未受信'}。タップで回転`);circle(g,0,0,30,'svg-dial'+(on?' on':''));if(i===p.first)circle(g,0,0,37,'svg-ring');const rotor=add(g,'g',{transform:`rotate(${v*90})`,class:'svg-rotor'});line(rotor,'M0 14V-22M-10-12 0-22 10-12','svg-antenna');circle(g,0,14,5,'svg-plug');});
 }

 const coords=e=>{const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const m=svg.getScreenCTM();return m?pt.matrixTransform(m.inverse()):null;},draggable=['deduce','stage','match'].includes(p.type);
 svg.addEventListener('pointerdown',e=>{const item=e.target.closest('[data-piece]');if(!item||won||e.button>0)return;const pt=coords(e);if(!pt)return;e.preventDefault();const i=Number(item.dataset.piece);drag={pointer:e.pointerId,i,start:pt,last:pt,moved:false,node:item};svg.setPointerCapture(e.pointerId);if(draggable)item.classList.add('dragging');if(p.type==='match')drag.preview=line(svg,`M${centers[i].x} ${centers[i].y}L${pt.x} ${pt.y}`,'svg-cable svg-preview');});
 svg.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.pointer)return;const pt=coords(e);if(!pt)return;drag.last=pt;drag.moved ||= Math.hypot(pt.x-drag.start.x,pt.y-drag.start.y)>8;if(!drag.moved||!draggable)return;const c=centers[drag.i];if(drag.preview)drag.preview.setAttribute('d',`M${c.x} ${c.y}Q280 ${pt.y} ${pt.x} ${pt.y}`);else drag.node.setAttribute('transform',`translate(${c.x+pt.x-drag.start.x} ${c.y+pt.y-drag.start.y})`);});
 const end=(e,cancel=false)=>{if(!drag||e.pointerId!==drag.pointer)return;const d=drag,c=centers[d.i],pt=d.last,next=[...state];drag=null;d.preview?.remove();d.node.classList.remove('dragging');d.node.setAttribute('transform',`translate(${c.x} ${c.y})`);if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);if(cancel)return;
  if(p.type==='plan'){const step=pt.y<c.y-34*state[d.i]?1:-1;if(stepValue(p,state,d.i,step)!==state[d.i])cycle(d.i,step);return;}
  if(!d.moved||!draggable){tap(d.i);return;}
  if(p.type==='deduce'){const j=slotAt(pt.x,pt.y,centers);if(j>=0&&j!==d.i)change(swapPieces(next,d.i,j),j);return;}
  if(p.type==='stage'){if(pt.y<0||pt.y>height)return;next[d.i]=Math.max(0,Math.min(p.stages.length-1,Math.floor((pt.x-4)/122)));}
  else{const j=slotAt(pt.x,pt.y,p.options.map((_,k)=>({x:360,y:70+k*70})),60);if(j<0)return;next[d.i]=j;}
  if(next[d.i]!==state[d.i])change(next,d.i);};
 svg.addEventListener('pointerup',e=>end(e));svg.addEventListener('pointercancel',e=>end(e,true));svg.addEventListener('lostpointercapture',e=>{if(drag)end(e,true);});svg.addEventListener('click',e=>{if(e.detail===0){const item=e.target.closest('[data-piece]');if(item&&!won)tap(Number(item.dataset.piece));}});
 if(still())svg.querySelectorAll('animateMotion').forEach(a=>a.parentNode.remove());return svg;
}

// Table-like puzzles use plain HTML controls: clearer on small screens and readable by assistive technology.
function drawHTML(p,state,{won=false,change}){
 const h=(tag,cls,t)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(t!==undefined)e.textContent=t;return e;},box=h('div','puzzle-table puzzle-'+p.type);
 const set=(i,v)=>{const next=[...state];next[i]=v;change(next,i);};
 const button=(i,label,aria,d=1)=>{const b=h('button','pz-piece',label);b.type='button';b.disabled=won;if(d===1)b.dataset.piece=i;b.setAttribute('aria-label',aria);b.addEventListener('click',()=>set(i,stepValue(p,state,i,d)));b.addEventListener('keydown',e=>{const back=['ArrowLeft','ArrowDown'].includes(e.key);if(back||['ArrowRight','ArrowUp'].includes(e.key)){e.preventDefault();set(i,stepValue(p,state,i,back?-1:1));}});return b;};
 if(p.type==='rule'){
  const picked=pickUsers(p,state),build=h('div','pz-builder');build.append(h('span','pz-paren','（'));
  state.forEach((v,i)=>{const b=button(i,i%2?OPS[v]:p.attrs[v],`${['①','②','③','④','⑤'][i]} ${i%2?'つなぎ方':'属性'}：${i%2?OPS[v]:p.attrs[v]}。タップで切り替え`);b.classList.add(i%2?'is-op':'is-attr');const wrap=h('span','pz-part');wrap.append(h('small','',['①','②','③','④','⑤'][i]),b);build.append(wrap);if(i===2)build.append(h('span','pz-paren','）'));});
  const table=h('table'),head=h('tr');head.append(h('th','','利用者'),...p.short.map(t=>h('th','',t)),h('th','','対象'));table.append(head);
  p.users.forEach((u,i)=>{const row=h('tr',(p.target.includes(i)?'is-wanted ':'')+(picked[i]?'is-picked':'')),name=h('th','',(p.target.includes(i)?'★ ':'')+u.name);name.scope='row';name.setAttribute('aria-label',u.name+(p.target.includes(i)?'（届けたい人）':''));row.append(name,...p.attrs.map((a,k)=>{const cell=h('td','',u.has.includes(k)?'●':'');if(u.has.includes(k))cell.setAttribute('aria-label',a);return cell;}));const result=h('td','pz-result'+(picked[i]===p.target.includes(i)?'':' is-wrong'),picked[i]?'対象':'—');row.append(result);table.append(row);});
  box.append(build,table);
 }else if(p.type==='matrix'){
  const table=h('table'),head=h('tr');head.append(h('td'),...p.cols.map(t=>h('th','',t)));table.append(head);
  p.rows.forEach((role,r)=>{const row=h('tr'),name=h('th','',role);name.scope='row';row.append(name);p.cols.forEach((perm,c)=>{const i=r*p.cols.length+c,cell=h('td'),b=button(i,state[i]?'✓':'',`${role}に${perm}：${state[i]?'付与':'なし'}。タップで切り替え`);b.setAttribute('aria-pressed',String(Boolean(state[i])));cell.append(b);row.append(cell);});table.append(row);});box.append(table);
 }else if(p.type==='slots'){
  const list=h('ol','pz-timeline');state.forEach((v,i)=>{const item=h('li',p.breaks[i].focus?'is-focus':''),info=h('span','pz-scene');info.append(h('small','',`区切り ${i+1}`),h('strong','',`直前の話題：${p.breaks[i].topic}${p.breaks[i].focus?' ★夢中':''}`));const b=button(i,p.options[v],`区切り${i+1}（直前の話題は${p.breaks[i].topic}${p.breaks[i].focus?'、視聴者は夢中':''}）：${p.options[v]}。タップで切り替え`);b.classList.toggle('is-empty',!v);item.append(info,b);list.append(item);});box.append(list);
 }else{
  const report=auctionReport(p,state),list=h('ul','pz-auctions');
  p.auctions.forEach((a,i)=>{const r=report.rows[i],item=h('li',r.won?(a.value<r.pay?'is-loss':'is-won'):''),facts=h('div','pz-facts'),bid=h('div','pz-bid'),stepper=(label,aria,d)=>{const b=h('button','pz-piece',label);b.type='button';b.setAttribute('aria-label',aria);b.disabled=won||state[i]+d<0||state[i]+d>=p.bids.length;b.addEventListener('click',()=>set(i,state[i]+d));return b;},minus=stepper('−',`${a.name}の入札額を下げる`,-1),plus=stepper('＋',`${a.name}の入札額を上げる。現在${r.bid?r.bid+'円':'見送り'}`,1);plus.dataset.piece=i;
   facts.append(h('strong','',a.name),h('span','',`価値 ${a.value}`),h('span','',`ライバル ${a.rival}`),h('span','',`最低価格 ${a.floor}`));bid.append(minus,h('output','',r.bid?`${r.bid}円`:'見送り'),plus,h('em','',r.won?`落札：${r.pay}円払う（${a.value-r.pay>=0?'+':''}${a.value-r.pay}）`:r.bid?'落札できず':'—'));item.append(facts,bid);list.append(item);});
  const total=h('p','pz-total');total.append(h('span',report.paid>p.budget?'is-over':'',`支払い ${report.paid} / ${p.budget}円`),h('span',report.gain>=p.goal?'is-good':'',`利益 ${report.gain} / 目標 ${p.goal}円`));box.append(list,total);
 }
 return box;
}
export function drawPuzzle(p,state,api){return HEIGHT[p.type]?drawSVG(p,state,api):drawHTML(p,state,api);}
