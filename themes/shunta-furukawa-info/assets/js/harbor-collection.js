export function createCollection(items,storage){const key='shunta-harbor-items-v1',allowed=new Set(items.map(x=>x.id));let owned=new Set(),persistent=true;
 try{const saved=JSON.parse(storage?.getItem(key)||'[]');if(Array.isArray(saved))owned=new Set(saved.filter(id=>allowed.has(id)));if(!storage)persistent=false;}catch{persistent=false;}
 return {reset(){owned.clear();try{if(!storage)throw Error('No storage');storage.setItem(key,'[]');return true;}catch{persistent=false;return false;}},has:id=>owned.has(id),ids:()=>[...owned],get persistent(){return persistent;},get count(){return owned.size;},get complete(){return owned.size===allowed.size;},collect(id){if(!allowed.has(id)||owned.has(id))return false;owned.add(id);try{if(!storage)throw Error('No storage');storage.setItem(key,JSON.stringify([...owned]));}catch{persistent=false;}return true;}};
}

// Acquisition requires an explicit inspection and current physical proximity.
export function canAcquire(itemId,inspectedId,nearbyId){return Boolean(itemId)&&itemId===inspectedId&&itemId===nearbyId;}
