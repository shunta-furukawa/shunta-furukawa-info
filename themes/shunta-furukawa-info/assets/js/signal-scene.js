import * as THREE from './vendor/three.module.js';
export function createSignalScene(host) {
  const renderer = new THREE.WebGLRenderer({ alpha:true, antialias:window.devicePixelRatio < 2, powerPreference:'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
  renderer.setClearColor(0x0e0f14,0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42,1,0.1,70);
  camera.position.set(0,1,17);
  camera.lookAt(0,0,0);
  const root = new THREE.Group(); scene.add(root);
  const pink = new THREE.Color('#ff3b8d');
  const ringMaterial = new THREE.MeshBasicMaterial({color:pink, transparent:true, opacity:0.5});
  const rings = [];
  for(let i=0;i<4;i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.1+i*.27,.008,4,100),ringMaterial);
    ring.rotation.y = Math.PI/2-.2; ring.rotation.z = i*.18;
    ring.position.x = -.5+i*.12; root.add(ring); rings.push(ring);
  }
  // Thousands of possible paths converge at a decision plane. Only some continue.
  const count = window.innerWidth < 720 ? 650 : 1300;
  const geometry = new THREE.BufferGeometry();
  const seeds = new Float32Array(count*3);
  for(let i=0;i<count;i++) { seeds[i*3]=(i*.61803398875)%1; seeds[i*3+1]=(i*.41421356)%1; seeds[i*3+2]=i%9===0?1:0; }
  geometry.setAttribute('position',new THREE.BufferAttribute(seeds,3));
  const material = new THREE.ShaderMaterial({
    transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
    uniforms:{time:{value:0},pixelRatio:{value:Math.min(window.devicePixelRatio,1.5)},pink:{value:pink}},
    vertexShader:`uniform float time; uniform float pixelRatio; varying float vAlpha; varying float vPicked;
      void main(){
        float p=fract(position.x+time*.075); float angle=position.y*6.283185+time*.18;
        float x=p*13.0-6.5; float before=1.0-smoothstep(-6.5,0.0,x);
        float spread=before*3.3+.06;
        float y=sin(angle)*spread; float z=cos(angle)*spread;
        float picked=position.z;
        if(x>0.0){ y=sin(angle)*x*.48*(1.0-picked); z=cos(angle)*x*.48*(1.0-picked); }
        vec4 mv=modelViewMatrix*vec4(x,y,z,1.0);
        gl_Position=projectionMatrix*mv;
        gl_PointSize=(picked>.5?4.5:2.0)*pixelRatio*(15.0/-mv.z);
        vAlpha=smoothstep(0.0,.08,p)*(1.0-smoothstep(.85,1.0,p));
        if(x>0.0 && picked<.5) vAlpha*=1.0-smoothstep(0.0,3.8,x);
        vPicked=picked;
      }`,
    fragmentShader:`uniform vec3 pink; varying float vAlpha; varying float vPicked;
      void main(){ float d=length(gl_PointCoord-.5); if(d>.5)discard; float a=(1.0-smoothstep(.03,.5,d))*vAlpha; gl_FragColor=vec4(mix(vec3(.34,.24,.34),pink,vPicked*.8+.2),a); }`
  });
  const points = new THREE.Points(geometry,material); points.frustumCulled=false; root.add(points);
  const paths = new THREE.Group();
  for(let i=0;i<22;i++) {
    const angle=i/22*Math.PI*2;
    const curve = new THREE.CubicBezierCurve3(new THREE.Vector3(-6,Math.sin(angle)*3.5,Math.cos(angle)*3.5),new THREE.Vector3(-3,Math.sin(angle)*3.5,Math.cos(angle)*3.5),new THREE.Vector3(-1,0,0),new THREE.Vector3(5.5,0,0));
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(65)),new THREE.LineBasicMaterial({color:pink,transparent:true,opacity:i%4===0?.22:.075})); paths.add(line);
  } root.add(paths);
  const destination = new THREE.Mesh(new THREE.SphereGeometry(.085,16,12), new THREE.MeshBasicMaterial({color:0xffc6e0})); destination.position.x=5.5; root.add(destination);
  const halo = new THREE.Mesh(new THREE.RingGeometry(.22,.23,48),new THREE.MeshBasicMaterial({color:pink,side:THREE.DoubleSide,transparent:true,opacity:.55})); halo.position.x=5.5; root.add(halo);
  host.append(renderer.domElement); host.classList.add('is-rendered');
  let paused=false, visible=true, lost=false, frame=0, last=0, elapsed=0, targetX=0, targetY=0;
  function draw(now=0){
    frame=0;
    const dt=last?Math.min((now-last)/1000,.05):0; last=now;
    if(!paused)elapsed+=dt;
    material.uniforms.time.value=elapsed;
    root.rotation.y += (targetX*.12-root.rotation.y)*.045;
    root.rotation.x += (targetY*.08-root.rotation.x)*.045;
    rings.forEach((r,i)=>{r.rotation.y=Math.PI/2-.22+Math.sin(elapsed*.3+i*.3)*.12;});
    halo.scale.setScalar(1+Math.sin(elapsed*1.8)*.16);
    renderer.render(scene,camera);
    if(!paused && visible && !document.hidden && !lost)frame=requestAnimationFrame(draw);
  }
  function schedule(){ if(!frame && visible && !document.hidden && !lost){last=0;frame=requestAnimationFrame(draw);} }
  function stop(){cancelAnimationFrame(frame);frame=0;last=0;}
  const resize = new ResizeObserver(()=>{
    const w=host.clientWidth,h=host.clientHeight; if(!w||!h)return;
    renderer.setSize(w,h,false);camera.aspect=w/h;camera.position.z=camera.aspect<1.2?20:17;camera.updateProjectionMatrix();schedule();
  }); resize.observe(host);
  const visibility = new IntersectionObserver(entries=>{visible=entries[0].isIntersecting; if(visible)schedule();else stop();});visibility.observe(host);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else schedule();});
  host.addEventListener('pointermove',e=>{if(paused||e.pointerType==='touch')return;const r=host.getBoundingClientRect();targetX=(e.clientX-r.left)/r.width-.5;targetY=(e.clientY-r.top)/r.height-.5;});
  host.addEventListener('pointerleave',()=>{targetX=0;targetY=0;});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;stop();host.classList.remove('is-rendered');renderer.domElement.style.visibility='hidden';});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{lost=false;host.classList.add('is-rendered');renderer.domElement.style.visibility='';schedule();});
  return {setPaused(value){paused=value;stop();schedule();}};
}
