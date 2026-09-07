import * as THREE from './vendor/three.module.js';

// Real perspective and discrete face colors: volume without gradients or outlines.
export async function createAvatarWorld(host,{onPins,onPick}) {
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));host.appendChild(renderer.domElement);
 const world=new THREE.Scene(),camera=new THREE.PerspectiveCamera(42,1,.1,350);
 const palettes={pink:[0xff3b8d,0xc62064,0xff7aae],white:[0xf4f3ee,0x92929e,0xffffff],gray:[0x666674,0x383842,0x9393a1],dark:[0x292932,0x17171f,0x454552],black:[0x15151c,0x0c0c12,0x292934]};
 const faceMaterials=Object.fromEntries(Object.entries(palettes).map(([name,p])=>{const [front,side,top]=p.map(color=>new THREE.MeshBasicMaterial({color}));return [name,[side,side,top,side,front,front]];}));
 const solidMaterials=Object.fromEntries(Object.entries(palettes).map(([name,p])=>[name,new THREE.MeshBasicMaterial({color:p[0]})]));
 function box(parent,x,y,z,w,h,d,color='gray'){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),faceMaterials[color]);mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
 function faceted(parent,geometry,color){let geo=geometry.index?geometry.toNonIndexed():geometry;const normal=geo.getAttribute('normal'),values=[];const shades=palettes[color].map(c=>new THREE.Color(c));for(let i=0;i<normal.count;i+=3){const n=new THREE.Vector3(normal.getX(i),normal.getY(i),normal.getZ(i));const shade=shades[n.y>.45?2:n.x>.2||n.z<-.3?1:0];for(let j=0;j<3;j++)values.push(shade.r,shade.g,shade.b);}geo.setAttribute('color',new THREE.Float32BufferAttribute(values,3));const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({vertexColors:true}));parent.add(m);return m;}
 function island(parent,x,y,z,r,color='dark'){const mesh=faceted(parent,new THREE.CylinderGeometry(r,r*.72,2.4,6),color);mesh.position.set(x,y-1.2,z);return mesh;}
 function route(parent,points,color='gray',radius=.18){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const m=new THREE.Mesh(new THREE.TubeGeometry(curve,32,radius,5,false),solidMaterials[color]);parent.add(m);return curve;}
 function gate(parent,x,y,z,color='white',scale=1){const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(scale);parent.add(g);box(g,-1.9,2.5,0,.85,5,1.4,color);box(g,1.9,2.5,0,.85,5,1.4,color);box(g,0,5,0,4.65,1,1.4,color);return g;}
 const groups=Array.from({length:5},(_,i)=>{const g=new THREE.Group();g.position.set(i*46,0,i%2*-9);world.add(g);return g;});
 const stations=[['philosophy',-7,-5],['career',7,-5],['work',-7,7],['knowledge',7,7]],picks=[],pinAnchors={};
 const hub=groups[0];
 for(const [key,x,z] of stations){const platform=island(hub,x,0,z,4.4);platform.userData.pick=key;picks.push(platform);const g=new THREE.Group();g.position.set(x,0,z);hub.add(g);
  if(key==='philosophy'){gate(g,0,0,0,'pink',.8);box(g,0,1.6,1,1.8,1.2,.65,'white');}
  if(key==='career'){for(let i=0;i<4;i++)box(g,-2+i*1.3,.4+i*.45,0,1.3,.8+i*.9,2,'white');}
  if(key==='work'){for(let i=0;i<3;i++)box(g,-1.8+i*1.8,1.6,Math.abs(i-1)*1.6,1.3,3.2,1.5,i===1?'pink':'white');}
  if(key==='knowledge'){for(let i=0;i<3;i++){const slab=box(g,0,.8+i*1.15,0,4,.55,3,i===1?'pink':'white');slab.rotation.y=i*.23;}}
  route(hub,[[0,-.2,0],[x*.45,-.2,z*.45],[x,-.2,z]],'gray',.22);
  const marker=new THREE.Object3D();marker.position.set(x,-.8,z+3.6);hub.add(marker);pinAnchors[key]=marker;
 }
 island(hub,0,.1,0,2.8,'pink');
 const central=faceted(hub,new THREE.TorusGeometry(2,.65,4,12),'white');central.position.y=3.2;central.rotation.y=.55;
 // Sprite is a small guide in the world, never the main scene surface.
 const spriteMaterial=new THREE.SpriteMaterial({transparent:true,alphaTest:.85,depthWrite:false});
 new THREE.TextureLoader().load('/images/world/mascot-walk.webp',texture=>{texture.colorSpace=THREE.SRGBColorSpace;spriteMaterial.map=texture;spriteMaterial.needsUpdate=true;mascots.forEach(m=>m.visible=true);invalidate();},undefined,()=>{});
 const mascots=[];
 function mascot(parent,x,y,z,size){const sprite=new THREE.Sprite(spriteMaterial);sprite.visible=false;sprite.position.set(x,y,z);sprite.scale.set(size*2/3,size,1);parent.add(sprite);mascots.push(sprite);return sprite;}
 mascot(hub,0,1.9,2,3.4);
 const philosophy=groups[1];island(philosophy,-8,0,0,4.5);island(philosophy,8,2,-3,4.5,'pink');
 const entryGate=gate(philosophy,-8,0,0,'white');entryGate.rotation.y=.2;
 const receivingGate=gate(philosophy,8,2,-3,'white');receivingGate.rotation.y=-.4;
 const conversationPath=route(philosophy,[[-8,2,0],[-3,3,3],[3,4,-2],[8,4,-3]],'gray',.3);
 const cards=Array.from({length:4},()=>box(philosophy,0,0,0,1.7,1.2,.65,'pink'));
 const barrier=box(philosophy,1,3.7,0,1,4.5,2.5,'pink');
 const career=groups[2],steps=[],careerPoints=[];
 for(let i=0;i<5;i++){const p=new THREE.Vector3((i-2)*5.7,i*1.25,Math.sin(i*1.4)*3);careerPoints.push(p);const s=island(career,p.x,p.y,p.z,2.9);s.userData.pick=i;picks.push(s);steps.push(box(career,p.x,p.y+.12,p.z,2.6,.24,2.6,'white'));const marker=box(career,p.x,p.y+1.7,p.z-1, .7,3.4,.7,'pink');marker.rotation.y=.4;}
 route(career,careerPoints.map(p=>[p.x,p.y-.3,p.z]),'white',.3);
 const walker=mascot(career,-11.4,2.2,0,4.4);
 const studio=groups[3],systems=[],flows=[];
 for(let mode=0;mode<3;mode++){const g=new THREE.Group();studio.add(g);systems.push(g);const pts=[[-9,0,4],[0,2,-3],[9,0,2]];for(let i=0;i<3;i++){const [x,y,z]=pts[i];island(g,x,y,z,i===1?4:3.5);if(i===1){for(let j=0;j<(mode===1?5:3);j++){const sx=x+(j%3-1)*1.8,sz=z+Math.floor(j/3)*2;box(g,sx,y+2,sz,1.25,4,1.5,j===1?'pink':'white');for(let k=0;k<3;k++)box(g,sx,y+1+k,sz+.8,.7,.18,.1,'black');}}else if(mode===2){for(let j=0;j<3;j++)box(g,x,y+.6+j, z,3,.5,2.5,j===1?'pink':'white');}else gate(g,x,y,z,i===0?'gray':'white',.7);}
  flows.push(route(g,[[-9,1,4],[-4,2,2],[0,3,-3],[5,2,-1],[9,1,2]],'gray',.3));}
 const packets=Array.from({length:16},()=>box(studio,0,0,0,.65,.65,.65,'pink'));
 island(groups[4],0,0,0,7);gate(groups[4],0,0,0,'pink',1.7);mascot(groups[4],0,2.2,2,4.4);
 // A continuous bridge gives camera travel foreground and distance cues.
 for(let i=0;i<4;i++)route(world,[[i*46+13,-3,i%2*-9],[(i+.5)*46,-6,-4],[(i+1)*46-13,-3,(i+1)%2*-9]],'dark',.6);
 let target=0,position=0,zone='map',careerIndex=0,workIndex=0,simulate=false,conversation='match',paused=false,frame=0,last=0,clock=0,width=1,height=1,orbit=0,tilt=0;
 const rect=()=>host.getBoundingClientRect();
 function resize(){const r=rect();width=Math.max(1,r.width);height=Math.max(1,r.height);renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();draw(0);}
 function draw(dt){position=paused?target:THREE.MathUtils.damp(position,target,7,dt);const mobile=width<=720;
  const index=Math.min(3,Math.floor(position)),f=Math.min(1,position-index),ease=f*f*(3-2*f);
  const focus=groups[index].position.clone().lerp(groups[index+1].position,ease);focus.y=2;
  const yaw=.32+Math.sin(position*1.4)*.18+orbit;const distance=mobile?(zone==='map'?40:34):39;
  camera.position.copy(focus).add(new THREE.Vector3(Math.sin(yaw)*distance,(.6+tilt)*distance,Math.cos(yaw)*distance));camera.lookAt(focus);
  // Fit the scene to its own viewport, instead of shrinking it behind a reading card.
  const sceneWidth=mobile?width:width*.58,sceneHeight=mobile?height*(zone==='map'?.62:.47):height;
  camera.clearViewOffset();camera.aspect=sceneWidth/sceneHeight;camera.updateProjectionMatrix();
  const walkerTarget=careerPoints[careerIndex].clone().add(new THREE.Vector3(0,2.4,.5));
  if(paused)walker.position.copy(walkerTarget);else walker.position.lerp(walkerTarget,1-Math.exp(-6*dt));
  steps.forEach((s,i)=>s.material=faceMaterials[i===careerIndex?'pink':'white']);systems.forEach((g,i)=>g.visible=i===workIndex);
  packets.forEach((p,i)=>{p.visible=i<(simulate?16:4);p.position.copy(flows[workIndex].getPointAt((clock*(simulate?.18:.07)+i/16)%1));p.rotation.set(clock*.5,clock*.4,0);});
  cards.forEach((c,i)=>{c.visible=conversation==='repeat'||i===0;const t=conversation==='wait'?.12:paused?.68:(clock*.14+i*.2)%1;c.position.copy(conversationPath.getPointAt(t));c.rotation.y=.4;});barrier.visible=conversation==='wait';
  central.rotation.y=.55+clock*.16;
  const vx=mobile?0:width-sceneWidth,vy=mobile&&zone!=='map'?height-sceneHeight:0;
  renderer.setScissorTest(false);renderer.setViewport(0,0,width,height);renderer.clear();renderer.setViewport(vx,vy,sceneWidth,sceneHeight);renderer.setScissor(vx,vy,sceneWidth,sceneHeight);renderer.setScissorTest(true);renderer.render(world,camera);
  if(zone==='map'){const out={};const r=rect();for(const [key,anchor] of Object.entries(pinAnchors)){const p=anchor.getWorldPosition(new THREE.Vector3()).project(camera);out[key]={x:r.left+vx+(p.x+1)*sceneWidth/2,y:r.top+height-vy-(p.y+1)*sceneHeight/2};}onPins(out);}
 }
 function loop(t){frame=0;if(paused||document.hidden)return;const dt=Math.min((t-last)/1000,.05);last=t;clock+=dt;draw(dt);frame=requestAnimationFrame(loop);}
 function resume(){if(!frame&&!paused&&!document.hidden){last=performance.now();frame=requestAnimationFrame(loop);}}
 function invalidate(){if(paused)draw(0);else resume();}
 const observer=new ResizeObserver(resize);observer.observe(host);document.addEventListener('visibilitychange',resume);
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let down;
 renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,orbit,tilt,moved:false};});
 renderer.domElement.addEventListener('pointermove',e=>{if(!down||e.pointerType==='touch')return;const dx=e.clientX-down.x,dy=e.clientY-down.y;if(Math.hypot(dx,dy)>7)down.moved=true;if(down.moved){orbit=THREE.MathUtils.clamp(down.orbit+dx*.004,-.5,.5);tilt=THREE.MathUtils.clamp(down.tilt+dy*.002,-.15,.2);invalidate();}});
 renderer.domElement.addEventListener('pointercancel',()=>down=null);
 renderer.domElement.addEventListener('pointerleave',()=>down=null);
 renderer.domElement.addEventListener('pointerup',e=>{if(!down)return;const dragged=down.moved||Math.hypot(e.clientX-down.x,e.clientY-down.y)>7;down=null;if(dragged)return;const r=rect(),mobile=width<=720,sw=mobile?width:width*.58,sh=mobile?height*(zone==='map'?.62:.47):height,vx=width-sw,top=mobile&&zone==='map'?height-sh:0;pointer.set((e.clientX-r.left-vx)/sw*2-1,-(e.clientY-r.top-top)/sh*2+1);ray.setFromCamera(pointer,camera);const eligible=picks.filter(p=>zone==='map'?typeof p.userData.pick==='string':zone==='career'&&typeof p.userData.pick==='number');const hit=ray.intersectObjects(eligible)[0];if(hit)onPick(hit.object.userData.pick);});
 resize();resume();
 return {setProgress(p,snap=false){target=p;if(snap||paused){position=p;draw(0);}},setZone(z){if(zone!==z){zone=z;orbit=0;tilt=0;invalidate();}},setCareer(i){careerIndex=i;invalidate();},setWork(i){workIndex=i;invalidate();},setSimulate(v){simulate=v;invalidate();},setConversation(v){conversation=v;invalidate();},setPaused(v){paused=v;if(v&&frame){cancelAnimationFrame(frame);frame=0;}position=target;draw(0);resume();}};
}
