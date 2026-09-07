// Shared, deterministic movement rules. Coordinates are horizontal world units.
export const WORLD_RADIUS=35;
export const PLAYER_RADIUS=.48;
export const SIGNS=[
 {id:'philosophy',title:'考え方と実験',short:'THINK & TRY',x:-10,z:-5},
 {id:'career-0',title:'2009 / エンジニアの基礎',short:'HISTORY 01',x:-21,z:6,career:0},
 {id:'career-1',title:'2009 / UI・UX',short:'HISTORY 02',x:-24,z:-3,career:1},
 {id:'career-2',title:'2013 / システム思考',short:'HISTORY 03',x:-20,z:-14,career:2},
 {id:'career-3',title:'2015 / マーケティング',short:'HISTORY 04',x:-10,z:-23,career:3},
 {id:'career-4',title:'2018— / ABEMA',short:'HISTORY 05',x:2,z:-25,career:4},
 {id:'work',title:'技術と実績',short:'ENGINEERING',x:15,z:-12},
 {id:'skills',title:'技術スタック',short:'TOOLBOX',x:23,z:0},
 {id:'knowledge',title:'知識をひらく',short:'AD TECH',x:16,z:13},
 {id:'connect',title:'これからの問い',short:'CONNECT',x:-10,z:15}
];
export function movementVector(x,z,yaw){const n=Math.max(1,Math.hypot(x,z));return {x:(x*Math.cos(yaw)+z*Math.sin(yaw))/n,z:(-x*Math.sin(yaw)+z*Math.cos(yaw))/n};}
export function movePlayer(position,delta,obstacles){let {x,z}=position;const steps=Math.max(1,Math.ceil(Math.hypot(delta.x,delta.z)/.2));
 const valid=(a,b)=>Math.hypot(a,b)<=WORLD_RADIUS-PLAYER_RADIUS&&!obstacles.some(o=>Math.hypot(a-o.x,b-o.z)<o.r+PLAYER_RADIUS);
 for(let i=0;i<steps;i++){const nx=x+delta.x/steps;if(valid(nx,z))x=nx;const nz=z+delta.z/steps;if(valid(x,nz))z=nz;}
 return {x,z};
}
export function nearestSign(position){let best=null,distance=3.5;for(const sign of SIGNS){const d=Math.hypot(sign.x-position.x,sign.z-position.z);if(d<distance){best=sign;distance=d;}}return best;}
