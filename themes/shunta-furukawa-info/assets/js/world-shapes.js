import * as T from './vendor/three.module.js';

// Centered, rounded solids shared by clothing, props and architecture.
export function rounded(w,h,d,r=.1){
 r=Math.min(r,w/3,h/3,d/3);const s=new T.Shape(),x=-w/2,y=-h/2;
 s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);
 const g=new T.ExtrudeGeometry(s,{depth:d-2*r,bevelEnabled:true,bevelSize:r*.45,bevelThickness:r,bevelSegments:3,curveSegments:8});g.translate(0,0,-d/2+r);return g;
}

// Bake stationary parts by material. Fine geometry should not mean hundreds of
// draw calls; animation joints can be excluded and batched independently.
export function batchStatic(root,exclude=new Set()){
 root.updateWorldMatrix(true,true);const inverse=root.matrixWorld.clone().invert(),batches=new Map(),removed=[];
 function visit(node){
  if(exclude.has(node))return;
  if(node.isMesh&&!Array.isArray(node.material)){
   const key=node.material.uuid+':'+node.castShadow+':'+node.receiveShadow;
   if(!batches.has(key))batches.set(key,{material:node.material,castShadow:node.castShadow,receiveShadow:node.receiveShadow,p:[],n:[],uv:[],indices:[]});
   const out=batches.get(key),geo=node.geometry,matrix=new T.Matrix4().multiplyMatrices(inverse,node.matrixWorld),normalMatrix=new T.Matrix3().getNormalMatrix(matrix),p=geo.attributes.position,n=geo.attributes.normal,uv=geo.attributes.uv,base=out.p.length/3,v=new T.Vector3();
   for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(matrix);out.p.push(v.x,v.y,v.z);n?v.fromBufferAttribute(n,i).applyMatrix3(normalMatrix).normalize():v.set(0,1,0);out.n.push(v.x,v.y,v.z);out.uv.push(uv?uv.getX(i):0,uv?uv.getY(i):0);}
   if(geo.index)for(const i of geo.index.array)out.indices.push(base+i);else for(let i=0;i<p.count;i++)out.indices.push(base+i);
   removed.push(node);
  }
  for(const child of node.children)visit(child);
 }
 for(const child of root.children)visit(child);
 for(const mesh of removed)mesh.removeFromParent();
 for(const geo of new Set(removed.map(m=>m.geometry)))geo.dispose();
 for(const out of batches.values()){
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(out.p,3));geo.setAttribute('normal',new T.Float32BufferAttribute(out.n,3));geo.setAttribute('uv',new T.Float32BufferAttribute(out.uv,2));geo.setIndex(out.indices);geo.computeBoundingSphere();
  const mesh=new T.Mesh(geo,out.material);mesh.castShadow=out.castShadow;mesh.receiveShadow=out.receiveShadow;root.add(mesh);
 }
 return root;
}
