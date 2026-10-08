import { Canvas, useFrame } from '@react-three/fiber';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { characters, chapters, chapterIndex, WORLD_END, type Outfit } from './story';
import { Box, Ball, Cylinder, Contact, Label, Sign, Heart, Tulip, BOX, SPHERE, CONE, PLANE, material } from './Primitives';
import { MemoryStop, Biome } from './Memories';
import { groundTexture, GroundDetails, Weather } from './Environment';
import { createRally, advanceRally, receiveRally, canReceive, receivingKey, type PaddleKey } from './pingpong';

import { Apartment } from './Apartment';
import { Landscape, TransitionTrees } from './Landscape';
import { skiHeight } from './ScenicModels';
import { cruiseHeight, SKI_START_Z } from './activities';

export type Journey = { x: number; direction: number; target: number | null; moving: boolean; companionX: number; playX?: number; playZ?: number; playY?: number; step?: number; stepZ?: number; playFacing?:number; putt?:number; gift?:number; homeReady?:boolean };
export type GameState = { index: number; count: number; done: boolean; unpacked: number[] };
type Props = {
  travelVersion: number;
  journey: React.RefObject<Journey>; keys: React.RefObject<Set<string>>; leader: number; game: GameState | null;
  action: React.RefObject<{serial: number; key: PaddleKey}>; completed: number[]; reducedMotion: boolean;
  onNearby: (index: number | null) => void; onInteract: (index: number, item?: number) => void;
  onCue: (cue:string) => void; onScore: () => void; onWalkTo: (x: number) => void; onRallyStatus: (status: {ready: boolean; side: PaddleKey; misses: number}) => void; onMiss: () => void;
};

function PingPong({ active, game, action, onScore, onInteract, reducedMotion, onRallyStatus, onMiss }: { active: boolean; game: GameState | null; action: Props['action']; onScore: () => void; onInteract: Props['onInteract']; reducedMotion: boolean; onRallyStatus: Props['onRallyStatus']; onMiss: Props['onMiss'] }) {
  const ball = useRef<THREE.Mesh>(null);
  const paddle = useRef<THREE.Group>(null);
  const leftPaddle = useRef<THREE.Group>(null);
  const zone = useRef<THREE.Mesh>(null);
  const rally = useRef(createRally());
  const previousAction = useRef(action.current.serial);
  const bounce = useRef({ a: 0, l: 0 });
  const previousStatus = useRef('');
  useEffect(() => { rally.current=createRally(); previousAction.current=action.current.serial; previousStatus.current=''; }, [active,action]);
  useFrame((_, delta) => {
    const dt=Math.min(delta,.05), current=rally.current;
    if(active && !game?.done) {
      // Evaluate input before advancing so a press near the boundary isn't lost.
      if(action.current.serial!==previousAction.current) {
        previousAction.current=action.current.serial;
        bounce.current[action.current.key]=.3;
        if(receiveRally(current,action.current.key)) onScore();
      }
      if(advanceRally(current,dt)) onMiss();
      if(ball.current) ball.current.position.set(current.x,1.55+Math.sin(current.progress*Math.PI)*.55,-1.65);
      if(zone.current) zone.current.position.x=current.to>0?1.25:-1.25;
    } else if(ball.current) ball.current.position.set(1.15,1.5,-1.6);
    const ready=active && !game?.done && canReceive(current);
    const side=receivingKey(current);
    const status=`${ready}:${side}:${current.misses}`;
    if(status!==previousStatus.current){previousStatus.current=status;onRallyStatus({ready,side,misses:current.misses});}
    bounce.current.a=Math.max(0,bounce.current.a-dt);bounce.current.l=Math.max(0,bounce.current.l-dt);
    if(paddle.current) paddle.current.rotation.z=reducedMotion?0:Math.sin(bounce.current.l*12)*.55;
    if(leftPaddle.current) leftPaddle.current.rotation.z=reducedMotion?0:-Math.sin(bounce.current.a*12)*.55;
  });
  return <group onClick={event=>{event.stopPropagation();if(!active)onInteract(0);}}>
    <Box position={[0,.1,-1.7]} size={[7,.18,4.5]} color="#d8c9a6"/>
    {[-1.3,1.3].flatMap(x=>[-.72,.72].map(z=><Box key={`${x}-${z}`} position={[x,.72,z-1.6]} size={[.13,1.3,.13]} color="#eee7d2"/>))}
    <Box position={[0,1.39,-1.6]} size={[3.6,.14,2.1]} color="#58877d"/>
    {[-.98,.98].map(z=><Box key={z} position={[0,1.468,z-1.6]} size={[3.45,.014,.035]} color="#efefda"/>)}
    <Box position={[0,1.468,-1.6]} size={[3.45,.014,.035]} color="#efefda"/>
    <Box position={[0,1.7,-1.6]} size={[.025,.46,2.2]} color="#d9ded0"/>
    {[-2.7,-.5].map(z=><Cylinder key={z} position={[0,1.72,z]} radius={.03} height={.51} color="#46695d"/>)}
    {active && !game?.done && <mesh ref={zone} position={[1.25,1.481,-1.6]} rotation={[-Math.PI/2,0,0]} scale={[.8,2,1]} geometry={PLANE}><meshBasicMaterial color="#e7d48b" transparent opacity={.38} depthWrite={false}/></mesh>}
    <mesh ref={ball} geometry={SPHERE} material={material('#fff1cc')} scale={.095} position={[1.15,1.5,-1.6]}/>
    <group ref={paddle} position={[1.85,1.57,-1.6]} onClick={event=>{event.stopPropagation();if(active)action.current={serial:action.current.serial+1,key:'l'};else onInteract(0);}}><Ball position={[0,0,0]} scale={[.24,.27,.065]} color="#c67e68"/><Box position={[0,-.33,0]} size={[.09,.27,.075]} color="#c2a476"/></group>
    <group ref={leftPaddle} position={[-1.85,1.57,-1.6]} onClick={event=>{event.stopPropagation();if(active)action.current={serial:action.current.serial+1,key:'a'};else onInteract(0);}}><Ball position={[0,0,0]} scale={[.24,.27,.065]} color="#647d96"/><Box position={[0,-.33,0]} size={[.09,.27,.075]} color="#c2a476"/></group>

    {active && <><Label text="A" position={[-2.4,2.7,-1.6]} width={.65}/><Label text="L" position={[2.4,2.7,-1.6]} width={.65}/></>}
    <Sign position={[3.7,0,-2]} date={chapters[chapterIndex('university')].shortDate} label="CAMPUS"/>
    <Box position={[-3,.5,-3.2]} size={[1.4,.13,.65]} color="#b49b72"/><Box position={[-3,.25,-3.2]} size={[.9,.5,.4]} color="#b09b7b"/>
  </group>;
}

function Burger({ bites = 0 }: { bites?: number }) {
  const group=useRef<THREE.Group>(null);
  const target=bites>=5?0:1-bites*.14;
  useFrame((_,dt)=>{if(group.current){const s=THREE.MathUtils.damp(group.current.scale.x,target,12,Math.min(dt,.05));group.current.scale.set(s,s,s);}});
  return <group ref={group}>
    <Ball position={[0,.27,0]} scale={[.58,.3,.5]} color="#dba75a"/>
    <Cylinder position={[0,.06,0]} radius={.55} height={.12} color="#779553"/>
    <Cylinder position={[0,-.04,0]} radius={.51} height={.1} color="#b96849"/>
    <Box position={[0,-.12,0]} size={[.91,.06,.87]} color="#e6c060" rotation={[0,.2,0]}/>
    <Cylinder position={[0,-.2,0]} radius={.53} height={.16} color="#785439"/>
    <Cylinder position={[0,-.35,0]} radius={.53} height={.17} color="#d6a15b"/>
    {[-.25,0,.25].map((x,i)=><Ball key={i} position={[x,.545-i*.025,.06-i*.05]} scale={[.06,.018,.023]} color="#f9deb0"/>)}
  </group>;
}
function BurgerStop({ game, onInteract }: { game: GameState | null; onInteract: Props['onInteract'] }) {
  const active=game?.index===chapterIndex('burger');
  return <group position={[chapters[chapterIndex('burger')].x,0,0]} onClick={event=>{event.stopPropagation();if(!active)onInteract(chapterIndex('burger'));}}>
    <Box position={[0,.08,-1.8]} size={[7.5,.15,5.5]} color="#c6b194"/>
    <Box position={[0,1.42,-3.6]} size={[4.4,2.7,1.8]} color="#c68e59"/>
    {Array.from({length:8},(_,i)=><Box key={i} position={[0,.32+i*.32,-2.665]} size={[4.4,.025,.018]} color="#a87348"/>)}
    <Box position={[0,.20,-1.5]} size={[5.5,.18,4]} color="#aa8054"/>
    {Array.from({length:12},(_,i)=><Box key={i} position={[-2.52+i*.46,.297,-1.5]} size={[.018,.012,4]} color="#8e6b48"/>)}
    <Box position={[0,1.6,-2.67]} size={[3.5,1.13,.05]} color="#536e60"/>
    <Box position={[0,1.6,-2.61]} size={[3.67,1.27,.07]} color="#e8d4a8"/>
    <Box position={[0,1.6,-2.54]} size={[3.38,1.02,.04]} color="#365e60"/>
    <Box position={[0,1.6,-2.5]} size={[.06,1.04,.04]} color="#e8d4a8"/>
    <Box position={[0,2.63,-1.38]} size={[4.9,.46,.12]} color="#3c7376"/>
    <Label text="BURGER" position={[0,2.66,-1.27]} width={2.0} color="#fff0cd"/>
    <Box position={[0,2.99,-3]} size={[5.1,.2,3.4]} color="#407b7b" rotation={[.035,0,0]}/>
    <Box position={[0,3.12,-3.8]} size={[5.05,.045,.07]} color="#71a0a0"/>
    {Array.from({length:10},(_,i)=><Box key={i} position={[-2.24+i*.5,2.32,-1.36]} size={[.25,.2,.06]} color="#f4db9a"/>)}
    <Box position={[0,1.04,-2.25]} size={[4.2,.15,.9]} color="#d6b27b"/>
    <group position={[-1.3,1.13,-2.15]}><Cylinder position={[0,.16,0]} radius={.07} height={.29} color="#c56343"/><Cylinder position={[.22,.16,0]} radius={.07} height={.29} color="#ddb545"/></group>
    <Cylinder position={[1.4,1.27,-2.15]} radius={.10} height={.28} color="#f4e9ce"/>
    <Box position={[1.4,1.5,-2.15]} size={[.022,.27,.022]} color="#d77956"/>
    <Box position={[2.15,1.76,-2.57]} size={[.52,.67,.045]} color="#334e4c"/>
    {[0,1,2].map(i=><Box key={i} position={[2.15,1.92-i*.15,-2.535]} size={[.32-i*.04,.025,.01]} color="#e9dcb6"/>)}
    {[-1.92,1.92].map(x=><group key={x}><Box position={[x,2.3,-2.5]} size={[.10,.15,.15]} color="#405f58"/><Ball position={[x,2.22,-2.42]} scale={[.065,.08,.065]} color="#f4d884"/></group>)}
    <Cylinder position={[-2.55,.5,-1.5]} radius={.27} height={.55} color="#b96046"/>
    <Ball position={[-2.55,1,-1.5]} scale={[.4,.5,.38]} color="#729958"/>
    <Box position={[0,1.08,-.25]} size={[2.5,.13,1.35]} color="#ab8e61"/>
    {[-.85,.85].map(x=><Box key={x} position={[x,.55,-.25]} size={[.15,1.1,.8]} color="#947d5b"/>)}
    <Cylinder position={[0,1.17,-.25]} radius={.75} height={.035} color="#eee5c9"/>
    <group position={[0,1.59,-.25]} onClick={event=>{event.stopPropagation();onInteract(chapterIndex('burger'));}}><Burger bites={active?game.count:0}/></group>
    {active && Array.from({length:game.count},(_,i)=><Ball key={i} position={[-.6+i*.24,1.22,.14]} scale={[.05,.035,.04]} color="#bd9454"/>)}
    {[-1.5,1.5].map(x=><group key={x}><Cylinder position={[x,.65,-.3]} radius={.35} height={.14} color="#a66e51"/><Cylinder position={[x,.32,-.3]} radius={.065} height={.6} color="#d6c7a6"/></group>)}
    <Heart position={[1.5,3.45,-1.3]} scale={.35}/><Heart position={[-1.5,3.25,-1.3]} scale={.23}/><Tulip position={[1.05,1.18,-.4]}/><Tulip position={[-3,0,-.7]}/><Sign position={[3.7,0,-2.2]} date={chapters[chapterIndex('burger')].shortDate} label="MRBEAST BURGER"/>
  </group>;
}

// A tiny procedural fabric texture keeps the striped shorts to one material.
const stripePixels = new Uint8Array(32 * 4);
for (let x = 0; x < 32; x++) {
  const color = x % 8 < 2 ? [238, 225, 217] : [164, 113, 129];
  stripePixels.set([...color, 255], x * 4);
}
const stripeTexture = new THREE.DataTexture(stripePixels, 32, 1, THREE.RGBAFormat);
stripeTexture.colorSpace = THREE.SRGBColorSpace;
stripeTexture.magFilter = THREE.LinearFilter;
stripeTexture.needsUpdate = true;
const stripedShorts = new THREE.MeshLambertMaterial({ map: stripeTexture });

function Face({skin,stubble}:{skin:string;stubble:boolean}) {
 const geometry=useMemo(()=>{
  const g=new THREE.SphereGeometry(1,32,24),position=g.attributes.position;
  const colors=new Float32Array(position.count*3),base=new THREE.Color(skin),shade=new THREE.Color('#987a67');
  for(let i=0;i<position.count;i++){
   const y=position.getY(i),z=position.getZ(i);
   const amount=stubble?THREE.MathUtils.smoothstep(-y,.28,.62)*THREE.MathUtils.smoothstep(z,.1,.55)*.28:0;
   const c=base.clone().lerp(shade,amount);colors.set([c.r,c.g,c.b],i*3);
  }
  g.setAttribute('color',new THREE.BufferAttribute(colors,3));return g;
 },[skin,stubble]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <mesh geometry={geometry} position={[0,1.72,.015]} scale={[stubble?.44:.42,.45,.375]} castShadow receiveShadow><meshLambertMaterial vertexColors/></mesh>;
}
function Sunglasses({ round }: { round: boolean }) {
  return <group position={[0, 1.76, .373]}>
    {[-1, 1].map(side => <group key={side} position={[side * .19, 0, 0]} rotation={[0, side * .12, side * -.045]}>
      {round ? <Ball position={[0, 0, 0]} scale={[.17, .147, .045]} color="#22292d"/> : <Box size={[.345, .224, .065]} color="#262e34"/>}
      <Ball position={[0, .003, .033]} scale={[.139, round ? .118 : .088, .022]} color="#344952"/>
      <Box position={[-.037, .051, .054]} size={[.093, .013, .008]} rotation={[0, 0, .3]} color="#849899"/>
    </group>)}
    <Box position={[0, .023, .013]} size={[.08, .035, .035]} color="#263139"/>
    {[-1, 1].map(side => <Box key={side} position={[side * .366, .015, -.14]} size={[.033, .039, .30]} color="#263139"/>)}
  </group>;
}
function PhotoHair({ tiedBack, color, hat=false }: { tiedBack: boolean; color: string; hat?:boolean }) {
  return <group>
    <Ball position={[0, 1.99, -.075]} scale={[.445, .255, .375]} color={color}/>
    {tiedBack ? <>
      <Ball position={[0, 1.8, -.38]} scale={[.255, .28, .235]} color={color}/>
      <Ball position={[-.17, 1.99, .245]} scale={[.23, .27, .15]} color={color}/>
      <Ball position={[.18, 1.99, .24]} scale={[.22, .25, .15]} color={color}/>
      <Ball position={[-.32, 1.86, .18]} scale={[.13, .28, .16]} color={color}/>
      <Ball position={[.36, 1.76, -.06]} scale={[.095, .31, .18]} color={color}/>
    </> : <>
      <Ball position={[-.22, 1.98, .24]} scale={[.2, .15, .14]} color={color}/>
      {!hat&&[[-.28,2.13,.02,-.4],[-.12,2.2,.07,-.2],[.07,2.21,.015,.3],[.25,2.14,-.01,.55],[.02,2.16,-.23,-.3]].map((p,i) => <mesh key={i} geometry={CONE} material={material(i%2 ? '#725d4d' : color)} position={[p[0],p[1],p[2]]} scale={[.14,.30,.13]} rotation={[.2,0,p[3]]}/>)}
      {[-1,1].map(side => <Ball key={side} position={[side*.393,1.84,-.05]} scale={[.064,.17,.19]} color={color}/>)}
    </>}
  </group>;
}
function ToteBag() {
  return <group position={[-.49, .69, -.015]}>
    <mesh position={[0, .43, 0]} rotation={[0, Math.PI/2, 0]} scale={[.63,1,.7]}><torusGeometry args={[.36,.025,5,16]}/><meshLambertMaterial color="#d8d0b6"/></mesh>
    <Ball position={[0, -.01, .025]} scale={[.19,.31,.235]} color="#d8cdb0"/>
    {[-.16,-.04,.08,.20].map(y => <Box key={y} position={[-.177,y,.025]} size={[.013,.016,.34]} color="#aa9e83"/>)}
    {[-.10,0,.10].map(z => <Box key={z} position={[-.19,-.015,z+.025]} size={[.012,.44,.014]} color="#f0e5c9"/>)}
  </group>;
}

function Character({ index, isLeader, journey, game, reducedMotion, outfit: requestedOutfit }: { index: number; isLeader: boolean; journey: React.RefObject<Journey>; game: GameState | null; reducedMotion: boolean; outfit: Outfit }) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const phase = useRef(0);
  const [outfit,setOutfit]=useState(requestedOutfit);
  const club=useRef<THREE.Group>(null);
  useEffect(()=>{if(root.current&&game&&chapters[game.index].kind==='ski')root.current.position.set(chapters[game.index].x+(isLeader?0:-.9),skiHeight(SKI_START_Z)+.08,SKI_START_Z);},[game?.index,isLeader]);
  const original = characters[index];
  const winter=outfit==='skate'||outfit==='ski', grad=outfit==='grad', work=outfit==='work';
  const custom=winter||grad||work;
  const top=winter?(index===0?'#354653':outfit==='ski'?'#23666e':'#303e59'):grad?'#303846':work?(index===0?'#34383c':'#41484a'):original.top;
  const pants=winter?(index===1&&outfit==='skate'?'#54798d':'#303c45'):grad&&index===1?'#eee9d9':work||grad?'#30363c':original.trousers;
  const c={...original,top,trousers:pants};
  useFrame((_,dt) => {
    if (!root.current) return;
    const j = journey.current;
    const ownChapter=chapters[Math.max(0,Math.min(chapters.length-1,Math.round(root.current.position.x/24)))];
    const nextOutfit=game?requestedOutfit:ownChapter.outfit;
    if(nextOutfit!==outfit)setOutfit(nextOutfit);
    let desired = isLeader ? j.x : j.companionX;
    let desiredZ = isLeader ? 1.55 : 2.25;
    if(chapters[Math.max(0,Math.min(chapters.length-1,Math.round(j.x/24)))].id==='cruise')desiredZ=isLeader?.4:.85;
    let facing: number | null = null;
    if (game) {
      const center = chapters[game.index].x;
      desired = center + (isLeader ? 1 : -1) * (game.index === 0 ? 2.45 : 1.05);
      desiredZ = game.index === 0 ? -1.6 : 1.6;
      facing = game.index === 0 ? (isLeader ? -Math.PI / 2 : Math.PI / 2) : Math.PI;
    }
    if(game && j.playX!==undefined){desired=j.playX+(isLeader?0:-.9);desiredZ=(j.playZ??0)+(isLeader||chapters[game.index].kind==='home'?0:.8);facing=chapters[game.index].kind==='home'?0:chapters[game.index].kind==='skate'?(j.playFacing??Math.PI):chapters[game.index].kind==='ski'?(index===0?0:Math.PI/2):j.direction*Math.PI/2;}
    if(game&&chapters[game.index].kind==='skate'){desired=THREE.MathUtils.clamp(desired,chapters[game.index].x-4.1,chapters[game.index].x+4.1);desiredZ=THREE.MathUtils.clamp(desiredZ,-8.9,-2.1);}
    if(game&&chapters[game.index].kind==='golf'&&isLeader){desired=chapters[game.index].x-3.1;desiredZ=-.85;facing=Math.PI;}
    if(game&&chapters[game.index].kind==='pizza'){desired=chapters[game.index].x+(isLeader?1.5:.4);desiredZ=-.2;facing=Math.PI;}
    if(game&&chapters[game.index].kind==='flowers'){facing=isLeader?-Math.PI/2:Math.PI/2;}
    root.current.rotation.x=game&&chapters[game.index].kind==='ski'?.27:0;
    const localChapter=chapters[Math.max(0,Math.min(chapters.length-1,Math.round(j.x/24)))];
    const onDeck=['woods','cruise'].includes(localChapter.id)&&Math.abs(j.x-localChapter.x)<5.7;
    root.current.position.y=THREE.MathUtils.damp(root.current.position.y,(game&&chapters[game.index].kind==='ski'?skiHeight(desiredZ)+.08:game&&chapters[game.index].kind==='cruise'?cruiseHeight(desired-chapters[game.index].x):j.playY)??(localChapter.id==='cruise'?cruiseHeight((isLeader?j.x:j.companionX)-localChapter.x):onDeck?.38:.13),8,Math.min(dt,.05));
    const oldX = root.current.position.x;
    root.current.position.x = THREE.MathUtils.damp(oldX,desired,12,Math.min(dt,0.05));
    root.current.position.z = THREE.MathUtils.damp(root.current.position.z, desiredZ, 6, Math.min(dt,.05));
    const moving = Math.abs(desired-oldX)>0.02||Math.abs(desiredZ-root.current.position.z)>.03;
    const direction = isLeader ? j.direction : Math.sign(desired-oldX) || j.direction;
    root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, facing ?? direction * 0.65,8,Math.min(dt,.05));
    phase.current += dt * 10;
    const swing = moving && !reducedMotion ? Math.sin(phase.current)*(winter?.13:.6) : 0;
    if (leftLeg.current) leftLeg.current.rotation.x = swing;
    if (rightLeg.current) rightLeg.current.rotation.x = -swing;
    if (leftArm.current) leftArm.current.rotation.x = -swing*0.65;
    if (rightArm.current) rightArm.current.rotation.x = swing*0.65;
    const putting=game&&chapters[game.index].kind==='golf'&&isLeader;
    if(club.current){club.current.visible=Boolean(putting);club.current.rotation.z=putting&&j.putt!==undefined&&j.putt>=0?Math.sin(Math.min(1,j.putt/.55)*Math.PI*2)*.48:0;}
    if(putting){if(leftArm.current)leftArm.current.rotation.x=-.9;if(rightArm.current)rightArm.current.rotation.x=-.9;}
    if(game&&chapters[game.index].kind==='flowers'&&j.gift!==undefined){if(leftArm.current)leftArm.current.rotation.x=-.9;if(rightArm.current)rightArm.current.rotation.x=-.9;}
    if (body.current) { body.current.rotation.z=winter&&moving?Math.sin(phase.current*.5)*.035:0; body.current.position.y = moving && !reducedMotion ? Math.abs(Math.sin(phase.current))*(winter?.015:.045) : 0;}
  });
  return <><group ref={root} position={[isLeader ? journey.current.x : journey.current.companionX,0.13,isLeader ? 1.55 : 2.25]}>
    {isLeader && <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.025,0]}><ringGeometry args={[0.48,0.53,40]}/><meshBasicMaterial color="#b68b50" transparent opacity={0.65}/></mesh>}
    <group ref={club} position={[.05,.85,.48]} rotation={[-.45,0,0]} visible={false}><Box position={[0,-.43,0]} size={[.035,.92,.035]} color="#8b9ba0"/><Box position={[0,-.85,.06]} size={[.43,.12,.14]} color="#516b70"/><Box position={[0,-.08,0]} size={[.055,.3,.055]} color="#684b3b"/></group>
    <Contact position={[0,.01,0]} scale={[.47,.3,1]} opacity={.17}/>
    <group scale={c.height}>
      <group ref={body}>
        {[-1, 1].map(side => <group key={side} ref={side===-1?leftLeg:rightLeg} position={[side*.17,.66,0]}>
          {c.style==='tee' && !custom ? <>
            <Ball position={[0,-.26,0]} scale={[.105,.245,.115]} color={c.skin}/>
            <mesh geometry={BOX} material={stripedShorts} position={[0,-.12,0]} scale={[.27,.32,.29]}/>
          </> : <>
            <Box position={[0,-.23,0]} size={[.29,.54,.3]} color={c.trousers}/>
            <Box position={[.075,-.22,.153]} size={[.018,.46,.008]} color={custom?'#52616b':'#dedacc'}/>
          </>}
          <Box position={[0,-.49,.075]} size={[.27,.14,.4]} color={winter?(outfit==='ski'?(index===0?'#a85042':'#394a57'):index===0?'#303c43':'#e5e5db'):grad?'#7f6b52':'#f3eee0'}/>
          {outfit==='skate'&&<><Box position={[0,-.60,.08]} size={[.045,.09,.52]} color="#b4c6ca"/>{[0,1,2].map(i=><Box key={i} position={[0,-.41,.02+i*.07]} size={[.17,.016,.018]} color="#eeeede"/>)}</>}
          {outfit==='ski'&&index===0&&<Box position={[0,-.6,.02]} size={[.18,.065,1.65]} color="#b86153"/>}
        </group>)}
        {c.style==='tee' || custom ? <>
          <Ball position={[0,1.0,0]} scale={[.405,.41,.29]} color={c.top}/>
          <Cylinder position={[0,1.36,0]} radius={.135} height={.1} color={c.skin}/>
          <Ball position={[0,1.305,.145]} scale={[.17,.035,.09]} color="#87969b"/>
          {!custom&&<group position={[.16,1.10,.275]} rotation={[0,0,-.15]}>
            <mesh><torusGeometry args={[.053,.012,4,10]}/><meshLambertMaterial color="#66787e"/></mesh>
            <Box position={[0,.085,0]} size={[.052,.016,.014]} rotation={[0,0,.6]} color="#66787e"/>
          </group>}
        </> : <>
          <Ball position={[0,1.255,0]} scale={[.30,.105,.21]} color={c.skin}/>
          <mesh position={[0,.975,.035]} scale={[1,1,.93]}><cylinderGeometry args={[.16,.345,.59,12]}/><meshLambertMaterial color={c.top}/></mesh>
          <Cylinder position={[0,1.3,.013]} radius={.115} height={.055} color={c.top}/>
          <Box position={[0,.692,.065]} size={[.56,.07,.36]} color={c.trousers}/>
          <Ball position={[.2,.665,.23]} scale={[.06,.065,.04]} color="#e4dfd0"/>
          <Box position={[.21,.54,.21]} size={[.035,.2,.023]} rotation={[0,0,.2]} color="#e4dfd0"/>
          <ToteBag/>
        </>}
        {[-1,1].map(side => <group key={side} ref={side===-1?leftArm:rightArm} position={[side*.36,1.23,0]}>
          <Ball position={[side*.055,-.255,0]} scale={[winter||grad?.14:.105,.30,winter||grad?.15:.115]} color={winter||grad?top:c.skin}/>
          {(c.style==='tee'||winter||grad) && <Ball position={[side*.045,-.095,0]} scale={[.15,.19,.16]} color={c.top}/>}
          <Ball position={[side*.075,-.49,.02]} scale={[.11,.125,.11]} color={winter?(outfit==='skate'&&index===1?'#dce3df':'#26373f'):c.skin}/>
          {c.style==='tee' && side===1 && <group position={[.07,-.40,0]}><Cylinder position={[0,0,0]} radius={.112} height={.068} color="#313a3c"/><Box position={[0,0,.106]} size={[.135,.108,.034]} color="#263338"/></group>}
          {c.style==='halter' && !custom && side===-1 && <>{[-.365,-.405,-.44].map((y,i)=><Cylinder key={y} position={[-.068,y,0]} radius={.11} height={.025} color={['#829b76','#c6b070','#709b99'][i]}/>)}</>}
        </group>)}
        <Face skin={c.skin} stubble={c.style==='tee'}/>
        {[-1,1].map(side=><Ball key={side} position={[side*.405,1.7,-.006]} scale={[.08,.115,.077]} color={c.skin}/>)}
        <PhotoHair tiedBack={c.style==='halter'} color={c.hair} hat={grad||outfit==='ski'}/>
        {!custom?<Sunglasses round={c.style==='halter'}/>:outfit==='ski'?<><Ball position={[0,2.08,-.03]} scale={[.48,.25,.43]} color={index===0?'#8a9aa4':'#55656d'}/><Box position={[0,1.78,.39]} size={[.69,.23,.08]} color="#293c43"/><Box position={[0,1.78,.44]} size={[.59,.16,.035]} color="#d9945b"/></>:<>{[-.17,.17].map(x=><Ball key={x} position={[x,1.77,.362]} scale={[.037,.045,.023]} color="#3c3834"/>)}</>}
        {winter&&<><Ball position={[0,1.3,-.2]} scale={[.38,.24,.22]} color={top}/>{index===1&&outfit==='skate'&&<Box position={[0,.69,-.015]} size={[.66,.48,.51]} color={top}/>}<Cylinder position={[0,1.3,0]} radius={.21} height={.18} color={index===0?'#293842':'#536879'}/><Box position={[0,1,.293]} size={[.018,.49,.018]} color="#adb7b5"/>{[.81,.94,1.07].map(y=><Box key={y} position={[0,y,.29]} size={[.59,.017,.025]} color={index===0?'#47545d':'#42516c'}/>)}</>}
        {outfit==='ski'&&index===1&&<><Box position={[0,.015,.04]} size={[1.24,.075,.5]} color="#92889b"/>{[-.17,.17].map(x=><Box key={x} position={[x,.11,.06]} size={[.23,.06,.3]} color="#4b90a8"/>)}</>}
        {outfit==='ski'&&index===0&&[-.55,.55].map(x=><Box key={x} position={[x,.59,.14]} size={[.025,1.2,.025]} color="#54636c"/>)}
        {grad&&<><mesh position={[0,.77,0]}><cylinderGeometry args={[.37,.48,.88,10]}/><meshLambertMaterial color="#303846"/></mesh><Box position={[0,2.32,0]} size={[.88,.07,.88]} rotation={[0,.15,0]} color="#293442"/><Cylinder position={[0,2.22,0]} radius={.29} height={.14} color="#293442"/><Box position={[.38,2.15,.18]} size={[.025,.34,.025]} color="#dbc47a"/>{[-1,1].map(side=><Box key={side} position={[side*.16,1.2,.28]} size={[.17,.42,.05]} rotation={[0,0,side*-.55]} color={index===0?'#b3cc87':'#c5c6dc'}/>)}</>}
        {grad&&game?.done&&<group position={[.45,.83,.14]} rotation={[0,0,1.1]}><Cylinder position={[0,0,0]} radius={.075} height={.47} color="#f1e7cc"/><Cylinder position={[0,0,0]} radius={.08} height={.07} color={index===0?'#9eba77':'#b6aecb'}/></group>}
        <Ball position={[0,1.64,.391]} scale={[.054,.052,.053]} color={c.skin}/>
        <Ball position={[0,1.535,.348]} scale={[.117,.051,.027]} color="#976451"/>
        <Ball position={[0,1.553,.372]} scale={[.098,.027,.014]} color="#f5e9d9"/>
      </group>
    </group>
  </group></>;
}


const palettes = {
  summer: ['#adc989','#d5e5d2'], autumn:['#cbb68a','#e6d5b9'],winter:['#e0e9e6','#cfdee4'],
  spring:['#a8c68f','#d2e1d3'], coast:['#d4c597','#bcdee2'],desert:['#d9c096','#ebd9b9'],night:['#8796a0','#a4afc5'],
};
const SEASONS=chapters.flatMap(c=>[-5,5].map(offset=>({x:c.x+offset,groundColor:new THREE.Color(palettes[c.season][0]),skyColor:new THREE.Color(palettes[c.season][1])})));

function Sun({journey}:{journey:React.RefObject<Journey>}) {
 const light=useRef<THREE.DirectionalLight>(null);
 useFrame(()=>{if(light.current){light.current.position.set(journey.current.x-7,16,9);light.current.target.position.set(journey.current.x,0,-2);light.current.target.updateMatrixWorld();}});
 return <directionalLight ref={light} intensity={1.65} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-16} shadow-camera-right={16} shadow-camera-top={17} shadow-camera-bottom={-14} shadow-camera-far={45} shadow-bias={-.00025} shadow-normalBias={.035}/>;
}
function Scene(props: Props) {
  const {journey,keys,leader,game,onNearby,onWalkTo,reducedMotion}=props;
  const initialChunk=Math.max(0,Math.min(chapters.length-1,Math.round(journey.current.x/24)));
  const [chunk,setChunk]=useState(initialChunk);
  const chunkRef=useRef(initialChunk);
  const ground=useRef<THREE.MeshLambertMaterial>(null);
  const background=useMemo(()=>new THREE.Color('#dbe2c5'),[]);
  const lookTarget=useMemo(()=>new THREE.Vector3(),[]);
  const lastNear=useRef<number|null>(0);
  const cameraReady=useRef(false);
  const focusY=useRef(.8);
  const focusZ=useRef(0);
  useFrame((state,delta)=>{
    const dt=Math.min(delta,.05);const j=journey.current;
    const nextChunk=Math.max(0,Math.min(chapters.length-1,Math.round(j.x/24)));
    if(nextChunk!==chunkRef.current){chunkRef.current=nextChunk;setChunk(nextChunk);}
    let input=0;
    if(!game) {
      if(keys.current.has('ArrowRight')||keys.current.has('d'))input+=1;
      if(keys.current.has('ArrowLeft')||keys.current.has('a'))input-=1;
      if(input)j.target=null;
      if(j.target!==null && !input){const distance=j.target-j.x;if(Math.abs(distance)<.12){j.x=j.target;j.target=null;}else input=Math.sign(distance);}
      j.x=THREE.MathUtils.clamp(j.x+input*dt*4.8,-7,WORLD_END);
      if(input)j.direction=input;
      j.moving=input!==0;
      j.companionX=THREE.MathUtils.damp(j.companionX,j.x-j.direction*1.15,4,dt);
    } else j.moving=false;
    const nextNear=chapters.findIndex(c=>Math.abs(c.x-j.x)<4.2);
    const near=nextNear===-1?null:nextNear;
    if(lastNear.current!==near){lastNear.current=near;onNearby(near);}

    const cam=state.camera as THREE.OrthographicCamera;
    const mobile=state.size.width<600;
    const baseZoom=Math.min(state.size.width/(mobile?10.8:16.5),state.size.height/10.6);
    const focused=game!==null && !game.done;
    const wide=['italy','dubai','cruise','future','home','five-years','skiing','skating'].includes(chapters[chunk].id);
    const desiredZoom=chapters[chunk].id==='skiing'?Math.min(state.size.width/21,state.size.height/17):chapters[chunk].id==='five-years'?Math.min(state.size.width/23,state.size.height/21):chapters[chunk].id==='cruise'?Math.min(state.size.width/25,state.size.height/13):chapters[chunk].id==='home'?Math.min(baseZoom*.83,state.size.height/14):['future','five-years'].includes(chapters[chunk].id)?Math.min(baseZoom*.76,state.size.height/18):baseZoom*(wide?.82:focused?(['burger','home','university'].includes(chapters[chunk].id)?1.12:1.04):1);
    const focusX=game?chapters[game.index].x:j.x;
    const desiredX=focusX+3.2;
    const desiredY=chapters[chunk].id==='skiing'?2.5:chapters[chunk].id==='five-years'?4.8:['future','home','cruise','five-years'].includes(chapters[chunk].id)?3.1:focused?1.0:.8;
    cam.position.y=THREE.MathUtils.damp(cam.position.y,12+Math.max(0,desiredY-1),4,dt);
    if(!cameraReady.current){cam.position.set(desiredX,12+Math.max(0,desiredY-1),19);focusY.current=desiredY;focusZ.current=chapters[chunk].id==='skiing'?-5:focused?-1:0;cam.zoom=desiredZoom;cam.updateProjectionMatrix();cameraReady.current=true;}
    cam.position.x=THREE.MathUtils.damp(cam.position.x,desiredX,game?3.5:7,dt);
    const nextZoom=THREE.MathUtils.damp(cam.zoom,desiredZoom,4,dt);
    if(Math.abs(cam.zoom-nextZoom)>.001){cam.zoom=nextZoom;cam.updateProjectionMatrix();}
    focusY.current=THREE.MathUtils.damp(focusY.current,desiredY,4,dt);
    focusZ.current=THREE.MathUtils.damp(focusZ.current,chapters[chunk].id==='skiing'?-5:focused?-1:0,4,dt);
    lookTarget.set(cam.position.x-3.2,focusY.current,focusZ.current);cam.lookAt(lookTarget);

    const seasonX=game?chapters[game.index].x:j.x;
    let lower=SEASONS[0],upper=SEASONS[SEASONS.length-1];
    for(let i=0;i<SEASONS.length-1;i++){if(seasonX>=SEASONS[i].x&&seasonX<=SEASONS[i+1].x){lower=SEASONS[i];upper=SEASONS[i+1];break;}}
    const t=THREE.MathUtils.smoothstep(seasonX,lower.x,upper.x);
    if(ground.current)ground.current.color.copy(lower.groundColor).lerp(upper.groundColor,t);
    background.copy(lower.skyColor).lerp(upper.skyColor,t);
    state.scene.background=background;
    if(state.scene.fog instanceof THREE.Fog)state.scene.fog.color.copy(background);
  });
  return <>
    <fog attach="fog" args={['#dbe2c5',24,66]}/>
    <ambientLight intensity={.55}/><hemisphereLight args={['#fff2df','#5c7563',1]}/><Sun journey={journey}/>
    <mesh receiveShadow geometry={PLANE} rotation={[-Math.PI/2,0,0]} position={[WORLD_END/2,-.012,0]} scale={[WORLD_END+80,120,1]} onClick={event=>{event.stopPropagation();onWalkTo(THREE.MathUtils.clamp(event.point.x,-7,WORLD_END));}}><meshLambertMaterial ref={ground} color="#bdc69a" map={groundTexture}/></mesh>
    <Box position={[WORLD_END/2,.015,1.75]} size={[WORLD_END+30,.035,2.5]} color={chapters[chunk].season==='winter'?'#d1dfdc':'#d1bf99'}/>
    {chapters.map((chapter,i)=>Math.abs(i-chunk)<=1&&<group key={chapter.id}>
      <Biome chapter={chapter}/><GroundDetails chapter={chapter}/><Landscape chapter={chapter}/><TransitionTrees index={i}/>
      {chapter.id==='university'?<PingPong active={game?.index===0} game={game?.index===0?game:null} action={props.action} onScore={props.onScore} onInteract={props.onInteract} reducedMotion={reducedMotion} onRallyStatus={props.onRallyStatus} onMiss={props.onMiss}/>:
      chapter.id==='burger'?<BurgerStop game={game} onInteract={props.onInteract}/>:
      chapter.id==='home'?<Apartment game={game} journey={journey} onInteract={props.onInteract} complete={props.completed.includes(i)}/>:
      <MemoryStop index={i} game={game} journey={journey} keys={keys} action={props.action} onInteract={props.onInteract} onScore={props.onScore} onCue={props.onCue} complete={props.completed.includes(i)} reducedMotion={reducedMotion}/>}
    </group>)}
    <Character index={0} isLeader={leader===0} journey={journey} game={game} reducedMotion={reducedMotion} outfit={chapters[game?.index??chunk].outfit}/>
    <Character index={1} isLeader={leader===1} journey={journey} game={game} reducedMotion={reducedMotion} outfit={chapters[game?.index??chunk].outfit}/>
    <Weather journey={journey} reducedMotion={reducedMotion}/>
  </>;
}

// Optional diagnostic, enabled only with ?perf=1. No visible HUD in normal use.
function PerformanceProbe() {
  const samples=useRef<number[]>([]);
  const warmup=useRef(0);
  const reported=useRef(false);
  useFrame((state,delta)=>{
    if(reported.current || document.hidden)return;
    if(warmup.current++<90)return;
    samples.current.push(delta*1000);
    if(samples.current.length===240){
      const values=samples.current;
      const average=values.reduce((total,value)=>total+value,0)/values.length;
      const sorted=[...values].sort((a,b)=>a-b);
      console.info('[scene performance]',JSON.stringify({averageFps:Math.round(1000/average),p95FrameMs:Number(sorted[Math.floor(sorted.length*.95)].toFixed(1)),drawCalls:state.gl.info.render.calls,triangles:state.gl.info.render.triangles,pixelRatio:state.gl.getPixelRatio()}));
      reported.current=true;
    }
  });
  return null;
}

// Shared geometry, one bounded shadow map, no postprocessing, capped pixel ratio.
const World=memo(function World(props: Props) {
  return <Canvas shadows orthographic camera={{position:[0,12,19],zoom:65,near:.1,far:120}} dpr={[1,1.25]} gl={{antialias:true,alpha:false,powerPreference:'high-performance'}}><Scene key={props.travelVersion} {...props}/>{new URLSearchParams(window.location.search).has('perf') && <PerformanceProbe/>}</Canvas>;
});
export default World;
