import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Box, Cylinder, Label, BOX, material, type Vec3 } from './Primitives';

type Detail={p:Vec3;s:Vec3;c:string};
function FacadeDetails({items}:{items:Detail[]}) {
 const mesh=useRef<THREE.InstancedMesh>(null);
 useEffect(()=>{if(!mesh.current)return;const transform=new THREE.Object3D(),color=new THREE.Color();items.forEach((item,i)=>{transform.position.set(...item.p);transform.scale.set(...item.s);transform.updateMatrix();mesh.current!.setMatrixAt(i,transform.matrix);mesh.current!.setColorAt(i,color.set(item.c));});mesh.current.instanceMatrix.needsUpdate=true;mesh.current.instanceColor!.needsUpdate=true;mesh.current.computeBoundingSphere();},[items]);
 return <instancedMesh ref={mesh} args={[BOX,material('#ffffff'),items.length]}/>;
}
// The square lower footprint loses its corners continuously, becoming a rotated
// square at the roof. Eight triangular glass facets meet along diagonal seams.
function wtcRing(t:number,y:number):THREE.Vector3[] {
 const r=1.12,d=r*(1-t);
 return [[r,d],[d,r],[-d,r],[-r,d],[-r,-d],[-d,-r],[d,-r],[r,-d]].map(([x,z])=>new THREE.Vector3(x,y,z));
}
export function OneWorldTradeCenter() {
 const {glass,grid,edges}=useMemo(()=>{
  const bottom=wtcRing(0,1.3),top=wtcRing(1,9.6),positions:number[]=[],colors:number[]=[],lines:number[]=[],seams:number[]=[];
  const pushTriangle=(a:THREE.Vector3,b:THREE.Vector3,c:THREE.Vector3,color:THREE.Color)=>{for(const p of [a,b,c]){positions.push(p.x,p.y,p.z);colors.push(color.r,color.g,color.b);}};
  const line=(a:THREE.Vector3,b:THREE.Vector3,arr:number[])=>arr.push(a.x,a.y,a.z,b.x,b.y,b.z);
  for(let i=0;i<8;i++){const n=(i+1)%8,c=new THREE.Color(i%2?'#6e9fb7':'#41718d');pushTriangle(bottom[i],bottom[n],top[n],c);pushTriangle(bottom[i],top[n],top[i],c);line(bottom[i],top[i],seams);
   for(let j=1;j<8;j++){const f=j/8;line(bottom[i].clone().lerp(bottom[n],f),top[i].clone().lerp(top[n],f),lines);}
  }
  for(let row=0;row<=52;row++){const ring=wtcRing(row/52,1.3+8.3*row/52);for(let i=0;i<8;i++)line(ring[i],ring[(i+1)%8],lines);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();
  return {glass:g,grid:new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(lines,3)),edges:new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(seams,3))};
 },[]);
 useEffect(()=>()=>{glass.dispose();grid.dispose();edges.dispose();},[glass,grid,edges]);
 const podium=useMemo(()=>Array.from({length:15},(_,i)=>({p:[-1.15+i*.164,.7,1.24] as Vec3,s:[.035,1.2,.02] as Vec3,c:'#adc6cd'})),[]);
 return <group position={[-3.9,.17,-8]}>
  <Box position={[0,.65,0]} size={[2.5,1.3,2.5]} color="#668b9a"/><FacadeDetails items={podium}/>
  <mesh geometry={glass} castShadow><meshStandardMaterial vertexColors metalness={.22} roughness={.3} side={THREE.DoubleSide} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1}/></mesh>
  <lineSegments geometry={grid}><lineBasicMaterial color="#a3c5d2" transparent opacity={.56}/></lineSegments><lineSegments geometry={edges}><lineBasicMaterial color="#dce6e5"/></lineSegments>
  <group position={[0,9.6,0]} rotation={[0,Math.PI/4,0]}><Box size={[1.58,.065,1.58]} color="#9eafb3"/></group>
  <Cylinder position={[0,9.76,0]} radius={.23} height={.24} color="#74878f"/>
  {[{y:10.1,h:.5,r:.08},{y:10.65,h:.6,r:.058},{y:11.22,h:.54,r:.039},{y:11.73,h:.48,r:.019}].map(p=><Cylinder key={p.y} position={[0,p.y,0]} radius={p.r} height={p.h} color="#d4d8cc"/>)}
  {[10.1,10.5,10.9,11.3].map(y=><Cylinder key={y} position={[0,y,0]} radius={.065} height={.06} color="#4e606e"/>)}
 </group>;
}
export function EmpireStateBuilding() {
 const tiers=useMemo(()=>[
  {y:.17,h:1.05,w:3.05,d:2.65}, {y:1.22,h:.75,w:2.55,d:2.2},
  {y:1.97,h:4.75,w:1.85,d:1.65}, {y:6.72,h:.9,w:1.62,d:1.47},
  {y:7.62,h:.66,w:1.35,d:1.25}, {y:8.28,h:.4,w:1.03,d:.95},
 ],[]);
 const details=useMemo(()=>{
  const items:Detail[]=[];
  tiers.forEach((t,index)=>{const cols=Math.max(3,Math.floor(t.w/.22)),rows=Math.max(2,Math.floor(t.h/.22));
   for(const side of [-1,1]){
    for(let col=0;col<cols;col++){const x=-t.w/2+(col+.5)*t.w/cols;for(let row=0;row<rows;row++)items.push({p:[x,t.y+(row+.5)*t.h/rows,side*(t.d/2+.006)],s:[.09,.125,.015],c:(col+row)%9===0?'#c8b68a':'#465766'});}
    for(let col=0;col<=cols;col++)items.push({p:[-t.w/2+col*t.w/cols,t.y+t.h/2,side*(t.d/2+.025)],s:[.043,t.h,.06],c:'#d8cdb7'});
    for(let col=0;col<Math.floor(t.d/.22);col++)for(let row=0;row<rows;row++)items.push({p:[side*(t.w/2+.006),t.y+(row+.5)*t.h/rows,-t.d/2+.12+col*.22],s:[.015,.125,.09],c:'#55636a'});
   }
   if(index>1)for(let j=0;j<2;j++)items.push({p:[0,t.y+t.h-.045-j*.09,0],s:[t.w+.09,.035,t.d+.09],c:'#beb5a1'});
  });return items;
 },[tiers]);
 return <group position={[.05,0,-9.2]}>{tiers.map(t=><group key={t.y}><Box position={[0,t.y+t.h/2,0]} size={[t.w,t.h,t.d]} color="#bdb29a"/><Box position={[0,t.y+t.h+.015,0]} size={[t.w+.1,.04,t.d+.1]} color="#888779"/></group>)}<FacadeDetails items={details}/>
  <Box position={[0,8.85,0]} size={[.7,.4,.66]} color="#b5b5a8"/>{[-.24,0,.24].map(x=><Box key={x} position={[x,9.3,.29]} size={[.075,1.25,.075]} color="#dedbca"/>)}
  <Cylinder position={[0,9.45,0]} height={1.05} radius={.23} color="#90999a"/>{[9,9.8,9.95].map(y=><Cylinder key={y} position={[0,y,0]} height={.09} radius={.29} color="#c7c6b5"/>)}
  <Cylinder position={[0,10.35,0]} height={.75} radius={.045} color="#7d8584"/><Cylinder position={[0,10.98,0]} height={.55} radius={.019} color="#d0cbb7"/>
 </group>;
}
function Billboard({position,size,color,text,accent}:{position:Vec3;size:[number,number];color:string;text:string;accent:string}) {
 return <group position={position}><Box size={[size[0]+.09,size[1]+.09,.12]} color="#233343"/><mesh position={[0,0,.07]}><planeGeometry args={size}/><meshBasicMaterial color={color} toneMapped={false}/></mesh>
  {[-1,1].map(side=><Box key={side} position={[side*size[0]*.38,0,.084]} size={[.035,size[1]*.82,.015]} color={accent}/>)}
  <Label text={text} position={[0,.07,.092]} width={size[0]*.84} color="#fff9e8"/><Box position={[0,-size[1]*.29,.085]} size={[size[0]*.54,.055,.012]} color={accent}/>
 </group>;
}
export function TimesSquare() {
 const windows=useMemo(()=>Array.from({length:96},(_,i)=>({p:[3.02+(i%8)*.3,.4+Math.floor(i/8)*.38,-7.09] as Vec3,s:[.13,.22,.018] as Vec3,c:i%5?'#7299ad':'#e3c27e'})),[]);
 return <><Box position={[4.15,2.65,-7.8]} size={[2.9,5.3,1.4]} color="#4b5669"/><FacadeDetails items={windows}/>
 <group position={[2.95,0,-6.3]} rotation={[0,-.12,0]}><Box position={[0,2.7,0]} size={[1.45,5.4,1]} color="#344b62"/>{[{y:4.98,h:.65,c:'#079be0',t:'NYC',a:'#72e7ff'},{y:4.02,h:1.2,c:'#be2181',t:'BROADWAY',a:'#ffb04c'},{y:2.85,h:.9,c:'#ee971d',t:'SALE',a:'#ffe774'},{y:1.87,h:.95,c:'#0755b7',t:'TIMES SQUARE',a:'#79d8fa'},{y:.9,h:.82,c:'#f04b57',t:'5 YEARS',a:'#ffca76'}].map(b=><Billboard key={b.y} position={[0,b.y,.57]} size={[1.34,b.h]} color={b.c} text={b.t} accent={b.a}/>)}</group>
 <group position={[5.1,0,-4.6]} rotation={[0,-.25,0]}><Box position={[0,2.15,0]} size={[1.7,4.3,1.1]} color="#665d61"/><Billboard position={[0,3.36,.62]} size={[1.66,1.5]} color="#df337e" text="NEW YORK" accent="#fcab55"/><Billboard position={[0,1.8,.62]} size={[1.66,1.15]} color="#0c98aa" text="OPEN LATE" accent="#9ce8cb"/><Box position={[0,.55,.59]} size={[1.46,.85,.04]} color="#293f4d"/></group>
 {[0,1,2,3].map(i=><Box key={i} position={[3.65,.25+i*.13,-4.95-i*.2]} size={[1.45,.13,.35]} color="#b94353"/>)}
 </>;
}
