import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Ball, Cylinder, Contact, Flowers, CYLINDER, material, type Vec3 } from './Primitives';
import { chapters, type Chapter } from './story';
import { random } from './scatter';
import { transitionCrowns, TRANSITION_TREE_Z, TRANSITION_TREE_X_OFFSET, foregroundTreePlacement } from './scenery';
const crown=new THREE.IcosahedronGeometry(1,1);
const rock=new THREE.IcosahedronGeometry(1,0);
const treeBark=new THREE.CylinderGeometry(.12,.19,1,8);
function Branch({start,end,radius=.12}:{start:Vec3;end:Vec3;radius?:number}) {
 const {mid,length,rotation}=useMemo(()=>{const a=new THREE.Vector3(...start),b=new THREE.Vector3(...end),delta=b.clone().sub(a);return {mid:a.add(b).multiplyScalar(.5),length:delta.length(),rotation:new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize())};},[start,end]);
 return <mesh geometry={CYLINDER} material={material('#786044')} position={mid} quaternion={rotation} scale={[radius,length,radius]} castShadow/>;
}
// A single close tree has an irregular, low-spreading crown. Its planting offset
// matches the camera's sightline through the outfit-change point on the path.
export function TransitionTrees({index}:{index:number}) {
 if(index===0||chapters[index].outfit===chapters[index-1].outfit)return null;
 const x=chapters[index].x-12+TRANSITION_TREE_X_OFFSET;
 const snowy=chapters[index].season==='winter'||chapters[index-1].season==='winter';
 return <group position={[x,0,TRANSITION_TREE_Z]}>
  <Contact position={[0,.035,0]} scale={[2.7,1.7,1]} opacity={.16}/>
  <Cylinder position={[0,1.85,0]} radius={.27} height={3.7} color="#786044"/>
  <Branch start={[0,1.8,0]} end={[-1.25,4.1,.15]} radius={.16}/><Branch start={[0,2.4,0]} end={[1.3,4.7,-.1]} radius={.14}/><Branch start={[0,2.8,0]} end={[-.3,5.3,-.25]} radius={.15}/>
  {[-1,1].map(side=><Branch key={side} start={[0,.25,0]} end={[side*.66,.075,.22]} radius={.09}/>)}
  {transitionCrowns.map((c,i)=><mesh key={i} geometry={crown} material={material((snowy?['#729085','#8ea59a','#81998e','#e1e7db','#cbd8cb','#6e897c']:['#66884c','#769950','#6e924d','#88a760','#7c9e54','#628447'])[i])} position={[...c.p]} scale={[...c.s]} castShadow receiveShadow/>)}
  <Ball position={[-.4,.17,.2]} scale={[.48,.18,.39]} color="#7a9253"/>
 </group>;
}
function ForegroundTree({position,scale=1,autumn=false,winter=false}:{position:Vec3;scale?:number;autumn?:boolean;winter?:boolean}) {
 return <group position={position} scale={scale}>
  <Contact position={[0,.03,0]} scale={[1.4,.8,1]} opacity={.1}/><Cylinder position={[0,1.08,0]} radius={.115} height={2.16} color="#91765a"/>
  <Branch start={[0,1.15,0]} end={[-.65,2.1,0]} radius={.065}/><Branch start={[0,1.35,0]} end={[.63,2.3,0]} radius={.06}/>
  <Ball position={[0,2.25,0]} scale={[1.05,1.06,.8]} color={winter?'#cbd9cd':autumn?'#c4994e':'#92ad66'}/><Ball position={[-.7,1.99,.04]} scale={[.72,.65,.7]} color={winter?'#7f9b89':autumn?'#ba8843':'#789954'}/><Ball position={[.6,2.36,-.02]} scale={[.75,.78,.66]} color={winter?'#e6eadf':autumn?'#d1aa58':'#86a15a'}/>
 </group>;
}
function PathsideDetails({chapter}:{chapter:Chapter}) {
 const fall=chapter.season==='autumn',snow=chapter.season==='winter',sand=['coast','desert'].includes(chapter.season),tree=foregroundTreePlacement(Math.round(chapter.x/24));
 return <group position={[chapter.x,0,0]}>
  {!sand&&chapter.id!=='five-years'&&<ForegroundTree position={[tree.x,0,tree.z]} scale={tree.scale} autumn={fall} winter={snow}/>}
  <group position={[-4.3,.08,5.8]} rotation={[0,chapter.x*.07,0]}>
   <group rotation={[0,0,Math.PI/2]}><Cylinder position={[0,0,0]} radius={.19} height={1.5} color="#907150"/><Cylinder position={[0,.76,0]} radius={.165} height={.022} color="#d2b382"/><Cylinder position={[0,-.76,0]} radius={.165} height={.022} color="#d2b382"/></group>
   <Ball position={[.15,.12,.1]} scale={[.3,.08,.15]} color={snow?'#eff1e7':'#8d9d5b'}/>
  </group>
  {[{x:-1.8,z:5.1},{x:3.5,z:6.5},{x:6.6,z:4.5}].map((p,i)=><group key={p.x} position={[p.x,.08,p.z]}>
   {[0,1,2].map(j=><Ball key={j} position={[(j-1)*.29,.14+Math.sin(j*2)*.05,j%2*.17]} scale={[.38,.23,.32]} color={snow?'#dbe5db':fall?['#9a9459','#a7a365','#828c50'][j]:['#75945c','#90a767','#829c5c'][j]}/>)}
   {!snow&&!sand&&<Flowers x={-.15} z={.35} pink={i%2===0}/>}
  </group>)}
  {!snow&&!sand&&<><Flowers x={-6.2} z={3.8}/><Flowers x={2.2} z={4.1} pink/></>}
 </group>;
}
export function Landscape({chapter}:{chapter:Chapter}) {
 const foliage=useRef<THREE.InstancedMesh>(null),trunks=useRef<THREE.InstancedMesh>(null),rocks=useRef<THREE.InstancedMesh>(null),understory=useRef<THREE.InstancedMesh>(null);
 const layout=useMemo(()=>{const rng=random(chapter.x+2201);return Array.from({length:16},(_,i)=>({x:i<6?(i%2?-1:1)*(7.1+rng()*3.4):(rng()-.5)*23,z:i<6?-4.8-rng()*3.5:-10-rng()*7,h:i<6?1.7+rng()*1.8:2+rng()*2.8,angle:rng()*6}));},[chapter.x]);
 const green=chapter.season==='autumn'?['#c39343','#b17c39','#a59b49']:chapter.season==='winter'?['#9caeaa','#c2d2cb','#688b79']:['#547d51','#6d9454','#93ab60'];
 useEffect(()=>{
  if(!foliage.current||!trunks.current||!rocks.current||!understory.current)return;
  const o=new THREE.Object3D(),c=new THREE.Color(),rng=random(chapter.x+218);let n=0;
  layout.forEach((source,i)=>{const t={...source};if(['skate','ski'].includes(chapter.kind)&&t.z>-12&&t.z<0&&Math.abs(t.x)<6)t.x=Math.sign(t.x||1)*6.7;
   o.position.set(t.x,t.h/2,t.z);o.rotation.set(0,t.angle,(rng()-.5)*.1);o.scale.set(1,t.h,1);o.updateMatrix();trunks.current!.setMatrixAt(i,o.matrix);
   for(let j=0;j<9;j++){const a=j*2.4,r=j===0?0:.45+rng()*.6;o.position.set(t.x+Math.sin(a)*r,t.h-.2+rng()*1.4,t.z+Math.cos(a)*r);o.scale.set(.7+rng()*.6,.6+rng()*.55,.7+rng()*.5);o.rotation.set(rng(),rng()*6,rng());o.updateMatrix();foliage.current!.setMatrixAt(n,o.matrix);foliage.current!.setColorAt(n++,c.set(green[j%3]));}
  });
  for(let i=0;i<40;i++){const x=(rng()-.5)*24,z=i%2?-(chapter.kind==='skate'?11.5:8)-rng()*5:3.9+rng()*4;o.position.set(x,.08+rng()*.1,z);o.rotation.set(rng(),rng()*6,rng());o.scale.set(.08+rng()*.22,.04+rng()*.12,.08+rng()*.2);o.updateMatrix();rocks.current.setMatrixAt(i,o.matrix);rocks.current.setColorAt(i,c.set(i%2?'#8d9584':'#b9b6a0'));}
  for(let i=0;i<90;i++){const t=layout[i%layout.length];o.position.set(t.x+(rng()-.5)*2,.15+rng()*.18,t.z+(rng()-.5)*2);o.rotation.set(0,rng()*6,0);o.scale.set(.3+rng()*.6,.2+rng()*.35,.3+rng()*.5);o.updateMatrix();understory.current.setMatrixAt(i,o.matrix);understory.current.setColorAt(i,c.set(green[i%3]).offsetHSL(0,0,-.04));}
  for(const ref of [foliage,trunks,rocks,understory]){ref.current!.instanceMatrix.needsUpdate=true;if(ref.current!.instanceColor)ref.current!.instanceColor!.needsUpdate=true;ref.current!.computeBoundingSphere();}
 },[layout,chapter.season]);
 const reduced=useMemo(()=>matchMedia('(prefers-reduced-motion: reduce)').matches,[]);
 useFrame(s=>{if(foliage.current&&!reduced)foliage.current.rotation.z=Math.sin(s.clock.elapsedTime*.7+chapter.x)*.002;});
 if(['desert','coast'].includes(chapter.season)||chapter.id==='five-years'||chapter.id==='future')return <PathsideDetails chapter={chapter}/>;
 return <><PathsideDetails chapter={chapter}/><group position={[chapter.x,0,0]}><instancedMesh castShadow ref={foliage} args={[crown,undefined,144]}><meshLambertMaterial color="#ffffff"/></instancedMesh><instancedMesh ref={trunks} args={[treeBark,undefined,16]}><meshLambertMaterial color="#7e6b4d"/></instancedMesh><instancedMesh ref={rocks} args={[rock,undefined,40]}><meshLambertMaterial color="#ffffff"/></instancedMesh><instancedMesh castShadow receiveShadow ref={understory} args={[crown,undefined,90]}><meshLambertMaterial color="#ffffff"/></instancedMesh></group></>;
}
