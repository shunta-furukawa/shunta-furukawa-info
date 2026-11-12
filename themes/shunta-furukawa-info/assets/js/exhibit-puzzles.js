import {drawPuzzle} from './puzzle-svg.js';
import {burst,replay} from './pop-fx.js';
import {evaluate,solved,rotatePipe,COMMANDS} from './puzzle-logic.js';
export {evaluate,solved,rotatePipe};
// Standalone fictional teaching models, not production system specifications.
// Each puzzle borrows the theme of its exhibit; `debrief` is shown once it is solved.
const pos=(s,label)=>s.indexOf(label),cell=(s,r,c)=>s[r*4+c],rowSum=(s,r)=>[0,1,2,3].filter(c=>cell(s,r,c)).length,colSum=(s,c)=>[0,1,2].filter(r=>cell(s,r,c)).length;
const count=(s,v)=>s.filter(x=>x===v).length;
export const PUZZLES={
 'career-0':{type:'toggle',title:'回帰テストを、ぜんぶ緑に',
  intro:'保守中の業務システム（架空）で、テストが3項目落ちています。修正を当てると、線でつながった項目の結果が反転します。直したつもりが、別の場所を壊すことも。6項目すべてを緑にする修正の組み合わせを探そう。',
  lamps:['受注入力','在庫照会','請求計算','帳票出力','月次集計','通知メール'],start:[0,0,0,1,1,1],
  patches:[{label:'日付処理',flips:[3,4]},{label:'税計算',flips:[2,4]},{label:'コード変換',flips:[1,3,5]},{label:'入力チェック',flips:[0,2,4]},{label:'書式設定',flips:[0,1,5]},{label:'権限判定',flips:[0,5]}],
  initial:[0,0,0,0,0,0],answer:[1,1,1,0,0,1],
  hints:['同じ修正を2回当てると元に戻ります。大事なのは「どれを当てるか」だけで、順番は関係ありません。','「在庫照会」を反転できる修正は2つだけ。どちらか片方だけを当てる必要があります。','当てる修正は4つ。「入力チェック」と「書式設定」は当てません。'],
  success:'全項目が緑になりました。',debrief:'ひとつの修正が、離れた場所の結果を変える。既存システムの保守では、直すことと同じくらい「壊していないと確かめること」が仕事になります。'},
 'career-1':{type:'program',title:'ステージを組み立てる',
  intro:'5つの命令を並べて、キャラクターをゴールの旗まで導こう。途中のスターも必要です。命令列は最大3周くり返されます。1周目と2周目で、同じ手順が別の意味を持つように組むのがコツ。',
  cols:6,rows:4,loops:3,start:{x:2,y:1,d:2},goal:[5,0],stars:[[4,2]],walls:[[0,1],[5,3],[5,1]],holes:[[3,2],[5,2],[0,0],[1,0],[3,1],[2,2]],
  initial:[1,1,0,0,0],answer:[3,4,2,1,3],
  hints:['ジャンプは1マス飛び越えて2マス先に着地します。穴は飛び越えられますが、壁は越えられません。','1周でゴールする必要はありません。1周目でスターを取り、2周目でゴールへ向かいます。','最初の3つは「左を向く → ジャンプ → 右を向く」。残り2つで、スターを踏んでから向きを整えます。'],
  success:'スターを取ってゴール。ステージが完成しました。',debrief:'少ない操作のくり返しで、場面ごとに違う結果が生まれる。遊びの手触りは、ルールと配置の組み合わせから設計されます。'},
 'career-2':{type:'deduce',title:'聞く順番を設計する',
  intro:'架空の共同プロジェクトで、5人の関係者に1人ずつ話を聞きます。すべての条件を満たす順番は、ひとつだけ。札をドラッグ（または2つ選択）して入れ替えよう。',
  labels:['利用者','現場','開発','営業','経営'],
  rules:[{text:'利用者の話は、開発より先に聞く。',test:s=>pos(s,0)<pos(s,2)},{text:'経営は、最初でも最後でもない。',test:s=>pos(s,4)>0&&pos(s,4)<4},{text:'営業と現場は、続けて聞かない。',test:s=>Math.abs(pos(s,3)-pos(s,1))!==1},{text:'開発のすぐ後に、経営に話を聞く。',test:s=>pos(s,4)===pos(s,2)+1},{text:'現場は、利用者のすぐ後に聞く。',test:s=>pos(s,1)===pos(s,0)+1}],
  initial:[4,3,1,2,0],answer:[0,1,2,4,3],
  hints:['「すぐ後」の条件が2つあります。利用者→現場、開発→経営は、それぞれ2人1組で動かせます。','残る営業をどこに置くか。現場の隣には置けず、経営は最後になれません。','最初は利用者、最後は営業です。'],
  success:'5つの条件がすべて成り立ちました。',debrief:'要素をひとつずつ見るのではなく、関係の全体から答えを導く。複雑な問題を「系」として捉える練習です。'},
 'career-3':{type:'rule',title:'届ける相手を決める',
  intro:'架空のお知らせを、★の4人にだけ届けたい。3つの属性と2つのつなぎ方で条件を組み立てよう。条件は左から順に判定されます：（① ② ③）④ ⑤。対象になった人は、表の右端が点灯します。',
  attrs:['旅行に関心','料理に関心','20代','アプリ利用中','通知に同意'],short:['旅行','料理','20代','アプリ','同意'],
  users:[{name:'Aさん',has:[0,1,2,3]},{name:'Bさん',has:[1,3,4]},{name:'Cさん',has:[1,2,3]},{name:'Dさん',has:[1,2,4]},{name:'Eさん',has:[0,3,4]},{name:'Fさん',has:[0,2,3]},{name:'Gさん',has:[3,4]},{name:'Hさん',has:[1,2,4]}],target:[1,3,4,7],
  initial:[0,0,1,1,2],answer:[0,1,1,0,4],
  hints:['★の4人に共通する属性がひとつあります。ただしGさんも同じ属性を持っています。','★の4人は全員「通知に同意」。Gさんとの違いは、旅行か料理への関心があることです。','（旅行に関心 または 料理に関心）かつ 通知に同意。'],
  success:'★の4人だけが対象になりました。',debrief:'関心が合っていても、同意のない人には届けない。条件のつなぎ方ひとつで、届く相手は大きく変わります。'},
 'career-4':{type:'matrix',title:'権限を設計する',
  intro:'架空の広告管理画面で、3つの役割に操作権限を割り当てます。マスをタップして付与・取り消し。すべての条件を満たす割り当ては、ひとつだけです。',
  rows:['営業','運用','審査'],cols:['申込登録','入稿','承認','レポート'],
  rules:[{text:'どの操作にも、担当できる役割が1つ以上ある。',test:s=>[0,1,2,3].every(c=>colSum(s,c)>=1)},{text:'入稿と承認を、同じ役割に持たせない。',test:s=>[0,1,2].every(r=>!(cell(s,r,1)&&cell(s,r,2)))},{text:'申込登録と承認も、同じ役割に持たせない。',test:s=>[0,1,2].every(r=>!(cell(s,r,0)&&cell(s,r,2)))},{text:'営業は申込登録ができ、入稿はできない。',test:s=>Boolean(cell(s,0,0))&&!cell(s,0,1)},{text:'レポートを見られる役割は、ちょうど2つ。審査は含まない。',test:s=>colSum(s,3)===2&&!cell(s,2,3)},{text:'審査が持つ権限は、1つだけ。',test:s=>rowSum(s,2)===1},{text:'運用は、営業より多くの権限を持つ。',test:s=>rowSum(s,1)>rowSum(s,0)},{text:'付与する権限は、合計6つ（必要最小限）。',test:s=>count(s,1)===6}],
  initial:[1,1,0,0, 0,0,1,0, 0,0,0,1],answer:[1,0,0,1, 1,1,0,1, 0,0,1,0],
  hints:['確定できるマスから埋めます。レポートは営業と運用、営業は申込登録あり・入稿なし。','承認を持てるのは誰でしょう。申込登録や入稿を持つ役割は、承認を持てません。','承認は審査だけ。営業は申込登録とレポートの2つ、運用は申込登録・入稿・レポートの3つ。'],
  success:'作る人と認める人が分かれました。',debrief:'誰が何をできるかを決めることは、誰が何をできないかを決めること。業務の流れを理解してはじめて、権限は設計できます。'},
 'work-0':{type:'pipe',title:'配信ルートを開通させる',
  intro:'左の入口から右上のライブ画面まで、配管を回してつなごう。ただし途中で「マスタ連携」と「広告サーバー」の両方を通ること。使わない配管も混ざっています。',
  cols:4,rows:3,kinds:['I','L','L','I','L','I','I','I','L','L','L','L'],entry:{cell:[0,0],side:3},exit:{cell:[3,0],side:1},required:[{cell:[1,2],label:'マスタ連携',short:'M'},{cell:[2,1],label:'広告サーバー',short:'AD'}],
  initial:[0,0,3,0, 1,1,1,0, 2,2,1,0],answer:[1,2,1,1, 1,0,0,0, 0,0,3,0],
  hints:['水色の線は、入口からいま流れている範囲です。途切れた場所の配管を回してみよう。','経由地は下の段と中の段にあります。上の段をまっすぐ進むと、どちらも通れません。','入口から右へ1マス進んだら下へ。下の段でマスタ連携を通り、右隣から上へ戻って広告サーバーを通ります。'],
  success:'経由地を通って、ライブ画面まで開通しました。',debrief:'届けばよい、では足りない。必要な連携先を通る経路を、関係するしくみ全体で成立させる。新しい視聴形態への対応は、そういう仕事でした。'},
 'work-1':{type:'plan',title:'山場に備える',
  intro:'架空のライブ中継、8つの時間帯。棒をタップして、各時間帯のサーバー台数を決めよう。1台は負荷2まで処理できます。ただし増設は1区間に+1台まで（減らすのは自由）。開始前は1台。合計29台ぶんの予算で、一度も処理能力を切らさない計画は？',
  slots:['開場','前座','1試合','休憩','調整','2試合','決勝','終了'],demand:[2,3,8,4,3,10,12,4],per:2,before:1,maxUp:1,max:6,budget:29,
  initial:[1,2,4,2,2,5,6,2],answer:[2,3,4,3,4,5,6,2],
  hints:['最初の配置は「その時間に必要な分だけ」。でも増設は急にはできません。赤い印の区間を見てみよう。','山場から逆算します。決勝に6台必要なら、その前の区間には5台、さらに前には4台が要ります。','休憩で減らしすぎないこと。開場2台から始めて、休憩は3台、調整は4台に。'],
  success:'一度も処理能力を切らさず、予算内に収まりました。',debrief:'負荷が来てから増やしても間に合わない。だから山場から逆算して、事前に備える。負荷試験は、その見通しを確かめるための準備です。'},
 'work-2':{type:'stage',title:'リリースの段取りを組む',
  intro:'7つの作業を、4つのステージに振り分けよう。同じステージの作業は並行して進みますが、1ステージに入るのは2つまで。前提になる作業は、必ず前のステージで終わらせます。',
  labels:['バックアップ','差分の確認','切り戻し手順','自動テスト','承認','構成の適用','切替'],stages:['ステージ1','ステージ2','ステージ3','ステージ4'],cap:2,
  deps:[[1,4],[3,4],[4,5],[0,5],[5,6],[2,6]],
  initial:[0,0,0,0,0,0,0],answer:[1,0,2,0,1,2,3],
  hints:['条件は「→」で表示されています。差分の確認 → 承認 → 構成の適用 → 切替、の一本道が4ステージをちょうど使い切ります。','ステージ1に入るのは、承認の前提になる2つ。バックアップは入りきらないので、次のステージへ。','切り戻し手順は切替の前ならいつでもよさそうですが、空きがあるのはステージ3だけです。'],
  success:'前提がそろった順に、無理なく流れる段取りになりました。',debrief:'手順をコードにすると、順番と前提が誰の目にも見えるようになる。確認してから適用し、戻す手順も先に用意する。基盤の更新を安全に続けるための型です。'},
 skills:{type:'match',title:'道具と時代をつなぐ',
  intro:'6つの技術を、それを身につけた時代へつなごう。ケーブルの先を右の端子へドラッグ、またはタップで切り替え。答えは、経歴の5つの展示の中にあります。',
  labels:['ソフトウェアテスト','グラフィックデザイン','システム思考','Vue.js / React','API連携','Terraform'],options:['2009','2009–13','2013–15','2015–18','2018–'],
  initial:[4,0,3,1,2,0],answer:[0,1,2,3,3,4],
  hints:['経歴の展示は、メニューの「経歴」からいつでも読み返せます。各時代のタグに注目。','ひとつの時代に、2本つながります。','テスト→2009、デザイン→2009–13、システム思考→2013–15、Vue.js / ReactとAPI連携→2015–18、Terraform→2018–。'],
  success:'道具が、それぞれの時代に結びつきました。',debrief:'品質、体験、全体を見る視点、データ、そして基盤。いま使っている道具は、それぞれの時代に拾ってきたものです。'},
 philosophy:{type:'slots',title:'番組の時間に、そっと置く',
  intro:'架空の旅番組に、7つの区切りがあります。それぞれに広告をひとつ置くか、何も置かないかを決めよう。区切りをタップすると候補が切り替わります。すべての条件を満たす置き方は、ひとつだけ。',
  breaks:[{topic:'旅'},{topic:'料理'},{topic:'旅',focus:true},{topic:'旅'},{topic:'スポーツ'},{topic:'旅'},{topic:'旅'}],
  options:['なし','旅行会社','航空会社','食品','スポーツ用品'],kinds:[null,'旅','旅','料理','スポーツ'],
  rules:[{text:'直前の話題に合う広告だけを置く。',test:(s,p)=>s.every((v,i)=>!v||p.kinds[v]===p.breaks[i].topic)},{text:'視聴者が夢中になっている区切り（★）には、何も置かない。',test:(s,p)=>s.every((v,i)=>!v||!p.breaks[i].focus)},{text:'同じ広告をもう一度置くなら、間に2つ以上の区切りを空ける。',test:s=>s.every((v,i)=>!v||(s[i-1]!==v&&s[i-2]!==v))},{text:'3つ続けて広告を置かない。',test:s=>s.every((v,i)=>i<2||!(v&&s[i-1]&&s[i-2]))},{text:'本数は、旅行会社2回・航空会社1回・食品1回・スポーツ用品1回。',test:s=>count(s,1)===2&&count(s,2)===1&&count(s,3)===1&&count(s,4)===1},{text:'航空会社は、番組の後半（5番目以降）に置く。',test:s=>s.every((v,i)=>v!==2||i>=4)}],
  initial:[0,0,0,0,0,0,0],answer:[1,3,0,1,4,0,2],
  hints:['話題で候補が決まる区切りから埋めます。料理とスポーツの後は、それぞれ1種類しか置けません。','広告は全部で5本、区切りは7つ。空けるのは★と、もう1か所だけです。','旅行会社は1番目と4番目。6番目を空けて、最後に航空会社。'],
  success:'番組の流れを邪魔しない置き方が見つかりました。',debrief:'合う話題を選ぶだけでは足りない。タイミングと頻度、そして「いまは届けない」という判断まで含めて、出会いの設計だと考えています。'},
 knowledge:{type:'auction',title:'0.1秒のせり',
  intro:'5つの広告枠に、同時に入札します。方式はセカンドプライス：最高額で勝っても、支払うのは「ライバルの最高額（または最低価格）＋1円」。価値より高く払えば赤字です。予算600円以内で、利益（価値 − 支払い）を300円以上にしよう。',
  auctions:[{name:'枠A',value:300,rival:200,floor:200},{name:'枠B',value:500,rival:390,floor:200},{name:'枠C',value:300,rival:450,floor:100},{name:'枠D',value:300,rival:140,floor:100},{name:'枠E',value:300,rival:240,floor:200}],bids:[0,100,200,300,400,500],budget:600,goal:300,
  initial:[0,0,0,0,0],answer:[3,0,0,3,3],
  hints:['支払い額は自分の入札額では決まりません。勝てる額なら、いくらで入札しても支払いは同じです。','枠Cは勝つと赤字。枠Bは価値がいちばん高いけれど、支払いも大きく、ほかの枠の予算を圧迫します。','枠A・D・Eを取り、枠BとCは見送ります。'],
  success:'予算内で、目標の利益に届きました。',debrief:'払うのは2位の価格。だから「いくらで勝つか」ではなく「どの枠を取りにいくか」が戦略になります。実際の配信では、この判断が0.1秒ほどで行われます。'},
 connect:{type:'relay',title:'通信をつなぐ',
  intro:'左上寄りの送信局（◎）から出た信号を、7つの中継局すべてに1回ずつ通して、右上の受信局まで届けよう。局をタップするとアンテナが回ります。信号はアンテナの向きへまっすぐ進み、最初に当たった局が受け取ります。',
  cols:5,rows:4,nodes:[[1,1],[0,3],[3,3],[4,3],[0,1],[4,1],[0,0]],goal:[4,0],first:0,
  initial:[0,1,0,0,1,3,2],answer:[1,0,3,3,0,2,1],
  hints:['ピンクの線は、いま信号が届いている範囲です。途切れた局のアンテナを回そう。','受信局へ送れるのは、同じ段にある左上の局だけ。そこを最後にする順路を逆算します。','送信局から右へ。そのまま外周を時計回りに一周して、左上の局から受信局へ。'],
  success:'すべての局を通って、信号が外へ届きました。',debrief:'作ったものは、誰かに届いてはじめて意味を持つ。ここから先は、外の世界へつながっています。'}
};
const GESTURE={toggle:'修正をタップして、当てる／外すを切り替え',program:'枠をタップして命令を切り替え（←→キーでも操作できます）',deduce:'ドラッグで入れ替え / 2つタップでも操作できます',rule:'条件の部品をタップして切り替え',matrix:'マスをタップして付与／取り消し',pipe:'配管をタップして回転',plan:'棒の上の空きをタップで増設 ／ 棒をタップで減らす（↑↓キーでも操作できます）',stage:'作業を左右のステージへドラッグ / タップで次のステージへ',match:'ケーブルを右の端子へドラッグ / タップで切り替え',slots:'区切りをタップして候補を切り替え',auction:'＋／−で入札額を変更',relay:'局をタップしてアンテナを回転'};
export function mountPuzzle(host,{onSolve}){let id=null,state=[],selected=null,hint=0,won=false,owned=false,feedback=null,message='';const sessions=new Map();
 const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
 function render(){const p=PUZZLES[id];host.replaceChildren();if(!p)return;host.dataset.type=p.type;host.append(el('small','PUZZLE · 展示のしくみを動かす'),el('h3',p.title),el('p',p.intro));
  if(p.type==='stage')host.append(el('p','前提：'+p.deps.map(([a,b])=>`${p.labels[a]} → ${p.labels[b]}`).join(' ／ '),'puzzle-deps'));
  if(p.type==='program')host.append(el('p','命令：'+COMMANDS.slice(1).join(' ／ ')+`（最大${p.loops}周くり返し）`,'puzzle-deps'));
  const machine=drawPuzzle(p,state,{selected,won,feedback,change:(next,i)=>{state=next;selected=null;feedback=null;message='';render();boardFocus(i);},select:i=>{selected=i;render();boardFocus(i);}});host.append(machine);
  if(p.rules){const list=el('ol',undefined,'puzzle-rules');p.rules.forEach((r,i)=>{const li=el('li',r.text);const mark=won?true:feedback?.marks?.[i];if(mark!==undefined){li.className=mark?'is-met':'is-unmet';li.setAttribute('aria-label',r.text+(mark?'（成立）':'（未成立）'));}list.append(li);});host.append(list);}
  host.append(el('small',GESTURE[p.type],'puzzle-gesture'));
  const report=el('p',message,'puzzle-report');report.setAttribute('role','status');
  const actions=el('div',undefined,'puzzle-actions'),test=el('button',won?'稼働中 ✓':p.rules?'確かめる':'動かす');test.type='button';test.disabled=won;test.onclick=()=>{const r=evaluate(p,state);feedback=r;if(r.ok){won=true;sessions.set(id,{state:[...state],won:true});const doneId=id;message='';render();const stage=host.closest('dialog')||host,stamp=el('div','CLEAR!','puzzle-stamp');stamp.setAttribute('aria-hidden','true');stamp.addEventListener('animationend',e=>{if(e.animationName==='pop-stamp-out')stamp.remove();});stage.querySelector(':scope > .puzzle-stamp')?.remove();stage.append(stamp);burst(stage,70);onSolve(doneId);}else{message=r.issues.join(' ')||'まだ条件が揃っていません。';render();replay(host,'is-wrong');host.querySelector('.puzzle-actions button')?.focus({preventScroll:true});}};
  const help=el('button',hint?`ヒント ${Math.min(hint,p.hints.length)} / ${p.hints.length}`:'ヒント');help.type='button';help.onclick=()=>{message='ヒント：'+p.hints[Math.min(hint++,p.hints.length-1)];render();};
  const reset=el('button','やり直す');reset.type='button';reset.onclick=()=>{state=[...p.initial];won=false;selected=null;hint=0;feedback=null;message='';render();};actions.append(test,help,reset);host.append(actions,report);
  if(won){report.textContent=p.success+(owned?'（獲得済み）':'');const memo=el('div',undefined,'puzzle-debrief');memo.append(el('small','この模型が伝えたいこと'),el('p',p.debrief));host.append(memo);}
  host.append(el('small','説明用の架空モデルです。実際の業務手順・配信ルール・数値を示すものではありません。','puzzle-note'));host.classList.toggle('puzzle-running',won);host.classList.remove('is-wrong');}
 function boardFocus(i){if(i===undefined||i===null)return;host.querySelector(`[data-piece="${i}"]`)?.focus({preventScroll:true});}
 return {show(next,isOwned){if(id&&id!==next)sessions.set(id,{state:[...state],won});if(next!==id){id=next;const old=sessions.get(id);state=old?.state||[...((isOwned?PUZZLES[id]?.answer:PUZZLES[id]?.initial)||[])];won=old?.won??isOwned;selected=null;hint=0;feedback=null;message='';}owned=isOwned;render();},clear(){id=null;sessions.clear();host.replaceChildren();},claim(){if(id&&won)onSolve(id);}};
}
