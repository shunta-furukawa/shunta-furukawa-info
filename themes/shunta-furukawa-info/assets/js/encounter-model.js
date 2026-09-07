// Fictional, deterministic teaching model. No profiling, tracking, bidding or inference.
export const contexts = { travel: '旅のドキュメンタリー', food: '料理番組', sports: 'スポーツ中継' };
export const inventory = {
  travel: [{name:'次の旅を、鉄道で。',seen:4},{name:'週末を、知らない街で。',seen:0},{name:'旅に連れていく一足。',seen:1}],
  food: [{name:'旬の食材を、食卓へ。',seen:4},{name:'料理が楽しくなる道具。',seen:0},{name:'週末に味わう、新しい一皿。',seen:1}],
  sports: [{name:'次の一歩を支えるシューズ。',seen:4},{name:'動いたあとの、水分補給。',seen:0},{name:'観る楽しさを、スタジアムで。',seen:1}]
};
export function selectEncounter(context, cap) {
  const candidates = inventory[context];
  if (!candidates) throw new Error('Unknown context');
  const selected = candidates.find(ad => !cap || ad.seen < 3);
  return { candidates, selected, reason: cap
    ? `${contexts[context]}に関連する候補から選定。4回表示済みの広告を外し、まだ表示していない広告を選びました。`
    : `${contexts[context]}に関連する候補の先頭を選定。頻度を考慮しないため、4回表示済みの広告がもう一度選ばれます。` };
}
