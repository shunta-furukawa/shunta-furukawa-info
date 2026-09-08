import * as T from './vendor/three.module.js';
import {rounded,batchStatic} from './world-shapes.js';

// A clothed character, facing +Z. Keep the walking/jumping joints independent of
// the finer tailoring so every detail follows its owner rather than the world.
export function createAvatar(){
 const player=new T.Group(),body=new T.Group();player.add(body);player.name='explorer';
 const material=(color,roughness=.7,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const m={cloth:material(0x1d1e28,.88),rib:material(0x14151d,.92),seam:material(0x343540,.8),hair:material(0x14141c,.32,.12),hairRidge:material(0x30313d,.4,.08),white:material(0xf2f1f4,.65),skin:material(0xffeae2,.62),ear:material(0xd9b5b0,.7),eye:material(0x17111b,.12,.12),sole:material(0xe6e6ed,.76),leather:material(0x171821,.43,.1),pink:material(0xff3b8d,.45,.12),lining:material(0x8d174d,.84)};
 m.pink.emissive.set(0xff3b8d);m.pink.emissiveIntensity=.38;
 const shine=new T.MeshBasicMaterial({color:0xffffff});
 function part(parent,geometry,key,x=0,y=0,z=0){const mesh=new T.Mesh(geometry,m[key]||key);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 function oval(parent,key,x,y,z,sx,sy,sz){const mesh=part(parent,new T.SphereGeometry(.5,32,24),key,x,y,z);mesh.scale.set(sx,sy,sz);return mesh;}
 function block(parent,w,h,d,key,x,y,z,r=.06){return part(parent,rounded(w,h,d,r),key,x,y,z);}
 function line(parent,points,r,key){return part(parent,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),24,r,8,false),key);}
 function seam(parent,points,key='seam',r=.009){return line(parent,points,r,key);}
 const torso=new T.SplineCurve([[0,-.48],[.37,-.48],[.49,-.40],[.50,-.17],[.46,.24],[.38,.44],[.28,.49],[0,.49]].map(p=>new T.Vector2(...p)));
 const top=part(body,new T.LatheGeometry(torso.getPoints(30),48),'cloth',0,1.35,0);top.scale.z=.85;
 block(body,.87,.14,.69,'rib',0,.91,0,.06);
 // Hood down: black outer fabric, colored inner fold and a soft neck opening.
 oval(body,'cloth',0,1.85,-.24,1.15,.60,.85);
 oval(body,'lining',0,1.95,-.12,.96,.36,.70);
 const collar=part(body,new T.TorusGeometry(.32,.10,12,48),'rib',0,1.87,.05);collar.rotation.x=Math.PI/2;collar.scale.z=.72;
 oval(body,'skin',0,1.98,.04,.32,.34,.32);
 // Pocket, curved top seam, drawcord eyelets and pink aglets.
 oval(body,'cloth',0,1.17,.397,.65,.39,.115);
 seam(body,[[-.30,1.06,.425],[-.21,1.32,.455],[.21,1.32,.455],[.30,1.06,.425]]);
 for(const side of [-1,1]){
  const x=side*.16;
  oval(body,'rib',x,1.76,.37,.07,.07,.025);
  line(body,[[x,1.77,.39],[x*1.1,1.59,.43],[x*1.15,1.35,.46]],.022,'white');
  block(body,.049,.11,.052,'pink',x*1.15,1.31,.46,.014);
 }
 // The head is uncovered, with a full back-of-head silhouette under layered hair.
 const head=new T.Group();head.position.set(0,2.26,.01);body.add(head);
 oval(head,'skin',0,.04,.05,1.01,1.05,.88);
 for(const side of [-1,1]){
  oval(head,'skin',side*.49,.015,.035,.20,.28,.16);
  oval(head,'ear',side*.518,.02,.104,.078,.145,.025);
  oval(head,'white',side*.185,.07,.459,.27,.295,.08);
  oval(head,'eye',side*.185,.077,.491,.205,.247,.06);
  oval(head,shine,side*.185-.04,.127,.526,.057,.068,.012);
  oval(head,shine,side*.185+.037,.034,.523,.025,.03,.01);
  seam(head,[[side*.09,.30,.451],[side*.18,.326,.472],[side*.29,.28,.435]],'hair',.026);
 }
 oval(head,'skin',0,-.055,.489,.095,.095,.11);
 seam(head,[[-.127,-.185,.444],[0,-.218,.468],[.127,-.185,.444]],'eye',.016);
 oval(head,'skin',0,-.235,.315,.50,.19,.30);
 const cap=part(head,new T.SphereGeometry(.57,48,32,0,Math.PI*2,0,1.84),'hair',0,.245,-.055);cap.scale.set(1.05,1,.94);
 // Sculpted, tapered hair locks. Elliptical cross sections follow a stable
 // frame along each curve; the pointed tips merge into a smooth silhouette.
 function lock(points,width,depth,key='hair'){
  const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),frames=curve.computeFrenetFrames(28,false),pos=[],indices=[];
  for(let i=0;i<=28;i++){
   const t=i/28,p=curve.getPointAt(t),shape=Math.pow(Math.sin(Math.PI*(.14+.86*t)),.67)*(.96-.24*t)+.008;
   for(let j=0;j<=12;j++){const a=j/12*Math.PI*2,v=p.clone().addScaledVector(frames.normals[i],Math.cos(a)*width*shape).addScaledVector(frames.binormals[i],Math.sin(a)*depth*shape);pos.push(v.x,v.y,v.z);if(i<28&&j<12){const n=i*13+j;indices.push(n,n+1,n+13,n+1,n+14,n+13);}}
  }
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setIndex(indices);geo.computeVertexNormals();return part(head,geo,key);
 }
 // Front sweep, temple tufts, crown, and overlapping rear locks, rather than a helmet.
 lock([[.43,.51,.20],[.19,.68,.40],[-.19,.56,.49],[-.48,.36,.35]],.19,.085);
 lock([[.43,.54,.22],[.24,.53,.48],[-.12,.34,.54],[-.47,.24,.38]],.18,.082);
 lock([[.34,.37,.37],[.19,.29,.50],[-.03,.18,.54],[-.29,.12,.48]],.15,.069);
 lock([[.13,.69,.07],[-.08,.76,.13],[-.37,.62,.21],[-.58,.48,.17]],.155,.085);
 lock([[.30,.64,-.15],[.52,.49,-.03],[.56,.23,.05],[.48,-.02,.15]],.15,.075);
 lock([[-.40,.42,.09],[-.55,.25,.13],[-.54,.03,.14],[-.43,-.13,.16]],.12,.065);
 lock([[.17,.72,-.20],[.33,.78,-.13],[.39,.67,-.02],[.35,.54,.10]],.12,.075);
 for(const side of [-1,1]){
  for(let i=0;i<3;i++)lock([[side*(.08+i*.14),.65-i*.04,-.30],[side*(.17+i*.15),.36,-.52+i*.05],[side*(.18+i*.16),.05,-.51+i*.1],[side*(.1+i*.18),-.17+i*.025,-.35+i*.08]],.155,.078);
 }
 // White ribbons echo the original icon without outlining every surface.
 lock([[.40,.56,.29],[.17,.62,.46],[-.16,.48,.557],[-.43,.31,.423]],.027,.013,'white');
 lock([[.04,.739,.08],[-.14,.735,.185],[-.37,.61,.29],[-.55,.49,.21]],.015,.009,'white');
 lock([[.50,.43,-.11],[.57,.23,-.10],[.56,.045,-.08],[.48,-.08,.01]],.015,.009,'hairRidge');
 // Shoulder straps and a sculpted backpack: its circle is legible from the chase camera.
 for(const side of [-1,1]){
  line(body,[[side*.31,1.14,-.42],[side*.37,1.63,-.42],[side*.34,1.80,-.04],[side*.31,1.50,.34],[side*.33,1.14,.38]],.044,'leather');
  block(body,.082,.09,.04,'seam',side*.325,1.28,.40,.014);
 }
 const pack=new T.Group();pack.position.set(0,1.37,-.48);body.add(pack);
 block(pack,.79,.90,.27,'white',0,0,0,.115);
 block(pack,.755,.865,.31,'leather',0,0,-.012,.10);
 block(pack,.62,.65,.10,'cloth',0,-.01,-.195,.085);
 for(const side of [-1,1]){block(pack,.035,.52,.045,'pink',side*.337,.06,-.16,.014);block(pack,.12,.32,.20,'rib',side*.385,-.17,-.02,.04);}
 const emblem=part(pack,new T.TorusGeometry(.205,.023,10,48),'pink',0,.02,-.256);
 const emblemWhite=part(pack,new T.TorusGeometry(.205,.023,10,20,Math.PI*.55),'white',0,.02,-.257);emblemWhite.rotation.z=.25;
 block(pack,.16,.04,.05,'seam',0,-.35,-.246,.01);
 line(pack,[[-.14,.43,0],[-.12,.51,0],[.12,.51,0],[.14,.43,0]],.027,'leather');
 const limbs=[];
 for(const side of [-1,1]){
  const leg=new T.Group();leg.position.set(side*.235,.90,0);body.add(leg);
  const trouser=part(leg,new T.CapsuleGeometry(.185,.37,8,24),'cloth',0,-.265,0);trouser.scale.z=1.14;
  block(leg,.26,.25,.065,'rib',side*.15,-.20,.102,.035);
  block(leg,.27,.063,.078,'seam',side*.15,-.10,.12,.018);
  block(leg,.13,.045,.03,'pink',side*.175,-.12,.162,.01);
  const ankle=part(leg,new T.CylinderGeometry(.147,.145,.13,24),'rib',0,-.56,0);
  // Chunky white midsole, black upper, toe bumper, tongue and crossed laces.
  block(leg,.415,.155,.65,'sole',0,-.805,.095,.07);
  block(leg,.395,.21,.57,'leather',0,-.673,.082,.078);
  block(leg,.375,.083,.21,'white',0,-.741,.319,.035);
  block(leg,.39,.06,.15,'pink',0,-.733,-.178,.022);
  const tongue=block(leg,.19,.21,.11,'seam',0,-.593,.166,.04);tongue.rotation.x=-.45;
  for(let i=0;i<3;i++){
   const z=.15+i*.068,y=-.576-i*.035;
   line(leg,[[-.12,y,z],[0,y+.017,z+.024],[.12,y,z+.035]],.011,'white');
  }
  block(leg,.055,.10,.04,'white',0,-.582,-.182,.012);
  const arm=new T.Group();arm.position.set(side*.50,1.72,0);body.add(arm);
  const sleeve=part(arm,new T.CapsuleGeometry(.18,.31,8,24),'cloth',side*.085,-.255,.005);sleeve.rotation.z=side*.16;
  const cuff=part(arm,new T.CylinderGeometry(.15,.143,.09,24),'white',side*.126,-.545,.015);cuff.rotation.z=side*.10;
  oval(arm,'skin',side*.128,-.628,.015,.27,.26,.27);
  for(let i=0;i<2;i++){const stripe=block(arm,.10,.047,.25,'pink',side*.23,-.14-i*.095,.005,.014);stripe.rotation.z=side*.10;}
  seam(arm,[[side*.10,-.28,.174],[side*.12,-.35,.186],[side*.17,-.39,.155]]);
  limbs.push({side,leg,arm});
 }
 const joints=new Set(limbs.flatMap(({leg,arm})=>[leg,arm]));batchStatic(body,joints);for(const joint of joints)batchStatic(joint);
 player.rotation.y=Math.PI;
 function setAccent(color){m.pink.color.set(color);m.pink.emissive.set(color);m.lining.color.set(color).multiplyScalar(.32);}
 return {player,body,limbs,setAccent};
}
