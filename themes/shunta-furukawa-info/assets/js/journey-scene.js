import * as THREE from './vendor/three.module.js';
// Spatial chapters, all on one continuous camera path. The images are generated assets,
// not a recording of an ad system or claims about a real audience.
export async function createJourneyScene(host) {
  const mobile=window.innerWidth<720;
  const renderer=new THREE.WebGLRenderer({alpha:false,antialias:!mobile,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.25:1.5));
  renderer.setClearColor(0x07070d,1);
  const scene=new THREE.Scene();scene.fog=new THREE.Fog(0x07070d,20,72);
  const camera=new THREE.PerspectiveCamera(mobile?64:48,1,.1,150);
  const loader=new THREE.TextureLoader();
  let textures;
  try {
    textures=await Promise.all(['signal-city','viewer-context','meaningful-journey'].map(name=>loader.loadAsync('/images/journey/'+name+'.webp')));
  } catch(error) {renderer.dispose();throw error;}
  textures.forEach(t=>{t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());});
  const pink=0xff4b9a;
  const geometryPlane=new THREE.PlaneGeometry(1,1);
  const floating=[];
  function picture(texture,w,h,x,y,z,rotation=0,opacity=1){
    const material=new THREE.MeshBasicMaterial({map:texture,transparent:opacity<1,opacity,side:THREE.DoubleSide,toneMapped:false});
    const mesh=new THREE.Mesh(geometryPlane,material);mesh.position.set(x,y,z);mesh.scale.set(w,h,1);mesh.rotation.y=rotation;scene.add(mesh);
    return mesh;
  }
  function frame(w,h,x,y,z,rotation=0,color=pink){
    const g=new THREE.EdgesGeometry(new THREE.PlaneGeometry(w,h));
    const object=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color,transparent:true,opacity:.55}));
    object.position.set(x,y,z+.02);object.rotation.y=rotation;scene.add(object);return object;
  }
  // 01: walk through a deep field of luminous media planes.
  picture(textures[0],58,38.67,0,0,-20);
  for(let i=0;i<18;i++) {
    const side=i%2?1:-1;
    const x=side*(6+(i%3)*2.8), y=((i*7)%5-2)*2.2, z=8-i*1.7;
    const w=3+(i%3),h=w*2/3,rotation=-side*.4;
    const mesh=picture(textures[i%3],w,h,x,y,z,rotation,.7);
    const edge=frame(w,h,x,y,z,rotation);
    floating.push({mesh,edge,y,phase:i*.7});
  }
  // 02: a quiet human-scale space replaces the crowded field.
  picture(textures[1],24,16,16,2,-36);
  frame(24.1,16.1,16,2,-36);
  for(let i=0;i<5;i++){
    const x=4+i*5.5,y=6.5+Math.sin(i)*2,z=-29-i*1.2;
    picture(textures[0],2.4,1.6,x,y,z,-.15,.38);frame(2.4,1.6,x,y,z,-.15);
  }
  // 03: move through a selected frame into a landscape, rather than reveal another card.
  picture(textures[2],32,21.33,0,2,-68);
  frame(24,16,0,2,-62);
  frame(20,13.33,0,2,-57);
  const portal=new THREE.Group();portal.position.set(0,2,-57);scene.add(portal);
  for(let i=0;i<3;i++){
    const ring=new THREE.Mesh(new THREE.TorusGeometry(8+i*.3,.014,4,100),new THREE.MeshBasicMaterial({color:pink,transparent:true,opacity:.35}));
    ring.scale.y=.68;ring.position.z=i*.7;portal.add(ring);
  }
  // 04: a spatial topology diagram. Cubes are system nodes; moving points are requests.
  const infrastructure=new THREE.Group();infrastructure.position.set(-16,0,-92);scene.add(infrastructure);
  const cubeEdges=new THREE.EdgesGeometry(new THREE.BoxGeometry(1.5,1.5,1.5));
  const cubeMaterial=new THREE.LineBasicMaterial({color:pink,transparent:true,opacity:.6});
  const nodes=[];
  for(let row=0;row<3;row++)for(let col=0;col<5;col++){
    const node=new THREE.LineSegments(cubeEdges,cubeMaterial);node.position.set((col-2)*4,(row-1)*3.5,-Math.abs(col-2)*1.3);infrastructure.add(node);nodes.push(node.position.clone());
    const solid=new THREE.Mesh(new THREE.BoxGeometry(1.44,1.44,1.44),new THREE.MeshBasicMaterial({color:0x230f27,transparent:true,opacity:.7}));solid.position.copy(node.position);infrastructure.add(solid);
  }
  const linePoints=[];
  for(let row=0;row<3;row++)for(let col=0;col<4;col++)linePoints.push(nodes[row*5+col],nodes[row*5+col+1]);
  for(let col=0;col<5;col++)for(let row=0;row<2;row++)linePoints.push(nodes[row*5+col],nodes[(row+1)*5+col]);
  infrastructure.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(linePoints),new THREE.LineBasicMaterial({color:0xb6427d,transparent:true,opacity:.3})));
  const grid=new THREE.GridHelper(75,35,0x952555,0x2c142a);grid.position.set(-16,-6,-94);scene.add(grid);
  // 05: an open horizon with orbital connections.
  picture(textures[2],65,43.33,0,1,-144,0,.4);
  const endRings=new THREE.Group();endRings.position.set(4,1,-124);scene.add(endRings);
  for(let i=0;i<5;i++){
    const ring=new THREE.Mesh(new THREE.TorusGeometry(4+i*.55,.015,4,100),new THREE.MeshBasicMaterial({color:pink,transparent:true,opacity:.45}));
    ring.rotation.set(i*.25,i*.35,0);endRings.add(ring);
  }
  // A thin illuminated route connects the chapters in world space.
  const route=new THREE.CatmullRomCurve3([new THREE.Vector3(0,-3,10),new THREE.Vector3(3,-2,-12),new THREE.Vector3(16,-2,-31),new THREE.Vector3(0,-2,-61),new THREE.Vector3(-16,-2,-90),new THREE.Vector3(4,-2,-125)]);
  const routeLine=new THREE.Line(new THREE.BufferGeometry().setFromPoints(route.getPoints(400)),new THREE.LineBasicMaterial({color:pink,transparent:true,opacity:.42}));scene.add(routeLine);
  const particleCount=mobile?550:1000;
  const seed=new Float32Array(particleCount*3);
  for(let i=0;i<particleCount;i++){seed[i*3]=(i*.6180339887)%1;seed[i*3+1]=(i*.414213562)%1;seed[i*3+2]=(i*.732050808)%1;}
  const particlesGeo=new THREE.BufferGeometry();particlesGeo.setAttribute('position',new THREE.BufferAttribute(seed,3));
  const particlesMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{time:{value:0},ratio:{value:Math.min(devicePixelRatio,1.5)}},vertexShader:`uniform float time;uniform float ratio;varying float a;void main(){float z=-145.0+fract(position.z+time*.006)*170.0;float x=(position.x-.5)*65.0;float y=(position.y-.5)*28.0;vec4 mv=modelViewMatrix*vec4(x,y,z,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(36.0/-mv.z,1.0,3.0)*ratio;a=smoothstep(0.0,5.0,-mv.z)*(1.0-smoothstep(18.0,65.0,-mv.z));}`,fragmentShader:`varying float a;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(1.0,.22,.55,(1.0-d*2.0)*a*.7);}`});
  const particleField=new THREE.Points(particlesGeo,particlesMat);particleField.frustumCulled=false;scene.add(particleField);
  const routePulses=new THREE.Group();scene.add(routePulses);
  const pulseGeo=new THREE.SphereGeometry(.055,6,4),pulseMat=new THREE.MeshBasicMaterial({color:0xffb7d6});
  for(let i=0;i<55;i++)routePulses.add(new THREE.Mesh(pulseGeo,pulseMat));
  const cameraKeys=[new THREE.Vector3(0,1,14),new THREE.Vector3(13,2,-16),new THREE.Vector3(0,2,-43),new THREE.Vector3(-16,2,-72),new THREE.Vector3(0,1,-108)];
  const lookKeys=[new THREE.Vector3(2,0,-12),new THREE.Vector3(17,2,-36),new THREE.Vector3(1,2,-66),new THREE.Vector3(-14,0,-94),new THREE.Vector3(4,1,-125)];
  let targetProgress=0,currentProgress=0,initialized=false,paused=false,frameId=0,last=0,elapsed=0,lost=false,pointerX=0,pointerY=0;
  const look=new THREE.Vector3();
  function interpolate(keys,p,out){const i=Math.min(3,Math.floor(p)),t=Math.min(1,p-i),smooth=t*t*(3-2*t);return out.copy(keys[i]).lerp(keys[i+1],smooth);}
  function render(now=0){
    frameId=0;const dt=last?Math.min((now-last)/1000,.05):0;last=now;
    if(!paused){elapsed+=dt;currentProgress+=(targetProgress-currentProgress)*Math.min(1,dt*8);}
    else currentProgress=targetProgress;
    interpolate(cameraKeys,currentProgress,camera.position);interpolate(lookKeys,currentProgress,look);
    if(!paused){camera.position.x+=pointerX*.25;camera.position.y+=pointerY*.15;}
    // Keep the person and the small coastal train in view on a narrow screen.
    if(camera.aspect<.85){look.x-=Math.max(0,1-Math.abs(currentProgress-1))*3+Math.max(0,1-Math.abs(currentProgress-2))*6;}
    camera.lookAt(look);particlesMat.uniforms.time.value=elapsed;
    floating.forEach(item=>{item.mesh.position.y=item.y+Math.sin(elapsed*.35+item.phase)*.2;item.edge.position.y=item.mesh.position.y;});
    endRings.rotation.y=elapsed*.06;endRings.rotation.z=elapsed*.025;
    portal.rotation.z=Math.sin(elapsed*.1)*.012;
    routePulses.children.forEach((pulse,i)=>pulse.position.copy(route.getPointAt((i/55+elapsed*.022)%1)));
    renderer.render(scene,camera);
    if(!paused&&!document.hidden&&!lost)frameId=requestAnimationFrame(render);
  }
  function stop(){cancelAnimationFrame(frameId);frameId=0;last=0;}
  function schedule(){if(!frameId&&!document.hidden&&!lost){last=0;frameId=requestAnimationFrame(render);}}
  const resize=()=>{const w=innerWidth,h=innerHeight;camera.aspect=w/h;camera.fov=w<720?64:48;camera.updateProjectionMatrix();renderer.setSize(w,h,false);schedule();};
  host.append(renderer.domElement);resize();
  window.addEventListener('resize',resize,{passive:true});
  window.addEventListener('pointermove',e=>{if(paused||e.pointerType==='touch')return;pointerX=e.clientX/innerWidth-.5;pointerY=.5-e.clientY/innerHeight;},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else schedule();});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;stop();document.body.classList.remove('world-rendered');});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{lost=false;document.body.classList.add('world-rendered');schedule();});
  return {setProgress(p){targetProgress=Math.max(0,Math.min(4,p));if(!initialized){currentProgress=targetProgress;initialized=true;}schedule();},setPaused(value){paused=value;stop();if(!paused)schedule();}};
}
