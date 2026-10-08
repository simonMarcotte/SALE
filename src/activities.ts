export const GATE_LANES = [0, -2, 2, -1.5, 1.5];
export const golfPower = (elapsed:number) => (Math.sin(elapsed*2.1)+1)/2;
export const goodPutt = (power:number) => Math.abs(power-.66)<.12;
export function moveLane(lane:number,input:number,dt:number) {return Math.max(-3.7,Math.min(3.7,lane+input*dt*3));}
export function receiveGate(lane:number,gate:number) {return Math.abs(lane-GATE_LANES[gate%GATE_LANES.length])<1.05;}

export type IceState = {x:number;z:number;vx:number;vz:number};
// Exact integration of acceleration + linear drag: consistent at every refresh rate.
export function skateStep(s:IceState, x:number,z:number,dt:number):IceState {
 const length=Math.hypot(x,z);if(length>1){x/=length;z/=length;}
 const drag=.85, decay=Math.exp(-drag*dt), travel=(1-decay)/drag;
 const next={x:s.x+s.vx*travel+7*x/drag*(dt-travel),z:s.z+s.vz*travel+7*z/drag*(dt-travel),vx:s.vx*decay+7*x*travel,vz:s.vz*decay+7*z*travel};
 for(const axis of ['x','z'] as const){const min=axis==='x'?-4.1:-5.8,max=axis==='x'?4.1:1;const v=axis==='x'?'vx':'vz';if(next[axis]<min||next[axis]>max){next[axis]=Math.max(min,Math.min(max,next[axis]));next[v]*=-.3;}}
 return next;
}
export function cruiseHeight(x:number) {return .13+2.4*Math.max(0,Math.min(1,(10-Math.abs(x))/4));}
export function stonePosition(t:number) {const p=Math.max(0,Math.min(1,t/2.2));return {x:1+p*3,y:.14+Math.abs(Math.sin(p*Math.PI*4))*.95*(1-p),z:-2.4-p*3.7};}

export const SKI_START_Z=-10.7;
export const SKI_GATE_Z=[-9,-7,-5,-3,-1];
export function advanceSki(z:number,dt:number,gate:number,lane:number) {
 const target=SKI_GATE_Z[gate];
 if(target===undefined)return {z,passed:false,missed:false};
 const next=z+Math.max(0,dt)*1.55;
 if(next<target)return {z:next,passed:false,missed:false};
 const passed=receiveGate(lane,gate);
 return {z:passed?target:target-1.1,passed,missed:!passed};
}
