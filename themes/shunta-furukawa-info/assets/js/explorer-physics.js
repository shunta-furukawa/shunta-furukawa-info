import catalog from './harbor-catalog.json' with {type:'json'};
// Shared, deterministic movement rules. Coordinates are horizontal world units.
export const WORLD_SCALE=1.6;
export const WORLD_RADIUS=35*WORLD_SCALE;
export const WALK_SPEED=8;
export const RUN_SPEED=13;
export const SPAWN={x:0,z:21*WORLD_SCALE};
export const PLAYER_RADIUS=.48;
export const BASE_SIGNS=catalog;
export const SIGNS=BASE_SIGNS.map(s=>({...s,x:s.x*WORLD_SCALE,z:s.z*WORLD_SCALE}));
export function movementVector(x,z,yaw){const n=Math.max(1,Math.hypot(x,z));return {x:(x*Math.cos(yaw)+z*Math.sin(yaw))/n,z:(-x*Math.sin(yaw)+z*Math.cos(yaw))/n};}
export function movePlayer(position,delta,obstacles){let {x,z}=position;const steps=Math.max(1,Math.ceil(Math.hypot(delta.x,delta.z)/.2));
 const valid=(a,b)=>Math.hypot(a,b)<=WORLD_RADIUS-PLAYER_RADIUS&&!obstacles.some(o=>Math.hypot(a-o.x,b-o.z)<o.r+PLAYER_RADIUS);
 for(let i=0;i<steps;i++){const nx=x+delta.x/steps;if(valid(nx,z))x=nx;const nz=z+delta.z/steps;if(valid(x,nz))z=nz;}
 return {x,z};
}
export function nearestSign(position){let best=null,distance=3.5;for(const sign of SIGNS){const d=Math.hypot(sign.x-position.x,sign.z-position.z);if(d<distance){best=sign;distance=d;}}return best;}
