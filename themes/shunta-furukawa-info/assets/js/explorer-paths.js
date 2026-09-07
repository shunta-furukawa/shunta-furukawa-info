// One set of rounded centerlines drives both the ground surface and the minimap.
const routes=[
 {width:3,points:[[0,17],[0,4],[0,-7],[2,-24]]},
 {width:2.4,points:[[-9,14],[0,14],[15,13]]},
 {width:2.3,points:[[-20,7],[-8,4],[0,4],[22,1]]},
 {width:2.3,points:[[-20,7],[-23,-2],[-19,-13],[-9,-22],[2,-24]]},
 {width:2.3,points:[[0,-7],[-9,-4]]},
 {width:2.3,points:[[0,-7],[14,-11],[22,1],[15,13]]}
];
function roundedCenterline(points){
 const result=[points[0]],distance=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
 const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
 function line(to){const from=result[result.length-1],steps=Math.max(1,Math.ceil(distance(from,to)/.35));for(let j=1;j<=steps;j++)result.push(mix(from,to,j/steps));}
 for(let i=1;i<points.length-1;i++){
  const before=points[i-1],corner=points[i],after=points[i+1],a=distance(before,corner),b=distance(corner,after),radius=Math.min(2.5,a*.35,b*.35);
  const entry=mix(corner,before,radius/a),exit=mix(corner,after,radius/b);line(entry);
  for(let j=1;j<=20;j++){const t=j/20;result.push(mix(mix(entry,corner,t),mix(corner,exit,t),t));}
 }
 line(points[points.length-1]);return result;
}
export const WORLD_PATHS=routes.map(route=>({width:route.width,points:roundedCenterline(route.points)}));
