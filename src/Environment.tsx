import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Journey } from './World';
import { nearestChapter, WORLD_END, type Chapter } from './story';
import { grassScatter, random } from './scatter';

// Fine procedural grain: no image downloads or extra terrain draw calls.
const texels = new Uint8Array(128 * 128 * 4);
for (let i = 0; i < 128 * 128; i++) {
  const hash = Math.abs(Math.sin(i * 127.1 + 41.7) * 43758.5453) % 1;
  const shade = Math.round(232 + hash * 23);
  texels.set([shade, shade, shade, 255], i * 4);
}
export const groundTexture = new THREE.DataTexture(texels, 128, 128, THREE.RGBAFormat);
groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set((WORLD_END+80)/4, 30);
groundTexture.magFilter = THREE.LinearFilter;
groundTexture.minFilter = THREE.LinearMipmapLinearFilter;
groundTexture.generateMipmaps = true;
groundTexture.needsUpdate = true;

export function GroundDetails({chapter}:{chapter:Chapter}) {
  const wind=useMemo(()=>({value:0}),[]);
  const reduced=useMemo(()=>matchMedia('(prefers-reduced-motion: reduce)').matches,[]);
  useFrame(s=>{wind.value=reduced?0:s.clock.elapsedTime;});
  const grass = useRef<THREE.InstancedMesh>(null), stones = useRef<THREE.InstancedMesh>(null);
  const patches=useMemo(()=>grassScatter(chapter.x+171).filter(p=>chapter.kind==='skate'?!(Math.abs(p.x)<5.5&&p.z<-.7&&p.z>-10.5):chapter.id==='cruise'?!(Math.abs(p.x)<11.5&&p.z<3.5&&p.z>-12):!(Math.abs(p.x)<5.9&&p.z<.2&&p.z>-8.5)),[chapter.x]);
  const geometry = useMemo(() => {
    const g=new THREE.BufferGeometry(),vertices:number[]=[],colors:number[]=[];
    const rng=random(922);
    // Narrow ribbons with curved tips replace the three crossed triangles.
    for(let blade=0;blade<7;blade++){
      const angle=blade*2.399,height=.16+rng()*.18,width=.018+rng()*.011,bend=.04+rng()*.075;
      const dx=Math.cos(angle),dz=Math.sin(angle),bx=dx*rng()*.065,bz=dz*rng()*.065;
      const point=(t:number,side:number)=>[bx+dx*bend*t*t-dz*width*(1-t)*side,height*t,bz+dz*bend*t*t+dx*width*(1-t)*side];
      for(let j=0;j<4;j++){
        const t=j/4,u=(j+1)/4;
        const corners=[point(t,-1),point(t,1),point(u,1),point(t,-1),point(u,1),point(u,-1)];
        corners.forEach((v,k)=>{vertices.push(...v);const tip=k===2||k===4||k===5?u:t;colors.push(.72+.28*tip,.79+.21*tip,.65+.35*tip);});
      }
    }
    g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g;
  }, []);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  useEffect(() => {
    if (!grass.current || !stones.current) return;
    const matrix = new THREE.Object3D(), color = new THREE.Color(),rng=random(chapter.x+979);
    const winter=chapter.season==='winter',fall=chapter.season==='autumn',sand=chapter.season==='desert'||chapter.season==='coast';
    patches.forEach((p,i)=>{
      matrix.position.set(p.x,.03,p.z);matrix.rotation.set(p.lean*.3,p.angle,p.lean);
      matrix.scale.set(p.size,p.size*(winter?.2:sand?.65:.9),p.size);matrix.updateMatrix();grass.current!.setMatrixAt(i,matrix.matrix);
      color.set(winter?'#b5c8bd':fall?'#a4a064':sand?'#a2a068':'#87a65f').offsetHSL((p.color-.5)*.035,(rng()-.5)*.05,(rng()-.5)*.065);grass.current!.setColorAt(i,color);
    });
    for(let i=0;i<100;i++){
      matrix.position.set((rng()-.5)*24,.047,.7+rng()*2.2);matrix.rotation.set(0,rng()*6,0);matrix.scale.set(.025+rng()*.06,.018,.025+rng()*.06);matrix.updateMatrix();stones.current.setMatrixAt(i,matrix.matrix);stones.current.setColorAt(i,color.set(winter?'#b9cecf':i%2?'#bba582':'#e0ceaa'));
    }
    for(const mesh of [grass.current,stones.current]){mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;mesh.computeBoundingSphere();}
  },[chapter,patches]);
  return <group position={[chapter.x,0,0]}><instancedMesh ref={grass} args={[geometry,undefined,patches.length]}><meshLambertMaterial color="#ffffff" vertexColors side={THREE.DoubleSide} onBeforeCompile={shader=>{shader.uniforms.uWind=wind;shader.vertexShader='uniform float uWind;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n transformed.x += sin(uWind * 1.7 + instanceMatrix[3].x * 1.3 + instanceMatrix[3].z) * position.y * position.y * .65;');}}/></instancedMesh><instancedMesh ref={stones} args={[undefined,undefined,100]}><icosahedronGeometry args={[1,0]}/><meshLambertMaterial color="#ffffff"/></instancedMesh></group>;
}

export function Weather({ journey, reducedMotion }: { journey: React.RefObject<Journey>; reducedMotion: boolean }) {
  const snow = useRef<THREE.Points>(null), leaves = useRef<THREE.Points>(null), rain = useRef<THREE.LineSegments>(null);
  const snowPositions = useMemo(() => new Float32Array(120*3), []);
  const leafPositions = useMemo(() => new Float32Array(60*3), []);
  const rainPositions = useMemo(() => new Float32Array(150*6), []);
  const flake = useMemo(() => {
    const data=new Uint8Array(16*16*4);
    for(let y=0;y<16;y++)for(let x=0;x<16;x++){const d=Math.hypot(x-7.5,y-7.5)/7.5;data.set([255,255,255,Math.max(0,Math.min(255,(1-d)*600))],(y*16+x)*4);}
    const map=new THREE.DataTexture(data,16,16);map.needsUpdate=true;return map;
  },[]);
  useFrame((state) => {
    const x=journey.current.x, t=reducedMotion?0:state.clock.elapsedTime;
    const c=nearestChapter(x),strength=Math.max(0,1-Math.abs(x-c.x)/17);
    const winter=c.season==='winter'?strength:0;
    const autumn=c.season==='autumn'?strength:0;
    const drizzle=c.season==='spring'&&c.id!=='graduation'?strength*.65:0;
    for (const [ref,strength] of [[snow,winter],[leaves,autumn],[rain,drizzle]] as const) {
      if(!ref.current)continue;ref.current.position.x=x;ref.current.visible=strength>.025;
      (ref.current.material as THREE.Material & {opacity:number}).opacity=strength*.68;
    }
    if(snow.current?.visible){for(let i=0;i<120;i++){
      snowPositions[i*3]=Math.sin(i*19)*9+Math.sin(t*.8+i)*.7;
      snowPositions[i*3+1]=10-((i*.37+t*.65)%10);
      snowPositions[i*3+2]=Math.cos(i*13)*6;
    }snow.current.geometry.attributes.position.needsUpdate=true;}
    if(leaves.current?.visible){for(let i=0;i<60;i++){
      leafPositions[i*3]=((i*.83+t*.55)%18)-9;
      leafPositions[i*3+1]=6-((i*.43+t*.32)%6);
      leafPositions[i*3+2]=Math.cos(i*11)*5+Math.sin(t+i)*.35;
    }leaves.current.geometry.attributes.position.needsUpdate=true;}
    if(rain.current?.visible){for(let i=0;i<150;i++){
      const bx=Math.sin(i*29)*9, by=9-((i*.39+t*5)%9), bz=Math.cos(i*17)*6;
      rainPositions.set([bx,by,bz,bx+.06,by-.34,bz],i*6);
    }rain.current.geometry.attributes.position.needsUpdate=true;}
  });
  return <>
    <points ref={snow}><bufferGeometry><bufferAttribute attach="attributes-position" args={[snowPositions,3]}/></bufferGeometry><pointsMaterial map={flake} size={.10} color="#fffdf1" transparent depthWrite={false}/></points>
    <points ref={leaves}><bufferGeometry><bufferAttribute attach="attributes-position" args={[leafPositions,3]}/></bufferGeometry><pointsMaterial map={flake} size={.14} color="#cc793d" transparent depthWrite={false}/></points>
    <lineSegments ref={rain}><bufferGeometry><bufferAttribute attach="attributes-position" args={[rainPositions,3]}/></bufferGeometry><lineBasicMaterial color="#b7ced3" transparent depthWrite={false}/></lineSegments>
  </>;
}

