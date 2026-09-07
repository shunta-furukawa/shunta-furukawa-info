import assert from 'node:assert/strict';
import {createCollection} from '../themes/shunta-furukawa-info/assets/js/harbor-collection.js';
import items from '../themes/shunta-furukawa-info/assets/js/harbor-catalog.json' with {type:'json'};
import * as T from '../themes/shunta-furukawa-info/assets/js/vendor/three.module.js';
import {createArtifact,buildHarbor} from '../themes/shunta-furukawa-info/assets/js/harbor-models.js';
assert.equal(new Set(items.map(x=>x.id)).size,13);
let saved='["profile","profile","deleted"]';const storage={getItem:()=>saved,setItem:(_,v)=>saved=v};
let collection=createCollection(items,storage);assert.equal(collection.count,1);assert.equal(collection.collect('profile'),false);assert.equal(collection.collect('unknown'),false);
for(const item of items)collection.collect(item.id);
assert.equal(collection.complete,true);assert.equal(createCollection(items,storage).count,13);
collection=createCollection(items,{getItem:()=>{throw Error('blocked')}});assert.equal(collection.persistent,false);assert.equal(collection.collect('profile'),true);
collection=createCollection(items,{getItem:()=>'{broken',setItem:()=>{throw Error('quota')}});assert.equal(collection.count,0);assert.equal(collection.collect('profile'),true);assert.equal(collection.persistent,false);
const world=new T.Group(),obstacles=[];buildHarbor(world,{scale:1.6,obstacles});for(const item of items)world.add(createArtifact(item.model));
let meshes=0;world.traverse(o=>{if(o.isMesh){meshes++;for(const v of o.geometry.attributes.position.array)assert.ok(Number.isFinite(v));}});
assert.ok(meshes>100);assert.equal(obstacles.length,8);
// Each exhibit has a clear approach from the south, outside building collision radii.
for(const item of items)for(const b of obstacles)assert.ok(Math.hypot(item.x*1.6-b.x,item.z*1.6+2-b.z)>b.r+.48,item.id+' approach blocked');
console.log('Harbor: 13 unique exhibits, persistence, completion, blocked storage, finite geometry and clear exhibit approaches passed.');
