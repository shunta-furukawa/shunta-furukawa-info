import * as T from './vendor/three.module.js';
const colors={black:0x191923,white:0xf5f5f7,pink:0xff3b8d,gray:0x636374};
const materials=Object.fromEntries(Object.entries(colors).map(([k,color])=>[k,new T.MeshBasicMaterial({color})]));
const shellMaterial=new T.MeshBasicMaterial({color:0xffffff,side:T.BackSide});
export function whiteBoundary(group,width=.025){const meshes=[];group.traverse(m=>{if(m.isMesh&&!m.userData.boundary)meshes.push(m);});for(const m of meshes){if(!m.geometry.attributes.normal)continue;const g=m.geometry.clone(),p=g.attributes.position,n=g.attributes.normal;for(let i=0;i<p.count;i++)p.setXYZ(i,p.getX(i)+n.getX(i)*width,p.getY(i)+n.getY(i)*width,p.getZ(i)+n.getZ(i)*width);p.needsUpdate=true;const shell=new T.Mesh(g,shellMaterial);shell.userData.boundary=true;m.add(shell);}return group;}
function rounded(w,h,d,r=.1){r=Math.min(r,w/3,h/3,d/3);const s=new T.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);const g=new T.ExtrudeGeometry(s,{depth:d-2*r,bevelEnabled:true,bevelSize:r*.45,bevelThickness:r,bevelSegments:5,curveSegments:12});g.translate(0,0,-d/2+r);return g;}
function add(g,geo,color,x=0,y=0,z=0){const m=new T.Mesh(geo,materials[color]);m.position.set(x,y,z);g.add(m);return m;}
function block(g,w,h,d,c,x=0,y=0,z=0){return add(g,rounded(w,h,d),c,x,y,z);}
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
 return whiteBoundary(g,.022);
}
export function buildHarbor(environment,{scale,obstacles}){const g=new T.Group();environment.add(g);
 add(g,new T.CylinderGeometry(110,110,.15,96),'black',0,-.35,0);
 // Water strokes, quay and mooring posts make the island read as a working harbor.
 for(let i=0;i<24;i++){const a=i/24*Math.PI*2,r=67+i%3*6;const wave=add(g,new T.TorusGeometry(2,.025,6,32,Math.PI*.8),'gray',Math.sin(a)*r,-.24,Math.cos(a)*r);wave.rotation.x=-Math.PI/2;wave.rotation.z=a;}
 block(g,7,.18,18,'gray',0,.06,45);for(let z=37;z<=53;z+=4)for(const x of [-3.2,3.2])add(g,new T.CylinderGeometry(.17,.2,1.5,24),'white',x,.7,z);
 function house(x,z,w,d,title){x*=scale;z*=scale;const house=new T.Group();house.position.set(x,0,z);g.add(house);block(house,w,3.3,d,'black',0,1.65,0);const roof=block(house,w+.4,.6,d+.4,'white',0,3.45,0);block(house,w*.48,1.9,.15,'pink',0,1.5,d/2+.05);for(const dx of [-w*.34,w*.34])block(house,.35,2.1,.2,'white',dx,1.55,d/2+.14);whiteBoundary(house,.035);obstacles.push({x,z,r:Math.max(w,d)*.52});}
 house(0,12.5,6,4,'案内所');house(-26,3,4.8,3.5,'記録');house(-26,-10,4.8,3.5,'記録');house(-9,-27,6,3.5,'記録');house(16,-20,11,5,'工房');house(-10,-10,6,4,'書斎');house(19,18,5,4,'資料室');house(-10,10.5,6,4,'通信所');
 const mast=add(g,new T.CylinderGeometry(.1,.16,8,32),'white',-10*scale,4,8*scale);for(const y of [5.6,6.5]){const arc=add(g,new T.TorusGeometry(y===5.6?1:1.5,.06,12,40,Math.PI),'pink',-10*scale,y,8*scale);arc.rotation.z=.1;}
 return g;
}
export function artifactImages(items){const renderer=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});renderer.setSize(144,144);renderer.setPixelRatio(1);const scene=new T.Scene(),camera=new T.PerspectiveCamera(35,1,.1,20);camera.position.set(2,1.5,4.5);camera.lookAt(0,0,0);const images={};for(const item of items){const object=createArtifact(item.model);scene.add(object);renderer.render(scene,camera);images[item.id]=renderer.domElement.toDataURL('image/png');scene.remove(object);object.traverse(m=>{if(m.isMesh)m.geometry.dispose();});}renderer.dispose();renderer.forceContextLoss();return images;}
