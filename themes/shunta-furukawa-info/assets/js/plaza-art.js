import * as T from './vendor/three.module.js';

export function pavingMaterial(color){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d');
 ctx.fillStyle='#bfc0c7';ctx.fillRect(0,0,256,256);
 for(let x=0;x<2;x++)for(let y=0;y<2;y++){ctx.fillStyle=(x+y)%2?'#c9cbd0':'#bfc1c8';ctx.fillRect(x*128+1,y*128+1,126,126);}
 ctx.strokeStyle='#989aa5';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(256,0);ctx.moveTo(0,128);ctx.lineTo(256,128);ctx.moveTo(0,0);ctx.lineTo(0,256);ctx.moveTo(128,0);ctx.lineTo(128,256);ctx.stroke();
 const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=2;
 return new T.MeshStandardMaterial({color,map,roughness:.78,metalness:.12});
}
export function planarUV(geometry,size=8){const p=geometry.attributes.position,uv=[];for(let i=0;i<p.count;i++)uv.push(p.getX(i)/size,p.getZ(i)/size);geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));return geometry;}

export function plazaLighting(scene,renderer){
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 scene.background=new T.Color(0x101119);scene.fog=new T.FogExp2(0x101119,.013);
 scene.add(new T.HemisphereLight(0xdde4ff,0x33313f,2.15));
 const key=new T.DirectionalLight(0xfff5ef,3.1);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-17,right:17,top:17,bottom:-17,near:1,far:65});key.shadow.camera.updateProjectionMatrix();key.shadow.bias=-.00025;key.shadow.normalBias=.025;scene.add(key,key.target);
 const rim=new T.DirectionalLight(0xffb2d0,1.1);scene.add(rim,rim.target);
 const area=new T.PointLight(0xff3b8d,0,10,2);scene.add(area);
 return {
  follow(player,near,dt){key.position.copy(player).add(new T.Vector3(-10,20,12));key.target.position.copy(player);rim.position.copy(player).add(new T.Vector3(9,9,-8));rim.target.position.copy(player);const intensity=near?16:0;area.intensity+=(intensity-area.intensity)*Math.min(1,dt*6);if(near)area.position.set(near.x,1.5,near.z);},
  setAccent(color){area.color.set(color);rim.color.set(color).lerp(new T.Color(0xffffff),.65);}
 };
}

// Ground numbers are actual wayfinding labels, tied to the exhibit sequence.
export function areaMarker(index){
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;const ctx=canvas.getContext('2d');
 ctx.fillStyle='#9396a6';ctx.font='600 18px sans-serif';ctx.fillText('AREA',8,24);ctx.font='700 66px sans-serif';ctx.fillText(String(index+1).padStart(2,'0'),6,84);ctx.font='600 13px monospace';ctx.fillText('///  EXPLORE',8,109);
 const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;const mesh=new T.Mesh(new T.PlaneGeometry(2.8,1.4),new T.MeshBasicMaterial({map,transparent:true,opacity:.56,depthWrite:false,toneMapped:false}));mesh.rotation.x=-Math.PI/2;return mesh;
}
