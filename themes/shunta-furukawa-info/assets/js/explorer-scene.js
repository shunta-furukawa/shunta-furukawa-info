import {RIVER,STONES,riverCenter,waterAt,riverWalkable,canReachCoin,underCoin} from './explorer-river.js';
import {COINS,jumpStep} from './explorer-save.js';
import * as T from './vendor/three.module.js';
import {followYaw,signYaw,createMovementFrame} from './explorer-camera.js';
import {rounded} from './world-shapes.js';
import {pavingMaterial,planarUV,plazaLighting,areaMarker} from './plaza-art.js';
import {WORLD_PATHS} from './explorer-paths.js';
import {createAvatar} from './explorer-avatar.js';
import {buildHarbor,createArtifact,artifactImages,setArtifactColor} from './harbor-models.js';
import {BASE_SIGNS as SIGNS,WORLD_SCALE,WALK_SPEED,RUN_SPEED,SPAWN,movePlayer,movementVector,nearestSign} from './explorer-physics.js';

export function createExplorer(host,{onNear,onRead,onPosition,onFailure,onImages=()=>{},onCoin=()=>{},onCoinMiss=()=>{},onFall=()=>{},reduced=false}) {
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0x111116);host.appendChild(renderer.domElement);
 renderer.domElement.setAttribute('aria-label','アバターで歩く3D空間。WASDまたは矢印キーで移動、Fで調べる。');renderer.domElement.tabIndex=0;
 const world=new T.Scene(),environment=new T.Group();world.add(environment);const camera=new T.PerspectiveCamera(52,1,.1,180);const lighting=plazaLighting(world,renderer);
 const palettes={pink:[0xff3b8d,0xba1f60,0xff81b5],white:[0xf1f1f3,0x9c9ca8,0xffffff],gray:[0x51515f,0x333340,0x737384],dark:[0x24242e,0x16161f,0x363644],black:[0x14141c,0x08080e,0x262631]};
 const solids=Object.fromEntries(Object.entries(palettes).map(([k,p])=>[k,new T.MeshStandardMaterial({color:p[0],roughness:k==='white'?.5:.72,metalness:.12})]));
 solids.pink.emissive.set(0xff3b8d);solids.pink.emissiveIntensity=.7;
 const luminousWhite=new T.MeshBasicMaterial({color:0xf5f3ff,toneMapped:false}),luminousAccent=new T.MeshBasicMaterial({color:0xff3b8d,toneMapped:false});
 const beamOff=new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.03,depthWrite:false,side:T.DoubleSide,toneMapped:false}),beamOn=new T.MeshBasicMaterial({color:0xff3b8d,transparent:true,opacity:.13,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,toneMapped:false});
 function box(g,x,y,z,w,h,d,color='gray'){const m=new T.Mesh(new T.BoxGeometry(w,h,d),solids[color]);m.position.set(x*(g===environment?WORLD_SCALE:1),y,z*(g===environment?WORLD_SCALE:1));m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
 function mesh(g,geo,color,x=0,y=0,z=0){const m=new T.Mesh(geo,solids[color]);m.position.set(x*(g===environment?WORLD_SCALE:1),y,z*(g===environment?WORLD_SCALE:1));m.receiveShadow=true;g.add(m);return m;}
 const obstacles=SIGNS.map(s=>({x:s.x*WORLD_SCALE,z:s.z*WORLD_SCALE,r:.55}));
 const land=mesh(environment,planarUV(new T.CylinderGeometry(38*WORLD_SCALE,34*WORLD_SCALE,4,128)),'dark',0,-2.05,0);land.material=pavingMaterial(0x262834);
 // Continuous ribbons with round caps; one opaque material hides crossing seams.
 const roadVertices=[],roadIndices=[];
 for(const {points,width} of WORLD_PATHS){
  const base=roadVertices.length/3;
  points.forEach((p,i)=>{const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),nx=-dz/len*width/2,nz=dx/len*width/2;roadVertices.push(p[0]+nx,.009,p[1]+nz,p[0]-nx,.009,p[1]-nz);if(i<points.length-1){const v=base+i*2;roadIndices.push(v,v+2,v+1,v+1,v+2,v+3);}});
  for(const p of [points[0],points[points.length-1]]){const center=roadVertices.length/3;roadVertices.push(p[0],.009,p[1]);for(let i=0;i<=40;i++){const a=i/40*Math.PI*2;roadVertices.push(p[0]+Math.cos(a)*width/2,.009,p[1]+Math.sin(a)*width/2);if(i<40)roadIndices.push(center,center+i+2,center+i+1);}}
 }
 const roadGeometry=new T.BufferGeometry();roadGeometry.setAttribute('position',new T.Float32BufferAttribute(roadVertices,3));roadGeometry.setIndex(roadIndices);roadGeometry.computeVertexNormals();const roadSurface=mesh(environment,roadGeometry,'gray');planarUV(roadGeometry);roadSurface.material=pavingMaterial(0x474a5a);
 const inkOf=hex=>{const h=hex.slice(1);return .2126*parseInt(h.slice(0,2),16)+.7152*parseInt(h.slice(2,4),16)+.0722*parseInt(h.slice(4,6),16)>145?'#111116':'#ffffff';};
 let accent="#ff3b8d",pickedCoins=new Set();const coinTransform=new T.Object3D();
 // Coins are minted in three sizes. Each has a struck face on both sides and a milled rim;
 // the 10 also stands in a thin column of light so it can be spotted from a distance.
 function coinFaces(r,off){const a=new T.CircleGeometry(r,40),b=new T.CircleGeometry(r,40);a.translate(0,0,off);b.rotateY(Math.PI);b.translate(0,0,-off);const g=new T.BufferGeometry(),n=a.attributes.position.count;for(const k of ['position','normal','uv']){const A=a.attributes[k].array,B=b.attributes[k].array,out=new Float32Array(A.length+B.length);out.set(A);out.set(B,A.length);g.setAttribute(k,new T.BufferAttribute(out,a.attributes[k].itemSize));}g.setIndex([...a.index.array,...Array.from(b.index.array,v=>v+n)]);return g;}
 const mint=[[1,.3,.07],[5,.43,.09],[10,.58,.11]].map(([value,r,t])=>{const list=COINS.filter(c=>c.value===value),canvas=document.createElement('canvas');canvas.width=canvas.height=256;const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;
  const rim=new T.InstancedMesh(new T.CylinderGeometry(r,r,t,40,1,true).rotateX(Math.PI/2),value===1?solids.pink:solids.white,list.length),face=new T.InstancedMesh(coinFaces(r*.94,t/2+.004),new T.MeshBasicMaterial({map:texture,toneMapped:false}),list.length);
  for(const m of [rim,face]){m.instanceMatrix.setUsage(T.DynamicDrawUsage);m.frustumCulled=false;environment.add(m);}return {value,list,canvas,texture,rim,face};});
 const tens=mint[2],pillar=new T.InstancedMesh(new T.CylinderGeometry(.05,.42,7,16,1,true),beamOn,tens.list.length);pillar.instanceMatrix.setUsage(T.DynamicDrawUsage);pillar.frustumCulled=false;environment.add(pillar);
 function drawCoins(){for(const {value,canvas,texture} of mint){const ctx=canvas.getContext('2d'),ink=inkOf(accent),light=value===10;ctx.fillStyle=light?'#f5f5f9':accent;ctx.fillRect(0,0,256,256);
  ctx.strokeStyle=light?accent:ink;ctx.lineWidth=7;ctx.beginPath();ctx.arc(128,128,104,0,Math.PI*2);ctx.stroke();ctx.lineWidth=3;ctx.setLineDash([5,9]);ctx.beginPath();ctx.arc(128,128,90,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle=light?accent:ink;if(value===1){ctx.beginPath();ctx.moveTo(104,78);ctx.lineTo(104,178);ctx.lineTo(186,128);ctx.closePath();ctx.fill();}else{ctx.font=`900 ${value===10?104:136}px Unbounded,"Arial Black",sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(value),128,136);}
  texture.needsUpdate=true;}}

 const riverShape=new T.Shape();for(let i=0;i<=100;i++){const x=RIVER.start+(RIVER.end-RIVER.start)*i/100,z=riverCenter(x)-RIVER.halfWidth;i?riverShape.lineTo(x,z):riverShape.moveTo(x,z);}for(let i=100;i>=0;i--){const x=RIVER.start+(RIVER.end-RIVER.start)*i/100;riverShape.lineTo(x,riverCenter(x)+RIVER.halfWidth);}riverShape.closePath();const water=new T.Mesh(new T.ShapeGeometry(riverShape),new T.MeshStandardMaterial({color:0x162336,roughness:.24,metalness:.6,side:T.DoubleSide}));water.rotation.x=Math.PI/2;water.position.y=.045;environment.add(water);
 const bankMaterial=new T.MeshStandardMaterial({color:0x979eaf,roughness:.48,metalness:.28});for(const side of [-1,1]){const points=[];for(let i=0;i<=100;i++){const x=RIVER.start+(RIVER.end-RIVER.start)*i/100;points.push(new T.Vector3(x,.075,riverCenter(x)+side*(RIVER.halfWidth+.12)));}const bank=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),100,.055,6,false),bankMaterial);environment.add(bank);}
 const bridge=new T.Mesh(new T.BoxGeometry(RIVER.bridgeHalf*2,.16,5),solids.gray);bridge.position.set(RIVER.bridgeX,.07,riverCenter(RIVER.bridgeX));environment.add(bridge);for(let z=-2;z<=2;z+=.5){const plank=new T.Mesh(new T.BoxGeometry(3.2,.03,.07),solids.white);plank.position.set(RIVER.bridgeX,.17,riverCenter(RIVER.bridgeX)+z);environment.add(plank);}for(const stone of STONES){const m=new T.Mesh(new T.CylinderGeometry(stone.r,stone.r,.18,32),solids.white);m.position.set(stone.x,.07,stone.z);environment.add(m);}
 const ripples=[];for(let i=0;i<12;i++){const x=28+i*2,geo=new T.TorusGeometry(.3,.025,6,24,Math.PI);const m=new T.Mesh(geo,solids.gray);m.rotation.x=-Math.PI/2;m.position.set(x,.065,riverCenter(x));environment.add(m);ripples.push(m);}
 const rings=[],boards=new Map(),exhibits=new Map(),badges=new Map(),devices=new Map();let collected=new Set(),visited=new Set(),opened=null;
 // Each exhibit is a broadcast monitor: channel number, title and a lower third that reports its state.
 function label(sign,index,state=0){const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=576;const ctx=canvas.getContext('2d'),no=String(index+1).padStart(2,'0'),jp='"Zen Kaku Gothic New","Hiragino Sans",sans-serif',mono='ui-monospace,Menlo,monospace',ink=inkOf(accent);
  ctx.fillStyle='#07070b';ctx.fillRect(0,0,1024,576);
  ctx.font='900 400px Unbounded,"Arial Black",sans-serif';ctx.textAlign='right';ctx.lineWidth=7;ctx.strokeStyle=accent;ctx.globalAlpha=state===2?1:state<0?.32:.75;ctx.strokeText(no,1012,402);ctx.globalAlpha=1;ctx.textAlign='left';
  ctx.fillStyle='#ffffff0b';for(let y=0;y<576;y+=6)ctx.fillRect(0,y,1024,2);
  ctx.fillStyle=accent;ctx.fillRect(48,48,152,58);ctx.fillStyle=ink;ctx.font=`700 34px ${mono}`;ctx.fillText('CH.'+no,62,89);
  ctx.fillStyle='#f5f5f9';ctx.font=`700 36px ${jp}`;ctx.fillText(sign.short,224,90);
  let size=96;ctx.font=`900 ${size}px ${jp}`;while(ctx.measureText(sign.title).width>900&&size>48){size-=4;ctx.font=`900 ${size}px ${jp}`;}ctx.fillStyle='#ffffff';ctx.shadowColor='#07070b';ctx.shadowBlur=20;ctx.fillText(sign.title,48,332);ctx.shadowBlur=0;
  ctx.fillStyle=state===2?accent:'#16161f';ctx.fillRect(0,452,1024,124);ctx.fillStyle=state===2?ink:accent;if(state<0){ctx.fillStyle='#8b8da3';ctx.fillRect(60,502,28,24);ctx.lineWidth=5;ctx.strokeStyle='#8b8da3';ctx.beginPath();ctx.arc(74,502,10,Math.PI,0);ctx.stroke();ctx.font=`700 40px ${mono}`;ctx.fillText('LOCKED',104,529);ctx.fillStyle=accent;ctx.beginPath();ctx.arc(838,514,30,0,Math.PI*2);ctx.fill();ctx.fillStyle=ink;ctx.beginPath();ctx.moveTo(829,499);ctx.lineTo(829,529);ctx.lineTo(853,514);ctx.closePath();ctx.fill();ctx.fillStyle='#ffffff';ctx.font='900 56px Unbounded,"Arial Black",sans-serif';ctx.fillText(String(sign.cost),884,534);}else{ctx.beginPath();ctx.arc(74,514,13,0,Math.PI*2);state?ctx.fill():(ctx.lineWidth=5,ctx.strokeStyle=accent,ctx.stroke());ctx.font=`700 40px ${mono}`;ctx.fillText(['STANDBY','REC','ON AIR'][state],104,529);}
  if(state>=0){ctx.fillStyle=state===2?ink:'#c9cad6';ctx.font=`700 40px ${jp}`;ctx.textAlign='right';ctx.fillText(['近づいて調べる','未修復 · 調べて直す','稼働中'][state],976,529);}
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;return new T.MeshBasicMaterial({map:texture,side:T.DoubleSide,toneMapped:false});}
 for(const [index,sign] of SIGNS.entries()){
  const signMaterial=label(sign,index,-1),board=new T.Group();board.position.set(sign.x*WORLD_SCALE,2.5,sign.z*WORLD_SCALE);board.rotation.y=signYaw(sign);board.userData.index=index;environment.add(board);
  const frame=new T.Mesh(rounded(3.36,1.96,.2,.07),solids.black);frame.castShadow=true;frame.receiveShadow=true;board.add(frame);
  const face=new T.Mesh(new T.PlaneGeometry(3.2,1.8),signMaterial);face.position.z=.106;board.add(face);
  const reverse=face.clone();reverse.position.z=-.106;reverse.rotation.y=Math.PI;board.add(reverse);board.userData.faces=[face,reverse];boards.set(sign.id,board);
  // tally lamp: lights up when the exhibit is on air
  const tally=new T.Mesh(rounded(.5,.12,.16,.04),solids.gray);tally.position.y=1.05;board.add(tally);exhibits.set(sign.id,tally);
  box(environment,sign.x,.76,sign.z,.1,1.5,.1,'gray');const foot=new T.Mesh(new T.CylinderGeometry(.5,.56,.08,32),solids.black);foot.position.set(sign.x*WORLD_SCALE,.04,sign.z*WORLD_SCALE);foot.receiveShadow=true;environment.add(foot);
  const device=createArtifact(sign.model);device.position.set(sign.x*WORLD_SCALE+Math.cos(board.rotation.y)*2.6,1.26,sign.z*WORLD_SCALE-Math.sin(board.rotation.y)*2.6);device.rotation.y=board.rotation.y;device.scale.setScalar(1.15);environment.add(device);
  // a round stage under a studio spot
  const plinth=new T.Mesh(new T.CylinderGeometry(1.15,1.25,.3,48),solids.black);plinth.position.set(device.position.x,.15,device.position.z);plinth.castShadow=true;plinth.receiveShadow=true;environment.add(plinth);
  const halo=new T.Mesh(new T.TorusGeometry(1.0,.03,8,64),luminousAccent);halo.rotation.x=Math.PI/2;halo.position.set(device.position.x,.31,device.position.z);environment.add(halo);
  const beam=new T.Mesh(new T.CylinderGeometry(.14,1.15,5.3,40,1,true),beamOff);beam.position.set(device.position.x,2.96,device.position.z);environment.add(beam);
  const light=new T.Mesh(new T.CylinderGeometry(.2,.3,.3,24),solids.gray);light.position.set(device.position.x,5.75,device.position.z);environment.add(light);devices.set(sign.id,{device,light,beam,baseY:1.26,angle:board.rotation.y});
  const badge=new T.Group();badge.position.set(sign.x*WORLD_SCALE,3.65,sign.z*WORLD_SCALE);environment.add(badge);const points=[new T.Vector3(-.48,0,0),new T.Vector3(-.12,-.32,0),new T.Vector3(.55,.43,0)];for(let i=0;i<2;i++){const delta=points[i+1].clone().sub(points[i]);const stroke=new T.Mesh(new T.CylinderGeometry(.065,.065,delta.length(),16),luminousWhite);stroke.position.copy(points[i]).add(points[i+1]).multiplyScalar(.5);stroke.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());badge.add(stroke);}badge.visible=false;badges.set(sign.id,badge);
  const ring=mesh(environment,new T.TorusGeometry(1.72,.027,8,80,Math.PI*1.65),'pink',sign.x,.04,sign.z);ring.rotation.x=-Math.PI/2;ring.rotation.z=.5;rings.push({ring,sign});
  const baseRing=new T.Mesh(new T.RingGeometry(1.64,1.78,80),solids.dark);baseRing.rotation.x=-Math.PI/2;baseRing.position.copy(ring.position);baseRing.position.y=.026;environment.add(baseRing);
  const marker=areaMarker(index);marker.position.set(sign.x*WORLD_SCALE+Math.sin(board.rotation.y)*2.65,.03,sign.z*WORLD_SCALE+Math.cos(board.rotation.y)*2.65);marker.rotation.z=-board.rotation.y;environment.add(marker);
 }
 buildHarbor(environment,{scale:WORLD_SCALE,obstacles});
 // Neon signage: zone names on the studio roofs and an ON AIR gate at the entrance.
 const neon=[];
 function neonSign(text,small,w,h,x,y,z){const canvas=document.createElement('canvas');canvas.width=Math.round(256*w/h);canvas.height=256;const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;const material=new T.MeshBasicMaterial({map:texture,toneMapped:false,transparent:true}),group=new T.Group();group.position.set(x,y,z);for(const side of [1,-1]){const m=new T.Mesh(new T.PlaneGeometry(w,h),material);m.position.z=side*.03;m.rotation.y=side>0?0:Math.PI;group.add(m);}environment.add(group);neon.push({canvas,texture,text,small});return group;}
 function drawNeon(){for(const {canvas,texture,text,small} of neon){const ctx=canvas.getContext('2d'),W=canvas.width,display='Unbounded,"Arial Black",sans-serif';ctx.clearRect(0,0,W,256);ctx.fillStyle='#07070be6';ctx.fillRect(0,0,W,256);ctx.strokeStyle=accent;ctx.lineWidth=6;ctx.strokeRect(9,9,W-18,238);let size=132;ctx.font=`900 ${size}px ${display}`;while(ctx.measureText(text).width>W-120&&size>56){size-=4;ctx.font=`900 ${size}px ${display}`;}ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=accent;ctx.shadowColor=accent;ctx.shadowBlur=28;ctx.fillText(text,W/2,108);ctx.shadowBlur=0;ctx.fillStyle='#f5f5f9';ctx.font='700 30px ui-monospace,Menlo,monospace';ctx.fillText(small,W/2,208);texture.needsUpdate=true;}}
 [[0,12.5,6,4,'PROFILE','RECEPTION'],[-26,3,4.8,3.5,'CAREER','STUDIO A'],[-26,-10,4.8,3.5,'CAREER','STUDIO B'],[-9,-27,6,3.5,'CAREER','STUDIO C'],[16,-20,11,5,'WORK','MASTER CONTROL'],[-10,-10,6,4,'THINK','TALK ROOM'],[19,18,5,4,'ARCHIVE','LIBRARY'],[-10,10.5,6,4,'CONNECT','TRANSMITTER']].forEach(([x,z,w,d,text,small],i)=>neonSign(text,small,Math.min(w*.84,6),1.05,x*WORLD_SCALE,(i===4?4.6:3.7)+1.12,z*WORLD_SCALE+d/2-.2));
 for(const side of [-1,1])box(environment,side*2.8,3.2,19.1,.14,6.4,.14,'gray');box(environment,0,6.4,19.1,9.1,.14,.14,'gray');const gateZ=19.1*WORLD_SCALE,gateSign=neonSign('ON AIR','SHUNTA FURUKAWA · PORTFOLIO',6.4,1.45,0,5.3,gateZ);
 drawNeon();drawCoins();
 if(document.fonts?.load)Promise.all([document.fonts.load('900 40px Unbounded','ON AIR 0123456789'),document.fonts.load('900 40px "Zen Kaku Gothic New"','看板'),document.fonts.load('700 40px "Zen Kaku Gothic New"','看板')]).then(()=>{updateExhibits();drawNeon();drawCoins();}).catch(()=>{});
 const conversationCards=Array.from({length:3},()=>box(environment,-10,2,-7,1,.7,.5,'pink'));
 const packets=Array.from({length:12},()=>box(environment,0,0,0,.4,.4,.4,'pink'));
 const avatar=createAvatar(),{player,body,limbs}=avatar;player.position.set(SPAWN.x,0,SPAWN.z);world.add(player);
 const shadow=mesh(world,new T.CircleGeometry(.55,32),'black',0,.012,15);shadow.material=new T.MeshBasicMaterial({color:0x080910,transparent:true,opacity:.20,depthWrite:false});shadow.rotation.x=-Math.PI/2;
 function updateExhibits(){for(const sign of SIGNS){const owned=collected.has(sign.id),seen=visited.has(sign.id),board=boards.get(sign.id),old=board.userData.faces[0].material;old.map.dispose();old.dispose();const material=label(sign,board.userData.index,owned?2:seen?1:!opened||opened.has(sign.id)?0:-1);board.userData.faces.forEach(face=>face.material=material);exhibits.get(sign.id).material=owned?luminousAccent:solids.gray;badges.get(sign.id).visible=false;if(devices.has(sign.id)){const d=devices.get(sign.id);d.light.material=owned?luminousAccent:solids.gray;d.beam.material=owned?beamOn:beamOff;}}}
 const movementFrame=createMovementFrame();let manualUntil=0,walkingTime=0;const manualCamera=()=>{manualUntil=performance.now()+1400;};
 const keys=new Set();let stick={x:0,z:0},yaw=0,pitch=0,reading=false,motionReduced=reduced,running=false,frame=0,last=0,phase=0,time=0,near=null,drag=null,failed=false;
 let lastShore={...SPAWN},fallCooldown=0,missCooldown=0;let jumpState={phase:'ground',y:0,v:0};function jump(){if(!reading&&jumpState.phase==='ground')jumpState={phase:'launch',y:0,v:0,delay:.09};}
 const target=new T.Vector3(),desired=new T.Vector3(),offset=new T.Vector3();let first=true;
 function clearInput(){movementFrame.reset();walkingTime=0;keys.clear();running=false;stick={x:0,z:0};drag=null;}
 function interact(){if(reading||!near)return;
  const board=boards.get(near.id),r=host.getBoundingClientRect();let origin=null;
  if(board){board.updateWorldMatrix(true,false);const corners=[[-1.6,-.9],[1.6,-.9],[1.6,.9],[-1.6,.9]].map(([x,y])=>new T.Vector3(x,y,.1).applyMatrix4(board.matrixWorld).project(camera));
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
  if(!reading)jumpState=jumpStep(jumpState,dt);player.position.y=jumpState.y;fallCooldown=Math.max(0,fallCooldown-dt);missCooldown=Math.max(0,missCooldown-dt);if(!reading&&jumpState.y<=.08&&waterAt(player.position.x,player.position.z)){player.position.set(lastShore.x,0,lastShore.z);jumpState={phase:'ground',y:0,v:0};clearInput();first=true;if(!fallCooldown){onFall();fallCooldown=1;}}else if(!waterAt(player.position.x,player.position.z,.45)&&jumpState.phase==='ground')lastShore={x:player.position.x,z:player.position.z};
  const swing=moving?Math.sin(phase)*.6:0;for(const {side,leg,arm} of limbs){leg.rotation.x=swing*side;arm.rotation.x=-swing*side*.8;}body.position.y=moving&&!motionReduced?Math.abs(Math.sin(phase))*.045:0;
  const airborne=jumpState.phase==='air',crouch=['launch','land'].includes(jumpState.phase);body.scale.set(1,crouch?.88:1,1);if(airborne){for(const {side,leg,arm} of limbs){leg.rotation.x=.35+side*.15;arm.rotation.x=-1.1;arm.rotation.z=side*.18;}}else for(const {arm} of limbs)arm.rotation.z=0;
  for(const {value,list,rim,face} of mint){list.forEach((coin,i)=>{const gone=pickedCoins.has(coin.id);if(!gone&&!reading&&canReachCoin(player.position,coin)){pickedCoins.add(coin.id);onCoin(coin.id);}else if(!gone&&!reading&&missCooldown<=0&&jumpState.phase==='ground'&&underCoin(player.position,coin)){missCooldown=5;onCoinMiss(coin.id);}coinTransform.position.set(coin.x,coin.y+(motionReduced?0:Math.sin(time*2.2+coin.id)*.07),coin.z);coinTransform.rotation.set(0,motionReduced?.5:time*(value===10?2.1:1.5)+coin.id,0);coinTransform.scale.setScalar(pickedCoins.has(coin.id)?1e-6:1);coinTransform.updateMatrix();rim.setMatrixAt(i,coinTransform.matrix);face.setMatrixAt(i,coinTransform.matrix);if(value===10){coinTransform.position.y=coin.y+3.6;coinTransform.rotation.set(0,0,0);coinTransform.updateMatrix();pillar.setMatrixAt(i,coinTransform.matrix);}});rim.instanceMatrix.needsUpdate=true;face.instanceMatrix.needsUpdate=true;}pillar.instanceMatrix.needsUpdate=true;

  shadow.scale.setScalar(1-jumpState.y*.12);
  shadow.position.set(player.position.x,.012,player.position.z);
  walkingTime=moving?walkingTime+dt:0;
  yaw=followYaw(yaw,player.rotation.y,dt,moving&&walkingTime>.3&&!reading&&!motionReduced&&!drag&&performance.now()>=manualUntil);
  target.copy(player.position).add(new T.Vector3(0,1.6,0));const distance=camera.aspect<.8?10.5:9;offset.set(Math.sin(yaw)*distance,6.2+pitch,Math.cos(yaw)*distance);desired.copy(target).add(offset);
  // Prevent scenery from hiding the avatar by shortening the camera boom.
  let boom=1;for(const o of obstacles){const dx=desired.x-target.x,dz=desired.z-target.z,t=T.MathUtils.clamp(((o.x-target.x)*dx+(o.z-target.z)*dz)/(dx*dx+dz*dz),0,1);if(t>.14&&Math.hypot(target.x+dx*t-o.x,target.z+dz*t-o.z)<o.r+.4)boom=Math.min(boom,Math.max(.28,t-.13));}desired.copy(target).addScaledVector(offset,boom);
  camera.position.lerp(desired,first||motionReduced?1:1-Math.exp(-10*dt));camera.lookAt(target);first=false;
  const next=nearestSign(player.position);if(next?.id!==near?.id){near=next;onNear(near);}rings.forEach(({ring,sign})=>{ring.visible=true;ring.material=collected.has(sign.id)?luminousWhite:near?.id===sign.id||visited.has(sign.id)?luminousAccent:solids.gray;});badges.forEach(m=>m.quaternion.copy(camera.quaternion));
  devices.forEach(({device,light,baseY,angle},id)=>{const working=collected.has(id);device.position.y=baseY+(working&&!motionReduced?Math.sin(time*2)*.06:0);device.rotation.y=angle+(working&&!motionReduced?Math.sin(time*.8)*.12:0);});
  packets.forEach((p,i)=>{p.visible=i<(simulation?12:4);p.position.set((11+(time*2+i*.6)%8)*WORLD_SCALE,3.2,(-15-(i%2))*WORLD_SCALE);});conversationCards.forEach((p,i)=>{p.visible=conversation==='repeat'||i===0;p.position.z=(conversation==='wait'?-10.4:-10-(time+i*.7)%4)*WORLD_SCALE;});
  ripples.forEach((m,i)=>{m.position.x=28+i*2+(motionReduced?0:Math.sin(time+i)*.22);});
  gateSign.visible=!((camera.position.z-gateZ)*(player.position.z-gateZ)<0&&Math.abs(player.position.x)<9);
  lighting.follow(player.position,near,dt);renderer.render(world,camera);onPosition({safe:!waterAt(player.position.x,player.position.z)&&jumpState.phase==='ground',x:player.position.x,z:player.position.z,avatarYaw:player.rotation.y,near:near?.id});
 }
 let simulation=false,conversation='match';
 function loop(t){frame=0;if(document.hidden||failed)return;const dt=Math.min((t-last)/1000,.04);last=t;draw(dt);frame=requestAnimationFrame(loop);}
 function resume(){if(!frame&&!failed&&!document.hidden){last=performance.now();frame=requestAnimationFrame(loop);}}
 document.addEventListener('visibilitychange',()=>{clearInput();resume();});canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();failed=true;clearInput();cancelAnimationFrame(frame);onFailure();});
 resize();draw(0);resume();setTimeout(()=>{try{onImages(artifactImages(SIGNS));}catch{}},0);
 return {jump,setCoins(ids){pickedCoins=new Set(ids);},setAccent(color){accent=color;solids.pink.color.set(color);solids.pink.emissive.set(color);luminousAccent.color.set(color);beamOn.color.set(color);drawNeon();drawCoins();lighting.setAccent(color);avatar.setAccent(color);setArtifactColor(color);updateExhibits();try{onImages(artifactImages(SIGNS));}catch{}},restore(s){clearInput();const p=waterAt(s.position.x,s.position.z)||obstacles.some(o=>Math.hypot(o.x-s.position.x,o.z-s.position.z)<o.r+.5)?SPAWN:s.position;player.position.set(p.x,0,p.z);lastShore={x:p.x,z:p.z};player.rotation.y=s.yaw;yaw=s.yaw+Math.PI;jumpState={phase:'ground',y:0,v:0};first=true;},setCollected(ids){if(ids.length===collected.size&&ids.every(id=>collected.has(id)))return;collected=new Set(ids);updateExhibits();},setVisited(ids){visited=new Set(ids);updateExhibits();},setUnlocked(ids){opened=new Set(ids);updateExhibits();},getNearbyId(){return nearestSign(player.position)?.id||null;},setStick(x,z){stick={x,z};},clearInput,setReading(v){reading=v;clearInput();},interact,setReduced(v){motionReduced=v;},reset(){lastShore={...SPAWN};jumpState={phase:'ground',y:0,v:0};clearInput();player.position.set(SPAWN.x,0,SPAWN.z);yaw=0;pitch=0;player.rotation.y=Math.PI;manualUntil=0;first=true;},rotate(amount){manualCamera();yaw+=amount;},setRun(v){running=v;},setSimulate(v){simulation=v;},setConversation(v){conversation=v;},focus(){canvas.focus({preventScroll:true});}};
}
