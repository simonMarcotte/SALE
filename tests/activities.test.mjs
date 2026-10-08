import test from 'node:test';
import assert from 'node:assert/strict';
import {goodPutt,moveLane,receiveGate,GATE_LANES} from '../src/activities.ts';
import {grassScatter} from '../src/scatter.ts';
import {chapters} from '../src/story.ts';
test('putting rewards the gold zone and rejects under/overpowered shots',()=>{assert.equal(goodPutt(.66),true);assert.equal(goodPutt(.1),false);assert.equal(goodPutt(.95),false);});
test('steering is frame independent and bounded at rink edges',()=>{let a=0,b=0;for(let i=0;i<30;i++)a=moveLane(a,1,1/30);for(let i=0;i<120;i++)b=moveLane(b,1,1/120);assert.ok(Math.abs(a-b)<1e-10);assert.equal(moveLane(3,1,1),3.7);assert.equal(moveLane(-3,-1,1),-3.7);});
test('gate collection requires the correct lane, including alternating sides',()=>{GATE_LANES.forEach((lane,i)=>assert.equal(receiveGate(lane,i),true));assert.equal(receiveGate(2,1),false);assert.equal(receiveGate(-2,2),false);});
test('grass scatters reproducibly with different distributions per chapter and no path overlap',()=>{const a=grassScatter(123),b=grassScatter(124);assert.deepEqual(a,grassScatter(123));assert.notDeepEqual(a,b);assert.ok(a.every(p=>p.z<-.65||p.z>3.25));assert.ok(new Set(a.map(p=>p.size)).size>400);});
test('timeline has 19 unique memories with the NYC anniversary before the epilogue',()=>{assert.equal(chapters.length,19);assert.equal(new Set(chapters.map(c=>c.id)).size,19);assert.equal(chapters.find(c=>c.id==='skating').shortDate,'27 MAR 2022');assert.ok(chapters.every((c,i)=>!i||c.x>chapters[i-1].x));assert.equal(chapters.at(-2).id,'five-years');assert.equal(chapters.at(-1).id,'future');});

test('ice coasts with drag, conserves frame-rate behavior, and bounces at boards', async()=>{
 const {skateStep}=await import('../src/activities.ts');
 let a={x:0,z:-2,vx:0,vz:0},b={...a};
 for(let i=0;i<30;i++)a=skateStep(a,.3,0,1/30);
 for(let i=0;i<120;i++)b=skateStep(b,.3,0,1/120);
 assert.ok(Math.abs(a.x-b.x)<1e-9);assert.ok(Math.abs(a.vx-b.vx)<1e-9);
 const coast=skateStep(a,0,0,.1);assert.ok(coast.x>a.x);assert.ok(coast.vx<a.vx&&coast.vx>0);
 const edge=skateStep({x:4.09,z:-2,vx:4,vz:0},0,0,.1);assert.equal(edge.x,4.1);assert.ok(edge.vx<0);
});
test('cruise ramps meet the deck and stone skips end on the water',async()=>{
 const {cruiseHeight,stonePosition}=await import('../src/activities.ts');
 assert.equal(cruiseHeight(-10),.13);assert.equal(cruiseHeight(10),.13);
 assert.equal(cruiseHeight(-6),cruiseHeight(0));assert.equal(cruiseHeight(6),cruiseHeight(0));
 assert.ok(cruiseHeight(-8)>cruiseHeight(-10));assert.ok(cruiseHeight(8)<cruiseHeight(6));
 assert.equal(stonePosition(2.2).y,.14);assert.ok(stonePosition(.3).y>.14);
});

test('ski run starts above all five fixed gates and descends through them',async()=>{
 const {SKI_START_Z,SKI_GATE_Z,advanceSki}=await import('../src/activities.ts');
 assert.ok(SKI_START_Z<SKI_GATE_Z[0]);
 let z=SKI_START_Z,gate=0;
 for(let frame=0;frame<1800&&gate<5;frame++){
  const result=advanceSki(z,1/60,gate,GATE_LANES[gate]);
  assert.ok(result.z>=z);assert.equal(result.missed,false);z=result.z;if(result.passed)gate++;
 }
 assert.equal(gate,5);assert.equal(z,SKI_GATE_Z[4]);
 assert.deepEqual(advanceSki(z,1,5,0),{z,passed:false,missed:false});
});
test('missing a ski gate gives a short retry uphill of that same gate',async()=>{
 const {advanceSki}=await import('../src/activities.ts');
 const miss=advanceSki(-9.01,.05,0,3);
 assert.equal(miss.missed,true);assert.equal(miss.passed,false);assert.ok(miss.z<-9);
 const retry=advanceSki(miss.z,1,0,0);assert.equal(retry.passed,true);
});
