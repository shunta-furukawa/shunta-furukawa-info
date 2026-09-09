import * as T from './vendor/three.module.js';
import {rounded,batchStatic} from './world-shapes.js';
import {surfaceGeometry,faceGeometry,faceZ,facePatch,hairLock,fabricTube} from './avatar-surfaces.js';

export function createAvatar(){
 const player=new T.Group(),body=new T.Group();player.add(body);player.name='explorer';
 const material=(color,roughness=.8)=>new T.MeshStandardMaterial({color,roughness,metalness:0});
 const m={cloth:material(0x292a35,.96),rib:material(0x20212b,.98),seam:material(0x343641,.92),hair:material(0x22232e,.76),hairRidge:material(0x292b37,.80),hairShade:material(0x1b1c26,.80),white:material(0xecebf0,.8),skin:material(0xffe7df,.8),ear:material(0xe4bcb7,.9),sclera:material(0xe9d9d8,.82),iris:material(0x342931,.56),eye:material(0x17141d,.55),mouth:material(0x63414b,.9),sole:material(0xe4e4eb,.92),leather:material(0x242530,.82),pink:material(0xff3b8d,.7),lining:material(0x8d174d,.96)};
 for(const key of ['hair','hairRidge','hairShade'])m[key].side=T.DoubleSide;
 m.pink.emissive.set(0xff3b8d);m.pink.emissiveIntensity=.38;
 // Fine woven relief belongs to cloth only, rather than glossy molded surfaces.
 const weaveData=new Uint8Array(64*64*4);for(let y=0;y<64;y++)for(let x=0;x<64;x++){const i=(y*64+x)*4,v=128+((x+y)%4<2?9:-9)+((x*17+y*13)%7-3);weaveData.set([v,v,v,255],i);}
 const weave=new T.DataTexture(weaveData,64,64);weave.wrapS=weave.wrapT=T.RepeatWrapping;weave.repeat.set(7,7);weave.magFilter=T.LinearFilter;weave.minFilter=T.LinearMipmapLinearFilter;weave.generateMipmaps=true;weave.needsUpdate=true;
 for(const key of ['cloth','rib','lining']){m[key].bumpMap=weave;m[key].bumpScale=.0017;}
 const shine=new T.MeshBasicMaterial({color:0xfff7f4});
 function part(parent,geometry,key,x=0,y=0,z=0){const mesh=new T.Mesh(geometry,m[key]||key);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 function oval(parent,key,x,y,z,sx,sy,sz){const mesh=part(parent,new T.SphereGeometry(.5,28,20),key,x,y,z);mesh.scale.set(sx,sy,sz);return mesh;}
 function block(parent,w,h,d,key,x,y,z,r=.06){return part(parent,rounded(w,h,d,r),key,x,y,z);}
 function line(parent,points,r,key){return part(parent,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),28,r,6,false),key);}
 function seam(parent,points,key='seam',r=.006){return line(parent,points,r,key);}
 function cloth(parent,points,widths,depths,key='cloth',fold=.008){const form=fabricTube(points,widths,depths,{fold});part(parent,form.geometry,key);for(const cap of form.caps)part(parent,cap,key);return form;}
 // Dropped shoulders, a loose waist and gathered hem give the hoodie its own cut.
 const torso=cloth(body,[[0,.94,0],[0,1.10,.016],[0,1.35,0],[0,1.60,-.018],[0,1.79,-.025],[0,1.87,0]],[.46,.505,.49,.46,.365,.235],[.33,.36,.35,.315,.26,.18],'cloth',.010);
 cloth(body,[[0,.90,0],[0,.94,0],[0,1.02,.014]],[.445,.47,.50],[.31,.335,.35],'rib',.003);
 // The hood is behind the neck. A narrow lining fold is visible at the sides;
 // there is no inflated ring across the chin.
 oval(body,'cloth',0,1.85,-.235,1.02,.47,.73);
 oval(body,'lining',0,1.925,-.205,.84,.22,.56);
 oval(body,'skin',0,1.94,.025,.275,.29,.265);
 for(const side of [-1,1]){
  line(body,[[side*.30,1.73,-.08],[side*.41,1.91,-.06],[side*.26,1.97,-.18]],.047,'cloth');
  line(body,[[side*.29,1.79,.055],[side*.36,1.92,-.012],[side*.24,1.96,-.145]],.016,'lining');
 }
 // A pocket follows the front of the sweatshirt, with openings where the hands rest.
 const pocket=surfaceGeometry((u,v)=>{const x=(v-.5)*.66,y=1.055+u*.275;return new T.Vector3(x,y,.363+.025*Math.sin(Math.PI*u)-.065*(x/.4)**2);},10,20,new T.Vector3(0,0,1));part(body,pocket,'cloth');
 seam(body,[[-.32,1.065,.326],[-.26,1.23,.362],[-.21,1.315,.37]]);seam(body,[[.32,1.065,.326],[.26,1.23,.362],[.21,1.315,.37]]);
 for(const side of [-1,1]){
  const x=side*.145;oval(body,'rib',x,1.755,.27,.047,.047,.022);
  line(body,[[x,1.76,.284],[x*1.08,1.56,.347],[x*1.25,1.33,.38]],.016,'white');
  block(body,.035,.078,.036,'pink',x*1.25,1.295,.38,.01);
 }
 const head=new T.Group();head.position.set(0,2.28,.005);body.add(head);part(head,faceGeometry(),'skin');
 for(const side of [-1,1]){
  oval(head,'skin',side*.495,-.015,.015,.172,.245,.17);
  oval(head,'ear',side*.526,-.015,.094,.052,.11,.016);
  const x=side*.192,y=.025;
  // Fitted almond-shaped eyes: all layers lie on the face instead of protruding spheres.
  part(head,facePatch(x,y,.125,.119,.004,true),'eye');
  part(head,facePatch(x,y-.006,.114,.107,.006,true),'sclera');
  part(head,facePatch(x-side*.006,y,.083,.101,.010),'iris');
  part(head,facePatch(x-side*.006,y+.004,.055,.080,.012),'eye');
  const glint=part(head,facePatch(x-.025,y+.050,.017,.020,.015),shine);glint.castShadow=false;
  const glintSmall=part(head,facePatch(x+.030,y-.037,.006,.008,.014),shine);glintSmall.castShadow=false;
  const brow=[[-.10,.193],[-.02,.217],[.075,.207]].map(([dx,dy])=>[x+dx,dy,faceZ(x+dx,dy)+.009]);line(head,brow,.014,'hairShade');
 }
 const smile=[[-.11,-.220],[-.04,-.245],[.032,-.246],[.108,-.218]].map(([x,y])=>[x,y,faceZ(x,y)+.006]);line(head,smile,.008,'mouth');
 // Small sculpted nostril creases, rather than a separate bead-shaped nose.
 for(const side of [-1,1]){const x=side*.03,y=-.127;part(head,facePatch(x,y,.012,.0045,.003),'ear');}
 const capGeo=new T.SphereGeometry(1,48,32,0,Math.PI*2,0,1.94),cp=capGeo.attributes.position;
 for(let i=0;i<cp.count;i++)cp.setXYZ(i,cp.getX(i)*.555,.155+cp.getY(i)*.545,-.045+cp.getZ(i)*.485);capGeo.computeVertexNormals();part(head,capGeo,'hairShade');
 function lock(points,width,depth=.024,outward=[0,0,1],key='hair',highlight=false){
  const leaf=hairLock(points,width,depth,outward);const mesh=part(head,leaf.geometry,key);mesh.castShadow=false;
  // Shallow secondary ridges read as combed strands, not additional thick locks.
  for(const v of [.29,.46,.69]){const ridge=surfaceGeometry((u,w)=>leaf.sample(.09+u*.85,v+(w-.5)*.016,.0015),24,2,leaf.out);part(head,ridge,'hairRidge').castShadow=false;}
  if(highlight){const ribbon=surfaceGeometry((u,v)=>leaf.sample(.07+u*.86,.32+(v-.5)*.12*Math.sin(Math.PI*u),.003),32,4,leaf.out);part(head,ribbon,'white').castShadow=false;}
 }
 // A layered side sweep with a few broad leaves; the tips thin into the silhouette.
 lock([[.40,.48,.23],[.22,.57,.365],[-.15,.50,.425],[-.52,.285,.26]],.166,.024,[0,0,1],'hair',true);
 lock([[.40,.39,.29],[.21,.435,.452],[-.14,.31,.493],[-.48,.13,.335]],.155,.023,[0,0,1],'hair');
 lock([[.30,.31,.35],[.18,.27,.460],[-.055,.165,.49],[-.28,.045,.424]],.126,.022,[0,0,1],'hairShade');
 lock([[.20,.60,.08],[-.04,.69,.19],[-.32,.545,.30],[-.57,.365,.12]],.118,.025,[0,0,1],'hair',true);
 lock([[.36,.475,.12],[.495,.35,.20],[.53,.145,.12],[.45,-.13,.055]],.12,.018,[1,0,.2],'hair');
 lock([[-.37,.37,.04],[-.515,.23,.07],[-.52,.01,.10],[-.435,-.19,.02]],.115,.018,[-1,0,.15],'hairShade');
 lock([[.12,.63,-.13],[.28,.735,-.12],[.38,.675,-.045],[.38,.505,.105]],.083,.012,[0,.6,1],'hair');
 // A full rear haircut with fine tapered tips above the hood and behind the ears.
 for(const side of [-1,1]){
  for(let i=0;i<4;i++){
   const x=side*(.06+i*.126);
   lock([[x*.60,.61-i*.035,-.225],[x,.38,-.455+i*.040],[x*1.04,.07,-.49+i*.05],[x*1.05,-.23+i*.045,-.30+i*.025]],.125-i*.008,.018,[side*.25,0,-1],i%2?'hairShade':'hair');
  }
  lock([[side*.38,.46,-.12],[side*.52,.26,-.21],[side*.56,.01,-.19],[side*.43,-.21,-.12]],.12,.017,[side,0,-.3]);
 }
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
  const leg=new T.Group();leg.position.set(side*.252,.884,0);body.add(leg);
  cloth(leg,[[0,.025,-.015],[side*.025,-.19,.008],[side*.025,-.39,.018],[0,-.565,-.008]],[.196,.21,.196,.133],[.21,.219,.19,.133],'cloth',.012);
  cloth(leg,[[0,-.535,-.008],[0,-.59,-.008],[0,-.625,-.008]],[.142,.13,.127],[.144,.13,.127],'rib',.003);
  const cargo=block(leg,.22,.245,.035,'rib',side*.09,-.20,.201,.026);cargo.rotation.y=side*.27;
  const flap=block(leg,.23,.06,.038,'cloth',side*.09,-.095,.217,.014);flap.rotation.y=side*.27;
  const tab=block(leg,.09,.031,.014,'pink',side*.095,-.104,.238,.006);tab.rotation.y=side*.27;
  const shoe=new T.Group();shoe.rotation.y=side*.10;leg.add(shoe);
  // A shoe last with a rounded toe and narrower heel, instead of a beveled cuboid.
  function soleSample(u,v){const a=v*Math.PI*2,scale=.92+.08*Math.sin(Math.PI*u),z=.09+Math.sin(a)*.325;return new T.Vector3(Math.cos(a)*(.18+.025*(1+Math.sin(a)))*scale,-.878+u*.15,z*scale);}
  part(shoe,surfaceGeometry(soleSample,10,40),'sole');
  const upperProfile=new T.SplineCurve([[0,1],[.28,.99],[.62,.87],[1,.60]].map(p=>new T.Vector2(...p)));
  part(shoe,surfaceGeometry((u,v)=>{const a=v*Math.PI*2,k=upperProfile.getPoint(u).y,z=.075*(1-u)+Math.sin(a)*(.285*(1-u)+.16*u);return new T.Vector3(Math.cos(a)*(.175+.02*(1+Math.sin(a)))*k,-.742+u*.215,z);},18,40),'leather');
  // The tongue follows the instep, while the white toe seam stays a thin accent.
  const tongue=oval(shoe,'cloth',0,-.567,.12,.19,.17,.16);tongue.rotation.x=-.45;
  seam(shoe,[[-.17,-.722,.26],[0,-.703,.357],[.17,-.722,.26]],'white',.012);
  for(let i=0;i<3;i++)line(shoe,[[-.10,-.57-i*.035,.14+i*.047],[0,-.55-i*.035,.155+i*.047],[.10,-.57-i*.035,.17+i*.047]],.009,'seam');
  block(shoe,.22,.041,.025,'pink',0,-.728,-.231,.011);
  block(shoe,.045,.082,.025,'white',0,-.585,-.154,.009);
  const arm=new T.Group();arm.position.set(side*.43,1.76,-.015);body.add(arm);
  const sleeve=cloth(arm,[[side*.015,.015,0],[side*.12,-.18,-.005],[side*.145,-.37,.045],[side*.075,-.545,.19]],[.177,.19,.18,.125],[.18,.19,.18,.126],'cloth',.01);
  // Pink bands lie directly on the curved sleeve surface, with no projecting tabs.
  for(const u0 of [.23,.35]){const patch=surfaceGeometry((u,v)=>sleeve.sample(u0+u*.064,side<0?.25+v*.42:-.17+v*.42,.003),5,20,new T.Vector3(side,0,1));part(arm,patch,'pink');}
  cloth(arm,[[side*.088,-.515,.164],[side*.07,-.556,.205]],[.129,.118],[.13,.12],'white',0);
  const hand=oval(arm,'skin',side*.055,-.607,.224,.19,.195,.16);hand.rotation.z=-side*.3;
  // A small inward thumb joins the mitten silhouette close to the pocket opening.
  oval(arm,'skin',side*.008,-.582,.277,.078,.12,.075);
  limbs.push({side,leg,arm});
 }
 const joints=new Set(limbs.flatMap(({leg,arm})=>[leg,arm]));batchStatic(body,joints);for(const joint of joints)batchStatic(joint);
 player.rotation.y=Math.PI;
 function setAccent(color){m.pink.color.set(color);m.pink.emissive.set(color);m.lining.color.set(color).multiplyScalar(.32);}
 return {player,body,limbs,setAccent};
}
