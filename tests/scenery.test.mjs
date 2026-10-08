import test from 'node:test';
import assert from 'node:assert/strict';
import {transitionCrowns,TRANSITION_TREE_X_OFFSET,TRANSITION_TREE_Z,foregroundTreePlacement} from '../src/scenery.ts';

function crownBlocks(point,direction,crown) {
 // Conservative inner ellipsoid: leave room for the faceted leaf surface.
 const scale=crown.s.map(v=>v*.9);
 const center=[crown.p[0]+TRANSITION_TREE_X_OFFSET,crown.p[1],crown.p[2]+TRANSITION_TREE_Z];
 const origin=point.map((v,i)=>(v-center[i])/scale[i]);
 const ray=direction.map((v,i)=>v/scale[i]);
 const a=ray.reduce((n,v)=>n+v*v,0),b=2*ray.reduce((n,v,i)=>n+v*origin[i],0),c=origin.reduce((n,v)=>n+v*v,0)-1;
 const d=b*b-4*a*c;
 return d>=0&&(-b+Math.sqrt(d))/(2*a)>0;
}
test('transition crown covers both walkers from feet to head at clothing-change boundary',()=>{
 for(const depth of [19,24])for(const z of [1.55,2.25])for(const x of [-.6,0,.6])for(const y of [.13,.8,1.5,2.1,2.7]){
  assert.ok(transitionCrowns.some(c=>crownBlocks([x,y,z],[3.2,11,depth],c)),`Uncovered character point ${x},${y},${z} at camera depth ${depth}`);
 }
});
test('small foreground trees project below sign boards and sit away from attraction centers',()=>{
 for(let i=0;i<19;i++){
  const t=foregroundTreePlacement(i);
  assert.ok(Math.abs(t.x)>=5.4);
  const top=3.35*t.scale,back=t.z-.85*t.scale;
  assert.ok(top-.46*back<1.1-.46*.3-.5);
 }
});
