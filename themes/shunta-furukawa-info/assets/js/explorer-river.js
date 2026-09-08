export const RIVER={start:20,end:53,halfWidth:1.55,bridgeX:25,bridgeHalf:1.7};
export const riverCenter=x=>8+Math.sin((x-20)*.17)*1.5;
export const STONES=[{x:43,z:riverCenter(43),r:.75}];
export function waterAt(x,z,margin=0){if(x<RIVER.start||x>RIVER.end)return false;if(Math.abs(x-RIVER.bridgeX)<RIVER.bridgeHalf-margin)return false;if(STONES.some(s=>Math.hypot(x-s.x,z-s.z)<s.r-margin))return false;return Math.abs(z-riverCenter(x))<RIVER.halfWidth+margin;}
export function riverWalkable(x,z,height){return height>.25||!waterAt(x,z,.3);}
// Coin IDs remain unchanged. The final 24 coins become optional jump-route rewards.
export function adventureCoins(coins){return coins.map((c,i)=>{if(i<coins.length-24)return {...c,z:waterAt(c.x,c.z)?riverCenter(c.x)+(c.z<riverCenter(c.x)?-2.3:2.3):c.z,y:.8};const j=i-(coins.length-24),lane=Math.floor(j/4),step=j%4,x=31+lane*3.7;return {...c,x,z:riverCenter(x)+(step-1.5)*2.15,y:step===1||step===2?2.4:.8};});}
export function canReachCoin(player,coin){return Math.hypot(player.x-coin.x,player.z-coin.z)<.9&&Math.abs(player.y+.8-coin.y)<.65;}
