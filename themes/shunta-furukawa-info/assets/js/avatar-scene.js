import * as THREE from './vendor/three.module.js';

// Flat, unlit geometry keeps the avatar's paper-cut palette across the world.
export async function createAvatarWorld(host,{onPins,onPick}) {
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));host.appendChild(renderer.domElement);
 const world=new THREE.Scene(),camera=new THREE.OrthographicCamera(-20,20,15,-15,.1,400);
 const colors={pink:0xff3b8d,white:0xf4f3ee,gray:0x727279,dark:0x25252c,black:0x111116};
 const materials=Object.fromEntries(Object.entries(colors).map(([k,c])=>[k,new THREE.MeshBasicMaterial({color:c})]));
 function box(parent,x,y,z,w,h,d,color='gray'){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),materials[color]);m.position.set(x,y,z);parent.add(m);return m;}
 function disk(parent,x,z,r,color){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,.35,48),materials[color]);m.position.set(x,0,z);parent.add(m);return m;}
 const groups=Array.from({length:5},(_,i)=>{const g=new THREE.Group();g.position.x=i*65;world.add(g);return g;});
 const stations=[['philosophy',-7,-5],['career',7,-5],['work',-7,6],['knowledge',7,6]],picks=[],pinAnchors={};
 const hub=groups[0];
 for(const [key,x,z] of stations){const platform=disk(hub,x,z,3.5,key==='philosophy'?'pink':'dark');platform.userData.pick=key;picks.push(platform);box(hub,x,.55,z,2,.7,2,'white');const marker=new THREE.Object3D();marker.position.set(x,.2,z+2.7);hub.add(marker);pinAnchors[key]=marker;}
 // A pair of solid routes, without wireframes or neon outlines.
 box(hub,0,-.2,0,17,.15,1,'gray');box(hub,0,-.2,0,1,.15,14,'gray');
 const texture=await new THREE.TextureLoader().loadAsync('/images/world/mascot-walk.webp');texture.colorSpace=THREE.SRGBColorSpace;
 function mascot(parent,x,y,z,size){const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,alphaTest:.85,depthWrite:false}));sprite.position.set(x,y,z);sprite.scale.set(size*2/3,size,1);parent.add(sprite);return sprite;}
 mascot(hub,0,3.3,0,7);
 const philosophy=groups[1];box(philosophy,0,0,0,23,.3,3,'dark');
 const cards=[];for(let i=0;i<3;i++)cards.push(box(philosophy,-8+i*7,1.4,0,2.7,1.8,.25,i===1?'pink':'gray'));
 const career=groups[2],steps=[];
 box(career,0,-.25,0,25,.25,1.2,'gray');
 for(let i=0;i<5;i++){const s=box(career,(i-2)*5.2,0,0,4,.65,4,i===0?'pink':'dark');s.userData.pick=i;picks.push(s);steps.push(s);box(career,(i-2)*5.2,.7,-1.4,1,.8,.3,'white');}
 const walker=mascot(career,-10.4,3.8,0,7);
 const studio=groups[3],systems=[];
 for(let mode=0;mode<3;mode++){const g=new THREE.Group();studio.add(g);systems.push(g);box(g,0,0,0,23,.2,.6,'gray');for(let i=0;i<3;i++){const x=(i-1)*8;box(g,x,.5,0,5,.5,5,'dark');if(mode===1&&i===1){for(let j=0;j<3;j++)box(g,x+(j-1)*1.6,1.8,0,1.1,2.2,2,'white');}else{box(g,x,2,0,3,2.6,1.5,i===1?'pink':'white');if(mode===2)box(g,x,2,.9,1.6,.35,.25,'black');}}}
 const packets=Array.from({length:12},()=>box(studio,0,.65,2, .6,.6,.6,'pink'));
 mascot(groups[4],0,4,0,10);disk(groups[4],0,0,6,'dark');
 let target=0,position=0,zone='map',careerIndex=0,workIndex=0,simulate=false,conversation='match',paused=false,frame=0,last=0,clock=0,width=1,height=1;
 const rect=()=>host.getBoundingClientRect();
 function resize(){const r=rect();width=Math.max(1,r.width);height=Math.max(1,r.height);renderer.setSize(width,height);const span=width<760?32*height/width:26;camera.left=-span*width/height/2;camera.right=span*width/height/2;camera.top=span/2;camera.bottom=-span/2;camera.updateProjectionMatrix();draw(0);}
 function draw(dt){position=THREE.MathUtils.damp(position,target,7,dt);const mobile=width<760;
  // Move through adjacent spaces, placing the scene beside (or above) its reading panel.
  const focus=new THREE.Vector3(position*65,0,0);camera.position.copy(focus).add(new THREE.Vector3(0,22,26));camera.lookAt(focus);
  camera.setViewOffset(width,height,mobile?0:-width*.22,mobile?height*(zone==='map'?-.19:.2):0,width,height);
  walker.position.x=THREE.MathUtils.damp(walker.position.x,(careerIndex-2)*5.2,6,dt);
  steps.forEach((s,i)=>s.material=materials[i===careerIndex?'pink':'dark']);systems.forEach((g,i)=>g.visible=i===workIndex);
  packets.forEach((p,i)=>{p.visible=i<(simulate?12:3);p.position.x=((clock*(simulate?5:2)+i*2)%24)-12;p.position.z=workIndex===1?((i%3)-1)*1.4:2;});
  cards.forEach((c,i)=>{c.visible=conversation==='repeat'||i===1;c.position.x=conversation==='wait'?-8:Math.sin(clock*.6+i)*6;});
  renderer.render(world,camera);
  if(zone==='map'){const out={};const r=rect();for(const [key,anchor] of Object.entries(pinAnchors)){const p=anchor.getWorldPosition(new THREE.Vector3()).project(camera);out[key]={x:r.left+(p.x+1)*width/2,y:r.top+(1-p.y)*height/2};}onPins(out);}
 }
 function loop(t){frame=0;if(paused||document.hidden)return;const dt=Math.min((t-last)/1000,.05);last=t;clock+=dt;draw(dt);frame=requestAnimationFrame(loop);}
 function resume(){if(!frame&&!paused&&!document.hidden){last=performance.now();frame=requestAnimationFrame(loop);}}
 const observer=new ResizeObserver(resize);observer.observe(host);
 document.addEventListener('visibilitychange',resume);
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let down;
 renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};});
 renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>7)return;down=null;const r=rect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const eligible=picks.filter(p=>zone==='map'?typeof p.userData.pick==='string':zone==='career'&&typeof p.userData.pick==='number');const hit=ray.intersectObjects(eligible)[0];if(hit)onPick(hit.object.userData.pick);});
 resize();resume();
 return {setProgress(p,snap=false){target=p;if(snap){position=p;draw(0);}},setZone(z){zone=z;},setCareer(i){careerIndex=i;},setWork(i){workIndex=i;},setSimulate(v){simulate=v;},setConversation(v){conversation=v;},setPaused(v){paused=v;if(v&&frame){cancelAnimationFrame(frame);frame=0;}else resume();}};
}
