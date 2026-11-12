import * as T from './vendor/three.module.js';
import {rounded,batchStatic} from './world-shapes.js';
const colors={black:0x14151d,white:0xeeeff5,pink:0xff3b8d,gray:0x565a70};
const materials=Object.fromEntries(Object.entries(colors).map(([k,color])=>[k,new T.MeshStandardMaterial({color,roughness:k==='white'?.42:.68,metalness:.16})]));
materials.pink.emissive.set(colors.pink);materials.pink.emissiveIntensity=.65;
const lampMaterial=new T.MeshBasicMaterial({color:0xffffff,toneMapped:false});
const shellMaterial=new T.MeshBasicMaterial({color:0xffffff,side:T.BackSide});
export function whiteBoundary(group,width=.025){const meshes=[];group.traverse(m=>{if(m.isMesh&&!m.userData.boundary)meshes.push(m);});for(const m of meshes){if(!m.geometry.attributes.normal)continue;const g=m.geometry.clone(),p=g.attributes.position,n=g.attributes.normal;for(let i=0;i<p.count;i++)p.setXYZ(i,p.getX(i)+n.getX(i)*width,p.getY(i)+n.getY(i)*width,p.getZ(i)+n.getZ(i)*width);p.needsUpdate=true;const shell=new T.Mesh(g,shellMaterial);shell.userData.boundary=true;m.add(shell);}return group;}
function add(g,geo,color,x=0,y=0,z=0){const m=new T.Mesh(geo,materials[color]);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
function block(g,w,h,d,c,x=0,y=0,z=0){return add(g,Math.min(w,h,d)<.08?new T.BoxGeometry(w,h,d):rounded(w,h,d),c,x,y,z);}
// Collectibles: white studio props with one pink accent, so they read on the black interface.
export function createArtifact(type){const g=new T.Group();
 const cyl=(r,h,c,x,y,z,seg=32)=>{const m=add(g,new T.CylinderGeometry(r,r,h,seg),c,x,y,z);m.rotation.x=Math.PI/2;return m;};
 const ball=(r,c,x,y,z)=>add(g,new T.SphereGeometry(r,20,14),c,x,y,z);
 if(type==='card'){ // staff pass
  block(g,1.5,1.02,.14,'white');block(g,1.5,.2,.16,'pink',0,.41,0);cyl(.2,.06,'pink',-.42,-.1,.08);block(g,.6,.07,.04,'black',.24,0,.08);block(g,.42,.07,.04,'gray',.15,-.18,.08);block(g,.3,.07,.04,'gray',.09,-.34,.08);add(g,new T.TorusGeometry(.13,.035,10,24),'gray',0,.66,0);
 }else if(type==='phone'){
  block(g,.88,1.62,.16,'white');block(g,.72,1.36,.05,'black',0,0,.08);for(let r=0;r<3;r++)for(let c=0;c<2;c++)block(g,.22,.22,.05,(r+c)%3===0?'pink':'white',-.16+c*.32,.36-r*.34,.12);block(g,.26,.035,.05,'gray',0,-.6,.12);
 }else if(type==='console'){ // vision mixer
  const deck=new T.Group();deck.rotation.x=.5;g.add(deck);block(deck,1.7,.26,1.0,'white');for(let r=0;r<2;r++)for(let c=0;c<5;c++)block(deck,.2,.1,.18,(r*5+c)%4===1?'pink':'black',-.56+c*.22,.17,.02+r*.26);for(const x of [.72,.5]){block(deck,.07,.03,.6,'black',x,.14,.1);block(deck,.14,.1,.12,'white',x,.2,x>.6?.24:-.02);}
  block(deck,1.3,.55,.1,'black',-.1,.42,-.42);block(deck,.5,.12,.03,'pink',-.38,.5,-.36);block(deck,.7,.05,.03,'gray',-.28,.34,-.36);
 }else if(type==='chart'){
  block(g,1.55,1.12,.14,'white');block(g,1.34,.92,.05,'black',0,0,.07);[.2,.34,.48,.68].forEach((h,i)=>block(g,.2,h,.06,i===3?'pink':'white',-.42+i*.28,-.36+h/2,.12));block(g,1.16,.03,.05,'gray',0,-.39,.11);
 }else if(type==='broadcast'){ // small studio monitor
  block(g,1.5,1.1,.7,'white');block(g,1.02,.8,.05,'black',-.14,0,.35);const tri=new T.Shape();tri.moveTo(-.17,-.2);tri.lineTo(.2,0);tri.lineTo(-.17,.2);tri.closePath();add(g,new T.ExtrudeGeometry(tri,{depth:.05,bevelEnabled:false}),'pink',-.14,0,.37);
  cyl(.07,.06,'gray',.56,.2,.36,16);cyl(.07,.06,'pink',.56,-.02,.36,16);for(const s of [-1,1]){const rod=add(g,new T.CylinderGeometry(.022,.022,.8,10),'white',s*.2,.9,0);rod.rotation.z=-s*.5;ball(.05,'pink',s*.39,1.25,0);block(g,.2,.12,.5,'gray',s*.5,-.6,0);}
 }else if(type==='document'){ // running order on a clipboard
  block(g,1.16,1.5,.1,'white');block(g,.5,.2,.16,'pink',0,.72,.03);for(let i=0;i<4;i++){block(g,.1,.1,.04,i===1?'pink':'gray',-.38,.34-i*.26,.06);block(g,.62,.06,.04,'black',.08,.34-i*.26,.06);}
 }else if(type==='book'){
  block(g,1.2,1.5,.34,'white');block(g,.18,1.5,.36,'pink',-.55,0,0);block(g,.6,.3,.05,'black',.1,.3,.17);block(g,.4,.05,.05,'gray',.1,-.02,.17);block(g,.12,.46,.04,'pink',.36,-.88,0);
 }else if(type==='compass'){
  cyl(.68,.18,'white',0,0,0,48);add(g,new T.TorusGeometry(.68,.06,12,48),'gray',0,0,.06);cyl(.52,.04,'black',0,0,.1,48);const n=add(g,new T.ConeGeometry(.13,.5,24),'pink',.12,.2,.15);n.rotation.z=-.5;const sth=add(g,new T.ConeGeometry(.13,.5,24),'white',-.12,-.2,.15);sth.rotation.z=Math.PI-.5;ball(.08,'white',0,0,.17);
 }else if(type==='server'){
  block(g,1.0,1.62,.7,'white');for(let i=0;i<4;i++){block(g,.82,.24,.05,'black',0,.54-i*.36,.35);ball(.05,i===2?'gray':'pink',.3,.54-i*.36,.39);block(g,.36,.04,.03,'gray',-.14,.54-i*.36,.38);}
 }else if(type==='wrench'){
  block(g,.25,1.15,.2,'white',0,-.2,0);const ring=add(g,new T.TorusGeometry(.37,.13,16,40,Math.PI*1.55),'pink',0,.5,0);ring.rotation.z=.72;add(g,new T.TorusGeometry(.14,.075,12,32),'white',0,-.76,0);
 }else if(type==='toolbox'){
  block(g,1.6,.92,.8,'white');block(g,1.64,.17,.84,'pink',0,.3,0);block(g,.2,.3,.08,'black',0,.06,.42);add(g,new T.TorusGeometry(.32,.07,12,32,Math.PI),'gray',0,.52,0);
 }else if(type==='radio'){
  block(g,1.6,1.02,.55,'white');cyl(.3,.06,'black',-.38,-.04,.28,40);add(g,new T.TorusGeometry(.18,.03,10,32),'white',-.38,-.04,.32);block(g,.56,.2,.06,'pink',.36,.2,.28);ball(.1,'pink',.22,-.22,.3);ball(.1,'gray',.5,-.22,.3);const rod=add(g,new T.CylinderGeometry(.022,.022,1,12),'white',.5,.98,0);rod.rotation.z=-.3;ball(.055,'pink',.65,1.45,0);
 }
 return g;
}
// The district: black studios with lit fins and dishes, a transmission tower, an entry runway.
// Building footprints and collision radii match the original exhibit layout.
export function buildHarbor(environment,{scale,obstacles}){
 const g=new T.Group();environment.add(g);g.name='night-plaza';
 const water=new T.Mesh(new T.CylinderGeometry(110,110,.15,128),new T.MeshStandardMaterial({color:0x07090f,roughness:.3,metalness:.4}));water.position.y=-.35;g.add(water);
 for(let i=0;i<24;i++){const a=i/24*Math.PI*2,r=67+i%3*6;const wave=add(g,new T.TorusGeometry(2,.018,5,24,Math.PI*.8),'gray',Math.sin(a)*r,-.24,Math.cos(a)*r);wave.rotation.x=-Math.PI/2;wave.rotation.z=a;}
 // entry runway with guide lights
 block(g,7,.18,18,'gray',0,.06,45);
 for(const x of [-3.2,3.2]){for(let z=37;z<=53;z+=4)block(g,.12,1.35,.12,'black',x,.68,z);block(g,.15,.12,16,'gray',x,1.34,45);block(g,.06,.035,16,'white',x,1.41,45);for(let z=38;z<=52;z+=2)block(g,.07,.05,.8,'pink',x*.86,.16,z);}
 const pool=new T.MeshBasicMaterial({color:0xcbd2eb,transparent:true,opacity:.035,depthWrite:false});
 function lamp(parent,x,z){block(parent,.4,.2,.4,'black',x,.12,z);block(parent,.1,4.6,.1,'gray',x,2.4,z);block(parent,.9,.1,.16,'gray',x,4.72,z);const panel=new T.Mesh(rounded(.8,.06,.12,.02),lampMaterial);panel.position.set(x,4.65,z);parent.add(panel);const disc=new T.Mesh(new T.CircleGeometry(1.8,32),pool);disc.rotation.x=-Math.PI/2;disc.position.set(x,.024,z);parent.add(disc);}
 function dish(parent,x,y,z,r){block(parent,.1,.7,.1,'gray',x,y+.35,z);const bowl=add(parent,new T.SphereGeometry(r,24,12,0,Math.PI*2,0,Math.PI*.42),'white',x,y+.7+r*.55,z);bowl.rotation.x=Math.PI*.78;const feed=add(parent,new T.SphereGeometry(.07,12,8),'pink',x,y+.86+r*.3,z+r*.5);return feed;}
 function house(x,z,w,d,index){
  x*=scale;z*=scale;const h=new T.Group();h.position.set(x,0,z);g.add(h);const height=index===4?4.6:3.7,front=d/2;
  block(h,w+.2,.2,d+.2,'gray',0,.1,0);block(h,w,height,d,'black',0,height/2+.14,0);block(h,w+.16,.12,d+.16,'gray',0,height+.2,0);block(h,w+.1,.04,d+.1,'white',0,height+.28,0);
  // lit fins at the front corners and a thin base line: the building reads as a set piece
  for(const s of [-1,1]){block(h,.09,height-.5,.09,'pink',s*(w/2-.02),height/2+.2,front+.02);block(h,.05,height-.9,.05,'pink',s*(w/2-.3),height/2+.2,front+.03);}
  block(h,w*.9,.04,.05,'pink',0,.3,front+.05);
  // stage door with a light frame, and louvres beside it
  const door=Math.min(1.8,w*.34);block(h,door+.24,2.5,.08,'gray',0,1.4,front+.02);block(h,door,2.3,.1,'black',0,1.32,front+.05);for(const s of [-1,1])block(h,.05,2.36,.05,'pink',s*(door/2+.05),1.36,front+.12);block(h,door+.15,.05,.05,'pink',0,2.56,front+.12);
  for(let i=0;i<5;i++)block(h,w*.2,.045,.04,'gray',-w*.33,1.0+i*.16,front+.04);
  // marquee rail: the scene hangs the zone name here
  block(h,w*.86,.08,.1,'gray',0,height+.52,front-.2);for(const s of [-1,1])block(h,.07,.36,.07,'gray',s*w*.4,height+.4,front-.2);
  // roof kit
  block(h,w*.3,.4,d*.3,'gray',-w*.22,height+.5,-d*.16);for(let i=0;i<4;i++)block(h,w*.24,.03,.06,'black',-w*.22,height+.72,-d*.24+i*.1);dish(h,w*.26,height+.26,-d*.14,index===4?.75:.55);
  if(index===4){const m=add(h,new T.CylinderGeometry(.05,.08,4.2,12),'gray',-w*.4,height+2.4,d*.2);for(const y of [1.2,2.2,3.2])add(h,new T.TorusGeometry(.26-.06*(y-1.2),.03,8,24),'pink',-w*.4,height+.3+y,d*.2).rotation.x=Math.PI/2;add(h,new T.SphereGeometry(.09,12,8),'pink',-w*.4,height+4.56,d*.2);}
  lamp(h,w*.37,d*.28+.9);
  obstacles.push({x,z,r:Math.max(w,d)*.52});
 }
 [[0,12.5,6,4],[-26,3,4.8,3.5],[-26,-10,4.8,3.5],[-9,-27,6,3.5],[16,-20,11,5],[-10,-10,6,4],[19,18,5,4],[-10,10.5,6,4]].forEach((p,i)=>house(...p,i));
 // transmission tower at the communication station: three legs, rings and widening signal arcs
 const tx=-10*scale,tz=8*scale;for(let i=0;i<3;i++){const a=i/3*Math.PI*2,leg=add(g,new T.CylinderGeometry(.045,.07,11,10),'gray',tx+Math.sin(a)*.42,5.5,tz+Math.cos(a)*.42);leg.rotation.set(-Math.cos(a)*.07,0,Math.sin(a)*.07);}
 for(let y=1.5;y<=9.5;y+=2)add(g,new T.TorusGeometry(.62-y*.045,.03,8,24),'white',tx,y,tz).rotation.x=Math.PI/2;
 add(g,new T.CylinderGeometry(.03,.03,2.4,10),'white',tx,12,tz);add(g,new T.SphereGeometry(.13,16,12),'pink',tx,13.25,tz);
 for(const [r,y] of [[.9,11.2],[1.5,11.5],[2.1,11.8]])for(const s of [-1,1]){const arc=add(g,new T.TorusGeometry(r,.035,8,36,Math.PI*.5),'pink',tx,y,tz);arc.rotation.z=s>0?-Math.PI*.25:Math.PI*.75;}
 // boundary rail and a distant skyline with lit floors
 for(let i=0;i<36;i++){const a=i/36*Math.PI*2,r=57.3,seg=new T.Group();seg.position.set(Math.sin(a)*r,0,Math.cos(a)*r);seg.rotation.y=a;g.add(seg);block(seg,7.5,.7,.42,'black',0,.36,0);block(seg,7.6,.09,.5,'gray',0,.76,0);for(const dx of [-3.6,3.6])block(seg,.12,.67,.14,'gray',dx,1.04,0);block(seg,7.5,.085,.13,'white',0,1.37,0);block(seg,3,.046,.047,'pink',0,.17,-.24);}
 for(let i=0;i<22;i++){const a=i/22*Math.PI*2,r=77+(i%3)*6,h=8+(i%5)*3,tower=new T.Group();tower.position.set(Math.sin(a)*r,-.2,Math.cos(a)*r);tower.rotation.y=a;g.add(tower);block(tower,4+i%3,h,5,'black',0,h/2,0);block(tower,.05,h*.75,.06,'gray',-1.5,h*.5,-2.53);if(i%2===0)block(tower,2.4,.05,.05,'pink',0,h*.72,-2.54);if(i%3===1)block(tower,1.2,.05,.05,'pink',.6,h*.4,-2.54);if(i%4===0)add(tower,new T.SphereGeometry(.12,10,8),'pink',0,h+.3,0);}
 return batchStatic(g);
}
export function artifactImages(items){const renderer=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});renderer.setSize(144,144);renderer.setPixelRatio(1);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;const scene=new T.Scene(),camera=new T.PerspectiveCamera(35,1,.1,20);camera.position.set(2,1.5,4.5);camera.lookAt(0,0,0);scene.add(new T.HemisphereLight(0xf4f5ff,0x4a4860,2.3));const key=new T.DirectionalLight(0xffffff,3.2);key.position.set(-3,5,4);scene.add(key);const images={};for(const item of items){const object=createArtifact(item.model);scene.add(object);renderer.render(scene,camera);images[item.id]=renderer.domElement.toDataURL('image/png');scene.remove(object);object.traverse(m=>{if(m.isMesh)m.geometry.dispose();});}renderer.dispose();renderer.forceContextLoss();return images;}

export function setArtifactColor(color){materials.pink.color.set(color);materials.pink.emissive.set(color);}
