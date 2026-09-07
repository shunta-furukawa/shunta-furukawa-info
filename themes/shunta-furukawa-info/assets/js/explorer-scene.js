import * as T from './vendor/three.module.js';
import {followYaw,signYaw,createMovementFrame} from './explorer-camera.js';
import {WORLD_PATHS} from './explorer-paths.js';
import {createAvatar} from './explorer-avatar.js';
import {buildHarbor,createArtifact,whiteBoundary,artifactImages} from './harbor-models.js';
import {BASE_SIGNS as SIGNS,WORLD_SCALE,WALK_SPEED,RUN_SPEED,SPAWN,movePlayer,movementVector,nearestSign} from './explorer-physics.js';

export function createExplorer(host,{onNear,onRead,onPosition,onFailure,onImages=()=>{},reduced=false}) {
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0x111116);host.appendChild(renderer.domElement);
 renderer.domElement.setAttribute('aria-label','アバターで歩く3D空間。WASDまたは矢印キーで移動、Fで調べる。');renderer.domElement.tabIndex=0;
 const world=new T.Scene(),environment=new T.Group();world.add(environment);const camera=new T.PerspectiveCamera(52,1,.1,150);
 const palettes={pink:[0xff3b8d,0xba1f60,0xff81b5],white:[0xf1f1f3,0x9c9ca8,0xffffff],gray:[0x51515f,0x333340,0x737384],dark:[0x24242e,0x16161f,0x363644],black:[0x14141c,0x08080e,0x262631]};
 const mats=Object.fromEntries(Object.entries(palettes).map(([k,p])=>{const [f,s,t]=p.map(color=>new T.MeshBasicMaterial({color}));return [k,[s,s,t,s,f,f]];}));
 const solids=Object.fromEntries(Object.entries(palettes).map(([k,p])=>[k,new T.MeshBasicMaterial({color:p[0]})]));
 function box(g,x,y,z,w,h,d,color='gray'){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mats[color]);m.position.set(x*(g===environment?WORLD_SCALE:1),y,z*(g===environment?WORLD_SCALE:1));g.add(m);return m;}
 function mesh(g,geo,color,x=0,y=0,z=0){const m=new T.Mesh(geo,solids[color]);m.position.set(x*(g===environment?WORLD_SCALE:1),y,z*(g===environment?WORLD_SCALE:1));g.add(m);return m;}
 function facet(g,geo,color,x=0,y=0,z=0){const b=geo.index?geo.toNonIndexed():geo,n=b.getAttribute('normal'),p=palettes[color].map(v=>new T.Color(v)),v=[];for(let i=0;i<n.count;i+=3){const c=p[n.getY(i)>.35?2:n.getX(i)>.2||n.getZ(i)<-.2?1:0];for(let j=0;j<3;j++)v.push(c.r,c.g,c.b);}b.setAttribute('color',new T.Float32BufferAttribute(v,3));const m=new T.Mesh(b,new T.MeshBasicMaterial({vertexColors:true}));m.position.set(x*(g===environment?WORLD_SCALE:1),y,z*(g===environment?WORLD_SCALE:1));g.add(m);return m;}
 const obstacles=SIGNS.map(s=>({x:s.x*WORLD_SCALE,z:s.z*WORLD_SCALE,r:.55}));
 facet(environment,new T.CylinderGeometry(38*WORLD_SCALE,34*WORLD_SCALE,4,64),'dark',0,-2.05,0);
 // Continuous ribbons with round caps; one opaque material hides crossing seams.
 const roadVertices=[],roadIndices=[];
 for(const {points,width} of WORLD_PATHS){
  const base=roadVertices.length/3;
  points.forEach((p,i)=>{const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),nx=-dz/len*width/2,nz=dx/len*width/2;roadVertices.push(p[0]+nx,.009,p[1]+nz,p[0]-nx,.009,p[1]-nz);if(i<points.length-1){const v=base+i*2;roadIndices.push(v,v+2,v+1,v+1,v+2,v+3);}});
  for(const p of [points[0],points[points.length-1]]){const center=roadVertices.length/3;roadVertices.push(p[0],.009,p[1]);for(let i=0;i<=40;i++){const a=i/40*Math.PI*2;roadVertices.push(p[0]+Math.cos(a)*width/2,.009,p[1]+Math.sin(a)*width/2);if(i<40)roadIndices.push(center,center+i+2,center+i+1);}}
 }
 const roadGeometry=new T.BufferGeometry();roadGeometry.setAttribute('position',new T.Float32BufferAttribute(roadVertices,3));roadGeometry.setIndex(roadIndices);roadGeometry.computeVertexNormals();const roadSurface=mesh(environment,roadGeometry,'gray');roadSurface.material=mats.gray[2];
 const rings=[],boards=new Map(),exhibits=new Map(),badges=new Map();let collected=new Set(),visited=new Set();
 function label(text,sub,status='近づいて調べる'){const canvas=document.createElement('canvas');canvas.width=768;canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle='#22222c';ctx.fillRect(0,0,768,256);ctx.fillStyle='#ff3b8d';ctx.fillRect(0,0,768,16);ctx.font='bold 33px sans-serif';ctx.fillText(sub,35,78);ctx.fillStyle='#ffffff';let size=43;ctx.font=`bold ${size}px sans-serif`;while(ctx.measureText(text).width>698&&size>24){size--;ctx.font=`bold ${size}px sans-serif`;}ctx.fillText(text,35,158);ctx.fillStyle='#c2c2ce';ctx.font='28px sans-serif';ctx.fillText(status,35,215);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;return new T.MeshBasicMaterial({map:texture,side:T.DoubleSide});}
 for(const sign of SIGNS){box(environment,sign.x,1,sign.z,.22,2,.3,'white');const signMaterial=label(sign.title,sign.short);const board=new T.Mesh(new T.BoxGeometry(3.2,1.1,.18),[solids.dark,solids.dark,solids.dark,solids.dark,signMaterial,signMaterial]);board.position.set(sign.x*WORLD_SCALE,2.15,sign.z*WORLD_SCALE);board.rotation.y=signYaw(sign);environment.add(board);boards.set(sign.id,board);const artifact=createArtifact(sign.model);artifact.position.set(sign.x*WORLD_SCALE,3.65,sign.z*WORLD_SCALE);artifact.scale.setScalar(.9);environment.add(artifact);exhibits.set(sign.id,artifact);
  const badge=new T.Group();badge.position.set(sign.x*WORLD_SCALE,3.65,sign.z*WORLD_SCALE);environment.add(badge);const points=[new T.Vector3(-.48,0,0),new T.Vector3(-.12,-.32,0),new T.Vector3(.55,.43,0)];for(let i=0;i<2;i++){const delta=points[i+1].clone().sub(points[i]);const stroke=new T.Mesh(new T.CylinderGeometry(.085,.085,delta.length(),16),solids.white);stroke.position.copy(points[i]).add(points[i+1]).multiplyScalar(.5);stroke.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());badge.add(stroke);}badge.visible=false;badges.set(sign.id,badge);
  const ring=mesh(environment,new T.CylinderGeometry(1.35,1.35,.045,24),'pink',sign.x,.025,sign.z);rings.push({ring,sign});ring.visible=false;
 }
 buildHarbor(environment,{scale:WORLD_SCALE,obstacles});
 const conversationCards=Array.from({length:3},()=>box(environment,-10,2,-7,1,.7,.5,'pink'));
 const packets=Array.from({length:12},()=>box(environment,0,0,0,.4,.4,.4,'pink'));
 const {player,body,limbs}=createAvatar(solids);player.position.set(SPAWN.x,0,SPAWN.z);world.add(player);whiteBoundary(player,.018);
 const shadow=mesh(world,new T.CircleGeometry(.7,24),'black',0,.012,15);shadow.rotation.x=-Math.PI/2;
 function updateExhibits(){for(const sign of SIGNS){const owned=collected.has(sign.id),seen=visited.has(sign.id),board=boards.get(sign.id),old=board.material[4];old.map.dispose();old.dispose();const material=label(sign.title,sign.short,owned?'収集済み ✓':seen?'調査済み · アイテム未収集':'近づいて調べる');board.material[4]=material;board.material[5]=material;exhibits.get(sign.id).visible=!owned;badges.get(sign.id).visible=owned;}}
 const movementFrame=createMovementFrame();let manualUntil=0,walkingTime=0;const manualCamera=()=>{manualUntil=performance.now()+1400;};
 const keys=new Set();let stick={x:0,z:0},yaw=0,pitch=0,reading=false,motionReduced=reduced,running=false,frame=0,last=0,phase=0,time=0,near=null,drag=null,failed=false;
 const target=new T.Vector3(),desired=new T.Vector3(),offset=new T.Vector3();let first=true;
 function clearInput(){movementFrame.reset();walkingTime=0;keys.clear();stick={x:0,z:0};drag=null;}
 function interact(){if(reading||!near)return;
  const board=boards.get(near.id),r=host.getBoundingClientRect();let origin=null;
  if(board){board.updateWorldMatrix(true,false);const corners=[[-1.6,-.55],[1.6,-.55],[1.6,.55],[-1.6,.55]].map(([x,y])=>new T.Vector3(x,y,.1).applyMatrix4(board.matrixWorld).project(camera));
   if(corners.every(p=>p.z>-1&&p.z<1)){const xs=corners.map(p=>r.left+(p.x+1)*r.width/2),ys=corners.map(p=>r.top+(1-p.y)*r.height/2);origin={left:Math.min(...xs),top:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};}}
  onRead(near,origin);
 }
 const usable=e=>!reading&&!e.altKey&&!e.ctrlKey&&!e.metaKey&&!e.target.closest('button,a,input,textarea,select,summary,dialog');
 document.addEventListener('keydown',e=>{if(!usable(e))return;const key=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','q','e','shift','f','enter',' '].includes(key)){e.preventDefault();if((key==='f'||key==='enter'||key===' ')&&!e.repeat)interact();else keys.add(key);}});
 document.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',clearInput);
 const canvas=renderer.domElement;
 canvas.addEventListener('pointerdown',e=>{if(reading)return;canvas.focus({preventScroll:true});manualCamera();drag={id:e.pointerId,x:e.clientX,y:e.clientY,yaw,pitch};canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;manualCamera();yaw=drag.yaw-(e.clientX-drag.x)*.006;pitch=T.MathUtils.clamp(drag.pitch+(e.clientY-drag.y)*.015,-2,4);});
 const stopDrag=()=>drag=null;canvas.addEventListener('pointerup',stopDrag);canvas.addEventListener('pointercancel',stopDrag);
 function resize(){const r=host.getBoundingClientRect();renderer.setSize(Math.max(1,r.width),Math.max(1,r.height));camera.aspect=r.width/Math.max(1,r.height);camera.updateProjectionMatrix();first=true;}
 const observer=new ResizeObserver(resize);observer.observe(host);
 function draw(dt){time+=motionReduced?0:dt;
  let moving=false;if(!reading){if(keys.has('q')||keys.has('e'))manualCamera();if(keys.has('q'))yaw+=dt*1.6;if(keys.has('e'))yaw-=dt*1.6;
   const ix=stick.x+Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')),iz=stick.z+Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));
   const v=movementVector(ix,iz,movementFrame.resolve(ix,iz,yaw,Boolean(drag)||performance.now()<manualUntil)),speed=keys.has('shift')||running?RUN_SPEED:WALK_SPEED;const p=movePlayer(player.position,{x:v.x*speed*dt,z:v.z*speed*dt},obstacles);moving=Math.hypot(p.x-player.position.x,p.z-player.position.z)>.0001;player.position.x=p.x;player.position.z=p.z;
   if(moving){const angle=Math.atan2(v.x,v.z);player.rotation.y+=Math.atan2(Math.sin(angle-player.rotation.y),Math.cos(angle-player.rotation.y))*Math.min(1,dt*14);phase+=dt*(speed===RUN_SPEED?16:11);}
  }
  const swing=moving?Math.sin(phase)*.6:0;for(const {side,leg,arm} of limbs){leg.rotation.x=swing*side;arm.rotation.x=-swing*side*.8;}body.position.y=moving&&!motionReduced?Math.abs(Math.sin(phase))*.045:0;
  shadow.position.set(player.position.x,.012,player.position.z);
  walkingTime=moving?walkingTime+dt:0;
  yaw=followYaw(yaw,player.rotation.y,dt,moving&&walkingTime>.3&&!reading&&!motionReduced&&!drag&&performance.now()>=manualUntil);
  target.copy(player.position).add(new T.Vector3(0,1.6,0));const distance=camera.aspect<.8?10.5:9;offset.set(Math.sin(yaw)*distance,6.2+pitch,Math.cos(yaw)*distance);desired.copy(target).add(offset);
  // Prevent scenery from hiding the avatar by shortening the camera boom.
  let boom=1;for(const o of obstacles){const dx=desired.x-target.x,dz=desired.z-target.z,t=T.MathUtils.clamp(((o.x-target.x)*dx+(o.z-target.z)*dz)/(dx*dx+dz*dz),0,1);if(t>.14&&Math.hypot(target.x+dx*t-o.x,target.z+dz*t-o.z)<o.r+.4)boom=Math.min(boom,Math.max(.28,t-.13));}desired.copy(target).addScaledVector(offset,boom);
  camera.position.lerp(desired,first||motionReduced?1:1-Math.exp(-10*dt));camera.lookAt(target);first=false;
  const next=nearestSign(player.position);if(next?.id!==near?.id){near=next;onNear(near);}rings.forEach(({ring,sign})=>{ring.visible=near?.id===sign.id||collected.has(sign.id)||visited.has(sign.id);ring.material=collected.has(sign.id)?solids.white:solids.pink;});badges.forEach(m=>m.quaternion.copy(camera.quaternion));exhibits.forEach((m,id)=>{m.rotation.y=motionReduced?0:Math.sin(time*.6)*.18;});
  packets.forEach((p,i)=>{p.visible=i<(simulation?12:4);p.position.set((11+(time*2+i*.6)%8)*WORLD_SCALE,3.2,(-15-(i%2))*WORLD_SCALE);});conversationCards.forEach((p,i)=>{p.visible=conversation==='repeat'||i===0;p.position.z=(conversation==='wait'?-10.4:-10-(time+i*.7)%4)*WORLD_SCALE;});
  renderer.render(world,camera);onPosition({x:player.position.x,z:player.position.z,avatarYaw:player.rotation.y,near:near?.id});
 }
 let simulation=false,conversation='match';
 function loop(t){frame=0;if(document.hidden||failed)return;const dt=Math.min((t-last)/1000,.04);last=t;draw(dt);frame=requestAnimationFrame(loop);}
 function resume(){if(!frame&&!failed&&!document.hidden){last=performance.now();frame=requestAnimationFrame(loop);}}
 document.addEventListener('visibilitychange',()=>{clearInput();resume();});canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();failed=true;clearInput();cancelAnimationFrame(frame);onFailure();});
 resize();draw(0);resume();setTimeout(()=>{try{onImages(artifactImages(SIGNS));}catch{}},0);
 return {setCollected(ids){if(ids.length===collected.size&&ids.every(id=>collected.has(id)))return;collected=new Set(ids);updateExhibits();},setVisited(ids){visited=new Set(ids);updateExhibits();},getNearbyId(){return nearestSign(player.position)?.id||null;},setStick(x,z){stick={x,z};},clearInput,setReading(v){reading=v;clearInput();},interact,setReduced(v){motionReduced=v;},reset(){clearInput();player.position.set(SPAWN.x,0,SPAWN.z);yaw=0;pitch=0;player.rotation.y=Math.PI;manualUntil=0;first=true;},rotate(amount){manualCamera();yaw+=amount;},setRun(v){running=v;},setSimulate(v){simulation=v;},setConversation(v){conversation=v;},focus(){canvas.focus({preventScroll:true});}};
}
