import { useEffect,useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Box,Ball,Cylinder,Label,Sign,Tulip } from './Primitives';
import { chapters,chapterIndex } from './story';
import type { GameState,Journey } from './World';
export function Apartment({game,journey,onInteract,complete}:{game:GameState|null;journey:React.RefObject<Journey>;onInteract:(index:number,item?:number)=>void;complete:boolean}) {
 const index=chapterIndex('home'),active=game?.index===index;
 const lift=useRef<THREE.Group>(null),doors=useRef<THREE.Group>(null),elapsed=useRef(0);
 const unpacked=active?game.unpacked:complete?[0,1,2]:[];
 useEffect(()=>{elapsed.current=0;journey.current.homeReady=false;return()=>{journey.current.homeReady=false;journey.current.playX=undefined;journey.current.playY=undefined;journey.current.playZ=undefined;};},[active,journey]);
 useFrame((_,delta)=>{if(!active)return;elapsed.current+=Math.min(delta,.05);const t=elapsed.current;
  const height=3.3*THREE.MathUtils.smoothstep(t,1.2,4.2);
  if(lift.current)lift.current.position.y=height;
  if(doors.current)doors.current.children.forEach((door,i)=>{const open=t<.8?1-THREE.MathUtils.smoothstep(t,0,.8):THREE.MathUtils.smoothstep(t,4.3,5);door.position.x=(i===0?-1:1)*(.46+open*.82);});
  journey.current.homeReady=t>5.1;
  journey.current.playX=chapters[index].x+(t>5.1?1.35:-3.15);journey.current.playZ=t>5.1?-.5:-.7;journey.current.playY=.18+height;journey.current.playFacing=0;
 });
 return <group position={[chapters[index].x,0,0]} onClick={e=>{e.stopPropagation();if(!active)onInteract(index);}}>
 <Box position={[0,.08,-2.6]} size={[9.3,.16,5.7]} color="#c0b69f"/><Box position={[0,3.35,-5.1]} size={[9,6.7,.2]} color="#b7987c"/>{[-4.4,4.4].map(x=><Box key={x} position={[x,3.35,-2.8]} size={[.2,6.7,4.6]} color="#aa886f"/>)}
 <Box position={[0,6.73,-2.8]} size={[9.3,.16,4.8]} color="#566967"/><Box position={[0,3.25,-2.8]} size={[9,.16,4.6]} color="#c5b08d"/>
 <Box position={[0,1.5,-.5]} size={[9,3,.16]} color="#b2957b"/>{[-2,0,2,3.4].map(x=><group key={x}><Box position={[x,1.75,-.39]} size={[1.12,1.5,.08]} color="#e8d8b9"/><Box position={[x,1.75,-.34]} size={[.94,1.33,.03]} color="#7498a4"/><Box position={[x,1.75,-.31]} size={[.035,1.33,.02]} color="#ded6bd"/></group>)}
 {!active&&<><Box position={[1.05,4.95,-.5]} size={[6.8,3.3,.16]} color="#b2957b"/>{[-1.3,.8,3].map(x=><group key={x}><Box position={[x,5.15,-.39]} size={[1.45,1.7,.07]} color="#e8d8b9"/><Box position={[x,5.15,-.34]} size={[1.28,1.54,.03]} color="#7b9fa7"/><Box position={[x,5.15,-.31]} size={[.04,1.54,.02]} color="#eee3c8"/></group>)}</>}
 <Box position={[-3.35,3.3,-1.35]} size={[2.05,6.6,.16]} color="#647877"/>{[-4.3,-2.4].map(x=><Box key={x} position={[x,3.3,-.12]} size={[.08,6.6,.08]} color="#d4d7cb"/>)}
 <group ref={lift}><Box position={[-3.35,.12,-.65]} size={[1.9,.16,1.5]} color="#abb6ae"/><Box position={[-3.35,2.55,-.65]} size={[1.9,.13,1.5]} color="#8c9d99"/><group position={[-3.35,1.35,.13]}><group ref={doors}>{[-1,1].map(side=><Box key={side} position={[side*.46,0,0]} size={[.91,2.35,.06]} color="#889d9c"/>)}</group></group></group>
 <Box position={[-3.35,6.1,-.4]} size={[1.5,.5,.08]} color="#3e5c5b"/><Label text={active?'02':'ELEVATOR'} position={[-3.35,6.1,-.35]} width={1.25} color="#f1db9c"/>
 <group position={[.75,3.35,-2.6]}>
 <Box position={[0,.02,0]} size={[6.7,.05,4.1]} color="#d7bb91"/>{Array.from({length:16},(_,i)=><Box key={i} position={[-3.12+i*.42,.05,0]} size={[.016,.015,4]} color="#bea07e"/>)}<Box position={[0,1.6,-2.36]} size={[6.7,3.2,.1]} color="#e8dcc4"/><Box position={[0,.08,0]} size={[3.4,.025,2.2]} color="#ba8c79"/>
 {unpacked.includes(0)&&<group position={[-.5,.2,-.5]}><Box position={[0,.3,0]} size={[2.3,.4,1]} color="#dcd1b8"/><Box position={[0,.75,-.44]} size={[2.3,.8,.25]} color="#f2e7ce"/>{[-.56,.56].map(x=><Box key={x} position={[x,.53,.06]} size={[1.06,.22,.85]} color="#f0e7d2"/>)}{[-1.16,1.16].map(x=><Box key={x} position={[x,.53,0]} size={[.22,.64,1.07]} color="#e6dbc3"/>)}<Ball position={[-.65,.8,-.16]} scale={[.23,.25,.12]} color="#b78171"/></group>}
 {unpacked.includes(1)&&<><Box position={[1.1,1.75,-2.22]} size={[1.8,1.1,.09]} color="#243d47"/><Box position={[1.1,1.75,-2.16]} size={[1.65,.95,.015]} color="#759faa"/><Box position={[1.1,.6,-2]} size={[2,.7,.65]} color="#af8765"/></>}
 {unpacked.includes(2)&&<group position={[-2,.1,-1.5]}><Cylinder position={[0,.95,0]} radius={.03} height={1.8} color="#9c8255"/><Cylinder position={[0,.07,0]} radius={.25} height={.07} color="#98805d"/><mesh position={[0,1.9,0]}><cylinderGeometry args={[.23,.4,.45,16]}/><meshLambertMaterial color="#f7e5b6"/></mesh></group>}
 <Tulip position={[2.6,.1,-1.8]}/>
 {[0,1,2].filter(i=>!unpacked.includes(i)).map(i=><group key={i} position={[-1.6+i*1.7,.4,.9]} onClick={e=>{e.stopPropagation();onInteract(index,i);}}><Box size={[.65,.65,.6]} color="#bb9667"/><Box position={[0,.33,0]} size={[.12,.012,.6]} color="#ead2a8"/></group>)}
 </group><Sign position={[5.5,0,.2]} date={chapters[index].shortDate} label="OUR PLACE"/>
 </group>;
}
