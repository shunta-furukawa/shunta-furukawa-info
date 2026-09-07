// A deliberately small public explanation model, not production ad logic.
const candidates={
 travel:{topic:'旅',title:'週末を、知らない街で。',label:'TRAVEL'},
 food:{topic:'料理',title:'旬の食材を、食卓へ。',label:'FOOD'},
 sports:{topic:'スポーツ',title:'次の一歩を支える一足。',label:'SPORTS'}
};
export function decideConversation(interest,timing,frequency){
 const ad=candidates[interest];
 if(!ad||!['break','focus'].includes(timing))throw new Error('Unknown context');
 if(timing==='focus')return {...ad,state:'wait',heading:'今は、話しかけない。',reason:`${ad.topic}への関心があっても、夢中で見ている時間を優先。このモデルでは、番組の区切りを待ちます。`,visual:'関心があっても、タイミングが合わなければ待つ。'};
 if(!frequency)return {...ad,state:'repeat',heading:'届く。でも、繰り返しすぎかもしれない。',reason:`${ad.topic}に合う広告を選べても、同じ話が続けば負担になる。関連性だけで「よい出会い」とは決められません。`,visual:'相手に合う話でも、繰り返しすぎれば変わる。'};
 return {...ad,state:'match',heading:'いまに合う、ひとつのきっかけ。',reason:`${ad.topic}の文脈に合う候補を、番組の区切りに。繰り返しを抑えて届ける判断です。好意や成果は、配信後の検証が必要です。`,visual:'相手の関心と、伝えたい価値が重なる。'};
}
