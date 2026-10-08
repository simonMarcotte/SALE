import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import * as THREE from 'three';
export type Vec3 = [number, number, number];
// Shared geometry/materials keep these little models inexpensive to draw.
export const BOX = new RoundedBoxGeometry(1, 1, 1, 1, .035);
export const SPHERE = new THREE.SphereGeometry(1, 12, 8);
export const CYLINDER = new THREE.CylinderGeometry(1, 1.08, 1, 10);
export const CONE = new THREE.ConeGeometry(1, 1, 7);
export const PLANE = new THREE.PlaneGeometry(1, 1);
export const CIRCLE = new THREE.CircleGeometry(1, 24);
const materials = new Map<string, THREE.MeshLambertMaterial>();
export function material(color: string) {
  if (!materials.has(color)) materials.set(color, new THREE.MeshLambertMaterial({ color }));
  return materials.get(color)!;
}
export function Box({ position = [0, 0, 0], size, color, rotation = [0, 0, 0] }: { position?: Vec3; size: Vec3; color: string; rotation?: Vec3 }) {
  return <mesh castShadow receiveShadow geometry={BOX} material={material(color)} position={position} scale={size} rotation={rotation}/>;
}
export function Ball({ position, scale = [1, 1, 1], color }: { position: Vec3; scale?: Vec3; color: string }) {
  return <mesh castShadow receiveShadow geometry={SPHERE} material={material(color)} position={position} scale={scale}/>;
}
export function Cylinder({ position, radius, height, color }: { position: Vec3; radius: number; height: number; color: string }) {
  return <mesh castShadow receiveShadow geometry={CYLINDER} material={material(color)} position={position} scale={[radius, height, radius]}/>;
}
export function Contact({ position, scale = [1, 1, 1], opacity = 0.1 }: { position: Vec3; scale?: Vec3; opacity?: number }) {
  return <mesh geometry={CIRCLE} position={position} scale={scale} rotation={[-Math.PI / 2, 0, 0]}><meshBasicMaterial color="#385342" transparent opacity={opacity} depthWrite={false}/></mesh>;
}
export function Label({ text, position, width = 2.5, color = '#505b43', rotation = [0,0,0] }: { text: string; position: Vec3; width?: number; color?: string; rotation?: Vec3 }) {
  const map = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = text.length === 1 ? 144 : 768; canvas.height = 144;
    const context = canvas.getContext('2d')!;
    context.fillStyle = color; context.textAlign = 'center'; context.textBaseline = 'middle'; context.font = `500 ${text.length === 1 ? 110 : 72}px system-ui, sans-serif`;
    context.fillText(text, canvas.width / 2, 72, canvas.width - 28);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [text, color]);
  useEffect(() => () => map.dispose(), [map]);
  return <mesh geometry={PLANE} position={position} rotation={rotation} scale={[width, width * (text.length === 1 ? 1 : 144 / 768), 1]}><meshBasicMaterial map={map} transparent depthWrite={false} depthTest alphaTest={.02} toneMapped={false}/></mesh>;
}
const heartShape = new THREE.Shape();
heartShape.moveTo(0,-.48); heartShape.bezierCurveTo(-1,.12,-.48,.9,0,.4); heartShape.bezierCurveTo(.48,.9,1,.12,0,-.48);
const HEART = new THREE.ExtrudeGeometry(heartShape,{depth:.12,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.035,bevelThickness:.025,curveSegments:10});
export function Heart({position,scale=.3}:{position:Vec3;scale?:number}) {return <mesh geometry={HEART} material={material('#c66375')} position={position} scale={scale}/>;}
export function Tulip({position,color='#d77988'}:{position:Vec3;color?:string}) {
 return <group position={position}><Cylinder position={[0,.45,0]} radius={.023} height={.9} color="#65835b"/><group rotation={[0,0,-.4]}><Ball position={[.14,.4,0]} scale={[.22,.065,.075]} color="#789861"/></group>{[-.08,.08].map(x=><Ball key={x} position={[x,.93,0]} scale={[.13,.2,.13]} color={color}/>)}<Ball position={[0,.92,.07]} scale={[.12,.18,.12]} color="#e8a0a4"/></group>;
}
export function Sign({ position, date, label, celebration=0 }: { position: Vec3; date: string; label: string; celebration?:number }) {
  return <group position={position} rotation={[0,-.08,0]}>
    <Box position={[0, .8, 0]} size={[.12, 1.6, .12]} color="#947858"/>
    <Box position={[0, 1.48, 0]} size={[2.5, .92, .18]} color={celebration?'#a45160':'#8d765b'}/>
    <Box position={[0, 1.48, .1]} size={[2.36, .78, .04]} color={celebration?'#bc6c79':'#eee1c4'}/>
    <Label text={date} position={[0, 1.65, .127]} width={2.05} color={celebration?'#fff0d6':'#52624f'}/>
    <Label text={label} position={[0, 1.36, .127]} width={2.05} color={celebration?'#fff0d6':'#697155'}/>
    {celebration&&<><Heart position={[1,1.97,.08]} scale={.27}/>{Array.from({length:celebration},(_,i)=><Tulip key={i} position={[-1.4-i*.23,0,.12+(i%2)*.17]} color={i%2?"#c36473":"#e0949b"}/>)}</>}
  </group>;
}
export function Maple({ position, scale = 1, color = '#9eaf69', snow = false }: { position: Vec3; scale?: number; color?: string; snow?: boolean }) {
  const tree=useRef<THREE.Group>(null);
  const reduced=useMemo(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches,[]);
  useFrame(state=>{if(tree.current&&!reduced)tree.current.rotation.z=Math.sin(state.clock.elapsedTime*.9+position[0])*.014;});
  return <group ref={tree} position={position} scale={scale}>
    <Contact position={[.1, .017, .2]} scale={[1, .65, 1]} opacity={.08}/>
    <Cylinder position={[0, 1.2, 0]} radius={.14} height={2.4} color="#8c7658"/>
    <Box position={[-.3, 1.9, 0]} size={[.14, 1.2, .15]} rotation={[0,0,.6]} color="#8c7658"/>
    <Box position={[.35, 1.8, 0]} size={[.14, 1, .15]} rotation={[0,0,-.7]} color="#8c7658"/>
    {!snow && <>{Array.from({length:9},(_,i)=><Ball key={i} position={[Math.sin(i*2.4)*(.35+i*.07),2.5+Math.cos(i*1.8)*.45,Math.cos(i*2.4)*.65]} scale={[.68+(i%3)*.14,.68+(i%2)*.2,.63+(i%3)*.1]} color={i%3===0?new THREE.Color(color).offsetHSL(0,0,-.055).getStyle():color}/>)}{[-1,1].map(side=><Box key={side} position={[side*.42,2.15,.1]} size={[.09,1.1,.1]} rotation={[0,0,side*-.65]} color="#806e50"/>)}</>}
    {snow && <><Ball position={[-.35,2.38,0]} scale={[.45,.12,.2]} color="#eff2e8"/><Ball position={[.3,2.22,0]} scale={[.45,.11,.2]} color="#eff2e8"/></>}
  </group>;
}
export function Pine({ position, scale = 1, snow = false }: { position: Vec3; scale?: number; snow?: boolean }) {
  return <group position={position} scale={scale}>
    <Cylinder position={[0,.7,0]} radius={.12} height={1.4} color="#87735b"/>
    {[0,1,2].map(i => <group key={i}><mesh geometry={CONE} position={[0,1.5+i*.72,0]} scale={[1.02-i*.22,1.8-i*.22,1.02-i*.22]} material={material(i%2?'#6c8f76':'#5b7b63')}/>{snow && <mesh geometry={CONE} position={[0,1.76+i*.72,0]} scale={[.87-i*.2,1.3-i*.16,.87-i*.2]} material={material('#edf0e5')}/>}</group>)}
  </group>;
}
export function Flowers({ x, z, pink = false }: { x: number; z: number; pink?: boolean }) {
  return <group position={[x, .05, z]}>{[0,1,2].map(i => <group key={i} position={[i*.23,0,Math.sin(i*2)*.2]}><Cylinder position={[0,.19,0]} radius={.015} height={.38} color="#798d54"/><Ball position={[0,.4,0]} scale={[.1,.08,.1]} color={pink?'#d5a7a1':i%2?'#f1d488':'#ede8cd'}/></group>)}</group>;
}

