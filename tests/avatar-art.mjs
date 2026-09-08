import assert from 'node:assert/strict';
import * as T from '../themes/shunta-furukawa-info/assets/js/vendor/three.module.js';
import {createAvatar} from '../themes/shunta-furukawa-info/assets/js/explorer-avatar.js';
import {buildHarbor,createArtifact,setArtifactColor} from '../themes/shunta-furukawa-info/assets/js/harbor-models.js';
import {batchStatic} from '../themes/shunta-furukawa-info/assets/js/world-shapes.js';
import {faceZ,faceGeometry,facePatch,hairLock,fabricTube} from '../themes/shunta-furukawa-info/assets/js/avatar-surfaces.js';
import {plazaLighting} from '../themes/shunta-furukawa-info/assets/js/plaza-art.js';

function geometryStats(root){
 let meshes=0,triangles=0;root.updateWorldMatrix(true,true);
 root.traverse(o=>{if(!o.isMesh)return;meshes++;const {position,normal}=o.geometry.attributes;
  for(const attribute of [position,normal])for(const v of attribute.array)assert.ok(Number.isFinite(v),'finite vertex and normal');
  if(o.geometry.index)for(const index of o.geometry.index.array)assert.ok(index<position.count,'valid vertex index');
  triangles+=(o.geometry.index?.count||position.count)/3;
 });return {meshes,triangles};
}
const avatar=createAvatar();const stats=geometryStats(avatar.player);
assert.ok(stats.meshes<=50,'character draw-call budget');assert.ok(stats.triangles<=100000,'character triangle budget');
const bounds=new T.Box3().setFromObject(avatar.player),size=bounds.getSize(new T.Vector3());
assert.ok(bounds.min.y>-.03&&bounds.min.y<.08,'feet remain on the ground');
assert.ok(size.y>2.8&&size.y<3.3,'chase camera and interaction reach still fit the avatar');
assert.ok(size.x<1.7&&size.z<1.5);
const leg=avatar.limbs[0].leg;assert.ok(leg.children.some(c=>c.isMesh),'leg retains its geometry after batching');
const before=new T.Box3().setFromObject(leg).getCenter(new T.Vector3());leg.rotation.x=.8;avatar.player.updateMatrixWorld(true);
const after=new T.Box3().setFromObject(leg).getCenter(new T.Vector3());assert.ok(before.distanceTo(after)>.1,'animated joint moves attached tailoring');
avatar.setAccent('#36dcca');let accentParts=0;avatar.player.traverse(o=>{if(o.isMesh&&o.material.emissiveIntensity===.38){accentParts++;assert.equal(o.material.emissive.getHexString(),'36dcca');assert.equal(o.material.color.getHexString(),'36dcca');}});assert.ok(accentParts>0);

const world=new T.Group(),obstacles=[];buildHarbor(world,{scale:1.6,obstacles});const architecture=geometryStats(world);
assert.ok(architecture.meshes<=20,'static architecture draw-call budget');assert.ok(architecture.triangles<230000);assert.equal(obstacles.length,8);
setArtifactColor('#36dcca');let litSurfaces=0;world.traverse(o=>{if(o.isMesh&&o.material.emissiveIntensity===.65){litSurfaces++;assert.equal(o.material.emissive.getHexString(),'36dcca');}});assert.ok(litSurfaces>0);
for(const kind of ['card','phone','console','chart','broadcast','document','book','compass','server','wrench','toolbox','radio'])assert.ok(geometryStats(createArtifact(kind)).triangles>0,kind+' model is present');
const scene=new T.Scene(),lights=plazaLighting(scene,{shadowMap:{}});lights.setAccent('#36dcca');lights.follow(new T.Vector3(12,1,20),{x:4,z:8},.016);scene.traverse(o=>{for(const value of o.position.toArray())assert.ok(Number.isFinite(value));});

// Nested transforms must survive baking, and excluded joints must not be baked twice.
const root=new T.Group();root.position.set(5,2,3);root.rotation.y=.6;
const nested=new T.Group();nested.position.set(2,1,-3);nested.rotation.x=.4;root.add(nested);
const part=new T.Mesh(new T.BoxGeometry(1,2,3),new T.MeshStandardMaterial());nested.add(part);
const preserved=new T.Group();preserved.add(new T.Mesh(new T.SphereGeometry(.2),part.material));root.add(preserved);
const oldBounds=new T.Box3().setFromObject(root);batchStatic(root,new Set([preserved]));
const newBounds=new T.Box3().setFromObject(root);
assert.ok(oldBounds.min.distanceTo(newBounds.min)<1e-5&&oldBounds.max.distanceTo(newBounds.max)<1e-5);
assert.equal(preserved.children.length,1);assert.equal(geometryStats(root).meshes,2);
console.log('Art: finite geometry, camera proportions, moving joints, accent propagation, batching transforms and mobile geometry budgets passed.',stats,architecture);

// Facial overlays stay fitted to the skin instead of becoming floating eyeballs.
for(const [x,y] of [[-.192,.025],[.192,.025],[0,-.24]]){
 const geo=facePatch(x,y,.10,.10,.006),p=geo.attributes.position;
 for(let i=0;i<p.count;i++)assert.ok(Math.abs(p.getZ(i)-faceZ(p.getX(i),p.getY(i))-.006)<1e-6);
}
const headSurface=faceGeometry();for(const attribute of [headSurface.attributes.position,headSurface.attributes.normal])for(const value of attribute.array)assert.ok(Number.isFinite(value));
// A broad lock remains shallow, even when the sweep changes direction.
const lock=hairLock([[.4,.4,0],[.1,.45,0],[-.2,.25,0],[-.5,.1,0]],.17,.024);
const lockPositions=lock.geometry.attributes.position;let minZ=Infinity,maxZ=-Infinity;
for(let i=0;i<lockPositions.count;i++){minZ=Math.min(minZ,lockPositions.getZ(i));maxZ=Math.max(maxZ,lockPositions.getZ(i));}
assert.ok(maxZ-minZ<.10,'thin hair leaf rather than a circular section');
// Garment surfaces face outwards; ends are closed before being batched.
const sleeve=fabricTube([[0,0,0],[0,1,0]],[1,1],[1,1],{fold:0});
assert.equal(sleeve.caps.length,2);const p=sleeve.geometry.attributes.position,n=sleeve.geometry.attributes.normal;
for(let i=0;i<p.count;i++)if(p.getY(i)>.1&&p.getY(i)<.9)assert.ok(p.getX(i)*n.getX(i)+p.getZ(i)*n.getZ(i)>.9);
console.log('Sculpted surfaces: fitted face overlays, thin hair leaves, outward garment normals and closed garment ends passed.');
