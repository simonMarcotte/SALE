// Stable seeded randomness: scenery does not jump when a chunk remounts.
export function random(seed:number) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export function grassScatter(seed:number,count=2400) {
  const rng=random(seed);
  const clusters=Array.from({length:32},()=>({x:(rng()-.5)*24,z:rng()<.4?-1-rng()*8:3.7+rng()*6,radius:.65+rng()*1.45}));
  return Array.from({length:count},()=>{
    const c=clusters[Math.floor(rng()*clusters.length)],angle=rng()*Math.PI*2,r=Math.sqrt(rng())*c.radius;
    const verge=rng()<.48,lower=rng()<.72;
    const x=verge?(rng()-.5)*24:c.x+Math.cos(angle)*r;
    const z=verge?(lower?3.34+rng()*(.6+.7*Math.sin(x*.6)**2):-.7-rng()*.9):c.z+Math.sin(angle)*r;
    return {x,z,angle:rng()*Math.PI*2,size:.55+rng()*.6,color:rng(),lean:(rng()-.5)*.18};
  }).filter(p=>p.z<-.65||p.z>3.25);
}
