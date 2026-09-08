import {RIVER,STONES,riverCenter,waterAt,riverWalkable,canReachCoin} from './explorer-river.js';
import {COINS,jumpStep} from './explorer-save.js';
import * as T from './vendor/three.module.js';
import {followYaw,signYaw,createMovementFrame} from './explorer-camera.js';
import {rounded} from './world-shapes.js';
import {pavingMaterial,planarUV,plazaLighting,areaMarker} from './plaza-art.js';
import {WORLD_PATHS} from './explorer-paths.js';
import {createAvatar} from './explorer-avatar.js';
import {buildHarbor,createArtifact,artifactImages,setArtifactColor} from './harbor-models.js';
import {BASE_SIGNS as SIGNS,WORLD_SCALE,WALK_SPEED,RUN_SPEED,SPAWN,movePlayer,movementVector,nearestSign} from './explorer-physics.js';

export function createExplorer(host,{onNear,onRead,onPosition,onFailure,onImages=()=>{},onCoin=()=>{},onFall=()=>{},reduced=false}) {
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0x111116);host.appendChild(renderer.domElement);
 renderer.domElement.setAttribute('aria-label','アバターで歩く3D空間。WASDまたは矢印キーで移動、Fで調べる。');renderer.domElement.tabIndex=0;
 const world=new T.Scene(),environment=new T.Group();world.add(environment);const camera=new T.PerspectiveCamera(52,1,.1,180);const lighting=plazaLighting(world,renderer);
 const palettes={pink:[0xff3b8d,0xba1f60,0xff81b5],white:[0xf1f1f3,0x9c9ca8,0xffffff],gray:[0x51515f,0x333340,0x737384],dark:[0x24242e,0x16161f,0x363644],black:[0x14141c,0x08080e,0x262631]};
 const solids=Object.fromEntries(Object.entries(palettes).map(([k,p])=>[k,new T.MeshStandardMaterial({color:p[0],roughness:k==='white'?.5:.72,metalness:.12})]));
 solids.pink.emissive.set(0xff3b8d);solids.pink.emissiveIntensity=.7;
 const luminousWhite=new T.MeshBasicMaterial({color:0xf5f3ff,toneMapped:false}),luminousAccent=new T.MeshBasicMaterial({color:0xff3b8d,toneMapped:false});
 function box(g,x,y,z,w,h,d,color='gray'){const m=new T.Mesh(new T.BoxGeometry(w,h,d),solids[color]);m.position.set(x*(g===environment?WORLD_SCALE:1),y,z*(g===environment?WORLD_SCALE:1));m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
 function mesh(g,geo,color,x=0,y=0,z=0){const m=new T.Mesh(geo,solids[color]);m.position.set(x*(g===environment?WORLD_SCALE:1),y,z*(g===environment?WORLD_SCALE:1));m.receiveShadow=true;g.add(m);return m;}
 const obstacles=SIGNS.map(s=>({x:s.x*WORLD_SCALE,z:s.z*WORLD_SCALE,r:.55}));
 const land=mesh(environment,planarUV(new T.CylinderGeometry(38*WORLD_SCALE,34*WORLD_SCALE,4,128)),'dark',0,-2.05,0);land.material=pavingMaterial(0x323542);
 // Continuous ribbons with round caps; one opaque material hides crossing seams.
 const roadVertices=[],roadIndices=[];
 for(const {points,width} of WORLD_PATHS){
  const base=roadVertices.length/3;
  points.forEach((p,i)=>{const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),nx=-dz/len*width/2,nz=dx/len*width/2;roadVertices.push(p[0]+nx,.009,p[1]+nz,p[0]-nx,.009,p[1]-nz);if(i<points.length-1){const v=base+i*2;roadIndices.push(v,v+2,v+1,v+1,v+2,v+3);}});
  for(const p of [points[0],points[points.length-1]]){const center=roadVertices.length/3;roadVertices.push(p[0],.009,p[1]);for(let i=0;i<=40;i++){const a=i/40*Math.PI*2;roadVertices.push(p[0]+Math.cos(a)*width/2,.009,p[1]+Math.sin(a)*width/2);if(i<40)roadIndices.push(center,center+i+2,center+i+1);}}
 }
 const roadGeometry=new T.BufferGeometry();roadGeometry.setAttribute('position',new T.Float32BufferAttribute(roadVertices,3));roadGeometry.setIndex(roadIndices);roadGeometry.computeVertexNormals();const roadSurface=mesh(environment,roadGeometry,'gray');planarUV(roadGeometry);roadSurface.material=pavingMaterial(0x5a5d6b);
 let accent="#ff3b8d",pickedCoins=new Set();const coinTransform=new T.Object3D(),coinField=new T.InstancedMesh(new T.TorusGeometry(.32,.085,10,24),solids.pink,COINS.length);coinField.instanceMatrix.setUsage(T.DynamicDrawUsage);environment.add(coinField);
 COINS.forEach((coin,i)=>{coinTransform.position.set(coin.x,coin.y,coin.z);coinTransform.updateMatrix();coinField.setMatrixAt(i,coinTransform.matrix);});coinField.computeBoundingSphere();

 const riverShape=new T.Shape();for(let i=0;i<=100;i++){const x=RIVER.start+(RIVER.end-RIVER.start)*i/100,z=riverCenter(x)-RIVER.halfWidth;i?riverShape.lineTo(x,z):riverShape.moveTo(x,z);}for(let i=100;i>=0;i--){const x=RIVER.start+(RIVER.end-RIVER.start)*i/100;riverShape.lineTo(x,riverCenter(x)+RIVER.halfWidth);}riverShape.closePath();const water=new T.Mesh(new T.ShapeGeometry(riverShape),new T.MeshStandardMaterial({color:0x162336,roughness:.24,metalness:.6,side:T.DoubleSide}));water.rotation.x=Math.PI/2;water.position.y=.045;environment.add(water);
 const bankMaterial=new T.MeshStandardMaterial({color:0x979eaf,roughness:.48,metalness:.28});for(const side of [-1,1]){const points=[];for(let i=0;i<=100;i++){const x=RIVER.start+(RIVER.end-RIVER.start)*i/100;points.push(new T.Vector3(x,.075,riverCenter(x)+side*(RIVER.halfWidth+.12)));}const bank=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),100,.055,6,false),bankMaterial);environment.add(bank);}
 const bridge=new T.Mesh(new T.BoxGeometry(RIVER.bridgeHalf*2,.16,5),solids.gray);bridge.position.set(RIVER.bridgeX,.07,riverCenter(RIVER.bridgeX));environment.add(bridge);for(let z=-2;z<=2;z+=.5){const plank=new T.Mesh(new T.BoxGeometry(3.2,.03,.07),solids.white);plank.position.set(RIVER.bridgeX,.17,riverCenter(RIVER.bridgeX)+z);environment.add(plank);}for(const stone of STONES){const m=new T.Mesh(new T.CylinderGeometry(stone.r,stone.r,.18,32),solids.white);m.position.set(stone.x,.07,stone.z);environment.add(m);}
 const ripples=[];for(let i=0;i<12;i++){const x=28+i*2,geo=new T.TorusGeometry(.3,.025,6,24,Math.PI);const m=new T.Mesh(geo,solids.gray);m.rotation.x=-Math.PI/2;m.position.set(x,.065,riverCenter(x));environment.add(m);ripples.push(m);}
 const rings=[],boards=new Map(),exhibits=new Map(),badges=new Map(),devices=new Map();let collected=new Set(),visited=new Set();
 function label(text,sub,status='近づいて調べる'){const canvas=document.createElement('canvas');canvas.width=768;canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle='#22222c';ctx.fillRect(0,0,768,256);ctx.fillStyle=accent;ctx.fillRect(0,0,768,16);ctx.font='bold 33px sans-serif';ctx.fillText(sub,35,78);ctx.fillStyle='#ffffff';let size=43;ctx.font=`bold ${size}px sans-serif`;while(ctx.measureText(text).width>698&&size>24){size--;ctx.font=`bold ${size}px sans-serif`;}ctx.fillText(text,35,158);ctx.fillStyle='#c2c2ce';ctx.font='28px sans-serif';ctx.fillText(status,35,215);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;return new T.MeshBasicMaterial({map:texture,side:T.DoubleSide,toneMapped:false});}
 for(const [index,sign] of SIGNS.entries()){
  const signMaterial=label(sign.title,sign.short),board=new T.Group();board.position.set(sign.x*WORLD_SCALE,2.15,sign.z*WORLD_SCALE);board.rotation.y=signYaw(sign);environment.add(board);
  const frame=new T.Mesh(rounded(3.34,1.20,.25,.07),solids.dark);frame.castShadow=true;frame.receiveShadow=true;board.add(frame);
  const face=new T.Mesh(new T.PlaneGeometry(3.18,1.06),signMaterial);face.position.z=.132;board.add(face);
  const reverse=face.clone();reverse.position.z=-.132;reverse.rotation.y=Math.PI;board.add(reverse);board.userData.faces=[face,reverse];boards.set(sign.id,board);
  const trim=new T.Mesh(rounded(3.18,.034,.045,.01),luminousAccent);trim.position.set(0,.578,.12);board.add(trim);
  for(const side of [-1,1]){const bolt=new T.Mesh(new T.SphereGeometry(.048,12,8),luminousWhite);bolt.position.set(side*1.48,.59,0);board.add(bolt);}
  box(environment,sign.x,1,sign.z,.24,2,.30,'white');box(environment,sign.x,.10,sign.z,.70,.16,.68,'dark');
  const artifact=new T.Mesh(new T.TorusGeometry(.20,.025,8,32),luminousAccent);artifact.position.set(sign.x*WORLD_SCALE,3.24,sign.z*WORLD_SCALE);environment.add(artifact);exhibits.set(sign.id,artifact);
  const device=createArtifact(sign.model);device.position.set(sign.x*WORLD_SCALE+Math.cos(board.rotation.y)*2.6,1.26,sign.z*WORLD_SCALE-Math.sin(board.rotation.y)*2.6);device.rotation.y=board.rotation.y;device.scale.setScalar(1.15);environment.add(device);
  const plinth=new T.Mesh(rounded(2.03,.35,1.60,.10),solids.dark);plinth.position.set(device.position.x,.18,device.position.z);plinth.rotation.y=board.rotation.y;plinth.castShadow=true;plinth.receiveShadow=true;environment.add(plinth);
  const light=new T.Mesh(new T.SphereGeometry(.10,16,12),solids.gray);light.position.copy(device.position).add(new T.Vector3(0,1.2,0));environment.add(light);devices.set(sign.id,{device,light,baseY:1.26,angle:board.rotation.y});
  const badge=new T.Group();badge.position.set(sign.x*WORLD_SCALE,3.65,sign.z*WORLD_SCALE);environment.add(badge);const points=[new T.Vector3(-.48,0,0),new T.Vector3(-.12,-.32,0),new T.Vector3(.55,.43,0)];for(let i=0;i<2;i++){const delta=points[i+1].clone().sub(points[i]);const stroke=new T.Mesh(new T.CylinderGeometry(.065,.065,delta.length(),16),luminousWhite);stroke.position.copy(points[i]).add(points[i+1]).multiplyScalar(.5);stroke.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());badge.add(stroke);}badge.visible=false;badges.set(sign.id,badge);
  const ring=mesh(environment,new T.TorusGeometry(1.72,.027,8,80,Math.PI*1.65),'pink',sign.x,.04,sign.z);ring.rotation.x=-Math.PI/2;ring.rotation.z=.5;rings.push({ring,sign});
  const baseRing=new T.Mesh(new T.RingGeometry(1.64,1.78,80),solids.dark);baseRing.rotation.x=-Math.PI/2;baseRing.position.copy(ring.position);baseRing.position.y=.026;environment.add(baseRing);
  const marker=areaMarker(index);marker.position.set(sign.x*WORLD_SCALE+Math.sin(board.rotation.y)*2.65,.03,sign.z*WORLD_SCALE+Math.cos(board.rotation.y)*2.65);marker.rotation.z=-board.rotation.y;environment.add(marker);
 }
 buildHarbor(environment,{scale:WORLD_SCALE,obstacles});
 const conversationCards=Array.from({length:3},()=>box(environment,-10,2,-7,1,.7,.5,'pink'));
 const packets=Array.from({length:12},()=>box(environment,0,0,0,.4,.4,.4,'pink'));
 const avatar=createAvatar(),{player,body,limbs}=avatar;player.position.set(SPAWN.x,0,SPAWN.z);world.add(player);
 const shadow=mesh(world,new T.CircleGeometry(.55,32),'black',0,.012,15);shadow.material=new T.MeshBasicMaterial({color:0x080910,transparent:true,opacity:.20,depthWrite:false});shadow.rotation.x=-Math.PI/2;
 function updateExhibits(){for(const sign of SIGNS){const owned=collected.has(sign.id),seen=visited.has(sign.id),board=boards.get(sign.id),old=board.userData.faces[0].material;old.map.dispose();old.dispose();const material=label(sign.title,sign.short,owned?'稼働中 ✓':seen?'未修復 · 調べて直す':'近づいて調べる');board.userData.faces.forEach(face=>face.material=material);exhibits.get(sign.id).visible=!owned;badges.get(sign.id).visible=owned;if(devices.has(sign.id))devices.get(sign.id).light.material=owned?solids.pink:solids.gray;}}
 const movementFrame=createMovementFrame();let manualUntil=0,walkingTime=0;const manualCamera=()=>{manualUntil=performance.now()+1400;};
 const keys=new Set();let stick={x:0,z:0},yaw=0,pitch=0,reading=false,motionReduced=reduced,running=false,frame=0,last=0,phase=0,time=0,near=null,drag=null,failed=false;
 let lastShore={...SPAWN},fallCooldown=0;let jumpState={phase:'ground',y:0,v:0};function jump(){if(!reading&&jumpState.phase==='ground')jumpState={phase:'launch',y:0,v:0,delay:.09};}
 const target=new T.Vector3(),desired=new T.Vector3(),offset=new T.Vector3();let first=true;
 function clearInput(){movementFrame.reset();walkingTime=0;keys.clear();running=false;stick={x:0,z:0};drag=null;}
 function interact(){if(reading||!near)return;
  const board=boards.get(near.id),r=host.getBoundingClientRect();let origin=null;
  if(board){board.updateWorldMatrix(true,false);const corners=[[-1.6,-.55],[1.6,-.55],[1.6,.55],[-1.6,.55]].map(([x,y])=>new T.Vector3(x,y,.1).applyMatrix4(board.matrixWorld).project(camera));
   if(corners.every(p=>p.z>-1&&p.z<1)){const xs=corners.map(p=>r.left+(p.x+1)*r.width/2),ys=corners.map(p=>r.top+(1-p.y)*r.height/2);origin={left:Math.min(...xs),top:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};}}
  onRead(near,origin);
 }
 const usable=e=>!reading&&!e.altKey&&!e.ctrlKey&&!e.metaKey&&!e.target.closest('button,a,input,textarea,select,summary,dialog');
 document.addEventListener('keydown',e=>{if(!usable(e))return;const key=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','q','e','shift','f','enter',' '].includes(key)){e.preventDefault();if(key===' '&&!e.repeat)jump();else if((key==='f'||key==='enter')&&!e.repeat)interact();else keys.add(key);}});
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
   const v=movementVector(ix,iz,movementFrame.resolve(ix,iz,yaw,Boolean(drag)||performance.now()<manualUntil)),speed=keys.has('shift')||running?RUN_SPEED:WALK_SPEED;const p=movePlayer(player.position,{x:v.x*speed*dt,z:v.z*speed*dt},obstacles,(x,z)=>riverWalkable(x,z,jumpState.y));moving=Math.hypot(p.x-player.position.x,p.z-player.position.z)>.0001;player.position.x=p.x;player.position.z=p.z;
   if(moving){const angle=Math.atan2(v.x,v.z);player.rotation.y+=Math.atan2(Math.sin(angle-player.rotation.y),Math.cos(angle-player.rotation.y))*Math.min(1,dt*14);phase+=dt*(speed===RUN_SPEED?16:11);}
  }
  if(!reading)jumpState=jumpStep(jumpState,dt);player.position.y=jumpState.y;fallCooldown=Math.max(0,fallCooldown-dt);if(!reading&&jumpState.y<=.08&&waterAt(player.position.x,player.position.z)){player.position.set(lastShore.x,0,lastShore.z);jumpState={phase:'ground',y:0,v:0};clearInput();first=true;if(!fallCooldown){onFall();fallCooldown=1;}}else if(!waterAt(player.position.x,player.position.z,.45)&&jumpState.phase==='ground')lastShore={x:player.position.x,z:player.position.z};
  const swing=moving?Math.sin(phase)*.6:0;for(const {side,leg,arm} of limbs){leg.rotation.x=swing*side;arm.rotation.x=-swing*side*.8;}body.position.y=moving&&!motionReduced?Math.abs(Math.sin(phase))*.045:0;
  const airborne=jumpState.phase==='air',crouch=['launch','land'].includes(jumpState.phase);body.scale.set(1,crouch?.88:1,1);if(airborne){for(const {side,leg,arm} of limbs){leg.rotation.x=.35+side*.15;arm.rotation.x=-1.1;arm.rotation.z=side*.18;}}else for(const {arm} of limbs)arm.rotation.z=0;
  COINS.forEach((coin,i)=>{if(!pickedCoins.has(coin.id)&&!reading&&canReachCoin(player.position,coin)){pickedCoins.add(coin.id);onCoin(coin.id);}coinTransform.position.set(coin.x,coin.y,coin.z);coinTransform.rotation.y=motionReduced?0:time*1.4;coinTransform.scale.setScalar(pickedCoins.has(coin.id)?1e-6:1);coinTransform.updateMatrix();coinField.setMatrixAt(i,coinTransform.matrix);});coinField.instanceMatrix.needsUpdate=true;

  shadow.scale.setScalar(1-jumpState.y*.12);
  shadow.position.set(player.position.x,.012,player.position.z);
  walkingTime=moving?walkingTime+dt:0;
  yaw=followYaw(yaw,player.rotation.y,dt,moving&&walkingTime>.3&&!reading&&!motionReduced&&!drag&&performance.now()>=manualUntil);
  target.copy(player.position).add(new T.Vector3(0,1.6,0));const distance=camera.aspect<.8?10.5:9;offset.set(Math.sin(yaw)*distance,6.2+pitch,Math.cos(yaw)*distance);desired.copy(target).add(offset);
  // Prevent scenery from hiding the avatar by shortening the camera boom.
  let boom=1;for(const o of obstacles){const dx=desired.x-target.x,dz=desired.z-target.z,t=T.MathUtils.clamp(((o.x-target.x)*dx+(o.z-target.z)*dz)/(dx*dx+dz*dz),0,1);if(t>.14&&Math.hypot(target.x+dx*t-o.x,target.z+dz*t-o.z)<o.r+.4)boom=Math.min(boom,Math.max(.28,t-.13));}desired.copy(target).addScaledVector(offset,boom);
  camera.position.lerp(desired,first||motionReduced?1:1-Math.exp(-10*dt));camera.lookAt(target);first=false;
  const next=nearestSign(player.position);if(next?.id!==near?.id){near=next;onNear(near);}rings.forEach(({ring,sign})=>{ring.visible=true;ring.material=collected.has(sign.id)?luminousWhite:near?.id===sign.id||visited.has(sign.id)?luminousAccent:solids.gray;});badges.forEach(m=>m.quaternion.copy(camera.quaternion));exhibits.forEach((m,id)=>{m.rotation.y=motionReduced?0:Math.sin(time*.6)*.18;});
  devices.forEach(({device,light,baseY,angle},id)=>{const working=collected.has(id);device.position.y=baseY+(working&&!motionReduced?Math.sin(time*2)*.06:0);device.rotation.y=angle+(working&&!motionReduced?Math.sin(time*.8)*.12:0);light.scale.setScalar(working&&!motionReduced?1+Math.sin(time*3)*.18:1);});
  packets.forEach((p,i)=>{p.visible=i<(simulation?12:4);p.position.set((11+(time*2+i*.6)%8)*WORLD_SCALE,3.2,(-15-(i%2))*WORLD_SCALE);});conversationCards.forEach((p,i)=>{p.visible=conversation==='repeat'||i===0;p.position.z=(conversation==='wait'?-10.4:-10-(time+i*.7)%4)*WORLD_SCALE;});
  ripples.forEach((m,i)=>{m.position.x=28+i*2+(motionReduced?0:Math.sin(time+i)*.22);});
  lighting.follow(player.position,near,dt);renderer.render(world,camera);onPosition({safe:!waterAt(player.position.x,player.position.z)&&jumpState.phase==='ground',x:player.position.x,z:player.position.z,avatarYaw:player.rotation.y,near:near?.id});
 }
 let simulation=false,conversation='match';
 function loop(t){frame=0;if(document.hidden||failed)return;const dt=Math.min((t-last)/1000,.04);last=t;draw(dt);frame=requestAnimationFrame(loop);}
 function resume(){if(!frame&&!failed&&!document.hidden){last=performance.now();frame=requestAnimationFrame(loop);}}
 document.addEventListener('visibilitychange',()=>{clearInput();resume();});canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();failed=true;clearInput();cancelAnimationFrame(frame);onFailure();});
 resize();draw(0);resume();setTimeout(()=>{try{onImages(artifactImages(SIGNS));}catch{}},0);
 return {jump,setCoins(ids){pickedCoins=new Set(ids);},setAccent(color){accent=color;solids.pink.color.set(color);solids.pink.emissive.set(color);luminousAccent.color.set(color);lighting.setAccent(color);avatar.setAccent(color);setArtifactColor(color);updateExhibits();try{onImages(artifactImages(SIGNS));}catch{}},restore(s){clearInput();const p=waterAt(s.position.x,s.position.z)||obstacles.some(o=>Math.hypot(o.x-s.position.x,o.z-s.position.z)<o.r+.5)?SPAWN:s.position;player.position.set(p.x,0,p.z);lastShore={x:p.x,z:p.z};player.rotation.y=s.yaw;yaw=s.yaw+Math.PI;jumpState={phase:'ground',y:0,v:0};first=true;},setCollected(ids){if(ids.length===collected.size&&ids.every(id=>collected.has(id)))return;collected=new Set(ids);updateExhibits();},setVisited(ids){visited=new Set(ids);updateExhibits();},getNearbyId(){return nearestSign(player.position)?.id||null;},setStick(x,z){stick={x,z};},clearInput,setReading(v){reading=v;clearInput();},interact,setReduced(v){motionReduced=v;},reset(){lastShore={...SPAWN};jumpState={phase:'ground',y:0,v:0};clearInput();player.position.set(SPAWN.x,0,SPAWN.z);yaw=0;pitch=0;player.rotation.y=Math.PI;manualUntil=0;first=true;},rotate(amount){manualCamera();yaw+=amount;},setRun(v){running=v;},setSimulate(v){simulation=v;},setConversation(v){conversation=v;},focus(){canvas.focus({preventScroll:true});}};
}
