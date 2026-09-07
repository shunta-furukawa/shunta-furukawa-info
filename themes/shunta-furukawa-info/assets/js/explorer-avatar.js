import * as T from './vendor/three.module.js';

// Keep the original proportions and animation pivots, refining only the surfaces.
export function createAvatar(materials){
 const player=new T.Group(),body=new T.Group();player.add(body);
 function part(parent,geometry,color,x=0,y=0,z=0){const m=new T.Mesh(geometry,materials[color]);m.position.set(x,y,z);parent.add(m);return m;}
 function oval(parent,color,x,y,z,sx,sy,sz){const m=part(parent,new T.SphereGeometry(.5,40,28),color,x,y,z);m.scale.set(sx,sy,sz);return m;}
 // A gently curved hoodie body instead of an eight-sided cylinder.
 const profile=new T.SplineCurve([new T.Vector2(0,-.475),new T.Vector2(.45,-.475),new T.Vector2(.55,-.41),new T.Vector2(.55,-.15),new T.Vector2(.51,.2),new T.Vector2(.45,.4),new T.Vector2(.33,.475),new T.Vector2(0,.475)]);
 part(body,new T.LatheGeometry(profile.getPoints(36),48),'black',0,1.22,0);
 oval(body,'black',0,1.7,-.1,1.32,1.056,1.056);
 const head=new T.Group();head.position.y=2.02;body.add(head);
 oval(head,'white',0,.12,.13,.9,1,.8);
 part(head,new T.SphereGeometry(.57,48,32,0,Math.PI*2,0,1.7),'black',0,.27,0);
 oval(head,'black',0,.02,-.2,1.16,1.276,.754);
 for(const side of [-1,1]){
  const lock=part(head,new T.CapsuleGeometry(.135,.38,10,24),'black',side*.45,-.05,.02);lock.rotation.z=side*.1;
  oval(head,'white',side*.43,.01,.18,.19,.28,.14);
  const eye=oval(head,'black',side*.17,.16,.5,.13,.145,.09);eye.rotation.z=-side*.08;
 }
 // The logo's swept fringe, with a continuous curved contour and a rounded edge.
 const fringeShape=new T.Shape();fringeShape.moveTo(-.48,.45);
 fringeShape.bezierCurveTo(-.2,.59,.23,.6,.46,.5);
 fringeShape.bezierCurveTo(.37,.35,.2,.13,-.13,-.02);
 fringeShape.bezierCurveTo(-.21,-.03,-.34,.07,-.39,.2);
 fringeShape.quadraticCurveTo(-.5,.32,-.48,.45);
 const fringe=part(head,new T.ExtrudeGeometry(fringeShape,{depth:.09,steps:1,curveSegments:24,bevelEnabled:true,bevelThickness:.025,bevelSize:.025,bevelSegments:6}),'black',0,0,.42);fringe.rotation.z=-.1;
 const smile=new T.CatmullRomCurve3([new T.Vector3(-.13,-.09,.51),new T.Vector3(0,-.14,.54),new T.Vector3(.13,-.09,.51)]);
 part(head,new T.TubeGeometry(smile,24,.022,12,false),'black');
 const limbs=[];
 for(const side of [-1,1]){
  const leg=new T.Group();leg.position.set(side*.23,.83,0);body.add(leg);
  const trouser=part(leg,new T.CapsuleGeometry(.15,.37,10,24),'black',0,-.32,0);trouser.scale.z=1.15;
  oval(leg,'white',0,-.72,.13,.37,.2,.65);
  const arm=new T.Group();arm.position.set(side*.62,1.62,0);body.add(arm);
  part(arm,new T.CapsuleGeometry(.17,.36,10,24),'black',0,-.3,0);
  oval(arm,'white',0,-.68,0,.3,.3,.3);
  limbs.push({side,leg,arm});
 }
 for(const side of [-1,1])part(body,new T.CapsuleGeometry(.02,.31,6,12),'white',side*.14,1.45,.49);
 // The pocket is a shallow rounded form, not a sharp strip across the hoodie.
 oval(body,'dark',0,1.03,.48,.55,.21,.08);
 player.rotation.y=Math.PI;
 return {player,body,limbs};
}
