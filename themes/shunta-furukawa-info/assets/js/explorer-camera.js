const angleDelta=(to,from)=>Math.atan2(Math.sin(to-from),Math.cos(to-from));
// Follow the avatar's back, taking the shortest turn at a bounded angular speed.
export function followYaw(yaw,avatarYaw,dt,active=true){if(!active)return yaw;const delta=angleDelta(avatarYaw+Math.PI,yaw),step=delta*(1-Math.exp(-1.15*dt)),limit=.8*dt;return yaw+Math.max(-limit,Math.min(limit,step));}
export function minimapHeading(avatarYaw){return Math.PI-avatarYaw;}
export function signYaw(sign){return Math.atan2(sign.approach[0]-sign.x,sign.approach[1]-sign.z);}
// A held input keeps its world heading while the automatic camera turns.
// Releasing/changing the input, or manually rotating, uses the current camera.
export function createMovementFrame(){let anchor=0,input=null;return {reset(){input=null;},resolve(x,z,yaw,manual=false){if(Math.hypot(x,z)<.08){input=null;return yaw;}const direction=Math.atan2(x,z);if(input===null||manual||Math.abs(angleDelta(direction,input))>.18){anchor=yaw;input=direction;}return anchor;}};}
