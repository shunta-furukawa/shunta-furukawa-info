import * as T from './vendor/three.module.js';
import {rounded,batchStatic} from './world-shapes.js';
const colors={black:0x1b1c26,white:0xe6e7ee,pink:0xff3b8d,gray:0x484b5d};
const materials=Object.fromEntries(Object.entries(colors).map(([k,color])=>[k,new T.MeshStandardMaterial({color,roughness:k==='white'?.42:.68,metalness:.16})]));
materials.pink.emissive.set(colors.pink);materials.pink.emissiveIntensity=.65;
const lampMaterial=new T.MeshBasicMaterial({color:0xffffff,toneMapped:false});
const shellMaterial=new T.MeshBasicMaterial({color:0xffffff,side:T.BackSide});
export function whiteBoundary(group,width=.025){const meshes=[];group.traverse(m=>{if(m.isMesh&&!m.userData.boundary)meshes.push(m);});for(const m of meshes){if(!m.geometry.attributes.normal)continue;const g=m.geometry.clone(),p=g.attributes.position,n=g.attributes.normal;for(let i=0;i<p.count;i++)p.setXYZ(i,p.getX(i)+n.getX(i)*width,p.getY(i)+n.getY(i)*width,p.getZ(i)+n.getZ(i)*width);p.needsUpdate=true;const shell=new T.Mesh(g,shellMaterial);shell.userData.boundary=true;m.add(shell);}return group;}
function add(g,geo,color,x=0,y=0,z=0){const m=new T.Mesh(geo,materials[color]);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
function block(g,w,h,d,c,x=0,y=0,z=0){return add(g,Math.min(w,h,d)<.08?new T.BoxGeometry(w,h,d):rounded(w,h,d),c,x,y,z);}
export function createArtifact(type){const g=new T.Group();
 if(['card','phone','console','chart','broadcast'].includes(type)){const phone=type==='phone',w=phone?.85:1.55,h=phone?1.6:1.05;block(g,w,h,.24,'black');block(g,w-.18,h-.2,.04,'white',0,0,.15);
  if(type==='card'){add(g,new T.SphereGeometry(.18,24,16),'pink',-.4,.08,.23);block(g,.55,.06,.03,'black',.2,.16,.2);block(g,.7,.05,.03,'gray',.14,-.08,.2);}
  else if(type==='chart'){for(let i=0;i<3;i++)block(g,.2,.2+i*.18,.03,i===1?'pink':'black',-.38+i*.38,-.18+i*.09,.2);}
  else if(type==='broadcast'){const triangle=new T.Shape();triangle.moveTo(-.2,-.24);triangle.lineTo(.24,0);triangle.lineTo(-.2,.24);triangle.closePath();add(g,new T.ExtrudeGeometry(triangle,{depth:.04,bevelEnabled:false}),'pink',.05,0,.2);block(g,.13,.35,.16,'white',0,-.69,0);block(g,.9,.12,.5,'black',0,-.86,0);}
  else{block(g,w-.35,.28,.03,'pink',0,.18,.2);for(let i=0;i<3;i++)block(g,.13,.13,.035,'black',-.22+i*.22,-.2,.21);}}
 else if(type==='document'||type==='book'){block(g,1.3,1.5,.35,'black');block(g,1.15,1.35,.09,'white',.04,0,.2);block(g,.2,1.5,.38,'pink',-.6,0,0);for(let i=0;i<3;i++)block(g,.65,.055,.025,'black',.1,.3-i*.23,.26);}
 else if(type==='compass'){const disk=add(g,new T.CylinderGeometry(.65,.65,.2,48),'white');disk.rotation.x=Math.PI/2;const needle=add(g,new T.ConeGeometry(.17,.85,32),'pink',0,.13,.2);needle.rotation.z=-.4;add(g,new T.SphereGeometry(.09,20,12),'black',0,0,.25);}
 else if(type==='server'){block(g,1,1.6,.7,'black');for(let i=0;i<3;i++){block(g,.8,.3,.06,'white',0,.48-i*.47,.4);add(g,new T.SphereGeometry(.06,16,12),'pink',.23,.48-i*.47,.46);}}
 else if(type==='wrench'){block(g,.25,1.15,.2,'white',0,-.2,0);const ring=add(g,new T.TorusGeometry(.37,.13,16,40,Math.PI*1.55),'pink',0,.5,0);ring.rotation.z=.72;add(g,new T.TorusGeometry(.14,.075,12,32),'white',0,-.76,0);}
 else if(type==='toolbox'){block(g,1.6,1,.8,'black');block(g,1.65,.18,.85,'pink',0,.28,0);block(g,.18,.35,.1,'white',0,.05,.47);const handle=add(g,new T.TorusGeometry(.32,.075,12,32,Math.PI),'white',0,.55,0);}
 else if(type==='radio'){block(g,1.6,1.05,.6,'black');add(g,new T.CylinderGeometry(.29,.29,.08,40),'white',-.35,-.03,.35).rotation.x=Math.PI/2;block(g,.55,.25,.08,'pink',.38,.18,.36);add(g,new T.SphereGeometry(.12,24,16),'white',.42,-.23,.37);add(g,new T.CylinderGeometry(.025,.025,1,16),'white',.52,.96,0).rotation.z=-.3;}
 return g;
}
// Architecture stays inside the original exhibit layout and collision footprints.
export function buildHarbor(environment,{scale,obstacles}){
 const g=new T.Group();environment.add(g);g.name='night-plaza';
 const water=new T.Mesh(new T.CylinderGeometry(110,110,.15,128),new T.MeshStandardMaterial({color:0x0b111d,roughness:.3,metalness:.4}));water.position.y=-.35;g.add(water);
 for(let i=0;i<24;i++){const a=i/24*Math.PI*2,r=67+i%3*6;const wave=add(g,new T.TorusGeometry(2,.018,5,24,Math.PI*.8),'gray',Math.sin(a)*r,-.24,Math.cos(a)*r);wave.rotation.x=-Math.PI/2;wave.rotation.z=a;}
 block(g,7,.18,18,'gray',0,.06,45);
 for(const x of [-3.2,3.2]){
  for(let z=37;z<=53;z+=4)block(g,.12,1.35,.12,'black',x,.68,z);
  block(g,.15,.12,16,'gray',x,1.34,45);block(g,.06,.035,16,'white',x,1.41,45);
  for(let z=38;z<=52;z+=4)block(g,.07,.05,1.8,'pink',x,.14,z);
 }
 function lamp(parent,x,z){
  block(parent,.45,.25,.45,'black',x,.14,z);
  block(parent,.16,4.7,.18,'gray',x,2.40,z);
  block(parent,.68,.20,.52,'black',x,4.76,z);
  const panel=new T.Mesh(rounded(.56,.10,.40,.024),lampMaterial);panel.position.set(x,4.70,z);parent.add(panel);
  // A translucent pool grounds the lamp without a shadow-casting light per pole.
  const pool=new T.Mesh(new T.CircleGeometry(1.8,32),new T.MeshBasicMaterial({color:0xcbd2eb,transparent:true,opacity:.035,depthWrite:false}));pool.rotation.x=-Math.PI/2;pool.position.set(x,.024,z);parent.add(pool);
 }
 function house(x,z,w,d,index){
  x*=scale;z*=scale;const h=new T.Group();h.position.set(x,0,z);g.add(h);
  const height=index===4?4.3:3.6;
  block(h,w+.15,.24,d+.15,'gray',0,.12,0);
  block(h,w,height,d,'black',0,height/2+.16,0);
  block(h,w+.23,.17,d+.23,'gray',0,height+.20,0);
  block(h,w+.16,.045,d+.16,'white',0,height+.31,0);
  // Recessed face, vertical jambs, a lit lintel and tiny panel fasteners.
  block(h,w*.48,2.25,.09,'gray',0,1.55,d/2+.03);
  block(h,w*.43,2.12,.10,'black',0,1.53,d/2+.09);
  for(const dx of [-w*.25,w*.25]){block(h,.055,2.22,.045,'pink',dx,1.56,d/2+.16);block(h,.12,2.35,.12,'gray',dx*1.12,1.57,d/2+.06);}
  block(h,w*.5,.055,.05,'pink',0,2.70,d/2+.14);
  block(h,w*.92,.043,.045,'pink',0,.31,d/2+.08);
  block(h,.042,.045,d*.85,'pink',-w/2-.035,.31,0);
  for(let i=0;i<4;i++)block(h,w*.17,.05,.035,'gray',w*.32,1.23+i*.14,d/2+.055);
  for(const dx of [-w*.45,w*.45])for(const y of [.65,height-.35]){const bolt=add(h,new T.CylinderGeometry(.025,.025,.025,8),'white',dx,y,d/2+.035);bolt.rotation.x=Math.PI/2;}
  // Roof equipment provides a readable industrial silhouette at oblique angles.
  block(h,w*.38,.48,d*.35,'gray',-w*.13,height+.53,-d*.13);
  for(let i=0;i<5;i++)block(h,w*.28,.035,.07,'black',-w*.13,height+.79,-d*.21+i*.12);
  lamp(h,w*.37,d*.28);
  obstacles.push({x,z,r:Math.max(w,d)*.52});
 }
 [[0,12.5,6,4],[-26,3,4.8,3.5],[-26,-10,4.8,3.5],[-9,-27,6,3.5],[16,-20,11,5],[-10,-10,6,4],[19,18,5,4],[-10,10.5,6,4]].forEach((p,i)=>house(...p,i));
 const mast=add(g,new T.CylinderGeometry(.075,.12,8,24),'gray',-10*scale,4,8*scale);
 for(const y of [5.6,6.5]){const arc=add(g,new T.TorusGeometry(y===5.6?1:1.5,.04,8,40,Math.PI),'pink',-10*scale,y,8*scale);arc.rotation.z=.1;}
 // Boundary promenades and a distant skyline frame a traversable, open center.
 for(let i=0;i<36;i++){
  const a=i/36*Math.PI*2,r=57.3,x=Math.sin(a)*r,z=Math.cos(a)*r;
  const segment=new T.Group();segment.position.set(x,0,z);segment.rotation.y=a;g.add(segment);
  block(segment,7.5,.70,.42,'black',0,.36,0);block(segment,7.6,.09,.5,'gray',0,.76,0);
  for(const dx of [-3.6,3.6])block(segment,.12,.67,.14,'gray',dx,1.04,0);
  block(segment,7.5,.085,.13,'white',0,1.37,0);block(segment,3.0,.046,.047,'pink',0,.17,-.24);
 }
 for(let i=0;i<22;i++){
  const a=i/22*Math.PI*2,r=77+(i%3)*6,h=8+(i%5)*3;
  const tower=new T.Group();tower.position.set(Math.sin(a)*r,-.2,Math.cos(a)*r);tower.rotation.y=a;g.add(tower);
  block(tower,4+i%3,h,5,'black',0,h/2,0);
  block(tower,.05,h*.75,.06,'gray',-1.5,h*.5,-2.53);
  if(i%3===0)block(tower,2,.04,.05,'pink',0,h*.72,-2.54);
 }
 return batchStatic(g);
}
export function artifactImages(items){const renderer=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});renderer.setSize(144,144);renderer.setPixelRatio(1);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;const scene=new T.Scene(),camera=new T.PerspectiveCamera(35,1,.1,20);camera.position.set(2,1.5,4.5);camera.lookAt(0,0,0);scene.add(new T.HemisphereLight(0xe9ecff,0x333144,2));const key=new T.DirectionalLight(0xffffff,3);key.position.set(-3,5,4);scene.add(key);const images={};for(const item of items){const object=createArtifact(item.model);scene.add(object);renderer.render(scene,camera);images[item.id]=renderer.domElement.toDataURL('image/png');scene.remove(object);object.traverse(m=>{if(m.isMesh)m.geometry.dispose();});}renderer.dispose();renderer.forceContextLoss();return images;}

export function setArtifactColor(color){materials.pink.color.set(color);materials.pink.emissive.set(color);}
