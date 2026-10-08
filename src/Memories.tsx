import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Box, Ball, Cylinder, Label, Sign, Maple, Pine, Flowers, BOX, CONE, material, type Vec3 } from './Primitives';
import { chapters, type Chapter } from './story';
import type { GameState, Journey } from './World';
import { random } from './scatter';
import { GATE_LANES, golfPower, goodPutt, moveLane, advanceSki, SKI_START_Z, SKI_GATE_Z, skateStep, stonePosition, cruiseHeight } from './activities';

import { NYC, SkiSlope, skiHeight } from './ScenicModels';
import { Flag, Rink, Office, GraduationBanner, CruiseShip } from './PolishModels';

// Repeated architectural details share one draw call, including windows and planks.
type Detail = {p:Vec3;s:Vec3;c:string;r?:number};
function Details({items, geometry=BOX}:{items:Detail[];geometry?:THREE.BufferGeometry}) {
  const ref=useRef<THREE.InstancedMesh>(null);
  useEffect(()=>{if(!ref.current)return;const o=new THREE.Object3D(),c=new THREE.Color();items.forEach((d,i)=>{o.position.set(...d.p);o.scale.set(...d.s);o.rotation.set(0,0,d.r??0);o.updateMatrix();ref.current!.setMatrixAt(i,o.matrix);ref.current!.setColorAt(i,c.set(d.c));});ref.current.instanceMatrix.needsUpdate=true;if(ref.current.instanceColor)ref.current.instanceColor.needsUpdate=true;ref.current.computeBoundingSphere();},[items]);
  return <instancedMesh ref={ref} args={[geometry,material('#ffffff'),items.length]}/>;
}
function Water({size=[9,5],color='#65aeb6'}:{size?:[number,number];color?:string}) {
  const ref=useRef<THREE.Group>(null);
  const reduced=useMemo(()=>matchMedia('(prefers-reduced-motion: reduce)').matches,[]);
  useFrame(s=>{if(ref.current&&!reduced)ref.current.position.x=Math.sin(s.clock.elapsedTime*.6)*.12;});
  return <><mesh position={[0,.055,-4]} rotation={[-Math.PI/2,0,0]} scale={[size[0]/2,size[1]/2,1]}><circleGeometry args={[1,64]}/><meshLambertMaterial color={color}/></mesh><group ref={ref}>{Array.from({length:12},(_,i)=><Box key={i} position={[Math.sin(i*19)*size[0]*.4,.078,-4+Math.cos(i*27)*size[1]*.4]} size={[.35+(i%3)*.25,.01,.025]} color="#b6deda"/>)}</group></>;
}
function Palm({position,scale=1}:{position:Vec3;scale?:number}) {
  return <group position={position} scale={scale}><Cylinder position={[0,1.6,0]} height={3.2} radius={.14} color="#a67d50"/>{Array.from({length:6},(_,i)=><group key={i} rotation={[0,i*Math.PI/3,0]}><Ball position={[.7,3.2,0]} scale={[1,.13,.24]} color={i%2?'#789458':'#54876a'}/><Ball position={[1.4,2.96,0]} scale={[.6,.1,.15]} color="#779555"/></group>)}<Ball position={[0,3.1,0]} scale={[.3,.27,.3]} color="#997548"/></group>;
}
function Boat({position,color='#f0e3bd'}:{position:Vec3;color?:string}) {
 return <group position={position}><Ball position={[0,.1,0]} scale={[.4,.18,.8]} color={color}/><Box position={[0,.23,0]} size={[.6,.05,1.1]} color="#537e8b"/><Box position={[0,.48,.15]} size={[.4,.42,.35]} color="#fff2d7"/></group>;
}
function Bench({position}:{position:Vec3}) {
 return <group position={position}><Box position={[0,.5,0]} size={[2,.14,.65]} color="#b4875c"/><Box position={[0,.95,-.28]} size={[2,.6,.08]} color="#c59a6c"/>{[-.75,.75].map(x=><Box key={x} position={[x,.25,0]} size={[.1,.5,.5]} color="#4d6661"/>)}</group>;
}
function Suitcase({position,color='#b68063'}:{position:Vec3;color?:string}) {
 return <group position={position}><Box position={[0,.5,0]} size={[.7,.85,.4]} color={color}/><Box position={[0,.5,.215]} size={[.045,.8,.02]} color="#f0d6a0"/><Box position={[0,1.05,0]} size={[.35,.28,.05]} color="#485459"/><Box position={[0,1.03,.015]} size={[.23,.18,.06]} color="#c8c5ab"/>{[-.24,.24].map(x=><Ball key={x} position={[x,.07,0]} scale={[.09,.09,.09]} color="#485459"/>)}</group>;
}
function Mountain({x,z=-12}:{x:number;z?:number}) {
 return <group position={[x,0,z]}><mesh geometry={CONE} material={material('#819ea6')} position={[0,2,0]} scale={[4.5,8,3]}/><mesh geometry={CONE} material={material('#ecf3ed')} position={[0,4.45,0]} scale={[1.8,3.1,1.25]}/></group>;
}
export function Biome({chapter}:{chapter:Chapter}) {
 const {season,x}=chapter;
 const trees=useMemo(()=>{const rng=random(x+381);return Array.from({length:26},()=>{const px=(rng()-.5)*24,z=-10-rng()*9,h=1.5+rng()*2;return [{p:[px,h*.5,z] as Vec3,s:[.14,h,.14] as Vec3,c:'#88795c'},{p:[px,h+1,z] as Vec3,s:[1.3,h+1,1.3] as Vec3,c:season==='winter'?'#d6e2dc':season==='autumn'?(rng()<.5?'#c59748':'#ae7748'):'#769b79'}];}).flat();},[x,season]);
 const tropical=season==='coast'||season==='desert';
 if(chapter.id==='five-years')return null;
 return <group position={[x,0,0]}>
  {!tropical&&<>{chapter.id==='future'&&<><Details items={trees.filter((p,i)=>i%2===0&&p.p[0]<-1)}/><Details items={trees.filter((p,i)=>i%2===1&&p.p[0]<-1)} geometry={CONE}/></>}{chapter.id==='future'&&<Details items={Array.from({length:7},(_,i)=>({p:[i*1.4+1,1.4+(i%3)*.4,-13-i%2*2] as Vec3,s:[1,2.8+(i%3)*.8,1.1] as Vec3,c:i%2?'#94b6bf':'#a6c4c8'}))}/>}</>}
  {season==='winter'?<><Mountain x={-5}/><Mountain x={5} z={-16}/><Pine position={[-8,0,-11]} snow/><Pine position={[8,0,-12]} snow scale={1.25}/></>:tropical?chapter.id==='cruise'?<group position={[-8,0,-13]}><Ball position={[0,-.3,0]} scale={[4,.8,2]} color="#c6bf8e"/><Ball position={[0,.2,0]} scale={[3,.9,1.7]} color="#80a978"/><Palm position={[0,.3,0]} scale={.8}/></group>:<><Palm position={[-8,0,-11]}/><Palm position={[8,0,-12]} scale={1.2}/></>:<><Maple position={[-8,0,-11]} scale={1.1} color={season==='autumn'?'#d19a4c':'#99b65c'}/><Maple position={[8,0,-11]} scale={1.3} color={season==='autumn'?'#c87b49':'#7ca96e'}/></>}
  {!tropical&&season!=='winter'&&<><Flowers x={-5} z={3.8} pink/><Flowers x={4.9} z={-.1}/></>}
 </group>;
}
function Italy() {
 const buildings=useMemo(()=>Array.from({length:9},(_,i)=>{const h=1.7+(i%3)*.65;return {x:-5+i*1.1,z:-6.8-Math.abs(i-4)*.25,h,c:['#eab77f','#cc8d7b','#e5cb96','#e2a090','#b6c7a2'][i%5]};}),[]);
 const windows=useMemo(()=>buildings.flatMap(b=>Array.from({length:6},(_,i)=>({p:[b.x+(i%2?-.25:.25),.55+Math.floor(i/2)*.65,b.z+.53] as Vec3,s:[.19,.3,.04] as Vec3,c:'#587776'}))),[buildings]);
 return <><Water size={[11,5]}/><Ball position={[-6,0,-12]} scale={[6,3.7,5]} color="#869b62"/>{buildings.map((b,i)=><group key={i}><Box position={[b.x,b.h/2,b.z]} size={[1.02,b.h,1]} color={b.c}/><Box position={[b.x,b.h+.08,b.z]} size={[1.12,.16,1.18]} color="#a77459"/></group>)}<Details items={windows}/><Cylinder position={[3.8,2.7,-7.5]} radius={.45} height={5.4} color="#ae9a76"/><Box position={[3.8,5.35,-7.5]} size={[1,.3,1]} color="#c1af89"/>{Array.from({length:13},(_,i)=><Box key={i} position={[3.8+Math.sin(i*.14)*2,.2,-6.8+i*.38]} size={[.65,.3,.5]} color="#b9b6a1"/>)}<Boat position={[-2,.1,-3]}/><Boat position={[.5,.1,-4.7]} color="#d98768"/><Boat position={[2,.1,-2.7]} color="#ebce7e"/><Suitcase position={[-2.8,.1,.2]} color="#628b94"/><Suitcase position={[-1.8,.1,.4]} color="#c68e7e"/><Flag/></>;
}
function Boardwalk() {
 const pieces=useMemo(()=>{const rng=random(19);const a:Detail[]=Array.from({length:32},(_,i)=>({p:[-6+i*.39,.19+Math.sin(i*.1)*.10,1.6],s:[.37,.13,2.3],c:i%3?'#b6916a':'#c19c74'}));for(let i=0;i<11;i++){let x=-5.8+i*1.15;for(const z of [.35,2.85])a.push({p:[x,.64,z],s:[.10,1,.10],c:'#9e7955'});}for(let i=0;i<35;i++){const x=(rng()-.5)*12,z=-1-rng()*6;a.push({p:[x,1.6,z],s:[.14,3.2+ rng(),.14],c:'#e7dfbf'});for(let j=0;j<3;j++)a.push({p:[x,1+j*.7,z+.085],s:[.13,.06,.015],c:'#665f51'});}for(let i=0;i<70;i++)a.push({p:[(rng()-.5)*11,.34,.6+rng()*2],s:[.08,.018,.12],c:rng()<.5?'#ddb448':'#d1c293',r:rng()});return a;},[]);
 return <><Details items={pieces}/>{[.35,2.85].map(z=><Box key={z} position={[0,1.13,z]} size={[12,.10,.11]} color="#b48c63"/>)}{[-4,-1,2,5].map((x,i)=><Ball key={x} position={[x,4.2,-3-i%2*2]} scale={[1.8,.8,1.2]} color={i%2?'#d4b34e':'#be963d'}/>)}</>;
}
function Stage({graduation=false,reducedMotion}:{graduation?:boolean;reducedMotion:boolean}) {
 const lights=useRef<THREE.Group>(null);
 useFrame(s=>{if(lights.current&&!reducedMotion)lights.current.children.forEach((l,i)=>{l.rotation.z=Math.sin(s.clock.elapsedTime*.9+i)*.4;});});
 return <><Box position={[0,.29,-1]} size={[10,.55,4.6]} color="#555666"/><Box position={[0,.58,-1]} size={[10,.05,4.6]} color="#c9a778"/>{[-4.9,4.9].map(x=><Box key={x} position={[x,.15,1.8]} size={[1.1,.3,1.2]} color="#a28b75"/>)}<Box position={[0,2.5,-3.2]} size={[9,3.9,.22]} color={graduation?'#314f49':'#33374f'}/>{[-4.6,4.6].map(x=><Box key={x} position={[x,2.65,-2.6]} size={[.12,4.6,.12]} color="#727d83"/>)}<Box position={[0,4.9,-2.6]} size={[9.4,.13,.13]} color="#737d84"/>
 {graduation?<><GraduationBanner/><Box position={[3,1.25,-1.8]} size={[.8,1.3,.65]} color="#997b4f"/><Cylinder position={[3,2.1,-1.8]} height={.55} radius={.025} color="#414953"/>{[-3,-2.6].map(x=><Cylinder key={x} position={[x,.84,-1.5]} height={.5} radius={.075} color="#f3e9cc"/>)}</>:<><group ref={lights}>{[-3,0,3].map((x,i)=><group key={x} position={[x,4.65,-2]}><mesh position={[0,-1.8,0]}><coneGeometry args={[1.35,3.5,14,1,true]}/><meshBasicMaterial color={['#dda3ce','#95c4e1','#ead481'][i]} transparent opacity={.13} side={THREE.DoubleSide} depthWrite={false}/></mesh><Ball position={[0,0,0]} scale={[.2,.15,.2]} color="#f7e9cb"/></group>)}</group><group position={[0,1.1,-2]} rotation={[Math.PI/2,0,0]}><Cylinder position={[0,0,0]} radius={.6} height={.7} color="#b57678"/><Cylinder position={[0,.37,0]} radius={.58} height={.03} color="#e2d9c6"/></group>{[-1.15,1.15].map(x=><group key={x}><Cylinder position={[x,1.22,-2]} radius={.025} height={1.3} color="#8b999b"/><Cylinder position={[x,1.91,-2]} radius={.45} height={.035} color="#c5ad74"/></group>)}<Cylinder position={[2.3,1.32,-1]} radius={.025} height={1.45} color="#616d76"/><Ball position={[2.3,2.08,-1]} scale={[.075,.12,.075]} color="#3e4c57"/>{[-3.5,3.5].map(x=><group key={x}><Box position={[x,1.2,-2]} size={[1,1.4,.65]} color="#283d4c"/><Ball position={[x,1.2,-1.64]} scale={[.32,.32,.03]} color="#4b5a67"/></group>)}<Ball position={[0,4.5,-1.8]} scale={[.34,.34,.34]} color="#b8ccd6"/></>}
 </>;
}
function Balloons({reducedMotion}:{reducedMotion:boolean}) {
 const ref=useRef<THREE.Group>(null);
 useFrame(s=>{if(ref.current&&!reducedMotion)ref.current.rotation.z=Math.sin(s.clock.elapsedTime*1.1)*.06;});
 return <><Bench position={[0,0,-2.8]}/><group ref={ref} position={[1.8,0,-2.6]}>{[-.35,.35].map((x,i)=><group key={x}><Cylinder position={[x,1.3,0]} radius={.012} height={2.6} color="#d7c5a4"/><Ball position={[x,2.9+i*.3,0]} scale={[.37,.49,.34]} color={i?'#c5a5b8':'#dabd73'}/></group>)}</group>{[-2.5,-1.8].map(x=><group key={x} position={[x,.12,.3]}><Ball position={[0,0,0]} scale={[.09,.05,.05]} color="#536742"/><Box position={[.04,.04,0]} size={[.12,.015,.015]} rotation={[0,0,.5]} color="#536742"/></group>)}</>;
}
function Car() {return <group position={[-3.3,0,-.8]}><Box position={[0,.65,0]} size={[2.6,.6,1.3]} color="#719b9c"/><Box position={[0,1.16,0]} size={[1.45,.6,1.18]} color="#bfd7d2"/><Box position={[0,1.49,0]} size={[1.58,.08,1.3]} color="#648d90"/>{[-.86,.86].flatMap(x=>[-.67,.67].map(z=><Ball key={`${x}${z}`} position={[x,.38,z]} scale={[.33,.33,.12]} color="#3e4c52"/>))}<Box position={[1.33,.72,0]} size={[.05,.18,1.05]} color="#f1ddb1"/></group>;}
function Dubai() {
 const blocks=useMemo(()=>{const a:Detail[]=[];for(let i=0;i<48;i++)a.push({p:[-4.5+(i%12)*.8,.2+Math.floor(i/12)*.65,-5.86],s:[.77,.62,.04],c:i%3?'#d4bc8d':'#cbb082'});for(let i=0;i<8;i++)a.push({p:[-2.7+i*.77,3.6,-3.1],s:[.12,.15,2.3],c:'#615144'});return a;},[]);
 return <><Box position={[0,.1,-2]} size={[11,.15,7]} color="#e1cca2"/><Box position={[0,1.6,-6.1]} size={[10,3.2,.4]} color="#c7ad7c"/><Details items={blocks}/><Box position={[0,3.6,-2.1]} size={[6.3,.17,.17]} color="#615144"/><Box position={[0,3.6,-4.25]} size={[5.6,.17,.17]} color="#615144"/>{[-4,4].map(x=><group key={x}><Box position={[x,2.3,-5.3]} size={[1.7,4.6,1.7]} color="#dbc596"/>{[-.6,0,.6].map(dx=><Box key={dx} position={[x+dx,4.8,-4.5]} size={[.28,.45,.25]} color="#dbc596"/>)}<Box position={[x,3,-4.42]} size={[.6,1.25,.03]} color="#736451"/>{[-.2,0,.2].map(dx=><Box key={dx} position={[x+dx,3,-4.39]} size={[.035,1.25,.02]} color="#ac976f"/>)}</group>)}{[-3,3].map(x=><Box key={x} position={[x,1.8,-2]} size={[.15,3.6,.15]} color="#635344"/>)}<Cylinder position={[0,.35,-2.8]} radius={1.05} height={.5} color="#b9a77e"/><Cylinder position={[0,.62,-2.8]} radius={.88} height={.06} color="#8abeb7"/><Cylinder position={[0,.95,-2.8]} radius={.15} height={.6} color="#c7b181"/><Palm position={[-5,0,-1]}/><Palm position={[5,0,-1.6]}/></>;
}
function Jobs({grown}:{grown:boolean}) {
 const sapling=useRef<THREE.Group>(null);
 useFrame((_,dt)=>{if(sapling.current)sapling.current.scale.setScalar(THREE.MathUtils.damp(sapling.current.scale.x,grown?.8:.2,2,Math.min(dt,.05)));});
 const detail=useMemo(()=>{const a:Detail[]=[];
  for(let row=0;row<19;row++)for(let col=0;col<5;col++)a.push({p:[2.62+col*.38,.7+row*.37,-5.93],s:[.31,.29,.04],c:(row+col)%4?'#b0d0d6':'#6e9cae'});
  for(let row=0;row<3;row++)for(let col=0;col<7;col++){const x=-5.15+col*.52,y=.65+row*.72;a.push({p:[x,y,-4.60],s:[.35,.55,.06],c:'#eeece0'},{p:[x,y,-4.555],s:[.23,.43,.025],c:'#587885'},{p:[x,y,-4.535],s:[.24,.025,.016],c:'#dddcca'});}
  for(let i=0;i<16;i++)a.push({p:[-3.6,.15+i*.18,-4.63],s:[4.2,.025,.02],c:'#a0acb0'});
  return a;
 },[]);
 return <>
  <Box position={[-3.6,1.5,-5.3]} size={[4.2,3,1.3]} color="#7b8d99"/>
  <Box position={[-3.6,3.06,-5.3]} size={[4.5,.22,1.7]} color="#ece7d5"/>
  <Box position={[-3.6,3.38,-5.65]} size={[4.4,.14,1.15]} rotation={[-.55,0,0]} color="#5c6876"/>
  <Box position={[-3.6,3.38,-4.96]} size={[4.4,.14,1.15]} rotation={[.55,0,0]} color="#66717d"/>
  {[-4.7,-3.6,-2.5].map(x=><group key={x}><Box position={[x,3.42,-4.66]} size={[.51,.53,.24]} color="#e1e4d9"/><Box position={[x,3.42,-4.52]} size={[.3,.34,.04]} color="#7d9dab"/></group>)}
  <Details items={detail}/><Box position={[-3.6,.6,-4.52]} size={[.6,1.2,.07]} color="#455665"/>
  <Box position={[-3.6,1.36,-4.1]} size={[1.2,.16,.9]} color="#e8e3d2"/>
  {[-4.1,-3.1].map(x=><Cylinder key={x} position={[x,.66,-3.85]} height={1.3} radius={.055} color="#e8e3d2"/>)}
  <Box position={[-.85,1.4,-5.4]} size={[1.1,2.8,1.5]} color="#a7c6ce"/>
  {[.2,.9,1.6,2.3].map(y=><Box key={y} position={[-.85,y,-4.62]} size={[1.15,.04,.035]} color="#e1e1d2"/>)}
  <Box position={[3.4,4,-6.8]} size={[2.7,8,1.6]} color="#709aac"/>
  <Box position={[3.4,8.35,-6.9]} size={[2,.7,1.4]} color="#98b9c3"/>
  <Box position={[3.4,.6,-6.65]} size={[3.2,1.2,2]} color="#90b0b9"/>
  {[0,1,2,3].map(i=><group key={i}>{[2.25,4.55].map(x=><group key={x}><Box position={[x,.95+i*1.8,-5.86]} size={[.055,1.9,.055]} color="#e1e2d7"/>{[-1,1].map(side=><Box key={side} position={[x+(x<3?.25:-.25),.95+side*.43+i*1.8,-5.83]} size={[.05,1.05,.05]} rotation={[0,0,side*(x<3?-.5:.5)]} color="#e1e2d7"/>)}</group>)}</group>)}
  <Box position={[-3.7,4.05,-4.7]} size={[4.4,.55,.12]} color="#486c69"/><Label text="AUGUSTANA · CAMROSE" position={[-3.7,4.05,-4.63]} width={4.05} color="#fff0d0"/><Label text="3 WTC · NEW YORK" position={[3.4,8.35,-6.18]} width={1.85} color="#203e54"/><Bench position={[-.6,0,-1.9]}/><group ref={sapling} position={[2,0,0]} scale={.2}><Maple position={[0,0,0]} color="#91b077"/></group>
 </>;
}

type Props={index:number;game:GameState|null;journey:React.RefObject<Journey>;keys:React.RefObject<Set<string>>;action:React.RefObject<{serial:number;key:'a'|'l'}>;onInteract:(index:number)=>void;onScore:()=>void;onCue:(cue:string)=>void;complete:boolean;reducedMotion:boolean};
export function MemoryStop({index,game,journey,keys,action,onInteract,onScore,onCue,complete,reducedMotion}:Props) {
 const chapter=chapters[index],active=game?.index===index,kind=chapter.kind;
 const ball=useRef<THREE.Group>(null),marker=useRef<THREE.Group>(null),gate=useRef<THREE.Group>(null),bouquet=useRef<THREE.Group>(null),steam=useRef<THREE.Group>(null);
 const ripple=useRef<THREE.Group>(null);
 const skiZ=useRef(SKI_START_Z),skiPause=useRef(1.5);
 const lastCue=useRef('');
 const ice=useRef({x:0,z:-2.4,vx:0,vz:0});
 const phase=useRef(0),shot=useRef(-1),shotPower=useRef(0),oldAction=useRef(action.current.serial),lane=useRef(0),gateNumber=useRef(0),walking=useRef(-4.2),scored=useRef(false);
 const needsActivity=kind==='skate'||kind==='ski'||kind==='grad'||kind==='concert'||kind==='cruise';
 useEffect(()=>{if(!active)return;lastCue.current='';onCue('');journey.current.step=0;journey.current.stepZ=0;skiZ.current=SKI_START_Z;skiPause.current=1.5;if(kind==='ski'){journey.current.playX=chapter.x;journey.current.playZ=SKI_START_Z;journey.current.playY=skiHeight(SKI_START_Z)+.08;}ice.current={x:0,z:-2.4,vx:0,vz:0};phase.current=0;shot.current=-1;oldAction.current=action.current.serial;lane.current=0;gateNumber.current=0;walking.current=kind==='cruise'?-10:-4.2;scored.current=false;return()=>{journey.current.playX=undefined;journey.current.playZ=undefined;journey.current.playY=undefined;journey.current.playFacing=undefined;journey.current.putt=undefined;journey.current.gift=undefined;};},[active,journey,onCue]);
 useEffect(()=>{
  if(!active||chapter.id!=='two-years')return;
  const audio=new AudioContext();let stopped=false;
  const chirp=()=>{if(stopped||audio.state!=='running')return;for(let i=0;i<3;i++){const at=audio.currentTime+i*.14,osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.setValueAtTime(3800,at);osc.frequency.exponentialRampToValueAtTime(4600,at+.055);gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.018,at+.008);gain.gain.exponentialRampToValueAtTime(.0001,at+.09);osc.connect(gain);gain.connect(audio.destination);osc.start(at);osc.stop(at+.1);}};
  void audio.resume().then(chirp).catch(()=>{});const timer=window.setInterval(chirp,4200);
  return()=>{stopped=true;clearInterval(timer);void audio.close().catch(()=>{});};
 },[active,chapter.id]);
 useFrame((state,delta)=>{
  const dt=Math.min(delta,.05),t=state.clock.elapsedTime;
  if(steam.current&&!reducedMotion)steam.current.children.forEach((s,i)=>{s.position.y=1.7+((t*.25+i*.23)%1);s.scale.setScalar(.09+((t*.25+i*.23)%1)*.09);});
  if(bouquet.current&&!active){bouquet.current.position.set(complete?-1.05:0,1.1,complete?1.1:-.5);}
  if(!active||game.done)return;
  phase.current+=dt;
  if(kind==='golf'){
   journey.current.putt=shot.current;
   const power=golfPower(phase.current);
   const cue=shot.current>=0?'Rolling…':goodPutt(power)?'Putt now':'Wait for gold';
   if(lastCue.current!==cue){lastCue.current=cue;onCue(cue);}
   if(marker.current)marker.current.position.x=-2+power*4;
   if(action.current.serial!==oldAction.current){oldAction.current=action.current.serial;if(shot.current<0){shot.current=0;shotPower.current=power;}}
   if(shot.current>=0){shot.current+=dt;const p=Math.min(1,Math.max(0,shot.current-.38)/1.4),good=goodPutt(shotPower.current);
    if(ball.current)ball.current.position.set(-3+6*p,.2+Math.sin(p*Math.PI)*.09,-1.8+(good?0:(shotPower.current-.66)*3)*p);
    if(p===1){if(good){if(!scored.current){scored.current=true;onScore();}}else {shot.current=-1;if(ball.current)ball.current.position.set(-3,.2,-1.8);}}
   }
  }
  if(kind==='lake'||kind==='flowers'){
   if(action.current.serial!==oldAction.current){oldAction.current=action.current.serial;if(shot.current<0)shot.current=0;}
   if(shot.current>=0){shot.current+=dt;const p=Math.min(1,shot.current/2.2);
    if(kind==='lake'&&ball.current){const point=stonePosition(shot.current);ball.current.visible=p<1;ball.current.position.set(point.x,point.y,point.z);if(ripple.current){ripple.current.visible=p<1;ripple.current.position.set(point.x,.089,point.z);ripple.current.scale.setScalar(.15+(p*4%1)*.8);}}
    if(kind==='flowers'&&bouquet.current){journey.current.gift=p;const lift=Math.min(1,p*3),handoff=THREE.MathUtils.smoothstep(p,.3,.9);bouquet.current.position.set(1.05*lift-2.1*handoff,1.1+Math.sin(p*Math.PI)*.3,-.5+1.6*lift);bouquet.current.rotation.z=Math.sin(p*Math.PI)*.25;}
    const cue=kind==='lake'?'Skipping…':'For you';if(lastCue.current!==cue){lastCue.current=cue;onCue(cue);}
    if(p===1){shot.current=-1;lastCue.current='';onScore();onCue(kind==='lake'?'Another stone?':'Flowers delivered');}
   }
  }
  if(kind==='skate'){
   const x=(keys.current.has('ArrowRight')||keys.current.has('d')?1:0)-(keys.current.has('ArrowLeft')||keys.current.has('a')?1:0);
   const z=(keys.current.has('ArrowDown')||keys.current.has('s')?1:0)-(keys.current.has('ArrowUp')||keys.current.has('w')?1:0);
   ice.current.vx+=(journey.current.step??0)*2;ice.current.vz+=(journey.current.stepZ??0)*2;journey.current.step=0;journey.current.stepZ=0;
   ice.current=skateStep(ice.current,x,z,dt);const v=ice.current;
   journey.current.playX=chapter.x+v.x;journey.current.playZ=v.z-3.1;journey.current.playY=.16;
   if(Math.hypot(v.vx,v.vz)>.1)journey.current.playFacing=Math.atan2(v.vx,v.vz);
  }
  if(kind==='ski'){
   const input=(keys.current.has('ArrowRight')||keys.current.has('d')?1:0)-(keys.current.has('ArrowLeft')||keys.current.has('a')?1:0);
   lane.current=moveLane(lane.current,input,dt);
   if(journey.current.step){lane.current=moveLane(lane.current,journey.current.step,1/6);journey.current.step=0;}
   if(skiPause.current>0)skiPause.current-=dt;
   else {const result=advanceSki(skiZ.current,dt,gateNumber.current,lane.current);skiZ.current=result.z;if(result.passed){onScore();gateNumber.current++;}if(result.missed)skiPause.current=.7;}
   journey.current.playX=chapter.x+lane.current;journey.current.playZ=skiZ.current;journey.current.playY=skiHeight(skiZ.current)+.08;
   const target=GATE_LANES[gateNumber.current%5],z=SKI_GATE_Z[gateNumber.current]??-1;
   const cue=`Gate ${Math.min(5,gateNumber.current+1)} · ${target===0?'center':target<0?'left':'right'}`;
   if(lastCue.current!==cue){lastCue.current=cue;onCue(cue);}
   if(gate.current)gate.current.position.set(target,skiHeight(z),z);
  }
  if(kind==='grad'||kind==='concert'||kind==='cruise'){
   const input=(keys.current.has('ArrowRight')||keys.current.has('d')?1:0)-(keys.current.has('ArrowLeft')||keys.current.has('a')?1:0);
   const limit=kind==='cruise'?10:4.2;walking.current=THREE.MathUtils.clamp(walking.current+input*dt*2.7+(journey.current.step??0)*.75,-limit,limit);journey.current.step=0;journey.current.direction=input||1;
   journey.current.playX=chapter.x+walking.current;journey.current.playZ=.2;journey.current.playY=kind==='cruise'?cruiseHeight(walking.current):.6;
   if(walking.current>limit-.3&&!scored.current){scored.current=true;onScore();}
  }
 });
 const count=active?game.count:complete?chapter.goal:0;
 return <group position={[chapter.x,0,0]} onClick={e=>{e.stopPropagation();if(!needsActivity||!active)onInteract(index);}}>
  {kind==='golf'&&<><Box position={[0,.06,-1.8]} size={[8,.1,3.6]} color="#bda57a"/><Box position={[0,.13,-1.8]} size={[7.6,.06,3.2]} color="#7caa73"/>{[-3.95,3.95].map(x=><Box key={x} position={[x,.19,-1.8]} size={[.18,.27,3.7]} color="#ac8b61"/>)}<Cylinder position={[3,.17,-1.8]} radius={.19} height={.015} color="#334d46"/><Cylinder position={[3,1.05,-1.8]} radius={.025} height={1.7} color="#eee0ba"/><Box position={[3.25,1.7,-1.8]} size={[.5,.35,.025]} color="#ca806a"/><group ref={ball} position={[-3,.2,-1.8]}><Ball position={[0,0,0]} scale={[.1,.1,.1]} color="#fff0cf"/></group>{active&&!game.done&&<group position={[0,.25,.3]}><Box size={[4,.08,.18]} color="#dae0bb"/><Box position={[.64,.01,0]} size={[.96,.09,.2]} color="#d8b666"/><group ref={marker}><Ball position={[0,.12,0]} scale={[.1,.1,.1]} color="#405b5e"/></group></group>}<Box position={[-3.8,.6,-.5]} size={[.035,1.2,.035]} rotation={[0,0,-.2]} color="#869da3"/><Box position={[-3.66,.08,-.5]} size={[.3,.12,.1]} color="#6d7e83"/></>}
  {kind==='skate'&&<group position={[0,0,-3.1]}><Rink/></group>}
  {kind==='ski'&&<><SkiSlope/>{SKI_GATE_Z.map((z,i)=><group key={z} position={[GATE_LANES[i],skiHeight(z),z]}>{[-1.15,1.15].map(x=><group key={x}><Cylinder position={[x,.8,0]} height={1.6} radius={.035} color="#587d99"/><Box position={[x+Math.sign(x)*.24,1.22,0]} size={[.45,.4,.035]} color={i<count?'#81a879':'#6298b8'}/></group>)}</group>)}{active&&!game.done&&<group ref={gate}><Ball position={[0,2.75,0]} scale={[.13,.13,.13]} color="#e8c965"/></group>}<Bench position={[-5,0,.7]}/></>}

  {chapter.id==='italy'&&<Italy/>}
  {chapter.id==='woods'&&<Boardwalk/>}
  {(kind==='concert'||kind==='grad')&&<Stage graduation={kind==='grad'} reducedMotion={reducedMotion}/>}
  {chapter.id==='two-years'&&<Balloons reducedMotion={reducedMotion}/>}
  {kind==='lake'&&<><Water size={[11,7]}/><Car/><Suitcase position={[-1.5,0,.3]}/><Box position={[2.8,.15,-1.2]} size={[3.5,.25,2]} color="#ba9d6e"/><group ref={ball} visible={false}><Ball position={[0,0,0]} scale={[.11,.07,.11]} color="#66796f"/></group><group ref={ripple} visible={false}><mesh rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.85,1,28]}/><meshBasicMaterial color="#c1e3dd" transparent opacity={.55} depthWrite={false}/></mesh></group></>}
  {chapter.id==='internships'&&<Office/>}
  {kind==='bbq'&&<><Box position={[0,1.5,-4]} size={[7,3,.18]} color="#b99873"/>{[-2.3,2.3].map(x=><group key={x}><Box position={[x,1.65,-3.88]} size={[1.8,1.8,.04]} color="#eadbbb"/>{[-.6,0,.6].map(dx=><Box key={dx} position={[x+dx,1.65,-3.83]} size={[.035,1.8,.035]} color="#977957"/>)}<Cylinder position={[x,3.1,-2.5]} radius={.25} height={.48} color="#c9826d"/></group>)}<Box position={[0,4.55,-2]} size={[7.3,.18,.2]} color="#ad8964"/>{[-3.35,3.35].map(x=><Box key={x} position={[x,2.25,-3.7]} size={[.15,4.5,.15]} color="#947859"/>)}{[-1.6,1.6].flatMap(x=>[-2.55,-1.05].map(z=><Box key={`${x}${z}`} position={[x,.5,z]} size={[.12,1,.12]} color="#755e47"/>))}{[-1,1].map(x=><group key={x}><Cylinder position={[x,.45,.1]} radius={.32} height={.12} color="#a78161"/><Cylinder position={[x,.2,.1]} radius={.05} height={.4} color="#5f6460"/></group>)}<Box position={[0,.1,-2]} size={[7,.2,4.5]} color="#b58c65"/><Box position={[0,1,-1.8]} size={[3.9,.18,2.1]} color="#967153"/><Cylinder position={[0,1.12,-1.8]} radius={.73} height={.09} color="#414b48"/>{Array.from({length:8},(_,i)=><Box key={i} position={[-.5+i*.14,1.18,-1.8]} size={[.026,.025,1.02]} color="#9c9d87"/>)}{[0,1,2,3].map(i=><Box key={i} position={[-.3+(i%2)*.6,1.22,-2.08+Math.floor(i/2)*.5]} size={[.34,.07,.3]} color={i<count?'#9b6348':'#d49078'} rotation={[0,i*.3,0]}/>)}{[-1.4,1.4].flatMap(x=>[-2.3,-1.4].map(z=><group key={`${x}${z}`}><Cylinder position={[x,1.16,z]} radius={.25} height={.07} color="#eee2c5"/><Ball position={[x,1.23,z]} scale={[.17,.09,.17]} color={z<-2?'#b76648':'#83a35c'}/></group>))}<Cylinder position={[0,3.4,-1.8]} radius={.25} height={2.3} color="#75817d"/><Cylinder position={[0,2.3,-1.8]} radius={.5} height={.25} color="#88918a"/><group ref={steam}>{[0,1,2,3].map(i=><mesh key={i} position={[(i%2-.5)*.4,1.7+i*.2,-1.8]}><sphereGeometry args={[1,8,6]}/><meshBasicMaterial transparent opacity={.13} color="#f2ece1" depthWrite={false}/></mesh>)}</group></>}
  {kind==='flowers'&&<><Bench position={[0,0,-2.4]}/><group ref={bouquet} position={[0,1.1,-.5]}><mesh rotation={[Math.PI,0,0]}><coneGeometry args={[.65,1,9]}/><meshLambertMaterial color="#e1ccaa"/></mesh>{Array.from({length:21},(_,i)=><group key={i} position={[Math.sin(i*2.4)*(.15+i*.021),.4+Math.cos(i*3)*.15,Math.cos(i*2.4)*(.15+i*.021)]}><Ball position={[0,0,0]} scale={[.19,.16,.19]} color={['#b96b7d','#eab3af','#f4dfb3','#a69cc0'][i%4]}/><Ball position={[0,.11,0]} scale={[.09,.07,.09]} color="#edd198"/></group>)}<Box position={[0,-.22,.28]} size={[.45,.12,.03]} color="#9d6471"/></group></>}
  {chapter.id==='dubai'&&<Dubai/>}
  {chapter.id==='cruise'&&<CruiseShip/>}
  {kind==='pizza'&&<NYC bites={count}/>}
  {kind==='future'&&<Jobs grown={count>0}/>}
  <Sign position={chapter.id==='cruise'?[9.5,0,3.2]:[6,0,.3]} date={chapter.shortDate} label={chapter.title.toUpperCase()} celebration={Math.max(0,['woods','two-years','bbq','flowers','five-years'].indexOf(chapter.id)+1)}/>
 </group>;
}
